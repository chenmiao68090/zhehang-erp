-- ============================================================
-- V15: 收款计划 biz_receipt_plan / 发票 biz_invoice 表对齐实体(财务模块补全)
-- 背景:同 V13/V14,这两表 V3 建表与实体(BizReceiptPlan/BizInvoice)字段不一致,
--       getPlans / getInvoices 接口 code=500。本迁移对齐,补全财务模块。
-- 安全/幂等:仅当"实体签名列缺失(=旧结构) 且 表为空"时 DROP;CREATE IF NOT EXISTS。
--           重跑时签名列已存在 → 不DROP、不重建;表有数据 → 不DROP。
-- ============================================================

USE `zhehang_erp`;

-- ---------- biz_receipt_plan (实体签名列: period) ----------
SET @aligned := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_receipt_plan' AND COLUMN_NAME='period');
SET @exists := (SELECT COUNT(*) FROM information_schema.TABLES
                WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_receipt_plan');
SET @cnt := IF(@exists=0, 0, (SELECT COUNT(*) FROM biz_receipt_plan));
SET @ddl := IF(@exists>0 AND @aligned=0 AND @cnt=0, 'DROP TABLE `biz_receipt_plan`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_receipt_plan` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `order_id`    BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `period`      INT          DEFAULT NULL            COMMENT '期次',
  `plan_amount` DECIMAL(14,2) DEFAULT NULL           COMMENT '计划收款金额',
  `paid_amount` DECIMAL(14,2) DEFAULT NULL           COMMENT '已收金额',
  `plan_date`   DATE         DEFAULT NULL            COMMENT '计划收款日',
  `paid_date`   DATE         DEFAULT NULL            COMMENT '实收日',
  `status`      INT          DEFAULT NULL            COMMENT '状态(1未收 2部分 3已收)',
  `remark`      VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time` DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_plan_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款计划';

-- ---------- biz_invoice (实体签名列: invoice_no) ----------
SET @aligned := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_invoice' AND COLUMN_NAME='invoice_no');
SET @exists := (SELECT COUNT(*) FROM information_schema.TABLES
                WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_invoice');
SET @cnt := IF(@exists=0, 0, (SELECT COUNT(*) FROM biz_invoice));
SET @ddl := IF(@exists>0 AND @aligned=0 AND @cnt=0, 'DROP TABLE `biz_invoice`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_invoice` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `invoice_no`    VARCHAR(64)  DEFAULT NULL            COMMENT '发票号',
  `order_id`      BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `receipt_id`    BIGINT       DEFAULT NULL            COMMENT '关联收款单ID',
  `customer_id`   BIGINT       DEFAULT NULL            COMMENT '客户ID',
  `customer_name` VARCHAR(128) DEFAULT NULL            COMMENT '客户名称',
  `title`         VARCHAR(255) DEFAULT NULL            COMMENT '发票抬头',
  `tax_no`        VARCHAR(64)  DEFAULT NULL            COMMENT '税号',
  `invoice_type`  VARCHAR(32)  DEFAULT NULL            COMMENT '发票类型',
  `amount`        DECIMAL(14,2) DEFAULT NULL           COMMENT '金额(不含税)',
  `tax_amount`    DECIMAL(14,2) DEFAULT NULL           COMMENT '税额',
  `total_amount`  DECIMAL(14,2) DEFAULT NULL           COMMENT '价税合计',
  `invoice_date`  DATE         DEFAULT NULL            COMMENT '开票日',
  `status`        INT          DEFAULT NULL            COMMENT '状态',
  `tracking_no`   VARCHAR(64)  DEFAULT NULL            COMMENT '快递单号',
  `remark`        VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`   DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`   DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`     BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`     BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_invoice_customer` (`customer_id`),
  KEY `idx_invoice_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发票';
