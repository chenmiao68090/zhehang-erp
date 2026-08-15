-- =============================================================================
-- V118  代账客户台账(fin_bookkeeping_ledger):会计体系(代理记账业务线)v1 核心表。
--       记录给「客户」按账期做账/报税的进度台账,区别于公司自己的财务(finance 线)。
--       id 走应用层雪花(ASSIGN_ID),不设 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `fin_bookkeeping_ledger` (
  `id` BIGINT NOT NULL COMMENT '主键(雪花ID)',
  `client_name` VARCHAR(200) NOT NULL COMMENT '客户名(代账客户公司名)',
  `client_id` BIGINT DEFAULT NULL COMMENT '关联客户ID(可空,预留关联 crm 客户)',
  `period` VARCHAR(7) NOT NULL COMMENT '账期(yyyy-MM,如 2026-06)',
  `bookkeeping_status` INT DEFAULT 0 COMMENT '记账状态(0待记账/1记账中/2已完成)',
  `tax_filing_status` INT DEFAULT 0 COMMENT '报税状态(0待申报/1已申报/2无需申报)',
  `accountant_id` BIGINT DEFAULT NULL COMMENT '负责会计的用户ID(=org_employee.user_id)',
  `accountant_name` VARCHAR(64) DEFAULT NULL COMMENT '负责会计姓名(冗余回显)',
  `amount` DECIMAL(12,2) DEFAULT NULL COMMENT '本期费用(可空)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_bkl_client` (`client_id`),
  KEY `idx_bkl_period` (`period`),
  KEY `idx_bkl_bk_status` (`bookkeeping_status`),
  KEY `idx_bkl_tax_status` (`tax_filing_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代账客户台账';
