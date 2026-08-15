-- =============================================================================
-- V142 收款管理·批量导入(飞书式粘贴 + Excel/CSV 历史导入 + 预览校验 + 批次追溯)
-- 目标:扩展 V138 收款日记账模块,支持批量导入与批次回溯。
--       1) 给 fin_cash_journal 增列 import_batch_no(手动录入为空),用于把一批导入的记录关联到批次;
--       2) 新建 fin_cash_import_batch 批次表,记录每次导入的类型/文件/统计/状态,供批次弹窗查看与整批回滚。
-- 说明:批次在收款页内弹窗查看,不新增 sys_menu。
--       幂等:加列走 information_schema 存储过程判断(仿 V113/V124);建表 CREATE TABLE IF NOT EXISTS。可重复执行。
--       V139(training_course_exam)/V140(data_scope_repair)/V141(order_review) 均已被占用,故本迁移编号顺延为 V142。
-- =============================================================================

-- 1) fin_cash_journal 增列 import_batch_no + 索引(幂等) ------------------------
DROP PROCEDURE IF EXISTS add_cash_journal_import_col;
DELIMITER //
CREATE PROCEDURE add_cash_journal_import_col()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND COLUMN_NAME = 'import_batch_no') THEN
    ALTER TABLE `fin_cash_journal`
      ADD COLUMN `import_batch_no` VARCHAR(32) DEFAULT NULL COMMENT '导入批次号(手动录入为空)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fin_cash_journal'
                   AND INDEX_NAME = 'idx_fin_cj_import_batch') THEN
    ALTER TABLE `fin_cash_journal`
      ADD INDEX `idx_fin_cj_import_batch` (`import_batch_no`);
  END IF;
END //
DELIMITER ;
CALL add_cash_journal_import_col();
DROP PROCEDURE IF EXISTS add_cash_journal_import_col;

-- 2) 导入批次表(幂等) ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fin_cash_import_batch` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `batch_no` VARCHAR(32) NOT NULL COMMENT '批次号(IMP+yyyyMMdd+HHmmss+2位随机,唯一)',
  `import_type` VARCHAR(16) DEFAULT NULL COMMENT '导入方式:paste粘贴/excel/csv',
  `file_name` VARCHAR(255) DEFAULT NULL COMMENT '来源文件名(粘贴为空)',
  `total_count` INT NOT NULL DEFAULT 0 COMMENT '提交总行数',
  `success_count` INT NOT NULL DEFAULT 0 COMMENT '成功入库行数',
  `fail_count` INT NOT NULL DEFAULT 0 COMMENT '失败(校验不通过)行数',
  `duplicate_count` INT NOT NULL DEFAULT 0 COMMENT '重复(跳过)行数',
  `total_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '成功入库金额合计',
  `status` VARCHAR(16) NOT NULL DEFAULT 'imported' COMMENT '状态:imported已导入/partial部分成功/rolledback已回滚',
  `imported_by` BIGINT DEFAULT NULL COMMENT '导入人用户ID',
  `imported_at` DATETIME DEFAULT NULL COMMENT '导入时间',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注(回滚说明等)',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_cib_batch_no` (`batch_no`),
  KEY `idx_fin_cib_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款日记账导入批次';
