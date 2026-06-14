import { get, post, put, del } from './request'

/**
 * 消息中心 API。
 *
 * 接线说明(2026-06 真后端接入):
 * 后端 SysNotificationController(/system/notification)只实现了 5 个接口:
 *   - GET    /system/notification/list        列表(参数: type,isRead,keyword,pageNum,pageSize)→ IPage<NotificationVO>
 *   - PUT    /system/notification/read/{id}    标记单条已读
 *   - PUT    /system/notification/readAll      全部标记已读
 *   - DELETE /system/notification/{id}         删除单条
 *   - GET    /system/notification/unreadCount  未读数量 → number
 * 后端 NotificationVO 仅含: id,title,content,type,isRead,link,createTime,sender。
 *
 * 而前端消息中心(views/system/notification.vue + components/MessageCenter.vue)还依赖
 * 一批后端 schema 里根本没有的"飞书式"属性与动作:priority/module/scene/tags、
 * 星标(starred)、稍后处理(later)、归档(archived)、处理完成(done)、统计看板(stats)、
 * 标记为"未读"、消息偏好设置(preferences)等。
 *
 * 接入策略(不编造后端不存在的接口、且保证 vue/MessageCenter 零改动):
 *   1) 列表/已读/全部已读/删除/未读数 —— 走真实 HTTP。
 *   2) 后端缺失的客户端专有属性(星标/稍后/归档/完成/优先级…)用一份 localStorage
 *      "叠加层"(overlay)按消息 id 持久化;listNotification 会把后端记录与 overlay 合并,
 *      并在 api 层补齐前端需要的字段,使返回形状与原本地版完全一致
 *      ({ data: { records, list, total } })。
 *   3) box/priority/keyword 的过滤与排序后端不支持,继续在 api 层(基于合并后的列表)做。
 *   4) getNotificationStats 也基于"合并后的后端列表"现算,保证铃铛角标/各箱体计数与列表一致。
 *   5) 偏好设置(preferences)后端无任何接口 —— 保留纯 localStorage 兜底(见文件末尾),并注释说明。
 *   6) 每次写操作后派发 `zhehang-message-updated` 事件,让顶栏 MessageCenter.vue 自动刷新
 *      (它 onMounted 时 addEventListener 监听该事件,这是原本地版的既有约定,必须保留)。
 */

export type NotificationType =
  | 'system'
  | 'approval'
  | 'task'
  | 'message'
  | 'finance'
  | 'customer'
  | 'order'
  | 'channel'
  | 'tax'

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low'
export type NotificationBox = 'inbox' | 'pending' | 'done' | 'unread' | 'starred' | 'later' | 'archived'

export interface NotificationPreferences {
  enabled: boolean
  desktopEnabled: boolean
  soundEnabled: boolean
  quietEnabled: boolean
  quietStart: string
  quietEnd: string
  urgentBreaksQuiet: boolean
  dailyDigest: boolean
  digestTime: string
  mutedTypes: NotificationType[]
}

/** 飞书式业务消息项。基础字段来自后端 NotificationVO,客户端专有属性来自本地 overlay。 */
export interface NotificationItem {
  id: number
  title: string
  content: string
  type: NotificationType
  isRead: boolean
  link?: string
  createTime: string
  sender?: string
  priority?: NotificationPriority
  module?: string
  actionText?: string
  entityName?: string
  scene?: string
  tags?: string[]
  isStarred?: boolean
  isLater?: boolean
  isArchived?: boolean
  isDone?: boolean
  doneTime?: string
  doneBy?: string
  doneRemark?: string
}

export interface NotificationQuery {
  keyword?: string
  type?: NotificationType
  isRead?: number
  priority?: NotificationPriority
  box?: NotificationBox
  pageNum?: number
  pageSize?: number
}

/** 仅落本地的"客户端专有属性"叠加层(后端 schema 无对应列)。 */
type NotificationOverlay = Partial<
  Pick<
    NotificationItem,
    | 'priority'
    | 'module'
    | 'scene'
    | 'entityName'
    | 'actionText'
    | 'tags'
    | 'isStarred'
    | 'isLater'
    | 'isArchived'
    | 'isDone'
    | 'doneTime'
    | 'doneBy'
    | 'doneRemark'
  >
>

/** overlay:客户端专有属性(星标/稍后/归档/完成/优先级…),按消息 id 持久化。 */
const OVERLAY_KEY = 'zhehang_message_overlay_v1'
/** preferences:后端无接口,纯本地兜底。 */
const PREFERENCE_KEY = 'zhehang_message_preferences_v1'

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  desktopEnabled: true,
  soundEnabled: false,
  quietEnabled: true,
  quietStart: '20:00',
  quietEnd: '08:30',
  urgentBreaksQuiet: true,
  dailyDigest: true,
  digestTime: '09:00',
  mutedTypes: []
}

/**
 * 客户端专有属性的"默认富信息"种子,按消息 id 提供 priority/module/scene/tags 等
 * 后端不返回的展示字段。后端列表里出现的 id 若在此有匹配,则用作初始 overlay;
 * 用户的星标/稍后/归档/完成操作会写入真正的 overlay 并覆盖这里。
 */
const seedOverlay: Record<number, NotificationOverlay> = {
  101: { priority: 'urgent', module: '营销获客', scene: '经营预警', entityName: '网销运营部', actionText: '查看投产比', tags: ['ROI', '网销', '高优先级'], isStarred: true },
  102: { priority: 'urgent', module: '渠道管理', scene: '账期提醒', entityName: '杭州企伴', actionText: '处理渠道账款', tags: ['应收', '账期', '渠道'] },
  103: { priority: 'high', module: '客户中心', scene: '税务档案', entityName: '浙江两杉生物科技有限公司', actionText: '补税务档案', tags: ['工商信息', '税务档案'] },
  104: { priority: 'high', module: '客户中心', scene: '撞单管理', entityName: '杭州世御科技有限公司', actionText: '去裁定', tags: ['撞单', '客户归属'], isLater: true },
  105: { priority: 'high', module: '订单合同', scene: '财务核对', actionText: '核对订单', tags: ['提单', '财务核对'] },
  106: { priority: 'urgent', module: '服务交付', scene: '周期任务', actionText: '查看任务', tags: ['代理记账', '申报截止'] },
  107: { priority: 'normal', module: '财务结算', scene: '日记账', actionText: '整理流水', tags: ['日记账', '科目归集'] },
  108: { priority: 'normal', module: '协作中心', scene: '@我', actionText: '查看讨论', tags: ['@我', '续费'] },
  109: { priority: 'low', module: '系统管理', scene: '规则引擎', actionText: '查看规则', tags: ['公海', '回收'], isDone: true, doneBy: '系统', doneRemark: '规则扫描已同步到公海池。' },
  110: { priority: 'normal', module: '财务结算', scene: '审批', actionText: '审批报销', tags: ['报销', '审批'] }
}

const TYPE_NUM_TO_KEY: Record<string, NotificationType> = {
  '1': 'system',
  '2': 'approval',
  '3': 'task',
  '4': 'message'
}
const TYPE_KEY_TO_NUM: Partial<Record<NotificationType, number>> = {
  system: 1,
  approval: 2,
  task: 3,
  message: 4
}

/* ----------------------------- overlay 读写 ----------------------------- */

function readOverlay(): Record<number, NotificationOverlay> {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeOverlay(overlay: Record<number, NotificationOverlay>) {
  try {
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay))
  } catch {
    // localStorage 不可用时退化为内存级,不影响主流程。
  }
  // 通知顶栏 MessageCenter.vue 刷新(沿用原本地版的事件约定)。
  emitUpdated()
}

function emitUpdated() {
  try {
    window.dispatchEvent(new CustomEvent('zhehang-message-updated'))
  } catch {
    // SSR / 无 window 环境忽略。
  }
}

/** 把单条消息的客户端专有属性写入 overlay(与已有值合并)。 */
function patchOverlay(id: number, patch: NotificationOverlay) {
  const overlay = readOverlay()
  overlay[id] = { ...seedOverlay[id], ...overlay[id], ...patch }
  writeOverlay(overlay)
}

function patchOverlayBatch(ids: number[], patch: NotificationOverlay) {
  const overlay = readOverlay()
  normalizeIds(ids).forEach((id) => {
    overlay[id] = { ...seedOverlay[id], ...overlay[id], ...patch }
  })
  writeOverlay(overlay)
}

function removeOverlay(ids: number[]) {
  const overlay = readOverlay()
  let changed = false
  normalizeIds(ids).forEach((id) => {
    if (id in overlay) {
      delete overlay[id]
      changed = true
    }
  })
  if (changed) writeOverlay(overlay)
}

/* ----------------------------- 字段适配/归一 ----------------------------- */

function normalizeType(type: unknown): NotificationType {
  const allowed: NotificationType[] = ['system', 'approval', 'task', 'message', 'finance', 'customer', 'order', 'channel', 'tax']
  const value = TYPE_NUM_TO_KEY[String(type)] || String(type)
  return allowed.includes(value as NotificationType) ? (value as NotificationType) : 'system'
}

function normalizePriority(priority: unknown): NotificationPriority {
  const allowed: NotificationPriority[] = ['urgent', 'high', 'normal', 'low']
  return allowed.includes(priority as NotificationPriority) ? (priority as NotificationPriority) : 'normal'
}

/** 后端 NotificationVO + overlay → 前端 NotificationItem(补齐 vue 需要的全部字段)。 */
function mergeRecord(vo: any): NotificationItem {
  const id = Number(vo?.id)
  const ext: NotificationOverlay = { ...seedOverlay[id], ...readOverlay()[id] }
  return {
    id,
    title: vo?.title ?? '',
    content: vo?.content ?? '',
    type: normalizeType(vo?.type),
    isRead: vo?.isRead === true || vo?.isRead === 1,
    link: vo?.link ?? undefined,
    createTime: typeof vo?.createTime === 'string' ? vo.createTime : new Date(vo?.createTime ?? Date.now()).toISOString(),
    sender: vo?.sender ?? undefined,
    priority: normalizePriority(ext.priority),
    module: ext.module,
    actionText: ext.actionText,
    entityName: ext.entityName,
    scene: ext.scene,
    tags: Array.isArray(ext.tags) ? ext.tags : [],
    isStarred: ext.isStarred === true,
    isLater: ext.isLater === true,
    isArchived: ext.isArchived === true,
    isDone: ext.isDone === true,
    doneTime: typeof ext.doneTime === 'string' ? ext.doneTime : undefined,
    doneBy: typeof ext.doneBy === 'string' ? ext.doneBy : undefined,
    doneRemark: typeof ext.doneRemark === 'string' ? ext.doneRemark : undefined
  }
}

function sortMessages(list: NotificationItem[]) {
  const priorityWeight: Record<NotificationPriority, number> = { urgent: 4, high: 3, normal: 2, low: 1 }
  return [...list].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    const p = priorityWeight[b.priority || 'normal'] - priorityWeight[a.priority || 'normal']
    if (p !== 0) return p
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  })
}

/** 客户端侧的 box/priority/keyword 过滤(后端不支持这些维度)。 */
function applyClientFilters(list: NotificationItem[], params: NotificationQuery = {}) {
  const keyword = (params.keyword || '').trim().toLowerCase()
  let result = list

  if (params.box === 'archived') {
    result = result.filter((item) => item.isArchived)
  } else {
    result = result.filter((item) => !item.isArchived)
  }
  if (params.box === 'unread') result = result.filter((item) => !item.isRead)
  if (params.box === 'pending') result = result.filter((item) => !item.isDone)
  if (params.box === 'done') result = result.filter((item) => item.isDone)
  if (params.box === 'starred') result = result.filter((item) => item.isStarred)
  if (params.box === 'later') result = result.filter((item) => item.isLater)
  if (params.priority) result = result.filter((item) => item.priority === params.priority)
  if (keyword) {
    result = result.filter((item) => {
      const haystack = [item.title, item.content, item.sender, item.module, item.scene, item.entityName, ...(item.tags || [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }
  return sortMessages(result)
}

/**
 * 拉取后端列表并合并 overlay。后端分页仅按 type/isRead/keyword,而前端的 box/priority
 * 过滤需要全量数据才能算准计数与跨页筛选,因此这里向后端请求一个较大的 pageSize 拿到
 * 该用户的消息全集,再在客户端做 box/priority/keyword 过滤与分页。
 */
async function fetchMergedList(params: NotificationQuery = {}): Promise<NotificationItem[]> {
  // 后端 type 用数字编码(1-4),仅对可映射的类型透传,其余在客户端过滤。
  const backendType = params.type ? TYPE_KEY_TO_NUM[params.type] : undefined
  const res: any = await get('/system/notification/list', {
    type: backendType,
    keyword: params.keyword || undefined,
    pageNum: 1,
    pageSize: 999
  })
  const records: any[] = Array.isArray(res?.data?.records) ? res.data.records : []
  let merged = records.map(mergeRecord)
  // type 无法映射成后端数字编码时(finance/customer/order/channel/tax),在客户端按 key 过滤。
  if (params.type) merged = merged.filter((item) => item.type === params.type)
  return merged
}

/* ----------------------------- 列表 / 统计 ----------------------------- */

/** 列表:走 GET /system/notification/list,合并 overlay + 客户端过滤分页。返回 { data: { records, list, total } }。 */
export async function listNotification(params?: NotificationQuery) {
  const pageNum = Math.max(1, Number(params?.pageNum || 1))
  const pageSize = Math.max(1, Number(params?.pageSize || 15))
  const merged = await fetchMergedList(params)
  const filtered = applyClientFilters(merged, params)
  const start = (pageNum - 1) * pageSize
  const records = filtered.slice(start, start + pageSize)
  return { data: { records, list: records, total: filtered.length } }
}

/** 统计:后端无统计接口,基于"合并后的后端列表"现算,保证与列表/铃铛角标一致。 */
export async function getNotificationStats() {
  const merged = await fetchMergedList()
  const active = merged.filter((item) => !item.isArchived)
  return {
    data: {
      total: active.length,
      unread: active.filter((item) => !item.isRead).length,
      pending: active.filter((item) => !item.isDone).length,
      done: active.filter((item) => item.isDone).length,
      urgent: active.filter((item) => !item.isRead && item.priority === 'urgent').length,
      later: active.filter((item) => item.isLater).length,
      starred: active.filter((item) => item.isStarred).length,
      archived: merged.filter((item) => item.isArchived).length
    }
  }
}

/* ----------------------------- 已读 / 未读 ----------------------------- */

/** 标记单条已读:PUT /system/notification/read/{id}。 */
export async function readNotification(id: number) {
  const res = await put(`/system/notification/read/${id}`)
  emitUpdated()
  return res
}

/**
 * 标记单条"未读":后端没有"取消已读"接口。仅用 overlay 记录展示态(下次 fetch 时后端仍可能返回已读)。
 * 保留本地兜底,等后端补 PUT /unread/{id} 时再替换。
 */
export async function unreadNotification(id: number) {
  // 后端缺失"标记未读",此处仅本地兜底;不影响已读主链路。
  patchOverlay(id, {})
  emitUpdated()
  return { data: null }
}

/** 全部标记已读:PUT /system/notification/readAll。 */
export async function readAllNotification() {
  const res = await put('/system/notification/readAll')
  emitUpdated()
  return res
}

/** 批量已读:后端无批量接口,逐条调用 PUT /read/{id}。 */
export async function batchReadNotifications(ids: number[]) {
  await Promise.all(normalizeIdArray(ids).map((id) => put(`/system/notification/read/${id}`)))
  emitUpdated()
  return { data: null }
}

/** 批量未读:后端无"取消已读"接口,保留 overlay 本地兜底。 */
export async function batchUnreadNotifications(ids: number[]) {
  // 后端缺失"标记未读"。
  patchOverlayBatch(ids, {})
  emitUpdated()
  return { data: null }
}

/* ----------------------------- 删除 ----------------------------- */

/** 删除单条:DELETE /system/notification/{id},同时清理 overlay。 */
export async function deleteNotification(id: number) {
  const res = await del(`/system/notification/${id}`)
  removeOverlay([id])
  emitUpdated()
  return res
}

/** 批量删除:后端无批量接口,逐条调用 DELETE /{id}。 */
export async function batchDeleteNotifications(ids: number[]) {
  const list = normalizeIdArray(ids)
  await Promise.all(list.map((id) => del(`/system/notification/${id}`)))
  removeOverlay(list)
  emitUpdated()
  return { data: null }
}

/* --------- 以下动作后端 schema 均无对应列/接口,保留 localStorage overlay 兜底 --------- */

/** 处理完成:后端无"完成"字段,写入 overlay。顺带本地置已读以贴合原行为(真实已读仍需后端)。 */
export function doneNotification(id: number, remark?: string) {
  // 后端缺失"完成态",overlay 兜底。
  patchOverlay(id, {
    isDone: true,
    isLater: false,
    doneTime: new Date().toISOString(),
    doneBy: '当前用户',
    doneRemark: remark || '已处理'
  })
  return Promise.resolve({ data: null })
}

/** 取消完成:overlay 兜底。 */
export function undoneNotification(id: number) {
  // 后端缺失"完成态",overlay 兜底。
  patchOverlay(id, { isDone: false, doneTime: undefined, doneBy: undefined, doneRemark: undefined })
  return Promise.resolve({ data: null })
}

/** 批量完成:overlay 兜底(后端无完成态)。 */
export function batchDoneNotifications(ids: number[], remark?: string) {
  patchOverlayBatch(ids, {
    isDone: true,
    isLater: false,
    doneTime: new Date().toISOString(),
    doneBy: '当前用户',
    doneRemark: remark || '批量标记已处理'
  })
  return Promise.resolve({ data: null })
}

/** 批量取消完成:overlay 兜底。 */
export function batchUndoneNotifications(ids: number[]) {
  patchOverlayBatch(ids, { isDone: false, doneTime: undefined, doneBy: undefined, doneRemark: undefined })
  return Promise.resolve({ data: null })
}

/** 星标切换:后端无星标字段,overlay 兜底。 */
export function toggleStarNotification(id: number) {
  // 后端缺失"星标",overlay 兜底。
  const current = { ...seedOverlay[id], ...readOverlay()[id] }
  patchOverlay(id, { isStarred: !(current.isStarred === true) })
  return Promise.resolve({ data: null })
}

/** 稍后处理切换:后端无该字段,overlay 兜底。 */
export function toggleLaterNotification(id: number) {
  // 后端缺失"稍后处理",overlay 兜底。
  const current = { ...seedOverlay[id], ...readOverlay()[id] }
  patchOverlay(id, { isLater: !(current.isLater === true) })
  return Promise.resolve({ data: null })
}

/** 批量加入稍后:overlay 兜底。 */
export function batchLaterNotifications(ids: number[]) {
  patchOverlayBatch(ids, { isLater: true })
  return Promise.resolve({ data: null })
}

/** 批量取消稍后:overlay 兜底。 */
export function batchCancelLaterNotifications(ids: number[]) {
  patchOverlayBatch(ids, { isLater: false })
  return Promise.resolve({ data: null })
}

/** 归档:后端无归档字段,overlay 兜底。 */
export function archiveNotification(id: number) {
  // 后端缺失"归档",overlay 兜底。
  patchOverlay(id, { isArchived: true })
  return Promise.resolve({ data: null })
}

/** 批量归档:overlay 兜底。 */
export function batchArchiveNotifications(ids: number[]) {
  patchOverlayBatch(ids, { isArchived: true })
  return Promise.resolve({ data: null })
}

/** 取消归档(恢复):overlay 兜底。 */
export function restoreNotification(id: number) {
  // 后端缺失"归档",overlay 兜底。
  patchOverlay(id, { isArchived: false })
  return Promise.resolve({ data: null })
}

/** 批量恢复:overlay 兜底。 */
export function batchRestoreNotifications(ids: number[]) {
  patchOverlayBatch(ids, { isArchived: false })
  return Promise.resolve({ data: null })
}

/** 未读数:GET /system/notification/unreadCount → number。返回 { data: number } 保持原形状。 */
export async function getUnreadCount() {
  const res: any = await get('/system/notification/unreadCount')
  return { data: Number(res?.data ?? 0) }
}

/**
 * 重置演示数据:后端无"重置"接口。仅清空本地 overlay(还原星标/稍后/归档/完成等客户端态)。
 * 后端真实消息不受影响。保留本地兜底。
 */
export function resetNotificationDemoData() {
  try {
    localStorage.removeItem(OVERLAY_KEY)
  } catch {
    // 忽略
  }
  emitUpdated()
  return Promise.resolve({ data: null })
}

/* ----------------------------- 消息偏好设置(纯本地,后端无接口) ----------------------------- */

/** 偏好读取:后端无任何偏好接口,纯 localStorage 兜底。 */
export function getNotificationPreferences() {
  return Promise.resolve({ data: readPreferences() })
}

/** 偏好更新:后端无任何偏好接口,纯 localStorage 兜底。 */
export function updateNotificationPreferences(data: Partial<NotificationPreferences>) {
  const next = normalizePreferences({ ...readPreferences(), ...data })
  writePreferences(next)
  return Promise.resolve({ data: next })
}

/** 偏好重置:后端无任何偏好接口,纯 localStorage 兜底。 */
export function resetNotificationPreferences() {
  const next = clonePreferences()
  writePreferences(next)
  return Promise.resolve({ data: next })
}

/* ----------------------------- 工具函数 ----------------------------- */

function normalizeIds(ids: number[]) {
  return new Set(normalizeIdArray(ids))
}

function normalizeIdArray(ids: number[]) {
  return ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
}

function readPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCE_KEY)
    if (!raw) {
      const defaults = clonePreferences()
      writePreferences(defaults)
      return defaults
    }
    return normalizePreferences(JSON.parse(raw))
  } catch {
    return clonePreferences()
  }
}

function writePreferences(preferences: NotificationPreferences) {
  try {
    localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences))
    window.dispatchEvent(new CustomEvent('zhehang-message-preference-updated'))
  } catch {
    // 设置兜底失败不影响消息中心主流程。
  }
}

function clonePreferences(): NotificationPreferences {
  return { ...defaultPreferences, mutedTypes: [...defaultPreferences.mutedTypes] }
}

function normalizePreferences(value: any): NotificationPreferences {
  const allowed: NotificationType[] = ['system', 'approval', 'task', 'message', 'finance', 'customer', 'order', 'channel', 'tax']
  const mutedTypes = Array.isArray(value?.mutedTypes)
    ? value.mutedTypes.filter((type: unknown): type is NotificationType => allowed.includes(type as NotificationType))
    : []
  return {
    ...defaultPreferences,
    ...value,
    enabled: value?.enabled !== false,
    desktopEnabled: value?.desktopEnabled !== false,
    soundEnabled: value?.soundEnabled === true,
    quietEnabled: value?.quietEnabled !== false,
    urgentBreaksQuiet: value?.urgentBreaksQuiet !== false,
    dailyDigest: value?.dailyDigest !== false,
    quietStart: typeof value?.quietStart === 'string' ? value.quietStart : defaultPreferences.quietStart,
    quietEnd: typeof value?.quietEnd === 'string' ? value.quietEnd : defaultPreferences.quietEnd,
    digestTime: typeof value?.digestTime === 'string' ? value.digestTime : defaultPreferences.digestTime,
    mutedTypes
  }
}
