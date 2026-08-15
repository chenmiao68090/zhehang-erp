package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 已接入字段目录的统一后端值守卫。
 *
 * <p>当前租户已经建立字典类型时，只接受该租户当前启用的稳定值；类型尚未配置或
 * V235 两张字典表尚未建立时，才使用随版本发布的白名单。编辑时语义上未改变的
 * 历史停用/未知值原样保留，避免治理上线后把存量记录锁死。</p>
 */
@Service
@RequiredArgsConstructor
public class GovernedFieldValueValidator {

    public static final String CRM_CONSULT_BUSINESS = "crm_consult_business";
    public static final String MEMO_CATEGORY = "memo_category";
    public static final String HR_LABOR_CONTRACT_TYPE = "hr_labor_contract_type";

    private final SettingsGovernanceCatalog catalog;
    private final ISysDictTypeService dictTypeService;
    private final ISysDictDataService dictDataService;

    /** 校验新增记录提交值；返回可安全落库的去首尾空白值。 */
    public String validateNewValue(String dictType, String fieldName, String submitted, boolean multiValue) {
        if (submitted == null) {
            return null;
        }
        List<String> values = multiValue ? uniqueTokens(submitted) : List.of(submitted.trim());
        String normalized = multiValue ? String.join(",", values) : submitted.trim();
        if (!StringUtils.hasText(normalized)) {
            return normalized;
        }
        validateStorageLength(dictType, fieldName, normalized, multiValue);
        validateEnabled(dictType, fieldName, values);
        return normalized;
    }

    /**
     * 校验编辑提交值。null 表示补丁未提交该字段；语义未改变时返回数据库旧原文，
     * 不因去空白或逗号格式化静默改写历史值。
     */
    public String validateChangedValue(String dictType, String fieldName,
                                       String oldValue, String submitted, boolean multiValue) {
        if (submitted == null) {
            return null;
        }
        if (!multiValue) {
            String normalizedNew = submitted.trim();
            String normalizedOld = oldValue == null ? null : oldValue.trim();
            if (Objects.equals(normalizedOld, normalizedNew)) {
                return oldValue;
            }
            if (!StringUtils.hasText(normalizedNew)) {
                return normalizedNew;
            }
            validateStorageLength(dictType, fieldName, normalizedNew, false);
            validateEnabled(dictType, fieldName, List.of(normalizedNew));
            return normalizedNew;
        }

        List<String> oldTokens = tokens(oldValue);
        List<String> submittedTokens = tokens(submitted);
        if (oldTokens.equals(submittedTokens)) {
            return oldValue;
        }
        List<String> normalizedTokens = new LinkedHashSet<>(submittedTokens).stream().toList();
        String normalizedNew = String.join(",", normalizedTokens);
        if (!StringUtils.hasText(normalizedNew)) {
            return normalizedNew;
        }
        validateStorageLength(dictType, fieldName, normalizedNew, true);
        Set<String> oldTokenSet = new LinkedHashSet<>(oldTokens);
        List<String> addedTokens = normalizedTokens.stream()
                .filter(value -> !oldTokenSet.contains(value))
                .toList();
        validateEnabled(dictType, fieldName, addedTokens);
        return normalizedNew;
    }

    private void validateEnabled(String dictType, String fieldName, List<String> submittedValues) {
        if (submittedValues.isEmpty()) {
            return;
        }
        Set<String> enabledValues = enabledValues(dictType);
        for (String value : submittedValues) {
            if (!enabledValues.contains(value)) {
                throw new BusinessException(400,
                        fieldName + "包含未启用或不存在的值：" + value + "，请刷新字段选项后重试");
            }
        }
    }

    private void validateStorageLength(String dictType, String fieldName,
                                       String normalized, boolean multiValue) {
        Integer maxLength = catalog.storageValueMaxLength(dictType, multiValue);
        if (maxLength != null && normalized.length() > maxLength) {
            throw new BusinessException(400, fieldName + "不能超过" + maxLength + "个字符");
        }
    }

    private Set<String> enabledValues(String dictType) {
        List<String> fallback = catalog.fallbackValues(dictType);
        if (fallback.isEmpty()) {
            throw new BusinessException(400, "字段选项未在治理目录登记或不可维护");
        }
        try {
            SysDictType type = dictTypeService.getOne(new LambdaQueryWrapper<SysDictType>()
                    .eq(SysDictType::getDictType, dictType)
                    .last("LIMIT 1"));
            if (type == null) {
                return new LinkedHashSet<>(fallback);
            }
            if (type.getStatus() != null && type.getStatus() != 0) {
                return Set.of();
            }
            Set<String> enabled = new LinkedHashSet<>();
            for (SysDictData data : dictDataService.listByType(dictType)) {
                if (data != null && (data.getStatus() == null || data.getStatus() == 0)
                        && StringUtils.hasText(data.getDictValue())) {
                    enabled.add(data.getDictValue().trim());
                }
            }
            return enabled;
        } catch (BadSqlGrammarException ex) {
            if (!isMissingTable(ex)) {
                throw ex;
            }
            return new LinkedHashSet<>(fallback);
        }
    }

    private List<String> uniqueTokens(String value) {
        return new LinkedHashSet<>(tokens(value)).stream().toList();
    }

    private List<String> tokens(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        return Arrays.stream(value.split("[,，]", -1))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private boolean isMissingTable(BadSqlGrammarException ex) {
        return ex.getSQLException() != null && ex.getSQLException().getErrorCode() == 1146;
    }
}
