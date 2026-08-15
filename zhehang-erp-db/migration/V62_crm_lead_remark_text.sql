SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE `zhehang_erp`;

-- 天眼查/工商批量导入会携带经营范围、注册地址、年报等长文本。
-- 原 remark VARCHAR(500) 会导致整批导入因第一条超长而回滚,这里扩为 TEXT。
ALTER TABLE `crm_lead`
  MODIFY COLUMN `remark` TEXT NULL COMMENT '备注';
