-- V53: 员工档案附件字段
-- 保存简历、学历证书、技能证书、身份证正反面对应的文件中心ID与文件名。
-- 幂等: 只在列不存在时新增。

DELIMITER $$

DROP PROCEDURE IF EXISTS add_employee_column_if_missing$$
CREATE PROCEDURE add_employee_column_if_missing(
  IN p_column_name VARCHAR(64),
  IN p_column_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'org_employee'
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `org_employee` ADD COLUMN `', p_column_name, '` ', p_column_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL add_employee_column_if_missing('resume_file_id', 'BIGINT DEFAULT NULL COMMENT ''简历档案文件ID''');
CALL add_employee_column_if_missing('resume_file_name', 'VARCHAR(255) DEFAULT NULL COMMENT ''简历档案文件名''');
CALL add_employee_column_if_missing('education_cert_file_id', 'BIGINT DEFAULT NULL COMMENT ''学历证书文件ID''');
CALL add_employee_column_if_missing('education_cert_file_name', 'VARCHAR(255) DEFAULT NULL COMMENT ''学历证书文件名''');
CALL add_employee_column_if_missing('skill_cert_file_id', 'BIGINT DEFAULT NULL COMMENT ''技能证书文件ID''');
CALL add_employee_column_if_missing('skill_cert_file_name', 'VARCHAR(255) DEFAULT NULL COMMENT ''技能证书文件名''');
CALL add_employee_column_if_missing('id_card_front_file_id', 'BIGINT DEFAULT NULL COMMENT ''身份证正面文件ID''');
CALL add_employee_column_if_missing('id_card_front_file_name', 'VARCHAR(255) DEFAULT NULL COMMENT ''身份证正面文件名''');
CALL add_employee_column_if_missing('id_card_back_file_id', 'BIGINT DEFAULT NULL COMMENT ''身份证反面文件ID''');
CALL add_employee_column_if_missing('id_card_back_file_name', 'VARCHAR(255) DEFAULT NULL COMMENT ''身份证反面文件名''');

DROP PROCEDURE IF EXISTS add_employee_column_if_missing;
