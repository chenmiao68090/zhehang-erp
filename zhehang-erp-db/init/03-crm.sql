SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 客户管理（CRM）模块
-- ============================================================

USE `zhehang_erp`;

-- -----------------------------------------------------------
-- 1. 线索表
-- -----------------------------------------------------------
CREATE TABLE `crm_lead` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '线索ID',
  `name`        VARCHAR(100) NOT NULL                COMMENT '线索名称',
  `company`     VARCHAR(200) DEFAULT NULL            COMMENT '公司名称',
  `legal_person` VARCHAR(100) DEFAULT NULL           COMMENT '法定代表人/联系人',
  `phone`       VARCHAR(20)  DEFAULT NULL            COMMENT '电话',
  `company_phone` VARCHAR(50) DEFAULT NULL           COMMENT '企业联系电话',
  `email`       VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
  `register_status` VARCHAR(50) DEFAULT NULL         COMMENT '登记状态',
  `source`      TINYINT      DEFAULT 1               COMMENT '来源（1工商公开名单 2客户转介绍 3美团投流 4抖音投流 5线下来客 6其他投流 7名单采购/电销 8渠道合作 9私域二开 10其他）',
  `status`      TINYINT      DEFAULT 1               COMMENT '状态（1新建 2跟进中 3已转化 4无效）',
  `owner_id`    BIGINT       DEFAULT NULL            COMMENT '负责人ID',
  `enterprise_type` VARCHAR(100) DEFAULT NULL        COMMENT '企业类型',
  `paid_capital` VARCHAR(100) DEFAULT NULL           COMMENT '实缴资本',
  `approved_date` DATE DEFAULT NULL                  COMMENT '核准日期',
  `credit_code` VARCHAR(64) DEFAULT NULL             COMMENT '统一社会信用代码',
  `insured_count` VARCHAR(20) DEFAULT NULL           COMMENT '参保人数',
  `insured_year` VARCHAR(20) DEFAULT NULL            COMMENT '参保人数所属年报',
  `register_address` VARCHAR(500) DEFAULT NULL       COMMENT '注册地址',
  `latest_address` VARCHAR(500) DEFAULT NULL         COMMENT '最新地址',
  `business_scope` TEXT                              COMMENT '经营范围',
  `remark`      TEXT                                  COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_status` (`status`),
  KEY `idx_source` (`source`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='线索表';

-- -----------------------------------------------------------
-- 2. 客户表
-- -----------------------------------------------------------
CREATE TABLE `crm_customer` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '客户ID',
  `name`            VARCHAR(200) NOT NULL                COMMENT '客户名称',
  `short_name`      VARCHAR(100) DEFAULT NULL            COMMENT '客户简称',
  `industry`        VARCHAR(64)  DEFAULT NULL            COMMENT '所属行业',
  `scale`           VARCHAR(32)  DEFAULT NULL            COMMENT '企业规模',
  `source`          VARCHAR(32)  DEFAULT NULL            COMMENT '客户来源',
  `level`           CHAR(1)      DEFAULT 'C'             COMMENT '客户等级（A/B/C/D）',
  `taxpayer_type`   TINYINT      DEFAULT 1               COMMENT '纳税人类型（1一般纳税人 2小规模纳税人）',
  `credit_code`     VARCHAR(30)  DEFAULT NULL            COMMENT '统一社会信用代码',
  `address`         VARCHAR(300) DEFAULT NULL            COMMENT '地址',
  `website`         VARCHAR(200) DEFAULT NULL            COMMENT '网址',
  `status`          TINYINT(1)   DEFAULT 0               COMMENT '状态（0正常 1禁用）',
  `owner_id`        BIGINT       DEFAULT NULL            COMMENT '负责人ID',
  `service_package` VARCHAR(100) DEFAULT NULL            COMMENT '服务套餐',
  `billing_cycle`   VARCHAR(32)  DEFAULT NULL            COMMENT '账期',
  `remark`          VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`       BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`       BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`         TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`       BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_level` (`level`),
  KEY `idx_status` (`status`),
  KEY `idx_credit_code` (`credit_code`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- -----------------------------------------------------------
-- 3. 联系人表
-- -----------------------------------------------------------
CREATE TABLE `crm_contact` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '联系人ID',
  `customer_id` BIGINT       NOT NULL                COMMENT '客户ID',
  `name`        VARCHAR(64)  NOT NULL                COMMENT '姓名',
  `gender`      TINYINT(1)   DEFAULT 0               COMMENT '性别（0男 1女）',
  `position`    VARCHAR(64)  DEFAULT NULL            COMMENT '职位',
  `phone`       VARCHAR(20)  DEFAULT NULL            COMMENT '座机',
  `mobile`      VARCHAR(20)  DEFAULT NULL            COMMENT '手机',
  `email`       VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
  `wechat`      VARCHAR(64)  DEFAULT NULL            COMMENT '微信',
  `is_primary`  TINYINT(1)   DEFAULT 0               COMMENT '是否主要联系人（0否 1是）',
  `remark`      VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='联系人表';

-- -----------------------------------------------------------
-- 4. 跟进记录表
-- -----------------------------------------------------------
CREATE TABLE `crm_follow` (
  `id`           BIGINT        NOT NULL AUTO_INCREMENT COMMENT '跟进ID',
  `customer_id`  BIGINT        NOT NULL                COMMENT '客户ID',
  `contact_id`   BIGINT        DEFAULT NULL            COMMENT '联系人ID',
  `type`         TINYINT       DEFAULT 1               COMMENT '跟进方式（1电话 2拜访 3微信 4邮件）',
  `content`      TEXT          DEFAULT NULL            COMMENT '跟进内容',
  `next_time`    DATETIME      DEFAULT NULL            COMMENT '下次跟进时间',
  `next_content` VARCHAR(500)  DEFAULT NULL            COMMENT '下次跟进内容',
  `attachments`  VARCHAR(1000) DEFAULT NULL            COMMENT '附件',
  `create_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`    BIGINT        DEFAULT NULL            COMMENT '创建人',
  `update_by`    BIGINT        DEFAULT NULL            COMMENT '更新人',
  `deleted`      TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`    BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_contact_id` (`contact_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_next_time` (`next_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跟进记录表';

-- -----------------------------------------------------------
-- 5. 商机表
-- -----------------------------------------------------------
CREATE TABLE `crm_opportunity` (
  `id`            BIGINT         NOT NULL AUTO_INCREMENT COMMENT '商机ID',
  `customer_id`   BIGINT         NOT NULL                COMMENT '客户ID',
  `name`          VARCHAR(200)   NOT NULL                COMMENT '商机名称',
  `amount`        DECIMAL(15,2)  DEFAULT 0.00            COMMENT '预计金额',
  `stage`         TINYINT        DEFAULT 1               COMMENT '阶段（1初步接触 2需求确认 3方案报价 4谈判 5赢单 6输单）',
  `expected_date` DATE           DEFAULT NULL            COMMENT '预计成交日期',
  `win_rate`      TINYINT        DEFAULT 0               COMMENT '赢单率（%）',
  `owner_id`      BIGINT         DEFAULT NULL            COMMENT '负责人ID',
  `remark`        VARCHAR(500)   DEFAULT NULL            COMMENT '备注',
  `create_time`   DATETIME       DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT         DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT         DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)     DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT         DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_stage` (`stage`),
  KEY `idx_expected_date` (`expected_date`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商机表';

-- -----------------------------------------------------------
-- 6. 合同表
-- -----------------------------------------------------------
CREATE TABLE `crm_contract` (
  `id`          BIGINT         NOT NULL AUTO_INCREMENT COMMENT '合同ID',
  `customer_id` BIGINT         NOT NULL                COMMENT '客户ID',
  `contract_no` VARCHAR(64)    NOT NULL                COMMENT '合同编号',
  `title`       VARCHAR(200)   NOT NULL                COMMENT '合同标题',
  `amount`      DECIMAL(15,2)  DEFAULT 0.00            COMMENT '合同金额',
  `start_date`  DATE           DEFAULT NULL            COMMENT '开始日期',
  `end_date`    DATE           DEFAULT NULL            COMMENT '结束日期',
  `sign_date`   DATE           DEFAULT NULL            COMMENT '签约日期',
  `status`      TINYINT        DEFAULT 1               COMMENT '状态（1草稿 2审批中 3已签署 4执行中 5已完成 6已终止）',
  `content`     TEXT           DEFAULT NULL            COMMENT '合同内容',
  `attachments` VARCHAR(1000)  DEFAULT NULL            COMMENT '附件',
  `create_time` DATETIME       DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT         DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT         DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)     DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`   BIGINT         DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_contract_no` (`contract_no`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sign_date` (`sign_date`),
  KEY `idx_end_date` (`end_date`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同表';

-- -----------------------------------------------------------
-- 7. 服务工单表
-- -----------------------------------------------------------
CREATE TABLE `crm_ticket` (
  `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '工单ID',
  `customer_id`  BIGINT       NOT NULL                COMMENT '客户ID',
  `title`        VARCHAR(200) NOT NULL                COMMENT '工单标题',
  `content`      TEXT         DEFAULT NULL            COMMENT '工单内容',
  `priority`     TINYINT      DEFAULT 2               COMMENT '优先级（1低 2中 3高 4紧急）',
  `status`       TINYINT      DEFAULT 1               COMMENT '状态（1待处理 2处理中 3已解决 4已关闭）',
  `handler_id`   BIGINT       DEFAULT NULL            COMMENT '处理人ID',
  `resolve_time` DATETIME     DEFAULT NULL            COMMENT '解决时间',
  `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`    BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`    BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`      TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`    BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_handler_id` (`handler_id`),
  KEY `idx_priority` (`priority`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务工单表';

-- -----------------------------------------------------------
-- 8. 公海池表
-- -----------------------------------------------------------
CREATE TABLE `crm_pool` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '公海记录ID',
  `customer_id`   BIGINT       NOT NULL                COMMENT '客户ID',
  `return_reason` VARCHAR(500) DEFAULT NULL            COMMENT '退回原因',
  `return_time`   DATETIME     DEFAULT NULL            COMMENT '退回时间',
  `return_by`     BIGINT       DEFAULT NULL            COMMENT '退回人ID',
  `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`     BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除（0未删 1已删）',
  `tenant_id`     BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_return_time` (`return_time`),
  KEY `idx_tenant_id` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公海池表';
