-- =============================================================================
-- V75  【关键修复】给本人所建全部新表的 id 加 AUTO_INCREMENT
-- 现成表(biz_order/crm_lead 等)的 id 都是 auto_increment、全局靠数据库自增;
-- 而 V65-V74 新建的表 id 只写了 BIGINT NOT NULL,导致 app 插入时无 id 且无默认值 → 报错
-- 「Field 'id' doesn't have a default value」。本迁移统一改为自增。
-- 已有种子数据的表(hrm_leave_type),AUTO_INCREMENT 会自动从 max(id)+1 起。
-- =============================================================================
ALTER TABLE `biz_seal_order`        MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `biz_gs_order`          MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `biz_seal_stock`        MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `biz_seal_purchase`     MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `biz_partner`           MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `biz_partner_price`     MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `hrm_leave_type`        MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE `hrm_attendance_summary` MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT;
