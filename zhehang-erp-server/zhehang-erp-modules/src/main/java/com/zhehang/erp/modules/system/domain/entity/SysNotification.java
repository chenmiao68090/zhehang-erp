package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_notification")
public class SysNotification extends BaseEntity {
    /** 通知标题 */
    private String title;
    /** 通知内容 */
    private String content;
    /** 通知类型: 1-system, 2-approval, 3-task, 4-message */
    private Integer type;
    /** 是否已读: 0-未读 1-已读 */
    private Integer isRead;
    /** 阅读时间 */
    private LocalDateTime readTime;
    /** 接收用户ID */
    @TableField("receiver_id")
    private Long userId;
    /** 发送者名称 */
    @TableField("sender_name")
    private String sender;
    /** 关联链接 */
    private String link;
    /** 业务幂等事件号，同租户同收件人不重复。 */
    private String eventId;
}
