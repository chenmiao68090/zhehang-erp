-- V238 权限点模型：sys_permission + sys_role_permission。
--
-- 背景：系统权限长期存在"多套口径"——菜单权限走 sys_role_menu，但业务操作权限
--   (能否审批/删他人文件/看薪酬/财务确认…)散落在业务代码里硬编码角色 key
--   (DataScopeHelper.isHrAdminOrBoss / isManagerOrAdmin / @PreAuthorize hasAnyRole 等约 550 处)。
--   本迁移建立"权限点"模型作为唯一可配置口径：把业务操作能力登记为权限点，
--   角色通过 sys_role_permission 关联权限点，业务代码后续逐步改为 has(code) 判断。
--
-- 设计原则：
-- 1) sys_permission 是权限点**定义表**，带 tenant_id(与 sys_menu 同口径，按租户隔离)，种子只写 tenant_id=1；
-- 2) sys_role_permission 是**纯关联表**，不含 tenant_id(与 sys_role_menu/sys_user_role 同口径)，
--    已加入 ErpTenantHandler.IGNORE_TABLES，查询不走租户过滤；
-- 3) 本迁移**只登记权限点、不改变任何现有权限行为**——权限点未接入业务判断，
--    阶段3 才逐处替换硬编码为 has(code)。因此种子数据即使不勾选，也绝不影响线上功能；
-- 4) 权限点 code 用「业务域:资源:操作」三段式小写，全局唯一(UNIQUE KEY (code, tenant_id))，
--    幂等用 INSERT IGNORE，重复执行不产生脏数据。

SET NAMES utf8mb4;

START TRANSACTION;

-- ============================================================
-- 1. 权限点定义表
-- ============================================================
CREATE TABLE IF NOT EXISTS `sys_permission` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `code`        VARCHAR(128) NOT NULL COMMENT '权限点编码(业务域:资源:操作)',
    `name`        VARCHAR(128) NOT NULL COMMENT '权限点中文名',
    `domain`      VARCHAR(64)  NOT NULL COMMENT '业务域(hr/order/finance/...)',
    `sort`        INT          NOT NULL DEFAULT 0 COMMENT '同域内排序',
    `remark`      VARCHAR(255) DEFAULT NULL COMMENT '说明(对应原硬编码口径)',
    `status`      INT          NOT NULL DEFAULT 0 COMMENT '状态(0启用 1停用)',
    `tenant_id`   BIGINT       NOT NULL DEFAULT 1 COMMENT '租户ID(与 sys_menu 同口径)',
    `create_time` DATETIME     DEFAULT NULL,
    `update_time` DATETIME     DEFAULT NULL,
    `create_by`   BIGINT       DEFAULT NULL,
    `update_by`   BIGINT       DEFAULT NULL,
    `deleted`     INT          NOT NULL DEFAULT 0 COMMENT '逻辑删除(0否 1是)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_perm_code` (`code`, `tenant_id`),
    KEY `idx_perm_domain` (`domain`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '权限点定义表(权限唯一可配置口径)';

-- ============================================================
-- 2. 角色-权限点关联表(不含 tenant_id，纯关联)
-- ============================================================
CREATE TABLE IF NOT EXISTS `sys_role_permission` (
    `id`            BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `role_id`       BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限点ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_perm` (`role_id`, `permission_id`),
    KEY `idx_perm_role` (`permission_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '角色-权限点关联表';

-- ============================================================
-- 3. 权限点种子数据(tenant_id=1；仅登记，不改变权限行为)
--    命名对照原硬编码口径(阶段3 替换目标)：
--      hr:*         ← isHrOrAdmin / isHrAdminOrBoss
--      order/finance/contract 把关 ← isManagerOrAdmin / hasAnyRole("finance_hq","finance","boss")
--      *:view_all   ← dataScope=1 全量可见
-- ============================================================
INSERT IGNORE INTO `sys_permission` (`code`, `name`, `domain`, `sort`, `remark`, `status`, `tenant_id`) VALUES
-- 人事 hr
('hr:salary:view',      '查看薪酬数据',       'hr', 1, '原 isHrOrAdmin 口径', 0, 1),
('hr:salary:manage',    '管理薪酬配置',       'hr', 2, '原 isHrAdminOrBoss 口径', 0, 1),
('hr:employee:view_all','查看全部员工档案',   'hr', 3, '原 isHrOrAdmin 口径', 0, 1),
('hr:performance:manage','绩效评估管理',      'hr', 4, '原 isHrOrAdmin 口径', 0, 1),
('hr:recruit:manage',   '招聘管理',           'hr', 5, '原 isHrOrAdmin 口径', 0, 1),
('hr:onboarding:manage','入职管理',           'hr', 6, '原 isHrOrAdmin 口径', 0, 1),
('hr:leave:approve',    '请假审批',           'hr', 7, '原 isManagerOrAdmin 口径', 0, 1),
-- 订单 order
('order:approve',       '订单审批',           'order', 1, '原 isManagerOrAdmin 口径', 0, 1),
('order:finance_confirm','订单财务确认',      'order', 2, '原 hasAnyRole(finance_hq,finance,boss)', 0, 1),
('order:cancel',        '订单取消',           'order', 3, '原 isManagerOrAdmin 口径', 0, 1),
-- 财务 finance
('finance:voucher:manage','凭证管理',         'finance', 1, '原 isHrAdminOrBoss 口径', 0, 1),
('finance:receipt:confirm','收款确认',        'finance', 2, '原 hasAnyRole(finance_hq,finance,boss)', 0, 1),
('finance:refund:approve','退款审批',         'finance', 3, '原 hasAnyRole(finance_hq,finance,boss)', 0, 1),
('finance:invoice:manage','发票管理',         'finance', 4, '原 hasAnyRole(finance_hq,finance,boss)', 0, 1),
-- 合同 contract
('contract:sign',       '合同签署',           'contract', 1, '原 isManagerOrAdmin 口径', 0, 1),
('contract:terminate',  '合同终止',           'contract', 2, '原 isManagerOrAdmin 口径', 0, 1),
('contract:renew',      '合同续签',           'contract', 3, '原 isManagerOrAdmin 口径', 0, 1),
-- 客户 crm
('crm:lead:assign',     '线索分配',           'crm', 1, '原 canAccess 口径', 0, 1),
('crm:lead:view_all',   '查看全部线索',       'crm', 2, '原 dataScope=1 口径', 0, 1),
('crm:customer:view_all','查看全部客户',      'crm', 3, '原 dataScope=1 口径', 0, 1),
('crm:call:view_all',   '查看全部通话记录',   'crm', 4, '原 dataScope=1 口径', 0, 1),
-- 文件 file
('file:delete_any',     '删除他人文件',       'file', 1, '原 isHrAdminOrBoss 口径', 0, 1),
('file:folder:manage',  '文件夹管理',         'file', 2, '原 canAccess(createBy) 口径', 0, 1),
-- 报表 report
('report:view_all',     '查看全部报表',       'report', 1, '原 dataScope=1 口径', 0, 1),
('report:dataset:manage','报表数据集管理',    'report', 2, '原 isManagerOrAdmin 口径', 0, 1),
-- 系统 system
('system:user:manage',  '用户管理',           'system', 1, '原 isCurrentAdmin 口径', 0, 1),
('system:role:manage',  '角色管理',           'system', 2, '原 isCurrentAdmin 口径', 0, 1),
('system:menu:manage',  '菜单管理',           'system', 3, '原 isCurrentAdmin 口径', 0, 1),
('system:dict:manage',  '字典管理',           'system', 4, '原 isCurrentAdmin 口径', 0, 1),
-- 分析 analysis
('analysis:view',       '查看经营分析',       'analysis', 1, '原 @PreAuthorize hasAnyRole(dept_manager,manager,boss)', 0, 1),
-- 印章 seal
('seal:manage',         '印章管理',           'seal', 1, '原 isManagerOrAdmin 口径', 0, 1),
-- 工商 gs
('gs:order:approve',    '工商订单审批',       'gs', 1, '原 isManagerOrAdmin 口径', 0, 1),
-- 渠道 channel
('channel:partner:view_all','查看全部渠道',   'channel', 1, '原 dataScope=1 口径', 0, 1),
('channel:procurement:manage','采购管理',     'channel', 2, '原 isManagerOrAdmin 口径', 0, 1),
-- 工作流 workflow
('workflow:instance:manage','流程实例管理',   'workflow', 1, '原 isManagerOrAdmin 口径', 0, 1),
-- 驾驶舱 dashboard
('dashboard:view_all',  '查看全部驾驶舱数据', 'dashboard', 1, '原 dataScope=1 口径', 0, 1),
-- 飞哥 feige
('feige:task:manage',   '飞哥任务管理',       'feige', 1, '原 isManagerOrAdmin 口径', 0, 1),
('feige:suite:manage',  '飞哥业务套件管理',   'feige', 2, '原 isHrAdminOrBoss 口径', 0, 1),
-- 审单 review
('review:manage',       '审单中心管理',       'review', 1, '原 isManagerOrAdmin 口径', 0, 1);

COMMIT;
