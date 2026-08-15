-- ============================================================
-- V42: 员工年假额度(HR 手工设置)
-- 给 org_employee 加「年假总天数」与「已用年假天数」两列。
--   - annual_leave_total:HR 在「员工与账号」表单里手工设置;
--   - annual_leave_used :发起"年假"请假时由工作流引擎预扣,驳回/撤销时退还。
-- 请假表单选"年假"时显示剩余 = total - used,剩余不足则禁止申请。
-- 幂等:列已存在时 ALTER 报错被 db-apply-migrations.sh 跳过(可忽略)。
-- ============================================================
USE `zhehang_erp`;

ALTER TABLE `org_employee` ADD COLUMN `annual_leave_total` DECIMAL(5,1) DEFAULT 0 COMMENT '年假总天数(HR设置)';
ALTER TABLE `org_employee` ADD COLUMN `annual_leave_used` DECIMAL(5,1) DEFAULT 0 COMMENT '已用年假天数(请年假预扣,驳回/撤销退还)';
