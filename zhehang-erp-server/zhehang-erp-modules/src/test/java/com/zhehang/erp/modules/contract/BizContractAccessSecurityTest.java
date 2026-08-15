package com.zhehang.erp.modules.contract;

import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.contract.mapper.BizContractTemplateMapper;
import com.zhehang.erp.modules.contract.service.impl.BizContractServiceImpl;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.task.mapper.BizCommissionMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import com.zhehang.erp.modules.task.service.IBizCommissionService;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BizContractAccessSecurityTest {

    @Mock private BizContractMapper contractMapper;
    @Mock private BizContractTemplateMapper templateMapper;
    @Mock private BizOrderMapper orderMapper;
    @Mock private IBizTaskService taskService;
    @Mock private BizTaskMapper bizTaskMapper;
    @Mock private IBizCommissionService commissionService;
    @Mock private BizCommissionMapper bizCommissionMapper;
    @Mock private DataScopeHelper dataScopeHelper;

    @InjectMocks private BizContractServiceImpl service;

    @Test
    void managerCanChangeContractInsideOwnDepartmentScope() {
        BizContract contract = contract(20L, 200L, 8L);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(contractMapper.selectById(20L)).thenReturn(contract);
        when(dataScopeHelper.canAccess(200L, 8L)).thenReturn(true);

        assertDoesNotThrow(() -> service.sendSign(20L, "online"));

        verify(contractMapper).updateById(contract);
    }

    @Test
    void managerCannotChangeContractOutsideDepartmentScope() {
        BizContract contract = contract(21L, 201L, 99L);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(contractMapper.selectById(21L)).thenReturn(contract);
        when(dataScopeHelper.canAccess(201L, 99L)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> service.sendSign(21L, "online"));

        verify(contractMapper, never()).updateById(contract);
    }

    @Test
    void ordinaryEmployeeCannotTamperContractIdForStatusChange() {
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> service.terminate(22L, "tampered"));

        verify(contractMapper, never()).selectById(22L);
    }

    private BizContract contract(Long id, Long salesmanId, Long deptId) {
        BizContract contract = new BizContract();
        contract.setId(id);
        contract.setSalesmanId(salesmanId);
        contract.setDeptId(deptId);
        contract.setStatus(1);
        return contract;
    }
}
