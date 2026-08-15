package com.zhehang.erp.modules.finance.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.modules.finance.mapper.CashNotificationRecipientMapper;
import com.zhehang.erp.modules.im.service.ImOutboxWriter;
import com.zhehang.erp.modules.system.service.ISysNotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CashNotificationServiceTest {

    private ISysNotificationService systemNotification;
    private CashNotificationRecipientMapper recipientMapper;
    private ImOutboxWriter outboxWriter;
    private CashNotificationService service;

    @BeforeEach
    void setUp() {
        systemNotification = mock(ISysNotificationService.class);
        recipientMapper = mock(CashNotificationRecipientMapper.class);
        outboxWriter = mock(ImOutboxWriter.class);
        when(outboxWriter.enqueue(anyLong(), anyLong(), anyString(), anyString(), anyString())).thenReturn(1L);
        when(recipientMapper.selectActiveUserIdsByRolesAndTenant(anyList(), anyLong()))
                .thenAnswer(call -> {
                    List<String> roles = call.getArgument(0);
                    return roles.contains("finance_hq") ? List.of(20L) : List.of(99L);
                });
        service = new CashNotificationService(systemNotification, recipientMapper, outboxWriter, new ObjectMapper());
    }

    @AfterEach
    void cleanTransactionState() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
        TransactionSynchronizationManager.setActualTransactionActive(false);
    }

    @Test
    void p0ExceptionNotifiesOwnerAndFinanceLeadThroughBothChannels() {
        LocalDateTime actionAt = LocalDateTime.of(2026, 7, 12, 3, 30);

        service.exceptionAssigned(7L, 10L, 30L, "付款方不明", "P0", "联系销售核实", actionAt);

        verify(outboxWriter).enqueue(eq(7L), eq(7L),
                eq("cash.exception.assigned.30.20260712033000"), eq("cash.exception.assigned"),
                anyString());
        verify(systemNotification).sendBatchOnceForTenant(eq(7L),
                eq(List.of(10L, 20L)), eq("cash.exception.assigned.30.20260712033000"),
                anyString(), anyString(), eq(3), eq("收款工作台"), anyString());
    }

    @Test
    void badDebtEscalatesToCollectorSupervisorAndBossWithExplicitTenant() {
        when(recipientMapper.selectActiveSupervisorId(10L, 7L)).thenReturn(11L);

        service.badDebtRisk(7L, 40L, "星海科技", 10L, "8000.00",
                LocalDateTime.of(2026, 7, 12, 3, 35));

        verify(systemNotification).sendBatchOnceForTenant(eq(7L),
                eq(List.of(10L, 11L, 99L)), eq("cash.bad-debt.40.20260712033500"),
                anyString(), anyString(), eq(3), eq("收款工作台"), anyString());
        verify(outboxWriter).enqueue(eq(7L), eq(7L), eq("cash.bad-debt.40.20260712033500"),
                eq("cash.receivable.bad-debt"), anyString());
    }

    @Test
    void dailyCloseClosedAndReopenedUseDifferentReliableEvents() {
        LocalDateTime closedAt = LocalDateTime.of(2026, 7, 12, 17, 0);
        LocalDateTime reopenedAt = LocalDateTime.of(2026, 7, 12, 17, 5);

        service.dailyCloseClosed(7L, 60L, "2026-07-12", 99L, 2, closedAt);
        service.dailyCloseReopened(7L, 60L, "2026-07-12", 99L, 3, reopenedAt);

        verify(outboxWriter).enqueue(eq(7L), eq(7L), eq("cash.close.closed.60.v2"),
                eq("cash.daily-close.closed"), anyString());
        verify(outboxWriter).enqueue(eq(7L), eq(7L), eq("cash.close.reopen.60.v3"),
                eq("cash.daily-close.reopened"), anyString());
    }

    @Test
    void financeTransactionRegistersOutboxImmediatelyButDefersBellNotification() {
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        service.reconcileRisk(7L, 10L, 50L, "公司基本户", 2,
                LocalDateTime.of(2026, 7, 12, 3, 40));

        verify(outboxWriter).enqueue(eq(7L), eq(7L), eq("cash.reconcile.risk.50"),
                eq("cash.reconcile.risk"), anyString());
        verify(systemNotification, never()).sendBatchOnceForTenant(anyLong(), anyList(), anyString(),
                anyString(), anyString(), anyInt(), anyString(), anyString());
        List<TransactionSynchronization> synchronizations = TransactionSynchronizationManager.getSynchronizations();
        assertThat(synchronizations).hasSize(1);
        synchronizations.forEach(sync -> sync.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK));
        verify(systemNotification, never()).sendBatchOnceForTenant(anyLong(), anyList(), anyString(),
                anyString(), anyString(), anyInt(), anyString(), anyString());
    }

    @Test
    void committedFinanceTransactionSendsBellAfterOutboxRegistration() {
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        service.reconcileRisk(7L, 10L, 51L, "公司一般户", 1,
                LocalDateTime.of(2026, 7, 12, 3, 41));

        verify(outboxWriter).enqueue(eq(7L), eq(7L), eq("cash.reconcile.risk.51"),
                eq("cash.reconcile.risk"), anyString());
        verify(systemNotification, never()).sendBatchOnceForTenant(anyLong(), anyList(), anyString(),
                anyString(), anyString(), anyInt(), anyString(), anyString());
        TransactionSynchronizationManager.getSynchronizations().forEach(TransactionSynchronization::afterCommit);
        verify(systemNotification).sendBatchOnceForTenant(eq(7L), anyList(), eq("cash.reconcile.risk.51"),
                anyString(), anyString(), eq(3), eq("收款工作台"), anyString());
    }

    @Test
    void outboxFailurePropagatesBeforeBellNotificationIsScheduled() {
        doThrow(new IllegalStateException("outbox unavailable"))
                .when(outboxWriter).enqueue(anyLong(), anyLong(), anyString(), anyString(), anyString());
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        assertThatThrownBy(() -> service.reconcileRisk(7L, 10L, 52L, "公司基本户", 2,
                LocalDateTime.of(2026, 7, 12, 3, 42)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
        assertThat(TransactionSynchronizationManager.getSynchronizations()).isEmpty();
        verify(systemNotification, never()).sendBatchOnceForTenant(anyLong(), anyList(), anyString(),
                anyString(), anyString(), anyInt(), anyString(), anyString());
    }
}
