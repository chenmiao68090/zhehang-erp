package com.zhehang.erp.modules.review.domain.vo;

import com.zhehang.erp.modules.review.domain.entity.*;
import lombok.Data;
import java.util.List;

/** 审单详情聚合:主表 + 四节点明细 + 流转时间线。 */
@Data
public class OrderReviewDetailVO {
    private OrderReview review;
    private OrderReviewContract contract;
    private OrderReviewPayment payment;
    private OrderReviewAccept accept;
    private OrderReviewComplete complete;
    private List<OrderReviewRecord> records;
}
