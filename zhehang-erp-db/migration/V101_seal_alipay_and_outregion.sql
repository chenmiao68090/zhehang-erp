-- =============================================================================
-- V101  刻章提单(biz_seal_order)补两列:
--       customer_alipay_qr 客户支付宝收款码(退款/返点给客户打款用,存 fileId)
--       out_region_fee     外区域备案费(手动可填,默认按25元/个估算)
--       幂等:列已存在则跳过(存储过程判断 information_schema)。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_seal_col;
DELIMITER //
CREATE PROCEDURE add_seal_col()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_seal_order'
                   AND COLUMN_NAME = 'customer_alipay_qr') THEN
    ALTER TABLE `biz_seal_order`
      ADD COLUMN `customer_alipay_qr` VARCHAR(500) DEFAULT NULL
      COMMENT '客户支付宝收款码(fileId,退款/返点用)' AFTER `pay_account`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_seal_order'
                   AND COLUMN_NAME = 'out_region_fee') THEN
    ALTER TABLE `biz_seal_order`
      ADD COLUMN `out_region_fee` DECIMAL(10,2) DEFAULT NULL
      COMMENT '外区域备案费(手动可填,默认25/个估算)' AFTER `publish_fee`;
  END IF;
END //
DELIMITER ;
CALL add_seal_col();
DROP PROCEDURE IF EXISTS add_seal_col;
