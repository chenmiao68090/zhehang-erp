-- =============================================================================
-- V154 审批中心阶段2·引擎强化(配套代码:workflow 模块快照/退回/催办/附件/目录)
-- 内容:
--   0) V44遗留:12条流程19个仍为 text 的日期字段,用 JSON_SET 修为 date/datetime
--      (放在快照回填之前,让快照带上修正后的表单配置);
--   1) wf_process_version 发布版本快照表 + 为全部现有定义回填当前版本快照;
--   2) wf_instance 加 process_version_id 并回填(在途实例永远读自己的快照);
--   3) wf_task 加 node_id(按ID流转防改名打死在途单,按 node_name 一次性反查回填)
--      + deadline(审批时限) + timeout_notified(超时提醒防重);
--   4) 三张表 status 列注释按代码真实取值(0起步)重写 + DEFAULT 0
--      (存量数据本就按0语义写入,无需改值;历史上或签作废与拒绝同码2的旧行保留原状,
--       新写入一律用5=已作废);
--   5) wf_process_def 加 icon/sort/group_name(description已存在)+ 回填26条发起目录;
--   6) wf_attachment 审批附件表(引用 file_info.id,form_data 不再进 base64)。
-- 安全:全部幂等;JSON 改动只用 JSON_SET+JSON_SEARCH 定位(路径变换用 SUBSTRING_INDEX,
--       不对数据用字符串 REPLACE);不删列不删表不改存量业务值。
-- =============================================================================

-- ---------- 0/6. V44遗留:text 日期字段修为 date/datetime ----------
DROP PROCEDURE IF EXISTS fix_wf_field_type;
DELIMITER //
CREATE PROCEDURE fix_wf_field_type(IN pkey VARCHAR(100), IN fld VARCHAR(64), IN newType VARCHAR(16))
BEGIN
  UPDATE wf_process_def
  SET form_config = JSON_SET(form_config,
      CONCAT(SUBSTRING_INDEX(JSON_UNQUOTE(JSON_SEARCH(form_config, 'one', fld, NULL, '$[*].field')), '.field', 1), '.type'),
      newType)
  WHERE process_key = pkey AND deleted = 0 AND JSON_VALID(form_config)
    AND JSON_SEARCH(form_config, 'one', fld, NULL, '$[*].field') IS NOT NULL
    AND JSON_UNQUOTE(JSON_EXTRACT(form_config,
        CONCAT(SUBSTRING_INDEX(JSON_UNQUOTE(JSON_SEARCH(form_config, 'one', fld, NULL, '$[*].field')), '.field', 1), '.type'))) = 'text';
END//
DELIMITER ;
CALL fix_wf_field_type('business_trip', 'startDate', 'date');
CALL fix_wf_field_type('business_trip', 'endDate', 'date');
CALL fix_wf_field_type('outgoing', 'startTime', 'datetime');
CALL fix_wf_field_type('overtime', 'overtimeDate', 'date');
CALL fix_wf_field_type('overtime', 'startTime', 'datetime');
CALL fix_wf_field_type('overtime', 'endTime', 'datetime');
CALL fix_wf_field_type('makeup', 'makeupDate', 'date');
CALL fix_wf_field_type('loan', 'repayDate', 'date');
CALL fix_wf_field_type('seal_out', 'outDate', 'date');
CALL fix_wf_field_type('seal_out', 'returnDate', 'date');
CALL fix_wf_field_type('meeting_room', 'date', 'date');
CALL fix_wf_field_type('meeting_room', 'startTime', 'datetime');
CALL fix_wf_field_type('meeting_room', 'endTime', 'datetime');
CALL fix_wf_field_type('onboard', 'entryDate', 'date');
CALL fix_wf_field_type('regular', 'entryDate', 'date');
CALL fix_wf_field_type('regular', 'regularDate', 'date');
CALL fix_wf_field_type('transfer', 'effectiveDate', 'date');
CALL fix_wf_field_type('resign', 'lastDate', 'date');
CALL fix_wf_field_type('promotion', 'effectiveDate', 'date');
DROP PROCEDURE IF EXISTS fix_wf_field_type;

-- ---------- 1/6. 发布版本快照表 ----------
CREATE TABLE IF NOT EXISTS `wf_process_version` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '快照ID',
  `process_def_id` BIGINT NOT NULL COMMENT '流程定义ID',
  `version` INT NOT NULL COMMENT '定义版本号(对应发布时 wf_process_def.version)',
  `name` VARCHAR(200) DEFAULT NULL COMMENT '发布时的流程名称',
  `form_config` JSON DEFAULT NULL COMMENT '表单配置快照',
  `process_config` JSON DEFAULT NULL COMMENT '流程配置快照',
  `publish_by` BIGINT DEFAULT NULL COMMENT '发布人用户ID',
  `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除:0否 1是',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_def_version` (`process_def_id`, `version`),
  KEY `idx_wfpv_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流程定义发布版本快照(在途实例读自己绑定的快照,改定义不影响在途单)';

-- 为全部现有定义按当前版本回填快照(含已停用:其在途实例也要有快照可读)
INSERT INTO wf_process_version (process_def_id, version, name, form_config, process_config, publish_by, publish_time, tenant_id)
SELECT d.id, d.version, d.name, d.form_config, d.process_config, d.update_by, COALESCE(d.update_time, NOW()), d.tenant_id
FROM wf_process_def d
WHERE d.deleted = 0
  AND NOT EXISTS (SELECT 1 FROM wf_process_version v WHERE v.process_def_id = d.id AND v.version = d.version);

-- ---------- 2/6 + 3/6 + 4/6 + 5/6. 幂等加列/改注释 ----------
DROP PROCEDURE IF EXISTS upgrade_approval_phase2;
DELIMITER //
CREATE PROCEDURE upgrade_approval_phase2()
BEGIN
  -- wf_instance.process_version_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wf_instance'
                   AND COLUMN_NAME = 'process_version_id') THEN
    ALTER TABLE `wf_instance`
      ADD COLUMN `process_version_id` BIGINT DEFAULT NULL COMMENT '绑定的流程版本快照ID(发起时固定,在途永远读快照)' AFTER `process_def_id`,
      ADD KEY `idx_wfi_version` (`process_version_id`);
  END IF;

  -- wf_task.node_id / deadline / timeout_notified
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wf_task'
                   AND COLUMN_NAME = 'node_id') THEN
    ALTER TABLE `wf_task`
      ADD COLUMN `node_id` VARCHAR(64) DEFAULT NULL COMMENT '流程节点ID(引擎按ID流转,防节点改名把在途单打死)' AFTER `node_name`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wf_task'
                   AND COLUMN_NAME = 'deadline') THEN
    ALTER TABLE `wf_task`
      ADD COLUMN `deadline` DATETIME DEFAULT NULL COMMENT '审批时限(节点timeoutHours生成;空=不限时)' AFTER `handle_time`,
      ADD COLUMN `timeout_notified` TINYINT(1) DEFAULT 0 COMMENT '超时提醒已发:0否 1是(防重复提醒)' AFTER `deadline`;
  END IF;

  -- status 注释按代码真实取值重写 + DEFAULT 0(存量值本就按0语义写入,不改数据)
  ALTER TABLE `wf_instance`
    MODIFY COLUMN `status` TINYINT DEFAULT 0 COMMENT '状态:0进行中 1已通过 2已拒绝 3已撤销 4待修改(被退回)';
  ALTER TABLE `wf_task`
    MODIFY COLUMN `status` TINYINT DEFAULT 0 COMMENT '状态:0待处理 1已通过 2已拒绝 3已转交 4已抄送 5已作废(或签他人已办/撤销/退回;V154前旧数据作废与拒绝同为2,保留原状)';
  ALTER TABLE `wf_process_def`
    MODIFY COLUMN `status` TINYINT DEFAULT 0 COMMENT '状态:0草稿 1已发布 2已停用';

  -- wf_process_def 发起目录列(description 已存在)
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wf_process_def'
                   AND COLUMN_NAME = 'icon') THEN
    ALTER TABLE `wf_process_def`
      ADD COLUMN `icon` VARCHAR(64) DEFAULT NULL COMMENT '发起卡片图标(Element Plus 图标组件名)' AFTER `description`,
      ADD COLUMN `sort` INT DEFAULT 0 COMMENT '同分组内排序(小在前)' AFTER `icon`,
      ADD COLUMN `group_name` VARCHAR(32) DEFAULT NULL COMMENT '发起目录分组:attendance假勤/finance财务/admin行政/hr人事/biz业务/other其他' AFTER `sort`;
  END IF;
END//
DELIMITER ;
CALL upgrade_approval_phase2();
DROP PROCEDURE IF EXISTS upgrade_approval_phase2;

-- 实例绑定快照回填(只填空值)
UPDATE wf_instance i
JOIN wf_process_def d ON d.id = i.process_def_id
JOIN wf_process_version v ON v.process_def_id = d.id AND v.version = d.version
SET i.process_version_id = v.id
WHERE i.process_version_id IS NULL;

-- wf_task.node_id 按 node_name 在实例快照里一次性反查回填(路径变换用 SUBSTRING_INDEX,不用 REPLACE)
UPDATE wf_task t
JOIN wf_instance i ON i.id = t.instance_id
JOIN wf_process_version v ON v.id = i.process_version_id
SET t.node_id = JSON_UNQUOTE(JSON_EXTRACT(v.process_config,
    CONCAT(SUBSTRING_INDEX(JSON_UNQUOTE(JSON_SEARCH(v.process_config, 'one', t.node_name, NULL, '$.nodes[*].name')), '.name', 1), '.id')))
WHERE t.node_id IS NULL
  AND t.node_name IS NOT NULL
  AND JSON_VALID(v.process_config)
  AND JSON_SEARCH(v.process_config, 'one', t.node_name, NULL, '$.nodes[*].name') IS NOT NULL;

-- ---------- 目录回填(只填 icon 为空的行,管理员后续可改) ----------
UPDATE wf_process_def SET icon='Calendar',      sort=1, group_name='attendance' WHERE deleted=0 AND icon IS NULL AND process_key='leave';
UPDATE wf_process_def SET icon='Suitcase',      sort=2, group_name='attendance' WHERE deleted=0 AND icon IS NULL AND process_key='business_trip';
UPDATE wf_process_def SET icon='Position',      sort=3, group_name='attendance' WHERE deleted=0 AND icon IS NULL AND process_key='outgoing';
UPDATE wf_process_def SET icon='MoonNight',     sort=4, group_name='attendance' WHERE deleted=0 AND icon IS NULL AND process_key='overtime';
UPDATE wf_process_def SET icon='AlarmClock',    sort=5, group_name='attendance' WHERE deleted=0 AND icon IS NULL AND process_key='makeup';
UPDATE wf_process_def SET icon='Money',         sort=1, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='expense';
UPDATE wf_process_def SET icon='Wallet',        sort=2, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='payment';
UPDATE wf_process_def SET icon='Coin',          sort=3, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='cost';
UPDATE wf_process_def SET icon='CreditCard',    sort=4, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='loan';
UPDATE wf_process_def SET icon='RefreshLeft',   sort=5, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='refund';
UPDATE wf_process_def SET icon='WalletFilled',  sort=6, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='petty_cash';
UPDATE wf_process_def SET icon='Sell',          sort=7, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='receipt';
UPDATE wf_process_def SET icon='Tickets',       sort=8, group_name='finance'    WHERE deleted=0 AND icon IS NULL AND process_key='invoice';
UPDATE wf_process_def SET icon='Stamp',         sort=1, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='seal';
UPDATE wf_process_def SET icon='TakeawayBox',   sort=2, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='seal_out';
UPDATE wf_process_def SET icon='ShoppingCart',  sort=3, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='purchase';
UPDATE wf_process_def SET icon='OfficeBuilding',sort=4, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='meeting_room';
UPDATE wf_process_def SET icon='Document',      sort=5, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='contract';
UPDATE wf_process_def SET icon='Share',         sort=6, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='referral';
UPDATE wf_process_def SET icon='Present',       sort=7, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='campaign_fund';
UPDATE wf_process_def SET icon='Memo',          sort=8, group_name='admin'      WHERE deleted=0 AND icon IS NULL AND process_key='general';
UPDATE wf_process_def SET icon='CirclePlus',    sort=1, group_name='hr'         WHERE deleted=0 AND icon IS NULL AND process_key='onboard';
UPDATE wf_process_def SET icon='CircleCheck',   sort=2, group_name='hr'         WHERE deleted=0 AND icon IS NULL AND process_key='regular';
UPDATE wf_process_def SET icon='Top',           sort=3, group_name='hr'         WHERE deleted=0 AND icon IS NULL AND process_key='promotion';
UPDATE wf_process_def SET icon='Switch',        sort=4, group_name='hr'         WHERE deleted=0 AND icon IS NULL AND process_key='transfer';
UPDATE wf_process_def SET icon='SwitchButton',  sort=5, group_name='hr'         WHERE deleted=0 AND icon IS NULL AND process_key='resign';
-- 兜底:其余没归组的流程(管理员手建)按分类映射,分类不认识的进 other
UPDATE wf_process_def SET icon='Memo', sort=99,
  group_name=CASE
    WHEN category IN ('attendance','考勤') THEN 'attendance'
    WHEN category IN ('finance','财务') THEN 'finance'
    WHEN category IN ('admin','administration','行政','supply','供应链','contract','合同') THEN 'admin'
    WHEN category IN ('hr','hrm','人事') THEN 'hr'
    WHEN category IN ('biz','business','业务') THEN 'biz'
    ELSE 'other' END
WHERE deleted=0 AND icon IS NULL;

-- ---------- 6/6. 审批附件表(引用 file_info,form_data 只存附件ID数组) ----------
CREATE TABLE IF NOT EXISTS `wf_attachment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '附件ID',
  `instance_id` BIGINT NOT NULL COMMENT '流程实例ID',
  `file_id` BIGINT NOT NULL COMMENT 'file_info 文件ID(路径/版本由 file 模块管理)',
  `file_name` VARCHAR(255) DEFAULT NULL COMMENT '文件名(冗余,列表直接展示)',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件字节数',
  `mime_type` VARCHAR(128) DEFAULT NULL COMMENT 'MIME类型(前端判断可否图片预览)',
  `upload_by` BIGINT DEFAULT NULL COMMENT '上传人用户ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除:0否 1是',
  `tenant_id` BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_wfa_instance` (`instance_id`),
  KEY `idx_wfa_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审批附件(真文件走file模块,禁base64进form_data)';
