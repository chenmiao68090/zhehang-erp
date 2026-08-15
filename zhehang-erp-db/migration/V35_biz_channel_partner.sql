-- ============================================================
-- V35: 同行渠道 biz_channel_partner 建表(前端 channel-partner.vue 转真实后端)
-- 背景: 同行渠道页原为前端写死假数组,后端无对应表/Controller。
--   本表字段对齐前端 ChannelPartner 形状 + BaseEntity 标准列,模式参照 biz_supplier。
-- 全新表,无历史数据,直接 CREATE TABLE IF NOT EXISTS(幂等)。
-- ============================================================

USE `zhehang_erp`;

CREATE TABLE IF NOT EXISTS `biz_channel_partner` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `partner_no`    VARCHAR(64)   DEFAULT NULL            COMMENT '渠道编号',
  `name`          VARCHAR(128)  DEFAULT NULL            COMMENT '渠道名称',
  `partner_type`  VARCHAR(32)   DEFAULT NULL            COMMENT '渠道类型(peer/park/agency/business)',
  `contact_name`  VARCHAR(64)   DEFAULT NULL            COMMENT '联系人',
  `contact_phone` VARCHAR(32)   DEFAULT NULL            COMMENT '联系电话',
  `owner_name`    VARCHAR(64)   DEFAULT NULL            COMMENT '负责人',
  `regions`       VARCHAR(500)  DEFAULT NULL            COMMENT '可售区域(JSON数组)',
  `base_price`    DECIMAL(14,2) DEFAULT NULL            COMMENT '协议价',
  `settle_mode`   VARCHAR(32)   DEFAULT NULL            COMMENT '结算方式',
  `credit_limit`  DECIMAL(14,2) DEFAULT NULL            COMMENT '信用额度',
  `receivable`    DECIMAL(14,2) DEFAULT NULL            COMMENT '应收余额',
  `month_orders`  INT           DEFAULT NULL            COMMENT '本月订单数',
  `month_revenue` DECIMAL(14,2) DEFAULT NULL            COMMENT '本月渠道收入',
  `partner_level` VARCHAR(8)    DEFAULT NULL            COMMENT '渠道等级(A/B/C)',
  `status`        VARCHAR(16)   DEFAULT NULL            COMMENT '合作状态(active/watch/paused)',
  `remark`        VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`   DATETIME      DEFAULT NULL            COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT NULL            COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_channel_partner_status` (`status`),
  KEY `idx_channel_partner_type` (`partner_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='同行渠道';
