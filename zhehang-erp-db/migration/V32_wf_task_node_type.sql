-- ============================================================
-- V32: 修 wf_task.node_type 类型(救活审批引擎)
-- 背景: 实体 WfTask.nodeType 为 String(存 start/approval/end 等节点类型),但建表误为 tinyint。
--   审批引擎 startProcess→processNode 写 task 时 setNodeType("approval") → MyBatis insert 报
--   "Incorrect integer value: 'approval' for column 'node_type'" → 发起任何审批即500。
--   = 审批引擎从未真正跑通过(发起即崩,故 wf_task/wf_instance 一直空)。
-- 处理: 幂等 MODIFY 为 VARCHAR(32)。纯改列类型,表为空无数据迁移风险。
-- ============================================================

USE `zhehang_erp`;

SET @t := (SELECT data_type FROM information_schema.columns
           WHERE table_schema=DATABASE() AND table_name='wf_task' AND column_name='node_type');
SET @ddl := IF(@t <> 'varchar',
  'ALTER TABLE `wf_task` MODIFY `node_type` VARCHAR(32) DEFAULT NULL COMMENT ''节点类型(start/approval/end)''',
  'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- 同源漂移: wf_history.action 实体为 String(start/submit/approve/reject/transfer/cancel),建表误为 tinyint。
SET @ta := (SELECT data_type FROM information_schema.columns
            WHERE table_schema=DATABASE() AND table_name='wf_history' AND column_name='action');
SET @ddla := IF(@ta <> 'varchar',
  'ALTER TABLE `wf_history` MODIFY `action` VARCHAR(32) DEFAULT NULL COMMENT ''动作(start/submit/approve/reject/transfer/cancel)''',
  'SELECT 1');
PREPARE sa FROM @ddla; EXECUTE sa; DEALLOCATE PREPARE sa;
