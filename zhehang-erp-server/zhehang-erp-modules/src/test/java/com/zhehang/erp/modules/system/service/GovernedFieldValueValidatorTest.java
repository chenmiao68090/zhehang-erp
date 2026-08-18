package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.BadSqlGrammarException;

import java.sql.SQLException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GovernedFieldValueValidatorTest {

    @Mock
    private ISysDictTypeService dictTypeService;

    @Mock
    private ISysDictDataService dictDataService;

    private GovernedFieldValueValidator validator;

    @BeforeEach
    void setUp() {
        validator = new GovernedFieldValueValidator(
                new SettingsGovernanceCatalog(), dictTypeService, dictDataService);
    }

    @Test
    void missingTypeUsesVersionFallbackAndKeepsSealBusinessStableCode() {
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(null);

        assertThat(validator.validateNewValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "咨询业务", " 刻章业务 ", false)).isEqualTo("刻章业务");

        assertThatThrownBy(() -> validator.validateNewValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "咨询业务", "刻章", false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("未启用或不存在");
        verify(dictDataService, never()).listByType(any());
    }

    @Test
    void missingDictionaryTableFallsBackButOtherSqlErrorsStillFailClosed() {
        when(dictTypeService.getOne(any(Wrapper.class)))
                .thenThrow(sqlError(1146))
                .thenThrow(sqlError(1064));

        assertThat(validator.validateNewValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", "系统优化", false)).isEqualTo("系统优化");

        BadSqlGrammarException syntaxError = org.junit.jupiter.api.Assertions.assertThrows(
                BadSqlGrammarException.class,
                () -> validator.validateNewValue(
                        GovernedFieldValueValidator.MEMO_CATEGORY,
                        "备忘分类", "系统优化", false));
        assertThat((Throwable) syntaxError.getSQLException()).isNotNull();
        assertThat(syntaxError.getSQLException().getErrorCode()).isEqualTo(1064);
    }

    @Test
    void configuredTypeAcceptsOnlyCurrentEnabledValues() {
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(type(0));
        when(dictDataService.listByType(GovernedFieldValueValidator.MEMO_CATEGORY))
                .thenReturn(List.of(option("客户跟进", 0), option("旧分类", 1)));

        assertThat(validator.validateNewValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", "客户跟进", false)).isEqualTo("客户跟进");

        assertThatThrownBy(() -> validator.validateNewValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", "旧分类", false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("旧分类");
        assertThatThrownBy(() -> validator.validateNewValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", "其他租户分类", false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("其他租户分类");
    }

    @Test
    void disabledTypeRejectsEveryNewNonBlankValue() {
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(type(1));

        assertThatThrownBy(() -> validator.validateNewValue(
                GovernedFieldValueValidator.HR_LABOR_CONTRACT_TYPE,
                "劳动合同类型", "固定期限", false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("固定期限");
        verify(dictDataService, never()).listByType(any());
    }

    @Test
    void unchangedHistoricalUnknownOrDisabledValueIsPreservedWithoutDictionaryLookup() {
        String oldValue = " 旧分类 ";

        String result = validator.validateChangedValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", oldValue, "旧分类", false);

        assertSame(oldValue, result);
        verifyNoInteractions(dictTypeService, dictDataService);
    }

    @Test
    void changedMultiValueIsTrimmedTokenByTokenAndAnyUnknownTokenFails() {
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(type(0));
        when(dictDataService.listByType(GovernedFieldValueValidator.CRM_CONSULT_BUSINESS))
                .thenReturn(List.of(option("代账", 0), option("工商注册", 0), option("刻章业务", 0)));

        assertThat(validator.validateChangedValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "实际成交业务", "代账", " 代账， 工商注册 , 刻章业务 ", true))
                .isEqualTo("代账,工商注册,刻章业务");

        assertThatThrownBy(() -> validator.validateChangedValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "实际成交业务", "代账", "代账,任意业务", true))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("任意业务");
    }

    @Test
    void changedMultiValueValidatesOnlyNewTokensAndKeepsHistoricalUnknownToken() {
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(type(0));
        when(dictDataService.listByType(GovernedFieldValueValidator.CRM_CONSULT_BUSINESS))
                .thenReturn(List.of(option("工商注册", 0)));

        String result = validator.validateChangedValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "实际成交业务", "旧业务,代账", "旧业务，工商注册,工商注册", true);

        assertThat(result).isEqualTo("旧业务,工商注册");
    }

    @Test
    void multiValueCannotExceedDealBusinessPhysicalColumn() {
        String tooLong = "x".repeat(256);

        assertThatThrownBy(() -> validator.validateNewValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "实际成交业务", tooLong, true))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("255个字符");
        verifyNoInteractions(dictTypeService, dictDataService);
    }

    private SysDictType type(int status) {
        SysDictType type = new SysDictType();
        type.setStatus(status);
        return type;
    }

    private SysDictData option(String value, int status) {
        SysDictData data = new SysDictData();
        data.setDictValue(value);
        data.setStatus(status);
        return data;
    }

    private BadSqlGrammarException sqlError(int errorCode) {
        return new BadSqlGrammarException("field option query", "SELECT * FROM sys_dict_type",
                new SQLException("database error", "42000", errorCode));
    }
}
