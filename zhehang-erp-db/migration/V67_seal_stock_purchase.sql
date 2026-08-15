-- =============================================================================
-- V67  刻章部门·印章库存与采购
-- 库存:章料/印油/章盒等耗材的库存与安全库存预警;采购:采购记录,到货可入库。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_seal_stock` (
  `id`            BIGINT       NOT NULL          COMMENT '主键(雪花ID)',
  `item_name`     VARCHAR(64)  DEFAULT NULL      COMMENT '品名(光敏章料/原子印章/铜质章料/印油/章盒等)',
  `spec`          VARCHAR(64)  DEFAULT NULL      COMMENT '规格',
  `unit`          VARCHAR(16)  DEFAULT '个'      COMMENT '单位(个/盒/瓶)',
  `quantity`      INT          DEFAULT 0         COMMENT '当前库存数量',
  `safety_stock`  INT          DEFAULT 0         COMMENT '安全库存(预警线)',
  `unit_price`    DECIMAL(12,2) DEFAULT 0.00     COMMENT '参考单价',
  `supplier`      VARCHAR(64)  DEFAULT NULL      COMMENT '常用供应商',
  `remark`        VARCHAR(255) DEFAULT NULL      COMMENT '备注',
  `create_time`   DATETIME     DEFAULT NULL,
  `update_time`   DATETIME     DEFAULT NULL,
  `create_by`     BIGINT       DEFAULT NULL,
  `update_by`     BIGINT       DEFAULT NULL,
  `deleted`       TINYINT      DEFAULT 0,
  `tenant_id`     BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_item` (`item_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='刻章·印章耗材库存';

CREATE TABLE IF NOT EXISTS `biz_seal_purchase` (
  `id`            BIGINT       NOT NULL          COMMENT '主键(雪花ID)',
  `item_name`     VARCHAR(64)  DEFAULT NULL      COMMENT '采购品名',
  `spec`          VARCHAR(64)  DEFAULT NULL      COMMENT '规格',
  `quantity`      INT          DEFAULT 0         COMMENT '采购数量',
  `unit_price`    DECIMAL(12,2) DEFAULT 0.00     COMMENT '采购单价',
  `amount`        DECIMAL(12,2) DEFAULT 0.00     COMMENT '采购金额',
  `supplier`      VARCHAR(64)  DEFAULT NULL      COMMENT '供应商',
  `purchase_date` DATE         DEFAULT NULL      COMMENT '采购日期',
  `operator`      VARCHAR(64)  DEFAULT NULL      COMMENT '采购人',
  `status`        VARCHAR(16)  DEFAULT 'ordered' COMMENT '状态:ordered已下单/arrived已到货入库',
  `remark`        VARCHAR(255) DEFAULT NULL      COMMENT '备注',
  `create_time`   DATETIME     DEFAULT NULL,
  `update_time`   DATETIME     DEFAULT NULL,
  `create_by`     BIGINT       DEFAULT NULL,
  `update_by`     BIGINT       DEFAULT NULL,
  `deleted`       TINYINT      DEFAULT 0,
  `tenant_id`     BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_pdate` (`purchase_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='刻章·印章耗材采购记录';
