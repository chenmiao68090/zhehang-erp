#!/usr/bin/env bash
# 每日备份 zhehang_erp 数据库:mysqldump → gzip → backups/,自动保留最近 14 份。
# 在服务器 /opt/zhehang-erp/ 下运行(读同目录 .env 拿 MySQL 密码,不打印明文)。
set -u
cd "$(dirname "$0")"

if [ ! -f .env ]; then echo "❌ 缺 .env"; exit 1; fi
set -a; . ./.env; set +a
PASS="${MYSQL_ROOT_PASSWORD:?请在 .env 设置 MYSQL_ROOT_PASSWORD}"

BACKUP_DIR="$(pwd)/backups"
KEEP=14
mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d_%H%M%S)
OUT="$BACKUP_DIR/zhehang_erp_${TS}.sql.gz"

echo "▶ 备份 zhehang_erp → $OUT"
# 用 MYSQL_PWD 传密码(不出现在进程参数里);--single-transaction 不锁表、--quick 流式
if docker exec -e MYSQL_PWD="$PASS" zhehang-mysql \
     mysqldump -uroot --single-transaction --quick --routines --triggers \
     --default-character-set=utf8mb4 zhehang_erp 2>/tmp/backup_err | gzip > "$OUT"; then
  if [ -s "$OUT" ] && gzip -t "$OUT" 2>/dev/null; then
    echo "✅ 备份完成,大小 $(du -h "$OUT" | cut -f1)"
  else
    echo "❌ 备份文件为空或损坏,删除"; rm -f "$OUT"; exit 1
  fi
else
  echo "❌ 备份失败:$(head -1 /tmp/backup_err 2>/dev/null)"; rm -f "$OUT"; exit 1
fi

# 轮转:只保留最近 $KEEP 份
ls -1t "$BACKUP_DIR"/zhehang_erp_*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
echo "ℹ️ 当前保留 $(ls -1 "$BACKUP_DIR"/zhehang_erp_*.sql.gz 2>/dev/null | wc -l) 份备份(上限 $KEEP)"
