package com.zhehang.erp.modules.org;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.domain.entity.OrgTransfer;
import com.zhehang.erp.modules.org.domain.dto.TransferDTO;
import com.zhehang.erp.modules.org.controller.OrgTransferController;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.org.mapper.OrgTransferMapper;
import com.zhehang.erp.modules.org.service.impl.OrgTransferServiceImpl;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.modules.workflow.service.IWfInstanceService;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrgTransferServiceImplSecurityTest {

    @Test
    void transferCreationCannotRunInsideEmployeeView() throws Exception {
        DenyDuringImpersonation guard = OrgTransferController.class
                .getMethod("add", TransferDTO.class)
                .getAnnotation(DenyDuringImpersonation.class);

        assertNotNull(guard);
    }

    @Test
    void ordinaryEmployeeCannotForgeAnotherEmployeesTransfer() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        TransferDTO dto = new TransferDTO();
        dto.setEmployeeId(99L);
        dto.setTransferType(5);
        dto.setEffectiveDate(LocalDate.now());

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, mock(ISysUserService.class), dataScopeHelper)
                        .createTransfer(dto));

        assertEquals("无权限,仅HR/管理员/老板可发起人事异动", thrown.getMessage());
        verify(employeeMapper, never()).selectById(any());
        verify(transferMapper, never()).insert(any());
    }

    @Test
    void resignationCreationRejectsMissingDateBeforeWritingWorkflow() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        when(dataScopeHelper.hasPerm("hr:employee:view_all")).thenReturn(true);
        when(employeeMapper.selectById(99L)).thenReturn(employee());
        TransferDTO dto = new TransferDTO();
        dto.setEmployeeId(99L);
        dto.setTransferType(5);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, mock(ISysUserService.class), dataScopeHelper)
                        .createTransfer(dto));

        assertEquals("离职生效日期不能为空", thrown.getMessage());
        verify(transferMapper, never()).insert(any());
    }

    @Test
    void staleApprovalCannotOverwriteAnAlreadyProcessedTransfer() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(0);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, userService)
                        .approveTransfer(88L, 1, 22L));

        assertEquals("该异动记录已审批或状态已变化，请刷新后重试", thrown.getMessage());
        assertEquals(0, transfer.getStatus());
        verify(employeeMapper, never()).selectById(any());
        verify(userService, never()).disableForResignation(any());
    }

    @Test
    void approvedResignationDisablesLinkedAccountInTheSameServiceTransaction() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        OrgEmployee employee = employee();
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        when(employeeMapper.update(any(OrgEmployee.class), any())).thenReturn(1);

        service(transferMapper, employeeMapper, userService).approveTransfer(88L, 1, 22L);

        assertEquals(1, transfer.getStatus());
        assertEquals(3, employee.getStatus());
        assertEquals(transfer.getEffectiveDate(), employee.getResignDate());
        verify(userService).disableForResignation(10L);
    }

    @Test
    void resignationApprovalRejectsMissingEffectiveDateBeforeArchiveOrAccountChange() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        transfer.setEffectiveDate(null);
        OrgEmployee employee = employee();
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, userService).approveTransfer(88L, 1, 22L));

        assertEquals("离职生效日期不能为空", thrown.getMessage());
        assertEquals(1, employee.getStatus());
        verify(employeeMapper, never()).update(any(OrgEmployee.class), any());
        verify(userService, never()).disableForResignation(any());
    }

    @Test
    void resignationApprovalRejectsFutureEffectiveDate() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        transfer.setEffectiveDate(LocalDate.now().plusDays(1));
        OrgEmployee employee = employee();
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, userService).approveTransfer(88L, 1, 22L));

        assertEquals("暂不支持预约未来离职", thrown.getMessage());
        assertEquals(1, employee.getStatus());
        verify(employeeMapper, never()).update(any(OrgEmployee.class), any());
        verify(userService, never()).disableForResignation(any());
    }

    @Test
    void resignationApprovalRejectsDateBeforeHireDate() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        OrgEmployee employee = employee();
        employee.setHireDate(LocalDate.now().minusDays(3));
        transfer.setEffectiveDate(LocalDate.now().minusDays(4));
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, userService).approveTransfer(88L, 1, 22L));

        assertEquals("离职日期不能早于入职日期", thrown.getMessage());
        verify(employeeMapper, never()).update(any(OrgEmployee.class), any());
        verify(userService, never()).disableForResignation(any());
    }

    @Test
    void staleProbationApprovalCannotReviveResignedEmployee() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        transfer.setTransferType(2);
        OrgEmployee employee = employee();
        employee.setStatus(3);
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, userService).approveTransfer(88L, 1, 22L));

        assertEquals("仅试用员工可以办理转正，员工状态已变化，请重新发起", thrown.getMessage());
        verify(employeeMapper, never()).update(any(OrgEmployee.class), any());
        verify(userService, never()).disableForResignation(any());
    }

    @Test
    void conditionalEmployeeStateUpdateFailureThrowsAndNeverRevokesAccount() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        OrgEmployee employee = employee();
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        when(employeeMapper.update(any(OrgEmployee.class), any())).thenReturn(0);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service(transferMapper, employeeMapper, userService).approveTransfer(88L, 1, 22L));

        assertEquals("员工状态已变化，请刷新后重新办理", thrown.getMessage());
        assertEquals(1, employee.getStatus());
        verify(employeeMapper).update(any(OrgEmployee.class), any());
        verify(userService, never()).disableForResignation(any());
    }

    @Test
    void rejectedResignationDoesNotTouchEmployeeOrAccount() {
        OrgTransferMapper transferMapper = mock(OrgTransferMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService userService = mock(ISysUserService.class);
        OrgTransfer transfer = resignationTransfer();
        when(transferMapper.selectById(88L)).thenReturn(transfer);
        when(transferMapper.update(any(OrgTransfer.class), any())).thenReturn(1);

        service(transferMapper, employeeMapper, userService).approveTransfer(88L, 2, 22L);

        verify(employeeMapper, never()).selectById(any());
        verify(userService, never()).disableForResignation(any());
    }

    @Test
    void approvalKeepsRollbackTransactionForAtomicOffboarding() throws Exception {
        Transactional transactional = OrgTransferServiceImpl.class
                .getMethod("approveTransfer", Long.class, Integer.class, Long.class)
                .getAnnotation(Transactional.class);

        assertNotNull(transactional);
        assertEquals(Exception.class, transactional.rollbackFor()[0]);
    }

    private OrgTransferServiceImpl service(OrgTransferMapper transferMapper,
                                           OrgEmployeeMapper employeeMapper,
                                           ISysUserService userService) {
        return service(transferMapper, employeeMapper, userService, mock(DataScopeHelper.class));
    }

    private OrgTransferServiceImpl service(OrgTransferMapper transferMapper,
                                           OrgEmployeeMapper employeeMapper,
                                           ISysUserService userService,
                                           DataScopeHelper dataScopeHelper) {
        return new OrgTransferServiceImpl(
                transferMapper, employeeMapper, dataScopeHelper,
                mock(IWfInstanceService.class), userService);
    }

    private OrgTransfer resignationTransfer() {
        OrgTransfer transfer = new OrgTransfer();
        transfer.setId(88L);
        transfer.setEmployeeId(99L);
        transfer.setTransferType(5);
        transfer.setEffectiveDate(LocalDate.now());
        transfer.setStatus(0);
        return transfer;
    }

    private OrgEmployee employee() {
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(1);
        return employee;
    }
}
