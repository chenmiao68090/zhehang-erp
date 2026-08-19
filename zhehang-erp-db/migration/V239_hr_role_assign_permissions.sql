-- V239 权限治理阶段3(试点)：给「人事人员」角色分配 hr 域全部业务权限点。
--
-- 背景：阶段2 只登记了权限点、未给任何角色分配(sys_role_permission 为空)。
-- 阶段3 把 hr 域硬编码角色判断(isHrOrAdmin/isHrAdminOrBoss)替换为 hasPerm("hr:*") 前，
-- 必须先给"原本就有权操作 HR 数据"的角色分配对应权限点，否则替换后这些人会突然失去权限。
--
-- 原口径：isHrOrAdmin = 超管 || roleKey含hr；isHrAdminOrBoss = 超管 || roleKey含hr||boss。
-- 超管走 isAdmin 直接放行(无需分配)；当前活跃角色里 boss 已停用，仅 hr(id=9) 需要分配。
-- 因此本迁移给 role_key 为 hr(或 hr__租户后缀) 的活跃角色分配 hr 域全部 7 个权限点，
-- 与"原 hr 角色可做全部 HR 操作"的行为保持一致。
--
-- 幂等：INSERT ... SELECT ... WHERE NOT EXISTS，重复执行不产生脏数据。

SET NAMES utf8mb4;

START TRANSACTION;

INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `sys_role` r
JOIN `sys_permission` p ON p.domain = 'hr'
WHERE r.deleted = 0
  AND r.status = 0
  AND (r.role_key = 'hr' OR r.role_key LIKE 'hr\_\_%')
  AND p.deleted = 0
  AND p.status = 0
  AND NOT EXISTS (
    SELECT 1 FROM `sys_role_permission` rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

COMMIT;
