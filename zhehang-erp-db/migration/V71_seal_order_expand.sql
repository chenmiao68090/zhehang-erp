-- =============================================================================
-- V71  刻章业务·提单字段扩展(A1 核心表单)
-- 在 V65 biz_seal_order 基础上补齐:业绩归属/业务类型/收款方式/印章状态/刻章城市/
-- 印章材质/备案寄出交付/提单年月 等字段。全部可空,不影响存量数据。
-- =============================================================================
ALTER TABLE `biz_seal_order`
  ADD COLUMN `perf_dept`     VARCHAR(32)  DEFAULT NULL COMMENT '业绩归属部门(刻章部/会计部/工商部/总经办/人力行政部/运营支持部/销售部)' AFTER `reg_date`,
  ADD COLUMN `owner_name`    VARCHAR(64)  DEFAULT NULL COMMENT '业务归属人(默认提交人)' AFTER `perf_dept`,
  ADD COLUMN `biz_type`      VARCHAR(16)  DEFAULT 'new' COMMENT '业务类型:new新客户/old老客户' AFTER `owner_name`,
  ADD COLUMN `partner_id`    BIGINT       DEFAULT NULL COMMENT '老客户时关联的长期合作客户ID' AFTER `biz_type`,
  ADD COLUMN `bill_year`     VARCHAR(8)   DEFAULT NULL COMMENT '提单年份(由提单日期自动,如2026)' AFTER `partner_id`,
  ADD COLUMN `bill_month`    VARCHAR(8)   DEFAULT NULL COMMENT '提单月份(由提单日期自动,如6)' AFTER `bill_year`,
  ADD COLUMN `pay_method`    VARCHAR(32)  DEFAULT NULL COMMENT '收款方式(待结算/浙杭刻章码丨微信…等12种)' AFTER `pay_account`,
  ADD COLUMN `pay_date`      DATE         DEFAULT NULL COMMENT '具体收款日期' AFTER `pay_method`,
  ADD COLUMN `seal_status`   VARCHAR(16)  DEFAULT NULL COMMENT '印章状态(新设刻章/变更刻章/损坏重刻/遗失声明/遗失登报/萝卜章/仅备案)' AFTER `seal_types`,
  ADD COLUMN `seal_city`     VARCHAR(16)  DEFAULT '杭州' COMMENT '刻章城市(杭州及11个外区域)' AFTER `seal_status`,
  ADD COLUMN `seal_material` VARCHAR(16)  DEFAULT NULL COMMENT '印章材质(光敏/牛角/回墨)' AFTER `seal_city`,
  ADD COLUMN `is_record`     TINYINT      DEFAULT 0    COMMENT '是否备案 0否1是' AFTER `is_mail`,
  ADD COLUMN `is_shipped`    TINYINT      DEFAULT 0    COMMENT '是否寄出 0否1是' AFTER `is_record`,
  ADD COLUMN `tracking_no`   VARCHAR(64)  DEFAULT NULL COMMENT '快递单号' AFTER `is_shipped`,
  ADD COLUMN `is_delivered`  TINYINT      DEFAULT 0    COMMENT '是否交付 0否1是' AFTER `tracking_no`;
