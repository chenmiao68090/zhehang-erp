-- =============================================================================
-- V100  外呼平台对接配置(biz_callcenter_config):存云客等外呼平台的接口凭证 + 对接状态。
--       单行配置;签名KEY为密钥,仅管理员可改;返回给前端时后端会打码。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_callcenter_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `provider` VARCHAR(32) DEFAULT 'yunke' COMMENT '外呼平台(yunke云客等)',
  `enterprise_code` VARCHAR(64) DEFAULT NULL COMMENT '企业串码',
  `admin_id` VARCHAR(128) DEFAULT NULL COMMENT '管理员ID',
  `sign_key` VARCHAR(256) DEFAULT NULL COMMENT '接口签名KEY(密钥)',
  `callback_url` VARCHAR(500) DEFAULT NULL COMMENT '回调地址(展示给用户填到云客)',
  `auto_sync` TINYINT DEFAULT 1 COMMENT '自动同步(0关/1开)',
  `last_sync_time` DATETIME DEFAULT NULL COMMENT '最近同步时间',
  `status` VARCHAR(16) DEFAULT 'pending' COMMENT '对接状态(pending待对接/connected已连接/expired过期)',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='外呼平台对接配置';
