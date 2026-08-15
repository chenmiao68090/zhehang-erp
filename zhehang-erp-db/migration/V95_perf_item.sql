-- =============================================================================
-- V95  绩效考核指标明细(每个考核任务下的逐项指标,来源于模板的 dimensions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_perf_item` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `task_id`         BIGINT       NOT NULL COMMENT '关联考核任务ID',
  `dimension`       VARCHAR(128) DEFAULT NULL COMMENT '考核指标名(如:工作业绩/工作态度)',
  `weight`          INT          DEFAULT 0 COMMENT '权重(%)',
  `target`          VARCHAR(500) DEFAULT NULL COMMENT '指标目标/说明',
  `self_score`      DECIMAL(6,2) DEFAULT NULL COMMENT '自评分',
  `self_comment`    VARCHAR(500) DEFAULT NULL COMMENT '自评说明',
  `manager_score`   DECIMAL(6,2) DEFAULT NULL COMMENT '上级评分',
  `manager_comment` VARCHAR(500) DEFAULT NULL COMMENT '上级评语',
  `create_by`       BIGINT       DEFAULT NULL,
  `update_by`       BIGINT       DEFAULT NULL,
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id`       BIGINT       DEFAULT NULL,
  `deleted`         TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绩效考核指标明细';
