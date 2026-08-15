-- =============================================================================
-- V112  地址业务报单/提单(biz_address_order):挂靠地址新签报单。
--       单主表:客户基础/申请详情为表头列;4 个子表(收款详情/付款单位/服务事项/尾款)
--       各用一个 JSON 数组列(MEDIUMTEXT)以字符串承载,前端传 JSON 字符串、后端原样存取。
--       不复用/不改动 channel.biz_address_resource 与 renewal.biz_address_renewal。
--       幂等:建新表用 CREATE TABLE IF NOT EXISTS,重复执行安全。
--       主键 id 用 BIGINT(项目走 MyBatis-Plus 雪花 ASSIGN_ID,不设 AUTO_INCREMENT 以免冲突)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_address_order` (
  `id` BIGINT NOT NULL COMMENT '主键(雪花ID)',
  -- 客户基础 / 申请详情
  `company_name` VARCHAR(200) NOT NULL COMMENT '企业名称',
  `customer_source` VARCHAR(64) DEFAULT NULL COMMENT '客户来源(老客户-新签/转介绍、老客-续费、抖音新签、美团新签)',
  `register_type` VARCHAR(64) DEFAULT NULL COMMENT '注册类型',
  `address_type` VARCHAR(32) DEFAULT NULL COMMENT '地址类型(新签/续签)',
  `company_address` VARCHAR(300) DEFAULT NULL COMMENT '企业地址(新出地址或续签地址)',
  `legal_name` VARCHAR(64) DEFAULT NULL COMMENT '法人姓名',
  `legal_phone` VARCHAR(32) DEFAULT NULL COMMENT '法人联系方式(手机)',
  `legal_id_card` VARCHAR(32) DEFAULT NULL COMMENT '法人身份证号码(可空)',
  `steward_id` BIGINT DEFAULT NULL COMMENT '服务管家 userId',
  `steward_name` VARCHAR(64) DEFAULT NULL COMMENT '服务管家姓名',
  `sales_id` BIGINT DEFAULT NULL COMMENT '销售人员 userId',
  `sales_name` VARCHAR(64) DEFAULT NULL COMMENT '销售人员姓名',
  `biz_year` INT DEFAULT NULL COMMENT '所属年份',
  `biz_month` INT DEFAULT NULL COMMENT '所属月份',
  `contract_start` DATE DEFAULT NULL COMMENT '合同开始日期',
  `contract_end` DATE DEFAULT NULL COMMENT '合同结束日期',
  `pay_cycle` VARCHAR(32) DEFAULT NULL COMMENT '付款周期',
  `gift_months` INT DEFAULT NULL COMMENT '赠送月份',
  -- 4 个子表(JSON 数组字符串)
  `collect_items` MEDIUMTEXT DEFAULT NULL COMMENT '服务单位收款详情 JSON:[{收款类型,收款账户,收款日期,客户单号/付款单号}]',
  `payer_units` MEDIUMTEXT DEFAULT NULL COMMENT '付款单位信息 JSON:[{企业名称,对接人姓名,对接人号码}]',
  `service_items` MEDIUMTEXT DEFAULT NULL COMMENT '服务事项收款明细 JSON:[{服务事项,合同开始,合同结束,服务时长天,收款金额}]',
  `balance_items` MEDIUMTEXT DEFAULT NULL COMMENT '尾款情况 JSON:[{尾款事项,尾款金额}]',
  `collect_total` DECIMAL(14,2) DEFAULT NULL COMMENT '收款汇总(服务事项各行金额合计)',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '状态(pending待审批/confirmed已确认等)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  -- BaseEntity 通用列
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_addr_order_source` (`customer_source`),
  KEY `idx_addr_order_steward` (`steward_id`),
  KEY `idx_addr_order_sales` (`sales_id`),
  KEY `idx_addr_order_ym` (`biz_year`, `biz_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地址业务报单/提单';
