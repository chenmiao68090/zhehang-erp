-- ============================================================
-- V42: 用户管理入口并入员工管理
-- 目标:保留 sys_user 作为登录/权限底层表,但业务维护统一走“员工与账号”。
-- 幂等:只调整菜单入口和权限文案,不删除账号、不影响登录。
-- ============================================================

USE `zhehang_erp`;

UPDATE sys_menu
SET menu_name = '员工与账号',
    path = '/system/employee',
    component = 'org/employee/index',
    perms = 'org:employee:list',
    icon = 'employee',
    visible = 1,
    status = 0
WHERE id = 101;

UPDATE sys_menu SET menu_name = '员工账号查询', perms = 'org:employee:query' WHERE id = 10101;
UPDATE sys_menu SET menu_name = '员工账号新增', perms = 'org:employee:add' WHERE id = 10102;
UPDATE sys_menu SET menu_name = '员工账号修改', perms = 'org:employee:edit' WHERE id = 10103;
UPDATE sys_menu SET menu_name = '员工账号删除', perms = 'org:employee:remove' WHERE id = 10104;
UPDATE sys_menu SET menu_name = '重置员工密码', perms = 'org:employee:resetPwd' WHERE id = 10105;
UPDATE sys_menu SET menu_name = '员工账号导出', perms = 'org:employee:export' WHERE id = 10106;
