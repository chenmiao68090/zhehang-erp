-- V58: 收款入账落库字段
-- 财务核对台“入账管理”原先只保存在前端内存,刷新即丢。
-- 本迁移仅增加可空字段,不修改历史收款金额/状态/备注。

DELIMITER $$

DROP PROCEDURE IF EXISTS add_receipt_posting_column_if_missing$$
CREATE PROCEDURE add_receipt_posting_column_if_missing(
  IN p_column_name VARCHAR(64),
  IN p_column_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_receipt'
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `biz_receipt` ADD COLUMN `', p_column_name, '` ', p_column_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL add_receipt_posting_column_if_missing('posting_account', 'VARCHAR(100) DEFAULT NULL COMMENT ''入账科目''');
CALL add_receipt_posting_column_if_missing('posting_operator_id', 'BIGINT DEFAULT NULL COMMENT ''入账人ID''');
CALL add_receipt_posting_column_if_missing('posting_time', 'DATETIME DEFAULT NULL COMMENT ''入账时间''');

DROP PROCEDURE IF EXISTS add_receipt_posting_column_if_missing;
