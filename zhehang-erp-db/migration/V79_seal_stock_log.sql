-- =============================================================================
-- V79  印章库存调整日志表。每次入库/出库调整记一条,含事由(此前前端填了reason后端丢弃)。
-- id 必须 AUTO_INCREMENT(全局靠DB自增,漏了会插入报 Field 'id' doesn't have a default value)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_seal_stock_log` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `stock_id`    BIGINT       NOT NULL COMMENT '库存项ID',
  `item_name`   VARCHAR(128) DEFAULT NULL COMMENT '物料名(冗余,便于展示)',
  `delta`       INT          NOT NULL DEFAULT 0 COMMENT '变动量,正=入库 负=出库',
  `before_qty`  INT          DEFAULT NULL COMMENT '调整前数量',
  `after_qty`   INT          DEFAULT NULL COMMENT '调整后数量',
  `reason`      VARCHAR(255) DEFAULT NULL COMMENT '调整事由',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`   BIGINT       DEFAULT NULL COMMENT '操作人用户ID',
  `update_by`   BIGINT       DEFAULT NULL,
  `deleted`     TINYINT      NOT NULL DEFAULT 0,
  `tenant_id`   BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_stock_id` (`stock_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='印章库存调整日志';
