-- ============================================================
-- V24: 渠道成本 biz_channel_cost 表对齐实体(救活渠道ROI接口)
-- 背景(普查):biz_channel_cost(V3:cost_no/channel/invest_month/invest_amount/impressions/clicks/
--   leads_count/recorder_id)与实体 BizChannelCost(channel_name/channel_type/period/cost_amount/
--   lead_count/converted_count/order_count/revenue/roi)两套模型;service(BizChannelServiceImpl)
--   用实体字段(getPeriod/getRevenue/getCostAmount/setRoi),查询引用 channel_name/period 等不存在列
--   → /channel-cost/roi、/channel-cost/list 报500/一旦写入即炸。
-- 处理:表当前0行,对齐为实体结构(service无需改)。同 biz_* 安全/幂等模式。
-- ============================================================

USE `zhehang_erp`;

SET @aligned := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_channel_cost' AND COLUMN_NAME='channel_name');
SET @exists := (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_channel_cost');
SET @cnt := IF(@exists=0, 0, (SELECT COUNT(*) FROM biz_channel_cost));
SET @ddl := IF(@exists>0 AND @aligned=0 AND @cnt=0, 'DROP TABLE `biz_channel_cost`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_channel_cost` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `channel_name`    VARCHAR(128) DEFAULT NULL            COMMENT '渠道名称',
  `channel_type`    VARCHAR(32)  DEFAULT NULL            COMMENT '渠道类型',
  `period`          VARCHAR(16)  DEFAULT NULL            COMMENT '统计期(yyyy-MM)',
  `cost_amount`     DECIMAL(14,2) DEFAULT NULL           COMMENT '投放成本',
  `lead_count`      INT          DEFAULT NULL            COMMENT '线索数',
  `converted_count` INT          DEFAULT NULL            COMMENT '转化数',
  `order_count`     INT          DEFAULT NULL            COMMENT '成单数',
  `revenue`         DECIMAL(14,2) DEFAULT NULL           COMMENT '带来收入',
  `roi`             DECIMAL(10,2) DEFAULT NULL           COMMENT 'ROI(%)',
  `remark`          VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`     DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`     DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`       BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`       BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`         TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`       BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_channel_cost_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='渠道投放成本';
