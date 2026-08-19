import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readRouterSource } from './router-source.ts'

const here = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(here, '..')
const repoRoot = path.resolve(uiRoot, '..')
const read = (relative: string) => fs.readFileSync(path.join(repoRoot, relative), 'utf8')

const routes = readRouterSource()
const previewRoutes = read('zhehang-erp-ui/src/router/local-preview-routes.development.ts')
const productionPreviewRoutes = read('zhehang-erp-ui/src/router/local-preview-routes.production.ts')
const viteConfig = read('zhehang-erp-ui/vite.config.ts')
const api = read('zhehang-erp-ui/src/api/feige-order-contract.ts')
const baselineMigration = read('zhehang-erp-db/migration/V201_feige_order_contract.sql')
const parityMigration = read('zhehang-erp-db/migration/V202_feige_order_parity.sql')
const demoStore = read('zhehang-erp-ui/src/views/feige-order-contract/demo-store.ts')
const previewLayout = read('zhehang-erp-ui/src/views/feige-order-contract/preview-layout.vue')
const pages = Object.fromEntries(
  ['orders.vue', 'new-order.vue', 'refunds.vue', 'unreceived.vue', 'contracts.vue']
    .map((name) => [name, read(`zhehang-erp-ui/src/views/feige-order-contract/${name}`)]),
)

test('飞哥版订单与合同是独立一级模块并提供五个页面', () => {
  assert.match(routes, /name: '订单与合同'/)
  assert.match(routes, /path: '\/feige-order-contract'/)
  for (const route of ['orders', 'new-order', 'refunds', 'unreceived', 'contracts']) {
    assert.match(routes, new RegExp(`path: '${route}'`))
  }
  assert.equal(Object.keys(pages).length, 5)
  assert.match(pages['orders.vue'], /新增订单/)
  assert.match(pages['new-order.vue'], /收银\/财务审核页面/)
  assert.match(pages['refunds.vue'], /退费订单/)
  assert.match(pages['unreceived.vue'], /未收款订单/)
  assert.match(pages['contracts.vue'], /代理记账合同/)
})

test('五个页面不重复展示内容区标题头且保留刷新入口', () => {
  for (const page of Object.values(pages)) {
    assert.doesNotMatch(page, /module-header|module-title-line|module-desc|independent-tag|<h1>/)
    assert.match(page, />刷新</)
  }
})

test('新模块只调用独立接口，不复用现有提单接口', () => {
  assert.match(api, /\/feige-order-contract\/orders/)
  assert.match(api, /\/feige-order-contract\/refunds/)
  assert.match(api, /\/feige-order-contract\/contracts/)
  assert.doesNotMatch(api, /\/order\/|\/contract\//)
})

test('五个页面保留飞哥订单管理的关键业务操作', () => {
  assert.match(pages['orders.vue'], /新增订单/)
  assert.match(pages['orders.vue'], /费用详情/)
  assert.match(pages['orders.vue'], /复购信息/)
  assert.match(pages['new-order.vue'], /审核通过/)
  assert.match(pages['new-order.vue'], /驳回/)
  assert.match(pages['refunds.vue'], /主管审核/)
  assert.match(pages['refunds.vue'], /财务退款/)
  assert.match(pages['unreceived.vue'], /登记收款/)
  for (const view of ['normal', 'currentRenewal', 't2OverdueRenewal', 't6ExpectedRenewal', 't3OverdueCustomer', 'lossAudit', 'lossCustomer']) {
    assert.match(pages['contracts.vue'], new RegExp(view))
  }
  assert.match(pages['contracts.vue'], /一键交接|批量交接/)
  assert.match(pages['contracts.vue'], /续费/)
})

test('迁移仅扩展feige独立业务表且不写入演示数据', () => {
  for (const table of ['feige_order', 'feige_order_payment', 'feige_order_refund', 'feige_accounting_contract', 'feige_order_operation_log']) {
    assert.match(baselineMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`))
  }
  for (const table of ['feige_order_step', 'feige_contract_renewal', 'feige_contract_change_log', 'feige_contract_handover']) {
    assert.match(parityMigration, new RegExp('CREATE TABLE IF NOT EXISTS `' + table + '`'))
  }
  const migrations = `${baselineMigration}\n${parityMigration}`
  assert.doesNotMatch(migrations, /INSERT\s+INTO\s+feige_/i)
  assert.doesNotMatch(parityMigration, /(?:ALTER|UPDATE|DELETE\s+FROM|INSERT\s+INTO)\s+(?:biz_|crm_|sys_)/i)
})

test('审核、收款、退费和合同生命周期动作均有独立后端接口', () => {
  assert.match(api, /auditOrders/)
  assert.match(api, /auditOrder/)
  assert.match(api, /rejectOrder/)
  assert.match(api, /confirmOrder/)
  assert.match(api, /steps:/)
  assert.match(api, /addPayment/)
  assert.match(api, /applyRefund/)
  assert.match(api, /approveRefund/)
  assert.match(api, /completeRefund/)
  assert.match(api, /terminateContract/)
  assert.match(api, /renewContract/)
  assert.match(api, /restoreContract/)
  assert.match(api, /handoverPreview/)
  assert.match(api, /handover:/)
  assert.match(api, /revokeHandover/)
})

test('LOCAL-DEMO演示仅在开发路由显式开启且不包含真实客户数据', () => {
  assert.match(viteConfig, /command === 'serve'/)
  assert.match(viteConfig, /VITE_ENABLE_LOCAL_PREVIEW === 'true'/)
  assert.match(viteConfig, /local-preview-routes\.development\.ts/)
  assert.match(viteConfig, /local-preview-routes\.production\.ts/)
  assert.match(previewRoutes, /local-preview\/feige-order-contract/)
  assert.match(productionPreviewRoutes, /LOCAL_PREVIEW_ROUTES: RouteRecordRaw\[\] = \[\]/)
  assert.match(previewLayout, /本地验收/)
  assert.match(demoStore, /LOCAL-DEMO/)
  assert.match(demoStore, /zhehangPreview/)
  assert.doesNotMatch(demoStore, /1[3-9]\d{9}/)
})
