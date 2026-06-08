-- ============================================================
-- V18: 合同/收款单 补归属字段(salesman_id, dept_id),支撑数据范围过滤
-- 背景:biz_contract/biz_receipt 原无归属人/部门,无法做"销售看本人、主管看部门"的数据范围。
--       从关联订单(BizOrder.salesmanId/deptId)继承,保存时回写。本迁移加列;回写在Service。
-- 幂等:information_schema 守卫,列已存在则跳过。纯增量(不删不改),安全。
-- ============================================================

USE `zhehang_erp`;

-- biz_contract.salesman_id
SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract' AND COLUMN_NAME='salesman_id');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_contract` ADD COLUMN `salesman_id` BIGINT DEFAULT NULL COMMENT ''归属销售ID'' AFTER `customer_name`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
-- biz_contract.dept_id
SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract' AND COLUMN_NAME='dept_id');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_contract` ADD COLUMN `dept_id` BIGINT DEFAULT NULL COMMENT ''归属部门ID'' AFTER `salesman_id`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
-- 索引
SET @e := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract' AND INDEX_NAME='idx_contract_dept');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_contract` ADD INDEX `idx_contract_dept` (`dept_id`)', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- biz_receipt.salesman_id
SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_receipt' AND COLUMN_NAME='salesman_id');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_receipt` ADD COLUMN `salesman_id` BIGINT DEFAULT NULL COMMENT ''归属销售ID'' AFTER `customer_name`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
-- biz_receipt.dept_id
SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_receipt' AND COLUMN_NAME='dept_id');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_receipt` ADD COLUMN `dept_id` BIGINT DEFAULT NULL COMMENT ''归属部门ID'' AFTER `salesman_id`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
SET @e := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_receipt' AND INDEX_NAME='idx_receipt_dept');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_receipt` ADD INDEX `idx_receipt_dept` (`dept_id`)', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
