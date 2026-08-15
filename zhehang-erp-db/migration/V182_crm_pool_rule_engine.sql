-- V182: 销售公海私海规则中枢。新增版本与每日用量表，不改写线索归属和历史业务数据。
CREATE TABLE IF NOT EXISTS `crm_pool_rule_version` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `version_no` int NOT NULL,
  `status` varchar(16) NOT NULL COMMENT 'DRAFT/SCHEDULED/ACTIVE/ARCHIVED',
  `effective_time` datetime DEFAULT NULL,
  `daily_claim_limit` int NOT NULL DEFAULT 1000,
  `single_claim_limit` int NOT NULL DEFAULT 1000,
  `daily_manual_entry_limit` int NOT NULL DEFAULT 1000,
  `single_import_limit` int NOT NULL DEFAULT 1000,
  `daily_import_limit` int NOT NULL DEFAULT 10000,
  `private_holding_limit` int NOT NULL DEFAULT 1000,
  `private_warning_percent` int NOT NULL DEFAULT 90,
  `protection_days` int NOT NULL DEFAULT 15,
  `recycle_no_follow_days` int NOT NULL DEFAULT 15,
  `recycle_warning_days` int NOT NULL DEFAULT 3,
  `release_cooldown_days` int NOT NULL DEFAULT 15,
  `duplicate_block_enabled` tinyint NOT NULL DEFAULT 1,
  `change_summary` varchar(255) DEFAULT NULL,
  `published_by` bigint DEFAULT NULL,
  `published_time` datetime DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` bigint DEFAULT NULL,
  `update_by` bigint DEFAULT NULL,
  `deleted` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pool_rule_tenant_version` (`tenant_id`,`version_no`,`deleted`),
  KEY `idx_pool_rule_effective` (`tenant_id`,`status`,`effective_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公海私海规则版本';

CREATE TABLE IF NOT EXISTS `crm_pool_rule_usage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `usage_date` date NOT NULL,
  `user_id` bigint NOT NULL,
  `metric_code` varchar(32) NOT NULL,
  `used_count` int NOT NULL DEFAULT 0,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` bigint DEFAULT NULL,
  `update_by` bigint DEFAULT NULL,
  `deleted` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pool_rule_usage` (`tenant_id`,`usage_date`,`user_id`,`metric_code`,`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公海私海每日数量用量';

INSERT INTO `crm_pool_rule_version` (
  `tenant_id`,`version_no`,`status`,`effective_time`,`daily_claim_limit`,`single_claim_limit`,
  `daily_manual_entry_limit`,`single_import_limit`,`daily_import_limit`,`private_holding_limit`,
  `private_warning_percent`,`protection_days`,`recycle_no_follow_days`,`recycle_warning_days`,
  `release_cooldown_days`,`duplicate_block_enabled`,`change_summary`,`published_time`,`create_time`,
  `update_time`,`deleted`
)
SELECT 1,1,'ACTIVE','2026-01-01 00:00:00',1000,1000,1000,1000,10000,1000,90,15,15,3,15,1,
       'V182上线时兼容原有业务口径',NOW(),NOW(),NOW(),0
WHERE NOT EXISTS (
  SELECT 1 FROM `crm_pool_rule_version` WHERE `tenant_id`=1 AND `version_no`=1 AND `deleted`=0
);
