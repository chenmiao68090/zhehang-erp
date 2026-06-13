-- ============================================================
-- V31: 法定节假日 / 调休补班日历 sys_holiday + 2026 年种子数据
-- 背景: 考勤模块 HrmAttendanceServiceImpl.workdaysOfMonth(month) 原先「应出勤」=纯周一~周五,
--       未扣除法定节假日、也未计入调休补班。本迁移建表并写入 2026 年中国大陆法定节假日及
--       调休补班,配合改造后的 workdaysOfMonth 让「应出勤」= 当月周一~周五 − 放假(落工作日)
--       + 补班(落周末)。
-- 字段: holiday_date(日期,唯一) / name(名称) / day_type(1=放假,2=补班), 其余为 BaseEntity 审计列。
-- 隔离: tenant_id=1、deleted=0, 匹配 ErpTenantHandler 对登录态(admin=租户1)追加的
--       `tenant_id=1` 过滤 —— 考勤查询发生在登录用户上下文中, 必须以租户1播种方可被查到。
-- 幂等: CREATE TABLE IF NOT EXISTS; seed 按 (holiday_date, tenant_id) NOT EXISTS 守卫, 可重复执行。
--
-- !! 日期口径: 以国务院办公厅《关于2026年部分节假日安排的通知》为准。下方日期为按惯例推算,
-- !! 个别放假/补班日期可后续按官方正式公布校正(尤其春节、五一、中秋/国庆衔接的调休)。
-- ============================================================

USE `zhehang_erp`;

CREATE TABLE IF NOT EXISTS `sys_holiday` (
  `id`           BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `holiday_date` DATE        NOT NULL                COMMENT '节假日/补班日期',
  `name`         VARCHAR(64) NOT NULL                COMMENT '名称(如 元旦/春节/端午/国庆调休补班)',
  `day_type`     TINYINT     NOT NULL DEFAULT 1      COMMENT '类型 1放假 2补班',
  `create_time`  DATETIME    DEFAULT NULL            COMMENT '创建时间',
  `update_time`  DATETIME    DEFAULT NULL            COMMENT '更新时间',
  `create_by`    BIGINT      DEFAULT NULL            COMMENT '创建人',
  `update_by`    BIGINT      DEFAULT NULL            COMMENT '更新人',
  `deleted`      TINYINT     DEFAULT 0               COMMENT '逻辑删除 0正常 1删除',
  `tenant_id`    BIGINT      DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_holiday_date` (`holiday_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='法定节假日/调休补班日历(考勤应出勤核算用)';

-- ============================== 元旦 (1天) ==============================
-- 2026-01-01(周四)放假
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-01-01','元旦',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-01-01' AND `tenant_id`=1);

-- ============================== 春节 (放假 2026-02-15~02-22,补班 02-14 与 02-28) ==============================
-- 日期可后续按官方公布校正(2026 春节为 2 月 17 日,通常放假 8 天,前后各 1 个周六补班)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-15','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-15' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-16','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-16' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-17','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-17' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-18','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-18' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-19','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-19' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-20','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-20' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-21','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-21' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-22','春节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-22' AND `tenant_id`=1);
-- 春节调休补班(周六/周日上班)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-14','春节调休补班',2,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-14' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-02-28','春节调休补班',2,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-02-28' AND `tenant_id`=1);

-- ============================== 清明 (放假 2026-04-04~04-06) ==============================
-- 2026 清明节为 4 月 5 日(周日);4-4 周六、4-5 周日、4-6 周一放假
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-04-04','清明节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-04-04' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-04-05','清明节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-04-05' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-04-06','清明节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-04-06' AND `tenant_id`=1);

-- ============================== 劳动节 (放假 2026-05-01~05-05,补班 04-26 与 05-09) ==============================
-- 日期可后续按官方公布校正(5-1 周五~5-5 周二放假,通常前后各 1 天周末补班)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-05-01','劳动节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-05-01' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-05-02','劳动节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-05-02' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-05-03','劳动节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-05-03' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-05-04','劳动节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-05-04' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-05-05','劳动节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-05-05' AND `tenant_id`=1);
-- 劳动节调休补班(周日/周六上班)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-04-26','劳动节调休补班',2,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-04-26' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-05-09','劳动节调休补班',2,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-05-09' AND `tenant_id`=1);

-- ============================== 端午节 (放假 2026-06-19~06-21) —— 6 月当月,考勤页默认看本月 ==============================
-- 2026 端午节为 6 月 19 日(周五);6-19 周五、6-20 周六、6-21 周日放假,形成 3 天连休,无需补班
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-06-19','端午节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-06-19' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-06-20','端午节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-06-20' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-06-21','端午节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-06-21' AND `tenant_id`=1);

-- ============================== 中秋节 (放假 2026-09-25~09-27,补班 09-19) ==============================
-- 日期可后续按官方公布校正(2026 中秋为 9 月 25 日 周五;与国庆相隔数日,常各自调休)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-09-25','中秋节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-09-25' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-09-26','中秋节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-09-26' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-09-27','中秋节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-09-27' AND `tenant_id`=1);
-- 中秋调休补班(周六上班)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-09-19','中秋调休补班',2,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-09-19' AND `tenant_id`=1);

-- ============================== 国庆节 (放假 2026-10-01~10-08,补班 10-10) ==============================
-- 日期可后续按官方公布校正(10-1 周四起放假 8 天,通常 1 个周六补班)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-01','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-01' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-02','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-02' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-03','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-03' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-04','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-04' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-05','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-05' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-06','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-06' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-07','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-07' AND `tenant_id`=1);
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-08','国庆节',1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-08' AND `tenant_id`=1);
-- 国庆调休补班(周六上班)
INSERT INTO `sys_holiday` (`holiday_date`,`name`,`day_type`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT '2026-10-10','国庆调休补班',2,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `sys_holiday` WHERE `holiday_date`='2026-10-10' AND `tenant_id`=1);
