-- =============================================================================
-- V46  后端权限地基:为各业务角色补 sys_role_menu(role -> menu 的权限映射)
-- -----------------------------------------------------------------------------
-- 背景:种子里只有 super_admin(role_id=1) 绑了全部菜单,其余角色后端权限为空,
--       权限实际靠前端 routes.ts 控制。本迁移为各真实角色补上后端菜单权限,
--       为后续给业务接口加 @PreAuthorize 打基础。
--
-- 安全性:① 当前业务接口尚无 @PreAuthorize、业务页面不用 v-hasPermi,
--           所以本次"只加数据"对线上行为【零效果、零风险】。
--         ② 绝不给非管理员角色授予【系统管理/日志/监控/工具】菜单(保持 admin 专属)。
--         ③ 按 role_name 匹配真实角色;幂等(NOT EXISTS),可重复执行。
--         ④ 超级管理员(super_admin)已有全部权限,无需处理。
--
-- 菜单分组(均为带 perms 的叶子菜单 id):
--   基础(所有业务角色): 1 工作台, 901-904 工作流, 1001-1002 文件, 1500 个人中心, 1601-1602 消息
--   CRM 客户:    301-307      人事 HRM:   401-407      财务:   501-507
--   项目:        601-604      供应链:     701-704      销售:   801-805
--   报表:        1101-1103    组织架构:   201-203
-- =============================================================================

-- 系统内测人员(测试):所有业务模块(不含系统管理)
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602,
              301,302,303,304,305,306,307, 401,402,403,404,405,406,407,
              501,502,503,504,505,506,507, 601,602,603,604, 701,702,703,704,
              801,802,803,804,805, 1101,1102,1103, 201,202,203)
WHERE r.role_name = '系统内测人员'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 部门主管:跨业务模块(CRM/销售/项目/供应链/组织架构/报表)+ 基础
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602,
              301,302,303,304,305,306,307, 601,602,603,604, 701,702,703,704,
              801,802,803,804,805, 1101,1102,1103, 201,202,203)
WHERE r.role_name = '部门主管'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 财务人员:财务 + 报表 + 基础
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602,
              501,502,503,504,505,506,507, 1101,1102,1103)
WHERE r.role_name = '财务人员'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 财务部(看全部财务):财务 + 报表 + 基础
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602,
              501,502,503,504,505,506,507, 1101,1102,1103)
WHERE r.role_name = '财务部(看全部财务)'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 销售人员:CRM + 销售 + 基础
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602,
              301,302,303,304,305,306,307, 801,802,803,804,805)
WHERE r.role_name = '销售人员'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 网销:CRM + 销售 + 基础
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602,
              301,302,303,304,305,306,307, 801,802,803,804,805)
WHERE r.role_name = '网销'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 人事(HR):人事管理 + 组织架构 + 基础
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602,
              401,402,403,404,405,406,407, 201,202,203)
WHERE r.role_name = '人事(HR)'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 普通员工:仅基础(工作台/工作流/文件/个人中心/消息)
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.id, m.id FROM `sys_role` r JOIN `sys_menu` m
  ON m.id IN (1,901,902,903,904,1001,1002,1500,1601,1602)
WHERE r.role_name = '普通员工'
  AND NOT EXISTS (SELECT 1 FROM `sys_role_menu` rm WHERE rm.role_id=r.id AND rm.menu_id=m.id);

-- 核对:每个角色现在被授予多少个带权限的菜单
SELECT r.role_name AS '角色', COUNT(DISTINCT m.id) AS '菜单数', COUNT(DISTINCT m.perms) AS '权限数'
FROM `sys_role` r
JOIN `sys_role_menu` rm ON rm.role_id = r.id
JOIN `sys_menu` m ON m.id = rm.menu_id AND m.perms IS NOT NULL AND m.perms <> ''
GROUP BY r.id, r.role_name
ORDER BY COUNT(DISTINCT m.id) DESC;
