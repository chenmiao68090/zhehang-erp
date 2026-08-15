-- V210 安全、租户与迁移治理基础设施（仅结构，不修复历史业务数据）

CREATE TABLE IF NOT EXISTS `schema_migration_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `version` VARCHAR(32) NOT NULL COMMENT '全局唯一迁移版本',
  `file_name` VARCHAR(255) NOT NULL,
  `checksum` CHAR(64) NOT NULL COMMENT 'SHA-256',
  `executed_by` VARCHAR(128) NOT NULL,
  `started_at` DATETIME(3) NOT NULL,
  `finished_at` DATETIME(3) DEFAULT NULL,
  `execution_ms` BIGINT DEFAULT NULL,
  `status` VARCHAR(16) NOT NULL COMMENT 'RUNNING/SUCCESS/FAILED/BASELINED',
  `error_summary` VARCHAR(500) DEFAULT NULL,
  `backup_reference` VARCHAR(500) NOT NULL,
  `app_version` VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_schema_migration_version` (`version`),
  UNIQUE KEY `uk_schema_migration_file` (`file_name`),
  KEY `idx_schema_migration_status_time` (`status`, `started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据库结构迁移执行历史';

CREATE TABLE IF NOT EXISTS `data_repair_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `run_id` VARCHAR(64) NOT NULL,
  `repair_code` VARCHAR(64) NOT NULL,
  `checksum` CHAR(64) NOT NULL,
  `executed_by` VARCHAR(128) NOT NULL,
  `started_at` DATETIME(3) NOT NULL,
  `finished_at` DATETIME(3) DEFAULT NULL,
  `status` VARCHAR(16) NOT NULL COMMENT 'RUNNING/SUCCESS/FAILED/ROLLED_BACK',
  `affected_rows` BIGINT DEFAULT 0,
  `backup_reference` VARCHAR(500) NOT NULL,
  `remark` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_data_repair_run` (`run_id`),
  KEY `idx_data_repair_code_time` (`repair_code`, `started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='业务数据修复执行历史';

CREATE TABLE IF NOT EXISTS `integration_tenant_quarantine` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `run_id` VARCHAR(64) NOT NULL,
  `source_table` VARCHAR(64) NOT NULL,
  `source_id` BIGINT NOT NULL,
  `reason_code` VARCHAR(64) NOT NULL,
  `candidate_tenant_id` BIGINT DEFAULT NULL,
  `evidence_hash` CHAR(64) DEFAULT NULL COMMENT '只存证据摘要，不复制隐私字段',
  `status` VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  `resolved_tenant_id` BIGINT DEFAULT NULL,
  `resolved_by` BIGINT DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_quarantine_run_row` (`run_id`, `source_table`, `source_id`),
  KEY `idx_tenant_quarantine_status` (`status`, `source_table`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='无法唯一确定租户归属的集成记录隔离清单';

CREATE TABLE IF NOT EXISTS `integration_tenant_backfill_backup` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `run_id` VARCHAR(64) NOT NULL,
  `source_table` VARCHAR(64) NOT NULL,
  `source_id` BIGINT NOT NULL,
  `old_tenant_id` BIGINT DEFAULT NULL,
  `new_tenant_id` BIGINT NOT NULL,
  `row_checksum` CHAR(64) NOT NULL,
  `rolled_back_at` DATETIME DEFAULT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_backfill_run_row` (`run_id`, `source_table`, `source_id`),
  KEY `idx_tenant_backfill_source` (`source_table`, `source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云客租户回填最小可回滚快照';

DROP PROCEDURE IF EXISTS `zh_add_index_if_absent`;
DELIMITER $$
CREATE PROCEDURE `zh_add_index_if_absent`(
  IN p_table VARCHAR(64), IN p_index VARCHAR(64), IN p_columns VARCHAR(500)
)
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = DATABASE() AND table_name = p_table)
     AND NOT EXISTS (SELECT 1 FROM information_schema.statistics
                     WHERE table_schema = DATABASE() AND table_name = p_table AND index_name = p_index) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD INDEX `', p_index, '` (', p_columns, ')');
    PREPARE zh_stmt FROM @ddl;
    EXECUTE zh_stmt;
    DEALLOCATE PREPARE zh_stmt;
  END IF;
END$$
DELIMITER ;

CALL zh_add_index_if_absent('biz_call_record', 'idx_call_tenant_time', '`tenant_id`,`call_time`');
CALL zh_add_index_if_absent('biz_call_record', 'idx_call_tenant_agent_time', '`tenant_id`,`agent_id`,`call_time`');
CALL zh_add_index_if_absent('biz_call_record', 'idx_call_tenant_platform', '`tenant_id`,`platform_call_id`');
CALL zh_add_index_if_absent('biz_yunke_config', 'idx_yunke_config_tenant_enabled', '`tenant_id`,`enabled`');
CALL zh_add_index_if_absent('biz_yunke_user_map', 'idx_yunke_map_tenant_user', '`tenant_id`,`user_id`');
CALL zh_add_index_if_absent('biz_yunke_user_map', 'idx_yunke_map_tenant_cloud_user', '`tenant_id`,`yunke_user_id`');
CALL zh_add_index_if_absent('biz_yunke_user_map', 'idx_yunke_map_tenant_wechat', '`tenant_id`,`yunke_wechat_id`');
CALL zh_add_index_if_absent('biz_yunke_user_map', 'idx_yunke_map_tenant_phone', '`tenant_id`,`yunke_phone`');
CALL zh_add_index_if_absent('biz_wechat_chat', 'idx_wechat_chat_tenant_time', '`tenant_id`,`wechat_id`,`msg_time`');
CALL zh_add_index_if_absent('biz_wechat_chat', 'idx_wechat_chat_tenant_msg', '`tenant_id`,`wechat_id`,`msg_svr_id`');
CALL zh_add_index_if_absent('biz_wechat_friend', 'idx_wechat_friend_tenant_wx', '`tenant_id`,`wx_id`');
CALL zh_add_index_if_absent('biz_wechat_friend_info', 'idx_friend_info_tenant_time', '`tenant_id`,`sales_wechat_id`,`last_chat_time`');
CALL zh_add_index_if_absent('biz_wechat_msg_stat', 'idx_msg_stat_tenant_day', '`tenant_id`,`wechat_id`,`ymd`');

DROP PROCEDURE IF EXISTS `zh_add_index_if_absent`;
