package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.dto.FinReceivableCollectionDTO;
import com.zhehang.erp.modules.finance.domain.dto.FinReceivablePaymentDTO;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchItemDTO;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRequest;
import com.zhehang.erp.modules.finance.domain.entity.BookkeepingColleagueVO;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableCollectionLog;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.mapper.FinReceivableCollectionLogMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import com.zhehang.erp.modules.finance.service.IFinReceivableRenewalService;
import com.zhehang.erp.modules.finance.service.ICashJournalService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinReceivableRenewalServiceImpl
        extends ServiceImpl<FinReceivableRenewalMapper, FinReceivableRenewal>
        implements IFinReceivableRenewalService {

    private static final String STATUS_UNTOUCHED = "未催";
    private static final String STATUS_CONTACTED = "已催";
    private static final String STATUS_PAID = "已付款";
    private static final String STATUS_BAD_RISK = "坏账风险";
    private static final String ACTION_CREATE = "新增应收";
    private static final String ACTION_UPDATE = "更新应收";
    private static final String ACTION_COLLECT = "催收记录";
    private static final String ACTION_PAYMENT = "记录收款";

    private final DataScopeHelper dataScopeHelper;
    private final FinReceivableCollectionLogMapper logMapper;
    private final SysUserMapper sysUserMapper;
    private final ICashJournalService cashJournalService;
    private final FinCashMatchMapper cashMatchMapper;
    private final CashNotificationService notificationService;

    @Override
    public IPage<FinReceivableRenewal> selectPage(Integer pageNum,
                                                  Integer pageSize,
                                                  String keyword,
                                                  String serviceType,
                                                  String receivableMonth,
                                                  Integer receivableStatus,
                                                  String collectionStatus,
                                                  Long collectorId,
                                                  Boolean overdueOnly,
                                                  Boolean badRiskOnly) {
        LambdaQueryWrapper<FinReceivableRenewal> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(wrapper, FinReceivableRenewal::getCollectorId, FinReceivableRenewal::getCollectorDeptId);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(FinReceivableRenewal::getCustomerName, keyword)
                    .or().like(FinReceivableRenewal::getRemark, keyword)
                    .or().like(FinReceivableRenewal::getCollectorName, keyword));
        }
        wrapper.eq(StringUtils.hasText(serviceType), FinReceivableRenewal::getServiceType, serviceType)
                .eq(StringUtils.hasText(receivableMonth), FinReceivableRenewal::getReceivableMonth, receivableMonth)
                .eq(receivableStatus != null, FinReceivableRenewal::getReceivableStatus, receivableStatus)
                .eq(StringUtils.hasText(collectionStatus), FinReceivableRenewal::getCollectionStatus, collectionStatus)
                .eq(collectorId != null, FinReceivableRenewal::getCollectorId, collectorId);
        if (Boolean.TRUE.equals(overdueOnly)) {
            wrapper.gt(FinReceivableRenewal::getArrearsAmount, BigDecimal.ZERO)
                    .lt(FinReceivableRenewal::getDueDate, LocalDate.now());
        }
        if (Boolean.TRUE.equals(badRiskOnly)) {
            wrapper.eq(FinReceivableRenewal::getCollectionStatus, STATUS_BAD_RISK);
        }
        wrapper.orderByAsc(FinReceivableRenewal::getDueDate)
                .orderByAsc(FinReceivableRenewal::getNextCollectionTime)
                .orderByDesc(FinReceivableRenewal::getUpdateTime);
        IPage<FinReceivableRenewal> page = page(new Page<>(pageNum, pageSize), wrapper);
        page.getRecords().forEach(r -> refreshComputed(r, true));
        return page;
    }

    @Override
    public Map<String, Object> summary() {
        LambdaQueryWrapper<FinReceivableRenewal> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(wrapper, FinReceivableRenewal::getCollectorId, FinReceivableRenewal::getCollectorDeptId);
        List<FinReceivableRenewal> list = list(wrapper);
        list.forEach(r -> refreshComputed(r, false));
        LocalDate today = LocalDate.now();
        BigDecimal todayReceivable = sum(list.stream()
                .filter(r -> today.equals(r.getDueDate()))
                .map(FinReceivableRenewal::getReceivableAmount)
                .collect(Collectors.toList()));
        BigDecimal overdueArrears = sum(list.stream()
                .filter(r -> Boolean.TRUE.equals(r.getOverdue()))
                .map(FinReceivableRenewal::getArrearsAmount)
                .collect(Collectors.toList()));
        BigDecimal badRiskAmount = sum(list.stream()
                .filter(r -> STATUS_BAD_RISK.equals(r.getCollectionStatus()))
                .map(FinReceivableRenewal::getArrearsAmount)
                .collect(Collectors.toList()));
        List<Long> ids = list.stream().map(FinReceivableRenewal::getId).filter(Objects::nonNull).collect(Collectors.toList());
        BigDecimal todayReceived = BigDecimal.ZERO;
        if (!ids.isEmpty()) {
            LocalDateTime start = today.atStartOfDay();
            LocalDateTime end = today.plusDays(1).atStartOfDay();
            List<FinReceivableCollectionLog> logs = logMapper.selectList(new LambdaQueryWrapper<FinReceivableCollectionLog>()
                    .in(FinReceivableCollectionLog::getReceivableId, ids)
                    .eq(FinReceivableCollectionLog::getActionType, ACTION_PAYMENT)
                    .ge(FinReceivableCollectionLog::getActionTime, start)
                    .lt(FinReceivableCollectionLog::getActionTime, end));
            todayReceived = sum(logs.stream().map(FinReceivableCollectionLog::getPaymentAmount).collect(Collectors.toList()));
        }

        Map<String, Object> data = new HashMap<>();
        data.put("todayReceivable", todayReceivable);
        data.put("todayReceivableCount", list.stream().filter(r -> today.equals(r.getDueDate())).count());
        data.put("todayReceived", todayReceived);
        data.put("overdueArrears", overdueArrears);
        data.put("overdueCount", list.stream().filter(r -> Boolean.TRUE.equals(r.getOverdue())).count());
        data.put("badRiskAmount", badRiskAmount);
        data.put("badRiskCount", list.stream().filter(r -> STATUS_BAD_RISK.equals(r.getCollectionStatus())).count());
        data.put("totalArrears", sum(list.stream().map(FinReceivableRenewal::getArrearsAmount).collect(Collectors.toList())));
        data.put("pendingCollectCount", list.stream()
                .filter(r -> n(r.getArrearsAmount()).signum() > 0)
                .filter(r -> !STATUS_PAID.equals(r.getCollectionStatus()))
                .count());
        return data;
    }

    @Override
    public FinReceivableRenewal detail(Long id) {
        return requireAccessible(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveReceivable(FinReceivableRenewal entity) {
        if (entity == null) {
            throw new BusinessException("应收记录不能为空");
        }
        boolean isCreate = entity.getId() == null;
        FinReceivableRenewal before = isCreate ? null : requireAccessible(entity.getId());
        if (isCreate) {
            if (n(entity.getReceivedAmount()).signum() > 0) {
                throw new BusinessException("新增应收不能直接填写实收，请保存后通过收款日记账记录收款");
            }
            entity.setReceivedAmount(BigDecimal.ZERO);
            entity.setLegacyReceivedAmount(BigDecimal.ZERO);
        } else {
            // 实收只能由真实日记账核销/反核销维护，编辑应收不能覆盖。
            entity.setReceivedAmount(before.getReceivedAmount());
            entity.setLegacyReceivedAmount(before.getLegacyReceivedAmount());
        }
        validateAndPrepare(entity);
        LocalDateTime actionAt = LocalDateTime.now();
        if (isCreate) {
            save(entity);
            addLog(entity, ACTION_CREATE, null, entity.getCollectionStatus(), null, "新增应收记录", actionAt);
        } else {
            updateById(entity);
            addLog(entity, ACTION_UPDATE, before.getCollectionStatus(), entity.getCollectionStatus(), null,
                    "更新应收记录", actionAt);
        }
        if (STATUS_BAD_RISK.equals(entity.getCollectionStatus())
                && (before == null || !STATUS_BAD_RISK.equals(before.getCollectionStatus()))) {
            notificationService.badDebtRisk(before == null ? entity.getTenantId() : before.getTenantId(),
                    entity.getId(), entity.getCustomerName(), entity.getCollectorId(),
                    n(entity.getArrearsAmount()).toPlainString(), actionAt);
        }
        return entity.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void receive(FinReceivablePaymentDTO dto) {
        if (dto == null || dto.getId() == null) {
            throw new BusinessException("请选择应收记录");
        }
        FinReceivableRenewal entity = requireAccessible(dto.getId());
        BigDecimal amount = n(dto.getAmount());
        if (amount.signum() <= 0) {
            throw new BusinessException("收款金额必须大于0");
        }
        if (amount.compareTo(n(entity.getArrearsAmount())) > 0) {
            throw new BusinessException("收款金额不能超过欠费金额");
        }
        Long journalId = dto.getCashJournalId();
        if (journalId == null) {
            FinCashJournal journal = new FinCashJournal();
            LocalDateTime paymentTime = dto.getPaymentTime() != null ? dto.getPaymentTime() : LocalDateTime.now();
            journal.setReceiptDate(paymentTime.toLocalDate());
            journal.setReceiptTime(paymentTime);
            journal.setAmount(amount);
            journal.setPaymentMethod(dto.getPaymentMethod());
            journal.setReceiveAccount(dto.getReceiveAccount());
            journal.setCashAccountId(dto.getCashAccountId());
            journal.setPayerName(StringUtils.hasText(dto.getPayerName()) ? dto.getPayerName() : entity.getCustomerName());
            journal.setPayerPhone(dto.getPayerPhone());
            journal.setCustomerId(entity.getCustomerId());
            journal.setCustomerName(entity.getCustomerName());
            journal.setSummary("回款续费 " + entity.getReceivableMonth() + " " + entity.getServiceType());
            journal.setBankSerialNo(dto.getBankSerialNo());
            journal.setVoucherFile(dto.getVoucherFile());
            journal.setFundNature("business");
            journal.setSourceType("receivable");
            journal.setRemark(dto.getRemark());
            journalId = cashJournalService.saveJournal(journal);
        } else {
            FinCashJournal journal = cashJournalService.detail(journalId).getJournal();
            if (journal == null) {
                throw new BusinessException("关联收款日记账不存在");
            }
            if (amount.compareTo(n(journal.getUnmatchedAmount())) > 0) {
                throw new BusinessException("核销金额不能超过该收款未匹配余额");
            }
            if (entity.getCustomerId() != null && journal.getCustomerId() != null
                    && !entity.getCustomerId().equals(journal.getCustomerId())) {
                throw new BusinessException("收款日记账关联客户与该应收客户不一致");
            }
        }

        CashMatchItemDTO item = new CashMatchItemDTO();
        item.setBizType("receivable");
        item.setBizId(entity.getId());
        item.setOrderNo("RR-" + entity.getId());
        item.setOrderCustomer(entity.getCustomerName());
        item.setMatchedAmount(amount);
        item.setMatchRemark(StringUtils.hasText(dto.getRemark()) ? dto.getRemark() : "回款续费关联核销");
        CashMatchRequest matchRequest = new CashMatchRequest();
        matchRequest.setJournalId(journalId);
        matchRequest.setRequestNo("RR-" + entity.getId() + "-" + UUID.randomUUID());
        matchRequest.setMatchMethod("receivable");
        matchRequest.setItems(java.util.Collections.singletonList(item));
        cashJournalService.match(matchRequest);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void collect(FinReceivableCollectionDTO dto) {
        if (dto == null || dto.getId() == null) {
            throw new BusinessException("请选择应收记录");
        }
        FinReceivableRenewal entity = requireAccessible(dto.getId());
        String beforeStatus = entity.getCollectionStatus();
        String nextStatus = StringUtils.hasText(dto.getCollectionStatus()) ? dto.getCollectionStatus() : STATUS_CONTACTED;
        if (STATUS_PAID.equals(nextStatus) && n(entity.getArrearsAmount()).signum() > 0) {
            throw new BusinessException("仍有欠费时不能把催收状态改为已付款，请先记录收款");
        }
        LocalDateTime actionAt = LocalDateTime.now();
        entity.setCollectionStatus(nextStatus);
        entity.setRecentCollectionTime(actionAt);
        entity.setNextCollectionTime(dto.getNextCollectionTime());
        if (dto.getPausedService() != null) {
            entity.setPausedService(dto.getPausedService());
        }
        if (StringUtils.hasText(dto.getContent())) {
            entity.setRemark(dto.getContent());
        }
        recalculate(entity);
        updateById(entity);
        addLog(entity, ACTION_COLLECT, beforeStatus, entity.getCollectionStatus(), null,
                StringUtils.hasText(dto.getContent()) ? dto.getContent() : "更新催收状态", actionAt);
        if (STATUS_BAD_RISK.equals(entity.getCollectionStatus()) && !STATUS_BAD_RISK.equals(beforeStatus)) {
            notificationService.badDebtRisk(entity.getTenantId(), entity.getId(), entity.getCustomerName(),
                    entity.getCollectorId(), n(entity.getArrearsAmount()).toPlainString(), actionAt);
        }
    }

    @Override
    public List<FinReceivableCollectionLog> logs(Long id) {
        requireAccessible(id);
        return logMapper.selectList(new LambdaQueryWrapper<FinReceivableCollectionLog>()
                .eq(FinReceivableCollectionLog::getReceivableId, id)
                .orderByDesc(FinReceivableCollectionLog::getActionTime)
                .orderByDesc(FinReceivableCollectionLog::getId));
    }

    @Override
    public void removeReceivable(Long id) {
        requireAccessible(id);
        Long linked = cashMatchMapper.selectCount(new LambdaQueryWrapper<com.zhehang.erp.modules.finance.domain.entity.FinCashMatch>()
                .eq(com.zhehang.erp.modules.finance.domain.entity.FinCashMatch::getBizType, "receivable")
                .eq(com.zhehang.erp.modules.finance.domain.entity.FinCashMatch::getBizId, id)
                .eq(com.zhehang.erp.modules.finance.domain.entity.FinCashMatch::getMatchStatus, "active"));
        if (linked != null && linked > 0) {
            throw new BusinessException("该应收已关联真实收款，不能删除；请先反核销");
        }
        removeById(id);
    }

    private void validateAndPrepare(FinReceivableRenewal entity) {
        if (!StringUtils.hasText(entity.getCustomerName())) {
            throw new BusinessException("客户名称不能为空");
        }
        if (!StringUtils.hasText(entity.getServiceType())) {
            throw new BusinessException("服务类型不能为空");
        }
        if (!StringUtils.hasText(entity.getReceivableMonth())) {
            throw new BusinessException("应收月份不能为空");
        }
        if (entity.getDueDate() == null) {
            throw new BusinessException("到期日不能为空");
        }
        if (entity.getCollectorId() == null) {
            throw new BusinessException("催收负责人不能为空");
        }
        if (n(entity.getReceivableAmount()).signum() <= 0) {
            throw new BusinessException("应收金额必须大于0");
        }
        if (n(entity.getReceivedAmount()).compareTo(n(entity.getReceivableAmount())) > 0) {
            throw new BusinessException("实收金额不能超过应收金额");
        }
        if (!StringUtils.hasText(entity.getCollectionStatus())) {
            entity.setCollectionStatus(STATUS_UNTOUCHED);
        }
        if (entity.getPausedService() == null) {
            entity.setPausedService(0);
        }
        fillCollector(entity);
        recalculate(entity);
    }

    private FinReceivableRenewal requireAccessible(Long id) {
        if (id == null) {
            throw new BusinessException("应收记录不存在");
        }
        FinReceivableRenewal entity = getById(id);
        if (entity == null) {
            throw new BusinessException("应收记录不存在");
        }
        if (!dataScopeHelper.canAccess(entity.getCollectorId(), entity.getCollectorDeptId())) {
            throw new BusinessException("无权访问该应收记录");
        }
        refreshComputed(entity, true);
        return entity;
    }

    private void fillCollector(FinReceivableRenewal entity) {
        Long userId = entity.getCollectorId();
        if (userId == null) {
            return;
        }
        BookkeepingColleagueVO colleague = baseMapper.selectColleagues().stream()
                .filter(c -> userId.equals(c.getUserId()))
                .findFirst()
                .orElse(null);
        if (colleague != null) {
            entity.setCollectorName(colleague.getName());
        }
        SysUser user = sysUserMapper.selectById(userId);
        if (user != null) {
            entity.setCollectorDeptId(user.getDeptId());
            if (!StringUtils.hasText(entity.getCollectorName())) {
                entity.setCollectorName(StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername());
            }
        }
    }

    private void refreshComputed(FinReceivableRenewal entity, boolean persistStatus) {
        Integer oldStatus = entity.getReceivableStatus();
        BigDecimal oldArrears = entity.getArrearsAmount();
        recalculate(entity);
        if (persistStatus && entity.getId() != null
                && (!Objects.equals(oldStatus, entity.getReceivableStatus()) || n(oldArrears).compareTo(n(entity.getArrearsAmount())) != 0)) {
            lambdaUpdate()
                    .eq(FinReceivableRenewal::getId, entity.getId())
                    .set(FinReceivableRenewal::getReceivableStatus, entity.getReceivableStatus())
                    .set(FinReceivableRenewal::getArrearsAmount, entity.getArrearsAmount())
                    .update();
        }
    }

    private void recalculate(FinReceivableRenewal entity) {
        BigDecimal total = n(entity.getReceivableAmount());
        BigDecimal received = n(entity.getReceivedAmount());
        BigDecimal arrears = total.subtract(received);
        if (arrears.signum() < 0) {
            arrears = BigDecimal.ZERO;
        }
        entity.setReceivableAmount(total);
        entity.setReceivedAmount(received);
        entity.setArrearsAmount(arrears);

        LocalDate today = LocalDate.now();
        boolean overdue = entity.getDueDate() != null && entity.getDueDate().isBefore(today) && arrears.signum() > 0;
        entity.setOverdue(overdue);
        entity.setOverdueDays(overdue ? Math.toIntExact(ChronoUnit.DAYS.between(entity.getDueDate(), today)) : 0);
        if (arrears.signum() == 0) {
            entity.setReceivableStatus(2);
        } else if (overdue) {
            entity.setReceivableStatus(3);
        } else if (received.signum() > 0) {
            entity.setReceivableStatus(1);
        } else {
            entity.setReceivableStatus(0);
        }
    }

    private void addLog(FinReceivableRenewal entity,
                        String actionType,
                        String beforeStatus,
                        String afterStatus,
                        BigDecimal paymentAmount,
                        String content,
                        LocalDateTime actionTime) {
        FinReceivableCollectionLog log = new FinReceivableCollectionLog();
        log.setReceivableId(entity.getId());
        log.setActionType(actionType);
        log.setActionTime(actionTime != null ? actionTime : LocalDateTime.now());
        log.setOperatorId(SecurityUtils.getCurrentUserId());
        log.setOperatorName(SecurityUtils.getCurrentUsername());
        log.setBeforeStatus(beforeStatus);
        log.setAfterStatus(afterStatus);
        log.setPaymentAmount(paymentAmount);
        log.setReceivedAfter(entity.getReceivedAmount());
        log.setArrearsAfter(entity.getArrearsAmount());
        log.setNextCollectionTime(entity.getNextCollectionTime());
        log.setContent(content);
        logMapper.insert(log);
    }

    private BigDecimal n(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }

    private BigDecimal sum(List<BigDecimal> values) {
        return values.stream().filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
