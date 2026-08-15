-- =============================================================================
-- V76  地址续费资源库(放在「地址渠道」下)+ 续费跟进记录
-- 注意:id 用 AUTO_INCREMENT(与现成表一致,避免 V65-V74 那个插入报错)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_address_renewal` (
  `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `company_name`    VARCHAR(128) DEFAULT NULL  COMMENT '企业全称',
  `subject_type`    VARCHAR(32)  DEFAULT NULL  COMMENT '主体类型(个体户丨核定 / 公司丨可开票 等)',
  `sign_date`       DATE         DEFAULT NULL  COMMENT '签约日期',
  `mount_address`   VARCHAR(255) DEFAULT NULL  COMMENT '挂靠地址/公司地址',
  `legal_person`    VARCHAR(64)  DEFAULT NULL  COMMENT '法人',
  `phone`           VARCHAR(32)  DEFAULT NULL  COMMENT '法人电话',
  `sales_name`      VARCHAR(64)  DEFAULT NULL  COMMENT '负责销售/合同签署人',
  `receivable`      DECIMAL(12,2) DEFAULT 0.00 COMMENT '应收总额',
  `channel_share`   DECIMAL(12,2) DEFAULT 0.00 COMMENT '渠道分成',
  `our_income`      DECIMAL(12,2) DEFAULT 0.00 COMMENT '我方实收',
  `pay_status`      VARCHAR(16)  DEFAULT 'unpaid' COMMENT '付款状态:unpaid未支付/paid已支付',
  `channel_company` VARCHAR(128) DEFAULT NULL  COMMENT '渠道公司/供应商公司',
  `expire_date`     DATE         DEFAULT NULL  COMMENT '地址合同到期时间',
  `expire_month`    VARCHAR(8)   DEFAULT NULL  COMMENT '到期月份',
  `renew_price_26`  DECIMAL(12,2) DEFAULT 0.00 COMMENT '26年续费价格',
  `renew_price_25`  DECIMAL(12,2) DEFAULT 0.00 COMMENT '25年续费价格(对比)',
  `renew_status`    VARCHAR(32)  DEFAULT 'pending' COMMENT '续费情况(待通知/已通知/待收款/已续费/要迁走/已注销已对接 等)',
  `supplier_contact` VARCHAR(64) DEFAULT NULL  COMMENT '供应商对接人',
  `address_cost`    DECIMAL(12,2) DEFAULT 0.00 COMMENT '地址成本',
  `peer_rebate`     DECIMAL(12,2) DEFAULT 0.00 COMMENT '同行返点',
  `other_expense`   DECIMAL(12,2) DEFAULT 0.00 COMMENT '其他支出',
  `contract_file`   VARCHAR(64)  DEFAULT NULL  COMMENT '合同图片文件ID(缩略图预览)',
  `attachments`     TEXT         DEFAULT NULL  COMMENT '其他附件JSON[{fileId,fileName}](租赁备案/合同等)',
  `remark`          VARCHAR(500) DEFAULT NULL  COMMENT '备注(收款日期+截图等)',
  `create_time`     DATETIME     DEFAULT NULL,
  `update_time`     DATETIME     DEFAULT NULL,
  `create_by`       BIGINT       DEFAULT NULL,
  `update_by`       BIGINT       DEFAULT NULL,
  `deleted`         TINYINT      DEFAULT 0,
  `tenant_id`       BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_company` (`company_name`),
  KEY `idx_expire` (`expire_month`),
  KEY `idx_pay` (`pay_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地址续费资源库';

CREATE TABLE IF NOT EXISTS `biz_address_renewal_follow` (
  `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `renewal_id`   BIGINT       DEFAULT NULL COMMENT '所属续费记录ID',
  `type`         VARCHAR(16)  DEFAULT NULL COMMENT '跟进方式(电话/微信/面谈/邮件/其他)',
  `content`      VARCHAR(1000) DEFAULT NULL COMMENT '催收跟进内容',
  `next_time`    DATETIME     DEFAULT NULL COMMENT '下次跟进时间',
  `operator_id`  BIGINT       DEFAULT NULL COMMENT '操作人用户ID(强制留痕,不可改)',
  `operator_name` VARCHAR(64) DEFAULT NULL COMMENT '操作人姓名',
  `create_time`  DATETIME     DEFAULT NULL,
  `update_time`  DATETIME     DEFAULT NULL,
  `create_by`    BIGINT       DEFAULT NULL,
  `update_by`    BIGINT       DEFAULT NULL,
  `deleted`      TINYINT      DEFAULT 0,
  `tenant_id`    BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_renewal` (`renewal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地址续费·催收跟进记录(永久不可删)';
