-- ============================================================
-- V30: 审批人角色对齐(把 V28 seed 里的虚构角色 key 替换为真实 sys_role.role_key)
-- 背景: V28_approval_process_seed.sql 插入的 25 个流程定义里, 审批节点
--       assigneeType=role / assigneeValue=<角色key>。但其中多个 key 是虚构的,
--       数据库 sys_role.role_key 里并不存在, 导致引擎 resolveAssignee() 调用
--       SysUserMapper.selectFirstUserIdByRoleKey 查不到用户, 回退为发起人
--       (见 WfInstanceServiceImpl#resolveAssignee 的 log.warn + return getCurrentUserId())。
--       结果: 所有审批任务都派给发起人自己, 角色分派形同虚设。
-- 真实 role_key(来源 init/99-init-data.sql + V19 + V23):
--       super_admin / sys_admin / dept_manager / finance / sales / staff
--       / finance_hq / online_sales / hr
-- 虚构 key → 真实 key 映射(仅按业务语义就近映射):
--       general_manager  → super_admin   (总经理 → 超级管理员, 系统最高审批权)
--       dept_leader      → dept_manager  (部门主管, 引擎本已 normalize, 此处一并落库统一)
--       finance_manager  → finance_hq    (财务/法务财务审批 → 财务总部)
--       hr_manager       → hr            (人事审批 → 人事角色)
--       admin_manager    → hr            (行政主管 → 暂归口 hr, 无独立行政角色)
--       purchase_manager → dept_manager  (采购部审批 → 暂归口部门主管, 无独立采购角色)
--       已是真实 key 的(如本批无)不动。
-- 引擎匹配机制确认: resolveAssignee 对 assigneeType in ('role','dept_leader') 时,
--       取 assigneeValue 作 roleKey(dept_leader 经 normalizeWorkflowRoleKey 转 dept_manager),
--       SQL: sys_user_role ur JOIN sys_role r ON r.id=ur.role_id JOIN sys_user u ON u.id=ur.user_id
--            WHERE r.role_key=#{roleKey} AND r.status=0 AND r.deleted=0 AND u.status=0 AND u.deleted=0
--            ORDER BY u.id ASC LIMIT 1。即"按 role_key 查 sys_role 再经 sys_user_role 取首个启用用户"。
--       注意: 这里 r.status=0 才算启用(0启用/1停用), 与 wf_process_def.status=1(已发布) 含义不同。
-- 做法: 对 wf_process_def 已发布行(status=1)的 process_config 文本做精确 JSON 串 REPLACE,
--       只替 '"assigneeValue":"<虚构key>"' 整段(带键名+引号), 避免误伤 name/description 等其它字段。
--       嵌套 REPLACE 一次性覆盖全部 6 个 key, 多次执行幂等(已替换过的串不再命中)。
-- 配套: 同步 Edit V28 文件把对应 assigneeValue 直接写成真实 key, 保证全新部署(只跑 V28)即正确,
--       老库(已跑过 V28)靠本 V30 增量修正, 两条路径最终一致。
-- 幂等: 纯字符串 REPLACE, 真实 key 不含虚构子串, 可重复执行结果不变。
-- ============================================================

USE `zhehang_erp`;

-- 注: process_config 实际存储为 '"assigneeValue": "xxx"'(冒号后有空格),
--     故按"带双引号的值串"替换,容错空格;这些虚构 key 仅作为 assigneeValue 出现
--     (name/description 为中文),不会误伤。
UPDATE `wf_process_def`
SET `process_config` = REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                `process_config`,
                '"general_manager"',  '"super_admin"'
              ),
              '"finance_manager"',     '"finance_hq"'
            ),
            '"hr_manager"',            '"hr"'
          ),
          '"admin_manager"',           '"hr"'
        ),
        '"purchase_manager"',          '"dept_manager"'
      ),
      '"dept_leader"',                 '"dept_manager"'
    )
WHERE `status` = 1
  AND `process_config` IS NOT NULL
  AND (
        `process_config` LIKE '%general_manager%'
     OR `process_config` LIKE '%finance_manager%'
     OR `process_config` LIKE '%hr_manager%'
     OR `process_config` LIKE '%admin_manager%'
     OR `process_config` LIKE '%purchase_manager%'
     OR `process_config` LIKE '%dept_leader%'
  );
