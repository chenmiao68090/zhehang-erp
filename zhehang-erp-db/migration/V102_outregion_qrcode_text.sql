-- =============================================================================
-- V102  外区域合作(biz_out_region)pay_qrcode 收款码列扩容:
--       原为短文本,现改存前端压缩后的 base64 图片(可上传收款码图片),
--       改成 MEDIUMTEXT(约16MB,足够);幂等:列存在才改,类型已对则跳过。
-- =============================================================================

DROP PROCEDURE IF EXISTS mod_outregion_qr;
DELIMITER //
CREATE PROCEDURE mod_outregion_qr()
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_out_region'
               AND COLUMN_NAME = 'pay_qrcode'
               AND DATA_TYPE <> 'mediumtext') THEN
    ALTER TABLE `biz_out_region`
      MODIFY COLUMN `pay_qrcode` MEDIUMTEXT COMMENT '合作商收款码(文本/链接/压缩base64图片)';
  END IF;
END //
DELIMITER ;
CALL mod_outregion_qr();
DROP PROCEDURE IF EXISTS mod_outregion_qr;
