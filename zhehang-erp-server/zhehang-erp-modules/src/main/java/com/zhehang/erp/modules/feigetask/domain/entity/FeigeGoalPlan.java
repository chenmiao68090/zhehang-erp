package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_goal_plan")
public class FeigeGoalPlan extends BaseEntity {
    private Long goalId;
    private String planName;
    private String planDesc;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal performanceTarget;
    private BigDecimal performanceActual;
    private BigDecimal bookkeepingTarget;
    private BigDecimal bookkeepingActual;
    private BigDecimal renewalTarget;
    private BigDecimal renewalActual;
    private Integer sortNo;
    private String status;
    @Version
    private Integer version;
}
