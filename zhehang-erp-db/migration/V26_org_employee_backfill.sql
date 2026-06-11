-- ============================================================
-- V26: 从 sys_user 回填 org_employee 员工档案(让"看本人"类功能真正生效)
-- 背景(2026-06-10 落地体检): sys_user 有25个登录账号,org_employee 0行。
--   所有按 employee_id 收敛的数据范围(销售提成/工时/薪资/请假/考勤/人事异动)
--   依赖 org_employee.user_id ↔ 登录用户的映射,档案为空 → 非管理员"看本人"恒为空。
-- 处理:
--   1) 确保 org_employee.id 为 AUTO_INCREMENT(BaseEntity 用 IdType.AUTO);
--   2) INSERT...SELECT 从 sys_user 生成档案(emp_code=EMP+用户ID,姓名取昵称,部门/租户同步),
--      NOT EXISTS 幂等防重,排除系统账号 admin。
-- 安全:纯新增,不动 sys_user;重复执行无副作用。
-- ============================================================

USE `zhehang_erp`;

-- 1) id 列确保 AUTO_INCREMENT(若已是则跳过)
SET @ai := (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='org_employee'
              AND COLUMN_NAME='id' AND EXTRA LIKE '%auto_increment%');
SET @ddl := IF(@ai=0, 'ALTER TABLE `org_employee` MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- 2) 回填档案(幂等):每个未删除、非admin、且尚无档案的用户生成一条
INSERT INTO org_employee (emp_code, name, user_id, dept_id, status, hire_date, tenant_id)
SELECT CONCAT('EMP', LPAD(u.id, 4, '0')) AS emp_code,
       COALESCE(NULLIF(TRIM(u.nickname), ''), u.username) AS name,
       u.id AS user_id,
       u.dept_id,
       1 AS status,                -- 1=在职(正式)
       CURDATE() AS hire_date,     -- 入职日期未知,先记回填日,HR后续可改
       u.tenant_id
FROM sys_user u
WHERE u.deleted = 0
  AND u.username <> 'admin'
  AND NOT EXISTS (SELECT 1 FROM org_employee e WHERE e.user_id = u.id AND e.deleted = 0);

-- 3) 自检(执行后人工看一眼):
-- SELECT e.id, e.emp_code, e.name, e.user_id, e.dept_id FROM org_employee e ORDER BY e.id;
-- SELECT COUNT(*) AS users_without_profile FROM sys_user u
--   WHERE u.deleted=0 AND u.username<>'admin'
--     AND NOT EXISTS (SELECT 1 FROM org_employee e WHERE e.user_id=u.id AND e.deleted=0);
