package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 备用金实体。对应前端 views/finance/petty-cash.vue;模式参照 BizChannelPartner。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_petty_cash")
public class FinPettyCash extends BaseEntity {
    /** 备用金单号 */
    private String cashNo;
    /** 申请人 */
    private String applicant;
    /** 部门 */
    private String dept;
    /** 申领金额 */
    private BigDecimal amount;
    /** 已归还金额 */
    private BigDecimal returnedAmount;
    /** 用途 */
    private String purpose;
    /** 申领日期 */
    private LocalDate applyDate;
    /** 约定归还日期 */
    private LocalDate returnDate;
    /** 状态(applied/confirmed/reviewing/returning/settled/overdue) */
    private String status;
    /** 当前处理人/角色 */
    private String ownerRole;
    /** 备注 */
    private String remark;
}
