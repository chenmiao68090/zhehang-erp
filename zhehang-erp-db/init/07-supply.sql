SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 供应链管理模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 供应商表
-- -----------------------------------------------------------
CREATE TABLE `supply_vendor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '供应商ID',
    `name` VARCHAR(200) NOT NULL COMMENT '供应商名称',
    `code` VARCHAR(50) NOT NULL COMMENT '供应商编号',
    `contact_name` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
    `contact_phone` VARCHAR(30) DEFAULT NULL COMMENT '联系电话',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `address` VARCHAR(300) DEFAULT NULL COMMENT '地址',
    `bank_name` VARCHAR(100) DEFAULT NULL COMMENT '开户银行',
    `bank_account` VARCHAR(50) DEFAULT NULL COMMENT '银行账号',
    `rating` TINYINT DEFAULT NULL COMMENT '评级：1-5星',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1正常 2停用',
    `cooperation_start` DATE DEFAULT NULL COMMENT '合作开始日期',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY `idx_name` (`name`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='供应商表';

-- -----------------------------------------------------------
-- 2. 采购申请表
-- -----------------------------------------------------------
CREATE TABLE `supply_purchase_req` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '申请ID',
    `req_no` VARCHAR(50) NOT NULL COMMENT '申请单号',
    `applicant_id` BIGINT NOT NULL COMMENT '申请人ID',
    `dept_id` BIGINT DEFAULT NULL COMMENT '部门ID',
    `reason` VARCHAR(500) DEFAULT NULL COMMENT '采购原因',
    `total_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '总金额',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待审批 2已通过 3已驳回 4已关闭',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_req_no` (`req_no`),
    KEY `idx_applicant_id` (`applicant_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购申请表';

-- -----------------------------------------------------------
-- 3. 采购订单表
-- -----------------------------------------------------------
CREATE TABLE `supply_purchase_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(50) NOT NULL COMMENT '订单编号',
    `vendor_id` BIGINT NOT NULL COMMENT '供应商ID',
    `req_id` BIGINT DEFAULT NULL COMMENT '采购申请ID',
    `total_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '总金额',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待确认 2已确认 3部分到货 4已到货 5已取消',
    `expected_date` DATE DEFAULT NULL COMMENT '预计到货日期',
    `actual_date` DATE DEFAULT NULL COMMENT '实际到货日期',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_vendor_id` (`vendor_id`),
    KEY `idx_req_id` (`req_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购订单表';

-- -----------------------------------------------------------
-- 4. 入库单表
-- -----------------------------------------------------------
CREATE TABLE `supply_receipt` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '入库单ID',
    `receipt_no` VARCHAR(50) NOT NULL COMMENT '入库单号',
    `order_id` BIGINT DEFAULT NULL COMMENT '采购订单ID',
    `vendor_id` BIGINT DEFAULT NULL COMMENT '供应商ID',
    `receipt_date` DATE DEFAULT NULL COMMENT '入库日期',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待验收 2已验收 3已入库',
    `inspector_id` BIGINT DEFAULT NULL COMMENT '验收人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_receipt_no` (`receipt_no`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_vendor_id` (`vendor_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库单表';

-- -----------------------------------------------------------
-- 5. 退货单表
-- -----------------------------------------------------------
CREATE TABLE `supply_return` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '退货单ID',
    `return_no` VARCHAR(50) NOT NULL COMMENT '退货单号',
    `order_id` BIGINT DEFAULT NULL COMMENT '采购订单ID',
    `vendor_id` BIGINT DEFAULT NULL COMMENT '供应商ID',
    `reason` VARCHAR(500) DEFAULT NULL COMMENT '退货原因',
    `amount` DECIMAL(14,2) DEFAULT NULL COMMENT '退货金额',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待处理 2已退货 3已完成',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_return_no` (`return_no`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_vendor_id` (`vendor_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退货单表';
