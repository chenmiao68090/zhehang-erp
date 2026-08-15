package com.zhehang.erp.modules.order.service;

import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImTaskQueryMapper;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.order.domain.BizOrder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderImNotificationServiceTest {
    private ImNotificationOutboxService outboxService;
    private ImTaskQueryMapper recipientMapper;
    private OrderImNotificationService service;

    @BeforeEach
    void setUp() {
        outboxService = mock(ImNotificationOutboxService.class);
        recipientMapper = mock(ImTaskQueryMapper.class);
        service = new OrderImNotificationService(outboxService, recipientMapper);
    }

    @Test
    void submittedOrderNotifiesItsDepartmentManagerWithUniqueEvent() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L));

        service.notifyTransition(order(), OrderImNotificationService.SUBMITTED, 301L, 9L, null);

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getEventId()).isEqualTo("order:10:submitted:301");
        assertThat(event.getValue().getRecipientIds()).containsExactly(21L);
        assertThat(event.getValue().getActionUrl()).isEqualTo("/order/bill?orderId=10");
        assertThat(event.getValue().getCurrentStatus()).isEqualTo("reviewing");
        assertThat(event.getValue().getRequirement()).contains("¥9800");
    }

    @Test
    void approvedOrderNotifiesActiveFinanceRoles() {
        when(recipientMapper.activeUserIdsByRoleKeys(List.of("finance_hq", "finance"), 7L))
                .thenReturn(List.of(30L, 31L));

        service.notifyTransition(order(), OrderImNotificationService.APPROVED, 302L, 21L, "通过");

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getRecipientIds()).containsExactly(30L, 31L);
        assertThat(event.getValue().getActionLabel()).isEqualTo("去确认");
        assertThat(event.getValue().getEventType()).isEqualTo("order.approved");
        assertThat(event.getValue().getCurrentStatus()).isEqualTo("pending_finance");
        verify(recipientMapper, never()).departmentManagerIds(any(), any());
    }

    @Test
    void rejectedOrderReturnsToSalesAndDoesNotNotifyTheOperatorAgain() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L, 22L));

        service.notifyTransition(order(), OrderImNotificationService.REJECTED, 303L, 21L, "合同金额不一致");

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getRecipientIds()).containsExactly(9L, 22L);
        assertThat(event.getValue().getResponsibleId()).isEqualTo(9L);
        assertThat(event.getValue().getRequirement()).contains("合同金额不一致");
        assertThat(event.getValue().getImportant()).isTrue();
    }

    @Test
    void financeConfirmationNotifiesSalesAndDepartmentManager() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L));

        service.notifyTransition(order(), OrderImNotificationService.FINANCE_CONFIRMED,
                305L, 30L, "到账无误");

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getEventId()).isEqualTo("order:10:finance_confirmed:305");
        assertThat(event.getValue().getRecipientIds()).containsExactly(9L, 21L);
        assertThat(event.getValue().getCurrentStatus()).isEqualTo("confirmed");
        assertThat(event.getValue().getActionLabel()).isEqualTo("查看提单");
    }

    @Test
    void recipientLookupFailurePropagatesToRollbackTheBusinessTransaction() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenThrow(new IllegalStateException("db unavailable"));

        assertThatThrownBy(() -> service.notifyTransition(
                order(), OrderImNotificationService.SUBMITTED, 304L, 9L, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("db unavailable");
        verify(outboxService, never()).enqueueBusinessEvent(any());
    }

    @Test
    void outboxRegistrationFailurePropagatesToRollbackTheBusinessTransaction() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L));
        doThrow(new IllegalStateException("outbox unavailable"))
                .when(outboxService).enqueueBusinessEvent(any());

        assertThatThrownBy(() -> service.notifyTransition(
                order(), OrderImNotificationService.SUBMITTED, 306L, 9L, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    @Test
    void missingResponsibleRecipientFailsInsteadOfSilentlyDroppingTheEvent() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of());
        when(recipientMapper.activeUserIdsByRoleKeys(List.of("boss"), 7L)).thenReturn(List.of());

        assertThatThrownBy(() -> service.notifyTransition(
                order(), OrderImNotificationService.SUBMITTED, 307L, 9L, null))
                .isInstanceOf(com.zhehang.erp.common.core.exception.BusinessException.class)
                .hasMessageContaining("接收人");
        verify(outboxService, never()).enqueueBusinessEvent(any());
    }

    @Test
    void soleResponsibleOperatorStillReceivesTheBusinessEvent() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(9L));

        service.notifyTransition(order(), OrderImNotificationService.SUBMITTED, 308L, 9L, null);

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getRecipientIds()).containsExactly(9L);
    }

    private BizOrder order() {
        BizOrder order = new BizOrder();
        order.setId(10L);
        order.setTenantId(7L);
        order.setOrderNo("ORD-20260712-10");
        order.setCustomerName("示例客户");
        order.setServiceType("bookkeeping");
        order.setPayableAmount(new BigDecimal("9800.00"));
        order.setSalesmanId(9L);
        order.setCreateBy(9L);
        order.setDeptId(5L);
        return order;
    }
}
