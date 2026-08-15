-- =============================================================================
-- V157 审批中心阶段3(原V155,因Codex并行占用V155/V156顺延)·业务联动(配套代码:ApprovalCallbackHandler 回调体系)
-- 内容:
--   1) wf_instance 加 biz_type/biz_id(审批↔业务单据关联)+ 组合索引;
--   2) 请假流程(leave)表单重构:开始/结束拆成 标准date + 上午/下午 独立字段
--      (旧表单传"2026-07-02 上午"非标准串,服务端没法可靠重算天数);
--      同步更新当前版本快照,保证新发起单据表单口径一致;
--   3) hrm_leave_balance 初始化:给全部在册有账号员工种"年假"额度 5 天
--      (仅补缺,不覆盖已有行;具体额度 HR 后续在假期余额里按人调整);
--   4) 采购流程(purchase)加金额条件分支:>3000 元主管通过后转老板(super_admin)审批,
--      ≤3000 走默认顺序边直接结束;同步更新当前版本快照。
-- 安全:全部幂等;JSON 整体重写仅用于本次明确重构的两条流程配置(内容为固定字面量,
--       非字符串替换,无 V44 式 REPLACE 空转风险);其余 JSON 改动不涉及。
-- =============================================================================

-- ---------- 1/4. 审批↔业务关联列 ----------
DROP PROCEDURE IF EXISTS upgrade_approval_phase3;
DELIMITER //
CREATE PROCEDURE upgrade_approval_phase3()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wf_instance'
                   AND COLUMN_NAME = 'biz_type') THEN
    ALTER TABLE `wf_instance`
      ADD COLUMN `biz_type` VARCHAR(32) DEFAULT NULL COMMENT '关联业务类型(hrm_leave/fin_reimburse/org_transfer…;空=纯审批)' AFTER `process_version_id`,
      ADD COLUMN `biz_id` BIGINT DEFAULT NULL COMMENT '关联业务单据ID' AFTER `biz_type`,
      ADD KEY `idx_wfi_biz` (`biz_type`, `biz_id`);
  END IF;
END//
DELIMITER ;
CALL upgrade_approval_phase3();
DROP PROCEDURE IF EXISTS upgrade_approval_phase3;

-- ---------- 2/4. 请假表单重构(定义 + 当前版本快照) ----------
-- 幂等:已含 startAmpm 字段则不再改
UPDATE wf_process_def
SET form_config = '[{"type":"select","field":"leaveType","label":"请假类型","options":["年假","调休","事假","病假","婚假","产假","陪产假","育儿假","丧假"],"required":true},{"type":"date","field":"startDate","label":"开始日期","required":true},{"type":"select","field":"startAmpm","label":"开始(上午/下午)","options":["上午","下午"],"required":true},{"type":"date","field":"endDate","label":"结束日期","required":true},{"type":"select","field":"endAmpm","label":"结束(上午/下午)","options":["上午","下午"],"required":true},{"type":"number","field":"days","label":"请假天数(系统按起止自动计算)"},{"type":"textarea","field":"reason","label":"请假事由","required":true}]'
WHERE process_key = 'leave' AND deleted = 0
  AND (JSON_SEARCH(form_config, 'one', 'startAmpm', NULL, '$[*].field') IS NULL);

UPDATE wf_process_version v
JOIN wf_process_def d ON d.id = v.process_def_id AND d.process_key = 'leave' AND d.deleted = 0 AND v.version = d.version
SET v.form_config = d.form_config
WHERE JSON_SEARCH(v.form_config, 'one', 'startAmpm', NULL, '$[*].field') IS NULL;

-- ---------- 3/4. 年假余额初始化(只补缺,HR 后续按人调整) ----------
INSERT INTO hrm_leave_balance (employee_id, leave_type, total_days, used_days, remark, tenant_id, deleted)
SELECT e.id, '年假', 5, 0, 'V155初始化默认年假5天,HR可按工龄调整', e.tenant_id, 0
FROM org_employee e
WHERE e.deleted = 0 AND e.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM hrm_leave_balance b
                  WHERE b.employee_id = e.id AND b.leave_type = '年假' AND b.deleted = 0);

-- ---------- 4/4. 采购流程加 >3000 转老板 条件分支(定义 + 当前版本快照) ----------
-- 结构:开始→部门主管审批→金额判断(amount>3000→老板审批→结束;默认顺序边→结束)
-- 幂等:已含金额判断节点则不再改
UPDATE wf_process_def
SET process_config = '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"cond_amount","type":"condition","name":"金额判断","conditions":[{"expression":"amount > 3000","nextNode":"node_boss"}]},{"id":"node_boss","type":"approval","name":"老板审批","assigneeType":"role","assigneeValue":"super_admin","timeoutHours":24},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"cond_amount"},{"from":"cond_amount","to":"node_boss"},{"from":"cond_amount","to":"end"},{"from":"node_boss","to":"end"}]}'
WHERE process_key = 'purchase' AND deleted = 0
  AND (JSON_SEARCH(process_config, 'one', 'cond_amount', NULL, '$.nodes[*].id') IS NULL);

UPDATE wf_process_version v
JOIN wf_process_def d ON d.id = v.process_def_id AND d.process_key = 'purchase' AND d.deleted = 0 AND v.version = d.version
SET v.process_config = d.process_config
WHERE JSON_SEARCH(v.process_config, 'one', 'cond_amount', NULL, '$.nodes[*].id') IS NULL;
