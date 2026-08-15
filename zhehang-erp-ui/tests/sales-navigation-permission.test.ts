import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const leadView = readFileSync(new URL('../src/views/crm/lead.vue', import.meta.url), 'utf8')
const portfolioView = readFileSync(new URL('../src/views/customer/portfolio.vue', import.meta.url), 'utf8')

test('线索导出只对真实超级管理员角色显示并在动作层再次拦截', () => {
  assert.match(leadView, /v-if="canExportLeads" command="export"/)
  assert.match(leadView, /const canExportLeads = computed\(\(\) => \(userStore\.roles \|\| \[\]\)\.includes\('super_admin'\)\)/)
  assert.match(leadView, /if \(!canExportLeads\.value\) return ElMessage\.error\('仅超级管理员可导出线索'\)/)
})

test('我的客户提供返回销售经营台的明确入口', () => {
  assert.match(portfolioView, /:icon="ArrowLeft" @click="router\.push\('\/customer\/perf-board'\)"/)
  assert.match(portfolioView, />返回销售经营台<\/el-button>/)
})
