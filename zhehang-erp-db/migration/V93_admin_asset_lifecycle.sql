-- =============================================================================
-- V93  固定资产全闭环:资产流水表(入库/领用/归还/维保/报废) + 资产主表加当前领用人ID
-- =============================================================================
CREATE TABLE IF NOT EXISTS `admin_asset_record` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `asset_id`      BIGINT       NOT NULL COMMENT '关联固定资产ID',
  `asset_name`    VARCHAR(128) DEFAULT NULL COMMENT '资产名称冗余(便于流水展示)',
  `type`          VARCHAR(16)  NOT NULL COMMENT '类型:入库/领用/归还/维保/报废',
  `employee_id`   BIGINT       DEFAULT NULL COMMENT '领用人员工ID(领用/归还时填)',
  `employee_name` VARCHAR(64)  DEFAULT NULL COMMENT '领用人姓名',
  `record_date`   DATE         DEFAULT NULL COMMENT '发生日期',
  `qty`           INT          DEFAULT 1 COMMENT '数量',
  `amount`        DECIMAL(12,2) DEFAULT NULL COMMENT '金额(维保/采购费用)',
  `status`        VARCHAR(16)  DEFAULT NULL COMMENT '维保状态:维保中/已完成 等',
  `operator`      VARCHAR(64)  DEFAULT NULL COMMENT '经办人',
  `remark`        VARCHAR(500) DEFAULT NULL COMMENT '备注/事由',
  `create_by`     BIGINT       DEFAULT NULL,
  `update_by`     BIGINT       DEFAULT NULL,
  `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id`     BIGINT       DEFAULT NULL,
  `deleted`       TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_asset` (`asset_id`),
  KEY `idx_emp` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='固定资产流水(领用/归还/维保/报废)';

-- 资产主表:加当前领用人ID(用于离职归还校验),holder(姓名)已存在
ALTER TABLE `admin_asset`
  ADD COLUMN `holder_id` BIGINT DEFAULT NULL COMMENT '当前领用人员工ID(在用时有值,归还/报废后清空)' AFTER `holder`;
