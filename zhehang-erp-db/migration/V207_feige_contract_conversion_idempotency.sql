-- V207 任务审批转合同幂等约束。
-- 仅扩展 feige_accounting_contract，不写业务数据、不触碰 biz_* 或提单中心。

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS v207_add_contract_conversion_idempotency;
DELIMITER $$
CREATE PROCEDURE v207_add_contract_conversion_idempotency()
BEGIN
  DECLARE duplicate_groups BIGINT DEFAULT 0;

  SELECT COUNT(*) INTO duplicate_groups
  FROM (
    SELECT tenant_id, order_id
    FROM feige_accounting_contract
    WHERE deleted = 0
      AND order_id IS NOT NULL
      AND contract_status IN ('draft', 'executing')
    GROUP BY tenant_id, order_id
    HAVING COUNT(*) > 1
  ) duplicate_active_contracts;

  IF duplicate_groups > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V207 aborted: duplicate active feige contracts exist for an order';
  END IF;

  IF NOT EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'feige_accounting_contract'
        AND COLUMN_NAME = 'active_order_id'
  ) THEN
    ALTER TABLE feige_accounting_contract
      ADD COLUMN active_order_id BIGINT
        GENERATED ALWAYS AS (
          CASE
            WHEN deleted = 0 AND order_id IS NOT NULL
              AND contract_status IN ('draft', 'executing')
            THEN order_id
            ELSE NULL
          END
        ) STORED COMMENT '活动合同关联订单幂等键';
  END IF;

  IF NOT EXISTS (
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'feige_accounting_contract'
        AND INDEX_NAME = 'uk_feige_contract_active_order'
  ) THEN
    ALTER TABLE feige_accounting_contract
      ADD UNIQUE KEY uk_feige_contract_active_order (tenant_id, active_order_id);
  END IF;
END$$
DELIMITER ;

CALL v207_add_contract_conversion_idempotency();
DROP PROCEDURE IF EXISTS v207_add_contract_conversion_idempotency;
