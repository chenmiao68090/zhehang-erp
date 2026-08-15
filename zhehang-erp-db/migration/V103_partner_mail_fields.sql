-- =============================================================================
-- V103  长期合作客户(biz_partner)补默认邮寄字段:
--       mail_method  默认邮寄方式(京东寄付/顺丰到付/闪送寄付等)
--       mail_address 默认邮寄地址
--       幂等:列已存在则跳过。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_partner_mail_col;
DELIMITER //
CREATE PROCEDURE add_partner_mail_col()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_partner'
                   AND COLUMN_NAME = 'mail_method') THEN
    ALTER TABLE `biz_partner`
      ADD COLUMN `mail_method` VARCHAR(32) DEFAULT NULL COMMENT '默认邮寄方式' AFTER `remark`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_partner'
                   AND COLUMN_NAME = 'mail_address') THEN
    ALTER TABLE `biz_partner`
      ADD COLUMN `mail_address` VARCHAR(300) DEFAULT NULL COMMENT '默认邮寄地址' AFTER `mail_method`;
  END IF;
END //
DELIMITER ;
CALL add_partner_mail_col();
DROP PROCEDURE IF EXISTS add_partner_mail_col;
