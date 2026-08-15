package com.zhehang.erp.modules.system.domain.vo;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** 字段匹配中心中的字段来源、消费位置和允许动作。 */
@Getter
@Builder
public class FieldDefinitionVO {
    private final String key;
    private final String name;
    private final String moduleCode;
    private final String moduleName;
    private final List<String> pageNames;
    private final List<String> pageRoutes;
    private final String storageField;
    private final String controlType;
    private final String sourceKind;
    private final String sourceName;
    private final String dictType;
    private final String valueType;
    private final String riskLevel;
    private final String integrationState;
    private final String editPolicy;
    private final String historyPolicy;
    private final boolean required;
    private final Integer optionCount;
    private final Integer usageCount;
    private final String manageRoute;
    private final String description;
    private final String warning;
    private final Integer sort;
}
