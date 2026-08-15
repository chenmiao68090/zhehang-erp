package com.zhehang.erp.modules.im.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/** 业务模块调用的可靠通知门面。失败只记录事件号，不把消息正文写入日志。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImNotificationOutboxService {
    private final ImAccessService access;
    private final ImOutboxWriter writer;
    private final ObjectMapper objectMapper;

    /**
     * 严格入队：调用方存在事务时与业务数据同事务提交，失败向上抛出。
     * 新接入的业务应优先使用该方法，关闭“业务已成功但事件尚未落库”的进程窗口。
     */
    public Long enqueueBusinessEvent(ImModels.BusinessNotification event) {
        if (event == null) {
            throw new BusinessException("通知事件不能为空");
        }
        Long tenantId = access.currentTenantId();
        Map<String, Object> payload = businessPayload(event);
        try {
            return writer.enqueue(tenantId, tenantId, event.getEventId(), event.getEventType(),
                    objectMapper.writeValueAsString(payload));
        } catch (com.fasterxml.jackson.core.JsonProcessingException error) {
            throw new IllegalStateException("通知事件序列化失败", error);
        }
    }

    public boolean enqueueBusinessEventSafely(ImModels.BusinessNotification event) {
        String eventId = event == null ? null : event.getEventId();
        try {
            enqueueBusinessEvent(event);
            return true;
        } catch (Exception error) {
            log.warn("IM outbox enqueue failed, eventId={}, errorType={}", eventId,
                    error.getClass().getSimpleName());
            return false;
        }
    }

    /** 业务保存成功后再写 outbox，避免主事务回滚却留下孤立通知。 */
    public void enqueueBusinessEventAfterCommit(ImModels.BusinessNotification event) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { enqueueBusinessEventSafely(event); }
            });
        } else {
            enqueueBusinessEventSafely(event);
        }
    }

    private Map<String, Object> businessPayload(ImModels.BusinessNotification event) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("title", event.getTitle());
        payload.put("text", event.getText());
        payload.put("conversationId", event.getConversationId());
        payload.put("recipientIds", event.getRecipientIds());
        payload.put("businessType", event.getBusinessType());
        payload.put("businessId", event.getBusinessId());
        payload.put("currentStatus", event.getCurrentStatus());
        payload.put("responsibleId", event.getResponsibleId());
        payload.put("operatorId", event.getOperatorId() != null ? event.getOperatorId() : access.currentUserId());
        payload.put("occurredAt", event.getOccurredAt() != null ? event.getOccurredAt().toString() : LocalDateTime.now().toString());
        payload.put("requirement", event.getRequirement());
        payload.put("actionLabel", event.getActionLabel());
        payload.put("actionUrl", safeActionUrl(event.getActionUrl()));
        payload.put("important", Boolean.TRUE.equals(event.getImportant()));
        return payload;
    }

    public boolean enqueueTaskReminderSafely(ImEntities.TaskReminder reminder, ImEntities.TaskDetail task) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("conversationId", task.getConversationId());
            payload.put("recipientIds", java.util.List.of(reminder.getRecipientId()));
            payload.put("taskId", task.getTaskId());
            payload.put("title", task.getTitle());
            payload.put("deadlineAt", task.getDeadlineAt().toString());
            payload.put("reminderType", reminder.getReminderType());
            payload.put("important", reminder.getReminderType().startsWith("due")
                    || reminder.getReminderType().startsWith("overdue"));
            writer.enqueue(task.getTenantId(), task.getCompanyId(), reminder.getEventId(),
                    "task.reminder", objectMapper.writeValueAsString(payload));
            return true;
        } catch (Exception error) {
            log.warn("IM task reminder enqueue failed, eventId={}, errorType={}", reminder.getEventId(),
                    error.getClass().getSimpleName());
            return false;
        }
    }

    private String safeActionUrl(String value) {
        if (value == null || value.isBlank()) return null;
        String path = value.trim();
        if (!path.startsWith("/") || path.startsWith("//") || path.length() > 300
                || !path.matches("/[A-Za-z0-9_./?=&%-]+")) {
            throw new IllegalArgumentException("业务操作地址必须是系统内部路径");
        }
        return path;
    }
}
