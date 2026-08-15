import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const repo = path.resolve(root, '..')
const portfolio = fs.readFileSync(path.join(root, 'src/views/customer/portfolio.vue'), 'utf8')
const controller = fs.readFileSync(path.join(
  repo,
  'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/crm/controller/CrmLeadController.java'
), 'utf8')
const service = fs.readFileSync(path.join(
  repo,
  'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/crm/service/impl/CrmLeadServiceImpl.java'
), 'utf8')

test('我的客户筛选使用跟进意向等级并提供A到E五个选项', () => {
  assert.match(portfolio, /v-model="leadFilters\.intentLevel" clearable placeholder="意向等级"/)
  assert.match(portfolio, /const intentLevelOptions = \[/)
  for (const level of ['A', 'B', 'C', 'D', 'E']) {
    assert.match(portfolio, new RegExp(`value: '${level}'`))
  }
  assert.match(portfolio, /const intentLevelOptions = \[[\s\S]*?\{ value: 'E', label: 'E类 无效客户' \}\n\]/)
})

test('全部、今日跟进和回收预警共用intentLevel查询参数', () => {
  assert.match(portfolio, /intentLevel: leadFilters\.intentLevel/)
  assert.equal((controller.match(/@RequestParam\(required = false\) String intentLevel/g) || []).length, 3)
  assert.equal((service.match(/applyIntentLevelFilter\(wrapper, intentLevel\)/g) || []).length, 3)
})

test('重置清空意向等级且后端按crm_lead.intent_level精确过滤', () => {
  assert.match(portfolio, /intentLevel: undefined/)
  assert.match(service, /wrapper\.eq\(CrmLead::getIntentLevel, level\)/)
  assert.match(service, /意向等级仅支持A-E/)
  assert.doesNotMatch(service, /applyCustomerLevelFilter/)
})
