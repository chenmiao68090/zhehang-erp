-- V205 任务工作台精确可见范围。
-- 生产基线（2026-08-11）仅 tenant_id=1 的下列13个受限有效角色需要补入口；
-- super_admin 的 visible_modules=NULL（不限制），不修改。
-- 本迁移只追加页面路径，不改变 data_scope、sys_role_menu、用户角色或业务数据。

START TRANSACTION;

-- 全体执行角色与主管：原服务工单、业务/四类审批任务、本人工作计划。
UPDATE `sys_role`
SET `visible_modules` = CONCAT_WS(',',
    NULLIF(TRIM(BOTH ',' FROM TRIM(`visible_modules`)), ''),
    IF(FIND_IN_SET('/customer-issue/list', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/customer-issue/list', NULL),
    IF(FIND_IN_SET('/task-workbench/business-task', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/business-task', NULL),
    IF(FIND_IN_SET('/task-workbench/one-time-task', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/one-time-task', NULL),
    IF(FIND_IN_SET('/task-workbench/recurring-task', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/recurring-task', NULL),
    IF(FIND_IN_SET('/task-workbench/project-dept-task', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/project-dept-task', NULL),
    IF(FIND_IN_SET('/task-workbench/special-task', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/special-task', NULL),
    IF(FIND_IN_SET('/task-workbench/workflow-task', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/workflow-task', NULL)
)
WHERE `tenant_id` = 1
  AND `deleted` = 0
  AND `status` = 0
  AND `visible_modules` IS NOT NULL
  AND `role_key` IN (
      'dept_manager__mr8wifwj9qx', 'dept_manager__mr8witl20lq',
      'dept_manager__mr8wjgxoug3', 'dept_manager__mr8wdpphxtn',
      'dept_manager__mr8wj7zy2lr', 'dept_manager__mr8wi48zgyr',
      'finance', 'hr', 'staff__mr8wilh72cd', 'sales__mr8wj07mixr',
      'staff__mr8wjr8jnty', 'staff__mr8wgtn3xzs', 'staff__mrlnm70jedy'
  );

-- 仅主管：团队报表、目标、模板和下属视图。后端仍按主管身份与部门数据范围校验。
UPDATE `sys_role`
SET `visible_modules` = CONCAT_WS(',',
    NULLIF(TRIM(BOTH ',' FROM TRIM(`visible_modules`)), ''),
    IF(FIND_IN_SET('/task-workbench/workflow-report', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/workflow-report', NULL),
    IF(FIND_IN_SET('/task-workbench/goal-setting', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/goal-setting', NULL),
    IF(FIND_IN_SET('/task-workbench/workflow-template', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/workflow-template', NULL),
    IF(FIND_IN_SET('/task-workbench/subordinate-view', REPLACE(COALESCE(`visible_modules`, ''), ' ', '')) = 0, '/task-workbench/subordinate-view', NULL)
)
WHERE `tenant_id` = 1
  AND `deleted` = 0
  AND `status` = 0
  AND `visible_modules` IS NOT NULL
  AND `role_key` IN (
      'dept_manager__mr8wifwj9qx', 'dept_manager__mr8witl20lq',
      'dept_manager__mr8wjgxoug3', 'dept_manager__mr8wdpphxtn',
      'dept_manager__mr8wj7zy2lr', 'dept_manager__mr8wi48zgyr'
  );

COMMIT;

-- 回滚口径：优先恢复上线前全库备份中的 sys_role，或在角色权限页移除上述精确路径；
-- 不使用模糊 REPLACE，避免误删同名路径片段。
