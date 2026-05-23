SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭企服ERP系统 - 财务管理模块
-- ============================================================

USE `zhehang_erp`;

CREATE TABLE `finance_voucher` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '凭证ID',
  `voucher_no` VARCHAR(32) NOT NULL COMMENT '凭证号',
  `voucher_date` DATE NOT NULL COMMENT '凭证日期',
  `voucher_type` TINYINT DEFAULT 1 COMMENT '凭证类型（1收 2付 3转）',
  `period` VARCHAR(7) NOT NULL COMMENT '会计期间（yyyy-MM）',
  `summary` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
  `total_debit` DECIMAL(15,2) DEFAULT 0.00 COMMENT '借方合计',
  `total_credit` DECIMAL(15,2) DEFAULT 0.00 COMMENT '贷方合计',
  `status` TINYINT DEFAULT 1 COMMENT '状态（1草稿 2已审核 3已过账 4已作废）',
  `reviewer_id` BIGINT DEFAULT NULL COMMENT '审核人ID',
  `review_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `customer_id` BIGINT DEFAULT NULL COMMENT '代账客户ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_no` (`voucher_no`),
  KEY `idx_voucher_date` (`voucher_date`),
  KEY `idx_period` (`period`),
  KEY `idx_status` (`status`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会计凭证表';

CREATE TABLE `finance_voucher_entry` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分录ID',
  `voucher_id` BIGINT NOT NULL COMMENT '凭证ID',
  `subject_code` VARCHAR(32) NOT NULL COMMENT '科目编码',
  `subject_name` VARCHAR(100) NOT NULL COMMENT '科目名称',
  `summary` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
  `debit_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '借方金额',
  `credit_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '贷方金额',
  `auxiliary` VARCHAR(500) DEFAULT NULL COMMENT '辅助核算',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_voucher_id` (`voucher_id`),
  KEY `idx_subject_code` (`subject_code`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='凭证分录表';

CREATE TABLE `finance_ledger` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '账簿ID',
  `subject_code` VARCHAR(32) NOT NULL COMMENT '科目编码',
  `subject_name` VARCHAR(100) NOT NULL COMMENT '科目名称',
  `period` VARCHAR(7) NOT NULL COMMENT '会计期间（yyyy-MM）',
  `opening_balance` DECIMAL(15,2) DEFAULT 0.00 COMMENT '期初余额',
  `debit_total` DECIMAL(15,2) DEFAULT 0.00 COMMENT '本期借方合计',
  `credit_total` DECIMAL(15,2) DEFAULT 0.00 COMMENT '本期贷方合计',
  `closing_balance` DECIMAL(15,2) DEFAULT 0.00 COMMENT '期末余额',
  `direction` TINYINT DEFAULT 1 COMMENT '余额方向（1借 2贷）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subject_period` (`subject_code`, `period`),
  KEY `idx_period` (`period`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账簿表';

CREATE TABLE `finance_report` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '报表ID',
  `report_name` VARCHAR(200) NOT NULL COMMENT '报表名称',
  `report_type` TINYINT DEFAULT 1 COMMENT '报表类型（1资产负债表 2利润表 3现金流量表）',
  `period` VARCHAR(7) NOT NULL COMMENT '会计期间（yyyy-MM）',
  `data_json` JSON DEFAULT NULL COMMENT '报表数据（JSON）',
  `status` TINYINT(1) DEFAULT 0 COMMENT '状态（0草稿 1已发布）',
  `customer_id` BIGINT DEFAULT NULL COMMENT '代账客户ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_report_type` (`report_type`),
  KEY `idx_period` (`period`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务报表表';

CREATE TABLE `finance_tax` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '税务ID',
  `customer_id` BIGINT DEFAULT NULL COMMENT '代账客户ID',
  `tax_type` VARCHAR(64) NOT NULL COMMENT '税种',
  `period` VARCHAR(7) NOT NULL COMMENT '纳税期间（yyyy-MM）',
  `taxable_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '应纳税所得额',
  `tax_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '税率（%）',
  `tax_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '应纳税额',
  `status` TINYINT DEFAULT 1 COMMENT '状态（1待申报 2已申报 3已缴纳）',
  `deadline` DATE DEFAULT NULL COMMENT '申报截止日期',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_tax_type` (`tax_type`),
  KEY `idx_period` (`period`),
  KEY `idx_status` (`status`),
  KEY `idx_deadline` (`deadline`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='税务记录表';

CREATE TABLE `finance_invoice` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '发票ID',
  `customer_id` BIGINT DEFAULT NULL COMMENT '客户ID',
  `invoice_no` VARCHAR(32) NOT NULL COMMENT '发票号码',
  `invoice_type` TINYINT DEFAULT 1 COMMENT '发票类型（1增值税专票 2增值税普票）',
  `direction` TINYINT DEFAULT 1 COMMENT '方向（1进项 2销项）',
  `amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '不含税金额',
  `tax_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '税额',
  `total_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '价税合计',
  `invoice_date` DATE DEFAULT NULL COMMENT '开票日期',
  `status` TINYINT(1) DEFAULT 0 COMMENT '状态（0正常 1已作废）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_invoice_date` (`invoice_date`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发票表';

CREATE TABLE `finance_reimburse` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '报销ID',
  `applicant_id` BIGINT NOT NULL COMMENT '申请人ID',
  `reimburse_no` VARCHAR(32) NOT NULL COMMENT '报销单号',
  `title` VARCHAR(200) NOT NULL COMMENT '报销标题',
  `total_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '报销总金额',
  `status` TINYINT DEFAULT 1 COMMENT '状态（1待审批 2审批中 3已通过 4已驳回 5已打款）',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reimburse_no` (`reimburse_no`),
  KEY `idx_applicant_id` (`applicant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='费用报销表';

CREATE TABLE `finance_receivable` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '应收应付ID',
  `type` TINYINT NOT NULL COMMENT '类型（1应收 2应付）',
  `customer_id` BIGINT DEFAULT NULL COMMENT '客户ID',
  `contract_id` BIGINT DEFAULT NULL COMMENT '合同ID',
  `amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '总金额',
  `received_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '已收/付金额',
  `remaining_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '剩余金额',
  `due_date` DATE DEFAULT NULL COMMENT '到期日期',
  `status` TINYINT DEFAULT 1 COMMENT '状态（1待收 2部分收 3已收 4逾期）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应收应付表';
