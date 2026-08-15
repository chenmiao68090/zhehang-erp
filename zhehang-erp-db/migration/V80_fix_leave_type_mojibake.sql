-- =============================================================================
-- V80  修复 hrm_leave_type 假期类型名乱码(双重编码)。
-- 根因:V69 种子文件本身正确(UTF-8),但导入时未用 utf8mb4 连接 → UTF-8字节被当latin1再编码一次。
-- 修法:用正确中文 UPDATE 回去。**应用时务必加 --default-character-set=utf8mb4**,否则会再次乱码。
-- =============================================================================
UPDATE `hrm_leave_type` SET `type_name` = '育儿假' WHERE `id` = 6901;
UPDATE `hrm_leave_type` SET `type_name` = '丧假'   WHERE `id` = 6902;
UPDATE `hrm_leave_type` SET `type_name` = '婚假'   WHERE `id` = 6903;
UPDATE `hrm_leave_type` SET `type_name` = '产假'   WHERE `id` = 6904;
UPDATE `hrm_leave_type` SET `type_name` = '病假'   WHERE `id` = 6905;
UPDATE `hrm_leave_type` SET `type_name` = '事假'   WHERE `id` = 6906;
UPDATE `hrm_leave_type` SET `type_name` = '年假'   WHERE `id` = 6907;
