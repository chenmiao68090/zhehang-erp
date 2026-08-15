-- =============================================================================
-- V108  管家体系·沟通记录(biz_steward_comm):与签约客户的沟通留痕。
--       方式(电话/微信/上门)/内容/时间/管家/下次跟进。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_steward_comm` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `client_id` BIGINT DEFAULT NULL COMMENT '关联签约客户ID(可空)',
  `client_name` VARCHAR(200) DEFAULT NULL COMMENT '客户名称',
  `comm_type` VARCHAR(16) DEFAULT NULL COMMENT '沟通方式(电话/微信/上门/其他)',
  `content` VARCHAR(1000) DEFAULT NULL COMMENT '沟通内容',
  `comm_time` DATETIME DEFAULT NULL COMMENT '沟通时间',
  `steward` VARCHAR(60) DEFAULT NULL COMMENT '负责管家',
  `next_follow` DATE DEFAULT NULL COMMENT '下次跟进日期',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_scm_client` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管家体系·沟通记录';
