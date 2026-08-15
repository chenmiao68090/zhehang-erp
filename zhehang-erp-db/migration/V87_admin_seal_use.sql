-- =============================================================================
-- V87  行政-印章登记(用印申请闭环)。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `admin_seal_use` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `use_date`      DATE         DEFAULT NULL COMMENT '用印日期',
  `serial_no`     VARCHAR(32)  DEFAULT NULL COMMENT '编号(日期+序号)',
  `applicant`     VARCHAR(64)  DEFAULT NULL COMMENT '申请人',
  `reason`        VARCHAR(255) DEFAULT NULL COMMENT '用印事由',
  `file_name`     VARCHAR(255) DEFAULT NULL COMMENT '文件名称',
  `seal_type`     VARCHAR(32)  DEFAULT NULL COMMENT '用印类型(公章/法人章/财务章/合同章)',
  `use_position`  VARCHAR(64)  DEFAULT NULL COMMENT '用印位置(多选:开头/骑缝章/落款)',
  `page_count`    INT          DEFAULT NULL COMMENT '用印页数',
  `file_attach`   VARCHAR(500) DEFAULT NULL COMMENT '文件附件',
  `user_confirm`  TINYINT      DEFAULT 0    COMMENT '用印人确认:1是',
  `remark`        VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`     BIGINT       DEFAULT NULL,
  `update_by`     BIGINT       DEFAULT NULL,
  `deleted`       TINYINT      NOT NULL DEFAULT 0,
  `tenant_id`     BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行政-印章用印登记';
