-- =============================================================================
-- V130  云客通话记录补同步索引
--      生产云客未同步队列有大量历史话单;补拉时需要按 platform_call_id upsert,
--      页面分页/统计也会按 call_type + call_time 查询。
-- =============================================================================

SET @idx := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'biz_call_record'
    AND INDEX_NAME = 'uk_call_record_platform_id'
);
SET @sql := IF(@idx = 0,
  'ALTER TABLE `biz_call_record` ADD UNIQUE KEY `uk_call_record_platform_id` (`platform_call_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'biz_call_record'
    AND INDEX_NAME = 'idx_call_record_type_time'
);
SET @sql := IF(@idx = 0,
  'ALTER TABLE `biz_call_record` ADD KEY `idx_call_record_type_time` (`call_type`, `call_time`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
