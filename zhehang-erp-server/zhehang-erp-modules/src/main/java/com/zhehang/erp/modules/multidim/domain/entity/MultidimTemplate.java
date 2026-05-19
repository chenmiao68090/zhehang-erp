package com.zhehang.erp.modules.multidim.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("multidim_template")
public class MultidimTemplate extends BaseEntity {
    /** 模板名称 */
    private String name;
    /** 分类 */
    private String category;
    /** 图标 */
    private String icon;
    /** 描述 */
    private String description;
    /** 字段定义JSON */
    private String fieldSchema;
    /** 视图配置JSON */
    private String viewConfig;
}
