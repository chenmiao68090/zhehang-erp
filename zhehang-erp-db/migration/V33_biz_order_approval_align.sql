-- ============================================================
-- V33: biz_order_approval 表对齐实体(救活订单提交/审批)
-- 背景: 订单 submit→recordApproval 写 biz_order_approval,但实体 BizOrderApproval 字段
--   (node/approver_name/approver_role/result/comment/approve_time)与建表列
--   (node_type/action/opinion/action_time,且无 approver_name/approver_role)完全两套,
--   MyBatis insert 报 "Unknown column 'node'" → 订单提交即500,= 订单审批链从未跑通。
-- 处理: 表为空,DROP+CREATE 按实体重建(同 V24 channel 安全幂等模式)。
-- ============================================================

USE `zhehang_erp`;

SET @aligned := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_order_approval' AND COLUMN_NAME='node');
SET @exists := (SELECT COUNT(*) FROM information_schema.TABLES
                WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='biz_order_approval');
SET @cnt := IF(@exists=0, 0, (SELECT COUNT(*) FROM `biz_order_approval`));
SET @ddl := IF(@exists>0 AND @aligned=0 AND @cnt=0, 'DROP TABLE `biz_order_approval`', 'SELECT 1');
PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS `biz_order_approval` (
  `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  `order_id`      BIGINT       DEFAULT NULL            COMMENT '订单ID',
  `node`          VARCHAR(64)  DEFAULT NULL            COMMENT '审批节点(主管审批/财务确认等)',
  `approver_id`   BIGINT       DEFAULT NULL            COMMENT '审批人ID',
  `approver_name` VARCHAR(64)  DEFAULT NULL            COMMENT '审批人姓名',
  `approver_role` VARCHAR(64)  DEFAULT NULL            COMMENT '审批人角色',
  `result`        VARCHAR(20)  DEFAULT NULL            COMMENT '结果(approve/reject/submit等)',
  `comment`       VARCHAR(500) DEFAULT NULL            COMMENT '审批意见',
  `approve_time`  DATETIME     DEFAULT NULL            COMMENT '审批时间',
  `create_time`   DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time`   DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`     BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`     BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`       TINYINT(1)   DEFAULT 0               COMMENT '逻辑删除',
  `tenant_id`     BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单审批记录';
