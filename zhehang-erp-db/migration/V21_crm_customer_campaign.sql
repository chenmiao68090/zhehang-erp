-- ============================================================
-- V21: 客户表补 campaign_id(营销活动归因),支撑成交金额ROI
-- 背景:线索 crm_lead 已有 campaign_id(获客活动归因);但线索转客户后归因断了,
--       导致"哪个活动带来多少成交额"无法统计(ROI只有CAC,没成交ROI)。
-- 处理:crm_customer 加 campaign_id,转客户(convertToCustomer)时从线索继承;
--       营销ROI 按 客户.campaign_id → 该客户的合同签约金额 汇总成交额与回报率。
-- 幂等:information_schema 守卫,列已存在则跳过。纯增量。
-- ============================================================

USE `zhehang_erp`;

SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='crm_customer' AND COLUMN_NAME='campaign_id');
SET @ddl := IF(@e=0, 'ALTER TABLE `crm_customer` ADD COLUMN `campaign_id` BIGINT DEFAULT NULL COMMENT ''获客营销活动ID(从线索继承,成交ROI归因)'' AFTER `source`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @e := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='crm_customer' AND INDEX_NAME='idx_customer_campaign');
SET @ddl := IF(@e=0, 'ALTER TABLE `crm_customer` ADD INDEX `idx_customer_campaign` (`campaign_id`)', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
