package com.zhehang.erp.modules.receipt.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 发票实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_invoice")
public class BizInvoice extends BaseEntity {
    /** 发票号 */
    private String invoiceNo;
    /** 关联订单ID */
    private Long orderId;
    /** 关联收款ID */
    private Long receiptId;
    /** 客户ID */
    private Long customerId;
    /** 客户名称 */
    private String customerName;
    /** 抬头 */
    private String title;
    /** 税号 */
    private String taxNo;
    /** 发票类型(general普通 special专用) */
    private String invoiceType;
    /** 金额 */
    private BigDecimal amount;
    /** 税额 */
    private BigDecimal taxAmount;
    /** 价税合计 */
    private BigDecimal totalAmount;
    /** 开票日期 */
    private LocalDate invoiceDate;
    /** 状态(1待开 2已开 3已邮寄 4已签收 5红冲) */
    private Integer status;
    /** 邮寄单号 */
    private String trackingNo;
    /** 备注 */
    private String remark;
}
