package com.zhehang.erp.modules.project.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pm_milestone")
public class PmMilestone extends BaseEntity {
    private Long projectId;
    private String name;
    private LocalDate targetDate;
    private LocalDate actualDate;
    /** 状态（0未开始 1进行中 2已完成 3已延期） */
    private Integer status;
    private String description;
}
