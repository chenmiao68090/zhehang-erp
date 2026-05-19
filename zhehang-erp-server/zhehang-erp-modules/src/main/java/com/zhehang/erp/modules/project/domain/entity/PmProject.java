package com.zhehang.erp.modules.project.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pm_project")
public class PmProject extends BaseEntity {
    private String name;
    private String code;
    private Integer type;
    private Long customerId;
    private Long managerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer status;
    private BigDecimal budget;
    private BigDecimal actualCost;
    private Integer progress;
    private String description;
}
