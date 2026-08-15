-- 订单台账管理五页业务补全（2026-08-11 已获老板明确确认上线）。
-- 仅扩展 feige_* 独立表，不读取或改写 biz_order / biz_contract / 提单中心数据。

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS `apply_v202_feige_order_parity`;
DELIMITER $$
CREATE PROCEDURE `apply_v202_feige_order_parity`()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='feige_order' AND COLUMN_NAME='team_name') THEN
    ALTER TABLE `feige_order`
      ADD COLUMN `team_name` VARCHAR(100) DEFAULT NULL COMMENT '所属团队快照',
      ADD COLUMN `company_id` BIGINT DEFAULT NULL COMMENT '独立客户ID',
      ADD COLUMN `customer_source` VARCHAR(100) DEFAULT NULL COMMENT '客户来源',
      ADD COLUMN `source_detail` VARCHAR(200) DEFAULT NULL COMMENT '来源明细',
      ADD COLUMN `audit_status` VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '财务审核状态',
      ADD COLUMN `audit_remark` VARCHAR(500) DEFAULT NULL COMMENT '审核意见',
      ADD COLUMN `auditor_id` BIGINT DEFAULT NULL COMMENT '审核人ID',
      ADD COLUMN `auditor_name` VARCHAR(100) DEFAULT NULL COMMENT '审核人姓名快照',
      ADD COLUMN `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
      ADD COLUMN `flow_progress` VARCHAR(20) DEFAULT NULL COMMENT '流程进度',
      ADD COLUMN `current_step` VARCHAR(100) DEFAULT NULL COMMENT '当前步骤',
      ADD COLUMN `task_status` VARCHAR(32) DEFAULT NULL COMMENT '任务状态',
      ADD COLUMN `repurchase_count` INT NOT NULL DEFAULT 0 COMMENT '复购次数',
      ADD COLUMN `company_nature` VARCHAR(64) DEFAULT NULL COMMENT '企业性质',
      ADD COLUMN `business_data` JSON DEFAULT NULL COMMENT '业务扩展字段';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='feige_accounting_contract' AND COLUMN_NAME='paid_amount') THEN
    ALTER TABLE `feige_accounting_contract`
      ADD COLUMN `paid_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '已收金额',
      ADD COLUMN `customer_source` VARCHAR(100) DEFAULT NULL COMMENT '客户来源',
      ADD COLUMN `signer_name` VARCHAR(100) DEFAULT NULL COMMENT '签约人',
      ADD COLUMN `product_name` VARCHAR(200) DEFAULT NULL COMMENT '服务产品',
      ADD COLUMN `renewal_status` VARCHAR(32) NOT NULL DEFAULT 'normal' COMMENT '续费生命周期视图',
      ADD COLUMN `total_spending` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '累计消费金额',
      ADD COLUMN `customer_order_count` INT NOT NULL DEFAULT 0 COMMENT '客户订单数',
      ADD COLUMN `referral_count` INT NOT NULL DEFAULT 0 COMMENT '转介绍数',
      ADD COLUMN `followup_count` INT NOT NULL DEFAULT 0 COMMENT '跟进记录数',
      ADD COLUMN `collection_count` INT NOT NULL DEFAULT 0 COMMENT '续费记录数',
      ADD COLUMN `service_months` INT NOT NULL DEFAULT 0 COMMENT '累计服务月数',
      ADD COLUMN `enterprise_level` VARCHAR(20) DEFAULT NULL COMMENT '企业等级',
      ADD COLUMN `business_tag` VARCHAR(100) DEFAULT NULL COMMENT '业务标签',
      ADD COLUMN `related_company_name` VARCHAR(200) DEFAULT NULL COMMENT '关联企业',
      ADD COLUMN `related_status` VARCHAR(32) DEFAULT NULL COMMENT '关联状态',
      ADD COLUMN `wework_group_bound` TINYINT NOT NULL DEFAULT 0 COMMENT '企微群是否关联',
      ADD COLUMN `finance_director_id` BIGINT DEFAULT NULL COMMENT '财税主管ID',
      ADD COLUMN `finance_director_name` VARCHAR(100) DEFAULT NULL COMMENT '财税主管姓名快照',
      ADD COLUMN `finance_advisor_id` BIGINT DEFAULT NULL COMMENT '财税顾问ID',
      ADD COLUMN `finance_advisor_name` VARCHAR(100) DEFAULT NULL COMMENT '财税顾问姓名快照',
      ADD COLUMN `accountant_id` BIGINT DEFAULT NULL COMMENT '主办会计ID',
      ADD COLUMN `accountant_name` VARCHAR(100) DEFAULT NULL COMMENT '主办会计姓名快照';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='feige_order' AND INDEX_NAME='idx_feige_order_audit') THEN
    ALTER TABLE `feige_order` ADD INDEX `idx_feige_order_audit` (`tenant_id`, `audit_status`, `salesman_id`, `deleted`);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='feige_accounting_contract' AND INDEX_NAME='idx_feige_contract_renewal') THEN
    ALTER TABLE `feige_accounting_contract` ADD INDEX `idx_feige_contract_renewal` (`tenant_id`, `renewal_status`, `expire_date`, `deleted`);
  END IF;
END$$
DELIMITER ;

CALL `apply_v202_feige_order_parity`();
DROP PROCEDURE IF EXISTS `apply_v202_feige_order_parity`;

CREATE TABLE IF NOT EXISTS `feige_order_step` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `step_no` INT NOT NULL COMMENT '步骤序号',
  `step_name` VARCHAR(100) NOT NULL COMMENT '步骤名称',
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '步骤状态',
  `assignee_id` BIGINT DEFAULT NULL COMMENT '办理人ID',
  `assignee_name` VARCHAR(100) DEFAULT NULL COMMENT '办理人姓名快照',
  `completed_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  `remark` VARCHAR(1000) DEFAULT NULL COMMENT '步骤备注',
  `create_time` DATETIME DEFAULT NULL, `update_time` DATETIME DEFAULT NULL,
  `create_by` BIGINT DEFAULT NULL, `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0, `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_feige_step_order_no` (`tenant_id`, `order_id`, `step_no`),
  KEY `idx_feige_step_order` (`tenant_id`, `order_id`, `status`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单流程步骤';

CREATE TABLE IF NOT EXISTS `feige_contract_renewal` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `contract_id` BIGINT NOT NULL COMMENT '合同ID',
  `renewal_date` DATE NOT NULL COMMENT '续费登记日期',
  `start_date` DATE DEFAULT NULL COMMENT '续费开始日期',
  `expire_date` DATE NOT NULL COMMENT '续费截止日期',
  `amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '续费金额',
  `gift_month` INT NOT NULL DEFAULT 0 COMMENT '赠送月份',
  `pay_type` VARCHAR(64) DEFAULT NULL COMMENT '付款周期',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(100) DEFAULT NULL COMMENT '操作人姓名快照',
  `remark` VARCHAR(1000) DEFAULT NULL COMMENT '续费备注',
  `create_time` DATETIME DEFAULT NULL, `update_time` DATETIME DEFAULT NULL,
  `create_by` BIGINT DEFAULT NULL, `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0, `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feige_renewal_contract` (`tenant_id`, `contract_id`, `renewal_date`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同续费记录';

CREATE TABLE IF NOT EXISTS `feige_contract_change_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `contract_id` BIGINT NOT NULL COMMENT '合同ID',
  `change_type` VARCHAR(64) NOT NULL COMMENT '变更类型',
  `change_desc` VARCHAR(500) NOT NULL COMMENT '变更说明',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(100) DEFAULT NULL COMMENT '操作人姓名快照',
  `before_data` LONGTEXT DEFAULT NULL COMMENT '变更前快照',
  `after_data` LONGTEXT DEFAULT NULL COMMENT '变更后快照',
  `create_time` DATETIME DEFAULT NULL, `update_time` DATETIME DEFAULT NULL,
  `create_by` BIGINT DEFAULT NULL, `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0, `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feige_contract_change` (`tenant_id`, `contract_id`, `create_time`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同变更记录';

CREATE TABLE IF NOT EXISTS `feige_contract_handover` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `source_staff_id` BIGINT DEFAULT NULL COMMENT '原服务人员ID',
  `source_staff_name` VARCHAR(100) DEFAULT NULL COMMENT '原服务人员姓名快照',
  `target_staff_id` BIGINT NOT NULL COMMENT '目标服务人员ID',
  `target_staff_name` VARCHAR(100) NOT NULL COMMENT '目标服务人员姓名快照',
  `service_role` VARCHAR(64) NOT NULL COMMENT '交接服务角色',
  `contract_count` INT NOT NULL DEFAULT 0 COMMENT '交接合同数',
  `affected_contract_ids` LONGTEXT NOT NULL COMMENT '受影响合同ID清单',
  `status` VARCHAR(32) NOT NULL DEFAULT 'completed' COMMENT '交接状态',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(100) DEFAULT NULL COMMENT '操作人姓名快照',
  `revoked_time` DATETIME DEFAULT NULL COMMENT '撤销时间',
  `create_time` DATETIME DEFAULT NULL, `update_time` DATETIME DEFAULT NULL,
  `create_by` BIGINT DEFAULT NULL, `update_by` BIGINT DEFAULT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0, `tenant_id` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feige_handover_time` (`tenant_id`, `create_time`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同人员交接历史';

-- 仅对已有 feige_* 行补齐新字段，不触碰浙杭原业务表。
UPDATE `feige_order`
SET `audit_status` = CASE WHEN `status` = 'pending' THEN 'pending' WHEN `status` = 'rejected' THEN 'rejected' ELSE 'approved' END,
    `flow_progress` = CASE WHEN `status` = 'completed' THEN '100%' WHEN `status` = 'in_progress' THEN '40%' ELSE '20%' END,
    `current_step` = CASE WHEN `status` = 'completed' THEN '已完成' WHEN `status` = 'in_progress' THEN '服务办理' ELSE '财务审核' END,
    `task_status` = CASE WHEN `status` = 'completed' THEN 'completed' WHEN `status` = 'rejected' THEN 'rejected' ELSE 'processing' END,
    `customer_source` = COALESCE(`customer_source`, `opportunity_source`),
    `company_nature` = COALESCE(`company_nature`, '未标注')
WHERE `deleted` = 0 AND (`flow_progress` IS NULL OR `current_step` IS NULL);

UPDATE `feige_accounting_contract`
SET `paid_amount` = COALESCE(`paid_amount`, 0),
    `total_spending` = CASE WHEN `total_spending` = 0 THEN `contract_amount` ELSE `total_spending` END,
    `renewal_status` = CASE WHEN `loss_flag` = 1 OR `contract_status` = 'terminated' THEN 'lossCustomer' ELSE COALESCE(`renewal_status`, 'normal') END,
    `accountant_id` = COALESCE(`accountant_id`, `service_person_id`),
    `accountant_name` = COALESCE(`accountant_name`, `service_person_name`)
WHERE `deleted` = 0;
