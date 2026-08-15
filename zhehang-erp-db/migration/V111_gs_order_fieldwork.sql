-- =============================================================================
-- V111  工商工单(biz_gs_order)外勤工单跟踪:审核后分配办事员 + 办理状态流转。
--       biz_gs_order 已有 status(进度状态,VARCHAR)、progress_note(进度说明)可复用,
--       仅缺"办事员归属"字段:新增 assignee_id(办事员 userId,BIGINT)用于按办事员收敛数据范围。
--       (原 handler 是自由文本姓名、非 userId,不能用于权限过滤,故另加 assignee_id。)
--       幂等:参照 V102/V110 的存储过程写法,列已存在则跳过 ADD,重复执行安全。
--       状态编码约定(复用现有 status 列,前端一致):
--         reviewing 待审核 / pending 待分配(=待办理) / processing 办理中 / done 已完成
--         (兼容既有 collecting/submitted/rejected 中间态,不清洗历史数据)
-- =============================================================================

DROP PROCEDURE IF EXISTS add_gs_order_assignee;
DELIMITER //
CREATE PROCEDURE add_gs_order_assignee()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'assignee_id') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `assignee_id` BIGINT NULL COMMENT '分配的办事员 userId(sys_user.id / org_employee.user_id)';
  END IF;

  -- progress_note 若历史建表短于 1000,收敛到 1000(与实体 VARCHAR(1000) 对齐);已够长则跳过
  IF EXISTS (SELECT 1 FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
               AND COLUMN_NAME = 'progress_note'
               AND (CHARACTER_MAXIMUM_LENGTH IS NULL OR CHARACTER_MAXIMUM_LENGTH < 1000)) THEN
    ALTER TABLE `biz_gs_order`
      MODIFY COLUMN `progress_note` VARCHAR(1000) NULL COMMENT '最新办理进度说明';
  END IF;
END //
DELIMITER ;
CALL add_gs_order_assignee();
DROP PROCEDURE IF EXISTS add_gs_order_assignee;

-- 便于按办事员/状态查询(索引已存在则忽略错误由 DBA 处理;此处仅新增列,索引可选)
