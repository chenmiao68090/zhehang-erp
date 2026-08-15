-- V151: 内部消息中心第二阶段 - 消息待办闭环、提醒与可靠通知
-- 说明:
-- 1. biz_task 继续作为原任务中心兼容镜像；以下 im_task_* 表保存消息来源、多人责任、提醒和时间线。
-- 2. 全部表显式带 tenant_id + company_id，接口仍需执行参与人/部门范围校验。
-- 3. 只新增结构，不删除或改写现有业务数据，可重复执行。

CREATE TABLE IF NOT EXISTS `im_task_detail` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `task_id` BIGINT NOT NULL COMMENT 'biz_task.id',
  `conversation_id` BIGINT NOT NULL,
  `source_message_id` BIGINT NOT NULL,
  `card_message_id` BIGINT DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `workflow_state` VARCHAR(24) NOT NULL DEFAULT 'pending_accept' COMMENT 'pending_accept/in_progress/pending_review/completed/rejected/cancelled',
  `priority` VARCHAR(16) NOT NULL DEFAULT 'normal' COMMENT 'urgent/important/normal',
  `dept_id` BIGINT DEFAULT NULL,
  `deadline_at` DATETIME(3) NOT NULL,
  `acceptance_standard` TEXT NOT NULL,
  `reminder_config_json` JSON DEFAULT NULL,
  `customer_id` BIGINT DEFAULT NULL,
  `business_type` VARCHAR(40) DEFAULT NULL,
  `business_id` BIGINT DEFAULT NULL,
  `creator_id` BIGINT NOT NULL,
  `reviewer_id` BIGINT NOT NULL,
  `result_text` TEXT DEFAULT NULL,
  `reject_reason` VARCHAR(1000) DEFAULT NULL,
  `accepted_at` DATETIME(3) DEFAULT NULL,
  `submitted_at` DATETIME(3) DEFAULT NULL,
  `completed_at` DATETIME(3) DEFAULT NULL,
  `cancelled_at` DATETIME(3) DEFAULT NULL,
  `overdue_at` DATETIME(3) DEFAULT NULL,
  `version` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_task_detail_company_task` (`company_id`, `task_id`),
  KEY `idx_im_task_detail_company_state_deadline` (`company_id`, `workflow_state`, `deadline_at`),
  KEY `idx_im_task_detail_tenant_conversation` (`tenant_id`, `conversation_id`, `created_at`),
  KEY `idx_im_task_detail_company_source` (`company_id`, `source_message_id`),
  KEY `idx_im_task_detail_company_business` (`company_id`, `business_type`, `business_id`),
  KEY `idx_im_task_detail_company_creator` (`company_id`, `creator_id`, `updated_at`),
  KEY `idx_im_task_detail_company_dept` (`company_id`, `dept_id`, `updated_at`),
  KEY `idx_im_task_detail_due_scan` (`overdue_at`, `deadline_at`, `workflow_state`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息待办扩展主表';

CREATE TABLE IF NOT EXISTS `im_task_participant` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `task_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `participant_role` VARCHAR(20) NOT NULL COMMENT 'responsible/collaborator',
  `participant_status` VARCHAR(20) NOT NULL DEFAULT 'assigned' COMMENT 'assigned/accepted/completed',
  `accepted_at` DATETIME(3) DEFAULT NULL,
  `completed_at` DATETIME(3) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_task_participant_company_task_user` (`company_id`, `task_id`, `user_id`),
  KEY `idx_im_task_participant_tenant_user_status` (`tenant_id`, `user_id`, `participant_status`),
  KEY `idx_im_task_participant_company_task_role` (`company_id`, `task_id`, `participant_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息待办责任人和协同人';

CREATE TABLE IF NOT EXISTS `im_task_timeline` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `task_id` BIGINT NOT NULL,
  `operator_id` BIGINT NOT NULL,
  `action_type` VARCHAR(32) NOT NULL,
  `from_state` VARCHAR(24) DEFAULT NULL,
  `to_state` VARCHAR(24) DEFAULT NULL,
  `comment` VARCHAR(2000) DEFAULT NULL,
  `snapshot_json` JSON DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_im_task_timeline_company_task_time` (`company_id`, `task_id`, `created_at`),
  KEY `idx_im_task_timeline_tenant_operator_time` (`tenant_id`, `operator_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息待办不可变处理时间线';

CREATE TABLE IF NOT EXISTS `im_task_reminder` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `task_id` BIGINT NOT NULL,
  `recipient_id` BIGINT NOT NULL,
  `reminder_type` VARCHAR(24) NOT NULL COMMENT 'before_30m/before_2h/before_1d/due/overdue_1h',
  `scheduled_at` DATETIME(3) NOT NULL,
  `event_id` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/queued/sent/failed/cancelled',
  `queued_at` DATETIME(3) DEFAULT NULL,
  `sent_at` DATETIME(3) DEFAULT NULL,
  `last_error` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_task_reminder_company_event` (`company_id`, `event_id`),
  KEY `idx_im_task_reminder_tenant_status_time` (`tenant_id`, `status`, `scheduled_at`),
  KEY `idx_im_task_reminder_company_task` (`company_id`, `task_id`),
  KEY `idx_im_task_reminder_due_scan` (`status`, `scheduled_at`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息待办提醒计划';

CREATE TABLE IF NOT EXISTS `im_task_attachment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `task_id` BIGINT NOT NULL,
  `attachment_id` BIGINT NOT NULL,
  `uploader_id` BIGINT NOT NULL,
  `attachment_role` VARCHAR(20) NOT NULL DEFAULT 'result',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_task_attachment_company_task_file` (`company_id`, `task_id`, `attachment_id`),
  KEY `idx_im_task_attachment_tenant_file` (`tenant_id`, `attachment_id`),
  KEY `idx_im_task_attachment_company_task` (`company_id`, `task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待办处理凭证附件';

-- 附件属于待办后，下载时同时执行待办参与范围鉴权，不再只按上传者判断。
SET @exists_task_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'im_message_attachment' AND COLUMN_NAME = 'task_id'
);
SET @ddl := IF(@exists_task_id = 0,
  'ALTER TABLE `im_message_attachment` ADD COLUMN `task_id` BIGINT DEFAULT NULL AFTER `message_id`',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists_task_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'im_message_attachment' AND INDEX_NAME = 'idx_im_attachment_company_task'
);
SET @ddl := IF(@exists_task_index = 0,
  'ALTER TABLE `im_message_attachment` ADD INDEX `idx_im_attachment_company_task` (`company_id`, `task_id`)',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- outbox 补充处理结果，便于运营排错和幂等回查。
SET @exists_processed_at := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'im_notification_outbox' AND COLUMN_NAME = 'processed_at'
);
SET @ddl := IF(@exists_processed_at = 0,
  'ALTER TABLE `im_notification_outbox` ADD COLUMN `processed_at` DATETIME(3) DEFAULT NULL AFTER `last_error`',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists_result_message_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'im_notification_outbox' AND COLUMN_NAME = 'result_message_id'
);
SET @ddl := IF(@exists_result_message_id = 0,
  'ALTER TABLE `im_notification_outbox` ADD COLUMN `result_message_id` BIGINT DEFAULT NULL AFTER `processed_at`',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists_outbox_scan_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'im_notification_outbox'
    AND INDEX_NAME = 'idx_im_outbox_status_retry'
);
SET @ddl := IF(@exists_outbox_scan_index = 0,
  'ALTER TABLE `im_notification_outbox` ADD INDEX `idx_im_outbox_status_retry` (`status`, `next_retry_at`, `created_at`)',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists_business_ref_unique := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'im_message_business_ref'
    AND INDEX_NAME = 'uk_im_business_ref_company_msg_object'
);
SET @ddl := IF(@exists_business_ref_unique = 0,
  'ALTER TABLE `im_message_business_ref` ADD UNIQUE INDEX `uk_im_business_ref_company_msg_object` (`company_id`, `message_id`, `business_type`, `business_id`)',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
