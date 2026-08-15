-- ============================================================
-- V23: 新增「人事(hr)」角色,保护薪资/绩效/员工档案/简历等敏感HR数据
-- 背景(全模块普查):HR模块零角色控制,任何登录员工可看全员 薪资(base_salary/奖金/个税/实发)、
--   员工档案(身份证/手机/住址/紧急联系人 强PII)、绩效、候选人简历。表暂空但隐患严重。
-- 处理:建 hr 角色(分配给人事部 dept109);代码侧:HR/管理员看全部,普通员工只看自己(经
--   org_employee.user_id 映射当前登录用户→员工档案),简历仅HR/管理员可见。
-- 说明:hr 角色 data_scope=5(其它模块仍只看本人,不越权);"看全部HR数据"由角色判定(hasAnyRole hr),
--   不靠 data_scope=1,避免HR连带看到全部线索/订单。
-- 幂等:按 role_key 判存在。执行后人事人员需重新登录一次拿角色。
-- ============================================================

USE `zhehang_erp`;

INSERT INTO `sys_role` (`role_key`,`role_name`,`sort`,`status`,`data_scope`,`deleted`,`tenant_id`,`create_time`)
SELECT 'hr','人事(HR)',9,0,5,0,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_role` WHERE `role_key`='hr');

-- 分配给人事部(dept_id=109)在职成员
INSERT INTO `sys_user_role` (`user_id`,`role_id`)
SELECT u.`id`, (SELECT `id` FROM `sys_role` WHERE `role_key`='hr' LIMIT 1)
FROM `sys_user` u
WHERE u.`dept_id`=109 AND u.`deleted`=0
  AND NOT EXISTS (
    SELECT 1 FROM `sys_user_role` ur
    WHERE ur.`user_id`=u.`id`
      AND ur.`role_id`=(SELECT `id` FROM `sys_role` WHERE `role_key`='hr' LIMIT 1)
  );
