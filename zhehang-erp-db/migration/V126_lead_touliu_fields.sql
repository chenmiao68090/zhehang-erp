-- =============================================================================
-- V126  线索表(crm_lead)投流客资扩展:飞书 163(新建线索表单重构)/164(顶部汇总滚动播报)
--       背景:投流线索需要一套区别于老「天眼查/工商导入」线索的录入字段与统计口径。
--       本迁移只「新增列」,不改任何老列/老枚举(source 数字枚举、status 数字枚举原样保留),
--       避免破坏已上线的公海/领取/回收/156 操作列等既有逻辑。
--
--       新增列(全部可空,老数据留 NULL,不回填):
--         1) lead_no          客户编号(TL+yyyyMMdd+6位,后端 create 时若空则自动生成,唯一)
--         2) source_platform  来源平台(美团/抖音/小红书… 新选项集,独立于老 source)
--         3) store_brand      门店&品牌词
--         4) consult_business 咨询业务(=「刻章业务」算刻章,其余算非刻章;164 拆分口径靠它)
--         5) nickname         客户昵称
--         6) wechat_no        客户微信(注:老列已有 wechat「微信」,此处另起 wechat_no 避免撞列)
--         7) virtual_phone    虚拟电话
--         8) validity         是否有效(有效/无效/待定)
--         9) follow_status    跟进状态新流程(线索接收/需求沟通/需求答疑/签单收款/移交结束交付)
--        10) receive_time     线索接收时点(follow_status 首次置「线索接收」时后端写入,用于算响应时间)
--        11) deal_amount      成交金额(164 非刻章成交额靠它 sum)
--        12) deal_business    实际成交业务(多选,存逗号分隔)
--        13) attachments      附件 JSON([{fileId,fileName}],走已有 /file/info 上传)
--
--       实体 CrmLead 加同名驼峰字段后,MyBatis-Plus insert/updateById 自动持久化,无需改 mapper。
--       幂等:参照 V119/V124 存储过程写法,逐列 information_schema 判定不存在才 ADD,可重复执行。
--       不建新表、不动既有列、不动索引、不动唯一键。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_crm_lead_touliu_fields;
DELIMITER //
CREATE PROCEDURE add_crm_lead_touliu_fields()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'lead_no') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `lead_no` VARCHAR(32) NULL COMMENT '客户编号(TL+yyyyMMdd+6位,后端自动生成,唯一)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'source_platform') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `source_platform` VARCHAR(32) NULL COMMENT '来源平台(美团/抖音/小红书等,独立于老 source)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'store_brand') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `store_brand` VARCHAR(64) NULL COMMENT '门店&品牌词';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'consult_business') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `consult_business` VARCHAR(32) NULL COMMENT '咨询业务(=刻章业务算刻章,其余非刻章)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'nickname') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `nickname` VARCHAR(64) NULL COMMENT '客户昵称';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'wechat_no') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `wechat_no` VARCHAR(64) NULL COMMENT '客户微信(投流录入,区别于老 wechat 列)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'virtual_phone') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `virtual_phone` VARCHAR(32) NULL COMMENT '虚拟电话(可含-)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'validity') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `validity` VARCHAR(8) NULL COMMENT '是否有效(有效/无效/待定)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'follow_status') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `follow_status` VARCHAR(16) NULL COMMENT '跟进状态新流程(线索接收/需求沟通/需求答疑/签单收款/移交结束交付)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'receive_time') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `receive_time` DATETIME NULL COMMENT '线索接收时点(follow_status 首次置线索接收时写入,算响应时间)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'deal_amount') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `deal_amount` DECIMAL(12,2) NULL COMMENT '成交金额(164 非刻章成交额)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'deal_business') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `deal_business` VARCHAR(255) NULL COMMENT '实际成交业务(多选,逗号分隔)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'crm_lead'
                   AND COLUMN_NAME = 'attachments') THEN
    ALTER TABLE `crm_lead`
      ADD COLUMN `attachments` MEDIUMTEXT NULL COMMENT '附件JSON([{fileId,fileName}],走/file/info)';
  END IF;
END //
DELIMITER ;
CALL add_crm_lead_touliu_fields();
DROP PROCEDURE IF EXISTS add_crm_lead_touliu_fields;
