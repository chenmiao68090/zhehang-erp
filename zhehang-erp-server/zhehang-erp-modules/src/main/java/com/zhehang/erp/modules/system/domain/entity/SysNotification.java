package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_notification")
public class SysNotification extends BaseEntity {
    /** 通知标题 */
    private String title;
    /** 通知内容 */
    private String content;
    /** 通知类型: system/approval/task/message */
    private String type;
    /** 是否已读: 0-未读 1-已读 */
    private Integer isRead;
    /** 接收用户ID */
    private Long userId;
    /** 发送者名称 */
    private String sender;
    /** 关联链接 */
    private String link;
}
