-- =====================================================================
-- V180 收款中心(阶段1):收款渠道 + 统一收款流水 + 导入批次
-- 定位:渠道原始流水层(上游)。每笔收款先进 fin_pay_transaction,
--      财务「认领」后调用收款登记服务生成 fin_company_journal 行(下游账本)。
--      不触碰 fin_cash_journal 核销体系(Codex 维护)。
-- 阶段2(微信/支付宝商户回调)复用本表:source=callback/bill,dedup_key=平台交易号。
-- 重复执行安全:CREATE TABLE IF NOT EXISTS + INSERT IGNORE
-- =====================================================================

CREATE TABLE IF NOT EXISTS `fin_pay_channel` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `channel_type` VARCHAR(20) NOT NULL COMMENT '渠道类型:wechat微信收款码/alipay支付宝/bank_qr银行收款码(一码通)/bank_account对公账户',
  `channel_name` VARCHAR(100) NOT NULL COMMENT '渠道名称(如:丰收一码通/浙杭微信)',
  `account_no` VARCHAR(100) DEFAULT NULL COMMENT '账号/商户号(对公填银行账号)',
  `receive_account` VARCHAR(50) DEFAULT NULL COMMENT '对应收款登记「收款账号」选项(丰收银联/浙杭微信等),认领时自动带入',
  `qr_file` TEXT COMMENT '收款码图片附件 JSON 数组[{fileId,fileName}]',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态:1启用 0停用',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序(小在前)',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT NULL,
  `update_time` DATETIME DEFAULT NULL,
  `create_by` BIGINT DEFAULT NULL,
  `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fin_pay_ch_type` (`channel_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款中心-收款渠道';

CREATE TABLE IF NOT EXISTS `fin_pay_transaction` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `channel_id` BIGINT DEFAULT NULL COMMENT '渠道id(fin_pay_channel)',
  `channel_type` VARCHAR(20) DEFAULT NULL COMMENT '渠道类型快照(冗余,便于筛选)',
  `channel_name` VARCHAR(100) DEFAULT NULL COMMENT '渠道名称快照',
  `amount` DECIMAL(12,2) NOT NULL COMMENT '金额(收入为正)',
  `pay_time` DATETIME NOT NULL COMMENT '支付/到账时间',
  `payer_name` VARCHAR(100) DEFAULT NULL COMMENT '付款方名称',
  `payer_account` VARCHAR(100) DEFAULT NULL COMMENT '付款方账号(尾号/账号)',
  `trade_no` VARCHAR(100) DEFAULT NULL COMMENT '交易单号/银行流水号(原文)',
  `dedup_key` VARCHAR(120) NOT NULL COMMENT '防重键:有单号取单号否则取内容摘要;唯一索引兜底;批次撤销时改写为 RB{id}#原键 以释放唯一索引',
  `source` VARCHAR(20) NOT NULL COMMENT '来源:manual手工补录/import对账单导入/callback实时回调(阶段2)/bill账单同步(阶段2)',
  `status` VARCHAR(20) NOT NULL DEFAULT 'unclaimed' COMMENT '状态:unclaimed待认领/claimed已认领/ignored不入账',
  `journal_id` BIGINT DEFAULT NULL COMMENT '认领生成的收款登记id(fin_company_journal)',
  `claim_by` BIGINT DEFAULT NULL COMMENT '认领人用户id',
  `claim_time` DATETIME DEFAULT NULL COMMENT '认领时间',
  `import_batch_id` BIGINT DEFAULT NULL COMMENT '导入批次id(fin_pay_import_batch)',
  `raw_data` TEXT COMMENT '原始数据(导入行原文/回调报文)',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注(转账留言等)',
  `create_time` DATETIME DEFAULT NULL,
  `update_time` DATETIME DEFAULT NULL,
  `create_by` BIGINT DEFAULT NULL,
  `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_pay_txn_dedup` (`dedup_key`),
  KEY `idx_fin_pay_txn_time` (`pay_time`),
  KEY `idx_fin_pay_txn_status` (`status`),
  KEY `idx_fin_pay_txn_channel` (`channel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款中心-统一收款流水';

CREATE TABLE IF NOT EXISTS `fin_pay_import_batch` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `channel_id` BIGINT DEFAULT NULL COMMENT '渠道id',
  `file_name` VARCHAR(200) DEFAULT NULL COMMENT '文件名/粘贴导入',
  `total_rows` INT NOT NULL DEFAULT 0 COMMENT '提交行数',
  `inserted_rows` INT NOT NULL DEFAULT 0 COMMENT '实际入库行数',
  `duplicate_rows` INT NOT NULL DEFAULT 0 COMMENT '重复跳过行数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'done' COMMENT 'done完成/rolled_back已撤销',
  `remark` VARCHAR(255) DEFAULT NULL,
  `create_time` DATETIME DEFAULT NULL,
  `update_time` DATETIME DEFAULT NULL,
  `create_by` BIGINT DEFAULT NULL,
  `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款中心-对账单导入批次';

-- 菜单:收款中心(挂在「收款管理」下,与收款登记 id=510 并列;权限串复用收款登记的,财务角色无需新授权)
INSERT IGNORE INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (511, '收款中心', 0, 27, '/cash-journal/center', 'finance/pay-center', 'C', 1, 0, 'finance:company-journal:list', 'money', 1, 1);

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 511
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'finance', 'finance_hq');

-- 渠道种子:按收款登记「收款账号」现有选项预建4类渠道(可在页面上改名/停用)
INSERT IGNORE INTO `fin_pay_channel`
  (`id`, `channel_type`, `channel_name`, `receive_account`, `status`, `sort`, `remark`, `create_by`, `tenant_id`)
VALUES
  (1, 'wechat',       '浙杭微信收款码', '浙杭扫码丨微信',   1, 10, '微信收款码(阶段2接商户号后自动入账)', 1, 1),
  (2, 'alipay',       '浙杭支付宝',     '浙杭扫码丨支付宝', 1, 20, '支付宝收款(阶段2接当面付后自动入账)', 1, 1),
  (3, 'bank_qr',      '丰收一码通',     '丰收银联丨扫码',   1, 30, '银行聚合收款码,对账单导入;银行侧接口谈妥后升级自动', 1, 1),
  (4, 'bank_account', '诚路对公(招商)', '诚路对公丨招商',   1, 40, '对公账户,网银流水导入', 1, 1),
  (5, 'bank_account', '浙杭对公(光大)', '浙杭对公丨光大',   1, 50, '对公账户,网银流水导入', 1, 1);
