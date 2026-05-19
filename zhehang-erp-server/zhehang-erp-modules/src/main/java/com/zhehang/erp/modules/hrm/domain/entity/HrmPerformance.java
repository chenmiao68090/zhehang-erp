package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_performance")
public class HrmPerformance extends BaseEntity {
    private Long employeeId;
    private String period;
    private Integer type;
    private BigDecimal score;
    private String level;
    private String selfEvaluation;
    private String leaderEvaluation;
    private Long evaluatorId;
    private Integer status;
}
