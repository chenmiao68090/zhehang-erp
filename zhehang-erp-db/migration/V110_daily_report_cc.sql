-- =============================================================================
-- V110  工作日报(daily_report)增加抄送能力:
--       新增 cc_user_ids 列,存被抄送人的 userId 列表(逗号分隔),
--       被抄送人可在「抄送我的日报」里看到抄送给自己的日报。
--       幂等:参照 V102 的存储过程写法,列已存在则跳过 ADD,重复执行安全。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_daily_report_cc;
DELIMITER //
CREATE PROCEDURE add_daily_report_cc()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'daily_report'
                   AND COLUMN_NAME = 'cc_user_ids') THEN
    ALTER TABLE `daily_report`
      ADD COLUMN `cc_user_ids` VARCHAR(500) NULL COMMENT '抄送人userId列表,逗号分隔';
  END IF;
END //
DELIMITER ;
CALL add_daily_report_cc();
DROP PROCEDURE IF EXISTS add_daily_report_cc;
