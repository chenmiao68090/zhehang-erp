-- =============================================================================
-- V99  数据清洗:从 crm_lead.remark 的工商信息串里,把"法定代表人"和"统一社会信用代码"
--      提取到正式字段 legal_person / credit_code(导入时塞进了 remark、正式字段为空,
--      导致 我的线索编辑/代理记账提单引用/电销 等读不到)。
--      只补空字段、不覆盖已有值;全/半角冒号都处理;按 WHERE 过滤,可重复执行幂等。
-- =============================================================================

-- 法定代表人 → legal_person
UPDATE crm_lead
SET legal_person = NULLIF(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(
      SUBSTRING(REPLACE(remark, '：', ':'),
               LOCATE('法定代表人:', REPLACE(remark, '：', ':')) + CHAR_LENGTH('法定代表人:')),
      '\n', 1), '\r', 1)), '')
WHERE (legal_person IS NULL OR legal_person = '')
  AND remark IS NOT NULL
  AND REPLACE(remark, '：', ':') LIKE '%法定代表人:%';

-- 统一社会信用代码 → credit_code
UPDATE crm_lead
SET credit_code = NULLIF(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(
      SUBSTRING(REPLACE(remark, '：', ':'),
               LOCATE('统一社会信用代码:', REPLACE(remark, '：', ':')) + CHAR_LENGTH('统一社会信用代码:')),
      '\n', 1), '\r', 1)), '')
WHERE (credit_code IS NULL OR credit_code = '')
  AND remark IS NOT NULL
  AND REPLACE(remark, '：', ':') LIKE '%统一社会信用代码:%';
