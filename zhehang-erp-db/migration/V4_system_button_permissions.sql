-- Add button-level permissions for system management and logs.
-- This script is repeatable on local/dev databases.

INSERT IGNORE INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(10101, '用户查询', 101, 1, NULL, NULL, 'F', 0, 0, 'system:user:query', NULL, 1, 1),
(10102, '用户新增', 101, 2, NULL, NULL, 'F', 0, 0, 'system:user:add', NULL, 1, 1),
(10103, '用户修改', 101, 3, NULL, NULL, 'F', 0, 0, 'system:user:edit', NULL, 1, 1),
(10104, '用户删除', 101, 4, NULL, NULL, 'F', 0, 0, 'system:user:remove', NULL, 1, 1),
(10105, '重置密码', 101, 5, NULL, NULL, 'F', 0, 0, 'system:user:resetPwd', NULL, 1, 1),
(10106, '用户导出', 101, 6, NULL, NULL, 'F', 0, 0, 'system:user:export', NULL, 1, 1),
(10201, '角色查询', 102, 1, NULL, NULL, 'F', 0, 0, 'system:role:query', NULL, 1, 1),
(10202, '角色新增', 102, 2, NULL, NULL, 'F', 0, 0, 'system:role:add', NULL, 1, 1),
(10203, '角色修改', 102, 3, NULL, NULL, 'F', 0, 0, 'system:role:edit', NULL, 1, 1),
(10204, '角色删除', 102, 4, NULL, NULL, 'F', 0, 0, 'system:role:remove', NULL, 1, 1),
(10301, '菜单查询', 103, 1, NULL, NULL, 'F', 0, 0, 'system:menu:query', NULL, 1, 1),
(10302, '菜单新增', 103, 2, NULL, NULL, 'F', 0, 0, 'system:menu:add', NULL, 1, 1),
(10303, '菜单修改', 103, 3, NULL, NULL, 'F', 0, 0, 'system:menu:edit', NULL, 1, 1),
(10304, '菜单删除', 103, 4, NULL, NULL, 'F', 0, 0, 'system:menu:remove', NULL, 1, 1),
(120101, '登录日志导出', 1201, 1, NULL, NULL, 'F', 0, 0, 'log:login:export', NULL, 1, 1),
(120102, '登录日志清空', 1201, 2, NULL, NULL, 'F', 0, 0, 'log:login:remove', NULL, 1, 1),
(120201, '操作日志导出', 1202, 1, NULL, NULL, 'F', 0, 0, 'log:oper:export', NULL, 1, 1),
(120202, '操作日志清空', 1202, 2, NULL, NULL, 'F', 0, 0, 'log:oper:remove', NULL, 1, 1);

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT 1, `id`
FROM `sys_menu`
WHERE `id` IN (
  10101, 10102, 10103, 10104, 10105, 10106,
  10201, 10202, 10203, 10204,
  10301, 10302, 10303, 10304,
  120101, 120102, 120201, 120202
);
