package com.zhehang.erp.modules.receipt.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 收款记录实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_receipt")
public class BizReceipt extends BaseEntity {
    /** 收款单号 */
    private String receiptNo;
    /** 关联订单ID */
    private Long orderId;
    /** 关联收款计划ID */
    private Long planId;
    /** 客户ID */
    private Long customerId;
    /** 客户名称 */
    private String customerName;
    /** 归属销售ID(从订单继承,数据范围用) */
    private Long salesmanId;
    /** 归属部门ID(从订单继承,数据范围用) */
    private Long deptId;
    /** 收款金额 */
    private BigDecimal amount;
    /** 币种 */
    private String currency;
    /** 收款方式(bank银行 alipay支付宝 wechat微信 cash现金 other其他) */
    private String paymentMethod;
    /** 银行流水号 */
    private String bankSerial;
    /** 收款时间 */
    private LocalDateTime receiveTime;
    /** 确认人ID */
    private Long confirmerId;
    /** 确认时间 */
    private LocalDateTime confirmTime;
    /** 状态(1待确认 2已确认 3已退款) */
    private Integer status;
    /** 凭证附件 */
    private String voucher;
    /** 入账科目 */
    private String postingAccount;
    /** 入账人ID */
    private Long postingOperatorId;
    /** 入账时间 */
    private LocalDateTime postingTime;
    /** 备注 */
    private String remark;
}
