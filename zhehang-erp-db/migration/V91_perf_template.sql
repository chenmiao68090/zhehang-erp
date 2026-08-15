-- =============================================================================
-- V91  绩效考核模板(按岗位设考核模板,参考tita)。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_perf_template` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `template_name` VARCHAR(128) DEFAULT NULL COMMENT '模板名称',
  `post_name`     VARCHAR(64)  DEFAULT NULL COMMENT '适用岗位',
  `period`        VARCHAR(16)  DEFAULT NULL COMMENT '考核周期(月度/季度/年度)',
  `score_type`    VARCHAR(16)  DEFAULT NULL COMMENT '评价方式(评分式/等级式)',
  `dimensions`    TEXT         DEFAULT NULL COMMENT '考核指标维度JSON',
  `total_score`   INT          DEFAULT NULL COMMENT '考核总分上限',
  `remark`        VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`     BIGINT       DEFAULT NULL,
  `update_by`     BIGINT       DEFAULT NULL,
  `deleted`       TINYINT      NOT NULL DEFAULT 0,
  `tenant_id`     BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绩效考核模板';
