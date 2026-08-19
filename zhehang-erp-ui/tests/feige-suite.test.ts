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

const expectedGroups: Record<string, string[]> = {
  learning: ['knowledge-exam', 'sop-template', 'exam-config', 'scenario-config', 'my-learn', 'team-learn', 'my-exam', 'team-exam', 'simulation', 'practice-score', 'script-dashboard'],
  consultant: ['consultant-report', 'all-performance', 'dept-performance', 'performance-template'],
  management: ['address-service', 'supplier', 'accounting-handover', 'staff-handover', 'enterprise-level', 'audit-process', 'business-process', 'dynamic-form', 'homepage-config'],
  finance: ['fixed-asset', 'referral-audit', 'renewal-audit', 'bank-diary', 'upgrade-management', 'bank-account', 'collection-script'],
  knowledge: ['product-knowledge', 'faq', 'settlement-rule', 'ai-product'],
  hr: ['probation', 'resignation', 'team', 'contact', 'dept-incentive'],
  salary: ['salary-info', 'salary-payment', 'salary-detail', 'salary-detail-wx', 'salary-detail-yy', 'salary-detail-fb', 'salary-detail-gs', 'salary-detail-kj'],
  reimbursement: ['reimbursement-list', 'reimbursement-analysis'],
  notice: ['notice-list', 'notice-mine', 'notice-message', 'notice-template', 'notice-rule']
}
const allCodes = Object.values(expectedGroups).flat()
const catalog = read('zhehang-erp-ui/src/views/feige-suite/catalog.ts')
const routes = read('zhehang-erp-ui/src/router/feige-suite-routes.ts')
const appRoutes = readRouterSource()
const dataSource = read('zhehang-erp-ui/src/views/feige-suite/data-source.ts')
const page = read('zhehang-erp-ui/src/views/feige-suite/page.vue')
const form = read('zhehang-erp-ui/src/views/feige-suite/components/RecordFormDialog.vue')
const registry = read('zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/feigesuite/service/FeigeSuitePageRegistry.java')

test('55个旧业务页面全部进入前后端白名单', () => {
  assert.equal(allCodes.length, 55)
  assert.equal(new Set(allCodes).size, 55)
  for (const code of allCodes) {
    assert.ok(catalog.includes(`'${code}'`), `${code} 缺少前端页面配置`)
    assert.ok(registry.includes(`"${code}"`), `${code} 缺少服务端白名单`)
  }
  assert.match(catalog, /FEIGE_SUITE_PAGES\.length !== 55/)
  assert.match(registry, /definitions\.size\(\) != 55/)
})

test('八个独立模块和人事行政合并路由均已接入', () => {
  for (const basePath of ['/feige-learning', '/feige-consultant', '/feige-management', '/feige-finance', '/feige-knowledge', '/feige-salary', '/feige-reimbursement', '/feige-notice']) {
    assert.ok(routes.includes(`basePath: '${basePath}'`) || catalog.includes(`basePath: '${basePath}'`), `${basePath} 未接入`)
  }
  assert.match(routes, /FEIGE_HR_CHILD_ROUTES/)
  assert.match(appRoutes, /\.\.\.FEIGE_HR_CHILD_ROUTES/)
  assert.match(appRoutes, /\.\.\.FEIGE_SUITE_ROUTES/)
})

test('页面不是静态菜单壳，具备筛选增改状态详情批量与导出', () => {
  for (const token of ['loadRecords', 'openCreate', 'openEdit', 'openDetail', 'runAction', 'batchRemove', 'exportCsv']) {
    assert.ok(page.includes(token), `${token} 操作缺失`)
  }
  assert.match(page, /supportsBatchComplete/)
  assert.match(page, /capabilities\.canWrite/)
  assert.match(form, /fileInfoApi\.upload/)
  assert.match(form, /单个不超过20MB/)
})

test('LOCAL-DEMO数据显式隔离且不含真实客户和完整手机号', () => {
  assert.match(dataSource, /LOCAL-DEMO/)
  assert.match(dataSource, /previewEnabled\(\)/)
  assert.doesNotMatch(dataSource, /陈苗|章军|程东波|徐丽莉/)
  assert.doesNotMatch(dataSource, /1[3-9]\d{9}/)
})

test('单迁移仅创建feige_suite隔离表且不写演示数据', () => {
  const migrations = fs.readdirSync(path.join(repoRoot, 'zhehang-erp-db/migration')).filter((name) => name.endsWith('_feige_business_suite.sql'))
  assert.equal(migrations.length, 1)
  const migration = read(`zhehang-erp-db/migration/${migrations[0]}`)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS feige_suite_record/)
  assert.match(migration, /CREATE TABLE IF NOT EXISTS feige_suite_audit_log/)
  assert.doesNotMatch(migration, /INSERT\s+INTO/i)
  assert.doesNotMatch(migration, /(UPDATE|DELETE\s+FROM)\s+(biz_|crm_|hrm_|fin_|training_)/i)
})
