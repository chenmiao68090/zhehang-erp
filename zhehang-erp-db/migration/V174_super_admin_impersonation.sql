-- ============================================================================
-- V174 超级管理员员工视角（代登录）会话与双身份审计
--
-- 影响范围：
--   1. 新增 sys_impersonation_session，仅保存代登录会话元数据，不保存任何令牌/密码；
--   2. sys_oper_log 新增实际操作人、有效身份与代登录会话关联字段；
--   3. 不修改 sys_user_role/sys_role_menu，不改变任何员工现有权限与登录会话。
--
-- 回滚（仅在先停用功能、导出审计证据且再次获授权后执行）：
--   DROP TABLE sys_impersonation_session;
--   ALTER TABLE sys_oper_log DROP INDEX idx_impersonation_session,
--     DROP COLUMN impersonation_session_id, DROP COLUMN effective_username,
--     DROP COLUMN effective_user_id, DROP COLUMN actor_username,
--     DROP COLUMN actor_user_id;
-- ============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `sys_impersonation_session` (
  `session_id`           VARCHAR(64)  NOT NULL COMMENT '代登录会话ID（不含令牌）',
  `tenant_id`            BIGINT       NOT NULL COMMENT '租户ID',
  `actor_user_id`        BIGINT       NOT NULL COMMENT '实际操作人用户ID',
  `actor_username`       VARCHAR(64)  NOT NULL COMMENT '实际操作人用户名快照',
  `effective_user_id`    BIGINT       NOT NULL COMMENT '被模拟员工用户ID',
  `effective_username`   VARCHAR(100) NOT NULL COMMENT '被模拟员工姓名快照',
  `effective_dept_id`    BIGINT       DEFAULT NULL COMMENT '被模拟员工部门ID快照',
  `effective_dept_name`  VARCHAR(100) DEFAULT NULL COMMENT '被模拟员工部门名称快照',
  `effective_role_names` TEXT         DEFAULT NULL COMMENT '被模拟员工角色名称JSON快照',
  `effective_role_count` INT          NOT NULL DEFAULT 0 COMMENT '有效角色数量',
  `reason`               VARCHAR(500) NOT NULL COMMENT '代登录原因',
  `start_time`           DATETIME(3)  NOT NULL COMMENT '开始时间',
  `expire_time`          DATETIME(3)  NOT NULL COMMENT '强制到期时间',
  `end_time`             DATETIME(3)  DEFAULT NULL COMMENT '实际结束时间',
  `status`               VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE/ENDED/EXPIRED/REVOKED',
  `end_reason`           VARCHAR(500) DEFAULT NULL COMMENT '结束原因',
  `ip_addr`              VARCHAR(128) DEFAULT NULL COMMENT '开始代登录的IP',
  `user_agent`           VARCHAR(500) DEFAULT NULL COMMENT '开始代登录的设备UA',
  `device_info`          VARCHAR(200) DEFAULT NULL COMMENT '设备摘要',
  `tab_id`               VARCHAR(64)  NOT NULL COMMENT '当前浏览器标签页标识',
  `active_tab_guard`     TINYINT GENERATED ALWAYS AS
                         (CASE WHEN `status` = 'ACTIVE' THEN 1 ELSE NULL END) STORED
                         COMMENT '同一管理员标签页只允许一个活动会话',
  `create_time`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time`          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`session_id`),
  KEY `idx_imp_tenant_actor_start` (`tenant_id`, `actor_user_id`, `start_time`),
  KEY `idx_imp_tenant_effective_start` (`tenant_id`, `effective_user_id`, `start_time`),
  KEY `idx_imp_status_expire` (`status`, `expire_time`),
  UNIQUE KEY `uk_imp_active_actor_tab`
             (`tenant_id`, `actor_user_id`, `tab_id`, `active_tab_guard`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='超级管理员代登录会话审计';

DROP PROCEDURE IF EXISTS `apply_v174_impersonation_audit`;
DELIMITER $$
CREATE PROCEDURE `apply_v174_impersonation_audit`()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_impersonation_session'
      AND COLUMN_NAME = 'active_tab_guard'
  ) THEN
    ALTER TABLE `sys_impersonation_session`
      ADD COLUMN `active_tab_guard` TINYINT GENERATED ALWAYS AS
        (CASE WHEN `status` = 'ACTIVE' THEN 1 ELSE NULL END) STORED
        COMMENT '同一管理员标签页只允许一个活动会话' AFTER `tab_id`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_impersonation_session'
      AND INDEX_NAME = 'uk_imp_active_actor_tab'
  ) THEN
    ALTER TABLE `sys_impersonation_session`
      ADD UNIQUE INDEX `uk_imp_active_actor_tab`
        (`tenant_id`, `actor_user_id`, `tab_id`, `active_tab_guard`);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'actor_user_id'
  ) THEN
    ALTER TABLE `sys_oper_log`
      ADD COLUMN `actor_user_id` BIGINT DEFAULT NULL COMMENT '实际操作人用户ID' AFTER `operator_id`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'actor_username'
  ) THEN
    ALTER TABLE `sys_oper_log`
      ADD COLUMN `actor_username` VARCHAR(64) DEFAULT NULL COMMENT '实际操作人用户名快照' AFTER `actor_user_id`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'effective_user_id'
  ) THEN
    ALTER TABLE `sys_oper_log`
      ADD COLUMN `effective_user_id` BIGINT DEFAULT NULL COMMENT '请求有效身份用户ID' AFTER `actor_username`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'effective_username'
  ) THEN
    ALTER TABLE `sys_oper_log`
      ADD COLUMN `effective_username` VARCHAR(64) DEFAULT NULL COMMENT '请求有效身份用户名快照' AFTER `effective_user_id`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'impersonation_session_id'
  ) THEN
    ALTER TABLE `sys_oper_log`
      ADD COLUMN `impersonation_session_id` VARCHAR(64) DEFAULT NULL COMMENT '代登录会话ID' AFTER `effective_username`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log'
      AND INDEX_NAME = 'idx_impersonation_session'
  ) THEN
    ALTER TABLE `sys_oper_log`
      ADD INDEX `idx_impersonation_session` (`impersonation_session_id`, `oper_time`);
  END IF;

  IF (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log'
        AND COLUMN_NAME IN ('actor_user_id', 'actor_username', 'effective_user_id',
                            'effective_username', 'impersonation_session_id')) <> 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V174 failed: sys_oper_log impersonation audit columns incomplete';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_impersonation_session'
      AND COLUMN_NAME = 'active_tab_guard'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_impersonation_session'
      AND INDEX_NAME = 'uk_imp_active_actor_tab'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V174 failed: active impersonation tab guard incomplete';
  END IF;
END$$
DELIMITER ;

CALL `apply_v174_impersonation_audit`();
DROP PROCEDURE IF EXISTS `apply_v174_impersonation_audit`;
