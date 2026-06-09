-- ============================================================
-- V19: 新增「财务部(看全部)」与「网销」角色,并把财务部成员设为看全部
-- 背景(老板2026-06-09明确):会计部门(做账会计)、管家部门 → 只看自己;
--       只有"财务部"的人 + 老板 能看全部财务(对账/确认/核发)。
--       原实现是"所有finance角色看全部"过宽(把会计/管家也放开了),已在代码取消;
--       改由"财务部"成员持 data_scope=1 的专属角色来获得看全部。
-- 处理:①建 finance_hq(财务部,data_scope=1) 角色,分配给 财务部(dept_id=110) 成员;
--       ②建 online_sales(网销,data_scope=5) 角色备用(老板后续分配网销人员)。
-- 幂等:按 role_key 判存在,user_role 判重复,可重复执行。
-- 注意:涉及登录数据范围,执行后相关人员需重新登录一次(或清Redis login_user:*)才生效。
-- ============================================================

USE `zhehang_erp`;

-- ① 财务部角色(看全部财务)
INSERT INTO `sys_role` (`role_key`,`role_name`,`sort`,`status`,`data_scope`,`deleted`,`tenant_id`,`create_time`)
SELECT 'finance_hq','财务部(看全部财务)',7,0,1,0,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_role` WHERE `role_key`='finance_hq');

-- ② 网销角色(看本人,备用)
INSERT INTO `sys_role` (`role_key`,`role_name`,`sort`,`status`,`data_scope`,`deleted`,`tenant_id`,`create_time`)
SELECT 'online_sales','网销',8,0,5,0,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_role` WHERE `role_key`='online_sales');

-- ③ 把财务部(dept_id=110)的在职成员赋予 finance_hq 角色(看全部)
INSERT INTO `sys_user_role` (`user_id`,`role_id`)
SELECT u.`id`, (SELECT `id` FROM `sys_role` WHERE `role_key`='finance_hq' LIMIT 1)
FROM `sys_user` u
WHERE u.`dept_id`=110 AND u.`deleted`=0
  AND NOT EXISTS (
    SELECT 1 FROM `sys_user_role` ur
    WHERE ur.`user_id`=u.`id`
      AND ur.`role_id`=(SELECT `id` FROM `sys_role` WHERE `role_key`='finance_hq' LIMIT 1)
  );
