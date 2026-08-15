-- =============================================================================
-- V54  财务联动时间线表(把原前端内存 timelineStore 转真后端,刷新不丢)
-- 记录收款确认/合同生成/退款各阶段等联动事件,按 receipt_id / order_id 查询。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_finance_timeline` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)',
  `receipt_id`  BIGINT       DEFAULT NULL            COMMENT '关联收款ID',
  `order_id`    BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `type`        VARCHAR(40)  DEFAULT NULL            COMMENT '事件类型(receipt_confirmed/refund_completed等)',
  `title`       VARCHAR(200) DEFAULT NULL            COMMENT '标题',
  `detail`      VARCHAR(500) DEFAULT NULL            COMMENT '详情',
  `operator`    VARCHAR(64)  DEFAULT NULL            COMMENT '操作人',
  `event_time`  DATETIME     DEFAULT NULL            COMMENT '事件时间',
  `create_time` DATETIME     DEFAULT NULL,
  `update_time` DATETIME     DEFAULT NULL,
  `create_by`   BIGINT       DEFAULT NULL,
  `update_by`   BIGINT       DEFAULT NULL,
  `deleted`     TINYINT      DEFAULT 0,
  `tenant_id`   BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_receipt` (`receipt_id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='财务联动时间线';
