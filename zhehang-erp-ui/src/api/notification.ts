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
export type NotificationBox = 'inbox' | 'unread' | 'starred' | 'later' | 'archived'

/** 飞书式业务消息项。当前使用本地持久化,后续可平滑替换为后端消息表/实时推送。 */
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

const STORAGE_KEY = 'zhehang_message_center_v1'

const seedNotifications: NotificationItem[] = [
  {
    id: 101,
    title: '网销 ROI 低于目标',
    content: '信息流投放 ROI 2.8,低于目标 3.2。建议复盘关键词、人群包和落地页转化。',
    type: 'finance',
    priority: 'urgent',
    module: '营销获客',
    scene: '经营预警',
    entityName: '网销运营部',
    sender: '经营驾驶舱',
    link: '/leads/online-roi',
    actionText: '查看投产比',
    tags: ['ROI', '网销', '高优先级'],
    isRead: false,
    isStarred: true,
    createTime: minutesAgo(18)
  },
  {
    id: 102,
    title: '渠道应收超账期',
    content: '杭州企伴应收 ¥42,800,已超账期 9 天。建议先冻结新单结算,并推送负责人跟进。',
    type: 'channel',
    priority: 'urgent',
    module: '渠道管理',
    scene: '账期提醒',
    entityName: '杭州企伴',
    sender: '财务结算',
    link: '/supply/channel-partner',
    actionText: '处理渠道账款',
    tags: ['应收', '账期', '渠道'],
    isRead: false,
    createTime: minutesAgo(36)
  },
  {
    id: 103,
    title: '新企业主体已进入工商税务档案',
    content: '浙江两杉生物科技有限公司已完成工商信息带出,请补齐办税人、税种和申报周期。',
    type: 'tax',
    priority: 'high',
    module: '客户中心',
    scene: '税务档案',
    entityName: '浙江两杉生物科技有限公司',
    sender: '企业主体库',
    link: '/customer/enterprise-master',
    actionText: '补税务档案',
    tags: ['工商信息', '税务档案'],
    isRead: false,
    createTime: minutesAgo(72)
  },
  {
    id: 104,
    title: '客户撞单需要主管裁定',
    content: '杭州世御科技有限公司同时命中电销与网销来源,需按首触、有效沟通和证据链裁定归属。',
    type: 'customer',
    priority: 'high',
    module: '客户中心',
    scene: '撞单管理',
    entityName: '杭州世御科技有限公司',
    sender: '防撞单引擎',
    link: '/customer/collision-manage',
    actionText: '去裁定',
    tags: ['撞单', '客户归属'],
    isRead: false,
    isLater: true,
    createTime: hoursAgo(2)
  },
  {
    id: 105,
    title: '提单财务核对待处理',
    content: '3 笔工商注册订单金额、收款凭证和服务包存在待核对项,请财务确认后放行。',
    type: 'order',
    priority: 'high',
    module: '订单合同',
    scene: '财务核对',
    sender: '提单系统',
    link: '/order/finance-check',
    actionText: '核对订单',
    tags: ['提单', '财务核对'],
    isRead: false,
    createTime: hoursAgo(3)
  },
  {
    id: 106,
    title: '代理记账周期任务即将逾期',
    content: '12 家客户本月账务资料未收齐,其中 4 家距离申报截止不足 3 天。',
    type: 'task',
    priority: 'urgent',
    module: '服务交付',
    scene: '周期任务',
    sender: '任务中心',
    link: '/task-center/periodic',
    actionText: '查看任务',
    tags: ['代理记账', '申报截止'],
    isRead: false,
    createTime: hoursAgo(4)
  },
  {
    id: 107,
    title: '日记账有 5 笔待归集流水',
    content: '系统识别到银行流水缺少业务对象或一级模块,请补充客户、订单或费用归属。',
    type: 'finance',
    priority: 'normal',
    module: '财务结算',
    scene: '日记账',
    sender: '财务日记账',
    link: '/finance/journal',
    actionText: '整理流水',
    tags: ['日记账', '科目归集'],
    isRead: true,
    createTime: hoursAgo(6)
  },
  {
    id: 108,
    title: '同事 @你 协助确认客户续费方案',
    content: '销售主管在「浙江云舟企服」续费讨论中 @你,请确认是否保留原套餐并补充报价。',
    type: 'message',
    priority: 'normal',
    module: '协作中心',
    scene: '@我',
    sender: '销售主管',
    link: '/customer/service-renewal',
    actionText: '查看讨论',
    tags: ['@我', '续费'],
    isRead: false,
    createTime: hoursAgo(7)
  },
  {
    id: 109,
    title: '公海回收规则扫描完成',
    content: '今日已扫描 126 条线索,释放 8 条超期未跟进客户到藏金阁公海池。',
    type: 'system',
    priority: 'low',
    module: '系统管理',
    scene: '规则引擎',
    sender: '回收规则',
    link: '/system/recycle-config',
    actionText: '查看规则',
    tags: ['公海', '回收'],
    isRead: true,
    createTime: yesterdayAt('17:40')
  },
  {
    id: 110,
    title: '报销审批待你处理',
    content: '运营部提交了一笔投放账户充值报销,金额 ¥12,600,需要财务主管审批。',
    type: 'approval',
    priority: 'normal',
    module: '财务结算',
    scene: '审批',
    sender: '审批中心',
    link: '/finance/reimburse',
    actionText: '审批报销',
    tags: ['报销', '审批'],
    isRead: true,
    createTime: yesterdayAt('15:12')
  }
]

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function yesterdayAt(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  const date = new Date()
  date.setDate(date.getDate() - 1)
  date.setHours(hour || 0, minute || 0, 0, 0)
  return date.toISOString()
}

function cloneSeed() {
  return seedNotifications.map((item) => ({ ...item, tags: [...(item.tags || [])] }))
}

function readStore(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = cloneSeed()
      writeStore(seed)
      return seed
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return cloneSeed()
    return parsed.map(normalizeItem)
  } catch {
    return cloneSeed()
  }
}

function writeStore(list: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('zhehang-message-updated'))
  } catch {
    // localStorage 不可用时保持内存级兜底,不影响页面渲染。
  }
}

function normalizeItem(item: any): NotificationItem {
  return {
    ...item,
    type: normalizeType(item.type),
    priority: normalizePriority(item.priority),
    isRead: item.isRead === true || item.isRead === 1,
    isStarred: item.isStarred === true,
    isLater: item.isLater === true,
    isArchived: item.isArchived === true,
    tags: Array.isArray(item.tags) ? item.tags : []
  }
}

function normalizeType(type: unknown): NotificationType {
  const allowed: NotificationType[] = ['system', 'approval', 'task', 'message', 'finance', 'customer', 'order', 'channel', 'tax']
  const typeMap: Record<string, NotificationType> = {
    '1': 'system',
    '2': 'approval',
    '3': 'task',
    '4': 'message'
  }
  const value = typeMap[String(type)] || String(type)
  return allowed.includes(value as NotificationType) ? value as NotificationType : 'system'
}

function normalizePriority(priority: unknown): NotificationPriority {
  const allowed: NotificationPriority[] = ['urgent', 'high', 'normal', 'low']
  return allowed.includes(priority as NotificationPriority) ? priority as NotificationPriority : 'normal'
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

function filterList(params: NotificationQuery = {}) {
  const keyword = (params.keyword || '').trim().toLowerCase()
  let list = readStore()

  if (params.box === 'archived') {
    list = list.filter((item) => item.isArchived)
  } else {
    list = list.filter((item) => !item.isArchived)
  }
  if (params.box === 'unread') list = list.filter((item) => !item.isRead)
  if (params.box === 'starred') list = list.filter((item) => item.isStarred)
  if (params.box === 'later') list = list.filter((item) => item.isLater)
  if (params.isRead !== undefined) list = list.filter((item) => item.isRead === Boolean(params.isRead))
  if (params.type) list = list.filter((item) => item.type === params.type)
  if (params.priority) list = list.filter((item) => item.priority === params.priority)
  if (keyword) {
    list = list.filter((item) => {
      const haystack = [
        item.title,
        item.content,
        item.sender,
        item.module,
        item.scene,
        item.entityName,
        ...(item.tags || [])
      ].join(' ').toLowerCase()
      return haystack.includes(keyword)
    })
  }
  return sortMessages(list)
}

export function listNotification(params?: NotificationQuery) {
  const pageNum = Math.max(1, Number(params?.pageNum || 1))
  const pageSize = Math.max(1, Number(params?.pageSize || 15))
  const list = filterList(params)
  const start = (pageNum - 1) * pageSize
  const records = list.slice(start, start + pageSize)
  return Promise.resolve({ data: { records, list: records, total: list.length } })
}

export function getNotificationStats() {
  const active = readStore().filter((item) => !item.isArchived)
  return Promise.resolve({
    data: {
      total: active.length,
      unread: active.filter((item) => !item.isRead).length,
      urgent: active.filter((item) => !item.isRead && item.priority === 'urgent').length,
      later: active.filter((item) => item.isLater && !item.isArchived).length,
      starred: active.filter((item) => item.isStarred && !item.isArchived).length,
      archived: readStore().filter((item) => item.isArchived).length
    }
  })
}

export function readNotification(id: number) {
  return updateNotification(id, (item) => ({ ...item, isRead: true }))
}

export function unreadNotification(id: number) {
  return updateNotification(id, (item) => ({ ...item, isRead: false }))
}

export function readAllNotification() {
  const list = readStore().map((item) => item.isArchived ? item : { ...item, isRead: true })
  writeStore(list)
  return Promise.resolve({ data: null })
}

export function batchReadNotifications(ids: number[]) {
  return batchUpdateNotifications(ids, (item) => ({ ...item, isRead: true }))
}

export function batchUnreadNotifications(ids: number[]) {
  return batchUpdateNotifications(ids, (item) => ({ ...item, isRead: false }))
}

export function deleteNotification(id: number) {
  const list = readStore().filter((item) => item.id !== id)
  writeStore(list)
  return Promise.resolve({ data: null })
}

export function batchDeleteNotifications(ids: number[]) {
  const idSet = normalizeIds(ids)
  const list = readStore().filter((item) => !idSet.has(item.id))
  writeStore(list)
  return Promise.resolve({ data: null })
}

export function archiveNotification(id: number) {
  return updateNotification(id, (item) => ({ ...item, isArchived: true, isRead: true }))
}

export function batchArchiveNotifications(ids: number[]) {
  return batchUpdateNotifications(ids, (item) => ({ ...item, isArchived: true, isRead: true }))
}

export function restoreNotification(id: number) {
  return updateNotification(id, (item) => ({ ...item, isArchived: false }))
}

export function batchRestoreNotifications(ids: number[]) {
  return batchUpdateNotifications(ids, (item) => ({ ...item, isArchived: false }))
}

export function toggleStarNotification(id: number) {
  return updateNotification(id, (item) => ({ ...item, isStarred: !item.isStarred }))
}

export function toggleLaterNotification(id: number) {
  return updateNotification(id, (item) => ({ ...item, isLater: !item.isLater }))
}

export function batchLaterNotifications(ids: number[]) {
  return batchUpdateNotifications(ids, (item) => ({ ...item, isLater: true }))
}

export function batchCancelLaterNotifications(ids: number[]) {
  return batchUpdateNotifications(ids, (item) => ({ ...item, isLater: false }))
}

export function resetNotificationDemoData() {
  const seed = cloneSeed()
  writeStore(seed)
  return Promise.resolve({ data: seed })
}

export function getUnreadCount() {
  const unread = readStore().filter((item) => !item.isRead && !item.isArchived).length
  return Promise.resolve({ data: unread })
}

function updateNotification(id: number, updater: (item: NotificationItem) => NotificationItem) {
  const list = readStore()
  const index = list.findIndex((item) => item.id === id)
  if (index >= 0) {
    list[index] = updater(list[index])
    writeStore(list)
  }
  return Promise.resolve({ data: null })
}

function batchUpdateNotifications(ids: number[], updater: (item: NotificationItem) => NotificationItem) {
  const idSet = normalizeIds(ids)
  if (idSet.size === 0) return Promise.resolve({ data: null })
  const list = readStore().map((item) => idSet.has(item.id) ? updater(item) : item)
  writeStore(list)
  return Promise.resolve({ data: null })
}

function normalizeIds(ids: number[]) {
  return new Set(ids.map((id) => Number(id)).filter((id) => Number.isFinite(id)))
}
