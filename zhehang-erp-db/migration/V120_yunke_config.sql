-- =============================================================================
-- V120  云客集成配置(biz_yunke_config):存云客开放平台对接凭证(企业串码/管理员ID/签名KEY/
--       接口地址)。全公司一份,单行配置。签名KEY敏感,由用户在「云客集成配置」页填写。
--       id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_yunke_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `company` VARCHAR(64) DEFAULT NULL COMMENT '企业串码(公司码)',
  `partner_id` VARCHAR(128) DEFAULT NULL COMMENT '管理员ID(查全公司数据用)',
  `sign_key` VARCHAR(128) DEFAULT NULL COMMENT '接口签名KEY(敏感)',
  `base_url` VARCHAR(200) DEFAULT 'https://phone.yunkecn.com' COMMENT '接口地址',
  `enabled` TINYINT DEFAULT 1 COMMENT '是否启用:0否 1是',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云客集成配置';
