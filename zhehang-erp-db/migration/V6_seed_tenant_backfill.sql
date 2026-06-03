-- ============================================================
-- V6: 多租户启用后的种子数据回填
-- 背景:V2/早期脚本插入的业务数据 tenant_id 为空,启用 TenantLineInnerInterceptor
--       数据隔离后,租户1(admin)查询会被过滤掉这些行,导致页面空白。
-- 处理:把历史无租户归属的核心业务数据统一归到租户1;并补线索归属默认值。
-- 说明:幂等,可重复执行。生产多租户环境请勿直接套用(此为单租户开发基线回填)。
-- ============================================================

USE `zhehang_erp`;

-- 1) 公海池配置(V2 的 7 条种子)归属租户1
UPDATE `crm_pool_config` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL;

-- 2) 线索数据归属租户1
UPDATE `crm_lead` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL;

-- 3) 线索归属字段历史为空的,补默认:有负责人按私海,无负责人按公海
UPDATE `crm_lead` SET `ownership` = 'private'
  WHERE (`ownership` IS NULL OR `ownership` = '') AND `owner_id` IS NOT NULL;
UPDATE `crm_lead` SET `ownership` = 'pool'
  WHERE (`ownership` IS NULL OR `ownership` = '') AND `owner_id` IS NULL;

-- 4) 线索状态历史为空的,补默认「新建」
UPDATE `crm_lead` SET `status` = 1 WHERE `status` IS NULL;

-- 5) V2 种子公海池(id 1~7)status=1,按系统约定(0正常/1禁用)等于被禁用,
--    导致 listPools(过滤 status=0)查不到任何池。恢复为启用。
UPDATE `crm_pool_config` SET `status` = 0 WHERE `id` BETWEEN 1 AND 7;
