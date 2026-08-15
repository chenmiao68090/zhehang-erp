-- =============================================================================
-- V163 培训视频学习底座
-- 1. 课程课件增加视频来源、转码状态、观看阈值和播放器策略。
-- 2. V160 学习步骤增加有效观看区间、覆盖率、播放会话和设备信息。
-- 3. 新增分片上传会话表，支持大视频断点续传。
-- 说明：只扩展结构，不回填、不修改现有课程、学习记录、考试成绩或 RBAC 数据。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_training_video_column;
DELIMITER //
CREATE PROCEDURE add_training_video_column(
  IN p_table VARCHAR(64),
  IN p_column VARCHAR(64),
  IN p_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL add_training_video_column('hrm_training_material', 'media_provider',
  'VARCHAR(24) NOT NULL DEFAULT ''NONE'' COMMENT ''媒体来源:NONE/LOCAL/ALIYUN_VOD/EXTERNAL''');
CALL add_training_video_column('hrm_training_material', 'provider_media_id',
  'VARCHAR(128) NULL COMMENT ''云点播媒体ID''');
CALL add_training_video_column('hrm_training_material', 'transcode_status',
  'VARCHAR(24) NOT NULL DEFAULT ''READY'' COMMENT ''处理状态:UPLOADING/PROCESSING/READY/FAILED''');
CALL add_training_video_column('hrm_training_material', 'duration_seconds',
  'INT NULL COMMENT ''视频精确时长(秒)''');
CALL add_training_video_column('hrm_training_material', 'cover_url',
  'VARCHAR(500) NULL COMMENT ''视频封面地址''');
CALL add_training_video_column('hrm_training_material', 'subtitle_url',
  'VARCHAR(500) NULL COMMENT ''字幕地址''');
CALL add_training_video_column('hrm_training_material', 'min_watch_percent',
  'INT NOT NULL DEFAULT 90 COMMENT ''完成所需有效观看覆盖率''');
CALL add_training_video_column('hrm_training_material', 'allow_speed',
  'TINYINT(1) NOT NULL DEFAULT 1 COMMENT ''是否允许倍速播放''');
CALL add_training_video_column('hrm_training_material', 'watermark_enabled',
  'TINYINT(1) NOT NULL DEFAULT 1 COMMENT ''是否显示员工动态水印''');
CALL add_training_video_column('hrm_training_material', 'playback_policy',
  'VARCHAR(24) NOT NULL DEFAULT ''SECURE'' COMMENT ''播放策略:SECURE/EXTERNAL_REFERENCE''');

CALL add_training_video_column('hrm_training_learning_step', 'duration_seconds',
  'INT NULL COMMENT ''视频时长快照(秒)''');
CALL add_training_video_column('hrm_training_learning_step', 'watched_ranges_json',
  'MEDIUMTEXT NULL COMMENT ''已验证观看区间JSON''');
CALL add_training_video_column('hrm_training_learning_step', 'valid_watched_seconds',
  'INT NOT NULL DEFAULT 0 COMMENT ''去重后的有效观看秒数''');
CALL add_training_video_column('hrm_training_learning_step', 'coverage_percent',
  'INT NOT NULL DEFAULT 0 COMMENT ''有效观看覆盖率0-100''');
CALL add_training_video_column('hrm_training_learning_step', 'playback_session_id',
  'VARCHAR(64) NULL COMMENT ''本次播放器会话ID''');
CALL add_training_video_column('hrm_training_learning_step', 'last_heartbeat_time',
  'DATETIME(3) NULL COMMENT ''最近播放器心跳时间''');
CALL add_training_video_column('hrm_training_learning_step', 'playback_rate',
  'DECIMAL(4,2) NULL COMMENT ''最近播放倍速''');
CALL add_training_video_column('hrm_training_learning_step', 'device_type',
  'VARCHAR(32) NULL COMMENT ''最近学习设备:DESKTOP/MOBILE/TABLET''');
CALL add_training_video_column('hrm_training_learning_step', 'completion_reason',
  'VARCHAR(32) NULL COMMENT ''完成原因:WATCH_COVERAGE/LEGACY''');

CALL add_training_video_column('file_info', 'access_scope',
  'VARCHAR(32) NOT NULL DEFAULT ''NORMAL'' COMMENT ''访问范围:NORMAL/TRAINING_VIDEO''');

DROP PROCEDURE IF EXISTS add_training_video_column;

CREATE TABLE IF NOT EXISTS `hrm_training_video_upload` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `upload_token` VARCHAR(64) NOT NULL COMMENT '分片上传会话令牌',
  `uploader_user_id` BIGINT NOT NULL COMMENT '上传人用户ID',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `file_size` BIGINT NOT NULL COMMENT '文件总字节数',
  `file_fingerprint` VARCHAR(128) NOT NULL COMMENT '客户端文件指纹,用于安全续传',
  `mime_type` VARCHAR(100) NULL COMMENT 'MIME类型',
  `duration_seconds` INT NULL COMMENT '浏览器读取的视频时长',
  `chunk_size` INT NOT NULL COMMENT '每片字节数',
  `total_chunks` INT NOT NULL COMMENT '总分片数',
  `uploaded_chunks_json` MEDIUMTEXT NULL COMMENT '已完成分片序号JSON',
  `temp_path` VARCHAR(500) NOT NULL COMMENT '上传临时目录相对路径',
  `status` VARCHAR(24) NOT NULL DEFAULT 'UPLOADING' COMMENT 'UPLOADING/COMPLETED/CANCELLED/EXPIRED',
  `file_id` BIGINT NULL COMMENT '合并完成后的file_info ID',
  `expires_time` DATETIME(3) NOT NULL COMMENT '上传会话过期时间',
  `create_time` DATETIME NULL,
  `update_time` DATETIME NULL,
  `create_by` BIGINT NULL,
  `update_by` BIGINT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  `tenant_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_training_video_upload_token` (`upload_token`),
  KEY `idx_training_video_upload_owner` (`tenant_id`,`uploader_user_id`,`status`,`expires_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训视频分片上传会话';

DROP PROCEDURE IF EXISTS add_training_video_index;
DELIMITER //
CREATE PROCEDURE add_training_video_index(
  IN p_table VARCHAR(64),
  IN p_index VARCHAR(64),
  IN p_columns VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND INDEX_NAME = p_index
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD INDEX `', p_index, '` (', p_columns, ')');
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL add_training_video_index('hrm_training_learning_step', 'idx_training_step_video_dashboard',
  '`tenant_id`,`step_type`,`course_id`,`completed`');
CALL add_training_video_index('hrm_training_material', 'idx_training_material_video',
  '`tenant_id`,`material_type`,`enabled`,`course_id`');

DROP PROCEDURE IF EXISTS add_training_video_index;
