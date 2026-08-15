-- =============================================================================
-- V78  审批中心·新增「晋升」流程(人事类)。upsert,存在则刷新。
-- 流程:开始 → 部门主管 → 人事 → 总经办 → 结束。
-- =============================================================================
INSERT INTO `wf_process_def` (`name`,`process_key`,`category`,`version`,`description`,`form_config`,`process_config`,`status`,`tenant_id`) VALUES
('晋升审批','promotion','hr',1,'员工晋升申请',
 '[{"field":"name","label":"姓名","type":"text"},{"field":"currentPost","label":"现岗位","type":"text"},{"field":"targetPost","label":"拟晋升岗位","type":"text"},{"field":"currentSalary","label":"现薪资","type":"text"},{"field":"targetSalary","label":"晋升后薪资","type":"text"},{"field":"effectiveDate","label":"拟生效日期","type":"text"},{"field":"reason","label":"晋升理由","type":"textarea"}]',
 '{"nodes":[{"id":"start","type":"start","name":"开始"},{"id":"node1","type":"approval","name":"部门主管审批","assigneeType":"role","assigneeValue":"dept_manager"},{"id":"node2","type":"approval","name":"人事审批","assigneeType":"role","assigneeValue":"hr"},{"id":"node3","type":"approval","name":"总经办审批","assigneeType":"role","assigneeValue":"boss"},{"id":"end","type":"end","name":"结束"}],"edges":[{"from":"start","to":"node1"},{"from":"node1","to":"node2"},{"from":"node2","to":"node3"},{"from":"node3","to":"end"}]}',
 1,1)
ON DUPLICATE KEY UPDATE name=VALUES(name),category=VALUES(category),description=VALUES(description),form_config=VALUES(form_config),process_config=VALUES(process_config),status=1,deleted=0;
