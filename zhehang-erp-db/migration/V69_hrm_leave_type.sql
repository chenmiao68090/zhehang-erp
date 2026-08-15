-- =============================================================================
-- V69  HR·假期类型配置(可配置的假期类型,取代写死的枚举)
-- 字段对齐飞书:展示顺序/假期类型名/时长单位(半天/天)/余额规则(限额/不限额)/状态(启用)
-- 第一阶段:仅新增配置表+页面;不改 hrm_leave.leave_type / hrm_leave_balance.leave_type 存量字段。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `hrm_leave_type` (
  `id`            BIGINT       NOT NULL          COMMENT '主键(雪花ID)',
  `type_code`     VARCHAR(32)  DEFAULT NULL      COMMENT '稳定编码(annual/sick/personal/marriage/maternity/bereavement/parental等,供后续映射)',
  `type_name`     VARCHAR(32)  DEFAULT NULL      COMMENT '假期类型名(年假/病假/事假…)',
  `display_order` INT          DEFAULT 0         COMMENT '展示顺序(小在前)',
  `duration_unit` TINYINT      DEFAULT 2         COMMENT '时长单位:1=半天/2=天',
  `balance_rule`  TINYINT      DEFAULT 2         COMMENT '余额规则:1=限额/2=不限额',
  `status`        TINYINT      DEFAULT 1         COMMENT '状态:1=已启用/0=已停用',
  `remark`        VARCHAR(255) DEFAULT NULL      COMMENT '备注',
  `create_time`   DATETIME     DEFAULT NULL,
  `update_time`   DATETIME     DEFAULT NULL,
  `create_by`     BIGINT       DEFAULT NULL,
  `update_by`     BIGINT       DEFAULT NULL,
  `deleted`       TINYINT      DEFAULT 0,
  `tenant_id`     BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='HR·假期类型配置';

-- 默认假期类型(对齐用户截图;tenant_id=1)。已存在则不重复插入。
INSERT INTO `hrm_leave_type`
  (`id`, `type_code`, `type_name`, `display_order`, `duration_unit`, `balance_rule`, `status`, `tenant_id`, `deleted`, `create_time`, `update_time`)
SELECT * FROM (
  SELECT 6901 AS id, 'parental'    AS type_code, '育儿假' AS type_name, 1 AS display_order, 1 AS duration_unit, 1 AS balance_rule, 1 AS status, 1 AS tenant_id, 0 AS deleted, NOW() AS ct, NOW() AS ut UNION ALL
  SELECT 6902, 'bereavement', '丧假', 2, 1, 2, 1, 1, 0, NOW(), NOW() UNION ALL
  SELECT 6903, 'marriage',    '婚假', 3, 2, 2, 1, 1, 0, NOW(), NOW() UNION ALL
  SELECT 6904, 'maternity',   '产假', 4, 2, 2, 1, 1, 0, NOW(), NOW() UNION ALL
  SELECT 6905, 'sick',        '病假', 5, 1, 2, 1, 1, 0, NOW(), NOW() UNION ALL
  SELECT 6906, 'personal',    '事假', 6, 1, 2, 1, 1, 0, NOW(), NOW() UNION ALL
  SELECT 6907, 'annual',      '年假', 7, 1, 1, 1, 1, 0, NOW(), NOW()
) seed
WHERE NOT EXISTS (SELECT 1 FROM `hrm_leave_type` WHERE `id` = seed.id);
