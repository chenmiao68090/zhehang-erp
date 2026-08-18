-- V237 飞哥任务域初始配置种子（审批流程）。
--
-- 背景：feige_task_* / feige_suite_* 表自 V203/V204/V208 建好后一直是 0 行。
-- 经代码核对，只有「审批流程 + 步骤」是四类审批任务页面的硬依赖：
--   FeigeAuditTaskService.createTask() 必须传入 processId，且流程 enabled=1、步骤非空，
--   否则分别抛「审批流程不存在」「审批流程未启用」「审批流程没有步骤」；
--   前端 AuditTaskCreateDialog 在无启用流程时直接禁用「创建任务」按钮；
--   而 createProcess/updateProcess 走 requireBridgeManager()（仅超级管理员），
--   主管无法自建，所以必须由迁移预置一份可用流程。
-- 其余表经确认不需要种子，故本脚本不写入（判断依据写在文件末尾）。
--
-- 与常规种子写法的两处差异，务必注意：
-- 1) 不使用雪花 ID。这些表都是 id BIGINT AUTO_INCREMENT，实体继承 BaseEntity
--    的 @TableId(type = IdType.AUTO)，手工写死 19 位 ID 会与自增序列冲突。
--    步骤行通过子查询取 process_id，不依赖固定主键。
-- 2) 不使用 INSERT IGNORE。feige_task_audit_process 上 (tenant_id, process_code)
--    只是普通索引 KEY 而非 UNIQUE KEY，INSERT IGNORE 无法去重，重复执行会插出多份流程。
--    因此统一用 INSERT ... SELECT ... WHERE NOT EXISTS 实现幂等。
--
-- 只写入 tenant_id=1（生产基线唯一租户）；不修改角色、菜单、用户或任何业务数据。
-- 审批人一律使用 assignee_mode='owner'（指派给任务的业务负责人本人确认），
-- 不引用 sys_role.role_key：生产角色 key 带随机后缀（见 V205，如 dept_manager__mr8wifwj9qx），
-- 迁移脚本无法通用引用；若写死角色，落到没人持有该角色的库上会导致任务只有管理员能审。
-- 需要「主管审批 / 财务复核」这类多级流程时，由超级管理员在
-- 任务工作台 →「流程与生成规则」按本环境真实角色新建，本脚本不代劳。

SET NAMES utf8mb4;

START TRANSACTION;

-- 1. 一次性任务默认流程（/task-workbench/one-time-task 新建任务的可选流程）。
INSERT INTO `feige_task_audit_process`
    (`process_code`, `process_name`, `task_type`, `business_type_code`, `description`,
     `enabled`, `version`, `create_time`, `update_time`, `create_by`, `update_by`, `deleted`, `tenant_id`)
SELECT 'once_default', '一次性任务默认流程', 'once', NULL,
       '系统初始化流程：单步由业务负责人确认完成。需要多级审批请在流程配置中另建。',
       1, 0, NOW(), NOW(), 1, 1, 0, 1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `feige_task_audit_process`
    WHERE `tenant_id` = 1 AND `process_code` = 'once_default' AND `deleted` = 0
);

-- 2. 周期任务默认流程（/task-workbench/recurring-task）。
INSERT INTO `feige_task_audit_process`
    (`process_code`, `process_name`, `task_type`, `business_type_code`, `description`,
     `enabled`, `version`, `create_time`, `update_time`, `create_by`, `update_by`, `deleted`, `tenant_id`)
SELECT 'recurring_default', '周期任务默认流程', 'recurring', NULL,
       '系统初始化流程：单步由业务负责人确认完成。需要多级审批请在流程配置中另建。',
       1, 0, NOW(), NOW(), 1, 1, 0, 1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `feige_task_audit_process`
    WHERE `tenant_id` = 1 AND `process_code` = 'recurring_default' AND `deleted` = 0
);

-- 3. 项目部门任务默认流程（/task-workbench/project-dept-task）。
INSERT INTO `feige_task_audit_process`
    (`process_code`, `process_name`, `task_type`, `business_type_code`, `description`,
     `enabled`, `version`, `create_time`, `update_time`, `create_by`, `update_by`, `deleted`, `tenant_id`)
SELECT 'project_dept_default', '项目部门任务默认流程', 'project_dept', NULL,
       '系统初始化流程：单步由业务负责人确认完成。需要多级审批请在流程配置中另建。',
       1, 0, NOW(), NOW(), 1, 1, 0, 1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `feige_task_audit_process`
    WHERE `tenant_id` = 1 AND `process_code` = 'project_dept_default' AND `deleted` = 0
);

-- 4. 通用专项任务流程（/task-workbench/special-task）。
--    专项流程必须有 business_type_code（FeigeAuditTaskService.validateProcessRequest 强校验），
--    且同类型编码不可重复；这里用 'general' 作为通用专项，其它专项类型由管理员按业务另建。
INSERT INTO `feige_task_audit_process`
    (`process_code`, `process_name`, `task_type`, `business_type_code`, `description`,
     `enabled`, `version`, `create_time`, `update_time`, `create_by`, `update_by`, `deleted`, `tenant_id`)
SELECT 'special_general', '通用专项任务流程', 'special', 'general',
       '系统初始化流程：单步由业务负责人确认完成。其它专项类型编码请在流程配置中另建。',
       1, 0, NOW(), NOW(), 1, 1, 0, 1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM `feige_task_audit_process`
    WHERE `tenant_id` = 1 AND `process_code` = 'special_general' AND `deleted` = 0
);

-- 5. 为上述四条流程补齐第 1 步（也是最终步）。
--    约束来自 validateProcessRequest：step_order 必须从 1 连续、只有最后一步 final_step=1、
--    assignee_mode ∈ role/specific/owner。不配 form_schema_json / indicator_schema_json，
--    保持空表单，避免预置字段与各部门口径不符。
INSERT INTO `feige_task_audit_step`
    (`process_id`, `step_order`, `step_name`, `required_role_key`, `assignee_mode`, `required_user_id`,
     `allow_batch`, `final_step`, `form_schema_json`, `indicator_schema_json`,
     `version`, `create_time`, `update_time`, `create_by`, `update_by`, `deleted`, `tenant_id`)
SELECT p.`id`, 1, '负责人确认完成', NULL, 'owner', NULL,
       0, 1, NULL, NULL,
       0, NOW(), NOW(), 1, 1, 0, 1
FROM `feige_task_audit_process` p
WHERE p.`tenant_id` = 1
  AND p.`deleted` = 0
  AND p.`process_code` IN ('once_default', 'recurring_default', 'project_dept_default', 'special_general')
  AND NOT EXISTS (
      SELECT 1 FROM `feige_task_audit_step` s
      WHERE s.`process_id` = p.`id` AND s.`step_order` = 1 AND s.`deleted` = 0
  );

COMMIT;

-- 上线后自检（期望 4 行，且每行 step_count=1、enabled=1）：
-- SELECT p.process_code, p.task_type, p.enabled,
--        (SELECT COUNT(*) FROM feige_task_audit_step s WHERE s.process_id = p.id AND s.deleted = 0) AS step_count
-- FROM feige_task_audit_process p
-- WHERE p.tenant_id = 1 AND p.deleted = 0
--   AND p.process_code IN ('once_default','recurring_default','project_dept_default','special_general');

-- 回滚口径：先确认没有任务实例引用这些流程，再删除；已产生审批任务时只停用、不删除。
-- SELECT COUNT(*) FROM feige_task_audit_instance i
--   JOIN feige_task_audit_process p ON p.id = i.process_id
--  WHERE p.tenant_id = 1 AND p.process_code IN ('once_default','recurring_default','project_dept_default','special_general');
-- 计数为 0 时：
-- DELETE s FROM feige_task_audit_step s JOIN feige_task_audit_process p ON p.id = s.process_id
--  WHERE p.tenant_id = 1 AND p.process_code IN ('once_default','recurring_default','project_dept_default','special_general');
-- DELETE FROM feige_task_audit_process
--  WHERE tenant_id = 1 AND process_code IN ('once_default','recurring_default','project_dept_default','special_general');
-- 计数不为 0 时改为停用：
-- UPDATE feige_task_audit_process SET enabled = 0, update_time = NOW(), update_by = 1
--  WHERE tenant_id = 1 AND process_code IN ('once_default','recurring_default','project_dept_default','special_general');

-- ---------------------------------------------------------------------------
-- 本脚本刻意不写入的表，及判断依据（避免后续有人误以为漏了）：
--
-- feige_task_workflow_template（工作计划模板）：不种。无模板时
--   FeigeWorkflowService.materializeTemplates() 循环 0 次，计划页正常打开、列表为空，不报错；
--   createTemplate 走 requireManager()，主管可自建；且模板 role_id/role_name 必须绑定真实
--   sys_role，生产角色 key 带随机后缀，通用种子只会造出错误的角色映射。
--   附注：feige_task_workflow_required 为空时 isRequired() 返回 true（默认全员必报），
--   所以「必报范围」也无需种子。
--
-- feige_task_goal / feige_task_goal_plan / feige_task_goal_plan_user（目标管理）：不种。
--   FeigeGoalService.page() 空数据只返回空列表，目标页正常打开；目标本身是业务数据
--   （含年度/周期、指标值、责任人），由主管按期录入。
--
-- feige_task_order_bridge_rule（订单→任务桥接规则，注意真实表名不是 feige_order_task_bridge_rule）：
--   不种。FeigeOrderTaskBridgeService.enqueue() 匹配不到规则时只返回 created=0，
--   代码注释明确「配置缺失不会阻断下单」——订单照常创建，只是不自动派任务。
--   自动派单影响整个租户，V204 头注释也明确「不写入规则、不启用自动生成」，
--   应由超级管理员在「流程与生成规则」页显式开启。
--
-- feige_suite_record / feige_suite_audit_log（55 页业务套件）：确认不需要。
--   page_code 白名单硬编码在 FeigeSuitePageRegistry 里，记录由用户在页面录入，
--   预置样例只会污染真实台账。
-- ---------------------------------------------------------------------------
