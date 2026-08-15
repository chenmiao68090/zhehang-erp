-- =============================================================================
-- V153 审批中心阶段1·止血修根(配套代码:workflow 模块 resolveAssignee 重写)
-- 目标:
--   1) sys_dept 加 leader_id(部门主管用户ID):审批"部门主管"节点改按发起人所在部门解析;
--   2) 种子初始化 sys_dept.leader_id 与 org_employee.manager_id(25名员工现全空),
--      只填空值、绝不覆盖 HR 后续维护的数据;
--   3) 修正存量流程定义里引用不存在角色的节点(晋升流程 role_key=boss 等),
--      仅当本库 sys_role 确实没有该角色时才改(生产已建 boss 角色则不动);
--   4) 清理"错派到 admin 账号"的种子待办(发起人不是 admin 却让 admin 审批的进行中实例);
--   5) sys_notification 补 sender_name/link 列(与 V152 重复但幂等,防 V152 未先应用时
--      审批站内信落库失败)。
-- 安全:
--   - 全部幂等可重跑;JSON 改动只用 JSON_SET+JSON_SEARCH,不用字符串 REPLACE;
--   - 不删任何列/表;只物理删除第4条明确圈定的种子测试数据。
-- =============================================================================

-- ---------- 1/5. 幂等加列 ----------
DROP PROCEDURE IF EXISTS upgrade_approval_phase1;
DELIMITER //
CREATE PROCEDURE upgrade_approval_phase1()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_dept'
                   AND COLUMN_NAME = 'leader_id') THEN
    ALTER TABLE `sys_dept`
      ADD COLUMN `leader_id` BIGINT DEFAULT NULL
      COMMENT '部门主管用户ID(审批"部门主管"节点按发起人所在部门的此字段解析,HR在部门管理维护)'
      AFTER `leader`;
  END IF;

  -- 与 V152 相同的两列(幂等,谁先跑都行):审批站内信要写 sender_name/link
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND COLUMN_NAME = 'sender_name') THEN
    ALTER TABLE `sys_notification`
      ADD COLUMN `sender_name` VARCHAR(64) DEFAULT NULL COMMENT '业务通知发送方名称' AFTER `sender_id`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND COLUMN_NAME = 'link') THEN
    ALTER TABLE `sys_notification`
      ADD COLUMN `link` VARCHAR(500) DEFAULT NULL COMMENT '业务跳转路径' AFTER `sender_name`;
  END IF;
  -- 与 V152 相同的 event_id 列+唯一索引(幂等):SysNotification 实体已带该字段,
  -- 生产先上本迁移时不加列会导致所有通知查询报未知列
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND COLUMN_NAME = 'event_id') THEN
    ALTER TABLE `sys_notification`
      ADD COLUMN `event_id` VARCHAR(100) DEFAULT NULL COMMENT '通知幂等事件号' AFTER `link`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_notification'
                   AND INDEX_NAME = 'uk_sys_notification_event') THEN
    ALTER TABLE `sys_notification`
      ADD UNIQUE INDEX `uk_sys_notification_event` (`tenant_id`, `receiver_id`, `event_id`);
  END IF;
END//
DELIMITER ;
CALL upgrade_approval_phase1();
DROP PROCEDURE IF EXISTS upgrade_approval_phase1;

-- ---------- 2/5. 种子:部门主管(仅填空值,HR 后续在部门管理维护) ----------
-- 依据 2026-07 组织现状:有 dept_manager 角色的按本部门归属,无主管的部门暂由
-- 公司负责人(陈苗)/财务负责人(李向荣)代管,管家部两个子部门归张华瑶。
UPDATE sys_dept d
SET d.leader_id = (SELECT e.user_id FROM org_employee e
                   WHERE e.name = '张华瑶' AND e.deleted = 0 AND e.user_id IS NOT NULL
                   ORDER BY e.id LIMIT 1)
WHERE d.deleted = 0 AND d.leader_id IS NULL AND d.dept_name IN ('管家部', '地址管家', '财务管家');

UPDATE sys_dept d
SET d.leader_id = (SELECT e.user_id FROM org_employee e
                   WHERE e.name = '彭珍珍' AND e.deleted = 0 AND e.user_id IS NOT NULL
                   ORDER BY e.id LIMIT 1)
WHERE d.deleted = 0 AND d.leader_id IS NULL AND d.dept_name = '刻章部';

UPDATE sys_dept d
SET d.leader_id = (SELECT e.user_id FROM org_employee e
                   WHERE e.name = '姜奕承' AND e.deleted = 0 AND e.user_id IS NOT NULL
                   ORDER BY e.id LIMIT 1)
WHERE d.deleted = 0 AND d.leader_id IS NULL AND d.dept_name = '运营部';

UPDATE sys_dept d
SET d.leader_id = (SELECT e.user_id FROM org_employee e
                   WHERE e.name = '罗琪' AND e.deleted = 0 AND e.user_id IS NOT NULL
                   ORDER BY e.id LIMIT 1)
WHERE d.deleted = 0 AND d.leader_id IS NULL AND d.dept_name = '行政人事部';

UPDATE sys_dept d
SET d.leader_id = (SELECT e.user_id FROM org_employee e
                   WHERE e.name = '李向荣' AND e.deleted = 0 AND e.user_id IS NOT NULL
                   ORDER BY e.id LIMIT 1)
WHERE d.deleted = 0 AND d.leader_id IS NULL AND d.dept_name IN ('财务部', '会计部');

-- 无主管的部门(销售部/工商部/渠道部/总经办)+ 公司根部门:暂由公司负责人陈苗代管
UPDATE sys_dept d
SET d.leader_id = (SELECT e.user_id FROM org_employee e
                   WHERE e.name = '陈苗' AND e.deleted = 0 AND e.user_id IS NOT NULL
                   ORDER BY e.id LIMIT 1)
WHERE d.deleted = 0 AND d.leader_id IS NULL
  AND (d.dept_name IN ('销售部', '工商部', '渠道部', '总经办') OR d.parent_id = 0);

-- ---------- 3/5. 种子:员工直属上级(仅填空值) ----------
-- 普通员工:直属上级 = 所在部门主管(主管本人除外)
UPDATE org_employee e
JOIN sys_dept d ON d.id = e.dept_id AND d.deleted = 0
SET e.manager_id = d.leader_id
WHERE e.deleted = 0 AND e.manager_id IS NULL
  AND e.user_id IS NOT NULL
  AND d.leader_id IS NOT NULL AND d.leader_id <> e.user_id;

-- 部门主管本人:直属上级 = 父部门主管(公司顶层负责人除外,其上级保持 NULL)
UPDATE org_employee e
JOIN sys_dept d ON d.id = e.dept_id AND d.deleted = 0
JOIN sys_dept p ON p.id = d.parent_id AND p.deleted = 0
SET e.manager_id = p.leader_id
WHERE e.deleted = 0 AND e.manager_id IS NULL
  AND e.user_id IS NOT NULL
  AND d.leader_id = e.user_id
  AND p.leader_id IS NOT NULL AND p.leader_id <> e.user_id;

-- ---------- 4/5. 修正流程定义里不存在的角色引用 ----------
-- 只在本库 sys_role 没有该角色时才替换(生产 V101 已建 boss 角色 → 生产不动 boss);
-- JSON 只用 JSON_SET+JSON_SEARCH 定位到具体 assigneeValue,绝不用字符串 REPLACE(V44教训)。
DROP PROCEDURE IF EXISTS fix_wf_bad_role;
DELIMITER //
CREATE PROCEDURE fix_wf_bad_role(IN oldKey VARCHAR(64), IN newKey VARCHAR(64))
BEGIN
  DECLARE n INT DEFAULT 0;
  IF NOT EXISTS (SELECT 1 FROM sys_role WHERE role_key = oldKey AND deleted = 0 AND status = 0) THEN
    fix_loop: WHILE n < 10 DO
      IF NOT EXISTS (SELECT 1 FROM wf_process_def
                     WHERE deleted = 0 AND JSON_VALID(process_config)
                       AND JSON_SEARCH(process_config, 'one', oldKey, NULL, '$**.assigneeValue') IS NOT NULL) THEN
        LEAVE fix_loop;
      END IF;
      UPDATE wf_process_def
      SET process_config = JSON_SET(process_config,
          JSON_UNQUOTE(JSON_SEARCH(process_config, 'one', oldKey, NULL, '$**.assigneeValue')),
          newKey)
      WHERE deleted = 0 AND JSON_VALID(process_config)
        AND JSON_SEARCH(process_config, 'one', oldKey, NULL, '$**.assigneeValue') IS NOT NULL;
      SET n = n + 1;
    END WHILE;
  END IF;
END//
DELIMITER ;
CALL fix_wf_bad_role('boss', 'super_admin');            -- 晋升流程"总经办审批"(本地无boss角色)
CALL fix_wf_bad_role('general_manager', 'super_admin'); -- 模板衍生"总经理审批"
CALL fix_wf_bad_role('purchase_manager', 'dept_manager'); -- 模板衍生"采购部审批"
CALL fix_wf_bad_role('admin_manager', 'hr');            -- 模板衍生"行政主管审批"
DROP PROCEDURE IF EXISTS fix_wf_bad_role;

-- ---------- 5/5. 清理错派到 admin 的种子待办 ----------
-- 圈定:进行中实例(status=0)、发起人不是 admin、却存在挂在 admin(user_id=1)名下的
-- 待处理任务 —— 全是 2026-06-14 的种子/测试数据(老解析逻辑静默落到 admin 的产物),
-- 连实例+任务+历史一起物理清除,避免删任务后实例变成永远流转不动的僵尸单。
DROP TEMPORARY TABLE IF EXISTS tmp_v153_bad_inst;
CREATE TEMPORARY TABLE tmp_v153_bad_inst AS
SELECT DISTINCT i.id
FROM wf_instance i
JOIN wf_task t ON t.instance_id = i.id AND t.status = 0 AND t.assignee_id = 1
WHERE i.status = 0 AND i.initiator_id <> 1;

DELETE FROM wf_task WHERE instance_id IN (SELECT id FROM tmp_v153_bad_inst);
DELETE FROM wf_history WHERE instance_id IN (SELECT id FROM tmp_v153_bad_inst);
DELETE FROM wf_instance WHERE id IN (SELECT id FROM tmp_v153_bad_inst);
DROP TEMPORARY TABLE IF EXISTS tmp_v153_bad_inst;
