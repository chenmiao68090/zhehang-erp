-- Fix crm_collision_log missing BaseEntity logical delete column.
-- Idempotent: only add the column when it does not already exist.

SET @column_exists := (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'crm_collision_log'
      AND COLUMN_NAME = 'deleted'
);

SET @ddl := IF(
    @column_exists = 0,
    'ALTER TABLE `crm_collision_log` ADD COLUMN `deleted` TINYINT(1) DEFAULT 0 COMMENT ''逻辑删除(0未删/1已删)'' AFTER `tenant_id`',
    'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
