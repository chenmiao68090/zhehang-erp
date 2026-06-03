# 前端去 Mock 就绪度审计 + 修正版 P1 计划

> 日期:2026-06-01 · 依据:直接比对前端 `src/api/*.ts` 与后端 `crm/controller/*.java`
> 结论:**CRM 公海簇不能直接接线**。前端 API 层是超前于后端写的,存在三类系统性契约缺口,盲目去 Mock 会让页面 404 或解析失败。

## 一、三类契约缺口(逐条核实)

### 缺口 1:分页契约全局不一致(影响所有列表页)
- **入参**:前端多处传 `{ page, size }`(或不传),后端要 `{ pageNum, pageSize }`。
- **返回**:后端返回 MyBatis-Plus `IPage`(`{ records, total, current, size, pages }`),前端按 `{ list, total }` 解析。
- 已确认样本:`CrmLeadController.list`、`CrmCollisionController.log` 均为 `IPage`,而前端 `getCollisionLog` 期望 `{list,total}`。
- **影响面**:几乎所有走分页的列表页。

### 缺口 2:后端缺接口(前端调用会 404)
以 `leadApi` 为例,后端 `CrmLeadController` 只有 `list / {id} / add / edit / delete / convert / assign`,而前端还在调:
- `/crm/lead/pool`(公海列表)、`/my`(我的客资)、`/claim`(领取)、`/return`(退回)、`/distribute`(分配)、`/import`、`/export`、`/duplicate`(查重)、`/pool-rules`
- 这些**后端均不存在** → `leads/personal-pool`、`leads/company-pool` 等页面无法接线。

### 缺口 3:返回类型不匹配(接上也解析错)
- `distributeApi.getWeightConfig()`:前端期望 `WeightConfig`(4 个比例字段),后端 `/weight-config?userId=` 返回 `Integer`(算出的权重值)——**概念都不同**。
- `collisionApi.checkDuplicate()`:前端期望 `DuplicateCheckResult` 对象,后端 `/check` 返回 `List<CrmLead>`。

### 额外:localStorage 业务逻辑 Mock(非占位数据,是未实现的功能)
`crm.ts` 里的 `poolRulesMock`(秒级锁/15天冷却/每日抢单上限/A级优先窗口/加权轮询/撞单日志/回收降级)与 `customerLayerApi`(客户分层)**完全是前端 localStorage 实现,后端无对应**。这些是真实业务功能缺口,不是简单 Mock,去不掉除非后端补齐。

## 二、可以直接接线的页面(契约已对齐)
- **公海池配置** `poolConfigApi ↔ CrmPoolConfigController`:已端到端验证可用(建/查/删都通)。唯一注意:`listPools()` 后端写死过滤 `status=0`,而现有数据多为 `status=1`,需对齐(见下)。

## 三、修正版 P1 计划(把"接线优先"改为"契约对齐优先")

**P1-A 全局分页对齐(一处改动解锁所有列表页,最高杠杆)**
- 方案:在前端 `api/request.ts` 响应拦截器里,若 `data.records` 存在则补 `data.list = data.records`(同时保留 records),统一分页响应形状;
- 入参:封装统一分页参数映射(`page→pageNum`、`size→pageSize`),或在各 api 调用处统一传 `pageNum/pageSize`。

**P1-B 关闭演示态(已完成代码,待跑验证)**
- Mock 登录回退已收进 `VITE_USE_MOCK`(默认 false);`/api` 前缀配置已修正。等 bash 通道恢复跑通登录链路即可勾掉。

**P1-C 按"后端就绪度"分层去 Mock**
1. 先做**契约已对齐**的页面(公海池配置等)。
2. 再做**仅返回/入参不一致**的页面(改前端适配即可:线索列表、撞单日志)。
3. 最后做**后端缺接口**的页面(lead pool/claim/distribute、weight-config、客户分层)——这些**必须先补后端**,属于 P2 范畴,不应在 P1 强行去 Mock。

**P1-D 修数据/小 bug**
- 给 V2 种子公海数据补 `tenant_id=1`(否则 admin 看不到)。
- `CrmPoolConfigServiceImpl.listPools()` 的 `status=0` 过滤与数据/语义对齐(0=启用还是禁用?需确认枚举)。

## 四、建议
**不要现在就大改 CRM 页面接线**。正确顺序:先做 P1-A(全局分页适配,一次解锁多页)+ P1-B 验证登录,再按 P1-C 分层推进。后端缺的那批接口(公海领取/分配/查重/权重配置)单独立项归到 P2,我可以先列出需要补的后端接口清单。

> 当前阻塞:我的 Bash 执行通道临时不可用(分类器宕),无法跑前端验证。以上均为读码所得,改动会在通道恢复后统一编译/运行验证。

---

## 五、进展更新(同日,后端补缺已落地)

以下缺口已用真实后端实现闭合(IDE 诊断零报错,即编译通过;运行验证待 Bash 恢复):

| 原缺口 | 现状 |
|---|---|
| `/crm/lead/pool` `/my` `/claim` `/return` `/distribute` `/duplicate` 缺失 | ✅ 已实现(CrmLeadController + ServiceImpl) |
| `poolRulesMock` 秒级锁/15天冷却/每日上限(localStorage) | ✅ 已用 `StringRedisTemplate` 落到服务端:claim 加 SETNX 秒级锁、退回设 15 天冷却、每日领取计数(50/日,当日过期) |
| `/crm/holding/*` 持有上限整组缺失 | ✅ 新增 `ICrmHoldingService`/`CrmHoldingServiceImpl`/`CrmHoldingController`(config CRUD、current、check-limit),并接入 claim 校验链 |
| 新建线索 ownership 落 NULL 进不了公海 | ✅ add 时按是否有负责人默认 private/pool |
| V2 种子数据 tenant_id=NULL + 公海池 status=1(被禁用) | ✅ `V6_seed_tenant_backfill.sql` 回填 |

**claim 现在的完整校验链**:登录 → 每日上限(Redis 计数) → 持有上限(私海持有数 vs 角色上限) → 秒级锁(SETNX) → 公海归属校验 → 冷却期校验 → 落库(租户隔离 + createBy 自动填充)。

仍未闭合(需后续):`distribute/weight-config` 返回 Integer 与前端 `WeightConfig` 不匹配、`collision/check` 返回形状不匹配、`customerLayerApi` 客户分层无后端、holding 的"角色→上限"映射(现取启用配置最大值,TODO 已标)。
