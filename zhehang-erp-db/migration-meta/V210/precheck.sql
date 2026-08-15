-- V210 前置检查：只读，不修改数据。
SELECT DATABASE() AS database_name, VERSION() AS mysql_version;
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('biz_call_record','biz_yunke_config','biz_yunke_user_map',
                     'biz_wechat_chat','biz_wechat_friend','biz_wechat_friend_info','biz_wechat_msg_stat')
ORDER BY table_name;

SELECT 'biz_call_record' source_table, COUNT(*) null_tenant_rows FROM biz_call_record WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_yunke_config', COUNT(*) FROM biz_yunke_config WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_yunke_user_map', COUNT(*) FROM biz_yunke_user_map WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_chat', COUNT(*) FROM biz_wechat_chat WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_friend', COUNT(*) FROM biz_wechat_friend WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_friend_info', COUNT(*) FROM biz_wechat_friend_info WHERE tenant_id IS NULL
UNION ALL SELECT 'biz_wechat_msg_stat', COUNT(*) FROM biz_wechat_msg_stat WHERE tenant_id IS NULL;

-- 唯一映射候选必须先做到租户内无重复；发现任何结果都禁止直接加唯一约束或自动回填。
SELECT tenant_id, user_id, COUNT(*) duplicate_count
FROM biz_yunke_user_map
WHERE tenant_id IS NOT NULL AND user_id IS NOT NULL AND deleted = 0
GROUP BY tenant_id, user_id
HAVING COUNT(*) > 1;

SELECT tenant_id, yunke_user_id, COUNT(*) duplicate_count
FROM biz_yunke_user_map
WHERE tenant_id IS NOT NULL AND yunke_user_id IS NOT NULL AND yunke_user_id <> '' AND deleted = 0
GROUP BY tenant_id, yunke_user_id
HAVING COUNT(*) > 1;

SELECT tenant_id, yunke_wechat_id, COUNT(*) duplicate_count
FROM biz_yunke_user_map
WHERE tenant_id IS NOT NULL AND yunke_wechat_id IS NOT NULL AND yunke_wechat_id <> '' AND deleted = 0
GROUP BY tenant_id, yunke_wechat_id
HAVING COUNT(*) > 1;

SELECT tenant_id, yunke_phone, COUNT(*) duplicate_count
FROM biz_yunke_user_map
WHERE tenant_id IS NOT NULL AND yunke_phone IS NOT NULL AND yunke_phone <> '' AND deleted = 0
GROUP BY tenant_id, yunke_phone
HAVING COUNT(*) > 1;
