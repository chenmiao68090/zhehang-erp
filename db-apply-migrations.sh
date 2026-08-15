#!/usr/bin/env bash
set -euo pipefail

echo "拒绝执行：批量重放全部历史迁移会覆盖种子数据并掩盖真实失败。" >&2
echo "请先备份，再使用 scripts/apply-single-migration.sh <单个V*.sql> <备份路径>。" >&2
exit 64
