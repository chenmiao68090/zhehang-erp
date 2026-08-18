# V236 上线评估报告 — 2026-08-17

> 给老板带去 GitHub `origin/main` 上看的决策参考。  
> 当前状态：**未 push**，所有改动都在本地 `main` 工作树 `zhehang-erp-main/`，远端仍是 `cda5b3b`。

---

## 一、TL;DR（一分钟版）

- **V236（你的本次需求）**：删 `routes.ts:436` 的 `navigationHidden: true, ` 1 个字段，已 commit、未 push、无冲突。
- **本地 `main` 比 `origin/main` 多 5 个 commit**（4 个 ahead 是你之前的 V226-V235 段工作，1 个是我这次的 V236）。
- **服务器线上当前是 `origin/main` 状态**（线上 dist 的 routes chunk 仍含 `navigationHidden`），ahead 4 个 commit **未在线上跑过**。
- **目标**：把 V236 + 至少 2 个低风险 fix 推到 origin/main，让服务器 `git pull` 后能跑 `bash update.sh` 部署。
- **拦路虎**：`1d3f3245 删除运营体系` 是高风险 commit（删表未落 migration），`48ebd42 sync` 是中风险（改部署脚本）。直接 `rebase --onto origin/main` 卡在 `091a2b3` 的 `ReportDatasetServiceImpl.java` 冲突，**已 abort**。

---

## 二、当前状态

### Git 工作区

```
origin/main = cda5b3b (2026-05-24)
main HEAD   = 4f68eac V236 (2026-08-17 15:57)
[ahead 5]   = 4f68eac + 1d3f3245 + 15dcfe55 + 091a2b39 + 48ebd42d
```

### 服务器（zhehangjituan.xn--fiqs8s）

```
zhehang-server :latest  镜像 label 2026-07-24T12:48Z
zhehang-web    :latest  同上
当前 web/server 容器 Up 12 分钟（最近部署 08-17 15:27 左右）
线上 dist 仍含 navigationHidden  →  服务器源码 = origin/main 状态
```

### 已落地的本地改动

- ✅ `routes.ts:436` 删除 `navigationHidden: true, ` 1 个字段
- ✅ commit `4f68eac V236:恢复提单中心侧栏导航`（已 commit，未 push）
- ✅ 本地 `vite build` 通过：`✓ built in 7.98s`，新 routes chunk 验证：
  - 含 `刻章业务提单`/`seal-order`/`OrderSealBill` ✅
  - `navigationHidden` 0 次 ✅
  - 父菜单 meta = `提单中心,icon:Tickets,roles:[admin,boss,...]`（无 navigationHidden） ✅
- ✅ 老 dist 暂存 `/tmp/zh-v236-prebuild-bak-1786953371`（不动，作为回滚备份）
- ⚠️ `scripts/verify-production-build.mjs` ENOENT 报错——macOS xattr 问题（`dist/` 目录带 `@` 属性），**与本次代码无关**，是项目里一条质量门禁被旁路

### rebase 失败已 abort

```
$ git rebase --onto origin/main 48ebd42d main
CONFLICT (content): Merge conflict in
  zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/report/service/impl/ReportDatasetServiceImpl.java
error: could not apply 091a2b3... fix(安全): 收紧报表引擎 SQL 校验
$ git rebase --abort  # 已回退
```

**冲突原因**：`091a2b3` 在 `ReportDatasetServiceImpl.java` 上的 SQL 校验加严 diff 是基于 `48ebd42 sync 之后`的代码版本，但 `origin/main` (cda5b3b) 是 sync 之前的版本，文件上下文不一致。强行 rebase 必须人工解冲突。

---

## 三、ahead 5 commit 详情（按时间倒序，最新在上）

### 4f68eaca | 2026-08-17 15:57 | V236:恢复提单中心侧栏导航（本次新增）

**风险等级**：🟢 低

**改动**：1 文件 1 行
```
zhehang-erp-ui/src/router/routes.ts
-    meta: { title: '提单中心', icon: 'Tickets', navigationHidden: true, roles: [...] },
+    meta: { title: '提单中心', icon: 'Tickets', roles: [...] },
```

**commit message**：
> 去除路由 `/order`（提单中心）的 `meta.navigationHidden`: V227 当时把提单中心从侧边栏隐了，代理业务放到新大类「订单与合同」（`/feige-order-contract`）下；按用户 2026-08-17 决定，V236 恢复「提单中心」在侧边栏显示（包含子项：代理记账提单、挂靠地址提单、**刻章业务提单**、工商业务提单、审单中心、规则说明书）。  
> 路由、页面、审批、数据、API 全部保留，本次只动 1 个 meta 字段。

**验证**：vite build 通过，routes chunk 内 `刻章业务提单` 字段保留 + `navigationHidden` 已消除。

---

### 1d3f3245 | 2026-08-17 15:38 | 删除运营体系(运营服务中心)

**风险等级**：🔴 **高（建议暂缓）**

**改动**：279 文件 / +331 / -2291
- 前端：删 `views/operation/` 7 文件 + `api/operation.ts` + `api/operation-service.ts` + `routes.ts` 运营体系菜单路由
- 后端：删 `modules/operation/`（OpsAdFeedback 3 文件）+ `modules/channel/`（OpChannelMetric 3 文件）
- 数据库：**commit message 声称**已 DROP `ops_ad_feedback` / `biz_op_channel_metric` 两表、删 `sys_menu 900013` + `sys_role_menu` 关联
- 备份：`backups/pre-drop-operation-20260817-153751.sql.gz`

**关键风险点**：

1. **没有 DROP migration 落到仓库**——仓库里反而**仍保留**建表迁移：
   - `V61_ops_ad_feedback.sql`
   - `V64_op_channel_metric.sql`
   - `V119_op_channel_metric_category.sql`
2. 新环境初始化会按 V61/V64 重新建出"被删的表"，跟代码不一致
3. 生产库当前 DROP 状态未知：commit message 说"DROP 了"，但没在仓库留证据；本次 deploy 后谁也说不准线上到底有没有真的 DROP
4. 删除 6 Java + 7 vue 是干净的（`git grep` 确认无 Java/前端残留引用），但 DB/菜单层有隐患

**建议**：先把 DROP 写一条 `V120_drop_operation.sql` migration 落到仓库，明确"已 DROP 的表不要重建"，再考虑 push。

---

### 15dcfe55 | 2026-08-16 04:57 | fix(文件): 修复回收站恒空(@TableLogic 冲突)

**风险等级**：🟢 低

**改动统计**：531 文件 / +326077 / -23  
⚠️ 注意：这个 stat 数字偏大，原因是它父 commit `48ebd42 sync` 引入了 `dist.bak*` 构建产物（`.gitignore` 没排 `dist.bak*`），`git show --stat` 把父 commit 已经带的产物也算进去了。**真实改动只有 2 个文件**：
- `FileInfoMapper.java` +6 行（新增 `selectRecycleBin` 自定义 @Select 显式查 `deleted=1`）
- `FileInfoServiceImpl.java` +8/-5 行（改 `getRecycleBin` 走新方法，绕过 `@TableLogic` 自动追加 `deleted=0`）

**commit message**：
> - `getRecycleBin` 原用 `ServiceImpl.page()` 会被 `@TableLogic` 自动追加 `deleted=0`，软删除文件永远查不出  
> - 新增 `FileInfoMapper.selectRecycleBin` 自定义 `@Select` 显式查 `deleted=1`，绕过自动过滤  
> - 不影响线上数据，纯查询逻辑

**rebase 时的表现**：clean，git 会自动 apply。

---

### 091a2b39 | 2026-08-16 04:35 | fix(安全): 收紧报表引擎 SQL 校验

**风险等级**：🟢 低

**改动统计**：172 文件 / +380 / -1  
⚠️ 同样偏大（`dist.bak*` 算进了父 commit），**真实改动只有 1 个文件 4 行**：

```java
// zhehang-erp-server/.../modules/report/service/impl/ReportDatasetServiceImpl.java
- if (trimmed.contains(";") && !trimmed.endsWith(";")) {
+ // 任何分号都拒绝:单 SELECT 语句不需要分号,结尾分号是多语句注入的典型绕过手段
+ if (trimmed.contains(";")) {
+ " show ", " set ", " call ", " describe ", " rename ", " handler ", " use ",
```

**commit message**：
> - 分号拦截改为任何分号都拒绝（原逻辑结尾分号可绕过，多语句注入面）  
> - 禁用词补全 show/set/call/describe/rename/handler/use  
> - 不涉及数据库变更，不影响线上数据

**rebase 时的表现**：与 `origin/main` 冲突（`ReportDatasetServiceImpl.java` 文件上下文不一致），**已 abort**。

---

### 48ebd42d | 2026-08-16 04:26 | sync: 从生产服务器拉取源码对齐 main

**风险等级**：🟡 中（建议单独决策）

**改动**：1784 文件 / +211439 / -37962

**commit message**：
> - 以生产 `/opt/zhehang-erp` 实际源码为准，覆盖本地 main 分支  
> - 消除本地 main 与生产的版本分叉（报表引擎 executeQuery、前端 sanitize-html/DOMPurify 等）  
> - 删除本地残留旧模块（multidim/call-center/openapi/旧finance/crm/workflow/supply 等）  
> - 清理顶层临时脚本（_*.js/scan-corrupt.js 等）  
> - 不含敏感文件（.env/dump.rdb/data/backups/upload 均已排除）

**关键内容**：
- **生产部署基础设施全套**：`docker-compose.yml`（新增 erp-web/Nginx、密钥改读 `.env`、去掉硬编码密码）、`deploy.sh`、`zhehang-erp-admin/Dockerfile` 等
- **195 个 migration 文件**（含 `init/*.sql`）
- **大量 Java**（含 admin/security/auth 模块）
- **大量前端**（旧模块被删）
- ⚠️ **带进了 `dist.bak*` 构建产物**（`dist.bak-1786825863/`、`dist.bak-1786827139/`、`dist.bak-nav-1786952118/` 等）—— `.gitignore` 没排 `dist.bak*`，仓库膨胀

**关键判断**：
- 内容来自生产 08-16 源码快照，**生产已经在跑这份代码**（代码层面）
- 但没落 origin/main 远端，所以"git 历史"上没记录
- push 它 = 让 origin/main 追平生产，本身安全，但：
  - 一旦 push，别人看 GitHub 会看到 1784 文件改动 + 195 migration + 部署脚本变更，**容易误以为有新功能上线**
  - 同时把 `.gitignore` 的 `dist.bak*` 漏洞带进仓库历史，未来还得清理

---

## 四、风险评估与冲突分析

### 三类风险

| 类型 | commit | 影响 |
|---|---|---|
| **必须上线（无脑合）** | V236、15dcfe55、091a2b39 | bug fix + 需求修改 + 安全加严，无 DB 变更 |
| **单独决策** | 48ebd42d (sync) | 改部署脚本/docker-compose，建议在 push 前确认"是否要追平生产代码到 origin/main" |
| **必须暂缓** | 1d3f3245 (删运营) | DROP 表状态不明、migration 缺失，新环境会反向重建已删表 |

### 冲突根因分析

`git rebase --onto origin/main 48ebd42d main` 失败原因是：

```
48ebd42d (sync) 引入了"生产当前状态"为代码 baseline
↓
091a2b3 / 15dcfe5 / 1d3f3245 / 4f68eac (V236) 都是在 sync 基础上做的
↓
但 origin/main (cda5b3b) 是 sync 之前的状态
↓
rebase 想把 sync-之后的 commit 移植到 sync-之前 → diff 文件上下文不一致 → 冲突
```

**结论**：rebase --onto origin/main 行不通（除非先手动解冲突 091a2b3 + 1d3f3245 的所有相关 diff）。

---

## 五、下一步建议（你来拍）

### 方案 A：手动 cherry-pick V236 单 commit（推荐）

- 在 origin/main 上 cherry-pick 仅 `4f68eac V236` 的 diff
- 无冲突（V236 只动 routes.ts，不涉及 091a2b3 的 ReportDatasetServiceImpl）
- push 单 commit，origin/main 多 1 个 commit
- 15dcfe5/091a2b39（bug fix + 安全加严）暂不推，等老板评估 ahead 4 commit 后再决定

**优点**：最安全；冲突风险为 0；本地 V236 改动独立可推  
**缺点**：回收站 bug fix + 报表 SQL 校验 加严 仍未上

### 方案 B：先解决 ahead 4 commit 的根本问题，再整体 push

- 给 `1d3f3245 (删运营)` 加 `V120_drop_operation.sql` migration + 文档说明"DROP 已完成"
- 决定 `48ebd42d (sync)` 是否要进 origin/main；如果要，单独评审它动部署脚本的改动
- 然后整体 push 5 commit

**优点**：ahead 4 commit 全部上线，仓库历史完整  
**缺点**：耗时长，牵涉多模块审查

### 方案 C：暂不 push，本地保留 ahead 5 commit，等你做完 GitHub 端 review 再决定

- 不动 origin/main
- 你去 GitHub 上对比 main 与 origin/main，看 ahead 5 commit 内容
- 在 GitHub 上直接做决定（PR review / web editor / etc）
- 回头告诉我 push 范围

**优点**：完全控制，最安全  
**缺点**：V236 不立即生效，菜单不恢复

---

## 六、关键操作建议（不管哪个方案都要做）

1. **如果 push 任何东西到 origin/main**：先通知我，让我跑 `git push`（不擅自 push），push 完后再让你跑 `bash update.sh` 部署
2. **如果 push V236 + 091a2b39 + 15dcfe55**：需要手工解 091a2b3 冲突（如果方案 A 之外的方案涉及）
3. **部署后验证清单**（按 AGENTS.md 3.4）：
   - 容器 `Up`
   - 后端日志 `Started ... Successfully`
   - 异常为空
   - 首页 HTTP 200
   - 登录后侧边栏能看到「提单中心」大类
   - 点击「刻章业务提单」能进刻章页面
4. **`verify-production-build.mjs` xattr 问题**：建议另开任务排查，跟本次改动无关，但质量门禁被旁路是个隐患

---

## 七、附：本任务里创建的临时文件

- `/tmp/zh-v236-prebuild-bak-1786953371/` 老 dist 备份（不动，作为回滚兜底）
- `/Users/chenmiao/陈苗的代码/浙杭系统/zhehang-erp-main/.workbuddy/reports/V236-push-summary-20260817.md` 本报告
- `/Users/chenmiao/陈苗的代码/浙杭系统/zhehang-erp-ui/dist.bak-deploy-1786954243/` rebase 中间产物（untracked），可手动清理

---

**结论一句话**：V236 的 1 行改动已经准备好且通过本地 vite build 验证，但 ahead 4 commit 不能跟它一起"裸 push"——你拍 push 范围，我执行 push，你跑 `bash update.sh`。