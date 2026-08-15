package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import com.zhehang.erp.modules.system.mapper.SysDictDataMapper;
import com.zhehang.erp.modules.system.mapper.SysDictTypeMapper;
import com.zhehang.erp.modules.system.service.SettingsGovernanceCatalog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SysDictTypeServiceImplTest {

    @Mock
    private SysDictTypeMapper mapper;

    @Mock
    private SysDictDataMapper dictDataMapper;

    private SysDictTypeServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new SysDictTypeServiceImpl(dictDataMapper, new SettingsGovernanceCatalog());
        ReflectionTestUtils.setField(service, "baseMapper", mapper);
    }

    @Test
    void updateTypeCannotChangeStableTypeCode() {
        SysDictType old = type(3L, "memo_category", "备忘分类");
        when(mapper.selectById(3L)).thenReturn(old);
        when(mapper.selectCount(any(Wrapper.class))).thenReturn(0L);

        SysDictType update = type(3L, "memo_category_v2", "备忘分类新版");

        assertThatThrownBy(() -> service.updateType(update))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("历史数据契约");
        verify(mapper, never()).updateById(any(SysDictType.class));
    }

    @Test
    void boundDictionaryTypeCannotBeHardDeleted() {
        when(mapper.selectById(4L))
                .thenReturn(type(4L, "crm_consult_business", "咨询/成交业务"));

        assertThatThrownBy(() -> service.removeTypeCascade(4L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("请停用类型");
        verify(mapper, never()).deleteById(4L);
    }

    @Test
    void undeclaredDictionaryTypeCannotBecomeASecondConfigurationSource() {
        when(mapper.selectCount(any(Wrapper.class))).thenReturn(0L);

        SysDictType ungoverned = type(null, "order_status", "订单状态");

        assertThatThrownBy(() -> service.addType(ungoverned))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不能创建无效字典");
        verify(mapper, never()).insert(any(SysDictType.class));
    }

    @Test
    void registeredButNotConnectedDictionaryCannotBeEditedThroughLegacyApi() {
        SysDictType old = type(5L, "payment_method", "付款方式");
        when(mapper.selectById(5L)).thenReturn(old);

        SysDictType update = type(5L, "payment_method", "收付款方式");

        assertThatThrownBy(() -> service.updateType(update))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不是已接入的可维护目录");
        verify(mapper, never()).updateById(any(SysDictType.class));
    }

    @Test
    void addTypeIgnoresClientControlledIdTenantDeleteAndAuditFields() {
        when(mapper.selectCount(any(Wrapper.class))).thenReturn(0L);
        SysDictType added = type(99L, "memo_category", " 备忘分类 ");
        added.setTenantId(999L);
        added.setDeleted(1);
        added.setCreateBy(999L);

        service.addType(added);

        ArgumentCaptor<SysDictType> captor = ArgumentCaptor.forClass(SysDictType.class);
        verify(mapper).insert(captor.capture());
        SysDictType saved = captor.getValue();
        assertThat(saved.getId()).isNull();
        assertThat(saved.getTenantId()).isNull();
        assertThat(saved.getDeleted()).isNull();
        assertThat(saved.getCreateBy()).isNull();
        assertThat(saved.getDictName()).isEqualTo("备忘分类");
    }

    @Test
    void updateTypeIgnoresClientControlledTenantDeleteAndAuditFields() {
        when(mapper.selectById(6L)).thenReturn(type(6L, "memo_category", "备忘分类"));
        when(mapper.selectCount(any(Wrapper.class))).thenReturn(0L);
        SysDictType update = type(6L, "memo_category", " 个人备忘分类 ");
        update.setTenantId(999L);
        update.setDeleted(1);
        update.setUpdateBy(999L);

        service.updateType(update);

        ArgumentCaptor<SysDictType> captor = ArgumentCaptor.forClass(SysDictType.class);
        verify(mapper).updateById(captor.capture());
        SysDictType saved = captor.getValue();
        assertThat(saved.getTenantId()).isNull();
        assertThat(saved.getDeleted()).isNull();
        assertThat(saved.getUpdateBy()).isNull();
        assertThat(saved.getDictName()).isEqualTo("个人备忘分类");
        assertThat(saved.getDictType()).isEqualTo("memo_category");
    }

    @Test
    void typeRemarkLongerThanDatabaseContractIsRejected() {
        SysDictType added = type(null, "memo_category", "备忘分类");
        added.setRemark("x".repeat(256));

        assertThatThrownBy(() -> service.addType(added))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("备注不能超过255");
        verify(mapper, never()).insert(any(SysDictType.class));
    }

    private SysDictType type(Long id, String dictType, String dictName) {
        SysDictType type = new SysDictType();
        type.setId(id);
        type.setDictType(dictType);
        type.setDictName(dictName);
        return type;
    }
}
