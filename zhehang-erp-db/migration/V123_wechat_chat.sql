-- =============================================================================
-- V123  微信聊天记录(biz_wechat_chat):后台定时从云客 /open/wechat/allRecords 增量同步
--       员工微信聊天流落库,供「点头像看聊天记录」页按 员工微信+好友 查询。
--       另给 biz_yunke_config 加聊天同步游标列 chat_cursor(上次拉取到的 end 时间戳)。
--       id 必须 AUTO_INCREMENT。免登录同步写入→已加多租户白名单。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_wechat_chat` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `company_code` VARCHAR(64) DEFAULT NULL COMMENT '企业码',
  `wechat_id` VARCHAR(128) DEFAULT NULL COMMENT '员工微信ID',
  `talker` VARCHAR(128) DEFAULT NULL COMMENT '好友微信ID(群聊时为说话人/群id)',
  `roomid` VARCHAR(128) DEFAULT NULL COMMENT '微信群ID(仅群聊)',
  `mine` TINYINT DEFAULT NULL COMMENT '是否员工发送:0好友 1员工',
  `msg_type` INT DEFAULT NULL COMMENT '消息类型:1文本2图片3语音4视频8GIF9文件10链接13名片14定位15系统18小程序21引用22拍一拍',
  `content` TEXT DEFAULT NULL COMMENT '文本内容(type=1)/文件名(9)/标题(10)等',
  `file_url` VARCHAR(1000) DEFAULT NULL COMMENT '媒体链接:图片/文件/视频链接、语音id等',
  `file_th` VARCHAR(1000) DEFAULT NULL COMMENT '缩略图链接',
  `msg_svr_id` VARCHAR(64) DEFAULT NULL COMMENT '微信消息ID(去重用)',
  `msg_time` DATETIME DEFAULT NULL COMMENT '消息发送时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wc_msg` (`wechat_id`, `msg_svr_id`),
  KEY `idx_wc_wx` (`wechat_id`),
  KEY `idx_wc_talker` (`talker`),
  KEY `idx_wc_time` (`msg_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信聊天记录(云客同步)';

ALTER TABLE `biz_yunke_config` ADD COLUMN `chat_cursor` BIGINT DEFAULT NULL COMMENT '聊天同步游标(上次拉取的end时间戳,13位毫秒)';
