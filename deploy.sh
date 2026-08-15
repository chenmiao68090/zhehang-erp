#!/usr/bin/env bash
# 浙杭 ERP 一键部署脚本(在服务器项目根目录运行:bash deploy.sh)
set -eo pipefail
cd "$(dirname "$0")"


echo "==================================================="
echo " 浙杭 ERP 部署"
echo "==================================================="

# 1) 检查 .env
if [ ! -f .env ]; then
  echo "❌ 没找到 .env。请先执行:"
  echo "     cp .env.example .env"
  echo "   再编辑 .env 填写强密码;JWT 密钥可用以下命令生成:"
  echo "     openssl rand -base64 48"
  exit 1
fi

# 2) 校验关键变量是否缺失或仍是占位符（只判断，不输出变量内容）
set -a
# shellcheck disable=SC1091
. ./.env
set +a

required_secrets=(MYSQL_ROOT_PASSWORD REDIS_PASSWORD JWT_SECRET MFA_ENCRYPTION_KEY)
for secret_name in "${required_secrets[@]}"; do
  secret_value="${!secret_name:-}"
  if [ -z "$secret_value" ]; then
    echo "❌ .env 缺少必填安全变量: $secret_name"
    exit 1
  fi
  case "$secret_value" in
    CHANGE_ME*|change_me*|请改成*|请用_openssl*)
      echo "❌ .env 中 $secret_name 仍是占位值，请替换后再运行。"
      exit 1
      ;;
  esac
done
unset secret_value

if [ "$(printf '%s' "$JWT_SECRET" | wc -c | tr -d ' ')" -lt 32 ]; then
  echo "❌ JWT_SECRET 强度不足，至少需要 32 字节随机值。"
  exit 1
fi

if ! mfa_key_bytes="$(printf '%s' "$MFA_ENCRYPTION_KEY" \
    | openssl base64 -d -A 2>/dev/null | wc -c | tr -d ' ')" \
    || [ "$mfa_key_bytes" -ne 32 ]; then
  echo "❌ MFA_ENCRYPTION_KEY 必须是 Base64 编码的 32 字节随机值。"
  exit 1
fi
unset mfa_key_bytes

# 3) 检查 docker
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ 没装 Docker。安装:curl -fsSL https://get.docker.com | sh"
  exit 1
fi

# 4) 构建并启动(前端会在容器里构建,无需本机装 Node)
echo "▶ 构建并启动所有服务(首次较慢,要下载镜像+编译)..."
docker compose up -d --build

echo ""
echo "✅ 启动完成。常用命令:"
echo "   查看状态:   docker compose ps"
echo "   看后端日志: docker compose logs -f erp-server"
echo "   停止:       docker compose down"
echo ""
echo "🌐 访问:http://<你的服务器IP>/   (本机测试:http://localhost/)"
echo "🔑 系统不内置默认账号或密码；全新空库请先完成受控超级管理员初始化。"
echo "🔐 超级管理员首次登录须改密并绑定 MFA，再到『系统管理→员工与账号』创建账号。"
echo ""
echo "ℹ️ 如果登录后发现某些页面报『表不存在』,说明需要补增量表结构,执行:"
echo "     bash db-apply-migrations.sh"
