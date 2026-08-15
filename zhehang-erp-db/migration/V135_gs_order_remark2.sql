-- =============================================================================
-- V135  工商工单新增「备注2」字段:在 biz_gs_order 上补 remark2(第二备注)。
-- 与现有 remark(备注) 平行,供办理台/提单页额外记录信息。历史表缺列会导致编辑保存 500,
-- 这里用存储过程幂等补列(已存在则跳过),可在本地与生产重复执行。
-- =============================================================================
DROP PROCEDURE IF EXISTS add_gs_remark2_col;
DELIMITER $$
CREATE PROCEDURE add_gs_remark2_col()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'remark2') THEN
        ALTER TABLE `biz_gs_order`
            ADD COLUMN `remark2` VARCHAR(255) NULL COMMENT '备注2' AFTER `remark`;
    END IF;
END $$
DELIMITER ;
CALL add_gs_remark2_col();
DROP PROCEDURE IF EXISTS add_gs_remark2_col;
