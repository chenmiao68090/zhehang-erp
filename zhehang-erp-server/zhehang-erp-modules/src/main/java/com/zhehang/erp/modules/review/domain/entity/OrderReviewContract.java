package com.zhehang.erp.modules.review.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper=true)
@TableName("biz_order_review_contract")
public class OrderReviewContract extends BaseEntity {
    private Long reviewId;
    private Long orderId;
    private Integer customerInfoOk;
    private String businessType;
    private String contractFile;
    private BigDecimal contractAmount;
    private String servicePeriod;
    private String salesRemark;
    private Long reviewerId;
    private String reviewerName;
    private LocalDateTime reviewTime;
    private String reviewResult;
    private String reviewRemark;
}
