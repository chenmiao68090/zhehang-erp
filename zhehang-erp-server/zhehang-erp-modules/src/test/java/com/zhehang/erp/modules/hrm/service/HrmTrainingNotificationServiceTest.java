package com.zhehang.erp.modules.hrm.service;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.system.service.ISysNotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class HrmTrainingNotificationServiceTest {

    private final ImNotificationOutboxService outboxService = mock(ImNotificationOutboxService.class);
    private final ISysNotificationService notificationService = mock(ISysNotificationService.class);
    private final HrmTrainingNotificationService service =
            new HrmTrainingNotificationService(outboxService, notificationService);

    @AfterEach
    void clearTransactionContext() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
        TransactionSynchronizationManager.setActualTransactionActive(false);
    }

    @Test
    void publishesPersonalTrainingEventWithStableIdAndDeduplicatedRecipients() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(7L);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            beginTransaction();

            service.publish("training.exam.18.result", "training.exam.result", "training.exam", 18L,
                    List.of(21L, 21L), "考核结果", "得分100分", "已通过",
                    "查看结果", "/training/learning", false);

            ArgumentCaptor<ImModels.BusinessNotification> eventCaptor =
                    ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
            verify(outboxService).enqueueBusinessEvent(eventCaptor.capture());
            ImModels.BusinessNotification event = eventCaptor.getValue();
            assertEquals("training.exam.18.result", event.getEventId());
            assertEquals(List.of(21L), event.getRecipientIds());
            assertEquals(9L, event.getOperatorId());
            TransactionSynchronizationManager.getSynchronizations()
                    .forEach(TransactionSynchronization::afterCommit);
            verify(notificationService).sendBatchOnceForTenant(
                    7L, List.of(21L), "training.exam.18.result", "考核结果", "得分100分",
                    3, "培训中心", "/training/learning");
        }
    }

    @Test
    void stationNotificationWaitsForBusinessCommit() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(7L);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            beginTransaction();

            service.publish("training.learning.6.reminder.2", "training.reminder", "training.learning", 6L,
                    List.of(21L), "培训提醒", "请尽快完成", "学习中",
                    "继续学习", "/training/learning", true);

            verify(outboxService).enqueueBusinessEvent(any());
            verify(notificationService, never()).sendBatchOnceForTenant(
                    anyLong(), anyList(), anyString(), anyString(), anyString(), anyInt(), anyString(), anyString());
            List<TransactionSynchronization> synchronizations =
                    TransactionSynchronizationManager.getSynchronizations();
            assertEquals(1, synchronizations.size());
            synchronizations.forEach(TransactionSynchronization::afterCommit);
            verify(notificationService).sendBatchOnceForTenant(
                    7L, List.of(21L), "training.learning.6.reminder.2", "培训提醒", "请尽快完成",
                    3, "培训中心", "/training/learning");
        }
    }

    @Test
    void skipsNotificationWhenThereIsNoRecipient() {
        service.publish("training.assignment.1", "training.assignment", "training.learning", 1L,
                List.of(), "新培训", "请学习", "未开始", "开始学习", "/training/learning", false);

        verifyNoInteractions(outboxService, notificationService);
    }

    @Test
    void rejectsBusinessNotificationOutsideTransaction() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class, () ->
                service.publish("training.assignment.1", "training.assignment", "training.learning", 1L,
                        List.of(21L), "新培训", "请学习", "未开始",
                        "开始学习", "/training/learning", false));
        verifyNoInteractions(outboxService, notificationService);
    }

    private void beginTransaction() {
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
    }
}
