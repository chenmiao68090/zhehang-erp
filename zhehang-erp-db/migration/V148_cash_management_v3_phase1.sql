-- =============================================================================
-- V148 收款管理 V3 第一阶段
-- 目标:
--   1) 保留 fin_cash_journal 作为真实到账唯一事实,拆分记录/核销/审核/异常状态;
--   2) 为异常闭环、操作留痕和日结核对增加独立表;
--   3) 扩展核销审计与幂等字段,允许核销到回款续费应收;
--   4) 保留历史回款续费实收为 legacy 基线,新实收全部关联收款日记账。
-- 安全:
--   - 不删除、不重命名旧列和旧表;
--   - 所有新增列/索引/表均幂等;
--   - 旧 status 继续由应用兼容回写;
--   - 仅在首次新增状态列时回填历史状态,重复执行不会覆盖新业务状态。
-- =============================================================================

DROP PROCEDURE IF EXISTS upgrade_cash_management_v3;
DELIMITER //
CREATE PROCEDURE upgrade_cash_management_v3()
BEGIN
  DECLARE v_first_status_upgrade TINYINT DEFAULT 0;
  DECLARE v_first_legacy_upgrade TINYINT DEFAULT 0;

  -- fin_cash_journal:五轴状态与责任/审核痕迹 -------------------------------
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'record_status') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `record_status` VARCHAR(16) NOT NULL DEFAULT 'active' COMMENT '记录状态:active/void' AFTER `status`;
    SET v_first_status_upgrade = 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'match_status') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `match_status` VARCHAR(16) NOT NULL DEFAULT 'waiting' COMMENT '核销状态:waiting/partial/matched' AFTER `record_status`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'review_status') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `review_status` VARCHAR(16) NOT NULL DEFAULT 'draft' COMMENT '审核状态:draft/pending/approved/rejected/reversed' AFTER `match_status`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'exception_status') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `exception_status` VARCHAR(16) NOT NULL DEFAULT 'none' COMMENT '异常状态:none/pending/processing/resolved' AFTER `review_status`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'fund_nature') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `fund_nature` VARCHAR(32) NOT NULL DEFAULT 'unknown' COMMENT '资金性质:business/prepayment/deposit/intercompany/refund_return/unknown/other' AFTER `exception_status`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'owner_id') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `owner_id` BIGINT DEFAULT NULL COMMENT '处理负责人用户ID' AFTER `fund_nature`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'owner_name') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `owner_name` VARCHAR(64) DEFAULT NULL COMMENT '处理负责人姓名快照' AFTER `owner_id`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'owner_dept_id') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `owner_dept_id` BIGINT DEFAULT NULL COMMENT '处理负责人部门ID' AFTER `owner_name`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'source_type') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `source_type` VARCHAR(16) NOT NULL DEFAULT 'manual' COMMENT '来源:manual/paste/excel/csv/bank/receivable' AFTER `owner_dept_id`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'submitted_by') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `submitted_by` BIGINT DEFAULT NULL COMMENT '提交审核人' AFTER `source_type`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'submitted_at') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `submitted_at` DATETIME DEFAULT NULL COMMENT '提交审核时间' AFTER `submitted_by`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'review_remark') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `review_remark` VARCHAR(500) DEFAULT NULL COMMENT '审核/驳回意见' AFTER `reviewed_at`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'reverse_review_by') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `reverse_review_by` BIGINT DEFAULT NULL COMMENT '反审核人' AFTER `review_remark`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'reverse_review_at') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `reverse_review_at` DATETIME DEFAULT NULL COMMENT '反审核时间' AFTER `reverse_review_by`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'reverse_review_reason') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `reverse_review_reason` VARCHAR(500) DEFAULT NULL COMMENT '反审核原因' AFTER `reverse_review_at`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'version') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本' AFTER `reverse_review_reason`;
  END IF;

  IF v_first_status_upgrade = 1 THEN
    UPDATE `fin_cash_journal`
       SET `record_status` = CASE WHEN `status` = 'void' THEN 'void' ELSE 'active' END,
           `match_status` = CASE
             WHEN COALESCE(`matched_amount`, 0) <= 0 THEN 'waiting'
             WHEN COALESCE(`matched_amount`, 0) >= COALESCE(`amount`, 0) THEN 'matched'
             ELSE 'partial' END,
           `review_status` = CASE WHEN `status` = 'reviewed' THEN 'approved' ELSE 'draft' END,
           `exception_status` = 'none',
           `fund_nature` = CASE
             WHEN `status` IN ('matched', 'reviewed') OR COALESCE(`matched_amount`, 0) > 0 THEN 'business'
             ELSE 'unknown' END,
           `owner_id` = COALESCE(`owner_id`, `create_by`),
           `source_type` = CASE WHEN `import_batch_no` IS NULL THEN 'manual' ELSE 'import' END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND INDEX_NAME = 'idx_fin_cj_v3_status') THEN
    ALTER TABLE `fin_cash_journal`
      ADD INDEX `idx_fin_cj_v3_status` (`record_status`, `match_status`, `review_status`, `exception_status`);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND INDEX_NAME = 'idx_fin_cj_owner') THEN
    ALTER TABLE `fin_cash_journal` ADD INDEX `idx_fin_cj_owner` (`owner_id`, `owner_dept_id`);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND INDEX_NAME = 'idx_fin_cj_review') THEN
    ALTER TABLE `fin_cash_journal` ADD INDEX `idx_fin_cj_review` (`review_status`, `submitted_at`);
  END IF;

  -- fin_cash_match:有效/取消、推荐快照、幂等与应收关联 -----------------------
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'match_status') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `match_status` VARCHAR(16) NOT NULL DEFAULT 'active' COMMENT '核销记录状态:active/cancelled' AFTER `matched_amount`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'match_method') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `match_method` VARCHAR(16) NOT NULL DEFAULT 'manual' COMMENT '核销方式:manual/recommended/import/receivable' AFTER `match_status`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'confidence_score') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `confidence_score` INT DEFAULT NULL COMMENT '推荐置信度快照0-100' AFTER `match_method`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'confidence_reason_json') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `confidence_reason_json` TEXT COMMENT '推荐理由JSON快照' AFTER `confidence_score`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'request_no') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `request_no` VARCHAR(64) DEFAULT NULL COMMENT '客户端幂等请求号' AFTER `confidence_reason_json`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'cancelled_by') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `cancelled_by` BIGINT DEFAULT NULL COMMENT '反核销人' AFTER `matched_at`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'cancelled_at') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `cancelled_at` DATETIME DEFAULT NULL COMMENT '反核销时间' AFTER `cancelled_by`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND COLUMN_NAME = 'cancel_reason') THEN
    ALTER TABLE `fin_cash_match`
      ADD COLUMN `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '反核销原因' AFTER `cancelled_at`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND INDEX_NAME = 'idx_fin_cm_active_target') THEN
    ALTER TABLE `fin_cash_match`
      ADD INDEX `idx_fin_cm_active_target` (`biz_type`, `biz_id`, `match_status`);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_match'
                   AND INDEX_NAME = 'uk_fin_cm_request_target') THEN
    ALTER TABLE `fin_cash_match`
      ADD UNIQUE INDEX `uk_fin_cm_request_target` (`tenant_id`, `request_no`, `biz_type`, `biz_id`);
  END IF;

  -- 回款续费:保存历史实收基线,新款由 active cash match 聚合 -----------------
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_receivable_renewal'
                   AND COLUMN_NAME = 'legacy_received_amount') THEN
    ALTER TABLE `fin_receivable_renewal`
      ADD COLUMN `legacy_received_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'V3上线前历史实收基线' AFTER `received_amount`;
    SET v_first_legacy_upgrade = 1;
  END IF;
  IF v_first_legacy_upgrade = 1 THEN
    UPDATE `fin_receivable_renewal`
       SET `legacy_received_amount` = COALESCE(`received_amount`, 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_receivable_collection_log'
                   AND COLUMN_NAME = 'cash_journal_id') THEN
    ALTER TABLE `fin_receivable_collection_log`
      ADD COLUMN `cash_journal_id` BIGINT DEFAULT NULL COMMENT '关联真实收款日记账ID' AFTER `receivable_id`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_receivable_collection_log'
                   AND COLUMN_NAME = 'cash_match_id') THEN
    ALTER TABLE `fin_receivable_collection_log`
      ADD COLUMN `cash_match_id` BIGINT DEFAULT NULL COMMENT '关联核销记录ID' AFTER `cash_journal_id`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_receivable_collection_log'
                   AND COLUMN_NAME = 'source_type') THEN
    ALTER TABLE `fin_receivable_collection_log`
      ADD COLUMN `source_type` VARCHAR(16) NOT NULL DEFAULT 'legacy' COMMENT '来源:legacy/cash_journal/reversal' AFTER `cash_match_id`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_receivable_collection_log'
                   AND INDEX_NAME = 'idx_fin_rr_log_cash') THEN
    ALTER TABLE `fin_receivable_collection_log`
      ADD INDEX `idx_fin_rr_log_cash` (`cash_journal_id`, `cash_match_id`);
  END IF;
END //
DELIMITER ;
CALL upgrade_cash_management_v3();
DROP PROCEDURE IF EXISTS upgrade_cash_management_v3;

-- 异常当前状态 ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fin_cash_exception_case` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `case_no` VARCHAR(32) NOT NULL COMMENT '异常编号',
  `journal_id` BIGINT DEFAULT NULL COMMENT '关联收款日记账ID',
  `daily_close_id` BIGINT DEFAULT NULL COMMENT '关联日结ID',
  `exception_type` VARCHAR(32) NOT NULL COMMENT '异常类型',
  `priority` VARCHAR(8) NOT NULL DEFAULT 'P1' COMMENT '优先级:P0/P1/P2',
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending' COMMENT '状态:pending/processing/resolved',
  `source_type` VARCHAR(16) NOT NULL DEFAULT 'manual' COMMENT '来源:manual/system/import/daily_close',
  `owner_id` BIGINT DEFAULT NULL COMMENT '异常负责人用户ID',
  `owner_name` VARCHAR(64) DEFAULT NULL COMMENT '负责人姓名快照',
  `owner_dept_id` BIGINT DEFAULT NULL COMMENT '负责人部门ID',
  `next_action` VARCHAR(500) DEFAULT NULL COMMENT '下一步动作',
  `next_follow_up_time` DATETIME DEFAULT NULL COMMENT '下次跟进时间',
  `latest_note` VARCHAR(1000) DEFAULT NULL COMMENT '最新处理说明',
  `resolution` VARCHAR(1000) DEFAULT NULL COMMENT '解决结果',
  `resolved_by` BIGINT DEFAULT NULL COMMENT '解决人',
  `resolved_at` DATETIME DEFAULT NULL COMMENT '解决时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_ce_case_no` (`case_no`),
  UNIQUE KEY `uk_fin_ce_journal` (`tenant_id`, `journal_id`),
  KEY `idx_fin_ce_daily_close` (`daily_close_id`),
  KEY `idx_fin_ce_status_owner` (`status`, `owner_id`, `next_follow_up_time`),
  KEY `idx_fin_ce_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款异常案件当前状态';

-- 异常不可覆盖事件 -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fin_cash_exception_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `case_id` BIGINT NOT NULL COMMENT '异常案件ID',
  `action_type` VARCHAR(32) NOT NULL COMMENT '动作:create/claim/transfer/progress/resolve/reopen',
  `from_status` VARCHAR(16) DEFAULT NULL COMMENT '变更前状态',
  `to_status` VARCHAR(16) DEFAULT NULL COMMENT '变更后状态',
  `content` VARCHAR(1000) NOT NULL COMMENT '处理内容',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作人',
  `operator_name` VARCHAR(64) DEFAULT NULL COMMENT '操作人姓名快照',
  `action_time` DATETIME NOT NULL COMMENT '动作时间',
  `metadata_json` TEXT COMMENT '附件/字段变化JSON',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_fin_cee_case_time` (`case_id`, `action_time`),
  KEY `idx_fin_cee_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款异常处理事件';

-- 收款高风险动作事件 ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fin_cash_journal_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `journal_id` BIGINT NOT NULL COMMENT '收款日记账ID',
  `event_type` VARCHAR(32) NOT NULL COMMENT '动作:create/update/match/cancel_match/submit/review/reject/reverse/void',
  `from_status` VARCHAR(32) DEFAULT NULL COMMENT '动作前组合状态',
  `to_status` VARCHAR(32) DEFAULT NULL COMMENT '动作后组合状态',
  `content` VARCHAR(1000) NOT NULL COMMENT '动作说明',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作人',
  `operator_name` VARCHAR(64) DEFAULT NULL COMMENT '操作人姓名快照',
  `event_time` DATETIME NOT NULL COMMENT '动作时间',
  `metadata_json` TEXT COMMENT '字段变化/关联ID JSON',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_fin_cje_journal_time` (`journal_id`, `event_time`),
  KEY `idx_fin_cje_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款日记账业务事件';

-- 日结头表 -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fin_cash_daily_close` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `close_date` DATE NOT NULL COMMENT '日结日期',
  `status` VARCHAR(16) NOT NULL DEFAULT 'open' COMMENT '状态:open/submitted/closed/reopened',
  `system_count` INT NOT NULL DEFAULT 0 COMMENT '系统到账笔数',
  `system_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '系统到账金额',
  `actual_count` INT NOT NULL DEFAULT 0 COMMENT '实际入账笔数',
  `actual_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '实际入账金额',
  `difference_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '差异=实际-系统',
  `difference_reason` VARCHAR(1000) DEFAULT NULL COMMENT '差异原因',
  `submitted_by` BIGINT DEFAULT NULL COMMENT '提交人',
  `submitted_at` DATETIME DEFAULT NULL COMMENT '提交时间',
  `closed_by` BIGINT DEFAULT NULL COMMENT '关闭人',
  `closed_at` DATETIME DEFAULT NULL COMMENT '关闭时间',
  `reopened_by` BIGINT DEFAULT NULL COMMENT '重开人',
  `reopened_at` DATETIME DEFAULT NULL COMMENT '重开时间',
  `reopen_reason` VARCHAR(500) DEFAULT NULL COMMENT '重开原因',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cdc_date` (`tenant_id`, `close_date`),
  KEY `idx_fin_cdc_status` (`status`, `close_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款日结';

-- 日结账户明细 ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fin_cash_daily_close_account` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `close_id` BIGINT NOT NULL COMMENT '日结ID',
  `account_name` VARCHAR(64) NOT NULL COMMENT '收款账户',
  `system_count` INT NOT NULL DEFAULT 0 COMMENT '系统到账笔数',
  `system_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '系统到账金额',
  `actual_count` INT NOT NULL DEFAULT 0 COMMENT '实际入账笔数',
  `actual_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '实际入账金额',
  `difference_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '差异=实际-系统',
  `difference_reason` VARCHAR(500) DEFAULT NULL COMMENT '账户差异原因',
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending' COMMENT '状态:matched/difference/resolved',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cdca_close_account` (`close_id`, `account_name`),
  KEY `idx_fin_cdca_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款日结账户核对明细';

