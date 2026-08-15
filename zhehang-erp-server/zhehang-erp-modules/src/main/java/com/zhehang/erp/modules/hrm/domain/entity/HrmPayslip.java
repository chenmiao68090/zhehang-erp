package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 薪酬核算·工资条(飞书建议 165/166/167/168)。
 * HR 端逐条/批量录入,发放后员工在自助端「签字确认」或「异常反馈」。
 * 与 hrm_salary(按考勤自动核算)并存,本表偏工资条明细 + 员工确认流。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_payslip")
public class HrmPayslip extends BaseEntity {
    /** 薪资月份(yyyy-MM,如2026-06) */
    private String payMonth;
    /** 员工ID(org_employee.id) */
    private Long employeeId;
    private String employeeName;
    private String deptName;
    private String postName;
    private String idCard;
    private String phone;
    private String bankCard;
    private LocalDate entryDate;
    private LocalDate regularDate;
    private LocalDate leaveDate;
    /** 事假(天) */
    private BigDecimal personalLeave;
    /** 病假(天) */
    private BigDecimal sickLeave;
    /** 其他带薪假(天) */
    private BigDecimal otherPaidLeave;
    /** 当月实际出勤天数 */
    private BigDecimal actualAttendanceDays;
    private BigDecimal baseSalary;
    private BigDecimal performanceSalary;
    /** 提成 */
    private BigDecimal commission;
    private BigDecimal bonus;
    /** 补发 */
    private BigDecimal reissue;
    /** 社保扣款 */
    private BigDecimal socialInsuranceDeduct;
    /** 公积金扣款 */
    private BigDecimal fundDeduct;
    /** 个税扣款 */
    private BigDecimal taxDeduct;
    /** 其他扣款 */
    private BigDecimal otherDeduct;
    /** 实发工资 */
    private BigDecimal netSalary;
    private String remark;
    /** 确认状态:0待发放/1已发放待确认/2员工已确认/3员工有异议 */
    private Integer confirmStatus;
    /** 员工确认时间 */
    private LocalDateTime confirmTime;
    /** 员工反馈/异议内容 */
    private String feedback;
}
