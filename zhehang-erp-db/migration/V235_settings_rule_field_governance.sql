-- V235 系统设置规则/字段治理底座。
-- 仅落地第一批已接入且允许受控维护的纯目录字段；规则目录由代码登记，
-- 各领域规则值仍保存在原唯一事实源中，不创建万能规则表。
--
-- 支持且只支持两条安全路径：
-- A. sys_dict_type/sys_dict_data 均不存在：首次创建V235租户安全结构并种入白名单；
-- B. 两表已经是精确V235结构：幂等补齐缺失种子，不覆盖管理员后续修改。
-- 任意“只存在一张表”或旧V145结构都会在第一处DDL/DML之前失败，不猜租户、不在线改旧表。
--
-- 上线顺序：全库备份 -> 仅执行本文件 -> 结构/种子核对 -> 发布应用。
-- 任意非零退出必须中止应用发布。若基础设施故障在两次CREATE之间中断，只可在确认迁移前0/0且
-- 残留表为空后人工清理；失败后还应分别DROP本文件的两个临时procedure，再重新预检。
-- 回滚：仅当上线前确认走A路径且尚无真实配置写入时，才可按指纹删除19项/3类型并DROP两张新表；
--       走B路径或已经有真实写入时，只回滚代码/入口，绝不DROP或删除配置数据。

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS preflight_v235_dictionary_schema;
DELIMITER $$
CREATE PROCEDURE preflight_v235_dictionary_schema()
BEGIN
  DECLARE v_table_count INT DEFAULT 0;
  DECLARE v_count INT DEFAULT 0;

  SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
   WHERE table_schema = DATABASE()
     AND table_name IN ('sys_dict_type','sys_dict_data');

  IF v_table_count = 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V235 aborted: only one dictionary table exists; manual schema audit required';
  END IF;

  IF v_table_count = 2 THEN
    SELECT COUNT(*) INTO v_count
      FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name IN ('sys_dict_type','sys_dict_data')
       AND engine = 'InnoDB'
       AND table_collation = 'utf8mb4_unicode_ci';
    IF v_count <> 2 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: dictionary tables must use V235 InnoDB/utf8mb4 collation';
    END IF;

    -- B路径只接受V235完整应用映射列，避免缺BaseEntity列或可空租户的混合结构上线后500。
    SELECT COUNT(*) INTO v_count
      FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'sys_dict_type';
    IF v_count <> 11 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_type column count differs from V235';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'sys_dict_type'
       AND (
         (column_name='id' AND data_type='bigint' AND is_nullable='NO' AND extra LIKE '%auto_increment%') OR
         (column_name='dict_name' AND data_type='varchar' AND character_maximum_length=100 AND is_nullable='NO') OR
         (column_name='dict_type' AND data_type='varchar' AND character_maximum_length=100 AND is_nullable='NO') OR
         (column_name='status' AND data_type='tinyint' AND is_nullable='NO' AND column_default='0') OR
         (column_name='remark' AND data_type='varchar' AND character_maximum_length=255 AND is_nullable='YES') OR
         (column_name='create_time' AND data_type='datetime' AND is_nullable='YES') OR
         (column_name='update_time' AND data_type='datetime' AND is_nullable='YES') OR
         (column_name='create_by' AND data_type='bigint' AND is_nullable='YES') OR
         (column_name='update_by' AND data_type='bigint' AND is_nullable='YES') OR
         (column_name='deleted' AND data_type='tinyint' AND is_nullable='NO' AND column_default='0') OR
         (column_name='tenant_id' AND data_type='bigint' AND is_nullable='NO')
       );
    IF v_count <> 11 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_type mapped columns differ from V235';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'sys_dict_data';
    IF v_count <> 14 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_data column count differs from V235';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'sys_dict_data'
       AND (
         (column_name='id' AND data_type='bigint' AND is_nullable='NO' AND extra LIKE '%auto_increment%') OR
         (column_name='dict_type' AND data_type='varchar' AND character_maximum_length=100 AND is_nullable='NO') OR
         (column_name='dict_label' AND data_type='varchar' AND character_maximum_length=100 AND is_nullable='NO') OR
         (column_name='dict_value' AND data_type='varchar' AND character_maximum_length=100 AND is_nullable='NO') OR
         (column_name='dict_sort' AND data_type='int' AND is_nullable='NO' AND column_default='0') OR
         (column_name='is_default' AND data_type='tinyint' AND is_nullable='NO' AND column_default='0') OR
         (column_name='status' AND data_type='tinyint' AND is_nullable='NO' AND column_default='0') OR
         (column_name='remark' AND data_type='varchar' AND character_maximum_length=255 AND is_nullable='YES') OR
         (column_name='create_time' AND data_type='datetime' AND is_nullable='YES') OR
         (column_name='update_time' AND data_type='datetime' AND is_nullable='YES') OR
         (column_name='create_by' AND data_type='bigint' AND is_nullable='YES') OR
         (column_name='update_by' AND data_type='bigint' AND is_nullable='YES') OR
         (column_name='deleted' AND data_type='tinyint' AND is_nullable='NO' AND column_default='0') OR
         (column_name='tenant_id' AND data_type='bigint' AND is_nullable='NO')
       );
    IF v_count <> 14 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_data mapped columns differ from V235';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT table_name, index_name, non_unique,
               GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS columns_in_order,
               SUM(CASE WHEN sub_part IS NOT NULL THEN 1 ELSE 0 END) AS prefix_columns
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name IN ('sys_dict_type','sys_dict_data')
         GROUP BY table_name, index_name, non_unique
      ) idx
     WHERE idx.index_name='PRIMARY' AND idx.non_unique=0
       AND idx.columns_in_order='id' AND idx.prefix_columns=0;
    IF v_count <> 2 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: both dictionary tables require PRIMARY KEY(id)';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT index_name, non_unique,
               GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS columns_in_order,
               SUM(CASE WHEN sub_part IS NOT NULL THEN 1 ELSE 0 END) AS prefix_columns
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'sys_dict_type'
         GROUP BY index_name, non_unique
      ) idx
     WHERE idx.index_name = 'uk_sys_dict_type_tenant_code'
       AND idx.non_unique = 0
       AND idx.prefix_columns = 0
       AND idx.columns_in_order = 'tenant_id,dict_type';
    IF v_count <> 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: existing sys_dict_type is not the exact V235 tenant-safe schema';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT index_name, non_unique,
               GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS columns_in_order,
               SUM(CASE WHEN sub_part IS NOT NULL THEN 1 ELSE 0 END) AS prefix_columns
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'sys_dict_data'
         GROUP BY index_name, non_unique
      ) idx
     WHERE idx.index_name = 'uk_sys_dict_data_tenant_value'
       AND idx.non_unique = 0
       AND idx.prefix_columns = 0
       AND idx.columns_in_order = 'tenant_id,dict_type,dict_value';
    IF v_count <> 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: existing sys_dict_data is not the exact V235 tenant-safe schema';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT index_name, non_unique,
               GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS columns_in_order,
               SUM(CASE WHEN sub_part IS NOT NULL THEN 1 ELSE 0 END) AS prefix_columns
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'sys_dict_type'
         GROUP BY index_name, non_unique
      ) idx
     WHERE idx.index_name = 'idx_sys_dict_type_tenant_status'
       AND idx.non_unique = 1
       AND idx.prefix_columns = 0
       AND idx.columns_in_order = 'tenant_id,status,deleted';
    IF v_count <> 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_type management index differs from V235';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT index_name, non_unique,
               GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS columns_in_order,
               SUM(CASE WHEN sub_part IS NOT NULL THEN 1 ELSE 0 END) AS prefix_columns
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'sys_dict_data'
         GROUP BY index_name, non_unique
      ) idx
     WHERE idx.index_name = 'idx_sys_dict_data_tenant_type_status'
       AND idx.non_unique = 1
       AND idx.prefix_columns = 0
       AND idx.columns_in_order = 'tenant_id,dict_type,status,deleted,dict_sort';
    IF v_count <> 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_data management index differs from V235';
    END IF;

    -- 索引改名也不能绕过检查：两表除PRIMARY和V235租户复合唯一键外，不允许其他唯一约束。
    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT index_name, non_unique,
               GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS columns_in_order
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'sys_dict_type'
         GROUP BY index_name, non_unique
      ) idx
     WHERE idx.non_unique = 0
       AND idx.index_name <> 'PRIMARY'
       AND NOT (idx.index_name='uk_sys_dict_type_tenant_code'
                AND idx.columns_in_order='tenant_id,dict_type');
    IF v_count <> 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_type has an extra global/business unique index';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM (
        SELECT index_name, non_unique,
               GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS columns_in_order
          FROM information_schema.statistics
         WHERE table_schema = DATABASE()
           AND table_name = 'sys_dict_data'
         GROUP BY index_name, non_unique
      ) idx
     WHERE idx.non_unique = 0
       AND idx.index_name <> 'PRIMARY'
       AND NOT (idx.index_name='uk_sys_dict_data_tenant_value'
                AND idx.columns_in_order='tenant_id,dict_type,dict_value');
    IF v_count <> 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_data has an extra global/business unique index';
    END IF;

    SELECT COUNT(*) INTO v_count FROM `sys_dict_type` WHERE `tenant_id` IS NULL;
    IF v_count <> 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_type contains NULL tenant_id';
    END IF;

    SELECT COUNT(*) INTO v_count FROM `sys_dict_data` WHERE `tenant_id` IS NULL;
    IF v_count <> 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: sys_dict_data contains NULL tenant_id';
    END IF;

    SELECT COUNT(*) INTO v_count
      FROM `sys_dict_data` d
      LEFT JOIN `sys_dict_type` t
        ON t.`tenant_id` = d.`tenant_id`
       AND t.`dict_type` = d.`dict_type`
     WHERE t.`id` IS NULL;
    IF v_count <> 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'V235 aborted: orphan dictionary values require manual repair';
    END IF;
  END IF;
END$$
DELIMITER ;
CALL preflight_v235_dictionary_schema();
DROP PROCEDURE IF EXISTS preflight_v235_dictionary_schema;

CREATE TABLE IF NOT EXISTS `sys_dict_type` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_name` VARCHAR(100) NOT NULL COMMENT '字段选项集名称',
  `dict_type` VARCHAR(100) NOT NULL COMMENT '稳定类型编码',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0正常 1停用',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_dict_type_tenant_code` (`tenant_id`,`dict_type`),
  KEY `idx_sys_dict_type_tenant_status` (`tenant_id`,`status`,`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='受控字段选项类型';

CREATE TABLE IF NOT EXISTS `sys_dict_data` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_type` VARCHAR(100) NOT NULL COMMENT '稳定类型编码',
  `dict_label` VARCHAR(100) NOT NULL COMMENT '展示名称',
  `dict_value` VARCHAR(100) NOT NULL COMMENT '稳定存储值，保存后不可修改',
  `dict_sort` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '0否 1是',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0正常 1停用',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` BIGINT DEFAULT NULL COMMENT '创建人',
  `update_by` BIGINT DEFAULT NULL COMMENT '更新人',
  `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  `tenant_id` BIGINT NOT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_dict_data_tenant_value` (`tenant_id`,`dict_type`,`dict_value`),
  KEY `idx_sys_dict_data_tenant_type_status` (`tenant_id`,`dict_type`,`status`,`deleted`,`dict_sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='受控字段选项';

DROP PROCEDURE IF EXISTS seed_v235_governed_fields;
DELIMITER $$
CREATE PROCEDURE seed_v235_governed_fields()
BEGIN
  DECLARE v_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- 软删除的同键属于历史事实，不能在迁移里偷偷复活；必须先人工确认。
  SELECT COUNT(*) INTO v_count
    FROM `sys_dict_type`
   WHERE `tenant_id`=1 AND `deleted`<>0
     AND `dict_type` IN ('crm_consult_business','memo_category','hr_labor_contract_type');
  IF v_count <> 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V235 aborted: a governed dictionary type was previously deleted';
  END IF;

  SELECT COUNT(*) INTO v_count
    FROM `sys_dict_data` d
    JOIN (
      SELECT 'crm_consult_business' dict_type, '工商注册' dict_value UNION ALL
      SELECT 'crm_consult_business','工商变更' UNION ALL
      SELECT 'crm_consult_business','代账' UNION ALL
      SELECT 'crm_consult_business','代理记账' UNION ALL
      SELECT 'crm_consult_business','税务合规' UNION ALL
      SELECT 'crm_consult_business','商标业务' UNION ALL
      SELECT 'crm_consult_business','专利业务' UNION ALL
      SELECT 'crm_consult_business','项目申报' UNION ALL
      SELECT 'crm_consult_business','刻章业务' UNION ALL
      SELECT 'crm_consult_business','未知业务' UNION ALL
      SELECT 'memo_category','客户跟进' UNION ALL
      SELECT 'memo_category','财务协同' UNION ALL
      SELECT 'memo_category','团队管理' UNION ALL
      SELECT 'memo_category','系统优化' UNION ALL
      SELECT 'memo_category','学习成长' UNION ALL
      SELECT 'memo_category','个人事项' UNION ALL
      SELECT 'hr_labor_contract_type','固定期限' UNION ALL
      SELECT 'hr_labor_contract_type','无固定期限' UNION ALL
      SELECT 'hr_labor_contract_type','以完成一定工作为期限'
    ) expected
      ON expected.dict_type = d.dict_type AND expected.dict_value = d.dict_value
   WHERE d.`tenant_id`=1 AND d.`deleted`<>0;
  IF v_count <> 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V235 aborted: a governed dictionary value was previously deleted';
  END IF;

  START TRANSACTION;

  INSERT INTO `sys_dict_type`
    (`dict_name`,`dict_type`,`status`,`remark`,`tenant_id`,`deleted`)
  VALUES
    ('咨询/成交业务','crm_consult_business',0,'找客户和新增线索共用；稳定值保存后不可修改',1,0),
    ('备忘分类','memo_category',0,'个人备忘新增与筛选共用；停用后历史记录仍回显',1,0),
    ('劳动合同类型','hr_labor_contract_type',0,'劳动合同新增与筛选共用；合同状态不在此维护',1,0)
  ON DUPLICATE KEY UPDATE `dict_type` = VALUES(`dict_type`);

  INSERT INTO `sys_dict_data`
    (`dict_type`,`dict_label`,`dict_value`,`dict_sort`,`is_default`,`status`,`remark`,`tenant_id`,`deleted`)
  VALUES
    ('crm_consult_business','工商注册','工商注册',10,0,0,NULL,1,0),
    ('crm_consult_business','工商变更','工商变更',20,0,0,NULL,1,0),
    ('crm_consult_business','代账','代账',30,0,0,'保留历史原值，不与代理记账静默合并',1,0),
    ('crm_consult_business','代理记账','代理记账',40,0,0,NULL,1,0),
    ('crm_consult_business','税务合规','税务合规',50,0,0,NULL,1,0),
    ('crm_consult_business','商标业务','商标业务',60,0,0,NULL,1,0),
    ('crm_consult_business','专利业务','专利业务',70,0,0,NULL,1,0),
    ('crm_consult_business','项目申报','项目申报',80,0,0,NULL,1,0),
    ('crm_consult_business','刻章业务','刻章业务',90,0,0,NULL,1,0),
    ('crm_consult_business','未知业务','未知业务',100,0,0,NULL,1,0),
    ('memo_category','客户跟进','客户跟进',10,1,0,NULL,1,0),
    ('memo_category','财务协同','财务协同',20,0,0,NULL,1,0),
    ('memo_category','团队管理','团队管理',30,0,0,NULL,1,0),
    ('memo_category','系统优化','系统优化',40,0,0,NULL,1,0),
    ('memo_category','学习成长','学习成长',50,0,0,NULL,1,0),
    ('memo_category','个人事项','个人事项',60,0,0,NULL,1,0),
    ('hr_labor_contract_type','固定期限','固定期限',10,1,0,NULL,1,0),
    ('hr_labor_contract_type','无固定期限','无固定期限',20,0,0,NULL,1,0),
    ('hr_labor_contract_type','以完成一定工作为期限','以完成一定工作为期限',30,0,0,NULL,1,0)
  ON DUPLICATE KEY UPDATE `dict_value` = VALUES(`dict_value`);

  SELECT COUNT(*) INTO v_count
    FROM (
      SELECT 'crm_consult_business' dict_type UNION ALL
      SELECT 'memo_category' UNION ALL
      SELECT 'hr_labor_contract_type'
    ) expected
    LEFT JOIN `sys_dict_type` t
      ON t.`tenant_id`=1 AND t.`dict_type`=expected.dict_type AND t.`deleted`=0
   WHERE t.`id` IS NULL;
  IF v_count <> 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V235 aborted: one or more governed dictionary types are missing';
  END IF;

  SELECT COUNT(*) INTO v_count
    FROM (
      SELECT 'crm_consult_business' dict_type, '工商注册' dict_value UNION ALL
      SELECT 'crm_consult_business','工商变更' UNION ALL
      SELECT 'crm_consult_business','代账' UNION ALL
      SELECT 'crm_consult_business','代理记账' UNION ALL
      SELECT 'crm_consult_business','税务合规' UNION ALL
      SELECT 'crm_consult_business','商标业务' UNION ALL
      SELECT 'crm_consult_business','专利业务' UNION ALL
      SELECT 'crm_consult_business','项目申报' UNION ALL
      SELECT 'crm_consult_business','刻章业务' UNION ALL
      SELECT 'crm_consult_business','未知业务' UNION ALL
      SELECT 'memo_category','客户跟进' UNION ALL
      SELECT 'memo_category','财务协同' UNION ALL
      SELECT 'memo_category','团队管理' UNION ALL
      SELECT 'memo_category','系统优化' UNION ALL
      SELECT 'memo_category','学习成长' UNION ALL
      SELECT 'memo_category','个人事项' UNION ALL
      SELECT 'hr_labor_contract_type','固定期限' UNION ALL
      SELECT 'hr_labor_contract_type','无固定期限' UNION ALL
      SELECT 'hr_labor_contract_type','以完成一定工作为期限'
    ) expected
    LEFT JOIN `sys_dict_data` d
      ON d.`tenant_id`=1
     AND d.`dict_type`=expected.dict_type
     AND d.`dict_value`=expected.dict_value
     AND d.`deleted`=0
   WHERE d.`id` IS NULL;
  IF v_count <> 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'V235 aborted: one or more governed dictionary seed values are missing';
  END IF;

  COMMIT;
END$$
DELIMITER ;
CALL seed_v235_governed_fields();
DROP PROCEDURE IF EXISTS seed_v235_governed_fields;
