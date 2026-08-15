# 浙杭 ERP 上线部署手册(给销售/人事日常使用)

> 目标:把系统部署到一台服务器,让同事用浏览器访问、登录使用。
> 已经替你准备好:前端容器化、Nginx 托管、一键脚本、密钥模板、调试器仅开发显示。
> **服务器只需要装 Docker,不需要装 Node / Java / MySQL。**

---

## 一、准备一台服务器

1. 在云厂商买一台云服务器(阿里云 ECS / 腾讯云 CVM 都行):
   - 配置:**2 核 4G 起步**(系统含 Elasticsearch 较吃内存;预算紧可看第六节去掉 ES)。
   - 系统:**Ubuntu 22.04**(本手册以它为例)。
2. 在云控制台的「安全组 / 防火墙」**放行端口**:`22`(SSH)、`80`(网站);以后配 HTTPS 再加 `443`。
   - ⚠️ 不要放行 3306 / 6379 / 9200(数据库/缓存/搜索,已配置为仅内网,放行=危险)。
3. 记下服务器的**公网 IP**。

## 二、连上服务器并装 Docker

在你自己电脑的终端:
```bash
ssh root@你的服务器IP          # 按提示输密码/密钥
```
连上后,在服务器里装 Docker:
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker version                # 出现版本号即成功
```

## 三、把项目传到服务器

二选一:

**A. 用 git(项目在 git 仓库时)**
```bash
cd /opt
git clone <你的仓库地址> zhehang-erp
cd zhehang-erp
```

**B. 用 scp 从本机上传**(在你自己电脑上执行):
```bash
scp -r "/Users/chenmiao/陈苗的代码/浙杭系统/zhehang-erp" root@你的服务器IP:/opt/zhehang-erp
```
然后回到服务器:`cd /opt/zhehang-erp`

## 四、填密钥、一键启动

```bash
cp .env.example .env          # 生成仅本机使用的密钥文件
openssl rand -base64 48       # 生成 JWT 密钥
openssl rand -base64 32       # 生成 MFA 加密密钥
nano .env                     # 编辑:数据库、Redis、JWT、MFA 均填写独立随机强密钥
                              # (改完 Ctrl+O 回车保存,Ctrl+X 退出)

bash deploy.sh                # 一键构建并启动(首次较慢,要下镜像+编译)
```
看到 `✅ 启动完成` 后,`docker compose ps` 应看到 web/server/mysql/redis/es 都是 Up。

## 五、首次使用

1. 浏览器打开 `http://你的服务器IP/`
2. 本仓库**不内置种子管理员或默认密码**。全新空库必须先由受控运维流程创建首个超级管理员；口令随机生成、只展示一次，不得写入脚本、文档或聊天记录。
3. 首个超级管理员登录后必须按页面提示修改初始口令，并绑定 MFA 动态验证码。
4. 进 **系统管理 → 员工与账号 → 新增**,给同事建账号:
   - 销售同事 → 系统角色选「销售」类;网销选「网销」
   - 人事同事 → 系统角色选「人事」
   - 系统生成一次性随机初始口令，只在创建成功后展示一次；员工首次登录必须改密。
5. 通过受控渠道分别发送访问地址、账号和一次性初始口令，不得在同一群聊集中发送。

> 如果登录后某些页面提示「表不存在」,执行一次:`bash db-apply-migrations.sh`

## 六、可选:内存不够就去掉 Elasticsearch

如果服务器只有 2G 内存、启动吃力:编辑 `docker-compose.yml`,删掉 `elasticsearch:` 整段,并把 `erp-server` 的 `depends_on` 里的 `elasticsearch` 那两行删掉。全文搜索类功能会降级,其余正常。

## 七、可选但强烈建议:域名 + HTTPS

1. 把域名解析到服务器 IP。
2. 用 Nginx + Let's Encrypt(certbot)签免费证书,或在云厂商挂 SSL。
3. 放行 443,在 `zhehang-erp-ui/nginx.conf` 增加 443 server 段(需要时我可以帮你加)。

## 八、日常维护

```bash
docker compose ps                 # 看运行状态
docker compose logs -f erp-server # 看后端日志
docker compose restart            # 重启
docker compose down               # 停止(数据保留在 ./data)
bash deploy.sh                    # 更新代码后重新构建上线
```
**备份数据库**(定期做):
```bash
docker exec zhehang-mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" zhehang_erp' > backup_$(date +%F).sql
```

---

### 安全自查清单(上线前过一遍)
- [ ] `.env` 中数据库、Redis、JWT、MFA 均使用不同的随机强密钥
- [ ] 代码、SQL、脚本和文档不存在默认账号或默认密码
- [ ] 超级管理员、老板和财务管理员已绑定 MFA
- [ ] 新账号使用一次性随机初始口令，首次登录必须改密
- [ ] 安全组只放行了 22 / 80(/443),没放 3306/6379/9200
- [ ] 角色调试器悬浮球在生产已自动隐藏(本次已改:仅开发显示)
- [ ] 配置了数据库定期备份
