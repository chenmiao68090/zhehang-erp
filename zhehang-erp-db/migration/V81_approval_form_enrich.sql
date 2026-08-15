-- =============================================================================
-- V81  审批表单增强:付款审批补字段+对公付款方式+必填;请假日期改日期时间选择器+必填。
-- **应用必须 --default-character-set=utf8mb4**(否则中文二次编码乱码,见 V80 教训)。
-- 前端动态渲染器已支持 type=date/datetime/select + required,故只需更新 form_config JSON。
-- =============================================================================

-- 付款审批:加 付款类型/付款日期/付款账号/对公打款信息/备注;付款方式加 对公/支付宝 选项;关键项必填
UPDATE `wf_process_def` SET `form_config` =
'[{"type":"text","field":"payee","label":"收款方","required":true},
  {"type":"text","field":"payCategory","label":"付款类型","required":true},
  {"type":"number","field":"amount","label":"付款金额","required":true},
  {"type":"select","field":"payType","label":"付款方式","required":true,"options":["银行转账","现金","支票","承兑汇票","诚路会计对公打款","浙杭企服对公打款","支付宝"]},
  {"type":"date","field":"payDate","label":"付款日期","required":true},
  {"type":"text","field":"payAccount","label":"付款账号"},
  {"type":"text","field":"publicPayInfo","label":"对公打款信息(对公付款时填:户名/开户行/账号)"},
  {"type":"textarea","field":"reason","label":"付款事由","required":true},
  {"type":"textarea","field":"remark","label":"备注(特殊情况说明)"}]'
WHERE `process_key` = 'payment';

-- 请假审批:开始/结束日期改 datetime(可选具体时间/上下午),关键项必填(天数仍可自动算+手改)
UPDATE `wf_process_def` SET `form_config` =
'[{"type":"select","field":"leaveType","label":"请假类型","required":true,"options":["年假","调休","事假","病假","婚假","产假","陪产假","育儿假","丧假"]},
  {"type":"datetime","field":"startDate","label":"开始时间","required":true},
  {"type":"datetime","field":"endDate","label":"结束时间","required":true},
  {"type":"number","field":"days","label":"请假天数(按时间自动计算,可微调)"},
  {"type":"textarea","field":"reason","label":"请假事由","required":true}]'
WHERE `process_key` = 'leave';
