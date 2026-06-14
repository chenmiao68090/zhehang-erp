import { get, post, put, del } from './request'

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
  status: number
  rulesJson?: string
  createTime?: string
}

export interface RecycleRule {
  id: number
  ruleName: string
  ruleCode: string
  triggerType: 'time' | 'behavior' | 'status'
  applyScope: string
  conditionJson: string
  recycleDays: number
  warningDaysGreen: number
  warningDaysYellow: number
  warningDaysRed: number
  targetPoolId: number
  priority: number
  status: number
}

export interface DistributeLog {
  id: number
  leadId: number
  fromPoolId?: number
  toUserId: number
  toUserName: string
  fromUserId?: number
  fromUserName?: string
  distributeType: 'auto' | 'manual' | 'grab' | 'transfer' | 'recycle'
  weightDetailJson?: string
  remark?: string
  createTime: string
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

export interface ServiceOrder {
  id: number
  customerId: number
  customerName: string
  serviceType: string
  contractNo?: string
  startDate: string
  endDate: string
  amount?: number
  totalAmount?: number
  status: 'active' | 'expiring' | 'expired' | 'renewed' | 'terminated'
  renewalStatus?: 'pending' | 'negotiating' | 'confirmed' | 'lost'
  providerType: 'self' | 'other'
  handlerId?: number
  handlerName?: string
  remark?: string
  createTime?: string
}

export interface HoldingConfig {
  id: number
  roleType: string
  roleLabel: string
  maxHolding: number
  overtimeToleranceRate: number
  overtimeReleaseHours: number
  description?: string
  status: number
}

export interface WarningItem {
  id: number
  leadId: number
  leadName: string
  ownerName: string
  level: 'green' | 'yellow' | 'red'
  ruleName: string
  daysRemaining: number
  lastFollowTime?: string
  poolName: string
}

export interface ReminderItem {
  id: number
  targetId: number
  targetType: string
  reminderType: string
  reminderLevel?: string
  title: string
  content?: string
  recipientId: number
  status: number
  createTime: string
}

export interface WeightConfig {
  baseWeightRatio: number      // 基础权重占比 默认25
  loadWeightRatio: number      // 负载调整占比 默认25
  abilityWeightRatio: number   // 能力系数占比 默认25
  commissionWeightRatio: number // 提成差异占比 默认25
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean
  matchLevel: 'P0' | 'P1' | 'P2' | 'P3' | null
  matchField?: string
  existingLeadId?: number
  existingLeadName?: string
  existingOwnerName?: string
}

// 线索管理
export const leadApi = {
  list: (params: any) => get('/crm/lead/list', params),
  detail: (id: number) => get(`/crm/lead/${id}`),
  create: (data: any) => post('/crm/lead', data),
  update: (data: any) => put('/crm/lead', data),
  remove: (id: number) => del(`/crm/lead/${id}`),
  convert: (id: number) => post(`/crm/lead/convert/${id}`),
  assign: (data: { id: number; ownerId: number }) => post('/crm/lead/assign', data),
  // 公海池
  poolList: (params: any) => get('/crm/lead/pool', params),
  myList: (params: any) => get('/crm/lead/my', params, { silentError: true }),
  claim: (ids: number[]) => post('/crm/lead/claim', { ids }),
  returnToPool: (ids: number[], reason: string) => post('/crm/lead/return', { ids, reason }, { silentError: true }),
  distribute: (data: { ids: number[]; ownerId: number }) => post('/crm/lead/distribute', data, { silentError: true }),
  importLeads: (formData: FormData) => post('/crm/lead/import', formData),
  exportLeads: (params: any) => get('/crm/lead/export', params),
  checkDuplicate: (params: { phone?: string; name?: string }) => get('/crm/lead/duplicate', params),
  getPoolRules: () => get('/crm/lead/pool-rules'),
  savePoolRules: (data: any) => post('/crm/lead/pool-rules', data),
  /** 线索来源分布(营销统计) */
  sourceStats: () => get('/crm/lead/stats/source'),
  /** 线索阶段漏斗(营销统计) */
  stageStats: () => get('/crm/lead/stats/stage'),
  /** 今天该打谁:数据范围内待跟进(逾期/今天到期/从未跟进)线索,按紧迫度排序 */
  todoFollow: (params?: { pageNum?: number; pageSize?: number }) => get('/crm/lead/todo-follow', params),
  /** 回收预警:保护期3天内到期的客资(再不跟进将被自动回收) */
  recycleWarning: (params?: { pageNum?: number; pageSize?: number }) => get('/crm/lead/recycle-warning', params),
  /** 手动触发自动回收(仅管理员),返回本次回收条数 */
  runRecycle: () => post<number>('/crm/lead/recycle/run'),
  /** 从工商库按关键词批量导入企业为公海线索(新公司入池),返回新建数量 */
  importCompanies: (data: { keyword: string; limit?: number }) => post<number>('/crm/lead/import-companies', data),
  /** 转化率汇总(数据范围内):total/newLeads/converting/converted/invalid/conversionRate */
  conversionStats: () => get<{ total: number; newLeads: number; converting: number; converted: number; invalid: number; conversionRate: number }>('/crm/lead/stats/conversion')
}

// 客户管理
export const customerApi = {
  list: (params: any) => get('/crm/customer/list', params),
  detail: (id: number) => get(`/crm/customer/${id}`),
  create: (data: any) => post('/crm/customer', data),
  update: (data: any) => put('/crm/customer', data),
  remove: (id: number) => del(`/crm/customer/${id}`),
  toPool: (id: number, reason: string) => post(`/crm/customer/toPool/${id}`, { reason })
}

// 客户税务档案（以统一社会信用代码勾稽，承接工商带出）
export interface TaxProfile {
  id?: number
  customerId?: number
  creditCode: string
  companyName?: string
  taxpayerType?: number
  collectionType?: string
  taxAuthority?: string
  taxOfficer?: string
  taxOfficerPhone?: string
  registerDate?: string
  invoiceType?: string
  taxTypes?: string
  filingCycle?: string
  status?: number
  remark?: string
}

function unwrapTaxProfile(res: any): TaxProfile | null {
  if (!res) return null
  return Object.prototype.hasOwnProperty.call(res, 'data') ? (res.data || null) : res
}

export const taxProfileApi = {
  /** 按统一社会信用代码获取税务档案 */
  async get(creditCode: string): Promise<TaxProfile | null> {
    return unwrapTaxProfile(await get('/crm/tax-profile', { creditCode }, { silentError: true }))
  },
  /** 保存（按统一社会信用代码 upsert） */
  async save(data: TaxProfile): Promise<TaxProfile | null> {
    return unwrapTaxProfile(await post('/crm/tax-profile', data))
  }
}

// 联系人管理
export const contactApi = {
  list: (customerId: number) => get('/crm/contact/list', { customerId }),
  create: (data: any) => post('/crm/contact', data),
  update: (data: any) => put('/crm/contact', data),
  remove: (id: number) => del(`/crm/contact/${id}`)
}

// 跟进记录
export const followApi = {
  list: (customerId: number) => get('/crm/follow/list', { customerId }),
  create: (data: any) => post('/crm/follow', data),
  timeline: (customerId: number) => get(`/crm/follow/timeline/${customerId}`)
}

// 商机管理
export const opportunityApi = {
  list: (params: any) => get('/crm/opportunity/list', params),
  detail: (id: number) => get(`/crm/opportunity/${id}`),
  create: (data: any) => post('/crm/opportunity', data),
  update: (data: any) => put('/crm/opportunity', data),
  remove: (id: number) => del(`/crm/opportunity/${id}`),
  funnel: () => get('/crm/opportunity/funnel')
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

// 工单管理
export const ticketApi = {
  list: (params: any) => get('/crm/ticket/list', params),
  create: (data: any) => post('/crm/ticket', data),
  update: (data: any) => put('/crm/ticket', data)
}

// 公海池
export const poolApi = {
  list: (params: any) => get('/crm/pool/list', params),
  claim: (id: number, ownerId: number) => post(`/crm/pool/claim/${id}`, { ownerId })
}

// ===== 公海池配置管理 =====
export const poolConfigApi = {
  list: () => get<PoolConfig[]>('/crm/pool-config/list'),
  detail: (id: number) => get<PoolConfig>(`/crm/pool-config/${id}`),
  create: (data: Partial<PoolConfig>) => post('/crm/pool-config', data),
  update: (data: Partial<PoolConfig>) => put('/crm/pool-config', data),
  remove: (id: number) => del(`/crm/pool-config/${id}`),
  getByType: (type: string) => get<PoolConfig>(`/crm/pool-config/by-type/${type}`)
}

// ===== 分配引擎 =====
export const distributeApi = {
  autoDistribute: (data: { leadId: number; poolId: number }) => post('/crm/distribute/auto', data),
  manualDistribute: (data: { leadIds: number[]; toUserId: number }) => post('/crm/distribute/manual', data),
  grabLead: (data: { leadId: number }) => post('/crm/distribute/grab', data),
  getDistributeLog: (params: { leadId?: number; page?: number; size?: number }) => get<{ list: DistributeLog[]; total: number }>('/crm/distribute/log', params),
  getWeightConfig: () => get<WeightConfig>('/crm/distribute/weight-config'),
  saveWeightConfig: (data: WeightConfig) => post('/crm/distribute/weight-config', data)
}

// ===== 回收引擎 =====
export const recycleApi = {
  getRules: () => get<RecycleRule[]>('/crm/recycle/rules'),
  saveRule: (data: Partial<RecycleRule>) => post('/crm/recycle/rules', data),
  // 后端 saveRule 为 upsert(带id即更新),原 PUT /crm/recycle/rules 端点不存在
  updateRule: (data: Partial<RecycleRule>) => post('/crm/recycle/rules', data),
  deleteRule: (id: number) => del(`/crm/recycle/rules/${id}`),
  manualRecycle: (data: { leadIds: number[]; reason: string }) => post('/crm/recycle/manual', data),
  getWarningList: (params: { level?: string; page?: number; size?: number }) => get<{ list: WarningItem[]; total: number }>('/crm/recycle/warning', params),
  getRecycleLog: (params: { page?: number; size?: number }) => get<{ list: DistributeLog[]; total: number }>('/crm/recycle/log', params),
  triggerScan: () => post('/crm/recycle/scan')
}

// ===== 防撞单 =====
export const collisionApi = {
  checkDuplicate: (params: { creditCode?: string; name?: string; phone?: string; contactName?: string }) => post<DuplicateCheckResult>('/crm/collision/check', params),
  resolveConflict: (data: { id: number; resolution: string; detail?: string }) => post('/crm/collision/resolve/' + data.id, data, { silentError: true }),
  getCollisionLog: (params: { page?: number; size?: number; status?: number }) => get<{ list: CollisionRecord[]; total: number }>('/crm/collision/log', params, { silentError: true })
}

// ===== 服务订单 =====
export const serviceOrderApi = {
  // 后端 list 参数为 pageNum/pageSize/customerId/serviceType/status(Integer:0正常 1已到期 2续费中 3已续费),返回 IPage(records/total)
  list: (params: { customerId?: number; serviceType?: string; status?: number; pageNum?: number; pageSize?: number }) => get<{ records: ServiceOrder[]; total: number }>('/crm/service-order/list', params),
  create: (data: Partial<ServiceOrder>) => post('/crm/service-order', data),
  update: (data: Partial<ServiceOrder>) => put('/crm/service-order', data),
  remove: (id: number) => del(`/crm/service-order/${id}`),
  // 后端 expiring 仅接收 days,直接返回 List(非分页)
  getExpiringList: (params: { days: number }) => get<ServiceOrder[]>('/crm/service-order/expiring', params),
  triggerRemind: () => post('/crm/service-order/remind')
}

// ===== 持有上限 =====
export const holdingApi = {
  getConfig: () => get<HoldingConfig[]>('/crm/holding/config'),
  saveConfig: (data: Partial<HoldingConfig>) => post('/crm/holding/config', data),
  updateConfig: (data: Partial<HoldingConfig>) => put('/crm/holding/config', data),
  getCurrentHolding: (userId?: number) => get<{ current: number; max: number; rate: number }>('/crm/holding/current', { userId }, { silentError: true }),
  checkLimit: (userId: number) => get<{ canClaim: boolean; reason?: string }>('/crm/holding/check-limit', { userId })
}

// ===== 提醒通知 =====
export const reminderApi = {
  getMyReminders: (params: { page?: number; size?: number; status?: number }) => get<{ list: ReminderItem[]; total: number }>('/crm/reminder/my', params),
  getUnreadCount: () => get<{ count: number }>('/crm/reminder/unread-count'),
  markAsRead: (id: number) => put(`/crm/reminder/read/${id}`),
  markAllRead: () => put('/crm/reminder/read-all')
}

// ===== 客户分层相关（个人客户 / 企业客户） =====
export interface CustomerLayer {
  id: number
  /** 个人客户 / 企业客户 */
  layerType: 'individual' | 'enterprise'
  /** 企业客户关联的个人客户ID（即老板的个人客户ID） */
  individualId?: number
  /** 个人客户名下的企业ID列表 */
  enterprises?: number[]
  updateTime?: string
}

const LAYER_STORAGE_KEY = 'crm_customer_layer'

function readLayerMap(): Record<number, CustomerLayer> {
  try {
    return JSON.parse(localStorage.getItem(LAYER_STORAGE_KEY) || '{}') as Record<number, CustomerLayer>
  } catch {
    return {}
  }
}

function writeLayerMap(map: Record<number, CustomerLayer>) {
  localStorage.setItem(LAYER_STORAGE_KEY, JSON.stringify(map))
}

export const customerLayerApi = {
  /** 获取客户分层信息 */
  getLayer(customerId: number): Promise<CustomerLayer> {
    const map = readLayerMap()
    const layer = map[customerId] || { id: customerId, layerType: 'individual', enterprises: [] }
    return Promise.resolve(layer)
  },
  /** 设置客户分层 */
  setLayer(customerId: number, layer: CustomerLayer): Promise<void> {
    const map = readLayerMap()
    map[customerId] = { ...layer, id: customerId, updateTime: new Date().toISOString() }
    // 反向维护：若是企业客户挂在某个老板下，自动写入老板的 enterprises 列表
    if (layer.layerType === 'enterprise' && layer.individualId) {
      const boss = map[layer.individualId] || {
        id: layer.individualId,
        layerType: 'individual',
        enterprises: []
      }
      const list = new Set(boss.enterprises || [])
      list.add(customerId)
      boss.enterprises = Array.from(list)
      boss.updateTime = new Date().toISOString()
      map[layer.individualId] = boss
    }
    writeLayerMap(map)
    return Promise.resolve()
  },
  /** 获取老板（个人客户）名下所有企业 */
  getEnterprises(individualId: number): Promise<any[]> {
    const map = readLayerMap()
    const boss = map[individualId]
    const ids = boss?.enterprises || []
    const list = ids.map(eid => map[eid]).filter(Boolean)
    return Promise.resolve(list)
  }
}

// ===== 公海私海 业务规则 Mock 辅助 =====
// 秒级锁、15 天冷却、每日抢单上限、A 级优先窗口、加权轮询、撞单事件日志、回收预警

const PR_KEYS = {
  CLAIM_LOCK: 'crm_pool_claim_lock_v1',          // 秒级锁：leadId -> 锁定时间戳
  COOLDOWN: 'crm_pool_cooldown_v1',              // 冷却：userId_leadId -> 释放时间戳
  GRAB_DAILY: 'crm_pool_grab_daily_v1',          // 当日抢单：userId_yyyyMMdd -> count
  PRIORITY_WINDOW: 'crm_pool_priority_window_v1',// A 级优先窗口：leadId -> 入池时间
  COLLISION_LOG: 'crm_collision_event_log_v1',   // 撞单事件日志
  RECYCLE_DOWN: 'crm_recycle_downgrade_v1'       // 连续回收降级
}

/** 角色持有上限规则（前端 Mock） */
export const ROLE_HOLDING_LIMITS: Array<{ role: string; label: string; max: number; tolerance: number }> = [
  { role: 'tele_junior', label: '电销初级', max: 60,  tolerance: 0.10 },
  { role: 'tele_middle', label: '电销中级', max: 80,  tolerance: 0.15 },
  { role: 'tele_senior', label: '电销高级', max: 120, tolerance: 0.20 },
  { role: 'online_specialist', label: '线上专员', max: 100, tolerance: 0.15 },
  { role: 'online_manager',    label: '线上主管', max: 150, tolerance: 0.25 },
  { role: 'sales_manager',     label: '销售主管', max: 200, tolerance: 0.30 }
]

/** 职级基础权重（用于加权轮询） */
export const ROLE_BASE_WEIGHTS: Array<{ role: string; label: string; weight: number }> = [
  { role: 'tele_junior',       label: '电销初级', weight: 1 },
  { role: 'tele_middle',       label: '电销中级', weight: 2 },
  { role: 'tele_senior',       label: '电销高级', weight: 3 },
  { role: 'online_specialist', label: '线上专员', weight: 2 },
  { role: 'online_manager',    label: '线上主管', weight: 3 }
]

function readJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}
function writeJSON(key: string, val: any) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}
function todayKey(uid: number) {
  const d = new Date()
  return `${uid}_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

/** 公海私海规则引擎 Mock */
export const poolRulesMock = {
  /** 秒级锁：领取/抢单时获取分布式锁，1 秒内同客户只能被一人锁定 */
  acquireClaimLock(leadId: number, userId: number, ttlMs = 1500): { ok: boolean; holderId?: number } {
    const map = readJSON<Record<string, { uid: number; expire: number }>>(PR_KEYS.CLAIM_LOCK, {})
    const now = Date.now()
    const exist = map[String(leadId)]
    if (exist && exist.expire > now && exist.uid !== userId) {
      return { ok: false, holderId: exist.uid }
    }
    map[String(leadId)] = { uid: userId, expire: now + ttlMs }
    writeJSON(PR_KEYS.CLAIM_LOCK, map)
    return { ok: true }
  },
  releaseClaimLock(leadId: number) {
    const map = readJSON<Record<string, any>>(PR_KEYS.CLAIM_LOCK, {})
    delete map[String(leadId)]
    writeJSON(PR_KEYS.CLAIM_LOCK, map)
  },

  /** 15 天冷却期：同一客户被释放后，原跟进人冷却期内不可再抢 */
  checkCooldown(userId: number, leadId: number): { canClaim: boolean; remainDays: number } {
    const map = readJSON<Record<string, number>>(PR_KEYS.COOLDOWN, {})
    const k = `${userId}_${leadId}`
    const expire = map[k] || 0
    const now = Date.now()
    if (expire > now) {
      return { canClaim: false, remainDays: Math.ceil((expire - now) / 86400000) }
    }
    return { canClaim: true, remainDays: 0 }
  },
  setCooldown(userId: number, leadId: number, days = 15) {
    const map = readJSON<Record<string, number>>(PR_KEYS.COOLDOWN, {})
    map[`${userId}_${leadId}`] = Date.now() + days * 86400000
    writeJSON(PR_KEYS.COOLDOWN, map)
  },

  /** 每日抢单上限（默认 20） */
  getDailyGrabCount(userId: number): number {
    const map = readJSON<Record<string, number>>(PR_KEYS.GRAB_DAILY, {})
    return map[todayKey(userId)] || 0
  },
  incrDailyGrab(userId: number): number {
    const map = readJSON<Record<string, number>>(PR_KEYS.GRAB_DAILY, {})
    const k = todayKey(userId)
    map[k] = (map[k] || 0) + 1
    writeJSON(PR_KEYS.GRAB_DAILY, map)
    return map[k]
  },
  checkDailyGrab(userId: number, limit = 20): { ok: boolean; current: number; limit: number } {
    const c = this.getDailyGrabCount(userId)
    return { ok: c < limit, current: c, limit }
  },

  /** A 级客户优先窗口：进入公海后前 N 秒仅高绩效销售可见，过后全员开放 */
  registerPriorityWindow(leadId: number, seconds = 30) {
    const map = readJSON<Record<string, number>>(PR_KEYS.PRIORITY_WINDOW, {})
    map[String(leadId)] = Date.now() + seconds * 1000
    writeJSON(PR_KEYS.PRIORITY_WINDOW, map)
  },
  getPriorityCountdown(leadId: number): { active: boolean; remainSec: number } {
    const map = readJSON<Record<string, number>>(PR_KEYS.PRIORITY_WINDOW, {})
    const expire = map[String(leadId)] || 0
    const remain = Math.max(0, Math.ceil((expire - Date.now()) / 1000))
    return { active: remain > 0, remainSec: remain }
  },

  /** 加权轮询权重计算：final = base*r1 + load*r2 + ability*r3 + commission*r4 */
  calcWeight(input: {
    base: number; load: number; ability: number; commission: number
    ratios: { base: number; load: number; ability: number; commission: number }
  }): { base: number; load: number; ability: number; commission: number; final: number } {
    const { base, load, ability, commission, ratios } = input
    const final = +(
      base * (ratios.base / 100) +
      load * (ratios.load / 100) +
      ability * (ratios.ability / 100) +
      commission * (ratios.commission / 100)
    ).toFixed(2)
    return { base, load, ability, commission, final }
  },
  /** 能力评定：近30天转化率排名 前20%=3 / 中间=2 / 后50%=1 */
  abilityScoreByRank(rankPercent: number): 1 | 2 | 3 {
    if (rankPercent <= 20) return 3
    if (rankPercent <= 50) return 2
    return 1
  },
  /** 负载系数：1 - 当前持有/最大容量 */
  loadFactor(current: number, max: number): number {
    if (!max) return 0
    return +(1 - current / max).toFixed(2)
  },

  /** 撞单事件日志 */
  appendCollisionEvent(evt: {
    leadName: string; userA: string; userB: string
    type: 'same_time' | 'cross_channel' | 'duplicate' | 'grab_conflict'
    matchLevel: 'P0' | 'P1' | 'P2' | 'P3'
    matchField: string; resolution?: string
  }) {
    const list = readJSON<any[]>(PR_KEYS.COLLISION_LOG, [])
    list.unshift({ ...evt, id: Date.now(), createTime: new Date().toISOString().slice(0, 16).replace('T', ' ') })
    writeJSON(PR_KEYS.COLLISION_LOG, list.slice(0, 200))
  },
  getCollisionEvents(): any[] {
    return readJSON<any[]>(PR_KEYS.COLLISION_LOG, [])
  },

  /** 计算回收预警（绿/黄/红） */
  calcWarningLevel(daysRemaining: number, thresholds = { green: 7, yellow: 3, red: 1 }):
    'green' | 'yellow' | 'red' | 'overdue' {
    if (daysRemaining < 0) return 'overdue'
    if (daysRemaining <= thresholds.red) return 'red'
    if (daysRemaining <= thresholds.yellow) return 'yellow'
    if (daysRemaining <= thresholds.green) return 'green'
    return 'green'
  },

  /** 连续回收降级：3 次自动降级（A→B→C→冻结） */
  recordRecycle(leadId: number, currentLevel: 'A' | 'B' | 'C' | 'D'): { times: number; nextLevel: string; toFrozen: boolean } {
    const map = readJSON<Record<string, number>>(PR_KEYS.RECYCLE_DOWN, {})
    const k = String(leadId)
    const times = (map[k] || 0) + 1
    map[k] = times
    writeJSON(PR_KEYS.RECYCLE_DOWN, map)
    let next: string = currentLevel
    let toFrozen = false
    if (times >= 3) {
      const order: Array<'A' | 'B' | 'C' | 'FROZEN'> = ['A', 'B', 'C', 'FROZEN']
      const idx = order.indexOf(currentLevel as any)
      if (idx >= 0 && idx < order.length - 1) {
        next = order[idx + 1]
        toFrozen = next === 'FROZEN'
      } else {
        next = 'FROZEN'
        toFrozen = true
      }
      map[k] = 0
      writeJSON(PR_KEYS.RECYCLE_DOWN, map)
    }
    return { times, nextLevel: next, toFrozen }
  }
}
