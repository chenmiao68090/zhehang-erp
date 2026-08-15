-- V204 订单台账 -> 任务工作台桥接。
-- 仅增加 feige_task_* 配置/运行表与两个可空幂等引用列；不写入规则、不启用自动生成、不触碰 biz_/crm_/sys_ 数据。

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS feige_task_order_bridge_rule (
    id BIGINT NOT NULL AUTO_INCREMENT,
    rule_code VARCHAR(64) NOT NULL,
    rule_name VARCHAR(150) NOT NULL,
    trigger_event VARCHAR(32) NOT NULL COMMENT 'order_created/finance_approved',
    target_task_type VARCHAR(32) NOT NULL COMMENT 'business/once/recurring/project_dept/special',
    process_id BIGINT DEFAULT NULL COMMENT '审批类任务流程ID；business为空',
    business_type_code VARCHAR(64) DEFAULT NULL COMMENT '可空订单业务类型过滤',
    scope_type VARCHAR(32) DEFAULT NULL COMMENT 'personal/team',
    final_confirm TINYINT NOT NULL DEFAULT 0,
    enabled TINYINT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 0,
    create_time DATETIME DEFAULT NULL, update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL, update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0, tenant_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ft_bridge_rule_code (tenant_id, rule_code),
    KEY idx_ft_bridge_rule_match (tenant_id, trigger_event, target_task_type, enabled, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单台账任务自动生成规则';

CREATE TABLE IF NOT EXISTS feige_task_order_bridge_run (
    id BIGINT NOT NULL AUTO_INCREMENT,
    rule_id BIGINT NOT NULL,
    rule_code VARCHAR(64) NOT NULL,
    trigger_event VARCHAR(32) NOT NULL,
    target_task_type VARCHAR(32) NOT NULL,
    order_id BIGINT NOT NULL,
    order_no VARCHAR(64) DEFAULT NULL,
    business_owner_id BIGINT NOT NULL,
    dept_id BIGINT DEFAULT NULL,
    operator_id BIGINT NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    run_status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending/processing/success/failed/dead/skipped',
    target_task_id BIGINT DEFAULT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    next_retry_at DATETIME DEFAULT NULL,
    error_code VARCHAR(64) DEFAULT NULL,
    error_message VARCHAR(500) DEFAULT NULL,
    processed_at DATETIME DEFAULT NULL,
    version INT NOT NULL DEFAULT 0,
    create_time DATETIME DEFAULT NULL, update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL, update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0, tenant_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ft_bridge_run_once (tenant_id, order_id, trigger_event, rule_id),
    KEY idx_ft_bridge_run_poll (run_status, next_retry_at, update_time, deleted),
    KEY idx_ft_bridge_run_order (tenant_id, order_id, create_time, deleted),
    KEY idx_ft_bridge_run_scope (tenant_id, dept_id, business_owner_id, run_status, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单台账任务自动生成幂等运行记录';

DROP PROCEDURE IF EXISTS v204_add_bridge_columns;
DELIMITER $$
CREATE PROCEDURE v204_add_bridge_columns()
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_business'
        AND COLUMN_NAME = 'bridge_run_id'
  ) THEN
    ALTER TABLE feige_task_business
      ADD COLUMN bridge_run_id BIGINT DEFAULT NULL COMMENT 'V204桥接运行ID' AFTER id;
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_business'
        AND INDEX_NAME = 'uk_ft_business_bridge_run'
  ) THEN
    ALTER TABLE feige_task_business
      ADD UNIQUE KEY uk_ft_business_bridge_run (tenant_id, bridge_run_id);
  END IF;

  IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_audit_instance'
        AND COLUMN_NAME = 'bridge_run_id'
  ) THEN
    ALTER TABLE feige_task_audit_instance
      ADD COLUMN bridge_run_id BIGINT DEFAULT NULL COMMENT 'V204桥接运行ID' AFTER id;
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feige_task_audit_instance'
        AND INDEX_NAME = 'uk_ft_audit_bridge_run'
  ) THEN
    ALTER TABLE feige_task_audit_instance
      ADD UNIQUE KEY uk_ft_audit_bridge_run (tenant_id, bridge_run_id);
  END IF;
END$$
DELIMITER ;
CALL v204_add_bridge_columns();
DROP PROCEDURE IF EXISTS v204_add_bridge_columns;
