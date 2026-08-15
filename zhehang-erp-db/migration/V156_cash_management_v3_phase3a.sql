-- =============================================================================
-- V156 收款管理 V3 阶段3A:资金账户、余额快照与推荐规则治理
-- 1) 保留 fin_cash_journal 为真实到账事实，仅增加可空账户ID；
-- 2) 账户余额按“期初 + 有效到账 + 有效调整”实时计算，不维护易漂移的缓存余额；
-- 3) 调整、冲正、余额快照和规则变更均保留独立审计记录；
-- 4) 不保存银行/支付平台密钥，不改四类业务报单表，不删除或覆盖历史业务数据；
-- 5) 所有新增表、列和索引均可重复执行。
-- =============================================================================

DROP PROCEDURE IF EXISTS upgrade_cash_management_v3_phase3a;
DELIMITER //
CREATE PROCEDURE upgrade_cash_management_v3_phase3a()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'cash_account_id') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `cash_account_id` BIGINT DEFAULT NULL COMMENT '资金账户ID，账户名称仍保留为历史快照' AFTER `receive_account`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND INDEX_NAME = 'idx_fin_cj_cash_account') THEN
    ALTER TABLE `fin_cash_journal`
      ADD INDEX `idx_fin_cj_cash_account` (`tenant_id`, `cash_account_id`, `receipt_date`, `record_status`);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND INDEX_NAME = 'idx_fin_cj_account_name') THEN
    ALTER TABLE `fin_cash_journal`
      ADD INDEX `idx_fin_cj_account_name` (`tenant_id`, `receive_account`, `receipt_date`, `record_status`);
  END IF;
END//
DELIMITER ;
CALL upgrade_cash_management_v3_phase3a();
DROP PROCEDURE IF EXISTS upgrade_cash_management_v3_phase3a;

CREATE TABLE IF NOT EXISTS `fin_cash_account` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `account_code` VARCHAR(48) NOT NULL COMMENT '系统账户编码',
  `account_name` VARCHAR(80) NOT NULL COMMENT '账户名称',
  `account_type` VARCHAR(16) NOT NULL COMMENT 'bank/wechat/alipay/cash/other',
  `institution_name` VARCHAR(100) DEFAULT NULL COMMENT '银行或支付机构名称',
  `masked_account_no` VARCHAR(80) DEFAULT NULL COMMENT '脱敏账号，仅保留尾号等展示信息',
  `currency` VARCHAR(8) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `opening_date` DATE NOT NULL COMMENT '余额起算日期',
  `opening_balance` DECIMAL(16,2) NOT NULL DEFAULT 0.00 COMMENT '期初余额',
  `status` VARCHAR(16) NOT NULL DEFAULT 'active' COMMENT 'active/disabled',
  `sort_order` INT NOT NULL DEFAULT 100 COMMENT '排序',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_ca_code` (`tenant_id`, `account_code`),
  UNIQUE KEY `uk_fin_ca_name` (`tenant_id`, `account_name`),
  KEY `idx_fin_ca_status_sort` (`tenant_id`, `status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款资金账户主档';

CREATE TABLE IF NOT EXISTS `fin_cash_account_adjustment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `adjustment_no` VARCHAR(48) NOT NULL COMMENT '调整编号',
  `request_no` VARCHAR(64) NOT NULL COMMENT '提交幂等号',
  `account_id` BIGINT NOT NULL COMMENT '资金账户ID',
  `account_name_snapshot` VARCHAR(80) NOT NULL COMMENT '账户名称快照',
  `adjustment_date` DATE NOT NULL COMMENT '调整入账日期',
  `adjustment_time` DATETIME NOT NULL COMMENT '实际登记时间',
  `direction` VARCHAR(8) NOT NULL COMMENT 'in/out',
  `adjustment_type` VARCHAR(24) NOT NULL COMMENT 'bank_fee/refund/correction/other',
  `amount` DECIMAL(16,2) NOT NULL COMMENT '绝对金额',
  `reason` VARCHAR(500) NOT NULL COMMENT '调整原因',
  `evidence_file` TEXT COMMENT '凭证附件JSON',
  `status` VARCHAR(16) NOT NULL DEFAULT 'active' COMMENT 'active/reversed',
  `reversal_of_id` BIGINT DEFAULT NULL COMMENT '本记录冲正的原调整ID',
  `reversal_id` BIGINT DEFAULT NULL COMMENT '冲正记录ID',
  `operator_id` BIGINT NOT NULL COMMENT '登记人',
  `operator_name` VARCHAR(64) DEFAULT NULL COMMENT '登记人快照',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_caa_no` (`tenant_id`, `adjustment_no`),
  UNIQUE KEY `uk_fin_caa_request` (`tenant_id`, `request_no`),
  KEY `idx_fin_caa_account_date` (`tenant_id`, `account_id`, `adjustment_date`, `status`),
  KEY `idx_fin_caa_reversal` (`reversal_of_id`, `reversal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资金账户余额调整与冲正';

CREATE TABLE IF NOT EXISTS `fin_cash_balance_snapshot` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `request_no` VARCHAR(64) NOT NULL COMMENT '提交幂等号',
  `account_id` BIGINT NOT NULL COMMENT '资金账户ID',
  `account_name_snapshot` VARCHAR(80) NOT NULL COMMENT '账户名称快照',
  `snapshot_date` DATE NOT NULL COMMENT '余额核对日期',
  `system_balance` DECIMAL(16,2) NOT NULL COMMENT '系统计算余额快照',
  `actual_balance` DECIMAL(16,2) NOT NULL COMMENT '银行/平台实际余额',
  `difference_amount` DECIMAL(16,2) NOT NULL COMMENT '差异=实际-系统',
  `source_type` VARCHAR(16) NOT NULL DEFAULT 'manual' COMMENT 'manual/import/api',
  `status` VARCHAR(16) NOT NULL COMMENT 'matched/difference/resolved',
  `difference_reason` VARCHAR(500) DEFAULT NULL COMMENT '差异原因',
  `evidence_file` TEXT COMMENT '余额凭证JSON',
  `submitted_by` BIGINT NOT NULL COMMENT '提交人',
  `submitted_by_name` VARCHAR(64) DEFAULT NULL COMMENT '提交人快照',
  `submitted_at` DATETIME NOT NULL COMMENT '提交时间',
  `resolved_by` BIGINT DEFAULT NULL COMMENT '解决人',
  `resolved_by_name` VARCHAR(64) DEFAULT NULL COMMENT '解决人快照',
  `resolved_at` DATETIME DEFAULT NULL COMMENT '解决时间',
  `resolution` VARCHAR(500) DEFAULT NULL COMMENT '解决结论',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cbs_request` (`tenant_id`, `request_no`),
  UNIQUE KEY `uk_fin_cbs_account_date` (`tenant_id`, `account_id`, `snapshot_date`),
  KEY `idx_fin_cbs_status_date` (`tenant_id`, `status`, `snapshot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资金账户余额核对快照';

CREATE TABLE IF NOT EXISTS `fin_cash_match_rule_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `config_name` VARCHAR(80) NOT NULL DEFAULT '默认推荐规则' COMMENT '规则名称',
  `customer_exact_weight` INT NOT NULL DEFAULT 50 COMMENT '客户精确匹配加分',
  `customer_conflict_penalty` INT NOT NULL DEFAULT 40 COMMENT '客户冲突扣分绝对值',
  `order_no_weight` INT NOT NULL DEFAULT 40 COMMENT '完整报单号匹配加分',
  `payer_alias_weight` INT NOT NULL DEFAULT 30 COMMENT '付款方确认别名加分',
  `payer_similar_weight` INT NOT NULL DEFAULT 20 COMMENT '付款方相似加分',
  `amount_exact_weight` INT NOT NULL DEFAULT 15 COMMENT '金额精确匹配加分',
  `amount_near_weight` INT NOT NULL DEFAULT 8 COMMENT '金额接近加分',
  `sales_weight` INT NOT NULL DEFAULT 5 COMMENT '销售姓名匹配加分',
  `date_weight` INT NOT NULL DEFAULT 3 COMMENT '日期窗口加分',
  `amount_tolerance_rate` DECIMAL(8,4) NOT NULL DEFAULT 0.0100 COMMENT '金额接近比例',
  `amount_tolerance_floor` DECIMAL(14,2) NOT NULL DEFAULT 1.00 COMMENT '金额接近最小容差',
  `date_window_days` INT NOT NULL DEFAULT 30 COMMENT '日期窗口天数',
  `high_threshold` INT NOT NULL DEFAULT 80 COMMENT '高置信度阈值',
  `medium_threshold` INT NOT NULL DEFAULT 60 COMMENT '中置信度阈值',
  `max_candidates` INT NOT NULL DEFAULT 200 COMMENT '最大候选数',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
  `update_reason` VARCHAR(500) DEFAULT NULL COMMENT '最近修改原因',
  `activated_by` BIGINT DEFAULT NULL COMMENT '最近启用人',
  `activated_at` DATETIME DEFAULT NULL COMMENT '最近启用时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cmrc_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款核销推荐规则配置';

CREATE TABLE IF NOT EXISTS `fin_cash_match_rule_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `config_id` BIGINT NOT NULL COMMENT '规则配置ID',
  `action_type` VARCHAR(16) NOT NULL COMMENT 'create/update/reset',
  `before_json` TEXT COMMENT '修改前规则快照',
  `after_json` TEXT NOT NULL COMMENT '修改后规则快照',
  `reason` VARCHAR(500) NOT NULL COMMENT '修改原因',
  `operator_id` BIGINT NOT NULL COMMENT '操作人',
  `operator_name` VARCHAR(64) DEFAULT NULL COMMENT '操作人快照',
  `action_time` DATETIME NOT NULL COMMENT '操作时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_fin_cmre_config_time` (`tenant_id`, `config_id`, `action_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款核销推荐规则变更事件';
