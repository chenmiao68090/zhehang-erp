-- =============================================================================
-- V88  行政-固定资产管理台账(全生命周期)。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `admin_asset` (
  `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `asset_no`         VARCHAR(64)  DEFAULT NULL COMMENT '入库单号/资产编号',
  `asset_name`       VARCHAR(128) DEFAULT NULL COMMENT '资产名称',
  `category`         VARCHAR(32)  DEFAULT NULL COMMENT '资产分类(办公设备/电子设备/税控专用设备/家具/其他)',
  `quantity`         INT          DEFAULT NULL COMMENT '数量',
  `amount`           DECIMAL(14,2) DEFAULT NULL COMMENT '总金额',
  `in_date`          DATE         DEFAULT NULL COMMENT '入库时间',
  `operator`         VARCHAR(64)  DEFAULT NULL COMMENT '经办人',
  `related_approval` VARCHAR(64)  DEFAULT NULL COMMENT '关联采购审批单号',
  `status`           VARCHAR(16)  DEFAULT NULL COMMENT '状态(待验收/已入库/领用中/已归还/维修中/已报废/已驳回)',
  `holder`           VARCHAR(64)  DEFAULT NULL COMMENT '领用人',
  `holder_dept`      VARCHAR(64)  DEFAULT NULL COMMENT '所属部门',
  `use_date`         DATE         DEFAULT NULL COMMENT '领用日期',
  `use_type`         VARCHAR(16)  DEFAULT NULL COMMENT '领用类型(永久领用/临时领用)',
  `maintain_type`    VARCHAR(16)  DEFAULT NULL COMMENT '维保类型(故障维修/定期保养)',
  `fault_desc`       VARCHAR(500) DEFAULT NULL COMMENT '故障描述',
  `maintain_fee`     DECIMAL(12,2) DEFAULT NULL COMMENT '维修费用',
  `attach`           VARCHAR(500) DEFAULT NULL COMMENT '附件',
  `remark`           VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`        BIGINT       DEFAULT NULL,
  `update_by`        BIGINT       DEFAULT NULL,
  `deleted`          TINYINT      NOT NULL DEFAULT 0,
  `tenant_id`        BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行政-固定资产台账';
