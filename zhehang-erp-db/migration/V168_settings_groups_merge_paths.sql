-- =====================================================================
-- V168_settings_groups_merge_paths.sql
-- 系统设置分组合并(业务规则/第三方对接/报表与看板/组织与权限+平台与审计):
-- 仅下列三个小类页面的完整路径发生变化,sys_role.visible_modules 存量配置同步改写:
--   /sys-order/contract-template → /sys-flow/contract-template
--   /sys-approval/workflow      → /sys-flow/workflow
--   /sys-dict/index             → /sys-flow/dict
-- (云客两页留在 /sys-inspect 原路径只改分组标题,不涉及数据。)
-- 替换按路径长度降序执行,防前缀吞噬;REPLACE 幂等,重复执行无副作用。
-- 生产核实(2026-07-15):角色 visible_modules 全存大类名,本迁移预期零行命中,
-- 属防御性改写;sys_menu 无上述路径行(仅顶层占位),无需迁移菜单表。
-- =====================================================================

UPDATE `sys_role`
SET `visible_modules` = REPLACE(`visible_modules`, '/sys-order/contract-template', '/sys-flow/contract-template')
WHERE `visible_modules` LIKE '%/sys-order/contract-template%';

UPDATE `sys_role`
SET `visible_modules` = REPLACE(`visible_modules`, '/sys-approval/workflow', '/sys-flow/workflow')
WHERE `visible_modules` LIKE '%/sys-approval/workflow%';

UPDATE `sys_role`
SET `visible_modules` = REPLACE(`visible_modules`, '/sys-dict/index', '/sys-flow/dict')
WHERE `visible_modules` LIKE '%/sys-dict/index%';
