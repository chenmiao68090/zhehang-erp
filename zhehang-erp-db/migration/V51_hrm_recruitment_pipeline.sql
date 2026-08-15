-- V51: 招聘闭环补强
-- 1) 招聘需求增加招聘周期、岗位负责人、招聘负责人
-- 2) 简历库增加人才画像、约面登记、复试/淘汰/未入职原因、简历附件
-- 3) 新增面试流转记录表,用于全程留痕

DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_missing$$
CREATE PROCEDURE add_column_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_column_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN ', p_column_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DROP PROCEDURE IF EXISTS add_index_if_missing$$
CREATE PROCEDURE add_index_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_index_name VARCHAR(64),
  IN p_index_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD INDEX `', p_index_name, '` ', p_index_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL add_column_if_missing('hrm_recruit', 'start_date', '`start_date` DATE DEFAULT NULL COMMENT ''招聘开始时间''');
CALL add_column_if_missing('hrm_recruit', 'plan_finish_date', '`plan_finish_date` DATE DEFAULT NULL COMMENT ''计划完成时间''');
CALL add_column_if_missing('hrm_recruit', 'job_owner', '`job_owner` VARCHAR(64) DEFAULT NULL COMMENT ''岗位负责人''');
CALL add_column_if_missing('hrm_recruit', 'recruit_owner', '`recruit_owner` VARCHAR(64) DEFAULT NULL COMMENT ''招聘负责人''');

CALL add_column_if_missing('hrm_resume', 'position_name', '`position_name` VARCHAR(128) DEFAULT NULL COMMENT ''应聘岗位''');
CALL add_column_if_missing('hrm_resume', 'age', '`age` INT DEFAULT NULL COMMENT ''年龄''');
CALL add_column_if_missing('hrm_resume', 'tags', '`tags` VARCHAR(500) DEFAULT NULL COMMENT ''人才标签,逗号分隔''');
CALL add_column_if_missing('hrm_resume', 'first_interview_time', '`first_interview_time` DATETIME DEFAULT NULL COMMENT ''初面时间''');
CALL add_column_if_missing('hrm_resume', 'need_re_interview', '`need_re_interview` TINYINT(1) DEFAULT 0 COMMENT ''是否需要复试''');
CALL add_column_if_missing('hrm_resume', 're_interview_time', '`re_interview_time` DATETIME DEFAULT NULL COMMENT ''复试时间''');
CALL add_column_if_missing('hrm_resume', 'interviewer', '`interviewer` VARCHAR(64) DEFAULT NULL COMMENT ''当前面试官/负责人''');
CALL add_column_if_missing('hrm_resume', 'reject_reason', '`reject_reason` VARCHAR(500) DEFAULT NULL COMMENT ''面试未通过原因''');
CALL add_column_if_missing('hrm_resume', 'not_join_reason', '`not_join_reason` VARCHAR(500) DEFAULT NULL COMMENT ''面试通过未入职原因''');
CALL add_column_if_missing('hrm_resume', 'resume_file_id', '`resume_file_id` BIGINT DEFAULT NULL COMMENT ''简历附件文件ID''');
CALL add_column_if_missing('hrm_resume', 'resume_file_name', '`resume_file_name` VARCHAR(255) DEFAULT NULL COMMENT ''简历附件文件名''');

ALTER TABLE `hrm_resume`
  MODIFY COLUMN `status` TINYINT DEFAULT 0 COMMENT '状态(0待筛选 1待/初面 2已通过 3已淘汰 4复试中 5已入职 6未入职)';

CREATE TABLE IF NOT EXISTS `hrm_interview_record` (
  `id`                  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '面试记录ID',
  `resume_id`           BIGINT       NOT NULL                COMMENT '简历/候选人ID',
  `recruit_id`          BIGINT       DEFAULT NULL            COMMENT '招聘需求ID',
  `stage`               VARCHAR(32)  DEFAULT NULL            COMMENT '阶段(screen/first/re_interview/final/join)',
  `result`              VARCHAR(32)  DEFAULT NULL            COMMENT '结果(record/first_pass/pass/reject/hired/not_join)',
  `interviewer`         VARCHAR(64)  DEFAULT NULL            COMMENT '面试官',
  `interview_time`      DATETIME     DEFAULT NULL            COMMENT '面试时间',
  `next_interview_time` DATETIME     DEFAULT NULL            COMMENT '下一轮面试时间',
  `evaluation`          TEXT         DEFAULT NULL            COMMENT '面试评价',
  `reject_reason`       VARCHAR(500) DEFAULT NULL            COMMENT '淘汰/未通过原因',
  `create_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`           BIGINT       DEFAULT NULL,
  `update_by`           BIGINT       DEFAULT NULL,
  `deleted`             TINYINT(1)   DEFAULT 0,
  `tenant_id`           BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_resume_id` (`resume_id`),
  KEY `idx_recruit_id` (`recruit_id`),
  KEY `idx_stage` (`stage`),
  KEY `idx_result` (`result`),
  KEY `idx_interview_time` (`interview_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试流转记录表';

CALL add_index_if_missing('hrm_recruit', 'idx_recruit_plan_finish', '(`plan_finish_date`)');
CALL add_index_if_missing('hrm_resume', 'idx_resume_phone', '(`phone`)');
CALL add_index_if_missing('hrm_resume', 'idx_resume_first_interview', '(`first_interview_time`)');

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
