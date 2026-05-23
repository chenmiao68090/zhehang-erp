package com.zhehang.erp.modules.multidim.domain.dto;

import lombok.Data;
import java.util.Map;

@Data
public class FieldDef {
    /** 字段ID */
    private String id;
    /** 字段名称 */
    private String name;
    /** 字段类型: text/number/date/select/multiselect/attachment/user/link/formula */
    private String type;
    /** 字段配置(如下拉选项、关联表等) */
    private Map<String, Object> config;
}
