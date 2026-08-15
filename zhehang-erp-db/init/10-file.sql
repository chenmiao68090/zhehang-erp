SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 文件管理与知识库模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 文件夹表
-- -----------------------------------------------------------
CREATE TABLE `file_folder` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文件夹ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父文件夹ID',
    `name` VARCHAR(200) NOT NULL COMMENT '文件夹名称',
    `path` VARCHAR(500) DEFAULT NULL COMMENT '完整路径',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `permission_type` TINYINT DEFAULT 1 COMMENT '权限类型：1公开 2私有 3指定人员',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件夹表';

-- -----------------------------------------------------------
-- 2. 文件信息表
-- -----------------------------------------------------------
CREATE TABLE `file_info` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文件ID',
    `folder_id` BIGINT DEFAULT NULL COMMENT '文件夹ID',
    `name` VARCHAR(200) NOT NULL COMMENT '文件显示名称',
    `original_name` VARCHAR(200) DEFAULT NULL COMMENT '原始文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '存储路径',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
    `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
    `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
    `download_count` INT DEFAULT 0 COMMENT '下载次数',
    `current_version` INT DEFAULT 1 COMMENT '当前版本号',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_folder_id` (`folder_id`),
    KEY `idx_file_type` (`file_type`),
    KEY `idx_create_time` (`create_time`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件信息表';

-- -----------------------------------------------------------
-- 3. 文件版本表
-- -----------------------------------------------------------
CREATE TABLE `file_version` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '版本ID',
    `file_id` BIGINT NOT NULL COMMENT '文件ID',
    `version` INT NOT NULL COMMENT '版本号',
    `file_path` VARCHAR(500) NOT NULL COMMENT '版本文件路径',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
    `change_log` VARCHAR(500) DEFAULT NULL COMMENT '变更说明',
    `uploader_id` BIGINT DEFAULT NULL COMMENT '上传人ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_file_id` (`file_id`),
    KEY `idx_version` (`file_id`, `version`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件版本表';

-- -----------------------------------------------------------
-- 4. 知识分类表
-- -----------------------------------------------------------
CREATE TABLE `kb_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID',
    `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识分类表';

-- -----------------------------------------------------------
-- 5. 知识文章表
-- -----------------------------------------------------------
CREATE TABLE `kb_article` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '文章ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `content` LONGTEXT DEFAULT NULL COMMENT '内容',
    `content_type` TINYINT DEFAULT 1 COMMENT '内容类型：1富文本 2Markdown',
    `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签，逗号分隔',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `like_count` INT DEFAULT 0 COMMENT '点赞次数',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1草稿 2已发布 3已归档',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0否 1是',
    `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`),
    KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文章表';
