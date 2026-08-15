-- 首页个人备忘录:每条备忘强制归属当前登录用户,用于首页方案2(右侧抽屉管理)
CREATE TABLE IF NOT EXISTS `dashboard_memo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `user_id` BIGINT NOT NULL COMMENT '所属用户ID',
  `content` VARCHAR(500) NOT NULL COMMENT '备忘内容',
  `remind_time` DATETIME DEFAULT NULL COMMENT '提醒/计划时间',
  `priority` TINYINT NOT NULL DEFAULT 2 COMMENT '优先级:1低 2普通 3重要',
  `category` VARCHAR(30) DEFAULT NULL COMMENT '分类',
  `completed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否完成',
  `completed_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除 0否1是',
  `tenant_id` BIGINT DEFAULT 1 COMMENT '租户',
  PRIMARY KEY (`id`),
  KEY `idx_dashboard_memo_user_time` (`tenant_id`, `user_id`, `completed`, `remind_time`),
  KEY `idx_dashboard_memo_user_update` (`tenant_id`, `user_id`, `update_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页个人备忘录';
