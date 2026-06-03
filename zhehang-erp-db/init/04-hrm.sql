SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 人事管理（HRM）模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 招聘需求表
-- -----------------------------------------------------------
CREATE TABLE `hrm_recruit` (
  `id`           BIGINT         NOT NULL AUTO_INCREMENT COMMENT '招聘ID',
  `dept_id`      BIGINT         DEFAULT NULL            COMMENT '需求部门ID',
  `post_id`      BIGINT         DEFAULT NULL            COMMENT '岗位ID',
  `title`        VARCHAR(200)   NOT NULL                COMMENT '招聘标题',
  `headcount`    INT            DEFAULT 1               COMMENT '招聘人数',
  `salary_min`   DECIMAL(10,2)  DEFAULT NULL            COMMENT '薪资下限',
  `salary_max`   DECIMAL(10,2)  DEFAULT NULL            COMMENT '薪资上限',
  `requirements` TEXT           DEFAULT NULL            COMMENT '岗位要求',
  `status`       TINYINT        DEFAULT 1               COMMENT '状态（1招聘中 2已完成 3已取消）',
  `publish_date` DATE           DEFAULT NULL            COMMENT '发布日期',
  `create_time`  DATETIME       DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`  DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`    BIGINT         DEFAULT NULL            COMMENT '创建人',
  `update_by`    BIGINT         DEFAULT NULL            COMMENT '更新人',
  `deleted`      TINYINT(1)     DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`    BIGINT         DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_dept_id` (`dept_id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_date` (`publish_date`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招聘需求表';

-- -----------------------------------------------------------
-- 2. 简历库表
-- -----------------------------------------------------------
CREATE TABLE `hrm_resume` (
  `id`               BIGINT         NOT NULL AUTO_INCREMENT COMMENT '简历ID',
  `recruit_id`       BIGINT         DEFAULT NULL            COMMENT '关联招聘需求ID',
  `name`             VARCHAR(64)    NOT NULL                COMMENT '姓名',
  `phone`            VARCHAR(20)    DEFAULT NULL            COMMENT '电话',
  `email`            VARCHAR(128)   DEFAULT NULL            COMMENT '邮箱',
  `education`        VARCHAR(32)    DEFAULT NULL            COMMENT '学历',
  `experience_years` INT            DEFAULT 0               COMMENT '工作年限',
  `current_company`  VARCHAR(200)   DEFAULT NULL            COMMENT '当前公司',
  `expected_salary`  DECIMAL(10,2)  DEFAULT NULL            COMMENT '期望薪资',
  `resume_url`       VARCHAR(500)   DEFAULT NULL            COMMENT '简历附件URL',
  `status`           TINYINT        DEFAULT 1               COMMENT '状态（1待筛选 2面试中 3已录用 4已淘汰）',
  `evaluation`       TEXT           DEFAULT NULL            COMMENT '评价',
  `create_time`      DATETIME       DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`      DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`        BIGINT         DEFAULT NULL            COMMENT '创建人',
  `update_by`        BIGINT         DEFAULT NULL            COMMENT '更新人',
  `deleted`          TINYINT(1)     DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`        BIGINT         DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_recruit_id` (`recruit_id`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历库表';

-- -----------------------------------------------------------
-- 3. 考勤记录表
-- -----------------------------------------------------------
CREATE TABLE `hrm_attendance` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '考勤ID',
  `employee_id`     BIGINT       NOT NULL                COMMENT '员工ID',
  `attendance_date` DATE         NOT NULL                COMMENT '考勤日期',
  `clock_in`        DATETIME     DEFAULT NULL            COMMENT '上班打卡时间',
  `clock_out`       DATETIME     DEFAULT NULL            COMMENT '下班打卡时间',
  `status`          TINYINT      DEFAULT 1               COMMENT '状态（1正常 2迟到 3早退 4缺勤 5请假 6加班）',
  `work_hours`      DECIMAL(5,2) DEFAULT NULL            COMMENT '工作时长（小时）',
  `remark`          VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`       BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`       BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`         TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`       BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_attendance_date` (`attendance_date`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考勤记录表';

-- -----------------------------------------------------------
-- 4. 请假记录表
-- -----------------------------------------------------------
CREATE TABLE `hrm_leave` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '请假ID',
  `employee_id` BIGINT       NOT NULL                COMMENT '员工ID',
  `leave_type`  TINYINT      NOT NULL                COMMENT '请假类型（1事假 2病假 3年假 4调休 5婚假 6产假）',
  `start_time`  DATETIME     NOT NULL                COMMENT '开始时间',
  `end_time`    DATETIME     NOT NULL                COMMENT '结束时间',
  `duration`    DECIMAL(5,1) DEFAULT 0               COMMENT '时长（天）',
  `reason`      VARCHAR(500) DEFAULT NULL            COMMENT '请假原因',
  `status`      TINYINT      DEFAULT 1               COMMENT '状态（1待审批 2已通过 3已拒绝）',
  `approver_id` BIGINT       DEFAULT NULL            COMMENT '审批人ID',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_leave_type` (`leave_type`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请假记录表';

-- -----------------------------------------------------------
-- 5. 薪资记录表
-- -----------------------------------------------------------
CREATE TABLE `hrm_salary` (
  `id`                BIGINT        NOT NULL AUTO_INCREMENT COMMENT '薪资ID',
  `employee_id`       BIGINT        NOT NULL                COMMENT '员工ID',
  `salary_month`      VARCHAR(7)    NOT NULL                COMMENT '薪资月份（yyyy-MM）',
  `base_salary`       DECIMAL(12,2) DEFAULT 0.00            COMMENT '基本工资',
  `performance_bonus` DECIMAL(12,2) DEFAULT 0.00            COMMENT '绩效奖金',
  `overtime_pay`      DECIMAL(12,2) DEFAULT 0.00            COMMENT '加班费',
  `allowance`         DECIMAL(12,2) DEFAULT 0.00            COMMENT '津贴补贴',
  `deduction`         DECIMAL(12,2) DEFAULT 0.00            COMMENT '扣款',
  `social_insurance`  DECIMAL(12,2) DEFAULT 0.00            COMMENT '社保个人部分',
  `housing_fund`      DECIMAL(12,2) DEFAULT 0.00            COMMENT '公积金个人部分',
  `tax`               DECIMAL(12,2) DEFAULT 0.00            COMMENT '个人所得税',
  `actual_salary`     DECIMAL(12,2) DEFAULT 0.00            COMMENT '实发工资',
  `status`            TINYINT       DEFAULT 1               COMMENT '状态（1待核算 2已核算 3已发放）',
  `create_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`         BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`         BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`           TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`         BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employee_month` (`employee_id`, `salary_month`),
  KEY `idx_salary_month` (`salary_month`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='薪资记录表';

-- -----------------------------------------------------------
-- 6. 绩效考核表
-- -----------------------------------------------------------
CREATE TABLE `hrm_performance` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '绩效ID',
  `employee_id`       BIGINT       NOT NULL                COMMENT '员工ID',
  `period`            VARCHAR(20)  NOT NULL                COMMENT '考核周期',
  `type`              TINYINT      DEFAULT 1               COMMENT '类型（1月度 2季度 3年度）',
  `score`             DECIMAL(5,2) DEFAULT NULL            COMMENT '综合评分',
  `level`             CHAR(1)      DEFAULT NULL            COMMENT '绩效等级（A/B/C/D/E）',
  `self_evaluation`   TEXT         DEFAULT NULL            COMMENT '自评',
  `leader_evaluation` TEXT         DEFAULT NULL            COMMENT '上级评价',
  `evaluator_id`      BIGINT       DEFAULT NULL            COMMENT '评估人ID',
  `status`            TINYINT(1)   DEFAULT 0               COMMENT '状态（0进行中 1已完成）',
  `create_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`         BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`         BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`           TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`         BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_period` (`period`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='绩效考核表';

-- -----------------------------------------------------------
-- 7. 培训记录表
-- -----------------------------------------------------------
CREATE TABLE `hrm_training` (
  `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '培训ID',
  `title`            VARCHAR(200) NOT NULL                COMMENT '培训标题',
  `trainer`          VARCHAR(64)  DEFAULT NULL            COMMENT '培训讲师',
  `start_time`       DATETIME     DEFAULT NULL            COMMENT '开始时间',
  `end_time`         DATETIME     DEFAULT NULL            COMMENT '结束时间',
  `location`         VARCHAR(200) DEFAULT NULL            COMMENT '培训地点',
  `content`          TEXT         DEFAULT NULL            COMMENT '培训内容',
  `max_participants` INT          DEFAULT 0               COMMENT '最大参与人数',
  `status`           TINYINT(1)   DEFAULT 0               COMMENT '状态（0未开始 1进行中 2已完成）',
  `create_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`        BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`        BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`          TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`        BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训记录表';
