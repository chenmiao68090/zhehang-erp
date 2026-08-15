-- V209 账号安全P0：首次改密与MFA状态。存量账号保持可登录，新建/重置账号由业务代码标记首次改密。
SET NAMES utf8mb4;

SET @db_name = DATABASE();

SET @sql = IF(EXISTS(
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'must_change_password'
), 'SELECT 1', 'ALTER TABLE sys_user ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''首次登录是否强制改密'' AFTER remark');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS(
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'password_changed_at'
), 'SELECT 1', 'ALTER TABLE sys_user ADD COLUMN password_changed_at DATETIME NULL COMMENT ''最近改密时间'' AFTER must_change_password');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS(
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'mfa_enabled'
), 'SELECT 1', 'ALTER TABLE sys_user ADD COLUMN mfa_enabled TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''是否启用MFA'' AFTER password_changed_at');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS(
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'mfa_secret'
), 'SELECT 1', 'ALTER TABLE sys_user ADD COLUMN mfa_secret VARCHAR(512) NULL COMMENT ''加密后的MFA密钥'' AFTER mfa_enabled');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(EXISTS(
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'mfa_enrolled_at'
), 'SELECT 1', 'ALTER TABLE sys_user ADD COLUMN mfa_enrolled_at DATETIME NULL COMMENT ''MFA启用时间'' AFTER mfa_secret');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
