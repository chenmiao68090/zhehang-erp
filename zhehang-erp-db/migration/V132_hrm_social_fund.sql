-- =============================================================================
-- V132  人力组织-社保公积金台账。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_social_fund` (
  `id`                         BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  `record_month`               VARCHAR(7)    NOT NULL COMMENT '月份 yyyy-MM',
  `employee_id`                BIGINT        DEFAULT NULL COMMENT '员工ID',
  `employee_name`              VARCHAR(64)   DEFAULT NULL COMMENT '员工姓名',
  `id_card`                    VARCHAR(32)   DEFAULT NULL COMMENT '身份证号',
  `phone`                      VARCHAR(32)   DEFAULT NULL COMMENT '手机号',
  `pension_company`            DECIMAL(12,2) DEFAULT 0.00 COMMENT '养老保险-公司部分',
  `pension_personal`           DECIMAL(12,2) DEFAULT 0.00 COMMENT '养老保险-个人部分',
  `unemployment_company`       DECIMAL(12,2) DEFAULT 0.00 COMMENT '失业保险-公司部分',
  `unemployment_personal`      DECIMAL(12,2) DEFAULT 0.00 COMMENT '失业保险-个人部分',
  `work_injury_company`        DECIMAL(12,2) DEFAULT 0.00 COMMENT '工伤保险-公司部分',
  `work_injury_personal`       DECIMAL(12,2) DEFAULT 0.00 COMMENT '工伤保险-个人部分',
  `medical_company`            DECIMAL(12,2) DEFAULT 0.00 COMMENT '医疗保险-公司部分',
  `medical_personal`           DECIMAL(12,2) DEFAULT 0.00 COMMENT '医疗保险-个人部分',
  `social_first_month`         VARCHAR(7)    DEFAULT NULL COMMENT '社保首次参保月份',
  `housing_fund_company`       DECIMAL(12,2) DEFAULT 0.00 COMMENT '公积金-公司部分',
  `housing_fund_personal`      DECIMAL(12,2) DEFAULT 0.00 COMMENT '公积金-个人部分',
  `fund_first_month`           VARCHAR(7)    DEFAULT NULL COMMENT '公积金首次缴纳月份',
  `remark`                     VARCHAR(500)  DEFAULT NULL COMMENT '备注',
  `create_time`                DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `update_time`                DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`                  BIGINT        DEFAULT NULL,
  `update_by`                  BIGINT        DEFAULT NULL,
  `deleted`                    TINYINT       NOT NULL DEFAULT 0,
  `tenant_id`                  BIGINT        DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_hrm_social_fund_month` (`record_month`),
  KEY `idx_hrm_social_fund_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人力组织-社保公积金台账';
