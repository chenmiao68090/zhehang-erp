# AGENTS.md — 浙杭 ERP/CRM 开发与部署手册（给 AI 编码助手）

本文件是给 Codex / AI 助手的工作手册。**改完代码必须验证 → 部署 → 健康检查**,流程见下。
对用户始终用**简体中文**回复(用户是新手,讲清楚每一步)。

> **⚠️ 多助手协作**:如果你和另一个 AI 助手(Claude / Codex)一起开发,**每次动手前先读同目录的 `SYNC.md` 并严格遵守它的同步协议**(读日志知道对方在干嘛、认领任务写一行、部署用"部署锁"串行)。这是防止两个助手同时改同一文件、同时部署打架的关键。

---

## 0. 项目概览
- 浙杭集团 ERP/CRM,多租户。**后端** Spring Boot 3.2.5 + MyBatis-Plus(Java 17);**前端** Vue 3 + Vite + TS + Element Plus;MySQL/Redis(ES 容器在跑但后端没用它)。
- **已上线**,Docker Compose 部署在阿里云**轻量应用服务器**(不是 ECS,防火墙叫"防火墙")。
- 域名 **zhehangjituan.中国**(Punycode `zhehangjituan.xn--fiqs8s`),已配 Let's Encrypt HTTPS。
- 代码约定详见 `zhehang-erp/CLAUDE.md`(架构/模块/规范)。本文件只讲**怎么改+怎么上线**。

## 1. 目录
- 仓库根:`zhehang-erp/`(git 仓库)。父目录 `浙杭系统/`(本文件所在)放**运维脚本**,不在 git 里。
- 后端:`zhehang-erp/zhehang-erp-server/`(多模块 Maven,只有 `zhehang-erp-admin` 可启动)。
- 前端:`zhehang-erp/zhehang-erp-ui/`(`src/api/*` 一域一文件;`src/views/*` 对应页面)。
- 数据库:`zhehang-erp/zhehang-erp-db/`(`init/` 初始化、`migration/V*.sql` 版本迁移)。
- 运维脚本(在 `浙杭系统/`):`update.sh`(一键部署)、`db-apply-migrations.sh`、`backup-db.sh`。

## 2. 服务器与凭据(用户自己的生产机)
- SSH:`ssh -i ~/.ssh/zhehang_deploy root@47.243.27.11`,项目在 `/opt/zhehang-erp/`。
- 容器名:`zhehang-server`(后端)、`zhehang-web`(nginx)、`zhehang-mysql`、`zhehang-redis`、`zhehang-es`。库名 `zhehang_erp`。
- **数据库密码在服务器 `/opt/zhehang-erp/.env` 的 `MYSQL_ROOT_PASSWORD`**,脚本内部读取,**绝不要打印/导出明文**。
- 每日自动备份已配(`backup-db.sh` + 凌晨3点 cron,留最近14份在 `/opt/zhehang-erp/backups/`)。

## 3. 核心工作流：改 → 验证 → 部署 → 健康检查

### 3.1 本地验证(部署前必做,省一次 5 分钟服务器构建)
**前端**(改了 .vue/.ts):
```bash
cd "/Users/chenmiao/陈苗的代码/浙杭系统/zhehang-erp/zhehang-erp-ui" && npm run build
```
**后端**(改了 .java):用本机工具链(github 被墙,Maven 走国内源)
```bash
JH="$HOME/erp-toolchain/jdk-17.0.19+10/Contents/Home"; export JAVA_HOME="$JH"; export PATH="$JAVA_HOME/bin:$PATH"
MVN="$HOME/erp-toolchain/apache-maven-3.9.16/bin/mvn"
cd "/Users/chenmiao/陈苗的代码/浙杭系统/zhehang-erp/zhehang-erp-server"
"$MVN" -pl zhehang-erp-modules -am compile -DskipTests 2>&1 | grep -iE "BUILD SUCCESS|BUILD FAILURE|ERROR\]"
```
看到 `BUILD SUCCESS` / `✓ built` 才往下走。

### 3.2 部署(前端+后端一起重建)
```bash
bash "/Users/chenmiao/陈苗的代码/浙杭系统/update.sh"
```
- `update.sh` 会先在本机用 `erp-toolchain` 的 Java17/Maven 打包后端 jar,再上传到服务器;服务器端只做轻量 Docker 镜像构建(复制 jar + 构建前端),不再在轻量服务器里跑 Maven 编译。
- **部署期间旧容器继续跑,无停机。**
- **一次只跑一个 update.sh**(串行,别并发)。前一个没结束别开第二个。

### 3.3 数据库迁移(只有"新增表/列"时需要)
**重要:不要跑 `db-apply-migrations.sh`(它会重跑所有 V*.sql,V30 会把用户在设计器里改过的审批流覆盖回种子)。只应用你新加的那一个文件:**
```bash
# 1) 新建 zhehang-erp/zhehang-erp-db/migration/V49_xxx.sql(用 CREATE TABLE IF NOT EXISTS / ADD COLUMN,保持幂等)
# 2) 上传并只应用这一个文件:
KEY="$HOME/.ssh/zhehang_deploy"; SERVER="root@47.243.27.11"
scp -i "$KEY" "/Users/chenmiao/陈苗的代码/浙杭系统/zhehang-erp/zhehang-erp-db/migration/V49_xxx.sql" "$SERVER:/opt/zhehang-erp/zhehang-erp-db/migration/V49_xxx.sql"
ssh -i "$KEY" "$SERVER" 'cd /opt/zhehang-erp; set -a; . ./.env; set +a
  docker exec -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" -i zhehang-mysql mysql -uroot --default-character-set=utf8mb4 zhehang_erp < zhehang-erp-db/migration/V49_xxx.sql'
```
顺序:**先应用迁移(建表)→ 再 update.sh 换后端**(否则新后端查不到表会报错)。

### 3.4 部署后健康检查(必做)
```bash
KEY="$HOME/.ssh/zhehang_deploy"; SERVER="root@47.243.27.11"; ssh -i "$KEY" "$SERVER" '
  docker compose -f /opt/zhehang-erp/docker-compose.yml ps --format "{{.Name}} {{.Status}}" | grep -E "web|server"
  echo "启动:"; docker logs zhehang-server --since 6m 2>&1 | grep -iE "Started .*Successfully" | tail -1
  echo "异常:"; docker logs zhehang-server --since 6m 2>&1 | grep -iE "ERROR|Exception" | grep -viE "密码错误|AccessDenied:" | tail -5 || echo "(无)"
  curl -s -m8 -o /dev/null -w "首页:%{http_code}\n" --resolve zhehangjituan.xn--fiqs8s:443:47.243.27.11 https://zhehangjituan.xn--fiqs8s/
'
```
要看到:容器 `Up`、`ZheHang ERP System Started Successfully`、异常为空、首页 `200`。
验某个接口存在:`curl ... https://.../api/xxx`(未登录返回 401 是正常的,500 才是出错)。

## 4. 改后端"加字段"必须四处同步(否则存不进/查不出)
实体 Entity + DTO + VO + mapper XML 的 resultMap + 前端 formData/columns，**缺一不可**。

## 5. 必看的坑（踩过的）
- **`update.sh` 不要接管道**(`| head`/`| tail`):head 读够就关管道,SIGPIPE 会在本机打包/上传/远端构建中途掐死它,**没真部署却显示成功**。要单独 `bash update.sh`。
- **zsh 不自动拆词**:`grep --include=*.java` 会被当通配符报错,要加引号 `--include="*.java"`;`perl $FILES` 不展开,用 `grep -l | xargs`。
- **迁移别重跑全部**(见 3.3),只应用新文件。
- **改了核心引擎/无法自测时**:先本地编译 + 部署后健康检查 + 让用户用真实账号验。
- **JAVA_HOME 在 `Contents/Home`**(macOS),不是 `jdk-17.0.19+10/` 根。

## 6. 权限/RBAC 专项坑（动权限前务必读）
- 后端权限:`@PreAuthorize("@perm.hasModule('xxx')")` 给整模块拦截;`@perm.hasModule(m)` = admin 放行 / 有任意 `m:` 前缀权限即过。
- **权限缓存在 Redis(登录时)→ 开/改拦截后相关用户要重新登录一次才生效**。admin(super_admin)永远放行。
- **前端 `v-hasPermi` 有自动翻转**:某角色 permissions 为空时"全显示"兜底,一旦非空就"按权限码精确删按钮"。所以给角色补权限要**配齐**(否则按钮消失)。业务页面基本不用 v-hasPermi(只 system 页用),所以给业务角色补业务权限通常零副作用。
- **给模块加 `@PreAuthorize` 前,先 grep 该模块接口有没有被别的页面/全员自助调用**(例:`/hrm/salary` 是全员看自己工资条、`/hrm/leave` `/hrm/attendance` 全员自助、CRM 被驾驶舱/订单调——这些**不能**一刀切拦)。先查 `grep -rln "@/api/<模块>'" src` 看谁 import。
- 角色→菜单权限数据在 `sys_role_menu`;前端角色 key 与后端可能不一致(后端 super_admin/dept_manager/finance/sales/staff,前端 routes.ts 用 admin/boss/manager…)。真实角色是用户在"角色管理"里建的,**看不到生产库时要问用户要角色清单**。

## 7. 安全/谨慎（这是生产系统!）
- **改生产数据(尤其权限/RBAC、删数据、装定时任务)前,先跟用户讲清要改什么、风险,得到明确同意再做。** 不可逆操作尤其要确认。
- **删"假功能/没用的"代码前**:`grep -rln` 全 src 查有没有真页面 import/导航到它(`hidden` 的页面也可能被真页面链接,删了会 404)。
- 不要把数据库/Redis 密码、`.env` 明文打印或外传。
- 删文件、删数据用**精确文件名/精确条件**,别用通配符误删(尤其服务器上别碰 `dump.rdb`=Redis 数据、`nginx.conf`、`.env`)。
- 部署/迁移**串行**,一个做完(健康检查通过)再做下一个。

## 8. 速查
| 目的 | 命令 |
|---|---|
| 前端验证 | `cd .../zhehang-erp-ui && npm run build` |
| 后端验证 | 见 3.1(设好 JAVA_HOME 再 `mvn -pl zhehang-erp-modules -am compile -DskipTests`) |
| 部署 | `bash "/Users/chenmiao/陈苗的代码/浙杭系统/update.sh"` |
| 应用一个迁移 | 见 3.3 |
| 健康检查 | 见 3.4 |
| 看后端日志 | `ssh -i ~/.ssh/zhehang_deploy root@47.243.27.11 'docker logs zhehang-server --since 10m 2>&1 \| tail -50'` |
