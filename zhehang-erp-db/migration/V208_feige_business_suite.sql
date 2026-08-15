-- 业务中心55页的隔离数据底座。
-- 只新增 feige_suite_* 表；不修改浙杭既有财务、人事、培训、知识或通知事实表。

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS feige_suite_record (
    id BIGINT NOT NULL AUTO_INCREMENT,
    page_code VARCHAR(64) NOT NULL COMMENT '55页服务端白名单编码',
    record_no VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category_code VARCHAR(64) DEFAULT NULL,
    status VARCHAR(32) NOT NULL,
    owner_id BIGINT NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    dept_id BIGINT DEFAULT NULL,
    dept_name VARCHAR(150) DEFAULT NULL,
    amount DECIMAL(16,2) DEFAULT NULL,
    biz_date DATE DEFAULT NULL,
    due_date DATE DEFAULT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'manual',
    sort_no INT NOT NULL DEFAULT 0,
    search_text TEXT DEFAULT NULL,
    data_json LONGTEXT DEFAULT NULL,
    version INT NOT NULL DEFAULT 0,
    create_time DATETIME DEFAULT NULL,
    update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    tenant_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_feige_suite_record_no (tenant_id, record_no),
    KEY idx_feige_suite_page_scope (tenant_id, page_code, status, dept_id, owner_id, deleted),
    KEY idx_feige_suite_page_date (tenant_id, page_code, biz_date, deleted),
    KEY idx_feige_suite_page_category (tenant_id, page_code, category_code, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务中心隔离记录';

CREATE TABLE IF NOT EXISTS feige_suite_audit_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    page_code VARCHAR(64) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(32) NOT NULL,
    from_status VARCHAR(32) DEFAULT NULL,
    to_status VARCHAR(32) DEFAULT NULL,
    operator_id BIGINT NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    remark VARCHAR(1000) DEFAULT NULL,
    snapshot_json LONGTEXT DEFAULT NULL,
    create_time DATETIME DEFAULT NULL,
    update_time DATETIME DEFAULT NULL,
    create_by BIGINT DEFAULT NULL,
    update_by BIGINT DEFAULT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    tenant_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_feige_suite_audit_record (tenant_id, page_code, record_id, create_time, deleted),
    KEY idx_feige_suite_audit_operator (tenant_id, operator_id, create_time, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务中心状态与操作审计';
