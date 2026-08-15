import { get, post, put, del } from './request'

function unwrapEnvelope<T>(response: any): T {
  if (response && typeof response === 'object' && 'code' in response && 'data' in response) {
    return response.data as T
  }
  return response as T
}

function requireTrueMutation(response: any, message: string): true {
  if (unwrapEnvelope<unknown>(response) !== true) {
    throw new Error(message)
  }
  return true
}

// ===== 公海私海系统类型定义 =====

export interface PoolConfig {
  id: number
  poolName: string
  poolType: 'telemarketing' | 'online' | 'collaboration' | 'recycle' | 'new_leads' | 'treasure' | 'frozen'
  visibleScope: 'all' | 'team' | 'manager'
  operateScope: 'all' | 'team_priority' | 'manager_only'
  distributeMode: 'auto' | 'manual' | 'grab' | 'approval'
  description?: string
  sortOrder: number
  /** 状态：0正常，1禁用 */
  status: number
  rulesJson?: string
  createTime?: string
}

export interface PoolRuleVersion {
  id?: number
  versionNo: number
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ARCHIVED'
  effectiveTime?: string
  dailyClaimLimit: number
  singleClaimLimit: number
  dailyManualEntryLimit: number
  singleImportLimit: number
  dailyImportLimit: number
  privateHoldingLimit: number
  privateWarningPercent: number
  protectionDays: number
  recycleNoFollowDays: number
  recycleWarningDays: number
  releaseCooldownDays: number
  duplicateBlockEnabled: number | boolean
  changeSummary?: string
  publishedTime?: string
}

export interface PoolRuleOverview {
  active: PoolRuleVersion
  canManage: boolean
  todayClaimed: number
  todayManualEntered: number
  todayImported: number
  versions: PoolRuleVersion[]
}

export interface PoolRuleSimulation {
  ownersOverHolding: number
  recycleCandidates: number
  effectiveTime: string
  readOnly: boolean
}

export interface CollisionRecord {
  id: number
  leadId: number
  leadName: string
  userAId: number
  userAName: string
  userBId: number
  userBName: string
  conflictType: 'same_time' | 'cross_channel' | 'duplicate' | 'grab_conflict'
  matchField: string
  resolution?: string
  resolutionDetail?: string
  resolvedBy?: number
  resolvedTime?: string
  status: number
  createTime: string
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean
  matchLevel: 'P0' | 'P1' | 'P2' | 'P3' | null
  matchField?: string
  existingLeadId?: number
  existingLeadName?: string
  existingOwnerName?: string
}

export interface Customer360Overview {
  leadId?: number
  customerId?: number
  leadNo?: string
  companyName: string
  contactName?: string
  phone?: string
  wechat?: string
  email?: string
  ownerId?: number
  ownerName?: string
  deptId?: number
  ownership?: string
  lifecycleStatus?: number
  customerStatus?: number
  followStatus?: string
  customerLevel?: string
  intentLevel?: string
  source?: string
  serviceType?: string
  quoteStatus?: string
  quotedPrice?: number
  dealAmount?: number
  lastFollowTime?: string
  lastFollowContent?: string
  nextActionType?: string
  nextActionTime?: string
  nextActionContent?: string
  serviceExpireDate?: string
  converted: boolean
  customerDataRestricted: boolean
  // ===== 资料tab工商信息(客户360资料补齐) =====
  legalPerson?: string
  companyPhone?: string
  registerStatus?: string
  enterpriseType?: string
  enterpriseScale?: string
  registeredCapital?: number
  paidCapital?: string
  creditCode?: string
  establishedDate?: string
  region?: string
  registerAddress?: string
  latestAddress?: string
  businessScope?: string
  insuredCount?: string
  insuredYear?: string
  industry?: string
}

export interface Customer360Stats {
  followCount: number
  callCount: number
  opportunityCount: number
  orderCount: number
  openIssueCount: number
  opportunityAmount: number
  orderAmount: number
  receivedAmount: number
  arrearsAmount: number
}

export interface Customer360Contact {
  id: number
  name?: string
  position?: string
  mobile?: string
  phone?: string
  wechat?: string
  email?: string
  primary: boolean
}

export interface Customer360Opportunity {
  id: number
  name?: string
  amount?: number
  stage?: number
  stageName?: string
  winRate?: number
  expectedDate?: string
  ownerId?: number
  ownerName?: string
  remark?: string
}

export interface Customer360Transaction {
  type: 'order' | 'contract' | 'receipt' | 'receivable'
  id: number
  number?: string
  title?: string
  status?: string
  amount?: number
  receivedAmount?: number
  arrearsAmount?: number
  eventTime?: string
}

export interface Customer360ServiceItem {
  id: number
  number?: string
  type?: string
  title?: string
  priority?: string
  status?: string
  ownerName?: string
  deadline?: string
  overdue: boolean
}

export interface Customer360TimelineItem {
  type: 'lead' | 'follow' | 'call' | 'opportunity' | 'order' | 'contract' | 'receipt' | 'receivable' | 'issue' | 'conversion'
  id: number
  title?: string
  content?: string
  status?: string
  actorName?: string
  occurredAt?: string
  amount?: number
  recordingAvailable?: boolean
  /** 通话时长(秒),仅 type=call 有值 */
  durationSeconds?: number
}

export interface Customer360Data {
  overview: Customer360Overview
  stats: Customer360Stats
  contacts: Customer360Contact[]
  opportunities: Customer360Opportunity[]
  transactions: Customer360Transaction[]
  services: Customer360ServiceItem[]
  timeline: Customer360TimelineItem[]
}

export type CustomerPortfolioAttention = 'all' | 'today' | 'overdue' | 'handover' | 'arrears'

export interface CustomerPortfolioRow {
  id: number
  name: string
  shortName?: string
  level?: string
  status?: number
  ownerId?: number
  ownerName?: string
  deptId?: number
  source?: string
  servicePackage?: string
  billingCycle?: string
  createTime?: string
  leadId?: number
  contactName?: string
  contactPhone?: string
  lastFollowTime?: string
  lastFollowContent?: string
  nextFollowTime?: string
  nextFollowContent?: string
  followDueToday?: boolean
  followOverdue?: boolean
  contractCount?: number
  latestContractId?: number
  latestContractNo?: string
  latestContractStatus?: number
  contractEndDate?: string
  handoverId?: number
  handoverNo?: string
  handoverStatus?: string
  handoverDeadline?: string
  handoverOverdue?: boolean
  arrearsAmount?: number
  receivableDueDate?: string
  badDebtRisk?: boolean
  pausedService?: boolean
}

export interface CustomerPortfolioStats {
  total: number
  active: number
  dueToday: number
  overdue: number
  handoverPending: number
  arrearsCustomers: number
  arrearsAmount: number
}

export interface CustomerPortfolioPage {
  records: CustomerPortfolioRow[]
  total: number
  pageNum: number
  pageSize: number
  stats: CustomerPortfolioStats
}

export interface CustomerFollowPayload {
  type: number
  content: string
  nextTime: string
  nextContent: string
  customerLevel?: string
}

export interface LeadImportRowRequest {
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

export interface LeadImportRequest {
  sourceType: number
  sourcePlatform?: string
  sourceDetail?: string
  batchName?: string
  poolId?: number | null
  rows: LeadImportRowRequest[]
}

export interface LeadImportPreflightSummary {
  total: number
  importable: number
  duplicate: number
  conflict: number
  error: number
  warning: number
}

export type LeadImportPreflightStatus = 'READY' | 'DUPLICATE' | 'CONFLICT' | 'ERROR'

export interface LeadImportPreflightRow {
  rowNumber: number
  status: LeadImportPreflightStatus
  reasonCodes: string[]
  reasons: string[]
  warningCodes?: string[]
  warnings?: string[]
  row?: LeadImportRowRequest
  existingRecordType?: 'LEAD' | 'CUSTOMER'
  existingRecordId?: number
  existingLocation?: string
  existingOwnerName?: string
  existingTarget?: 'PUBLIC_POOL' | 'ACTIVE' | 'HISTORY' | 'CUSTOMER' | 'NONE'
}

export interface LeadImportPreflightResponse {
  previewToken: string
  summary: LeadImportPreflightSummary
  rows: LeadImportPreflightRow[]
}

export interface LeadImportConfirmRequest extends LeadImportRequest {
  previewToken: string
}

export interface LeadImportConfirmSummary {
  total: number
  imported: number
  duplicate: number
  conflict: number
  error: number
  warning: number
}

export type LeadImportConfirmStatus = 'IMPORTED' | 'SKIPPED_DUPLICATE' | 'SKIPPED_CONFLICT' | 'FAILED'

export interface LeadImportConfirmRow {
  rowNumber: number
  status: LeadImportConfirmStatus
  reasonCodes: string[]
  reasons: string[]
  warningCodes?: string[]
  warnings?: string[]
  existingRecordType?: 'LEAD' | 'CUSTOMER'
  existingRecordId?: number
  existingLocation?: string
  existingOwnerName?: string
  existingTarget?: 'PUBLIC_POOL' | 'ACTIVE' | 'HISTORY' | 'CUSTOMER' | 'NONE'
}

export interface LeadImportConfirmResponse {
  summary: LeadImportConfirmSummary
  rows: LeadImportConfirmRow[]
}

// 公司资源库
export const leadApi = {
  list: (params: any) => get('/crm/lead/list', params),
  detail: (id: number, config?: { silentError?: boolean }) => get(`/crm/lead/${id}`, undefined, config),
  /** 客户360:仅返回当前用户数据范围内的沟通、商机、交易和服务记录。 */
  customer360: (id: number) => get<Customer360Data>(`/crm/lead/${id}/360`, undefined, { silentError: true }),
  create: (data: any) => post('/crm/lead', data),
  update: (data: any) => put('/crm/lead', data),
  remove: (id: number) => del(`/crm/lead/${id}`),
  convert: (id: number, config?: { silentError?: boolean }) => post(`/crm/lead/convert/${id}`, undefined, config),
  assign: (data: { id: number; ownerId: number }) => post('/crm/lead/assign', data),
  // 公海池(列表读取统一 silentError:由页面级 fetchLeads 兜底弹一次错误提示)
  poolList: (params: any) => get('/crm/lead/pool', params, { silentError: true }),
  myList: (params: any) => get('/crm/lead/my', params, { silentError: true }),
  claim: (ids: number[]) => post('/crm/lead/claim', { ids }),
  reactivateHistory: (ids: number[]) => post('/crm/lead/history/reactivate', { ids }),
  /** 给线索写跟进(type:1电话 2微信 3面谈 4邮件 5其他) */
  follow: (id: number, data: {
    type?: number
    content: string
    nextTime?: string
    nextContent?: string
    followStatus?: string
    customerLevel?: string
    nextActionType?: string
  }, config?: { silentError?: boolean }) => post(`/crm/lead/${id}/follow`, data, config),
  /** 取某线索的跟进历史记录(按时间倒序) */
  followHistory: (id: number) => get(`/crm/follow/lead/${id}`, undefined, { silentError: true }),
  returnToPool: (ids: number[], reason: string) => post('/crm/lead/return', { ids, reason }, { silentError: true }),
  markInvalid: (id: number, reason: string) => post('/crm/lead/invalid', { id, reason }),
  distribute: (data: { ids: number[]; ownerId: number }) => post('/crm/lead/distribute', data, { silentError: true }),
  importPreflight: (data: LeadImportRequest) => post<LeadImportPreflightResponse>('/crm/lead/import/preflight', data),
  importConfirm: (data: LeadImportConfirmRequest) => post<LeadImportConfirmResponse>('/crm/lead/import/confirm', data),
  exportLeads: (params: any) => get('/crm/lead/export', params),
  checkDuplicate: (params: { phone?: string; name?: string }) => get('/crm/lead/duplicate', params),
  /** 线索来源分布(营销统计) */
  sourceStats: () => get('/crm/lead/stats/source'),
  /** 线索阶段漏斗(营销统计) */
  stageStats: () => get('/crm/lead/stats/stage'),
  /** 今天该打谁:数据范围内待跟进(逾期/今天到期/从未跟进)线索,按紧迫度排序 */
  todoFollow: (params?: any) => get('/crm/lead/todo-follow', params, { silentError: true }),
  /** 回收预警:保护期3天内到期的客资(再不跟进将被自动回收) */
  recycleWarning: (params?: any) => get('/crm/lead/recycle-warning', params, { silentError: true }),
  /** 销售工作台全量统计(含客户分级),不受当前分页限制 */
  workbenchSummary: (params?: { scope?: 'all' }) => get('/crm/lead/workbench-summary', params, { silentError: true }),
  /** 手动触发自动回收(仅管理员),返回本次回收条数 */
  runRecycle: () => post<number>('/crm/lead/recycle/run'),
  /** 从工商库按关键词批量导入企业为公海线索(新公司入池),返回新建数量 */
  importCompanies: (data: { keyword: string; limit?: number }) => post<number>('/crm/lead/import-companies', data),
  /** 转化率汇总(数据范围内):total/newLeads/converting/converted/invalid/conversionRate */
  conversionStats: () => get<{ total: number; newLeads: number; converting: number; converted: number; invalid: number; conversionRate: number }>('/crm/lead/stats/conversion'),
  /** 投流客资汇总(164 顶部滚动播报):{ month:{...}, year:{...} },每组含有效/刻章有效/非刻章有效/非刻章转化/转化率/成交额 */
  summary: () => get<{ month: LeadSummaryBucket; year: LeadSummaryBucket }>('/crm/lead/summary', undefined, { silentError: true })
}

/** 投流客资汇总单个桶(本月/本年)——飞书 164 */
export interface LeadSummaryBucket {
  validLeads: number
  sealValidLeads: number
  nonSealValidLeads: number
  nonSealConverted: number
  nonSealConvRate: number
  nonSealDealAmount: number
}

// 客户管理
export const customerApi = {
  list: (params: any) => get('/crm/customer/list', params),
  /** 正式客户工作台:服务端按数据范围聚合跟进、合同、交接和应收风险。 */
  portfolio: (params: {
    pageNum: number
    pageSize: number
    keyword?: string
    level?: string
    status?: number
    ownerId?: number
    serviceType?: string
    attention?: CustomerPortfolioAttention
  }) => get<CustomerPortfolioPage>('/crm/customer/portfolio', params, { silentError: true }),
  detail: (id: number) => get(`/crm/customer/${id}`),
  customer360: (id: number) => get<Customer360Data>(`/crm/customer/${id}/360`, undefined, { silentError: true }),
  follow: (id: number, data: CustomerFollowPayload, config?: { silentError?: boolean }) =>
    post(`/crm/customer/${id}/follow`, data, config),
  create: (data: any) => post('/crm/customer', data),
  update: (data: any) => put('/crm/customer', data),
  remove: (id: number) => del(`/crm/customer/${id}`),
  toPool: (id: number, reason: string) => post(`/crm/customer/toPool/${id}`, { reason })
}

// 跟进记录
export const followApi = {
  list: (customerId: number) => get('/crm/follow/list', { customerId }),
  create: (data: any) => post('/crm/follow', data),
  timeline: (customerId: number) => get(`/crm/follow/timeline/${customerId}`)
}

// 合同管理
export const contractApi = {
  list: (params: any) => get('/crm/contract/list', params),
  detail: (id: number) => get(`/crm/contract/${id}`),
  create: (data: any) => post('/crm/contract', data),
  update: (data: any) => put('/crm/contract', data),
  changeStatus: (id: number, status: number) => put('/crm/contract/status', { id, status }),
  /** 销售业绩(按签订人):合同数量+合同金额,可按签约年份/状态过滤 */
  performance: (params?: { year?: number; status?: number }) => get('/crm/contract/performance', params),
  /** 合同月度趋势(签约金额/数量) */
  trend: (params?: { year?: number }) => get('/crm/contract/trend', params)
}

// ===== 公海池配置管理 =====
export const poolConfigApi = {
  list: async () => unwrapEnvelope<PoolConfig[]>(await get('/crm/pool-config/list')),
  detail: (id: number) => get<PoolConfig>(`/crm/pool-config/${id}`),
  create: async (data: Partial<PoolConfig>) => requireTrueMutation(
    await post('/crm/pool-config', data),
    '公海池未创建，服务器没有确认写入成功'
  ),
  update: async (data: Partial<PoolConfig>) => requireTrueMutation(
    await put('/crm/pool-config', data),
    '公海池未更新，配置可能已不存在'
  ),
  remove: async (id: number) => requireTrueMutation(
    await del(`/crm/pool-config/${id}`),
    '公海池未删除，配置可能已不存在'
  ),
  getByType: (type: string) => get<PoolConfig>(`/crm/pool-config/by-type/${type}`)
}

export const poolRuleApi = {
  overview: async () => unwrapEnvelope<PoolRuleOverview>(await get('/crm/pool-rules/overview')),
  versions: async () => unwrapEnvelope<PoolRuleVersion[]>(await get('/crm/pool-rules/versions')),
  saveDraft: async (data: Partial<PoolRuleVersion>) =>
    unwrapEnvelope<PoolRuleVersion>(await post('/crm/pool-rules/draft', data)),
  simulate: async (data: Partial<PoolRuleVersion>) =>
    unwrapEnvelope<PoolRuleSimulation>(await post('/crm/pool-rules/simulate', data)),
  publish: async (id: number, mode: 'NEXT_DAY' | 'IMMEDIATE' = 'NEXT_DAY') =>
    unwrapEnvelope<PoolRuleVersion>(await post(`/crm/pool-rules/${id}/publish?mode=${mode}`))
}

// ===== 防撞单 =====
export const collisionApi = {
  checkDuplicate: (params: { creditCode?: string; name?: string; phone?: string; contactName?: string }) => post<DuplicateCheckResult>('/crm/collision/check', params),
  resolveConflict: (data: { id: number; resolution: string; detail?: string }) => post('/crm/collision/resolve/' + data.id, data, { silentError: true }),
  getCollisionLog: (params: { pageNum?: number; pageSize?: number; status?: number }) => get<{ records?: CollisionRecord[]; list?: CollisionRecord[]; total: number }>('/crm/collision/log', params, { silentError: true })
}
