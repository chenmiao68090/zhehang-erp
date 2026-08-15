-- ============================================================
-- V12: 跟进记录支持关联线索(lead)
-- 背景:crm_follow 原只有 customer_id(客户跟进),但电销私海跟进的是 crm_lead(线索)。
--       打通"跟进客户"环:线索跟进需落库并回写 crm_lead 的 last_follow_time/follow_count,
--       以便回收引擎按真实跟进时间判超时(不再误回收活跃客资)。
-- 处理:crm_follow 加 lead_id 列 + 索引。lead_id 与 customer_id 二选一。
-- 幂等:information_schema 守卫,可重复执行。
-- ============================================================

USE `zhehang_erp`;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_follow' AND COLUMN_NAME = 'lead_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_follow` ADD COLUMN `lead_id` BIGINT DEFAULT NULL COMMENT ''线索ID(线索跟进时填)'' AFTER `customer_id`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_follow' AND INDEX_NAME = 'idx_follow_lead_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_follow` ADD INDEX `idx_follow_lead_id` (`lead_id`)',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- customer_id 原为 NOT NULL,线索跟进(lead_id)时 customer_id 为空,需改为可空(幂等:已可空则跳过)
SET @notnull := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_follow'
                   AND COLUMN_NAME = 'customer_id' AND IS_NULLABLE = 'NO');
SET @ddl := IF(@notnull > 0,
    'ALTER TABLE `crm_follow` MODIFY COLUMN `customer_id` BIGINT DEFAULT NULL COMMENT ''客户ID(客户跟进时填)''',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
