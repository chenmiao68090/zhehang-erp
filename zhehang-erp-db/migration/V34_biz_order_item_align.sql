-- ============================================================
-- V34: biz_order_item 表对齐实体(救活带明细建单)
-- 背景: 建单存明细 createWithItems 写 biz_order_item,但实体 BizOrderItem
--   (item_code/item_name/item_type/unit_price/quantity/subtotal/service_months/sort_order)
--   与建表列(item_no/amount/final_amount/service_type/service_period/start_date...)完全两套
--   → "Unknown column 'item_name'",带订单明细建单即500。表为空,DROP+CREATE 按实体重建。
-- ============================================================

USE `zhehang_erp`;

SET @aligned := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_order_item' AND COLUMN_NAME='item_name');
SET @exists := (SELECT COUNT(*) FROM information_schema.TABLES
                WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_order_item');
SET @cnt := IF(@exists=0, 0, (SELECT COUNT(*) FROM `biz_order_item`));
SET @ddl := IF(@exists>0 AND @aligned=0 AND @cnt=0, 'DROP TABLE `biz_order_item`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_order_item` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id`       BIGINT        DEFAULT NULL            COMMENT '订单ID',
  `item_code`      VARCHAR(64)   DEFAULT NULL            COMMENT '产品编码',
  `item_name`      VARCHAR(200)  DEFAULT NULL            COMMENT '产品名称',
  `item_type`      VARCHAR(32)   DEFAULT NULL            COMMENT '产品类型',
  `unit_price`     DECIMAL(12,2) DEFAULT NULL            COMMENT '单价',
  `quantity`       INT           DEFAULT NULL            COMMENT '数量',
  `discount_rate`  DECIMAL(5,2)  DEFAULT NULL            COMMENT '折扣率',
  `subtotal`       DECIMAL(12,2) DEFAULT NULL            COMMENT '小计',
  `service_months` INT           DEFAULT NULL            COMMENT '服务月数',
  `description`    VARCHAR(500)  DEFAULT NULL            COMMENT '描述',
  `sort_order`     INT           DEFAULT NULL            COMMENT '排序',
  `create_time`    DATETIME      DEFAULT NULL            COMMENT '创建时间',
  `update_time`    DATETIME      DEFAULT NULL            COMMENT '更新时间',
  `create_by`      BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`      BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`        TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`      BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细';
