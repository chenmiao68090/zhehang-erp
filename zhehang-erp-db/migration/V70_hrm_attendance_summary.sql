-- =============================================================================
-- V70  HR·月度考勤汇总(按员工×月份持久化,HR 可改 + 员工二次确认)
-- 由 /hrm/attendance-summary/generate 按月生成;复用 monthlyStats 计算口径。
-- confirm_status:0=待HR确认(草稿,可重算覆盖)/1=HR已确认待员工/2=员工已确认/3=员工有异议
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_attendance_summary` (
  `id`                  BIGINT       NOT NULL          COMMENT '主键(雪花ID)',
  `employee_id`         BIGINT       DEFAULT NULL      COMMENT '员工ID',
  `employee_name`       VARCHAR(64)  DEFAULT NULL      COMMENT '员工姓名(冗余便于展示)',
  `month`               VARCHAR(7)   DEFAULT NULL      COMMENT '月份 YYYY-MM',
  `expected_days`       INT          DEFAULT 0         COMMENT '当月应出勤天数',
  `paid_holiday_days`   INT          DEFAULT 0         COMMENT '法定节假日带薪天数',
  `actual_days`         INT          DEFAULT 0         COMMENT '实际出勤(考勤记录数)',
  `normal`              INT          DEFAULT 0         COMMENT '正常',
  `late`                INT          DEFAULT 0         COMMENT '迟到',
  `early`               INT          DEFAULT 0         COMMENT '早退',
  `absent`              INT          DEFAULT 0         COMMENT '旷工',
  `personal_leave`      DECIMAL(6,1) DEFAULT 0.0       COMMENT '事假天数',
  `sick_leave`          DECIMAL(6,1) DEFAULT 0.0       COMMENT '病假天数',
  `confirm_status`      TINYINT      DEFAULT 0         COMMENT '0待HR确认/1HR已确认待员工/2员工已确认/3员工有异议',
  `confirm_by`          BIGINT       DEFAULT NULL      COMMENT 'HR确认人',
  `confirm_time`        DATETIME     DEFAULT NULL      COMMENT 'HR确认时间',
  `employee_confirm_time` DATETIME   DEFAULT NULL      COMMENT '员工确认/异议时间',
  `employee_remark`     VARCHAR(255) DEFAULT NULL      COMMENT '员工确认备注/异议说明',
  `remark`              VARCHAR(255) DEFAULT NULL      COMMENT 'HR备注',
  `create_time`         DATETIME     DEFAULT NULL,
  `update_time`         DATETIME     DEFAULT NULL,
  `create_by`           BIGINT       DEFAULT NULL,
  `update_by`           BIGINT       DEFAULT NULL,
  `deleted`             TINYINT      DEFAULT 0,
  `tenant_id`           BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_month` (`employee_id`, `month`, `tenant_id`, `deleted`),
  KEY `idx_month` (`month`),
  KEY `idx_confirm` (`confirm_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='HR·月度考勤汇总';
