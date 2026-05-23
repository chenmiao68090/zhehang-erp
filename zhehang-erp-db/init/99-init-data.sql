SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭企服ERP系统 - 初始化数据
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 初始化部门
-- -----------------------------------------------------------
INSERT INTO `sys_dept` (`id`, `parent_id`, `ancestors`, `dept_name`, `sort`, `leader`, `phone`, `email`, `status`, `create_by`, `tenant_id`) VALUES
(1, 0, '0', '浙杭企业服务（杭州）有限公司', 1, '管理员', '0571-88888888', 'admin@zhehang.com', 0, 1, 1),
(2, 1, '0,1', '管理层', 1, NULL, NULL, NULL, 0, 1, 1),
(3, 1, '0,1', '财务部', 2, NULL, NULL, NULL, 0, 1, 1),
(4, 1, '0,1', '销售部', 3, NULL, NULL, NULL, 0, 1, 1),
(5, 1, '0,1', '客服部', 4, NULL, NULL, NULL, 0, 1, 1),
(6, 1, '0,1', '技术部', 5, NULL, NULL, NULL, 0, 1, 1),
(7, 1, '0,1', '人事部', 6, NULL, NULL, NULL, 0, 1, 1);

-- -----------------------------------------------------------
-- 2. 初始化岗位
-- -----------------------------------------------------------
INSERT INTO `org_post` (`id`, `post_code`, `post_name`, `sort`, `status`, `create_by`, `tenant_id`) VALUES
(1, 'CEO', '总经理', 1, 0, 1, 1),
(2, 'CFO', '财务总监', 2, 0, 1, 1),
(3, 'CTO', '技术总监', 3, 0, 1, 1),
(4, 'SALES_DIR', '销售总监', 4, 0, 1, 1),
(5, 'ACCOUNTANT', '会计', 5, 0, 1, 1),
(6, 'SALES_REP', '销售代表', 6, 0, 1, 1),
(7, 'DEV', '开发工程师', 7, 0, 1, 1),
(8, 'HR', '人事专员', 8, 0, 1, 1);

-- -----------------------------------------------------------
-- 3. 初始化角色
-- -----------------------------------------------------------
INSERT INTO `sys_role` (`id`, `role_name`, `role_key`, `sort`, `status`, `data_scope`, `remark`, `create_by`, `tenant_id`) VALUES
(1, '超级管理员', 'super_admin', 1, 0, 1, '拥有系统全部权限', 1, 1),
(2, '系统管理员', 'sys_admin', 2, 0, 1, '系统管理权限', 1, 1),
(3, '部门主管', 'dept_manager', 3, 0, 4, '部门及以下数据权限', 1, 1),
(4, '财务人员', 'finance', 4, 0, 5, '财务模块权限', 1, 1),
(5, '销售人员', 'sales', 5, 0, 5, '销售和CRM模块权限', 1, 1),
(6, '普通员工', 'staff', 6, 0, 5, '基础查看权限', 1, 1);

-- -----------------------------------------------------------
-- 4. 初始化用户（admin / admin123，chenmiao / 123456）
-- -----------------------------------------------------------
INSERT INTO `sys_user` (`id`, `username`, `password`, `nickname`, `email`, `phone`, `sex`, `avatar`, `status`, `dept_id`, `remark`, `create_by`, `tenant_id`) VALUES
(1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '超级管理员', 'admin@zhehang.com', '13800000000', 0, NULL, 0, 1, '系统超级管理员', 1, 1),
(2, 'chenmiao', '$2a$10$z1WmOxhsnUq8d/zGckMRGez4iN1c5HilbK1MxwU0jZ1VvkgwtaPSC', '陈苗', 'chenmiao@zhehang.com', '13800000001', 0, NULL, 0, 1, '测试用户', 1, 1);

-- -----------------------------------------------------------
-- 5. 用户角色关联
-- -----------------------------------------------------------
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (1, 1), (2, 1);

-- -----------------------------------------------------------
-- 6. 初始化菜单（17个一级模块 + 子菜单）
-- -----------------------------------------------------------

-- ===== 工作台 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1, '工作台', 0, 1, '/dashboard', 'dashboard/index', 'C', 1, 0, 'dashboard:view', 'dashboard', 1, 1);

-- ===== 系统管理 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(100, '系统管理', 0, 2, '/system', NULL, 'M', 1, 0, NULL, 'setting', 1, 1),
(101, '用户管理', 100, 1, '/system/user', 'system/user/index', 'C', 1, 0, 'system:user:list', 'user', 1, 1),
(102, '角色管理', 100, 2, '/system/role', 'system/role/index', 'C', 1, 0, 'system:role:list', 'role', 1, 1),
(103, '菜单管理', 100, 3, '/system/menu', 'system/menu/index', 'C', 1, 0, 'system:menu:list', 'menu', 1, 1),
(104, '部门管理', 100, 4, '/system/dept', 'system/dept/index', 'C', 1, 0, 'system:dept:list', 'dept', 1, 1),
(105, '通知公告', 100, 5, '/system/notice', 'system/notice/index', 'C', 1, 0, 'system:notice:list', 'notice', 1, 1);

-- ===== 组织架构 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(200, '组织架构', 0, 3, '/org', NULL, 'M', 1, 0, NULL, 'org', 1, 1),
(201, '岗位管理', 200, 1, '/org/post', 'org/post/index', 'C', 1, 0, 'org:post:list', 'post', 1, 1),
(202, '员工档案', 200, 2, '/org/employee', 'org/employee/index', 'C', 1, 0, 'org:employee:list', 'employee', 1, 1),
(203, '人事异动', 200, 3, '/org/transfer', 'org/transfer/index', 'C', 1, 0, 'org:transfer:list', 'transfer', 1, 1);

-- ===== 客户管理(CRM) =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(300, '客户管理', 0, 4, '/crm', NULL, 'M', 1, 0, NULL, 'customer', 1, 1),
(301, '线索管理', 300, 1, '/crm/lead', 'crm/lead/index', 'C', 1, 0, 'crm:lead:list', 'lead', 1, 1),
(302, '客户列表', 300, 2, '/crm/customer', 'crm/customer/index', 'C', 1, 0, 'crm:customer:list', 'customer', 1, 1),
(303, '联系人', 300, 3, '/crm/contact', 'crm/contact/index', 'C', 1, 0, 'crm:contact:list', 'contact', 1, 1),
(304, '商机管理', 300, 4, '/crm/opportunity', 'crm/opportunity/index', 'C', 1, 0, 'crm:opportunity:list', 'opportunity', 1, 1),
(305, '合同管理', 300, 5, '/crm/contract', 'crm/contract/index', 'C', 1, 0, 'crm:contract:list', 'contract', 1, 1),
(306, '服务工单', 300, 6, '/crm/ticket', 'crm/ticket/index', 'C', 1, 0, 'crm:ticket:list', 'ticket', 1, 1),
(307, '公海池', 300, 7, '/crm/pool', 'crm/pool/index', 'C', 1, 0, 'crm:pool:list', 'pool', 1, 1);

-- ===== 人事管理(HRM) =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(400, '人事管理', 0, 5, '/hrm', NULL, 'M', 1, 0, NULL, 'hrm', 1, 1),
(401, '招聘管理', 400, 1, '/hrm/recruit', 'hrm/recruit/index', 'C', 1, 0, 'hrm:recruit:list', 'recruit', 1, 1),
(402, '简历库', 400, 2, '/hrm/resume', 'hrm/resume/index', 'C', 1, 0, 'hrm:resume:list', 'resume', 1, 1),
(403, '考勤管理', 400, 3, '/hrm/attendance', 'hrm/attendance/index', 'C', 1, 0, 'hrm:attendance:list', 'attendance', 1, 1),
(404, '请假管理', 400, 4, '/hrm/leave', 'hrm/leave/index', 'C', 1, 0, 'hrm:leave:list', 'leave', 1, 1),
(405, '薪资管理', 400, 5, '/hrm/salary', 'hrm/salary/index', 'C', 1, 0, 'hrm:salary:list', 'salary', 1, 1),
(406, '绩效考核', 400, 6, '/hrm/performance', 'hrm/performance/index', 'C', 1, 0, 'hrm:performance:list', 'performance', 1, 1),
(407, '培训管理', 400, 7, '/hrm/training', 'hrm/training/index', 'C', 1, 0, 'hrm:training:list', 'training', 1, 1);

-- ===== 财务管理 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(500, '财务管理', 0, 6, '/finance', NULL, 'M', 1, 0, NULL, 'finance', 1, 1),
(501, '会计凭证', 500, 1, '/finance/voucher', 'finance/voucher/index', 'C', 1, 0, 'finance:voucher:list', 'voucher', 1, 1),
(502, '账簿查询', 500, 2, '/finance/ledger', 'finance/ledger/index', 'C', 1, 0, 'finance:ledger:list', 'ledger', 1, 1),
(503, '财务报表', 500, 3, '/finance/report', 'finance/report/index', 'C', 1, 0, 'finance:report:list', 'report', 1, 1),
(504, '税务管理', 500, 4, '/finance/tax', 'finance/tax/index', 'C', 1, 0, 'finance:tax:list', 'tax', 1, 1),
(505, '发票管理', 500, 5, '/finance/invoice', 'finance/invoice/index', 'C', 1, 0, 'finance:invoice:list', 'invoice', 1, 1),
(506, '费用报销', 500, 6, '/finance/reimburse', 'finance/reimburse/index', 'C', 1, 0, 'finance:reimburse:list', 'reimburse', 1, 1),
(507, '应收应付', 500, 7, '/finance/receivable', 'finance/receivable/index', 'C', 1, 0, 'finance:receivable:list', 'receivable', 1, 1);

-- ===== 项目管理 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(600, '项目管理', 0, 7, '/project', NULL, 'M', 1, 0, NULL, 'project', 1, 1),
(601, '项目列表', 600, 1, '/project/list', 'project/list/index', 'C', 1, 0, 'project:list:list', 'project-list', 1, 1),
(602, '任务管理', 600, 2, '/project/task', 'project/task/index', 'C', 1, 0, 'project:task:list', 'task', 1, 1),
(603, '里程碑', 600, 3, '/project/milestone', 'project/milestone/index', 'C', 1, 0, 'project:milestone:list', 'milestone', 1, 1),
(604, '工时记录', 600, 4, '/project/timesheet', 'project/timesheet/index', 'C', 1, 0, 'project:timesheet:list', 'timesheet', 1, 1);

-- ===== 供应链 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(700, '供应链', 0, 8, '/supply', NULL, 'M', 1, 0, NULL, 'supply', 1, 1),
(701, '供应商管理', 700, 1, '/supply/vendor', 'supply/vendor/index', 'C', 1, 0, 'supply:vendor:list', 'vendor', 1, 1),
(702, '采购申请', 700, 2, '/supply/purchase-req', 'supply/purchaseReq/index', 'C', 1, 0, 'supply:req:list', 'purchase-req', 1, 1),
(703, '采购订单', 700, 3, '/supply/purchase-order', 'supply/purchaseOrder/index', 'C', 1, 0, 'supply:order:list', 'purchase-order', 1, 1),
(704, '入库管理', 700, 4, '/supply/receipt', 'supply/receipt/index', 'C', 1, 0, 'supply:receipt:list', 'receipt', 1, 1);

-- ===== 销售管理 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(800, '销售管理', 0, 9, '/sales', NULL, 'M', 1, 0, NULL, 'sales', 1, 1),
(801, '报价管理', 800, 1, '/sales/quotation', 'sales/quotation/index', 'C', 1, 0, 'sales:quotation:list', 'quotation', 1, 1),
(802, '销售订单', 800, 2, '/sales/order', 'sales/order/index', 'C', 1, 0, 'sales:order:list', 'sales-order', 1, 1),
(803, '发货管理', 800, 3, '/sales/delivery', 'sales/delivery/index', 'C', 1, 0, 'sales:delivery:list', 'delivery', 1, 1),
(804, '回款记录', 800, 4, '/sales/receipt', 'sales/receipt/index', 'C', 1, 0, 'sales:receipt:list', 'sales-receipt', 1, 1),
(805, '销售提成', 800, 5, '/sales/commission', 'sales/commission/index', 'C', 1, 0, 'sales:commission:list', 'commission', 1, 1);

-- ===== 工作流 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(900, '工作流', 0, 10, '/workflow', NULL, 'M', 1, 0, NULL, 'workflow', 1, 1),
(901, '流程定义', 900, 1, '/workflow/process', 'workflow/process/index', 'C', 1, 0, 'workflow:process:list', 'process', 1, 1),
(902, '我的待办', 900, 2, '/workflow/todo', 'workflow/todo/index', 'C', 1, 0, 'workflow:todo:list', 'todo', 1, 1),
(903, '我发起的', 900, 3, '/workflow/initiated', 'workflow/initiated/index', 'C', 1, 0, 'workflow:initiated:list', 'initiated', 1, 1),
(904, '流程历史', 900, 4, '/workflow/history', 'workflow/history/index', 'C', 1, 0, 'workflow:history:list', 'history', 1, 1);

-- ===== 文件管理 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1000, '文件管理', 0, 11, '/file', NULL, 'M', 1, 0, NULL, 'file', 1, 1),
(1001, '文件列表', 1000, 1, '/file/list', 'file/list/index', 'C', 1, 0, 'file:list:list', 'file-list', 1, 1),
(1002, '知识库', 1000, 2, '/file/knowledge', 'file/knowledge/index', 'C', 1, 0, 'file:knowledge:list', 'knowledge', 1, 1);

-- ===== 报表中心 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1100, '报表中心', 0, 12, '/report', NULL, 'M', 1, 0, NULL, 'report', 1, 1),
(1101, '报表管理', 1100, 1, '/report/list', 'report/list/index', 'C', 1, 0, 'report:list:list', 'report-list', 1, 1),
(1102, '数据集', 1100, 2, '/report/dataset', 'report/dataset/index', 'C', 1, 0, 'report:dataset:list', 'dataset', 1, 1),
(1103, '报表订阅', 1100, 3, '/report/schedule', 'report/schedule/index', 'C', 1, 0, 'report:schedule:list', 'schedule', 1, 1);

-- ===== 日志管理 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1200, '日志管理', 0, 13, '/log', NULL, 'M', 1, 0, NULL, 'log', 1, 1),
(1201, '登录日志', 1200, 1, '/log/login', 'log/login/index', 'C', 1, 0, 'log:login:list', 'login-log', 1, 1),
(1202, '操作日志', 1200, 2, '/log/oper', 'log/oper/index', 'C', 1, 0, 'log:oper:list', 'oper-log', 1, 1),
(1203, '异常日志', 1200, 3, '/log/error', 'log/error/index', 'C', 1, 0, 'log:error:list', 'error-log', 1, 1);

-- ===== 系统监控 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1300, '系统监控', 0, 14, '/monitor', NULL, 'M', 1, 0, NULL, 'monitor', 1, 1),
(1301, '服务监控', 1300, 1, '/monitor/server', 'monitor/server/index', 'C', 1, 0, 'monitor:server:view', 'server', 1, 1),
(1302, '缓存监控', 1300, 2, '/monitor/cache', 'monitor/cache/index', 'C', 1, 0, 'monitor:cache:view', 'cache', 1, 1),
(1303, '在线用户', 1300, 3, '/monitor/online', 'monitor/online/index', 'C', 1, 0, 'monitor:online:list', 'online', 1, 1);

-- ===== 系统工具 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1400, '系统工具', 0, 15, '/tool', NULL, 'M', 1, 0, NULL, 'tool', 1, 1),
(1401, '代码生成', 1400, 1, '/tool/gen', 'tool/gen/index', 'C', 1, 0, 'tool:gen:list', 'gen', 1, 1),
(1402, '系统接口', 1400, 2, '/tool/swagger', 'tool/swagger/index', 'C', 1, 0, 'tool:swagger:view', 'swagger', 1, 1);

-- ===== 个人中心 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1500, '个人中心', 0, 16, '/profile', 'profile/index', 'C', 0, 0, 'profile:view', 'profile', 1, 1);

-- ===== 消息中心 =====
INSERT INTO `sys_menu` (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`) VALUES
(1600, '消息中心', 0, 17, '/message', NULL, 'M', 1, 0, NULL, 'message', 1, 1),
(1601, '我的消息', 1600, 1, '/message/list', 'message/list/index', 'C', 1, 0, 'message:list:list', 'msg-list', 1, 1),
(1602, '通知模板', 1600, 2, '/message/template', 'message/template/index', 'C', 1, 0, 'message:template:list', 'template', 1, 1);

-- -----------------------------------------------------------
-- 7. 超级管理员分配所有菜单权限
-- -----------------------------------------------------------
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT 1, `id` FROM `sys_menu`;

-- -----------------------------------------------------------
-- 8. 初始化通知模板
-- -----------------------------------------------------------
INSERT INTO `sys_notice_template` (`id`, `template_code`, `template_name`, `content`, `channel`, `status`, `create_by`, `tenant_id`) VALUES
(1, 'WORKFLOW_APPROVE', '审批通知', '您有一条新的审批任务：${title}，发起人：${initiator}，请及时处理。', 1, 0, 1, 1),
(2, 'TASK_ASSIGN', '任务分配通知', '您被分配了新任务：${taskName}，项目：${projectName}，截止日期：${endDate}。', 1, 0, 1, 1),
(3, 'CONTRACT_EXPIRE', '合同到期提醒', '客户${customerName}的合同${contractNo}将于${expireDate}到期，请及时跟进续约。', 1, 0, 1, 1),
(4, 'SALARY_PAID', '工资发放通知', '${month}月工资已发放，实发金额：${amount}元，请查收。', 1, 0, 1, 1),
(5, 'SYSTEM_UPDATE', '系统更新通知', '系统将于${updateTime}进行升级维护，预计耗时${duration}，届时将暂停服务。', 1, 0, 1, 1);
