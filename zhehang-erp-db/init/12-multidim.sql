SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 多维表格（MultiDim）模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 多维表格定义表
-- -----------------------------------------------------------
CREATE TABLE `multidim_table` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '表格ID',
  `name`          VARCHAR(200)  NOT NULL                COMMENT '表格名称',
  `description`   VARCHAR(500)  DEFAULT NULL            COMMENT '描述',
  `icon`          VARCHAR(50)   DEFAULT NULL            COMMENT '图标',
  `category`      VARCHAR(50)   DEFAULT NULL            COMMENT '分类',
  `field_schema`  JSON          DEFAULT NULL            COMMENT '字段定义[{id,name,type,config}]',
  `view_config`   JSON          DEFAULT NULL            COMMENT '视图配置[{id,name,type,filter,sort,group}]',
  `template_id`   BIGINT        DEFAULT NULL            COMMENT '模板ID',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多维表格定义表';

-- -----------------------------------------------------------
-- 2. 多维表格数据行表
-- -----------------------------------------------------------
CREATE TABLE `multidim_record` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `table_id`      BIGINT        NOT NULL                COMMENT '所属表格ID',
  `data`          JSON          DEFAULT NULL            COMMENT '行数据{fieldId: value}',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_table_id` (`table_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多维表格数据行表';

-- -----------------------------------------------------------
-- 3. 多维表格模板表
-- -----------------------------------------------------------
CREATE TABLE `multidim_template` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `name`          VARCHAR(200)  NOT NULL                COMMENT '模板名称',
  `category`      VARCHAR(50)   DEFAULT NULL            COMMENT '分类',
  `icon`          VARCHAR(50)   DEFAULT NULL            COMMENT '图标',
  `description`   VARCHAR(500)  DEFAULT NULL            COMMENT '描述',
  `field_schema`  JSON          DEFAULT NULL            COMMENT '字段定义',
  `view_config`   JSON          DEFAULT NULL            COMMENT '视图配置',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='多维表格模板表';
