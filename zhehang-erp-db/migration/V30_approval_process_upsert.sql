-- ============================================================
-- V30: 审批中心流程定义 UPSERT(修复 + 补全)
-- 背景: V28 用 INSERT ... WHERE NOT EXISTS 幂等插入,若库里已存在同 key 的旧行
--   (如早期建的"请假"流程 form_config 缺/空选项),V28 不会更新它 ->
--   表现为发起弹窗里"请假类型"等下拉为空、部分流程定义陈旧。
-- 处理: 对全部 21 个标准流程用 INSERT ... ON DUPLICATE KEY UPDATE(唯一键
--   uk_process_key_version = (process_key, version)),存在则刷新定义、不存在则插入。
--   - form_config / process_config 与 V28 一致(已被前端发起弹窗与工作流引擎验证)。
--   - 请假 leave 在 V28 基础上补充"育儿假"类型(对齐业务诉求)。
--   - 统一 status=1(已发布)、deleted=0(防早期被软删导致前端拉不到)。
-- 幂等: 可重复执行,每次都把定义刷成本文件的标准值。
-- 注: "年假关联年度剩余余额、无余额禁止申请"属更深的 HR 假期额度联动,需独立开发,本迁移不含。
-- ============================================================

USE `zhehang_erp`;
-- 防中文双重编码乱码:强制本会话用 utf8mb4
SET NAMES utf8mb4;

-- ---------- 假勤 attendance ----------

-- 请假 leave(补充 育儿假)
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('请假审批','leave','attendance',1,'员工请假申请',
 '[{"field":"leaveType","label":"请假类型","type":"select","options":["年假","调休","事假","病假","婚假","产假","陪产假","育儿假","丧假"]},{"field":"startDate","label":"开始日期","type":"text"},{"field":"endDate","label":"结束日期","type":"text"},{"field":"days","label":"请假天数","type":"number"},{"field":"reason","label":"请假事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 出差 business_trip
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('出差审批','business_trip','attendance',1,'员工出差申请',
 '[{"field":"destination","label":"出差地点","type":"text"},{"field":"startDate","label":"开始日期","type":"text"},{"field":"endDate","label":"结束日期","type":"text"},{"field":"days","label":"出差天数","type":"number"},{"field":"reason","label":"出差事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 外出 outgoing
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('外出审批','outgoing','attendance',1,'员工外出申请',
 '[{"field":"place","label":"外出地点","type":"text"},{"field":"startTime","label":"外出时间","type":"text"},{"field":"hours","label":"外出时长(小时)","type":"number"},{"field":"reason","label":"外出事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 加班 overtime
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('加班审批','overtime','attendance',1,'员工加班申请',
 '[{"field":"overtimeDate","label":"加班日期","type":"text"},{"field":"startTime","label":"开始时间","type":"text"},{"field":"endTime","label":"结束时间","type":"text"},{"field":"hours","label":"加班时长(小时)","type":"number"},{"field":"reason","label":"加班事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 补卡 makeup
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('补卡审批','makeup','attendance',1,'员工补卡申请',
 '[{"field":"makeupDate","label":"补卡日期","type":"text"},{"field":"makeupType","label":"补卡类型","type":"select","options":["上班卡","下班卡"]},{"field":"reason","label":"补卡事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- ---------- 财务 finance ----------

-- 报销 expense(金额>5000 加签总经理)
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('报销审批','expense','finance',1,'费用报销申请',
 '[{"field":"amount","label":"报销金额","type":"number"},{"field":"expenseType","label":"费用类型","type":"select","options":["交通费","餐饮费","住宿费","办公用品","通讯费","其他"]},{"field":"description","label":"费用说明","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"condition1","type":"condition","name":"金额判断","conditions":[{"expression":"amount > 5000","nextNode":"node2"},{"expression":"amount <= 5000","nextNode":"end"}]},{"id":"node2","type":"approval","name":"总经理审批","assigneeType":"role","assigneeValue":"super_admin"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"condition1"},{"from":"condition1","to":"node2"},{"from":"condition1","to":"end"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 付款 payment
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('付款审批','payment','finance',1,'对外付款申请',
 '[{"field":"payee","label":"收款方","type":"text"},{"field":"amount","label":"付款金额","type":"number"},{"field":"payType","label":"付款方式","type":"select","options":["银行转账","现金","支票","承兑汇票"]},{"field":"reason","label":"付款事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 费用 cost
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('费用审批','cost','finance',1,'费用支出申请',
 '[{"field":"feeType","label":"费用类别","type":"select","options":["招待费","差旅费","培训费","市场费","其他"]},{"field":"amount","label":"费用金额","type":"number"},{"field":"description","label":"费用说明","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 借款 loan
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('借款审批','loan','finance',1,'员工借款申请',
 '[{"field":"amount","label":"借款金额","type":"number"},{"field":"loanType","label":"借款类型","type":"select","options":["差旅借款","备用金借款","项目借款","其他"]},{"field":"repayDate","label":"预计还款日期","type":"text"},{"field":"reason","label":"借款事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 退款 refund
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('退款审批','refund','finance',1,'客户退款申请',
 '[{"field":"customer","label":"客户名称","type":"text"},{"field":"amount","label":"退款金额","type":"number"},{"field":"refundReason","label":"退款原因","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 备用金 petty_cash
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('备用金审批','petty_cash','finance',1,'备用金申请',
 '[{"field":"amount","label":"备用金金额","type":"number"},{"field":"purpose","label":"用途","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 收款 receipt
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('收款审批','receipt','finance',1,'收款确认申请',
 '[{"field":"payer","label":"付款方","type":"text"},{"field":"amount","label":"收款金额","type":"number"},{"field":"receiptType","label":"收款方式","type":"select","options":["银行转账","现金","支票","承兑汇票"]},{"field":"remark","label":"备注","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 发票 invoice
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('发票审批','invoice','finance',1,'开票申请',
 '[{"field":"title","label":"发票抬头","type":"text"},{"field":"taxNo","label":"税号","type":"text"},{"field":"amount","label":"开票金额","type":"number"},{"field":"invoiceType","label":"发票类型","type":"select","options":["增值税专用发票","增值税普通发票","电子发票"]},{"field":"remark","label":"备注","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- ---------- 行政 admin ----------

-- 用章 seal
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('用章审批','seal','admin',1,'印章使用申请',
 '[{"field":"sealType","label":"印章类型","type":"select","options":["公章","合同章","财务章","法人章","发票章"]},{"field":"usage","label":"用途说明","type":"textarea"},{"field":"copies","label":"份数","type":"number"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"行政主管审批","assigneeType":"role","assigneeValue":"hr"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 印章外带 seal_out
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('印章外带审批','seal_out','admin',1,'印章外带申请',
 '[{"field":"sealType","label":"印章类型","type":"select","options":["公章","合同章","财务章","法人章"]},{"field":"outDate","label":"外带日期","type":"text"},{"field":"returnDate","label":"归还日期","type":"text"},{"field":"reason","label":"外带事由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"行政主管审批","assigneeType":"role","assigneeValue":"hr"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 采购 purchase
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('采购审批','purchase','admin',1,'采购申请',
 '[{"field":"item","label":"采购物品","type":"text"},{"field":"amount","label":"采购金额","type":"number"},{"field":"quantity","label":"数量","type":"number"},{"field":"reason","label":"采购说明","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"采购部审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 会议室 meeting_room
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('会议室预约审批','meeting_room','admin',1,'会议室预约申请',
 '[{"field":"room","label":"会议室","type":"text"},{"field":"date","label":"使用日期","type":"text"},{"field":"startTime","label":"开始时间","type":"text"},{"field":"endTime","label":"结束时间","type":"text"},{"field":"topic","label":"会议主题","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"行政主管审批","assigneeType":"role","assigneeValue":"hr"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 合同审批 contract
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('合同审批','contract','admin',1,'合同签署审批',
 '[{"field":"contractName","label":"合同名称","type":"text"},{"field":"partyB","label":"对方单位","type":"text"},{"field":"amount","label":"合同金额","type":"number"},{"field":"contractType","label":"合同类型","type":"select","options":["销售合同","采购合同","服务合同","框架协议","其他"]},{"field":"remark","label":"备注","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"法务/财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"node3","type":"approval","name":"总经理审批","assigneeType":"role","assigneeValue":"super_admin"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"node3"},{"from":"node3","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 转介绍返现 referral
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('转介绍返现审批','referral','admin',1,'转介绍返现申请',
 '[{"field":"referrer","label":"介绍人","type":"text"},{"field":"customer","label":"成交客户","type":"text"},{"field":"amount","label":"返现金额","type":"number"},{"field":"remark","label":"说明","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 活动经费 campaign_fund
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('活动经费审批','campaign_fund','admin',1,'市场活动经费申请',
 '[{"field":"campaignName","label":"活动名称","type":"text"},{"field":"budget","label":"预算金额","type":"number"},{"field":"period","label":"活动周期","type":"text"},{"field":"plan","label":"活动方案","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"财务审批","assigneeType":"role","assigneeValue":"finance_hq"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 通用审批 general
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('通用审批','general','admin',1,'通用事项审批',
 '[{"field":"matter","label":"事项名称","type":"text"},{"field":"content","label":"申请内容","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- ---------- 人事 hr ----------

-- 入职 onboard
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('入职审批','onboard','hr',1,'新员工入职申请',
 '[{"field":"name","label":"姓名","type":"text"},{"field":"dept","label":"入职部门","type":"text"},{"field":"position","label":"岗位","type":"text"},{"field":"entryDate","label":"入职日期","type":"text"},{"field":"remark","label":"备注","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"人事审批","assigneeType":"role","assigneeValue":"hr"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 转正 regular
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('转正审批','regular','hr',1,'试用期转正申请',
 '[{"field":"entryDate","label":"入职日期","type":"text"},{"field":"regularDate","label":"申请转正日期","type":"text"},{"field":"summary","label":"试用期总结","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"人事审批","assigneeType":"role","assigneeValue":"hr"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 调岗 transfer
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('调岗审批','transfer','hr',1,'岗位异动申请',
 '[{"field":"fromDept","label":"原部门","type":"text"},{"field":"toDept","label":"目标部门","type":"text"},{"field":"toPosition","label":"目标岗位","type":"text"},{"field":"effectiveDate","label":"生效日期","type":"text"},{"field":"reason","label":"调岗原因","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"原部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"人事审批","assigneeType":"role","assigneeValue":"hr"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;

-- 离职 resign
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('离职审批','resign','hr',1,'员工离职申请',
 '[{"field":"resignType","label":"离职类型","type":"select","options":["主动离职","协商离职","辞退","合同到期"]},{"field":"lastDate","label":"最后工作日","type":"text"},{"field":"reason","label":"离职原因","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"人事审批","assigneeType":"role","assigneeValue":"hr"},{"id":"node3","type":"approval","name":"总经理审批","assigneeType":"role","assigneeValue":"super_admin"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"node3"},{"from":"node3","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;
