import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const leadView = fs.readFileSync(path.join(root, 'src/views/crm/lead.vue'), 'utf8')
const crmApi = fs.readFileSync(path.join(root, 'src/api/crm.ts'), 'utf8')

test('历史客资支持单条和批量重新激活', () => {
  assert.match(leadView, /重新激活到我的客户/)
  assert.match(leadView, /handleHistoryReactivateSingle/)
  assert.match(leadView, /reactivateHistory\(ids\)/)
  assert.doesNotMatch(leadView, /rowSelectable\s*=\s*\(\)\s*=>\s*!isHistoryTab/)
})

test('历史客资调用独立后端语义接口', () => {
  assert.match(crmApi, /reactivateHistory:\s*\(ids:\s*number\[\]\)\s*=>\s*post\('\/crm\/lead\/history\/reactivate'/)
})

test('历史页不暴露批量删除和批量打级', () => {
  assert.match(leadView, /!isHistoryTab && \(!isPublicPoolTab \|\| canManageSales\)/)
  assert.match(leadView, /!isHistoryTab && canManageSales/)
})
