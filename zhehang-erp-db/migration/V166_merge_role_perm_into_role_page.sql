-- =====================================================================
-- V166_merge_role_perm_into_role_page.sql
-- 前端「角色权限设置」页并入「角色管理」页成为标签页,路由从
--   /sys-authority/role-perm、/sys-authority/role → /sys-org/role
--   /sys-authority/menu → /sys-org/menu(菜单管理转为隐藏路由)
-- sys_role.visible_modules 里存的是小类完整路径,存量配置需同步改写,
-- 否则已做过限定的角色会静默丢失这几页的可见性。
-- 幂等:REPLACE 找不到目标串即不改;重复执行无副作用。
-- 注意顺序:role-perm 必须先于 role 替换(后者是前者的前缀)。
-- 可能产生重复 token(如 /sys-org/role,/sys-org/role),前端按 Set 解析,无害,
-- 下次在页面保存时会自动归一。
-- =====================================================================

UPDATE `sys_role`
SET `visible_modules` = REPLACE(`visible_modules`, '/sys-authority/role-perm', '/sys-org/role')
WHERE `visible_modules` LIKE '%/sys-authority/role-perm%';

UPDATE `sys_role`
SET `visible_modules` = REPLACE(`visible_modules`, '/sys-authority/role', '/sys-org/role')
WHERE `visible_modules` LIKE '%/sys-authority/role%';

UPDATE `sys_role`
SET `visible_modules` = REPLACE(`visible_modules`, '/sys-authority/menu', '/sys-org/menu')
WHERE `visible_modules` LIKE '%/sys-authority/menu%';
