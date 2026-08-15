-- =============================================================================
-- V109  管家体系·服务交付(biz_service_delivery):按月跟踪每个签约客户各项服务的
--       交付状态(记账/报税等做了没)。可一键按客户服务项目生成当月待办。
--       id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_service_delivery` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `client_id` BIGINT DEFAULT NULL COMMENT '关联签约客户ID',
  `client_name` VARCHAR(200) DEFAULT NULL COMMENT '客户名称',
  `deliver_month` VARCHAR(7) DEFAULT NULL COMMENT '交付月份 YYYY-MM',
  `service_item` VARCHAR(60) DEFAULT NULL COMMENT '服务项目(记账/报税/工商/刻章等)',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '状态:pending待办/doing进行中/done已完成',
  `handler` VARCHAR(60) DEFAULT NULL COMMENT '处理人/管家',
  `finish_date` DATE DEFAULT NULL COMMENT '完成日期',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_sd_month` (`deliver_month`),
  KEY `idx_sd_client` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管家体系·月度服务交付';
