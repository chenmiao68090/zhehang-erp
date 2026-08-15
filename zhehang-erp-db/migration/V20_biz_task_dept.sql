-- ============================================================
-- V20: 交付任务 biz_task 补 dept_id(归属交付部门),支撑"主管只看本部门交付任务"
-- 背景(老板2026-06-09):主管只看本部门交付任务。biz_task 原无部门字段,主管看全部。
-- 处理:加 dept_id。指派任务时按"执行人所属部门"回写(在 BizTaskServiceImpl.assign)。
--       待指派(未分配)任务 dept_id 为空,对主管/执行人仍可见(待认领)。
-- 幂等:information_schema 守卫,列已存在则跳过。纯增量。
-- ============================================================

USE `zhehang_erp`;

SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_task' AND COLUMN_NAME='dept_id');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_task` ADD COLUMN `dept_id` BIGINT DEFAULT NULL COMMENT ''归属交付部门ID(指派时按执行人部门写入)'' AFTER `executor_name`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

SET @e := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_task' AND INDEX_NAME='idx_task_dept');
SET @ddl := IF(@e=0, 'ALTER TABLE `biz_task` ADD INDEX `idx_task_dept` (`dept_id`)', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
