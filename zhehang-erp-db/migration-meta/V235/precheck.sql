-- V235 系统设置规则/字段治理底座 前置检查：只读，不修改数据。
--
-- 支持且只支持两条安全路径：
--   A_NEW_TABLES：sys_dict_type/sys_dict_data 均不存在 → 首次创建 V235 租户安全结构并种入白名单。
--   B：两表已是精确 V235 结构 → 幂等补齐缺失种子。
-- 任意「只存在一张表」或旧 V145 结构都会 BLOCKED_PARTIAL_SCHEMA（阻塞，不猜租户、不在线改旧表）。

-- 1) 结构预检：两表是否存在/都不存在（只读 information_schema）
SELECT table_schema, table_name, table_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('sys_dict_type','sys_dict_data')
ORDER BY table_name;

-- 2) 列结构核对（只读 information_schema.columns）
SELECT table_name, column_name, column_type, is_nullable
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name IN ('sys_dict_type','sys_dict_data')
ORDER BY table_name, ordinal_position;

-- 3) 索引核对（只读 information_schema.statistics）
SELECT table_name, index_name,
       GROUP_CONCAT(column_name ORDER BY seq_in_index) AS index_columns,
       non_unique
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name IN ('sys_dict_type','sys_dict_data')
GROUP BY table_name, index_name, non_unique;

-- 4) 正式迁移会调用 preflight_v235_dictionary_schema 做结构预检、
--    seed_v235_governed_fields 种入 3 类 19 项受控种子；本文件只读，不做任何写入。
