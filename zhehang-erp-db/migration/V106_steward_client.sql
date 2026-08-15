-- =============================================================================
-- V106  管家体系·签约客户(biz_steward_client):售后客户中枢。
--       记录签约客户的服务项目、合同金额、签约/到期日、负责管家、状态。
--       服务工单/续费/沟通/看板都围绕这张表。id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_steward_client` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `company_name` VARCHAR(200) DEFAULT NULL COMMENT '公司名称',
  `contact` VARCHAR(60) DEFAULT NULL COMMENT '联系人',
  `phone` VARCHAR(40) DEFAULT NULL COMMENT '联系电话',
  `steward_name` VARCHAR(60) DEFAULT NULL COMMENT '负责管家',
  `services` VARCHAR(300) DEFAULT NULL COMMENT '服务项目(逗号:代理记账/工商/刻章等)',
  `contract_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '合同金额',
  `sign_date` DATE DEFAULT NULL COMMENT '签约日期',
  `expire_date` DATE DEFAULT NULL COMMENT '到期日期',
  `service_cycle` VARCHAR(16) DEFAULT NULL COMMENT '服务周期:年付/季付/月付',
  `status` VARCHAR(16) DEFAULT 'serving' COMMENT '状态:serving服务中/paused暂停/churned已流失',
  `source` VARCHAR(60) DEFAULT NULL COMMENT '客户来源',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_sc_steward` (`steward_name`),
  KEY `idx_sc_expire` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管家体系·签约客户';
