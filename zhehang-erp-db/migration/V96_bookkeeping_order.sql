-- =============================================================================
-- V96  代理记账提单(biz_bookkeeping_order):从我的线索引用客户基础信息 + 合同信息 + 合同附件。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_bookkeeping_order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `lead_id` BIGINT DEFAULT NULL COMMENT '引用的线索ID(crm_lead.id)',
  `company_name` VARCHAR(200) NOT NULL COMMENT '公司名称',
  `contact_name` VARCHAR(64) DEFAULT NULL COMMENT '联系人(法定代表人)',
  `phone` VARCHAR(32) DEFAULT NULL COMMENT '联系电话',
  `credit_code` VARCHAR(64) DEFAULT NULL COMMENT '统一社会信用代码',
  `contract_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '合同金额',
  `service_start` DATE DEFAULT NULL COMMENT '服务开始日期',
  `service_end` DATE DEFAULT NULL COMMENT '服务结束日期',
  `sign_date` DATE DEFAULT NULL COMMENT '签约日期',
  `pay_method` VARCHAR(32) DEFAULT NULL COMMENT '收款方式',
  `service_content` VARCHAR(500) DEFAULT NULL COMMENT '服务内容',
  `contract_file` VARCHAR(1000) DEFAULT NULL COMMENT '合同附件(JSON数组:[{name,url,fileId}])',
  `owner_name` VARCHAR(64) DEFAULT NULL COMMENT '业务归属人',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '状态(pending待审批/confirmed已确认等)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代理记账提单';
