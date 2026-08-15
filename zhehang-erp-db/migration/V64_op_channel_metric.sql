-- =============================================================================
-- V64  运营服务中心·平台运营数据(美团/抖音/小红书等)每日指标
-- 第一阶段:手动录入真实数据;后续接各平台营销 API 后由同步任务写入(source=api)。
-- =============================================================================
CREATE TABLE IF NOT EXISTS `biz_op_channel_metric` (
  `id`          BIGINT      NOT NULL                COMMENT '主键(雪花ID)',
  `platform`    VARCHAR(32) NOT NULL                COMMENT '平台:meituan/douyin/xiaohongshu/...',
  `stat_date`   DATE        NOT NULL                COMMENT '统计日期',
  `views`       BIGINT      DEFAULT 0               COMMENT '浏览量',
  `visits`      BIGINT      DEFAULT 0               COMMENT '访问量',
  `inquiries`   BIGINT      DEFAULT 0               COMMENT '咨询量',
  `ad_cost`     DECIMAL(12,2) DEFAULT 0.00          COMMENT '推广金额消耗',
  `source`      VARCHAR(16) DEFAULT 'manual'        COMMENT '来源:manual手动 / api接口同步',
  `remark`      VARCHAR(255) DEFAULT NULL           COMMENT '备注',
  `create_time` DATETIME    DEFAULT NULL,
  `update_time` DATETIME    DEFAULT NULL,
  `create_by`   BIGINT      DEFAULT NULL,
  `update_by`   BIGINT      DEFAULT NULL,
  `deleted`     TINYINT     DEFAULT 0,
  `tenant_id`   BIGINT      DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_platform_date_tenant` (`platform`, `stat_date`, `tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运营服务中心·平台每日运营指标';
