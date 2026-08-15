package com.zhehang.erp.modules.feigeorder;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeAccountingContract;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractChangeLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderOperationLog;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeAccountingContractMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeContractChangeLogMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderOperationLogMapper;
import com.zhehang.erp.modules.feigeorder.service.FeigeTaskContractConversionService;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeigeTaskContractConversionServiceTest {

    @Mock private FeigeOrderMapper orderMapper;
    @Mock private FeigeAccountingContractMapper contractMapper;
    @Mock private FeigeContractChangeLogMapper contractChangeLogMapper;
    @Mock private FeigeOrderOperationLogMapper operationLogMapper;

    private FeigeTaskContractConversionService service;

    @BeforeEach
    void setUp() {
        login(7L, 1L, "finance-user");
        service = new FeigeTaskContractConversionService(orderMapper, contractMapper,
                contractChangeLogMapper, operationLogMapper, new com.fasterxml.jackson.databind.ObjectMapper());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsExistingActiveContractWithoutDuplicateWrite() {
        FeigeOrder order = approvedOrder();
        FeigeAccountingContract existing = new FeigeAccountingContract();
        existing.setId(88L);
        existing.setOrderId(order.getId());
        existing.setContractStatus("executing");
        when(orderMapper.selectOne(any())).thenReturn(order);
        when(contractMapper.selectOne(any())).thenReturn(existing);

        assertEquals(88L, service.ensureContractFromApprovedTask(order.getId()));

        verify(contractMapper, never()).insert(any());
        verify(contractChangeLogMapper, never()).insert(any());
        verify(operationLogMapper, never()).insert(any());
    }

    @Test
    void createsDraftFromTrustedOrderFieldsAndWritesAuditLog() {
        FeigeOrder order = approvedOrder();
        when(orderMapper.selectOne(any())).thenReturn(order);
        when(contractMapper.selectOne(any())).thenReturn(null);
        when(contractMapper.insert(any())).thenAnswer(invocation -> {
            FeigeAccountingContract saved = invocation.getArgument(0);
            saved.setId(99L);
            return 1;
        });
        when(contractChangeLogMapper.insert(any())).thenReturn(1);
        when(operationLogMapper.insert(any())).thenReturn(1);

        assertEquals(99L, service.ensureContractFromApprovedTask(order.getId()));

        ArgumentCaptor<FeigeAccountingContract> contractCaptor =
                ArgumentCaptor.forClass(FeigeAccountingContract.class);
        verify(contractMapper).insert(contractCaptor.capture());
        FeigeAccountingContract saved = contractCaptor.getValue();
        assertEquals(1L, saved.getTenantId());
        assertEquals(99L, saved.getOrderId());
        assertEquals("FG-TRUSTED", saved.getOrderNo());
        assertEquals("权威客户", saved.getCompanyName());
        assertEquals(8L, saved.getSalesmanId());
        assertEquals("权威销售", saved.getSalesmanName());
        assertEquals(4L, saved.getDeptId());
        assertEquals(new BigDecimal("880.00"), saved.getContractAmount());
        assertEquals(new BigDecimal("280.00"), saved.getPaidAmount());
        assertEquals("工商变更", saved.getProductName());
        assertEquals("draft", saved.getContractStatus());
        assertNull(saved.getSignDate());
        assertNull(saved.getExpireDate());
        assertNull(saved.getServicePersonId());
        assertNull(saved.getAccountantId());

        ArgumentCaptor<FeigeContractChangeLog> contractLogCaptor =
                ArgumentCaptor.forClass(FeigeContractChangeLog.class);
        verify(contractChangeLogMapper).insert(contractLogCaptor.capture());
        FeigeContractChangeLog contractLog = contractLogCaptor.getValue();
        assertEquals(99L, contractLog.getContractId());
        assertEquals("task_conversion", contractLog.getChangeType());
        assertEquals(7L, contractLog.getOperatorId());
        assertEquals(1L, contractLog.getTenantId());
        org.junit.jupiter.api.Assertions.assertTrue(contractLog.getAfterData().contains("FG-TRUSTED"));

        ArgumentCaptor<FeigeOrderOperationLog> logCaptor =
                ArgumentCaptor.forClass(FeigeOrderOperationLog.class);
        verify(operationLogMapper).insert(logCaptor.capture());
        FeigeOrderOperationLog log = logCaptor.getValue();
        assertEquals(99L, log.getOrderId());
        assertEquals("contract_convert_from_task", log.getOperationType());
        assertEquals(7L, log.getOperatorId());
        assertEquals("finance-user", log.getOperatorName());
        assertEquals(1L, log.getTenantId());
    }

    @Test
    void rejectsOrderThatHasNotPassedFinanceAudit() {
        FeigeOrder order = approvedOrder();
        order.setAuditStatus("pending");
        when(orderMapper.selectOne(any())).thenReturn(order);

        assertThrows(BusinessException.class,
                () -> service.ensureContractFromApprovedTask(order.getId()));

        verify(contractMapper, never()).selectOne(any());
        verify(contractMapper, never()).insert(any());
    }

    @Test
    void uniqueRaceReturnsTheConcurrentActiveContract() {
        FeigeOrder order = approvedOrder();
        FeigeAccountingContract concurrent = new FeigeAccountingContract();
        concurrent.setId(109L);
        concurrent.setOrderId(order.getId());
        concurrent.setContractStatus("draft");
        when(orderMapper.selectOne(any())).thenReturn(order);
        when(contractMapper.selectOne(any())).thenReturn(null, concurrent);
        when(contractMapper.insert(any())).thenThrow(new DuplicateKeyException("active order"));

        assertEquals(109L, service.ensureContractFromApprovedTask(order.getId()));

        verify(operationLogMapper, never()).insert(any());
    }

    @Test
    void rejectsMissingTrustedSalesmanSnapshotBeforeContractInsert() {
        FeigeOrder order = approvedOrder();
        order.setSalesmanName(" ");
        when(orderMapper.selectOne(any())).thenReturn(order);
        when(contractMapper.selectOne(any())).thenReturn(null);

        assertThrows(BusinessException.class,
                () -> service.ensureContractFromApprovedTask(order.getId()));

        verify(contractMapper, never()).insert(any());
    }

    @Test
    void auditLogFailureFailsTheConversionCall() {
        FeigeOrder order = approvedOrder();
        when(orderMapper.selectOne(any())).thenReturn(order);
        when(contractMapper.selectOne(any())).thenReturn(null);
        when(contractMapper.insert(any())).thenAnswer(invocation -> {
            FeigeAccountingContract saved = invocation.getArgument(0);
            saved.setId(120L);
            return 1;
        });
        when(contractChangeLogMapper.insert(any())).thenReturn(0);

        assertThrows(BusinessException.class,
                () -> service.ensureContractFromApprovedTask(order.getId()));

        verify(operationLogMapper, never()).insert(any());
    }

    private FeigeOrder approvedOrder() {
        FeigeOrder order = new FeigeOrder();
        order.setId(99L);
        order.setTenantId(1L);
        order.setOrderNo("FG-TRUSTED");
        order.setCompanyName("权威客户");
        order.setBusinessType("工商变更");
        order.setSalesmanId(8L);
        order.setSalesmanName("权威销售");
        order.setDeptId(4L);
        order.setContractAmount(new BigDecimal("880"));
        order.setReceivedAmount(new BigDecimal("280"));
        order.setAuditStatus("approved");
        order.setStatus("in_progress");
        order.setCustomerSource("工商公开名单");
        order.setCompanyNature("有限责任公司");
        return order;
    }

    private void login(Long userId, Long tenantId, String username) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginUser.setTenantId(tenantId);
        loginUser.setUsername(username);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
    }
}
