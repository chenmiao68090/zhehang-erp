package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_goal_plan_user")
public class FeigeGoalPlanUser extends BaseEntity {
    private Long planId;
    private Long goalId;
    private Long userId;
    private String userName;
    private Long deptId;
    private BigDecimal targetValue;
    private BigDecimal actualValue;
}
