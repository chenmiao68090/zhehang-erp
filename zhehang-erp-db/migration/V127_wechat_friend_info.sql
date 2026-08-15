-- =============================================================================
-- V127  微信好友信息(biz_wechat_friend_info):后台从云客 getAllFriendsIncrement 同步好友/群的
--       昵称、微信号、头像、所属员工微信,给聊天会话列表显示真实"好友名+头像"(替代 wxid_xxx)。
--       friend_wx_id = 聊天表 talker;sales_wechat_id = 聊天表 wechat_id。id 必须 AUTO_INCREMENT。
--       免登录同步写入→已加多租户白名单。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_wechat_friend_info` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `friend_wx_id` VARCHAR(128) DEFAULT NULL COMMENT '好友/群微信ID(=聊天talker)',
  `sales_wechat_id` VARCHAR(128) DEFAULT NULL COMMENT '所属员工微信ID(=聊天wechat_id)',
  `nickname` VARCHAR(200) DEFAULT NULL COMMENT '好友昵称/群名',
  `alias` VARCHAR(128) DEFAULT NULL COMMENT '微信号',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
  `head_url` VARCHAR(1000) DEFAULT NULL COMMENT '头像链接',
  `phone` VARCHAR(128) DEFAULT NULL COMMENT '手机号',
  `gender` TINYINT DEFAULT NULL COMMENT '性别',
  `region` VARCHAR(120) DEFAULT NULL COMMENT '地区',
  `friend_type` TINYINT DEFAULT NULL COMMENT '类型:1好友 2群',
  `last_chat_time` DATETIME DEFAULT NULL COMMENT '最后聊天时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fi` (`friend_wx_id`, `sales_wechat_id`),
  KEY `idx_fi_friend` (`friend_wx_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信好友信息(云客同步,给聊天显示名+头像)';
