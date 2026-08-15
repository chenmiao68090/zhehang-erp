-- =============================================================================
-- V124  工商工单(biz_gs_order)客户资料承载:新增 documents 列(飞书 202)。
--       需求:工商提单提交时上传客户资料(法人身份证正/反 + 其他附件),存到订单上;
--             办事员在工商办理页能下载/预览分配给自己订单里的这些资料。
--       复用刻章提单(biz_seal_order.documents)的成熟模式:前端把
--         docs map { key: { fileId, fileName } } 序列化为 JSON 存入本列,
--         回显时 JSON.parse 还原,文件走已有 /file/info 上传下载,不新增文件表/Bean。
--       仅新增 1 列,不建新表、不动既有列、不动索引。BizGsOrder 实体加同名 documents 字段后,
--       MyBatis-Plus 的 insert / updateById 自动持久化本列,无需改 controller/mapper。
--       幂等:参照 V111/V119 存储过程写法,列已存在则跳过 ADD,可重复执行。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_gs_order_documents;
DELIMITER //
CREATE PROCEDURE add_gs_order_documents()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'biz_gs_order'
                   AND COLUMN_NAME = 'documents') THEN
    ALTER TABLE `biz_gs_order`
      ADD COLUMN `documents` MEDIUMTEXT NULL COMMENT '客户资料(法人身份证/其他附件)JSON:{key:{fileId,fileName}}' AFTER `remark`;
  END IF;
END //
DELIMITER ;
CALL add_gs_order_documents();
DROP PROCEDURE IF EXISTS add_gs_order_documents;
