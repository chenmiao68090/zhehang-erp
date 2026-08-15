package com.zhehang.erp.modules.review.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper=true)
@TableName("biz_order_review_complete")
public class OrderReviewComplete extends BaseEntity {
    private Long reviewId;
    private Long orderId;
    private LocalDateTime completeTime;
    private String resultDesc;
    private String completeVoucher;
    private Long submitterId;
    private String submitterName;
    private Long confirmerId;
    private String confirmerName;
    private LocalDateTime confirmTime;
    private String completeRemark;
}
