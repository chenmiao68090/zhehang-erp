// ===== 提单/订单 API（真实后端：modules/order 下 /order/*） =====
// 说明：
// 1. request.ts 的响应拦截器在 code===200 时 resolve 的是 R 信封的 data 载荷本身，
//    这里统一用 unwrap() 兜底（兼容拦截器已直接返回载荷的情况）。
// 2. 分页接口返回 MyBatis-Plus IPage {records,total,...}，api 层适配成视图期望的 {list,total}。
// 3. 后端状态用整数枚举（status 1草稿 2待审批 3主管已批 4财务已确认 5已完成 6已取消 7已驳回），
//    本文件做整数 <-> 前端字符串状态（draft/pending_approval/pending_finance/completed/...）双向映射。
//    后端只有“主管审批 + 财务确认”两级，没有“老板终审”这一节点。
// 4. 字段映射以后端 Entity 真实字段（BizOrder/BizOrderItem，camelCase）为准。
//    后端无 discountRate(整单折扣%)/depositAmount(定金)/commissionRate(提成)/confirmMethod 等表单细项，
//    用 BizOrder 已有字段（totalAmount/discountAmount/payableAmount/remark/attachments(JSON)）承载或落到备注/附件 JSON。
// 5. 导出的函数名、helper（calcApprovalLevel/approvalLevelLabel/approvalLevelChain/isOverdue）、
//    类型（BizOrder/BizOrderItem/OrderStats）与返回形状【保持与原 mock 版一致】，让 bill.vue 零改动。
// 6. 业务联动（签约→派交付任务、收款确认→合同处理、提成等）后端已自动编排，
//    本文件移除对 @/utils/biz-linkage 与 localStorage 的依赖。

import { get, post, put } from './request'

// ---------- 视图层类型（保持原 mock 形状，视图零改动） ----------

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

// 金额阈值 → 审批级别（前端展示口径与后端真实节点一致：最多主管+财务两级）
export function calcApprovalLevel(finalAmount: number): 1 | 2 | 3 {
  if (finalAmount > 200) return 2
  return 1
}

export function approvalLevelLabel(level: 1 | 2 | 3): string {
  return level <= 1 ? '一级审批' : '二级审批'
}

export function approvalLevelChain(level: 1 | 2 | 3): string[] {
  if (level === 1) return ['主管审批']
  return ['主管审批', '财务确认']
}

// 根据提交时间计算审批截止时刻（纯前端展示口径，后端无截止时间字段）
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

// ---------- 通用小工具 ----------

/** 拦截器 resolve 的是 R 信封 data 载荷，这里兜底取 data（兼容已直接返回载荷的情况） */
function unwrap<T = any>(res: any): T {
  if (res && typeof res === 'object' && 'code' in res && 'data' in res) return res.data as T
  return res as T
}

/** IPage -> {list,total} */
function toPage<T>(data: any): { list: T[]; total: number } {
  const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data?.list) ? data.list : [])
  return { list, total: Number(data?.total || list.length || 0) }
}

const num = (v: any): number => (v === null || v === undefined || v === '' ? 0 : Number(v) || 0)
const fmtDateTime = (v: any): string => (v ? String(v).replace('T', ' ').slice(0, 19) : '')
const fmtDate = (v: any): string => (v ? String(v).slice(0, 10) : '')

// ---------- 状态枚举映射 ----------
// 后端整数 status → 前端字符串状态。
// 注意：后端 4(财务已确认) 与 5(已完成) 都视为前端 completed（财务确认即闭环完成）。
const BACKEND_STATUS_TO_VIEW: Record<number, BizOrder['status']> = {
  1: 'draft',
  2: 'pending_approval',
  3: 'pending_finance',
  4: 'completed',
  5: 'completed',
  6: 'cancelled',
  7: 'rejected'
}

/** 前端状态筛选值 → 后端整数 status（用于列表筛选下传） */
function viewStatusToBackend(status?: string): number | undefined {
  switch (status) {
    case 'draft': return 1
    case 'pending_approval': return 2
    case 'pending_finance': return 3
    case 'completed': return 4 // 后端 completed 主要落在 4；5 的历史数据在列表上同样显示为已完成
    case 'cancelled': return 6
    case 'rejected': return 7
    // pending_boss 为旧前端状态，后端无对应节点，不下传。
    default: return undefined
  }
}

// ---------- 服务类型/周期 与 后端 itemType / serviceMonths 互转 ----------

const PERIOD_TO_MONTHS: Record<string, number> = {
  '1month': 1, '3month': 3, '6month': 6, '1year': 12, '2year': 24, '3year': 36, one_time: 0
}
function monthsToPeriod(m: number): BizOrderItem['servicePeriod'] {
  switch (Number(m)) {
    case 1: return '1month'
    case 3: return '3month'
    case 6: return '6month'
    case 12: return '1year'
    case 24: return '2year'
    case 36: return '3year'
    default: return 'one_time'
  }
}

const SERVICE_TYPES: BizOrderItem['serviceType'][] = ['bookkeeping', 'registration', 'tax_planning', 'qualification', 'audit', 'cancellation', 'other']
function normServiceType(v: any): BizOrderItem['serviceType'] {
  return SERVICE_TYPES.includes(v) ? v : 'other'
}

// ---------- 表单细项寄存在 attachments(JSON) ----------
// 后端 BizOrder 没有 discountRate(整单折扣%)/depositAmount/commissionRate/confirmMethod/
// confirmScreenshot/expectedSignDate/specialAgreement/submitterName 等字段，
// 这些纯前端表单项序列化到 attachments(JSON 字符串) 内，做无损往返，避免新增后端字段。
interface OrderMeta {
  discountRate?: number
  depositAmount?: number
  commissionRate?: number
  paymentMethod?: BizOrder['paymentMethod']
  paymentTimeReq?: string
  confirmMethod?: BizOrder['confirmMethod']
  confirmScreenshot?: string
  expectedSignDate?: string
  specialAgreement?: string
  submitterName?: string
}

function parseMeta(attachments?: string): OrderMeta {
  if (!attachments) return {}
  try {
    const v = JSON.parse(attachments)
    return (v && typeof v === 'object' && !Array.isArray(v)) ? v as OrderMeta : {}
  } catch {
    return {}
  }
}

// ---------- 后端实体 -> 视图形状 ----------

function adaptItem(it: any, idx: number, orderNo: string): BizOrderItem {
  const amount = num(it.unitPrice) * (Number(it.quantity) || 1)
  const discountRate = it.discountRate === null || it.discountRate === undefined ? 100 : num(it.discountRate)
  const finalAmount = it.subtotal !== null && it.subtotal !== undefined
    ? num(it.subtotal)
    : Math.round(amount * discountRate / 100)
  return {
    id: Number(it.id || 0),
    itemNo: it.itemCode || `${orderNo}-${String(idx + 1).padStart(3, '0')}`,
    orderId: Number(it.orderId || 0),
    serviceType: normServiceType(it.itemType),
    servicePeriod: monthsToPeriod(num(it.serviceMonths)),
    startDate: '',
    endDate: '',
    description: it.description || it.itemName || '',
    specialRequirement: '',
    amount,
    discountRate,
    finalAmount,
    itemStatus: 'pending'
  }
}

function adaptOrder(o: any, items: any[] = [], approvals: any[] = []): BizOrder {
  const meta = parseMeta(o.attachments)
  const statusInt = Number(o.status || 1)
  const status = BACKEND_STATUS_TO_VIEW[statusInt] || 'draft'
  const orderNo = o.orderNo || ''
  const viewItems = (items || []).map((it, idx) => adaptItem(it, idx, orderNo))

  const totalAmount = o.totalAmount !== null && o.totalAmount !== undefined
    ? num(o.totalAmount)
    : viewItems.reduce((s, i) => s + i.amount, 0)
  const finalAmount = o.payableAmount !== null && o.payableAmount !== undefined
    ? num(o.payableAmount)
    : viewItems.reduce((s, i) => s + i.finalAmount, 0)
  const discountRate = meta.discountRate ?? (totalAmount > 0 ? Math.round(finalAmount / totalAmount * 100) : 100)
  const depositAmount = meta.depositAmount ?? 0
  const commissionRate = meta.commissionRate ?? 0

  const submitTime = fmtDateTime(o.submitTime) || fmtDateTime(o.createTime)
  const approvalLevel = calcApprovalLevel(finalAmount)
  const deadlineInfo = submitTime ? calcApprovalDeadline(submitTime) : { deadline: '', moment: '' as const }
  const pending = status === 'pending_approval' || status === 'pending_finance'

  // 从审批记录回填各节点意见/时间（后端 approverName 多为空，仅展示角色与意见）
  const approveAp = approvals.find(a => a.node === 'approve')
  const financeAp = approvals.find(a => a.node === 'finance_confirm')
  const rejectAp = approvals.find(a => a.node === 'reject')
  const cancelAp = approvals.find(a => a.node === 'cancel')

  const linkageLogs: OrderLinkageLog[] = (approvals || [])
    .filter(a => a.node !== 'submit')
    .map(a => ({
      time: fmtDateTime(a.approveTime) || fmtDateTime(a.createTime),
      type: 'approval' as const,
      title: ({
        approve: '主管审批',
        finance_confirm: '财务确认',
        reject: '审批驳回',
        cancel: '订单取消'
      } as Record<string, string>)[a.node] || a.node,
      desc: [a.approverRole, a.comment].filter(Boolean).join(' · ') || '—'
    }))

  return {
    id: Number(o.id || 0),
    orderNo,
    customerId: Number(o.customerId || 0),
    customerName: o.customerName || '',
    submitterId: Number(o.salesmanId || 0),
    submitterName: o.salesmanName || meta.submitterName || '',
    submitTime,
    status,
    totalAmount,
    discountRate,
    finalAmount,
    depositAmount,
    pendingAmount: Math.max(0, finalAmount - depositAmount),
    paymentMethod: meta.paymentMethod || 'lump_sum',
    paymentTimeReq: meta.paymentTimeReq || '',
    commissionRate,
    commissionAmount: Math.round(finalAmount * commissionRate / 100),
    confirmMethod: meta.confirmMethod || 'wechat',
    confirmScreenshot: meta.confirmScreenshot || '',
    expectedSignDate: meta.expectedSignDate || fmtDate(o.serviceStartDate),
    specialAgreement: meta.specialAgreement || '',
    approverId: Number(approveAp?.approverId || 0),
    approvalTime: fmtDateTime(o.approveTime) || fmtDateTime(approveAp?.approveTime),
    approvalOpinion: approveAp?.comment || (rejectAp?.comment && statusInt === 7 ? rejectAp.comment : ''),
    financeConfirmerId: Number(financeAp?.approverId || 0),
    financeConfirmTime: fmtDateTime(o.financeConfirmTime) || fmtDateTime(financeAp?.approveTime),
    financeOpinion: financeAp?.comment || '',
    bossApproverId: 0, // 兼容旧视图字段：后端无老板终审节点
    bossApprovalTime: '',
    bossOpinion: '',
    approvalLevel,
    approvalDeadline: pending ? deadlineInfo.deadline : '',
    submitMoment: pending ? deadlineInfo.moment : '',
    rejectStage: statusInt === 7 ? (financeAp ? 'finance' : 'manager') : '',
    rejectReasonType: '',
    rejectReason: statusInt === 7 ? (rejectAp?.comment || '') : '',
    linkageLogs,
    items: viewItems,
    remark: statusInt === 6 ? (o.cancelReason ? `${o.remark || ''}【取消原因】${o.cancelReason}` : (o.remark || '')) : (o.remark || ''),
    createTime: fmtDateTime(o.createTime)
  }
}

// ---------- 视图表单 -> 后端实体白名单 ----------

function toBackendItems(items: BizOrderItem[] = []): any[] {
  return items.map((it, idx) => ({
    itemCode: it.itemNo || undefined,
    itemName: it.description || '',
    itemType: it.serviceType,
    unitPrice: it.amount || 0,
    quantity: 1,
    discountRate: it.discountRate ?? 100,
    subtotal: it.finalAmount ?? Math.round((it.amount || 0) * (it.discountRate ?? 100) / 100),
    serviceMonths: PERIOD_TO_MONTHS[it.servicePeriod] ?? 0,
    description: it.description || '',
    sortOrder: idx
  }))
}

/** 视图表单 -> 后端 body（含 items 与寄存 attachments 的 meta） */
function toBackendBody(data: Partial<BizOrder>): Record<string, any> {
  const items = Array.isArray(data.items) ? data.items : []
  const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0)
  const itemsFinal = items.reduce((s, i) => s + (i.finalAmount || 0), 0)
  const orderRate = data.discountRate ?? 100
  const finalAmount = Math.round(itemsFinal * orderRate / 100)

  const meta: OrderMeta = {
    discountRate: data.discountRate,
    depositAmount: data.depositAmount,
    commissionRate: data.commissionRate,
    paymentMethod: data.paymentMethod,
    paymentTimeReq: data.paymentTimeReq,
    confirmMethod: data.confirmMethod,
    confirmScreenshot: data.confirmScreenshot,
    expectedSignDate: data.expectedSignDate,
    specialAgreement: data.specialAgreement,
    submitterName: data.submitterName
  }

  const body: Record<string, any> = {
    customerId: data.customerId,
    customerName: data.customerName,
    salesmanName: data.submitterName,
    orderType: 'new',
    serviceType: items[0]?.serviceType || 'other',
    totalAmount,
    discountAmount: Math.max(0, totalAmount - finalAmount),
    payableAmount: finalAmount,
    remark: data.remark || '',
    attachments: JSON.stringify(meta),
    items: toBackendItems(items)
  }
  if (data.expectedSignDate) body.serviceStartDate = data.expectedSignDate
  return body
}

// ---------- API ----------

export const orderApi = {
  /**
   * GET /order/list
   * 后端支持 status(整数)/customerId/orderNo 过滤；
   * keyword(客户/编号/提单人) 与 客户名/提单人/日期范围/overdueOnly 由本地在当前页结果上过滤（后端无该维度）。
   */
  async list(params: OrderListParams = {}): Promise<OrderListResp> {
    const res = await get('/order/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      status: viewStatusToBackend(params.status),
      orderNo: params.orderNo || (params.keyword && /^[A-Za-z]/.test(params.keyword.trim()) ? params.keyword.trim() : undefined)
    })
    const page = toPage<any>(unwrap(res))
    let list = page.list.map(o => adaptOrder(o))
    let total = page.total

    // pending_boss 是旧前端状态，后端无对应节点：直接返回空集
    if (params.status === 'pending_boss') {
      return { list: [], total: 0 }
    }

    const k = (params.keyword || '').trim()
    if (k && !/^[A-Za-z]/.test(k)) {
      list = list.filter(o =>
        o.orderNo.includes(k) ||
        (o.customerName || '').includes(k) ||
        (o.submitterName || '').includes(k)
      )
    }
    if (params.customerName) list = list.filter(o => (o.customerName || '').includes(params.customerName!))
    if (params.submitterName) list = list.filter(o => (o.submitterName || '').includes(params.submitterName!))
    if (params.startDate) list = list.filter(o => o.submitTime >= params.startDate!)
    if (params.endDate) list = list.filter(o => o.submitTime <= params.endDate! + ' 23:59:59')
    if (params.overdueOnly) list = list.filter(o => isOverdue(o))

    if (list.length !== page.list.length) total = list.length
    return { list, total }
  },

  /** GET /order/{id}（后端返回 {order,items,approvals}，合并成单一视图对象） */
  async detail(id: number): Promise<BizOrder | null> {
    const data = unwrap<any>(await get(`/order/${id}`))
    if (!data || !data.order) return null
    return adaptOrder(data.order, data.items || [], data.approvals || [])
  },

  /** POST /order（返回新建 id，再拉详情回视图形状） */
  async create(data: Partial<BizOrder>): Promise<BizOrder> {
    const id = unwrap<number>(await post('/order', toBackendBody(data)))
    const created = await this.detail(Number(id))
    return created || ({ ...data, id: Number(id), status: 'draft' } as BizOrder)
  },

  /** PUT /order/{id}（后端状态 >=4 不可改） */
  async update(data: Partial<BizOrder> & { id: number }): Promise<BizOrder> {
    await put(`/order/${data.id}`, toBackendBody(data))
    const updated = await this.detail(data.id)
    return updated || ({ ...data } as BizOrder)
  },

  /** POST /order/{id}/submit（草稿/驳回 → 待审批；后端记审批流水） */
  async submit(id: number): Promise<BizOrder> {
    await post(`/order/${id}/submit`, {})
    const o = await this.detail(id)
    return o as BizOrder
  },

  /** POST /order/{id}/approve（主管审批通过 → 状态 3 待财务确认） */
  async approve(payload: { id: number; approverId?: number; approverName?: string; opinion?: string }): Promise<BizOrder> {
    await post(`/order/${payload.id}/approve`, {
      approverId: payload.approverId || undefined,
      comment: payload.opinion || undefined
    })
    const o = await this.detail(payload.id)
    return o as BizOrder
  },

  /**
   * POST /order/{id}/reject（驳回 → 状态 7）
   * 后端只接收 {approverId,comment}；reasonType/stage 不持久化（合入 comment 文案）。
   */
  async reject(payload: { id: number; approverId?: number; opinion: string; reasonType?: string; stage?: 'manager' | 'finance' | 'boss' }): Promise<BizOrder> {
    await post(`/order/${payload.id}/reject`, {
      approverId: payload.approverId || undefined,
      comment: payload.opinion || undefined
    })
    const o = await this.detail(payload.id)
    return o as BizOrder
  },

  /**
   * POST /order/{id}/finance-confirm（财务确认 → 状态 4，前端视为 completed）
   * 后端财务确认即闭环：合同处理/提成等由后端自动编排，无需前端触发。
   */
  async financeConfirm(payload: { id: number; financeConfirmerId?: number; opinion?: string }): Promise<BizOrder> {
    await post(`/order/${payload.id}/finance-confirm`, {
      approverId: payload.financeConfirmerId || undefined,
      comment: payload.opinion || undefined
    })
    const o = await this.detail(payload.id)
    return o as BizOrder
  },

  /** 兼容旧调用：老板终审节点已取消，财务确认即闭环。 */
  async bossApprove(payload: { id: number; bossApproverId?: number; opinion?: string }): Promise<BizOrder> {
    const o = await this.detail(payload.id)
    if (o && o.status === 'pending_finance') {
      return this.financeConfirm({ id: payload.id, financeConfirmerId: payload.bossApproverId, opinion: payload.opinion })
    }
    return (o || ({ id: payload.id } as BizOrder))
  },

  /** POST /order/{id}/cancel（→ 状态 6） */
  async cancel(id: number, reason?: string): Promise<BizOrder> {
    await post(`/order/${id}/cancel`, { reason: reason || undefined })
    const o = await this.detail(id)
    return o as BizOrder
  },

  /**
   * GET /order/stats（后端返回各状态计数 status_1..7 与 total）。
   * 金额类（totalAmount/finalAmount/monthAmount）与 overdueCount 后端不提供，
   * 这里拉一页较大列表在前端聚合（保持原 mock 的 OrderStats 形状）。
   */
  async stats(): Promise<OrderStats> {
    const [statRes, listRes] = await Promise.all([
      get('/order/stats'),
      get('/order/list', { pageNum: 1, pageSize: 1000 })
    ])
    const s = unwrap<Record<string, any>>(statRes) || {}
    const page = toPage<any>(unwrap(listRes))
    const orders = page.list.map(o => adaptOrder(o))

    const cnt = (key: string) => Number(s[key] || 0)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    return {
      totalCount: Number(s.total || page.total || orders.length),
      draftCount: cnt('status_1'),
      pendingApprovalCount: cnt('status_2'),
      pendingFinanceCount: cnt('status_3'),
      pendingBossCount: 0, // 兼容旧统计字段：后端无老板终审节点
      rejectedCount: cnt('status_7'),
      completedCount: cnt('status_4') + cnt('status_5'),
      cancelledCount: cnt('status_6'),
      overdueCount: orders.filter(o => isOverdue(o)).length,
      totalAmount: orders.reduce((acc, o) => acc + o.totalAmount, 0),
      finalAmount: orders.reduce((acc, o) => acc + o.finalAmount, 0),
      monthAmount: orders
        .filter(o => o.submitTime && new Date(o.submitTime.replace(' ', 'T')).getTime() >= monthStart.getTime())
        .reduce((acc, o) => acc + o.finalAmount, 0)
    }
  }
}

/** 审批超期判断（纯前端展示口径：待审批/待财务且已过 calcApprovalDeadline 计算的截止时刻） */
export function isOverdue(order: BizOrder): boolean {
  if (!order.approvalDeadline) return false
  if (order.status !== 'pending_approval' && order.status !== 'pending_finance') return false
  return Date.now() > new Date(order.approvalDeadline.replace(' ', 'T')).getTime()
}
