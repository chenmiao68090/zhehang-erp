-- =============================================================================
-- V66  工商业务·工商订单与办理进度
-- 工商办理人员接收工商业务订单(注册/变更/注销/年报/许可证等),填写办理进度。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_gs_order` (
  `id`             BIGINT       NOT NULL              COMMENT '主键(雪花ID)',
  `company_name`   VARCHAR(128) DEFAULT NULL          COMMENT '公司名称',
  `business_type`  VARCHAR(32)  DEFAULT NULL          COMMENT '业务类型:register注册/change变更/cancel注销/annual年报/license许可证/other其他',
  `customer`       VARCHAR(64)  DEFAULT NULL          COMMENT '客户联系人',
  `phone`          VARCHAR(32)  DEFAULT NULL          COMMENT '联系电话',
  `handler`        VARCHAR(64)  DEFAULT NULL          COMMENT '办理人',
  `fee`            DECIMAL(12,2) DEFAULT 0.00         COMMENT '收费金额',
  `received_date`  DATE         DEFAULT NULL          COMMENT '接单日期',
  `deadline`       DATE         DEFAULT NULL          COMMENT '办理期限',
  `status`         VARCHAR(16)  DEFAULT 'pending'     COMMENT '进度状态:pending待办理/collecting资料收集/submitted已提交工商/processing办理中/done已完成/rejected已驳回',
  `progress_note`  VARCHAR(512) DEFAULT NULL          COMMENT '办理进度说明',
  `remark`         VARCHAR(255) DEFAULT NULL          COMMENT '备注',
  `create_time`    DATETIME     DEFAULT NULL,
  `update_time`    DATETIME     DEFAULT NULL,
  `create_by`      BIGINT       DEFAULT NULL,
  `update_by`      BIGINT       DEFAULT NULL,
  `deleted`        TINYINT      DEFAULT 0,
  `tenant_id`      BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_company` (`company_name`),
  KEY `idx_handler` (`handler`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工商业务·工商订单与办理进度';
