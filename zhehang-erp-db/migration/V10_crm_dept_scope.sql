-- ============================================================
-- V10: CRM 数据权限 —— 线索/客户表新增「归属部门」列并回填
-- 背景:启用按角色 data_scope 的数据权限(电销看自己/主管看本部门/管理员看全部)。
--       crm_lead、crm_customer 原本只有 owner_id(负责人),缺 dept_id(归属部门),
--       无法支撑"主管看本部门及以下"的过滤。
-- 处理:加 dept_id 列 + 索引;按现有 owner_id 对应的 sys_user.dept_id 回填历史数据。
-- 幂等:用 information_schema 守卫,列/索引已存在则跳过;回填仅补 dept_id 为空的行。可重复执行。
-- ============================================================

USE `zhehang_erp`;

-- 1) crm_lead.dept_id 列
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND COLUMN_NAME = 'dept_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD COLUMN `dept_id` BIGINT DEFAULT NULL COMMENT ''归属部门ID'' AFTER `owner_id`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- 2) crm_lead.idx_dept_id 索引
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead' AND INDEX_NAME = 'idx_dept_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_lead` ADD INDEX `idx_dept_id` (`dept_id`)',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- 3) crm_customer.dept_id 列
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_customer' AND COLUMN_NAME = 'dept_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_customer` ADD COLUMN `dept_id` BIGINT DEFAULT NULL COMMENT ''归属部门ID'' AFTER `owner_id`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- 4) crm_customer.idx_dept_id 索引
SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_customer' AND INDEX_NAME = 'idx_dept_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_customer` ADD INDEX `idx_dept_id` (`dept_id`)',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- 5) 历史数据回填:按负责人(owner_id)对应的部门补 dept_id;只补尚未填的行(幂等)
UPDATE `crm_lead`     l JOIN `sys_user` u ON l.owner_id = u.id
   SET l.dept_id = u.dept_id
 WHERE l.dept_id IS NULL AND l.owner_id IS NOT NULL;

UPDATE `crm_customer` c JOIN `sys_user` u ON c.owner_id = u.id
   SET c.dept_id = u.dept_id
 WHERE c.dept_id IS NULL AND c.owner_id IS NOT NULL;
