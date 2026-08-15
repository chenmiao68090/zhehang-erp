SET NAMES utf8mb4;
-- =============================================================================
-- V185  续费体系(阶段1):续费提单表 + 菜单 + 收款中心补第三方平台渠道
--       biz_renewal_order:地址续费/代账续费共用一张主表,renewal_type 区分;
--       结构照 biz_address_order(V112)——4个子表(收款详情/付款单位/服务事项/尾款)
--       各用一个 JSON 数组列(MEDIUMTEXT)承载;地址续费专属供应商4列,代账单留空。
--       主键 AUTO_INCREMENT(BaseEntity @TableId(type=AUTO),V112 雪花注释是错的,别照抄)。
--       不复用/不改动 renewal.biz_address_renewal(地址续费台账,仅前端菜单挪家)。
--       重复执行安全:CREATE TABLE IF NOT EXISTS + INSERT IGNORE。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_renewal_order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `renewal_type` VARCHAR(20) NOT NULL COMMENT '续费类型:address地址续费/bookkeeping代账续费',
  -- 客户基础 / 申请详情
  `company_name` VARCHAR(200) NOT NULL COMMENT '企业名称',
  `customer_source` VARCHAR(64) DEFAULT NULL COMMENT '客户来源',
  `register_type` VARCHAR(64) DEFAULT NULL COMMENT '注册类型',
  `company_address` VARCHAR(300) DEFAULT NULL COMMENT '企业地址(续签地址)',
  `legal_name` VARCHAR(64) DEFAULT NULL COMMENT '法人姓名',
  `legal_phone` VARCHAR(32) DEFAULT NULL COMMENT '法人联系方式(手机)',
  `legal_id_card` VARCHAR(32) DEFAULT NULL COMMENT '法人身份证号码(可空)',
  `steward_id` BIGINT DEFAULT NULL COMMENT '服务管家 userId',
  `steward_name` VARCHAR(64) DEFAULT NULL COMMENT '服务管家姓名',
  `sales_id` BIGINT DEFAULT NULL COMMENT '销售人员 userId',
  `sales_name` VARCHAR(64) DEFAULT NULL COMMENT '销售人员姓名',
  `biz_year` INT DEFAULT NULL COMMENT '所属年份',
  `biz_month` INT DEFAULT NULL COMMENT '所属月份',
  `pay_cycle` VARCHAR(32) DEFAULT NULL COMMENT '付款周期(单次业务收费/年度收费/两年版套餐/三年版套餐)',
  `gift_months` INT DEFAULT NULL COMMENT '赠送月份',
  `contract_start` DATE DEFAULT NULL COMMENT '合同开始日期',
  `contract_end` DATE DEFAULT NULL COMMENT '合同结束日期(按周期+赠送月自动算,可手改)',
  -- 地址续费专属(代账续费留空)
  `supplier_name` VARCHAR(64) DEFAULT NULL COMMENT '供应商姓名(地址续费)',
  `supplier_company` VARCHAR(200) DEFAULT NULL COMMENT '供应商公司(地址续费)',
  `cost_amount` DECIMAL(14,2) DEFAULT NULL COMMENT '成本(地址续费)',
  `rebate_cost` DECIMAL(14,2) DEFAULT NULL COMMENT '返点成本(地址续费)',
  -- 4 个子表(JSON 数组字符串)
  `collect_items` MEDIUMTEXT DEFAULT NULL COMMENT '服务单位收款详情 JSON:[{收款类型,收款账户,收款日期(到分钟),客户单号/付款单号}]',
  `payer_units` MEDIUMTEXT DEFAULT NULL COMMENT '付款单位信息 JSON:[{企业名称,对接人姓名,对接人号码(11位)}]',
  `service_items` MEDIUMTEXT DEFAULT NULL COMMENT '服务事项收款明细 JSON:[{服务事项,合同开始,合同结束,服务时长天,收款金额}]',
  `balance_items` MEDIUMTEXT DEFAULT NULL COMMENT '尾款情况 JSON:[{尾款事项,尾款金额}]',
  `collect_total` DECIMAL(14,2) DEFAULT NULL COMMENT '收款汇总(服务事项各行金额合计)',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '状态(pending待审批/confirmed已确认/rejected已驳回)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  -- BaseEntity 通用列
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_renewal_order_type` (`renewal_type`),
  KEY `idx_renewal_order_steward` (`steward_id`),
  KEY `idx_renewal_order_sales` (`sales_id`),
  KEY `idx_renewal_order_ym` (`biz_year`, `biz_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='续费体系-续费提单(地址/代账)';

-- 菜单:续费体系三个子页(512/513=新提单页,514=旧地址续费台账挪家;销售可提单,与提单中心同口径)
INSERT IGNORE INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (512, '地址续费提单', 0, 28, '/renewal-center/address', 'renewal-center/renewal-order', 'C', 1, 0, NULL, 'refresh-right', 1, 1),
  (513, '代账续费提单', 0, 29, '/renewal-center/bookkeeping', 'renewal-center/renewal-order', 'C', 1, 0, NULL, 'refresh-right', 1, 1),
  (514, '地址续费台账', 0, 30, '/renewal-center/ledger', 'renewal/index', 'C', 1, 0, NULL, 'refresh-right', 1, 1);

-- 角色绑定:按 path 反查菜单id(防 512-514 撞号后绑错),并覆盖复制角色(role_key 形如 sales__xxx 的角色族)
INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT r.`id`, m.`id`
FROM `sys_role` r
JOIN `sys_menu` m ON m.`path` IN ('/renewal-center/address', '/renewal-center/bookkeeping', '/renewal-center/ledger')
WHERE r.`role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager',
                       'finance', 'finance_hq', 'sales', 'online_sales')
   OR r.`role_key` LIKE 'sales\_\_%' OR r.`role_key` LIKE 'online\_sales\_\_%'
   OR r.`role_key` LIKE 'manager\_\_%' OR r.`role_key` LIKE 'dept\_manager\_\_%'
   OR r.`role_key` LIKE 'finance\_\_%' OR r.`role_key` LIKE 'finance\_hq\_\_%';

-- 收款中心:补第三方平台渠道(美团/淘宝/抖音)+陈总个人微信。
-- 不指定 id(表已投产,自增位可能被在线新增的渠道占用,固定 id 会被 INSERT IGNORE 静默跳过);
-- 按 channel_name 判存在防重。「对应收款账号」故意留空:收款登记的选项对齐飞书不动,认领时财务自行选择。
INSERT INTO `fin_pay_channel` (`channel_type`, `channel_name`, `receive_account`, `status`, `sort`, `remark`, `create_by`, `tenant_id`)
SELECT t.* FROM (
  SELECT 'platform' AS channel_type, '美团收款' AS channel_name, NULL AS receive_account, 1 AS status, 60 AS sort, '第三方平台收款,平台账单导入' AS remark, 1 AS create_by, 1 AS tenant_id
  UNION ALL SELECT 'platform', '淘宝收款',     NULL, 1, 70, '第三方平台收款,平台账单导入', 1, 1
  UNION ALL SELECT 'platform', '抖音收款',     NULL, 1, 80, '第三方平台收款,平台账单导入', 1, 1
  UNION ALL SELECT 'wechat',   '陈总个人微信', NULL, 1, 90, '个人收款码,手工补录(个人码无API)', 1, 1
) t
WHERE NOT EXISTS (
  SELECT 1 FROM `fin_pay_channel` c WHERE c.`channel_name` = t.channel_name AND c.`deleted` = 0
);

-- 顺带修复 V112 遗留隐患:biz_address_order 建表未加 AUTO_INCREMENT,
-- 与 BaseEntity @TableId(type=AUTO) 冲突会导致新增地址提单插入失败。幂等:已修复的库上重复执行安全。
ALTER TABLE `biz_address_order` MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
