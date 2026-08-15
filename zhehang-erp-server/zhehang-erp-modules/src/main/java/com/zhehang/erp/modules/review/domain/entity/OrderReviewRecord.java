package com.zhehang.erp.modules.review.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper=true)
@TableName("biz_order_review_record")
public class OrderReviewRecord extends BaseEntity {
    private Long reviewId;
    private Long orderId;
    private String orderType;
    private String nodeCode;
    private String nodeName;
    private String action;
    private String result;
    private Long operatorId;
    private String operatorName;
    private String opinion;
    private String attachments;
    private String beforeStatus;
    private String afterStatus;
    private LocalDateTime operatedAt;
}
