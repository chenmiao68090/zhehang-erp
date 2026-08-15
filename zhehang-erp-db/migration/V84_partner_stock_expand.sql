-- =============================================================================
-- V84  长期客户补字段(决策人/业务负责人/结算/开票/月度均价);印章库存补采购信息字段。
-- =============================================================================
ALTER TABLE `biz_partner`
  ADD COLUMN `decision_maker`  VARCHAR(64)  DEFAULT NULL COMMENT '决策人姓名' AFTER `phone`,
  ADD COLUMN `decision_phone`  VARCHAR(32)  DEFAULT NULL COMMENT '决策人联系电话' AFTER `decision_maker`,
  ADD COLUMN `biz_owner_name`  VARCHAR(64)  DEFAULT NULL COMMENT '业务负责人姓名' AFTER `decision_phone`,
  ADD COLUMN `biz_owner_phone` VARCHAR(32)  DEFAULT NULL COMMENT '业务负责人电话' AFTER `biz_owner_name`,
  ADD COLUMN `settle_method`   VARCHAR(64)  DEFAULT NULL COMMENT '结算方式' AFTER `biz_owner_phone`,
  ADD COLUMN `need_invoice`    TINYINT      DEFAULT 0    COMMENT '是否开票:1是' AFTER `settle_method`,
  ADD COLUMN `invoice_info`    VARCHAR(255) DEFAULT NULL COMMENT '开票信息' AFTER `need_invoice`,
  ADD COLUMN `monthly_avg`     DECIMAL(12,2) DEFAULT NULL COMMENT '月度均价(等级按此分级)' AFTER `invoice_info`;

ALTER TABLE `biz_seal_stock`
  ADD COLUMN `purchase_date` DATE         DEFAULT NULL COMMENT '采购日期' AFTER `unit_price`,
  ADD COLUMN `buy_qty`       INT          DEFAULT NULL COMMENT '购买数量' AFTER `purchase_date`,
  ADD COLUMN `buy_price`     DECIMAL(12,2) DEFAULT NULL COMMENT '购入价' AFTER `buy_qty`,
  ADD COLUMN `discount`      DECIMAL(12,2) DEFAULT NULL COMMENT '优惠总计' AFTER `buy_price`,
  ADD COLUMN `invoice_done`  TINYINT      DEFAULT 0    COMMENT '发票是否开具:1是' AFTER `discount`,
  ADD COLUMN `invoice_file`  VARCHAR(255) DEFAULT NULL COMMENT '发票附件' AFTER `invoice_done`,
  ADD COLUMN `purchase_link` VARCHAR(500) DEFAULT NULL COMMENT '采购链接' AFTER `invoice_file`;
