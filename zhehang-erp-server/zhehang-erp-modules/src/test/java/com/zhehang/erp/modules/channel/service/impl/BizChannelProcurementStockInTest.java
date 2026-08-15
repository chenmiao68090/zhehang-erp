package com.zhehang.erp.modules.channel.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.channel.domain.BizAddressResource;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import com.zhehang.erp.modules.channel.domain.BizSupplier;
import com.zhehang.erp.modules.channel.mapper.BizAddressResourceMapper;
import com.zhehang.erp.modules.channel.mapper.BizChannelCostMapper;
import com.zhehang.erp.modules.channel.mapper.BizProcurementMapper;
import com.zhehang.erp.modules.channel.mapper.BizSupplierMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.annotations.Select;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.MockedStatic;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BizChannelProcurementStockInTest {
    private BizAddressResourceMapper addressMapper;
    private BizProcurementMapper procurementMapper;
    private BizSupplierMapper supplierMapper;
    private BizChannelServiceImpl service;
    private MockedStatic<SecurityUtils> security;

    @BeforeEach
    void setUp() {
        initTable(BizAddressResource.class);
        supplierMapper = mock(BizSupplierMapper.class);
        addressMapper = mock(BizAddressResourceMapper.class);
        procurementMapper = mock(BizProcurementMapper.class);
        BizChannelCostMapper channelCostMapper = mock(BizChannelCostMapper.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        security = mockStatic(SecurityUtils.class);
        security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
        service = new BizChannelServiceImpl(
                supplierMapper,
                addressMapper,
                procurementMapper,
                channelCostMapper,
                dataScopeHelper);
    }

    @Test
    void saveProcurementRejectsUnknownSupplier() {
        BizProcurement procurement = newProcurement("杭州市西湖区文三路 1 号", 1);

        assertThatThrownBy(() -> service.saveProcurement(procurement))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("有效的地址供应商");

        verify(procurementMapper, never()).insert(any());
    }

    @Test
    void saveProcurementRejectsEmptyAddressDetails() {
        when(supplierMapper.selectById(20L)).thenReturn(new BizSupplier());
        BizProcurement procurement = newProcurement("  \n", 1);

        assertThatThrownBy(() -> service.saveProcurement(procurement))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("地址资源明细");

        verify(procurementMapper, never()).insert(any());
    }

    @Test
    void saveProcurementRejectsMismatchedQuantity() {
        when(supplierMapper.selectById(20L)).thenReturn(new BizSupplier());
        BizProcurement procurement = newProcurement("杭州市西湖区文三路 1 号", 2);

        assertThatThrownBy(() -> service.saveProcurement(procurement))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("数量不一致");

        verify(procurementMapper, never()).insert(any());
    }

    @Test
    void saveProcurementAcceptsOneRealAddressPerQuantity() {
        when(supplierMapper.selectById(20L)).thenReturn(new BizSupplier());
        BizProcurement procurement = newProcurement("杭州市西湖区文三路 1 号\n宁波市鄞州区学府路 2 号", 2);
        doAnswer(invocation -> {
            BizProcurement inserted = invocation.getArgument(0);
            inserted.setId(10L);
            return 1;
        }).when(procurementMapper).insert(any(BizProcurement.class));

        assertThat(service.saveProcurement(procurement)).isEqualTo(10L);
        verify(procurementMapper).insert(procurement);
    }

    @AfterEach
    void tearDown() {
        security.close();
    }

    @Test
    void rejectsUnpaidProcurementWithoutWritingResourcesOrStatus() {
        when(procurementMapper.selectForUpdate(10L, 1L)).thenReturn(procurement("approved"));
        when(addressMapper.selectList(any())).thenReturn(List.of());

        assertThatThrownBy(() -> service.stockInProcurement(10L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("当前状态不可入库");

        verify(addressMapper, never()).insert(any());
        verify(procurementMapper, never()).updateById(any());
    }

    @Test
    void stockedProcurementReturnsExistingResourceIdsWithoutDuplicateWrites() {
        BizAddressResource first = resource(301L);
        BizAddressResource second = resource(302L);
        when(procurementMapper.selectForUpdate(10L, 1L)).thenReturn(procurement("stocked"));
        when(addressMapper.selectList(any())).thenReturn(List.of(first, second));

        List<Long> resourceIds = service.stockInProcurement(10L);

        assertThat(resourceIds).containsExactly(301L, 302L);
        verify(addressMapper, never()).insert(any());
        verify(procurementMapper, never()).updateById(any());
    }

    @Test
    void paidProcurementCreatesRealResourcesAndSerializedRetryReusesTheirIds() {
        BizProcurement procurement = procurement("paid");
        procurement.setQuantity(2);
        procurement.setUnitPrice(new BigDecimal("88.50"));
        procurement.setAddressDetail("杭州市西湖区文三路 1 号\n宁波市鄞州区学府路 2 号");
        when(procurementMapper.selectForUpdate(10L, 1L)).thenReturn(procurement);
        List<BizAddressResource> storedResources = new ArrayList<>();
        when(addressMapper.selectList(any())).thenAnswer(invocation -> List.copyOf(storedResources));
        AtomicLong generatedId = new AtomicLong(301L);
        doAnswer(invocation -> {
            BizAddressResource resource = invocation.getArgument(0);
            resource.setId(generatedId.getAndIncrement());
            storedResources.add(resource);
            return 1;
        }).when(addressMapper).insert(any(BizAddressResource.class));

        List<Long> resourceIds = service.stockInProcurement(10L);
        List<Long> retryResourceIds = service.stockInProcurement(10L);

        assertThat(resourceIds).containsExactly(301L, 302L);
        assertThat(retryResourceIds).containsExactly(301L, 302L);
        ArgumentCaptor<BizAddressResource> resourceCaptor = ArgumentCaptor.forClass(BizAddressResource.class);
        verify(addressMapper, times(2)).insert(resourceCaptor.capture());
        assertThat(resourceCaptor.getAllValues())
                .extracting(BizAddressResource::getResourceNo)
                .containsExactly("ADR10-001", "ADR10-002");
        assertThat(resourceCaptor.getAllValues())
                .extracting(BizAddressResource::getAddress)
                .containsExactly("杭州市西湖区文三路 1 号", "宁波市鄞州区学府路 2 号");
        assertThat(resourceCaptor.getAllValues())
                .allSatisfy(resource -> {
                    assertThat(resource.getSupplierId()).isEqualTo(20L);
                    assertThat(resource.getProcurementId()).isEqualTo(10L);
                    assertThat(resource.getPurchasePrice()).isEqualByComparingTo("88.50");
                    assertThat(resource.getStatus()).isEqualTo("available");
                    assertThat(resource.getStockInDate()).isEqualTo(LocalDate.now());
                });
        assertThat(resourceCaptor.getAllValues())
                .extracting(BizAddressResource::getRegion)
                .containsExactly("杭州市西湖区", "宁波市鄞州区");
        assertThat(procurement.getStatus()).isEqualTo("stocked");

        InOrder writeOrder = inOrder(addressMapper, procurementMapper);
        writeOrder.verify(addressMapper, times(2)).insert(any(BizAddressResource.class));
        writeOrder.verify(procurementMapper).updateById(procurement);
        verify(procurementMapper, times(2)).selectForUpdate(10L, 1L);
    }

    @Test
    void procurementMapperDeclaresTenantScopedRowLockForConcurrentStockIn() throws NoSuchMethodException {
        Select lockQuery = BizProcurementMapper.class
                .getMethod("selectForUpdate", Long.class, Long.class)
                .getAnnotation(Select.class);

        assertThat(lockQuery).isNotNull();
        String sql = String.join(" ", lockQuery.value());
        assertThat(sql)
                .contains("tenant_id = #{tenantId}")
                .contains("deleted = 0")
                .contains("FOR UPDATE");
    }

    @Test
    void stockInMethodDeclaresRollbackForAnyException() throws NoSuchMethodException {
        Transactional transaction = BizChannelServiceImpl.class
                .getMethod("stockInProcurement", Long.class)
                .getAnnotation(Transactional.class);

        assertThat(transaction).isNotNull();
        assertThat(transaction.rollbackFor()).contains(Exception.class);
    }

    private BizProcurement procurement(String status) {
        BizProcurement procurement = new BizProcurement();
        procurement.setId(10L);
        procurement.setSupplierId(20L);
        procurement.setStatus(status);
        return procurement;
    }

    private BizProcurement newProcurement(String addressDetail, int quantity) {
        BizProcurement procurement = new BizProcurement();
        procurement.setSupplierId(20L);
        procurement.setAddressDetail(addressDetail);
        procurement.setQuantity(quantity);
        return procurement;
    }

    private BizAddressResource resource(Long id) {
        BizAddressResource resource = new BizAddressResource();
        resource.setId(id);
        resource.setProcurementId(10L);
        return resource;
    }

    private static void initTable(Class<?> entityClass) {
        if (TableInfoHelper.getTableInfo(entityClass) != null) {
            return;
        }
        MybatisConfiguration configuration = new MybatisConfiguration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(configuration, entityClass.getName());
        assistant.setCurrentNamespace(entityClass.getName());
        TableInfoHelper.initTableInfo(assistant, entityClass);
    }
}
