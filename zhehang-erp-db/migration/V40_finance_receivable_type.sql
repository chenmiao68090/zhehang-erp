-- V40: 修复应收应付字段类型漂移(与 V39 同源问题)
-- 现象:finance_receivable.type 库中为 TINYINT NOT NULL(见 init/05-finance.sql),
--       但实体 FinanceReceivable.type 为 String,业务取值字符串枚举:
--         RECEIVABLE 应收 / PAYABLE 应付(见实体注释、前端 i18n receivable.typeReceivable/typePayable)。
--       创建应收应付(POST /finance/receivable)时插入字符串到 TINYINT 列触发 "Incorrect integer value" 500。
-- 处理:将 type 改为 VARCHAR(16),与代码契约对齐(实体/前端无需改动)。
--       保留 NOT NULL(type 是必填判别字段);idx_type 索引自动随列重建;改动时表内无数据,零数据风险。
ALTER TABLE finance_receivable MODIFY COLUMN type VARCHAR(16) NOT NULL COMMENT '类型(RECEIVABLE应收/PAYABLE应付)';
