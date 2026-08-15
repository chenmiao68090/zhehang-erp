package com.zhehang.erp.modules.feigetask;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderPaymentMapper;
import com.zhehang.erp.modules.feigeorder.service.FeigeTaskContractConversionService;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditProcess;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditStep;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditTask;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditProcessMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditStepMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeTaskOperationLogMapper;
import com.zhehang.erp.modules.feigetask.service.FeigeAuditTaskService;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskAccessService;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskIdempotencyService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeigeAuditTaskSecurityTest {

    @Mock private FeigeAuditProcessMapper processMapper;
    @Mock private FeigeAuditStepMapper stepMapper;
    @Mock private FeigeAuditTaskMapper taskMapper;
    @Mock private FeigeTaskOperationLogMapper operationLogMapper;
    @Mock private FeigeOrderMapper orderMapper;
    @Mock private FeigeOrderPaymentMapper paymentMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private FeigeTaskAccessService access;
    @Mock private FeigeTaskContractConversionService contractConversionService;

    private FeigeAuditTaskService service;

    @BeforeEach
    void setUp() {
        service = new FeigeAuditTaskService(processMapper, stepMapper, taskMapper,
                operationLogMapper, orderMapper, paymentMapper, dataScopeHelper,
                access, new ObjectMapper(), new FeigeTaskIdempotencyService(), contractConversionService);
    }

    @Test
    void approveRejectsMissingRequiredDynamicField() {
        FeigeAuditTask task = pendingTask();
        FeigeAuditStep step = currentStep();
        step.setFormSchemaJson("[{\"code\":\"risk_level\",\"label\":\"风险等级\","
                + "\"fieldType\":\"select\",\"required\":true,\"options\":[{\"label\":\"低\",\"value\":\"low\"}]}]");
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(stepMapper.selectById(11L)).thenReturn(step);
        when(access.currentUserId()).thenReturn(7L);

        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult("approved");
        request.setFormData(Map.of());

        assertThrows(BusinessException.class, () -> service.review(1L, request));
        verify(taskMapper, never()).updateById(any());
    }

    @Test
    void multiStepReviewWritesFormCostAndRemarkEvidenceToOperationLog() {
        FeigeAuditTask task = pendingTask();
        FeigeAuditStep step = currentStep();
        step.setFormSchemaJson("[{\"code\":\"delivery_note\",\"label\":\"交付说明\","
                + "\"fieldType\":\"textarea\",\"required\":true}]");
        step.setIndicatorSchemaJson("[{\"indicatorType\":\"cost_input\"}]");
        FeigeAuditStep next = new FeigeAuditStep();
        next.setId(12L);
        next.setProcessId(3L);
        next.setStepOrder(2);
        next.setStepName("复核");
        next.setAssigneeMode("role");

        when(taskMapper.selectById(1L)).thenReturn(task);
        when(stepMapper.selectById(11L)).thenReturn(step);
        when(stepMapper.selectOne(any())).thenReturn(next);
        when(taskMapper.updateById(any())).thenReturn(1);
        when(access.currentUserId()).thenReturn(7L);
        when(access.currentUserName()).thenReturn("审核人");

        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult("approved");
        request.setRemark("材料已核验");
        request.setFormData(Map.of("delivery_note", "齐全"));
        Map<String, Object> cost = new LinkedHashMap<>();
        cost.put("expenseName", "工本费");
        cost.put("categoryName", "工商");
        cost.put("amount", new BigDecimal("20.00"));
        cost.put("remark", "凭证已见");
        request.setCostItems(List.of(cost));

        service.review(1L, request);

        verify(access).log(eq("audit"), eq(1L), eq("review_approved"), eq("pending"),
                eq("pending"), contains("审批步骤1"), argThat(payload -> payload != null
                        && payload.contains("delivery_note")
                        && payload.contains("工本费")
                        && payload.contains("材料已核验")));
    }

    @Test
    void orderPaymentsRequireVisibleLinkedAuditTask() {
        FeigeOrder order = new FeigeOrder();
        order.setId(99L);
        FeigeAuditTask hidden = new FeigeAuditTask();
        hidden.setBusinessOwnerId(8L);
        hidden.setAssignedUserId(9L);
        hidden.setDeptId(4L);
        hidden.setRequiredRoleKey("finance");
        when(orderMapper.selectById(99L)).thenReturn(order);
        when(taskMapper.selectList(any())).thenReturn(List.of(hidden));
        when(access.currentUserId()).thenReturn(7L);
        when(access.hasCurrentRole("finance")).thenReturn(false);
        when(access.canAccess(8L, 4L)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> service.payments(99L));
        verify(paymentMapper, never()).selectList(any());
    }

    @Test
    void contractConversionWithoutLinkedOrderIsRejectedBeforeMutation() {
        FeigeAuditTask task = pendingTask();
        FeigeAuditStep step = currentStep();
        step.setIndicatorSchemaJson("[{\"indicatorType\":\"convert_contract\"}]");
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(stepMapper.selectById(11L)).thenReturn(step);
        when(access.currentUserId()).thenReturn(7L);

        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult("approved");
        request.setConvertContract(true);

        assertThrows(BusinessException.class, () -> service.review(1L, request));
        verify(taskMapper, never()).updateById(any());
    }

    @Test
    void finalApprovalDelegatesRealContractConversionBeforeTaskSuccess() {
        FeigeAuditTask task = pendingTask();
        task.setOrderId(99L);
        task.setTotalSteps(1);
        FeigeAuditStep step = currentStep();
        step.setFinalStep(1);
        step.setIndicatorSchemaJson("[{\"indicatorType\":\"convert_contract\"}]");
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(stepMapper.selectById(11L)).thenReturn(step);
        when(access.currentUserId()).thenReturn(7L);
        when(access.currentUserName()).thenReturn("审核人");
        when(contractConversionService.ensureContractFromApprovedTask(99L)).thenReturn(123L);
        when(taskMapper.updateById(any())).thenReturn(1);

        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult("approved");
        request.setConvertContract(true);

        service.review(1L, request);

        verify(contractConversionService).ensureContractFromApprovedTask(99L);
        verify(taskMapper).updateById(task);
        assertEquals("approved", task.getTaskStatus());
    }

    @Test
    void contractConversionFailureDoesNotWriteApprovedTaskState() {
        FeigeAuditTask task = pendingTask();
        task.setOrderId(99L);
        task.setTotalSteps(1);
        FeigeAuditStep step = currentStep();
        step.setFinalStep(1);
        step.setIndicatorSchemaJson("[{\"indicatorType\":\"convert_contract\"}]");
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(stepMapper.selectById(11L)).thenReturn(step);
        when(access.currentUserId()).thenReturn(7L);
        when(access.currentUserName()).thenReturn("审核人");
        when(contractConversionService.ensureContractFromApprovedTask(99L))
                .thenThrow(new BusinessException("合同转换失败"));

        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult("approved");
        request.setConvertContract(true);

        assertThrows(BusinessException.class, () -> service.review(1L, request));
        verify(taskMapper, never()).updateById(any());
    }

    @Test
    void nonFinalApprovalCannotConvertContract() {
        FeigeAuditTask task = pendingTask();
        task.setOrderId(99L);
        task.setTotalSteps(2);
        FeigeAuditStep step = currentStep();
        step.setIndicatorSchemaJson("[{\"indicatorType\":\"convert_contract\"}]");
        FeigeAuditStep next = new FeigeAuditStep();
        next.setId(12L);
        next.setProcessId(3L);
        next.setStepOrder(2);
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(stepMapper.selectById(11L)).thenReturn(step);
        when(stepMapper.selectOne(any())).thenReturn(next);
        when(access.currentUserId()).thenReturn(7L);

        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult("approved");
        request.setConvertContract(true);

        assertThrows(BusinessException.class, () -> service.review(1L, request));
        verify(contractConversionService, never()).ensureContractFromApprovedTask(any());
        verify(taskMapper, never()).updateById(any());
    }

    @Test
    void addressConversionAlwaysRejected() {
        FeigeAuditTask task = pendingTask();
        FeigeAuditStep step = currentStep();
        when(taskMapper.selectById(1L)).thenReturn(task);
        when(stepMapper.selectById(11L)).thenReturn(step);
        when(access.currentUserId()).thenReturn(7L);

        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult("approved");
        request.setConvertAddress(true);

        assertThrows(BusinessException.class, () -> service.review(1L, request));
        verify(contractConversionService, never()).ensureContractFromApprovedTask(any());
        verify(taskMapper, never()).updateById(any());
    }

    @Test
    void linkedOrderOverridesAuditRequestSnapshot() {
        FeigeAuditProcess process = new FeigeAuditProcess();
        process.setId(3L);
        process.setProcessCode("P-1");
        process.setProcessName("订单审批");
        process.setTaskType("once");
        process.setEnabled(1);
        FeigeAuditStep step = currentStep();
        step.setAssigneeMode("role");
        step.setRequiredRoleKey("manager");
        step.setFinalStep(1);
        FeigeOrder order = new FeigeOrder();
        order.setId(99L);
        order.setOrderNo("FG-TRUSTED");
        order.setCompanyName("权威客户");
        order.setBusinessType("工商变更");
        order.setSalesmanId(8L);
        order.setSalesmanName("权威销售");
        order.setDeptId(4L);
        order.setTeamName("权威团队");
        order.setRegion("杭州");
        order.setContractAmount(new BigDecimal("880.00"));
        SysUser owner = new SysUser();
        owner.setId(8L);
        owner.setDeptId(7L);

        when(processMapper.selectById(3L)).thenReturn(process);
        when(stepMapper.selectList(any())).thenReturn(List.of(step));
        when(orderMapper.selectById(99L)).thenReturn(order);
        when(dataScopeHelper.canAccess(8L, 4L)).thenReturn(true);
        when(access.requireVisibleActiveUser(8L)).thenReturn(owner);
        when(taskMapper.insert(any())).thenAnswer(invocation -> {
            ((FeigeAuditTask) invocation.getArgument(0)).setId(77L);
            return 1;
        });

        FeigeTaskRequests.AuditTaskCreate request = new FeigeTaskRequests.AuditTaskCreate();
        request.setProcessId(3L);
        request.setOrderId(99L);
        request.setOrderNo("SPOOFED");
        request.setCompanyName("伪造客户");
        request.setBusinessOwnerId(999L);
        request.setBusinessTypeCode("SPOOFED");
        request.setTeamName("伪造团队");
        request.setRegion("伪造地区");
        request.setAmount(new BigDecimal("1.00"));

        assertEquals(77L, service.createTask(request));

        ArgumentCaptor<FeigeAuditTask> captor = ArgumentCaptor.forClass(FeigeAuditTask.class);
        verify(taskMapper).insert(captor.capture());
        FeigeAuditTask saved = captor.getValue();
        assertEquals("FG-TRUSTED", saved.getOrderNo());
        assertEquals("权威客户", saved.getCompanyName());
        assertEquals("工商变更", saved.getBusinessTypeCode());
        assertEquals(8L, saved.getBusinessOwnerId());
        assertEquals("权威销售", saved.getBusinessOwnerName());
        assertEquals(4L, saved.getDeptId());
        assertEquals("权威团队", saved.getTeamName());
        assertEquals("杭州", saved.getRegion());
        assertEquals(new BigDecimal("880.00"), saved.getAmount());
        verify(access, never()).requireVisibleActiveUser(999L);
    }

    private FeigeAuditTask pendingTask() {
        FeigeAuditTask task = new FeigeAuditTask();
        task.setId(1L);
        task.setProcessId(3L);
        task.setStepId(11L);
        task.setStepOrder(1);
        task.setStepName("初审");
        task.setTaskStatus("pending");
        task.setAssignedUserId(7L);
        task.setBusinessOwnerId(8L);
        task.setFinalConfirm(0);
        return task;
    }

    private FeigeAuditStep currentStep() {
        FeigeAuditStep step = new FeigeAuditStep();
        step.setId(11L);
        step.setProcessId(3L);
        step.setStepOrder(1);
        step.setStepName("初审");
        step.setAssigneeMode("specific");
        return step;
    }
}
