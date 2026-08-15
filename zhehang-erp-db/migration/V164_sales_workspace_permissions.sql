-- =============================================================================
-- V164 销售体系角色与菜单权限修复（2026-07-13）
--
-- 现场问题：
-- 1) 当前“销售人员”复制自 staff，role_key=staff__mr8wj07mixr，无法通过
--    /customer 的 sales 角色门禁；同时 data_scope=4，错误扩大为本部门及以下。
-- 2) sys_menu 只有 /customer 父目录，没有 V164/V165 已上线的 4 个可见子路由，
--    前端按 sys_role_menu 二次过滤后会把整块销售体系隐藏。
--
-- 修复边界：
-- - 只修当前租户 tenant_id=1 的销售角色和 /customer 菜单；
-- - 不改客户、线索、订单、业绩等业务数据；
-- - 不改 visible_modules（生产数据已正确包含“销售体系”）；
-- - 角色17收紧为本人数据，角色16继续保持本部门及以下；
-- - 直接改库不会触发 TokenService，应用本迁移时必须按发布清单对受影响用户
--   在提交前、提交后各 INCR 一次 Redis auth_version:user:<userId>。
-- =============================================================================

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS `validate_v164_sales_permissions`;
DELIMITER $$
CREATE PROCEDURE `validate_v164_sales_permissions`()
BEGIN
  -- 父菜单必须仍是本租户正在使用的 /customer，避免把子菜单挂错树。
  IF (SELECT COUNT(*)
      FROM `sys_menu`
      WHERE `id` = 900002
        AND `tenant_id` = 1
        AND `path` = '/customer'
        AND `menu_type` = 'M'
        AND `status` = 0
        AND `deleted` = 0) <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 aborted: expected active tenant-1 /customer menu 900002 not found';
  END IF;

  -- 固定ID只允许是本迁移已经创建的同一菜单，禁止 ON DUPLICATE 覆盖别的业务菜单。
  IF EXISTS (
    SELECT 1
    FROM `sys_menu`
    WHERE `id` IN (900124, 900125, 900126, 900127)
      AND NOT (
        `tenant_id` = 1
        AND `parent_id` = 900002
        AND ((`id` = 900124 AND `path` = 'workbench')
          OR (`id` = 900125 AND `path` = 'lead')
          OR (`id` = 900126 AND `path` = 'customers')
          OR (`id` = 900127 AND `path` = 'perf-board'))
      )
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 aborted: menu id 900124-900127 is occupied by another menu';
  END IF;

  -- 同一父级下的相对path也必须唯一，避免出现两个ID代表同一个前端入口。
  IF EXISTS (
    SELECT 1
    FROM `sys_menu`
    WHERE `tenant_id` = 1
      AND `parent_id` = 900002
      AND `deleted` = 0
      AND `path` IN ('workbench', 'lead', 'customers', 'perf-board')
      AND `id` NOT IN (900124, 900125, 900126, 900127)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 aborted: /customer child path is already used by another menu id';
  END IF;

  -- 只允许修复现场核实过的两个角色；角色或租户发生变化时必须重新审查。
  IF (SELECT COUNT(*)
      FROM `sys_role`
      WHERE `id` = 16
        AND `tenant_id` = 1
        AND `role_name` = '销售负责人'
        AND `role_key` = 'dept_manager__mr8witl20lq'
        AND `data_scope` = 4
        AND `status` = 0
        AND `deleted` = 0) <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 aborted: sales leader role 16 no longer matches reviewed state';
  END IF;

  IF (SELECT COUNT(*)
      FROM `sys_role`
      WHERE `id` = 17
        AND `tenant_id` = 1
        AND `role_name` = '销售人员'
        AND `role_key` IN ('staff__mr8wj07mixr', 'sales__mr8wj07mixr')
        AND `data_scope` IN (4, 5)
        AND `status` = 0
        AND `deleted` = 0) <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 aborted: sales role 17 no longer matches reviewed state';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `sys_role`
    WHERE `role_key` = 'sales__mr8wj07mixr'
      AND `id` <> 17
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 aborted: target sales role key is already occupied';
  END IF;

  -- 审批设计器按精确role_key保存审批人；有引用时禁止静默改名。
  IF EXISTS (
    SELECT 1 FROM `wf_process_def`
    WHERE `deleted` = 0
      AND CAST(`process_config` AS CHAR) LIKE '%staff__mr8wj07mixr%'
  ) OR EXISTS (
    SELECT 1 FROM `wf_process_version`
    WHERE CAST(`process_config` AS CHAR) LIKE '%staff__mr8wj07mixr%'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 aborted: old sales role key is referenced by workflow configuration';
  END IF;
END$$
DELIMITER ;

CALL `validate_v164_sales_permissions`();
DROP PROCEDURE IF EXISTS `validate_v164_sales_permissions`;

START TRANSACTION;

-- 锁定并再次确认三行关键数据，避免校验后到写入前被并发修改。
SELECT `id` INTO @v164_parent_menu_id
FROM `sys_menu`
WHERE `id` = 900002 AND `tenant_id` = 1 AND `deleted` = 0
FOR UPDATE;

SELECT `id` INTO @v164_sales_leader_role_id
FROM `sys_role`
WHERE `id` = 16 AND `tenant_id` = 1 AND `deleted` = 0
FOR UPDATE;

SELECT `id` INTO @v164_sales_role_id
FROM `sys_role`
WHERE `id` = 17 AND `tenant_id` = 1 AND `deleted` = 0
FOR UPDATE;

-- 销售人员继承 sales 路由语义，并把数据范围从“本部门及以下”收紧到“仅本人”。
UPDATE `sys_role`
SET `role_key` = 'sales__mr8wj07mixr',
    `data_scope` = 5,
    `update_time` = NOW()
WHERE `id` = 17
  AND `tenant_id` = 1
  AND `role_name` = '销售人员'
  AND `role_key` IN ('staff__mr8wj07mixr', 'sales__mr8wj07mixr')
  AND `data_scope` IN (4, 5)
  AND `status` = 0
  AND `deleted` = 0;

-- 这4个菜单与前端V164/V165当前唯一可见入口一一对应。
-- perms复用既有crm权限码，使只复制新销售菜单的角色也能通过云客拨号的hasModule('crm')。
INSERT INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`,
   `visible`, `status`, `perms`, `icon`, `remark`, `create_by`, `tenant_id`, `deleted`)
VALUES
  (900124, '今日工作', 900002, 1, 'workbench', NULL, 'C', 1, 0,
   'crm:lead:list', 'tickets', 'V164销售体系权限修复', 1, 1, 0),
  (900125, '找客户', 900002, 2, 'lead', NULL, 'C', 1, 0,
   'crm:lead:list', 'search', 'V164销售体系权限修复', 1, 1, 0),
  (900126, '我的客户', 900002, 3, 'customers', NULL, 'C', 1, 0,
   'crm:customer:list', 'user-filled', 'V164销售体系权限修复', 1, 1, 0),
  (900127, '我的结果', 900002, 4, 'perf-board', NULL, 'C', 1, 0,
   'crm:customer:list', 'data-line', 'V164销售体系权限修复', 1, 1, 0)
ON DUPLICATE KEY UPDATE
  `menu_name` = VALUES(`menu_name`),
  `parent_id` = VALUES(`parent_id`),
  `sort` = VALUES(`sort`),
  `path` = VALUES(`path`),
  `component` = VALUES(`component`),
  `menu_type` = VALUES(`menu_type`),
  `visible` = VALUES(`visible`),
  `status` = VALUES(`status`),
  `perms` = VALUES(`perms`),
  `icon` = VALUES(`icon`),
  `remark` = VALUES(`remark`),
  `tenant_id` = VALUES(`tenant_id`),
  `deleted` = 0,
  `update_time` = NOW();

-- 两个现场角色此前都缺少/customer父目录；父+子必须同时授权才能构成后端路由树。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, 900002
FROM `sys_role` r
WHERE r.`id` IN (16, 17)
  AND r.`tenant_id` = 1
  AND r.`status` = 0
  AND r.`deleted` = 0;

-- 只给现场两个销售角色补齐4个真实入口；不顺带改其他部门主管、员工或特权角色。
-- 以后从这两个有效销售角色复制的新角色，会继承完整menuIds和正确sales/manager前缀。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m
  ON m.`id` IN (900124, 900125, 900126, 900127)
 AND m.`tenant_id` = r.`tenant_id`
 AND m.`parent_id` = 900002
 AND m.`status` = 0
 AND m.`deleted` = 0
WHERE r.`tenant_id` = 1
  AND r.`id` IN (16, 17)
  AND r.`status` = 0
  AND r.`deleted` = 0;

COMMIT;

DROP PROCEDURE IF EXISTS `assert_v164_sales_permissions`;
DELIMITER $$
CREATE PROCEDURE `assert_v164_sales_permissions`()
BEGIN
  IF (SELECT COUNT(*)
      FROM `sys_role`
      WHERE `id` = 17
        AND `tenant_id` = 1
        AND `role_key` = 'sales__mr8wj07mixr'
        AND `data_scope` = 5
        AND `status` = 0
        AND `deleted` = 0) <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 failed: sales role key or self-only data scope was not applied';
  END IF;

  IF (SELECT COUNT(*)
      FROM `sys_role`
      WHERE `id` = 16
        AND `tenant_id` = 1
        AND `role_key` = 'dept_manager__mr8witl20lq'
        AND `data_scope` = 4
        AND `status` = 0
        AND `deleted` = 0) <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 failed: sales leader role scope changed unexpectedly';
  END IF;

  IF (SELECT COUNT(*)
      FROM `sys_menu`
      WHERE `id` IN (900124, 900125, 900126, 900127)
        AND `tenant_id` = 1
        AND `parent_id` = 900002
        AND `visible` = 1
        AND `status` = 0
        AND `deleted` = 0) <> 4 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 failed: expected four active /customer child menus';
  END IF;

  IF (SELECT COUNT(*)
      FROM `sys_role_menu`
      WHERE `role_id` IN (16, 17)
        AND `menu_id` IN (900002, 900124, 900125, 900126, 900127)) <> 10 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 failed: target sales roles do not have complete parent-child menus';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM `sys_role_menu` rm
    JOIN `sys_role` r ON r.`id` = rm.`role_id`
    WHERE r.`tenant_id` = 1
      AND r.`status` = 0
      AND r.`deleted` = 0
      AND SUBSTRING_INDEX(r.`role_key`, '__', 1) = 'staff'
      AND rm.`menu_id` IN (900124, 900125, 900126, 900127)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V164 failed: an ordinary staff role received a sales workspace menu';
  END IF;
END$$
DELIMITER ;

CALL `assert_v164_sales_permissions`();
DROP PROCEDURE IF EXISTS `assert_v164_sales_permissions`;

-- 发布脚本在本文件执行成功后还必须做结构断言和Redis精准会话失效；
-- 本迁移不执行全局会话失效，也不删除任何login_user会话键。
