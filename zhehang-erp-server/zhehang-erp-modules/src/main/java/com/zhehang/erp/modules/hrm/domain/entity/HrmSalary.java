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
    // 考勤信息(可从月度考勤汇总带入)
    private java.math.BigDecimal attendDays;
    private java.math.BigDecimal personalLeave;
    private java.math.BigDecimal sickLeave;
    private java.math.BigDecimal annualLeave;
    private java.math.BigDecimal otherPaidLeave;
    private java.math.BigDecimal calcDays;
    // 奖惩细分
    private java.math.BigDecimal backpay;
    private java.math.BigDecimal commission;
    private java.math.BigDecimal otherBonus;
    private java.math.BigDecimal attendDeduction;
    private java.math.BigDecimal otherDeduction;
    /** 备注(奖惩说明等) */
    private String remark;
}
