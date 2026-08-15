package com.zhehang.erp.modules.receipt.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 退款审批单(申请→主管审批→财务确认)。
 * status: pending 待审批 / approved 主管已批待财务确认 / completed 财务已确认完成 / rejected 已驳回
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_refund_request")
public class BizRefundRequest extends BaseEntity {
    /** 退款单号 */
    private String refundNo;
    /** 关联收款ID */
    private Long receiptId;
    /** 关联订单ID */
    private Long orderId;
    /** 订单号(冗余展示) */
    private String orderNo;
    /** 客户名(冗余展示) */
    private String customerName;
    /** 退款金额 */
    private BigDecimal refundAmount;
    /** 退款原因key */
    private String reasonKey;
    /** 退款原因 */
    private String reason;
    /** 退款方式 origin/bank/cash... */
    private String refundWay;
    /** 申请时间 */
    private LocalDateTime applyTime;
    /** 申请人ID */
    private Long applicantId;
    /** 申请人名 */
    private String applicantName;
    /** 审批人(主管)ID */
    private Long approverId;
    /** 审批人(主管)名 */
    private String approverName;
    /** 主管审批时间 */
    private LocalDateTime approvalTime;
    /** 财务确认人ID */
    private Long financeConfirmerId;
    /** 财务确认人名 */
    private String financeConfirmerName;
    /** 财务确认时间 */
    private LocalDateTime financeConfirmTime;
    /** 状态 pending/approved/completed/rejected */
    private String status;
    /** 备注 */
    private String remark;
    /** 驳回原因 */
    private String rejectReason;
}
