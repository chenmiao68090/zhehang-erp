-- =============================================================================
-- V145_sys_dict.sql  中央数据字典底座
-- 目的:各业务体系原先写死在 .vue 里的下拉字典(收款方式/记账状态/税率/工单类型…),
--       统一由 sys_dict_type(类型) + sys_dict_data(字典项) 承载,后台可维护。
-- 幂等:CREATE TABLE IF NOT EXISTS + 类型 INSERT IGNORE(唯一 dict_type)
--       + 字典项 INSERT ... SELECT ... WHERE NOT EXISTS(重复执行安全)。
-- id 走自增(与 BaseEntity IdType.AUTO 一致),建表必须带 AUTO_INCREMENT。
-- =============================================================================

CREATE TABLE IF NOT EXISTS `sys_dict_type` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_name`   VARCHAR(100) NOT NULL                COMMENT '字典名称(中文,如 收款方式)',
  `dict_type`   VARCHAR(100) NOT NULL                COMMENT '字典类型编码(英文唯一,如 payment_method)',
  `status`      TINYINT      NOT NULL DEFAULT 0       COMMENT '状态(0正常 1停用)',
  `remark`      VARCHAR(255) DEFAULT NULL             COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL             COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL             COMMENT '更新人',
  `deleted`     TINYINT      NOT NULL DEFAULT 0       COMMENT '逻辑删除',
  `tenant_id`   BIGINT       DEFAULT NULL             COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_dict_type_code` (`dict_type`),
  KEY `idx_sys_dict_type_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据字典类型';

CREATE TABLE IF NOT EXISTS `sys_dict_data` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_type`   VARCHAR(100) NOT NULL                COMMENT '所属字典类型编码(sys_dict_type.dict_type)',
  `dict_label`  VARCHAR(100) NOT NULL                COMMENT '字典标签(展示,如 微信)',
  `dict_value`  VARCHAR(100) NOT NULL                COMMENT '字典键值(存储,如 wechat)',
  `dict_sort`   INT          NOT NULL DEFAULT 0       COMMENT '排序(小的在前)',
  `is_default`  TINYINT      NOT NULL DEFAULT 0       COMMENT '是否默认(0否 1是)',
  `status`      TINYINT      NOT NULL DEFAULT 0       COMMENT '状态(0正常 1停用)',
  `remark`      VARCHAR(255) DEFAULT NULL             COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL             COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL             COMMENT '更新人',
  `deleted`     TINYINT      NOT NULL DEFAULT 0       COMMENT '逻辑删除',
  `tenant_id`   BIGINT       DEFAULT NULL             COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_sys_dict_data_type` (`dict_type`),
  KEY `idx_sys_dict_data_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据字典项';

-- ---------- 示例字典类型(幂等:唯一 dict_type + INSERT IGNORE) ----------
INSERT IGNORE INTO `sys_dict_type` (`dict_name`,`dict_type`,`status`,`remark`,`tenant_id`) VALUES
  ('收款方式','payment_method',0,'收款登记的收款方式(原写死在 cash-journal.vue)',1),
  ('收款账户','receive_account',0,'收款登记的收款账户(原写死在 cash-journal.vue)',1);

-- ---------- 示例字典项(幂等:WHERE NOT EXISTS + FROM DUAL) ----------
-- 说明:本系统收款方式/账户列存的是中文自由文本,故 dict_value 直接用中文(与既有数据一致,前端 value=label,不改老数据)。
-- 收款方式
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'payment_method','微信','微信',1,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='payment_method' AND `dict_value`='微信' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'payment_method','支付宝','支付宝',2,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='payment_method' AND `dict_value`='支付宝' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'payment_method','银行转账','银行转账',3,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='payment_method' AND `dict_value`='银行转账' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'payment_method','对公转账','对公转账',4,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='payment_method' AND `dict_value`='对公转账' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'payment_method','现金','现金',5,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='payment_method' AND `dict_value`='现金' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'payment_method','其他','其他',6,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='payment_method' AND `dict_value`='其他' AND `deleted`=0);
-- 收款账户
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'receive_account','公司基本户','公司基本户',1,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='receive_account' AND `dict_value`='公司基本户' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'receive_account','微信收款','微信收款',2,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='receive_account' AND `dict_value`='微信收款' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'receive_account','支付宝收款','支付宝收款',3,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='receive_account' AND `dict_value`='支付宝收款' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'receive_account','老板账户','老板账户',4,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='receive_account' AND `dict_value`='老板账户' AND `deleted`=0);
INSERT INTO `sys_dict_data` (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`tenant_id`)
  SELECT 'receive_account','其他账户','其他账户',5,0,0,1 FROM DUAL
  WHERE NOT EXISTS (SELECT 1 FROM `sys_dict_data` WHERE `dict_type`='receive_account' AND `dict_value`='其他账户' AND `deleted`=0);
