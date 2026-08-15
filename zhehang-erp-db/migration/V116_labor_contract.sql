-- =============================================================================
-- V116  劳动合同管理(hrm_labor_contract)v1(飞书建议 161「劳动合同管理」,
--        原「合同到期提醒」并入本模块)。HR 端登记员工劳动合同(编号/类型/起止/签订日/
--        约定薪资/附件),按到期日/状态跟进续签、终止,并可对即将到期的合同主动提醒员工本人。
--        与既有依赖 org_employee.contract_start/contract_end 的只读「合同到期提醒」页并存:
--        本表是独立、可维护多份合同历史的「劳动合同台账」,故新建独立表。
--        id 走雪花(全局 mybatis-plus id-type=assign_id),不设 AUTO_INCREMENT。
--        约定薪资 DECIMAL(12,2) 可空;通用列(create_by/update_by/create_time/update_time/
--        deleted/tenant_id)与 V115 等同口径。CREATE TABLE IF NOT EXISTS,可重复执行。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_labor_contract` (
  `id` BIGINT NOT NULL COMMENT '主键(雪花ID)',
  `employee_id` BIGINT DEFAULT NULL COMMENT '员工ID(org_employee.id)',
  `employee_name` VARCHAR(60) DEFAULT NULL COMMENT '员工姓名',
  `dept_name` VARCHAR(120) DEFAULT NULL COMMENT '部门名称',
  `contract_no` VARCHAR(64) DEFAULT NULL COMMENT '合同编号',
  `contract_type` VARCHAR(30) DEFAULT NULL COMMENT '合同类型:固定期限/无固定期限/以完成一定工作为期限',
  `start_date` DATE DEFAULT NULL COMMENT '合同开始日期',
  `end_date` DATE DEFAULT NULL COMMENT '合同结束日期(无固定期限可空)',
  `sign_date` DATE DEFAULT NULL COMMENT '合同签订日期',
  `status` INT DEFAULT '1' COMMENT '状态:1生效/2即将到期/3已到期/4已终止/5已续签',
  `salary_agreed` DECIMAL(12,2) DEFAULT NULL COMMENT '约定薪资',
  `attachment_file_id` BIGINT DEFAULT NULL COMMENT '合同附件(file_info.id)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_lc_emp` (`employee_id`),
  KEY `idx_lc_end` (`end_date`),
  KEY `idx_lc_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='劳动合同管理';
