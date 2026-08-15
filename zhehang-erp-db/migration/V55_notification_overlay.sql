-- =============================================================================
-- V55  消息中心客户端属性(星标/稍后/归档/完成)落库
-- 原前端 localStorage overlay 转后端:每用户一行,存整块 overlay JSON,跨设备一致。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `sys_notification_overlay` (
  `id`           BIGINT     NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)',
  `user_id`      BIGINT     NOT NULL                COMMENT '用户ID',
  `overlay_json` LONGTEXT   DEFAULT NULL            COMMENT '客户端属性叠加层(按消息id的JSON)',
  `create_time`  DATETIME   DEFAULT NULL,
  `update_time`  DATETIME   DEFAULT NULL,
  `create_by`    BIGINT     DEFAULT NULL,
  `update_by`    BIGINT     DEFAULT NULL,
  `deleted`      TINYINT    DEFAULT 0,
  `tenant_id`    BIGINT     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_tenant` (`user_id`, `tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息中心客户端属性叠加层(每用户一行,唯一约束防并发重复)';
