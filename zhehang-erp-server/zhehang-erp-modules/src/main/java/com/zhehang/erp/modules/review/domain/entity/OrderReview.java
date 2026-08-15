package com.zhehang.erp.modules.review.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper=true)
@TableName("biz_order_review")
public class OrderReview extends BaseEntity {
    private String reviewNo;
    private String orderType;
    private Long orderId;
    private String orderNo;
    private Long customerId;
    private String customerName;
    private String businessType;
    private BigDecimal receivableAmount;
    private BigDecimal receivedAmount;
    private Long salesUserId;
    private String salesName;
    private Long handlerUserId;
    private String handlerName;
    private Long deptId;
    private String currentNode;
    private String reviewStatus;
    private LocalDateTime deadline;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private String remark;
}
