package com.zhehang.erp.modules.project.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pm_task")
public class PmTask extends BaseEntity {
    private Long projectId;
    private Long parentId;
    private String name;
    private Long assigneeId;
    private LocalDate startDate;
    private LocalDate endDate;
    /** 优先级（1低 2中 3高 4紧急） */
    private Integer priority;
    /** 状态（0待办 1进行中 2待审核 3已完成 4已取消） */
    private Integer status;
    private Integer progress;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private String description;
    private Integer sort;
}
