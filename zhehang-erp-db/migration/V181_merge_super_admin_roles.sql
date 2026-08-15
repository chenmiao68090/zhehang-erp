-- V181: merge the three audited top-role records into one canonical super_admin.
-- Scope: tenant 1, canonical role id 1, legacy role ids 21 and 90.
-- Five active members are copied before legacy relations are removed. Two audited
-- relations owned by deleted users are stale RBAC data and are removed explicitly.
-- No user row or business data is deleted.

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS apply_v181_merge_super_admin_roles;
DELIMITER $$
CREATE PROCEDURE apply_v181_merge_super_admin_roles()
BEGIN
  DECLARE v_before_members INT DEFAULT 0;
  DECLARE v_after_members INT DEFAULT 0;
  DECLARE v_total_members INT DEFAULT 0;
  DECLARE v_deleted_members INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF NOT EXISTS (
    SELECT 1 FROM sys_role
     WHERE id = 1 AND tenant_id = 1
       AND role_key = 'super_admin' AND deleted = 0
     FOR UPDATE
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: canonical super_admin role is missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM sys_role
     WHERE id IN (21, 90)
       AND NOT (
         tenant_id = 1
         AND ((id = 21 AND role_key = 'super_admin__mr9plur8jyh')
           OR (id = 90 AND role_key = 'boss'))
       )
     FOR UPDATE
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: legacy role identity does not match audited state';
  END IF;

  IF (
    SELECT COUNT(*) FROM sys_role
     WHERE tenant_id = 1
       AND ((id = 21 AND role_key = 'super_admin__mr9plur8jyh')
         OR (id = 90 AND role_key = 'boss'))
  ) <> 2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: audited legacy roles are missing';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM sys_user_role ur
      LEFT JOIN sys_user u ON u.id = ur.user_id
     WHERE ur.role_id IN (1, 21, 90)
       AND (u.id IS NULL OR u.tenant_id <> 1)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: top-role relation contains an invalid tenant user';
  END IF;

  SELECT COUNT(DISTINCT ur.user_id) INTO v_total_members
    FROM sys_user_role ur
   WHERE ur.role_id IN (1, 21, 90);

  IF v_total_members <> 7 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: audited top-role relation count is no longer seven';
  END IF;

  SELECT COUNT(DISTINCT ur.user_id) INTO v_deleted_members
    FROM sys_user_role ur
    JOIN sys_user u ON u.id = ur.user_id
   WHERE ur.role_id IN (1, 21, 90)
     AND u.tenant_id = 1
     AND COALESCE(u.deleted, 0) <> 0;

  IF v_deleted_members <> 2 OR EXISTS (
    SELECT 1
      FROM sys_user_role ur
      JOIN sys_user u ON u.id = ur.user_id
     WHERE ur.role_id IN (1, 21, 90)
       AND u.tenant_id = 1
       AND COALESCE(u.deleted, 0) <> 0
       AND ur.role_id <> 1
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: deleted-user RBAC residue no longer matches audited state';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_v181_top_users;
  CREATE TEMPORARY TABLE tmp_v181_top_users (
    user_id BIGINT NOT NULL,
    PRIMARY KEY (user_id)
  ) ENGINE=MEMORY;

  INSERT IGNORE INTO tmp_v181_top_users (user_id)
  SELECT DISTINCT ur.user_id
    FROM sys_user_role ur
    JOIN sys_user u ON u.id = ur.user_id
   WHERE ur.role_id IN (1, 21, 90)
     AND u.tenant_id = 1
     AND COALESCE(u.deleted, 0) = 0;

  SELECT COUNT(*) INTO v_before_members FROM tmp_v181_top_users;

  IF v_before_members <> 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: audited active top-role member count is no longer five';
  END IF;

  INSERT IGNORE INTO sys_user_role (user_id, role_id)
  SELECT user_id, 1 FROM tmp_v181_top_users;

  DELETE ur
    FROM sys_user_role ur
    JOIN sys_user u ON u.id = ur.user_id
   WHERE ur.role_id = 1
     AND u.tenant_id = 1
     AND COALESCE(u.deleted, 0) <> 0;

  DELETE FROM sys_user_role WHERE role_id IN (21, 90);
  DELETE FROM sys_role_menu WHERE role_id IN (21, 90);

  UPDATE sys_role
     SET role_name = '超级管理员',
         status = 0,
         data_scope = 1,
         visible_modules = NULL,
         deleted = 0
   WHERE id = 1 AND tenant_id = 1 AND role_key = 'super_admin';

  UPDATE sys_role
     SET status = 1,
         deleted = 1,
         remark = CONCAT(
           COALESCE(NULLIF(remark, ''), ''),
           CASE WHEN COALESCE(NULLIF(remark, ''), '') = '' THEN '' ELSE '；' END,
           'V181 已归并至唯一超级管理员角色'
         )
   WHERE id IN (21, 90)
     AND tenant_id = 1
     AND ((id = 21 AND role_key = 'super_admin__mr9plur8jyh')
       OR (id = 90 AND role_key = 'boss'));

  SELECT COUNT(*) INTO v_after_members
    FROM tmp_v181_top_users t
   WHERE EXISTS (
     SELECT 1 FROM sys_user_role ur
      WHERE ur.user_id = t.user_id AND ur.role_id = 1
   );

  IF v_before_members <> v_after_members THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: one or more top-role members were not preserved';
  END IF;

  IF EXISTS (SELECT 1 FROM sys_user_role WHERE role_id IN (21, 90))
     OR EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id IN (21, 90))
     OR EXISTS (
       SELECT 1
         FROM sys_user_role ur
         JOIN sys_user u ON u.id = ur.user_id
        WHERE ur.role_id = 1
          AND u.tenant_id = 1
          AND COALESCE(u.deleted, 0) <> 0
     ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V181 aborted: legacy role relations remain';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_v181_top_users;
  COMMIT;
END$$
DELIMITER ;

CALL apply_v181_merge_super_admin_roles();
DROP PROCEDURE IF EXISTS apply_v181_merge_super_admin_roles;
