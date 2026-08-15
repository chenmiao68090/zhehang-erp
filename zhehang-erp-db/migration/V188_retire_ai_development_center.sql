-- V188 退役 AI 开发中心。
-- 只清理页面菜单和角色关联，保留 ai_dev_request / ai_dev_record /
-- ai_dev_release 三张历史表及其数据，便于审计和必要时恢复。

DROP PROCEDURE IF EXISTS apply_v188_retire_ai_development_center;
DELIMITER $$
CREATE PROCEDURE apply_v188_retire_ai_development_center()
BEGIN
  DECLARE v_active_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF EXISTS (
    SELECT 1
    FROM `sys_menu`
    WHERE `id` BETWEEN 900200 AND 900207
      AND `deleted` = 0
      AND NOT (
        `tenant_id` = 1 AND (
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
      SET MESSAGE_TEXT = 'V188 aborted: AI development menu ids no longer match V186';
  END IF;

  DELETE FROM `sys_role_menu`
  WHERE `menu_id` BETWEEN 900200 AND 900207;

  UPDATE `sys_menu`
  SET `visible` = 0,
      `status` = 1,
      `deleted` = 1,
      `update_by` = 1,
      `update_time` = NOW()
  WHERE `tenant_id` = 1
    AND `id` BETWEEN 900200 AND 900207
    AND `perms` IN (
      'ai_dev:view', 'ai_dev:view_all', 'ai_dev:create', 'ai_dev:comment',
      'ai_dev:test', 'ai_dev:approve', 'ai_dev:deploy', 'ai_dev:audit'
    );

  SELECT COUNT(*) INTO v_active_count
  FROM `sys_menu`
  WHERE `tenant_id` = 1
    AND `deleted` = 0
    AND (
      `id` BETWEEN 900200 AND 900207
      OR `perms` LIKE 'ai_dev:%'
      OR `path` = '/ai-dev'
    );

  IF v_active_count <> 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V188 aborted: active AI development permissions remain';
  END IF;

  COMMIT;
END$$
DELIMITER ;

CALL apply_v188_retire_ai_development_center();
DROP PROCEDURE IF EXISTS apply_v188_retire_ai_development_center;
