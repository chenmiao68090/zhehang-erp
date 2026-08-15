-- ============================================================
-- V45: 员工"直属上级"字段
-- org_employee 加 manager_id(上级的用户ID),用于审批节点"直属上级"。
-- HR 在员工表单里下拉选择直属上级;发起请假等审批时,引擎按发起人的 manager_id 指派。
-- 幂等:列已存在则 ALTER 报错被 db-apply-migrations.sh 跳过。
-- ============================================================
USE `zhehang_erp`;
ALTER TABLE `org_employee` ADD COLUMN `manager_id` BIGINT DEFAULT NULL COMMENT '直属上级(上级用户ID)';
