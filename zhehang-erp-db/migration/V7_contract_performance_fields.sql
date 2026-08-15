-- ============================================================
-- V7: 合同业绩拆分字段(对齐参考系统业绩勾稽)
-- 业绩 = 合同金额 − 支出 − 退费 − 核定成本
-- 维度:签约类型(新签/续签) × 是否有增值
-- 幂等性:重复执行报"列已存在"可忽略,或按需先 DROP。
-- ============================================================

USE `zhehang_erp`;

ALTER TABLE `crm_contract`
  ADD COLUMN `sign_type`     TINYINT       DEFAULT 1    COMMENT '签约类型(1新签 2续签)'        AFTER `status`,
  ADD COLUMN `value_added`   TINYINT       DEFAULT 0    COMMENT '续签是否有增值(0无 1有)'      AFTER `sign_type`,
  ADD COLUMN `approved_cost` DECIMAL(12,2) DEFAULT 0.00 COMMENT '核定成本(业绩计提扣减项)'     AFTER `value_added`,
  ADD COLUMN `expense`       DECIMAL(12,2) DEFAULT 0.00 COMMENT '支出'                          AFTER `approved_cost`,
  ADD COLUMN `refund`        DECIMAL(12,2) DEFAULT 0.00 COMMENT '退费'                          AFTER `expense`;

-- 历史数据回填默认值
UPDATE `crm_contract` SET `sign_type` = 1 WHERE `sign_type` IS NULL;
UPDATE `crm_contract` SET `value_added` = 0 WHERE `value_added` IS NULL;
UPDATE `crm_contract` SET `approved_cost` = 0 WHERE `approved_cost` IS NULL;
UPDATE `crm_contract` SET `expense` = 0 WHERE `expense` IS NULL;
UPDATE `crm_contract` SET `refund` = 0 WHERE `refund` IS NULL;
