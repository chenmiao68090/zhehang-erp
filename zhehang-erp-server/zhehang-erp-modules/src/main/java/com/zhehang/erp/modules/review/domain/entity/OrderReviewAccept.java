package com.zhehang.erp.modules.review.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper=true)
@TableName("biz_order_review_accept")
public class OrderReviewAccept extends BaseEntity {
    private Long reviewId;
    private Long orderId;
    private Long handlerUserId;
    private String handlerName;
    private Long deptId;
    private String deptName;
    private LocalDateTime acceptTime;
    private LocalDateTime expectedCompleteTime;
    private Integer materialsReady;
    private String acceptRemark;
}
