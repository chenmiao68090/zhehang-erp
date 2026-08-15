-- R210 云客历史租户归属预览（只读）。
-- 只输出数量与冲突，不输出手机号、客户名、微信号、凭据等敏感字段。

SELECT 'biz_call_record' AS source_table, COUNT(*) AS null_tenant_rows
FROM biz_call_record WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_yunke_config', COUNT(*) FROM biz_yunke_config WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_yunke_user_map', COUNT(*) FROM biz_yunke_user_map WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_chat', COUNT(*) FROM biz_wechat_chat WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_friend', COUNT(*) FROM biz_wechat_friend WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_friend_info', COUNT(*) FROM biz_wechat_friend_info WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_msg_stat', COUNT(*) FROM biz_wechat_msg_stat WHERE tenant_id IS NULL;

WITH call_candidates AS (
    SELECT c.id, u.tenant_id
    FROM biz_call_record c
    JOIN sys_user u ON u.id = c.agent_id AND u.deleted = 0 AND u.tenant_id IS NOT NULL
    WHERE c.tenant_id IS NULL
    UNION ALL
    SELECT c.id, l.tenant_id
    FROM biz_call_record c
    JOIN crm_lead l ON l.id = c.lead_id AND l.deleted = 0 AND l.tenant_id IS NOT NULL
    WHERE c.tenant_id IS NULL
), call_resolution AS (
    SELECT id, COUNT(DISTINCT tenant_id) AS tenant_count
    FROM call_candidates GROUP BY id
)
SELECT
    COUNT(*) AS call_rows_with_evidence,
    COALESCE(SUM(tenant_count = 1), 0) AS call_rows_safe_to_backfill,
    COALESCE(SUM(tenant_count > 1), 0) AS call_rows_with_conflict
FROM call_resolution;

SELECT
    COUNT(*) AS map_rows_safe_to_backfill
FROM biz_yunke_user_map m
JOIN sys_user u ON u.id = m.user_id AND u.deleted = 0 AND u.tenant_id IS NOT NULL
WHERE m.tenant_id IS NULL AND m.deleted = 0;

SELECT 'biz_yunke_user_map_vs_user' AS conflict_type, COUNT(*) AS conflict_rows
FROM biz_yunke_user_map m
JOIN sys_user u ON u.id = m.user_id AND u.deleted = 0 AND u.tenant_id IS NOT NULL
WHERE m.tenant_id IS NOT NULL AND m.tenant_id <> u.tenant_id
UNION ALL
SELECT 'biz_call_record_vs_agent', COUNT(*)
FROM biz_call_record c
JOIN sys_user u ON u.id = c.agent_id AND u.deleted = 0 AND u.tenant_id IS NOT NULL
WHERE c.tenant_id IS NOT NULL AND c.tenant_id <> u.tenant_id
UNION ALL
SELECT 'biz_call_record_vs_lead', COUNT(*)
FROM biz_call_record c
JOIN crm_lead l ON l.id = c.lead_id AND l.deleted = 0 AND l.tenant_id IS NOT NULL
WHERE c.tenant_id IS NOT NULL AND c.tenant_id <> l.tenant_id;
