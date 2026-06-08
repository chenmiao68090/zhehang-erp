-- ============================================================
-- V17: 提成 biz_commission 表对齐实体(打通提成自动计算)
-- 背景:同 V13~V15,biz_commission(V3:sales_id/order_ids/settle_month/gross_amount/net_amount...)
--       与实体 BizCommission(salesman_id/order_id/period/order_amount/commission_rate/commission_amount...)
--       两套模型,/commission/generate 报 500。对齐后才能在合同签署时自动生成提成。
-- 安全/幂等:仅当实体签名列 salesman_id 缺失(=旧结构) 且表空 才 DROP;CREATE IF NOT EXISTS。
-- ============================================================

USE `zhehang_erp`;

SET @aligned := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_commission' AND COLUMN_NAME='salesman_id');
SET @exists := (SELECT COUNT(*) FROM information_schema.TABLES
                WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_commission');
SET @cnt := IF(@exists=0, 0, (SELECT COUNT(*) FROM biz_commission));
SET @ddl := IF(@exists>0 AND @aligned=0 AND @cnt=0, 'DROP TABLE `biz_commission`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_commission` (
  `id`                   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `commission_no`        VARCHAR(64)  DEFAULT NULL            COMMENT '提成单号',
  `salesman_id`          BIGINT       DEFAULT NULL            COMMENT '销售人ID',
  `salesman_name`        VARCHAR(64)  DEFAULT NULL            COMMENT '销售人姓名',
  `dept_id`              BIGINT       DEFAULT NULL            COMMENT '归属部门ID',
  `order_id`             BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `period`               VARCHAR(16)  DEFAULT NULL            COMMENT '结算期(yyyy-MM)',
  `order_amount`         DECIMAL(14,2) DEFAULT NULL           COMMENT '订单金额',
  `commission_rate`      DECIMAL(6,2) DEFAULT NULL            COMMENT '提成比例(%)',
  `commission_amount`    DECIMAL(14,2) DEFAULT NULL           COMMENT '提成金额',
  `status`               INT          DEFAULT NULL            COMMENT '状态(1待确认...)',
  `salesman_confirm_time` DATETIME    DEFAULT NULL            COMMENT '销售确认时间',
  `review_time`          DATETIME     DEFAULT NULL            COMMENT '主管复核时间',
  `finance_confirm_time` DATETIME     DEFAULT NULL            COMMENT '财务确认时间',
  `boss_approve_time`    DATETIME     DEFAULT NULL            COMMENT '老板审批时间',
  `pay_time`             DATETIME     DEFAULT NULL            COMMENT '发放时间',
  `remark`               VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `create_time`          DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`          DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`            BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`            BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`              TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`            BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_commission_order` (`order_id`),
  KEY `idx_commission_salesman` (`salesman_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售提成';
