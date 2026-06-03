-- V5: 统一导航入口，隐藏历史重叠模块
-- 说明:
-- 1. 当前前端以 src/router/routes.ts 为主菜单来源；本迁移用于防止后续启用后端动态菜单时重复入口再次出现。
-- 2. 只隐藏旧菜单，不删除数据和权限；需要恢复时把 visible 改回 1 即可。

-- 通知统一保留「系统管理 / 通知公告」
UPDATE `sys_menu`
SET `path` = '/system/notification',
    `component` = 'system/notification',
    `perms` = 'system:notification:list',
    `icon` = 'Bell'
WHERE `id` = 105;

-- 隐藏历史 CRM 目录；当前客户/线索入口统一走前端「线索管理」
UPDATE `sys_menu`
SET `visible` = 0
WHERE `id` IN (300, 301, 302, 303, 304, 305, 306, 307);

-- 隐藏历史项目管理/工作流目录；当前任务入口统一走「任务中心」
UPDATE `sys_menu`
SET `visible` = 0
WHERE `id` IN (600, 601, 602, 603, 604, 900, 901, 902, 903, 904);

-- 隐藏历史销售管理目录；订单、合同、提成统一走「订单管理 / 任务中心」
UPDATE `sys_menu`
SET `visible` = 0
WHERE `id` IN (800, 801, 802, 803, 804, 805);

-- 隐藏历史报表中心目录；经营分析统一走「驾驶舱」
UPDATE `sys_menu`
SET `visible` = 0
WHERE `id` IN (1100, 1101, 1102, 1103);

-- 隐藏独立日志/消息目录；日志收束到「系统管理」，通知收束到「通知公告」
UPDATE `sys_menu`
SET `visible` = 0
WHERE `id` IN (1200, 1201, 1202, 1203, 1600, 1601, 1602);
