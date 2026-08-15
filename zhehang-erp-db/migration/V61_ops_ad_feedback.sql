-- V61: 运营服务中心 - 线上投流每日反馈
-- 用于记录每天每个平台/账户/计划的投流消耗、客资、有效/无效、成交金额，支撑运营看板实时刷新。

CREATE TABLE IF NOT EXISTS `ops_ad_feedback` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `feedback_date`  DATE          NOT NULL                COMMENT '反馈日期',
  `platform`       VARCHAR(64)   NOT NULL                COMMENT '投放平台',
  `account_name`   VARCHAR(128)  DEFAULT NULL            COMMENT '投放账户',
  `campaign_name`  VARCHAR(128)  DEFAULT NULL            COMMENT '投放计划/素材',
  `spend_amount`   DECIMAL(14,2) DEFAULT 0.00            COMMENT '投放消耗',
  `total_leads`    INT           DEFAULT 0               COMMENT '总客资数',
  `valid_leads`    INT           DEFAULT 0               COMMENT '有效客资数',
  `invalid_leads`  INT           DEFAULT 0               COMMENT '无效客资数',
  `conversion_count` INT         DEFAULT 0               COMMENT '成交/转化数',
  `revenue_amount` DECIMAL(14,2) DEFAULT 0.00            COMMENT '成交金额',
  `owner_name`     VARCHAR(64)   DEFAULT NULL            COMMENT '负责人',
  `status`         VARCHAR(32)   DEFAULT 'normal'        COMMENT '状态(normal/watch/paused)',
  `remark`         VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`    DATETIME      DEFAULT NULL,
  `update_time`    DATETIME      DEFAULT NULL,
  `create_by`      BIGINT        DEFAULT NULL,
  `update_by`      BIGINT        DEFAULT NULL,
  `deleted`        TINYINT       DEFAULT 0,
  `tenant_id`      BIGINT        DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ops_ad_feedback_date` (`feedback_date`),
  KEY `idx_ops_ad_feedback_platform` (`platform`),
  KEY `idx_ops_ad_feedback_tenant_date` (`tenant_id`, `feedback_date`),
  KEY `idx_ops_ad_feedback_create_by` (`create_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营服务中心-投流每日反馈';
