-- ============================================================
-- V44: 审批表单的日期字段由"文字(text)"改为"日期(date)"
-- 背景: V30 种的 form_config 里开始/结束日期等是 type:text(纯文本框),
--   前端渲染器新增了 date 类型(el-date-picker),这里把日期字段类型改过来。
-- 用 REPLACE 精确替换 "label":"XX日期","type":"text" → ...:"date";已是 date 则不匹配(幂等)。
-- 注意: 本迁移版本号 > V30,db-apply-migrations.sh 按 sort -V 顺序执行,
--   会在 V30 upsert(写 text)之后再跑本脚本(改 date),最终为 date。
-- ============================================================
USE `zhehang_erp`;
SET NAMES utf8mb4;

UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"开始日期","type":"text"',   '"label":"开始日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"结束日期","type":"text"',   '"label":"结束日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"入职日期","type":"text"',   '"label":"入职日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"申请转正日期","type":"text"', '"label":"申请转正日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"生效日期","type":"text"',   '"label":"生效日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"外带日期","type":"text"',   '"label":"外带日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"归还日期","type":"text"',   '"label":"归还日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"加班日期","type":"text"',   '"label":"加班日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"补卡日期","type":"text"',   '"label":"补卡日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"使用日期","type":"text"',   '"label":"使用日期","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"最后工作日","type":"text"', '"label":"最后工作日","type":"date"');
UPDATE `wf_process_def` SET form_config = REPLACE(form_config, '"label":"预计还款日期","type":"text"', '"label":"预计还款日期","type":"date"');
