import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const repo = path.resolve(root, '..')

const entity = fs.readFileSync(path.join(
  repo,
  'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/crm/domain/entity/CrmLead.java'
), 'utf8')
const importService = fs.readFileSync(path.join(
  repo,
  'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/crm/service/CrmLeadImportService.java'
), 'utf8')
const leadService = fs.readFileSync(path.join(
  repo,
  'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/crm/service/impl/CrmLeadServiceImpl.java'
), 'utf8')
const portfolio = fs.readFileSync(path.join(root, 'src/views/customer/portfolio.vue'), 'utf8')
const teleWorkbench = fs.readFileSync(path.join(root, 'src/views/call-center/tele-workbench.vue'), 'utf8')
const leadWorkbench = fs.readFileSync(path.join(root, 'src/views/leads/workbench.vue'), 'utf8')
const leadAdmin = fs.readFileSync(path.join(root, 'src/views/crm/lead.vue'), 'utf8')
const customer360 = fs.readFileSync(path.join(root, 'src/components/sales/Customer360Drawer.vue'), 'utf8')

test('新建与导入线索显式写入未分级而不继承数据库旧C默认值', () => {
  assert.match(entity, /@TableField\(insertStrategy = FieldStrategy\.ALWAYS\)\s*private String customerLevel/)
  assert.match(importService, /lead\.setCustomerLevel\(null\)/)
  assert.match(importService, /lead\.setIntentLevel\(null\)/)
  assert.match(leadService, /entity\.setCustomerLevel\(null\)/)
  assert.match(leadService, /entity\.setIntentLevel\(null\)/)
})

test('销售高频页面明确显示未分级', () => {
  for (const source of [portfolio, teleWorkbench, leadWorkbench, leadAdmin, customer360]) {
    assert.match(source, /未分级/)
  }
})

test('未分级客户不会被前端冒充D类计算跟进频率', () => {
  assert.doesNotMatch(leadAdmin, /lead\.level \|\| 'D'/)
  assert.match(leadAdmin, /status: 'unclassified'/)
  assert.match(leadAdmin, /type CustomerLevel = 'A' \| 'B' \| 'C' \| 'D' \| 'E'/)
})
