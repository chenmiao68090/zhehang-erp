package com.zhehang.erp.modules.workflow.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 流程定义实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wf_process_def")
public class WfProcessDef extends BaseEntity {
    /** 流程名称 */
    private String name;
    /** 流程标识 */
    private String processKey;
    /** 流程分类 */
    private String category;
    /** 版本号 */
    private Integer version;
    /** 描述 */
    private String description;
    /** 发起卡片图标(Element Plus 图标组件名) */
    private String icon;
    /** 同分组内排序(小在前) */
    private Integer sort;
    /** 发起目录分组:attendance假勤/finance财务/admin行政/hr人事/biz业务/other其他 */
    private String groupName;
    /** 是否作为设计器"使用模板"的模板:0否 1是 */
    private Integer isTemplate;
    /** 表单配置（JSON） */
    private String formConfig;
    /** 流程配置（JSON） */
    private String processConfig;
    /** 状态（0草稿 1已发布 2已停用） */
    private Integer status;
}
