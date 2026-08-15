-- V162 审批中心生产修复(2026-07-13):latin1管道事故修复 + 审批人解析数据补种
-- 背景:V153~V158 当晚经 docker exec mysql(客户端默认latin1)应用,两类损害:
--   ①中文谓词整批不匹配→V153部门主管种子0行生效(dept_manager全线阻断);
--   ②中文内容经latin1连接写入→V157请假表单/采购流程配置/年假余额种子 双重编码乱码落库。
-- 本脚本必须经 --default-character-set=utf8mb4 管道应用!幂等可重跑。
-- 部门主管映射按生产真实数据(dept_manager__xxx角色持有人+6月manager_id数据)核定,非人名猜测。

-- ============ 1/5. 请假表单:定义+快照 强制重写为正确中文 ============
-- (不带startAmpm守卫:乱码版里ASCII字段名完好,守卫会误判"已迁移"而跳过)
UPDATE wf_process_def
SET form_config = '[{"type":"select","field":"leaveType","label":"请假类型","options":["年假","调休","事假","病假","婚假","产假","陪产假","育儿假","丧假"],"required":true},{"type":"date","field":"startDate","label":"开始日期","required":true},{"type":"select","field":"startAmpm","label":"开始(上午/下午)","options":["上午","下午"],"required":true},{"type":"date","field":"endDate","label":"结束日期","required":true},{"type":"select","field":"endAmpm","label":"结束(上午/下午)","options":["上午","下午"],"required":true},{"type":"number","field":"days","label":"请假天数(系统按起止自动计算)"},{"type":"textarea","field":"reason","label":"请假事由","required":true}]'
WHERE process_key = 'leave' AND deleted = 0;

UPDATE wf_process_version v
JOIN wf_process_def d ON d.id = v.process_def_id AND d.process_key = 'leave' AND d.deleted = 0 AND v.version = d.version
SET v.form_config = d.form_config;

-- ============ 2/5. 采购流程配置:定义+快照 强制重写 ============
UPDATE wf_process_def
SET process_config = '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"cond_amount","type":"condition","name":"金额判断","conditions":[{"expression":"amount > 3000","nextNode":"node_boss"}]},{"id":"node_boss","type":"approval","name":"老板审批","assigneeType":"role","assigneeValue":"super_admin","timeoutHours":24},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"cond_amount"},{"from":"cond_amount","to":"node_boss"},{"from":"cond_amount","to":"end"},{"from":"node_boss","to":"end"}]}'
WHERE process_key = 'purchase' AND deleted = 0;

UPDATE wf_process_version v
JOIN wf_process_def d ON d.id = v.process_def_id AND d.process_key = 'purchase' AND d.deleted = 0 AND v.version = d.version
SET v.process_config = d.process_config;

-- ============ 3/5. 年假余额:删乱码种子行 + 重新正确播种 ============
-- 乱码行精确特征:leave_type按latin1回转后等于"年假"但本身不等(双重编码),且是未使用的默认种子
DELETE FROM hrm_leave_balance
WHERE leave_type <> '年假'
  AND CONVERT(CAST(CONVERT(leave_type USING latin1) AS BINARY) USING utf8mb4) = '年假'
  AND IFNULL(used_days, 0) = 0 AND total_days = 5;

INSERT INTO hrm_leave_balance (employee_id, leave_type, total_days, used_days, remark, tenant_id, deleted)
SELECT e.id, '年假', 5, 0, 'V157初始化默认年假5天,HR可按工龄调整', e.tenant_id, 0
FROM org_employee e
WHERE e.deleted = 0 AND e.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM hrm_leave_balance b
                  WHERE b.employee_id = e.id AND b.leave_type = '年假' AND b.deleted = 0);

-- ============ 4/5. 部门主管补种(生产真实映射,仅填空值) ============
-- 1 公司根→老板9001 | 2 总经办→陈苗3 | 3 财务部→李向荣5 | 4 销售部→陈苗3(销售员工6月manager_id均=3)
-- 7 人事部→徐雨霞25(dept_manager角色) | 8 会计部→张华瑶4(部门主管复制角色+会计员工mgr=4)
-- 9 刻章部→彭珍珍6 | 10 线上运营部→姜奕承8 | 11 工商渠道部→朱世杨7
-- 5 客服部/6 技术部/12 电话开发组/13 成交转化组:留空,引擎沿部门链向上找父级主管
UPDATE sys_dept SET leader_id = 9001 WHERE id = 1  AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 3    WHERE id = 2  AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 5    WHERE id = 3  AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 3    WHERE id = 4  AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 25   WHERE id = 7  AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 4    WHERE id = 8  AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 6    WHERE id = 9  AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 8    WHERE id = 10 AND deleted = 0 AND leader_id IS NULL;
UPDATE sys_dept SET leader_id = 7    WHERE id = 11 AND deleted = 0 AND leader_id IS NULL;

-- 直属上级只补空值(杨明梦等3人;主管本人除外)
UPDATE org_employee e
JOIN sys_dept d ON d.id = e.dept_id AND d.deleted = 0
SET e.manager_id = d.leader_id
WHERE e.deleted = 0 AND e.manager_id IS NULL
  AND d.leader_id IS NOT NULL AND d.leader_id <> e.user_id;

-- ============ 5/5. finance_hq 补成员:授予财务负责人李向荣(user 5) ============
-- (10条流程的财务审批节点指向finance_hq;生产此前0成员=全部阻断。finance与finance_hq菜单同级不扩权)
INSERT INTO sys_user_role (user_id, role_id)
SELECT 5, r.id FROM sys_role r
WHERE r.role_key = 'finance_hq' AND r.deleted = 0
  AND NOT EXISTS (SELECT 1 FROM sys_user_role ur WHERE ur.user_id = 5 AND ur.role_id = r.id);
