import { get, post } from './request'

/** 一条通话记录 */
export interface CallRecord {
  id?: number
  leadId?: number
  customerName?: string
  phone?: string
  /** 通话发起时间 */
  callTime?: string
  /** 通话时长(秒) */
  duration?: number
  /** 是否接通 0未接 1接通 */
  connected?: number
  /** 结果文案,如「接通」「未接」 */
  result?: string
  /** 是否存在录音。原始云客地址不会返回前端。 */
  recordingAvailable?: boolean
  /** 通话小结 */
  remark?: string
  /** 坐席(业务员)姓名 */
  agentName?: string
  /** 拨号方式,手动记录为 manual,云客同步为 platform */
  callType?: string
  /** 外呼平台通话ID(云客话单唯一ID) */
  platformCallId?: string
}

/** 外呼小结闭环提交:会同时生成通话记录、CRM 跟进和下一步待办。 */
export interface CallSummaryPayload {
  leadId?: number
  customerName: string
  phone: string
  platformCallId?: string
  duration: number
  connected: number
  result: string
  remark?: string
  intentLevel?: string
  needType?: string
  quoteStatus?: string
  followStatus?: string
  customerLevel?: string
  nextActionType?: string
  nextActionContent?: string
  nextActionTime?: string
}

/** 顶部统计 */
export interface CallStats {
  callCount: number
  connectedCount: number
  connectRate: number
  totalDuration: number
  totalDurationText: string
  over1minCount: number
}

/** 坐席排名 */
export interface AgentRankItem {
  agentName: string
  callCount: number
  connectedCount: number
  totalDuration: number
}

export type CallDashboardRange = 'today' | 'yesterday' | '7d' | '30d'

export interface CallDashboardSummary {
  totalCalls: number
  connectedCount: number
  missedCount: number
  failedCount: number
  validCount: number
  recordCount: number
  highIntentCount: number
  connectRate: number
  validRate: number
  totalDuration: number
  totalDurationText: string
  avgDuration: number
  avgDurationText: string
  topAgentName?: string
  topAgentCalls?: number
  latestCallTime?: string
}

export interface CallDashboardAgent {
  rank: number
  agentName: string
  callCount: number
  connectedCount: number
  missedCount: number
  validCount: number
  recordCount: number
  connectRate: number
  totalDuration: number
  totalDurationText: string
}

export interface CallDashboardTrend {
  label: string
  callCount: number
  connectedCount: number
  validCount: number
  totalDuration: number
}

export interface CallDashboardTodo {
  callbackCount: number
  highIntentCount: number
  recordReviewCount: number
  lowConnectAgentCount: number
}

export interface CallDashboardData {
  range: CallDashboardRange
  summary: CallDashboardSummary
  previousSummary: CallDashboardSummary
  agents: CallDashboardAgent[]
  trend: CallDashboardTrend[]
  todo: CallDashboardTodo
}

export type CallLeaderboardPeriod = 'today' | 'week' | 'month' | 'custom'
export type CallLeaderboardMetric = 'calls' | 'effective' | 'connectRate'

export interface CallLeaderboardRow {
  rank?: number
  userId?: number
  agentName: string
  deptName: string
  callCount: number
  connectedCount: number
  connectRate: number
  validCount: number
  validRate: number
  totalDuration: number
  totalDurationText: string
  targetCount: number
  targetProgress: number
  currentUser: boolean
}

export interface CallLeaderboardData {
  period: CallLeaderboardPeriod
  metric: CallLeaderboardMetric
  startDate: string
  endDate: string
  targetPerDay: number
  periodDays: number
  targetCount: number
  gapToPrevious?: number
  gapUnit: '通' | '%'
  self: CallLeaderboardRow
  rows: CallLeaderboardRow[]
}

export interface CallRecordingRow {
  id: number
  callTime: string
  userId: number
  agentName: string
  deptId?: number
  deptName: string
  customerName: string
  contactName: string
  maskedPhone: string
  callType: string
  connected: number
  result?: string
  duration: number
  durationText: string
  effective: boolean
  remark: string
  recordingStatus: 'available' | 'missing'
}

export interface CallRecordingPage {
  records: CallRecordingRow[]
  total: number
  pageNum: number
  pageSize: number
}

export interface CallRecordingUserOption {
  id: number
  name: string
  deptId?: number
  deptName: string
  currentUser: boolean
}

export interface CallRecordingDeptOption {
  id: number
  parentId?: number
  name: string
}

export interface CallRecordingOptions {
  scopeMode: 'self' | 'department' | 'company'
  canSelectUser: boolean
  canSelectDepartment: boolean
  currentUserId: number
  users: CallRecordingUserOption[]
  departments: CallRecordingDeptOption[]
}

export interface CallRecordingTicket {
  token: string
  expiresAt: number
}

/** 由后端短时票据生成系统内播放地址，不包含云客原始地址。 */
export function callRecordingStreamUrl(recordId: number, token: string) {
  const base = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  return `${base}/call-record/recordings/stream/${recordId}?ticket=${encodeURIComponent(token)}`
}

/** 云客微信语音使用同一受控代理，浏览器不接触原始 OSS 地址。 */
export function callRecordingExternalStreamUrl(token: string) {
  const base = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
  return `${base}/call-record/recordings/stream/external?ticket=${encodeURIComponent(token)}`
}

/**
 * 电销外呼工作台 API。
 * 与后端约定:响应拦截器对 code 200 直接返回 data;调用处统一用 res?.data ?? res 兜底。
 */
export const callRecordApi = {
  /** 通话记录列表,可按线索/关键词过滤 */
  list: (params?: any) => get('/call-record/list', params),
  /** 顶部统计条数据 */
  stats: () => get('/call-record/stats'),
  /** 坐席排名 */
  agentRank: () => get('/call-record/agent-rank'),
  /** 保存一条通话记录 */
  save: (data: any) => post('/call-record', data),
  /** 保存小结并同步 CRM 跟进/下一步动作 */
  saveSummary: (data: CallSummaryPayload) => post<number>('/call-record/summary', data),
  /** 发起外呼(占位,接入外呼平台后真实拨号) */
  dial: (data: any) => post('/call-record/dial', data),
  /** 云客同步话单列表(全公司,含时长+录音),按号码/坐席搜索、分页 */
  syncList: (params?: any) => get('/call-record/sync-list', params),
  /** 云客同步话单统计(总量/今日/接通率/总时长) */
  syncStats: () => get('/call-record/sync-stats'),
  /** 销售体系电销外呼看板 */
  dashboard: (params?: { range?: CallDashboardRange }) => get('/call-record/dashboard', params),
  /** 全公司通话排行，只返回坐席与汇总数 */
  leaderboard: (params?: {
    period?: CallLeaderboardPeriod
    metric?: CallLeaderboardMetric
    startDate?: string
    endDate?: string
  }) =>
    get<CallLeaderboardData>('/call-record/leaderboard', params),
  /** 通话录音数据范围内的人员与部门选项 */
  recordingOptions: () => get<CallRecordingOptions>('/call-record/recordings/options'),
  /** 通话录音分页列表，响应不包含云客原始录音地址 */
  recordings: (params?: any) => get<CallRecordingPage>('/call-record/recordings', params),
  /** 申请短时、当前浏览器绑定的播放票据 */
  recordingTicket: (recordId: number) =>
    get<CallRecordingTicket>(`/call-record/recordings/${recordId}/play-ticket`),
  /** 立即从云客未同步队列补拉通话记录 */
  syncYunkeFailed: (maxBatches = 20) => post('/call-record/sync-yunke-failed', null, { params: { maxBatches } })
}
