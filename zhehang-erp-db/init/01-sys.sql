SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 系统管理模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 用户表
-- -----------------------------------------------------------
CREATE TABLE `sys_user` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username`    VARCHAR(64)  NOT NULL                COMMENT '用户名',
  `password`    VARCHAR(200) NOT NULL                COMMENT '密码（BCrypt加密）',
  `nickname`    VARCHAR(64)  DEFAULT NULL            COMMENT '昵称',
  `email`       VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
  `phone`       VARCHAR(20)  DEFAULT NULL            COMMENT '手机号',
  `sex`         TINYINT(1)   DEFAULT 0               COMMENT '性别（0男 1女）',
  `avatar`      VARCHAR(500) DEFAULT NULL            COMMENT '头像URL',
  `status`      TINYINT(1)   DEFAULT 0               COMMENT '状态（0正常 1禁用）',
  `login_ip`    VARCHAR(128) DEFAULT NULL            COMMENT '最后登录IP',
  `login_date`  DATETIME     DEFAULT NULL            COMMENT '最后登录时间',
  `dept_id`     BIGINT       DEFAULT NULL            COMMENT '部门ID',
  `remark`      VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_dept_id` (`dept_id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------
-- 2. 角色表
-- -----------------------------------------------------------
CREATE TABLE `sys_role` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name`   VARCHAR(64)  NOT NULL                COMMENT '角色名称',
  `role_key`    VARCHAR(100) NOT NULL                COMMENT '角色标识',
  `sort`        INT          DEFAULT 0               COMMENT '排序',
  `status`      TINYINT(1)   DEFAULT 0               COMMENT '状态（0正常 1禁用）',
  `data_scope`  TINYINT      DEFAULT 1               COMMENT '数据范围（1全部 2自定义 3本部门 4本部门及以下 5本人）',
  `remark`      VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_key` (`role_key`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- -----------------------------------------------------------
-- 3. 菜单表
-- -----------------------------------------------------------
CREATE TABLE `sys_menu` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `menu_name`   VARCHAR(64)  NOT NULL                COMMENT '菜单名称',
  `parent_id`   BIGINT       DEFAULT 0               COMMENT '父菜单ID',
  `sort`        INT          DEFAULT 0               COMMENT '排序',
  `path`        VARCHAR(200) DEFAULT NULL            COMMENT '路由地址',
  `component`   VARCHAR(200) DEFAULT NULL            COMMENT '组件路径',
  `menu_type`   CHAR(1)      DEFAULT 'C'             COMMENT '菜单类型（M目录 C菜单 F按钮）',
  `visible`     TINYINT(1)   DEFAULT 1               COMMENT '是否可见（1显示 0隐藏）',
  `status`      TINYINT(1)   DEFAULT 0               COMMENT '状态（0正常 1禁用）',
  `perms`       VARCHAR(200) DEFAULT NULL            COMMENT '权限标识',
  `icon`        VARCHAR(100) DEFAULT NULL            COMMENT '菜单图标',
  `remark`      VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表';

-- -----------------------------------------------------------
-- 4. 部门表
-- -----------------------------------------------------------
CREATE TABLE `sys_dept` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `parent_id`   BIGINT       DEFAULT 0               COMMENT '父部门ID',
  `ancestors`   VARCHAR(500) DEFAULT ''              COMMENT '祖级列表',
  `dept_name`   VARCHAR(64)  NOT NULL                COMMENT '部门名称',
  `sort`        INT          DEFAULT 0               COMMENT '排序',
  `leader`      VARCHAR(64)  DEFAULT NULL            COMMENT '负责人',
  `phone`       VARCHAR(20)  DEFAULT NULL            COMMENT '联系电话',
  `email`       VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
  `status`      TINYINT(1)   DEFAULT 0               COMMENT '状态（0正常 1禁用）',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- -----------------------------------------------------------
-- 5. 用户角色关联表
-- -----------------------------------------------------------
CREATE TABLE `sys_user_role` (
  `id`      BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL                COMMENT '用户ID',
  `role_id` BIGINT NOT NULL                COMMENT '角色ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
  KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- -----------------------------------------------------------
-- 6. 角色菜单关联表
-- -----------------------------------------------------------
CREATE TABLE `sys_role_menu` (
  `id`      BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `role_id` BIGINT NOT NULL                COMMENT '角色ID',
  `menu_id` BIGINT NOT NULL                COMMENT '菜单ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_menu` (`role_id`, `menu_id`),
  KEY `idx_menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表';

-- -----------------------------------------------------------
-- 7. 登录日志表
-- -----------------------------------------------------------
CREATE TABLE `sys_login_log` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `username`       VARCHAR(64)  DEFAULT NULL            COMMENT '用户名',
  `ip_address`     VARCHAR(128) DEFAULT NULL            COMMENT '登录IP',
  `login_location` VARCHAR(200) DEFAULT NULL            COMMENT '登录地点',
  `browser`        VARCHAR(100) DEFAULT NULL            COMMENT '浏览器',
  `os`             VARCHAR(100) DEFAULT NULL            COMMENT '操作系统',
  `status`         TINYINT(1)   DEFAULT 0               COMMENT '状态（0成功 1失败）',
  `msg`            VARCHAR(500) DEFAULT NULL            COMMENT '提示消息',
  `login_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_login_time` (`login_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- -----------------------------------------------------------
-- 8. 操作日志表
-- -----------------------------------------------------------
CREATE TABLE `sys_oper_log` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `module`         VARCHAR(64)   DEFAULT NULL            COMMENT '模块名称',
  `business_type`  TINYINT       DEFAULT 0               COMMENT '业务类型（0其他 1新增 2修改 3删除 4导出）',
  `method`         VARCHAR(200)  DEFAULT NULL            COMMENT '方法名称',
  `request_method` VARCHAR(10)   DEFAULT NULL            COMMENT '请求方式',
  `oper_type`      TINYINT       DEFAULT 0               COMMENT '操作类别',
  `oper_name`      VARCHAR(64)   DEFAULT NULL            COMMENT '操作人员',
  `dept_name`      VARCHAR(64)   DEFAULT NULL            COMMENT '部门名称',
  `oper_url`       VARCHAR(500)  DEFAULT NULL            COMMENT '请求URL',
  `oper_ip`        VARCHAR(128)  DEFAULT NULL            COMMENT '操作IP',
  `oper_param`     TEXT          DEFAULT NULL            COMMENT '请求参数',
  `json_result`    TEXT          DEFAULT NULL            COMMENT '返回结果',
  `status`         TINYINT(1)    DEFAULT 0               COMMENT '状态（0成功 1异常）',
  `error_msg`      VARCHAR(2000) DEFAULT NULL            COMMENT '错误消息',
  `oper_time`      DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_module` (`module`),
  KEY `idx_business_type` (`business_type`),
  KEY `idx_oper_time` (`oper_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- -----------------------------------------------------------
-- 9. 异常日志表
-- -----------------------------------------------------------
CREATE TABLE `sys_error_log` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `exception_type` VARCHAR(200)  DEFAULT NULL            COMMENT '异常类型',
  `message`        VARCHAR(2000) DEFAULT NULL            COMMENT '异常消息',
  `stack_trace`    TEXT          DEFAULT NULL            COMMENT '堆栈信息',
  `request_url`    VARCHAR(500)  DEFAULT NULL            COMMENT '请求URL',
  `request_method` VARCHAR(10)   DEFAULT NULL            COMMENT '请求方式',
  `create_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_exception_type` (`exception_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='异常日志表';

-- -----------------------------------------------------------
-- 10. 通知消息表
-- -----------------------------------------------------------
CREATE TABLE `sys_notification` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `title`       VARCHAR(200) NOT NULL                COMMENT '通知标题',
  `content`     TEXT         DEFAULT NULL            COMMENT '通知内容',
  `type`        TINYINT      DEFAULT 1               COMMENT '类型（1系统 2审批 3任务）',
  `sender_id`   BIGINT       DEFAULT NULL            COMMENT '发送人ID',
  `receiver_id` BIGINT       NOT NULL                COMMENT '接收人ID',
  `is_read`     TINYINT(1)   DEFAULT 0               COMMENT '是否已读（0未读 1已读）',
  `read_time`   DATETIME     DEFAULT NULL            COMMENT '阅读时间',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知消息表';

-- -----------------------------------------------------------
-- 11. 通知模板表
-- -----------------------------------------------------------
CREATE TABLE `sys_notice_template` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `template_code` VARCHAR(100) NOT NULL                COMMENT '模板编码',
  `template_name` VARCHAR(200) NOT NULL                COMMENT '模板名称',
  `content`       TEXT         DEFAULT NULL            COMMENT '模板内容',
  `channel`       TINYINT      DEFAULT 1               COMMENT '发送渠道（1站内信 2邮件 3短信 4企微）',
  `status`        TINYINT(1)   DEFAULT 0               COMMENT '状态（0正常 1禁用）',
  `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_code` (`template_code`),
  KEY `idx_channel` (`channel`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';
