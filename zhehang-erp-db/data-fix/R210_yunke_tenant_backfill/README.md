# R210 云客历史租户归属修复

## 边界

- 这是业务数据修复，不属于结构迁移，禁止放入 `migration/` 或随部署自动执行。
- 只处理 `tenant_id IS NULL` 的历史行；已有租户但与系统用户/线索冲突的行只在预览中报告，必须人工核实。
- 只接受系统用户主键、CRM 线索主键和已解析坐席微信映射；绝不按姓名、手机号或“租户 1”猜测。
- 无证据或多租户冲突的记录保留 `tenant_id = NULL` 并登记到 `integration_tenant_quarantine`，业务查询无法看到。

## 执行前

1. 先完成全库备份并校验可恢复。
2. 在脱敏生产副本执行 `00-preview.sql`，由业务负责人确认数量和冲突。
3. 先应用结构迁移 V210，确认治理表存在。
4. 使用受控执行器运行，禁止直接执行 `10-apply.sql`：

```bash
MIGRATION_OPERATOR=<操作人标识> \
  scripts/apply-data-repair.sh \
  zhehang-erp-db/data-fix/R210_yunke_tenant_backfill \
  <备份路径> <唯一run_id>
```

## 回滚

仅在新写入数据已暂停且确认没有依赖这些租户归属的后续业务写入时，通过
`scripts/rollback-data-repair.sh R210_yunke_tenant_backfill <run_id>` 定向回滚。回滚不会删除隔离和审计证据。
