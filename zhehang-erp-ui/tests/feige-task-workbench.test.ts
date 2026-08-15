import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(here, '..')
const repoRoot = path.resolve(uiRoot, '..')
const read = (relative: string) => fs.readFileSync(path.join(repoRoot, relative), 'utf8')

const routes = read('zhehang-erp-ui/src/router/routes.ts')
const api = read('zhehang-erp-ui/src/api/feige-task.ts')
const demo = read('zhehang-erp-ui/src/views/task-workbench/demo-data.ts')
const dataSource = read('zhehang-erp-ui/src/views/task-workbench/data-source.ts')
const businessPage = read('zhehang-erp-ui/src/views/task-workbench/business-task.vue')
const reportPage = read('zhehang-erp-ui/src/views/task-workbench/workflow-report.vue')
const goalPage = read('zhehang-erp-ui/src/views/task-workbench/goal-setting.vue')
const auditPage = read('zhehang-erp-ui/src/views/task-workbench/audit-task-list.vue')
const configDialog = read('zhehang-erp-ui/src/views/task-workbench/components/TaskConfigDialog.vue')
const taskAuditDialog = read('zhehang-erp-ui/src/views/task-workbench/components/TaskAuditDialog.vue')
const auditCreateDialog = read('zhehang-erp-ui/src/views/task-workbench/components/AuditTaskCreateDialog.vue')
const businessCreateDialog = read('zhehang-erp-ui/src/views/task-workbench/components/BusinessTaskCreateDialog.vue')
const requestKey = read('zhehang-erp-ui/src/views/task-workbench/request-key.ts')
const topNav = read('zhehang-erp-ui/src/components/layout/TopNav.vue')
const pages = [
  'business-task.vue',
  'one-time-task.vue',
  'recurring-task.vue',
  'project-dept-task.vue',
  'special-task.vue',
  'workflow-task.vue',
  'workflow-report.vue',
  'goal-setting.vue',
  'workflow-template.vue',
  'subordinate-view.vue'
]

test('任务工单保留服务工单并新增飞哥十页', () => {
  assert.match(routes, /path: '\/customer-issue'/)
  assert.match(routes, /title: '服务工单'/)
  assert.match(routes, /path: '\/task-workbench'/)
  for (const page of pages) {
    assert.ok(fs.existsSync(path.join(repoRoot, 'zhehang-erp-ui/src/views/task-workbench', page)), `${page} 不存在`)
  }
  const productionBlock = routes.slice(routes.indexOf("path: '/task-workbench'"))
  for (const route of ['business-task', 'one-time-task', 'recurring-task', 'project-dept-task', 'special-task', 'workflow-task', 'workflow-report', 'goal-setting', 'workflow-template', 'subordinate-view']) {
    assert.match(productionBlock, new RegExp(`path: '${route}'`))
  }
})

test('十页使用独立feige-task接口且四个数据域齐全', () => {
  for (const endpoint of ['/feige-task/capabilities', '/feige-task/business', '/feige-task/audit', '/feige-task/workflow/tasks', '/feige-task/workflow/report', '/feige-task/goals', '/feige-task/templates', '/feige-task/subordinates']) {
    assert.ok(api.includes(endpoint), `${endpoint} 未定义`)
  }
  assert.doesNotMatch(api, /\/crm\/issue|\/task\/my-tasks|\/im\/task/)
})

test('服务工单与新十页同属任务工单且顶部优先进入新工作台', () => {
  assert.match(routes, /'\/customer-issue': '任务工单'/)
  assert.match(routes, /'\/task-workbench': '任务工单'/)
  assert.match(topNav, /g\.name === '任务工单'/)
  assert.match(topNav, /find\(\(r\) => r\.path === '\/task-workbench'\)/)
})

test('生产R响应统一解包且预览数据源按每次调用动态判定', () => {
  assert.match(api, /function unwrapResponse/)
  assert.match(api, /'code' in response && 'data' in response/)
  assert.match(dataSource, /new Proxy/)
  assert.match(dataSource, /currentDataSource\(\)/)
  assert.doesNotMatch(dataSource, /const feigeTaskData = \(isFeigeTaskLocalDemo\(\)/)
})

test('业务任务保持飞哥八状态、原筛选列和原操作集合', () => {
  for (const label of ['工商经理审核', '公海待接收', '待本人接收', '任务', '交接', '已完单', '问题任务', '回收站']) {
    assert.ok(businessPage.includes(label), `${label} 缺失`)
  }
  for (const label of ['订单编号', '公司名称', '分配人员', '接收人', '成本类目', '成本金额', '接收时间']) {
    assert.ok(businessPage.includes(label), `${label} 列缺失`)
  }
  for (const action of ['填写成本', '去交接', '转分配', '转为异常', '确认完成']) {
    assert.ok(businessPage.includes(action), `${action} 操作缺失`)
  }
  assert.match(api, /canConfirmHandover\?: boolean/)
  assert.match(businessPage, /canUse\(row, 'canConfirmHandover'\)/)
  assert.match(api, /canHandover\?: boolean/)
  assert.match(businessPage, /canUse\(row, 'canHandover'\)/)
  assert.match(api, /canRecycle\?: boolean/)
  assert.match(businessPage, /canUse\(row, 'canRecycle'\)/)
  assert.match(businessPage, /请填写驳回原因/)
})

test('生产空库可配置流程专项类型和规则并可手工补发', () => {
  const configurationEndpoints = new Map([
    ['/feige-task/order-options', 'orderOptions'],
    ['/feige-task/audit/processes', 'auditProcesses'],
    ['/feige-task/bridge-rules', 'bridgeRules'],
    ['/feige-task/bridge-runs', 'bridgeRuns']
  ])
  for (const [endpoint, demoMethod] of configurationEndpoints) {
    assert.ok(api.includes(endpoint), `${endpoint} 未定义`)
    assert.ok(demo.includes(demoMethod), `${endpoint} 缺少LOCAL-DEMO同契约`)
  }
  assert.match(api, /createBusinessTask/)
  assert.match(api, /createAuditTask/)
  assert.match(businessPage, /capabilities\.manager/)
  assert.match(businessPage, /BusinessTaskCreateDialog/)
  assert.match(auditPage, /AuditTaskCreateDialog/)
  assert.match(auditPage, /TaskConfigDialog/)
  assert.match(configDialog, /taskType === 'special'/)
  assert.match(configDialog, /businessTypeCode/)
  assert.match(configDialog, /requiredRoleKey/)
  assert.match(configDialog, /bridgeManage|自动生成规则/)
  assert.match(configDialog, /retryBridgeRun/)
  assert.match(auditCreateDialog, /enabledProcesses/)
  assert.match(businessCreateDialog, /orderId/)
})

test('生产能力以后端响应为准且未接入的转换不显示执行入口', () => {
  for (const capability of ['bridgeManage', 'bridgeTriggerSupported', 'contractConversionSupported', 'addressConversionSupported']) {
    assert.match(api, new RegExp(`${capability}: boolean`))
    assert.match(api, new RegExp(`${capability}: Boolean\\(value\\?\\.${capability}\\)`))
  }
  assert.match(auditPage, /capabilities = ref<FeigeTaskCapabilities>\(\{ \.\.\.CLOSED_CAPABILITIES \}\)/)
  assert.match(businessPage, /capabilities = ref<FeigeTaskCapabilities>\(\{ \.\.\.CLOSED_CAPABILITIES \}\)/)
  assert.match(businessPage, /v-if="capabilities\.bridgeManage && capabilities\.bridgeTriggerSupported"/)
  assert.match(businessPage, /capabilities\.value\.bridgeTriggerSupported/)
  assert.match(businessPage, /可按启用规则自动生成任务/)
  assert.doesNotMatch(businessPage, /bridgeManage \|\| capabilities\.manager/)
  assert.match(auditPage, /capabilities\.bridgeTriggerSupported \? '流程与生成规则' : '审批流程设置'/)
  assert.match(auditPage, /v-if="capabilities\.manager" type="primary"[^>]*>手工补发/)
  assert.match(auditPage, /<TaskConfigDialog v-if="capabilities\.bridgeManage"/)
  assert.match(configDialog, /v-if="capabilities\.bridgeManage && capabilities\.bridgeTriggerSupported" label="自动生成规则"/)
  assert.match(configDialog, /v-if="capabilities\.bridgeManage && capabilities\.bridgeTriggerSupported" label="生成记录"/)
  assert.doesNotMatch(configDialog, /订单自动触发尚未接入，当前请使用手工补发/)
  assert.match(configDialog, /v-if="capabilities\.contractConversionSupported" value="convert_contract"/)
  assert.match(configDialog, /v-if="capabilities\.addressConversionSupported" value="convert_address"/)
  assert.doesNotMatch(configDialog, /:disabled="!capabilities\.(contract|address)ConversionSupported"/)
  assert.match(taskAuditDialog, /showContractConversion/)
  assert.match(taskAuditDialog, /showAddressConversion/)
  assert.doesNotMatch(taskAuditDialog, /info\.value\.conversionSupported/)
  assert.doesNotMatch(taskAuditDialog, /info\.value\.(contract|address)ConversionSupported/)
  assert.doesNotMatch(taskAuditDialog, /hasConvertAddress" label="流程完成后转为地址"/)
})

test('手工补发请求键每次打开生成一次且失败重试沿用', () => {
  assert.match(api, /interface BusinessTaskCreatePayload \{\s+requestKey: string/)
  assert.match(api, /interface AuditTaskCreatePayload \{\s+requestKey: string/)
  assert.match(requestKey, /crypto/)
  assert.match(requestKey, /randomUUID/)
  assert.match(requestKey, /0x40/)
  for (const dialog of [businessCreateDialog, auditCreateDialog]) {
    assert.equal((dialog.match(/createTaskRequestKey\(\)/g) || []).length, 1)
    assert.match(dialog, /function open\(\)[\s\S]*?createTaskRequestKey\(\)[\s\S]*?visible\.value = true/)
    assert.match(dialog, /requestKey: form\.requestKey/)
    assert.doesNotMatch(dialog, /function submit\([\s\S]*?requestKey: createTaskRequestKey\(\)/)
  }
})

test('周报使用ISO周年且目标动作与后端状态契约一致', () => {
  assert.match(reportPage, /v-model="weekDate"/)
  assert.match(reportPage, /currentWeekKey\(new Date\(value\)\)/)
  assert.doesNotMatch(reportPage, /value-format="YYYY-\[W\]ww"/)
  assert.match(goalPage, /\['draft','active'\]\.includes\(goal\.status\)/)
  assert.match(goalPage, /\['draft','archived'\]\.includes\(goal\.status\)/)
})

test('LOCAL-DEMO只能在DEV且显式查询参数开启', () => {
  assert.match(demo, /import\.meta\.env\.DEV/)
  assert.match(demo, /taskPreview/)
  assert.match(demo, /LOCAL-DEMO/)
  assert.doesNotMatch(demo, /localStorage/)
})

test('演示数据不含旧系统员工硬编码或真实联系方式', () => {
  assert.doesNotMatch(demo, /陈苗|章军|程东波|徐丽莉/)
  assert.doesNotMatch(demo, /1[3-9]\d{9}/)
})

test('独立迁移只创建feige_task表且不写业务演示数据', () => {
  const migrationPath = path.join(repoRoot, 'zhehang-erp-db/migration/V203_feige_task_workbench.sql')
  assert.ok(fs.existsSync(migrationPath), 'V203迁移不存在')
  const migration = fs.readFileSync(migrationPath, 'utf8')
  assert.match(migration, /CREATE TABLE IF NOT EXISTS feige_task_/)
  assert.doesNotMatch(migration, /INSERT\s+INTO\s+feige_task_/i)
  assert.doesNotMatch(migration, /(UPDATE|DELETE\s+FROM)\s+(biz_|crm_|im_)/i)
})
