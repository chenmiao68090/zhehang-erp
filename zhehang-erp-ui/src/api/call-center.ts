/**
 * 呼叫中心 API
 * 后端尚未实现，本模块基于 Promise 与内置 mock 数据模拟网络请求。
 * 后续后端就绪后，可按相同函数签名替换为真实 HTTP 调用。
 */

// ============================================================
// TypeScript 类型定义
// ============================================================

/** 坐席状态 */
export type AgentStatus = 'offline' | 'idle' | 'busy' | 'afterwork' | 'break'

/** 软电话状态 */
export type PhoneState = 'idle' | 'ringing' | 'dialing' | 'talking' | 'afterwork' | 'hold'

/** 通话方向 */
export type CallDirection = 'inbound' | 'outbound' | 'internal'

/** 通话结果 */
export type CallResult = 'answered' | 'no-answer' | 'busy' | 'failed' | 'abandoned'

/** 坐席 */
export interface Agent {
  id: number
  agentNo: string
  name: string
  extension: string
  sipAccount: string
  skillGroupIds: number[]
  skillGroupNames?: string[]
  status: AgentStatus
  deptName?: string
  phone?: string
  email?: string
  maxConcurrent: number
  enabled: boolean
  loginAt?: string
  createdAt: string
}

/** 号码 / DID */
export interface PhoneNumber {
  id: number
  number: string
  type: 'inbound' | 'outbound' | 'both'
  trunkId: number
  trunkName?: string
  callerIdName?: string
  bindRoute?: string
  province?: string
  city?: string
  enabled: boolean
  remark?: string
  createdAt: string
}

/** SIP 中继 */
export interface SipTrunk {
  id: number
  name: string
  protocol: 'SIP' | 'IAX'
  host: string
  port: number
  username: string
  status: 'online' | 'offline' | 'error'
  channels: number
  remark?: string
}

/** IVR 流程节点 */
export interface IvrNode {
  id: string
  type: 'start' | 'play' | 'menu' | 'collect' | 'transfer' | 'queue' | 'hangup' | 'condition' | 'tts'
  name: string
  x: number
  y: number
  config?: Record<string, any>
}

/** IVR 连线 */
export interface IvrEdge {
  id: string
  source: string
  target: string
  label?: string
}

/** IVR 流程 */
export interface IvrFlow {
  id: number
  name: string
  description?: string
  version: number
  nodes: IvrNode[]
  edges: IvrEdge[]
  enabled: boolean
  bindNumbers?: string[]
  updatedAt: string
}

/** IVR 模板 */
export interface IvrTemplate {
  id: number
  name: string
  category: '客服' | '售后' | '销售' | '回访' | '通用'
  description: string
  preview?: string
}

/** 技能组 */
export interface SkillGroup {
  id: number
  name: string
  code: string
  strategy: 'round-robin' | 'least-busy' | 'priority' | 'longest-idle' | 'skill-based'
  agentCount: number
  maxQueue: number
  timeoutSec: number
  description?: string
  enabled: boolean
  createdAt: string
}

/** 通话记录 */
export interface CallRecord {
  id: number
  callId: string
  direction: CallDirection
  caller: string
  callee: string
  agentNo?: string
  agentName?: string
  skillGroup?: string
  startTime: string
  answerTime?: string
  endTime: string
  ringDuration: number
  talkDuration: number
  totalDuration: number
  result: CallResult
  hangupBy?: 'caller' | 'callee' | 'system'
  recordingUrl?: string
  satisfaction?: number
  remark?: string
}

/** 通话事件 (用于详情时间线) */
export interface CallEvent {
  time: string
  event: string
  detail?: string
  type?: 'info' | 'success' | 'warning' | 'danger'
}

/** 外呼任务 */
export interface OutboundTask {
  id: number
  name: string
  type: 'predictive' | 'preview' | 'progressive' | 'manual'
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped'
  totalCount: number
  completedCount: number
  successCount: number
  failedCount: number
  skillGroupId?: number
  skillGroupName?: string
  callerNumber: string
  startTime?: string
  endTime?: string
  scriptId?: number
  createdBy: string
  createdAt: string
}

/** 实时监控数据 */
export interface MonitorData {
  totalAgents: number
  onlineAgents: number
  busyAgents: number
  idleAgents: number
  inboundCalls: number
  outboundCalls: number
  queueLength: number
  avgWaitSec: number
  avgTalkSec: number
  serviceLevel: number
  abandonRate: number
  trend: { time: string; inbound: number; outbound: number }[]
}

/** 实时坐席状态 */
export interface AgentRealtime {
  agentNo: string
  name: string
  status: AgentStatus
  currentCall?: string
  durationSec: number
  todayCalls: number
  todayTalkSec: number
}

/** 报表数据点 */
export interface ReportDataPoint {
  date: string
  inbound: number
  outbound: number
  answered: number
  abandoned: number
  avgTalkSec: number
  serviceLevel: number
}

/** 来电弹屏数据 */
export interface PopupData {
  callId: string
  caller: string
  customerName?: string
  customerId?: number
  isVip?: boolean
  lastCallTime?: string
  recentNote?: string
  tags?: string[]
}

/** 当前通话 */
export interface CurrentCall {
  callId: string
  direction: CallDirection
  peer: string
  peerName?: string
  startTime: string
  status: PhoneState
}

// ============================================================
// Mock 数据
// ============================================================

const delay = <T>(data: T, ms = 240): Promise<{ code: number; data: T; message: string }> =>
  new Promise(resolve => setTimeout(() => resolve({ code: 200, data, message: 'ok' }), ms))

const _agents: Agent[] = []

const _trunks: SipTrunk[] = []

const _numbers: PhoneNumber[] = []

const _skillGroups: SkillGroup[] = []

const _ivrFlows: IvrFlow[] = []

const _ivrTemplates: IvrTemplate[] = []

const _callRecords: CallRecord[] = []

const _outboundTasks: OutboundTask[] = []

const _monitorTrend: { time: string; inbound: number; outbound: number }[] = []

// ============================================================
// API 函数
// ============================================================

// ---- 坐席 ----
export const getAgents = (params?: { keyword?: string; status?: AgentStatus; skillGroupId?: number }) => {
  let list = [..._agents]
  if (params?.keyword) {
    const k = params.keyword
    list = list.filter(a => a.name.includes(k) || a.agentNo.includes(k) || a.extension.includes(k))
  }
  if (params?.status) list = list.filter(a => a.status === params.status)
  if (params?.skillGroupId) list = list.filter(a => a.skillGroupIds.includes(params.skillGroupId!))
  return delay({ list, total: list.length })
}

export const addAgent = (data: Partial<Agent>) => {
  const next: Agent = {
    id: Math.max(0, ..._agents.map(a => a.id)) + 1,
    agentNo: data.agentNo || '',
    name: data.name || '',
    extension: data.extension || '',
    sipAccount: data.sipAccount || '',
    skillGroupIds: data.skillGroupIds || [],
    status: 'offline',
    maxConcurrent: data.maxConcurrent ?? 1,
    enabled: data.enabled ?? true,
    deptName: data.deptName,
    phone: data.phone,
    email: data.email,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  _agents.push(next)
  return delay(next)
}

export const updateAgent = (data: Partial<Agent> & { id: number }) => {
  const idx = _agents.findIndex(a => a.id === data.id)
  if (idx >= 0) _agents[idx] = { ..._agents[idx], ...data }
  return delay(_agents[idx])
}

export const deleteAgent = (id: number) => {
  const idx = _agents.findIndex(a => a.id === id)
  if (idx >= 0) _agents.splice(idx, 1)
  return delay({ id })
}

export const changeAgentStatus = (id: number, status: AgentStatus) => {
  const idx = _agents.findIndex(a => a.id === id)
  if (idx >= 0) _agents[idx].status = status
  return delay({ id, status })
}

// ---- 号码 / 中继 ----
export const getNumbers = (params?: { keyword?: string; type?: PhoneNumber['type'] }) => {
  let list = [..._numbers]
  if (params?.keyword) list = list.filter(n => n.number.includes(params.keyword!))
  if (params?.type) list = list.filter(n => n.type === params.type)
  return delay({ list, total: list.length })
}

export const addNumber = (data: Partial<PhoneNumber>) => {
  const next: PhoneNumber = {
    id: Math.max(0, ..._numbers.map(n => n.id)) + 1,
    number: data.number || '',
    type: data.type || 'inbound',
    trunkId: data.trunkId || 1,
    trunkName: _trunks.find(t => t.id === data.trunkId)?.name,
    callerIdName: data.callerIdName,
    bindRoute: data.bindRoute,
    province: data.province,
    city: data.city,
    enabled: data.enabled ?? true,
    remark: data.remark,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  _numbers.push(next)
  return delay(next)
}

export const getSipTrunks = () => delay([..._trunks])

// ---- IVR ----
export const getIvrFlows = (params?: { keyword?: string }) => {
  let list = [..._ivrFlows]
  if (params?.keyword) list = list.filter(f => f.name.includes(params.keyword!))
  return delay({ list, total: list.length })
}

export const saveIvrFlow = (flow: Partial<IvrFlow>) => {
  if (flow.id) {
    const idx = _ivrFlows.findIndex(f => f.id === flow.id)
    if (idx >= 0) {
      _ivrFlows[idx] = {
        ..._ivrFlows[idx],
        ...flow,
        version: _ivrFlows[idx].version + 1,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      }
      return delay(_ivrFlows[idx])
    }
  }
  const next: IvrFlow = {
    id: Math.max(0, ..._ivrFlows.map(f => f.id)) + 1,
    name: flow.name || '未命名流程',
    description: flow.description,
    version: 1,
    nodes: flow.nodes || [],
    edges: flow.edges || [],
    enabled: flow.enabled ?? false,
    bindNumbers: flow.bindNumbers || [],
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  _ivrFlows.push(next)
  return delay(next)
}

export const getIvrTemplates = () => delay([..._ivrTemplates])

// ---- 技能组 ----
export const getSkillGroups = (params?: { keyword?: string }) => {
  let list = [..._skillGroups]
  if (params?.keyword) list = list.filter(s => s.name.includes(params.keyword!) || s.code.includes(params.keyword!))
  return delay({ list, total: list.length })
}

export const addSkillGroup = (data: Partial<SkillGroup>) => {
  const next: SkillGroup = {
    id: Math.max(0, ..._skillGroups.map(s => s.id)) + 1,
    name: data.name || '',
    code: data.code || '',
    strategy: data.strategy || 'round-robin',
    agentCount: 0,
    maxQueue: data.maxQueue ?? 20,
    timeoutSec: data.timeoutSec ?? 60,
    description: data.description,
    enabled: data.enabled ?? true,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  _skillGroups.push(next)
  return delay(next)
}

export const updateSkillGroup = (data: Partial<SkillGroup> & { id: number }) => {
  const idx = _skillGroups.findIndex(s => s.id === data.id)
  if (idx >= 0) _skillGroups[idx] = { ..._skillGroups[idx], ...data }
  return delay(_skillGroups[idx])
}

// ---- 通话记录 ----
export const getCallRecords = (params?: {
  keyword?: string
  direction?: CallDirection
  result?: CallResult
  agentNo?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) => {
  let list = [..._callRecords]
  if (params?.keyword) list = list.filter(r => r.caller.includes(params.keyword!) || r.callee.includes(params.keyword!) || r.callId.includes(params.keyword!))
  if (params?.direction) list = list.filter(r => r.direction === params.direction)
  if (params?.result) list = list.filter(r => r.result === params.result)
  if (params?.agentNo) list = list.filter(r => r.agentNo === params.agentNo)
  const total = list.length
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 20
  return delay({ list: list.slice((page - 1) * pageSize, page * pageSize), total })
}

export const getCallDetail = (callId: string) => {
  const rec = _callRecords.find(r => r.callId === callId)
  return delay(rec || null)
}

export const getCallEvents = (callId: string) => {
  const rec = _callRecords.find(r => r.callId === callId)
  if (!rec) return delay<CallEvent[]>([])
  const events: CallEvent[] = [
    { time: rec.startTime, event: rec.direction === 'inbound' ? '来电进入' : '发起呼叫', type: 'info' },
    { time: rec.startTime, event: 'IVR 接听', detail: '欢迎语播放', type: 'info' },
    { time: rec.startTime, event: `分配到技能组：${rec.skillGroup}`, type: 'info' }
  ]
  if (rec.answerTime) {
    events.push({ time: rec.answerTime, event: `坐席接通：${rec.agentName || '-'}`, type: 'success' })
  }
  events.push({ time: rec.endTime, event: `通话结束 (${rec.hangupBy} 挂机)`, type: rec.result === 'answered' ? 'success' : 'warning' })
  return delay(events)
}

// ---- 外呼任务 ----
export const getOutboundTasks = (params?: { keyword?: string; status?: OutboundTask['status'] }) => {
  let list = [..._outboundTasks]
  if (params?.keyword) list = list.filter(t => t.name.includes(params.keyword!))
  if (params?.status) list = list.filter(t => t.status === params.status)
  return delay({ list, total: list.length })
}

export const createTask = (data: Partial<OutboundTask>) => {
  const next: OutboundTask = {
    id: Math.max(0, ..._outboundTasks.map(t => t.id)) + 1,
    name: data.name || '',
    type: data.type || 'manual',
    status: 'draft',
    totalCount: data.totalCount || 0,
    completedCount: 0,
    successCount: 0,
    failedCount: 0,
    skillGroupId: data.skillGroupId,
    skillGroupName: _skillGroups.find(s => s.id === data.skillGroupId)?.name,
    callerNumber: data.callerNumber || '',
    scriptId: data.scriptId,
    createdBy: data.createdBy || '当前用户',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
  }
  _outboundTasks.push(next)
  return delay(next)
}

export const controlTask = (id: number, action: 'start' | 'pause' | 'resume' | 'stop') => {
  const idx = _outboundTasks.findIndex(t => t.id === id)
  if (idx >= 0) {
    const map: Record<typeof action, OutboundTask['status']> = {
      start: 'running',
      pause: 'paused',
      resume: 'running',
      stop: 'stopped'
    }
    _outboundTasks[idx].status = map[action]
  }
  return delay({ id, action })
}

// ---- 实时监控 ----
export const getMonitorData = () => {
  const total = _agents.length
  const online = _agents.filter(a => a.status !== 'offline').length
  const busy = _agents.filter(a => a.status === 'busy').length
  const idle = _agents.filter(a => a.status === 'idle').length
  const data: MonitorData = {
    totalAgents: total,
    onlineAgents: online,
    busyAgents: busy,
    idleAgents: idle,
    inboundCalls: 47,
    outboundCalls: 32,
    queueLength: 3,
    avgWaitSec: 12,
    avgTalkSec: 186,
    serviceLevel: 0.92,
    abandonRate: 0.038,
    trend: _monitorTrend
  }
  return delay(data)
}

export const getAgentRealtime = () => {
  const list: AgentRealtime[] = _agents.map((a, i) => ({
    agentNo: a.agentNo,
    name: a.name,
    status: a.status,
    currentCall: a.status === 'busy' ? `13800${String(138000 + i).padStart(6, '0')}` : undefined,
    durationSec: a.status === 'busy' ? 60 + i * 23 : 0,
    todayCalls: 8 + i * 5,
    todayTalkSec: 1200 + i * 360
  }))
  return delay(list)
}

// ---- 报表 ----
export const getReportData = (params?: { startDate?: string; endDate?: string; dimension?: 'day' | 'week' | 'month' }) => {
  const days = params?.dimension === 'month' ? 12 : params?.dimension === 'week' ? 8 : 14
  const data: ReportDataPoint[] = Array.from({ length: days }).map((_, i) => {
    const inbound = 80 + Math.round(Math.sin(i / 2) * 30) + (i % 3) * 12
    const outbound = 50 + Math.round(Math.cos(i / 3) * 25) + (i % 4) * 8
    const answered = Math.floor(inbound * (0.85 + (i % 5) * 0.02))
    return {
      date: params?.dimension === 'month' ? `2026-${String(i + 1).padStart(2, '0')}` : `2026-05-${String(i + 1).padStart(2, '0')}`,
      inbound,
      outbound,
      answered,
      abandoned: inbound - answered,
      avgTalkSec: 150 + (i * 11) % 90,
      serviceLevel: 0.85 + ((i % 7) * 0.02)
    }
  })
  return delay(data)
}

export const exportReport = (_params?: any) => {
  return delay({ url: '/mock-export/cc-report-' + Date.now() + '.xlsx' })
}
