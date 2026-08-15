-- =============================================================================
-- V158 审批中心阶段4·体验+设计器整改(配套代码:cc进引擎/模板走库/批量/流转图)
-- 内容:
--   1) wf_task 加 read_flag(抄送已读未读:0未读 1已读,仅 node_type=cc 有意义);
--   2) wf_process_def 加 is_template(设计器"使用模板"改为走库:标记真实已发布流程为模板,
--      天然通过发布预检、审批人角色可解析,替代旧硬编码4条死模板);
--   3) 种子:把若干覆盖面广的现有已发布流程标记为模板(请假/报销/付款/用章/采购/调岗),
--      仅补空(is_template 为 NULL/0 时才置1),不覆盖 HR 后续调整。
-- 安全:全部幂等;仅加列+回填标记,不删列/不删数据/不改流程配置。
-- =============================================================================

DROP PROCEDURE IF EXISTS upgrade_approval_phase4;
DELIMITER //
CREATE PROCEDURE upgrade_approval_phase4()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wf_task'
                   AND COLUMN_NAME = 'read_flag') THEN
    ALTER TABLE `wf_task`
      ADD COLUMN `read_flag` TINYINT(1) DEFAULT 0 COMMENT '抄送已读:0未读 1已读(仅node_type=cc有意义)' AFTER `timeout_notified`;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wf_process_def'
                   AND COLUMN_NAME = 'is_template') THEN
    ALTER TABLE `wf_process_def`
      ADD COLUMN `is_template` TINYINT(1) DEFAULT 0 COMMENT '是否作为设计器"使用模板"的模板:0否 1是' AFTER `group_name`;
  END IF;
END//
DELIMITER ;
CALL upgrade_approval_phase4();
DROP PROCEDURE IF EXISTS upgrade_approval_phase4;

-- 已有抄送记录(node_type=cc)默认置未读(仅历史 0 条,幂等无副作用)
UPDATE wf_task SET read_flag = 0 WHERE node_type = 'cc' AND read_flag IS NULL;

-- 模板种子:覆盖假勤/财务/行政/人事各体系的真实已发布流程,均角色可解析(过发布预检)
UPDATE wf_process_def
SET is_template = 1
WHERE deleted = 0 AND status = 1
  AND (is_template IS NULL OR is_template = 0)
  AND process_key IN ('leave', 'expense', 'payment', 'seal', 'purchase', 'transfer');
