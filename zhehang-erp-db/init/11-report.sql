SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭企服ERP系统 - 报表模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 报表定义表
-- -----------------------------------------------------------
CREATE TABLE `report_definition` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '报表ID',
    `name` VARCHAR(200) NOT NULL COMMENT '报表名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '报表描述',
    `type` TINYINT DEFAULT 1 COMMENT '类型：1表格 2图表 3指标卡 4混合',
    `config` JSON DEFAULT NULL COMMENT '报表配置（数据源、字段映射、图表配置）',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1启用 2停用',
    `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开：0否 1是',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_type` (`type`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报表定义表';

-- -----------------------------------------------------------
-- 2. 数据集表
-- -----------------------------------------------------------
CREATE TABLE `report_dataset` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '数据集ID',
    `name` VARCHAR(200) NOT NULL COMMENT '数据集名称',
    `datasource_type` TINYINT DEFAULT 1 COMMENT '数据源类型：1模块数据 2自定义SQL',
    `sql_content` TEXT DEFAULT NULL COMMENT 'SQL内容',
    `params` JSON DEFAULT NULL COMMENT '参数配置',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_datasource_type` (`datasource_type`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据集表';

-- -----------------------------------------------------------
-- 3. 报表订阅表
-- -----------------------------------------------------------
CREATE TABLE `report_schedule` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订阅ID',
    `report_id` BIGINT NOT NULL COMMENT '报表ID',
    `cron_expression` VARCHAR(50) DEFAULT NULL COMMENT 'Cron表达式',
    `recipients` VARCHAR(500) DEFAULT NULL COMMENT '接收人ID列表，逗号分隔',
    `channel` TINYINT DEFAULT 1 COMMENT '推送渠道：1邮件 2站内信',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1启用 2停用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_report_id` (`report_id`),
    KEY `idx_status` (`status`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报表订阅表';
