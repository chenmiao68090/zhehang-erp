-- V134: 销售“我的线索”持有上限统一调整为 500
-- 说明:
--   1) crm_holding_config.status 在建表注释中为 0禁用/1启用,本次同步修正启用状态。
--   2) 只调整规则配置,不改任何线索/客户归属数据。

UPDATE `crm_holding_config`
SET `max_holding` = 500,
    `status` = 1,
    `description` = '销售我的线索统一上限 500 条'
WHERE `role_type` IN (
  'telemarketing_junior',
  'telemarketing_mid',
  'telemarketing_senior',
  'online_staff',
  'online_manager',
  'sales_manager',
  'sales_junior',
  'sales_senior',
  'sales_expert',
  'telemarket',
  'manager',
  'director'
);

INSERT INTO `crm_holding_config`
  (`role_type`, `role_label`, `max_holding`, `overtime_tolerance_rate`, `overtime_release_hours`, `description`, `status`)
SELECT 'sales_default', '销售默认', 500, 0.10, 24, '销售我的线索统一上限 500 条', 1
WHERE NOT EXISTS (
  SELECT 1 FROM `crm_holding_config`
  WHERE `role_type` IN (
    'telemarketing_junior',
    'telemarketing_mid',
    'telemarketing_senior',
    'online_staff',
    'online_manager',
    'sales_manager',
    'sales_junior',
    'sales_senior',
    'sales_expert',
    'telemarket',
    'manager',
    'director',
    'sales_default'
  )
);
