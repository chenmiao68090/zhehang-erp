package com.zhehang.erp.modules.workflow.domain.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 流程定义 VO
 */
@Data
public class WfProcessDefVO {
    private Long id;
    private String name;
    private String processKey;
    private String category;
    private Integer version;
    private String description;
    /** 发起卡片图标(Element Plus 图标组件名) */
    private String icon;
    /** 同分组内排序 */
    private Integer sort;
    /** 发起目录分组(attendance/finance/admin/hr/biz/other) */
    private String groupName;
    private String formConfig;
    private String processConfig;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
