-- =============================================================================
-- V144 培训中心升级为企业学习平台 / LMS MVP
-- 目标:
-- 1) 在既有课程、学习、考试、路径、认证基础上补齐课程编号/分类/阶段/学分等字段。
-- 2) 新增作业实操、岗位能力地图、学分流水。
-- 3) 把培训中心左侧菜单扩展为企业大学模块。
-- 说明:全部幂等,不删除现有课程/课件/员工/考试数据。
-- =============================================================================

DROP PROCEDURE IF EXISTS `add_training_column_if_missing`;
DELIMITER $$
CREATE PROCEDURE `add_training_column_if_missing`(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_column_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
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
DELIMITER ;

DROP PROCEDURE IF EXISTS `add_training_index_if_missing`;
DELIMITER $$
CREATE PROCEDURE `add_training_index_if_missing`(
  IN p_table_name VARCHAR(64),
  IN p_index_name VARCHAR(64),
  IN p_index_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD ', p_index_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL `add_training_column_if_missing`('hrm_training_course', 'course_code', '`course_code` VARCHAR(32) NULL COMMENT ''课程编号'' AFTER `id`');
CALL `add_training_column_if_missing`('hrm_training_course', 'course_category', '`course_category` VARCHAR(64) NULL COMMENT ''课程分类:全员/销售/会计/财务/工商/客服/主管'' AFTER `course_title`');
CALL `add_training_column_if_missing`('hrm_training_course', 'applicable_stage', '`applicable_stage` VARCHAR(64) NULL COMMENT ''适用阶段:入职第1天/3天/7天/30天/长期'' AFTER `applicable_positions`');
CALL `add_training_column_if_missing`('hrm_training_course', 'lecturer_name', '`lecturer_name` VARCHAR(64) NULL COMMENT ''讲师'' AFTER `owner_name`');
CALL `add_training_column_if_missing`('hrm_training_course', 'credit', '`credit` INT NOT NULL DEFAULT 1 COMMENT ''完成课程学分'' AFTER `learning_minutes_required`');
CALL `add_training_column_if_missing`('hrm_training_course', 'course_status', '`course_status` VARCHAR(20) NOT NULL DEFAULT ''已发布'' COMMENT ''状态:草稿/已发布/已下架'' AFTER `enabled`');
CALL `add_training_column_if_missing`('hrm_training_course', 'exam_duration_minutes', '`exam_duration_minutes` INT NOT NULL DEFAULT 30 COMMENT ''考试时长分钟'' AFTER `pass_score`');

CALL `add_training_column_if_missing`('hrm_training_path_course', 'prerequisite_course_id', '`prerequisite_course_id` BIGINT NULL COMMENT ''前置课程ID'' AFTER `course_title`');
CALL `add_training_column_if_missing`('hrm_training_path_course', 'unlock_day', '`unlock_day` INT NOT NULL DEFAULT 0 COMMENT ''第几天解锁,0为立即'' AFTER `sort_order`');

CALL `add_training_column_if_missing`('hrm_training_exam_question', 'question_position', '`question_position` VARCHAR(64) NULL COMMENT ''所属岗位'' AFTER `course_id`');
CALL `add_training_column_if_missing`('hrm_training_exam_question', 'difficulty', '`difficulty` VARCHAR(20) NOT NULL DEFAULT ''中'' COMMENT ''难度:易/中/难'' AFTER `question_type`');

CALL `add_training_index_if_missing`('hrm_training_course', 'idx_training_course_code', 'INDEX `idx_training_course_code` (`course_code`)');
CALL `add_training_index_if_missing`('hrm_training_course', 'idx_training_course_category', 'INDEX `idx_training_course_category` (`course_category`)');
CALL `add_training_index_if_missing`('hrm_training_course', 'idx_training_course_stage', 'INDEX `idx_training_course_stage` (`applicable_stage`)');
CALL `add_training_index_if_missing`('hrm_training_path_course', 'idx_path_course_prereq', 'INDEX `idx_path_course_prereq` (`prerequisite_course_id`)');

CREATE TABLE IF NOT EXISTS `hrm_training_homework` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `course_id` BIGINT NOT NULL COMMENT '关联课程ID',
  `homework_name` VARCHAR(200) NOT NULL COMMENT '作业名称',
  `homework_type` VARCHAR(32) NOT NULL DEFAULT '实操' COMMENT '作业类型:销售/会计/财务/客服/工商/主管/实操',
  `submit_instruction` TEXT NULL COMMENT '提交说明',
  `attachment_file_id` BIGINT NULL COMMENT '作业模板附件ID',
  `attachment_name` VARCHAR(200) NULL COMMENT '作业模板附件名',
  `pass_score` INT NOT NULL DEFAULT 80 COMMENT '作业及格分',
  `credit` INT NOT NULL DEFAULT 1 COMMENT '作业通过学分',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT NOT NULL DEFAULT 1 COMMENT '排序',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_homework_course` (`course_id`),
  KEY `idx_training_homework_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训作业实操配置';

CREATE TABLE IF NOT EXISTS `hrm_training_homework_submission` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `homework_id` BIGINT NOT NULL COMMENT '作业ID',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `learning_record_id` BIGINT NULL COMMENT '学习记录ID',
  `employee_id` BIGINT NOT NULL COMMENT '员工ID',
  `employee_name` VARCHAR(64) NOT NULL COMMENT '员工姓名快照',
  `employee_user_id` BIGINT NULL COMMENT '员工用户ID',
  `submit_content` MEDIUMTEXT NULL COMMENT '提交内容',
  `attachment_file_id` BIGINT NULL COMMENT '提交附件ID',
  `attachment_name` VARCHAR(200) NULL COMMENT '提交附件名',
  `status` VARCHAR(20) NOT NULL DEFAULT '待提交' COMMENT '状态:待提交/待评分/已通过/未通过',
  `score` INT NULL COMMENT '评分',
  `passed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否通过',
  `reviewer_id` BIGINT NULL COMMENT '评分人用户ID',
  `reviewer_name` VARCHAR(64) NULL COMMENT '评分人姓名',
  `reviewer_comment` TEXT NULL COMMENT '评语',
  `submitted_time` DATETIME NULL COMMENT '提交时间',
  `reviewed_time` DATETIME NULL COMMENT '评分时间',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_homework_submission_homework` (`homework_id`),
  KEY `idx_homework_submission_course` (`course_id`),
  KEY `idx_homework_submission_learning` (`learning_record_id`),
  KEY `idx_homework_submission_employee` (`employee_id`),
  KEY `idx_homework_submission_user` (`employee_user_id`),
  KEY `idx_homework_submission_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训作业提交';

CREATE TABLE IF NOT EXISTS `hrm_training_skill` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `skill_name` VARCHAR(160) NOT NULL COMMENT '能力名称',
  `applicable_position` VARCHAR(64) NOT NULL COMMENT '适用岗位',
  `skill_category` VARCHAR(64) NULL COMMENT '能力分类',
  `required_level` VARCHAR(32) NOT NULL DEFAULT '掌握' COMMENT '要求等级:了解/掌握/熟练/专家',
  `description` TEXT NULL COMMENT '能力说明',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT NOT NULL DEFAULT 1 COMMENT '排序',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_skill_position` (`applicable_position`),
  KEY `idx_training_skill_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位能力地图';

CREATE TABLE IF NOT EXISTS `hrm_training_skill_course` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `skill_id` BIGINT NOT NULL COMMENT '能力ID',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `course_title` VARCHAR(200) NOT NULL COMMENT '课程标题快照',
  `required_course` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否必修',
  `sort_order` INT NOT NULL DEFAULT 1 COMMENT '排序',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_skill_course_skill` (`skill_id`),
  KEY `idx_skill_course_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='能力关联课程';

CREATE TABLE IF NOT EXISTS `hrm_training_credit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `employee_id` BIGINT NOT NULL COMMENT '员工ID',
  `employee_name` VARCHAR(64) NOT NULL COMMENT '员工姓名快照',
  `source_type` VARCHAR(32) NOT NULL COMMENT '来源:COURSE/PATH/HOMEWORK',
  `source_id` BIGINT NOT NULL COMMENT '来源ID',
  `source_title` VARCHAR(200) NOT NULL COMMENT '来源标题',
  `credit` INT NOT NULL DEFAULT 0 COMMENT '学分',
  `grant_time` DATETIME NOT NULL COMMENT '发放时间',
  `remark` VARCHAR(255) NULL COMMENT '备注',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_credit_employee` (`employee_id`),
  KEY `idx_credit_source` (`source_type`, `source_id`),
  KEY `idx_credit_grant` (`grant_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训学分流水';

UPDATE `hrm_training_course`
SET `course_code` = CONCAT('TR', LPAD(`id`, 4, '0'))
WHERE (`course_code` IS NULL OR `course_code` = '')
  AND `deleted` = 0;

UPDATE `hrm_training_course`
SET `course_category` = CASE
    WHEN `applicable_positions` LIKE '%销售%' THEN '销售'
    WHEN `applicable_positions` LIKE '%会计%' THEN '会计'
    WHEN `applicable_positions` LIKE '%财务%' THEN '财务'
    WHEN `applicable_positions` LIKE '%工商%' THEN '工商'
    WHEN `applicable_positions` LIKE '%客服%' THEN '客服'
    WHEN `applicable_positions` LIKE '%管理%' THEN '主管'
    ELSE '全员'
  END,
  `applicable_stage` = IFNULL(`applicable_stage`, '长期'),
  `lecturer_name` = IFNULL(`lecturer_name`, `owner_name`),
  `credit` = IFNULL(`credit`, 1),
  `course_status` = CASE WHEN `enabled` = 1 THEN '已发布' ELSE '已下架' END
WHERE `deleted` = 0;

UPDATE `hrm_training_course`
SET `course_code` = 'A01', `course_category` = '全员', `applicable_stage` = '入职第1天', `credit` = 2
WHERE `deleted` = 0 AND `course_title` LIKE 'A01%公司介绍%';
UPDATE `hrm_training_course`
SET `course_code` = 'A02', `course_category` = '全员', `applicable_stage` = '入职第1天', `credit` = 2
WHERE `deleted` = 0 AND `course_title` LIKE 'A02%企业文化%';
UPDATE `hrm_training_course`
SET `course_code` = 'A03', `course_category` = '全员', `applicable_stage` = '入职第3天', `credit` = 2
WHERE `deleted` = 0 AND `course_title` LIKE 'A03%规章制度%';
UPDATE `hrm_training_course`
SET `course_code` = 'A04', `course_category` = '全员', `applicable_stage` = '入职第3天', `credit` = 2
WHERE `deleted` = 0 AND `course_title` LIKE 'A04%保密%';
UPDATE `hrm_training_course`
SET `course_code` = 'A05', `course_category` = '全员', `applicable_stage` = '入职第7天', `credit` = 2
WHERE `deleted` = 0 AND `course_title` LIKE 'A05%系统基础%';
UPDATE `hrm_training_course`
SET `course_code` = 'A06', `course_category` = '全员', `applicable_stage` = '入职第7天', `credit` = 2
WHERE `deleted` = 0 AND `course_title` LIKE 'A06%问题上报%';
UPDATE `hrm_training_course`
SET `course_code` = 'A07', `course_category` = '全员', `applicable_stage` = '入职第7天', `credit` = 2
WHERE `deleted` = 0 AND `course_title` LIKE 'A07%日报%';

INSERT INTO `hrm_training_path`
(`path_name`, `applicable_position`, `description`, `required_path`, `enabled`, `version_no`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '新人入职全员路径', '全员', '入职第1天到第7天必须完成的公司基础学习路径。', 1, 1, 'v1.0', NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_training_path` WHERE `path_name` = '新人入职全员路径' AND `deleted` = 0);

INSERT INTO `hrm_training_path_course`
(`path_id`, `course_id`, `course_title`, `prerequisite_course_id`, `sort_order`, `unlock_day`, `required_course`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT p.`id`, c.`id`, c.`course_title`,
       (SELECT pc.`id` FROM `hrm_training_course` pc WHERE pc.`course_code` = CONCAT('A', LPAD(CAST(SUBSTRING(c.`course_code`, 2) AS UNSIGNED) - 1, 2, '0')) AND pc.`deleted` = 0 LIMIT 1),
       CAST(SUBSTRING(c.`course_code`, 2) AS UNSIGNED),
       CASE WHEN c.`course_code` IN ('A01','A02') THEN 1 WHEN c.`course_code` IN ('A03','A04') THEN 3 ELSE 7 END,
       1, NOW(), NOW(), 0, 1
FROM `hrm_training_path` p
JOIN `hrm_training_course` c ON c.`course_code` IN ('A01','A02','A03','A04','A05','A06','A07') AND c.`deleted` = 0
WHERE p.`path_name` = '新人入职全员路径'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_path_course` x WHERE x.`path_id` = p.`id` AND x.`course_id` = c.`id` AND x.`deleted` = 0);

INSERT INTO `hrm_training_homework`
(`course_id`, `homework_name`, `homework_type`, `submit_instruction`, `pass_score`, `credit`, `enabled`, `sort_order`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, '新人7天学习复盘作业', '实操',
       '请提交一份不少于300字的入职学习复盘: 1. 公司靠什么赚钱; 2. 自己岗位与销售/会计/工商/财务/客服如何协作; 3. 遇到问题如何上报闭环; 4. 下一周最需要补强的一项能力。',
       80, 1, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_code` = 'A01'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_homework` h WHERE h.`course_id` = c.`id` AND h.`homework_name` = '新人7天学习复盘作业' AND h.`deleted` = 0);

INSERT INTO `hrm_training_skill`
(`skill_name`, `applicable_position`, `skill_category`, `required_level`, `description`, `enabled`, `sort_order`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '标准化服务意识', '全员', '通用能力', '掌握', '理解公司业务、客户价值、协作边界和问题闭环标准。', 1, 1, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_training_skill` WHERE `skill_name` = '标准化服务意识' AND `applicable_position` = '全员' AND `deleted` = 0);

INSERT INTO `hrm_training_skill`
(`skill_name`, `applicable_position`, `skill_category`, `required_level`, `description`, `enabled`, `sort_order`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '客户问题闭环能力', '客服', '服务能力', '熟练', '能记录问题、判断升级、跟进处理、客户确认、复盘改进。', 1, 2, NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_training_skill` WHERE `skill_name` = '客户问题闭环能力' AND `applicable_position` = '客服' AND `deleted` = 0);

INSERT INTO `hrm_training_skill_course`
(`skill_id`, `course_id`, `course_title`, `required_course`, `sort_order`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT s.`id`, c.`id`, c.`course_title`, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_skill` s
JOIN `hrm_training_course` c ON c.`course_code` = 'A01' AND c.`deleted` = 0
WHERE s.`skill_name` = '标准化服务意识'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_skill_course` sc WHERE sc.`skill_id` = s.`id` AND sc.`course_id` = c.`id` AND sc.`deleted` = 0);

UPDATE `sys_menu`
SET `menu_name` = '学习路径', `sort` = 4, `visible` = 1, `status` = 0, `update_time` = NOW()
WHERE `deleted` = 0 AND `id` = 900113;

UPDATE `sys_menu`
SET `menu_name` = '考试中心', `sort` = 5, `visible` = 1, `status` = 0, `update_time` = NOW()
WHERE `deleted` = 0 AND `id` = 900112;

UPDATE `sys_menu`
SET `sort` = 2, `visible` = 1, `status` = 0, `update_time` = NOW()
WHERE `deleted` = 0 AND `id` = 900110;

UPDATE `sys_menu`
SET `sort` = 3, `visible` = 1, `status` = 0, `update_time` = NOW()
WHERE `deleted` = 0 AND `id` = 900111;

UPDATE `sys_menu`
SET `sort` = 10, `visible` = 1, `status` = 0, `update_time` = NOW()
WHERE `deleted` = 0 AND `id` = 900115;

UPDATE `sys_menu`
SET `sort` = 13, `visible` = 1, `status` = 0, `update_time` = NOW()
WHERE `deleted` = 0 AND `id` = 900114;

INSERT INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (900116, '培训首页', 900010, 1, 'home', NULL, 'C', 1, 0, NULL, 'home-filled', 1, 1),
  (900117, '作业实操', 900010, 6, 'homework', NULL, 'C', 1, 0, NULL, 'edit-pen', 1, 1),
  (900118, '证书学分', 900010, 7, 'credits', NULL, 'C', 1, 0, NULL, 'medal', 1, 1),
  (900119, '岗位能力地图', 900010, 8, 'skills', NULL, 'C', 1, 0, NULL, 'guide', 1, 1),
  (900120, '主管督学', 900010, 9, 'supervision', NULL, 'C', 1, 0, NULL, 'user-filled', 1, 1),
  (900121, '培训素材库', 900010, 11, 'materials', NULL, 'C', 1, 0, NULL, 'folder-opened', 1, 1),
  (900122, '培训记录', 900010, 12, 'records', NULL, 'C', 1, 0, NULL, 'document', 1, 1)
ON DUPLICATE KEY UPDATE
  `menu_name` = VALUES(`menu_name`),
  `parent_id` = VALUES(`parent_id`),
  `sort` = VALUES(`sort`),
  `path` = VALUES(`path`),
  `component` = VALUES(`component`),
  `menu_type` = VALUES(`menu_type`),
  `visible` = VALUES(`visible`),
  `status` = VALUES(`status`),
  `perms` = VALUES(`perms`),
  `icon` = VALUES(`icon`),
  `update_time` = NOW();

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`id` IN (900116,900110,900111,900113,900117,900118,900119,900121,900122,900114)
WHERE r.`role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr', 'sales', 'online_sales', 'finance', 'finance_hq', 'staff');

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`id` IN (900112,900120,900115)
WHERE r.`role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'hr');

DROP PROCEDURE IF EXISTS `add_training_column_if_missing`;
DROP PROCEDURE IF EXISTS `add_training_index_if_missing`;
