package com.zhehang.erp.modules.project.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pm_timesheet")
public class PmTimesheet extends BaseEntity {
    private Long projectId;
    private Long taskId;
    private Long employeeId;
    private LocalDate workDate;
    private BigDecimal hours;
    private String description;
}
