-- =============================================================================
-- V139 课件培训系统: 课程学习 + 考核评分 + 复训闭环 + 岗位路径/认证
-- 说明: 只新增培训课程相关表和示例课程,不修改生产业务数据。
-- =============================================================================

CREATE TABLE IF NOT EXISTS `hrm_training_course` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `course_title` VARCHAR(200) NOT NULL COMMENT '课程标题',
  `sop_id` BIGINT NULL COMMENT '关联SOP ID',
  `sop_title` VARCHAR(200) NULL COMMENT 'SOP标题快照',
  `sop_version` VARCHAR(32) NULL COMMENT 'SOP版本快照',
  `applicable_positions` VARCHAR(255) NOT NULL COMMENT '适用岗位,逗号分隔',
  `business_scenario` VARCHAR(64) NOT NULL COMMENT '业务场景',
  `course_type` VARCHAR(32) NOT NULL DEFAULT 'MIXED' COMMENT '课程类型:PPT/PDF/VIDEO/ARTICLE/LINK/MIXED',
  `summary` TEXT NULL COMMENT '课程简介',
  `learning_minutes_required` INT NOT NULL DEFAULT 30 COMMENT '要求学习分钟数',
  `required_course` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否必修',
  `pass_score` INT NOT NULL DEFAULT 80 COMMENT '及格分',
  `allow_retake` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否允许重考',
  `max_retake_times` INT NOT NULL DEFAULT 2 COMMENT '最多重考次数',
  `certification_enabled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否生成上岗认证',
  `certification_name` VARCHAR(120) NULL COMMENT '认证名称',
  `owner_id` BIGINT NULL COMMENT '负责人ID(org_employee.id)',
  `owner_name` VARCHAR(64) NULL COMMENT '负责人姓名快照',
  `version_no` VARCHAR(32) NOT NULL DEFAULT 'v1.0' COMMENT '课程版本号',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `usage_count` INT NOT NULL DEFAULT 0 COMMENT '分配/学习使用次数',
  `last_used_time` DATETIME NULL COMMENT '最近使用时间',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_course_sop` (`sop_id`),
  KEY `idx_training_course_position` (`applicable_positions`),
  KEY `idx_training_course_scenario` (`business_scenario`),
  KEY `idx_training_course_enabled` (`enabled`),
  KEY `idx_training_course_usage` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训课程';

CREATE TABLE IF NOT EXISTS `hrm_training_material` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `material_type` VARCHAR(32) NOT NULL COMMENT '课件类型:PPT/PDF/VIDEO/ARTICLE/LINK',
  `material_name` VARCHAR(200) NOT NULL COMMENT '课件名称',
  `material_url` VARCHAR(500) NULL COMMENT '课件地址或视频链接',
  `file_id` BIGINT NULL COMMENT '文件中心ID',
  `file_name` VARCHAR(200) NULL COMMENT '上传文件名',
  `material_content` MEDIUMTEXT NULL COMMENT '图文/说明正文',
  `duration_minutes` INT NOT NULL DEFAULT 0 COMMENT '预计学习分钟数',
  `sort_order` INT NOT NULL DEFAULT 1 COMMENT '排序',
  `required_material` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否必学',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_material_course` (`course_id`),
  KEY `idx_training_material_sort` (`course_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训课件材料';

CREATE TABLE IF NOT EXISTS `hrm_training_exam_question` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `question_type` VARCHAR(20) NOT NULL COMMENT '题型:SINGLE/MULTIPLE/JUDGE/THINKING',
  `question_title` TEXT NOT NULL COMMENT '题干',
  `options_json` TEXT NULL COMMENT '选项JSON',
  `answer_json` TEXT NULL COMMENT '标准答案JSON',
  `analysis` TEXT NULL COMMENT '答案解析',
  `score` INT NOT NULL DEFAULT 10 COMMENT '分值',
  `scoring_standard` TEXT NULL COMMENT '思考题评分标准',
  `sort_order` INT NOT NULL DEFAULT 1 COMMENT '排序',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_question_course` (`course_id`),
  KEY `idx_training_question_sort` (`course_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训考核题库';

CREATE TABLE IF NOT EXISTS `hrm_training_learning_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `employee_id` BIGINT NOT NULL COMMENT '员工ID(org_employee.id)',
  `employee_name` VARCHAR(64) NOT NULL COMMENT '员工姓名快照',
  `employee_user_id` BIGINT NULL COMMENT '员工用户ID(sys_user.id)',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `course_title` VARCHAR(200) NOT NULL COMMENT '课程标题快照',
  `course_version` VARCHAR(32) NOT NULL COMMENT '课程版本快照',
  `sop_id` BIGINT NULL COMMENT '关联SOP ID快照',
  `sop_title` VARCHAR(200) NULL COMMENT 'SOP标题快照',
  `sop_version` VARCHAR(32) NULL COMMENT 'SOP版本快照',
  `path_id` BIGINT NULL COMMENT '岗位路径ID',
  `path_name` VARCHAR(160) NULL COMMENT '岗位路径名称快照',
  `status` VARCHAR(32) NOT NULL DEFAULT '未开始' COMMENT '学习状态',
  `progress_percent` INT NOT NULL DEFAULT 0 COMMENT '学习进度',
  `assigned_time` DATETIME NOT NULL COMMENT '分配时间',
  `due_time` DATETIME NULL COMMENT '截止时间',
  `started_time` DATETIME NULL COMMENT '开始学习时间',
  `completed_time` DATETIME NULL COMMENT '学完时间',
  `required_course` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否必修',
  `certification_required` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否要求认证',
  `current_attempt` INT NOT NULL DEFAULT 0 COMMENT '当前考试次数',
  `best_score` INT NULL COMMENT '最高分',
  `passed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否通过',
  `pass_time` DATETIME NULL COMMENT '通过时间',
  `retrain_required` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否需要复训',
  `retrain_time` DATETIME NULL COMMENT '复训生成时间',
  `improvement` TEXT NULL COMMENT '需改进问题',
  `last_exam_record_id` BIGINT NULL COMMENT '最近考试记录ID',
  `reminder_count` INT NOT NULL DEFAULT 0 COMMENT '提醒次数',
  `assigner_id` BIGINT NULL COMMENT '分配人用户ID',
  `assigner_name` VARCHAR(64) NULL COMMENT '分配人姓名/账号',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_learning_employee` (`employee_id`),
  KEY `idx_learning_course` (`course_id`),
  KEY `idx_learning_status` (`status`),
  KEY `idx_learning_due` (`due_time`),
  KEY `idx_learning_path` (`path_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工课程学习记录';

CREATE TABLE IF NOT EXISTS `hrm_training_exam_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `learning_record_id` BIGINT NOT NULL COMMENT '学习记录ID',
  `employee_id` BIGINT NOT NULL COMMENT '员工ID',
  `employee_name` VARCHAR(64) NOT NULL COMMENT '员工姓名快照',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `course_title` VARCHAR(200) NOT NULL COMMENT '课程标题快照',
  `course_version` VARCHAR(32) NOT NULL COMMENT '课程版本快照',
  `attempt_no` INT NOT NULL DEFAULT 1 COMMENT '第几次考试',
  `objective_score` INT NOT NULL DEFAULT 0 COMMENT '客观题得分',
  `thinking_score` INT NOT NULL DEFAULT 0 COMMENT '思考题得分',
  `total_score` INT NOT NULL DEFAULT 0 COMMENT '总分',
  `pass_score` INT NOT NULL DEFAULT 80 COMMENT '及格分',
  `passed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否通过',
  `manual_review_status` VARCHAR(20) NOT NULL DEFAULT '无需评分' COMMENT '思考题评分状态:无需评分/待评分/已评分',
  `submitted_time` DATETIME NOT NULL COMMENT '提交时间',
  `reviewed_time` DATETIME NULL COMMENT '人工评分时间',
  `reviewer_id` BIGINT NULL COMMENT '评分人用户ID',
  `reviewer_name` VARCHAR(64) NULL COMMENT '评分人姓名/账号',
  `wrong_questions_json` MEDIUMTEXT NULL COMMENT '错题记录JSON',
  `improvement` TEXT NULL COMMENT '需改进问题',
  `status` VARCHAR(20) NOT NULL DEFAULT '已提交' COMMENT '状态:已提交/待评分/已评分',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_exam_learning` (`learning_record_id`),
  KEY `idx_exam_employee` (`employee_id`),
  KEY `idx_exam_course` (`course_id`),
  KEY `idx_exam_review` (`manual_review_status`),
  KEY `idx_exam_passed` (`passed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训考试记录';

CREATE TABLE IF NOT EXISTS `hrm_training_answer` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `exam_record_id` BIGINT NOT NULL COMMENT '考试记录ID',
  `question_id` BIGINT NOT NULL COMMENT '题目ID',
  `question_type` VARCHAR(20) NOT NULL COMMENT '题型',
  `question_title` TEXT NOT NULL COMMENT '题干快照',
  `answer_json` MEDIUMTEXT NULL COMMENT '员工答案JSON',
  `standard_answer_json` MEDIUMTEXT NULL COMMENT '标准答案JSON',
  `score` INT NOT NULL DEFAULT 0 COMMENT '得分',
  `max_score` INT NOT NULL DEFAULT 0 COMMENT '满分',
  `correct_flag` TINYINT(1) NULL COMMENT '客观题是否正确',
  `reviewer_comment` TEXT NULL COMMENT '评分意见',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_answer_exam` (`exam_record_id`),
  KEY `idx_training_answer_question` (`question_id`),
  KEY `idx_training_answer_correct` (`correct_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训答题明细';

CREATE TABLE IF NOT EXISTS `hrm_training_path` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `path_name` VARCHAR(160) NOT NULL COMMENT '路径名称',
  `applicable_position` VARCHAR(64) NOT NULL COMMENT '适用岗位',
  `description` TEXT NULL COMMENT '路径说明',
  `required_path` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否必修路径',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `owner_id` BIGINT NULL COMMENT '负责人ID(org_employee.id)',
  `owner_name` VARCHAR(64) NULL COMMENT '负责人姓名快照',
  `version_no` VARCHAR(32) NOT NULL DEFAULT 'v1.0' COMMENT '版本号',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_path_position` (`applicable_position`),
  KEY `idx_training_path_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位培训路径';

CREATE TABLE IF NOT EXISTS `hrm_training_path_course` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `path_id` BIGINT NOT NULL COMMENT '路径ID',
  `course_id` BIGINT NOT NULL COMMENT '课程ID',
  `course_title` VARCHAR(200) NOT NULL COMMENT '课程标题快照',
  `sort_order` INT NOT NULL DEFAULT 1 COMMENT '排序',
  `required_course` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否必修',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_path_course_path` (`path_id`),
  KEY `idx_path_course_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位路径课程';

CREATE TABLE IF NOT EXISTS `hrm_training_certification` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `employee_id` BIGINT NOT NULL COMMENT '员工ID',
  `employee_name` VARCHAR(64) NOT NULL COMMENT '员工姓名快照',
  `position_name` VARCHAR(64) NULL COMMENT '岗位名称',
  `course_id` BIGINT NULL COMMENT '课程ID',
  `course_title` VARCHAR(200) NULL COMMENT '课程标题快照',
  `path_id` BIGINT NULL COMMENT '路径ID',
  `path_name` VARCHAR(160) NULL COMMENT '路径名称快照',
  `certification_name` VARCHAR(160) NOT NULL COMMENT '认证名称',
  `status` VARCHAR(20) NOT NULL DEFAULT '已认证' COMMENT '认证状态:认证中/已认证/认证失效',
  `certified_time` DATETIME NULL COMMENT '认证时间',
  `expire_time` DATETIME NULL COMMENT '失效时间',
  `best_score` INT NULL COMMENT '认证得分',
  `create_time` DATETIME NULL COMMENT '创建时间',
  `update_time` DATETIME NULL COMMENT '更新时间',
  `create_by` BIGINT NULL COMMENT '创建人',
  `update_by` BIGINT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL DEFAULT 1 COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_training_cert_employee` (`employee_id`),
  KEY `idx_training_cert_course` (`course_id`),
  KEY `idx_training_cert_path` (`path_id`),
  KEY `idx_training_cert_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工培训上岗认证';

INSERT INTO `hrm_training_course`
(`course_title`, `sop_id`, `sop_title`, `sop_version`, `applicable_positions`, `business_scenario`, `course_type`, `summary`,
 `learning_minutes_required`, `required_course`, `pass_score`, `allow_retake`, `max_retake_times`, `certification_enabled`,
 `certification_name`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '新客户交接与资料收集课',
       s.`id`, s.`sop_title`, s.`version_no`, s.`applicable_positions`, s.`business_scenario`, 'MIXED',
       '面向会计、客服、运营的新客户交接基础课,重点训练资料清单、销售承诺核对和风险交接。',
       45, 1, 80, 1, 2, 1, '新客户交接上岗认证', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
FROM `hrm_sop` s
WHERE s.`sop_title` = '新客户交接资料收集SOP' AND s.`deleted` = 0
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_course` c WHERE c.`course_title` = '新客户交接与资料收集课' AND c.`deleted` = 0)
LIMIT 1;

INSERT INTO `hrm_training_course`
(`course_title`, `sop_id`, `sop_title`, `sop_version`, `applicable_positions`, `business_scenario`, `course_type`, `summary`,
 `learning_minutes_required`, `required_course`, `pass_score`, `allow_retake`, `max_retake_times`, `certification_enabled`,
 `certification_name`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '客户投诉处理与复盘课',
       s.`id`, s.`sop_title`, s.`version_no`, s.`applicable_positions`, s.`business_scenario`, 'VIDEO',
       '训练客服和主管把投诉记录、升级、补救、客户确认、复盘改 SOP 做成闭环。',
       35, 1, 85, 1, 2, 1, '客户投诉处理认证', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
FROM `hrm_sop` s
WHERE s.`sop_title` = '客户投诉升级处理SOP' AND s.`deleted` = 0
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_course` c WHERE c.`course_title` = '客户投诉处理与复盘课' AND c.`deleted` = 0)
LIMIT 1;

INSERT INTO `hrm_training_course`
(`course_title`, `sop_id`, `sop_title`, `sop_version`, `applicable_positions`, `business_scenario`, `course_type`, `summary`,
 `learning_minutes_required`, `required_course`, `pass_score`, `allow_retake`, `max_retake_times`, `certification_enabled`,
 `certification_name`, `version_no`, `enabled`, `usage_count`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '申报前税负风险检查课',
       s.`id`, s.`sop_title`, s.`version_no`, s.`applicable_positions`, s.`business_scenario`, 'PPT',
       '训练会计在报税前完成税负波动、异常抵扣、连续零申报、回执归档的检查。',
       40, 1, 80, 1, 2, 1, '报税风险检查认证', 'v1.0', 1, 0, NOW(), NOW(), 0, 1
FROM `hrm_sop` s
WHERE s.`sop_title` = '申报前税负风险检查SOP' AND s.`deleted` = 0
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_course` c WHERE c.`course_title` = '申报前税负风险检查课' AND c.`deleted` = 0)
LIMIT 1;

INSERT INTO `hrm_training_material`
(`course_id`, `material_type`, `material_name`, `material_content`, `duration_minutes`, `sort_order`, `required_material`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'ARTICLE', '交接前必须确认的四张清单',
       CONCAT(
         '1. 客户基础信息清单: 公司名称、税号、联系人、服务项目。', '\n',
         '2. 资料清单: 执照、法人身份证、开户许可证、税务账号、历史账套。', '\n',
         '3. 销售承诺清单: 收费周期、服务边界、已承诺事项。', '\n',
         '4. 风险清单: 缺资料、历史账异常、客户特殊要求。'
       ),
       15, 1, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '新客户交接与资料收集课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_material` m WHERE m.`course_id` = c.`id` AND m.`material_name` = '交接前必须确认的四张清单' AND m.`deleted` = 0);

INSERT INTO `hrm_training_material`
(`course_id`, `material_type`, `material_name`, `material_content`, `duration_minutes`, `sort_order`, `required_material`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'ARTICLE', '投诉升级与复盘模板',
       '投诉记录必须包含: 时间、客户诉求、影响范围、证据、责任环节、处理方案、责任人、完成时间、客户确认结果。重复投诉必须进入周复盘,并转化为 SOP 修订或培训任务。',
       12, 1, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '客户投诉处理与复盘课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_material` m WHERE m.`course_id` = c.`id` AND m.`material_name` = '投诉升级与复盘模板' AND m.`deleted` = 0);

INSERT INTO `hrm_training_material`
(`course_id`, `material_type`, `material_name`, `material_content`, `duration_minutes`, `sort_order`, `required_material`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'ARTICLE', '申报前风险检查清单',
       '申报前至少检查: 销项/进项与账务是否一致、税负与上月/同期是否异常、未认证发票、异常抵扣、连续零申报、逾期风险、申报回执归档。',
       15, 1, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '申报前税负风险检查课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_material` m WHERE m.`course_id` = c.`id` AND m.`material_name` = '申报前风险检查清单' AND m.`deleted` = 0);

INSERT INTO `hrm_training_exam_question`
(`course_id`, `question_type`, `question_title`, `options_json`, `answer_json`, `analysis`, `score`, `sort_order`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'SINGLE', '新客户交接时,销售已承诺事项应该如何处理?',
       '[{"key":"A","label":"口头记住即可"},{"key":"B","label":"同步到客户档案并标记交付边界"},{"key":"C","label":"等客户投诉后再核对"},{"key":"D","label":"只告诉会计不用留痕"}]',
       '"B"', '承诺事项必须留痕,否则后续交付边界不清。', 20, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '新客户交接与资料收集课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_exam_question` q WHERE q.`course_id` = c.`id` AND q.`question_title` LIKE '新客户交接时,%' AND q.`deleted` = 0);

INSERT INTO `hrm_training_exam_question`
(`course_id`, `question_type`, `question_title`, `options_json`, `answer_json`, `analysis`, `score`, `sort_order`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'MULTIPLE', '资料缺失时,正确动作包括哪些?',
       '[{"key":"A","label":"标记缺失资料"},{"key":"B","label":"明确责任人与截止时间"},{"key":"C","label":"先假装齐全继续交付"},{"key":"D","label":"同步负责人风险提醒"}]',
       '["A","B","D"]', '缺失资料不能假装齐全,必须形成责任和截止时间。', 30, 2, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '新客户交接与资料收集课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_exam_question` q WHERE q.`course_id` = c.`id` AND q.`question_title` LIKE '资料缺失时,%' AND q.`deleted` = 0);

INSERT INTO `hrm_training_exam_question`
(`course_id`, `question_type`, `question_title`, `options_json`, `answer_json`, `analysis`, `score`, `sort_order`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'JUDGE', '重大客户投诉需要在30分钟内判断是否升级主管。',
       '[{"key":"true","label":"正确"},{"key":"false","label":"错误"}]',
       '"true"', '投诉升级的关键是及时判断严重程度,避免拖成更大风险。', 20, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '客户投诉处理与复盘课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_exam_question` q WHERE q.`course_id` = c.`id` AND q.`question_title` LIKE '重大客户投诉需要%' AND q.`deleted` = 0);

INSERT INTO `hrm_training_exam_question`
(`course_id`, `question_type`, `question_title`, `options_json`, `answer_json`, `analysis`, `score`, `sort_order`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'SINGLE', '申报前发现税负较上月明显波动,第一步应该做什么?',
       '[{"key":"A","label":"直接申报"},{"key":"B","label":"写明原因并提交负责人复核"},{"key":"C","label":"删除异常凭证"},{"key":"D","label":"等客户来问再解释"}]',
       '"B"', '税负异常必须先解释并复核,不能直接跳过。', 25, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '申报前税负风险检查课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_exam_question` q WHERE q.`course_id` = c.`id` AND q.`question_title` LIKE '申报前发现税负%' AND q.`deleted` = 0);

INSERT INTO `hrm_training_exam_question`
(`course_id`, `question_type`, `question_title`, `answer_json`, `analysis`, `score`, `scoring_standard`, `sort_order`, `enabled`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT c.`id`, 'THINKING', '请写出你会如何把一次重复发生的问题转化为 SOP 优化和复训任务。',
       '"参考答案: 先还原问题发生环节,找到责任点和检查缺口;再修订 SOP 步骤/检查标准;最后给相关岗位分配课程和考核,未通过进入复训。"',
       '思考题由管理者按完整性、可执行性、闭环意识人工评分。', 50,
       '满分要点: 1. 还原问题与责任环节; 2. 修订 SOP 或课程内容; 3. 分配相关岗位学习; 4. 考核与复训闭环; 5. 记录改进结果。',
       3, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_course` c
WHERE c.`course_title` = '新客户交接与资料收集课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_exam_question` q WHERE q.`course_id` = c.`id` AND q.`question_title` LIKE '请写出你会如何把一次重复发生的问题%' AND q.`deleted` = 0);

INSERT INTO `hrm_training_path`
(`path_name`, `applicable_position`, `description`, `required_path`, `enabled`, `version_no`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT '会计新人上岗训练路径', '会计', '从客户交接、做账、报税风险检查到回款协同的新人必修路径。', 1, 1, 'v1.0', NOW(), NOW(), 0, 1
WHERE NOT EXISTS (SELECT 1 FROM `hrm_training_path` WHERE `path_name` = '会计新人上岗训练路径' AND `deleted` = 0);

INSERT INTO `hrm_training_path_course`
(`path_id`, `course_id`, `course_title`, `sort_order`, `required_course`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT p.`id`, c.`id`, c.`course_title`, 1, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_path` p, `hrm_training_course` c
WHERE p.`path_name` = '会计新人上岗训练路径'
  AND c.`course_title` = '新客户交接与资料收集课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_path_course` pc WHERE pc.`path_id` = p.`id` AND pc.`course_id` = c.`id` AND pc.`deleted` = 0);

INSERT INTO `hrm_training_path_course`
(`path_id`, `course_id`, `course_title`, `sort_order`, `required_course`, `create_time`, `update_time`, `deleted`, `tenant_id`)
SELECT p.`id`, c.`id`, c.`course_title`, 2, 1, NOW(), NOW(), 0, 1
FROM `hrm_training_path` p, `hrm_training_course` c
WHERE p.`path_name` = '会计新人上岗训练路径'
  AND c.`course_title` = '申报前税负风险检查课'
  AND NOT EXISTS (SELECT 1 FROM `hrm_training_path_course` pc WHERE pc.`path_id` = p.`id` AND pc.`course_id` = c.`id` AND pc.`deleted` = 0);
