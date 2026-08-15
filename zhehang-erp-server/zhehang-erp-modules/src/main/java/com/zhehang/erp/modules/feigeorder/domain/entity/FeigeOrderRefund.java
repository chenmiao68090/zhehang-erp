package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_order_refund")
public class FeigeOrderRefund extends BaseEntity {
    private Long orderId;
    private String orderNo;
    private String companyName;
    private BigDecimal refundAmount;
    private String reason;
    private String status;
    private String previousOrderStatus;
    private Long salesmanId;
    private String salesmanName;
    private Long deptId;
    private Long reviewerId;
    private String reviewerName;
    private LocalDateTime reviewTime;
    private String reviewComment;
    private LocalDateTime completedTime;
}
