-- ============================================================
-- V36: 备用金 fin_petty_cash 建表(前端 finance/petty-cash.vue 转真实后端)
-- 字段对齐前端列(单号/申请人/部门/金额/用途/状态/当前处理)+ 归还跟踪 + BaseEntity 标准列。
-- 模式参照 V35_biz_channel_partner.sql。全新表,CREATE TABLE IF NOT EXISTS 幂等。
-- ============================================================
USE `zhehang_erp`;

CREATE TABLE IF NOT EXISTS `fin_petty_cash` (
  `id`              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `cash_no`         VARCHAR(64)   DEFAULT NULL            COMMENT '备用金单号',
  `applicant`       VARCHAR(64)   DEFAULT NULL            COMMENT '申请人',
  `dept`            VARCHAR(64)   DEFAULT NULL            COMMENT '部门',
  `amount`          DECIMAL(14,2) DEFAULT NULL            COMMENT '申领金额',
  `returned_amount` DECIMAL(14,2) DEFAULT 0              COMMENT '已归还金额',
  `purpose`         VARCHAR(255)  DEFAULT NULL            COMMENT '用途',
  `apply_date`      DATE          DEFAULT NULL            COMMENT '申领日期',
  `return_date`     DATE          DEFAULT NULL            COMMENT '约定归还日期',
  `status`          VARCHAR(16)   DEFAULT NULL            COMMENT '状态(applied/confirmed/reviewing/returning/settled/overdue)',
  `owner_role`      VARCHAR(64)   DEFAULT NULL            COMMENT '当前处理人/角色',
  `remark`          VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`     DATETIME      DEFAULT NULL            COMMENT '创建时间',
  `update_time`     DATETIME      DEFAULT NULL            COMMENT '更新时间',
  `create_by`       BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`       BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`         TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`       BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_petty_cash_status` (`status`),
  KEY `idx_petty_cash_applicant` (`applicant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='备用金';
