-- =============================================================================
-- V68  长期合作客户名录 + 合作价格
-- 主表:长期合作客户;子表:每个客户的协议价明细(项目→协议价)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_partner` (
  `id`            BIGINT       NOT NULL          COMMENT '主键(雪花ID)',
  `company_name`  VARCHAR(128) DEFAULT NULL      COMMENT '客户/公司名称',
  `contact`       VARCHAR(64)  DEFAULT NULL      COMMENT '联系人',
  `phone`         VARCHAR(32)  DEFAULT NULL      COMMENT '联系电话',
  `biz_type`      VARCHAR(32)  DEFAULT NULL      COMMENT '合作业务:seal刻章/bill提单/gs工商/mixed综合',
  `level`         VARCHAR(16)  DEFAULT 'normal'  COMMENT '合作等级:normal普通/vip重要/strategic战略',
  `since_date`    DATE         DEFAULT NULL      COMMENT '合作起始日期',
  `remark`        VARCHAR(255) DEFAULT NULL      COMMENT '备注',
  `create_time`   DATETIME     DEFAULT NULL,
  `update_time`   DATETIME     DEFAULT NULL,
  `create_by`     BIGINT       DEFAULT NULL,
  `update_by`     BIGINT       DEFAULT NULL,
  `deleted`       TINYINT      DEFAULT 0,
  `tenant_id`     BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_company` (`company_name`),
  KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='长期合作客户名录';

CREATE TABLE IF NOT EXISTS `biz_partner_price` (
  `id`           BIGINT       NOT NULL           COMMENT '主键(雪花ID)',
  `partner_id`   BIGINT       DEFAULT NULL       COMMENT '所属客户ID',
  `item_name`    VARCHAR(64)  DEFAULT NULL       COMMENT '项目(如:公章/财务章/提单代办/工商年报)',
  `price`        DECIMAL(12,2) DEFAULT 0.00      COMMENT '协议价',
  `unit`         VARCHAR(16)  DEFAULT '个'       COMMENT '单位',
  `remark`       VARCHAR(255) DEFAULT NULL       COMMENT '备注',
  `create_time`  DATETIME     DEFAULT NULL,
  `update_time`  DATETIME     DEFAULT NULL,
  `create_by`    BIGINT       DEFAULT NULL,
  `update_by`    BIGINT       DEFAULT NULL,
  `deleted`      TINYINT      DEFAULT 0,
  `tenant_id`    BIGINT       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_partner` (`partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='长期合作客户·协议价明细';
