-- =============================================================================
-- V107  管家体系·服务工单(biz_service_ticket):客户的服务请求/任务。
--       类型/优先级/处理人/状态(待处理→处理中→已完成)。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_service_ticket` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `client_id` BIGINT DEFAULT NULL COMMENT '关联签约客户ID(可空)',
  `client_name` VARCHAR(200) DEFAULT NULL COMMENT '客户名称',
  `ticket_type` VARCHAR(32) DEFAULT NULL COMMENT '工单类型(记账/报税/工商变更/资料补交/咨询/投诉/其他)',
  `title` VARCHAR(200) DEFAULT NULL COMMENT '标题',
  `description` VARCHAR(1000) DEFAULT NULL COMMENT '描述',
  `handler` VARCHAR(60) DEFAULT NULL COMMENT '处理人',
  `priority` VARCHAR(8) DEFAULT '中' COMMENT '优先级:高/中/低',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '状态:pending待处理/doing处理中/done已完成',
  `finish_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_st_client` (`client_id`),
  KEY `idx_st_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管家体系·服务工单';
