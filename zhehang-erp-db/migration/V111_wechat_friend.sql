-- =============================================================================
-- V111  微信好友(biz_wechat_friend):接收云客「微信好友信息同步」回调,把工作手机的
--       个人微信好友(新增/更新/删除)自动同步进系统。按(wx_id员工微信+friend_wx_id好友)去重。
--       id 必须 AUTO_INCREMENT。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_wechat_friend` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `company_code` VARCHAR(64) DEFAULT NULL COMMENT '企业码',
  `wx_id` VARCHAR(128) DEFAULT NULL COMMENT '员工微信ID',
  `friend_wx_id` VARCHAR(128) DEFAULT NULL COMMENT '好友微信ID',
  `friend_nickname` VARCHAR(200) DEFAULT NULL COMMENT '好友昵称',
  `friend_remark` VARCHAR(200) DEFAULT NULL COMMENT '好友备注',
  `friend_alias` VARCHAR(128) DEFAULT NULL COMMENT '好友微信号',
  `gender` TINYINT DEFAULT NULL COMMENT '性别:0未设置 1男 2女',
  `region` VARCHAR(120) DEFAULT NULL COMMENT '地区',
  `contact_label_values` VARCHAR(500) DEFAULT NULL COMMENT '标签(中文逗号分隔)',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '个性签名',
  `friend_wx_phone` VARCHAR(200) DEFAULT NULL COMMENT '手机号(多个逗号分隔)',
  `from_type` VARCHAR(60) DEFAULT NULL COMMENT '新增来源',
  `add_type` TINYINT DEFAULT NULL COMMENT '添加类型:1主动 2被动',
  `note_des` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `top_flag` VARCHAR(8) DEFAULT NULL COMMENT '是否置顶:-1置顶 0不置顶',
  `last_change_type` VARCHAR(8) DEFAULT NULL COMMENT '最近变更:1新增 2更新 3删除',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_wf_wx` (`wx_id`),
  KEY `idx_wf_friend` (`friend_wx_id`),
  KEY `idx_wf_phone` (`friend_wx_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信好友(云客同步)';
