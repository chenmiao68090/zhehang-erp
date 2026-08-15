-- =====================================================================
-- V140_data_scope_repair.sql  数据权限相关数据修复(幂等,可重复执行)
-- 背景:部门主管(data_scope=4 本部门及以下)靠 sys_dept.ancestors 找子孙、
--       靠业务表 dept_id 判归属。但 ①应用新建部门不写 ancestors → "及以下"失效;
--       ②历史 crm_lead/crm_customer 可能 dept_id 为空 → 主管看不到。此脚本一次性修正。
-- =====================================================================

-- ① 重算 sys_dept.ancestors(逗号分隔祖先ID串,与 DataScopeHelper 的 FIND_IN_SET 口径一致)。
--    规则:根部门(parent_id=0)ancestors='0';子部门 = 父的 ancestors + ',' + 父ID。
--    用递归 CTE 自顶向下重算,覆盖种子外的、以及应用建的、ancestors 为空/错的部门。
UPDATE `sys_dept` s
JOIN (
    WITH RECURSIVE dept_tree AS (
        SELECT `id`, CAST('0' AS CHAR(500)) AS anc
        FROM `sys_dept`
        WHERE (`parent_id` = 0 OR `parent_id` IS NULL) AND `deleted` = 0
        UNION ALL
        SELECT d.`id`, CONCAT(t.anc, ',', d.`parent_id`)
        FROM `sys_dept` d
        JOIN dept_tree t ON d.`parent_id` = t.`id`
        WHERE d.`deleted` = 0
    )
    SELECT `id`, anc FROM dept_tree
) t ON s.`id` = t.`id`
SET s.`ancestors` = t.anc
WHERE s.`ancestors` <> t.anc OR s.`ancestors` IS NULL;

-- ② 线索 crm_lead:dept_id 为空的,按负责人(owner_id)所属部门回填。
UPDATE `crm_lead` l
JOIN `sys_user` u ON u.`id` = l.`owner_id`
SET l.`dept_id` = u.`dept_id`
WHERE (l.`dept_id` IS NULL OR l.`dept_id` = 0)
  AND l.`owner_id` IS NOT NULL
  AND u.`dept_id` IS NOT NULL;

-- ③ 客户 crm_customer:同理按负责人部门回填 dept_id。
UPDATE `crm_customer` c
JOIN `sys_user` u ON u.`id` = c.`owner_id`
SET c.`dept_id` = u.`dept_id`
WHERE (c.`dept_id` IS NULL OR c.`dept_id` = 0)
  AND c.`owner_id` IS NOT NULL
  AND u.`dept_id` IS NOT NULL;
