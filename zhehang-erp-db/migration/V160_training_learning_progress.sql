-- =============================================================================
-- V160 培训学习进度：跨设备续学、逐课件/逐页完成、复训分轮次留痕
-- 说明：只新增独立进度表，不回填、不修改既有课程、学习、考试或成绩数据。
-- =============================================================================

CREATE TABLE IF NOT EXISTS `hrm_training_learning_step` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `learning_record_id` BIGINT NOT NULL COMMENT '学习记录ID',
  `employee_id` BIGINT NOT NULL COMMENT '员工ID快照',
  `employee_user_id` BIGINT NULL COMMENT '员工用户ID快照',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `course_version` VARCHAR(32) NOT NULL COMMENT '学习记录中的课程版本快照',
  `study_cycle` INT NOT NULL DEFAULT 1 COMMENT '学习轮次：首次1，复训依次递增',
  `material_id` BIGINT NOT NULL COMMENT '课件材料ID',
  `step_index` INT NOT NULL DEFAULT 0 COMMENT '课件内步骤/页码，从0开始',
  `step_type` VARCHAR(24) NOT NULL COMMENT '步骤类型:PPT_SLIDE/VIDEO/MATERIAL',
  `source` VARCHAR(24) NOT NULL DEFAULT 'INTERACTION' COMMENT '来源:INTERACTION/LEGACY_LOCAL',
  `completed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否完成；视频可只保存播放位置',
  `position_seconds` INT NULL COMMENT '视频已播放到的秒数，其他课件为空',
  `completed_time` DATETIME(3) NULL COMMENT '首次完成时间',
  `last_seen_time` DATETIME(3) NOT NULL COMMENT '最近查看时间，用于跨设备续学',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_training_step_scope` (`tenant_id`,`learning_record_id`,`study_cycle`,`course_version`,`material_id`,`step_index`),
  KEY `idx_training_step_record_cycle` (`tenant_id`,`learning_record_id`,`study_cycle`,`last_seen_time`,`id`),
  KEY `idx_training_step_employee` (`tenant_id`,`employee_id`,`course_id`,`study_cycle`),
  KEY `idx_training_step_material` (`tenant_id`,`material_id`,`learning_record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训逐课件逐页学习进度';
