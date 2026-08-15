-- V43: crm_lead 高频查询字段补索引(系统审计发现全表扫描)
-- 来源: 自主运维系统审计
--   #4(high)  撞单查重 phone/company/name 三列无索引 → 每次创建/导入线索都全表扫描
--             (CrmCollisionServiceImpl.checkDuplicate / CrmLeadServiceImpl.checkDuplicate)
--   #20(medium)自动回收定时任务按 ownership+status+protection_expire_date 过滤,缺复合索引
--   #28(low)   营销 ROI 归因按 campaign_id 聚合,缺索引(配合 MktCampaign N+1 优化)
-- 说明: 全部列已核对存在;以下索引此前均不存在(channel 因低基数不建,价值有限)。
ALTER TABLE crm_lead
  ADD INDEX idx_lead_phone (phone),
  ADD INDEX idx_lead_company (company),
  ADD INDEX idx_lead_name (name),
  ADD INDEX idx_lead_campaign (campaign_id),
  ADD INDEX idx_lead_recycle (ownership, status, protection_expire_date),
  ADD INDEX idx_lead_owner_nextfollow (owner_id, next_follow_time);
