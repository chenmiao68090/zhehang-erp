-- V9: 营销活动表 + 线索补来源/成本/活动字段（获客 ROI 勾稽地基）
-- 让「营销投入 → 线索 → 商机 → 合同成交」可核算投入产出比。

CREATE TABLE IF NOT EXISTS `mkt_campaign` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `campaign_name` VARCHAR(128)  NOT NULL                COMMENT '活动名称',
  `channel`       VARCHAR(32)   DEFAULT NULL            COMMENT '渠道 百度/抖音/小红书/电销/转介绍/官网表单等',
  `budget`        DECIMAL(12,2) DEFAULT NULL            COMMENT '预算',
  `actual_cost`   DECIMAL(12,2) DEFAULT NULL            COMMENT '实际花费',
  `start_date`    VARCHAR(20)   DEFAULT NULL            COMMENT '开始日期',
  `end_date`      VARCHAR(20)   DEFAULT NULL            COMMENT '结束日期',
  `impressions`   INT           DEFAULT NULL            COMMENT '展示数',
  `clicks`        INT           DEFAULT NULL            COMMENT '点击数',
  `leads_count`   INT           DEFAULT 0               COMMENT '线索数(冗余,可由线索统计)',
  `owner_id`      BIGINT        DEFAULT NULL            COMMENT '负责人ID',
  `status`        TINYINT       DEFAULT 1               COMMENT '状态 1进行中 2已结束',
  `remark`        VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`   DATETIME      DEFAULT NULL            COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT NULL            COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT       DEFAULT 0               COMMENT '逻辑删除 0正常 1删除',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_campaign_channel` (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='营销活动(获客ROI勾稽)';

-- 线索表补：渠道明细 / 获客成本 / 关联营销活动（加列，默认空，不影响现有数据）
ALTER TABLE `crm_lead` ADD COLUMN `channel`      VARCHAR(32)   DEFAULT NULL COMMENT '渠道明细';
ALTER TABLE `crm_lead` ADD COLUMN `acquire_cost` DECIMAL(10,2) DEFAULT NULL COMMENT '获客成本(分摊)';
ALTER TABLE `crm_lead` ADD COLUMN `campaign_id`  BIGINT        DEFAULT NULL COMMENT '关联营销活动ID';
