-- ============================================================
-- V29: 人文中心可维护内容表 culture_content + 种子数据
-- 背景: 前端 src/views/culture/index.vue 的「行政制度」「企业文化」原先写死在 <script> 里
--       (policyList / mvvList / coreValues), 无法在后台维护。本迁移建表并写入真实
--       「浙杭集团」内容, 配合后端 culture 模块 (/culture/content) 让管理员可增删改。
-- 字段: type(policy 行政制度 / culture 企业文化 / honor 员工风采荣誉) / title / content(长文本) /
--       icon(emoji) / sort_order(升序) / status(1启用 0停用), 其余为 BaseEntity 审计列。
-- 隔离: tenant_id=1、deleted=0, 匹配 ErpTenantHandler 对 admin(租户1)追加的
--       `tenant_id=1 AND deleted=0` 过滤, 确保 list 能查到。
-- 幂等: CREATE TABLE IF NOT EXISTS; seed 按 (type,title,tenant_id) NOT EXISTS 守卫, 可重复执行。
-- ============================================================

USE `zhehang_erp`;

CREATE TABLE IF NOT EXISTS `culture_content` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键(自增)',
  `type`        VARCHAR(20)  NOT NULL                COMMENT '类型 policy行政制度/culture企业文化/honor员工风采荣誉',
  `title`       VARCHAR(128) NOT NULL                COMMENT '标题',
  `content`     TEXT         DEFAULT NULL            COMMENT '内容(长文本)',
  `icon`        VARCHAR(32)  DEFAULT NULL            COMMENT '图标(emoji或图标名)',
  `sort_order`  INT          DEFAULT 0               COMMENT '排序号(升序)',
  `status`      TINYINT      DEFAULT 1               COMMENT '状态 1启用 0停用',
  `create_time` DATETIME     DEFAULT NULL            COMMENT '创建时间',
  `update_time` DATETIME     DEFAULT NULL            COMMENT '更新时间',
  `create_by`   BIGINT       DEFAULT NULL            COMMENT '创建人',
  `update_by`   BIGINT       DEFAULT NULL            COMMENT '更新人',
  `deleted`     TINYINT      DEFAULT 0               COMMENT '逻辑删除 0正常 1删除',
  `tenant_id`   BIGINT       DEFAULT NULL            COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `idx_culture_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人文中心可维护内容(行政制度/企业文化)';

-- ============================== 行政制度 policy (6 条) ==============================

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'policy','考勤与休假',
  '标准工作时间 9:00-18:00，午休 12:00-13:30，每周双休。\n上下班实行打卡考勤，弹性区间 30 分钟，月度迟到/早退累计纳入绩效核算。\n请假、调休、加班一律通过审批中心线上提交，按权限逐级审批后生效。\n年假、病假、婚假、产假等按国家规定与公司制度执行。',
  '🕘',1,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='policy' AND `title`='考勤与休假' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'policy','薪酬与绩效',
  '实行「基本工资 + 绩效工资 + 业务提成」的复合薪酬结构。\n销售、交付岗位按业务结果计提提成，每季度复盘并动态调整目标。\n绩效考核每月/每季度进行，结果与调薪、晋升、培养计划直接挂钩。\n薪资于每月固定日期发放，个税与社保依法代扣代缴。',
  '💰',2,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='policy' AND `title`='薪酬与绩效' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'policy','入离职管理',
  '新员工入职当天完成档案建立、劳动合同签订与系统账号、数据权限开通。\n试用期一般为 1-3 个月，期间进行双向考察与转正评估。\n离职须提前书面申请，完成工作交接、客户资源移交与物品归还。\n账号、数据权限在离职生效当日同步回收，确保信息安全。',
  '📝',3,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='policy' AND `title`='入离职管理' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'policy','保密与行为规范',
  '对客户信息、商业数据、合同价格等严格保密，离职后保密义务持续有效。\n严禁飞单、私单、截留客户及任何形式的利益输送。\n统一对外服务话术与标准，维护「浙杭」品牌形象与客户信任。\n遵守诚信合规底线，廉洁自律，不收受供应商/客户不正当好处。',
  '🤝',4,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='policy' AND `title`='保密与行为规范' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'policy','报销与采购',
  '费用遵循「先申请、后发生」原则，按预算与审批权限分级审批。\n报销须发票合规、单据齐全，经审批通过后方可入账付款。\n渠道、供应商采购统一走采购审批流程，比价择优、阳光透明。\n差旅、招待等费用按标准执行，超标部分需特批。',
  '🧾',5,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='policy' AND `title`='报销与采购' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'policy','数据与权限',
  '按角色与数据范围分级授权，遵循「最小够用」原则。\n客户、线索等资源按规则归属与回收，杜绝资源沉淀与私占。\n关键操作(增删改、导出、审批)全程留痕，支持审计回溯。\n严禁越权访问、违规导出或对外泄露系统数据。',
  '🔐',6,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='policy' AND `title`='数据与权限' AND `tenant_id`=1);

-- ============================== 企业文化 culture (使命/愿景/价值观) ==============================

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','使命 Mission',
  '让企业服务更简单高效。\n以专业与技术，帮助中小企业把工商财税、获客经营做得更轻松。',
  '🎯',1,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='使命 Mission' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','愿景 Vision',
  '成为值得信赖的企业服务伙伴。\n做客户身边长期、可靠、有温度的一站式企业服务平台。',
  '🌅',2,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='愿景 Vision' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','价值观 Values',
  '客户至上 · 诚信务实 · 协同共赢。\n以客户成功为中心，用诚信和结果赢得信任与口碑。',
  '💎',3,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='价值观 Values' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','客户至上',
  '一切以客户成功为出发点，把客户的事当成自己的事。',
  '🎯',4,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='客户至上' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','诚信务实',
  '不夸大、不承诺做不到的事，言行一致，结果说话。',
  '🛡️',5,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='诚信务实' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','高效执行',
  '快速响应、闭环交付，把复杂流程做到简单顺畅。',
  '🚀',6,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='高效执行' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','协同共赢',
  '跨部门并肩作战，资源共享，与客户和伙伴共同成长。',
  '🤝',7,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='协同共赢' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','持续成长',
  '鼓励学习与复盘，在挑战中不断提升专业与认知。',
  '📈',8,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='持续成长' AND `tenant_id`=1);

INSERT INTO `culture_content`
  (`type`,`title`,`content`,`icon`,`sort_order`,`status`,`deleted`,`tenant_id`,`create_by`,`update_by`,`create_time`,`update_time`)
SELECT 'culture','团队温度',
  '尊重每一位伙伴，让浙杭成为有归属感的大家庭。',
  '❤️',9,1,0,1,1,1,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM `culture_content` WHERE `type`='culture' AND `title`='团队温度' AND `tenant_id`=1);
