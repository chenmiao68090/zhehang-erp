import { del, get, post, put } from './request'

function unwrapResponse<T>(request: Promise<any>): Promise<T> {
  return request.then((response) => {
    if (response && typeof response === 'object' && 'code' in response && 'data' in response) {
      return response.data as T
    }
    return response as T
  })
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages?: number
}

export interface StaffOption {
  id: number
  name: string
  deptId?: number
  deptName?: string
  roleId?: number
  roleName?: string
}

export interface RoleTreeNode {
  id: number
  name: string
  key?: string
  children?: RoleTreeNode[]
}

export interface FeigeTaskCapabilities {
  manager: boolean
  bridgeManage: boolean
  bridgeTriggerSupported: boolean
  contractConversionSupported: boolean
  addressConversionSupported: boolean
}

function normalizeCapabilities(value?: Partial<FeigeTaskCapabilities> | null): FeigeTaskCapabilities {
  return {
    manager: Boolean(value?.manager),
    bridgeManage: Boolean(value?.bridgeManage),
    bridgeTriggerSupported: Boolean(value?.bridgeTriggerSupported),
    contractConversionSupported: Boolean(value?.contractConversionSupported),
    addressConversionSupported: Boolean(value?.addressConversionSupported)
  }
}

export interface BusinessTaskCreatePayload {
  requestKey: string
  orderId?: number
  orderNo?: string
  companyName: string
  businessOwnerId?: number
  remarks?: string
}

export interface TaskOrderOption {
  id: number
  orderNo: string
  companyName: string
  businessType?: string
  salesmanId?: number
  salesmanName?: string
  region?: string
  amount?: number
}

export interface BusinessTask {
  id: number
  orderId?: number
  orderNo: string
  companyName: string
  businessType?: string
  status: string
  priority?: string
  assigneeId?: number
  assigneeName?: string
  assigneeDeptName?: string
  receivedUserName?: string
  receivedTime?: string
  managerName?: string
  managerReviewStatus?: string
  managerReviewRemark?: string
  costCategory?: string
  costAmount?: number
  orderAmount?: number
  receivedAmount?: number
  deadline?: string
  handoverToId?: number
  handoverToName?: string
  exceptionReason?: string
  remarks?: string
  canManagerReview?: boolean
  canReassign?: boolean
  canReceive?: boolean
  canOperate?: boolean
  canHandover?: boolean
  canConfirmHandover?: boolean
  canRecycle?: boolean
  createTime?: string
  updateTime?: string
}

export interface AuditFormField {
  id?: number
  code: string
  label: string
  fieldType: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'switch'
  required?: boolean
  options?: Array<{ label: string; value: string | number }>
  value?: any
  unit?: string
}

export interface AuditTaskLog {
  id?: number
  action: string
  result?: string
  operatorName?: string
  comment?: string
  createTime?: string
}

export interface AuditTask {
  id: number
  taskType: 'once' | 'recurring' | 'project_dept' | 'special' | string
  orderId?: number
  orderNo?: string
  companyName: string
  businessType?: string
  processName?: string
  stepName?: string
  stepNo?: number
  stepCount?: number
  status: 'pending' | 'approved' | 'rejected' | string
  auditResult?: string
  scopeType?: 'personal' | 'team' | string
  salesId?: number
  salesName?: string
  servicePersonId?: number
  servicePersonName?: string
  teamName?: string
  region?: string
  amount?: number
  expenseAmount?: number
  startMonth?: string
  endMonth?: string
  remarks?: string
  formValues?: Record<string, any>
  fields?: AuditFormField[]
  indicators?: Array<Record<string, any> & { indicatorType?: string }>
  isFinalConfirm?: boolean
  canChangeGsSpecialist?: boolean
  auditAllowed?: boolean
  contractConversionSupported?: boolean
  addressConversionSupported?: boolean
  logs?: AuditTaskLog[]
  createTime?: string
  updateTime?: string
}

export interface AuditPayment {
  id?: number
  orderId?: number
  amount: number
  paymentTime?: string
  paymentMethod?: string
  status?: string
  remark?: string
}

export interface AuditProcessStep {
  id?: number
  name: string
  sequence: number
  status: string
  assigneeName?: string
  completedTime?: string
  comment?: string
}

export interface AuditProcessFormField {
  code: string
  label: string
  fieldType: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'datetime' | 'switch'
  required?: boolean
  unit?: string
  min?: number
  precision?: number
  options?: Array<{ label: string; value: string | number }>
}

export interface AuditProcessIndicator {
  indicatorType: 'next_auditor' | 'cost_input' | 'convert_contract' | 'convert_address'
}

export interface AuditProcessStepConfig {
  id?: number
  stepOrder: number
  stepName: string
  requiredRoleKey?: string
  assigneeMode: 'role' | 'specific' | 'owner'
  requiredUserId?: number
  allowBatch?: number
  finalStep?: number
  formSchemaJson?: string
  indicatorSchemaJson?: string
  fields?: AuditProcessFormField[]
  indicators?: AuditProcessIndicator[]
}

export interface AuditProcess {
  id: number
  processCode: string
  processName: string
  taskType: 'once' | 'recurring' | 'project_dept' | 'special' | string
  businessTypeCode?: string
  description?: string
  enabled: number
  version?: number
}

export interface AuditProcessDetail {
  process: AuditProcess
  steps: AuditProcessStepConfig[]
}

export interface AuditProcessPayload {
  processCode: string
  processName: string
  taskType: 'once' | 'recurring' | 'project_dept' | 'special'
  businessTypeCode?: string
  description?: string
  enabled: number
  steps: AuditProcessStepConfig[]
}

export interface AuditTaskCreatePayload {
  requestKey: string
  processId: number
  orderId?: number
  orderNo?: string
  companyName: string
  businessTypeCode?: string
  businessTypeName?: string
  businessOwnerId: number
  scopeType?: 'personal' | 'team'
  teamName?: string
  region?: string
  amount?: number
  expenseAmount?: number
  startMonth?: string
  endMonth?: string
  servicePersonId?: number
  remarks?: string
  finalConfirm?: number
}

export interface TaskBridgeRule {
  id: number
  ruleCode: string
  ruleName: string
  triggerEvent: 'order_created' | 'finance_approved' | string
  targetTaskType: 'business' | 'once' | 'recurring' | 'project_dept' | 'special' | string
  processId?: number
  processName?: string
  businessTypeCode?: string
  scopeType?: 'personal' | 'team'
  finalConfirm?: number
  enabled: number
  createTime?: string
  updateTime?: string
}

export type TaskBridgeRulePayload = Omit<TaskBridgeRule, 'id' | 'processName' | 'createTime' | 'updateTime'> & { id?: number }

export interface TaskBridgeRun {
  id: number
  ruleId?: number
  ruleName?: string
  orderId?: number
  orderNo?: string
  targetTaskType?: string
  status: 'pending' | 'success' | 'failed' | string
  errorMessage?: string
  retryCount?: number
  createTime?: string
  updateTime?: string
}

function normalizeBridgeRunPage(page: PageResult<any>): PageResult<TaskBridgeRun> {
  return {
    ...page,
    records: (page?.records || []).map((row: any) => ({
      ...row,
      status: row.status || row.runStatus,
      retryCount: row.retryCount ?? row.attemptCount,
      ruleName: row.ruleName || row.ruleCode
    }))
  }
}

export interface WorkflowMetricValue {
  code: string
  label: string
  value?: number | string
  unit?: string
  target?: number | string
}

export interface WorkflowTask {
  id: number
  userId?: number
  userName?: string
  roleId?: number
  roleName?: string
  cycleType: 'day' | 'week' | 'month' | string
  periodKey: string
  taskName: string
  completionStandard?: string
  workContent?: string
  status: 'pending' | 'done' | 'undone' | string
  remark?: string
  undoneReason?: string
  metrics?: WorkflowMetricValue[]
  completedTime?: string
  createTime?: string
}

export interface WorkflowMonthStat {
  date: string
  total: number
  done: number
  rate: number
  submitted?: boolean
}

export interface WorkflowReportRow {
  userId: number
  userName: string
  roleName?: string
  deptName?: string
  requiredDays: number
  submittedDays: number
  missingDays: number
  completionRate: number
  days: Array<{ date: string; submitted: boolean; done?: number; total?: number }>
  summary?: string
}

export interface RequiredScope {
  id: number
  scopeType: 'user' | 'role'
  targetId: number
  targetName: string
  enabled?: boolean
}

export interface GoalPlanUser {
  id?: number
  userId: number
  userName?: string
  targetValue?: number
  actualValue?: number
}

export interface GoalPlan {
  id?: number
  title: string
  description?: string
  startDate?: string
  endDate?: string
  users?: GoalPlanUser[]
}

export interface Goal {
  id: number
  roleId?: number
  roleName?: string
  userId?: number
  userName?: string
  year: number
  cycleType: 'month' | 'quarter' | 'half_year' | 'year' | string
  periodKey: string
  title: string
  metricName?: string
  targetValue: number
  actualValue?: number
  unit?: string
  status: 'draft' | 'active' | 'completed' | 'archived' | string
  description?: string
  completionNote?: string
  plans?: GoalPlan[]
  createTime?: string
}

export type GoalPayload = Omit<Goal, 'id' | 'actualValue' | 'createTime'> & {
  id?: number
  actualValue?: number
}

export interface WorkflowTemplateMetric {
  code: string
  label: string
  fieldType?: 'number' | 'text'
  unit?: string
  required?: boolean
}

export interface WorkflowTemplate {
  id: number
  roleId: number
  roleName?: string
  cycleType: 'day' | 'week' | 'month' | string
  taskName: string
  completionStandard?: string
  workContent?: string
  sortNo?: number
  enabled: boolean
  metrics?: WorkflowTemplateMetric[]
}

export type WorkflowTemplatePayload = Omit<WorkflowTemplate, 'id'> & { id?: number }

export interface SubordinateRow {
  userId: number
  userName: string
  roleId?: number
  roleName?: string
  deptName?: string
  total: number
  done: number
  completionRate: number
  submitted?: boolean
}

export interface SubordinateDetail extends SubordinateRow {
  cycleType: string
  periodKey: string
  tasks: WorkflowTask[]
  summary?: string
}

export const feigeTaskApi = {
  capabilities: () => unwrapResponse<Partial<FeigeTaskCapabilities>>(get('/feige-task/capabilities')).then(normalizeCapabilities),
  staffOptions: () => unwrapResponse<StaffOption[]>(get('/feige-task/staff-options')),
  roleTree: () => unwrapResponse<RoleTreeNode[]>(get('/feige-task/role-tree')),
  orderOptions: (params: Record<string, any> = {}) => unwrapResponse<TaskOrderOption[]>(get('/feige-task/order-options', params)),

  businessTasks: (params: Record<string, any>) => unwrapResponse<PageResult<BusinessTask>>(get('/feige-task/business', params)),
  createBusinessTask: (payload: BusinessTaskCreatePayload) => unwrapResponse<number>(post('/feige-task/business', payload)),
  businessAction: (id: number, action: string, payload: Record<string, any> = {}) =>
    unwrapResponse<void>(post(`/feige-task/business/${id}/${action}`, payload)),

  auditTasks: (params: Record<string, any>) => unwrapResponse<PageResult<AuditTask>>(get('/feige-task/audit', params)),
  createAuditTask: (payload: AuditTaskCreatePayload) => unwrapResponse<number>(post('/feige-task/audit', payload)),
  auditTaskDetail: (id: number) => unwrapResponse<AuditTask>(get(`/feige-task/audit/${id}`)),
  auditAction: (id: number, payload: Record<string, any>) => unwrapResponse<void>(post(`/feige-task/audit/${id}/action`, payload)),
  auditTaskPayments: (orderId: number) => unwrapResponse<AuditPayment[]>(get(`/feige-task/audit/order/${orderId}/payments`)),
  auditTaskSteps: (orderId: number) => unwrapResponse<AuditProcessStep[]>(get(`/feige-task/audit/order/${orderId}/steps`)),
  auditProcesses: (params: Record<string, any> = {}) => unwrapResponse<AuditProcess[]>(get('/feige-task/audit/processes', params)),
  auditProcess: (id: number) => unwrapResponse<AuditProcessDetail>(get(`/feige-task/audit/processes/${id}`)),
  createAuditProcess: (payload: AuditProcessPayload) => unwrapResponse<number>(post('/feige-task/audit/processes', payload)),
  updateAuditProcess: (id: number, payload: AuditProcessPayload) => unwrapResponse<void>(put(`/feige-task/audit/processes/${id}`, payload)),

  bridgeRules: (params: Record<string, any> = {}) => unwrapResponse<TaskBridgeRule[]>(get('/feige-task/bridge-rules', params)),
  createBridgeRule: (payload: TaskBridgeRulePayload) => unwrapResponse<number>(post('/feige-task/bridge-rules', payload)),
  updateBridgeRule: (id: number, payload: TaskBridgeRulePayload) => unwrapResponse<void>(put(`/feige-task/bridge-rules/${id}`, payload)),
  bridgeRuns: (params: Record<string, any> = {}) => unwrapResponse<PageResult<any>>(get('/feige-task/bridge-runs', params)).then(normalizeBridgeRunPage),
  retryBridgeRun: (id: number) => unwrapResponse<void>(post(`/feige-task/bridge-runs/${id}/retry`, {})),

  workflowTasks: (params: Record<string, any>) => unwrapResponse<PageResult<WorkflowTask>>(get('/feige-task/workflow/tasks', params)),
  workflowMonthStats: (params: Record<string, any>) => unwrapResponse<WorkflowMonthStat[]>(get('/feige-task/workflow/month-stats', params)),
  workflowAction: (id: number, action: string, payload: Record<string, any> = {}) =>
    unwrapResponse<void>(post(`/feige-task/workflow/tasks/${id}/${action}`, payload)),
  workflowSummary: (payload: Record<string, any>) => unwrapResponse<void>(post('/feige-task/workflow/summary', payload)),
  workflowReport: (params: Record<string, any>) => unwrapResponse<WorkflowReportRow[]>(get('/feige-task/workflow/report', params)),
  requiredScopes: () => unwrapResponse<RequiredScope[]>(get('/feige-task/workflow/required-scopes')),
  saveRequiredScope: (payload: Omit<RequiredScope, 'id'> & { id?: number }) => unwrapResponse<number>(post('/feige-task/workflow/required-scopes', payload)),
  deleteRequiredScope: (id: number) => unwrapResponse<void>(del(`/feige-task/workflow/required-scopes/${id}`)),

  goals: (params: Record<string, any>) => unwrapResponse<PageResult<Goal>>(get('/feige-task/goals', params)),
  createGoal: (payload: GoalPayload) => unwrapResponse<number>(post('/feige-task/goals', payload)),
  updateGoal: (id: number, payload: GoalPayload) => unwrapResponse<void>(put(`/feige-task/goals/${id}`, payload)),
  changeGoalStatus: (id: number, status: string, payload: Record<string, any> = {}) =>
    unwrapResponse<void>(post(`/feige-task/goals/${id}/status`, { status, ...payload })),
  deleteGoal: (id: number) => unwrapResponse<void>(del(`/feige-task/goals/${id}`)),

  templates: (params: Record<string, any>) => unwrapResponse<PageResult<WorkflowTemplate>>(get('/feige-task/templates', params)),
  createTemplate: (payload: WorkflowTemplatePayload) => unwrapResponse<number>(post('/feige-task/templates', payload)),
  updateTemplate: (id: number, payload: WorkflowTemplatePayload) => unwrapResponse<void>(put(`/feige-task/templates/${id}`, payload)),
  deleteTemplate: (id: number) => unwrapResponse<void>(del(`/feige-task/templates/${id}`)),

  subordinates: (params: Record<string, any>) => unwrapResponse<PageResult<SubordinateRow>>(get('/feige-task/subordinates', params)),
  subordinateDetail: (params: Record<string, any>) => unwrapResponse<SubordinateDetail>(get('/feige-task/subordinates/detail', params))
}

// 工作计划页保留具名导出，便于按需加载；实现仍统一走同一个 API 对象。
export const workflowTasks = feigeTaskApi.workflowTasks
export const workflowMonthStats = feigeTaskApi.workflowMonthStats
export const workflowAction = feigeTaskApi.workflowAction
export const workflowSummary = feigeTaskApi.workflowSummary
