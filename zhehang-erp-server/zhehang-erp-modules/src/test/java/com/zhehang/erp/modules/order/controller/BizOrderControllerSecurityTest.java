package com.zhehang.erp.modules.order.controller;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.service.IBizOrderService;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BizOrderControllerSecurityTest {

    @Test
    void detailUsesTheSameSalesmanAndDepartmentScopeAsTheOrderList() {
        IBizOrderService orderService = mock(IBizOrderService.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        BizOrderController controller = new BizOrderController(orderService, dataScopeHelper);
        BizOrder order = new BizOrder();
        order.setId(10L);
        order.setSalesmanId(9L);
        order.setDeptId(5L);
        when(orderService.getById(10L)).thenReturn(order);
        when(dataScopeHelper.canAccess(9L, 5L)).thenReturn(false);

        controller.detail(10L);

        verify(dataScopeHelper).canAccess(9L, 5L);
        verify(orderService, never()).getDetail(10L);
    }

    @Test
    void departmentManagerCannotApproveAnotherDepartmentsOrderByChangingTheId() {
        IBizOrderService orderService = mock(IBizOrderService.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        BizOrderController controller = new BizOrderController(orderService, dataScopeHelper);
        BizOrder order = new BizOrder();
        order.setId(12L);
        order.setSalesmanId(19L);
        order.setDeptId(15L);
        when(orderService.getById(12L)).thenReturn(order);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(dataScopeHelper.canAccess(19L, 15L)).thenReturn(false);

        controller.approve(12L, Map.of("comment", "越权尝试"));

        verify(orderService, never()).approve(12L, null, "越权尝试");
    }

    @Test
    void financeHeadCanConfirmButRegularManagerCannotUseTheFinanceEndpoint() {
        IBizOrderService orderService = mock(IBizOrderService.class);
        BizOrderController controller = new BizOrderController(orderService, mock(DataScopeHelper.class));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(false);
            security.when(() -> SecurityUtils.hasAnyRole("finance_hq", "finance", "boss")).thenReturn(true);
            controller.financeConfirm(10L, Map.of("approverId", 999L, "comment", "到账无误"));
        }
        verify(orderService).financeConfirm(10L, 999L, "到账无误");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(false);
            security.when(() -> SecurityUtils.hasAnyRole("finance_hq", "finance", "boss")).thenReturn(false);
            controller.financeConfirm(11L, Map.of("comment", "尝试越权"));
        }
        verify(orderService, never()).financeConfirm(11L, null, "尝试越权");
    }
}
