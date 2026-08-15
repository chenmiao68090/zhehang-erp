-- =============================================================================
-- V117  离职交接台账(hrm_resign_handover)v1(飞书建议 160「离职人员」离职交接 SOP)。
--        补全组织架构模块的「离职人员」视图:员工数据仍走既有只读 /org/employee/list
--        (status=3 离职),本表只登记离职交接的 SOP 附件与交接事项,不改 org_employee。
--        一名员工可有多条交接记录(如分批交接),故独立建表按 employee_id 关联。
--        id 走雪花(全局 mybatis-plus id-type=assign_id),不设 AUTO_INCREMENT。
--        通用列(create_by/update_by/create_time/update_time/deleted/tenant_id)与
--        V115/V116 等同口径。CREATE TABLE IF NOT EXISTS,可重复执行。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_resign_handover` (
  `id` BIGINT NOT NULL COMMENT '主键(雪花ID)',
  `employee_id` BIGINT DEFAULT NULL COMMENT '离职员工ID(org_employee.id)',
  `employee_name` VARCHAR(60) DEFAULT NULL COMMENT '离职员工姓名',
  `handover_date` DATE DEFAULT NULL COMMENT '交接日期',
  `handover_to` VARCHAR(120) DEFAULT NULL COMMENT '交接给谁(userId或姓名)',
  `sop_file_id` BIGINT DEFAULT NULL COMMENT '交接SOP附件(file_info.id)',
  `items` VARCHAR(2000) DEFAULT NULL COMMENT '交接事项(文本)',
  `status` INT DEFAULT '0' COMMENT '状态:0待交接/1交接中/2已完成',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_rh_emp` (`employee_id`),
  KEY `idx_rh_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='离职交接台账';
