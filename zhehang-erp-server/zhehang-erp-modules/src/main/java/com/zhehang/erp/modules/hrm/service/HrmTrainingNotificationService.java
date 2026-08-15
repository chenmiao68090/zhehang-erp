package com.zhehang.erp.modules.hrm.service;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.system.service.ISysNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * 培训业务通知统一出口：站内通知按事件号幂等，IM 消息经 outbox 异步投递。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HrmTrainingNotificationService {

    private static final String SENDER = "培训中心";

    private final ImNotificationOutboxService outboxService;
    private final ISysNotificationService notificationService;

    public void publish(String eventId,
                        String eventType,
                        String businessType,
                        Long businessId,
                        List<Long> recipientIds,
                        String title,
                        String content,
                        String currentStatus,
                        String actionLabel,
                        String actionUrl,
                        boolean important) {
        List<Long> recipients = recipientIds == null
                ? List.of()
                : new LinkedHashSet<>(recipientIds.stream().filter(java.util.Objects::nonNull).toList())
                .stream().toList();
        if (recipients.isEmpty()) {
            return;
        }
        if (!TransactionSynchronizationManager.isActualTransactionActive()
                || !TransactionSynchronizationManager.isSynchronizationActive()) {
            throw new IllegalStateException("培训通知必须与业务数据在同一事务内登记");
        }

        Long tenantId = SecurityUtils.getCurrentTenantId();
        Long operatorId = SecurityUtils.getCurrentUserId();
        ImModels.BusinessNotification event = new ImModels.BusinessNotification();
        event.setEventId(eventId);
        event.setEventType(eventType);
        event.setTitle(title);
        event.setText(content);
        event.setRecipientIds(recipients);
        event.setBusinessType(businessType);
        event.setBusinessId(businessId);
        event.setCurrentStatus(currentStatus);
        event.setResponsibleId(recipients.size() == 1 ? recipients.get(0) : null);
        event.setOperatorId(operatorId);
        event.setOccurredAt(LocalDateTime.now());
        event.setRequirement(content);
        event.setActionLabel(actionLabel);
        event.setActionUrl(actionUrl);
        event.setImportant(important);

        outboxService.enqueueBusinessEvent(event);
        afterCommit(() -> {
            try {
                notificationService.sendBatchOnceForTenant(
                        tenantId, recipients, eventId, title, content, 3, SENDER, actionUrl);
            } catch (RuntimeException error) {
                log.warn("培训站内通知登记失败，eventId={}, errorType={}",
                        eventId, error.getClass().getSimpleName());
            }
        });
    }

    private void afterCommit(Runnable action) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }
}
