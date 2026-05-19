SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭企服ERP系统 - 销售管理模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 报价单表
-- -----------------------------------------------------------
CREATE TABLE `sales_quotation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '报价单ID',
    `quotation_no` VARCHAR(50) NOT NULL COMMENT '报价单号',
    `customer_id` BIGINT NOT NULL COMMENT '客户ID',
    `title` VARCHAR(200) DEFAULT NULL COMMENT '报价标题',
    `total_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '总金额',
    `valid_until` DATE DEFAULT NULL COMMENT '有效期至',
    `version` INT DEFAULT 1 COMMENT '版本号',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1草稿 2已发送 3已确认 4已过期',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_quotation_no` (`quotation_no`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报价单表';

-- -----------------------------------------------------------
-- 2. 销售订单表
-- -----------------------------------------------------------
CREATE TABLE `sales_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(50) NOT NULL COMMENT '订单编号',
    `customer_id` BIGINT NOT NULL COMMENT '客户ID',
    `quotation_id` BIGINT DEFAULT NULL COMMENT '报价单ID',
    `total_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '总金额',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待审批 2已审批 3执行中 4已完成 5已取消',
    `delivery_date` DATE DEFAULT NULL COMMENT '交付日期',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_quotation_id` (`quotation_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售订单表';

-- -----------------------------------------------------------
-- 3. 发货单表
-- -----------------------------------------------------------
CREATE TABLE `sales_delivery` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '发货单ID',
    `delivery_no` VARCHAR(50) NOT NULL COMMENT '发货单号',
    `order_id` BIGINT NOT NULL COMMENT '销售订单ID',
    `customer_id` BIGINT NOT NULL COMMENT '客户ID',
    `delivery_date` DATE DEFAULT NULL COMMENT '发货日期',
    `logistics_company` VARCHAR(100) DEFAULT NULL COMMENT '物流公司',
    `tracking_no` VARCHAR(100) DEFAULT NULL COMMENT '物流单号',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待发货 2已发货 3已签收',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_delivery_no` (`delivery_no`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发货单表';

-- -----------------------------------------------------------
-- 4. 回款记录表
-- -----------------------------------------------------------
CREATE TABLE `sales_receipt` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '回款ID',
    `customer_id` BIGINT NOT NULL COMMENT '客户ID',
    `contract_id` BIGINT DEFAULT NULL COMMENT '合同ID',
    `order_id` BIGINT DEFAULT NULL COMMENT '订单ID',
    `amount` DECIMAL(14,2) NOT NULL COMMENT '回款金额',
    `receipt_date` DATE DEFAULT NULL COMMENT '回款日期',
    `payment_method` VARCHAR(50) DEFAULT NULL COMMENT '支付方式',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待确认 2已确认',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_contract_id` (`contract_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_receipt_date` (`receipt_date`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回款记录表';

-- -----------------------------------------------------------
-- 5. 销售提成表
-- -----------------------------------------------------------
CREATE TABLE `sales_commission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '提成ID',
    `employee_id` BIGINT NOT NULL COMMENT '员工ID',
    `order_id` BIGINT DEFAULT NULL COMMENT '订单ID',
    `amount` DECIMAL(14,2) DEFAULT NULL COMMENT '订单金额',
    `commission_rate` DECIMAL(5,2) DEFAULT NULL COMMENT '提成比例(%)',
    `commission_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '提成金额',
    `period` VARCHAR(20) DEFAULT NULL COMMENT '结算周期',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待结算 2已结算',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_employee_id` (`employee_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_period` (`period`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售提成表';
