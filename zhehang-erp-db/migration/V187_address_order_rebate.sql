-- =============================================================================
-- V187 地址报单返款资料
-- 影响：只给 biz_address_order 增加是否返款、返款对象、支付宝收款码文件ID三列。
-- 默认：历史订单 has_rebate=0，不回填、不推断、不创建返款记录。
-- 收款码：只保存 file_info.id，不保存图片明文、URL或base64。
-- 幂等：每列均通过 information_schema 判断后再添加，可重复执行。
-- 回滚：
--   ALTER TABLE biz_address_order
--     DROP COLUMN rebate_alipay_qr_file_id,
--     DROP COLUMN rebate_recipient,
--     DROP COLUMN has_rebate;
-- =============================================================================

DELIMITER $$
DROP PROCEDURE IF EXISTS `migrate_v187_address_order_rebate`$$
CREATE PROCEDURE `migrate_v187_address_order_rebate`()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_address_order'
      AND COLUMN_NAME = 'has_rebate'
  ) THEN
    ALTER TABLE `biz_address_order`
      ADD COLUMN `has_rebate` TINYINT NOT NULL DEFAULT 0
        COMMENT '是否有返款(0否/1是)' AFTER `gift_months`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_address_order'
      AND COLUMN_NAME = 'rebate_recipient'
  ) THEN
    ALTER TABLE `biz_address_order`
      ADD COLUMN `rebate_recipient` VARCHAR(100) DEFAULT NULL
        COMMENT '返款对象' AFTER `has_rebate`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'biz_address_order'
      AND COLUMN_NAME = 'rebate_alipay_qr_file_id'
  ) THEN
    ALTER TABLE `biz_address_order`
      ADD COLUMN `rebate_alipay_qr_file_id` BIGINT DEFAULT NULL
        COMMENT '支付宝收款码file_info.id' AFTER `rebate_recipient`;
  END IF;
END$$
CALL `migrate_v187_address_order_rebate`()$$
DROP PROCEDURE IF EXISTS `migrate_v187_address_order_rebate`$$
DELIMITER ;
