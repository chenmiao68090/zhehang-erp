-- =============================================================================
-- V138 财务日记账 / 收款登记模块
-- 目标:登记每一笔真实到账(收款日记账),再把款项核销到 4 张真实业务报单
--       (代账 biz_bookkeeping_order / 地址 biz_address_order / 工商 biz_gs_order / 刻章 biz_seal_order)。
-- 说明:1) 只新增表,不改这 4 张报单表结构;报单「已收/未收」动态聚合(= 该报单被匹配金额合计)算出。
--       2) 与 Codex 的回款续费(fin_receivable_renewal / menu 508)不共表、菜单错开(本模块 menu 509)。
--       3) 幂等:CREATE TABLE IF NOT EXISTS + INSERT IGNORE,重复执行安全。
-- =============================================================================

CREATE TABLE IF NOT EXISTS `fin_cash_journal` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `receipt_no` VARCHAR(32) NOT NULL COMMENT '收款编号(SK+yyyyMMdd+4位当日流水,唯一)',
  `receipt_date` DATE NOT NULL COMMENT '收款日期',
  `receipt_time` DATETIME DEFAULT NULL COMMENT '收款时间(精确到时分,可空)',
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '收款金额',
  `matched_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '已匹配(核销)金额',
  `unmatched_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '未匹配金额(= amount - matched_amount)',
  `payment_method` VARCHAR(32) DEFAULT NULL COMMENT '收款方式(自由文本:微信/支付宝/对公转账/现金等)',
  `receive_account` VARCHAR(64) DEFAULT NULL COMMENT '收款账户(自由文本)',
  `payer_name` VARCHAR(200) DEFAULT NULL COMMENT '付款方',
  `payer_phone` VARCHAR(32) DEFAULT NULL COMMENT '付款方电话(可空)',
  `customer_id` BIGINT DEFAULT NULL COMMENT '关联客户ID(crm_customer.id,可空)',
  `customer_name` VARCHAR(200) DEFAULT NULL COMMENT '客户名称快照(可空)',
  `summary` VARCHAR(255) DEFAULT NULL COMMENT '摘要',
  `bank_serial_no` VARCHAR(64) DEFAULT NULL COMMENT '银行流水号',
  `voucher_file` MEDIUMTEXT COMMENT '凭证附件 JSON 数组:[{fileId,fileName}]',
  `status` VARCHAR(16) NOT NULL DEFAULT 'waiting' COMMENT '状态:waiting待匹配/partial部分匹配/matched已匹配/reviewed已审核/void已作废',
  `remark` TEXT COMMENT '备注',
  `reviewed_by` BIGINT DEFAULT NULL COMMENT '审核人用户ID',
  `reviewed_at` DATETIME DEFAULT NULL COMMENT '审核时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人(登记人)',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cj_receipt_no` (`receipt_no`),
  KEY `idx_fin_cj_tenant` (`tenant_id`),
  KEY `idx_fin_cj_date` (`receipt_date`),
  KEY `idx_fin_cj_status` (`status`),
  KEY `idx_fin_cj_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款日记账';

CREATE TABLE IF NOT EXISTS `fin_cash_match` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `journal_id` BIGINT NOT NULL COMMENT '收款日记账ID(fin_cash_journal.id)',
  `biz_type` VARCHAR(16) NOT NULL COMMENT '报单类型:bookkeeping代账/address地址/gs工商/seal刻章',
  `biz_id` BIGINT NOT NULL COMMENT '报单在其表内的主键ID',
  `order_no` VARCHAR(64) DEFAULT NULL COMMENT '报单单号快照',
  `order_customer` VARCHAR(200) DEFAULT NULL COMMENT '报单客户名快照(可空)',
  `matched_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '本次匹配(核销)金额',
  `match_remark` VARCHAR(255) DEFAULT NULL COMMENT '匹配备注',
  `matched_by` BIGINT DEFAULT NULL COMMENT '匹配人用户ID',
  `matched_at` DATETIME DEFAULT NULL COMMENT '匹配时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除(反核销=1)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_fin_cm_journal` (`journal_id`),
  KEY `idx_fin_cm_biz` (`biz_type`, `biz_id`),
  KEY `idx_fin_cm_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款日记账与业务报单的匹配(核销)关系';

INSERT IGNORE INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (509, '收款日记账', 0, 25, '/cash-journal/index', 'finance/cash-journal', 'C', 1, 0, 'finance:cash-journal:list', 'notebook', 1, 1);

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 509
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'finance', 'finance_hq');
