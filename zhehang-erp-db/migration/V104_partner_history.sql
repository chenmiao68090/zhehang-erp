-- =============================================================================
-- V104  长期合作客户·历史合作记录(biz_partner_history):
--       按月记录 月度金额/是否结算/发票是否开具/结算凭证(可多张)/备注。
--       id 必须 AUTO_INCREMENT(全局靠DB自增)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_partner_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `partner_id` BIGINT NOT NULL COMMENT '所属长期客户ID',
  `coop_month` VARCHAR(7) DEFAULT NULL COMMENT '合作月份 YYYY-MM',
  `amount` DECIMAL(12,2) DEFAULT NULL COMMENT '月度金额',
  `settled` TINYINT DEFAULT 0 COMMENT '是否结算:1是 0否',
  `invoice_done` TINYINT DEFAULT 0 COMMENT '发票是否开具:1是 0否',
  `vouchers` TEXT DEFAULT NULL COMMENT '结算凭证 [{fileId,fileName}] JSON(可多张)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_ph_partner` (`partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='长期客户历史合作记录';
