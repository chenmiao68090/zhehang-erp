-- =====================================================================
-- V175 云客话单回填关联线索(客户360时间线"听录音"数据打通)
-- 背景:云客同步的话单(biz_call_record.call_type=platform)落库时 lead_id 为空,
--      带录音的 21.6 万条话单进不了客户360时间线 → 看不到"听录音"。
-- 做法:按客户手机号把未关联的话单挂到该手机号最新一条线索上(存量回填);
--      增量由 YunkeCallRecordSyncService 落库时自动关联(同一口径)。
-- 说明:两表 phone 排序规则不同(biz_call_record=utf8mb4_0900_ai_ci,
--      crm_lead=utf8mb4_unicode_ci),必须显式 COLLATE 否则报 Illegal mix of collations。
-- 重复执行安全:已关联的(lead_id 非空)不会被改动,重跑无新匹配即 0 行。
-- =====================================================================
UPDATE biz_call_record bc
JOIN (
  SELECT phone, MAX(id) AS lead_id
  FROM crm_lead
  WHERE deleted = 0 AND phone IS NOT NULL AND phone <> ''
  GROUP BY phone
) t ON bc.phone = (t.phone COLLATE utf8mb4_0900_ai_ci)
SET bc.lead_id = t.lead_id
WHERE bc.deleted = 0
  AND (bc.lead_id IS NULL OR bc.lead_id = 0);
