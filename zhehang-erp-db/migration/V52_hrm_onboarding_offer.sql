-- V52: 招聘通过后的待入职、入职登记表、Offer 与员工档案草稿
-- 1) 候选人面试通过后进入待入职台账
-- 2) 支持随机 token 的候选人登记表链接、可配置字段、提交/确认留痕
-- 3) 支持 Offer 模板内容生成、发送状态记录、员工档案草稿

DELIMITER $$

DROP PROCEDURE IF EXISTS add_index_if_missing$$
CREATE PROCEDURE add_index_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_index_name VARCHAR(64),
  IN p_index_ddl TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD INDEX `', p_index_name, '` ', p_index_ddl);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

ALTER TABLE `hrm_resume`
  MODIFY COLUMN `status` TINYINT DEFAULT 0 COMMENT '状态(0待筛选 1待/初面 2已通过 3已淘汰 4复试中 5已入职 6未入职 7待入职)';

ALTER TABLE `org_employee`
  MODIFY COLUMN `status` TINYINT DEFAULT 1 COMMENT '状态(0待入职草稿 1在职 2试用 3离职)';

CREATE TABLE IF NOT EXISTS `hrm_onboarding` (
  `id`                 BIGINT        NOT NULL AUTO_INCREMENT COMMENT '待入职记录ID',
  `resume_id`          BIGINT        NOT NULL                COMMENT '候选人/简历ID',
  `recruit_id`         BIGINT        DEFAULT NULL            COMMENT '招聘需求ID',
  `employee_id`        BIGINT        DEFAULT NULL            COMMENT '生成的员工档案ID',
  `name`               VARCHAR(64)   NOT NULL                COMMENT '候选人姓名',
  `phone`              VARCHAR(20)   DEFAULT NULL            COMMENT '手机号',
  `email`              VARCHAR(128)  DEFAULT NULL            COMMENT '邮箱',
  `position_name`      VARCHAR(128)  DEFAULT NULL            COMMENT '应聘岗位',
  `status`             TINYINT       DEFAULT 0               COMMENT '状态(0待发登记 1已提交登记 2信息已确认 3Offer已生成 4Offer已发送 5员工草稿 6已入职 7取消)',
  `form_token`         VARCHAR(64)   NOT NULL                COMMENT '候选人登记表访问Token',
  `form_schema`        TEXT          DEFAULT NULL            COMMENT '登记表字段配置JSON',
  `form_data`          TEXT          DEFAULT NULL            COMMENT '候选人提交数据JSON',
  `expected_hire_date` DATE          DEFAULT NULL            COMMENT '预计入职日期',
  `submitted_time`     DATETIME      DEFAULT NULL            COMMENT '候选人提交时间',
  `confirmed_time`     DATETIME      DEFAULT NULL            COMMENT 'HR确认信息时间',
  `offer_template`     TEXT          DEFAULT NULL            COMMENT 'Offer模板',
  `offer_content`      TEXT          DEFAULT NULL            COMMENT '生成后的Offer内容',
  `offer_send_status`  TINYINT       DEFAULT 0               COMMENT 'Offer发送状态(0未发送 1已标记发送 2发送失败)',
  `offer_sent_time`    DATETIME      DEFAULT NULL            COMMENT 'Offer发送/标记发送时间',
  `offer_send_error`   VARCHAR(500)  DEFAULT NULL            COMMENT 'Offer发送失败原因',
  `remark`             VARCHAR(500)  DEFAULT NULL            COMMENT '备注',
  `create_time`        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  `update_time`        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_by`          BIGINT        DEFAULT NULL,
  `update_by`          BIGINT        DEFAULT NULL,
  `deleted`            TINYINT(1)    DEFAULT 0,
  `tenant_id`          BIGINT        DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_form_token` (`form_token`),
  KEY `idx_resume_id` (`resume_id`),
  KEY `idx_recruit_id` (`recruit_id`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expected_hire_date` (`expected_hire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='待入职与Offer管理表';

CALL add_index_if_missing('hrm_resume', 'idx_resume_onboarding_status', '(`status`)');
CALL add_index_if_missing('org_employee', 'idx_employee_onboarding_status', '(`status`)');

DROP PROCEDURE IF EXISTS add_index_if_missing;
