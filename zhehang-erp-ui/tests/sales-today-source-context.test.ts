import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const workbench = fs.readFileSync(path.join(root, 'src/views/call-center/tele-workbench.vue'), 'utf8')

test('今日工作展示导入来源说明和单位地址', () => {
  assert.match(workbench, /<span>来源说明\/活动名称<\/span>/)
  assert.match(workbench, /current\.sourceDetail \|\| '未填写'/)
  assert.match(workbench, /<span>单位地址<\/span>/)
  assert.match(workbench, /current\.latestAddress \|\| current\.registerAddress \|\| '未填写'/)
  assert.doesNotMatch(workbench, /<span>线索来源<\/span><strong>\{\{ sourceLabel/)
})

test('今日工作映射真实线索字段并展示跟进意向等级', () => {
  assert.match(workbench, /sourceDetail: row\.sourceDetail \|\| ''/)
  assert.match(workbench, /intentLevel: normalizeIntentLevel\(row\.intentLevel\)/)
  assert.match(workbench, /registerAddress: row\.registerAddress \|\| ''/)
  assert.match(workbench, /latestAddress: row\.latestAddress \|\| ''/)
  assert.match(workbench, /current\.intentLevel.*类意向/)
})
