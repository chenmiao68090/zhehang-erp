package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_reminder")
public class CrmReminder extends BaseEntity {
    /** 目标ID */
    private Long targetId;
    /** 目标类型 */
    private String targetType;
    /** 提醒类型 */
    private String reminderType;
    /** 提醒级别 */
    private String reminderLevel;
    /** 标题 */
    private String title;
    /** 内容 */
    private String content;
    /** 接收人ID */
    private Long recipientId;
    /** 接收人姓名 */
    private String recipientName;
    /** 抄送人IDs */
    private String ccUserIds;
    /** 发送时间 */
    private LocalDateTime sentTime;
    /** 阅读时间 */
    private LocalDateTime readTime;
    /** 状态(0未读 1已读) */
    private Integer status;
}
