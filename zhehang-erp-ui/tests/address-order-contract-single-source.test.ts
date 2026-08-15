import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const view = fs.readFileSync(path.join(root, 'src/views/order/address-order.vue'), 'utf8')

test('服务事项和合同付款周期合并为一个连续填写区块', () => {
  const combinedSection = view.match(/<section class="ao-service-contract">([\s\S]*?)<\/section>/)
  assert.ok(combinedSection)
  assert.match(view, /<el-divider content-position="left">服务事项、合同与收款<\/el-divider>/)
  assert.match(combinedSection[1], /服务事项收款明细/)
  assert.match(combinedSection[1], /合同与付款周期/)
  assert.match(combinedSection[1], /v-model="form\.contractStart"/)
  assert.match(combinedSection[1], /v-model="form\.contractEnd"/)
  assert.equal((view.match(/v-model="form\.contractStart"/g) || []).length, 1)
  assert.equal((view.match(/v-model="form\.contractEnd"/g) || []).length, 1)
  assert.doesNotMatch(view, /<el-divider content-position="left">合同与付款周期<\/el-divider>/)
})

test('服务事项提交时不再写入重复合同日期键', () => {
  assert.match(view, /const serializeServiceItems =/)
  assert.match(view, /serviceMatter:\s*item\.serviceMatter/)
  assert.match(view, /serviceDays:\s*item\.serviceDays/)
  assert.match(view, /amount:\s*item\.amount/)
  assert.match(view, /serviceItems:\s*serializeServiceItems\(serviceItems\.value\)/)
})

test('地址报单不再让员工填写口径不清的注册类型和所属年月', () => {
  assert.doesNotMatch(view, /label="注册类型"/)
  assert.doesNotMatch(view, /label="所属年份"/)
  assert.doesNotMatch(view, /label="所属月份"/)
  assert.doesNotMatch(view, /label="所属年月"/)
  assert.doesNotMatch(view, /query\.bizYear|query\.bizMonth/)
  assert.match(view, /registerType:\s*_legacyRegisterType/)
  assert.match(view, /bizYear:\s*_legacyBizYear/)
  assert.match(view, /bizMonth:\s*_legacyBizMonth/)
  assert.match(view, /\.\.\.businessForm/)
})
