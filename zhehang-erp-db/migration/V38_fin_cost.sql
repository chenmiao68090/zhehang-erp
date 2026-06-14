-- ============================================================
-- V38: 管理成本 fin_cost 建表(前端 finance/cost.vue 转真实后端)
-- 注意: 与渠道成本 biz_channel_cost 不同,本表是"公司管理成本归集"(按科目+月度)。
-- 字段对齐前端列(科目/部门/本月金额/预算使用/趋势/状态/责任人);
--   预算使用率与环比由 amount/budget_amount、amount vs last_amount 派生(存原始量,不存百分比)。
-- 模式参照 V35_biz_channel_partner.sql。全新表,IF NOT EXISTS 幂等。
-- ============================================================
USE `zhehang_erp`;

CREATE TABLE IF NOT EXISTS `fin_cost` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `category`      VARCHAR(64)   DEFAULT NULL            COMMENT '成本科目',
  `owner_dept`    VARCHAR(64)   DEFAULT NULL            COMMENT '归属部门',
  `period`        VARCHAR(7)    DEFAULT NULL            COMMENT '所属月份(yyyy-MM)',
  `amount`        DECIMAL(14,2) DEFAULT NULL            COMMENT '本月金额',
  `budget_amount` DECIMAL(14,2) DEFAULT NULL            COMMENT '月度预算',
  `last_amount`   DECIMAL(14,2) DEFAULT NULL            COMMENT '上月金额(算环比)',
  `status`        VARCHAR(16)   DEFAULT NULL            COMMENT '状态(normal/warning/over_risk)',
  `owner_role`    VARCHAR(64)   DEFAULT NULL            COMMENT '责任人/角色',
  `remark`        VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`   DATETIME      DEFAULT NULL            COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT NULL            COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_cost_period` (`period`),
  KEY `idx_cost_dept` (`owner_dept`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理成本';
