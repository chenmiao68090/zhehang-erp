package com.zhehang.erp.modules.steward.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 管家体系·服务工单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_service_ticket")
public class BizServiceTicket extends BaseEntity {
    /** 关联签约客户ID(可空) */
    private Long clientId;
    /** 客户名称 */
    private String clientName;
    /** 工单类型(记账/报税/工商变更/资料补交/咨询/投诉/其他) */
    private String ticketType;
    /** 标题 */
    private String title;
    /** 描述 */
    private String description;
    /** 处理人 */
    private String handler;
    /** 优先级:高/中/低 */
    private String priority;
    /** 状态:pending待处理/doing处理中/done已完成 */
    private String status;
    /** 完成时间 */
    private LocalDateTime finishTime;
    /** 备注 */
    private String remark;
}
