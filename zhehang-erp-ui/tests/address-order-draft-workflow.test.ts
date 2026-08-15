import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(resolve('src/views/order/address-order.vue'), 'utf8')
const api = readFileSync(resolve('src/api/address-order.ts'), 'utf8')

test('暂存草稿和提交审批是两个明确动作', () => {
  assert.match(source, />暂存草稿</)
  assert.match(source, />提交审批</)
  assert.match(source, /async function saveDraft\(\)/)
  assert.match(source, /async function saveAndSubmit\(\)/)
  assert.match(source, /await addressOrderApi\.submit\(id\)/)
  assert.match(api, /submit: \(id: number\) => post\(`\/order\/address-order\/\$\{id\}\/submit`\)/)
})

test('列表草稿显示、可编辑删除和单独提交，已提交状态不再提供修改入口', () => {
  assert.match(source, /draft: \{ label: '草稿'/)
  assert.match(source, /isEditableStatus\(row\.status\)/)
  assert.match(source, /submitSavedDraft\(row\)/)
  assert.match(source, /提交后不能继续编辑或删除/)
  assert.match(source, /<span v-else class="ao-muted">已提交<\/span>/)
})

test('暂存最少只要求企业名称，提交前执行完整表单与号码校验', () => {
  assert.match(source, /暂存草稿至少需要填写企业名称/)
  assert.match(source, /async function saveAndSubmit\(\) \{\s*await formRef\.value\?\.validate\(\)/)
  assert.match(source, /对接人号码必须是11位数字/)
  assert.match(source, /有返款时必须填写返款对象/)
  assert.match(source, /有返款时必须上传支付宝收款码/)
})
