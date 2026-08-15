-- =============================================================================
-- V98  线索意向/需求/报价/策略字段 + 通话记录同步字段
--      支撑电销"挂断小结(方案5)"和"跟进(方案2)"表单:意向分类/需求类型/报价情况/跟进策略。
--      意向等存到 crm_lead(当前状态,驱动"我的线索"列表的意向/策略列);通话记录存本通快照。
-- =============================================================================
ALTER TABLE `crm_lead`
  ADD COLUMN `intent_level` VARCHAR(16) DEFAULT NULL COMMENT '意向分类(高/中/低/无)',
  ADD COLUMN `need_type` VARCHAR(200) DEFAULT NULL COMMENT '客户需求类型(多选逗号分隔)',
  ADD COLUMN `quote_status` VARCHAR(16) DEFAULT NULL COMMENT '报价情况(未报价/已报价/已成交)',
  ADD COLUMN `follow_strategy` VARCHAR(200) DEFAULT NULL COMMENT '跟进策略';

ALTER TABLE `biz_call_record`
  ADD COLUMN `intent_level` VARCHAR(16) DEFAULT NULL COMMENT '本通意向分类',
  ADD COLUMN `need_type` VARCHAR(200) DEFAULT NULL COMMENT '本通需求类型',
  ADD COLUMN `quote_status` VARCHAR(16) DEFAULT NULL COMMENT '本通报价情况';
