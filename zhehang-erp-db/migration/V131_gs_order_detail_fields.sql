-- =============================================================================
-- V131  工商工单(biz_gs_order)提单明细字段。
--       支持工商业务大类下的细分多选、法人手机号、收件信息,并把 progress_note
--       从短文本升级为 MEDIUMTEXT,用于保存审核/派单/办事员进度流水。
--       幂等:列存在则跳过,可重复执行。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_gs_order_detail_fields;
DELIMITER //
CREATE PROCEDURE add_gs_order_detail_fields()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'business_items') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `business_items` VARCHAR(500) NULL COMMENT '业务细分项目(逗号分隔的前端枚举值)' AFTER `business_type`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'business_item_remark') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `business_item_remark` VARCHAR(500) NULL COMMENT '业务细分补充说明/其他项目' AFTER `business_items`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'legal_phone') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `legal_phone` VARCHAR(32) NULL COMMENT '法人手机号' AFTER `phone`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'recipient') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `recipient` VARCHAR(64) NULL COMMENT '收件人' AFTER `legal_phone`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'recipient_phone') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `recipient_phone` VARCHAR(32) NULL COMMENT '收件电话' AFTER `recipient`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'recipient_address') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `recipient_address` VARCHAR(255) NULL COMMENT '收件地址' AFTER `recipient_phone`;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
               AND COLUMN_NAME = 'progress_note'
               AND DATA_TYPE <> 'mediumtext') THEN
    ALTER TABLE `biz_gs_order`
      MODIFY COLUMN `progress_note` MEDIUMTEXT NULL COMMENT '办理进度流水';
  END IF;
END //
DELIMITER ;
CALL add_gs_order_detail_fields();
DROP PROCEDURE IF EXISTS add_gs_order_detail_fields;
