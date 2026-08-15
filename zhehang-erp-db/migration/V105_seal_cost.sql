-- =============================================================================
-- V105  刻章成本明细(biz_seal_cost):按月录入各成本类型的金额,
--       固定/可变分类 + 说明 + 附件;印章业务看板据此汇算"总成本"。
--       每行=某月某成本类型一条;id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_seal_cost` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `cost_year` VARCHAR(4) DEFAULT NULL COMMENT '年份 如2026',
  `cost_month` VARCHAR(7) DEFAULT NULL COMMENT '月份 YYYY-MM',
  `cost_type` VARCHAR(64) DEFAULT NULL COMMENT '成本类型(京东快递费用/印章消耗费用/刻章固定工资等)',
  `cost_category` VARCHAR(16) DEFAULT NULL COMMENT '成本分类:固定/可变',
  `amount` DECIMAL(12,2) DEFAULT NULL COMMENT '金额',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '说明',
  `attachment` TEXT DEFAULT NULL COMMENT '附件 [{fileId,fileName}] JSON',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_sc_month` (`cost_month`),
  KEY `idx_sc_year` (`cost_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='刻章成本明细(按月)';
