-- V39: 修复财务模块字段类型漂移(导致前端创建凭证/发票一直 500)
-- 现象:finance_voucher.voucher_type、finance_invoice.invoice_type/direction 在库中为 TINYINT,
--       但实体类与前端、以及 FinanceInvoiceServiceImpl.getStats() 的逻辑均使用字符串枚举:
--         凭证类型 voucher_type:JI 记账 / SHOU 收款 / FU 付款 / ZHUAN 转账
--         发票类型 invoice_type:NORMAL 普票 / SPECIAL 专票 / ELECTRONIC 电子
--         发票方向 direction  :INPUT 进项 / OUTPUT 销项
--       插入字符串到 TINYINT 列触发 "Incorrect integer value"。
-- 处理:将三列改为 VARCHAR,与代码契约对齐(实体/前端无需改动)。
ALTER TABLE finance_voucher MODIFY COLUMN voucher_type VARCHAR(16) DEFAULT NULL COMMENT '凭证类型(JI记账/SHOU收款/FU付款/ZHUAN转账)';
ALTER TABLE finance_invoice MODIFY COLUMN invoice_type VARCHAR(16) DEFAULT NULL COMMENT '发票类型(NORMAL普票/SPECIAL专票/ELECTRONIC电子)';
ALTER TABLE finance_invoice MODIFY COLUMN direction   VARCHAR(16) DEFAULT NULL COMMENT '方向(INPUT进项/OUTPUT销项)';
-- 同源漂移:总账余额方向(过账写入 DEBIT/CREDIT)、报表类型(balanceSheet 等)亦为 TINYINT,改 VARCHAR
ALTER TABLE finance_ledger  MODIFY COLUMN direction   VARCHAR(16) DEFAULT NULL COMMENT '余额方向(DEBIT借/CREDIT贷)';
ALTER TABLE finance_report  MODIFY COLUMN report_type VARCHAR(32) DEFAULT NULL COMMENT '报表类型(balanceSheet/incomeStatement/cashFlow)';
