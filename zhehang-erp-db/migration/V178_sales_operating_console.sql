-- =============================================================================
-- V178 销售经营台：阶段事件底座与入口名称
--
-- 1. 新增 crm_lead_stage_event，从本迁移上线后开始记录真实阶段变化；
-- 2. 不回填、不改写 crm_lead 历史阶段，不伪造历史转化率；
-- 3. 将已核验的销售菜单 900127 从“我的结果”改为“销售经营台”；
-- 4. 不修改角色、角色菜单关系、客户归属、订单、收款或续费数据。
--
-- 回滚：程序可直接切回旧入口；菜单名可改回“我的结果”。阶段事件表保留审计数据，
-- 不在普通回滚中 DROP，删除表必须另行授权。
-- =============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `crm_lead_stage_event` (
  `id`                BIGINT       NOT NULL AUTO_INCREMENT,
  `tenant_id`         BIGINT       NOT NULL COMMENT '租户ID',
  `lead_id`           BIGINT       NOT NULL COMMENT '线索ID',
  `event_key`         VARCHAR(128) NOT NULL COMMENT '幂等事件键',
  `from_stage_code`   VARCHAR(32)  DEFAULT NULL COMMENT '变化前阶段编码',
  `to_stage_code`     VARCHAR(32)  NOT NULL COMMENT '变化后阶段编码',
  `event_type`        VARCHAR(32)  NOT NULL COMMENT 'CREATED/STAGE_CHANGED/CONVERTED/INVALIDATED',
  `source_type`       VARCHAR(32)  DEFAULT NULL COMMENT 'LEAD/FOLLOW/IMPORT/CLAIM等来源',
  `source_id`         BIGINT       DEFAULT NULL COMMENT '来源业务记录ID',
  `owner_id`          BIGINT       DEFAULT NULL COMMENT '事件发生时负责人快照',
  `dept_id`           BIGINT       DEFAULT NULL COMMENT '事件发生时部门快照',
  `operator_id`       BIGINT       NOT NULL COMMENT '实际业务身份用户ID',
  `occurred_at`       DATETIME(3)  NOT NULL COMMENT '业务发生时间',
  `create_time`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `update_time`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `create_by`         BIGINT       DEFAULT NULL,
  `update_by`         BIGINT       DEFAULT NULL,
  `deleted`           TINYINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lead_stage_event_key` (`tenant_id`, `event_key`),
  KEY `idx_lead_stage_timeline` (`tenant_id`, `lead_id`, `occurred_at`),
  KEY `idx_lead_stage_entered` (`tenant_id`, `to_stage_code`, `occurred_at`),
  KEY `idx_lead_stage_owner` (`tenant_id`, `owner_id`, `occurred_at`),
  KEY `idx_lead_stage_dept` (`tenant_id`, `dept_id`, `occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售线索阶段变化事件';

DROP PROCEDURE IF EXISTS `apply_v178_sales_console_menu`;
DELIMITER $$
CREATE PROCEDURE `apply_v178_sales_console_menu`()
BEGIN
  IF EXISTS (
    SELECT 1 FROM `sys_menu`
    WHERE `id` = 900127
      AND NOT (`tenant_id` = 1 AND `parent_id` = 900002 AND `path` = 'perf-board')
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V178 aborted: menu 900127 no longer matches reviewed sales entry';
  END IF;

  UPDATE `sys_menu`
  SET `menu_name` = '销售经营台',
      `remark` = '销售经营台：老板、主管、员工按权限展示不同默认视图',
      `update_time` = NOW()
  WHERE `id` = 900127
    AND `tenant_id` = 1
    AND `parent_id` = 900002
    AND `path` = 'perf-board'
    AND `deleted` = 0
    AND `menu_name` IN ('我的结果', '销售经营台');
END$$
DELIMITER ;

CALL `apply_v178_sales_console_menu`();
DROP PROCEDURE IF EXISTS `apply_v178_sales_console_menu`;
