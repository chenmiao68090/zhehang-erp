package com.zhehang.erp.modules.review.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper=true)
@TableName("biz_order_review_payment")
public class OrderReviewPayment extends BaseEntity {
    private Long reviewId;
    private Long orderId;
    private BigDecimal receivableAmount;
    private BigDecimal receivedAmount;
    private LocalDate receivedDate;
    private String paymentMethod;
    private Long receiptId;
    private String receiptNo;
    private String voucher;
    private String payer;
    private Long confirmerId;
    private String confirmerName;
    private LocalDateTime confirmTime;
    private String financeRemark;
}
