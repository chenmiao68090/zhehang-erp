-- =============================================================================
-- V147 内部消息中心第一阶段
-- 仅新增 IM 表和索引，不修改现有通知、员工、部门或业务数据。
-- tenant_id 供现有 MyBatis 租户拦截器使用；company_id 是消息域显式组织边界。
-- =============================================================================
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `im_conversation` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `type` VARCHAR(24) NOT NULL COMMENT 'direct/group/department/business/announcement/system',
  `name` VARCHAR(120) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `owner_id` BIGINT DEFAULT NULL,
  `direct_key` VARCHAR(80) DEFAULT NULL COMMENT '单聊双方有序唯一键',
  `business_type` VARCHAR(40) DEFAULT NULL,
  `business_id` BIGINT DEFAULT NULL,
  `last_message_id` BIGINT DEFAULT NULL,
  `last_seq` BIGINT NOT NULL DEFAULT 0,
  `last_message_at` DATETIME(3) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_by` BIGINT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_direct_company` (`company_id`, `direct_key`),
  KEY `idx_im_conv_company_status_time` (`company_id`, `status`, `last_message_at`, `id`),
  KEY `idx_im_conv_business` (`company_id`, `business_type`, `business_id`),
  KEY `idx_im_conv_tenant` (`tenant_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内部消息会话';

CREATE TABLE IF NOT EXISTS `im_conversation_member` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `conversation_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `member_role` VARCHAR(20) NOT NULL DEFAULT 'member',
  `join_seq` BIGINT NOT NULL DEFAULT 0,
  `last_read_seq` BIGINT NOT NULL DEFAULT 0,
  `manual_unread_seq` BIGINT NOT NULL DEFAULT 0,
  `last_delivered_seq` BIGINT NOT NULL DEFAULT 0,
  `is_pinned` TINYINT(1) NOT NULL DEFAULT 0,
  `pinned_at` DATETIME(3) DEFAULT NULL,
  `is_muted` TINYINT(1) NOT NULL DEFAULT 0,
  `notification_level` VARCHAR(20) NOT NULL DEFAULT 'all',
  `is_hidden` TINYINT(1) NOT NULL DEFAULT 0,
  `hidden_at` DATETIME(3) DEFAULT NULL,
  `draft_json` JSON DEFAULT NULL,
  `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `left_at` DATETIME(3) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_member_company_conv_user` (`company_id`, `conversation_id`, `user_id`),
  KEY `idx_im_member_company_user_status` (`company_id`, `user_id`, `status`, `is_pinned`),
  KEY `idx_im_member_company_conv_status` (`company_id`, `conversation_id`, `status`),
  KEY `idx_im_member_tenant_user` (`tenant_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话成员及个人会话状态';

CREATE TABLE IF NOT EXISTS `im_message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `conversation_id` BIGINT NOT NULL,
  `client_message_id` VARCHAR(80) NOT NULL,
  `seq` BIGINT NOT NULL,
  `sender_id` BIGINT NOT NULL,
  `message_type` VARCHAR(24) NOT NULL,
  `content_json` JSON NOT NULL,
  `search_text` TEXT DEFAULT NULL,
  `reply_to_message_id` BIGINT DEFAULT NULL,
  `root_message_id` BIGINT DEFAULT NULL,
  `is_important` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'sent',
  `edited_at` DATETIME(3) DEFAULT NULL,
  `recalled_at` DATETIME(3) DEFAULT NULL,
  `recalled_by` BIGINT DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_message_company_conv_seq` (`company_id`, `conversation_id`, `seq`),
  UNIQUE KEY `uk_im_message_company_sender_client` (`company_id`, `sender_id`, `client_message_id`),
  KEY `idx_im_message_company_conv_created` (`company_id`, `conversation_id`, `created_at`, `id`),
  KEY `idx_im_message_company_conv_sender` (`company_id`, `conversation_id`, `sender_id`, `seq`),
  KEY `idx_im_message_tenant_conv_seq` (`tenant_id`, `conversation_id`, `seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息主表';

CREATE TABLE IF NOT EXISTS `im_message_attachment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `conversation_id` BIGINT NOT NULL,
  `message_id` BIGINT DEFAULT NULL,
  `uploader_id` BIGINT NOT NULL,
  `storage_key` VARCHAR(500) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) DEFAULT NULL,
  `file_size` BIGINT NOT NULL,
  `thumbnail_key` VARCHAR(500) DEFAULT NULL,
  `upload_status` VARCHAR(20) NOT NULL DEFAULT 'uploaded',
  `scan_status` VARCHAR(20) NOT NULL DEFAULT 'basic_passed',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_im_attach_company_message` (`company_id`, `message_id`),
  KEY `idx_im_attach_company_conv` (`company_id`, `conversation_id`, `created_at`),
  KEY `idx_im_attach_tenant_uploader` (`tenant_id`, `uploader_id`, `upload_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息附件';

CREATE TABLE IF NOT EXISTS `im_message_mention` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `conversation_id` BIGINT NOT NULL,
  `message_id` BIGINT NOT NULL,
  `mentioned_user_id` BIGINT NOT NULL,
  `mention_type` VARCHAR(16) NOT NULL DEFAULT 'user',
  `read_at` DATETIME(3) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_mention_company_msg_user` (`company_id`, `message_id`, `mentioned_user_id`),
  KEY `idx_im_mention_company_user_read` (`company_id`, `mentioned_user_id`, `read_at`, `message_id`),
  KEY `idx_im_mention_tenant_conv` (`tenant_id`, `conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息@记录';

CREATE TABLE IF NOT EXISTS `im_message_reaction` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `message_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `reaction_code` VARCHAR(32) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_reaction_company_msg_user_code` (`company_id`, `message_id`, `user_id`, `reaction_code`),
  KEY `idx_im_reaction_tenant_msg` (`tenant_id`, `message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表情回应';

CREATE TABLE IF NOT EXISTS `im_message_favorite` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `message_id` BIGINT NOT NULL,
  `remark` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_favorite_company_user_msg` (`company_id`, `user_id`, `message_id`),
  KEY `idx_im_favorite_tenant_user_time` (`tenant_id`, `user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人消息收藏';

CREATE TABLE IF NOT EXISTS `im_message_business_ref` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `message_id` BIGINT NOT NULL,
  `business_type` VARCHAR(40) NOT NULL,
  `business_id` BIGINT NOT NULL,
  `display_snapshot` JSON DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_im_business_ref_company_object` (`company_id`, `business_type`, `business_id`),
  KEY `idx_im_business_ref_tenant_msg` (`tenant_id`, `message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息业务对象关联';

CREATE TABLE IF NOT EXISTS `im_task_message_link` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `message_id` BIGINT NOT NULL,
  `task_id` BIGINT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_task_link_company_msg_task` (`company_id`, `message_id`, `task_id`),
  KEY `idx_im_task_link_tenant_task` (`tenant_id`, `task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息与待办关联';

CREATE TABLE IF NOT EXISTS `im_notification_outbox` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `event_id` VARCHAR(100) NOT NULL,
  `event_type` VARCHAR(80) NOT NULL,
  `payload_json` JSON NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `retry_count` INT NOT NULL DEFAULT 0,
  `next_retry_at` DATETIME(3) DEFAULT NULL,
  `last_error` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_outbox_company_event` (`company_id`, `event_id`),
  KEY `idx_im_outbox_tenant_status_retry` (`tenant_id`, `status`, `next_retry_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务消息可靠发送队列';

CREATE TABLE IF NOT EXISTS `im_audit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `operator_id` BIGINT NOT NULL,
  `action_type` VARCHAR(60) NOT NULL,
  `conversation_id` BIGINT DEFAULT NULL,
  `message_id` BIGINT DEFAULT NULL,
  `reason` VARCHAR(500) DEFAULT NULL,
  `ip_address` VARCHAR(128) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_im_audit_company_conv_time` (`company_id`, `conversation_id`, `created_at`),
  KEY `idx_im_audit_tenant_operator_time` (`tenant_id`, `operator_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息审计日志';

CREATE TABLE IF NOT EXISTS `im_message_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `conversation_id` BIGINT NOT NULL,
  `message_id` BIGINT NOT NULL,
  `operator_id` BIGINT NOT NULL,
  `action_type` VARCHAR(20) NOT NULL,
  `content_json` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_im_history_company_msg_time` (`company_id`, `message_id`, `created_at`),
  KEY `idx_im_history_tenant_conv` (`tenant_id`, `conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息编辑撤回留痕';

CREATE TABLE IF NOT EXISTS `im_user_preference` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `company_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `browser_notification` TINYINT(1) NOT NULL DEFAULT 0,
  `sound_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `desktop_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_im_pref_company_user` (`company_id`, `user_id`),
  KEY `idx_im_pref_tenant_user` (`tenant_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息个人提醒设置';
