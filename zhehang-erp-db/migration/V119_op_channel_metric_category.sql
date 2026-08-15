-- =============================================================================
-- V119  平台运营数据(biz_op_channel_metric)扩展:支持多类别灵活指标(飞书 188/200/204/205/206/209/220)
--       背景:抖音/小红书/视频号/大众点评官方明确不支持 API 接入,故全部手动录入+展示。
--       为承载各平台不同分区的灵活指标(直播/短视频/私信留资/笔记/概览等),扩展本表:
--         1) category  VARCHAR(32)  数据类别(overview概览 / live直播 / video短视频 /
--                                    message私信留资 / note笔记 等);老数据 NULL 视为 overview
--         2) metrics   MEDIUMTEXT   该类别下的灵活指标 KV(JSON 字符串,如 {"场次":12,"时长":320})
--       同时重建唯一键:原 (platform,stat_date,tenant_id) → (platform,stat_date,category,tenant_id),
--       否则同一平台同一天的不同类别(如抖音「直播」+「短视频」)会互相覆盖/违反唯一约束。
--       向后兼容:原 views/visits/inquiries/ad_cost 四个概览指标列全部保留不动;
--                 老数据 category 回填为 overview,channel-data.vue 现有四指标录入完全不受影响。
--       幂等:参照 V113 存储过程写法,逐列 information_schema 判定不存在才 ADD/回填/重建索引,可重复执行。
-- =============================================================================

DROP PROCEDURE IF EXISTS upgrade_op_channel_metric_category;
DELIMITER //
CREATE PROCEDURE upgrade_op_channel_metric_category()
BEGIN
  -- 1) category 数据类别列
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_op_channel_metric'
                   AND COLUMN_NAME = 'category') THEN
    ALTER TABLE `biz_op_channel_metric`
      ADD COLUMN `category` VARCHAR(32) NULL COMMENT '数据类别(overview概览/live直播/video短视频/message私信留资/note笔记等,NULL视为overview)' AFTER `platform`;
  END IF;

  -- 2) metrics 灵活指标 JSON 列
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_op_channel_metric'
                   AND COLUMN_NAME = 'metrics') THEN
    ALTER TABLE `biz_op_channel_metric`
      ADD COLUMN `metrics` MEDIUMTEXT NULL COMMENT '该类别下的灵活指标KV(JSON字符串,如{"场次":12,"时长":320})' AFTER `source`;
  END IF;

  -- 3) 老数据 category 为 NULL 的回填为 overview(与新录入的概览对齐,唯一键才稳定)
  UPDATE `biz_op_channel_metric` SET `category` = 'overview'
    WHERE `category` IS NULL OR `category` = '';

  -- 4) 重建唯一键:先删旧 (platform,stat_date,tenant_id),再建含 category 的新键
  IF EXISTS (SELECT 1 FROM information_schema.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_op_channel_metric'
               AND INDEX_NAME = 'uk_platform_date_tenant') THEN
    ALTER TABLE `biz_op_channel_metric` DROP INDEX `uk_platform_date_tenant`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_op_channel_metric'
                   AND INDEX_NAME = 'uk_platform_date_cat_tenant') THEN
    ALTER TABLE `biz_op_channel_metric`
      ADD UNIQUE KEY `uk_platform_date_cat_tenant` (`platform`, `stat_date`, `category`, `tenant_id`);
  END IF;
END //
DELIMITER ;
CALL upgrade_op_channel_metric_category();
DROP PROCEDURE IF EXISTS upgrade_op_channel_metric_category;
