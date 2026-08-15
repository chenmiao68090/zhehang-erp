-- =============================================================================
-- V90  印章库存盘点记录。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_seal_stock_check` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `item_name`   VARCHAR(128) DEFAULT NULL COMMENT '品名',
  `book_qty`    INT          DEFAULT NULL COMMENT '账面库存',
  `actual_qty`  INT          DEFAULT NULL COMMENT '实际盘点数',
  `diff`        INT          DEFAULT NULL COMMENT '差异(实际-账面)',
  `check_date`  DATE         DEFAULT NULL COMMENT '盘点日期',
  `operator`    VARCHAR(64)  DEFAULT NULL COMMENT '盘点人',
  `remark`      VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`   BIGINT       DEFAULT NULL,
  `update_by`   BIGINT       DEFAULT NULL,
  `deleted`     TINYINT      NOT NULL DEFAULT 0,
  `tenant_id`   BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='印章库存盘点记录';
