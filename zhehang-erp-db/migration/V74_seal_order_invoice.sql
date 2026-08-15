-- =============================================================================
-- V74  刻章业务·发票与业务支出(A4)
-- =============================================================================
ALTER TABLE `biz_seal_order`
  ADD COLUMN `need_invoice`  TINYINT      DEFAULT 0    COMMENT '是否需要开具发票:1是 0否' AFTER `op_cost_total`,
  ADD COLUMN `invoice_info`  VARCHAR(500) DEFAULT NULL COMMENT '开票信息' AFTER `need_invoice`,
  ADD COLUMN `invoice_done`  TINYINT      DEFAULT 0    COMMENT '开票是否已完成:1是 0否' AFTER `invoice_info`,
  ADD COLUMN `rebate_cost`   DECIMAL(12,2) DEFAULT 0.00 COMMENT '业务支出·返点成本' AFTER `invoice_done`,
  ADD COLUMN `refund_amount` DECIMAL(12,2) DEFAULT 0.00 COMMENT '业务支出·刻章退款' AFTER `rebate_cost`;
