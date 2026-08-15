-- R210 云客历史 tenant_id 定向回填。
-- 必须由 scripts/apply-data-repair.sh 注入 @run_id；禁止直接执行本文件。
-- 规则：只采用系统用户、CRM线索及已解析坐席微信映射；候选租户不唯一或没有证据时不更新原行，只登记隔离清单。

DROP PROCEDURE IF EXISTS zh_assert_r210_context;
DELIMITER $$
CREATE PROCEDURE zh_assert_r210_context()
BEGIN
    IF @run_id IS NULL OR @run_id = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'R210 requires an audited run_id';
    END IF;
END$$
DELIMITER ;
CALL zh_assert_r210_context();
DROP PROCEDURE zh_assert_r210_context;

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_r210_candidate;
CREATE TEMPORARY TABLE tmp_r210_candidate (
    source_table VARCHAR(64) NOT NULL,
    source_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    evidence_code VARCHAR(64) NOT NULL,
    KEY idx_r210_candidate_row (source_table, source_id),
    KEY idx_r210_candidate_tenant (tenant_id)
) ENGINE=InnoDB;

-- 坐席映射只能以系统用户主键归属为准，禁止按姓名或手机号猜测。
INSERT INTO tmp_r210_candidate(source_table, source_id, tenant_id, evidence_code)
SELECT 'biz_yunke_user_map', m.id, u.tenant_id, 'SYSTEM_USER_ID'
FROM biz_yunke_user_map m
JOIN sys_user u ON u.id = m.user_id AND u.deleted = 0 AND u.tenant_id IS NOT NULL
WHERE m.tenant_id IS NULL AND m.deleted = 0;

-- 话单同时接受坐席ID和线索ID证据；二者租户冲突时不会自动回填。
INSERT INTO tmp_r210_candidate(source_table, source_id, tenant_id, evidence_code)
SELECT 'biz_call_record', c.id, u.tenant_id, 'AGENT_USER_ID'
FROM biz_call_record c
JOIN sys_user u ON u.id = c.agent_id AND u.deleted = 0 AND u.tenant_id IS NOT NULL
WHERE c.tenant_id IS NULL
UNION ALL
SELECT 'biz_call_record', c.id, l.tenant_id, 'CRM_LEAD_ID'
FROM biz_call_record c
JOIN crm_lead l ON l.id = c.lead_id AND l.deleted = 0 AND l.tenant_id IS NOT NULL
WHERE c.tenant_id IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_r210_resolution;
CREATE TEMPORARY TABLE tmp_r210_resolution AS
SELECT source_table, source_id, MIN(tenant_id) AS tenant_id,
       COUNT(DISTINCT tenant_id) AS tenant_count,
       SHA2(GROUP_CONCAT(DISTINCT CONCAT(evidence_code, ':', tenant_id)
                         ORDER BY evidence_code, tenant_id SEPARATOR '|'), 256) AS evidence_hash
FROM tmp_r210_candidate
GROUP BY source_table, source_id;
ALTER TABLE tmp_r210_resolution
    ADD PRIMARY KEY (source_table, source_id),
    ADD KEY idx_r210_resolution_tenant (tenant_id);

-- 将已经解析的坐席映射与原本有租户的映射合并，作为微信类数据的唯一归属证据。
DROP TEMPORARY TABLE IF EXISTS tmp_r210_wechat_owner;
CREATE TEMPORARY TABLE tmp_r210_wechat_owner AS
SELECT m.yunke_wechat_id AS wechat_id,
       COALESCE(m.tenant_id, r.tenant_id) AS tenant_id
FROM biz_yunke_user_map m
LEFT JOIN tmp_r210_resolution r
       ON r.source_table = 'biz_yunke_user_map' AND r.source_id = m.id AND r.tenant_count = 1
WHERE m.deleted = 0
  AND m.yunke_wechat_id IS NOT NULL AND m.yunke_wechat_id <> ''
  AND COALESCE(m.tenant_id, r.tenant_id) IS NOT NULL;
ALTER TABLE tmp_r210_wechat_owner
    ADD KEY idx_r210_wechat_owner (wechat_id),
    ADD KEY idx_r210_wechat_tenant (tenant_id);

INSERT INTO tmp_r210_candidate(source_table, source_id, tenant_id, evidence_code)
SELECT 'biz_wechat_chat', c.id, o.tenant_id, 'SEAT_WECHAT_ID'
FROM biz_wechat_chat c JOIN tmp_r210_wechat_owner o ON o.wechat_id = c.wechat_id
WHERE c.tenant_id IS NULL AND c.deleted = 0
UNION ALL
SELECT 'biz_wechat_friend', f.id, o.tenant_id, 'SEAT_WECHAT_ID'
FROM biz_wechat_friend f JOIN tmp_r210_wechat_owner o ON o.wechat_id = f.wx_id
WHERE f.tenant_id IS NULL AND f.deleted = 0
UNION ALL
SELECT 'biz_wechat_friend_info', f.id, o.tenant_id, 'SEAT_WECHAT_ID'
FROM biz_wechat_friend_info f JOIN tmp_r210_wechat_owner o ON o.wechat_id = f.sales_wechat_id
WHERE f.tenant_id IS NULL AND f.deleted = 0
UNION ALL
SELECT 'biz_wechat_msg_stat', s.id, o.tenant_id, 'SEAT_WECHAT_ID'
FROM biz_wechat_msg_stat s JOIN tmp_r210_wechat_owner o ON o.wechat_id = s.wechat_id
WHERE s.tenant_id IS NULL AND s.deleted = 0;

-- 配置只在企业码下所有已映射坐席一致归属同一租户时才可回填。
INSERT INTO tmp_r210_candidate(source_table, source_id, tenant_id, evidence_code)
SELECT 'biz_yunke_config', c.id, o.tenant_id, 'COMPANY_SEAT_WECHAT'
FROM biz_yunke_config c
JOIN biz_wechat_chat wc ON wc.company_code = c.company AND wc.deleted = 0
JOIN tmp_r210_wechat_owner o ON o.wechat_id = wc.wechat_id
WHERE c.tenant_id IS NULL AND c.deleted = 0
UNION ALL
SELECT 'biz_yunke_config', c.id, o.tenant_id, 'COMPANY_FRIEND_WECHAT'
FROM biz_yunke_config c
JOIN biz_wechat_friend wf ON wf.company_code = c.company AND wf.deleted = 0
JOIN tmp_r210_wechat_owner o ON o.wechat_id = wf.wx_id
WHERE c.tenant_id IS NULL AND c.deleted = 0;

DELETE FROM tmp_r210_resolution;
INSERT INTO tmp_r210_resolution(source_table, source_id, tenant_id, tenant_count, evidence_hash)
SELECT source_table, source_id, MIN(tenant_id), COUNT(DISTINCT tenant_id),
       SHA2(GROUP_CONCAT(DISTINCT CONCAT(evidence_code, ':', tenant_id)
                         ORDER BY evidence_code, tenant_id SEPARATOR '|'), 256)
FROM tmp_r210_candidate
GROUP BY source_table, source_id;

-- 先写最小回滚快照，再更新业务行。
INSERT INTO integration_tenant_backfill_backup
    (run_id, source_table, source_id, old_tenant_id, new_tenant_id, row_checksum)
SELECT @run_id, r.source_table, r.source_id, NULL, r.tenant_id,
       SHA2(CONCAT_WS('|', @run_id, r.source_table, r.source_id, 'NULL', r.tenant_id), 256)
FROM tmp_r210_resolution r
WHERE r.tenant_count = 1;

UPDATE biz_yunke_user_map m
JOIN tmp_r210_resolution r ON r.source_table = 'biz_yunke_user_map' AND r.source_id = m.id AND r.tenant_count = 1
SET m.tenant_id = r.tenant_id
WHERE m.tenant_id IS NULL;

UPDATE biz_call_record c
JOIN tmp_r210_resolution r ON r.source_table = 'biz_call_record' AND r.source_id = c.id AND r.tenant_count = 1
SET c.tenant_id = r.tenant_id
WHERE c.tenant_id IS NULL;

UPDATE biz_wechat_chat c
JOIN tmp_r210_resolution r ON r.source_table = 'biz_wechat_chat' AND r.source_id = c.id AND r.tenant_count = 1
SET c.tenant_id = r.tenant_id
WHERE c.tenant_id IS NULL;

UPDATE biz_wechat_friend f
JOIN tmp_r210_resolution r ON r.source_table = 'biz_wechat_friend' AND r.source_id = f.id AND r.tenant_count = 1
SET f.tenant_id = r.tenant_id
WHERE f.tenant_id IS NULL;

UPDATE biz_wechat_friend_info f
JOIN tmp_r210_resolution r ON r.source_table = 'biz_wechat_friend_info' AND r.source_id = f.id AND r.tenant_count = 1
SET f.tenant_id = r.tenant_id
WHERE f.tenant_id IS NULL;

UPDATE biz_wechat_msg_stat s
JOIN tmp_r210_resolution r ON r.source_table = 'biz_wechat_msg_stat' AND r.source_id = s.id AND r.tenant_count = 1
SET s.tenant_id = r.tenant_id
WHERE s.tenant_id IS NULL;

UPDATE biz_yunke_config c
JOIN tmp_r210_resolution r ON r.source_table = 'biz_yunke_config' AND r.source_id = c.id AND r.tenant_count = 1
SET c.tenant_id = r.tenant_id
WHERE c.tenant_id IS NULL;

-- 未解析和证据冲突的记录只登记隔离清单，不归入任何默认租户。
INSERT INTO integration_tenant_quarantine
    (run_id, source_table, source_id, reason_code, candidate_tenant_id, evidence_hash)
SELECT @run_id, targets.source_table, targets.source_id,
       CASE WHEN r.source_id IS NULL THEN 'NO_AUTHORITATIVE_MAPPING' ELSE 'AMBIGUOUS_TENANT' END,
       CASE WHEN r.tenant_count = 1 THEN r.tenant_id ELSE NULL END,
       r.evidence_hash
FROM (
    SELECT 'biz_call_record' source_table, id source_id FROM biz_call_record WHERE tenant_id IS NULL
    UNION ALL SELECT 'biz_yunke_config', id FROM biz_yunke_config WHERE tenant_id IS NULL
    UNION ALL SELECT 'biz_yunke_user_map', id FROM biz_yunke_user_map WHERE tenant_id IS NULL
    UNION ALL SELECT 'biz_wechat_chat', id FROM biz_wechat_chat WHERE tenant_id IS NULL
    UNION ALL SELECT 'biz_wechat_friend', id FROM biz_wechat_friend WHERE tenant_id IS NULL
    UNION ALL SELECT 'biz_wechat_friend_info', id FROM biz_wechat_friend_info WHERE tenant_id IS NULL
    UNION ALL SELECT 'biz_wechat_msg_stat', id FROM biz_wechat_msg_stat WHERE tenant_id IS NULL
) targets
LEFT JOIN tmp_r210_resolution r
       ON r.source_table = targets.source_table AND r.source_id = targets.source_id
ON DUPLICATE KEY UPDATE
    reason_code = VALUES(reason_code), evidence_hash = VALUES(evidence_hash);

COMMIT;

SELECT source_table, COUNT(*) AS backfilled_rows
FROM integration_tenant_backfill_backup
WHERE run_id = @run_id
GROUP BY source_table ORDER BY source_table;
SELECT reason_code, COUNT(*) AS quarantined_rows
FROM integration_tenant_quarantine
WHERE run_id = @run_id
GROUP BY reason_code ORDER BY reason_code;
