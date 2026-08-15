SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 浙杭集团ERP系统 - 业务中台迁移脚本 V3
-- 适用模块：提单系统 / 财务核对 / 合同管理 / 任务中心 / 渠道管理
-- 说明：本脚本基于 V2_pool_system.sql 之后执行，包含 17 张业务中台表
-- 标准审计字段：id BIGINT PK AI, create_by, create_time, update_by, update_time, deleted DEFAULT 0
-- ============================================================

USE `zhehang_erp`;

-- ============================================================
-- 【提单系统】1. 订单主表 biz_order
-- ============================================================
CREATE TABLE `biz_order` (
  `id`                    BIGINT        NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no`              VARCHAR(32)   NOT NULL                COMMENT '订单编号(TD-YYYYMMDD-001)',
  `customer_id`           BIGINT        DEFAULT NULL            COMMENT '关联客户ID(crm_lead.id)',
  `submitter_id`          BIGINT        DEFAULT NULL            COMMENT '提单人ID',
  `submit_time`           DATETIME      DEFAULT NULL            COMMENT '提单时间',
  `status`                VARCHAR(20)   DEFAULT 'draft'         COMMENT '状态(draft/pending_approval/pending_finance/rejected/completed/cancelled)',
  `total_amount`          DECIMAL(12,2) DEFAULT 0.00            COMMENT '服务总金额',
  `discount_rate`         DECIMAL(5,2)  DEFAULT 100.00          COMMENT '整单折扣(%)',
  `final_amount`          DECIMAL(12,2) DEFAULT 0.00            COMMENT '折后金额',
  `deposit_amount`        DECIMAL(12,2) DEFAULT 0.00            COMMENT '已收定金',
  `pending_amount`        DECIMAL(12,2) DEFAULT 0.00            COMMENT '待收金额',
  `payment_method`        VARCHAR(20)   DEFAULT NULL            COMMENT '付款方式(lump_sum/monthly/quarterly/semi_annual/annual/installment)',
  `payment_time_req`      VARCHAR(20)   DEFAULT NULL            COMMENT '付款时间要求',
  `commission_rate`       DECIMAL(5,2)  DEFAULT NULL            COMMENT '提成比例(%)',
  `commission_amount`     DECIMAL(12,2) DEFAULT NULL            COMMENT '提成金额(参考)',
  `confirm_method`        VARCHAR(20)   DEFAULT NULL            COMMENT '客户确认方式(wechat/phone/meeting/email)',
  `confirm_screenshot`    VARCHAR(500)  DEFAULT NULL            COMMENT '确认截图URL',
  `expected_sign_date`    DATE          DEFAULT NULL            COMMENT '预计签约日期',
  `special_agreement`     TEXT          DEFAULT NULL            COMMENT '客户特殊约定',
  `approver_id`           BIGINT        DEFAULT NULL            COMMENT '主管审批人ID',
  `approval_time`         DATETIME      DEFAULT NULL            COMMENT '审批时间',
  `approval_opinion`      TEXT          DEFAULT NULL            COMMENT '审批意见',
  `finance_confirmer_id`  BIGINT        DEFAULT NULL            COMMENT '财务确认人ID',
  `finance_confirm_time`  DATETIME      DEFAULT NULL            COMMENT '财务确认时间',
  `finance_opinion`       TEXT          DEFAULT NULL            COMMENT '财务意见',
  `remark`                TEXT          DEFAULT NULL            COMMENT '备注',
  `create_by`             BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`           DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`             BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`           DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`               TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`             BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_submitter_id` (`submitter_id`),
  KEY `idx_approver_id` (`approver_id`),
  KEY `idx_finance_confirmer_id` (`finance_confirmer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_submit_time` (`submit_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单主表(提单)';

-- ============================================================
-- 【提单系统】2. 服务子项表 biz_order_item
-- ============================================================
CREATE TABLE `biz_order_item` (
  `id`                  BIGINT        NOT NULL AUTO_INCREMENT COMMENT '子项ID',
  `item_no`             VARCHAR(32)   NOT NULL                COMMENT '子项编号(TD-001-01)',
  `order_id`            BIGINT        NOT NULL                COMMENT '关联主订单ID',
  `service_type`        VARCHAR(30)   NOT NULL                COMMENT '服务类型(bookkeeping/registration/tax_planning/qualification/audit/cancellation/other)',
  `service_period`      VARCHAR(20)   DEFAULT NULL            COMMENT '服务周期(1month/3month/6month/1year/2year/3year/one_time)',
  `start_date`          DATE          DEFAULT NULL            COMMENT '服务开始日',
  `end_date`            DATE          DEFAULT NULL            COMMENT '服务到期日(自动计算)',
  `description`         TEXT          DEFAULT NULL            COMMENT '服务内容描述',
  `special_requirement` TEXT          DEFAULT NULL            COMMENT '特殊服务要求',
  `amount`              DECIMAL(12,2) DEFAULT 0.00            COMMENT '服务金额',
  `discount_rate`       DECIMAL(5,2)  DEFAULT 100.00          COMMENT '子项折扣(%)',
  `final_amount`        DECIMAL(12,2) DEFAULT 0.00            COMMENT '折后金额',
  `item_status`         VARCHAR(20)   DEFAULT 'pending'       COMMENT '子项状态(pending/in_progress/completed/paused)',
  `address_resource_id` BIGINT        DEFAULT NULL            COMMENT '关联挂靠地址资源ID(可空)',
  `create_by`           BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`         DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`           BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`         DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`             TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`           BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_item_no` (`item_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_address_resource_id` (`address_resource_id`),
  KEY `idx_item_status` (`item_status`),
  KEY `idx_service_type` (`service_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单服务子项表';

-- ============================================================
-- 【提单系统】3. 审批记录表 biz_order_approval
-- ============================================================
CREATE TABLE `biz_order_approval` (
  `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '审批记录ID',
  `order_id`     BIGINT       NOT NULL                COMMENT '关联订单ID',
  `node_type`    VARCHAR(20)  NOT NULL                COMMENT '审批节点(manager_approval/finance_confirm)',
  `approver_id`  BIGINT       DEFAULT NULL            COMMENT '审批人ID',
  `action`       VARCHAR(20)  DEFAULT NULL            COMMENT '动作(approve/reject)',
  `opinion`      TEXT         DEFAULT NULL            COMMENT '审批意见',
  `action_time`  DATETIME     DEFAULT NULL            COMMENT '操作时间',
  `create_by`    BIGINT       DEFAULT NULL            COMMENT '创建人',
  `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`    BIGINT       DEFAULT NULL            COMMENT '更新人',
  `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`      TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`    BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_approver_id` (`approver_id`),
  KEY `idx_node_type` (`node_type`),
  KEY `idx_action_time` (`action_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单审批记录表';

-- ============================================================
-- 【财务核对】4. 收款记录表 biz_receipt
-- ============================================================
CREATE TABLE `biz_receipt` (
  `id`              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '收款ID',
  `receipt_no`      VARCHAR(32)   NOT NULL                COMMENT '收款编号(SK-YYYYMMDD-001)',
  `order_id`        BIGINT        DEFAULT NULL            COMMENT '关联订单ID',
  `customer_id`     BIGINT        DEFAULT NULL            COMMENT '关联客户ID',
  `status`          VARCHAR(20)   DEFAULT 'pending'       COMMENT '状态(pending/confirmed/partial/refunding/bad_debt)',
  `expected_amount` DECIMAL(12,2) DEFAULT 0.00            COMMENT '应收金额',
  `actual_amount`   DECIMAL(12,2) DEFAULT 0.00            COMMENT '实收金额',
  `payment_method`  VARCHAR(20)   DEFAULT NULL            COMMENT '收款方式(bank_transfer/alipay/wechat/cash/pos/other)',
  `payment_account` VARCHAR(100)  DEFAULT NULL            COMMENT '收款账户',
  `payer_name`      VARCHAR(100)  DEFAULT NULL            COMMENT '付款方名称',
  `payer_account`   VARCHAR(100)  DEFAULT NULL            COMMENT '付款账号',
  `received_time`   DATETIME      DEFAULT NULL            COMMENT '到账时间',
  `voucher_url`     VARCHAR(500)  DEFAULT NULL            COMMENT '到账凭证URL',
  `difference_note` TEXT          DEFAULT NULL            COMMENT '差额说明',
  `reviewer_id`     BIGINT        DEFAULT NULL            COMMENT '财务审核人ID',
  `review_time`     DATETIME      DEFAULT NULL            COMMENT '审核时间',
  `review_opinion`  TEXT          DEFAULT NULL            COMMENT '审核意见',
  `is_booked`       VARCHAR(10)   DEFAULT 'no'            COMMENT '是否入账(yes/no)',
  `book_category`   VARCHAR(50)   DEFAULT NULL            COMMENT '入账科目',
  `create_by`       BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`       BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`         TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`       BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_receipt_no` (`receipt_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_received_time` (`received_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款记录表';

-- ============================================================
-- 【财务核对】5. 收款计划表(分期) biz_receipt_plan
-- ============================================================
CREATE TABLE `biz_receipt_plan` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '收款计划ID',
  `receipt_id`     BIGINT        DEFAULT NULL            COMMENT '关联收款记录ID',
  `order_id`       BIGINT        NOT NULL                COMMENT '关联订单ID',
  `plan_no`        INT           NOT NULL                COMMENT '第几期',
  `plan_amount`    DECIMAL(12,2) DEFAULT 0.00            COMMENT '计划金额',
  `plan_date`      DATE          DEFAULT NULL            COMMENT '计划收款日期',
  `actual_amount`  DECIMAL(12,2) DEFAULT NULL            COMMENT '实际收款金额',
  `actual_date`    DATE          DEFAULT NULL            COMMENT '实际收款日期',
  `status`         VARCHAR(20)   DEFAULT 'pending'       COMMENT '状态(pending/paid/overdue/overdue_7/overdue_15/overdue_30/overdue_60)',
  `reminder_sent`  TINYINT       DEFAULT 0               COMMENT '是否已提醒(0否/1是)',
  `create_by`      BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`      BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`        TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`      BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_receipt_id` (`receipt_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_plan_date` (`plan_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款计划表(分期)';

-- ============================================================
-- 【财务核对】6. 发票管理表 biz_invoice
-- ============================================================
CREATE TABLE `biz_invoice` (
  `id`             BIGINT        NOT NULL AUTO_INCREMENT COMMENT '发票ID',
  `receipt_id`     BIGINT        DEFAULT NULL            COMMENT '关联收款ID',
  `order_id`       BIGINT        DEFAULT NULL            COMMENT '关联订单ID',
  `customer_id`    BIGINT        DEFAULT NULL            COMMENT '关联客户ID',
  `invoice_type`   VARCHAR(20)   DEFAULT NULL            COMMENT '发票类型(special_vat/general_vat/electronic)',
  `invoice_amount` DECIMAL(12,2) DEFAULT 0.00            COMMENT '发票金额',
  `invoice_no`     VARCHAR(50)   DEFAULT NULL            COMMENT '发票号码',
  `invoice_date`   DATE          DEFAULT NULL            COMMENT '开票日期',
  `express_no`     VARCHAR(50)   DEFAULT NULL            COMMENT '快递单号',
  `status`         VARCHAR(20)   DEFAULT 'pending'       COMMENT '状态(pending/issued/sent/received/cancelled)',
  `create_by`      BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`      BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`        TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`      BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_receipt_id` (`receipt_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发票管理表';

-- ============================================================
-- 【合同管理】7. 合同表 biz_contract
-- ============================================================
CREATE TABLE `biz_contract` (
  `id`                   BIGINT        NOT NULL AUTO_INCREMENT COMMENT '合同ID',
  `contract_no`          VARCHAR(32)   NOT NULL                COMMENT '合同编号(HT-YYYYMMDD-001)',
  `order_id`             BIGINT        DEFAULT NULL            COMMENT '关联订单ID',
  `customer_id`          BIGINT        DEFAULT NULL            COMMENT '关联客户ID',
  `template_id`          BIGINT        DEFAULT NULL            COMMENT '合同模板ID',
  `status`               VARCHAR(20)   DEFAULT 'draft'         COMMENT '状态(draft/pending_sign/effective/executing/expiring/expired/renewed/terminated)',
  `version`              INT           DEFAULT 1               COMMENT '合同版本',
  `party_a`              VARCHAR(200)  DEFAULT NULL            COMMENT '甲方(客户)',
  `party_b`              VARCHAR(200)  DEFAULT NULL            COMMENT '乙方(我方)',
  `service_content`      TEXT          DEFAULT NULL            COMMENT '服务内容与范围',
  `service_period`       VARCHAR(100)  DEFAULT NULL            COMMENT '服务期限',
  `total_amount`         DECIMAL(12,2) DEFAULT 0.00            COMMENT '服务总金额',
  `amount_detail`        TEXT          DEFAULT NULL            COMMENT '各子项金额明细(JSON)',
  `payment_terms`        TEXT          DEFAULT NULL            COMMENT '付款方式条款',
  `breach_clause`        TEXT          DEFAULT NULL            COMMENT '违约责任',
  `confidential_clause`  TEXT          DEFAULT NULL            COMMENT '保密条款',
  `other_terms`          TEXT          DEFAULT NULL            COMMENT '其他约定',
  `our_signer_id`        BIGINT        DEFAULT NULL            COMMENT '我方签署人ID',
  `our_sign_date`        DATE          DEFAULT NULL            COMMENT '我方签署日期',
  `customer_signer`      VARCHAR(100)  DEFAULT NULL            COMMENT '客户签署人',
  `customer_sign_date`   DATE          DEFAULT NULL            COMMENT '客户签署日期',
  `sign_method`          VARCHAR(20)   DEFAULT NULL            COMMENT '签署方式(esign/offline/mail)',
  `contract_file_url`    VARCHAR(500)  DEFAULT NULL            COMMENT '合同PDF URL',
  `start_date`           DATE          DEFAULT NULL            COMMENT '合同开始日',
  `end_date`             DATE          DEFAULT NULL            COMMENT '合同到期日',
  `renewal_intention`    VARCHAR(20)   DEFAULT NULL            COMMENT '续签意向(not_contacted/interested/not_interested/pending)',
  `renewal_follower_id`  BIGINT        DEFAULT NULL            COMMENT '续签跟进人ID',
  `termination_reason`   TEXT          DEFAULT NULL            COMMENT '终止原因',
  `create_by`            BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`          DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`            BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`              TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`            BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_contract_no` (`contract_no`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_our_signer_id` (`our_signer_id`),
  KEY `idx_renewal_follower_id` (`renewal_follower_id`),
  KEY `idx_status` (`status`),
  KEY `idx_end_date` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同表';

-- ============================================================
-- 【合同管理】8. 合同模板表 biz_contract_template
-- ============================================================
CREATE TABLE `biz_contract_template` (
  `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `name`         VARCHAR(100) NOT NULL                COMMENT '模板名称',
  `service_type` VARCHAR(30)  DEFAULT NULL            COMMENT '适用服务类型',
  `content`      TEXT         DEFAULT NULL            COMMENT '模板内容(支持变量)',
  `variables`    TEXT         DEFAULT NULL            COMMENT '可用变量列表(JSON)',
  `is_active`    TINYINT      DEFAULT 1               COMMENT '是否启用(0禁用/1启用)',
  `sort_order`   INT          DEFAULT 0               COMMENT '排序',
  `create_by`    BIGINT       DEFAULT NULL            COMMENT '创建人',
  `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`    BIGINT       DEFAULT NULL            COMMENT '更新人',
  `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`      TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`    BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_service_type` (`service_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同模板表';

-- ============================================================
-- 【任务中心】9. 任务主表 biz_task
-- ============================================================
CREATE TABLE `biz_task` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `task_no`         VARCHAR(32)  NOT NULL                COMMENT '任务编号(RW-YYYYMMDD-001)',
  `contract_id`     BIGINT       DEFAULT NULL            COMMENT '关联合同ID',
  `customer_id`     BIGINT       DEFAULT NULL            COMMENT '关联客户ID',
  `order_id`        BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `task_name`       VARCHAR(200) NOT NULL                COMMENT '任务名称',
  `task_type`       VARCHAR(10)  DEFAULT NULL            COMMENT '类型(A/B/C/D)',
  `task_subtype`    VARCHAR(50)  DEFAULT NULL            COMMENT '子类型(bookkeeping_init/tax_registration等)',
  `status`          VARCHAR(20)  DEFAULT 'unassigned'    COMMENT '状态(unassigned/assigned/in_progress/pending_review/completed/overdue/paused)',
  `priority`        VARCHAR(10)  DEFAULT 'medium'        COMMENT '优先级(urgent/high/medium/low)',
  `assigner_id`     BIGINT       DEFAULT NULL            COMMENT '指派人ID',
  `executor_id`     BIGINT       DEFAULT NULL            COMMENT '执行人ID',
  `assign_time`     DATETIME     DEFAULT NULL            COMMENT '指派时间',
  `planned_start`   DATE         DEFAULT NULL            COMMENT '计划开始日',
  `planned_end`     DATE         DEFAULT NULL            COMMENT '计划完成日',
  `actual_start`    DATE         DEFAULT NULL            COMMENT '实际开始日',
  `actual_end`      DATE         DEFAULT NULL            COMMENT '实际完成日',
  `description`     TEXT         DEFAULT NULL            COMMENT '任务描述',
  `standards`       TEXT         DEFAULT NULL            COMMENT '执行标准',
  `deliverables`    TEXT         DEFAULT NULL            COMMENT '客户交付物',
  `reviewer_id`     BIGINT       DEFAULT NULL            COMMENT '验收人ID',
  `review_result`   VARCHAR(20)  DEFAULT NULL            COMMENT '验收结果(pass/fail/rework)',
  `review_opinion`  TEXT         DEFAULT NULL            COMMENT '验收意见',
  `satisfaction`    VARCHAR(10)  DEFAULT NULL            COMMENT '客户满意度(satisfied/normal/unsatisfied/not_rated)',
  `parent_task_id`  BIGINT       DEFAULT NULL            COMMENT '父任务ID(C类子任务用)',
  `period_config`   TEXT         DEFAULT NULL            COMMENT '周期配置(B类用,JSON)',
  `create_by`       BIGINT       DEFAULT NULL            COMMENT '创建人',
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`       BIGINT       DEFAULT NULL            COMMENT '更新人',
  `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`         TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`       BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_task_no` (`task_no`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_assigner_id` (`assigner_id`),
  KEY `idx_executor_id` (`executor_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_parent_task_id` (`parent_task_id`),
  KEY `idx_status` (`status`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_planned_end` (`planned_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务主表';

-- ============================================================
-- 【任务中心】10. 客户交接记录表 biz_task_handover
-- ============================================================
CREATE TABLE `biz_task_handover` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '交接记录ID',
  `handover_no`    VARCHAR(32)  NOT NULL                COMMENT '交接编号',
  `contract_id`    BIGINT       DEFAULT NULL            COMMENT '关联合同ID',
  `customer_id`    BIGINT       DEFAULT NULL            COMMENT '关联客户ID',
  `sales_id`       BIGINT       DEFAULT NULL            COMMENT '销售(移交方)ID',
  `accountant_id`  BIGINT       DEFAULT NULL            COMMENT '会计(接收方)ID',
  `status`         VARCHAR(20)  DEFAULT 'pending'       COMMENT '状态(pending/in_progress/completed/overdue)',
  `deadline`       DATE         DEFAULT NULL            COMMENT '交接截止日',
  `completed_time` DATETIME     DEFAULT NULL            COMMENT '完成时间',
  `note`           TEXT         DEFAULT NULL            COMMENT '备注',
  `create_by`      BIGINT       DEFAULT NULL            COMMENT '创建人',
  `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`      BIGINT       DEFAULT NULL            COMMENT '更新人',
  `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`        TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`      BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_handover_no` (`handover_no`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_sales_id` (`sales_id`),
  KEY `idx_accountant_id` (`accountant_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户交接记录表';

-- ============================================================
-- 【任务中心】11. 交接清单明细表 biz_task_handover_item
-- ============================================================
CREATE TABLE `biz_task_handover_item` (
  `id`                   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '清单明细ID',
  `handover_id`          BIGINT       DEFAULT NULL            COMMENT '关联交接记录ID',
  `item_order`           INT          DEFAULT 0               COMMENT '序号',
  `item_name`            VARCHAR(100) NOT NULL                COMMENT '交接项目名称',
  `is_required`          TINYINT      DEFAULT 1               COMMENT '是否必须(0否/1是)',
  `description`          VARCHAR(200) DEFAULT NULL            COMMENT '说明',
  `file_url`             VARCHAR(500) DEFAULT NULL            COMMENT '上传文件URL',
  `sales_status`         VARCHAR(20)  DEFAULT NULL            COMMENT '销售标记(provided/pending_supply)',
  `supply_expected_date` DATE         DEFAULT NULL            COMMENT '预计补齐时间',
  `accountant_status`    VARCHAR(20)  DEFAULT NULL            COMMENT '会计确认(confirmed/rejected)',
  `reject_reason`        VARCHAR(200) DEFAULT NULL            COMMENT '不合格原因',
  `create_by`            BIGINT       DEFAULT NULL            COMMENT '创建人',
  `create_time`          DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`            BIGINT       DEFAULT NULL            COMMENT '更新人',
  `update_time`          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`              TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`            BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_handover_id` (`handover_id`),
  KEY `idx_sales_status` (`sales_status`),
  KEY `idx_accountant_status` (`accountant_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交接清单明细表';

-- ============================================================
-- 【任务中心】12. 提成结算单表 biz_commission
-- ============================================================
CREATE TABLE `biz_commission` (
  `id`                   BIGINT        NOT NULL AUTO_INCREMENT COMMENT '提成结算单ID',
  `commission_no`        VARCHAR(32)   NOT NULL                COMMENT '结算单号(TC-YYYYMM-001)',
  `settle_month`         VARCHAR(10)   NOT NULL                COMMENT '结算月份(2026-01)',
  `sales_id`             BIGINT        DEFAULT NULL            COMMENT '结算销售ID',
  `order_ids`            TEXT          DEFAULT NULL            COMMENT '可结算订单ID列表(JSON)',
  `detail`               TEXT          DEFAULT NULL            COMMENT '提成明细(JSON)',
  `gross_amount`         DECIMAL(12,2) DEFAULT 0.00            COMMENT '应发提成总额',
  `deduct_amount`        DECIMAL(12,2) DEFAULT 0.00            COMMENT '退款扣回金额',
  `net_amount`           DECIMAL(12,2) DEFAULT 0.00            COMMENT '实发提成金额',
  `status`               VARCHAR(20)   DEFAULT 'pending_sales' COMMENT '状态(pending_sales/pending_manager/pending_finance/pending_boss/paid/rejected)',
  `sales_confirm_time`   DATETIME      DEFAULT NULL            COMMENT '销售确认时间',
  `manager_review_time`  DATETIME      DEFAULT NULL            COMMENT '主管复核时间',
  `finance_confirm_time` DATETIME      DEFAULT NULL            COMMENT '财务确认时间',
  `boss_approve_time`    DATETIME      DEFAULT NULL            COMMENT '老板审批时间',
  `payment_voucher_url`  VARCHAR(500)  DEFAULT NULL            COMMENT '发放凭证URL',
  `create_by`            BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`          DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`            BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`              TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`            BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_commission_no` (`commission_no`),
  KEY `idx_sales_id` (`sales_id`),
  KEY `idx_status` (`status`),
  KEY `idx_settle_month` (`settle_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提成结算单表';

-- ============================================================
-- 【任务中心】13. 客户满意度回访表 biz_satisfaction
-- ============================================================
CREATE TABLE `biz_satisfaction` (
  `id`                  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '回访ID',
  `visit_no`            VARCHAR(32)  NOT NULL                COMMENT '回访编号',
  `customer_id`         BIGINT       DEFAULT NULL            COMMENT '关联客户ID',
  `contract_id`         BIGINT       DEFAULT NULL            COMMENT '关联合同ID',
  `visit_type`          VARCHAR(20)  DEFAULT NULL            COMMENT '回访类型(first_service/3month/6month/12month/complaint/manual)',
  `visit_time`          DATETIME     DEFAULT NULL            COMMENT '回访时间',
  `visitor_id`          BIGINT       DEFAULT NULL            COMMENT '回访人ID',
  `visit_method`        VARCHAR(20)  DEFAULT NULL            COMMENT '方式(phone/wechat/meeting)',
  `score`               INT          DEFAULT NULL            COMMENT '满意度评分(1-5)',
  `evaluation`          TEXT         DEFAULT NULL            COMMENT '服务评价(JSON数组)',
  `problems`            TEXT         DEFAULT NULL            COMMENT '存在问题',
  `suggestions`         TEXT         DEFAULT NULL            COMMENT '改进建议',
  `willing_referral`    VARCHAR(10)  DEFAULT NULL            COMMENT '是否愿意转介绍(yes/no/considering)',
  `follow_up_items`     TEXT         DEFAULT NULL            COMMENT '后续跟进事项',
  `escalation_task_id`  BIGINT       DEFAULT NULL            COMMENT '升级任务ID(不满意时自动创建)',
  `create_by`           BIGINT       DEFAULT NULL            COMMENT '创建人',
  `create_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`           BIGINT       DEFAULT NULL            COMMENT '更新人',
  `update_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`             TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`           BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_visit_no` (`visit_no`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_visitor_id` (`visitor_id`),
  KEY `idx_escalation_task_id` (`escalation_task_id`),
  KEY `idx_visit_time` (`visit_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户满意度回访表';

-- ============================================================
-- 【渠道管理】14. 供应商信息表 biz_supplier
-- ============================================================
CREATE TABLE `biz_supplier` (
  `id`                       BIGINT        NOT NULL AUTO_INCREMENT COMMENT '供应商ID',
  `supplier_no`              VARCHAR(32)   NOT NULL                COMMENT '供应商编号(GY-YYYYMMDD-001)',
  `name`                     VARCHAR(200)  NOT NULL                COMMENT '供应商名称',
  `short_name`               VARCHAR(50)   DEFAULT NULL            COMMENT '简称',
  `status`                   VARCHAR(20)   DEFAULT 'active'        COMMENT '合作状态(active/paused/terminated/potential)',
  `contact_name`             VARCHAR(50)   DEFAULT NULL            COMMENT '对接人姓名',
  `contact_phone`            VARCHAR(20)   DEFAULT NULL            COMMENT '对接人电话',
  `contact_wechat`           VARCHAR(50)   DEFAULT NULL            COMMENT '对接人微信',
  `address`                  VARCHAR(300)  DEFAULT NULL            COMMENT '供应商地址',
  `supply_regions`           TEXT          DEFAULT NULL            COMMENT '可供应区域(JSON数组)',
  `detail_addresses`         TEXT          DEFAULT NULL            COMMENT '详细地址列表(JSON)',
  `total_address_count`      INT           DEFAULT 0               COMMENT '地址总数',
  `available_count`          INT           DEFAULT 0               COMMENT '剩余可用',
  `price_annual`             DECIMAL(10,2) DEFAULT NULL            COMMENT '合作价格(年付)',
  `price_semi_annual`        DECIMAL(10,2) DEFAULT NULL            COMMENT '半年付',
  `price_quarterly`          DECIMAL(10,2) DEFAULT NULL            COMMENT '季付',
  `min_contract_years`       INT           DEFAULT NULL            COMMENT '最低签约年限',
  `has_rebate`               TINYINT       DEFAULT 0               COMMENT '是否有返点(0否/1是)',
  `rebate_rate`              DECIMAL(5,2)  DEFAULT NULL            COMMENT '返点比例(%)',
  `rebate_cycle`             VARCHAR(20)   DEFAULT NULL            COMMENT '返点结算周期(quarterly/annual/per_order)',
  `payment_method`           VARCHAR(20)   DEFAULT NULL            COMMENT '付款方式(prepaid/monthly/quarterly/per_order)',
  `credit_days`              INT           DEFAULT NULL            COMMENT '账期天数',
  `cooperation_contract_no`  VARCHAR(50)   DEFAULT NULL            COMMENT '合作合同编号',
  `cooperation_start`        DATE          DEFAULT NULL            COMMENT '合作开始日',
  `cooperation_end`          DATE          DEFAULT NULL            COMMENT '合作到期日',
  `renewal_terms`            TEXT          DEFAULT NULL            COMMENT '续约条件',
  `supplier_level`           VARCHAR(10)   DEFAULT 'C'             COMMENT '供应商等级(A/B/C)',
  `remark`                   TEXT          DEFAULT NULL            COMMENT '备注',
  `create_by`                BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`              DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`                BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`              DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`                  TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`                BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_no` (`supplier_no`),
  KEY `idx_status` (`status`),
  KEY `idx_supplier_level` (`supplier_level`),
  KEY `idx_cooperation_end` (`cooperation_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='供应商信息表';

-- ============================================================
-- 【渠道管理】15. 挂靠地址资源表 biz_address_resource
-- ============================================================
CREATE TABLE `biz_address_resource` (
  `id`              BIGINT        NOT NULL AUTO_INCREMENT COMMENT '资源ID',
  `resource_no`     VARCHAR(32)   NOT NULL                COMMENT '资源编号(ZY-YYYYMMDD-001)',
  `supplier_id`     BIGINT        DEFAULT NULL            COMMENT '关联供应商ID',
  `procurement_id`  BIGINT        DEFAULT NULL            COMMENT '关联采购单ID',
  `address`         VARCHAR(300)  NOT NULL                COMMENT '具体挂靠地址',
  `region`          VARCHAR(20)   DEFAULT NULL            COMMENT '所属区域',
  `purchase_price`  DECIMAL(10,2) DEFAULT NULL            COMMENT '采购单价(元/年)',
  `suggested_price` DECIMAL(10,2) DEFAULT NULL            COMMENT '建议销售价',
  `status`          VARCHAR(20)   DEFAULT 'available'     COMMENT '状态(available/reserved/sold/expired/abnormal)',
  `customer_id`     BIGINT        DEFAULT NULL            COMMENT '关联客户ID(已售出时)',
  `contract_id`     BIGINT        DEFAULT NULL            COMMENT '关联合同ID(已售出时)',
  `stock_in_date`   DATE          DEFAULT NULL            COMMENT '入库日期',
  `sold_date`       DATE          DEFAULT NULL            COMMENT '售出日期',
  `expire_date`     DATE          DEFAULT NULL            COMMENT '到期日期',
  `create_by`       BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`       BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`         TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`       BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_resource_no` (`resource_no`),
  KEY `idx_supplier_id` (`supplier_id`),
  KEY `idx_procurement_id` (`procurement_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expire_date` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='挂靠地址资源表';

-- ============================================================
-- 【渠道管理】16. 采购订单表 biz_procurement
-- ============================================================
CREATE TABLE `biz_procurement` (
  `id`                  BIGINT        NOT NULL AUTO_INCREMENT COMMENT '采购单ID',
  `procurement_no`      VARCHAR(32)   NOT NULL                COMMENT '采购单号(CG-YYYYMMDD-001)',
  `supplier_id`         BIGINT        DEFAULT NULL            COMMENT '关联供应商ID',
  `buyer_id`            BIGINT        DEFAULT NULL            COMMENT '采购人员ID',
  `purchase_date`       DATE          DEFAULT NULL            COMMENT '采购日期',
  `status`              VARCHAR(20)   DEFAULT 'draft'         COMMENT '状态(draft/pending_approval/approved/paid/stocked/cancelled)',
  `quantity`            INT           DEFAULT 0               COMMENT '采购数量',
  `unit_price`          DECIMAL(10,2) DEFAULT NULL            COMMENT '采购单价',
  `payment_cycle`       VARCHAR(20)   DEFAULT NULL            COMMENT '付款周期(annual/semi_annual/quarterly)',
  `total_amount`        DECIMAL(12,2) DEFAULT 0.00            COMMENT '采购总金额',
  `actual_paid`         DECIMAL(12,2) DEFAULT 0.00            COMMENT '实际付款金额(考虑返点)',
  `address_detail`      TEXT          DEFAULT NULL            COMMENT '挂靠地址明细(一行一个)',
  `purchase_note`       TEXT          DEFAULT NULL            COMMENT '采购说明',
  `approver_id`         BIGINT        DEFAULT NULL            COMMENT '审批人ID',
  `approval_time`       DATETIME      DEFAULT NULL            COMMENT '审批时间',
  `approval_opinion`    TEXT          DEFAULT NULL            COMMENT '审批意见',
  `payment_status`      VARCHAR(20)   DEFAULT 'pending'       COMMENT '付款状态(pending/paid/partial/credit)',
  `payment_date`        DATE          DEFAULT NULL            COMMENT '实际付款日期',
  `payment_voucher_url` VARCHAR(500)  DEFAULT NULL            COMMENT '付款凭证URL',
  `supplier_confirmed`  TINYINT       DEFAULT 0               COMMENT '供应商收款确认(0否/1是)',
  `create_by`           BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`         DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`           BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`         DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`             TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`           BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_procurement_no` (`procurement_no`),
  KEY `idx_supplier_id` (`supplier_id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_approver_id` (`approver_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_purchase_date` (`purchase_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购订单表';

-- ============================================================
-- 【渠道管理】17. 渠道投放记录表 biz_channel_cost
-- ============================================================
CREATE TABLE `biz_channel_cost` (
  `id`            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '投放记录ID',
  `cost_no`       VARCHAR(32)   NOT NULL                COMMENT '投放编号(TF-YYYYMM-001)',
  `channel`       VARCHAR(30)   NOT NULL                COMMENT '投放渠道(baidu/douyin/xiaohongshu/58/seo/other)',
  `invest_month`  VARCHAR(10)   NOT NULL                COMMENT '投放月份(2026-01)',
  `invest_amount` DECIMAL(12,2) DEFAULT 0.00            COMMENT '投放费用',
  `impressions`   INT           DEFAULT 0               COMMENT '展示次数',
  `clicks`        INT           DEFAULT 0               COMMENT '点击次数',
  `leads_count`   INT           DEFAULT 0               COMMENT '线索数量',
  `recorder_id`   BIGINT        DEFAULT NULL            COMMENT '录入人员ID',
  `remark`        TEXT          DEFAULT NULL            COMMENT '投放策略说明',
  `create_by`     BIGINT        DEFAULT NULL            COMMENT '创建人',
  `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by`     BIGINT        DEFAULT NULL            COMMENT '更新人',
  `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted`       TINYINT(1)    DEFAULT 0               COMMENT '逻辑删除(0未删/1已删)',
  `tenant_id`     BIGINT        DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cost_no` (`cost_no`),
  KEY `idx_channel` (`channel`),
  KEY `idx_invest_month` (`invest_month`),
  KEY `idx_recorder_id` (`recorder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='渠道投放记录表';

-- ============================================================
-- 初始数据：合同模板 5 条
-- ============================================================
INSERT INTO `biz_contract_template` (`name`, `service_type`, `content`, `variables`, `is_active`, `sort_order`) VALUES
('代理记账服务合同',  'bookkeeping',
 '甲方：${party_a}\n乙方：${party_b}\n服务内容：代理记账、纳税申报、税务咨询。\n服务期限：${start_date} 至 ${end_date}。\n服务费：人民币 ${total_amount} 元。\n付款方式：${payment_terms}。\n违约责任：见附则。',
 '["party_a","party_b","start_date","end_date","total_amount","payment_terms"]', 1, 1),
('工商注册服务合同',  'registration',
 '甲方：${party_a}\n乙方：${party_b}\n服务内容：公司名称核准、章程起草、工商登记、刻章、银行开户协助。\n服务期限：自合同签订日起 ${service_period}。\n服务费：人民币 ${total_amount} 元。\n付款方式：${payment_terms}。',
 '["party_a","party_b","service_period","total_amount","payment_terms"]', 1, 2),
('税务筹划服务合同',  'tax_planning',
 '甲方：${party_a}\n乙方：${party_b}\n服务内容：税务诊断、税收优惠申请、节税方案设计与落地。\n服务期限：${start_date} 至 ${end_date}。\n服务费：人民币 ${total_amount} 元。\n保密条款：双方对涉税信息严格保密。',
 '["party_a","party_b","start_date","end_date","total_amount"]', 1, 3),
('资质代办服务合同',  'qualification',
 '甲方：${party_a}\n乙方：${party_b}\n服务内容：资质材料整理、申报、审批跟进。\n服务期限：自合同签订日起至资质取得之日。\n服务费：人民币 ${total_amount} 元，分阶段支付：${payment_terms}。',
 '["party_a","party_b","total_amount","payment_terms"]', 1, 4),
('综合服务合同',      'other',
 '甲方：${party_a}\n乙方：${party_b}\n服务内容：${service_content}\n服务期限：${start_date} 至 ${end_date}。\n服务总金额：人民币 ${total_amount} 元。\n金额明细：${amount_detail}\n付款方式：${payment_terms}。\n其他约定：${other_terms}',
 '["party_a","party_b","service_content","start_date","end_date","total_amount","amount_detail","payment_terms","other_terms"]', 1, 5);

-- ============================================================
-- 初始数据：交接清单标准项 10 条 (handover_id=NULL 作为模板项, 创建交接时 COPY)
-- ============================================================
INSERT INTO `biz_task_handover_item` (`handover_id`, `item_order`, `item_name`, `is_required`, `description`, `sales_status`, `accountant_status`) VALUES
(NULL, 1,  '营业执照副本扫描件',     1, '需要清晰彩色扫描件，包含统一社会信用代码', NULL, NULL),
(NULL, 2,  '法人身份证正反面',        1, '法定代表人身份证正反面照片',                NULL, NULL),
(NULL, 3,  '公司章程',                1, '加盖公章的公司章程电子版',                  NULL, NULL),
(NULL, 4,  '银行开户许可证/基本户信息', 1, '基本账户开户许可证或开户证明',              NULL, NULL),
(NULL, 5,  '税务登记信息',            1, '税务登记证、办税员信息、电子税务局账号',    NULL, NULL),
(NULL, 6,  '社保公积金账户信息',      0, '社保公积金账号、密码及缴费基数',            NULL, NULL),
(NULL, 7,  '历史财务报表',            1, '近三年资产负债表、利润表、现金流量表',      NULL, NULL),
(NULL, 8,  '历史纳税申报表',          1, '近12个月增值税、企业所得税申报表',          NULL, NULL),
(NULL, 9,  '电子发票/税控盘信息',     0, '税控盘、发票领购簿、电子发票账号',          NULL, NULL),
(NULL, 10, '客户特殊需求说明',        0, '销售记录的客户特殊业务需求与服务约定',      NULL, NULL);

-- ============================================================
-- 迁移脚本结束 V3
-- ============================================================
