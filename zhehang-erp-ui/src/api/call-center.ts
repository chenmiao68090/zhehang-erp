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

const fmtDateTime = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const nowMinus = (minutes: number): string => fmtDateTime(new Date(Date.now() - minutes * 60 * 1000))
const todayAt = (hour: number, minute: number, second = 0): string => {
  const date = new Date()
  date.setHours(hour, minute, second, 0)
  return fmtDateTime(date)
}

const SILENT_RECORDING =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='

const _skillGroups: SkillGroup[] = [
  {
    id: 1,
    name: '财税获客组',
    code: 'TAX-SALES',
    strategy: 'least-busy',
    agentCount: 4,
    maxQueue: 18,
    timeoutSec: 45,
    description: '承接新设公司、异常解除、代理记账咨询等电销线索',
    enabled: true,
    createdAt: nowMinus(60 * 24 * 80)
  },
  {
    id: 2,
    name: '客户续费组',
    code: 'RENEWAL',
    strategy: 'longest-idle',
    agentCount: 3,
    maxQueue: 12,
    timeoutSec: 60,
    description: '负责老客户续费、账期提醒、服务满意度回访',
    enabled: true,
    createdAt: nowMinus(60 * 24 * 70)
  },
  {
    id: 3,
    name: '渠道同行组',
    code: 'CHANNEL',
    strategy: 'skill-based',
    agentCount: 2,
    maxQueue: 10,
    timeoutSec: 50,
    description: '处理同行渠道、地址挂靠资源采购与转售咨询',
    enabled: true,
    createdAt: nowMinus(60 * 24 * 66)
  },
  {
    id: 4,
    name: '售后服务组',
    code: 'SERVICE',
    strategy: 'round-robin',
    agentCount: 2,
    maxQueue: 16,
    timeoutSec: 55,
    description: '接入客户资料补交、工商变更进度、开票问题',
    enabled: true,
    createdAt: nowMinus(60 * 24 * 62)
  }
]

const _agents: Agent[] = [
  {
    id: 1,
    agentNo: 'A001',
    name: '陈思旭',
    extension: '8001',
    sipAccount: 'sip-a001',
    skillGroupIds: [1, 2],
    skillGroupNames: ['财税获客组', '客户续费组'],
    status: 'idle',
    deptName: '网销电销一部',
    phone: '13800138001',
    email: 'a001@zhehang.cn',
    maxConcurrent: 1,
    enabled: true,
    loginAt: todayAt(8, 52),
    createdAt: nowMinus(60 * 24 * 120)
  },
  {
    id: 2,
    agentNo: 'A002',
    name: '何海琳',
    extension: '8002',
    sipAccount: 'sip-a002',
    skillGroupIds: [1],
    skillGroupNames: ['财税获客组'],
    status: 'busy',
    deptName: '网销电销一部',
    phone: '13800138002',
    email: 'a002@zhehang.cn',
    maxConcurrent: 1,
    enabled: true,
    loginAt: todayAt(8, 48),
    createdAt: nowMinus(60 * 24 * 118)
  },
  {
    id: 3,
    agentNo: 'A003',
    name: '张东辉',
    extension: '8003',
    sipAccount: 'sip-a003',
    skillGroupIds: [2, 4],
    skillGroupNames: ['客户续费组', '售后服务组'],
    status: 'afterwork',
    deptName: '客户成功部',
    phone: '13800138003',
    email: 'a003@zhehang.cn',
    maxConcurrent: 1,
    enabled: true,
    loginAt: todayAt(8, 55),
    createdAt: nowMinus(60 * 24 * 110)
  },
  {
    id: 4,
    agentNo: 'A004',
    name: '邹金芳',
    extension: '8004',
    sipAccount: 'sip-a004',
    skillGroupIds: [3],
    skillGroupNames: ['渠道同行组'],
    status: 'idle',
    deptName: '渠道事业部',
    phone: '13800138004',
    email: 'a004@zhehang.cn',
    maxConcurrent: 1,
    enabled: true,
    loginAt: todayAt(9, 2),
    createdAt: nowMinus(60 * 24 * 94)
  },
  {
    id: 5,
    agentNo: 'A005',
    name: '王文杰',
    extension: '8005',
    sipAccount: 'sip-a005',
    skillGroupIds: [1, 4],
    skillGroupNames: ['财税获客组', '售后服务组'],
    status: 'break',
    deptName: '网销电销二部',
    phone: '13800138005',
    email: 'a005@zhehang.cn',
    maxConcurrent: 1,
    enabled: true,
    loginAt: todayAt(8, 59),
    createdAt: nowMinus(60 * 24 * 88)
  }
]

const _trunks: SipTrunk[] = [
  { id: 1, name: '杭州电销主线路', protocol: 'SIP', host: 'sip-hz-main.zhehang.local', port: 5060, username: 'zh-hz-main', status: 'online', channels: 60, remark: '网销电销主叫池' },
  { id: 2, name: '客户服务接入线', protocol: 'SIP', host: 'sip-service.zhehang.local', port: 5060, username: 'zh-service', status: 'online', channels: 30, remark: '400 与售后服务接入' },
  { id: 3, name: '渠道同行备用线', protocol: 'SIP', host: 'sip-channel.zhehang.local', port: 5070, username: 'zh-channel', status: 'error', channels: 20, remark: '同行渠道外呼备用线路' }
]

const _numbers: PhoneNumber[] = [
  { id: 1, number: '0571-88010001', type: 'both', trunkId: 1, trunkName: '杭州电销主线路', callerIdName: '浙杭集团财税顾问', province: '浙江', city: '杭州', enabled: true, remark: '新客首呼', createdAt: nowMinus(60 * 24 * 40) },
  { id: 2, number: '0571-88010002', type: 'outbound', trunkId: 1, trunkName: '杭州电销主线路', callerIdName: '浙杭集团企服', province: '浙江', city: '杭州', enabled: true, remark: '异常解除拓客', createdAt: nowMinus(60 * 24 * 38) },
  { id: 3, number: '400-0571-889', type: 'inbound', trunkId: 2, trunkName: '客户服务接入线', callerIdName: '浙杭集团客服', province: '浙江', city: '杭州', enabled: true, remark: '客户服务热线', createdAt: nowMinus(60 * 24 * 36) },
  { id: 4, number: '0571-88010008', type: 'both', trunkId: 3, trunkName: '渠道同行备用线', callerIdName: '浙杭集团渠道', province: '浙江', city: '杭州', enabled: false, remark: '同行地址挂靠业务备用', createdAt: nowMinus(60 * 24 * 32) }
]

const _ivrFlows: IvrFlow[] = [
  {
    id: 1,
    name: '财税咨询欢迎语',
    description: '新客来电后先播报品牌与业务入口，再按服务类型分流',
    version: 3,
    enabled: true,
    bindNumbers: ['400-0571-889', '0571-88010001'],
    updatedAt: nowMinus(36),
    nodes: [
      { id: 'start', type: 'start', name: '来电开始', x: 80, y: 120 },
      { id: 'welcome', type: 'play', name: '欢迎语', x: 260, y: 120, config: { text: '欢迎致电浙杭集团' } },
      { id: 'menu', type: 'menu', name: '业务分流', x: 450, y: 120, config: { keys: ['1 新设公司', '2 代理记账', '3 异常解除'] } },
      { id: 'queue', type: 'queue', name: '进入财税获客组', x: 640, y: 120, config: { skillGroupId: 1 } }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'welcome' },
      { id: 'e2', source: 'welcome', target: 'menu' },
      { id: 'e3', source: 'menu', target: 'queue', label: '按键 1/2/3' }
    ]
  },
  {
    id: 2,
    name: '老客户续费提醒',
    description: '续费客户来电优先进入客户续费组，并保留转售后入口',
    version: 2,
    enabled: true,
    bindNumbers: ['0571-88010001'],
    updatedAt: nowMinus(280),
    nodes: [
      { id: 'start', type: 'start', name: '来电开始', x: 80, y: 140 },
      { id: 'identify', type: 'condition', name: '识别客户', x: 260, y: 140 },
      { id: 'renewal', type: 'queue', name: '续费组', x: 450, y: 90, config: { skillGroupId: 2 } },
      { id: 'service', type: 'queue', name: '售后组', x: 450, y: 190, config: { skillGroupId: 4 } }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'identify' },
      { id: 'e2', source: 'identify', target: 'renewal', label: '已到期' },
      { id: 'e3', source: 'identify', target: 'service', label: '服务咨询' }
    ]
  }
]

const _ivrTemplates: IvrTemplate[] = [
  { id: 1, name: '财税咨询标准分流', category: '销售', description: '新设公司、代理记账、异常解除三类入口' },
  { id: 2, name: '续费客户优先接入', category: '客服', description: '续费提醒、账期咨询、售后转接' },
  { id: 3, name: '渠道同行地址业务', category: '通用', description: '同行渠道接待、地址资源咨询、合作登记' }
]

const _callRecords: CallRecord[] = [
  {
    id: 1,
    callId: 'CALL-20260604-0001',
    direction: 'outbound',
    caller: '0571-88010002',
    callee: '18668973330',
    agentNo: 'A001',
    agentName: '陈思旭',
    skillGroup: '财税获客组',
    startTime: todayAt(10, 22, 15),
    answerTime: todayAt(10, 22, 24),
    endTime: todayAt(10, 25, 52),
    ringDuration: 9,
    talkDuration: 208,
    totalDuration: 217,
    result: 'answered',
    hangupBy: 'callee',
    recordingUrl: SILENT_RECORDING,
    satisfaction: 5,
    remark: '新设公司咨询，已进入商机跟进'
  },
  {
    id: 2,
    callId: 'CALL-20260604-0002',
    direction: 'inbound',
    caller: '13957118888',
    callee: '400-0571-889',
    agentNo: 'A003',
    agentName: '张东辉',
    skillGroup: '客户续费组',
    startTime: todayAt(10, 14, 6),
    answerTime: todayAt(10, 14, 12),
    endTime: todayAt(10, 18, 38),
    ringDuration: 6,
    talkDuration: 266,
    totalDuration: 272,
    result: 'answered',
    hangupBy: 'caller',
    recordingUrl: SILENT_RECORDING,
    satisfaction: 4,
    remark: '代理记账续费确认，需财务开票'
  },
  {
    id: 3,
    callId: 'CALL-20260604-0003',
    direction: 'outbound',
    caller: '0571-88010008',
    callee: '17767120066',
    agentNo: 'A004',
    agentName: '邹金芳',
    skillGroup: '渠道同行组',
    startTime: todayAt(9, 58, 42),
    answerTime: todayAt(9, 58, 51),
    endTime: todayAt(10, 1, 4),
    ringDuration: 9,
    talkDuration: 133,
    totalDuration: 142,
    result: 'answered',
    hangupBy: 'callee',
    recordingUrl: SILENT_RECORDING,
    satisfaction: 5,
    remark: '同行渠道咨询地址挂靠价格'
  },
  {
    id: 4,
    callId: 'CALL-20260604-0004',
    direction: 'outbound',
    caller: '0571-88010001',
    callee: '15800331118',
    agentNo: 'A002',
    agentName: '何海琳',
    skillGroup: '财税获客组',
    startTime: todayAt(9, 41, 10),
    endTime: todayAt(9, 41, 42),
    ringDuration: 32,
    talkDuration: 0,
    totalDuration: 32,
    result: 'no-answer',
    hangupBy: 'system',
    remark: 'T+1 新设公司线索未接，下午二次触达'
  },
  {
    id: 5,
    callId: 'CALL-20260604-0005',
    direction: 'inbound',
    caller: '18072880011',
    callee: '400-0571-889',
    agentNo: 'A005',
    agentName: '王文杰',
    skillGroup: '售后服务组',
    startTime: todayAt(9, 26, 3),
    answerTime: todayAt(9, 26, 11),
    endTime: todayAt(9, 28, 56),
    ringDuration: 8,
    talkDuration: 165,
    totalDuration: 173,
    result: 'answered',
    hangupBy: 'caller',
    recordingUrl: SILENT_RECORDING,
    satisfaction: 4,
    remark: '资料补交提醒，客户已确认今天上传'
  },
  {
    id: 6,
    callId: 'CALL-20260603-0038',
    direction: 'outbound',
    caller: '0571-88010002',
    callee: '13011143334',
    agentNo: 'A001',
    agentName: '陈思旭',
    skillGroup: '财税获客组',
    startTime: nowMinus(60 * 18),
    answerTime: nowMinus(60 * 18 - 1),
    endTime: nowMinus(60 * 18 - 4),
    ringDuration: 7,
    talkDuration: 182,
    totalDuration: 189,
    result: 'answered',
    hangupBy: 'callee',
    recordingUrl: SILENT_RECORDING,
    satisfaction: 5,
    remark: '经营异常解除咨询，已添加到 CRM'
  },
  {
    id: 7,
    callId: 'CALL-20260603-0039',
    direction: 'outbound',
    caller: '0571-88010001',
    callee: '18505277788',
    agentNo: 'A002',
    agentName: '何海琳',
    skillGroup: '财税获客组',
    startTime: nowMinus(60 * 19),
    endTime: nowMinus(60 * 19 - 1),
    ringDuration: 18,
    talkDuration: 0,
    totalDuration: 18,
    result: 'busy',
    hangupBy: 'system',
    remark: '税务异常解除批次线索占线'
  },
  {
    id: 8,
    callId: 'CALL-20260603-0040',
    direction: 'internal',
    caller: '8003',
    callee: '8004',
    agentNo: 'A003',
    agentName: '张东辉',
    skillGroup: '客户续费组',
    startTime: nowMinus(60 * 21),
    answerTime: nowMinus(60 * 21 - 1),
    endTime: nowMinus(60 * 21 - 3),
    ringDuration: 4,
    talkDuration: 128,
    totalDuration: 132,
    result: 'answered',
    hangupBy: 'caller',
    recordingUrl: SILENT_RECORDING,
    remark: '续费客户移交渠道地址业务'
  }
]

const _outboundTasks: OutboundTask[] = [
  {
    id: 1,
    name: 'T+1 新设公司财税包首呼',
    type: 'predictive',
    status: 'running',
    totalCount: 320,
    completedCount: 186,
    successCount: 74,
    failedCount: 112,
    skillGroupId: 1,
    skillGroupName: '财税获客组',
    callerNumber: '0571-88010001',
    startTime: todayAt(9, 0),
    scriptId: 1,
    createdBy: '运营主管',
    createdAt: nowMinus(150)
  },
  {
    id: 2,
    name: '经营异常解除高意向回访',
    type: 'progressive',
    status: 'paused',
    totalCount: 128,
    completedCount: 69,
    successCount: 31,
    failedCount: 38,
    skillGroupId: 1,
    skillGroupName: '财税获客组',
    callerNumber: '0571-88010002',
    startTime: todayAt(9, 30),
    scriptId: 2,
    createdBy: '网销组长',
    createdAt: nowMinus(96)
  },
  {
    id: 3,
    name: '代理记账续费到期提醒',
    type: 'preview',
    status: 'completed',
    totalCount: 96,
    completedCount: 96,
    successCount: 68,
    failedCount: 28,
    skillGroupId: 2,
    skillGroupName: '客户续费组',
    callerNumber: '400-0571-889',
    startTime: todayAt(8, 50),
    endTime: todayAt(10, 5),
    scriptId: 3,
    createdBy: '客户成功部',
    createdAt: nowMinus(230)
  },
  {
    id: 4,
    name: '同行渠道地址挂靠资源确认',
    type: 'manual',
    status: 'draft',
    totalCount: 48,
    completedCount: 0,
    successCount: 0,
    failedCount: 0,
    skillGroupId: 3,
    skillGroupName: '渠道同行组',
    callerNumber: '0571-88010008',
    scriptId: 4,
    createdBy: '渠道事业部',
    createdAt: nowMinus(42)
  }
]

const _monitorTrend: { time: string; inbound: number; outbound: number }[] = [
  { time: '08:30', inbound: 12, outbound: 18 },
  { time: '09:00', inbound: 24, outbound: 42 },
  { time: '09:30', inbound: 31, outbound: 66 },
  { time: '10:00', inbound: 28, outbound: 73 },
  { time: '10:30', inbound: 35, outbound: 81 },
  { time: '11:00', inbound: 29, outbound: 69 },
  { time: '11:30', inbound: 22, outbound: 54 },
  { time: '12:00', inbound: 13, outbound: 26 },
  { time: '13:30', inbound: 18, outbound: 44 },
  { time: '14:00', inbound: 27, outbound: 71 },
  { time: '14:30', inbound: 33, outbound: 88 },
  { time: '15:00', inbound: 30, outbound: 84 },
  { time: '15:30', inbound: 26, outbound: 75 },
  { time: '16:00', inbound: 21, outbound: 62 },
  { time: '16:30', inbound: 18, outbound: 47 },
  { time: '17:00', inbound: 15, outbound: 32 }
]

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
