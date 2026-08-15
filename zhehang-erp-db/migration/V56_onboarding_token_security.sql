-- V56: 入职登记公开链接安全加固
-- 1) 给候选人登记 token 增加有效期和提交后失效标记
-- 2) 记录公开提交次数、最后提交时间、最后提交 IP,便于排查异常
-- 3) 历史未提交链接默认保留 48 小时兼容窗口;已提交记录立即标记为已使用

DELIMITER $$

DROP PROCEDURE IF EXISTS add_onboarding_column_if_missing$$
CREATE PROCEDURE add_onboarding_column_if_missing(
  IN p_column_name VARCHAR(64),
  IN p_column_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'hrm_onboarding'
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `hrm_onboarding` ADD COLUMN `', p_column_name, '` ', p_column_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DROP PROCEDURE IF EXISTS add_onboarding_index_if_missing$$
CREATE PROCEDURE add_onboarding_index_if_missing(
  IN p_index_name VARCHAR(64),
  IN p_index_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'hrm_onboarding'
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `hrm_onboarding` ADD INDEX `', p_index_name, '` ', p_index_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL add_onboarding_column_if_missing('token_expires_at', 'DATETIME DEFAULT NULL COMMENT ''登记链接过期时间''');
CALL add_onboarding_column_if_missing('token_used_time', 'DATETIME DEFAULT NULL COMMENT ''登记链接提交后失效时间''');
CALL add_onboarding_column_if_missing('public_submit_count', 'INT DEFAULT 0 COMMENT ''公开登记提交次数''');
CALL add_onboarding_column_if_missing('public_last_submit_time', 'DATETIME DEFAULT NULL COMMENT ''公开登记最后提交时间''');
CALL add_onboarding_column_if_missing('public_last_submit_ip', 'VARCHAR(64) DEFAULT NULL COMMENT ''公开登记最后提交IP''');

UPDATE `hrm_onboarding`
SET `token_expires_at` = DATE_ADD(NOW(), INTERVAL 48 HOUR)
WHERE `deleted` = 0
  AND `token_expires_at` IS NULL
  AND (`status` IS NULL OR `status` < 1);

UPDATE `hrm_onboarding`
SET `token_used_time` = COALESCE(`token_used_time`, `submitted_time`, `update_time`, NOW()),
    `token_expires_at` = COALESCE(`token_expires_at`, `submitted_time`, `update_time`, NOW()),
    `public_submit_count` = CASE
      WHEN `public_submit_count` IS NULL OR `public_submit_count` = 0 THEN 1
      ELSE `public_submit_count`
    END
WHERE `deleted` = 0
  AND (`status` >= 1 OR `submitted_time` IS NOT NULL);

CALL add_onboarding_index_if_missing('idx_onboarding_token_expires', '(`token_expires_at`)');
CALL add_onboarding_index_if_missing('idx_onboarding_token_used', '(`token_used_time`)');

DROP PROCEDURE IF EXISTS add_onboarding_column_if_missing;
DROP PROCEDURE IF EXISTS add_onboarding_index_if_missing;
