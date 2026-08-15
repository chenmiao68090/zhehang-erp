package com.zhehang.erp.modules.finance.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.mapper.CashNotificationRecipientMapper;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.service.ImOutboxWriter;
import com.zhehang.erp.modules.system.service.ISysNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** 收款 IM 事件与资金事务同成同败，系统铃铛在提交后幂等补发。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CashNotificationService {
    private static final List<String> FINANCE_LEAD_ROLES = List.of("finance_hq");
    private static final List<String> BOSS_ROLES = List.of("boss", "admin", "sys_admin", "super_admin");
    private static final DateTimeFormatter EVENT_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final ISysNotificationService notificationService;
    private final CashNotificationRecipientMapper recipientMapper;
    private final ImOutboxWriter imOutboxWriter;
    private final ObjectMapper objectMapper;

    public void reviewSubmitted(Long journalId, String receiptNo, Long submitterId, LocalDateTime submittedAt) {
        Long tenantId = currentTenant();
        List<Long> recipients = financeLeads(tenantId);
        recipients.removeIf(id -> Objects.equals(id, submitterId));
        dispatch(tenantId, event("cash.review.submit", journalId, submittedAt), "cash.review.submitted",
                recipients, "[收款待审核] " + safe(receiptNo),
                "有一笔收款已完成核销并提交审核，请及时复核。", 2,
                "cash_journal", journalId, "pending_review", submitterId, "去审核",
                "/cash-journal/index?view=today&journalId=" + journalId, true, submittedAt);
    }

    public void reviewResult(Long receiverId, Long journalId, String receiptNo, boolean approved,
                             String reason, LocalDateTime actionAt) {
        if (receiverId == null) return;
        String content = approved ? "收款已审核通过。" : "收款审核未通过：" + safe(reason);
        dispatch(currentTenant(), event(approved ? "cash.review.approved" : "cash.review.rejected", journalId, actionAt),
                approved ? "cash.review.approved" : "cash.review.rejected", List.of(receiverId),
                approved ? "[收款已审核] " + safe(receiptNo) : "[收款被驳回] " + safe(receiptNo),
                content, 2, "cash_journal", journalId, approved ? "approved" : "rejected",
                receiverId, "查看收款", "/cash-journal/index?view=ledger&journalId=" + journalId,
                !approved, actionAt);
    }

    public void reviewReversed(Long journalId, String receiptNo, Long submitterId, LocalDateTime actionAt) {
        Long tenantId = currentTenant();
        List<Long> recipients = combine(financeLeads(tenantId), bosses(tenantId));
        if (submitterId != null) recipients.add(submitterId);
        dispatch(tenantId, event("cash.review.reversed", journalId, actionAt), "cash.review.reversed",
                recipients, "[收款已反审核] " + safe(receiptNo),
                "已审核收款被反审核，请关注后续修改与重新提审。", 3,
                "cash_journal", journalId, "reversed", submitterId, "查看收款",
                "/cash-journal/index?view=ledger&journalId=" + journalId, true, actionAt);
    }

    public void exceptionAssigned(Long tenantId, Long ownerId, Long caseId, String type, String priority,
                                  String nextAction, LocalDateTime actionAt) {
        List<Long> recipients = new ArrayList<>();
        if (ownerId != null) recipients.add(ownerId);
        if ("P0".equals(priority)) recipients.addAll(financeLeads(tenantId));
        dispatch(tenantId, event("cash.exception.assigned", caseId, actionAt), "cash.exception.assigned",
                recipients, "[" + safe(priority) + "] 收款异常待处理：" + safe(type),
                "下一步：" + safe(nextAction), 3, "cash_exception", caseId, "processing",
                ownerId, "处理异常", "/cash-journal/index?view=exceptions&caseId=" + caseId,
                "P0".equals(priority), actionAt);
    }

    public void dailyCloseSubmitted(Long tenantId, Long closeId, String closeDate, String difference,
                                    Long submitterId, Integer version, LocalDateTime actionAt) {
        List<Long> recipients = financeLeads(tenantId);
        if (submitterId != null) recipients.add(submitterId);
        dispatch(tenantId, "cash.close.submit." + closeId + ".v" + (version == null ? 0 : version),
                "cash.daily-close.submitted", recipients, "[日结待复核] " + safe(closeDate),
                "收款日结已提交，当前差异 " + safe(difference) + " 元。", 3,
                "cash_daily_close", closeId, "submitted", submitterId, "复核日结",
                "/cash-journal/index?view=close&date=" + closeDate + "&closeId=" + closeId,
                true, actionAt);
    }

    public void dailyCloseClosed(Long tenantId, Long closeId, String closeDate, Long actorId,
                                 Integer version, LocalDateTime actionAt) {
        List<Long> recipients = combine(financeLeads(tenantId), bosses(tenantId));
        dispatch(tenantId, "cash.close.closed." + closeId + ".v" + (version == null ? 0 : version),
                "cash.daily-close.closed", recipients, "[日结已关闭] " + safe(closeDate),
                "收款日结已正式关闭，该日期资金记录已冻结。", 3,
                "cash_daily_close", closeId, "closed", actorId, "查看日结",
                "/cash-journal/index?view=close&date=" + closeDate + "&closeId=" + closeId,
                true, actionAt);
    }

    public void dailyCloseReopened(Long tenantId, Long closeId, String closeDate, Long actorId,
                                   Integer version, LocalDateTime actionAt) {
        List<Long> recipients = combine(financeLeads(tenantId), bosses(tenantId));
        dispatch(tenantId, "cash.close.reopen." + closeId + ".v" + (version == null ? 0 : version),
                "cash.daily-close.reopened", recipients, "[日结已重开] " + safe(closeDate),
                "已关闭的收款日结已重新打开，请复核变更原因和后续差异。", 3,
                "cash_daily_close", closeId, "reopened", actorId, "查看日结",
                "/cash-journal/index?view=close&date=" + closeDate + "&closeId=" + closeId,
                true, actionAt);
    }

    public void reconcileRisk(Long tenantId, Long importerId, Long batchId, String account, int pendingCount,
                              LocalDateTime actionAt) {
        List<Long> recipients = financeLeads(tenantId);
        if (importerId != null) recipients.add(importerId);
        dispatch(tenantId, "cash.reconcile.risk." + batchId, "cash.reconcile.risk", recipients,
                "[账户对账待处理] " + safe(account),
                "渠道文件自动比对后仍有 " + pendingCount + " 行需要人工确认。", 3,
                "cash_reconcile", batchId, "needs_review", importerId, "处理对账",
                "/cash-journal/index?view=governance&reconcileBatchId=" + batchId, true, actionAt);
    }

    public void payerAliasConflict(Long tenantId, String payerName, LocalDateTime actionAt) {
        String hash = Integer.toUnsignedString(CashNameNormalizer.company(payerName).hashCode(), 16);
        dispatch(tenantId, "cash.alias.conflict." + hash + "." + stamp(actionAt),
                "cash.payer-alias.conflict", financeLeads(tenantId),
                "[付款方别名冲突] " + safe(payerName),
                "同一付款方已指向多个客户，系统已停止高置信度推荐，请确认唯一映射。", 3,
                "cash_payer_alias", null, "conflict", null, "解决冲突",
                "/cash-journal/index?view=governance&tab=aliases", true, actionAt);
    }

    public void unmatchedOver24(Long tenantId, Long journalId, String receiptNo, Long ownerId,
                                LocalDateTime stateAt) {
        List<Long> recipients = ownerOrFinanceLead(tenantId, ownerId);
        dispatch(tenantId, "cash.unmatched.over24." + journalId + "." + stamp(stateAt),
                "cash.unmatched.over24", recipients, "[超24小时未核销] " + safe(receiptNo),
                "收款到账已超过24小时，仍有金额未明确去向。", 3,
                "cash_journal", journalId, "unmatched", ownerId, "去核销",
                "/cash-journal/index?view=recommendations&journalId=" + journalId, true, stateAt);
    }

    public void reviewTimeout(Long tenantId, Long journalId, String receiptNo, LocalDateTime submittedAt) {
        dispatch(tenantId, "cash.review.timeout." + journalId + "." + stamp(submittedAt),
                "cash.review.timeout", financeLeads(tenantId), "[收款待审核超时] " + safe(receiptNo),
                "收款提交审核已超过24小时，请尽快复核。", 3,
                "cash_journal", journalId, "pending_review", null, "去审核",
                "/cash-journal/index?view=today&journalId=" + journalId, true, submittedAt);
    }

    public void followUpDue(Long tenantId, Long caseId, String type, String priority, Long ownerId,
                            String nextAction, LocalDateTime followUpAt) {
        dispatch(tenantId, "cash.exception.due." + caseId + "." + stamp(followUpAt),
                "cash.exception.follow-up-due", ownerOrFinanceLead(tenantId, ownerId),
                "[" + safe(priority) + "] 收款异常跟进已到期：" + safe(type),
                "待办：" + safe(nextAction), 3, "cash_exception", caseId, "due", ownerId,
                "立即跟进", "/cash-journal/index?view=exceptions&caseId=" + caseId,
                true, followUpAt);
    }

    public void exceptionOverdue(Long tenantId, Long caseId, String type, String priority, Long ownerId,
                                 String nextAction, LocalDateTime followUpAt) {
        List<Long> recipients = new ArrayList<>();
        if (ownerId != null) recipients.add(ownerId);
        Long supervisorId = supervisor(tenantId, ownerId);
        if (supervisorId != null) recipients.add(supervisorId);
        if (recipients.isEmpty() || supervisorId == null) recipients.addAll(financeLeads(tenantId));
        dispatch(tenantId, "cash.exception.overdue." + caseId + "." + stamp(followUpAt),
                "cash.exception.overdue", recipients,
                "[" + safe(priority) + "] 收款异常已逾期：" + safe(type),
                "负责人尚未完成：" + safe(nextAction), 3, "cash_exception", caseId, "overdue", ownerId,
                "升级处理", "/cash-journal/index?view=exceptions&caseId=" + caseId,
                true, followUpAt);
    }

    public void badDebtRisk(Long tenantId, Long receivableId, String customerName, Long collectorId,
                            String amount, LocalDateTime updateAt) {
        List<Long> recipients = new ArrayList<>();
        if (collectorId != null) recipients.add(collectorId);
        Long supervisorId = supervisor(tenantId, collectorId);
        if (supervisorId != null) recipients.add(supervisorId);
        recipients.addAll(bosses(tenantId));
        if (recipients.isEmpty()) recipients.addAll(financeLeads(tenantId));
        dispatch(tenantId, "cash.bad-debt." + receivableId + "." + stamp(updateAt),
                "cash.receivable.bad-debt", recipients, "[坏账风险] " + safe(customerName),
                "当前欠费 " + safe(amount) + " 元，请升级处理。", 3,
                "receivable_renewal", receivableId, "bad_debt_risk", collectorId, "去催收",
                "/finance/receivable-renewal", true, updateAt);
    }

    private void dispatch(Long tenantId, String eventId, String eventType, List<Long> rawRecipients,
                          String title, String content, Integer type, String businessType, Long businessId,
                          String status, Long responsibleId, String actionLabel, String link,
                          boolean important, LocalDateTime occurredAt) {
        List<Long> recipients = new ArrayList<>(new LinkedHashSet<>(rawRecipients == null ? List.of() : rawRecipients));
        recipients.removeIf(Objects::isNull);
        if (recipients.isEmpty()) return;
        Long effectiveTenant = tenantId != null ? tenantId : currentTenant();
        if (effectiveTenant == null) {
            log.warn("收款通知缺少租户，eventId={}", eventId);
            return;
        }

        ImModels.BusinessNotification event = new ImModels.BusinessNotification();
        event.setEventId(eventId);
        event.setEventType(eventType);
        event.setTitle(title);
        event.setText(content);
        event.setRecipientIds(recipients);
        event.setBusinessType(businessType);
        event.setBusinessId(businessId);
        event.setCurrentStatus(status);
        event.setResponsibleId(responsibleId);
        event.setOperatorId(SecurityUtils.getCurrentUserId());
        event.setOccurredAt(occurredAt != null ? occurredAt : LocalDateTime.now());
        event.setRequirement(content);
        event.setActionLabel(actionLabel);
        event.setActionUrl(link);
        event.setImportant(important);

        enqueueIm(effectiveTenant, event);
        afterCommit(() -> {
            try {
                notificationService.sendBatchOnceForTenant(effectiveTenant, recipients, eventId,
                        title, content, type, "收款工作台", link);
            } catch (RuntimeException error) {
                log.warn("收款系统通知发送失败，eventId={}, errorType={}", eventId,
                        error.getClass().getSimpleName());
            }
        });
    }

    private void enqueueIm(Long tenantId, ImModels.BusinessNotification event) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("title", event.getTitle());
            payload.put("text", event.getText());
            payload.put("conversationId", event.getConversationId());
            payload.put("recipientIds", event.getRecipientIds());
            payload.put("businessType", event.getBusinessType());
            payload.put("businessId", event.getBusinessId());
            payload.put("currentStatus", event.getCurrentStatus());
            payload.put("responsibleId", event.getResponsibleId());
            payload.put("operatorId", event.getOperatorId());
            payload.put("occurredAt", event.getOccurredAt().toString());
            payload.put("requirement", event.getRequirement());
            payload.put("actionLabel", event.getActionLabel());
            payload.put("actionUrl", event.getActionUrl());
            payload.put("important", Boolean.TRUE.equals(event.getImportant()));
            imOutboxWriter.enqueue(tenantId, tenantId, event.getEventId(), event.getEventType(),
                    objectMapper.writeValueAsString(payload));
        } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
            throw new IllegalStateException("收款通知事件序列化失败", error);
        }
    }

    private void afterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { action.run(); }
            });
        } else {
            action.run();
        }
    }

    private List<Long> ownerOrFinanceLead(Long tenantId, Long ownerId) {
        if (ownerId != null) return new ArrayList<>(List.of(ownerId));
        return financeLeads(tenantId);
    }

    private Long supervisor(Long tenantId, Long ownerId) {
        if (tenantId == null || ownerId == null) return null;
        return recipientMapper.selectActiveSupervisorId(ownerId, tenantId);
    }

    private List<Long> financeLeads(Long tenantId) {
        List<Long> rows = roleRecipients(tenantId, FINANCE_LEAD_ROLES);
        return rows.isEmpty() ? bosses(tenantId) : rows;
    }

    private List<Long> bosses(Long tenantId) {
        return roleRecipients(tenantId, BOSS_ROLES);
    }

    private List<Long> roleRecipients(Long tenantId, List<String> roles) {
        List<Long> rows = tenantId == null
                ? recipientMapper.selectActiveUserIdsByRoles(roles)
                : recipientMapper.selectActiveUserIdsByRolesAndTenant(roles, tenantId);
        return rows == null ? new ArrayList<>() : new ArrayList<>(rows);
    }

    private List<Long> combine(List<Long> first, List<Long> second) {
        List<Long> rows = new ArrayList<>(first);
        rows.addAll(second);
        return rows;
    }

    private Long currentTenant() {
        return SecurityUtils.getCurrentTenantId();
    }

    private String event(String prefix, Long id, LocalDateTime time) {
        return prefix + "." + (id == null ? 0 : id) + "." + stamp(time);
    }

    private String stamp(LocalDateTime value) {
        return value == null ? "0" : value.format(EVENT_TIME);
    }

    private String safe(Object value) {
        return value == null || String.valueOf(value).isBlank() ? "-" : String.valueOf(value);
    }
}
