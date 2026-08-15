-- =============================================================================
-- V152 收款管理 V3 第二阶段:效率、经营与对账治理
-- 1) 付款方别名由人工确认后参与推荐，冲突时不自动加权；
-- 2) 公共/个人保存视图后端持久化；
-- 3) 银行/微信/支付宝对账文件批次与逐行比对留痕；
-- 4) 系统通知补齐发送方、业务跳转和幂等事件号，并与 V151 IM outbox 联动；
-- 5) 不删除旧字段、不修改四类业务报单表，所有变更均幂等。
-- =============================================================================

DROP PROCEDURE IF EXISTS upgrade_cash_management_v3_phase2;
DELIMITER //
CREATE PROCEDURE upgrade_cash_management_v3_phase2()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND COLUMN_NAME = 'sender_name') THEN
    ALTER TABLE `sys_notification`
      ADD COLUMN `sender_name` VARCHAR(64) DEFAULT NULL COMMENT '业务通知发送方名称' AFTER `sender_id`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND COLUMN_NAME = 'link') THEN
    ALTER TABLE `sys_notification`
      ADD COLUMN `link` VARCHAR(500) DEFAULT NULL COMMENT '业务跳转路径' AFTER `sender_name`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND COLUMN_NAME = 'event_id') THEN
    ALTER TABLE `sys_notification`
      ADD COLUMN `event_id` VARCHAR(100) DEFAULT NULL COMMENT '通知幂等事件号' AFTER `link`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND INDEX_NAME = 'uk_sys_notification_event') THEN
    ALTER TABLE `sys_notification`
      ADD UNIQUE INDEX `uk_sys_notification_event` (`tenant_id`, `receiver_id`, `event_id`);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_receivable_collection_log'
                   AND INDEX_NAME = 'idx_fin_rr_log_legacy') THEN
    ALTER TABLE `fin_receivable_collection_log`
      ADD INDEX `idx_fin_rr_log_legacy` (`source_type`, `action_type`, `cash_journal_id`);
  END IF;
END//
DELIMITER ;
CALL upgrade_cash_management_v3_phase2();
DROP PROCEDURE IF EXISTS upgrade_cash_management_v3_phase2;

CREATE TABLE IF NOT EXISTS `fin_cash_payer_alias` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `payer_name_raw` VARCHAR(200) NOT NULL COMMENT '人工确认时的原始付款方',
  `payer_name_normalized` VARCHAR(200) NOT NULL COMMENT '标准化付款方，仅用于推荐和查重',
  `customer_id` BIGINT NOT NULL COMMENT 'CRM客户ID',
  `customer_name_snapshot` VARCHAR(200) NOT NULL COMMENT '客户名称快照',
  `status` VARCHAR(16) NOT NULL DEFAULT 'active' COMMENT 'active/conflict/disabled',
  `confidence` INT NOT NULL DEFAULT 100 COMMENT '人工确认置信度0-100',
  `confirmed_by` BIGINT NOT NULL COMMENT '确认人',
  `confirmed_at` DATETIME NOT NULL COMMENT '确认时间',
  `source_journal_id` BIGINT DEFAULT NULL COMMENT '来源收款ID',
  `last_used_at` DATETIME DEFAULT NULL COMMENT '最近命中时间',
  `use_count` INT NOT NULL DEFAULT 0 COMMENT '有效使用次数',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cpa_payer_customer` (`tenant_id`, `payer_name_normalized`, `customer_id`),
  KEY `idx_fin_cpa_payer_status` (`payer_name_normalized`, `status`),
  KEY `idx_fin_cpa_customer` (`customer_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款付款方人工确认别名';

CREATE TABLE IF NOT EXISTS `fin_cash_saved_view` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `view_name` VARCHAR(80) NOT NULL COMMENT '视图名称',
  `visibility` VARCHAR(16) NOT NULL DEFAULT 'personal' COMMENT 'personal/public',
  `owner_id` BIGINT NOT NULL COMMENT '个人视图用户ID，公共视图为0',
  `config_json` TEXT NOT NULL COMMENT '筛选、列显隐和分页配置JSON',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认视图',
  `sort_order` INT NOT NULL DEFAULT 100 COMMENT '排序',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_csv_owner_name` (`tenant_id`, `visibility`, `owner_id`, `view_name`),
  KEY `idx_fin_csv_list` (`visibility`, `owner_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款工作台保存视图';

CREATE TABLE IF NOT EXISTS `fin_cash_reconcile_batch` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `batch_no` VARCHAR(48) NOT NULL COMMENT '对账批次号',
  `request_no` VARCHAR(64) NOT NULL COMMENT '提交幂等号',
  `account_name` VARCHAR(64) NOT NULL COMMENT '系统收款账户',
  `statement_start` DATE DEFAULT NULL COMMENT '渠道文件最早日期',
  `statement_end` DATE DEFAULT NULL COMMENT '渠道文件最晚日期',
  `file_name` VARCHAR(255) DEFAULT NULL COMMENT '原文件名',
  `mapping_json` TEXT COMMENT '本次字段映射快照',
  `total_count` INT NOT NULL DEFAULT 0 COMMENT '有效入账行数',
  `matched_count` INT NOT NULL DEFAULT 0 COMMENT '自动准确匹配数',
  `suggested_count` INT NOT NULL DEFAULT 0 COMMENT '待人工确认数',
  `unmatched_count` INT NOT NULL DEFAULT 0 COMMENT '未匹配数',
  `conflict_count` INT NOT NULL DEFAULT 0 COMMENT '多候选冲突数',
  `ignored_count` INT NOT NULL DEFAULT 0 COMMENT '人工忽略数',
  `statement_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '文件入账金额',
  `matched_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '已确认匹配金额',
  `status` VARCHAR(20) NOT NULL DEFAULT 'needs_review' COMMENT 'matched/needs_review/resolved',
  `imported_by` BIGINT NOT NULL COMMENT '导入人',
  `imported_by_name` VARCHAR(64) DEFAULT NULL COMMENT '导入人快照',
  `imported_at` DATETIME NOT NULL COMMENT '导入时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_crb_batch` (`tenant_id`, `batch_no`),
  UNIQUE KEY `uk_fin_crb_request` (`tenant_id`, `request_no`),
  KEY `idx_fin_crb_account_time` (`account_name`, `imported_at`),
  KEY `idx_fin_crb_status` (`status`, `imported_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款渠道对账批次';

CREATE TABLE IF NOT EXISTS `fin_cash_reconcile_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `batch_id` BIGINT NOT NULL COMMENT '对账批次ID',
  `row_no` INT NOT NULL COMMENT '原文件行号',
  `transaction_date` DATE NOT NULL COMMENT '渠道入账日期',
  `transaction_time` DATETIME DEFAULT NULL COMMENT '渠道入账时间',
  `amount` DECIMAL(14,2) NOT NULL COMMENT '入账金额',
  `payer_name_raw` VARCHAR(200) DEFAULT NULL COMMENT '渠道付款方原文',
  `payer_name_normalized` VARCHAR(200) DEFAULT NULL COMMENT '标准化付款方',
  `bank_serial_no` VARCHAR(128) DEFAULT NULL COMMENT '渠道流水号',
  `summary` VARCHAR(500) DEFAULT NULL COMMENT '渠道摘要',
  `match_status` VARCHAR(16) NOT NULL COMMENT 'matched/suggested/unmatched/conflict/ignored',
  `journal_id` BIGINT DEFAULT NULL COMMENT '匹配收款日记账ID',
  `receipt_no_snapshot` VARCHAR(32) DEFAULT NULL COMMENT '收款编号快照',
  `match_rule` VARCHAR(64) DEFAULT NULL COMMENT '命中规则',
  `confidence_score` INT NOT NULL DEFAULT 0 COMMENT '比对分数0-100',
  `resolution` VARCHAR(32) DEFAULT NULL COMMENT 'auto/manual_link/ignored',
  `resolution_reason` VARCHAR(500) DEFAULT NULL COMMENT '人工处理原因',
  `resolved_by` BIGINT DEFAULT NULL COMMENT '处理人',
  `resolved_at` DATETIME DEFAULT NULL COMMENT '处理时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cri_batch_row` (`batch_id`, `row_no`),
  KEY `idx_fin_cri_batch_status` (`batch_id`, `match_status`),
  KEY `idx_fin_cri_serial` (`bank_serial_no`),
  KEY `idx_fin_cri_journal` (`journal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款渠道对账明细';
