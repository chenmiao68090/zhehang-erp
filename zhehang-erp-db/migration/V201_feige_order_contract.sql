-- “订单与合同”独立台账。
-- 只新增 feige_* 表，不读取或改写现有 biz_order / biz_contract / 提单数据。

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS feige_order (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_no VARCHAR(64) NOT NULL COMMENT '订单编号',
    order_date DATE NOT NULL COMMENT '订单日期',
    company_name VARCHAR(200) NOT NULL COMMENT '公司名称',
    contacts VARCHAR(100) DEFAULT NULL COMMENT '联系人',
    contact_phone VARCHAR(64) DEFAULT NULL COMMENT '联系电话',
    region VARCHAR(120) DEFAULT NULL COMMENT '所属区域',
    address VARCHAR(500) DEFAULT NULL COMMENT '详细地址',
    salesman_id BIGINT NOT NULL COMMENT '业务员用户ID',
    salesman_name VARCHAR(100) NOT NULL COMMENT '业务员姓名快照',
    dept_id BIGINT DEFAULT NULL COMMENT '归属部门ID',
    business_type VARCHAR(64) NOT NULL COMMENT '业务类型',
    opportunity_source VARCHAR(100) DEFAULT NULL COMMENT '商机来源',
    delivery_method VARCHAR(64) DEFAULT NULL COMMENT '交付方式',
    order_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '订单金额',
    contract_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '合同金额',
    final_payment_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '尾款金额',
    received_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '累计实收金额',
    collection_time DATETIME DEFAULT NULL COMMENT '最近收款时间',
    collection_account_number VARCHAR(100) DEFAULT NULL COMMENT '收款账户',
    recurring TINYINT NOT NULL DEFAULT 0 COMMENT '是否复购 0否 1是',
    voucher VARCHAR(500) DEFAULT NULL COMMENT '凭证地址',
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress' COMMENT '订单状态',
    remarks VARCHAR(1000) DEFAULT NULL COMMENT '备注',
    create_time DATETIME DEFAULT NULL,
    update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    tenant_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_feige_order_no_tenant (tenant_id, order_no),
    KEY idx_feige_order_scope (tenant_id, dept_id, salesman_id, deleted),
    KEY idx_feige_order_status_date (tenant_id, status, order_date, deleted),
    KEY idx_feige_order_company (tenant_id, company_name, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='独立订单台账';

CREATE TABLE IF NOT EXISTS feige_order_payment (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    payment_time DATETIME NOT NULL COMMENT '收款时间',
    amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '收款金额',
    payment_method VARCHAR(64) DEFAULT NULL COMMENT '收款方式',
    account_number VARCHAR(100) DEFAULT NULL COMMENT '收款账户',
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' COMMENT '收款状态',
    voucher VARCHAR(500) DEFAULT NULL COMMENT '收款凭证',
    remarks VARCHAR(1000) DEFAULT NULL COMMENT '备注',
    create_time DATETIME DEFAULT NULL,
    update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    tenant_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_feige_payment_order (tenant_id, order_id, payment_time, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单收款记录';

CREATE TABLE IF NOT EXISTS feige_order_refund (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    order_no VARCHAR(64) NOT NULL COMMENT '订单编号快照',
    company_name VARCHAR(200) NOT NULL COMMENT '公司名称快照',
    refund_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '退费金额',
    reason VARCHAR(1000) NOT NULL COMMENT '退费原因',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '退费状态',
    previous_order_status VARCHAR(32) DEFAULT NULL COMMENT '申请前订单状态',
    salesman_id BIGINT NOT NULL COMMENT '业务员用户ID',
    salesman_name VARCHAR(100) NOT NULL COMMENT '业务员姓名快照',
    dept_id BIGINT DEFAULT NULL COMMENT '归属部门ID',
    reviewer_id BIGINT DEFAULT NULL COMMENT '审核人ID',
    reviewer_name VARCHAR(100) DEFAULT NULL COMMENT '审核人姓名快照',
    review_time DATETIME DEFAULT NULL COMMENT '审核时间',
    review_comment VARCHAR(1000) DEFAULT NULL COMMENT '审核意见',
    completed_time DATETIME DEFAULT NULL COMMENT '退费完成时间',
    create_time DATETIME DEFAULT NULL,
    update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    tenant_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_feige_refund_scope (tenant_id, dept_id, salesman_id, status, deleted),
    KEY idx_feige_refund_order (tenant_id, order_id, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单退费记录';

CREATE TABLE IF NOT EXISTS feige_accounting_contract (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    contract_no VARCHAR(64) NOT NULL COMMENT '合同编号',
    order_id BIGINT DEFAULT NULL COMMENT '关联订单ID',
    order_no VARCHAR(64) DEFAULT NULL COMMENT '关联订单编号',
    company_name VARCHAR(200) NOT NULL COMMENT '公司名称',
    salesman_id BIGINT NOT NULL COMMENT '业务员用户ID',
    salesman_name VARCHAR(100) NOT NULL COMMENT '业务员姓名快照',
    dept_id BIGINT DEFAULT NULL COMMENT '归属部门ID',
    service_person_id BIGINT DEFAULT NULL COMMENT '服务人员用户ID',
    service_person_name VARCHAR(100) DEFAULT NULL COMMENT '服务人员姓名快照',
    service_staff_json JSON DEFAULT NULL COMMENT '协同服务人员JSON',
    contract_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT '合同金额',
    sign_date DATE DEFAULT NULL COMMENT '签署日期',
    expire_date DATE DEFAULT NULL COMMENT '到期日期',
    contract_status VARCHAR(32) NOT NULL DEFAULT 'draft' COMMENT '合同状态',
    loss_flag TINYINT NOT NULL DEFAULT 0 COMMENT '是否流失 0否 1是',
    loss_reason VARCHAR(1000) DEFAULT NULL COMMENT '流失原因',
    retention_measure VARCHAR(1000) DEFAULT NULL COMMENT '挽留措施',
    final_decision VARCHAR(1000) DEFAULT NULL COMMENT '最终决定',
    backup_flag TINYINT NOT NULL DEFAULT 0 COMMENT '是否备份 0否 1是',
    remarks VARCHAR(1000) DEFAULT NULL COMMENT '备注',
    pay_type VARCHAR(64) DEFAULT NULL COMMENT '付款类型',
    gift_month INT NOT NULL DEFAULT 0 COMMENT '赠送月份',
    enterprise_nature VARCHAR(64) DEFAULT NULL COMMENT '企业性质',
    manual_business_tag VARCHAR(100) DEFAULT NULL COMMENT '人工业务标签',
    create_time DATETIME DEFAULT NULL,
    update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    tenant_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_feige_contract_no_tenant (tenant_id, contract_no),
    KEY idx_feige_contract_scope (tenant_id, dept_id, salesman_id, deleted),
    KEY idx_feige_contract_expire (tenant_id, contract_status, expire_date, deleted),
    KEY idx_feige_contract_order (tenant_id, order_id, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='代理记账合同';

CREATE TABLE IF NOT EXISTS feige_order_operation_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    operation_type VARCHAR(64) NOT NULL COMMENT '操作类型',
    operation_desc VARCHAR(500) NOT NULL COMMENT '操作说明',
    operator_id BIGINT DEFAULT NULL COMMENT '操作人ID',
    operator_name VARCHAR(100) DEFAULT NULL COMMENT '操作人姓名快照',
    before_data LONGTEXT DEFAULT NULL COMMENT '变更前数据',
    after_data LONGTEXT DEFAULT NULL COMMENT '变更后数据',
    changed_fields VARCHAR(1000) DEFAULT NULL COMMENT '变更字段',
    remarks VARCHAR(1000) DEFAULT NULL COMMENT '备注',
    create_time DATETIME DEFAULT NULL,
    update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    tenant_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_feige_log_order (tenant_id, order_id, create_time, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单操作历史';

-- 初始授权沿用“提单中心”的可见角色，但保留为独立模块名称，后续可单独调整。
UPDATE sys_role
SET visible_modules = CONCAT(TRIM(TRAILING ',' FROM visible_modules), ',订单与合同'),
    update_time = NOW()
WHERE deleted = 0
  AND visible_modules IS NOT NULL
  AND FIND_IN_SET('提单中心', REPLACE(visible_modules, ' ', '')) > 0
  AND FIND_IN_SET('订单与合同', REPLACE(visible_modules, ' ', '')) = 0;
