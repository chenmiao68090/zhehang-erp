package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_salary")
public class HrmSalary extends BaseEntity {
    private Long employeeId;
    private String salaryMonth;
    private BigDecimal baseSalary;
    private BigDecimal performanceBonus;
    private BigDecimal overtimePay;
    private BigDecimal allowance;
    private BigDecimal deduction;
    private BigDecimal socialInsurance;
    private BigDecimal housingFund;
    private BigDecimal tax;
    private BigDecimal actualSalary;
    private Integer status;
}
