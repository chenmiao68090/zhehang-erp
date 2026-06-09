-- ============================================================
-- V11: 补齐实体与表的列差异 —— crm_holding_config / sys_oper_log
-- 背景:
--   1) crm_holding_config 实体 CrmHoldingConfig 继承 BaseEntity(含 create_by/update_by/deleted/tenant_id),
--      但 V2 建表时只建了 tenant_id,缺 create_by/update_by/deleted。MyBatis-Plus 生成的 SELECT 会带上
--      这三列,导致领取公海线索(POST /api/crm/lead/claim → CrmHoldingServiceImpl.listEnabled)报
--      "Unknown column 'create_by' in 'field list'",所有用户领取 500。
--   2) sys_oper_log 实体 SysOperLog 用新命名(operator/operator_id/request_uri/request_params/
--      response_result/ip_addr/cost_time/tenant_id,且 oper_type 为字符串如 INSERT/UPDATE),
--      但 init 建表用的是旧 RuoYi 命名(oper_name/oper_url/oper_param/json_result/oper_ip,
--      oper_type 为 TINYINT),导致写操作日志(OperLogEventListener)报
--      "Unknown column 'operator' in 'field list'"(且严格模式下字符串写入 TINYINT 的 oper_type 也会失败)。
-- 处理:
--   - 给 crm_holding_config 补 create_by/update_by/deleted。
--   - 给 sys_oper_log 补实体需要的新列,并把 oper_type 由 TINYINT 改为 VARCHAR 以容纳枚举名字符串。
--     旧命名列(oper_name/oper_url/...)全仓库无代码引用,保留为无害空列,不删除。
-- 幂等:全部用 information_schema 守卫,列已存在/oper_type 已是 varchar 则跳过。可重复执行。
-- ============================================================

USE `zhehang_erp`;

-- ============================================================
-- 一、crm_holding_config 补 BaseEntity 列
-- ============================================================

-- create_by
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_holding_config' AND COLUMN_NAME = 'create_by');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_holding_config` ADD COLUMN `create_by` BIGINT DEFAULT NULL COMMENT ''创建人ID'' AFTER `tenant_id`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- update_by
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_holding_config' AND COLUMN_NAME = 'update_by');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_holding_config` ADD COLUMN `update_by` BIGINT DEFAULT NULL COMMENT ''更新人ID'' AFTER `create_by`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- deleted(逻辑删除,0未删除/1已删除)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_holding_config' AND COLUMN_NAME = 'deleted');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `crm_holding_config` ADD COLUMN `deleted` TINYINT(1) DEFAULT 0 COMMENT ''逻辑删除(0未删除/1已删除)'' AFTER `update_by`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- 二、sys_oper_log 对齐实体 SysOperLog 列
-- ============================================================

-- oper_type:TINYINT -> VARCHAR(20)(实体写入枚举名字符串 INSERT/UPDATE/...,严格模式下 TINYINT 会拒绝)
SET @dtype := (SELECT DATA_TYPE FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'oper_type');
SET @ddl := IF(@dtype IS NOT NULL AND @dtype <> 'varchar',
    'ALTER TABLE `sys_oper_log` MODIFY COLUMN `oper_type` VARCHAR(20) DEFAULT NULL COMMENT ''操作类型(INSERT/UPDATE/DELETE/QUERY/EXPORT/IMPORT/OTHER)''',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- operator(操作人用户名)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'operator');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `operator` VARCHAR(64) DEFAULT NULL COMMENT ''操作人用户名'' AFTER `oper_type`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- operator_id(操作人ID)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'operator_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `operator_id` BIGINT DEFAULT NULL COMMENT ''操作人ID'' AFTER `operator`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- request_uri(请求URI)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'request_uri');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `request_uri` VARCHAR(500) DEFAULT NULL COMMENT ''请求URI'' AFTER `request_method`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- request_params(请求参数)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'request_params');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `request_params` TEXT DEFAULT NULL COMMENT ''请求参数'' AFTER `request_uri`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- response_result(响应结果)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'response_result');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `response_result` TEXT DEFAULT NULL COMMENT ''响应结果'' AFTER `request_params`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- ip_addr(IP地址)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'ip_addr');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `ip_addr` VARCHAR(128) DEFAULT NULL COMMENT ''IP地址'' AFTER `error_msg`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- cost_time(耗时ms)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'cost_time');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `cost_time` BIGINT DEFAULT NULL COMMENT ''耗时(毫秒)'' AFTER `ip_addr`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- tenant_id(租户ID,多租户拦截器写入)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_oper_log' AND COLUMN_NAME = 'tenant_id');
SET @ddl := IF(@exist = 0,
    'ALTER TABLE `sys_oper_log` ADD COLUMN `tenant_id` BIGINT DEFAULT NULL COMMENT ''租户ID'' AFTER `oper_time`',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
