import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const teleWorkbench = fs.readFileSync(path.join(root, 'src/views/call-center/tele-workbench.vue'), 'utf8')
const leadWorkbench = fs.readFileSync(path.join(root, 'src/views/leads/workbench.vue'), 'utf8')
const leadAdmin = fs.readFileSync(path.join(root, 'src/views/crm/lead.vue'), 'utf8')
const customer360 = fs.readFileSync(path.join(root, 'src/components/sales/Customer360Drawer.vue'), 'utf8')

test('销售高频入口统一展示A到E五类意向', () => {
  for (const source of [teleWorkbench, leadWorkbench, leadAdmin, customer360]) {
    for (const level of ['A', 'B', 'C', 'D', 'E']) {
      assert.match(source, new RegExp(`value:\\s*'${level}'|value="${level}"`))
    }
  }
  assert.doesNotMatch(leadAdmin, /value="F"/)
})

test('通话小结按A/B/C继续跟进并按D/E结束跟进', () => {
  assert.match(teleWorkbench, /\['D', 'E'\]\.includes\(summary\.customerLevel\)/)
  assert.match(teleWorkbench, /保存后客户进入历史客资/)
  assert.match(teleWorkbench, /保存后保留在我的客户·跟进中/)
  assert.match(teleWorkbench, /if \(level === 'F'\) return 'E'/)
})

test('普通跟进与客户360对D/E隐藏下一步并给出历史提示', () => {
  assert.match(leadWorkbench, /followMovesToHistory/)
  assert.match(leadWorkbench, /客户将进入历史客资/)
  assert.match(customer360, /leadMovesToHistory/)
  assert.match(customer360, /D\/E 类保存后进入历史客资/)
})
