-- =============================================================================
-- V73  刻章业务·运营成本(A3)
-- 快递类型(算快递费)、登报费(月底填)、运营成本合计(前端按规则自动算后存,供报表)。
-- =============================================================================
ALTER TABLE `biz_seal_order`
  ADD COLUMN `delivery_type` VARCHAR(24)   DEFAULT NULL COMMENT '快递/邮寄类型(顺丰到付/顺丰寄付/京东寄付/闪送寄付/客户自取/给同事)' AFTER `tracking_no`,
  ADD COLUMN `publish_fee`   DECIMAL(12,2) DEFAULT 0.00 COMMENT '登报费用(月底填)' AFTER `documents`,
  ADD COLUMN `op_cost_total` DECIMAL(12,2) DEFAULT 0.00 COMMENT '运营成本合计(外区域备案费+快递费+印章消耗+登报费,前端自动算后存)' AFTER `publish_fee`;
