package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.controller.CrmCustomerController;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmPoolMapper;
import com.zhehang.erp.modules.crm.service.impl.CrmCustomerServiceImpl;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmCustomerMutationSecurityTest {

    @BeforeAll
    static void initTableInfo() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), "crm-customer-mutation-test"),
                CrmCustomer.class);
    }

    @Mock private CrmCustomerMapper customerMapper;
    @Mock private CrmPoolMapper poolMapper;
    @Mock private DataScopeHelper dataScopeHelper;

    @InjectMocks private CrmCustomerServiceImpl service;

    @Test
    void controllerRoutesEditAndDeleteThroughScopedServiceMethods() {
        ICrmCustomerService customerService = mock(ICrmCustomerService.class);
        CrmCustomerController controller = new CrmCustomerController(
                customerService,
                mock(DataScopeHelper.class),
                mock(CrmCustomerPortfolioService.class),
                mock(CrmCustomer360Service.class));
        CrmCustomer input = new CrmCustomer();
        input.setId(12L);

        controller.edit(input);
        controller.remove(12L);

        verify(customerService).updateAccessible(input);
        verify(customerService).removeAccessible(12L);
        verify(customerService, never()).updateById(any(CrmCustomer.class));
        verify(customerService, never()).removeById(12L);
    }

    @Test
    void updateRejectsCustomerOutsideCurrentDataScopeWithoutWriting() {
        CrmCustomer existing = customer(12L, 88L, 9L);
        when(customerMapper.selectById(12L)).thenReturn(existing);
        when(dataScopeHelper.canAccess(88L, 9L)).thenReturn(false);
        CrmCustomer input = new CrmCustomer();
        input.setId(12L);

        assertThatThrownBy(() -> service.updateAccessible(input))
                .isInstanceOf(AccessDeniedException.class);

        verify(customerMapper, never()).update(any(), any());
    }

    @Test
    void deleteRejectsCustomerOutsideCurrentDataScopeWithoutWriting() {
        CrmCustomer existing = customer(13L, 89L, 10L);
        when(customerMapper.selectById(13L)).thenReturn(existing);
        when(dataScopeHelper.canAccess(89L, 10L)).thenReturn(false);

        assertThatThrownBy(() -> service.removeAccessible(13L))
                .isInstanceOf(AccessDeniedException.class);

        verify(customerMapper, never()).delete(any(LambdaQueryWrapper.class));
    }

    @Test
    void returnToPoolRejectsCustomerOutsideCurrentDataScopeBeforeCreatingPoolRecord() {
        CrmCustomer existing = customer(14L, 90L, 11L);
        when(customerMapper.selectById(14L)).thenReturn(existing);
        when(dataScopeHelper.canAccess(90L, 11L)).thenReturn(false);

        assertThatThrownBy(() -> service.toPool(14L, "越权尝试"))
                .isInstanceOf(AccessDeniedException.class);

        verify(poolMapper, never()).insert(any());
        verify(customerMapper, never()).update(any(), any());
    }

    @Test
    void updatePreservesOwnershipAndAuditMetadataAndRejectsZeroAffectedRows() {
        CrmCustomer existing = customer(15L, 100L, 20L);
        existing.setTenantId(9L);
        existing.setCreateBy(6L);
        existing.setCreateTime(LocalDateTime.of(2026, 7, 14, 9, 30));
        existing.setDeleted(0);
        when(customerMapper.selectById(15L)).thenReturn(existing);
        when(dataScopeHelper.canAccess(100L, 20L)).thenReturn(true);
        when(customerMapper.update(any(CrmCustomer.class), any(LambdaUpdateWrapper.class))).thenReturn(0);

        CrmCustomer input = customer(15L, 999L, 999L);
        input.setTenantId(999L);
        input.setCreateBy(999L);
        input.setDeleted(1);
        input.setName("篡改请求");

        assertThatThrownBy(() -> service.updateAccessible(input))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getCode()).isEqualTo(409));

        assertThat(input.getOwnerId()).isEqualTo(100L);
        assertThat(input.getDeptId()).isEqualTo(20L);
        assertThat(input.getTenantId()).isEqualTo(9L);
        assertThat(input.getCreateBy()).isEqualTo(6L);
        assertThat(input.getDeleted()).isZero();
    }

    @Test
    void deleteRejectsZeroAffectedRowsInsteadOfReportingSuccess() {
        CrmCustomer existing = customer(16L, 101L, 21L);
        when(customerMapper.selectById(16L)).thenReturn(existing);
        when(dataScopeHelper.canAccess(101L, 21L)).thenReturn(true);
        when(customerMapper.delete(any(LambdaQueryWrapper.class))).thenReturn(0);

        assertThatThrownBy(() -> service.removeAccessible(16L))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getCode()).isEqualTo(409));
    }

    @Test
    void returnToPoolRejectsZeroAffectedCustomerRowsSoTransactionCanRollBack() {
        CrmCustomer existing = customer(17L, 102L, 22L);
        when(customerMapper.selectById(17L)).thenReturn(existing);
        when(dataScopeHelper.canAccess(102L, 22L)).thenReturn(true);
        when(poolMapper.insert(any())).thenReturn(1);
        when(customerMapper.update(isNull(), any(LambdaUpdateWrapper.class))).thenReturn(0);

        assertThatThrownBy(() -> service.toPool(17L, "客户主动退出"))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getCode()).isEqualTo(409));

        verify(poolMapper).insert(any());
    }

    private CrmCustomer customer(Long id, Long ownerId, Long deptId) {
        CrmCustomer customer = new CrmCustomer();
        customer.setId(id);
        customer.setOwnerId(ownerId);
        customer.setDeptId(deptId);
        return customer;
    }
}
