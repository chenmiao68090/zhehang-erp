-- V8: 客户税务档案表
-- 独立于 crm_customer，以统一社会信用代码为业务关联主键（勾稽主键）。
-- 承接「填公司名自动带出工商信息」，补齐报税要素，作为后续「报税日历/申报提醒」的配置源头。

CREATE TABLE IF NOT EXISTS `crm_tax_profile` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '主键(自增)',
  `customer_id`       BIGINT       DEFAULT NULL            COMMENT '关联客户ID(可空)',
  `credit_code`       VARCHAR(32)  NOT NULL                COMMENT '统一社会信用代码(=纳税人识别号,勾稽主键)',
  `company_name`      VARCHAR(128) DEFAULT NULL            COMMENT '企业名称',
  `taxpayer_type`     TINYINT      DEFAULT NULL            COMMENT '纳税人资格 1一般纳税人 2小规模纳税人',
  `collection_type`   VARCHAR(32)  DEFAULT NULL            COMMENT '征收方式 查账征收/核定征收',
  `tax_authority`     VARCHAR(128) DEFAULT NULL            COMMENT '主管税务局',
  `tax_officer`       VARCHAR(64)  DEFAULT NULL            COMMENT '办税人',
  `tax_officer_phone` VARCHAR(32)  DEFAULT NULL            COMMENT '办税人电话',
  `register_date`     VARCHAR(20)  DEFAULT NULL            COMMENT '税务报到日期 yyyy-MM-dd',
  `invoice_type`      VARCHAR(64)  DEFAULT NULL            COMMENT '票种核定',
  `tax_types`         VARCHAR(512) DEFAULT NULL            COMMENT '涉及税种清单(JSON数组)',
  `filing_cycle`      VARCHAR(32)  DEFAULT NULL            COMMENT '主申报周期 月报/季报/年报',
  `status`            TINYINT      DEFAULT 0               COMMENT '状态 0正常',
  `remark`            VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`       DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`       DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`         BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`         BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`           TINYINT      DEFAULT 0               COMMENT '逻辑删除 0正常 1删除',
  `tenant_id`         BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_tax_credit_code` (`credit_code`),
  KEY `idx_tax_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户税务档案';
