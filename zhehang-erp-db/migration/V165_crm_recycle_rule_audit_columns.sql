-- =============================================================================
-- V165 修复“找客户”回收规则接口缺少审计列（2026-07-13）
--
-- CrmRecycleRule 继承 BaseEntity，MyBatis-Plus 查询会固定读取 create_by/update_by；
-- 但历史 V2 建表遗漏这两列，导致 GET /crm/recycle/rules 报 SQLSyntaxErrorException。
-- 本迁移只新增两个可空 BIGINT 审计列，不回填、不修改现有6条回收规则。
-- =============================================================================

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS `apply_v165_recycle_rule_audit_columns`;
DELIMITER $$
CREATE PROCEDURE `apply_v165_recycle_rule_audit_columns`()
BEGIN
  IF (SELECT COUNT(*)
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'crm_recycle_rule') <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V165 aborted: crm_recycle_rule table not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'crm_recycle_rule'
      AND COLUMN_NAME = 'create_by'
  ) THEN
    ALTER TABLE `crm_recycle_rule`
      ADD COLUMN `create_by` BIGINT DEFAULT NULL COMMENT '创建人' AFTER `update_time`;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'crm_recycle_rule'
      AND COLUMN_NAME = 'update_by'
  ) THEN
    ALTER TABLE `crm_recycle_rule`
      ADD COLUMN `update_by` BIGINT DEFAULT NULL COMMENT '更新人' AFTER `create_by`;
  END IF;

  IF (SELECT COUNT(*)
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'crm_recycle_rule'
        AND COLUMN_NAME IN ('create_by', 'update_by')
        AND DATA_TYPE = 'bigint') <> 2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V165 failed: expected create_by/update_by BIGINT columns';
  END IF;
END$$
DELIMITER ;

CALL `apply_v165_recycle_rule_audit_columns`();
DROP PROCEDURE IF EXISTS `apply_v165_recycle_rule_audit_columns`;
