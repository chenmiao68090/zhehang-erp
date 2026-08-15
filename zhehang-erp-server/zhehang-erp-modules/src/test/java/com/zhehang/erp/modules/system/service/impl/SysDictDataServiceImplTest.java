package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import com.zhehang.erp.modules.system.mapper.SysDictDataMapper;
import com.zhehang.erp.modules.system.mapper.SysDictTypeMapper;
import com.zhehang.erp.modules.system.service.SettingsGovernanceCatalog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.test.util.ReflectionTestUtils;

import java.sql.SQLException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SysDictDataServiceImplTest {

    @Mock
    private SysDictDataMapper mapper;

    @Mock
    private SysDictTypeMapper dictTypeMapper;

    private SysDictDataServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new SysDictDataServiceImpl(dictTypeMapper, new SettingsGovernanceCatalog());
        ReflectionTestUtils.setField(service, "baseMapper", mapper);
    }

    @Test
    void listEnabledByTypeReturnsRowsWhenDictionaryTableExists() {
        SysDictData row = new SysDictData();
        row.setDictValue("bank");
        when(mapper.selectList(any(Wrapper.class))).thenReturn(List.of(row));

        List<SysDictData> rows = service.listEnabledByType("payment_method");

        assertEquals(1, rows.size());
        assertSame(row, rows.get(0));
    }

    @Test
    void listEnabledByTypeReturnsEmptyOnlyForMysqlMissingTable() {
        when(mapper.selectList(any(Wrapper.class))).thenThrow(sqlError(1146));

        assertEquals(List.of(), service.listEnabledByType("payment_method"));
    }

    @Test
    void listEnabledByTypeDoesNotHideOtherSqlErrors() {
        BadSqlGrammarException error = sqlError(1064);
        when(mapper.selectList(any(Wrapper.class))).thenThrow(error);

        assertSame(error, assertThrows(BadSqlGrammarException.class,
                () -> service.listEnabledByType("payment_method")));
    }

    @Test
    void updateDataKeepsStableValueOnceItHasEnteredBusinessHistory() {
        SysDictData old = data(7L, "memo_category", "客户跟进", "客户跟进");
        when(mapper.selectById(7L)).thenReturn(old);
        when(dictTypeMapper.selectOne(any(Wrapper.class))).thenReturn(type("memo_category"));

        SysDictData update = data(7L, "memo_category", "客户协同", "customer_follow");

        assertThatThrownBy(() -> service.updateData(update))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("存储值已进入历史数据契约");
        verify(mapper, never()).updateById(any(SysDictData.class));
    }

    @Test
    void updateDataCannotMoveOptionToAnotherFieldType() {
        SysDictData old = data(9L, "memo_category", "客户跟进", "客户跟进");
        when(mapper.selectById(9L)).thenReturn(old);
        when(dictTypeMapper.selectOne(any(Wrapper.class))).thenReturn(type("memo_category"));

        SysDictData update = data(9L, "hr_labor_contract_type", "客户跟进", "客户跟进");

        assertThatThrownBy(() -> service.updateData(update))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不能移动到其他字段");
        verify(mapper, never()).updateById(any(SysDictData.class));
    }

    @Test
    void boundDictionaryDataCannotBeHardDeleted() {
        when(mapper.selectById(8L))
                .thenReturn(data(8L, "memo_category", "客户跟进", "客户跟进"));

        assertThatThrownBy(() -> service.removeDataSafely(8L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("请改为停用");
    }

    @Test
    void addingDefaultClearsExistingDefaultBeforeSavingNewOne() {
        when(dictTypeMapper.selectOne(any(Wrapper.class))).thenReturn(type("memo_category"));
        when(mapper.selectCount(any(Wrapper.class))).thenReturn(0L);

        SysDictData added = data(null, "memo_category", "系统优化", "系统优化");
        added.setIsDefault(1);
        service.addData(added);

        var ordered = inOrder(mapper);
        ordered.verify(mapper).update(
                org.mockito.ArgumentMatchers.argThat(patch -> Integer.valueOf(0).equals(patch.getIsDefault())),
                any(Wrapper.class));
        ordered.verify(mapper).insert(added);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Wrapper<SysDictType>> lockQuery = ArgumentCaptor.forClass(Wrapper.class);
        verify(dictTypeMapper).selectOne(lockQuery.capture());
        assertThat(lockQuery.getValue().getSqlSegment()).containsIgnoringCase("FOR UPDATE");
    }

    @Test
    void addDataIgnoresClientControlledIdTenantDeleteAndAuditFields() {
        when(dictTypeMapper.selectOne(any(Wrapper.class))).thenReturn(type("memo_category"));
        when(mapper.selectCount(any(Wrapper.class))).thenReturn(0L);

        SysDictData added = data(99L, "memo_category", " 学习成长 ", "学习成长");
        added.setTenantId(999L);
        added.setDeleted(1);
        added.setCreateBy(999L);
        service.addData(added);

        ArgumentCaptor<SysDictData> captor = ArgumentCaptor.forClass(SysDictData.class);
        verify(mapper).insert(captor.capture());
        SysDictData saved = captor.getValue();
        assertThat(saved.getId()).isNull();
        assertThat(saved.getTenantId()).isNull();
        assertThat(saved.getDeleted()).isNull();
        assertThat(saved.getCreateBy()).isNull();
        assertThat(saved.getDictLabel()).isEqualTo("学习成长");
    }

    @Test
    void updateDataIgnoresClientControlledTenantDeleteAndAuditFields() {
        SysDictData old = data(12L, "memo_category", "客户跟进", "客户跟进");
        when(mapper.selectById(12L)).thenReturn(old);
        when(dictTypeMapper.selectOne(any(Wrapper.class))).thenReturn(type("memo_category"));

        SysDictData update = data(12L, "memo_category", " 客户协同 ", "客户跟进");
        update.setTenantId(999L);
        update.setDeleted(1);
        update.setUpdateBy(999L);
        service.updateData(update);

        ArgumentCaptor<SysDictData> captor = ArgumentCaptor.forClass(SysDictData.class);
        verify(mapper).updateById(captor.capture());
        SysDictData saved = captor.getValue();
        assertThat(saved.getTenantId()).isNull();
        assertThat(saved.getDeleted()).isNull();
        assertThat(saved.getUpdateBy()).isNull();
        assertThat(saved.getDictLabel()).isEqualTo("客户协同");
        assertThat(saved.getDictValue()).isEqualTo("客户跟进");
    }

    @Test
    void optionRemarkLongerThanDatabaseContractIsRejected() {
        SysDictData added = data(null, "memo_category", "客户跟进", "客户跟进");
        added.setRemark("x".repeat(256));

        assertThatThrownBy(() -> service.addData(added))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("备注不能超过255");
        verify(mapper, never()).insert(any(SysDictData.class));
    }

    @Test
    void governedStableValueCannotExceedItsPhysicalBusinessColumn() {
        SysDictData added = data(null, "crm_consult_business", "超长业务", "x".repeat(33));

        assertThatThrownBy(() -> service.addData(added))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("32个字符");
        verify(mapper, never()).insert(any(SysDictData.class));
    }

    @Test
    void disabledFieldTypeFreezesOptionMaintenance() {
        SysDictType disabledType = type("memo_category");
        disabledType.setStatus(1);
        when(dictTypeMapper.selectOne(any(Wrapper.class))).thenReturn(disabledType);

        SysDictData added = data(null, "memo_category", "临时分类", "临时分类");

        assertThatThrownBy(() -> service.addData(added))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("字段类型已停用");
        verify(mapper, never()).insert(any(SysDictData.class));
    }

    @Test
    void disabledFieldTypeAlsoFreezesExistingOptionEdits() {
        SysDictData old = data(21L, "memo_category", "客户跟进", "客户跟进");
        SysDictType disabledType = type("memo_category");
        disabledType.setStatus(1);
        when(mapper.selectById(21L)).thenReturn(old);
        when(dictTypeMapper.selectOne(any(Wrapper.class))).thenReturn(disabledType);

        SysDictData update = data(21L, "memo_category", "客户协同", "客户跟进");

        assertThatThrownBy(() -> service.updateData(update))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("字段类型已停用");
        verify(mapper, never()).updateById(any(SysDictData.class));
    }

    private SysDictData data(Long id, String dictType, String label, String value) {
        SysDictData data = new SysDictData();
        data.setId(id);
        data.setDictType(dictType);
        data.setDictLabel(label);
        data.setDictValue(value);
        return data;
    }

    private SysDictType type(String dictType) {
        SysDictType type = new SysDictType();
        type.setDictType(dictType);
        type.setStatus(0);
        return type;
    }

    private BadSqlGrammarException sqlError(int errorCode) {
        return new BadSqlGrammarException("dict query", "SELECT * FROM sys_dict_data",
                new SQLException("database error", "42000", errorCode));
    }
}
