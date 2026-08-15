-- V184: close the audited permission gap for twelve active users without assigning any role.
-- Scope: tenant 1, existing active roles 11/12/13/14/15/18/19/20/91 only.
-- The one active account without an effective role is deliberately left unchanged.
-- Re-running is allowed only when the exact final relation set already exists.

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS apply_v184_role_permission_single_source;
DELIMITER $$
CREATE PROCEDURE apply_v184_role_permission_single_source()
BEGIN
  DECLARE v_count INT DEFAULT 0;
  DECLARE v_target_users INT DEFAULT 0;
  DECLARE v_no_role_users INT DEFAULT 0;
  DECLARE v_existing_relations INT DEFAULT 0;
  DECLARE v_extra_relations INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DROP TEMPORARY TABLE IF EXISTS tmp_v184_roles;
  CREATE TEMPORARY TABLE tmp_v184_roles (
    role_id BIGINT NOT NULL,
    role_key VARCHAR(100) NOT NULL,
    expected_active_users INT NOT NULL,
    PRIMARY KEY (role_id)
  ) ENGINE=MEMORY;

  INSERT INTO tmp_v184_roles (role_id, role_key, expected_active_users) VALUES
    (11, 'dept_manager__mr8wdpphxtn', 1),
    (12, 'staff__mr8wgtn3xzs', 3),
    (13, 'dept_manager__mr8wi48zgyr', 1),
    (14, 'dept_manager__mr8wifwj9qx', 1),
    (15, 'staff__mr8wilh72cd', 2),
    (18, 'dept_manager__mr8wj7zy2lr', 1),
    (19, 'dept_manager__mr8wjgxoug3', 1),
    (20, 'staff__mr8wjr8jnty', 1),
    (91, 'staff__mrlnm70jedy', 1);

  SELECT COUNT(*) INTO v_count
    FROM tmp_v184_roles t
    JOIN sys_role r
      ON r.id = t.role_id
     AND r.tenant_id = 1
     AND r.role_key = t.role_key
     AND r.status = 0
     AND r.deleted = 0
   FOR UPDATE;

  IF v_count <> 9 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: audited role identity or state changed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM sys_role
     WHERE id = 19
       AND tenant_id = 1
       AND visible_modules IN (
         '/customer/ad-leads,提单中心,审批中心,运营体系,培训中心,管理体系',
         '/customer/lead,提单中心,审批中心,运营体系,培训中心,管理体系'
       )
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: audited operation role page scope changed';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM tmp_v184_roles t
     WHERE (
       SELECT COUNT(DISTINCT ur.user_id)
         FROM sys_user_role ur
         JOIN sys_user u
           ON u.id = ur.user_id
          AND u.tenant_id = 1
          AND u.status = 0
          AND u.deleted = 0
        WHERE ur.role_id = t.role_id
     ) <> t.expected_active_users
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: audited active role membership changed';
  END IF;

  SELECT COUNT(DISTINCT ur.user_id) INTO v_target_users
    FROM sys_user_role ur
    JOIN tmp_v184_roles t ON t.role_id = ur.role_id
    JOIN sys_user u
      ON u.id = ur.user_id
     AND u.tenant_id = 1
     AND u.status = 0
     AND u.deleted = 0;

  IF v_target_users <> 12 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: target user count is no longer twelve';
  END IF;

  SELECT COUNT(*) INTO v_no_role_users
    FROM sys_user u
   WHERE u.tenant_id = 1
     AND u.status = 0
     AND u.deleted = 0
     AND NOT EXISTS (
       SELECT 1
         FROM sys_user_role ur
         JOIN sys_role r
           ON r.id = ur.role_id
          AND r.tenant_id = 1
          AND r.status = 0
          AND r.deleted = 0
        WHERE ur.user_id = u.id
     );

  IF v_no_role_users <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: no-role account count changed; no automatic assignment allowed';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_v184_role_menu;
  CREATE TEMPORARY TABLE tmp_v184_role_menu (
    role_id BIGINT NOT NULL,
    menu_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, menu_id)
  ) ENGINE=MEMORY;

  -- Common employee baseline already used by the audited finance/HR/sales roles:
  -- dashboard, workflow, files, profile and messages. Parent nodes are retained for compatibility.
  INSERT INTO tmp_v184_role_menu (role_id, menu_id)
  SELECT t.role_id, m.menu_id
    FROM tmp_v184_roles t
    CROSS JOIN (
      SELECT 1 menu_id UNION ALL SELECT 900 UNION ALL SELECT 901 UNION ALL SELECT 902
      UNION ALL SELECT 903 UNION ALL SELECT 904 UNION ALL SELECT 1000 UNION ALL SELECT 1001
      UNION ALL SELECT 1002 UNION ALL SELECT 1500 UNION ALL SELECT 1600 UNION ALL SELECT 1601
      UNION ALL SELECT 1602
    ) m;

  -- Accounting workbench: voucher, ledger, reports, tax and invoice only.
  INSERT INTO tmp_v184_role_menu (role_id, menu_id)
  SELECT r.role_id, m.menu_id
    FROM (SELECT 11 role_id UNION ALL SELECT 12) r
    CROSS JOIN (
      SELECT 500 menu_id UNION ALL SELECT 501 UNION ALL SELECT 502
      UNION ALL SELECT 503 UNION ALL SELECT 504 UNION ALL SELECT 505
    ) m;

  -- Address/channel operations: existing supply-chain permission family.
  INSERT INTO tmp_v184_role_menu (role_id, menu_id)
  SELECT 18, m.menu_id
    FROM (
      SELECT 700 menu_id UNION ALL SELECT 701 UNION ALL SELECT 702
      UNION ALL SELECT 703 UNION ALL SELECT 704
    ) m;

  -- The old /customer/ad-leads path now redirects to the real lead page.
  INSERT INTO tmp_v184_role_menu (role_id, menu_id) VALUES (19, 300), (19, 301);

  SELECT COUNT(DISTINCT d.menu_id) INTO v_count
    FROM tmp_v184_role_menu d
    JOIN sys_menu m
      ON m.id = d.menu_id
     AND m.tenant_id = 1
     AND m.deleted = 0;

  IF v_count <> 26 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: one or more audited permission nodes are missing';
  END IF;

  SELECT COUNT(*) INTO v_count
    FROM tmp_v184_role_menu d
    JOIN sys_menu m ON m.id = d.menu_id
   WHERE m.tenant_id = 1
     AND m.status = 0
     AND m.deleted = 0
     AND LENGTH(COALESCE(m.perms, '')) > 0;

  IF v_count <> 105 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: audited permission codes changed';
  END IF;

  SELECT COUNT(*) INTO v_existing_relations
    FROM sys_role_menu rm
    JOIN tmp_v184_roles t ON t.role_id = rm.role_id;

  SELECT COUNT(*) INTO v_extra_relations
    FROM sys_role_menu rm
    JOIN tmp_v184_roles t ON t.role_id = rm.role_id
    LEFT JOIN tmp_v184_role_menu d
      ON d.role_id = rm.role_id AND d.menu_id = rm.menu_id
   WHERE d.role_id IS NULL;

  IF v_extra_relations <> 0 OR v_existing_relations NOT IN (0, 136) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: target role permissions changed or are partially applied';
  END IF;

  IF v_existing_relations = 136 AND EXISTS (
    SELECT 1
      FROM tmp_v184_role_menu d
     WHERE NOT EXISTS (
       SELECT 1 FROM sys_role_menu rm
        WHERE rm.role_id = d.role_id AND rm.menu_id = d.menu_id
     )
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: final permission relation set is incomplete';
  END IF;

  -- Normalize only the one audited retired path; all other role page settings stay byte-for-byte unchanged.
  UPDATE sys_role
     SET visible_modules = REPLACE(visible_modules, '/customer/ad-leads', '/customer/lead')
   WHERE id = 19
     AND tenant_id = 1
     AND role_key = 'dept_manager__mr8wjgxoug3'
     AND visible_modules LIKE '%/customer/ad-leads%';

  INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
  SELECT role_id, menu_id FROM tmp_v184_role_menu;

  SELECT COUNT(*) INTO v_count
    FROM sys_role_menu rm
    JOIN tmp_v184_role_menu d
      ON d.role_id = rm.role_id AND d.menu_id = rm.menu_id;

  IF v_count <> 136 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: final permission relation count is not 136';
  END IF;

  IF EXISTS (
    SELECT 1 FROM sys_role
     WHERE id = 19 AND tenant_id = 1
       AND visible_modules LIKE '%/customer/ad-leads%'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: retired operation lead path remains';
  END IF;

  SELECT COUNT(*) INTO v_count
    FROM sys_user u
   WHERE u.tenant_id = 1
     AND u.status = 0
     AND u.deleted = 0
     AND NOT EXISTS (
       SELECT 1
         FROM sys_user_role ur
         JOIN sys_role r
           ON r.id = ur.role_id
          AND r.tenant_id = 1
          AND r.status = 0
          AND r.deleted = 0
        WHERE ur.user_id = u.id
     );

  IF v_count <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V184 aborted: no-role account was unexpectedly changed';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_v184_role_menu;
  DROP TEMPORARY TABLE IF EXISTS tmp_v184_roles;
  COMMIT;
END$$
DELIMITER ;

CALL apply_v184_role_permission_single_source();
DROP PROCEDURE IF EXISTS apply_v184_role_permission_single_source;
