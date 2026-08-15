-- =====================================================================
-- V159 收款登记 / 公司日记账(对齐飞书多维表格「公司日记账(2026年度)」59 字段)
-- 目标:一行 = 一家公司的一笔业务(客户信息 + 合同业绩 + 收款 + 供应商支出)
-- 独立新表 fin_company_journal,不影响现有 fin_cash_journal(收款核销工作台)
-- 重复执行安全:CREATE TABLE IF NOT EXISTS + INSERT IGNORE
-- 说明:多选列用英文逗号连接的文本存储;附件列用 JSON 数组字符串存储[{fileId,fileName}]
--      公式列(profit_*/remaining_amount/contract_end_date/receipt_time/code_no)由后端计算写入
-- =====================================================================
CREATE TABLE IF NOT EXISTS `fin_company_journal` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `auto_no` VARCHAR(64) DEFAULT NULL COMMENT '自动编号(系统生成,唯一,形如 2026年度CM1230日进斗金00001)',

  -- 一、客户基础信息
  `company_name` VARCHAR(200) NOT NULL COMMENT '公司名称',
  `company_address` VARCHAR(255) DEFAULT NULL COMMENT '公司地址',
  `legal_name` VARCHAR(50) DEFAULT NULL COMMENT '法人姓名',
  `legal_phone` VARCHAR(20) DEFAULT NULL COMMENT '法人手机号码',
  `legal_id_card` VARCHAR(24) DEFAULT NULL COMMENT '法人身份证号码',

  -- 二、归属与合同/业绩
  `belong_dept` VARCHAR(32) DEFAULT NULL COMMENT '归属部门(单选)',
  `contract_signer` VARCHAR(32) DEFAULT NULL COMMENT '合同签署人(单选)',
  `perf_year` VARCHAR(16) DEFAULT NULL COMMENT '业绩归属年份(单选)',
  `perf_month` VARCHAR(16) DEFAULT NULL COMMENT '业绩所属月份(单选)',
  `biz_category1` VARCHAR(255) DEFAULT NULL COMMENT '合作业务(一级科目,多选,逗号分隔)',
  `biz_category2` VARCHAR(1000) DEFAULT NULL COMMENT '合作业务(二级科目,多选,逗号分隔)',
  `contract_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '合同总金额',
  `fee_agency` DECIMAL(12,2) DEFAULT NULL COMMENT '代理记账收费',
  `fee_address` DECIMAL(12,2) DEFAULT NULL COMMENT '挂靠地址收费',
  `fee_business` DECIMAL(12,2) DEFAULT NULL COMMENT '工商业务收费',
  `fee_value_added` DECIMAL(12,2) DEFAULT NULL COMMENT '增值业务收费',
  `profit_address` DECIMAL(12,2) DEFAULT NULL COMMENT '地址毛利(公式:挂靠地址收费-地址支出金额)',
  `profit_value_added` DECIMAL(12,2) DEFAULT NULL COMMENT '增值业务毛利(公式:增值业务收费-增值支出-二次支出)',
  `profit_total` DECIMAL(12,2) DEFAULT NULL COMMENT '总毛利(公式:各项收费合计-各项支出合计)',
  `customer_source` VARCHAR(32) DEFAULT NULL COMMENT '客户来源(单选)',
  `sign_type` VARCHAR(16) DEFAULT NULL COMMENT '新签/续费(单选)',
  `order_status` VARCHAR(16) DEFAULT NULL COMMENT '订单状态(单选)',
  `service_start_date` DATE DEFAULT NULL COMMENT '服务开始日期',
  `payment_cycle` VARCHAR(32) DEFAULT NULL COMMENT '付款周期(单选)',
  `gift_months` VARCHAR(64) DEFAULT NULL COMMENT '赠送月份(多选,逗号分隔)',
  `contract_end_date` DATE DEFAULT NULL COMMENT '合同到期日期(公式:服务开始日期+付款周期+赠送月份)',
  `contract_remark` TEXT COMMENT '合同备注',

  -- 三、收款信息
  `receive_account` VARCHAR(64) DEFAULT NULL COMMENT '收款账号(单选)',
  `bank_serial_no` VARCHAR(100) DEFAULT NULL COMMENT '收款流水单号',
  `receipt_time` DATETIME DEFAULT NULL COMMENT '收款时间(公式:由收款日期派生)',
  `receipt_date` DATE DEFAULT NULL COMMENT '收款日期',
  `received_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '本次到款金额',
  `remaining_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '剩余尾款(公式:合同总金额-累计到款)',
  `receipt_type` VARCHAR(32) DEFAULT NULL COMMENT '到款类型(单选)',
  `voucher_file` TEXT COMMENT '收款凭证(JSON数组:[{fileId,fileName}])',
  `invoice` VARCHAR(255) DEFAULT NULL COMMENT '发票',
  `receipt_company_name` VARCHAR(200) DEFAULT NULL COMMENT '(收款)企业名称-客户/同行',
  `receipt_contact_name` VARCHAR(50) DEFAULT NULL COMMENT '(收款)对接人-客户/同行',
  `receipt_contact_phone` VARCHAR(30) DEFAULT NULL COMMENT '(收款)对接人联系方式',
  `full_paid_confirmed` TINYINT NOT NULL DEFAULT 0 COMMENT '全款到齐(财务确认):0否1是',
  `code_no` VARCHAR(64) DEFAULT NULL COMMENT '编号代码(公式:业务编码)',

  -- 四、供应商与支出
  `supplier_company` VARCHAR(200) DEFAULT NULL COMMENT '供应商公司',
  `supplier_contact` VARCHAR(50) DEFAULT NULL COMMENT '供应商对接人',
  `address_qr_file` TEXT COMMENT '地址方收款码(JSON数组附件)',
  `supplier_invoice_file` TEXT COMMENT '供应商发票(JSON数组附件)',
  `expense_account` VARCHAR(64) DEFAULT NULL COMMENT '支出账户(多选,逗号分隔)',
  `expense_paid_status` VARCHAR(64) DEFAULT NULL COMMENT '是否已支出(多选,逗号分隔)',
  `expense_address_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '地址支出金额',
  `expense_date` DATE DEFAULT NULL COMMENT '支出日期',
  `expense_pay_file` TEXT COMMENT '支出打款截图(JSON数组附件)',
  `value_added_cost` VARCHAR(255) DEFAULT NULL COMMENT '增值业务成本支出(多选,逗号分隔)',
  `value_added_expense_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '增值业务支出金额',
  `value_added_expense_date` DATE DEFAULT NULL COMMENT '增值业务支出日期',
  `expense_remark` TEXT COMMENT '支出登记备注',
  `second_expense_amount` DECIMAL(12,2) DEFAULT NULL COMMENT '二次支出金额',
  `second_expense_date` DATE DEFAULT NULL COMMENT '二次支出日期',
  `second_expense_file` TEXT COMMENT '二次支出打款截图(JSON数组附件)',

  -- 五、关联
  `parent_id` BIGINT DEFAULT NULL COMMENT '父记录(fin_company_journal.id,把同一客户多笔挂一起)',

  -- BaseEntity 标准列
  `remark` TEXT COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人(登记人)',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除:0正常1删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fin_coj_auto_no` (`auto_no`),
  KEY `idx_fin_coj_tenant` (`tenant_id`),
  KEY `idx_fin_coj_company` (`company_name`),
  KEY `idx_fin_coj_receipt_date` (`receipt_date`),
  KEY `idx_fin_coj_order_status` (`order_status`),
  KEY `idx_fin_coj_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款登记/公司日记账(对齐飞书多维表格)';

-- 菜单:收款登记(挂在「收款管理」下,与收款日记账 id=509 并列)
INSERT IGNORE INTO `sys_menu`
  (`id`, `menu_name`, `parent_id`, `sort`, `path`, `component`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `tenant_id`)
VALUES
  (510, '收款登记', 0, 26, '/cash-journal/company-journal', 'finance/company-journal', 'C', 1, 0, 'finance:company-journal:list', 'notebook', 1, 1);

INSERT IGNORE INTO `sys_role_menu` (`role_id`, `menu_id`)
SELECT `id`, 510
FROM `sys_role`
WHERE `role_key` IN ('super_admin', 'admin', 'sys_admin', 'boss', 'dept_manager', 'manager', 'finance', 'finance_hq');
