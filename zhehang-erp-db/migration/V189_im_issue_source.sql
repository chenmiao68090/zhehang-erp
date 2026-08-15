-- =============================================================================
-- V189 聊天右键下发任务工单：记录工单来源的 IM 会话与消息
-- 影响：只给 crm_customer_issue 增加两个可空来源列。
-- 默认：历史工单来源为空，不回填、不推断、不改动任何历史数据。
-- 幂等：每列均通过 information_schema 判断后再添加，可重复执行。
-- 回滚：
--   ALTER TABLE crm_customer_issue
--     DROP COLUMN source_message_id,
--     DROP COLUMN source_conversation_id;
-- =============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS `migrate_v189_im_issue_source`$$
CREATE PROCEDURE `migrate_v189_im_issue_source`()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'crm_customer_issue'
      AND COLUMN_NAME = 'source_conversation_id'
  ) THEN
    ALTER TABLE `crm_customer_issue`
      ADD COLUMN `source_conversation_id` BIGINT DEFAULT NULL
        COMMENT '来源IM会话ID(聊天右键下发任务工单)' AFTER `source`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'crm_customer_issue'
      AND COLUMN_NAME = 'source_message_id'
  ) THEN
    ALTER TABLE `crm_customer_issue`
      ADD COLUMN `source_message_id` BIGINT DEFAULT NULL
        COMMENT '来源IM消息ID' AFTER `source_conversation_id`;
  END IF;
END$$
DELIMITER ;

CALL migrate_v189_im_issue_source();
DROP PROCEDURE IF EXISTS `migrate_v189_im_issue_source`;
