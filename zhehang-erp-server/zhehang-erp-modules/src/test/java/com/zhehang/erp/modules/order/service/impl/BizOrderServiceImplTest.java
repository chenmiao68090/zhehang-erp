package com.zhehang.erp.modules.order.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.domain.BizOrderApproval;
import com.zhehang.erp.modules.order.mapper.BizOrderApprovalMapper;
import com.zhehang.erp.modules.order.mapper.BizOrderItemMapper;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.order.service.OrderImNotificationService;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BizOrderServiceImplTest {
    private BizOrderMapper orderMapper;
    private BizOrderApprovalMapper approvalMapper;
    private OrderImNotificationService imNotificationService;
    private OrderReviewService reviewService;
    private BizOrderServiceImpl service;

    @BeforeEach
    void setUp() {
        orderMapper = mock(BizOrderMapper.class);
        BizOrderItemMapper itemMapper = mock(BizOrderItemMapper.class);
        approvalMapper = mock(BizOrderApprovalMapper.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        imNotificationService = mock(OrderImNotificationService.class);
        reviewService = mock(OrderReviewService.class);
        service = new BizOrderServiceImpl(orderMapper, itemMapper, approvalMapper,
                dataScopeHelper, imNotificationService, reviewService);
    }

    @Test
    void submitUsesAuthenticatedActorInsteadOfForgedRequestUserId() {
        BizOrder order = order(1);
        when(orderMapper.selectById(10L)).thenReturn(order);
        doAnswer(invocation -> {
            BizOrderApproval approval = invocation.getArgument(0);
            approval.setId(501L);
            return 1;
        }).when(approvalMapper).insert(any());

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            service.submit(10L, 999L);
        }

        ArgumentCaptor<BizOrderApproval> approval = ArgumentCaptor.forClass(BizOrderApproval.class);
        verify(approvalMapper).insert(approval.capture());
        assertThat(approval.getValue().getApproverId()).isEqualTo(42L);
        assertThat(order.getStatus()).isEqualTo(2);
        verify(imNotificationService).notifyTransition(order,
                OrderImNotificationService.SUBMITTED, 501L, 42L, null);
    }

    @Test
    void rejectRequiresAnActionableReason() {
        BizOrder order = order(2);
        when(orderMapper.selectById(10L)).thenReturn(order);

        assertThatThrownBy(() -> service.reject(10L, 21L, "  "))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("必须填写原因");
        verify(orderMapper, never()).updateById(any());
        verify(imNotificationService, never()).notifyTransition(any(), any(), any(), any(), any());
    }

    @Test
    void financeConfirmationCreatesReviewInTheSameBusinessFlow() {
        BizOrder order = order(3);
        when(orderMapper.selectById(10L)).thenReturn(order);
        doAnswer(invocation -> {
            BizOrderApproval approval = invocation.getArgument(0);
            approval.setId(502L);
            return 1;
        }).when(approvalMapper).insert(any());

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(30L);
            service.financeConfirm(10L, 999L, "到账无误");
        }

        assertThat(order.getStatus()).isEqualTo(4);
        verify(reviewService).activateFromFinanceConfirmed(order, 30L, 502L, "到账无误");
        verify(imNotificationService).notifyTransition(order,
                OrderImNotificationService.FINANCE_CONFIRMED, 502L, 30L, "到账无误");
    }

    private BizOrder order(int status) {
        BizOrder order = new BizOrder();
        order.setId(10L);
        order.setTenantId(7L);
        order.setStatus(status);
        order.setSalesmanId(9L);
        order.setDeptId(5L);
        return order;
    }
}
