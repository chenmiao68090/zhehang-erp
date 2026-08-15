-- =============================================================================
-- V47  合同续费阶梯处理状态表(把原前端 localStorage 侧挂的续费阶梯转为真后端)
-- 每个合同最多 6 条阶梯记录(60/45/30/15/7/0 天)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_contract_renew_stage` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)',
  `contract_id` BIGINT       NOT NULL                COMMENT '关联合同ID',
  `stage`       INT          NOT NULL                COMMENT '阶梯天数 60/45/30/15/7/0',
  `status`      VARCHAR(20)  DEFAULT 'pending'       COMMENT '处理状态 pending/done/overdue',
  `handler`     VARCHAR(64)  DEFAULT NULL            COMMENT '处理人',
  `note`        VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `handled_at`  DATETIME     DEFAULT NULL            COMMENT '处理时间',
  `create_time` DATETIME     DEFAULT NULL,
  `update_time` DATETIME     DEFAULT NULL,
  `create_by`   BIGINT       DEFAULT NULL,
  `update_by`   BIGINT       DEFAULT NULL,
  `deleted`     TINYINT      DEFAULT 0,
  `tenant_id`   BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_contract_stage` (`contract_id`, `stage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合同续费阶梯处理状态';
