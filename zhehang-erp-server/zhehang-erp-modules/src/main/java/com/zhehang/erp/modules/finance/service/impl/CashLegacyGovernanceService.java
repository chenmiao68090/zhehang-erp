package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashLegacyLinkRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchItemDTO;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableCollectionLog;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.domain.vo.CashLegacyReceiptVO;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableCollectionLogMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.finance.service.ICashJournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/** 将 V3 上线前的 legacy 实收逐笔迁移关联到真实收款，不改变应收总实收。 */
@Service
@RequiredArgsConstructor
public class CashLegacyGovernanceService {
    private static final String ACTION_PAYMENT = "记录收款";

    private final FinReceivableCollectionLogMapper logMapper;
    private final FinReceivableRenewalMapper receivableMapper;
    private final FinCashJournalMapper journalMapper;
    private final FinCashMatchMapper matchMapper;
    private final ICashJournalService cashJournalService;

    public IPage<CashLegacyReceiptVO> page(Integer pageNum, Integer pageSize, String keyword) {
        requireManager();
        String search = StringUtils.hasText(keyword) ? keyword.trim() : null;
        IPage<FinReceivableCollectionLog> logs = logMapper.selectLegacyPage(
                new Page<>(positive(pageNum, 1), Math.min(positive(pageSize, 20), 100)), search);
        Set<Long> ids = logs.getRecords().stream().map(FinReceivableCollectionLog::getReceivableId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, FinReceivableRenewal> receivables = ids.isEmpty() ? Map.of()
                : receivableMapper.selectBatchIds(ids).stream().collect(Collectors.toMap(FinReceivableRenewal::getId, r -> r));
        return logs.convert(log -> toVO(log, receivables.get(log.getReceivableId())));
    }

    public List<Map<String, Object>> candidates(Long logId) {
        requireManager();
        FinReceivableCollectionLog log = requireLegacy(logId, false);
        FinReceivableRenewal receivable = receivableMapper.selectById(log.getReceivableId());
        if (receivable == null) throw new BusinessException("历史回款对应应收不存在");
        LocalDate paymentDate = log.getActionTime() == null ? null : log.getActionTime().toLocalDate();
        LambdaQueryWrapper<FinCashJournal> wrapper = new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getRecordStatus, "active")
                .ne(FinCashJournal::getReviewStatus, "approved")
                .ge(FinCashJournal::getUnmatchedAmount, money(log.getPaymentAmount()));
        if (paymentDate != null) {
            wrapper.ge(FinCashJournal::getReceiptDate, paymentDate.minusDays(90))
                    .le(FinCashJournal::getReceiptDate, paymentDate.plusDays(90));
        }
        if (receivable.getCustomerId() != null || StringUtils.hasText(receivable.getCustomerName())) {
            wrapper.and(w -> {
                if (receivable.getCustomerId() != null) w.eq(FinCashJournal::getCustomerId, receivable.getCustomerId());
                if (StringUtils.hasText(receivable.getCustomerName())) {
                    if (receivable.getCustomerId() != null) w.or();
                    w.like(FinCashJournal::getPayerName, receivable.getCustomerName())
                            .or().like(FinCashJournal::getCustomerName, receivable.getCustomerName());
                }
            });
        }
        List<FinCashJournal> journals = journalMapper.selectList(wrapper.orderByDesc(FinCashJournal::getReceiptDate).last("LIMIT 100"));
        List<Map<String, Object>> rows = new ArrayList<>();
        for (FinCashJournal journal : journals) {
            int score = 0;
            List<String> reasons = new ArrayList<>();
            if (money(journal.getUnmatchedAmount()).compareTo(money(log.getPaymentAmount())) == 0) {
                score += 50;
                reasons.add("未核销余额等于历史回款 +50");
            }
            if (receivable.getCustomerId() != null && Objects.equals(receivable.getCustomerId(), journal.getCustomerId())) {
                score += 30;
                reasons.add("客户ID一致 +30");
            } else if (sameCompany(receivable.getCustomerName(), journal.getPayerName())
                    || sameCompany(receivable.getCustomerName(), journal.getCustomerName())) {
                score += 20;
                reasons.add("付款方或客户名称一致 +20");
            }
            if (paymentDate != null && journal.getReceiptDate() != null
                    && Math.abs(ChronoUnit.DAYS.between(paymentDate, journal.getReceiptDate())) <= 30) {
                score += 10;
                reasons.add("到账日期相近 +10");
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("journal", journal);
            row.put("score", Math.min(100, score));
            row.put("reasons", reasons);
            rows.add(row);
        }
        rows.sort(Comparator.comparingInt((Map<String, Object> row) -> ((Number) row.get("score")).intValue()).reversed());
        return rows;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> link(Long logId, CashLegacyLinkRequest request) {
        requireManager();
        if (request == null || request.getJournalId() == null) throw new BusinessException("请选择真实收款记录");
        FinReceivableCollectionLog log = requireLegacy(logId, true);
        if ("cash_journal_linked".equals(log.getSourceType()) && log.getCashMatchId() != null) {
            return Map.of("logId", log.getId(), "cashJournalId", log.getCashJournalId(), "cashMatchId", log.getCashMatchId());
        }
        FinReceivableRenewal receivable = receivableMapper.selectForUpdate(log.getReceivableId());
        if (receivable == null) throw new BusinessException("历史回款对应应收不存在");
        BigDecimal amount = money(log.getPaymentAmount());
        if (amount.signum() <= 0 || amount.compareTo(money(receivable.getLegacyReceivedAmount())) > 0) {
            throw new BusinessException("历史实收基线不足，不能关联该笔回款");
        }
        FinCashJournal journal = cashJournalService.detail(request.getJournalId()).getJournal();
        if (journal == null || !"active".equals(journal.getRecordStatus())) throw new BusinessException("真实收款不存在或已作废");
        if (amount.compareTo(money(journal.getUnmatchedAmount())) > 0) throw new BusinessException("真实收款未核销余额不足");
        if (receivable.getCustomerId() != null && journal.getCustomerId() != null
                && !Objects.equals(receivable.getCustomerId(), journal.getCustomerId())) {
            throw new BusinessException("真实收款客户与历史应收客户不一致");
        }

        receivable.setLegacyReceivedAmount(money(receivable.getLegacyReceivedAmount()).subtract(amount));
        receivableMapper.updateById(receivable);

        CashMatchItemDTO item = new CashMatchItemDTO();
        item.setBizType("receivable");
        item.setBizId(receivable.getId());
        item.setOrderNo("RR-" + receivable.getId());
        item.setOrderCustomer(receivable.getCustomerName());
        item.setMatchedAmount(amount);
        item.setMatchRemark("历史回款治理关联，legacy log #" + log.getId());
        CashMatchRequest matchRequest = new CashMatchRequest();
        matchRequest.setJournalId(journal.getId());
        matchRequest.setRequestNo("LEGACY-LINK-" + log.getId());
        matchRequest.setMatchMethod("legacy_link");
        matchRequest.setItems(Collections.singletonList(item));
        cashJournalService.match(matchRequest);

        FinCashMatch match = matchMapper.selectOne(new LambdaQueryWrapper<FinCashMatch>()
                .eq(FinCashMatch::getJournalId, journal.getId())
                .eq(FinCashMatch::getRequestNo, matchRequest.getRequestNo())
                .eq(FinCashMatch::getBizType, "receivable")
                .eq(FinCashMatch::getBizId, receivable.getId())
                .last("LIMIT 1"));
        if (match == null) throw new BusinessException("历史回款关联核销未生成，请重试");
        String content = trim("历史回款已关联真实收款 " + journal.getReceiptNo() + "，金额 " + amount
                + " 元；原记录：" + (StringUtils.hasText(log.getContent()) ? log.getContent() : "-"), 1000);
        if (logMapper.markLegacyLinked(log.getId(), journal.getId(), match.getId(), content) != 1) {
            throw new BusinessException("历史回款状态已变化，请刷新后重试");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("logId", log.getId());
        result.put("cashJournalId", journal.getId());
        result.put("cashMatchId", match.getId());
        result.put("receivedAmount", receivableMapper.selectById(receivable.getId()).getReceivedAmount());
        return result;
    }

    private FinReceivableCollectionLog requireLegacy(Long id, boolean lock) {
        FinReceivableCollectionLog log = lock ? logMapper.selectForUpdate(id) : logMapper.selectById(id);
        if (log == null || !ACTION_PAYMENT.equals(log.getActionType()) || money(log.getPaymentAmount()).signum() <= 0) {
            throw new BusinessException("历史回款记录不存在");
        }
        if (!Set.of("legacy", "cash_journal_linked").contains(log.getSourceType())) {
            throw new BusinessException("该回款已由真实收款生成，无需历史治理");
        }
        return log;
    }

    private CashLegacyReceiptVO toVO(FinReceivableCollectionLog log, FinReceivableRenewal receivable) {
        CashLegacyReceiptVO vo = new CashLegacyReceiptVO();
        vo.setLogId(log.getId());
        vo.setReceivableId(log.getReceivableId());
        vo.setPaymentAmount(log.getPaymentAmount());
        vo.setActionTime(log.getActionTime());
        vo.setOperatorName(log.getOperatorName());
        vo.setContent(log.getContent());
        vo.setSourceType(log.getSourceType());
        if (receivable != null) {
            vo.setCustomerId(receivable.getCustomerId());
            vo.setCustomerName(receivable.getCustomerName());
            vo.setServiceType(receivable.getServiceType());
            vo.setReceivableMonth(receivable.getReceivableMonth());
            vo.setLegacyReceivedAmount(receivable.getLegacyReceivedAmount());
        }
        return vo;
    }

    private void requireManager() {
        if (!(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss"))) {
            throw new BusinessException("仅财务负责人/老板/管理员可治理历史回款关联");
        }
    }

    private boolean sameCompany(String left, String right) {
        String a = CashNameNormalizer.company(left);
        String b = CashNameNormalizer.company(right);
        return StringUtils.hasText(a) && a.equals(b);
    }

    private BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String trim(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max);
    }

    private int positive(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }
}
