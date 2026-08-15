-- =============================================================================
-- V72  刻章业务·按印章状态条件上传资料(A2)
-- documents 存 JSON:{docType: {fileId, fileName}};配合前端按印章状态/经办人/外区域动态出上传位。
-- =============================================================================
ALTER TABLE `biz_seal_order`
  ADD COLUMN `handler_is_legal` TINYINT      DEFAULT 1    COMMENT '办理人是否法人本人:1是 0否(否则需传经办人身份证/半身照/授权委托)' AFTER `is_delivered`,
  ADD COLUMN `is_we_publish`    TINYINT      DEFAULT 0    COMMENT '遗失登报时是否我们登报:1是 0否' AFTER `handler_is_legal`,
  ADD COLUMN `documents`        TEXT         DEFAULT NULL COMMENT '资料附件 JSON:{docType:{fileId,fileName}}' AFTER `is_we_publish`;
