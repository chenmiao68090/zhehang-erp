-- =============================================================================
-- V150  销售跟进闭环字段
--        复用 crm_lead / crm_follow / biz_call_record,不新增重复的销售任务表。
--        新列全部可空,不改写存量数据;旧 next_follow_time 继续兼容。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_sales_followup_loop_fields;
DELIMITER //
CREATE PROCEDURE add_sales_followup_loop_fields()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'next_action_time') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `next_action_time` DATETIME NULL COMMENT '下一步动作时间(精确到分钟)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'next_action_type') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `next_action_type` VARCHAR(32) NULL COMMENT '下一步动作类型(电话/微信/报价/签约/收款/其他)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'invalid_reason') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `invalid_reason` VARCHAR(255) NULL COMMENT '无效原因(号码无效/明确拒绝等)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'converted_customer_id') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `converted_customer_id` BIGINT NULL COMMENT '线索转化后关联 crm_customer.id';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND INDEX_NAME = 'idx_lead_owner_action') THEN
    ALTER TABLE `crm_lead`
      ADD INDEX `idx_lead_owner_action` (`owner_id`, `ownership`, `status`, `next_action_time`);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND INDEX_NAME = 'idx_lead_converted_customer') THEN
    ALTER TABLE `crm_lead`
      ADD INDEX `idx_lead_converted_customer` (`converted_customer_id`);
  END IF;
END //
DELIMITER ;

CALL add_sales_followup_loop_fields();
DROP PROCEDURE IF EXISTS add_sales_followup_loop_fields;
