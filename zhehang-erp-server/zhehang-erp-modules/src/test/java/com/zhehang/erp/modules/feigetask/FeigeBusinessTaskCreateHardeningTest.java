package com.zhehang.erp.modules.feigetask;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeBusinessTask;
import com.zhehang.erp.modules.feigetask.mapper.FeigeBusinessTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeTaskOperationLogMapper;
import com.zhehang.erp.modules.feigetask.service.FeigeBusinessTaskService;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskAccessService;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskIdempotencyService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeigeBusinessTaskCreateHardeningTest {

    @Mock private FeigeBusinessTaskMapper taskMapper;
    @Mock private FeigeTaskOperationLogMapper operationLogMapper;
    @Mock private FeigeOrderMapper orderMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private FeigeTaskAccessService access;

    private final FeigeTaskIdempotencyService idempotency = new FeigeTaskIdempotencyService();
    private FeigeBusinessTaskService service;

    @BeforeEach
    void setUp() {
        service = new FeigeBusinessTaskService(taskMapper, operationLogMapper, orderMapper,
                dataScopeHelper, access, idempotency);
    }

    @Test
    void linkedOrderOverridesUntrustedRequestSnapshot() {
        FeigeOrder order = new FeigeOrder();
        order.setId(10L);
        order.setOrderNo("FG-TRUSTED");
        order.setCompanyName("权威客户");
        order.setBusinessType("代理记账");
        order.setSalesmanId(7L);
        order.setSalesmanName("权威销售");
        order.setDeptId(3L);
        order.setOrderAmount(new BigDecimal("1000.00"));
        order.setReceivedAmount(new BigDecimal("500.00"));
        SysUser owner = new SysUser();
        owner.setId(7L);
        owner.setDeptId(9L);

        when(orderMapper.selectById(10L)).thenReturn(order);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(access.requireVisibleActiveUser(7L)).thenReturn(owner);
        when(taskMapper.insert(any())).thenAnswer(invocation -> {
            ((FeigeBusinessTask) invocation.getArgument(0)).setId(99L);
            return 1;
        });

        FeigeTaskRequests.BusinessCreate request = new FeigeTaskRequests.BusinessCreate();
        request.setOrderId(10L);
        request.setOrderNo("SPOOFED");
        request.setCompanyName("伪造客户");
        request.setBusinessOwnerId(88L);

        assertEquals(99L, service.create(request));

        ArgumentCaptor<FeigeBusinessTask> captor = ArgumentCaptor.forClass(FeigeBusinessTask.class);
        verify(taskMapper).insert(captor.capture());
        FeigeBusinessTask saved = captor.getValue();
        assertEquals("FG-TRUSTED", saved.getOrderNo());
        assertEquals("权威客户", saved.getCompanyName());
        assertEquals("代理记账", saved.getBusinessType());
        assertEquals(7L, saved.getBusinessOwnerId());
        assertEquals("权威销售", saved.getBusinessOwnerName());
        assertEquals(3L, saved.getDeptId());
        verify(access, never()).requireVisibleActiveUser(88L);
    }

    @Test
    void sameRequestKeyReturnsExistingTaskButDifferentIntentConflicts() {
        FeigeTaskRequests.BusinessCreate request = new FeigeTaskRequests.BusinessCreate();
        request.setRequestKey("web:business:abc-1");
        request.setCompanyName("本地演示客户");
        String fingerprint = idempotency.businessFingerprint(request);

        FeigeBusinessTask existing = new FeigeBusinessTask();
        existing.setId(66L);
        existing.setRequestKey(request.getRequestKey());
        existing.setRequestFingerprint(fingerprint);
        when(taskMapper.selectOne(any())).thenReturn(existing);

        assertEquals(66L, service.create(request));
        verify(taskMapper, never()).insert(any());

        request.setCompanyName("另一客户");
        assertThrows(BusinessException.class, () -> service.create(request));
    }

    @Test
    void concurrentDuplicateInsertReturnsCommittedTaskByRequestKey() {
        FeigeTaskRequests.BusinessCreate request = new FeigeTaskRequests.BusinessCreate();
        request.setRequestKey("web:business:race-1");
        request.setCompanyName("本地演示客户");
        FeigeBusinessTask committed = new FeigeBusinessTask();
        committed.setId(88L);
        committed.setRequestKey(request.getRequestKey());
        committed.setRequestFingerprint(idempotency.businessFingerprint(request));
        SysUser owner = new SysUser();
        owner.setId(7L);
        owner.setDeptId(3L);

        when(taskMapper.selectOne(any())).thenReturn(null, committed);
        when(access.currentUser()).thenReturn(owner);
        when(access.displayName(owner)).thenReturn("创建人");
        when(taskMapper.insert(any())).thenThrow(new DuplicateKeyException("duplicate"));

        assertEquals(88L, service.create(request));
        verify(taskMapper).insert(any());
    }
}
