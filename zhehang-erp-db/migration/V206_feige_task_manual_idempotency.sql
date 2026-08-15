-- V206 任务手工创建幂等键。
-- 仅扩展 feige_task_business / feige_task_audit_instance；不写数据、不触碰旧业务表。

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS v206_add_task_manual_idempotency;
DELIMITER $$
CREATE PROCEDURE v206_add_task_manual_idempotency()
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_business'
        AND COLUMN_NAME = 'request_key'
  ) THEN
    ALTER TABLE feige_task_business
      ADD COLUMN request_key VARCHAR(64) DEFAULT NULL COMMENT '手工创建请求幂等键' AFTER bridge_run_id;
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_business'
        AND COLUMN_NAME = 'request_fingerprint'
  ) THEN
    ALTER TABLE feige_task_business
      ADD COLUMN request_fingerprint CHAR(64) DEFAULT NULL COMMENT '手工创建请求摘要' AFTER request_key;
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_business'
        AND INDEX_NAME = 'uk_ft_business_request_key'
  ) THEN
    ALTER TABLE feige_task_business
      ADD UNIQUE KEY uk_ft_business_request_key (tenant_id, request_key);
  END IF;

  IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_audit_instance'
        AND COLUMN_NAME = 'request_key'
  ) THEN
    ALTER TABLE feige_task_audit_instance
      ADD COLUMN request_key VARCHAR(64) DEFAULT NULL COMMENT '手工创建请求幂等键' AFTER bridge_run_id;
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_audit_instance'
        AND COLUMN_NAME = 'request_fingerprint'
  ) THEN
    ALTER TABLE feige_task_audit_instance
      ADD COLUMN request_fingerprint CHAR(64) DEFAULT NULL COMMENT '手工创建请求摘要' AFTER request_key;
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_audit_instance'
        AND INDEX_NAME = 'uk_ft_audit_request_key'
  ) THEN
    ALTER TABLE feige_task_audit_instance
      ADD UNIQUE KEY uk_ft_audit_request_key (tenant_id, request_key);
  END IF;
END$$
DELIMITER ;

CALL v206_add_task_manual_idempotency();
DROP PROCEDURE IF EXISTS v206_add_task_manual_idempotency;
