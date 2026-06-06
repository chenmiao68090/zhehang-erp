// ===== 提单系统 API（localStorage Mock 模式） =====
import {
  onOrderCompleted as linkOrderCompleted,
  onPaymentConfirmed as linkPaymentConfirmed
} from '@/utils/biz-linkage'

export interface BizOrderItem {
  id: number
  itemNo: string
  orderId: number
  serviceType: 'bookkeeping' | 'registration' | 'tax_planning' | 'qualification' | 'audit' | 'cancellation' | 'other'
  servicePeriod: '1month' | '3month' | '6month' | '1year' | '2year' | '3year' | 'one_time'
  startDate: string
  endDate: string
  description: string
  specialRequirement: string
  amount: number
  discountRate: number
  finalAmount: number
  itemStatus: 'pending' | 'in_progress' | 'completed' | 'paused'
  addressResourceId?: number
}

export interface OrderLinkageLog {
  time: string
  type: 'approval' | 'linkage' | 'system'
  title: string
  desc: string
}

export interface BizOrder {
  id: number
  orderNo: string
  customerId: number
  customerName?: string
  submitterId: number
  submitterName?: string
  submitTime: string
  status: 'draft' | 'pending_approval' | 'pending_finance' | 'pending_boss' | 'rejected' | 'completed' | 'cancelled'
  totalAmount: number
  discountRate: number
  finalAmount: number
  depositAmount: number
  pendingAmount: number
  paymentMethod: 'lump_sum' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'installment'
  paymentTimeReq: string
  commissionRate: number
  commissionAmount: number
  confirmMethod: 'wechat' | 'phone' | 'meeting' | 'email'
  confirmScreenshot: string
  expectedSignDate: string
  specialAgreement: string
  approverId: number
  approvalTime: string
  approvalOpinion: string
  financeConfirmerId: number
  financeConfirmTime: string
  financeOpinion: string
  bossApproverId: number
  bossApprovalTime: string
  bossOpinion: string
  approvalLevel: 1 | 2 | 3
  approvalDeadline: string
  submitMoment: 'am' | 'pm' | ''
  rejectStage: 'manager' | 'finance' | 'boss' | ''
  rejectReasonType: string
  rejectReason: string
  linkageLogs: OrderLinkageLog[]
  items: BizOrderItem[]
  remark: string
  createTime: string
}

// 金额阈值 → 审批级别
export function calcApprovalLevel(finalAmount: number): 1 | 2 | 3 {
  if (finalAmount > 1000) return 3
  if (finalAmount > 200) return 2
  return 1
}

export function approvalLevelLabel(level: 1 | 2 | 3): string {
  return level === 1 ? '一级审批' : level === 2 ? '二级审批' : '三级审批'
}

export function approvalLevelChain(level: 1 | 2 | 3): string[] {
  if (level === 1) return ['主管审批']
  if (level === 2) return ['主管审批', '财务确认']
  return ['主管审批', '财务确认', '老板终审']
}

// 根据提交时间计算审批截止时刻
export function calcApprovalDeadline(submitISO: string): { deadline: string; moment: 'am' | 'pm' } {
  const d = new Date(submitISO.replace(' ', 'T'))
  const hour = d.getHours()
  const dl = new Date(d)
  if (hour < 12) {
    dl.setHours(18, 0, 0, 0)
    return { deadline: fmtTime(dl), moment: 'am' }
  }
  dl.setDate(dl.getDate() + 1)
  dl.setHours(12, 0, 0, 0)
  return { deadline: fmtTime(dl), moment: 'pm' }
}

function fmtTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export interface OrderListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  customerName?: string
  submitterName?: string
  orderNo?: string
  startDate?: string
  endDate?: string
  overdueOnly?: boolean
}

export interface OrderListResp {
  list: BizOrder[]
  total: number
}

export interface OrderStats {
  totalCount: number
  draftCount: number
  pendingApprovalCount: number
  pendingFinanceCount: number
  pendingBossCount: number
  rejectedCount: number
  completedCount: number
  cancelledCount: number
  overdueCount: number
  totalAmount: number
  finalAmount: number
  monthAmount: number
}

const STORAGE_KEY = 'biz_orders'
const PRIVATE_FOLLOW_KEY = 'biz_private_follow_records'
const PRIVATE_CONTACT_KEY = 'biz_private_contacts'

const delay = <T>(data: T, ms = 120): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

const todayStr = (offsetDays = 0): string => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

const dateOnly = (offsetDays = 0): string => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

function genOrderNo(): string {
  const d = new Date()
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 9000) + 1000)
  return `TD${ym}${seq}`
}

function genItemNo(orderNo: string, idx: number): string {
  return `${orderNo}-${String(idx + 1).padStart(3, '0')}`
}

function loadOrders(): BizOrder[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try { return JSON.parse(raw) as BizOrder[] } catch { /* fallthrough */ }
  }
  const seed = buildSeedOrders()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function saveOrders(list: BizOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function readLocalList<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeLocalList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list))
}

function privateOrderNextAction(status: BizOrder['status'], orderNo: string) {
  return ({
    draft: `提单 ${orderNo} 仍为草稿,请销售核对后提交审批`,
    pending_approval: `提单 ${orderNo} 已提交审批,等待主管审批`,
    pending_finance: `提单 ${orderNo} 主管已通过,等待财务核对`,
    pending_boss: `提单 ${orderNo} 财务已确认,等待老板终审`,
    rejected: `提单 ${orderNo} 已驳回,请根据意见调整报价或资料`,
    completed: `提单 ${orderNo} 已完成审批,请生成交付包并跟进回款/合同`,
    cancelled: `提单 ${orderNo} 已取消,请复盘客户需求和取消原因`
  } as Record<BizOrder['status'], string>)[status]
}

function syncPrivateOrderStatus(order: BizOrder) {
  const records = readLocalList<any>(PRIVATE_FOLLOW_KEY)
  const recordIdx = records.findIndex(item => item.orderId === order.id || item.orderNo === order.orderNo)
  if (recordIdx < 0) return
  const now = todayStr()
  const nextAction = privateOrderNextAction(order.status, order.orderNo)
  const current = records[recordIdx]
  records[recordIdx] = {
    ...current,
    orderId: order.id,
    orderNo: order.orderNo,
    orderStatus: order.status,
    nextAction
  }
  writeLocalList(PRIVATE_FOLLOW_KEY, records)

  const contacts = readLocalList<any>(PRIVATE_CONTACT_KEY)
  const contactIdx = contacts.findIndex(item => item.id === current.contactId)
  if (contactIdx < 0) return
  const contact = contacts[contactIdx]
  const tags = Array.from(new Set([...(contact.tags || []), order.status === 'completed' ? '提单已完成' : '提单流转中']))
  contacts[contactIdx] = {
    ...contact,
    stage: order.status === 'completed' ? 'ordered' : contact.stage,
    nextAction,
    lastTouchAt: now,
    tags: tags.slice(0, 8)
  }
  writeLocalList(PRIVATE_CONTACT_KEY, contacts)
}

function buildSeedOrders(): BizOrder[] {
  type SeedItem = {
    serviceType: BizOrderItem['serviceType']
    servicePeriod: BizOrderItem['servicePeriod']
    startOffset: number
    endOffset: number
    description: string
    amount: number
    discountRate?: number
    specialRequirement?: string
    addressResourceId?: number
  }
  type SeedOrder = {
    id: number
    orderNo: string
    customerId: number
    customerName: string
    submitterName: string
    status: BizOrder['status']
    submitOffset: number
    paymentMethod: BizOrder['paymentMethod']
    paymentTimeReq: string
    commissionRate: number
    depositAmount?: number
    discountRate?: number
    confirmMethod?: BizOrder['confirmMethod']
    expectedSignOffset?: number
    specialAgreement?: string
    approvalOpinion?: string
    financeOpinion?: string
    bossOpinion?: string
    remark?: string
    items: SeedItem[]
  }

  const itemOf = (orderId: number, orderNo: string, it: SeedItem, idx: number): BizOrderItem => {
    const discountRate = it.discountRate ?? 100
    return {
      id: orderId * 100 + idx + 1,
      itemNo: genItemNo(orderNo, idx),
      orderId,
      serviceType: it.serviceType,
      servicePeriod: it.servicePeriod,
      startDate: dateOnly(it.startOffset),
      endDate: dateOnly(it.endOffset),
      description: it.description,
      specialRequirement: it.specialRequirement || '',
      amount: it.amount,
      discountRate,
      finalAmount: Math.round(it.amount * discountRate / 100),
      itemStatus: it.startOffset <= 0 ? 'in_progress' : 'pending',
      addressResourceId: it.addressResourceId
    }
  }

  const orderOf = (cfg: SeedOrder): BizOrder => {
    const submitTime = todayStr(cfg.submitOffset)
    const itemFinal = cfg.items.reduce((sum, item) => sum + Math.round(item.amount * (item.discountRate ?? 100) / 100), 0)
    const finalAmount = Math.round(itemFinal * (cfg.discountRate ?? 100) / 100)
    const approvalLevel = calcApprovalLevel(finalAmount)
    const deadlineInfo = calcApprovalDeadline(submitTime)
    const completed = cfg.status === 'completed'
    const pending = ['pending_approval', 'pending_finance', 'pending_boss'].includes(cfg.status)
    const approvalPassed = completed || cfg.status === 'pending_finance' || cfg.status === 'pending_boss'
    const financePassed = completed || cfg.status === 'pending_boss'
    const bossPassed = completed && approvalLevel === 3
    return recalcOrder({
      id: cfg.id,
      orderNo: cfg.orderNo,
      customerId: cfg.customerId,
      customerName: cfg.customerName,
      submitterId: 1001 + cfg.id,
      submitterName: cfg.submitterName,
      submitTime,
      status: cfg.status,
      totalAmount: 0,
      discountRate: cfg.discountRate ?? 100,
      finalAmount: 0,
      depositAmount: cfg.depositAmount || 0,
      pendingAmount: 0,
      paymentMethod: cfg.paymentMethod,
      paymentTimeReq: cfg.paymentTimeReq,
      commissionRate: cfg.commissionRate,
      commissionAmount: 0,
      confirmMethod: cfg.confirmMethod || 'wechat',
      confirmScreenshot: completed ? `/mock/order_${cfg.id}_confirm.png` : '',
      expectedSignDate: dateOnly(cfg.expectedSignOffset ?? 3),
      specialAgreement: cfg.specialAgreement || '',
      approverId: approvalPassed ? 1002 : 0,
      approvalTime: approvalPassed ? todayStr(cfg.submitOffset + 1) : '',
      approvalOpinion: approvalPassed ? (cfg.approvalOpinion || '主管审批通过') : '',
      financeConfirmerId: financePassed ? 1003 : 0,
      financeConfirmTime: financePassed ? todayStr(cfg.submitOffset + 2) : '',
      financeOpinion: financePassed ? (cfg.financeOpinion || '财务确认到账') : '',
      bossApproverId: bossPassed ? 1004 : 0,
      bossApprovalTime: bossPassed ? todayStr(cfg.submitOffset + 3) : '',
      bossOpinion: bossPassed ? (cfg.bossOpinion || '老板终审通过') : '',
      approvalLevel,
      approvalDeadline: pending ? deadlineInfo.deadline : '',
      submitMoment: pending ? deadlineInfo.moment : '',
      rejectStage: cfg.status === 'rejected' ? 'manager' : '',
      rejectReasonType: cfg.status === 'rejected' ? '价格需重新确认' : '',
      rejectReason: cfg.status === 'rejected' ? (cfg.remark || '付款条件需补充后重新提交') : '',
      linkageLogs: [
        {
          time: submitTime,
          type: 'linkage',
          title: cfg.status === 'completed' ? '订单完成' : '提单进入流程',
          desc: cfg.status === 'completed'
            ? '订单已完成，可生成合同并派发服务任务'
            : `${approvalLevelLabel(approvalLevel)}已启动`
        }
      ],
      items: cfg.items.map((it, idx) => itemOf(cfg.id, cfg.orderNo, it, idx)),
      remark: cfg.remark || '',
      createTime: submitTime
    })
  }

  const seeds: SeedOrder[] = [
    {
      id: 101,
      orderNo: 'TD2026060101',
      customerId: 101,
      customerName: '杭州森禾科技有限公司',
      submitterName: '陈苗',
      status: 'completed',
      submitOffset: -5,
      paymentMethod: 'annual',
      paymentTimeReq: '合同签署后 3 个工作日内付清年度服务费',
      commissionRate: 8,
      depositAmount: 3000,
      items: [
        { serviceType: 'bookkeeping', servicePeriod: '1year', startOffset: 5, endOffset: 370, description: '代理记账年度服务（小规模）', amount: 16800 }
      ]
    },
    {
      id: 102,
      orderNo: 'TD2026060102',
      customerId: 102,
      customerName: '浙江云桥贸易有限公司',
      submitterName: '李建国',
      status: 'completed',
      submitOffset: -4,
      paymentMethod: 'lump_sum',
      paymentTimeReq: '材料提交前一次性付清',
      commissionRate: 10,
      depositAmount: 1000,
      items: [
        { serviceType: 'registration', servicePeriod: 'one_time', startOffset: 1, endOffset: 31, description: '公司设立登记、刻章、银行开户协助', amount: 6800 }
      ]
    },
    {
      id: 103,
      orderNo: 'TD2026060103',
      customerId: 103,
      customerName: '杭州叁木文化传媒有限公司',
      submitterName: '王晓敏',
      status: 'completed',
      submitOffset: -8,
      paymentMethod: 'installment',
      paymentTimeReq: '签署后付 50%，资质提交后付尾款',
      commissionRate: 9,
      depositAmount: 8000,
      items: [
        { serviceType: 'qualification', servicePeriod: '3month', startOffset: -3, endOffset: 120, description: '广播电视节目制作经营许可证代办', amount: 25800, specialRequirement: '需加急准备人员材料' }
      ]
    },
    {
      id: 104,
      orderNo: 'TD2026060104',
      customerId: 104,
      customerName: '湖州锦辰餐饮管理有限公司',
      submitterName: '陈思羽',
      status: 'completed',
      submitOffset: -70,
      paymentMethod: 'quarterly',
      paymentTimeReq: '每季度首月 10 日前支付',
      commissionRate: 7,
      depositAmount: 3000,
      items: [
        { serviceType: 'bookkeeping', servicePeriod: '1year', startOffset: -60, endOffset: 210, description: '餐饮行业代理记账与税务申报', amount: 12000 }
      ]
    },
    {
      id: 105,
      orderNo: 'TD2026060105',
      customerId: 105,
      customerName: '绍兴南麓服饰有限公司',
      submitterName: '周慧',
      status: 'completed',
      submitOffset: -350,
      paymentMethod: 'semi_annual',
      paymentTimeReq: '半年一付，续费前 15 日完成确认',
      commissionRate: 8,
      depositAmount: 18000,
      items: [
        { serviceType: 'bookkeeping', servicePeriod: '1year', startOffset: -340, endOffset: 12, description: '服饰贸易代理记账', amount: 18000 },
        { serviceType: 'tax_planning', servicePeriod: '1year', startOffset: -340, endOffset: 12, description: '季度税务筹划复盘', amount: 18000 }
      ]
    },
    {
      id: 106,
      orderNo: 'TD2026060106',
      customerId: 106,
      customerName: '嘉兴禾创智能装备有限公司',
      submitterName: '杨树',
      status: 'completed',
      submitOffset: -310,
      paymentMethod: 'installment',
      paymentTimeReq: '方案确认后 40%，落地后 60%',
      commissionRate: 12,
      depositAmount: 20000,
      items: [
        { serviceType: 'tax_planning', servicePeriod: '1year', startOffset: -300, endOffset: 42, description: '研发费用归集与税务筹划项目', amount: 58000 }
      ]
    },
    {
      id: 110,
      orderNo: 'TD2026060110',
      customerId: 110,
      customerName: '杭州启明电商有限公司',
      submitterName: '陈苗',
      status: 'pending_finance',
      submitOffset: -1,
      paymentMethod: 'monthly',
      paymentTimeReq: '每月 5 日前支付当月服务费',
      commissionRate: 8,
      depositAmount: 500,
      items: [
        { serviceType: 'bookkeeping', servicePeriod: '1year', startOffset: 3, endOffset: 368, description: '电商行业代理记账与税务申报', amount: 13200 }
      ]
    },
    {
      id: 111,
      orderNo: 'TD2026060111',
      customerId: 111,
      customerName: '宁波蔚蓝企业管理有限公司',
      submitterName: '李建国',
      status: 'draft',
      submitOffset: 0,
      paymentMethod: 'lump_sum',
      paymentTimeReq: '合同签署后一次性付清',
      commissionRate: 6,
      items: [
        { serviceType: 'audit', servicePeriod: 'one_time', startOffset: 7, endOffset: 37, description: '年度审计报告出具', amount: 9800 }
      ]
    }
  ]

  return seeds.map(orderOf)
}

function paginate<T>(list: T[], page = 1, pageSize = 10): { list: T[]; total: number } {
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

export function isOverdue(order: BizOrder): boolean {
  if (!order.approvalDeadline) return false
  if (order.status !== 'pending_approval' && order.status !== 'pending_finance' && order.status !== 'pending_boss') return false
  return Date.now() > new Date(order.approvalDeadline.replace(' ', 'T')).getTime()
}

// CRM 联动：提单提交后客户状态 → 签约中、保护期延长至 30 天
function triggerCustomerSigning(customerId: number, orderNo: string) {
  if (!customerId) return
  try {
    const KEY = 'biz_customer_list'
    const list: any[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    let customer = list.find(c => c.id === customerId)
    if (!customer) {
      customer = { id: customerId }
      list.push(customer)
    }
    customer.previousStage = customer.previousStage || customer.followStage || customer.stage || 'following'
    customer.followStage = 'signing'
    customer.dealStatus = 'signing'
    customer.protectDays = 30
    customer.protectExpireAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    customer.lastOrderNo = orderNo
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

// CRM 联动：驳回后客户状态退回原跟进阶段、重启 15 天回收规则
function triggerCustomerRejected(customerId: number, orderNo: string) {
  if (!customerId) return
  try {
    const KEY = 'biz_customer_list'
    const list: any[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    const customer = list.find(c => c.id === customerId)
    if (!customer) return
    customer.followStage = customer.previousStage || 'following'
    customer.dealStatus = 'following'
    customer.protectDays = 15
    customer.protectExpireAt = new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString()
    customer.lastRejectedOrder = orderNo
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

// 订单完成：镜像到 biz_order_list 供联动模块读取并调用 onOrderCompleted
function finalizeCompleted(order: BizOrder, generateContract = true) {
  try {
    const MIRROR = 'biz_order_list'
    const list: any[] = JSON.parse(localStorage.getItem(MIRROR) || '[]')
    const idx = list.findIndex(o => o.id === order.id)
    const mirror = {
      id: order.id,
      orderNo: order.orderNo,
      customerId: order.customerId,
      customerName: order.customerName,
      serviceType: order.items[0]?.serviceType || 'other',
      finalAmount: order.finalAmount,
      status: 'completed',
      completedAt: new Date().toISOString()
    }
    if (idx >= 0) list[idx] = mirror
    else list.push(mirror)
    localStorage.setItem(MIRROR, JSON.stringify(list))
  } catch { /* ignore */ }
  if (generateContract) {
    try {
      linkPaymentConfirmed({
        receiptId: order.id,
        orderId: order.id,
        isLast: true,
        amount: order.finalAmount
      })
    } catch { /* ignore */ }
  }
  try {
    linkOrderCompleted(order.id)
  } catch { /* ignore */ }
  // 追加联动日志事件
  try {
    const orders = loadOrders()
    const idx = orders.findIndex(o => o.id === order.id)
    if (idx >= 0) {
      const log: OrderLinkageLog = {
        time: todayStr(),
        type: 'linkage',
        title: generateContract ? '合同草稿生成・客户豁免回收' : '订单完成样例初始化',
        desc: generateContract
          ? '订单已完成，合同草稿已自动生成・客户标记为已成交・子项任务模板已推送'
          : '订单已完成，可在合同管理查看样例合同或手动生成新合同'
      }
      orders[idx] = {
        ...orders[idx],
        linkageLogs: [...(orders[idx].linkageLogs || []), log]
      }
      saveOrders(orders)
    }
  } catch { /* ignore */ }
}

function recalcOrder(o: BizOrder): BizOrder {
  const total = o.items.reduce((s, i) => s + (i.amount || 0), 0)
  const itemsFinal = o.items.reduce((s, i) => s + (i.finalAmount || 0), 0)
  // 整单折扣叠加在子项折后合计之上（保留原始设定）
  const orderRate = (o.discountRate ?? 100)
  const final = Math.round(itemsFinal * orderRate / 100)
  return {
    ...o,
    totalAmount: total,
    finalAmount: final,
    discountRate: orderRate,
    pendingAmount: final - (o.depositAmount || 0),
    commissionAmount: Math.round(final * (o.commissionRate || 0) / 100)
  }
}

export const orderApi = {
  ensureSamples(): Promise<BizOrder[]> {
    const list = loadOrders()
    if (list.length) return delay(list)
    const seed = buildSeedOrders()
    saveOrders(seed)
    seed
      .filter(order => order.status === 'completed')
      .forEach(order => {
        try { finalizeCompleted(order, false) } catch { /* ignore */ }
      })
    return delay(loadOrders())
  },

  list(params: OrderListParams = {}): Promise<OrderListResp> {
    let list = loadOrders()
    if (params.status) list = list.filter(o => o.status === params.status)
    if (params.keyword) {
      const k = params.keyword.trim()
      if (k) {
        list = list.filter(o =>
          o.orderNo.includes(k) ||
          (o.customerName || '').includes(k) ||
          (o.submitterName || '').includes(k)
        )
      }
    } else {
      if (params.customerName) list = list.filter(o => (o.customerName || '').includes(params.customerName!))
      if (params.submitterName) list = list.filter(o => (o.submitterName || '').includes(params.submitterName!))
      if (params.orderNo) list = list.filter(o => o.orderNo.includes(params.orderNo!))
    }
    if (params.startDate) list = list.filter(o => o.submitTime >= params.startDate!)
    if (params.endDate) list = list.filter(o => o.submitTime <= params.endDate! + ' 23:59:59')
    if (params.overdueOnly) list = list.filter(o => isOverdue(o))
    list = list.sort((a, b) => (b.submitTime || '').localeCompare(a.submitTime || ''))
    return delay(paginate(list, params.page, params.pageSize))
  },

  detail(id: number): Promise<BizOrder | null> {
    const list = loadOrders()
    return delay(list.find(o => o.id === id) || null)
  },

  create(data: Partial<BizOrder>): Promise<BizOrder> {
    const list = loadOrders()
    const id = (list.reduce((m, o) => Math.max(m, o.id), 0) || 0) + 1
    const orderNo = data.orderNo || genOrderNo()
    const items: BizOrderItem[] = (data.items || []).map((it, idx) => ({
      ...it,
      id: id * 100 + idx + 1,
      itemNo: genItemNo(orderNo, idx),
      orderId: id
    }) as BizOrderItem)
    const order: BizOrder = recalcOrder({
      id,
      orderNo,
      customerId: data.customerId || 0,
      customerName: data.customerName || '',
      submitterId: data.submitterId || 1001,
      submitterName: data.submitterName || '当前用户',
      submitTime: todayStr(),
      status: data.status || 'draft',
      totalAmount: 0,
      discountRate: 100,
      finalAmount: 0,
      depositAmount: data.depositAmount || 0,
      pendingAmount: 0,
      paymentMethod: data.paymentMethod || 'lump_sum',
      paymentTimeReq: data.paymentTimeReq || '',
      commissionRate: data.commissionRate || 0,
      commissionAmount: 0,
      confirmMethod: data.confirmMethod || 'wechat',
      confirmScreenshot: data.confirmScreenshot || '',
      expectedSignDate: data.expectedSignDate || '',
      specialAgreement: data.specialAgreement || '',
      approverId: 0,
      approvalTime: '',
      approvalOpinion: '',
      financeConfirmerId: 0,
      financeConfirmTime: '',
      financeOpinion: '',
      bossApproverId: 0,
      bossApprovalTime: '',
      bossOpinion: '',
      approvalLevel: 1,
      approvalDeadline: '',
      submitMoment: '',
      rejectStage: '',
      rejectReasonType: '',
      rejectReason: '',
      linkageLogs: [],
      items,
      remark: data.remark || '',
      createTime: todayStr()
    })
    list.push(order)
    saveOrders(list)
    return delay(order)
  },

  update(data: Partial<BizOrder> & { id: number }): Promise<BizOrder> {
    const list = loadOrders()
    const idx = list.findIndex(o => o.id === data.id)
    if (idx < 0) return Promise.reject(new Error('订单不存在'))
    const merged = { ...list[idx], ...data } as BizOrder
    if (Array.isArray(data.items)) {
      merged.items = data.items.map((it, i) => ({
        ...it,
        id: it.id || merged.id * 100 + i + 1,
        itemNo: it.itemNo || genItemNo(merged.orderNo, i),
        orderId: merged.id
      }) as BizOrderItem)
    }
    const next = recalcOrder(merged)
    list[idx] = next
    saveOrders(list)
    return delay(next)
  },

  submit(id: number): Promise<BizOrder> {
    const list = loadOrders()
    const idx = list.findIndex(o => o.id === id)
    if (idx < 0) return Promise.reject(new Error('订单不存在'))
    const cur = list[idx]
    if (cur.status !== 'draft' && cur.status !== 'rejected') {
      return Promise.reject(new Error('当前状态不可提交'))
    }
    const submitTime = todayStr()
    const level = calcApprovalLevel(cur.finalAmount)
    const { deadline, moment } = calcApprovalDeadline(submitTime)
    const log: OrderLinkageLog = {
      time: submitTime,
      type: 'linkage',
      title: '客户状态 → 签约中',
      desc: `提单提交触发：客户保护期延长至30天・${approvalLevelLabel(level)}流程已启动`
    }
    list[idx] = {
      ...cur,
      status: 'pending_approval',
      submitTime,
      approvalLevel: level,
      approvalDeadline: deadline,
      submitMoment: moment,
      rejectStage: '',
      rejectReasonType: '',
      rejectReason: '',
      linkageLogs: [...(cur.linkageLogs || []), log]
    }
    saveOrders(list)
    syncPrivateOrderStatus(list[idx])
    // CRM 联动：客户状态变为“签约中”且保护期延长至 30 天
    triggerCustomerSigning(list[idx].customerId, list[idx].orderNo)
    return delay(list[idx])
  },

  approve(payload: { id: number; approverId?: number; approverName?: string; opinion?: string }): Promise<BizOrder> {
    const list = loadOrders()
    const idx = list.findIndex(o => o.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('订单不存在'))
    const cur = list[idx]
    if (cur.status !== 'pending_approval') {
      return Promise.reject(new Error('订单未处于待审批状态'))
    }
    const time = todayStr()
    const opinion = payload.opinion || '主管审批通过'
    // 一级审批：主管通过即完成
    if (cur.approvalLevel === 1) {
      list[idx] = {
        ...cur,
        status: 'completed',
        approverId: payload.approverId || 1002,
        approvalTime: time,
        approvalOpinion: opinion
      }
      saveOrders(list)
      syncPrivateOrderStatus(list[idx])
      finalizeCompleted(list[idx])
      return delay(loadOrders().find(o => o.id === payload.id) as BizOrder)
    }
    list[idx] = {
      ...cur,
      status: 'pending_finance',
      approverId: payload.approverId || 1002,
      approvalTime: time,
      approvalOpinion: opinion
    }
    saveOrders(list)
    syncPrivateOrderStatus(list[idx])
    return delay(list[idx])
  },

  reject(payload: { id: number; approverId?: number; opinion: string; reasonType?: string; stage?: 'manager' | 'finance' | 'boss' }): Promise<BizOrder> {
    const list = loadOrders()
    const idx = list.findIndex(o => o.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('订单不存在'))
    const cur = list[idx]
    if (cur.status !== 'pending_approval' && cur.status !== 'pending_finance' && cur.status !== 'pending_boss') {
      return Promise.reject(new Error('当前状态不可驳回'))
    }
    const stage: 'manager' | 'finance' | 'boss' = payload.stage
      || (cur.status === 'pending_approval' ? 'manager' : cur.status === 'pending_finance' ? 'finance' : 'boss')
    const time = todayStr()
    const log: OrderLinkageLog = {
      time,
      type: 'linkage',
      title: '客户状态 ← 退回跟进',
      desc: `订单被${stage === 'manager' ? '主管' : stage === 'finance' ? '财务' : '老板'}驳回：客户退回原跟进阶段・15天回收规则重新生效`
    }
    list[idx] = {
      ...cur,
      status: 'rejected',
      approverId: stage === 'manager' ? (payload.approverId || 1002) : cur.approverId,
      approvalTime: stage === 'manager' ? time : cur.approvalTime,
      approvalOpinion: stage === 'manager' ? payload.opinion : cur.approvalOpinion,
      financeOpinion: stage === 'finance' ? payload.opinion : cur.financeOpinion,
      financeConfirmTime: stage === 'finance' ? time : cur.financeConfirmTime,
      bossOpinion: stage === 'boss' ? payload.opinion : cur.bossOpinion,
      bossApprovalTime: stage === 'boss' ? time : cur.bossApprovalTime,
      rejectStage: stage,
      rejectReasonType: payload.reasonType || '',
      rejectReason: payload.opinion,
      linkageLogs: [...(cur.linkageLogs || []), log]
    }
    saveOrders(list)
    syncPrivateOrderStatus(list[idx])
    triggerCustomerRejected(cur.customerId, cur.orderNo)
    return delay(list[idx])
  },

  financeConfirm(payload: { id: number; financeConfirmerId?: number; opinion?: string }): Promise<BizOrder> {
    const list = loadOrders()
    const idx = list.findIndex(o => o.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('订单不存在'))
    const cur = list[idx]
    if (cur.status !== 'pending_finance') {
      return Promise.reject(new Error('订单未处于待财务确认状态'))
    }
    const time = todayStr()
    const opinion = payload.opinion || '财务已确认'
    if (cur.approvalLevel >= 3) {
      list[idx] = {
        ...cur,
        status: 'pending_boss',
        financeConfirmerId: payload.financeConfirmerId || 1003,
        financeConfirmTime: time,
        financeOpinion: opinion
      }
      saveOrders(list)
      syncPrivateOrderStatus(list[idx])
      return delay(list[idx])
    }
    list[idx] = {
      ...cur,
      status: 'completed',
      financeConfirmerId: payload.financeConfirmerId || 1003,
      financeConfirmTime: time,
      financeOpinion: opinion
    }
    saveOrders(list)
    syncPrivateOrderStatus(list[idx])
    finalizeCompleted(list[idx])
    return delay(loadOrders().find(o => o.id === payload.id) as BizOrder)
  },

  bossApprove(payload: { id: number; bossApproverId?: number; opinion?: string }): Promise<BizOrder> {
    const list = loadOrders()
    const idx = list.findIndex(o => o.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('订单不存在'))
    const cur = list[idx]
    if (cur.status !== 'pending_boss') {
      return Promise.reject(new Error('订单未处于待老板终审状态'))
    }
    list[idx] = {
      ...cur,
      status: 'completed',
      bossApproverId: payload.bossApproverId || 1004,
      bossApprovalTime: todayStr(),
      bossOpinion: payload.opinion || '老板终审通过'
    }
    saveOrders(list)
    syncPrivateOrderStatus(list[idx])
    finalizeCompleted(list[idx])
    return delay(loadOrders().find(o => o.id === payload.id) as BizOrder)
  },

  cancel(id: number, reason?: string): Promise<BizOrder> {
    const list = loadOrders()
    const idx = list.findIndex(o => o.id === id)
    if (idx < 0) return Promise.reject(new Error('订单不存在'))
    if (list[idx].status === 'completed' || list[idx].status === 'cancelled') {
      return Promise.reject(new Error('当前状态不可取消'))
    }
    list[idx] = {
      ...list[idx],
      status: 'cancelled',
      remark: reason ? `${list[idx].remark || ''}【取消原因】${reason}` : list[idx].remark
    }
    saveOrders(list)
    syncPrivateOrderStatus(list[idx])
    return delay(list[idx])
  },

  stats(): Promise<OrderStats> {
    const list = loadOrders()
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const stats: OrderStats = {
      totalCount: list.length,
      draftCount: list.filter(o => o.status === 'draft').length,
      pendingApprovalCount: list.filter(o => o.status === 'pending_approval').length,
      pendingFinanceCount: list.filter(o => o.status === 'pending_finance').length,
      pendingBossCount: list.filter(o => o.status === 'pending_boss').length,
      rejectedCount: list.filter(o => o.status === 'rejected').length,
      completedCount: list.filter(o => o.status === 'completed').length,
      cancelledCount: list.filter(o => o.status === 'cancelled').length,
      overdueCount: list.filter(o => isOverdue(o)).length,
      totalAmount: list.reduce((s, o) => s + o.totalAmount, 0),
      finalAmount: list.reduce((s, o) => s + o.finalAmount, 0),
      monthAmount: list
        .filter(o => new Date(o.submitTime.replace(' ', 'T')).getTime() >= monthStart.getTime())
        .reduce((s, o) => s + o.finalAmount, 0)
    }
    return delay(stats)
  }
}
