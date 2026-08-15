-- =============================================================================
-- V85  员工档案补字段:户口/籍贯/民族/政治面貌/婚姻;HR附件(离职证明/劳动合同/竞业/保密/会计补充协议,JSON)。
-- =============================================================================
ALTER TABLE `org_employee`
  ADD COLUMN `household_location` VARCHAR(255) DEFAULT NULL COMMENT '户口所在地' AFTER `address`,
  ADD COLUMN `household_type`     VARCHAR(32)  DEFAULT NULL COMMENT '户口类型(本地城镇/本地农村/外地城镇/外地农村/本地居民户口/外地居民户口)' AFTER `household_location`,
  ADD COLUMN `native_place`       VARCHAR(128) DEFAULT NULL COMMENT '籍贯' AFTER `household_type`,
  ADD COLUMN `ethnicity`          VARCHAR(32)  DEFAULT NULL COMMENT '民族' AFTER `native_place`,
  ADD COLUMN `political_status`   VARCHAR(32)  DEFAULT NULL COMMENT '政治面貌(党员/团员/群众/其他)' AFTER `ethnicity`,
  ADD COLUMN `marital_status`     VARCHAR(16)  DEFAULT NULL COMMENT '婚姻情况(已婚/未婚)' AFTER `political_status`,
  ADD COLUMN `hr_docs`            TEXT         DEFAULT NULL COMMENT 'HR附件JSON:离职证明/劳动合同/竞业/保密/会计补充协议 [{type,name,url}]' AFTER `marital_status`;
