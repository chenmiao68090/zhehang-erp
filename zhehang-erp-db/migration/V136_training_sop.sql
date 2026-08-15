-- =============================================================================
-- V136 员工培训/SOP 模块
-- 目标:沉淀 SOP 标准库、给员工分配培训任务、记录完成/考核/复训闭环。
-- 说明:仅新增表与 8 份基础 SOP 种子,不修改生产历史数据。
-- =============================================================================

CREATE TABLE IF NOT EXISTS `hrm_sop` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `sop_title` VARCHAR(200) NOT NULL COMMENT 'SOP标题',
  `applicable_positions` VARCHAR(255) NOT NULL COMMENT '适用岗位,逗号分隔',
  `business_scenario` VARCHAR(64) NOT NULL COMMENT '业务场景',
  `standard_steps` TEXT NOT NULL COMMENT '标准步骤',
  `check_standard` TEXT NOT NULL COMMENT '检查标准',
  `owner_id` BIGINT NULL COMMENT '负责人ID(org_employee.id)',
  `owner_name` VARCHAR(64) NULL COMMENT '负责人姓名快照',
  `version_no` VARCHAR(32) NOT NULL DEFAULT 'v1.0' COMMENT '版本号',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `usage_count` INT NOT NULL DEFAULT 0 COMMENT '使用次数(查看/分配)',
  `last_used_time` DATETIME NULL COMMENT '最近使用时间',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_hrm_sop_position` (`applicable_positions`),
  KEY `idx_hrm_sop_scenario` (`business_scenario`),
  KEY `idx_hrm_sop_enabled` (`enabled`),
  KEY `idx_hrm_sop_usage` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训SOP标准库';

CREATE TABLE IF NOT EXISTS `hrm_sop_training_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `employee_id` BIGINT NOT NULL COMMENT '员工ID(org_employee.id)',
  `employee_name` VARCHAR(64) NOT NULL COMMENT '员工姓名快照',
  `employee_user_id` BIGINT NULL COMMENT '员工用户ID(sys_user.id)',
  `training_theme` VARCHAR(200) NOT NULL COMMENT '培训主题',
  `sop_id` BIGINT NOT NULL COMMENT '对应SOP',
  `sop_title` VARCHAR(200) NOT NULL COMMENT 'SOP标题快照',
  `sop_version` VARCHAR(32) NOT NULL COMMENT '分配时SOP版本快照',
  `training_time` DATETIME NOT NULL COMMENT '培训时间',
  `completed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '员工是否完成',
  `completed_time` DATETIME NULL COMMENT '完成时间',
  `assessment_result` VARCHAR(20) NOT NULL DEFAULT '待考核' COMMENT '考核结果:待考核/通过/未通过',
  `improvement` TEXT NULL COMMENT '需改进问题',
  `retrain_time` DATETIME NULL COMMENT '复训时间',
  `reviewer_id` BIGINT NULL COMMENT '考核人用户ID',
  `reviewer_name` VARCHAR(64) NULL COMMENT '考核人姓名/账号',
  `review_time` DATETIME NULL COMMENT '考核时间',
  `assigner_id` BIGINT NULL COMMENT '分配人用户ID',
  `assigner_name` VARCHAR(64) NULL COMMENT '分配人姓名/账号',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_sop_training_employee` (`employee_id`),
  KEY `idx_sop_training_sop` (`sop_id`),
  KEY `idx_sop_training_completed` (`completed`),
  KEY `idx_sop_training_assessment` (`assessment_result`),
  KEY `idx_sop_training_time` (`training_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工SOP培训记录';

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '新客户交接资料收集SOP', '会计,客服,运营', '新客户交接',
'1. 确认客户基础信息:公司名称、税号、联系人、联系电话、服务项目。
2. 建立客户资料清单:营业执照、法人身份证、开户许可证、税控/电子税务局账号、历史账套。
3. 与销售确认已承诺事项、收费周期、交付边界和特殊风险。
4. 在系统内补齐客户档案,并把缺失资料标记为待补。
5. 首次服务前向负责人同步交接结论和风险提醒。',
'客户档案完整;缺失资料有明确责任人与截止时间;销售承诺与交付范围一致;风险事项已同步负责人。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '新客户交接资料收集SOP' AND `deleted` = 0);

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '小规模纳税人月度做账SOP', '会计', '做账',
'1. 按客户清单收集银行流水、销项发票、进项票据和费用单据。
2. 核对收入、成本、费用与上月余额,发现异常先标记再询问客户。
3. 按公司科目规则录入凭证,不得用模糊摘要替代真实业务。
4. 做账完成后检查现金、银行、应收应付、税金余额。
5. 输出本月账务小结,同步客户异常与下月需补资料。',
'凭证附件齐全;科目使用正确;余额无异常负数;异常事项有备注;账务小结可追溯。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '小规模纳税人月度做账SOP' AND `deleted` = 0);

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '申报前税负风险检查SOP', '会计,管理', '报税',
'1. 申报前核对销项、进项、工资、社保、公积金和附加税数据。
2. 对比上月和去年同期税负,明显波动需写明原因。
3. 检查未认证发票、异常抵扣、零申报连续月份和逾期风险。
4. 申报前将风险点发给负责人复核。
5. 申报完成后保存回执,并更新客户税务状态。',
'申报数据与账务一致;税负波动有解释;高风险客户有负责人复核;回执归档完整。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '申报前税负风险检查SOP' AND `deleted` = 0);

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '开票信息核对SOP', '会计,客服,运营', '开票',
'1. 收到开票需求后确认购买方名称、税号、地址电话、开户行账号。
2. 核对合同、回款、开票金额、税率和商品服务名称是否一致。
3. 异常开票需求先询问负责人,不得先开后补审批。
4. 开票后把发票号码、金额、日期同步到客户档案。
5. 客户要求作废/红冲时先登记原因并走复核。',
'抬头税号无误;金额税率与合同/回款一致;异常开票有审批;发票信息已留痕。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '开票信息核对SOP' AND `deleted` = 0);

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '客户投诉升级处理SOP', '客服,管理,运营', '客户投诉',
'1. 先安抚客户并记录投诉时间、对象、诉求、证据和影响范围。
2. 30分钟内判断严重程度:一般问题客服处理,重大问题升级主管。
3. 查明责任环节,形成处理方案、补救动作和完成时间。
4. 处理完成后向客户确认结果,并记录客户反馈。
5. 每周复盘投诉原因,转化为 SOP 修订或培训任务。',
'投诉记录完整;升级及时;方案有责任人和截止时间;客户确认闭环;重复问题进入复盘。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '客户投诉升级处理SOP' AND `deleted` = 0);

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '销售跟进记录SOP', '销售,管理', '销售跟进',
'1. 每次联系后立即记录通话结果、客户痛点、意向等级和下一步动作。
2. 意向客户必须写清预算、决策人、预计签约时间和竞争情况。
3. 无效或拒绝客户要选择原因,避免重复无效拨打。
4. 次日待办必须在当天跟进记录中设置。
5. 主管抽查时能通过记录还原客户状态。',
'跟进记录当天完成;意向等级与内容一致;下一步动作明确;拒绝原因可复盘;主管能追溯。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '销售跟进记录SOP' AND `deleted` = 0);

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '应收回款催收SOP', '销售,客服,会计', '回款催收',
'1. 每日查看到期、逾期和即将到期客户,按金额和逾期天数排序。
2. 首次催收用服务节点提醒,避免直接制造对立。
3. 逾期超过约定期限时同步销售、会计和负责人。
4. 客户承诺付款必须记录承诺时间、金额和付款方式。
5. 承诺未兑现的客户进入升级处理,必要时暂停非必要服务。',
'催收名单每日更新;每次沟通有记录;承诺付款可追踪;逾期升级及时;服务暂停有审批。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '应收回款催收SOP' AND `deleted` = 0);

INSERT INTO `hrm_sop`
(`sop_title`, `applicable_positions`, `business_scenario`, `standard_steps`, `check_standard`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '工商业务资料收集SOP', '工商,客服,运营', '资料收集',
'1. 明确业务类型:注册、变更、注销、许可或异常处理。
2. 按业务类型生成资料清单,标出客户提供、内部准备、需签字盖章三类。
3. 收到资料后检查证照、身份证、地址、章程、签字页是否一致。
4. 缺失资料当天反馈客户,并记录补交截止时间。
5. 资料齐全后移交办理人,并保留交接记录。',
'资料清单与业务类型匹配;缺失项有截止时间;签字盖章无遗漏;办理人交接留痕。', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_sop` WHERE `sop_title` = '工商业务资料收集SOP' AND `deleted` = 0);

-- 菜单入口:把旧「培训课程」顶层改名,并补子菜单 /training/sop,避免后端菜单过滤把页面隐藏。
UPDATE `sys_menu`
SET `menu_name` = '员工培训/SOP', `icon` = 'reading'
WHERE (`id` = 900010 OR `path` = '/training') AND `deleted` = 0;

INSERT IGNORE INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (900110, '员工培训/SOP', 900010, 1, 'sop', NULL, 'C', 1, 0, NULL, 'reading', 1, 1);

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 900110
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr', 'sales', 'online_sales', 'finance', 'finance_hq', 'staff');
