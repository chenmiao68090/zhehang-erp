package com.zhehang.erp.modules.channel.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 采购单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_procurement")
public class BizProcurement extends BaseEntity {
    /** 采购单号 */
    private String procurementNo;
    /** 供应商ID */
    private Long supplierId;
    /** 采购人员ID */
    private Long buyerId;
    /** 采购日期 */
    private LocalDate purchaseDate;
    /** 状态(draft/pending_approval/approved/paid/stocked/cancelled/rejected) */
    private String status;
    /** 采购数量 */
    private Integer quantity;
    /** 采购单价 */
    private BigDecimal unitPrice;
    /** 付款周期 */
    private String paymentCycle;
    /** 采购总金额 */
    private BigDecimal totalAmount;
    /** 实际付款金额 */
    private BigDecimal actualPaid;
    /** 挂靠地址明细 */
    private String addressDetail;
    /** 采购说明 */
    private String purchaseNote;
    /** 审批人ID */
    private Long approverId;
    /** 审批时间 */
    private LocalDateTime approvalTime;
    /** 审批意见 */
    private String approvalOpinion;
    /** 付款状态 */
    private String paymentStatus;
    /** 付款日期 */
    private LocalDate paymentDate;
    /** 付款凭证URL */
    private String paymentVoucherUrl;
    /** 供应商收款确认 */
    private Integer supplierConfirmed;
}
