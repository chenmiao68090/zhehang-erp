-- ============================================================
-- V13: 订单/合同/任务 表结构对齐实体(打通业务闭环后半段)
-- 背景:biz_order / biz_contract / biz_task 由 V3_business_platform.sql 建表,
--       但 Service 层(BizOrderServiceImpl/BizContractServiceImpl/BizTaskServiceImpl)
--       使用的实体(BizOrder/BizContract/BizTask)字段与表列是两套不同模型,
--       MyBatis-Plus 按实体字段生成SQL → 列不存在 → /order|/contract|/task/page 全 code=500,
--       前端只能用 localStorage 假数据。这是闭环后半段(签约→派单)跑不通的根因。
-- 处理:把这三张表对齐为"实体结构"(实体=代码真正使用的契约;V3表的富字段无任何代码引用)。
--       表当前为空(0行),零数据风险。V3 原始DDL仍保留在 V3_business_platform.sql 备查。
-- 安全/幂等:仅当"旧结构标记列存在 且 表为空"时才 DROP;CREATE 用 IF NOT EXISTS。
--           重跑时标记列已不存在 → 不 DROP、不重建;若表已有数据 → 不 DROP。
-- ============================================================

USE `zhehang_erp`;

-- ---------- biz_order ----------
SET @old := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_order' AND COLUMN_NAME='submitter_id');
SET @empty := (SELECT IFNULL((SELECT COUNT(*) FROM information_schema.TABLES
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_order'),0));
SET @cnt := IF(@empty=0, 0, (SELECT COUNT(*) FROM biz_order));
SET @ddl := IF(@old>0 AND @cnt=0, 'DROP TABLE `biz_order`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_order` (
  `id`                   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `order_no`             VARCHAR(64)  DEFAULT NULL            COMMENT '订单编号',
  `customer_id`          BIGINT       DEFAULT NULL            COMMENT '客户ID',
  `customer_name`        VARCHAR(128) DEFAULT NULL            COMMENT '客户名称',
  `opportunity_id`       BIGINT       DEFAULT NULL            COMMENT '关联商机ID',
  `order_type`           VARCHAR(32)  DEFAULT NULL            COMMENT '订单类型',
  `service_type`         VARCHAR(64)  DEFAULT NULL            COMMENT '服务类型',
  `total_amount`         DECIMAL(14,2) DEFAULT NULL           COMMENT '订单总额',
  `discount_amount`      DECIMAL(14,2) DEFAULT NULL           COMMENT '优惠金额',
  `payable_amount`       DECIMAL(14,2) DEFAULT NULL           COMMENT '应付金额',
  `service_start_date`   DATE         DEFAULT NULL            COMMENT '服务开始日',
  `service_end_date`     DATE         DEFAULT NULL            COMMENT '服务结束日',
  `salesman_id`          BIGINT       DEFAULT NULL            COMMENT '销售人ID',
  `salesman_name`        VARCHAR(64)  DEFAULT NULL            COMMENT '销售人姓名',
  `dept_id`              BIGINT       DEFAULT NULL            COMMENT '归属部门ID',
  `status`               INT          DEFAULT NULL            COMMENT '状态',
  `submit_time`          DATETIME     DEFAULT NULL            COMMENT '提交时间',
  `approve_time`         DATETIME     DEFAULT NULL            COMMENT '审批时间',
  `finance_confirm_time` DATETIME     DEFAULT NULL            COMMENT '财务确认时间',
  `cancel_time`          DATETIME     DEFAULT NULL            COMMENT '取消时间',
  `cancel_reason`        VARCHAR(500) DEFAULT NULL            COMMENT '取消原因',
  `attachments`          VARCHAR(1000) DEFAULT NULL           COMMENT '附件',
  `remark`               VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`          DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`          DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`            BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`            BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`              TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`            BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_order_customer` (`customer_id`),
  KEY `idx_order_dept` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务订单';

-- ---------- biz_contract ----------
SET @old := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract' AND COLUMN_NAME='party_a');
SET @empty := (SELECT IFNULL((SELECT COUNT(*) FROM information_schema.TABLES
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_contract'),0));
SET @cnt := IF(@empty=0, 0, (SELECT COUNT(*) FROM biz_contract));
SET @ddl := IF(@old>0 AND @cnt=0, 'DROP TABLE `biz_contract`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_contract` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `contract_no`       VARCHAR(64)  DEFAULT NULL            COMMENT '合同编号',
  `title`             VARCHAR(255) DEFAULT NULL            COMMENT '合同标题',
  `order_id`          BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `customer_id`       BIGINT       DEFAULT NULL            COMMENT '客户ID',
  `customer_name`     VARCHAR(128) DEFAULT NULL            COMMENT '客户名称',
  `template_id`       BIGINT       DEFAULT NULL            COMMENT '模板ID',
  `contract_type`     VARCHAR(32)  DEFAULT NULL            COMMENT '合同类型(new新签/renew续签)',
  `parent_id`         BIGINT       DEFAULT NULL            COMMENT '续签自合同ID',
  `amount`            DECIMAL(14,2) DEFAULT NULL           COMMENT '合同金额',
  `start_date`        DATE         DEFAULT NULL            COMMENT '生效日',
  `end_date`          DATE         DEFAULT NULL            COMMENT '到期日',
  `sign_date`         DATE         DEFAULT NULL            COMMENT '签署日',
  `status`            INT          DEFAULT NULL            COMMENT '状态(1草稿 3已发送 4已签署 7已终止)',
  `sign_mode`         VARCHAR(32)  DEFAULT NULL            COMMENT '签署方式(online/offline)',
  `signer_ours`       VARCHAR(64)  DEFAULT NULL            COMMENT '我方签署人',
  `signer_theirs`     VARCHAR(64)  DEFAULT NULL            COMMENT '对方签署人',
  `send_sign_time`    DATETIME     DEFAULT NULL            COMMENT '发起签署时间',
  `confirm_sign_time` DATETIME     DEFAULT NULL            COMMENT '确认签署时间',
  `terminate_time`    DATETIME     DEFAULT NULL            COMMENT '终止时间',
  `terminate_reason`  VARCHAR(500) DEFAULT NULL            COMMENT '终止原因',
  `content`           TEXT                                 COMMENT '合同正文',
  `attachments`       VARCHAR(1000) DEFAULT NULL           COMMENT '附件',
  `remark`            VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`       DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`       DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`         BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`         BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`           TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`         BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_contract_order` (`order_id`),
  KEY `idx_contract_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务合同';

-- ---------- biz_task ----------
SET @old := (SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_task' AND COLUMN_NAME='task_subtype');
SET @empty := (SELECT IFNULL((SELECT COUNT(*) FROM information_schema.TABLES
             WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_task'),0));
SET @cnt := IF(@empty=0, 0, (SELECT COUNT(*) FROM biz_task));
SET @ddl := IF(@old>0 AND @cnt=0, 'DROP TABLE `biz_task`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_task` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `task_no`           VARCHAR(64)  DEFAULT NULL            COMMENT '任务编号',
  `title`             VARCHAR(255) DEFAULT NULL            COMMENT '任务标题',
  `task_type`         VARCHAR(32)  DEFAULT NULL            COMMENT '任务类型(handover/service/followup/audit/other)',
  `biz_id`            BIGINT       DEFAULT NULL            COMMENT '关联业务ID(订单/合同)',
  `biz_type`          VARCHAR(32)  DEFAULT NULL            COMMENT '关联业务类型(order/contract)',
  `customer_id`       BIGINT       DEFAULT NULL            COMMENT '客户ID',
  `priority`          INT          DEFAULT NULL            COMMENT '优先级(1低 2中 3高 4紧急)',
  `executor_id`       BIGINT       DEFAULT NULL            COMMENT '执行人ID',
  `executor_name`     VARCHAR(64)  DEFAULT NULL            COMMENT '执行人姓名',
  `assigner_id`       BIGINT       DEFAULT NULL            COMMENT '指派人ID',
  `plan_start_time`   DATETIME     DEFAULT NULL            COMMENT '计划开始',
  `plan_end_time`     DATETIME     DEFAULT NULL            COMMENT '计划完成',
  `actual_start_time` DATETIME     DEFAULT NULL            COMMENT '实际开始',
  `actual_end_time`   DATETIME     DEFAULT NULL            COMMENT '实际完成',
  `status`            INT          DEFAULT NULL            COMMENT '状态(1待指派 2待执行 3执行中 4待验收 5已完成 6已驳回 7已取消)',
  `description`       TEXT                                 COMMENT '任务描述',
  `result`            TEXT                                 COMMENT '完成结果',
  `review_comment`    VARCHAR(1000) DEFAULT NULL           COMMENT '验收意见',
  `reviewer_id`       BIGINT       DEFAULT NULL            COMMENT '验收人ID',
  `review_time`       DATETIME     DEFAULT NULL            COMMENT '验收时间',
  `attachments`       VARCHAR(1000) DEFAULT NULL           COMMENT '附件',
  `remark`            VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`       DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`       DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`         BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`         BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`           TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`         BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_task_biz` (`biz_id`, `biz_type`),
  KEY `idx_task_executor` (`executor_id`),
  KEY `idx_task_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务任务';
