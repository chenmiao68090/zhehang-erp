export type LeadImportFieldLevel = 'required' | 'recommended' | 'extra'

export interface LeadImportFieldDefinition {
  key: string
  label: string
  level: LeadImportFieldLevel
  aliases: string[]
  help?: string
}

export interface MappedLeadImportRow {
  rowNumber: number
  company: string
  legalPerson: string
  phone: string
  companyPhone: string
  wechatNo: string
  creditCode: string
  email: string
  registerStatus: string
  region: string
  industry: string
  enterpriseScale: string
  enterpriseType: string
  registeredCapital: string
  paidCapital: string
  establishedDate: string
  approvedDate: string
  insuredCount: string
  insuredYear: string
  registerAddress: string
  latestAddress: string
  businessScope: string
  remark: string
}

export const LEAD_IMPORT_FIELDS: readonly LeadImportFieldDefinition[] = [
  { key: 'company', label: '企业名称', level: 'required', aliases: ['企业名称', '公司名称', '单位名称', '名称'], help: '每行必须有企业名称' },
  { key: 'phone', label: '有效手机号', level: 'recommended', aliases: ['有效手机号', '手机号', '手机号码', '联系人手机'] },
  { key: 'companyPhone', label: '企业联系电话', level: 'recommended', aliases: ['企业联系电话', '企业联系方式', '联系电话', '联系方式', '公司电话'] },
  { key: 'creditCode', label: '统一社会信用代码', level: 'recommended', aliases: ['统一社会信用代码', '统一信用代码', '信用代码', '社会信用代码'] },
  { key: 'legalPerson', label: '法定代表人/联系人', level: 'recommended', aliases: ['法定代表人', '法人', '法人代表', '联系人', '联系人姓名'] },
  { key: 'wechatNo', label: '微信号', level: 'recommended', aliases: ['微信号', '客户微信', '微信'] },
  { key: 'registerStatus', label: '登记状态', level: 'recommended', aliases: ['登记状态', '经营状态', '企业状态'] },
  { key: 'city', label: '所属城市', level: 'recommended', aliases: ['所属城市', '城市', '市'] },
  { key: 'district', label: '所属区县', level: 'recommended', aliases: ['所属区县', '区县', '区'] },
  { key: 'industry', label: '行业门类', level: 'recommended', aliases: ['国标行业门类', '行业门类', '所属行业', '行业'] },
  { key: 'establishedDate', label: '成立日期', level: 'recommended', aliases: ['成立日期', '成立时间', '注册日期'] },
  { key: 'enterpriseScale', label: '企业规模', level: 'recommended', aliases: ['企业规模', '人员规模', '公司规模'] },
  { key: 'insuredCount', label: '参保人数', level: 'recommended', aliases: ['参保人数', '社保人数'] },
  { key: 'province', label: '所属省份', level: 'extra', aliases: ['所属省份', '省份', '省'] },
  { key: 'enterpriseType', label: '企业类型', level: 'extra', aliases: ['企业(机构)类型', '企业类型', '机构类型', '公司类型'] },
  { key: 'registeredCapital', label: '注册资本', level: 'extra', aliases: ['注册资本', '注册资金'] },
  { key: 'paidCapital', label: '实缴资本', level: 'extra', aliases: ['实缴资本'] },
  { key: 'approvedDate', label: '核准日期', level: 'extra', aliases: ['核准日期'] },
  { key: 'insuredYear', label: '参保人数所属年报', level: 'extra', aliases: ['参保人数所属年报', '参保人数年报', '年报年份'] },
  { key: 'registerAddress', label: '注册地址', level: 'extra', aliases: ['注册地址', '注册地'] },
  { key: 'latestAddress', label: '最新地址', level: 'extra', aliases: ['最新地址', '最新年报地址', '经营地址', '最新经营地址'] },
  { key: 'email', label: '邮箱', level: 'extra', aliases: ['邮箱', '电子邮箱', '企业邮箱'] },
  { key: 'businessScope', label: '经营范围', level: 'extra', aliases: ['经营范围'] },
  { key: 'remark', label: '备注', level: 'extra', aliases: ['备注', '补充说明'] }
] as const

export type LeadImportMapping = Record<string, string>

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-—（）()【】\[\]·:：/\\]/g, '')
}

export function autoMapLeadImportHeaders(headers: string[]): LeadImportMapping {
  const normalized = new Map(headers.map((header) => [normalizeHeader(header), header]))
  const mapping: LeadImportMapping = {}
  for (const field of LEAD_IMPORT_FIELDS) {
    const candidates = [field.label, ...field.aliases]
    const exact = candidates.map(normalizeHeader).map((name) => normalized.get(name)).find(Boolean)
    if (exact) mapping[field.key] = exact
  }
  return mapping
}

export function parseLeadImportCsv(text: string): string[][] {
  const matrix: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const input = text.replace(/^\uFEFF/, '')

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      matrix.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  row.push(cell.trim())
  matrix.push(row)
  return matrix
}

export function normalizeLeadImportMatrix(matrix: unknown[][]): string[][] {
  const normalized = matrix
    .filter(Array.isArray)
    .map((row) => row.map((cell) => {
      if (cell instanceof Date && !Number.isNaN(cell.getTime())) {
        return `${cell.getFullYear()}-${String(cell.getMonth() + 1).padStart(2, '0')}-${String(cell.getDate()).padStart(2, '0')}`
      }
      return String(cell ?? '').trim()
    }))
  while (normalized.length && !normalized[normalized.length - 1].some(Boolean)) normalized.pop()
  return normalized
}

function normalizeDate(value: string): string {
  const normalized = value.trim().replace(/\//g, '-').replace(/[.年]/g, '-').replace(/月/g, '-').replace(/日/g, '')
  const match = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
  if (/^\d{4,5}(?:\.\d+)?$/.test(normalized)) {
    const serial = Number(normalized)
    if (serial > 0 && serial < 60000) {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000)
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
    }
  }
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
  }
  return value.trim()
}

function sourceCell(source: Record<string, string>, mapping: LeadImportMapping, key: string): string {
  const header = mapping[key]
  return header ? String(source[header] ?? '').trim() : ''
}

export function buildLeadImportRows(matrix: string[][], mapping: LeadImportMapping): MappedLeadImportRow[] {
  if (matrix.length < 2) return []
  const headers = matrix[0]
  return matrix.slice(1).map((cells, index): MappedLeadImportRow | null => {
    if (!cells.some(Boolean)) return null
    const source: Record<string, string> = {}
    headers.forEach((header, column) => { source[header] = cells[column] || '' })
    const province = sourceCell(source, mapping, 'province')
    const city = sourceCell(source, mapping, 'city')
    const district = sourceCell(source, mapping, 'district')
    return {
      rowNumber: index + 2,
      company: sourceCell(source, mapping, 'company'),
      legalPerson: sourceCell(source, mapping, 'legalPerson'),
      phone: sourceCell(source, mapping, 'phone').replace(/\s/g, ''),
      companyPhone: sourceCell(source, mapping, 'companyPhone').replace(/\s/g, ''),
      wechatNo: sourceCell(source, mapping, 'wechatNo'),
      creditCode: sourceCell(source, mapping, 'creditCode').replace(/\s/g, '').toUpperCase(),
      // 原样保留给后端逐行校验，避免无效邮箱被前端静默清空后失去纠错机会。
      email: sourceCell(source, mapping, 'email'),
      registerStatus: sourceCell(source, mapping, 'registerStatus'),
      region: [province, city, district].filter(Boolean).join(' / '),
      industry: sourceCell(source, mapping, 'industry'),
      enterpriseScale: sourceCell(source, mapping, 'enterpriseScale'),
      enterpriseType: sourceCell(source, mapping, 'enterpriseType'),
      registeredCapital: sourceCell(source, mapping, 'registeredCapital'),
      paidCapital: sourceCell(source, mapping, 'paidCapital'),
      establishedDate: normalizeDate(sourceCell(source, mapping, 'establishedDate')),
      approvedDate: normalizeDate(sourceCell(source, mapping, 'approvedDate')),
      insuredCount: sourceCell(source, mapping, 'insuredCount'),
      insuredYear: sourceCell(source, mapping, 'insuredYear'),
      registerAddress: sourceCell(source, mapping, 'registerAddress'),
      latestAddress: sourceCell(source, mapping, 'latestAddress'),
      businessScope: sourceCell(source, mapping, 'businessScope'),
      remark: sourceCell(source, mapping, 'remark')
    }
  }).filter((row): row is MappedLeadImportRow => row !== null)
}

export function escapeCsvCell(value: unknown): string {
  const raw = String(value ?? '')
  const safe = /^[=+\-@]/.test(raw.trimStart()) ? `'${raw}` : raw
  return `"${safe.replace(/"/g, '""')}"`
}
