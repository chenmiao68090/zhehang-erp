SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE `zhehang_erp`;

-- V63: 公司资源库线索补齐工商档案字段。
-- 只加列,不回写/覆盖历史数据;旧备注中的字段由前端打开编辑时兼容解析。

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'legal_person');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `legal_person` VARCHAR(100) DEFAULT NULL COMMENT ''法定代表人/联系人'' AFTER `company`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'company_phone');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `company_phone` VARCHAR(50) DEFAULT NULL COMMENT ''企业联系电话'' AFTER `phone`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'register_status');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `register_status` VARCHAR(50) DEFAULT NULL COMMENT ''登记状态'' AFTER `email`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'enterprise_type');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `enterprise_type` VARCHAR(100) DEFAULT NULL COMMENT ''企业类型'' AFTER `enterprise_scale`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'paid_capital');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `paid_capital` VARCHAR(100) DEFAULT NULL COMMENT ''实缴资本'' AFTER `registered_capital`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'approved_date');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `approved_date` DATE DEFAULT NULL COMMENT ''核准日期'' AFTER `established_date`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'credit_code');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `credit_code` VARCHAR(64) DEFAULT NULL COMMENT ''统一社会信用代码'' AFTER `approved_date`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'insured_count');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `insured_count` VARCHAR(20) DEFAULT NULL COMMENT ''参保人数'' AFTER `credit_code`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'insured_year');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `insured_year` VARCHAR(20) DEFAULT NULL COMMENT ''参保人数所属年报'' AFTER `insured_count`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'register_address');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `register_address` VARCHAR(500) DEFAULT NULL COMMENT ''注册地址'' AFTER `insured_year`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'latest_address');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `latest_address` VARCHAR(500) DEFAULT NULL COMMENT ''最新地址'' AFTER `register_address`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'business_scope');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `business_scope` TEXT NULL COMMENT ''经营范围'' AFTER `latest_address`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
