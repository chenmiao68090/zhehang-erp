package com.zhehang.erp.modules.im.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.*;
import com.zhehang.erp.modules.im.realtime.ImEventPublisher;
import com.zhehang.erp.modules.im.service.ImMessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

/** outbox 异步发送器。事件号和每个目标会话的 clientMessageId 双重防重。 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ImNotificationOutboxJob {
    private final ImNotificationOutboxMapper outboxMapper;
    private final ImTaskReminderMapper reminderMapper;
    private final ImTaskDetailMapper detailMapper;
    private final ImMemberMapper memberMapper;
    private final ImBusinessRefMapper businessRefMapper;
    private final ImQueryMapper queryMapper;
    private final ImMessagingService messagingService;
    private final ImEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "${im.outbox-scan-ms:15000}", initialDelay = 45000)
    public void process() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime stale = now.minusMinutes(5);
        List<ImEntities.NotificationOutbox> rows = outboxMapper.selectList(
                new LambdaQueryWrapper<ImEntities.NotificationOutbox>()
                        .and(w -> w.in(ImEntities.NotificationOutbox::getStatus, "pending", "failed")
                                .or(x -> x.eq(ImEntities.NotificationOutbox::getStatus, "processing")
                                        .lt(ImEntities.NotificationOutbox::getUpdatedAt, stale)))
                        .and(w -> w.isNull(ImEntities.NotificationOutbox::getNextRetryAt)
                                .or().le(ImEntities.NotificationOutbox::getNextRetryAt, now))
                        .orderByAsc(ImEntities.NotificationOutbox::getCreatedAt)
                        .last("LIMIT 50"));
        for (ImEntities.NotificationOutbox row : rows) processOne(row);
    }

    private void processOne(ImEntities.NotificationOutbox row) {
        LocalDateTime now = LocalDateTime.now();
        LambdaUpdateWrapper<ImEntities.NotificationOutbox> claim = new LambdaUpdateWrapper<ImEntities.NotificationOutbox>()
                .eq(ImEntities.NotificationOutbox::getId, row.getId());
        if ("processing".equals(row.getStatus())) {
            claim.eq(ImEntities.NotificationOutbox::getStatus, "processing")
                    .lt(ImEntities.NotificationOutbox::getUpdatedAt, now.minusMinutes(5));
        } else {
            claim.eq(ImEntities.NotificationOutbox::getStatus, row.getStatus());
        }
        claim.set(ImEntities.NotificationOutbox::getStatus, "processing")
                .set(ImEntities.NotificationOutbox::getUpdatedAt, now);
        int claimed = outboxMapper.update(null, claim);
        if (claimed != 1) return;
        try {
            Map<String, Object> payload = objectMapper.readValue(row.getPayloadJson(), new TypeReference<>() {});
            if ("task.reminder".equals(row.getEventType()) && taskAlreadyClosed(row, payload)) {
                markProcessed(row, null);
                reminderMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskReminder>()
                        .eq(ImEntities.TaskReminder::getEventId, row.getEventId())
                        .set(ImEntities.TaskReminder::getStatus, "cancelled")
                        .set(ImEntities.TaskReminder::getUpdatedAt, LocalDateTime.now()));
                return;
            }
            Long originalConversationId = asLong(payload.get("conversationId"));
            List<Long> recipients = asLongList(payload.get("recipientIds"));
            if (originalConversationId == null && recipients.isEmpty()) {
                throw new BusinessException("通知事件没有目标会话或接收人");
            }

            LinkedHashMap<Long, LinkedHashSet<Long>> targets = new LinkedHashMap<>();
            LinkedHashSet<Long> resolvedRecipients = new LinkedHashSet<>();
            if (recipients.isEmpty()) {
                targets.put(originalConversationId, new LinkedHashSet<>());
            } else {
                boolean personalDelivery = "task.reminder".equals(row.getEventType());
                for (Long recipientId : recipients) {
                    if (queryMapper.activeUserInTenant(recipientId, row.getTenantId()) != 1) continue;
                    Long target = !personalDelivery && isActiveMember(originalConversationId, recipientId)
                            ? originalConversationId
                            : messagingService.ensureSystemConversation(row.getTenantId(), row.getCompanyId(), recipientId);
                    targets.computeIfAbsent(target, ignored -> new LinkedHashSet<>()).add(recipientId);
                    resolvedRecipients.add(recipientId);
                }
            }

            Long lastMessageId = null;
            int targetIndex = 0;
            Long responsibleId = asLong(payload.get("responsibleId"));
            Long operatorId = asLong(payload.get("operatorId"));
            Map<Long, String> actorNames = actorNames(responsibleId, operatorId);
            for (Map.Entry<Long, LinkedHashSet<Long>> target : targets.entrySet()) {
                String type = "task.reminder".equals(row.getEventType()) ? "system" : "business";
                String text = notificationText(row.getEventType(), payload);
                Map<String, Object> extra = compactMap(
                        "eventId", row.getEventId(),
                        "eventType", row.getEventType(),
                        "title", payload.get("title"),
                        "taskId", asLong(payload.get("taskId")),
                        "businessType", payload.get("businessType"),
                        "businessId", asLong(payload.get("businessId")),
                        "currentStatus", payload.get("currentStatus"),
                        "responsibleId", responsibleId,
                        "responsibleName", responsibleId == null ? null : actorNames.get(responsibleId),
                        "operatorId", operatorId,
                        "operatorName", operatorId == null ? null : actorNames.get(operatorId),
                        "occurredAt", payload.get("occurredAt"),
                        "requirement", payload.get("requirement"),
                        "actionLabel", payload.get("actionLabel"),
                        "actionUrl", payload.get("actionUrl"),
                        "reminderType", payload.get("reminderType"),
                        "deadlineAt", payload.get("deadlineAt"));
                ImModels.Message sent = messagingService.sendServiceMessage(
                        row.getTenantId(), row.getCompanyId(), target.getKey(),
                        "outbox:" + row.getId() + ":" + targetIndex++, type, text, extra,
                        Boolean.TRUE.equals(payload.get("important")), target.getValue());
                lastMessageId = sent.getId();
                Long businessId = asLong(payload.get("businessId"));
                String businessType = stringValue(payload.get("businessType"));
                if (StringUtils.hasText(businessType) && businessId != null) {
                    ImEntities.BusinessRef ref = new ImEntities.BusinessRef();
                    ref.setTenantId(row.getTenantId());
                    ref.setCompanyId(row.getCompanyId());
                    ref.setMessageId(sent.getId());
                    ref.setBusinessType(businessType);
                    ref.setBusinessId(businessId);
                    ref.setDisplaySnapshot(objectMapper.writeValueAsString(compactMap(
                            "title", payload.get("title"), "currentStatus", payload.get("currentStatus"),
                            "responsibleId", responsibleId, "operatorId", operatorId,
                            "occurredAt", payload.get("occurredAt"), "actionLabel", payload.get("actionLabel"),
                            "actionUrl", payload.get("actionUrl"))));
                    ref.setCreatedAt(LocalDateTime.now());
                    try { businessRefMapper.insert(ref); } catch (org.springframework.dao.DuplicateKeyException ignored) { }
                }
            }
            markProcessed(row, lastMessageId);
            reminderMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskReminder>()
                    .eq(ImEntities.TaskReminder::getEventId, row.getEventId())
                    .set(ImEntities.TaskReminder::getStatus, "sent")
                    .set(ImEntities.TaskReminder::getSentAt, LocalDateTime.now())
                    .set(ImEntities.TaskReminder::getUpdatedAt, LocalDateTime.now()));
            LinkedHashSet<Long> notificationRecipients = new LinkedHashSet<>(resolvedRecipients);
            if (notificationRecipients.isEmpty() && originalConversationId != null) {
                notificationRecipients.addAll(activeMemberIds(originalConversationId));
            }
            if (!notificationRecipients.isEmpty()) {
                eventPublisher.publish("notification.updated", notificationRecipients, compactMap(
                        "eventId", row.getEventId(), "status", "sent", "messageId", lastMessageId));
            }
        } catch (Exception error) {
            markFailed(row, error);
        }
    }

    private boolean taskAlreadyClosed(ImEntities.NotificationOutbox row, Map<String, Object> payload) {
        Long taskId = asLong(payload.get("taskId"));
        if (taskId == null) return true;
        ImEntities.TaskDetail task = detailMapper.selectOne(new LambdaQueryWrapper<ImEntities.TaskDetail>()
                .eq(ImEntities.TaskDetail::getTaskId, taskId)
                .eq(ImEntities.TaskDetail::getCompanyId, row.getCompanyId())
                .last("LIMIT 1"));
        return task == null || Set.of("completed", "cancelled").contains(task.getWorkflowState());
    }

    private boolean isActiveMember(Long conversationId, Long userId) {
        if (conversationId == null || userId == null) return false;
        return memberMapper.selectCount(new LambdaQueryWrapper<ImEntities.Member>()
                .eq(ImEntities.Member::getConversationId, conversationId)
                .eq(ImEntities.Member::getUserId, userId)
                .eq(ImEntities.Member::getStatus, "active")) > 0;
    }

    private List<Long> activeMemberIds(Long conversationId) {
        return memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                        .select(ImEntities.Member::getUserId)
                        .eq(ImEntities.Member::getConversationId, conversationId)
                        .eq(ImEntities.Member::getStatus, "active"))
                .stream().map(ImEntities.Member::getUserId).distinct().toList();
    }

    private Map<Long, String> actorNames(Long... userIds) {
        List<Long> ids = Arrays.stream(userIds).filter(Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) return new HashMap<>();
        return queryMapper.contactsByIds(ids).stream()
                .filter(contact -> contact.getUserId() != null && StringUtils.hasText(contact.getName()))
                .collect(java.util.stream.Collectors.toMap(
                        ImModels.Contact::getUserId, ImModels.Contact::getName, (left, right) -> left));
    }

    private String notificationText(String eventType, Map<String, Object> payload) {
        if (!"task.reminder".equals(eventType)) {
            String text = stringValue(payload.get("text"));
            return StringUtils.hasText(text) ? text : stringValue(payload.get("title"));
        }
        String title = stringValue(payload.get("title"));
        String reminderType = stringValue(payload.get("reminderType"));
        if (reminderType.startsWith("overdue")) return "待办已逾期：" + title;
        if ("due".equals(reminderType)) return "待办已到截止时间：" + title;
        return "待办即将到期：" + title;
    }

    private void markProcessed(ImEntities.NotificationOutbox row, Long messageId) {
        outboxMapper.update(null, new LambdaUpdateWrapper<ImEntities.NotificationOutbox>()
                .eq(ImEntities.NotificationOutbox::getId, row.getId())
                .eq(ImEntities.NotificationOutbox::getStatus, "processing")
                .set(ImEntities.NotificationOutbox::getStatus, "sent")
                .set(ImEntities.NotificationOutbox::getProcessedAt, LocalDateTime.now())
                .set(ImEntities.NotificationOutbox::getResultMessageId, messageId)
                .set(ImEntities.NotificationOutbox::getLastError, null)
                .set(ImEntities.NotificationOutbox::getUpdatedAt, LocalDateTime.now()));
    }

    private void markFailed(ImEntities.NotificationOutbox row, Exception error) {
        int attempts = (row.getRetryCount() == null ? 0 : row.getRetryCount()) + 1;
        boolean dead = attempts >= 8;
        long seconds = Math.min(3600, 15L * (1L << Math.min(attempts, 8)));
        String safeError = error.getClass().getSimpleName() + ": " + stringValue(error.getMessage());
        if (safeError.length() > 500) safeError = safeError.substring(0, 500);
        outboxMapper.update(null, new LambdaUpdateWrapper<ImEntities.NotificationOutbox>()
                .eq(ImEntities.NotificationOutbox::getId, row.getId())
                .set(ImEntities.NotificationOutbox::getStatus, dead ? "dead" : "failed")
                .set(ImEntities.NotificationOutbox::getRetryCount, attempts)
                .set(ImEntities.NotificationOutbox::getNextRetryAt, dead ? null : LocalDateTime.now().plusSeconds(seconds))
                .set(ImEntities.NotificationOutbox::getLastError, safeError)
                .set(ImEntities.NotificationOutbox::getUpdatedAt, LocalDateTime.now()));
        log.warn("IM outbox delivery failed, eventId={}, attempt={}, errorType={}",
                row.getEventId(), attempts, error.getClass().getSimpleName());
    }

    private Map<String, Object> compactMap(Object... values) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i + 1 < values.length; i += 2) {
            if (values[i + 1] != null && StringUtils.hasText(String.valueOf(values[i + 1]))) {
                map.put(String.valueOf(values[i]), values[i + 1]);
            }
        }
        return map;
    }

    private List<Long> asLongList(Object value) {
        if (!(value instanceof Collection<?> collection)) return List.of();
        return collection.stream().map(this::asLong).filter(Objects::nonNull).distinct().toList();
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) return number.longValue();
        try { return value == null ? null : Long.valueOf(String.valueOf(value)); }
        catch (NumberFormatException ignored) { return null; }
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
