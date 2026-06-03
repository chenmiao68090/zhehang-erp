package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 客户交接单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_task_handover")
public class BizTaskHandover extends BaseEntity {
    /** 交接单号 */
    private String handoverNo;
    /** 客户ID */
    private Long customerId;
    /** 客户名称 */
    private String customerName;
    /** 关联订单ID */
    private Long orderId;
    /** 移交方ID(销售) */
    private Long fromUserId;
    /** 移交方姓名 */
    private String fromUserName;
    /** 接收方ID(交付/客服) */
    private Long toUserId;
    /** 接收方姓名 */
    private String toUserName;
    /** 状态(1待接收 2进行中 3已完成 4已退回) */
    private Integer status;
    /** 完成时间 */
    private LocalDateTime completeTime;
    /** 备注 */
    private String remark;
}
