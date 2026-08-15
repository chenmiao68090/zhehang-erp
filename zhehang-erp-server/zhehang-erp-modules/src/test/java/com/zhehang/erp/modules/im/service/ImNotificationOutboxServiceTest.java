package com.zhehang.erp.modules.im.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.modules.im.domain.ImModels;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ImNotificationOutboxServiceTest {

    private final ImAccessService access = mock(ImAccessService.class);
    private final ImOutboxWriter writer = mock(ImOutboxWriter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ImNotificationOutboxService service =
            new ImNotificationOutboxService(access, writer, objectMapper);

    @AfterEach
    void clearTransactionContext() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
        TransactionSynchronizationManager.setActualTransactionActive(false);
    }

    @Test
    void strictEnqueueWritesTenantEventAndProtectedAction() throws Exception {
        when(access.currentTenantId()).thenReturn(7L);
        when(access.currentUserId()).thenReturn(9L);
        when(writer.enqueue(anyLong(), anyLong(), anyString(), anyString(), anyString())).thenReturn(31L);
        ImModels.BusinessNotification event = event();

        Long id = service.enqueueBusinessEvent(event);

        ArgumentCaptor<String> payloadCaptor = ArgumentCaptor.forClass(String.class);
        verify(writer).enqueue(eq(7L), eq(7L), eq("training.exam.18.result"),
                eq("training.exam.result"), payloadCaptor.capture());
        Map<String, Object> payload = objectMapper.readValue(
                payloadCaptor.getValue(), new TypeReference<>() { });
        assertThat(id).isEqualTo(31L);
        assertThat(payload.get("recipientIds")).isEqualTo(List.of(21));
        assertThat(payload.get("operatorId")).isEqualTo(9);
        assertThat(payload.get("actionUrl")).isEqualTo("/training/learning");
    }

    @Test
    void strictEnqueueRejectsExternalActionBeforeWriting() {
        when(access.currentTenantId()).thenReturn(7L);
        ImModels.BusinessNotification event = event();
        event.setActionUrl("https://example.com/export");

        assertThatThrownBy(() -> service.enqueueBusinessEvent(event))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("系统内部路径");
        verifyNoInteractions(writer);
    }

    @Test
    void compatibleSafeMethodKeepsExistingBestEffortContract() {
        when(access.currentTenantId()).thenReturn(7L);
        when(writer.enqueue(anyLong(), anyLong(), anyString(), anyString(), anyString()))
                .thenThrow(new IllegalStateException("database unavailable"));

        assertThat(service.enqueueBusinessEventSafely(event())).isFalse();
    }

    @Test
    void compatibleAfterCommitMethodStillDefersExistingCallers() {
        when(access.currentTenantId()).thenReturn(7L);
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        service.enqueueBusinessEventAfterCommit(event());

        verifyNoInteractions(writer);
        List<TransactionSynchronization> synchronizations =
                TransactionSynchronizationManager.getSynchronizations();
        assertThat(synchronizations).hasSize(1);
        synchronizations.forEach(TransactionSynchronization::afterCommit);
        verify(writer).enqueue(eq(7L), eq(7L), eq("training.exam.18.result"),
                eq("training.exam.result"), anyString());
    }

    private ImModels.BusinessNotification event() {
        ImModels.BusinessNotification event = new ImModels.BusinessNotification();
        event.setEventId("training.exam.18.result");
        event.setEventType("training.exam.result");
        event.setTitle("培训考核结果");
        event.setText("本次得分100分");
        event.setRecipientIds(List.of(21L));
        event.setBusinessType("training.exam");
        event.setBusinessId(18L);
        event.setCurrentStatus("已通过");
        event.setOccurredAt(LocalDateTime.of(2026, 7, 12, 14, 30));
        event.setActionLabel("查看结果");
        event.setActionUrl("/training/learning");
        return event;
    }
}
