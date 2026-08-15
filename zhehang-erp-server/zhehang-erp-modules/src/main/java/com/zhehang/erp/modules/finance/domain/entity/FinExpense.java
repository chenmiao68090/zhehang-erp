package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/** 业务支出实体。对应前端 views/finance/expense.vue;模式参照 BizChannelPartner。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_expense")
public class FinExpense extends BaseEntity {
    /** 支出单据号 */
    private String expenseNo;
    /** 支出类别(marketing/delivery/rebate/admin/other) */
    private String category;
    /** 关联项目 */
    private String project;
    /** 支出金额 */
    private BigDecimal amount;
    /** 预算金额 */
    private BigDecimal budgetAmount;
    /** 计划付款日期 */
    private LocalDate payDate;
    /** 状态(approving/budget_review/pending_pay/approved/paid/rejected) */
    private String status;
    /** 负责人/角色 */
    private String ownerRole;
    /** 备注 */
    private String remark;
}
