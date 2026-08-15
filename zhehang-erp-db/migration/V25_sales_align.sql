-- ============================================================
-- V25: 销售模块 sales_order / sales_quotation / sales_delivery 补齐实体缺列(救活列表接口)
-- 背景(数据范围审计时发现):这三张表与实体字段漂移,实体含 customer_name/items/remark/order_no
--   等列但建表时漏建,MyBatis-Plus 自动 SELECT 全列时报 "Unknown column 'customer_name'" → 列表500。
--   实测 /sales/order/list 直接 BadSqlGrammarException。sales_receipt 无漂移,不动。
-- 处理:幂等 ADD COLUMN(仅当列不存在才加),纯增列不动既有数据,安全。
-- ============================================================

USE `zhehang_erp`;

-- ---- sales_order: customer_name / items / remark ----
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_order' AND COLUMN_NAME='customer_name');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_order` ADD COLUMN `customer_name` VARCHAR(200) DEFAULT NULL COMMENT ''客户名称(冗余)''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_order' AND COLUMN_NAME='items');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_order` ADD COLUMN `items` TEXT DEFAULT NULL COMMENT ''订单明细(JSON/文本)''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_order' AND COLUMN_NAME='remark');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_order` ADD COLUMN `remark` VARCHAR(500) DEFAULT NULL COMMENT ''备注''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- ---- sales_quotation: customer_name / items ----
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_quotation' AND COLUMN_NAME='customer_name');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_quotation` ADD COLUMN `customer_name` VARCHAR(200) DEFAULT NULL COMMENT ''客户名称(冗余)''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_quotation' AND COLUMN_NAME='items');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_quotation` ADD COLUMN `items` TEXT DEFAULT NULL COMMENT ''报价明细(JSON/文本)''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- ---- sales_delivery: order_no / customer_name / remark ----
SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_delivery' AND COLUMN_NAME='order_no');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_delivery` ADD COLUMN `order_no` VARCHAR(64) DEFAULT NULL COMMENT ''关联订单号(冗余)''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_delivery' AND COLUMN_NAME='customer_name');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_delivery` ADD COLUMN `customer_name` VARCHAR(200) DEFAULT NULL COMMENT ''客户名称(冗余)''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_delivery' AND COLUMN_NAME='remark');
SET @ddl := IF(@c=0, 'ALTER TABLE `sales_delivery` ADD COLUMN `remark` VARCHAR(500) DEFAULT NULL COMMENT ''备注''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
