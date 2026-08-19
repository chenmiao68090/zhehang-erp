-- V240 员工表加「岗位描述」字段。
--
-- 背景：用户要求在员工表单"基本信息"tab 加岗位描述字段(岗位职责/任职要求/工作内容等自由文本),
-- 与现有岗位 select(postId) 互补——岗位是"我是哪个岗",描述是"这个岗干什么"。
--
-- 不影响历史数据(默认 NULL),不删列,幂等。
-- MySQL 8.0 不支持 ALTER TABLE ... ADD COLUMN IF NOT EXISTS(MariaDB 语法),
-- 用 INFORMATION_SCHEMA + PREPARE 实现幂等。

SET NAMES utf8mb4;

SET @col_exists := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'org_employee'
      AND COLUMN_NAME = 'post_description'
);

SET @sql := IF(
    @col_exists = 0,
    "ALTER TABLE `org_employee` ADD COLUMN `post_description` TEXT COMMENT '岗位描述(岗位职责/任职要求/工作内容)'",
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;