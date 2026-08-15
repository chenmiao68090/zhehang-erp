-- =============================================================================
-- V82  岗位薪酬模板补字段:绩效系数 / 奖金 / 奖金说明 / 提成说明。
-- =============================================================================
ALTER TABLE `hrm_salary_template`
  ADD COLUMN `perf_coefficient` DECIMAL(6,2) DEFAULT NULL COMMENT '绩效系数' AFTER `performance_base`,
  ADD COLUMN `bonus`            DECIMAL(12,2) DEFAULT NULL COMMENT '奖金' AFTER `allowance`,
  ADD COLUMN `bonus_rule`       VARCHAR(500) DEFAULT NULL COMMENT '奖金说明' AFTER `bonus`,
  ADD COLUMN `commission_rule`  VARCHAR(500) DEFAULT NULL COMMENT '提成说明' AFTER `bonus_rule`;
