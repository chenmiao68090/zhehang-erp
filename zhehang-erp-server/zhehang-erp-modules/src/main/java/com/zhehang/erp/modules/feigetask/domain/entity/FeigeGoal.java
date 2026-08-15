package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_goal")
public class FeigeGoal extends BaseEntity {
    private String goalName;
    private String goalType;
    private Long roleId;
    private String roleName;
    private Long userId;
    private String userName;
    private Long ownerId;
    private Long deptId;
    private String periodKey;
    private String metricName;
    private BigDecimal targetValue;
    private BigDecimal actualValue;
    private Integer periodYear;
    private Integer periodIndex;
    private BigDecimal performanceTarget;
    private BigDecimal performanceActual;
    private BigDecimal bookkeepingTarget;
    private BigDecimal bookkeepingActual;
    private BigDecimal renewalTarget;
    private BigDecimal renewalActual;
    private String unit;
    private String status;
    private String goalDesc;
    private String completionNote;
    private Integer sortNo;
    @Version
    private Integer version;
}
