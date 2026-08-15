import type {
  AuditProcess,
  AuditProcessDetail,
  AuditProcessPayload,
  AuditProcessStepConfig,
  AuditPayment,
  AuditProcessStep,
  AuditTask,
  AuditTaskCreatePayload,
  BusinessTask,
  BusinessTaskCreatePayload,
  Goal,
  GoalPayload,
  PageResult,
  RequiredScope,
  RoleTreeNode,
  StaffOption,
  SubordinateDetail,
  SubordinateRow,
  TaskBridgeRule,
  TaskBridgeRulePayload,
  TaskBridgeRun,
  TaskOrderOption,
  WorkflowMonthStat,
  WorkflowReportRow,
  WorkflowTask,
  WorkflowTemplate,
  WorkflowTemplatePayload
} from '@/api/feige-task'

const DEMO_FLAG = 'zhehang-feige-task-preview'

export function isFeigeTaskLocalDemo(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false
  const previewPath = window.location.pathname.startsWith('/local-preview/feige-task')
  if (!previewPath) {
    window.sessionStorage.removeItem(DEMO_FLAG)
    return false
  }
  const requested = new URLSearchParams(window.location.search).get('taskPreview') === '1'
  if (requested) window.sessionStorage.setItem(DEMO_FLAG, '1')
  return requested || window.sessionStorage.getItem(DEMO_FLAG) === '1'
}

const staff: StaffOption[] = [
  { id: 9101, name: '本地演示·销售甲', deptId: 901, deptName: 'LOCAL-DEMO销售一部', roleId: 11, roleName: '销售人员' },
  { id: 9102, name: '本地演示·销售乙', deptId: 902, deptName: 'LOCAL-DEMO销售二部', roleId: 11, roleName: '销售人员' },
  { id: 9201, name: '本地演示·顾问甲', deptId: 903, deptName: 'LOCAL-DEMO顾问部', roleId: 12, roleName: '服务顾问' },
  { id: 9301, name: '本地演示·财务甲', deptId: 904, deptName: 'LOCAL-DEMO财务部', roleId: 13, roleName: '财务审核' },
  { id: 9401, name: '本地演示·主管甲', deptId: 901, deptName: 'LOCAL-DEMO销售一部', roleId: 14, roleName: '部门主管' }
]

const roles: RoleTreeNode[] = [
  { id: 14, name: '管理者', key: 'manager', children: [{ id: 11, name: '销售人员', key: 'sales' }, { id: 12, name: '服务顾问', key: 'consultant' }] },
  { id: 13, name: '财务审核', key: 'finance' }
]

const orderOptions: TaskOrderOption[] = Array.from({ length: 12 }, (_, index) => ({
  id: 8001 + index,
  orderNo: `LOCAL-DEMO-ORDER-${String(index + 1).padStart(3, '0')}`,
  companyName: `本地演示·${['云舟', '星河', '青禾', '远航'][index % 4]}订单客户有限公司`,
  businessType: ['工商注册', '代理记账', '疑难注销'][index % 3],
  salesmanId: index % 2 ? 9101 : 9102,
  salesmanName: index % 2 ? '本地演示·销售甲' : '本地演示·销售乙',
  region: '浙江省杭州市',
  amount: 3600 + index * 300
}))

const businessStatuses = ['pending_manager_audit', 'public_sea', 'assigned_to_me', 'task', 'handover', 'completed', 'problem_task', 'recycle_bin']
let businessTasks: BusinessTask[] = Array.from({ length: 24 }, (_, index) => {
  const id = index + 1
  const status = businessStatuses[index % businessStatuses.length]
  return {
    id,
    orderId: 1000 + id,
    orderNo: `LOCAL-DEMO-BIZ-${String(id).padStart(3, '0')}`,
    companyName: `本地演示·${['云舟', '星河', '青禾', '远航', '知行', '清沐'][index % 6]}企业服务有限公司`,
    businessType: ['工商注册', '代理记账', '税务变更', '许可证办理'][index % 4],
    status,
    priority: index % 5 === 0 ? 'urgent' : index % 2 ? 'normal' : 'important',
    assigneeId: status === 'public_sea' ? undefined : staff[index % 3].id,
    assigneeName: status === 'public_sea' ? undefined : staff[index % 3].name,
    assigneeDeptName: staff[index % 3].deptName,
    receivedUserName: ['task', 'handover', 'completed', 'problem_task', 'recycle_bin'].includes(status) ? staff[index % 3].name : undefined,
    receivedTime: ['task', 'handover', 'completed', 'problem_task', 'recycle_bin'].includes(status) ? '2026-08-08 10:20:00' : undefined,
    managerName: '本地演示·主管甲',
    managerReviewStatus: status === 'pending_manager_audit' && index % 2 ? 'rejected' : status === 'pending_manager_audit' ? 'pending' : 'approved',
    managerReviewRemark: status === 'pending_manager_audit' && index % 2 ? 'LOCAL-DEMO：请补齐客户授权材料。' : undefined,
    costCategory: status === 'pending_manager_audit' ? undefined : '工商规费',
    costAmount: status === 'pending_manager_audit' ? undefined : 300 + index * 35,
    orderAmount: 3600 + index * 200,
    receivedAmount: 1600 + index * 100,
    deadline: `2026-08-${String(12 + (index % 15)).padStart(2, '0')} 18:00:00`,
    handoverToId: status === 'handover' ? 9201 : undefined,
    handoverToName: status === 'handover' ? '本地演示·顾问甲' : undefined,
    exceptionReason: status === 'problem_task' ? 'LOCAL-DEMO：客户资料缺失，等待补齐' : undefined,
    remarks: 'LOCAL-DEMO 虚构任务，仅用于本地验收。',
    createTime: `2026-08-${String(1 + (index % 10)).padStart(2, '0')} 09:30:00`
  }
})

const auditTypes = ['once', 'recurring', 'project_dept', 'special'] as const
let auditTasks: AuditTask[] = Array.from({ length: 36 }, (_, index) => {
  const type = auditTypes[index % auditTypes.length]
  const status = (['pending', 'approved', 'rejected'] as const)[index % 3]
  const id = index + 101
  return {
    id,
    taskType: type,
    orderId: 2000 + id,
    orderNo: `LOCAL-DEMO-AUDIT-${String(id).padStart(3, '0')}`,
    companyName: `本地演示·${['青岚', '序章', '拾光', '澄明', '云栖', '和序'][index % 6]}有限公司`,
    businessType: type === 'special' ? ['工商疑难注销', '跨区迁移'][index % 2] : ['工商注册', '代理记账', '税务申报'][index % 3],
    processName: type === 'recurring' ? '周期服务审核流程' : '工商交付审核流程',
    stepName: ['资料初审', '主管审核', '财务复核', '交付确认'][index % 4],
    stepNo: (index % 4) + 1,
    stepCount: 4,
    status,
    auditResult: status === 'pending' ? undefined : status,
    scopeType: index % 2 ? 'personal' : 'team',
    salesId: index % 2 ? 9101 : 9102,
    salesName: index % 2 ? '本地演示·销售甲' : '本地演示·销售乙',
    servicePersonId: 9201,
    servicePersonName: '本地演示·顾问甲',
    teamName: index % 2 ? 'LOCAL-DEMO销售一部' : 'LOCAL-DEMO销售二部',
    region: '浙江省杭州市',
    amount: 3800 + index * 120,
    expenseAmount: 260 + index * 20,
    startMonth: type === 'recurring' ? '2026-08' : undefined,
    endMonth: type === 'recurring' ? '2027-07' : undefined,
    remarks: 'LOCAL-DEMO 虚构审批任务。',
    fields: [
      { code: 'material_ready', label: '资料完整度', fieldType: 'number', required: true, unit: '%', value: 90 + (index % 10) },
      { code: 'delivery_note', label: '交付说明', fieldType: 'textarea', required: true, value: 'LOCAL-DEMO 资料已按清单核对。' },
      { code: 'risk_level', label: '风险等级', fieldType: 'select', required: true, options: [{ label: '低', value: 'low' }, { label: '中', value: 'medium' }, { label: '高', value: 'high' }], value: index % 4 ? 'low' : 'medium' }
    ],
    logs: [{ action: 'create', result: 'pending', operatorName: '本地演示·系统', comment: '创建审批任务', createTime: '2026-08-01 09:00:00' }],
    createTime: `2026-08-${String(1 + (index % 10)).padStart(2, '0')} 10:00:00`
  }
})

let auditProcesses: AuditProcess[] = [
  { id: 301, processCode: 'demo_once_delivery', processName: 'LOCAL-DEMO 一次性交付审核', taskType: 'once', description: '本地演示流程', enabled: 1 },
  { id: 302, processCode: 'demo_recurring_service', processName: 'LOCAL-DEMO 周期服务审核', taskType: 'recurring', description: '本地演示流程', enabled: 1 },
  { id: 303, processCode: 'demo_project_dept', processName: 'LOCAL-DEMO 项目部门审核', taskType: 'project_dept', description: '本地演示流程', enabled: 1 },
  { id: 304, processCode: 'demo_special_cancel', processName: '工商疑难注销', taskType: 'special', businessTypeCode: 'complex_cancel', description: 'LOCAL-DEMO 专项类型', enabled: 1 },
  { id: 305, processCode: 'demo_special_transfer', processName: '跨区迁移', taskType: 'special', businessTypeCode: 'cross_region_transfer', description: 'LOCAL-DEMO 专项类型', enabled: 1 }
]

const defaultProcessSteps = (processId: number): AuditProcessStepConfig[] => [
  { id: processId * 10 + 1, stepOrder: 1, stepName: '资料初审', requiredRoleKey: 'consultant', assigneeMode: 'role', allowBatch: 1, finalStep: 0, formSchemaJson: JSON.stringify([{ code: 'material_ready', label: '资料完整度', fieldType: 'number', required: true, unit: '%' }]), indicatorSchemaJson: '[]' },
  { id: processId * 10 + 2, stepOrder: 2, stepName: '主管审核', requiredRoleKey: 'manager', assigneeMode: 'role', allowBatch: 0, finalStep: 1, formSchemaJson: JSON.stringify([{ code: 'delivery_note', label: '交付说明', fieldType: 'textarea', required: true }]), indicatorSchemaJson: JSON.stringify([{ indicatorType: 'cost_input' }]) }
]
const auditProcessSteps = new Map<number, AuditProcessStepConfig[]>(auditProcesses.map(process => [process.id, defaultProcessSteps(process.id)]))

let bridgeRules: TaskBridgeRule[] = [
  { id: 401, ruleCode: 'demo_finance_business', ruleName: 'LOCAL-DEMO 财务通过生成业务任务', triggerEvent: 'finance_approved', targetTaskType: 'business', enabled: 1 },
  { id: 402, ruleCode: 'demo_finance_once', ruleName: 'LOCAL-DEMO 财务通过生成一次性任务', triggerEvent: 'finance_approved', targetTaskType: 'once', processId: 301, processName: 'LOCAL-DEMO 一次性交付审核', scopeType: 'personal', finalConfirm: 0, enabled: 1 },
  { id: 403, ruleCode: 'demo_order_special', ruleName: 'LOCAL-DEMO 疑难注销专项任务', triggerEvent: 'order_created', targetTaskType: 'special', processId: 304, processName: '工商疑难注销', businessTypeCode: 'complex_cancel', scopeType: 'team', finalConfirm: 1, enabled: 1 }
]

let bridgeRuns: TaskBridgeRun[] = [
  { id: 501, ruleId: 401, ruleName: 'LOCAL-DEMO 财务通过生成业务任务', orderId: 8001, orderNo: 'LOCAL-DEMO-ORDER-001', targetTaskType: 'business', status: 'success', retryCount: 0, createTime: '2026-08-11 09:00:00' },
  { id: 502, ruleId: 403, ruleName: 'LOCAL-DEMO 疑难注销专项任务', orderId: 8003, orderNo: 'LOCAL-DEMO-ORDER-003', targetTaskType: 'special', status: 'failed', errorMessage: 'LOCAL-DEMO：审批流程当时未启用', retryCount: 0, createTime: '2026-08-11 09:20:00' }
]

const todayKeys = Array.from({ length: 16 }, (_, index) => `2026-08-${String(1 + index).padStart(2, '0')}`)
let workflowTasks: WorkflowTask[] = todayKeys.flatMap((date, dayIndex) => [
  { id: 1001 + dayIndex * 2, userId: 9101, userName: '本地演示·销售甲', roleId: 11, roleName: '销售人员', cycleType: 'day', periodKey: date, taskName: '完成客户跟进与记录', completionStandard: '有效沟通不少于 8 家', workContent: '按优先级完成客户触达并更新记录。', status: dayIndex % 4 === 0 ? 'pending' : 'done', metrics: [{ code: 'follow_count', label: '有效跟进', target: 8, value: dayIndex % 4 === 0 ? 5 : 9, unit: '家' }], remark: 'LOCAL-DEMO 日计划', completedTime: dayIndex % 4 === 0 ? undefined : `${date} 17:30:00` },
  { id: 1002 + dayIndex * 2, userId: 9201, userName: '本地演示·顾问甲', roleId: 12, roleName: '服务顾问', cycleType: 'day', periodKey: date, taskName: '处理客户交付节点', completionStandard: '当日到期节点全部处理', workContent: '核对材料、反馈客户并推进交付。', status: dayIndex % 5 === 0 ? 'undone' : 'done', metrics: [{ code: 'delivery_count', label: '处理节点', target: 6, value: dayIndex % 5 === 0 ? 4 : 7, unit: '个' }], undoneReason: dayIndex % 5 === 0 ? 'LOCAL-DEMO：客户资料未按时提供' : undefined, remark: 'LOCAL-DEMO 服务计划' }
])
workflowTasks.push(
  { id: 2001, userId: 9101, userName: '本地演示·销售甲', roleId: 11, roleName: '销售人员', cycleType: 'week', periodKey: '2026-W33', taskName: '完成周度新签目标', completionStandard: '新签 3 单', workContent: '聚焦高意向客户并完成报价跟进。', status: 'pending', metrics: [{ code: 'signed_count', label: '新签', target: 3, value: 2, unit: '单' }] },
  { id: 2002, userId: 9201, userName: '本地演示·顾问甲', roleId: 12, roleName: '服务顾问', cycleType: 'month', periodKey: '2026-08', taskName: '月度交付质量复盘', completionStandard: '准时率不低于 95%', workContent: '复盘异常节点并形成改进清单。', status: 'pending', metrics: [{ code: 'ontime_rate', label: '准时率', target: 95, value: 96, unit: '%' }] }
)

let requiredScopes: RequiredScope[] = [
  { id: 1, scopeType: 'role', targetId: 11, targetName: '销售人员', enabled: true },
  { id: 2, scopeType: 'role', targetId: 12, targetName: '服务顾问', enabled: true },
  { id: 3, scopeType: 'user', targetId: 9401, targetName: '本地演示·主管甲', enabled: true }
]

let goals: Goal[] = [
  { id: 1, roleId: 11, roleName: '销售人员', year: 2026, cycleType: 'month', periodKey: '2026-08', title: '8月新签合同额', metricName: '合同额', targetValue: 300000, actualValue: 218000, unit: '元', status: 'active', description: 'LOCAL-DEMO 销售团队月度目标', plans: [{ id: 11, title: '高意向客户集中转化', description: '每周复盘重点商机', users: [{ id: 111, userId: 9101, userName: '本地演示·销售甲', targetValue: 150000, actualValue: 112000 }, { id: 112, userId: 9102, userName: '本地演示·销售乙', targetValue: 150000, actualValue: 106000 }] }] },
  { id: 2, roleId: 12, roleName: '服务顾问', year: 2026, cycleType: 'quarter', periodKey: '2026-Q3', title: '交付准时率', metricName: '准时率', targetValue: 96, actualValue: 94.8, unit: '%', status: 'active', description: 'LOCAL-DEMO 服务交付季度目标' },
  { id: 3, roleId: 13, roleName: '财务审核', year: 2026, cycleType: 'year', periodKey: '2026', title: '审核差错率', metricName: '差错率', targetValue: 1, actualValue: 0.7, unit: '%', status: 'completed', completionNote: 'LOCAL-DEMO 年度目标提前达成' }
]

let templates: WorkflowTemplate[] = [
  { id: 1, roleId: 11, roleName: '销售人员', cycleType: 'day', taskName: '完成客户跟进与记录', completionStandard: '有效沟通不少于 8 家', workContent: '跟进高优先级线索并及时更新结果。', sortNo: 10, enabled: true, metrics: [{ code: 'follow_count', label: '有效跟进', fieldType: 'number', unit: '家', required: true }] },
  { id: 2, roleId: 11, roleName: '销售人员', cycleType: 'week', taskName: '周度新签目标', completionStandard: '新签不少于 3 单', workContent: '梳理报价、异议和成交条件。', sortNo: 20, enabled: true, metrics: [{ code: 'signed_count', label: '新签单数', fieldType: 'number', unit: '单', required: true }] },
  { id: 3, roleId: 12, roleName: '服务顾问', cycleType: 'day', taskName: '处理客户交付节点', completionStandard: '当日到期节点全部处理', workContent: '核对资料并推进业务节点。', sortNo: 10, enabled: true, metrics: [{ code: 'delivery_count', label: '处理节点', fieldType: 'number', unit: '个', required: true }] },
  { id: 4, roleId: 12, roleName: '服务顾问', cycleType: 'month', taskName: '月度交付复盘', completionStandard: '准时率不低于 95%', workContent: '输出异常原因与改进清单。', sortNo: 30, enabled: false, metrics: [{ code: 'ontime_rate', label: '准时率', fieldType: 'number', unit: '%', required: true }] }
]

function page<T>(rows: T[], params: Record<string, any>): PageResult<T> {
  const current = Math.max(1, Number(params.pageNum || params.current || 1))
  const size = Math.max(1, Number(params.pageSize || params.size || 20))
  const start = (current - 1) * size
  return { records: rows.slice(start, start + size), total: rows.length, current, size, pages: Math.ceil(rows.length / size) }
}

function keywordMatch(value: string | undefined, keyword: any) {
  return !keyword || String(value || '').toLowerCase().includes(String(keyword).trim().toLowerCase())
}

function parseJsonList(value?: string): any[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const workflowSummaries = new Map<string, string>([
  ['9101:day:2026-08-01', 'LOCAL-DEMO 日工作总结，仅用于本地验收。'],
  ['9101:day:2026-08-02', 'LOCAL-DEMO 日工作总结，仅用于本地验收。'],
  ['9201:day:2026-08-01', 'LOCAL-DEMO 日工作总结，仅用于本地验收。'],
  ['9101:day:2026-08-11', 'LOCAL-DEMO 日工作总结，仅用于本地验收。'],
  ['9101:week:2026-W33', 'LOCAL-DEMO 周工作总结，仅用于本地验收。'],
  ['9201:month:2026-08', 'LOCAL-DEMO 月工作总结，仅用于本地验收。']
])

function summaryKey(userId: number, cycleType: string, periodKey: string) {
  return `${userId}:${cycleType}:${periodKey}`
}

function monthDates(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return []
  const year = Number(match[1]), monthNumber = Number(match[2])
  if (monthNumber < 1 || monthNumber > 12) return []
  const days = new Date(year, monthNumber, 0).getDate()
  return Array.from({ length: days }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`)
}

function visibleDemoStaff(params: Record<string, any>) {
  return staff.slice(0, 4).filter((member) => (!params.roleId || member.roleId === Number(params.roleId))
    && (keywordMatch(member.name, params.keyword) || keywordMatch(member.deptName, params.keyword)))
}

function reportRows(params: Record<string, any> = {}): WorkflowReportRow[] {
  const cycleType = params.cycleType || 'day'
  const periodKey = params.periodKey || (cycleType === 'week' ? '2026-W33' : '2026-08')
  return visibleDemoStaff(params).map((member) => {
    const summary = workflowSummaries.get(summaryKey(member.id, cycleType, periodKey)) || ''
    const dates = cycleType === 'day' ? monthDates(periodKey) : [periodKey]
    const days = dates.map((date) => {
      const rows = workflowTasks.filter((item) => item.userId === member.id
        && item.cycleType === cycleType && item.periodKey === date)
      const done = rows.filter((item) => item.status === 'done').length
      const submitted = workflowSummaries.has(summaryKey(member.id, cycleType, date))
      return { date, submitted, done, total: rows.length }
    })
    const requiredDays = Math.max(1, days.length)
    const submittedDays = days.filter((day) => day.submitted).length
    return {
      userId: member.id,
      userName: member.name,
      roleName: member.roleName,
      deptName: member.deptName,
      requiredDays,
      submittedDays,
      missingDays: requiredDays - submittedDays,
      completionRate: Math.round((submittedDays / requiredDays) * 100),
      days,
      summary
    }
  })
}

function subordinateRows(cycleType = 'day', periodKey = '2026-08-11'): SubordinateRow[] {
  return staff.slice(0, 4).map((member) => {
    const rows = workflowTasks.filter((item) => item.userId === member.id
      && item.cycleType === cycleType && item.periodKey === periodKey)
    const done = rows.filter((item) => item.status === 'done').length
    return {
      userId: member.id,
      userName: member.name,
      roleId: member.roleId,
      roleName: member.roleName,
      deptName: member.deptName,
      total: rows.length,
      done,
      completionRate: rows.length ? Math.round((done / rows.length) * 100) : 0,
      submitted: workflowSummaries.has(summaryKey(member.id, cycleType, periodKey))
    }
  })
}

export const feigeTaskDemoApi = {
  async capabilities() { return { manager: true, bridgeManage: true, bridgeTriggerSupported: true, contractConversionSupported: false, addressConversionSupported: false } },
  async staffOptions() { return structuredClone(staff) },
  async roleTree() { return structuredClone(roles) },
  async orderOptions(params: Record<string, any> = {}) {
    const rows = orderOptions.filter(order => keywordMatch(order.orderNo, params.keyword) || keywordMatch(order.companyName, params.keyword))
    return structuredClone(rows.slice(0, Math.min(100, Number(params.pageSize || 100))))
  },

  async businessTasks(params: Record<string, any> = {}) {
    const rows = businessTasks.filter((row) => (!params.status || row.status === params.status)
      && (!params.businessType || row.businessType === params.businessType)
      && (!params.assigneeId || row.assigneeId === Number(params.assigneeId))
      && keywordMatch(row.orderNo, params.orderNo)
      && keywordMatch(row.companyName, params.companyName)
      && (keywordMatch(row.companyName, params.keyword) || keywordMatch(row.orderNo, params.keyword)))
    return page(structuredClone(rows), params)
  },
  async createBusinessTask(payload: BusinessTaskCreatePayload) {
    const order = orderOptions.find(item => item.id === Number(payload.orderId))
    const owner = staff.find(item => item.id === Number(payload.businessOwnerId))
    const id = Math.max(0, ...businessTasks.map(item => item.id)) + 1
    businessTasks.unshift({
      id,
      orderId: payload.orderId,
      orderNo: payload.orderNo || order?.orderNo || `LOCAL-DEMO-MANUAL-${id}`,
      companyName: payload.companyName,
      businessType: order?.businessType,
      status: 'pending_manager_audit',
      assigneeId: owner?.id,
      assigneeName: owner?.name,
      assigneeDeptName: owner?.deptName,
      managerReviewStatus: 'pending',
      remarks: payload.remarks || 'LOCAL-DEMO 手工补发任务',
      canManagerReview: true,
      createTime: '2026-08-11 13:00:00'
    })
    return id
  },
  async businessAction(id: number, action: string, payload: Record<string, any> = {}) {
    const row = businessTasks.find((item) => item.id === id)
    if (!row) throw new Error('任务不存在')
    const statusMap: Record<string, string> = { approve: payload.targetStatus || 'public_sea', receive: 'task', complete: 'completed', handover: 'handover', 'confirm-handover': 'completed', exception: 'problem_task', reassign: 'assigned_to_me', recycle: 'recycle_bin', restore: 'public_sea' }
    if (action === 'approve') { row.managerReviewStatus = 'approved'; row.managerReviewRemark = payload.remark }
    if (action === 'reject') { row.managerReviewStatus = 'rejected'; row.managerReviewRemark = payload.remark }
    if (action === 'cost') { row.costCategory = payload.category || payload.costCategory; row.costAmount = Number(payload.costAmount || payload.amount || 0) }
    if (action === 'reassign' || action === 'receive') {
      const person = staff.find((item) => item.id === Number(payload.assigneeId)) || staff[0]
      row.assigneeId = person.id
      row.assigneeName = person.name
      row.assigneeDeptName = person.deptName
    }
    if (action === 'exception') row.exceptionReason = payload.reason || 'LOCAL-DEMO异常说明'
    if (action !== 'reject' && statusMap[action]) row.status = statusMap[action]
    row.updateTime = '2026-08-11 12:00:00'
  },

  async auditTasks(params: Record<string, any> = {}) {
    const rows = auditTasks.filter((row) => (!params.taskType || row.taskType === params.taskType)
      && (!params.status || row.status === params.status)
      && (!params.showCompleted || row.status === 'approved' || row.status === 'rejected')
      && (!params.scopeType || row.scopeType === params.scopeType)
      && (!params.businessType || row.businessType === params.businessType)
      && (!params.salesId || row.salesId === Number(params.salesId))
      && (!params.stepNo || row.stepNo === Number(params.stepNo))
      && (keywordMatch(row.companyName, params.keyword) || keywordMatch(row.orderNo, params.keyword)))
    return page(structuredClone(rows), params)
  },
  async createAuditTask(payload: AuditTaskCreatePayload) {
    const process = auditProcesses.find(item => item.id === Number(payload.processId))
    if (!process || Number(process.enabled) !== 1) throw new Error('审批流程未启用')
    const steps = auditProcessSteps.get(process.id) || []
    if (!steps.length) throw new Error('审批流程没有步骤')
    const order = orderOptions.find(item => item.id === Number(payload.orderId))
    const owner = staff.find(item => item.id === Number(payload.businessOwnerId))
    const service = staff.find(item => item.id === Number(payload.servicePersonId))
    const firstStep = steps[0]
    const id = Math.max(100, ...auditTasks.map(item => item.id)) + 1
    auditTasks.unshift({
      id,
      taskType: process.taskType,
      orderId: payload.orderId,
      orderNo: payload.orderNo || order?.orderNo || `LOCAL-DEMO-AUDIT-${id}`,
      companyName: payload.companyName,
      businessType: payload.businessTypeName || process.processName,
      processName: process.processName,
      stepName: firstStep.stepName,
      stepNo: 1,
      stepCount: steps.length,
      status: 'pending',
      scopeType: payload.scopeType,
      salesId: owner?.id,
      salesName: owner?.name,
      servicePersonId: service?.id,
      servicePersonName: service?.name,
      teamName: payload.teamName,
      region: payload.region || order?.region,
      amount: payload.amount ?? order?.amount,
      expenseAmount: payload.expenseAmount,
      startMonth: payload.startMonth,
      endMonth: payload.endMonth,
      remarks: payload.remarks || 'LOCAL-DEMO 手工补发审批任务',
      fields: parseJsonList(firstStep.formSchemaJson),
      indicators: parseJsonList(firstStep.indicatorSchemaJson),
      isFinalConfirm: Boolean(payload.finalConfirm),
      auditAllowed: true,
      contractConversionSupported: false,
      addressConversionSupported: false,
      logs: [{ action: 'create', result: 'pending', operatorName: '本地演示·当前用户', comment: '手工补发审批任务', createTime: '2026-08-11 13:00:00' }],
      createTime: '2026-08-11 13:00:00'
    })
    return id
  },
  async auditTaskDetail(id: number) {
    const row = auditTasks.find((item) => item.id === id)
    if (!row) throw new Error('审批任务不存在')
    return structuredClone(row)
  },
  async auditAction(id: number, payload: Record<string, any>) {
    const row = auditTasks.find((item) => item.id === id)
    if (!row) throw new Error('审批任务不存在')
    const action = payload.action || payload.result
    if (action === 'approve' || action === 'approved') row.status = 'approved'
    if (action === 'reject' || action === 'rejected' || action === 'return') row.status = 'rejected'
    if (action === 'resubmit') row.status = 'pending'
    if (payload.servicePersonId) {
      const person = staff.find((item) => item.id === Number(payload.servicePersonId))
      if (person) { row.servicePersonId = person.id; row.servicePersonName = person.name }
    }
    row.logs = [...(row.logs || []), { action, result: row.status, operatorName: '本地演示·当前用户', comment: payload.comment || payload.remark, createTime: '2026-08-11 12:00:00' }]
  },
  async auditTaskPayments(orderId: number): Promise<AuditPayment[]> {
    return [{ id: orderId + 1, orderId, amount: 3800, paymentTime: '2026-08-08 10:30:00', paymentMethod: 'LOCAL-DEMO银行转账', status: 'confirmed', remark: '虚构收款记录' }]
  },
  async auditTaskSteps(orderId: number): Promise<AuditProcessStep[]> {
    return ['资料初审', '主管审核', '财务复核', '交付确认'].map((name, index) => ({ id: orderId * 10 + index, name, sequence: index + 1, status: index < 2 ? 'completed' : index === 2 ? 'current' : 'pending', assigneeName: index === 2 ? '本地演示·财务甲' : '本地演示·顾问甲', completedTime: index < 2 ? '2026-08-10 16:00:00' : undefined }))
  },
  async auditProcesses(params: Record<string, any> = {}) {
    return structuredClone(auditProcesses.filter(item => (!params.taskType || item.taskType === params.taskType)
      && (!params.businessTypeCode || item.businessTypeCode === params.businessTypeCode)
      && (!params.enabledOnly || Number(item.enabled) === 1)))
  },
  async auditProcess(id: number): Promise<AuditProcessDetail> {
    const process = auditProcesses.find(item => item.id === id)
    if (!process) throw new Error('审批流程不存在')
    return { process: structuredClone(process), steps: structuredClone(auditProcessSteps.get(id) || []) }
  },
  async createAuditProcess(payload: AuditProcessPayload) {
    const id = Math.max(300, ...auditProcesses.map(item => item.id)) + 1
    auditProcesses.push({ id, processCode: payload.processCode, processName: payload.processName, taskType: payload.taskType, businessTypeCode: payload.businessTypeCode, description: payload.description, enabled: payload.enabled })
    auditProcessSteps.set(id, structuredClone(payload.steps).map((step, index) => ({ ...step, id: id * 10 + index + 1 })))
    return id
  },
  async updateAuditProcess(id: number, payload: AuditProcessPayload) {
    const index = auditProcesses.findIndex(item => item.id === id)
    if (index < 0) throw new Error('审批流程不存在')
    auditProcesses[index] = { ...auditProcesses[index], processCode: payload.processCode, processName: payload.processName, taskType: payload.taskType, businessTypeCode: payload.businessTypeCode, description: payload.description, enabled: payload.enabled }
    auditProcessSteps.set(id, structuredClone(payload.steps).map((step, stepIndex) => ({ ...step, id: id * 10 + stepIndex + 1 })))
  },

  async bridgeRules(params: Record<string, any> = {}) {
    return structuredClone(bridgeRules.filter(item => (params.enabled == null || Number(item.enabled) === Number(params.enabled))
      && (!params.triggerEvent || item.triggerEvent === params.triggerEvent)
      && (!params.targetTaskType || item.targetTaskType === params.targetTaskType)))
  },
  async createBridgeRule(payload: TaskBridgeRulePayload) {
    const id = Math.max(400, ...bridgeRules.map(item => item.id)) + 1
    const process = auditProcesses.find(item => item.id === Number(payload.processId))
    bridgeRules.push({ ...payload, id, processName: process?.processName } as TaskBridgeRule)
    return id
  },
  async updateBridgeRule(id: number, payload: TaskBridgeRulePayload) {
    const index = bridgeRules.findIndex(item => item.id === id)
    if (index < 0) throw new Error('自动规则不存在')
    const process = auditProcesses.find(item => item.id === Number(payload.processId))
    bridgeRules[index] = { ...bridgeRules[index], ...payload, id, processName: process?.processName }
  },
  async bridgeRuns(params: Record<string, any> = {}) {
    const rows = bridgeRuns.filter(item => (!params.status || item.status === params.status)
      && (!params.orderId || item.orderId === Number(params.orderId)))
    return page(structuredClone(rows), params)
  },
  async retryBridgeRun(id: number) {
    const run = bridgeRuns.find(item => item.id === id)
    if (!run) throw new Error('生成记录不存在')
    run.status = 'success'; run.errorMessage = undefined; run.retryCount = Number(run.retryCount || 0) + 1; run.updateTime = '2026-08-11 13:10:00'
  },

  async workflowTasks(params: Record<string, any> = {}) {
    const rows = workflowTasks.filter((row) => (!params.cycleType || row.cycleType === params.cycleType)
      && (!params.periodKey || row.periodKey === params.periodKey)
      && (!params.userId || row.userId === Number(params.userId)))
    return {
      ...page(structuredClone(rows), params),
      summary: workflowSummaries.get(summaryKey(Number(params.userId || 9101), params.cycleType || 'day', params.periodKey || '')) || '',
      isExempt: false
    }
  },
  async workflowMonthStats(params: Record<string, any> = {}): Promise<WorkflowMonthStat[]> {
    const month = params.month || '2026-08'
    return monthDates(month).map((date) => {
      const rows = workflowTasks.filter((item) => item.userId === 9101
        && item.cycleType === 'day' && item.periodKey === date)
      const done = rows.filter((item) => item.status === 'done').length
      return {
        date,
        total: rows.length,
        done,
        rate: rows.length ? Math.round((done / rows.length) * 100) : 0,
        submitted: workflowSummaries.has(summaryKey(9101, 'day', date))
      }
    })
  },
  async workflowAction(id: number, action: string, payload: Record<string, any> = {}) {
    const row = workflowTasks.find((item) => item.id === id)
    if (!row) throw new Error('工作计划任务不存在')
    if ((action === 'done' || action === 'mark-done') && payload.metrics) row.metrics = payload.metrics
    if (action === 'done' || action === 'mark-done') row.status = 'done'
    if (action === 'undo' || action === 'toggle') row.status = row.status === 'done' ? 'pending' : 'done'
    if (action === 'undone' || action === 'mark-undone') { row.status = 'undone'; row.undoneReason = payload.reason || payload.undoneReason }
    if (action === 'remark') row.remark = payload.remark
    if (action === 'detail') row.metrics = payload.metrics || row.metrics
  },
  async workflowSummary(payload: Record<string, any>) {
    workflowSummaries.set(summaryKey(Number(payload.userId || 9101), payload.cycleType || 'day', payload.periodKey || ''), String(payload.summary || ''))
  },
  async workflowReport(params: Record<string, any> = {}) { return structuredClone(reportRows(params)) },
  async requiredScopes() { return structuredClone(requiredScopes) },
  async saveRequiredScope(payload: Omit<RequiredScope, 'id'> & { id?: number }) {
    if (payload.id) {
      const index = requiredScopes.findIndex((item) => item.id === payload.id)
      if (index >= 0) requiredScopes[index] = { ...requiredScopes[index], ...payload } as RequiredScope
      return payload.id
    }
    const id = Math.max(0, ...requiredScopes.map((item) => item.id)) + 1
    requiredScopes.push({ ...payload, id } as RequiredScope)
    return id
  },
  async deleteRequiredScope(id: number) { requiredScopes = requiredScopes.filter((item) => item.id !== id) },

  async goals(params: Record<string, any> = {}) {
    const rows = goals.filter((row) => (!params.roleId || row.roleId === Number(params.roleId))
      && (!params.year || row.year === Number(params.year))
      && (!params.cycleType || row.cycleType === params.cycleType)
      && (!params.status || row.status === params.status))
    return page(structuredClone(rows), params)
  },
  async createGoal(payload: GoalPayload) {
    const id = Math.max(0, ...goals.map((item) => item.id)) + 1
    goals.unshift({ ...payload, id, actualValue: payload.actualValue || 0 } as Goal)
    return id
  },
  async updateGoal(id: number, payload: GoalPayload) {
    const index = goals.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('目标不存在')
    goals[index] = { ...goals[index], ...payload, id } as Goal
  },
  async changeGoalStatus(id: number, status: string, payload: Record<string, any> = {}) {
    const row = goals.find((item) => item.id === id)
    if (!row) throw new Error('目标不存在')
    row.status = status
    if (payload.completionNote) row.completionNote = payload.completionNote
    if (payload.actualValue != null) row.actualValue = Number(payload.actualValue)
  },
  async deleteGoal(id: number) { goals = goals.filter((item) => item.id !== id) },

  async templates(params: Record<string, any> = {}) {
    const rows = templates.filter((row) => (!params.roleId || row.roleId === Number(params.roleId))
      && (!params.cycleType || row.cycleType === params.cycleType)
      && (params.enabled == null || row.enabled === params.enabled))
    return page(structuredClone(rows), params)
  },
  async createTemplate(payload: WorkflowTemplatePayload) {
    const id = Math.max(0, ...templates.map((item) => item.id)) + 1
    templates.unshift({ ...payload, id } as WorkflowTemplate)
    return id
  },
  async updateTemplate(id: number, payload: WorkflowTemplatePayload) {
    const index = templates.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('模板不存在')
    templates[index] = { ...templates[index], ...payload, id } as WorkflowTemplate
  },
  async deleteTemplate(id: number) { templates = templates.filter((item) => item.id !== id) },

  async subordinates(params: Record<string, any> = {}) {
    let rows = subordinateRows(params.cycleType || 'day', params.periodKey || '2026-08-11')
    if (params.roleId) rows = rows.filter((row) => row.roleId === Number(params.roleId))
    if (params.keyword) {
      const keyword = String(params.keyword).trim().toLowerCase()
      rows = rows.filter((row) => row.userName.toLowerCase().includes(keyword)
        || String(row.deptName || '').toLowerCase().includes(keyword))
    }
    return page(structuredClone(rows), params)
  },
  async subordinateDetail(params: Record<string, any>): Promise<SubordinateDetail> {
    const cycleType = params.cycleType || 'day'
    const periodKey = params.periodKey || '2026-08-11'
    const scopedRows = subordinateRows(cycleType, periodKey)
    const row = scopedRows.find((item) => item.userId === Number(params.userId)) || scopedRows[0]
    return {
      ...structuredClone(row),
      cycleType,
      periodKey,
      tasks: structuredClone(workflowTasks.filter((item) => item.userId === row.userId
        && item.cycleType === cycleType && item.periodKey === periodKey).slice(0, 8)),
      summary: workflowSummaries.get(summaryKey(row.userId, cycleType, periodKey)) || ''
    }
  }
}
