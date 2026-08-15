import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync(new URL('../src/views/leads/pool-admin.vue', import.meta.url), 'utf8')
const importPage = readFileSync(new URL('../src/views/crm/lead-import.vue', import.meta.url), 'utf8')
const importRequest = readFileSync(new URL('../../zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/crm/domain/dto/CrmLeadImportRequest.java', import.meta.url), 'utf8')
const importService = readFileSync(new URL('../../zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/crm/service/CrmLeadImportService.java', import.meta.url), 'utf8')

test('单次领取不再被旧1000上限锁死', () => {
  assert.match(page, /const MAX_SINGLE_CLAIM_LIMIT = 10000/)
  assert.match(page, /singleClaimLimit[^\n]+:max="MAX_SINGLE_CLAIM_LIMIT"/)
})

test('单次批量导入不再被旧1000上限锁死', () => {
  assert.match(page, /const MAX_SINGLE_IMPORT_LIMIT = 100000/)
  assert.match(page, /singleImportLimit[^\n]+:max="MAX_SINGLE_IMPORT_LIMIT"/)
})

test('页面明确提示单次仍受对应每日上限约束', () => {
  assert.match(page, /如高于对应每日上限，保存时会提示先同步提高每日上限/)
})

test('公司资源导入读取已发布规则，不再保留1000行硬限制', () => {
  assert.match(importPage, /poolRuleApi\.overview\(\)/)
  assert.match(importPage, /nonEmptyRows > singleImportLimit\.value/)
  assert.doesNotMatch(importPage, /nonEmptyRows > 1000/)
  assert.match(importRequest, /@Size\(max = 100000/)
  assert.match(importService, /MAX_ROWS = CrmPoolRuleService\.MAX_SINGLE_IMPORT_LIMIT/)
})
