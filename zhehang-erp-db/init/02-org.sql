SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 组织架构模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 岗位表
-- -----------------------------------------------------------
CREATE TABLE `org_post` (
  `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '岗位ID',
  `post_code`        VARCHAR(64)  NOT NULL                COMMENT '岗位编码',
  `post_name`        VARCHAR(100) NOT NULL                COMMENT '岗位名称',
  `sort`             INT          DEFAULT 0               COMMENT '排序',
  `status`           TINYINT(1)   DEFAULT 0               COMMENT '状态（0正常 1禁用）',
  `headcount`        INT          DEFAULT 0               COMMENT '编制人数',
  `responsibilities` TEXT         DEFAULT NULL            COMMENT '岗位职责',
  `remark`           VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`        BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`        BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`          TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`        BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_code` (`post_code`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位表';

-- -----------------------------------------------------------
-- 2. 员工档案表
-- -----------------------------------------------------------
CREATE TABLE `org_employee` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '员工ID',
  `user_id`           BIGINT       DEFAULT NULL            COMMENT '关联用户ID',
  `emp_code`          VARCHAR(32)  NOT NULL                COMMENT '员工工号',
  `name`              VARCHAR(64)  NOT NULL                COMMENT '姓名',
  `gender`            TINYINT(1)   DEFAULT 0               COMMENT '性别（0男 1女）',
  `birth_date`        DATE         DEFAULT NULL            COMMENT '出生日期',
  `id_card`           VARCHAR(18)  DEFAULT NULL            COMMENT '身份证号',
  `phone`             VARCHAR(20)  DEFAULT NULL            COMMENT '手机号',
  `email`             VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
  `address`           VARCHAR(300) DEFAULT NULL            COMMENT '通讯地址',
  `dept_id`           BIGINT       DEFAULT NULL            COMMENT '部门ID',
  `post_id`           BIGINT       DEFAULT NULL            COMMENT '岗位ID',
  `hire_date`         DATE         DEFAULT NULL            COMMENT '入职日期',
  `regular_date`      DATE         DEFAULT NULL            COMMENT '转正日期',
  `contract_start`    DATE         DEFAULT NULL            COMMENT '合同开始日期',
  `contract_end`      DATE         DEFAULT NULL            COMMENT '合同结束日期',
  `education`         VARCHAR(32)  DEFAULT NULL            COMMENT '学历',
  `university`        VARCHAR(100) DEFAULT NULL            COMMENT '毕业院校',
  `major`             VARCHAR(100) DEFAULT NULL            COMMENT '专业',
  `emergency_contact` VARCHAR(64)  DEFAULT NULL            COMMENT '紧急联系人',
  `emergency_phone`   VARCHAR(20)  DEFAULT NULL            COMMENT '紧急联系人电话',
  `status`            TINYINT      DEFAULT 1               COMMENT '状态（1在职 2试用 3离职）',
  `remark`            VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`         BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`         BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`           TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`         BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_code` (`emp_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_dept_id` (`dept_id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_status` (`status`),
  KEY `idx_hire_date` (`hire_date`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工档案表';

-- -----------------------------------------------------------
-- 3. 人事异动表
-- -----------------------------------------------------------
CREATE TABLE `org_transfer` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '异动ID',
  `employee_id`    BIGINT       NOT NULL                COMMENT '员工ID',
  `transfer_type`  TINYINT      NOT NULL                COMMENT '异动类型（1入职 2转正 3调岗 4晋升 5离职）',
  `from_dept_id`   BIGINT       DEFAULT NULL            COMMENT '原部门ID',
  `to_dept_id`     BIGINT       DEFAULT NULL            COMMENT '新部门ID',
  `from_post_id`   BIGINT       DEFAULT NULL            COMMENT '原岗位ID',
  `to_post_id`     BIGINT       DEFAULT NULL            COMMENT '新岗位ID',
  `reason`         VARCHAR(500) DEFAULT NULL            COMMENT '异动原因',
  `effective_date` DATE         DEFAULT NULL            COMMENT '生效日期',
  `status`         TINYINT(1)   DEFAULT 0               COMMENT '状态（0待审批 1已通过 2已拒绝）',
  `approver_id`    BIGINT       DEFAULT NULL            COMMENT '审批人ID',
  `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`      BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`      BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`        TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`      BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_transfer_type` (`transfer_type`),
  KEY `idx_effective_date` (`effective_date`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人事异动表';
