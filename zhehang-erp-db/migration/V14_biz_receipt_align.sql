-- ============================================================
-- V14: 收款单 biz_receipt 表结构对齐实体(财务确认收款 基础链路)
-- 背景:同 V13,biz_receipt 由 V3 建表(expected_amount/actual_amount/payer_name...),
--       但 BizReceiptServiceImpl 用的实体 BizReceipt 字段不同(amount/currency/bankSerial...),
--       /receipt 接口 code=500。本迁移对齐为实体结构,使"收款列表+确认收款"可用。
-- 处理:同 V13 安全/幂等模式(旧标记列 expected_amount 存在且空表才DROP;CREATE IF NOT EXISTS)。
-- 范围:仅 biz_receipt。收款计划(biz_receipt_plan)/发票(biz_invoice)/记账凭证编排 留待决策卡片后续。
-- ============================================================

USE `zhehang_erp`;

SET @old := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_receipt' AND COLUMN_NAME='expected_amount');
SET @empty := (SELECT IFNULL((SELECT COUNT(*) FROM information_schema.TABLES
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_receipt'),0));
SET @cnt := IF(@empty=0, 0, (SELECT COUNT(*) FROM biz_receipt));
SET @ddl := IF(@old>0 AND @cnt=0, 'DROP TABLE `biz_receipt`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_receipt` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `receipt_no`     VARCHAR(64)  DEFAULT NULL            COMMENT '收款单号',
  `order_id`       BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `plan_id`        BIGINT       DEFAULT NULL            COMMENT '关联收款计划ID',
  `customer_id`    BIGINT       DEFAULT NULL            COMMENT '客户ID',
  `customer_name`  VARCHAR(128) DEFAULT NULL            COMMENT '客户名称',
  `amount`         DECIMAL(14,2) DEFAULT NULL           COMMENT '收款金额',
  `currency`       VARCHAR(16)  DEFAULT NULL            COMMENT '币种',
  `payment_method` VARCHAR(32)  DEFAULT NULL            COMMENT '收款方式',
  `bank_serial`    VARCHAR(128) DEFAULT NULL            COMMENT '银行流水号',
  `receive_time`   DATETIME     DEFAULT NULL            COMMENT '到账时间',
  `confirmer_id`   BIGINT       DEFAULT NULL            COMMENT '确认人ID',
  `confirm_time`   DATETIME     DEFAULT NULL            COMMENT '确认时间',
  `status`         INT          DEFAULT NULL            COMMENT '状态(1待确认 2已确认 3已退款)',
  `voucher`        VARCHAR(500) DEFAULT NULL            COMMENT '凭证/截图',
  `remark`         VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`    DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`    DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`      BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`      BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`        TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`      BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_receipt_order` (`order_id`),
  KEY `idx_receipt_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款单';
