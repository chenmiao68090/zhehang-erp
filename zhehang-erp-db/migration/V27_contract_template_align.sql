-- ============================================================
-- V27: biz_contract_template 补齐实体缺列(救活合同模板接口)
-- 背景: 实体 BizContractTemplate 含 category/apply_type/status/remark,但建表时漏建,
--   MyBatis 自动 SELECT 全列报 "Unknown column 'category'" → GET /contract-mgmt/templates 500。
--   表已有 is_active/service_type/sort_order(实体未用,保留不动)。
-- 处理: 幂等 ADD COLUMN(仅当列不存在才加),纯增列不动既有数据。
-- ============================================================

USE `zhehang_erp`;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract_template' AND COLUMN_NAME='category');
SET @ddl := IF(@c=0, 'ALTER TABLE `biz_contract_template` ADD COLUMN `category` VARCHAR(50) DEFAULT NULL COMMENT ''模板分类''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract_template' AND COLUMN_NAME='apply_type');
SET @ddl := IF(@c=0, 'ALTER TABLE `biz_contract_template` ADD COLUMN `apply_type` VARCHAR(50) DEFAULT NULL COMMENT ''适用类型''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract_template' AND COLUMN_NAME='status');
SET @ddl := IF(@c=0, 'ALTER TABLE `biz_contract_template` ADD COLUMN `status` TINYINT DEFAULT 1 COMMENT ''状态(0禁用 1启用)''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @c := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract_template' AND COLUMN_NAME='remark');
SET @ddl := IF(@c=0, 'ALTER TABLE `biz_contract_template` ADD COLUMN `remark` VARCHAR(500) DEFAULT NULL COMMENT ''备注''', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
