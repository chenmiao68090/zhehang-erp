package com.zhehang.erp.modules.system.domain.vo;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/** 业务页面读取受控下拉项时的显式契约。 */
@Getter
@Builder
public class FieldOptionsVO {
    /** false 表示字典底座或该类型尚未配置，调用方才可以使用代码兜底。 */
    private final boolean configured;
    private final String dictType;
    private final String dictName;
    private final String editPolicy;
    private final String historyPolicy;
    private final List<OptionItem> items;

    @Getter
    @Builder
    public static class OptionItem {
        private final String label;
        private final String value;
        private final Integer sort;
        private final boolean defaultValue;
        private final boolean enabled;
    }
}
