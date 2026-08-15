-- =============================================================================
-- V129  客户服务工单(crm_customer_issue):把微信/电话/系统/飞书等渠道反馈的客户问题
--       统一落成工单,含客户/来源/类型/紧急度/负责人/协助人/截止时间/状态/处理结果/
--       是否升级关注/是否沉淀改进。解决"客户问题没人处理、处理慢、反复救火"。
--       另有流转记录子表 crm_customer_issue_log 记录每次分配/状态变更,供服务复盘。
--       id 必须 AUTO_INCREMENT;走标准多租户隔离(tenant_id 由拦截器自动填充/过滤)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `crm_customer_issue` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `issue_no` VARCHAR(32) DEFAULT NULL COMMENT '工单编号(自动生成 GD+日期+流水,如 GD20260707001)',
  `customer_id` BIGINT DEFAULT NULL COMMENT '客户ID(关联 crm_customer.id)',
  `customer_name` VARCHAR(200) DEFAULT NULL COMMENT '客户名称(冗余,便于列表展示/搜索)',
  `source` VARCHAR(16) DEFAULT NULL COMMENT '问题来源:wechat微信/phone电话/system系统/feishu飞书/other其他',
  `issue_type` VARCHAR(16) DEFAULT NULL COMMENT '问题类型:complaint投诉/consult咨询/urge催办/tax税务/invoice开票/gs工商/fee费用/other其他',
  `priority` VARCHAR(4) DEFAULT 'P2' COMMENT '紧急程度:P0/P1/P2',
  `description` VARCHAR(2000) DEFAULT NULL COMMENT '问题描述',
  `owner_id` BIGINT DEFAULT NULL COMMENT '负责人ID(sys_user.id)',
  `owner_name` VARCHAR(64) DEFAULT NULL COMMENT '负责人姓名(冗余)',
  `assist_id` BIGINT DEFAULT NULL COMMENT '协助人ID(可选,sys_user.id)',
  `assist_name` VARCHAR(64) DEFAULT NULL COMMENT '协助人姓名(冗余)',
  `dept_id` BIGINT DEFAULT NULL COMMENT '归属部门ID(按负责人部门写入,供部门负责人看本部门工单)',
  `deadline` DATETIME DEFAULT NULL COMMENT '截止时间(必填,由应用层校验)',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '当前状态:pending待处理/processing处理中/waiting等客户/completed已完成/closed已关闭',
  `result` VARCHAR(2000) DEFAULT NULL COMMENT '处理结果(完成时必填)',
  `resolve_time` DATETIME DEFAULT NULL COMMENT '完成时间(置为已完成时写入,用于处理时长/逾期统计)',
  `boss_involved` TINYINT DEFAULT 0 COMMENT '是否升级关注:0否 1是',
  `need_review` TINYINT DEFAULT 0 COMMENT '是否需要复盘:0否 1是',
  `review_note` VARCHAR(2000) DEFAULT NULL COMMENT '复盘备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_issue_no` (`issue_no`),
  KEY `idx_status` (`status`),
  KEY `idx_owner` (`owner_id`),
  KEY `idx_deadline` (`deadline`),
  KEY `idx_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户服务工单';

-- 工单流转记录:每次分配/状态变更/关闭/复盘自动记一条,详情页按时间线展示,供服务复盘。
CREATE TABLE IF NOT EXISTS `crm_customer_issue_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `issue_id` BIGINT NOT NULL COMMENT '工单ID(crm_customer_issue.id)',
  `action` VARCHAR(16) DEFAULT NULL COMMENT '动作:create新建/assign分配/status改状态/close关闭/review复盘',
  `from_status` VARCHAR(16) DEFAULT NULL COMMENT '变更前状态',
  `to_status` VARCHAR(16) DEFAULT NULL COMMENT '变更后状态',
  `operator_id` BIGINT DEFAULT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(64) DEFAULT NULL COMMENT '操作人姓名',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '操作说明/备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_issue` (`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户服务工单流转记录';
