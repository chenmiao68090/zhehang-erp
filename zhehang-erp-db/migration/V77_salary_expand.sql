-- =============================================================================
-- V77  薪酬模块扩展(Module B)— 在 Codex 现有 hrm_salary 上 additive 加字段
-- 考勤信息(可从月度考勤汇总带入)+ 奖惩细分 + 备注。全部默认0/可空,不影响存量与现有calculate。
-- =============================================================================
ALTER TABLE `hrm_salary`
  ADD COLUMN `attend_days`      DECIMAL(6,1)  DEFAULT 0.0  COMMENT '考勤·当月实际出勤天数' AFTER `salary_month`,
  ADD COLUMN `personal_leave`   DECIMAL(6,1)  DEFAULT 0.0  COMMENT '考勤·事假天数' AFTER `attend_days`,
  ADD COLUMN `sick_leave`       DECIMAL(6,1)  DEFAULT 0.0  COMMENT '考勤·病假天数' AFTER `personal_leave`,
  ADD COLUMN `annual_leave`     DECIMAL(6,1)  DEFAULT 0.0  COMMENT '考勤·年休假天数' AFTER `sick_leave`,
  ADD COLUMN `other_paid_leave` DECIMAL(6,1)  DEFAULT 0.0  COMMENT '考勤·其他带薪假天数' AFTER `annual_leave`,
  ADD COLUMN `calc_days`        DECIMAL(6,1)  DEFAULT 0.0  COMMENT '考勤·实际核算天数' AFTER `other_paid_leave`,
  ADD COLUMN `backpay`          DECIMAL(12,2) DEFAULT 0.00 COMMENT '奖惩·补发' AFTER `tax`,
  ADD COLUMN `commission`       DECIMAL(12,2) DEFAULT 0.00 COMMENT '奖惩·提成' AFTER `backpay`,
  ADD COLUMN `other_bonus`      DECIMAL(12,2) DEFAULT 0.00 COMMENT '奖惩·其他奖金' AFTER `commission`,
  ADD COLUMN `attend_deduction` DECIMAL(12,2) DEFAULT 0.00 COMMENT '奖惩·考勤扣款' AFTER `other_bonus`,
  ADD COLUMN `other_deduction`  DECIMAL(12,2) DEFAULT 0.00 COMMENT '奖惩·其他扣款' AFTER `attend_deduction`,
  ADD COLUMN `remark`           VARCHAR(500)  DEFAULT NULL COMMENT '备注(奖惩说明等)' AFTER `actual_salary`;

-- 岗位薪酬模板(B2:各岗位差异薪酬,id 自增)
CREATE TABLE IF NOT EXISTS `hrm_salary_template` (
  `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `post_id`        BIGINT       DEFAULT NULL COMMENT '岗位ID',
  `post_name`      VARCHAR(64)  DEFAULT NULL COMMENT '岗位名',
  `base_salary`    DECIMAL(12,2) DEFAULT 0.00 COMMENT '基础工资',
  `performance_base` DECIMAL(12,2) DEFAULT 0.00 COMMENT '绩效基数',
  `allowance`      DECIMAL(12,2) DEFAULT 0.00 COMMENT '津贴',
  `perf_rule`      VARCHAR(500) DEFAULT NULL COMMENT '绩效考核说明(各岗位不同)',
  `remark`         VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time`    DATETIME     DEFAULT NULL,
  `update_time`    DATETIME     DEFAULT NULL,
  `create_by`      BIGINT       DEFAULT NULL,
  `update_by`      BIGINT       DEFAULT NULL,
  `deleted`        TINYINT      DEFAULT 0,
  `tenant_id`      BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='HR·岗位薪酬模板';
