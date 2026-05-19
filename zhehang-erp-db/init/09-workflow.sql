SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭企服ERP系统 - 工作流模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 流程定义表
-- -----------------------------------------------------------
CREATE TABLE `wf_process_def` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '流程定义ID',
    `name` VARCHAR(200) NOT NULL COMMENT '流程名称',
    `process_key` VARCHAR(100) NOT NULL COMMENT '流程标识',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '流程分类',
    `version` INT DEFAULT 1 COMMENT '版本号',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `form_config` JSON DEFAULT NULL COMMENT '表单配置',
    `process_config` JSON DEFAULT NULL COMMENT '流程配置',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1启用 2停用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_process_key_version` (`process_key`, `version`),
    KEY `idx_category` (`category`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流程定义表';

-- -----------------------------------------------------------
-- 2. 流程实例表
-- -----------------------------------------------------------
CREATE TABLE `wf_instance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '实例ID',
    `process_def_id` BIGINT NOT NULL COMMENT '流程定义ID',
    `title` VARCHAR(200) DEFAULT NULL COMMENT '流程标题',
    `initiator_id` BIGINT NOT NULL COMMENT '发起人ID',
    `form_data` JSON DEFAULT NULL COMMENT '表单数据',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1进行中 2已完成 3已撤销 4已拒绝',
    `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_process_def_id` (`process_def_id`),
    KEY `idx_initiator_id` (`initiator_id`),
    KEY `idx_status` (`status`),
    KEY `idx_start_time` (`start_time`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流程实例表';

-- -----------------------------------------------------------
-- 3. 审批任务表
-- -----------------------------------------------------------
CREATE TABLE `wf_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
    `instance_id` BIGINT NOT NULL COMMENT '流程实例ID',
    `node_name` VARCHAR(100) DEFAULT NULL COMMENT '节点名称',
    `node_type` TINYINT DEFAULT 1 COMMENT '节点类型：1审批 2抄送 3条件',
    `assignee_id` BIGINT DEFAULT NULL COMMENT '处理人ID',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1待处理 2已通过 3已拒绝 4已转交',
    `comment` VARCHAR(500) DEFAULT NULL COMMENT '审批意见',
    `handle_time` DATETIME DEFAULT NULL COMMENT '处理时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_instance_id` (`instance_id`),
    KEY `idx_assignee_id` (`assignee_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批任务表';

-- -----------------------------------------------------------
-- 4. 流程历史表
-- -----------------------------------------------------------
CREATE TABLE `wf_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '历史ID',
    `instance_id` BIGINT NOT NULL COMMENT '流程实例ID',
    `node_name` VARCHAR(100) DEFAULT NULL COMMENT '节点名称',
    `operator_id` BIGINT DEFAULT NULL COMMENT '操作人ID',
    `action` TINYINT DEFAULT NULL COMMENT '操作：1通过 2拒绝 3转交 4撤销',
    `comment` VARCHAR(500) DEFAULT NULL COMMENT '操作意见',
    `oper_time` DATETIME DEFAULT NULL COMMENT '操作时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_instance_id` (`instance_id`),
    KEY `idx_operator_id` (`operator_id`),
    KEY `idx_oper_time` (`oper_time`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流程历史表';
