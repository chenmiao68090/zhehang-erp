package com.zhehang.erp.modules.order.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 订单审批记录实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_order_approval")
public class BizOrderApproval extends BaseEntity {
    /** 订单ID */
    private Long orderId;
    /** 审批节点(submit submit_review approve reject finance_confirm cancel) */
    private String node;
    /** 审批人ID */
    private Long approverId;
    /** 审批人姓名 */
    private String approverName;
    /** 审批角色 */
    private String approverRole;
    /** 审批结果(approve通过 reject驳回) */
    private String result;
    /** 审批意见 */
    private String comment;
    /** 审批时间 */
    private LocalDateTime approveTime;
}
