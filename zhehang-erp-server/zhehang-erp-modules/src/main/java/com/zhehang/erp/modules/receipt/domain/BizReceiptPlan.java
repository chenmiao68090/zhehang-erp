package com.zhehang.erp.modules.receipt.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 收款计划实体(分期)
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_receipt_plan")
public class BizReceiptPlan extends BaseEntity {
    /** 订单ID */
    private Long orderId;
    /** 期数 */
    private Integer period;
    /** 计划金额 */
    private BigDecimal planAmount;
    /** 已收金额 */
    private BigDecimal paidAmount;
    /** 计划收款日期 */
    private LocalDate planDate;
    /** 实际收款日期 */
    private LocalDate paidDate;
    /** 状态(1未收 2部分收款 3已收齐 4逾期) */
    private Integer status;
    /** 备注 */
    private String remark;
}
