-- =============================================================================
-- V143 培训中心菜单拆分
-- 目标:
-- 1) 从培训中心左侧隐藏旧「知识文库」入口。
-- 2) 把原「员工培训/SOP」单页拆成 6 个独立左侧菜单:
--    课程库 / 学习任务 / 考核评分 / 岗位路径/认证 / SOP标准库 / 老板看板。
-- 说明:只调整 sys_menu/sys_role_menu,不删除知识库数据,不改培训业务数据。
-- =============================================================================

-- 旧知识文库入口下线:只隐藏菜单,保留历史路由和数据。
UPDATE `sys_menu`
SET `visible` = 0,
    `status` = 1,
    `update_time` = NOW()
WHERE `deleted` = 0
  AND (`path` = '/file' OR `menu_name` = '知识文库');

-- 培训顶层改为「培训中心」。
UPDATE `sys_menu`
SET `menu_name` = '培训中心',
    `icon` = 'reading',
    `visible` = 1,
    `status` = 0,
    `update_time` = NOW()
WHERE (`id` = 900010 OR `path` = '/training') AND `deleted` = 0;

-- 6 个培训子菜单。900110 复用旧「员工培训/SOP」菜单 ID,避免已授权角色丢入口。
INSERT INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (900110, '课程库', 900010, 1, 'courses', NULL, 'C', 1, 0, NULL, 'reading', 1, 1),
  (900111, '学习任务', 900010, 2, 'learning', NULL, 'C', 1, 0, NULL, 'notebook', 1, 1),
  (900112, '考核评分', 900010, 3, 'exams', NULL, 'C', 1, 0, NULL, 'document-checked', 1, 1),
  (900113, '岗位路径/认证', 900010, 4, 'paths', NULL, 'C', 1, 0, NULL, 'connection', 1, 1),
  (900114, 'SOP标准库', 900010, 5, 'sop', NULL, 'C', 1, 0, NULL, 'tickets', 1, 1),
  (900115, '老板看板', 900010, 6, 'dashboard', NULL, 'C', 1, 0, NULL, 'trend-charts', 1, 1)
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

-- 全员可见:课程库、学习任务、SOP标准库。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 900110
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr', 'sales', 'online_sales', 'finance', 'finance_hq', 'staff');

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 900111
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr', 'sales', 'online_sales', 'finance', 'finance_hq', 'staff');

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 900114
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr', 'sales', 'online_sales', 'finance', 'finance_hq', 'staff');

-- 管理侧可见:考核评分、岗位路径/认证、老板看板。
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 900112
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr');

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 900113
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr');

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 900115
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr');
