package com.zhehang.erp.modules.receipt.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 财务联动时间线事件(收款确认/合同生成/退款各阶段等)
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_finance_timeline")
public class BizFinanceTimeline extends BaseEntity {
    /** 关联收款ID */
    private Long receiptId;
    /** 关联订单ID */
    private Long orderId;
    /** 事件类型 */
    private String type;
    /** 标题 */
    private String title;
    /** 详情 */
    private String detail;
    /** 操作人 */
    private String operator;
    /** 事件时间 */
    private LocalDateTime eventTime;
}
