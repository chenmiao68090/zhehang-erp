import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  getLeadImportSourceRequirement,
  LEAD_IMPORT_SOURCE_SCENES,
  LEAD_SOURCE_PLATFORM_OPTIONS,
  leadSourceLabel,
  resolveLeadImportSourceType
} from '../src/constants/lead-source.ts'
import {
  autoMapLeadImportHeaders,
  buildLeadImportRows,
  escapeCsvCell,
  normalizeLeadImportMatrix,
  parseLeadImportCsv
} from '../src/utils/lead-import.ts'

test('保留旧来源码语义，并把8个导入场景映射到兼容来源码', () => {
  assert.equal(leadSourceLabel(2), '客户转介绍')
  assert.equal(leadSourceLabel(3), '运营投流·美团')
  assert.equal(leadSourceLabel(4), '运营投流·抖音')
  assert.equal(leadSourceLabel(6), '运营投流·其他')
  assert.equal(LEAD_IMPORT_SOURCE_SCENES.length, 8)

  const operation = LEAD_IMPORT_SOURCE_SCENES.find((scene) => scene.key === 'operation')!
  assert.equal(resolveLeadImportSourceType(operation, '美团'), 3)
  assert.equal(resolveLeadImportSourceType(operation, '美团外卖'), 3)
  assert.equal(resolveLeadImportSourceType(operation, '大众点评本地生活'), 3)
  assert.equal(resolveLeadImportSourceType(operation, '抖音'), 4)
  assert.equal(resolveLeadImportSourceType(operation, '抖音本地生活'), 4)
  assert.equal(resolveLeadImportSourceType(operation, '小红书'), 6)
})

test('来源补充信息必填规则与后端合同保持一致', () => {
  for (const sourceType of [1, 3, 4, 6]) assert.equal(getLeadImportSourceRequirement(sourceType), 'platform')
  for (const sourceType of [7, 8, 10]) assert.equal(getLeadImportSourceRequirement(sourceType), 'detail')
  for (const sourceType of [2, 5, 9]) assert.equal(getLeadImportSourceRequirement(sourceType), 'either')
  assert.equal(getLeadImportSourceRequirement(0), null)
})

test('中央来源平台选项保留历史表单值', () => {
  for (const platform of ['闲鱼', '豆包', 'deepseek', '千问', '腾讯元宝', '刻章二次开发', '客户转介绍']) {
    assert.ok(LEAD_SOURCE_PLATFORM_OPTIONS.includes(platform), `${platform} 应保留在来源平台选项中`)
  }
})

test('自动识别工商名单表头，并区分手机号、企业电话和行业', () => {
  const headers = ['企业名称', '有效手机号', '企业联系电话', '统一社会信用代码', '所属省份', '所属城市', '所属区县', '国标行业门类']
  const mapping = autoMapLeadImportHeaders(headers)
  assert.equal(mapping.company, '企业名称')
  assert.equal(mapping.phone, '有效手机号')
  assert.equal(mapping.companyPhone, '企业联系电话')
  assert.equal(mapping.creditCode, '统一社会信用代码')
  assert.equal(mapping.province, '所属省份')
  assert.equal(mapping.city, '所属城市')
  assert.equal(mapping.district, '所属区县')
  assert.equal(mapping.industry, '国标行业门类')
})

test('无效邮箱原样进入预检，不在前端静默丢弃', () => {
  const matrix = normalizeLeadImportMatrix([
    ['企业名称', '邮箱'],
    ['杭州待校验公司', '  不是邮箱  ']
  ])
  const rows = buildLeadImportRows(matrix, autoMapLeadImportHeaders(matrix[0]))
  assert.equal(rows[0].email, '不是邮箱')
})

test('忽略空行但保留原Excel行号，合并省市区并保留注册资本单位', () => {
  const matrix = normalizeLeadImportMatrix([
    ['企业名称', '所属省份', '所属城市', '所属区县', '注册资本', '成立日期', '行业门类'],
    ['杭州甲公司', '浙江省', '杭州市', '西湖区', '1亿元', new Date(2024, 0, 5), '商务服务业'],
    ['', '', '', '', '', '', ''],
    ['杭州乙公司', '浙江省', '杭州市', '滨江区', '100万元', '45296', '软件业']
  ])
  const rows = buildLeadImportRows(matrix, autoMapLeadImportHeaders(matrix[0]))

  assert.deepEqual(rows.map((row) => row.rowNumber), [2, 4])
  assert.equal(rows[0].region, '浙江省 / 杭州市 / 西湖区')
  assert.equal(rows[0].registeredCapital, '1亿元')
  assert.equal(rows[0].establishedDate, '2024-01-05')
  assert.equal(rows[0].industry, '商务服务业')
  assert.equal(rows[0].remark, '')
  assert.match(rows[1].establishedDate, /^2024-/)
})

test('CSV解析支持引号、逗号与换行', () => {
  const matrix = normalizeLeadImportMatrix(parseLeadImportCsv('\uFEFF企业名称,备注\r\n"杭州,甲公司","第一行\n第二行"\r\n'))
  assert.equal(matrix.length, 2)
  assert.equal(matrix[1][0], '杭州,甲公司')
  assert.equal(matrix[1][1], '第一行\n第二行')
})

test('CSV空行不导入但后续数据保留原文件行号', () => {
  const matrix = normalizeLeadImportMatrix(parseLeadImportCsv('企业名称,手机号\n甲公司,13800000000\n,\n乙公司,13900000000\n'))
  const rows = buildLeadImportRows(matrix, autoMapLeadImportHeaders(matrix[0]))
  assert.deepEqual(rows.map((row) => row.rowNumber), [2, 4])
})

test('CSV导出转义双引号并阻止公式注入', () => {
  assert.equal(escapeCsvCell('普通"文本'), '"普通""文本"')
  assert.equal(escapeCsvCell(' =HYPERLINK("x")'), '"\' =HYPERLINK(""x"")"')
  assert.equal(escapeCsvCell('-1+2'), '"\'-1+2"')
})

test('找客户主页面导出复用公式安全转义', () => {
  const leadView = readFileSync(new URL('../src/views/crm/lead.vue', import.meta.url), 'utf8')
  assert.match(leadView, /\.map\(escapeCsvCell\)\.join\(','\)/)
})
