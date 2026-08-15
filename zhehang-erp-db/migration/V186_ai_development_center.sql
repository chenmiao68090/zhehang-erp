-- V186 AI开发中心：内部需求、老板授权、验收和上线留痕。
-- 仅创建能力并授权精确 super_admin；其他角色由角色管理页面按需配置。
-- 本迁移不执行代码开发、不连接生产环境，也不自动部署。

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `ai_dev_request` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `request_no` VARCHAR(64) DEFAULT NULL COMMENT 'DEV业务编号',
  `title` VARCHAR(160) NOT NULL,
  `problem_description` TEXT NOT NULL,
  `expected_result` TEXT NOT NULL,
  `acceptance_criteria` TEXT NOT NULL,
  `impact_modules` VARCHAR(1000) DEFAULT NULL,
  `attachment_ids` TEXT DEFAULT NULL,
  `priority` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  `risk_level` VARCHAR(20) NOT NULL DEFAULT 'LOW',
  `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING_CONFIRM',
  `coordinator_id` BIGINT DEFAULT NULL,
  `current_owner_id` BIGINT DEFAULT NULL,
  `dev_approved_by` BIGINT DEFAULT NULL,
  `dev_approved_at` DATETIME DEFAULT NULL,
  `accepted_by` BIGINT DEFAULT NULL,
  `accepted_at` DATETIME DEFAULT NULL,
  `deploy_approved_by` BIGINT DEFAULT NULL,
  `deploy_approved_at` DATETIME DEFAULT NULL,
  `latest_release_id` BIGINT DEFAULT NULL,
  `version` INT NOT NULL DEFAULT 0 COMMENT '状态流转并发版本',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` BIGINT DEFAULT NULL,
  `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ai_dev_request_no` (`tenant_id`, `request_no`, `deleted`),
  KEY `idx_ai_dev_status` (`tenant_id`, `status`, `deleted`),
  KEY `idx_ai_dev_creator` (`tenant_id`, `create_by`, `deleted`),
  KEY `idx_ai_dev_coordinator` (`tenant_id`, `coordinator_id`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI开发中心需求';

CREATE TABLE IF NOT EXISTS `ai_dev_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `request_id` BIGINT NOT NULL,
  `record_type` VARCHAR(32) NOT NULL COMMENT 'REQUEST/COMMENT/STATUS/DECISION/DELIVERY/RELEASE/RISK',
  `action_type` VARCHAR(64) NOT NULL,
  `content` TEXT DEFAULT NULL,
  `from_status` VARCHAR(32) DEFAULT NULL,
  `to_status` VARCHAR(32) DEFAULT NULL,
  `operator_id` BIGINT DEFAULT NULL,
  `operator_name` VARCHAR(100) DEFAULT NULL,
  `attachment_ids` TEXT DEFAULT NULL,
  `detail_json` LONGTEXT DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` BIGINT DEFAULT NULL,
  `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ai_dev_record_request` (`tenant_id`, `request_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI开发中心全程记录';

CREATE TABLE IF NOT EXISTS `ai_dev_release` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `request_id` BIGINT NOT NULL,
  `version_no` VARCHAR(64) NOT NULL,
  `change_summary` TEXT NOT NULL,
  `test_result` TEXT DEFAULT NULL,
  `preview_url` VARCHAR(500) DEFAULT NULL,
  `rollback_plan` TEXT NOT NULL,
  `health_check` TEXT DEFAULT NULL,
  `release_status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
  `released_by` BIGINT DEFAULT NULL,
  `released_at` DATETIME DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by` BIGINT DEFAULT NULL,
  `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ai_dev_release_version` (`tenant_id`, `request_id`, `version_no`, `deleted`),
  KEY `idx_ai_dev_release_request` (`tenant_id`, `request_id`, `released_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI开发中心上线记录';

DROP PROCEDURE IF EXISTS apply_v186_ai_development_center_menu;
DELIMITER $$
CREATE PROCEDURE apply_v186_ai_development_center_menu()
BEGIN
  DECLARE v_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT COUNT(*) INTO v_count
  FROM `sys_role`
  WHERE `tenant_id` = 1 AND `role_key` = 'super_admin' AND `status` = 0 AND `deleted` = 0;
  IF v_count <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V186 aborted: exact active super_admin role count is not one';
  END IF;

  IF EXISTS (
    SELECT 1 FROM `sys_menu`
    WHERE `id` BETWEEN 900200 AND 900207
      AND NOT (
        `tenant_id` = 1 AND `deleted` = 0 AND (
          (`id` = 900200 AND `perms` = 'ai_dev:view') OR
          (`id` = 900201 AND `perms` = 'ai_dev:view_all') OR
          (`id` = 900202 AND `perms` = 'ai_dev:create') OR
          (`id` = 900203 AND `perms` = 'ai_dev:comment') OR
          (`id` = 900204 AND `perms` = 'ai_dev:test') OR
          (`id` = 900205 AND `perms` = 'ai_dev:approve') OR
          (`id` = 900206 AND `perms` = 'ai_dev:deploy') OR
          (`id` = 900207 AND `perms` = 'ai_dev:audit')
        )
      )
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V186 aborted: reserved AI development menu ids are occupied';
  END IF;

INSERT INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `remark`, `create_by`, `tenant_id`, `deleted`)
VALUES
  (900200, 'AI开发中心', 0, 95, '/ai-dev', 'ai-dev/index', 'C', 1, 0, 'ai_dev:view', 'cpu', '内部需求与上线授权闭环', 1, 1, 0),
  (900201, '查看全部需求', 900200, 1, NULL, NULL, 'F', 0, 0, 'ai_dev:view_all', NULL, NULL, 1, 1, 0),
  (900202, '创建开发需求', 900200, 2, NULL, NULL, 'F', 0, 0, 'ai_dev:create', NULL, NULL, 1, 1, 0),
  (900203, '补充与讨论', 900200, 3, NULL, NULL, 'F', 0, 0, 'ai_dev:comment', NULL, NULL, 1, 1, 0),
  (900204, '提交测试交付', 900200, 4, NULL, NULL, 'F', 0, 0, 'ai_dev:test', NULL, NULL, 1, 1, 0),
  (900205, '批准与验收', 900200, 5, NULL, NULL, 'F', 0, 0, 'ai_dev:approve', NULL, NULL, 1, 1, 0),
  (900206, '批准与登记上线', 900200, 6, NULL, NULL, 'F', 0, 0, 'ai_dev:deploy', NULL, NULL, 1, 1, 0),
  (900207, '查看开发审计', 900200, 7, NULL, NULL, 'F', 0, 0, 'ai_dev:audit', NULL, NULL, 1, 1, 0)
ON DUPLICATE KEY UPDATE
  `menu_name` = VALUES(`menu_name`), `parent_id` = VALUES(`parent_id`), `sort` = VALUES(`sort`),
  `path` = VALUES(`path`), `component` = VALUES(`component`), `menu_type` = VALUES(`menu_type`),
  `visible` = VALUES(`visible`), `status` = VALUES(`status`), `perms` = VALUES(`perms`),
  `icon` = VALUES(`icon`), `remark` = VALUES(`remark`), `deleted` = 0;

  SELECT COUNT(*) INTO v_count
  FROM `sys_menu`
  WHERE `tenant_id` = 1 AND `deleted` = 0 AND `id` BETWEEN 900200 AND 900207
    AND `perms` IN ('ai_dev:view', 'ai_dev:view_all', 'ai_dev:create', 'ai_dev:comment',
                    'ai_dev:test', 'ai_dev:approve', 'ai_dev:deploy', 'ai_dev:audit');
  IF v_count <> 8 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V186 aborted: AI development permissions are incomplete';
  END IF;

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`id` BETWEEN 900200 AND 900207 AND m.`tenant_id` = r.`tenant_id`
WHERE r.`tenant_id` = 1 AND r.`role_key` = 'super_admin' AND r.`status` = 0 AND r.`deleted` = 0;

  SELECT COUNT(*) INTO v_count
  FROM `sys_role_menu` rm
  JOIN `sys_role` r ON r.`id` = rm.`role_id`
  WHERE r.`tenant_id` = 1 AND r.`role_key` = 'super_admin'
    AND rm.`menu_id` BETWEEN 900200 AND 900207;
  IF v_count <> 8 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V186 aborted: super_admin AI development permissions are incomplete';
  END IF;

  COMMIT;
END$$
DELIMITER ;

CALL apply_v186_ai_development_center_menu();
DROP PROCEDURE IF EXISTS apply_v186_ai_development_center_menu;
