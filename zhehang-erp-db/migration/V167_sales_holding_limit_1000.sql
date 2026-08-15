-- V167: 销售“我的客户”个人持有上限统一调整为 1000
-- 仅更新持有规则，不改变线索/客户归属、每日领取量、回收规则或权限。

UPDATE `crm_holding_config`
SET `max_holding` = 1000,
    `description` = '销售我的客户统一上限 1000 条'
WHERE COALESCE(`deleted`, 0) = 0
  AND `role_type` IN (
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
  );
