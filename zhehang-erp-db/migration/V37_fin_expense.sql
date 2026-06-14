-- ============================================================
-- V37: 业务支出 fin_expense 建表(前端 finance/expense.vue 转真实后端)
-- 字段对齐前端列(单据号/类别/项目/金额/计划付款/状态/负责人)+ 预算占位 + BaseEntity。
-- 模式参照 V35_biz_channel_partner.sql。全新表,IF NOT EXISTS 幂等。
-- ============================================================
USE `zhehang_erp`;

CREATE TABLE IF NOT EXISTS `fin_expense` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `expense_no`    VARCHAR(64)   DEFAULT NULL            COMMENT '支出单据号',
  `category`      VARCHAR(32)   DEFAULT NULL            COMMENT '支出类别(marketing/delivery/rebate/admin/other)',
  `project`       VARCHAR(128)  DEFAULT NULL            COMMENT '关联项目',
  `amount`        DECIMAL(14,2) DEFAULT NULL            COMMENT '支出金额',
  `budget_amount` DECIMAL(14,2) DEFAULT NULL            COMMENT '预算金额',
  `pay_date`      DATE          DEFAULT NULL            COMMENT '计划付款日期',
  `status`        VARCHAR(16)   DEFAULT NULL            COMMENT '状态(approving/budget_review/pending_pay/approved/paid/rejected)',
  `owner_role`    VARCHAR(64)   DEFAULT NULL            COMMENT '负责人/角色',
  `remark`        VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`   DATETIME      DEFAULT NULL            COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT NULL            COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_expense_status` (`status`),
  KEY `idx_expense_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务支出';
