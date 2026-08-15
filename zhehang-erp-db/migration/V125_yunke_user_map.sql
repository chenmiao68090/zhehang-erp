-- =============================================================================
-- V125  云客员工账号映射(biz_yunke_user_map):把系统里的员工(sys_user)关联到云客账号,
--       用于「点击拨打」——拨打时用该员工的云客用户ID(yunke_user_id)作为外呼 partnerId,
--       触发其云客工作手机拨号。可用手机号自动匹配,也可手工调整。
--       id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_yunke_user_map` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT DEFAULT NULL COMMENT '系统用户ID(sys_user.id)',
  `user_name` VARCHAR(100) DEFAULT NULL COMMENT '系统员工姓名',
  `user_phone` VARCHAR(30) DEFAULT NULL COMMENT '系统员工手机号',
  `yunke_user_id` VARCHAR(64) DEFAULT NULL COMMENT '云客用户ID(外呼 partnerId 用)',
  `yunke_wechat_id` VARCHAR(128) DEFAULT NULL COMMENT '云客员工微信ID',
  `yunke_phone` VARCHAR(30) DEFAULT NULL COMMENT '云客账号绑定手机号',
  `yunke_nickname` VARCHAR(200) DEFAULT NULL COMMENT '云客微信昵称',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_yum_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云客员工账号映射';
