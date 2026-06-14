-- ============================================================
-- V24: 多维表格(MultiDim)系统模板种子数据
-- 背景:multidim_template 表为空,导致「从模板新建表格」功能不可用——
--       GET /multidim/template/list 返回空列表,POST /multidim/table/fromTemplate 无模板可实例化。
--       前端 src/views/multidim/index.vue 只能退回 getMockTemplates() 假数据。
-- 处理:写入 5 个系统模板。字段格式与前端 FieldDef/ViewDef(api/multidim.ts)及
--       MultidimTableServiceImpl.createFromTemplate 消费方式完全一致:
--         field_schema = [{id,name,type,config}]   (type: text/number/date/select/...)
--         view_config  = [{id,name,type,filterConfig,sortConfig,groupBy}]
--       category 用小写英文键(crm/project/finance/task),与左侧分类侧边栏过滤值一致。
-- 隔离:tenant_id=1、deleted=0,匹配 ErpTenantHandler 对 admin(租户1)追加的
--       `tenant_id=1 AND deleted=0` 过滤,确保 list 能查到。
-- 幂等:按 (name, tenant_id) NOT EXISTS 守卫,可重复执行。
-- ============================================================

USE `zhehang_erp`;

-- 1) 客户跟进表(crm)
INSERT INTO `multidim_template`
  (`id`,`name`,`category`,`icon`,`description`,`field_schema`,`view_config`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 1,'客户跟进表','crm','UserFilled','记录客户跟进状态与联系信息',
  '[{"id":"f1","name":"姓名","type":"text","config":{}},{"id":"f2","name":"公司","type":"text","config":{}},{"id":"f3","name":"状态","type":"select","config":{"options":["新线索","跟进中","已成交","已流失"]}},{"id":"f4","name":"最后跟进","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f3"}]',
  0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `multidim_template` WHERE `name`='客户跟进表' AND `tenant_id`=1);

-- 2) 项目进度表(project)
INSERT INTO `multidim_template`
  (`id`,`name`,`category`,`icon`,`description`,`field_schema`,`view_config`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 2,'项目进度表','project','Folder','跟踪项目进度与里程碑',
  '[{"id":"f1","name":"项目名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["未开始","进行中","已完成","已延期"]}},{"id":"f3","name":"负责人","type":"user","config":{}},{"id":"f4","name":"截止日期","type":"date","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]',
  0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `multidim_template` WHERE `name`='项目进度表' AND `tenant_id`=1);

-- 3) 财务报表(finance)
INSERT INTO `multidim_template`
  (`id`,`name`,`category`,`icon`,`description`,`field_schema`,`view_config`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 3,'财务报表','finance','Money','财务科目与金额记录',
  '[{"id":"f1","name":"科目","type":"text","config":{}},{"id":"f2","name":"金额","type":"number","config":{"precision":2}},{"id":"f3","name":"日期","type":"date","config":{}},{"id":"f4","name":"类型","type":"select","config":{"options":["收入","支出","转账"]}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""}]',
  0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `multidim_template` WHERE `name`='财务报表' AND `tenant_id`=1);

-- 4) 任务清单(task)
INSERT INTO `multidim_template`
  (`id`,`name`,`category`,`icon`,`description`,`field_schema`,`view_config`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 4,'任务清单','task','Finished','日常任务跟踪与管理',
  '[{"id":"f1","name":"任务名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["待处理","进行中","已完成","已取消"]}},{"id":"f3","name":"优先级","type":"select","config":{"options":["低","中","高","紧急"]}},{"id":"f4","name":"截止日期","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]',
  0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `multidim_template` WHERE `name`='任务清单' AND `tenant_id`=1);

-- 5) 简单CRM(crm)—轻量级客户/商机管理
INSERT INTO `multidim_template`
  (`id`,`name`,`category`,`icon`,`description`,`field_schema`,`view_config`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 5,'简单CRM','crm','User','轻量级客户与商机管理',
  '[{"id":"f1","name":"公司名称","type":"text","config":{}},{"id":"f2","name":"联系人","type":"text","config":{}},{"id":"f3","name":"电话","type":"text","config":{}},{"id":"f4","name":"客户等级","type":"select","config":{"options":["A","B","C"]}},{"id":"f5","name":"销售阶段","type":"select","config":{"options":["潜在","商机","赢单","输单"]}},{"id":"f6","name":"预计金额","type":"number","config":{"precision":2}},{"id":"f7","name":"负责人","type":"user","config":{}},{"id":"f8","name":"最近联系","type":"date","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f5"}]',
  0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `multidim_template` WHERE `name`='简单CRM' AND `tenant_id`=1);
