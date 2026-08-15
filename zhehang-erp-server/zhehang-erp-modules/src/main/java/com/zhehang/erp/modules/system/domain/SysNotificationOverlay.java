package com.zhehang.erp.modules.system.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 消息中心客户端属性叠加层(星标/稍后/归档/完成),每用户一行,存整块 overlay JSON。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_notification_overlay")
public class SysNotificationOverlay extends BaseEntity {
    /** 用户ID */
    private Long userId;
    /** 客户端属性叠加层(按消息id的JSON) */
    private String overlayJson;
}
