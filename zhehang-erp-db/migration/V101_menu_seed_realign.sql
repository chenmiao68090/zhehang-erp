-- =====================================================================
-- V101_menu_seed_realign.sql  (干净重写版)
-- 目的:让后端菜单(sys_menu/sys_role_menu)与当前前端 routes.ts 顶层 path 对齐,
--       并按 6 个 DB 角色绑定"现有可见板块"。
-- 策略:DELETE 900001~900020 区间后再 INSERT(幂等、可重复执行);
--       只补顶层占位菜单(parent_id=0),不动旧的明细菜单。
-- 角色 id:super_admin=1 sys_admin=2 dept_manager=3 finance=4 sales=5 staff=6
-- =====================================================================

-- ---------- 第一部分:顶层占位菜单(id 900001~900020,path=前端顶层path) ----------
DELETE FROM `sys_menu` WHERE `id` BETWEEN 900001 AND 900020;

INSERT INTO `sys_menu`
  (`id`,`menu_name`,`parent_id`,`sort`,`path`,`component`,`menu_type`,`visible`,`status`,`perms`,`icon`,`create_by`,`tenant_id`)
VALUES
  (900001,'工作台',0,1,'/dashboard',NULL,'M',1,0,NULL,'dashboard',1,1),
  (900002,'客户管理',0,2,'/customer',NULL,'M',1,0,NULL,'user',1,1),
  (900003,'提单中心',0,3,'/order',NULL,'M',1,0,NULL,'document',1,1),
  (900004,'工商体系',0,4,'/gs',NULL,'M',1,0,NULL,'office-building',1,1),
  (900005,'刻章体系',0,5,'/seal',NULL,'M',1,0,NULL,'stamp',1,1),
  (900006,'会计体系',0,6,'/accounting',NULL,'M',1,0,NULL,'money',1,1),
  (900007,'财务体系',0,7,'/finance',NULL,'M',1,0,NULL,'wallet',1,1),
  (900008,'供应链',0,8,'/supply',NULL,'M',1,0,NULL,'box',1,1),
  (900009,'人力资源',0,9,'/hrm',NULL,'M',1,0,NULL,'avatar',1,1),
  (900010,'培训课程',0,10,'/training',NULL,'M',1,0,NULL,'reading',1,1),
  (900011,'行政管理',0,11,'/admin',NULL,'M',1,0,NULL,'suitcase',1,1),
  (900012,'巡检管理',0,12,'/inspect',NULL,'M',1,0,NULL,'view',1,1),
  (900013,'运营服务',0,13,'/operation-service',NULL,'M',1,0,NULL,'service',1,1),
  (900014,'任务中心',0,14,'/task-center',NULL,'M',1,0,NULL,'list',1,1),
  (900015,'组织架构',0,15,'/sys-org',NULL,'M',1,0,NULL,'share',1,1),
  (900016,'账号管理',0,16,'/sys-account',NULL,'M',1,0,NULL,'user-filled',1,1),
  (900017,'权限管理',0,17,'/sys-authority',NULL,'M',1,0,NULL,'lock',1,1),
  (900018,'流程管理',0,18,'/sys-flow',NULL,'M',1,0,NULL,'connection',1,1),
  (900019,'集成管理',0,19,'/sys-integration',NULL,'M',1,0,NULL,'link',1,1),
  (900020,'日志管理',0,20,'/sys-log',NULL,'M',1,0,NULL,'notebook',1,1);

-- ---------- 第二部分:角色绑定(先删本区间再插,幂等) ----------
DELETE FROM `sys_role_menu` WHERE `menu_id` BETWEEN 900001 AND 900020;

INSERT INTO `sys_role_menu` (`role_id`,`menu_id`) VALUES
  -- super_admin(1):全部 20 个板块
  (1,900001),(1,900002),(1,900003),(1,900004),(1,900005),(1,900006),(1,900007),(1,900008),(1,900009),(1,900010),
  (1,900011),(1,900012),(1,900013),(1,900014),(1,900015),(1,900016),(1,900017),(1,900018),(1,900019),(1,900020),
  -- sys_admin(2):业务板块 + 系统设置六件套(照搬现有 meta.roles,不含 finance/supply)
  (2,900001),(2,900002),(2,900003),(2,900004),(2,900005),(2,900006),(2,900009),(2,900010),(2,900011),(2,900012),
  (2,900013),(2,900014),(2,900015),(2,900016),(2,900017),(2,900018),(2,900019),(2,900020),
  -- dept_manager(3):同 sys_admin
  (3,900001),(3,900002),(3,900003),(3,900004),(3,900005),(3,900006),(3,900009),(3,900010),(3,900011),(3,900012),
  (3,900013),(3,900014),(3,900015),(3,900016),(3,900017),(3,900018),(3,900019),(3,900020),
  -- finance(4):提单/会计/工商/刻章/财务
  (4,900003),(4,900004),(4,900005),(4,900006),(4,900007),
  -- sales(5):客户/提单/运营/任务/供应链
  (5,900002),(5,900003),(5,900008),(5,900013),(5,900014),
  -- staff(6):仅工商(其余全员板块无 meta.roles 恒可见,不需绑)
  (6,900004);

-- ---------- 第三部分:老板角色 boss(role_key=boss,全部数据权限,看全部) ----------
-- 本迁移只维护角色和菜单，不再创建或重置任何固定口令账号。
DELETE FROM `sys_role_menu` WHERE `role_id`=90;
DELETE FROM `sys_role` WHERE `id`=90 OR `role_key`='boss';

INSERT INTO `sys_role` (`id`,`role_name`,`role_key`,`sort`,`status`,`data_scope`,`remark`,`create_by`,`tenant_id`)
VALUES (90,'老板','boss',0,0,1,'老板账号,查看全部板块',1,1);

-- 如已存在 boss 用户，只绑定角色；不存在时由系统管理员通过随机初始口令流程创建。
INSERT INTO `sys_user_role` (`user_id`,`role_id`)
SELECT `id`,90 FROM `sys_user` WHERE `username`='boss' AND `deleted`=0
ON DUPLICATE KEY UPDATE `role_id`=VALUES(`role_id`);

-- boss 角色绑定全部 20 个板块(前端已让 boss 走全量短路;这里后端也给全,双保险)
INSERT INTO `sys_role_menu` (`role_id`,`menu_id`) VALUES
  (90,900001),(90,900002),(90,900003),(90,900004),(90,900005),(90,900006),(90,900007),(90,900008),(90,900009),(90,900010),
  (90,900011),(90,900012),(90,900013),(90,900014),(90,900015),(90,900016),(90,900017),(90,900018),(90,900019),(90,900020);
