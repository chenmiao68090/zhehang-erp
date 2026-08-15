import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import {
  feigeSuiteApi,
  type FeigeSuiteCapabilities,
  type FeigeSuitePageResult,
  type FeigeSuiteRecord,
  type FeigeSuiteRecordPayload,
  type FeigeSuiteStaffOption
} from '@/api/feige-suite'
import { FEIGE_SUITE_PAGE_MAP, FEIGE_SUITE_PAGES, requireFeigeSuitePage } from './catalog'
import type { FeigeSuiteFieldConfig, FeigeSuitePageConfig } from './types'

const DEMO_STAFF: FeigeSuiteStaffOption[] = [
  { id: 91001, name: '本地演示·顾问甲', deptId: 92001, deptName: 'LOCAL-DEMO顾问部' },
  { id: 91002, name: '本地演示·会计甲', deptId: 92002, deptName: 'LOCAL-DEMO会计部' },
  { id: 91003, name: '本地演示·人事甲', deptId: 92003, deptName: 'LOCAL-DEMO人事部' },
  { id: 91004, name: '本地演示·主管甲', deptId: 92004, deptName: 'LOCAL-DEMO管理部' }
]

const STATUS_CYCLES: Record<string, string[]> = {
  exam: ['pending', 'in_progress', 'completed'],
  config: ['enabled', 'disabled'],
  handover: ['draft', 'pending', 'approved', 'rejected', 'completed'],
  salary: ['draft', 'pending', 'approved', 'rejected', 'paid', 'locked'],
  notice: ['draft', 'published', 'revoked'],
  message: ['unread', 'read', 'archived'],
  approval: ['draft', 'pending', 'approved', 'rejected', 'completed'],
  record: ['active', 'completed', 'archived']
}

const ACTION_STATUS: Record<string, string> = {
  start: 'in_progress',
  submit: 'pending',
  approve: 'approved',
  reject: 'rejected',
  complete: 'completed',
  archive: 'archived',
  publish: 'published',
  revoke: 'revoked',
  enable: 'enabled',
  disable: 'disabled',
  pay: 'paid',
  lock: 'locked',
  unlock: 'approved',
  'mark-read': 'read'
}

function defaultPageStatus(page: FeigeSuitePageConfig): string {
  if (page.code === 'notice-mine') return 'unread'
  if (page.kind === 'config') return 'enabled'
  if (page.kind === 'exam') return 'pending'
  if (page.group === 'notice') return 'draft'
  if (page.kind === 'handover' || page.kind === 'salary' || page.code === 'reimbursement-list' || page.actions.some((item) => item.key === 'approve')) return 'draft'
  return 'active'
}

const stores = new Map<string, FeigeSuiteRecord[]>()
let nextId = 8_000_000

function previewEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/local-preview/feige-suite') || new URLSearchParams(window.location.search).get('suitePreview') === '1'
}

function normalizeKey(key: string): string {
  return key.toLowerCase()
}

const DEMO_SCENES = ['新人基础', '服务质量', '月度复盘', '流程优化', '风险排查', '客户交接', '团队提升', '年度规划', '重点业务', '专项训练', '规范执行', '阶段复盘']
const DEMO_COMPANIES = ['星河科技（本地演示）', '青禾文化（本地演示）', '云帆商贸（本地演示）', '远山咨询（本地演示）']
const DEMO_CONTACTS = ['演示联系人甲', '演示联系人乙', '演示联系人丙', '演示联系人丁']

function fallbackText(page: FeigeSuitePageConfig, field: FeigeSuiteFieldConfig, index: number): string {
  const key = field.key
  const normalized = normalizeKey(key)
  const label = field.label
  const scene = DEMO_SCENES[index % DEMO_SCENES.length]
  if (normalized === 'title') {
    if (label.includes('员工') || label.includes('评分对象')) return DEMO_STAFF[index % DEMO_STAFF.length].name
    if (label.includes('公司') || label.includes('单位')) return DEMO_COMPANIES[index % DEMO_COMPANIES.length]
    if (label.includes('地址商户')) return `本地演示地址服务商${index + 1}`
    if (label.includes('公告')) return `关于${scene}事项的系统公告`
    if (label.includes('消息')) return `${scene}业务提醒`
    if (label.includes('资产')) return `${scene}办公设备${index + 1}号`
    if (label.includes('问题')) return `${page.title}中“${scene}”事项如何处理？`
    if (label.includes('话术')) return `${scene}客户沟通话术`
    if (label.includes('流程')) return `${scene}${page.title}流程`
    if (label.includes('规则')) return `${scene}${page.title}规则`
    if (label.includes('模板')) return `${scene}${page.title}模板`
    if (label.includes('产品')) return `${scene}${page.title}产品`
    if (label.includes('部门') || label.includes('团队')) return DEMO_STAFF[index % DEMO_STAFF.length].deptName || '本地演示部门'
    if (label.includes('报销')) return `${scene}业务费用报销`
    if (label.includes('奖励')) return `${scene}团队激励计划`
    if (label.includes('授权')) return `${scene}数据查看授权`
    if (label.includes('收款') || label.includes('付款')) return DEMO_COMPANIES[index % DEMO_COMPANIES.length]
    return `${scene}${page.title}`
  }
  if (normalized.includes('company')) return DEMO_COMPANIES[index % DEMO_COMPANIES.length]
  if (normalized.includes('customer')) return `本地演示客户${String(index + 1).padStart(2, '0')}`
  if (normalized.includes('supplier')) return `本地演示供应商${String.fromCharCode(65 + index % 6)}`
  if (normalized.includes('merchant')) return `本地演示地址服务商${index + 1}`
  if (normalized.includes('bank') && !normalized.includes('account')) return `本地演示银行${index % 3 + 1}号支行`
  if (normalized.includes('account')) return normalized === 'account' && label === '员工账号'
    ? `demo_staff_${String(index + 1).padStart(2, '0')}`
    : `演示账户（尾号${String(3100 + index).slice(-4)}）`
  if (normalized.includes('phone')) return `138****${String(1200 + index).slice(-4)}`
  if (normalized.includes('email')) return `demo${index + 1}@example.invalid`
  if (normalized.includes('address')) return `杭州市本地演示路${100 + index}号`
  if (normalized.includes('team') || normalized.includes('dept')) return DEMO_STAFF[index % DEMO_STAFF.length].deptName || '本地演示部门'
  if (normalized.includes('owner') || normalized.includes('employee') || normalized.includes('leader') || normalized.includes('publisher') || normalized.includes('receiver') || normalized.includes('manager') || normalized.includes('staff') || normalized.includes('payee') || normalized.includes('contact')) return DEMO_STAFF[index % DEMO_STAFF.length].name
  if (normalized.includes('code') || normalized.endsWith('no')) return `DEMO-${page.code.replaceAll('-', '').slice(0, 8).toUpperCase()}-${String(index + 1).padStart(3, '0')}`
  if (normalized.includes('processname')) return `${scene}${page.title}流程`
  if (normalized.includes('formname')) return `${scene}${page.title}表单`
  if (normalized.includes('steps')) return index % 2 === 0 ? '提交申请 → 主管审核 → 负责人确认' : '登记资料 → 部门复核 → 办结归档'
  if (normalized.includes('question')) return `${page.title}中“${scene}”场景应如何处理？`
  if (normalized.includes('answer')) return `先核实事实，再按${page.title}规范完成记录与复核。`
  if (normalized.includes('result')) return index % 3 === 0 ? '通过' : index % 3 === 1 ? '待改进' : '优秀'
  if (normalized.includes('reason')) return '个人发展安排，已完成必要沟通。'
  if (normalized.includes('requirement')) return '按制度完成目标，并通过负责人复核。'
  if (normalized.includes('rewarddetail')) return '完成阶段目标后按规则发放奖励。'
  if (normalized.includes('qualifiedpeople')) return DEMO_CONTACTS.slice(0, index % 3 + 1).join('、')
  if (normalized.includes('schema') || normalized.includes('inputfields')) return '名称、负责人、业务日期、状态、备注'
  if (normalized.includes('expectedpoints')) return '确认需求、解释方案、约定下一步并完整留痕。'
  if (normalized.includes('customersays')) return '我们还需要比较方案和价格，稍后再决定。'
  if (normalized.includes('selfevaluation')) return '已完成岗位学习目标，能够独立处理日常工作。'
  if (normalized.includes('managerevaluation')) return '业务执行稳定，建议通过并继续提升复杂事项处理能力。'
  if (normalized.includes('handoveritems') || normalized === 'detail') return '客户资料、未办事项、附件和责任人已逐项核对。'
  if (normalized.includes('remark') || normalized.includes('description') || normalized.includes('content') || normalized.includes('notes') || normalized.includes('evaluation') || normalized.includes('summary')) return `本地演示：${scene}${page.title}业务说明，供页面与流程验收使用。`
  if (normalized.includes('position')) return ['客户顾问', '会计专员', '业务主管', '运营专员'][index % 4]
  if (normalized.includes('branch')) return `本地演示银行${index % 3 + 1}号网点`
  if (normalized.includes('serviceperson') || normalized.includes('useperson')) return DEMO_CONTACTS[index % DEMO_CONTACTS.length]
  if (label.includes('事件名称')) return `${scene}${page.title}提醒`
  if (label.includes('事件编码')) return `DEMO-EVENT-${String(index + 1).padStart(3, '0')}`
  if (label.includes('业务类型') || label.includes('事项类型')) return `${scene}业务`
  if (label.includes('岗位')) return ['客户顾问', '会计专员', '业务主管', '运营专员'][index % 4]
  if (label.includes('场景')) return `${scene}业务场景`
  if (label.includes('学习内容')) return `${scene}${page.title}学习材料`
  if (label.includes('考试结果') || label === '结果') return index % 3 === 0 ? '通过' : index % 3 === 1 ? '待改进' : '优秀'
  if (label.includes('步骤')) return index % 2 === 0 ? '提交申请 -> 主管审核 -> 负责人确认' : '登记资料 -> 部门复核 -> 办结归档'
  if (label.includes('要求') || label.includes('标准')) return `按${page.title}制度完成，并由负责人复核。`
  if (label.includes('原因')) return `${scene}业务安排需要调整。`
  if (label.includes('说明') || label.includes('内容') || label.includes('备注') || label.includes('评价') || label.includes('总结')) return `本地演示：${scene}${page.title}业务说明，供页面与流程验收使用。`
  return `${label}${index + 1}`
}

function demoValue(page: FeigeSuitePageConfig, field: FeigeSuiteFieldConfig, index: number): any {
  const normalized = normalizeKey(field.key)
  if (field.options?.length) return field.options[index % field.options.length].value
  if (field.type === 'switch') return index % 2 === 0
  if (field.type === 'date') return dayjs().subtract(index, 'day').format('YYYY-MM-DD')
  if (field.type === 'datetime') return dayjs().subtract(index * 3, 'hour').format('YYYY-MM-DD HH:mm:ss')
  if (field.type === 'month') return dayjs().subtract(index % 5, 'month').format('YYYY-MM')
  if (field.type === 'money') return 1200 + index * 680
  if (field.type === 'number' || field.type === 'rate') {
    if (normalized.includes('score')) return Math.max(58, 92 - index * 3)
    if (normalized.includes('progress') || normalized.includes('rate') || normalized.includes('ratio')) return Math.max(18, 92 - index * 8)
    if (normalized.includes('count')) return 6 + index * 3
    return 1 + index
  }
  return fallbackText(page, field, index)
}

function recordStatus(page: FeigeSuitePageConfig, index: number): string {
  if (page.code === 'notice-mine') return STATUS_CYCLES.message[index % STATUS_CYCLES.message.length]
  if (page.group === 'notice' && page.kind !== 'config') return STATUS_CYCLES.notice[index % STATUS_CYCLES.notice.length]
  if (page.code === 'reimbursement-list') return ['draft', 'pending', 'approved', 'rejected', 'paid'][index % 5]
  if (page.kind === 'exam' || page.code === 'my-learn' || page.code === 'team-learn') return STATUS_CYCLES.exam[index % STATUS_CYCLES.exam.length]
  if (page.kind === 'config') return STATUS_CYCLES.config[index % STATUS_CYCLES.config.length]
  if (page.kind === 'handover' || page.actions.some((item) => item.key === 'approve')) return STATUS_CYCLES.approval[index % STATUS_CYCLES.approval.length]
  if (page.kind === 'salary') return STATUS_CYCLES.salary[index % STATUS_CYCLES.salary.length]
  return STATUS_CYCLES.record[index % STATUS_CYCLES.record.length]
}

function buildRecord(page: FeigeSuitePageConfig, index: number): FeigeSuiteRecord {
  const owner = DEMO_STAFF[index % DEMO_STAFF.length]
  const data: Record<string, any> = {}
  for (const field of page.fields) data[field.key] = demoValue(page, field, index)
  for (const column of page.columns) {
    if (!(column.key in data) && !['status', 'ownerName', 'deptName', 'createTime', 'updateTime'].includes(column.key)) {
      data[column.key] = demoValue(page, { key: column.key, label: column.label, type: column.type === 'money' ? 'money' : column.type === 'date' ? 'date' : column.type === 'datetime' ? 'datetime' : column.type === 'progress' || column.type === 'score' ? 'number' : column.type === 'boolean' ? 'switch' : 'text' }, index)
    }
  }
  const id = nextId++
  const title = String(data.title || `${page.title}记录${index + 1}`)
  return {
    id,
    pageCode: page.code,
    recordNo: `LOCAL-DEMO-${page.code.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
    title,
    categoryCode: String(data.category || data.templateType || page.group),
    status: recordStatus(page, index),
    ownerId: owner.id,
    ownerName: owner.name,
    deptId: owner.deptId,
    deptName: owner.deptName,
    amount: Number(data.amount || data.actual || data.netSalary || data.commission || 0),
    bizDate: String(data.bizDate || data.expenseDate || dayjs().subtract(index, 'day').format('YYYY-MM-DD')),
    dueDate: String(data.dueDate || dayjs().add(index + 1, 'day').format('YYYY-MM-DD')),
    source: 'LOCAL-DEMO本地演示',
    sortNo: index + 1,
    version: 1,
    createTime: dayjs().subtract(index + 1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().subtract(index * 2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    data,
    logs: [{ id: id * 10, action: 'create', toStatus: recordStatus(page, index), operatorName: owner.name, remark: 'LOCAL-DEMO初始化记录', createTime: dayjs().subtract(index + 1, 'day').format('YYYY-MM-DD HH:mm:ss') }]
  }
}

function ensureStore(pageCode: string): FeigeSuiteRecord[] {
  if (!stores.has(pageCode)) {
    const page = requireFeigeSuitePage(pageCode)
    stores.set(pageCode, Array.from({ length: page.kind === 'cards' ? 8 : 12 }, (_, index) => buildRecord(page, index)))
  }
  return stores.get(pageCode)!
}

function payloadRecord(pageCode: string, payload: FeigeSuiteRecordPayload, id = nextId++): FeigeSuiteRecord {
  const owner = DEMO_STAFF.find((item) => item.id === Number(payload.ownerId)) || DEMO_STAFF[0]
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return {
    id,
    pageCode,
    recordNo: `LOCAL-DEMO-${pageCode.toUpperCase()}-${id}`,
    title: payload.title,
    categoryCode: payload.categoryCode,
    status: payload.status || defaultPageStatus(requireFeigeSuitePage(pageCode)),
    ownerId: owner.id,
    ownerName: owner.name,
    deptId: owner.deptId,
    deptName: owner.deptName,
    amount: payload.amount,
    bizDate: payload.bizDate,
    dueDate: payload.dueDate,
    sortNo: payload.sortNo,
    version: payload.version || 1,
    source: 'LOCAL-DEMO本地录入',
    createTime: now,
    updateTime: now,
    data: Object.fromEntries(Object.entries(payload.data || {}).filter(([, value]) => value !== undefined && value !== null && value !== 'undefined')),
    logs: [{ id: id * 10, action: 'create', toStatus: payload.status || defaultPageStatus(requireFeigeSuitePage(pageCode)), operatorName: '本地预览操作人', remark: 'LOCAL-DEMO本地新增', createTime: now }]
  }
}

const demoApi = {
  pages: async () => FEIGE_SUITE_PAGES,
  staffOptions: async () => DEMO_STAFF,
  capabilities: async (pageCode: string): Promise<FeigeSuiteCapabilities> => {
    if (!FEIGE_SUITE_PAGE_MAP.has(pageCode)) throw new Error('未知页面')
    return { manager: true, finance: true, hr: true, canCreate: true, canWrite: true, canManage: true, scope: 'shared' }
  },
  summary: async (pageCode: string) => {
    const records = ensureStore(pageCode)
    return { total: records.length, statuses: records.reduce<Record<string, number>>((result, item) => { result[item.status] = (result[item.status] || 0) + 1; return result }, {}) }
  },
  records: async (pageCode: string, params: Record<string, any>): Promise<FeigeSuitePageResult> => {
    let records = [...ensureStore(pageCode)]
    const keyword = String(params.keyword || '').trim().toLowerCase()
    if (keyword) records = records.filter((item) => JSON.stringify(item).toLowerCase().includes(keyword))
    if (params.status && params.status !== '全部') records = records.filter((item) => item.status === params.status)
    if (params.ownerId) records = records.filter((item) => item.ownerId === Number(params.ownerId))
    Object.entries(params).forEach(([key, value]) => {
      if (!value || ['keyword', 'status', 'ownerId', 'current', 'size'].includes(key)) return
      records = records.filter((item) => String(item.data[key] ?? item[key as keyof FeigeSuiteRecord] ?? '').includes(String(value)))
    })
    records.sort((a, b) => String(b.updateTime).localeCompare(String(a.updateTime)))
    const current = Math.max(1, Number(params.current || 1))
    const size = Math.max(1, Number(params.size || 20))
    const start = (current - 1) * size
    return { records: records.slice(start, start + size), total: records.length, current, size, pages: Math.ceil(records.length / size) }
  },
  detail: async (pageCode: string, id: number) => {
    const record = ensureStore(pageCode).find((item) => item.id === Number(id))
    if (!record) throw new Error('记录不存在')
    return structuredClone(record)
  },
  create: async (pageCode: string, payload: FeigeSuiteRecordPayload) => {
    const record = payloadRecord(pageCode, payload)
    ensureStore(pageCode).unshift(record)
    return record.id
  },
  update: async (pageCode: string, id: number, payload: FeigeSuiteRecordPayload) => {
    const records = ensureStore(pageCode)
    const index = records.findIndex((item) => item.id === Number(id))
    if (index < 0) throw new Error('记录不存在')
    const previous = records[index]
    const updated = payloadRecord(pageCode, payload, previous.id)
    updated.recordNo = previous.recordNo
    updated.createTime = previous.createTime
    updated.version = (previous.version || 1) + 1
    updated.logs = [...(previous.logs || []), { id: Date.now(), action: 'update', fromStatus: previous.status, toStatus: updated.status, operatorName: '本地预览操作人', remark: '更新业务资料', createTime: updated.updateTime }]
    records.splice(index, 1, updated)
  },
  action: async (pageCode: string, id: number, request: { action: string; remark?: string; version?: number }) => {
    const record = ensureStore(pageCode).find((item) => item.id === Number(id))
    if (!record) throw new Error('记录不存在')
    const fromStatus = record.status
    record.status = request.action === 'restore' ? (recordStatus(requireFeigeSuitePage(pageCode), 0)) : (ACTION_STATUS[request.action] || record.status)
    record.version = (record.version || 1) + 1
    record.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    record.logs = [...(record.logs || []), { id: Date.now(), action: request.action, fromStatus, toStatus: record.status, operatorName: '本地预览操作人', remark: request.remark || '本地预览状态操作', createTime: record.updateTime }]
  },
  remove: async (pageCode: string, id: number) => {
    const records = ensureStore(pageCode)
    const index = records.findIndex((item) => item.id === Number(id))
    if (index >= 0) records.splice(index, 1)
  }
}

export const feigeSuiteDataSource = previewEnabled() ? demoApi : feigeSuiteApi

export function announceDemoMode(): void {
  if (previewEnabled()) ElMessage.info({ message: '当前为LOCAL-DEMO本地演示，操作不会写入生产数据', duration: 2600 })
}

export { previewEnabled }
