-- =============================================================================
-- V57  修复近期新增业务表主键策略
-- BaseEntity 使用 IdType.AUTO,这些表的 id 必须由 MySQL 自增生成。
-- 当前线上 5 张表均为空,本迁移只调整表结构,不修改业务数据。
-- =============================================================================
ALTER TABLE `biz_contract_renew_stage`
  MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)';

ALTER TABLE `biz_refund_request`
  MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)';

ALTER TABLE `daily_report`
  MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '自增ID';

ALTER TABLE `biz_finance_timeline`
  MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)';

ALTER TABLE `sys_notification_overlay`
  MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)';
