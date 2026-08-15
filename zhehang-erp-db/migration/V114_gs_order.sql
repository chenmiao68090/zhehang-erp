-- =============================================================================
-- V114  工商业务提单(biz_gs_order):代账公司工商业务(公司注册/工商变更/注销/年报等)提单。
--       单主表存整单:客户/事项/收费为表头列;办理明细、材料附件用 JSON 字符串列(MEDIUMTEXT)。
--       主键 id 用 BIGINT(项目走 MyBatis-Plus 雪花 ASSIGN_ID,不设 AUTO_INCREMENT)。
--       幂等:CREATE TABLE IF NOT EXISTS,重复执行安全。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_gs_order` (
  `id` BIGINT NOT NULL COMMENT '主键(雪花ID)',
  -- 业务类型 + 客户信息
  `biz_type` VARCHAR(32) DEFAULT NULL COMMENT '业务类型(公司注册/工商变更/工商注销/年报公示/执照补换/股权变更/其他)',
  `company_name` VARCHAR(200) NOT NULL COMMENT '企业名称(或拟注册名称)',
  `credit_code` VARCHAR(32) DEFAULT NULL COMMENT '统一社会信用代码(已有企业)',
  `legal_name` VARCHAR(64) DEFAULT NULL COMMENT '法人姓名',
  `contact_name` VARCHAR(64) DEFAULT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(32) DEFAULT NULL COMMENT '联系电话',
  `lead_id` BIGINT DEFAULT NULL COMMENT '关联线索id(从线索带入,可空)',
  -- 办理事项
  `biz_detail` VARCHAR(1000) DEFAULT NULL COMMENT '办理事项说明',
  `change_items` MEDIUMTEXT DEFAULT NULL COMMENT '办理/变更明细 JSON:[{item,before,after}]',
  `urgent` TINYINT DEFAULT 0 COMMENT '是否加急(0否/1是)',
  `expect_date` DATE DEFAULT NULL COMMENT '预计完成日期',
  -- 收费
  `service_fee` DECIMAL(14,2) DEFAULT NULL COMMENT '服务费',
  `official_fee` DECIMAL(14,2) DEFAULT NULL COMMENT '官费/工本费',
  `total_fee` DECIMAL(14,2) DEFAULT NULL COMMENT '合计收费',
  `pay_method` VARCHAR(32) DEFAULT NULL COMMENT '收款方式',
  `pay_status` VARCHAR(16) DEFAULT 'unpaid' COMMENT '收款状态(unpaid未收/partial部分/paid已收)',
  `collect_date` DATE DEFAULT NULL COMMENT '收款日期',
  -- 材料附件
  `materials` MEDIUMTEXT DEFAULT NULL COMMENT '材料附件 JSON:[{fileId,fileName,url}]',
  -- 经办 / 归属
  `handler_id` BIGINT DEFAULT NULL COMMENT '经办人 userId',
  `handler_name` VARCHAR(64) DEFAULT NULL COMMENT '经办人姓名',
  `sales_id` BIGINT DEFAULT NULL COMMENT '业绩归属 userId',
  `sales_name` VARCHAR(64) DEFAULT NULL COMMENT '业绩归属姓名',
  `biz_year` INT DEFAULT NULL COMMENT '所属年份',
  `biz_month` INT DEFAULT NULL COMMENT '所属月份',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '办理状态(pending待受理/collecting资料收集/submitted已提交工商/licensed已领照/done已完成)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  -- BaseEntity 通用列
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_gs_order_type` (`biz_type`),
  KEY `idx_gs_order_status` (`status`),
  KEY `idx_gs_order_handler` (`handler_id`),
  KEY `idx_gs_order_ym` (`biz_year`, `biz_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工商业务提单';
