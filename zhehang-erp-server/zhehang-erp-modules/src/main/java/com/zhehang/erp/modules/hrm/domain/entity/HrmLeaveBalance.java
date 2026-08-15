package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 员工假期额度(每人 × 每种带薪假期 一条),用于"没余额不让申请"。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_leave_balance")
public class HrmLeaveBalance extends BaseEntity {
    /** 员工ID */
    private Long employeeId;
    /** 假期类型(年假/育儿假/调休...,与请假类型文案一致) */
    private String leaveType;
    /** 额度总天数 */
    private Double totalDays;
    /** 已用天数 */
    private Double usedDays;
    /** 备注 */
    private String remark;
}
