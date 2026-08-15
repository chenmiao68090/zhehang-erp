-- =============================================================================
-- V115  薪酬核算·工资条(hrm_payslip)v1(飞书建议 165/166/167/168):
--        HR 端逐条/批量(Excel 解析为 JSON)录入员工月度工资条,发放后员工在自助端
--        「签字确认」或「异常反馈」。与既有 hrm_salary(按考勤自动核算 calculate/pay)
--        并存、互不覆盖:本表偏「工资条明细 + 员工确认流」,故新建独立表。
--        id 走雪花(全局 mybatis-plus id-type=assign_id),不设 AUTO_INCREMENT。
--        金额列 DECIMAL(12,2);通用列(create_by/update_by/create_time/update_time/
--        deleted/tenant_id)与 V107 等同口径。CREATE TABLE IF NOT EXISTS,可重复执行。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_payslip` (
  `id` BIGINT NOT NULL COMMENT '主键(雪花ID)',
  `pay_month` VARCHAR(7) DEFAULT NULL COMMENT '薪资月份(yyyy-MM,如2026-06)',
  `employee_id` BIGINT DEFAULT NULL COMMENT '员工ID(org_employee.id)',
  `employee_name` VARCHAR(60) DEFAULT NULL COMMENT '员工姓名',
  `dept_name` VARCHAR(120) DEFAULT NULL COMMENT '部门名称',
  `post_name` VARCHAR(120) DEFAULT NULL COMMENT '岗位名称',
  `id_card` VARCHAR(32) DEFAULT NULL COMMENT '身份证号',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `bank_card` VARCHAR(32) DEFAULT NULL COMMENT '银行卡号',
  `entry_date` DATE DEFAULT NULL COMMENT '入职日期',
  `regular_date` DATE DEFAULT NULL COMMENT '转正日期',
  `leave_date` DATE DEFAULT NULL COMMENT '离职日期',
  `personal_leave` DECIMAL(6,2) DEFAULT '0.00' COMMENT '事假(天)',
  `sick_leave` DECIMAL(6,2) DEFAULT '0.00' COMMENT '病假(天)',
  `other_paid_leave` DECIMAL(6,2) DEFAULT '0.00' COMMENT '其他带薪假(天)',
  `actual_attendance_days` DECIMAL(6,2) DEFAULT '0.00' COMMENT '当月实际出勤天数',
  `base_salary` DECIMAL(12,2) DEFAULT '0.00' COMMENT '基本工资',
  `performance_salary` DECIMAL(12,2) DEFAULT '0.00' COMMENT '绩效工资',
  `commission` DECIMAL(12,2) DEFAULT '0.00' COMMENT '提成',
  `bonus` DECIMAL(12,2) DEFAULT '0.00' COMMENT '奖金',
  `reissue` DECIMAL(12,2) DEFAULT '0.00' COMMENT '补发',
  `social_insurance_deduct` DECIMAL(12,2) DEFAULT '0.00' COMMENT '社保扣款',
  `fund_deduct` DECIMAL(12,2) DEFAULT '0.00' COMMENT '公积金扣款',
  `tax_deduct` DECIMAL(12,2) DEFAULT '0.00' COMMENT '个税扣款',
  `other_deduct` DECIMAL(12,2) DEFAULT '0.00' COMMENT '其他扣款',
  `net_salary` DECIMAL(12,2) DEFAULT '0.00' COMMENT '实发工资',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `confirm_status` INT DEFAULT '0' COMMENT '确认状态:0待发放/1已发放待确认/2员工已确认/3员工有异议',
  `confirm_time` DATETIME DEFAULT NULL COMMENT '员工确认时间',
  `feedback` VARCHAR(1000) DEFAULT NULL COMMENT '员工反馈/异议内容',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_ps_month` (`pay_month`),
  KEY `idx_ps_emp` (`employee_id`),
  KEY `idx_ps_status` (`confirm_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='薪酬核算·工资条';
