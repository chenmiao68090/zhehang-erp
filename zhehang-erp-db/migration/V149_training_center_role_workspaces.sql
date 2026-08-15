-- =============================================================================
-- V149 培训中心按角色收拢为少页面工作台
-- 目标:
-- 1) 员工仅保留「我的学习、岗位手册」。
-- 2) 主管增加「团队培训」；人事/管理员使用「培训运营、内容中心、培训看板」。
-- 3) 老板只保留「培训看板、我的学习」。
-- 4) 隐藏历史细分菜单但保留路由和全部培训业务数据。
-- 说明:只调整菜单和角色菜单关系，不删除课程、课件、题库、学习记录或 SOP。
-- =============================================================================

CREATE TEMPORARY TABLE IF NOT EXISTS `tmp_training_roles_v149` (
  `role_id` BIGINT NOT NULL PRIMARY KEY
) ENGINE=MEMORY;

TRUNCATE TABLE `tmp_training_roles_v149`;

-- 记住升级前已经拥有培训入口的角色，未知的自定义岗位角色按普通员工保留学习能力。
INSERT IGNORE INTO `tmp_training_roles_v149` (`role_id`)
SELECT DISTINCT `role_id`
FROM `sys_role_menu`
WHERE `menu_id` BETWEEN 900110 AND 900122;

START TRANSACTION;

INSERT INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (900111, '我的学习', 900010, 1, 'learning', NULL, 'C', 1, 0, NULL, 'reading', 1, 1),
  (900114, '岗位手册', 900010, 2, 'handbook', NULL, 'C', 1, 0, NULL, 'notebook', 1, 1),
  (900120, '团队培训', 900010, 3, 'team', NULL, 'C', 1, 0, NULL, 'user-filled', 1, 1),
  (900123, '培训运营', 900010, 3, 'operations', NULL, 'C', 1, 0, NULL, 'operation', 1, 1),
  (900110, '内容中心', 900010, 4, 'content', NULL, 'C', 1, 0, NULL, 'folder-opened', 1, 1),
  (900115, '培训看板', 900010, 5, 'dashboard', NULL, 'C', 1, 0, NULL, 'trend-charts', 1, 1)
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
  `update_time` = NOW();

-- 历史入口改为隐藏，旧 URL 由前端兼容跳转。
UPDATE `sys_menu`
SET `visible` = 0,
    `status` = 1,
    `update_time` = NOW()
WHERE `id` IN (900112, 900113, 900116, 900117, 900118, 900119, 900121, 900122)
  AND `deleted` = 0;

UPDATE `sys_menu`
SET `menu_name` = '培训中心',
    `path` = '/training',
    `visible` = 1,
    `status` = 0,
    `icon` = 'reading',
    `update_time` = NOW()
WHERE `id` = 900010 AND `deleted` = 0;

-- 清理培训子菜单旧授权，再按角色工作台重新授权；父菜单授权保留。
DELETE FROM `sys_role_menu`
WHERE `menu_id` BETWEEN 900110 AND 900123;

-- 所有在用的非老板角色（含复制角色）默认拥有员工学习入口。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`id` IN (900111, 900114)
WHERE r.`deleted` = 0 AND r.`role_key` <> 'boss';

-- 主管:我的学习 + 岗位手册 + 团队培训。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`id` IN (900111, 900114, 900120)
WHERE r.`deleted` = 0
  AND (r.`role_key` IN ('manager', 'dept_manager')
    OR r.`role_key` LIKE 'manager\\_\\_%'
    OR r.`role_key` LIKE 'dept\\_manager\\_\\_%');

-- 人事/培训管理员:我的学习 + 岗位手册 + 培训运营 + 内容中心 + 培训看板。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`id` IN (900111, 900114, 900123, 900110, 900115)
WHERE r.`deleted` = 0
  AND (r.`role_key` IN ('super_admin', 'admin', 'sys_admin', 'hr')
    OR r.`role_key` LIKE 'super\\_admin\\_\\_%'
    OR r.`role_key` LIKE 'sys\\_admin\\_\\_%'
    OR r.`role_key` LIKE 'hr\\_\\_%');

-- 老板:只看全公司培训结果；本人有任务时仍可进入我的学习。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`id` IN (900111, 900115)
WHERE r.`deleted` = 0 AND r.`role_key` = 'boss';

-- 确保上述角色拥有培训中心父菜单。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT DISTINCT role_id, 900010
FROM (
  SELECT `role_id` FROM `tmp_training_roles_v149`
  UNION ALL
  SELECT `id` FROM `sys_role` WHERE `deleted` = 0
) roles_with_training;

COMMIT;

DROP TEMPORARY TABLE IF EXISTS `tmp_training_roles_v149`;
