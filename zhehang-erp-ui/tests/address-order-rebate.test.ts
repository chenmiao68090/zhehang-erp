import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(resolve('src/views/order/address-order.vue'), 'utf8')
const api = readFileSync(resolve('src/api/address-order.ts'), 'utf8')

test('返款入口位于添加服务事项之后和合同周期之前', () => {
  const service = source.indexOf('添加服务事项')
  const rebate = source.indexOf('是否有返款')
  const contract = source.indexOf('合同与付款周期')
  assert.ok(service >= 0)
  assert.ok(rebate > service)
  assert.ok(contract > rebate)
})

test('选择有返款才显示对象和支付宝收款码且关闭会清残留', () => {
  assert.match(source, /v-if="form\.hasRebate === 1"/)
  assert.match(source, /label="返款对象"/)
  assert.match(source, /label="支付宝收款码"/)
  assert.match(source, /form\.rebateRecipient = undefined/)
  assert.match(source, /form\.rebateAlipayQrFileId = undefined/)
})

test('提交审批时前端和后端共同要求对象与收款码且只保存fileId', () => {
  assert.match(source, /有返款时必须填写返款对象/)
  assert.match(source, /有返款时必须上传支付宝收款码/)
  assert.match(source, /form\.rebateAlipayQrFileId = id/)
  assert.match(api, /rebateAlipayQrFileId\?: number/)
  assert.match(api, /\/order\/address-order\/\$\{id\}\/rebate/)
  assert.doesNotMatch(source, /readAsDataURL/)
})
