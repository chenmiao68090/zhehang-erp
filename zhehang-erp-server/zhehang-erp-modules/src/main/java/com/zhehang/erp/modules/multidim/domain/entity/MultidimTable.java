package com.zhehang.erp.modules.multidim.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("multidim_table")
public class MultidimTable extends BaseEntity {
    /** 表格名称 */
    private String name;
    /** 描述 */
    private String description;
    /** 图标 */
    private String icon;
    /** 分类 */
    private String category;
    /** 字段定义JSON */
    private String fieldSchema;
    /** 视图配置JSON */
    private String viewConfig;
    /** 模板ID */
    private Long templateId;
}
