-- =============================================================================
-- V133  行政管理-人事行政支出明细登记。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `admin_hr_expense` (
  `id`                BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  `expense_no`        VARCHAR(64)   DEFAULT NULL COMMENT '登记编号(FY-年月日-序号)',
  `expense_date`      DATE          DEFAULT NULL COMMENT '支出日期',
  `dept_id`           BIGINT        DEFAULT NULL COMMENT '费用归属部门ID',
  `dept_name`         VARCHAR(128)  DEFAULT NULL COMMENT '费用归属部门',
  `category`          VARCHAR(64)   DEFAULT NULL COMMENT '费用大类',
  `content`           VARCHAR(500)  DEFAULT NULL COMMENT '具体支出内容',
  `quantity`          INT           DEFAULT 1 COMMENT '数量',
  `unit_price`        DECIMAL(12,2) DEFAULT 0.00 COMMENT '单价',
  `total_price`       DECIMAL(14,2) DEFAULT 0.00 COMMENT '总价',
  `pay_method`        VARCHAR(32)   DEFAULT NULL COMMENT '支付方式',
  `status`            VARCHAR(32)   DEFAULT NULL COMMENT '状态',
  `attach`            TEXT          COMMENT '支出凭证附件(JSON)',
  `remark`            VARCHAR(1000) DEFAULT NULL COMMENT '备注',
  `invoice_type`      VARCHAR(16)   DEFAULT NULL COMMENT '发票类型',
  `invoice_title`     VARCHAR(128)  DEFAULT NULL COMMENT '发票抬头',
  `invoice_amount`    DECIMAL(14,2) DEFAULT 0.00 COMMENT '开票金额',
  `invoice_attach`    TEXT          COMMENT '发票附件(JSON)',
  `create_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `update_time`       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`         BIGINT        DEFAULT NULL,
  `update_by`         BIGINT        DEFAULT NULL,
  `deleted`           TINYINT       NOT NULL DEFAULT 0,
  `tenant_id`         BIGINT        DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_hr_expense_no` (`expense_no`),
  KEY `idx_admin_hr_expense_date` (`expense_date`),
  KEY `idx_admin_hr_expense_dept` (`dept_id`),
  KEY `idx_admin_hr_expense_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行政管理-人事行政支出明细';
