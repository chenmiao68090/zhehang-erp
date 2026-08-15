package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.dto.CashPayerAliasRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashPayerAlias;
import com.zhehang.erp.modules.finance.domain.vo.MatchableOrderVO;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashPayerAliasMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/** 付款方别名人工学习、冲突降权和使用计数。 */
@Service
@RequiredArgsConstructor
public class CashPayerAliasService {
    private final FinCashPayerAliasMapper aliasMapper;
    private final FinCashJournalMapper journalMapper;
    private final CrmCustomerMapper customerMapper;
    private final CashNotificationService notificationService;
    private final DataScopeHelper dataScopeHelper;

    public IPage<FinCashPayerAlias> page(Integer pageNum, Integer pageSize, String keyword, String status) {
        LambdaQueryWrapper<FinCashPayerAlias> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(FinCashPayerAlias::getPayerNameRaw, keyword.trim())
                    .or().like(FinCashPayerAlias::getCustomerNameSnapshot, keyword.trim()));
        }
        wrapper.eq(StringUtils.hasText(status), FinCashPayerAlias::getStatus, status)
                .orderByAsc(FinCashPayerAlias::getStatus)
                .orderByDesc(FinCashPayerAlias::getLastUsedAt)
                .orderByDesc(FinCashPayerAlias::getUpdateTime);
        return aliasMapper.selectPage(new Page<>(positive(pageNum, 1), Math.min(positive(pageSize, 20), 200)), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashPayerAlias confirm(CashPayerAliasRequest request) {
        if (request == null || !StringUtils.hasText(request.getPayerName()) || request.getCustomerId() == null) {
            throw new BusinessException("付款方和客户不能为空");
        }
        String raw = request.getPayerName().trim();
        String normalized = CashNameNormalizer.company(raw);
        if (!StringUtils.hasText(normalized)) {
            throw new BusinessException("付款方名称无法标准化，请补充有效名称");
        }
        CrmCustomer customer = customerMapper.selectById(request.getCustomerId());
        if (customer == null || !StringUtils.hasText(customer.getName())) {
            throw new BusinessException("关联客户不存在");
        }
        if (request.getSourceJournalId() == null) {
            requireManager("人工新增付款方别名");
        } else {
            FinCashJournal journal = journalMapper.selectById(request.getSourceJournalId());
            if (journal == null || !normalized.equals(CashNameNormalizer.company(journal.getPayerName()))) {
                throw new BusinessException("来源收款与付款方不一致");
            }
            if (!canManage() && !dataScopeHelper.canAccess(journal.getOwnerId(), journal.getOwnerDeptId())) {
                throw new BusinessException("无权使用该收款学习付款方别名");
            }
        }

        FinCashPayerAlias entity = aliasMapper.selectOne(new LambdaQueryWrapper<FinCashPayerAlias>()
                .eq(FinCashPayerAlias::getPayerNameNormalized, normalized)
                .eq(FinCashPayerAlias::getCustomerId, customer.getId())
                .last("LIMIT 1"));
        if (entity == null) {
            entity = new FinCashPayerAlias();
            entity.setPayerNameNormalized(normalized);
            entity.setCustomerId(customer.getId());
            entity.setUseCount(0);
        }
        entity.setPayerNameRaw(raw);
        entity.setCustomerNameSnapshot(customer.getName());
        entity.setStatus("active");
        entity.setConfidence(100);
        entity.setConfirmedBy(SecurityUtils.getCurrentUserId());
        entity.setConfirmedAt(LocalDateTime.now());
        entity.setSourceJournalId(request.getSourceJournalId());
        try {
            if (entity.getId() == null) aliasMapper.insert(entity);
            else aliasMapper.updateById(entity);
        } catch (DuplicateKeyException e) {
            throw new BusinessException("该付款方与客户别名已存在，请刷新后重试");
        }
        boolean conflict = refreshConflictStatus(normalized);
        if (conflict) {
            notificationService.payerAliasConflict(entity.getTenantId(), raw, entity.getConfirmedAt());
        }
        return aliasMapper.selectById(entity.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashPayerAlias resolveConflict(CashPayerAliasRequest request) {
        requireManager("解决付款方别名冲突");
        FinCashPayerAlias selected = confirm(request);
        String normalized = selected.getPayerNameNormalized();
        List<FinCashPayerAlias> rows = aliasMapper.selectList(new LambdaQueryWrapper<FinCashPayerAlias>()
                .eq(FinCashPayerAlias::getPayerNameNormalized, normalized));
        for (FinCashPayerAlias row : rows) {
            row.setStatus(Objects.equals(row.getCustomerId(), selected.getCustomerId()) ? "active" : "disabled");
            aliasMapper.updateById(row);
        }
        return aliasMapper.selectById(selected.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void disable(Long id) {
        FinCashPayerAlias entity = aliasMapper.selectForUpdate(id);
        if (entity == null) throw new BusinessException("付款方别名不存在");
        if (!canManage() && !Objects.equals(entity.getConfirmedBy(), SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("仅确认人或财务负责人可停用该别名");
        }
        entity.setStatus("disabled");
        aliasMapper.updateById(entity);
        refreshConflictStatus(entity.getPayerNameNormalized());
    }

    public FinCashPayerAlias uniqueActive(String payerName) {
        String normalized = CashNameNormalizer.company(payerName);
        if (!StringUtils.hasText(normalized)) return null;
        List<FinCashPayerAlias> rows = aliasMapper.selectList(new LambdaQueryWrapper<FinCashPayerAlias>()
                .eq(FinCashPayerAlias::getPayerNameNormalized, normalized)
                .eq(FinCashPayerAlias::getStatus, "active")
                .last("LIMIT 2"));
        return rows.size() == 1 ? rows.get(0) : null;
    }

    public void markUsed(Long aliasId) {
        if (aliasId == null) return;
        aliasMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<FinCashPayerAlias>()
                .eq(FinCashPayerAlias::getId, aliasId)
                .eq(FinCashPayerAlias::getStatus, "active")
                .set(FinCashPayerAlias::getLastUsedAt, LocalDateTime.now())
                .setSql("use_count = use_count + 1"));
    }

    public FinCashPayerAlias confirmFromMatch(FinCashJournal journal, List<MatchableOrderVO> candidates) {
        if (journal == null || !StringUtils.hasText(journal.getPayerName()) || candidates == null || candidates.isEmpty()) {
            throw new BusinessException("付款方或核销客户不完整，不能建立别名");
        }
        Set<String> targetNames = candidates.stream().map(MatchableOrderVO::getCustomerName)
                .filter(StringUtils::hasText).map(CashNameNormalizer::company).collect(Collectors.toSet());
        if (targetNames.size() != 1) {
            throw new BusinessException("本次核销涉及多个客户，不能建立唯一付款方别名");
        }
        String target = targetNames.iterator().next();
        CrmCustomer customer = null;
        if (journal.getCustomerId() != null) {
            CrmCustomer linked = customerMapper.selectById(journal.getCustomerId());
            if (linked != null && target.equals(CashNameNormalizer.company(linked.getName()))) customer = linked;
        }
        if (customer == null) {
            List<CrmCustomer> matches = customerMapper.selectList(new LambdaQueryWrapper<CrmCustomer>()
                    .and(w -> w.eq(CrmCustomer::getName, candidates.get(0).getCustomerName())
                            .or().eq(CrmCustomer::getShortName, candidates.get(0).getCustomerName()))
                    .last("LIMIT 2"));
            if (matches.size() == 1) customer = matches.get(0);
        }
        if (customer == null) {
            throw new BusinessException("核销客户无法唯一对应 CRM 客户，请先关联客户后再记住付款方");
        }
        CashPayerAliasRequest request = new CashPayerAliasRequest();
        request.setPayerName(journal.getPayerName());
        request.setCustomerId(customer.getId());
        request.setSourceJournalId(journal.getId());
        return confirm(request);
    }

    private boolean refreshConflictStatus(String normalized) {
        List<FinCashPayerAlias> rows = aliasMapper.selectList(new LambdaQueryWrapper<FinCashPayerAlias>()
                .eq(FinCashPayerAlias::getPayerNameNormalized, normalized)
                .ne(FinCashPayerAlias::getStatus, "disabled"));
        boolean conflict = rows.stream().map(FinCashPayerAlias::getCustomerId).distinct().count() > 1;
        String status = conflict ? "conflict" : "active";
        for (FinCashPayerAlias row : rows) {
            if (!status.equals(row.getStatus())) {
                row.setStatus(status);
                aliasMapper.updateById(row);
            }
        }
        return conflict;
    }

    private void requireManager(String action) {
        if (!canManage()) throw new BusinessException("仅财务负责人/老板/管理员可" + action);
    }

    private boolean canManage() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss");
    }

    private int positive(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }
}
