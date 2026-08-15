-- =============================================================================
-- V86  刻章外区域合作(浙江省内、杭州以外的备案/刻章合作商名录)。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_out_region` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `city`              VARCHAR(64)  DEFAULT NULL COMMENT '城市',
  `contact_group`     VARCHAR(128) DEFAULT NULL COMMENT '对接群',
  `contact_person`    VARCHAR(64)  DEFAULT NULL COMMENT '外区域对接人',
  `contact_phone`     VARCHAR(32)  DEFAULT NULL COMMENT '联系方式',
  `record_only_price` DECIMAL(12,2) DEFAULT NULL COMMENT '仅备案单价',
  `record_engrave`    VARCHAR(128) DEFAULT NULL COMMENT '备案+刻章',
  `legal_seal_record` VARCHAR(128) DEFAULT NULL COMMENT '法人章备案情况默认',
  `need_half_photo`   VARCHAR(64)  DEFAULT NULL COMMENT '半身照是否需要',
  `public_seal_size`  VARCHAR(64)  DEFAULT NULL COMMENT '公章默认尺寸',
  `pay_qrcode`        VARCHAR(255) DEFAULT NULL COMMENT '合作商收款码',
  `hz_record_price`   DECIMAL(12,2) DEFAULT NULL COMMENT '杭州仅备案单价',
  `hz_report_only`    VARCHAR(128) DEFAULT NULL COMMENT '杭州仅登报',
  `remark`            VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`         BIGINT       DEFAULT NULL,
  `update_by`         BIGINT       DEFAULT NULL,
  `deleted`           TINYINT      NOT NULL DEFAULT 0,
  `tenant_id`         BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='刻章外区域合作名录';
