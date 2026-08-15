-- =============================================================================
-- V113  代理记账提单(biz_bookkeeping_order)表单增量补 5 组字段(飞书建议 132):
--        1) company_nature      公司性质(6 项固定下拉:个体户查账/核定、小规模0申报/有账、一般纳税人0申报/有账)
--        2) coop_period         合作周期(一年/多年);coop_start/coop_end 合作开始/到期日期
--        3) reg_address         注册地址(文本)+ reg_address_owner 归属(客户/公司)
--        4) bookkeeping_amount  代账金额(DECIMAL(12,2),与 contract_amount 语义不同,另加)
--        5) special_remark      特殊备注(VARCHAR(500),与既有 remark 语义不同,另加)
--        原有 contract_amount(合同金额)/remark(备注)/service_start~service_end(服务周期)保留不动;
--        cockpit(驾驶舱)/steward(管家)读取本表,故仅新增列、绝不改动已有列含义。
--        幂等:参照 V102/V110/V111 存储过程写法,逐列 information_schema 判断不存在才 ADD,可重复执行。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_bookkeeping_order_fields;
DELIMITER //
CREATE PROCEDURE add_bookkeeping_order_fields()
BEGIN
  -- 1) 公司性质
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'company_nature') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `company_nature` VARCHAR(64) NULL COMMENT '公司性质(个体户(查账)/个体户(核定)/小规模(0申报)/小规模(有账)/一般纳税人(0申报)/一般纳税人(有账))';
  END IF;

  -- 2) 合作周期 + 合作开始/到期
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'coop_period') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `coop_period` VARCHAR(16) NULL COMMENT '合作周期(一年/多年)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'coop_start') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `coop_start` DATE NULL COMMENT '合作开始时间';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'coop_end') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `coop_end` DATE NULL COMMENT '合作到期时间';
  END IF;

  -- 3) 注册地址 + 归属
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'reg_address') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `reg_address` VARCHAR(255) NULL COMMENT '注册地址';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'reg_address_owner') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `reg_address_owner` VARCHAR(16) NULL COMMENT '注册地址归属(客户/公司)';
  END IF;

  -- 4) 代账金额
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'bookkeeping_amount') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `bookkeeping_amount` DECIMAL(12,2) NULL COMMENT '代账金额';
  END IF;

  -- 5) 特殊备注
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_bookkeeping_order'
                   AND COLUMN_NAME = 'special_remark') THEN
    ALTER TABLE `biz_bookkeeping_order`
      ADD COLUMN `special_remark` VARCHAR(500) NULL COMMENT '特殊备注';
  END IF;
END //
DELIMITER ;
CALL add_bookkeeping_order_fields();
DROP PROCEDURE IF EXISTS add_bookkeeping_order_fields;
