SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 项目管理模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 项目表
-- -----------------------------------------------------------
CREATE TABLE `pm_project` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '项目ID',
    `name` VARCHAR(200) NOT NULL COMMENT '项目名称',
    `code` VARCHAR(50) NOT NULL COMMENT '项目编号',
    `type` TINYINT DEFAULT 1 COMMENT '项目类型：1代理记账 2税务筹划 3审计服务 4其他',
    `customer_id` BIGINT DEFAULT NULL COMMENT '客户ID',
    `manager_id` BIGINT DEFAULT NULL COMMENT '项目经理ID',
    `start_date` DATE DEFAULT NULL COMMENT '开始日期',
    `end_date` DATE DEFAULT NULL COMMENT '结束日期',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1规划中 2进行中 3已暂停 4已完成 5已取消',
    `budget` DECIMAL(14,2) DEFAULT NULL COMMENT '预算金额',
    `actual_cost` DECIMAL(14,2) DEFAULT NULL COMMENT '实际成本',
    `progress` TINYINT DEFAULT 0 COMMENT '进度百分比',
    `description` TEXT DEFAULT NULL COMMENT '项目描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_manager_id` (`manager_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- -----------------------------------------------------------
-- 2. 任务表
-- -----------------------------------------------------------
CREATE TABLE `pm_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父任务ID',
    `name` VARCHAR(200) NOT NULL COMMENT '任务名称',
    `assignee_id` BIGINT DEFAULT NULL COMMENT '负责人ID',
    `start_date` DATE DEFAULT NULL COMMENT '开始日期',
    `end_date` DATE DEFAULT NULL COMMENT '截止日期',
    `priority` TINYINT DEFAULT 2 COMMENT '优先级：1低 2中 3高 4紧急',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待办 2进行中 3待审核 4已完成',
    `progress` TINYINT DEFAULT 0 COMMENT '进度百分比',
    `estimated_hours` DECIMAL(8,1) DEFAULT NULL COMMENT '预估工时',
    `actual_hours` DECIMAL(8,1) DEFAULT NULL COMMENT '实际工时',
    `description` TEXT DEFAULT NULL COMMENT '任务描述',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_assignee_id` (`assignee_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目任务表';

-- -----------------------------------------------------------
-- 3. 里程碑表
-- -----------------------------------------------------------
CREATE TABLE `pm_milestone` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '里程碑ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `name` VARCHAR(200) NOT NULL COMMENT '里程碑名称',
    `target_date` DATE DEFAULT NULL COMMENT '目标日期',
    `actual_date` DATE DEFAULT NULL COMMENT '实际完成日期',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待完成 2已完成 3已延期',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目里程碑表';

-- -----------------------------------------------------------
-- 4. 工时表
-- -----------------------------------------------------------
CREATE TABLE `pm_timesheet` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '工时ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `task_id` BIGINT DEFAULT NULL COMMENT '任务ID',
    `employee_id` BIGINT NOT NULL COMMENT '员工ID',
    `work_date` DATE NOT NULL COMMENT '工作日期',
    `hours` DECIMAL(4,1) NOT NULL COMMENT '工时（小时）',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '工作内容描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_employee_id` (`employee_id`),
    KEY `idx_work_date` (`work_date`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目工时表';

-- -----------------------------------------------------------
-- 5. 项目文档表
-- -----------------------------------------------------------
CREATE TABLE `pm_doc` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文档ID',
    `project_id` BIGINT NOT NULL COMMENT '项目ID',
    `title` VARCHAR(200) NOT NULL COMMENT '文档标题',
    `file_url` VARCHAR(500) NOT NULL COMMENT '文件地址',
    `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
    `uploader_id` BIGINT DEFAULT NULL COMMENT '上传人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_uploader_id` (`uploader_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目文档表';
