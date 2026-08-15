-- ============================================================
-- V43: 员工假期额度表(假勤管理里按"每人 × 每种带薪假期"设额度)
-- 取代仅年假的 org_employee.annual_leave_*(那两列保留但不再使用)。
-- leave_type 用中文文案,与请假流程的请假类型选项一致(年假/育儿假/调休/事假...)。
-- 发起请假时:若该(员工,假期类型)有额度行 → 校验剩余并预扣,驳回/撤销退还;无额度行 → 不限制。
-- 幂等:IF NOT EXISTS 建表,可重复执行。
-- ============================================================
USE `zhehang_erp`;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `hrm_leave_balance` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '额度ID',
  `employee_id` BIGINT       NOT NULL                COMMENT '员工ID',
  `leave_type`  VARCHAR(32)  NOT NULL                COMMENT '假期类型(年假/育儿假/调休等,与请假类型一致)',
  `total_days`  DECIMAL(6,1) DEFAULT 0               COMMENT '额度总天数',
  `used_days`   DECIMAL(6,1) DEFAULT 0               COMMENT '已用天数',
  `remark`      VARCHAR(255) DEFAULT NULL            COMMENT '备注',
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP           COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除(0未删 1已删)',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_emp_type` (`employee_id`, `leave_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工假期额度表';
