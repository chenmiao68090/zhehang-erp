-- V100: 角色「可见模块」——支持按角色配置登录后能看到哪些顶层模块(销售体系/提单中心/审批中心...)
-- 顶层模块路径逗号分隔(如 /customer,/order,/approval);为空/NULL = 不限制,回退到默认菜单可见性(向后兼容,天然可回退)
ALTER TABLE `sys_role`
  ADD COLUMN `visible_modules` VARCHAR(2048) DEFAULT NULL
  COMMENT '可见模块:顶层路径逗号分隔(如 /customer,/order),空=不限制';
