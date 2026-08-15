# 数据库迁移脚本

本目录存放数据库版本迁移脚本。

## 命名规范
- 新脚本统一使用 `V{全局唯一整数}_{描述}.sql`。
- V210 之前存在 8 组历史重复版本，仅作为冻结基线保留；禁止再新增重复版本。

## 执行方式
- 禁止批量重放目录。
- 先执行 `node scripts/verify-migrations.mjs`。
- 再通过 `scripts/apply-single-migration.sh <文件> <备份路径>` 单文件应用。
- 结构迁移只放本目录；业务数据修复放 `zhehang-erp-db/data-fix/`。

## 注意事项
- 每个新迁移必须提供同版本 `precheck.sql` 和 `rollback.md`。
- 历史脚本由 `migration-baseline-v209.sha256` 冻结，任何字节变化都会阻断构建。
- 执行人、时间、校验和、备份点和结果写入 `schema_migration_history`。
- 生产前必须在全新空库和脱敏生产副本分别验证；失败不得“忽略后继续”。
