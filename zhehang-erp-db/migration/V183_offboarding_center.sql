-- ============================================================================
-- V183 离职人员统一管理中心
--
-- 仅做结构增量：
--   1. 员工主档增加真实离职日期；
--   2. 现有 hrm_resign_handover 补齐稳定接收人、五项闭环确认与归档时间；
--   3. 增加交接记录乐观锁，防止并发陈旧请求重新打开已闭环记录；
--   4. 增加离职中心列表和最新交接记录查询所需索引。
--
-- 不回填离职日期、接收人或确认状态，不根据合同日期/姓名猜测业务数据。
-- 状态口径：0待确认 / 1处理中 / 2已完成 / 3异常。
-- ============================================================================

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS `apply_v183_offboarding_center`;
DELIMITER $$
CREATE PROCEDURE `apply_v183_offboarding_center`()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'id'
      AND EXTRA NOT LIKE '%auto_increment%'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'org_employee'
      AND COLUMN_NAME = 'resign_date'
  ) THEN
    ALTER TABLE `org_employee`
      ADD COLUMN `resign_date` DATE DEFAULT NULL COMMENT '真实离职日期' AFTER `hire_date`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'handover_to_employee_id'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `handover_to_employee_id` BIGINT DEFAULT NULL
        COMMENT '稳定接收人员工ID(org_employee.id)' AFTER `handover_to`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'customer_check_status'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `customer_check_status` TINYINT NOT NULL DEFAULT 0
        COMMENT '客户交接:0待确认/1处理中/2已完成/3异常' AFTER `items`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'task_check_status'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `task_check_status` TINYINT NOT NULL DEFAULT 0
        COMMENT '任务交接:0待确认/1处理中/2已完成/3异常' AFTER `customer_check_status`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'document_check_status'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `document_check_status` TINYINT NOT NULL DEFAULT 0
        COMMENT '资料交接:0待确认/1处理中/2已完成/3异常' AFTER `task_check_status`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'asset_check_status'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `asset_check_status` TINYINT NOT NULL DEFAULT 0
        COMMENT '资产交接:0待确认/1处理中/2已完成/3异常' AFTER `document_check_status`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'settlement_check_status'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `settlement_check_status` TINYINT NOT NULL DEFAULT 0
        COMMENT '结算交接:0待确认/1处理中/2已完成/3异常' AFTER `asset_check_status`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'archive_time'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `archive_time` DATETIME DEFAULT NULL COMMENT '五项完成且账号停用后的闭环归档时间'
        AFTER `status`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND COLUMN_NAME = 'record_version'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD COLUMN `record_version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本'
        AFTER `archive_time`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'org_employee'
      AND INDEX_NAME = 'idx_emp_resign_center'
  ) THEN
    ALTER TABLE `org_employee`
      ADD INDEX `idx_emp_resign_center` (`tenant_id`, `status`, `deleted`, `resign_date`, `id`);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND INDEX_NAME = 'idx_rh_employee_latest'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD INDEX `idx_rh_employee_latest` (`tenant_id`, `employee_id`, `deleted`, `create_time`, `id`);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
      AND INDEX_NAME = 'idx_rh_receiver'
  ) THEN
    ALTER TABLE `hrm_resign_handover`
      ADD INDEX `idx_rh_receiver` (`tenant_id`, `handover_to_employee_id`, `deleted`);
  END IF;

  IF (SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'org_employee'
        AND COLUMN_NAME = 'resign_date') <> 1
     OR (SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
           AND COLUMN_NAME IN ('handover_to_employee_id', 'customer_check_status',
                               'task_check_status', 'document_check_status',
                               'asset_check_status', 'settlement_check_status',
                               'archive_time', 'record_version')) <> 8
     OR (SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resign_handover'
           AND COLUMN_NAME = 'id' AND EXTRA LIKE '%auto_increment%') <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V183 failed: offboarding center columns incomplete';
  END IF;
END$$
DELIMITER ;

CALL `apply_v183_offboarding_center`();
DROP PROCEDURE IF EXISTS `apply_v183_offboarding_center`;
