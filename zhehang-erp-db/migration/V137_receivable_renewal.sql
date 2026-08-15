-- =============================================================================
-- V137 回款续费模块
-- 目标:管理客户应收、实收、欠费、续费到期、催收责任人与催收历史。
-- 说明:新增独立表,不改旧 finance_receivable 应收应付表,不迁移历史业务数据。
-- =============================================================================

CREATE TABLE IF NOT EXISTS `fin_receivable_renewal` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `customer_id` BIGINT DEFAULT NULL COMMENT '关联客户ID(crm_customer.id)',
  `customer_name` VARCHAR(200) NOT NULL COMMENT '客户名称',
  `service_type` VARCHAR(32) NOT NULL COMMENT '服务类型:代理记账/工商/刻章/其他',
  `receivable_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '应收金额',
  `receivable_month` VARCHAR(7) NOT NULL COMMENT '应收月份 yyyy-MM',
  `due_date` DATE NOT NULL COMMENT '到期日',
  `received_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '实收金额',
  `arrears_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '欠费金额(应收-实收)',
  `receivable_status` TINYINT NOT NULL DEFAULT 0 COMMENT '应收状态:0待收/1部分收款/2已付款/3逾期',
  `collector_id` BIGINT NOT NULL COMMENT '催收负责人用户ID(sys_user.id/org_employee.user_id)',
  `collector_name` VARCHAR(64) DEFAULT NULL COMMENT '催收负责人姓名快照',
  `collector_dept_id` BIGINT DEFAULT NULL COMMENT '催收负责人部门ID(数据权限)',
  `collection_status` VARCHAR(32) NOT NULL DEFAULT '未催' COMMENT '催收状态:未催/已催/承诺付款/已付款/坏账风险',
  `recent_collection_time` DATETIME DEFAULT NULL COMMENT '最近催收时间',
  `next_collection_time` DATETIME DEFAULT NULL COMMENT '下次催收时间',
  `paused_service` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否暂停服务:0否/1是',
  `remark` VARCHAR(1000) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_fin_rr_customer` (`customer_id`),
  KEY `idx_fin_rr_customer_name` (`customer_name`),
  KEY `idx_fin_rr_month` (`receivable_month`),
  KEY `idx_fin_rr_due` (`due_date`),
  KEY `idx_fin_rr_collector` (`collector_id`),
  KEY `idx_fin_rr_status` (`receivable_status`, `collection_status`),
  KEY `idx_fin_rr_next` (`next_collection_time`),
  KEY `idx_fin_rr_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回款续费应收台账';

CREATE TABLE IF NOT EXISTS `fin_receivable_collection_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `receivable_id` BIGINT NOT NULL COMMENT '回款续费应收ID',
  `action_type` VARCHAR(32) NOT NULL COMMENT '动作类型:新增应收/更新应收/催收记录/记录收款/系统更新',
  `action_time` DATETIME NOT NULL COMMENT '动作时间',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作人用户ID',
  `operator_name` VARCHAR(64) DEFAULT NULL COMMENT '操作人姓名/账号',
  `before_status` VARCHAR(32) DEFAULT NULL COMMENT '变更前催收状态',
  `after_status` VARCHAR(32) DEFAULT NULL COMMENT '变更后催收状态',
  `payment_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '本次收款金额',
  `received_after` DECIMAL(14,2) DEFAULT NULL COMMENT '操作后实收金额',
  `arrears_after` DECIMAL(14,2) DEFAULT NULL COMMENT '操作后欠费金额',
  `next_collection_time` DATETIME DEFAULT NULL COMMENT '下次催收时间',
  `content` VARCHAR(1000) DEFAULT NULL COMMENT '催收/收款内容',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_fin_rr_log_receivable` (`receivable_id`),
  KEY `idx_fin_rr_log_action` (`action_type`, `action_time`),
  KEY `idx_fin_rr_log_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回款续费催收/收款历史';

INSERT IGNORE INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (508, '回款续费', 500, 8, '/finance/receivable-renewal', 'finance/receivable-renewal', 'C', 1, 0, 'finance:receivable-renewal:list', 'wallet', 1, 1);

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 508
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'finance', 'finance_hq', 'sales', 'online_sales');
