-- =============================================================================
-- V65  刻章业务·每日刻章客户登记
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_seal_order` (
  `id`             BIGINT       NOT NULL              COMMENT '主键(雪花ID)',
  `reg_date`       DATE         DEFAULT NULL          COMMENT '登记日期',
  `company_name`   VARCHAR(128) DEFAULT NULL          COMMENT '公司名称',
  `legal_person`   VARCHAR(64)  DEFAULT NULL          COMMENT '法人',
  `phone`          VARCHAR(32)  DEFAULT NULL          COMMENT '联系电话',
  `id_card_front`  VARCHAR(512) DEFAULT NULL          COMMENT '身份证正面照片URL',
  `id_card_back`   VARCHAR(512) DEFAULT NULL          COMMENT '身份证反面照片URL',
  `seal_types`     VARCHAR(128) DEFAULT NULL          COMMENT '刻章类型(逗号分隔:公章,财务章,法人章,合同章,其他章)',
  `fee`            DECIMAL(12,2) DEFAULT 0.00         COMMENT '收费金额',
  `pay_account`    VARCHAR(64)  DEFAULT NULL          COMMENT '收款账号',
  `recipient`      VARCHAR(64)  DEFAULT NULL          COMMENT '收件人',
  `address`        VARCHAR(255) DEFAULT NULL          COMMENT '收件地址',
  `is_mail`        TINYINT      DEFAULT 0             COMMENT '是否邮寄:1是 0否',
  `status`         VARCHAR(16)  DEFAULT 'pending'     COMMENT '状态:pending待刻/engraved已刻/mailed已邮寄/done完成',
  `remark`         VARCHAR(255) DEFAULT NULL          COMMENT '备注',
  `create_time`    DATETIME     DEFAULT NULL,
  `update_time`    DATETIME     DEFAULT NULL,
  `create_by`      BIGINT       DEFAULT NULL,
  `update_by`      BIGINT       DEFAULT NULL,
  `deleted`        TINYINT      DEFAULT 0,
  `tenant_id`      BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reg_date` (`reg_date`),
  KEY `idx_company` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='刻章业务·每日客户登记';
