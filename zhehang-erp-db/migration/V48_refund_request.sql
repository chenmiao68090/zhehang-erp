-- =============================================================================
-- V48  退款审批单表(把原前端内存维护的退款审批流转为真后端)
-- 流程:申请(pending)→主管审批(approved)→财务确认(completed) / 驳回(rejected)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_refund_request` (
  `id`                     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增ID)',
  `refund_no`              VARCHAR(40)  DEFAULT NULL            COMMENT '退款单号',
  `receipt_id`             BIGINT       DEFAULT NULL            COMMENT '关联收款ID',
  `order_id`               BIGINT       DEFAULT NULL            COMMENT '关联订单ID',
  `order_no`               VARCHAR(64)  DEFAULT NULL            COMMENT '订单号',
  `customer_name`          VARCHAR(128) DEFAULT NULL            COMMENT '客户名',
  `refund_amount`          DECIMAL(15,2) DEFAULT 0             COMMENT '退款金额',
  `reason_key`             VARCHAR(40)  DEFAULT NULL            COMMENT '退款原因key',
  `reason`                 VARCHAR(500) DEFAULT NULL            COMMENT '退款原因',
  `refund_way`             VARCHAR(40)  DEFAULT 'origin'        COMMENT '退款方式',
  `apply_time`             DATETIME     DEFAULT NULL            COMMENT '申请时间',
  `applicant_id`           BIGINT       DEFAULT NULL            COMMENT '申请人ID',
  `applicant_name`         VARCHAR(64)  DEFAULT NULL            COMMENT '申请人名',
  `approver_id`            BIGINT       DEFAULT NULL            COMMENT '审批人(主管)ID',
  `approver_name`          VARCHAR(64)  DEFAULT NULL            COMMENT '审批人(主管)名',
  `approval_time`          DATETIME     DEFAULT NULL            COMMENT '主管审批时间',
  `finance_confirmer_id`   BIGINT       DEFAULT NULL            COMMENT '财务确认人ID',
  `finance_confirmer_name` VARCHAR(64)  DEFAULT NULL            COMMENT '财务确认人名',
  `finance_confirm_time`   DATETIME     DEFAULT NULL            COMMENT '财务确认时间',
  `status`                 VARCHAR(20)  DEFAULT 'pending'       COMMENT 'pending/approved/completed/rejected',
  `remark`                 VARCHAR(500) DEFAULT NULL            COMMENT '备注',
  `reject_reason`          VARCHAR(500) DEFAULT NULL            COMMENT '驳回原因',
  `create_time`            DATETIME     DEFAULT NULL,
  `update_time`            DATETIME     DEFAULT NULL,
  `create_by`              BIGINT       DEFAULT NULL,
  `update_by`              BIGINT       DEFAULT NULL,
  `deleted`                TINYINT      DEFAULT 0,
  `tenant_id`              BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_receipt` (`receipt_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款审批单';
