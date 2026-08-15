SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 公海池体系迁移脚本 V2
-- 适用模块：CRM 客户管理 - 公海池/回收/分配/撞单/服务订单/提醒/持有上限
-- 说明：本脚本基于 init/03-crm.sql 进行扩展，请在已有数据库中按序执行
-- ============================================================

USE `zhehang_erp`;

-- ============================================================
-- 1. 扩展 crm_lead 表（新增公海池体系所需字段，保持原有字段不动）
-- ============================================================
ALTER TABLE `crm_lead`
  ADD COLUMN `customer_type`          VARCHAR(50)   DEFAULT NULL COMMENT '客户类型(代理记账/工商注册/税务筹划/资质代办/审计评估/其他)' AFTER `source`,
  ADD COLUMN `customer_level`         CHAR(1)       DEFAULT 'C'  COMMENT '客户等级(A/B/C/D)'                                  AFTER `customer_type`,
  ADD COLUMN `region`                 VARCHAR(50)   DEFAULT NULL COMMENT '注册区域(杭州各区)'                                  AFTER `customer_level`,
  ADD COLUMN `enterprise_scale`       VARCHAR(20)   DEFAULT NULL COMMENT '企业规模(0-10人/11-50人/51-200人/200+)'              AFTER `region`,
  ADD COLUMN `registered_capital`     DECIMAL(12,2) DEFAULT NULL COMMENT '注册资本(万元)'                                       AFTER `enterprise_scale`,
  ADD COLUMN `established_date`       DATE          DEFAULT NULL COMMENT '企业成立日期'                                         AFTER `registered_capital`,
  ADD COLUMN `wechat`                 VARCHAR(50)   DEFAULT NULL COMMENT '联系人微信'                                           AFTER `established_date`,
  ADD COLUMN `contact_position`       VARCHAR(50)   DEFAULT NULL COMMENT '联系人职位'                                           AFTER `wechat`,
  ADD COLUMN `contact_role`           VARCHAR(20)   DEFAULT NULL COMMENT '联系人角色(决策人/影响人/使用人/无关人)'              AFTER `contact_position`,
  ADD COLUMN `pool_id`                BIGINT        DEFAULT NULL COMMENT '所属公海池ID'                                         AFTER `contact_role`,
  ADD COLUMN `ownership`              VARCHAR(10)   DEFAULT 'pool' COMMENT '归属(pool公海/private私海)'                         AFTER `pool_id`,
  ADD COLUMN `claim_time`             DATETIME      DEFAULT NULL COMMENT '领取时间'                                             AFTER `ownership`,
  ADD COLUMN `last_follow_time`       DATETIME      DEFAULT NULL COMMENT '最后跟进时间'                                         AFTER `claim_time`,
  ADD COLUMN `next_follow_time`       DATE          DEFAULT NULL COMMENT '下次跟进时间'                                         AFTER `last_follow_time`,
  ADD COLUMN `last_follow_content`    VARCHAR(500)  DEFAULT NULL COMMENT '最后跟进内容摘要'                                     AFTER `next_follow_time`,
  ADD COLUMN `follow_count`           INT           DEFAULT 0    COMMENT '累计跟进次数'                                         AFTER `last_follow_content`,
  ADD COLUMN `protection_expire_date` DATE          DEFAULT NULL COMMENT '保护期到期日'                                         AFTER `follow_count`,
  ADD COLUMN `recycle_warning_days`   INT           DEFAULT NULL COMMENT '距回收剩余天数'                                       AFTER `protection_expire_date`,
  ADD COLUMN `service_type`           JSON          DEFAULT NULL COMMENT '服务类型(多选JSON数组)'                                AFTER `recycle_warning_days`,
  ADD COLUMN `current_provider`       VARCHAR(100)  DEFAULT NULL COMMENT '现有服务商'                                           AFTER `service_type`,
  ADD COLUMN `service_expire_date`    DATE          DEFAULT NULL COMMENT '现服务商合同到期时间'                                 AFTER `current_provider`,
  ADD COLUMN `is_general_taxpayer`    TINYINT       DEFAULT NULL COMMENT '纳税人类型(0小规模/1一般纳税人)'                      AFTER `service_expire_date`,
  ADD COLUMN `monthly_invoice_volume` VARCHAR(20)   DEFAULT NULL COMMENT '月均票据量'                                           AFTER `is_general_taxpayer`,
  ADD COLUMN `quoted_price`           DECIMAL(10,2) DEFAULT NULL COMMENT '报价金额(元/月)'                                      AFTER `monthly_invoice_volume`,
  ADD COLUMN `deal_probability`       INT           DEFAULT NULL COMMENT '成交概率(%)'                                          AFTER `quoted_price`,
  ADD COLUMN `expected_deal_date`     DATE          DEFAULT NULL COMMENT '预计成交日期'                                         AFTER `deal_probability`,
  ADD COLUMN `special_needs`          TEXT          DEFAULT NULL COMMENT '特殊需求'                                             AFTER `expected_deal_date`,
  ADD COLUMN `source_detail`          VARCHAR(50)   DEFAULT NULL COMMENT '来源细分'                                             AFTER `special_needs`,
  ADD COLUMN `team_type`              VARCHAR(20)   DEFAULT NULL COMMENT '负责团队(电销/线上获客)'                               AFTER `source_detail`,
  ADD COLUMN `collaborator_ids`       JSON          DEFAULT NULL COMMENT '协作人ID列表'                                         AFTER `team_type`,
  ADD COLUMN `recycle_count`          INT           DEFAULT 0    COMMENT '被回收次数'                                           AFTER `collaborator_ids`,
  ADD COLUMN `last_recycle_time`      DATETIME      DEFAULT NULL COMMENT '上次被回收时间'                                       AFTER `recycle_count`,
  ADD INDEX `idx_pool_id` (`pool_id`),
  ADD INDEX `idx_ownership` (`ownership`),
  ADD INDEX `idx_last_follow_time` (`last_follow_time`),
  ADD INDEX `idx_protection_expire` (`protection_expire_date`),
  ADD INDEX `idx_service_expire_date` (`service_expire_date`);

-- ============================================================
-- 2. 公海池配置表 crm_pool_config
-- ============================================================
CREATE TABLE `crm_pool_config` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '公海池ID',
  `pool_name`       VARCHAR(50)  NOT NULL                COMMENT '公海池名称',
  `pool_type`       VARCHAR(20)  NOT NULL                COMMENT '池类型(telemarketing电销/online线上/collaboration协作/recycle回收/new_leads新线索/treasure藏金阁/frozen冻结库)',
  `visible_scope`   VARCHAR(20)  DEFAULT 'all'           COMMENT '可见范围(all全员/team本组/manager主管)',
  `operate_scope`   VARCHAR(20)  DEFAULT 'all'           COMMENT '操作范围(all全员/team_priority团队优先/manager_only仅主管)',
  `distribute_mode` VARCHAR(20)  DEFAULT 'manual'        COMMENT '分配方式(auto自动/manual手动/grab抢单/approval审批)',
  `description`     VARCHAR(200) DEFAULT NULL            COMMENT '描述',
  `sort_order`      INT          DEFAULT 0               COMMENT '排序',
  `status`          TINYINT      DEFAULT 1               COMMENT '状态(0启用/1禁用；V6统一初始化为0)',
  `rules_json`      JSON         DEFAULT NULL            COMMENT '池规则配置JSON',
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`       BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`       BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`         TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`       BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_pool_type` (`pool_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公海池配置表';

-- 公海池初始化数据
INSERT INTO `crm_pool_config` (`pool_name`, `pool_type`, `visible_scope`, `operate_scope`, `distribute_mode`, `description`, `sort_order`, `status`) VALUES
('电销公海池',     'telemarketing', 'all',     'team_priority', 'auto',     '电销团队公海，新线索按权重自动分配',         1, 1),
('线上获客公海池', 'online',        'all',     'team_priority', 'manual',   '线上获客团队公海，手动分配或抢单',           2, 1),
('协作公海池',     'collaboration', 'all',     'all',           'grab',     '跨团队协作池，全员可抢单',                   3, 1),
('回收公海池',     'recycle',       'all',     'manager_only',  'approval', '被回收的客户进入此池，需审批后再分配',       4, 1),
('新线索池',       'new_leads',     'manager', 'manager_only',  'manual',   '新录入未分配线索池，仅主管可见与分配',       5, 1),
('藏金阁',         'treasure',     'all',     'all',           'approval', '历史优质客户珍藏池，需审批领取',             6, 1),
('冻结库',         'frozen',       'manager', 'manager_only',  'manual',   '冻结/疑似无效客户库，仅主管可见与处理',     7, 1);

-- ============================================================
-- 3. 回收规则表 crm_recycle_rule
-- ============================================================
CREATE TABLE `crm_recycle_rule` (
  `id`                  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '规则ID',
  `rule_name`           VARCHAR(100) NOT NULL                COMMENT '规则名称',
  `rule_code`           VARCHAR(50)  NOT NULL                COMMENT '规则编码',
  `trigger_type`        VARCHAR(20)  NOT NULL                COMMENT '触发类型(time时间/behavior行为/status状态)',
  `apply_scope`         VARCHAR(50)  DEFAULT NULL            COMMENT '适用范围(all/telemarketing/online/grab)',
  `condition_json`      JSON         NOT NULL                COMMENT '条件配置JSON',
  `recycle_days`        INT          DEFAULT NULL            COMMENT '回收天数',
  `warning_days_green`  INT          DEFAULT 7               COMMENT '绿灯预警天数',
  `warning_days_yellow` INT          DEFAULT 3               COMMENT '黄灯预警天数',
  `warning_days_red`    INT          DEFAULT 1               COMMENT '红灯预警天数',
  `target_pool_id`      BIGINT       DEFAULT NULL            COMMENT '回收目标公海池ID',
  `priority`            INT          DEFAULT 0               COMMENT '优先级(越大越高)',
  `status`              TINYINT      DEFAULT 1               COMMENT '状态(0禁用/1启用)',
  `create_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`           BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`           BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`             TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`           BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_trigger_type` (`trigger_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回收规则表';

-- 默认回收规则数据
INSERT INTO `crm_recycle_rule` (`rule_name`, `rule_code`, `trigger_type`, `apply_scope`, `condition_json`, `recycle_days`, `warning_days_green`, `warning_days_yellow`, `warning_days_red`, `priority`, `status`) VALUES
('15天未跟进自动回收',   'NO_FOLLOW_15',      'time',     'all',           '{"field":"last_follow_time","op":">=","days":15}',                                15, 7, 3, 1, 100, 1),
('新入库超期3天未分配',  'NEW_LEAD_3',        'time',     'new_leads',     '{"field":"create_time","op":">=","days":3,"status":"unassigned"}',                3, 2, 1, 0, 90,  1),
('抢单后3天未跟进',      'GRAB_NO_FOLLOW_3',  'behavior', 'grab',          '{"field":"claim_time","op":">=","days":3,"behavior":"no_follow"}',                3, 2, 1, 0, 80,  1),
('领取后60天未成交',     'NO_DEAL_60',        'time',     'all',           '{"field":"claim_time","op":">=","days":60,"customer_level":["B","C"]}',           60,15, 7, 3, 70,  1),
('报价后30天停滞',       'QUOTE_STAGNANT_30', 'status',   'all',           '{"field":"quoted_price","op":"not_null","stage":"quoted","days":30}',             30,10, 5, 2, 60,  1),
('电销7天无触达',        'TM_NO_TOUCH_7',     'behavior', 'telemarketing', '{"field":"last_follow_time","op":">=","days":7,"team_type":"telemarketing"}',     7, 3, 2, 1, 50,  1);

-- ============================================================
-- 4. 分配日志表 crm_distribute_log
-- ============================================================
CREATE TABLE `crm_distribute_log` (
  `id`                  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `lead_id`             BIGINT       NOT NULL                COMMENT '线索/客户ID',
  `from_pool_id`        BIGINT       DEFAULT NULL            COMMENT '来源公海池ID',
  `to_user_id`          BIGINT       NOT NULL                COMMENT '分配目标用户ID',
  `to_user_name`        VARCHAR(50)  DEFAULT NULL            COMMENT '目标用户名',
  `from_user_id`        BIGINT       DEFAULT NULL            COMMENT '来源用户ID(转移时)',
  `from_user_name`      VARCHAR(50)  DEFAULT NULL            COMMENT '来源用户名',
  `distribute_type`     VARCHAR(20)  NOT NULL                COMMENT '分配类型(auto自动/manual手动/grab抢单/transfer转移/recycle回收)',
  `weight_detail_json`  JSON         DEFAULT NULL            COMMENT '权重计算详情',
  `remark`              VARCHAR(200) DEFAULT NULL            COMMENT '备注',
  `create_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by`           BIGINT       DEFAULT NULL            COMMENT '创建人',
  `tenant_id`           BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_lead_id` (`lead_id`),
  KEY `idx_to_user` (`to_user_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分配日志表';

-- ============================================================
-- 5. 撞单记录表 crm_collision_log
-- ============================================================
CREATE TABLE `crm_collision_log` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `lead_id`           BIGINT       NOT NULL                COMMENT '线索/客户ID',
  `lead_name`         VARCHAR(100) DEFAULT NULL            COMMENT '客户名称',
  `user_a_id`         BIGINT       NOT NULL                COMMENT '冲突方A',
  `user_a_name`       VARCHAR(50)  DEFAULT NULL            COMMENT '冲突方A姓名',
  `user_b_id`         BIGINT       NOT NULL                COMMENT '冲突方B',
  `user_b_name`       VARCHAR(50)  DEFAULT NULL            COMMENT '冲突方B姓名',
  `conflict_type`     VARCHAR(50)  NOT NULL                COMMENT '冲突类型(same_time同时跟进/cross_channel跨渠道/duplicate重复录入/grab_conflict抢单冲突)',
  `match_field`       VARCHAR(50)  DEFAULT NULL            COMMENT '匹配字段(credit_code/name/phone/combo)',
  `resolution`        VARCHAR(50)  DEFAULT NULL            COMMENT '处理结果(merge合并/a_wins/b_wins/collaborate协作)',
  `resolution_detail` VARCHAR(500) DEFAULT NULL            COMMENT '处理详情',
  `resolved_by`       BIGINT       DEFAULT NULL            COMMENT '处理人ID',
  `resolved_time`     DATETIME     DEFAULT NULL            COMMENT '处理时间',
  `status`            TINYINT      DEFAULT 0               COMMENT '状态(0待处理/1已处理)',
  `create_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `tenant_id`         BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_lead_id` (`lead_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='撞单记录表';

-- ============================================================
-- 6. 服务订单表 crm_service_order
-- ============================================================
CREATE TABLE `crm_service_order` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `customer_id`    BIGINT        NOT NULL                COMMENT '客户ID',
  `customer_name`  VARCHAR(100)  DEFAULT NULL            COMMENT '客户名称',
  `service_type`   VARCHAR(50)   NOT NULL                COMMENT '服务类型(bookkeeping代账/tax_filing纳税申报/registration注册/cancellation注销/tax_planning税筹/audit审计/qualification资质)',
  `contract_no`    VARCHAR(50)   DEFAULT NULL            COMMENT '合同编号',
  `start_date`     DATE          NOT NULL                COMMENT '服务开始日期',
  `end_date`       DATE          NOT NULL                COMMENT '服务到期日期',
  `amount`         DECIMAL(10,2) DEFAULT NULL            COMMENT '服务金额(元/月)',
  `total_amount`   DECIMAL(12,2) DEFAULT NULL            COMMENT '合同总金额',
  `status`         VARCHAR(20)   DEFAULT 'active'        COMMENT '状态(active服务中/expiring即将到期/expired已到期/renewed已续费/terminated已终止)',
  `renewal_status` VARCHAR(20)   DEFAULT NULL            COMMENT '续费状态(pending待续/negotiating洽谈中/confirmed已确认/lost流失)',
  `provider_type`  VARCHAR(20)   DEFAULT 'self'          COMMENT '服务商类型(self本公司/other他司)',
  `handler_id`     BIGINT        DEFAULT NULL            COMMENT '负责人ID',
  `handler_name`   VARCHAR(50)   DEFAULT NULL            COMMENT '负责人名',
  `remark`         VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`      BIGINT        DEFAULT NULL            COMMENT '创建人',
  `deleted`        TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`      BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_status` (`status`),
  KEY `idx_handler_id` (`handler_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务订单表';

-- ============================================================
-- 7. 提醒记录表 crm_reminder
-- ============================================================
CREATE TABLE `crm_reminder` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '提醒ID',
  `target_id`       BIGINT       NOT NULL                COMMENT '目标ID(客户/服务订单)',
  `target_type`     VARCHAR(20)  NOT NULL                COMMENT '目标类型(lead/service_order)',
  `reminder_type`   VARCHAR(30)  NOT NULL                COMMENT '提醒类型(new_assign/follow_due/recycle_warning/service_expire/claim_notify)',
  `reminder_level`  VARCHAR(10)  DEFAULT NULL            COMMENT '提醒级别(green/yellow/red/urgent)',
  `title`           VARCHAR(100) NOT NULL                COMMENT '提醒标题',
  `content`         VARCHAR(500) DEFAULT NULL            COMMENT '提醒内容',
  `recipient_id`    BIGINT       NOT NULL                COMMENT '接收人ID',
  `recipient_name`  VARCHAR(50)  DEFAULT NULL            COMMENT '接收人名',
  `cc_user_ids`     JSON         DEFAULT NULL            COMMENT '抄送人ID列表',
  `sent_time`       DATETIME     DEFAULT NULL            COMMENT '发送时间',
  `read_time`       DATETIME     DEFAULT NULL            COMMENT '已读时间',
  `status`          TINYINT      DEFAULT 0               COMMENT '状态(0未读/1已读/2已处理)',
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `tenant_id`       BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient_id`),
  KEY `idx_target` (`target_id`, `target_type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒记录表';

-- ============================================================
-- 8. 持有上限配置表 crm_holding_config
-- ============================================================
CREATE TABLE `crm_holding_config` (
  `id`                       BIGINT       NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `role_type`                VARCHAR(30)  NOT NULL                COMMENT '角色类型(telemarketing_junior电销初级/telemarketing_mid电销中级/telemarketing_senior电销高级/online_staff线上专员/online_manager线上主管/sales_manager销售主管)',
  `role_label`               VARCHAR(50)  NOT NULL                COMMENT '角色显示名',
  `max_holding`              INT          NOT NULL                COMMENT '最大持有量',
  `overtime_tolerance_rate`  DECIMAL(3,2) DEFAULT 0.10            COMMENT '超限容忍率(电销10%)',
  `overtime_release_hours`   INT          DEFAULT 24              COMMENT '超限释放时限(小时)',
  `description`              VARCHAR(200) DEFAULT NULL            COMMENT '说明',
  `status`                   TINYINT      DEFAULT 1               COMMENT '状态(0禁用/1启用)',
  `create_time`              DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`              DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `tenant_id`                BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_type` (`role_type`, `tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='持有上限配置表';

-- 持有上限默认配置
INSERT INTO `crm_holding_config` (`role_type`, `role_label`, `max_holding`, `overtime_tolerance_rate`, `overtime_release_hours`, `description`, `status`) VALUES
('telemarketing_junior', '电销初级', 80,  0.10, 24, '电销初级专员持有上限',           1),
('telemarketing_mid',    '电销中级', 120, 0.10, 24, '电销中级专员持有上限',           1),
('telemarketing_senior', '电销高级', 200, 0.10, 24, '电销高级专员持有上限',           1),
('online_staff',         '线上专员', 50,  0.00, 24, '线上获客专员持有上限',           1),
('online_manager',       '线上主管', 30,  0.00, 24, '线上获客主管持有上限(管理为主)', 1),
('sales_manager',        '销售主管', 20,  0.00, 24, '销售主管持有上限(管理为主)',     1);

-- ============================================================
-- 迁移脚本结束
-- ============================================================
