SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 多维表格（MultiDim）模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 多维表格定义表
-- -----------------------------------------------------------
CREATE TABLE `multidim_table` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '表格ID',
  `name`          VARCHAR(200)  NOT NULL                COMMENT '表格名称',
  `description`   VARCHAR(500)  DEFAULT NULL            COMMENT '描述',
  `icon`          VARCHAR(50)   DEFAULT NULL            COMMENT '图标',
  `category`      VARCHAR(50)   DEFAULT NULL            COMMENT '分类',
  `field_schema`  JSON          DEFAULT NULL            COMMENT '字段定义[{id,name,type,config}]',
  `view_config`   JSON          DEFAULT NULL            COMMENT '视图配置[{id,name,type,filter,sort,group}]',
  `template_id`   BIGINT        DEFAULT NULL            COMMENT '模板ID',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多维表格定义表';

-- -----------------------------------------------------------
-- 2. 多维表格数据行表
-- -----------------------------------------------------------
CREATE TABLE `multidim_record` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `table_id`      BIGINT        NOT NULL                COMMENT '所属表格ID',
  `data`          JSON          DEFAULT NULL            COMMENT '行数据{fieldId: value}',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_table_id` (`table_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多维表格数据行表';

-- -----------------------------------------------------------
-- 3. 多维表格模板表
-- -----------------------------------------------------------
CREATE TABLE `multidim_template` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `name`          VARCHAR(200)  NOT NULL                COMMENT '模板名称',
  `category`      VARCHAR(50)   DEFAULT NULL            COMMENT '分类',
  `icon`          VARCHAR(50)   DEFAULT NULL            COMMENT '图标',
  `description`   VARCHAR(500)  DEFAULT NULL            COMMENT '描述',
  `field_schema`  JSON          DEFAULT NULL            COMMENT '字段定义',
  `view_config`   JSON          DEFAULT NULL            COMMENT '视图配置',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多维表格模板表';

-- -----------------------------------------------------------
-- 4. 系统模板种子数据
--    field_schema = [{id,name,type,config}],view_config = [{id,name,type,filterConfig,sortConfig,groupBy}]
--    category 用小写英文键(crm/project/finance/task)与前端分类侧边栏一致;
--    tenant_id=1、deleted=0 匹配多租户过滤(admin=租户1),确保 /multidim/template/list 可查到。
-- -----------------------------------------------------------
INSERT INTO `multidim_template`
  (`id`,`name`,`category`,`icon`,`description`,`field_schema`,`view_config`,`deleted`,`tenant_id`,`create_by`,`update_by`) VALUES
(1,'客户跟进表','crm','UserFilled','记录客户跟进状态与联系信息',
  '[{"id":"f1","name":"姓名","type":"text","config":{}},{"id":"f2","name":"公司","type":"text","config":{}},{"id":"f3","name":"状态","type":"select","config":{"options":["新线索","跟进中","已成交","已流失"]}},{"id":"f4","name":"最后跟进","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f3"}]',
  0,1,1,1),
(2,'项目进度表','project','Folder','跟踪项目进度与里程碑',
  '[{"id":"f1","name":"项目名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["未开始","进行中","已完成","已延期"]}},{"id":"f3","name":"负责人","type":"user","config":{}},{"id":"f4","name":"截止日期","type":"date","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]',
  0,1,1,1),
(3,'财务报表','finance','Money','财务科目与金额记录',
  '[{"id":"f1","name":"科目","type":"text","config":{}},{"id":"f2","name":"金额","type":"number","config":{"precision":2}},{"id":"f3","name":"日期","type":"date","config":{}},{"id":"f4","name":"类型","type":"select","config":{"options":["收入","支出","转账"]}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""}]',
  0,1,1,1),
(4,'任务清单','task','Finished','日常任务跟踪与管理',
  '[{"id":"f1","name":"任务名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["待处理","进行中","已完成","已取消"]}},{"id":"f3","name":"优先级","type":"select","config":{"options":["低","中","高","紧急"]}},{"id":"f4","name":"截止日期","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]',
  0,1,1,1),
(5,'简单CRM','crm','User','轻量级客户与商机管理',
  '[{"id":"f1","name":"公司名称","type":"text","config":{}},{"id":"f2","name":"联系人","type":"text","config":{}},{"id":"f3","name":"电话","type":"text","config":{}},{"id":"f4","name":"客户等级","type":"select","config":{"options":["A","B","C"]}},{"id":"f5","name":"销售阶段","type":"select","config":{"options":["潜在","商机","赢单","输单"]}},{"id":"f6","name":"预计金额","type":"number","config":{"precision":2}},{"id":"f7","name":"负责人","type":"user","config":{}},{"id":"f8","name":"最近联系","type":"date","config":{}}]',
  '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f5"}]',
  0,1,1,1);
