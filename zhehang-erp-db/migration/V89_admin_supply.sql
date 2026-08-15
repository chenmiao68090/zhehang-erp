-- =============================================================================
-- V89  行政-办公用品管理台账。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `admin_supply` (
  `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `supply_no`        VARCHAR(64)  DEFAULT NULL COMMENT '入库单号',
  `supply_name`      VARCHAR(128) DEFAULT NULL COMMENT '品名',
  `category`         VARCHAR(32)  DEFAULT NULL COMMENT '分类(通用办公耗材/业务专用耗材/劳保福利品)',
  `spec`             VARCHAR(64)  DEFAULT NULL COMMENT '规格',
  `unit`             VARCHAR(16)  DEFAULT NULL COMMENT '单位',
  `quantity`         INT          DEFAULT NULL COMMENT '当前库存',
  `safety_stock`     INT          DEFAULT NULL COMMENT '低库存预警线',
  `in_date`          DATE         DEFAULT NULL COMMENT '入库时间',
  `amount`           DECIMAL(14,2) DEFAULT NULL COMMENT '含税总金额',
  `operator`         VARCHAR(64)  DEFAULT NULL COMMENT '经办人',
  `related_approval` VARCHAR(64)  DEFAULT NULL COMMENT '关联采购审批单号',
  `status`           VARCHAR(16)  DEFAULT NULL COMMENT '状态(待验收/已入库/已驳回)',
  `attach`           VARCHAR(500) DEFAULT NULL COMMENT '附件',
  `remark`           VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`        BIGINT       DEFAULT NULL,
  `update_by`        BIGINT       DEFAULT NULL,
  `deleted`          TINYINT      NOT NULL DEFAULT 0,
  `tenant_id`        BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行政-办公用品台账';
