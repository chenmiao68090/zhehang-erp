-- ============================================================
-- V22: 销售回款/提成、报表定义 表对齐实体(救活5个500接口)
-- 背景(全模块普查发现):同 biz_* 套路,这几张表"实体多了字段、表里没这列",
--   MyBatis-Plus 生成的SQL引用不存在的列 → 500:
--   - sales_receipt 缺 customer_name/order_no/received_amount/due_date
--     → /sales/receipt/overdue(逾期应收) /sales/receipt/stats(回款统计) 报 Unknown column 'due_date'
--   - sales_commission 缺 employee_name/order_no → /sales/commission/statistics 报 Unknown column 'employee_name'
--   - report_definition 缺 category/data_source_type/sql_query/chart_config/filter_config/permission_type
--     → /report/definition/category 报 Unknown column 'category'(list 同样会炸)
-- 处理:纯增量补列(三表当前均0行,零数据风险)。不改业务逻辑。
-- 幂等:每表用 information_schema 守卫一个签名列,缺则一次性补齐该表所有缺列。
-- ============================================================

USE `zhehang_erp`;

-- ① sales_receipt
SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_receipt' AND COLUMN_NAME='customer_name');
SET @ddl := IF(@e=0,
  'ALTER TABLE `sales_receipt`
     ADD COLUMN `customer_name`   VARCHAR(100)  DEFAULT NULL COMMENT ''客户名称'' AFTER `customer_id`,
     ADD COLUMN `order_no`        VARCHAR(64)   DEFAULT NULL COMMENT ''订单编号'' AFTER `order_id`,
     ADD COLUMN `received_amount` DECIMAL(14,2) DEFAULT NULL COMMENT ''已收金额'' AFTER `amount`,
     ADD COLUMN `due_date`        DATE          DEFAULT NULL COMMENT ''应收到期日'' AFTER `receipt_date`',
  'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- ② sales_commission
SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='sales_commission' AND COLUMN_NAME='employee_name');
SET @ddl := IF(@e=0,
  'ALTER TABLE `sales_commission`
     ADD COLUMN `employee_name` VARCHAR(64) DEFAULT NULL COMMENT ''员工姓名'' AFTER `employee_id`,
     ADD COLUMN `order_no`      VARCHAR(64) DEFAULT NULL COMMENT ''订单编号'' AFTER `order_id`',
  'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

-- ③ report_definition
SET @e := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='report_definition' AND COLUMN_NAME='category');
SET @ddl := IF(@e=0,
  'ALTER TABLE `report_definition`
     ADD COLUMN `category`         VARCHAR(64)  DEFAULT NULL COMMENT ''报表分类'' AFTER `name`,
     ADD COLUMN `data_source_type` VARCHAR(32)  DEFAULT NULL COMMENT ''数据源类型'',
     ADD COLUMN `sql_query`        TEXT                      COMMENT ''查询SQL'',
     ADD COLUMN `chart_config`     TEXT                      COMMENT ''图表配置'',
     ADD COLUMN `filter_config`    TEXT                      COMMENT ''筛选配置'',
     ADD COLUMN `permission_type`  VARCHAR(32)  DEFAULT NULL COMMENT ''权限类型''',
  'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
