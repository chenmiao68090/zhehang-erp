-- V41: 员工头像字段(支持手动上传员工照片)
-- org_employee 原无头像字段,员工风采墙/通讯录列表只能用姓名首字。
-- 加 avatar(LONGTEXT)存 base64 图片(前端压缩为 256px 方形 JPEG,约几十KB)或 URL,支持手动上传真实照片。
ALTER TABLE org_employee ADD COLUMN avatar LONGTEXT DEFAULT NULL COMMENT '员工头像(base64或URL)' AFTER name;
