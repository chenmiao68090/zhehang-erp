-- ============================================================
-- V16: biz_task 唯一约束,保证"签约自动派交付任务"的幂等(并发安全)
-- 背景:BizContractServiceImpl.dispatchDeliveryTasks 用 selectCount 防重,
--       confirmSign 又加了 status>=4 拒绝重签(防顺序重复)。但并发下两个 confirmSign
--       可能同时通过检查→重复派整套任务。加唯一索引(biz_id,biz_type,title)做DB级兜底:
--       并发时只有一个成功,另一个因唯一冲突回滚(可接受,极罕见的双击场景)。
-- 说明:非合同任务 biz_id 为 NULL,MySQL 唯一索引允许多个NULL,不影响临时/手工任务。
-- 幂等:索引已存在则跳过。
-- ============================================================

USE `zhehang_erp`;

SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS
               WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_task' AND INDEX_NAME='uk_task_biz_title');
SET @ddl := IF(@exist=0,
    'ALTER TABLE `biz_task` ADD UNIQUE INDEX `uk_task_biz_title` (`biz_id`, `biz_type`, `title`)',
    'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
