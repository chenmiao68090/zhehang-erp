-- =============================================================================
-- V97  电销通话记录(biz_call_record):支撑外呼工作台的 拨打数/接通数/接通率/时长/1分钟以上/坐席排名/听录音。
--      v1 手动记录通话;接入外呼平台后由回调自动写入(record_url/platform_call_id/duration)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_call_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `lead_id` BIGINT DEFAULT NULL COMMENT '关联线索ID(crm_lead.id)',
  `customer_name` VARCHAR(200) DEFAULT NULL COMMENT '客户/公司名称',
  `phone` VARCHAR(32) DEFAULT NULL COMMENT '被叫号码',
  `agent_id` BIGINT DEFAULT NULL COMMENT '坐席(拨打人)用户ID',
  `agent_name` VARCHAR(64) DEFAULT NULL COMMENT '坐席姓名',
  `call_type` VARCHAR(16) DEFAULT 'manual' COMMENT '拨打方式(manual手动/auto自动/platform平台)',
  `call_time` DATETIME DEFAULT NULL COMMENT '拨打时间',
  `duration` INT DEFAULT 0 COMMENT '通话时长(秒)',
  `connected` TINYINT DEFAULT 0 COMMENT '是否接通(0未接/1接通)',
  `result` VARCHAR(32) DEFAULT NULL COMMENT '通话结果(接通/未接/占线/空号/拒接等)',
  `record_url` VARCHAR(1000) DEFAULT NULL COMMENT '录音文件地址(平台回传)',
  `platform_call_id` VARCHAR(64) DEFAULT NULL COMMENT '外呼平台通话ID',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '通话小结/备注',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除(0正常/1删除)',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_agent_time` (`agent_id`, `call_time`),
  KEY `idx_lead` (`lead_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电销通话记录';
