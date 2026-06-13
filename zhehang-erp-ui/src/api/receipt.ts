// ===== 回款/财务核对 API（真实后端：modules/receipt 下 /receipt/list /confirm /plans /overdue /invoices /invoice /summary /refund） =====
// 说明：
// 1. request.ts 的响应拦截器在 code===200 时 resolve 的是 R 信封 {code,message,data}，这里统一用 unwrap() 取 data 载荷。
// 2. 分页接口返回 MyBatis-Plus IPage {records,total,...}，api 层适配成视图期望的 {list,total}。
// 3. 后端 Jackson 开启 FAIL_ON_UNKNOWN_PROPERTIES，所以写入请求体按后端 Entity 字段白名单构造。
// 4. 导出的函数名与返回形状保持与原 mock 版完全一致，视图零改动（或极小改动）。
// 5. 状态/字段映射以后端 Entity 真实字段为准（camelCase），状态枚举语义以后端 Service 为准：
//    - BizReceipt.status      1待确认 2已确认 3已退款（无 rejected；驳回退化为不改库的前端提示，见 confirm()）
//    - BizReceiptPlan.status  1未收 2部分收款 3已收齐 4逾期；字段 period(期数) planAmount paidAmount planDate paidDate
//    - BizInvoice.status      1待开 2已开 3已邮寄 4已签收 5红冲；字段 title/invoiceType(general/special)/taxAmount/totalAmount/invoiceDate/trackingNo
//    - paymentMethod(收款方式) receiveTime(到账时间) voucher(凭证) —— 对应视图的 paymentChannel/paymentTime/voucherUrl
// 6. 已移除 localStorage 与 @/utils/biz-linkage：
//    - 收款确认→自动生成合同草稿 已由后端 confirm() 编排（BizReceiptServiceImpl.confirm 内 generateFromOrder），前端不再调 onPaymentConfirmed。
//    - 退款完成→合同终止/任务取消/提成扣回 后端 refund() 仅置收款为已退款，未做下游编排（gapsNoBackend）；视图已移除 onRefundCompleted 调用。
// 7. gapsNoBackend（后端无对应能力，本文件做最小化/前端态降级，见文末 receiptApi 注释）：
//    - 退款审批流（申请→主管审批→财务确认）后端无 RefundRequest 表与审批接口，仅有 /receipt/refund 一步置「已退款」；
//      本文件用模块内存（非 localStorage）维护退款单的中间态，财务确认时落地真实 /receipt/refund。
//    - 财务联动时间线 后端无接口，用模块内存维护，刷新页面即清空。
//    - 收款无 receiptType/orderNo/confirmerName 字段、计划无 orderNo/customerName/installmentTotal/pendingAmount/reminderCount 字段，按可得数据回退。
//    - getSummary 后端 /summary 仅返回当月 {count,totalAmount}，其余指标（待确认/逾期/发票/退款）由本文件聚合多接口在前端算出。

import { get, post, put } from './request'

// ---------- 视图层类型（保持原 mock 形状，视图零改动） ----------

export interface BizReceipt {
  id: number
  receiptNo: string
  orderId: number
  orderNo?: string
  customerId: number
  customerName?: string
  amount: number
  paymentChannel: 'wechat' | 'alipay' | 'bank' | 'cash' | 'pos' | 'other'
  paymentTime: string
  receiptType: 'deposit' | 'final' | 'installment' | 'full'
  voucherUrl: string
  confirmerId: number
  confirmerName?: string
  confirmTime: string
  status: 'pending' | 'confirmed' | 'rejected' | 'refunded'
  remark: string
  createTime: string
}

export interface BizReceiptPlan {
  id: number
  planNo: string
  orderId: number
  orderNo?: string
  customerId: number
  customerName?: string
  totalAmount: number
  installmentNo: number
  installmentTotal: number
  planAmount: number
  paidAmount: number
  pendingAmount: number
  planDate: string
  paidDate: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  reminderCount: number
  lastReminderTime: string
  remark: string
  /** 逾期阶梯：none/normal/level1(7+)/level2(15+)/level3(30+)/level4(60+) */
  overdueLevel?: OverdueLevelKey
  overdueAction?: string
}

export type OverdueLevelKey = 'none' | 'today' | 'level1' | 'level2' | 'level3' | 'level4'

export interface OverdueLevelInfo {
  key: OverdueLevelKey
  days: number
  label: string
  action: string
  notify: string
  cls: string
}

export interface BizInvoice {
  id: number
  invoiceNo: string
  orderId: number
  orderNo?: string
  customerId: number
  customerName?: string
  invoiceTitle: string
  taxNo: string
  invoiceType: 'vat_special' | 'vat_general' | 'electronic'
  amount: number
  taxRate: number
  taxAmount: number
  status: 'pending' | 'issued' | 'mailed' | 'received' | 'cancelled'
  issueTime: string
  mailNo: string
  remark: string
  createTime: string
}

export type RefundReasonKey = 'service_unsatisfied' | 'customer_regret' | 'service_unavailable' | 'agreement_terminated' | 'other'
export type RefundWayKey = 'origin' | 'bank_transfer' | 'other'
export type RefundStatusKey = 'pending' | 'approved' | 'finance_confirmed' | 'completed' | 'rejected'

export interface RefundRequest {
  id: number
  refundNo: string
  receiptId: number
  orderId: number
  orderNo?: string
  customerName?: string
  refundAmount: number
  reasonKey?: RefundReasonKey
  reason: string
  refundWay?: RefundWayKey
  applyTime: string
  applicantId: number
  applicantName?: string
  approverId: number
  approverName?: string
  approvalTime: string
  financeConfirmerId?: number
  financeConfirmerName?: string
  financeConfirmTime?: string
  rejectReason?: string
  status: RefundStatusKey
  remark: string
}

export interface ReceiptTimelineEvent {
  id: number
  receiptId?: number
  orderId?: number
  type: 'receipt_confirmed' | 'order_completed' | 'contract_generated' | 'refund_applied' | 'refund_approved' | 'refund_finance_confirmed' | 'refund_completed' | 'refund_rejected' | 'overdue_escalation'
  title: string
  detail: string
  time: string
  operator: string
}

export interface ReceiptSummary {
  totalReceipt: number
  pendingReceipt: number
  monthReceipt: number
  overdueAmount: number
  overdueCount: number
  invoicePending: number
  invoiceIssued: number
  refundPending: number
}

// ---------- 通用小工具 ----------

/** 拦截器 resolve 的是 R 信封，这里取 data 载荷（兼容未来拦截器直接返回载荷的情况） */
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

/** LocalDateTime/ISO -> 'YYYY-MM-DD HH:mm:ss' */
function fmtDateTime(v: any): string {
  if (!v) return ''
  const s = String(v).replace('T', ' ')
  return s.slice(0, 19)
}
/** LocalDate/ISO -> 'YYYY-MM-DD' */
function fmtDate(v: any): string {
  if (!v) return ''
  return String(v).slice(0, 10)
}
const ts = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ')

// ---------- 状态枚举映射（后端数字码 <-> 视图字符串） ----------

const RECEIPT_STATUS_NUM: Record<string, number> = { pending: 1, confirmed: 2, refunded: 3 }
function receiptStatusStr(n: any): BizReceipt['status'] {
  return ({ 1: 'pending', 2: 'confirmed', 3: 'refunded' } as Record<number, BizReceipt['status']>)[Number(n)] || 'pending'
}

function planStatusStr(n: any): BizReceiptPlan['status'] {
  // 1未收 2部分收款 3已收齐 4逾期
  return ({ 1: 'pending', 2: 'partial', 3: 'paid', 4: 'overdue' } as Record<number, BizReceiptPlan['status']>)[Number(n)] || 'pending'
}

function invoiceStatusStr(n: any): BizInvoice['status'] {
  // 1待开 2已开 3已邮寄 4已签收 5红冲
  return ({ 1: 'pending', 2: 'issued', 3: 'mailed', 4: 'received', 5: 'cancelled' } as Record<number, BizInvoice['status']>)[Number(n)] || 'pending'
}
const INVOICE_STATUS_NUM: Record<string, number> = { pending: 1, issued: 2, mailed: 3, received: 4, cancelled: 5 }

// 后端发票仅 general/special 两类；视图三类（含 electronic）做近似映射
function invoiceTypeStr(t: any): BizInvoice['invoiceType'] {
  return t === 'special' ? 'vat_special' : 'vat_general'
}
function invoiceTypeBackend(t: BizInvoice['invoiceType']): string {
  return t === 'vat_special' ? 'special' : 'general'
}

// ---------- 收款：后端实体 BizReceipt <-> 视图形状 ----------

type Raw = Record<string, any>

function adaptReceipt(r: Raw): BizReceipt {
  const amount = num(r.amount)
  return {
    id: Number(r.id),
    receiptNo: r.receiptNo || '',
    orderId: Number(r.orderId || 0),
    orderNo: r.orderId ? String(r.orderId) : '', // 后端收款无 orderNo，回退订单ID（见 gapsNoBackend）
    customerId: Number(r.customerId || 0),
    customerName: r.customerName || '',
    amount,
    paymentChannel: (r.paymentMethod || 'bank') as BizReceipt['paymentChannel'],
    paymentTime: fmtDateTime(r.receiveTime),
    receiptType: 'full', // 后端无 receiptType 字段，默认全款（见 gapsNoBackend）
    voucherUrl: r.voucher || '',
    confirmerId: Number(r.confirmerId || 0),
    confirmerName: '', // 后端只存 confirmerId，无姓名
    confirmTime: fmtDateTime(r.confirmTime),
    status: receiptStatusStr(r.status),
    remark: r.remark || '',
    createTime: fmtDateTime(r.createTime)
  }
}

// ---------- 收款计划：后端实体 BizReceiptPlan <-> 视图形状 ----------

function adaptPlan(p: Raw): BizReceiptPlan {
  const planAmount = num(p.planAmount)
  const paidAmount = num(p.paidAmount)
  return {
    id: Number(p.id),
    planNo: `PL${String(p.id || '')}`,
    orderId: Number(p.orderId || 0),
    orderNo: p.orderId ? String(p.orderId) : '', // 后端计划无 orderNo，回退订单ID
    customerId: 0,
    customerName: '', // 后端计划无客户名（见 gapsNoBackend）
    totalAmount: planAmount,
    installmentNo: Number(p.period || 1),
    installmentTotal: Number(p.period || 1), // 后端无总期数，回退当前期数
    planAmount,
    paidAmount,
    pendingAmount: +Math.max(planAmount - paidAmount, 0).toFixed(2),
    planDate: fmtDate(p.planDate),
    paidDate: fmtDate(p.paidDate),
    status: planStatusStr(p.status),
    reminderCount: 0, // 后端无催收计数（见 gapsNoBackend）
    lastReminderTime: '',
    remark: p.remark || ''
  }
}

// ---------- 发票：后端实体 BizInvoice <-> 视图形状 ----------

function adaptInvoice(v: Raw): BizInvoice {
  const amount = num(v.amount)
  const taxAmount = num(v.taxAmount)
  const taxRate = amount > 0 ? +((taxAmount / amount) * 100).toFixed(0) : 6
  return {
    id: Number(v.id),
    invoiceNo: v.invoiceNo || '',
    orderId: Number(v.orderId || 0),
    orderNo: v.orderId ? String(v.orderId) : '',
    customerId: Number(v.customerId || 0),
    customerName: v.customerName || '',
    invoiceTitle: v.title || v.customerName || '',
    taxNo: v.taxNo || '',
    invoiceType: invoiceTypeStr(v.invoiceType),
    amount,
    taxRate,
    taxAmount,
    status: invoiceStatusStr(v.status),
    issueTime: fmtDate(v.invoiceDate),
    mailNo: v.trackingNo || '',
    remark: v.remark || '',
    createTime: fmtDateTime(v.createTime)
  }
}

// ---------- 逾期阶梯判定函数（纯前端计算，与原 mock 一致） ----------

export function calcOverdueLevel(plan: BizReceiptPlan | null | undefined): OverdueLevelInfo {
  if (!plan) return { key: 'none', days: 0, label: '—', action: '', notify: '', cls: 'lv-success' }
  if (plan.status === 'paid') return { key: 'none', days: 0, label: '已结清', action: '', notify: '', cls: 'lv-success' }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const planD = plan.planDate ? new Date(plan.planDate) : today
  planD.setHours(0, 0, 0, 0)
  const days = Math.floor((today.getTime() - planD.getTime()) / 86400000)
  if (days <= 0) {
    return { key: 'none', days: 0, label: '未到期', action: '', notify: '', cls: 'lv-success' }
  }
  if (days < 7) {
    return { key: 'today', days, label: '已逾期', action: '标记已逾期', notify: '销售', cls: 'lv-warn-soft' }
  }
  if (days < 15) {
    return { key: 'level1', days, label: '催款中', action: '发送催促提醒', notify: '销售', cls: 'lv-warn' }
  }
  if (days < 30) {
    return { key: 'level2', days, label: '主管介入', action: '升级提醒，主管介入处理', notify: '销售+主管', cls: 'lv-warn-strong' }
  }
  if (days < 60) {
    return { key: 'level3', days, label: '服务暂停', action: '服务暂停标记', notify: '销售+主管+客户', cls: 'lv-danger' }
  }
  return { key: 'level4', days, label: '合同终止', action: '合同终止标记', notify: '全员', cls: 'lv-critical' }
}

// ---------- 文案映射（视图直接引用） ----------

export function refundWayLabel(key?: RefundWayKey): string {
  return ({ origin: '原路退回', bank_transfer: '对公转账', other: '其他' } as Record<string, string>)[key || 'origin'] || '其他'
}

export function refundReasonLabel(key?: RefundReasonKey): string {
  return ({
    service_unsatisfied: '服务不满意',
    customer_regret: '客户反悔',
    service_unavailable: '服务无法继续',
    agreement_terminated: '协商解除',
    other: '其他'
  } as Record<string, string>)[key || 'other'] || '其他'
}

// ---------- 退款单 / 时间线：后端无持久化，模块内存维护（非 localStorage，刷新即清空，见 gapsNoBackend） ----------

const refundStore: RefundRequest[] = []
const timelineStore: ReceiptTimelineEvent[] = []
function genNo(prefix: string, n: number) {
  const d = new Date()
  return `${prefix}${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(n).padStart(4, '0')}`
}
function appendTimeline(evt: Omit<ReceiptTimelineEvent, 'id' | 'time'> & { time?: string }) {
  const id = (timelineStore.reduce((m, e) => Math.max(m, e.id), 0) || 0) + 1
  timelineStore.unshift({
    id,
    receiptId: evt.receiptId,
    orderId: evt.orderId,
    type: evt.type,
    title: evt.title,
    detail: evt.detail,
    operator: evt.operator,
    time: evt.time || ts()
  })
  if (timelineStore.length > 100) timelineStore.length = 100
}

// 全量收款缓存：getPlans/getOverdue/getSummary 需要跨订单聚合，列表接口仅按 status 过滤
async function fetchAllReceipts(): Promise<BizReceipt[]> {
  const res = await get('/receipt/list', { pageNum: 1, pageSize: 500 })
  return toPage<Raw>(unwrap(res)).list.map(adaptReceipt)
}

async function fetchAllInvoices(): Promise<BizInvoice[]> {
  const res = await get('/receipt/invoices', { pageNum: 1, pageSize: 500 })
  return toPage<Raw>(unwrap(res)).list.map(adaptInvoice)
}

export const receiptApi = {
  /** 真实后端无 seed 接口；保留空实现兼容视图 onMounted 调用（不读写 localStorage） */
  async ensureSamples() {
    return { ok: true }
  },

  /** GET /receipt/list（后端支持 customerId/orderId/status 过滤；orderNo/customerName 在前端过滤） */
  async list(params: { page?: number; pageSize?: number; status?: string; orderNo?: string; customerName?: string } = {}): Promise<{ list: BizReceipt[]; total: number }> {
    const res = await get('/receipt/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      status: params.status ? RECEIPT_STATUS_NUM[params.status] : undefined
    })
    const page = toPage<Raw>(unwrap(res))
    let list = page.list.map(adaptReceipt)
    let total = page.total
    if (params.orderNo) {
      list = list.filter(r => (r.orderNo || '').includes(params.orderNo!) || r.receiptNo.includes(params.orderNo!))
      total = list.length
    }
    if (params.customerName) {
      list = list.filter(r => (r.customerName || '').includes(params.customerName!))
      total = list.length
    }
    return { list, total }
  },

  async detail(id: number): Promise<BizReceipt | null> {
    const raw = unwrap<Raw | null>(await get(`/receipt/${id}`))
    return raw ? adaptReceipt(raw) : null
  },

  /** POST /receipt/confirm（白名单映射到后端实体；后端将 status 直接置 2 已确认） */
  async create(data: Partial<BizReceipt>): Promise<BizReceipt> {
    const body: Record<string, any> = {
      receiptNo: data.receiptNo || undefined,
      orderId: data.orderId || undefined,
      customerId: data.customerId || undefined,
      customerName: data.customerName || undefined,
      amount: data.amount || 0,
      paymentMethod: data.paymentChannel || 'bank',
      remark: data.remark || '',
      status: RECEIPT_STATUS_NUM[data.status || 'pending'] || 1
    }
    await post('/receipt/confirm', body)
    const id = num(data.orderId)
    return adaptReceipt({ ...body, id, status: body.status })
  },

  /**
   * POST /receipt/confirm（后端 confirm 同时编排：收款确认→自动生成合同草稿，幂等）。
   * 后端无 rejected 状态：status==='rejected' 时不调后端置库（避免误置已确认/已退款），仅做前端态降级并写时间线提示。
   */
  async confirm(payload: { id: number; confirmerId?: number; confirmerName?: string; status?: 'confirmed' | 'rejected'; remark?: string; actualAmount?: number }): Promise<BizReceipt> {
    const current = await this.detail(payload.id)
    if (!current) return Promise.reject(new Error('收款记录不存在'))

    if (payload.status === 'rejected') {
      // gapsNoBackend：后端无驳回态，仅前端提示，不落库
      appendTimeline({
        receiptId: current.id, orderId: current.orderId,
        type: 'refund_rejected',
        title: `收款驳回 · ${current.receiptNo}`,
        detail: payload.remark || '财务驳回（后端无驳回态，未改库）',
        operator: payload.confirmerName || '财务'
      })
      return { ...current, status: 'rejected', remark: payload.remark || current.remark }
    }

    const actualAmount = payload.actualAmount != null ? payload.actualAmount : current.amount
    const body: Record<string, any> = {
      id: current.id,
      receiptNo: current.receiptNo || undefined,
      orderId: current.orderId || undefined,
      customerId: current.customerId || undefined,
      customerName: current.customerName || undefined,
      amount: actualAmount,
      paymentMethod: current.paymentChannel,
      remark: payload.remark || current.remark
    }
    await post('/receipt/confirm', body, { params: { operatorId: payload.confirmerId } })

    const confirmed: BizReceipt = { ...current, status: 'confirmed', amount: actualAmount, confirmTime: ts(), remark: body.remark }
    appendTimeline({
      receiptId: confirmed.id, orderId: confirmed.orderId,
      type: 'receipt_confirmed',
      title: `收款确认 · ${confirmed.receiptNo}`,
      detail: `财务确认 ${confirmed.customerName || '客户'} 收款 ¥${confirmed.amount}`,
      operator: payload.confirmerName || '财务'
    })
    appendTimeline({
      receiptId: confirmed.id, orderId: confirmed.orderId,
      type: 'contract_generated',
      title: `合同草稿检查 · #${confirmed.orderNo || confirmed.orderId}`,
      detail: '后端已在确认收款时校验并按需生成合同草稿（幂等）',
      operator: '系统'
    })
    return confirmed
  },

  /**
   * 收款计划列表：后端仅 GET /receipt/plans/{orderId}（按单查），无全量分页接口。
   * 这里先取全部收款拿到订单集合，再逐单拉计划合并，保持视图 getPlans({pageSize}) 的 {list,total} 形状。
   */
  async getPlans(params: { page?: number; pageSize?: number; status?: string; orderNo?: string } = {}): Promise<{ list: BizReceiptPlan[]; total: number }> {
    const receipts = await fetchAllReceipts()
    const orderIds = Array.from(new Set(receipts.map(r => r.orderId).filter(Boolean)))
    const nameByOrder = new Map<number, string>()
    receipts.forEach(r => { if (r.orderId && r.customerName) nameByOrder.set(r.orderId, r.customerName) })
    const lists = await Promise.all(orderIds.map(async oid => {
      try {
        const rows = unwrap<Raw[]>(await get(`/receipt/plans/${oid}`)) || []
        return rows.map(adaptPlan).map(p => ({ ...p, customerName: nameByOrder.get(p.orderId) || '' }))
      } catch { return [] as BizReceiptPlan[] }
    }))
    let list = lists.flat()
    if (params.status) list = list.filter(p => p.status === params.status)
    if (params.orderNo) list = list.filter(p => (p.orderNo || '').includes(params.orderNo!))
    return { list, total: list.length }
  },

  /** POST /receipt/plan/pay（后端按 {planId,amount} 核销，自动推进 部分收款/已收齐 状态） */
  async markPlanPaid(payload: { id: number; paidAmount: number; paidDate?: string }): Promise<{ id: number; paidAmount: number }> {
    await post('/receipt/plan/pay', { planId: payload.id, amount: payload.paidAmount })
    return { id: payload.id, paidAmount: payload.paidAmount }
  },

  /** GET /receipt/overdue（后端返回 planDate<今天 且 status!=3 的计划，附逾期阶梯标记） */
  async getOverdue(params: { page?: number; pageSize?: number } = {}): Promise<{ list: BizReceiptPlan[]; total: number }> {
    const rows = unwrap<Raw[]>(await get('/receipt/overdue')) || []
    const list = rows.map(adaptPlan)
      .map(p => ({ ...p, overdueLevel: calcOverdueLevel(p).key, overdueAction: calcOverdueLevel(p).action }))
      .filter(p => p.overdueLevel !== 'none')
      .sort((a, b) => calcOverdueLevel(b).days - calcOverdueLevel(a).days)
    return { list, total: list.length }
  },

  // ===== 退款业务（后端仅一步式 POST /receipt/refund，无审批流；中间态用模块内存维护，见 gapsNoBackend） =====

  /** 退款列表：后端无退款表，返回模块内存中的退款单 */
  async getRefunds(params: { page?: number; pageSize?: number; status?: string } = {}): Promise<{ list: RefundRequest[]; total: number }> {
    let list = refundStore.slice().sort((a, b) => (b.applyTime || '').localeCompare(a.applyTime || ''))
    if (params.status) list = list.filter(r => r.status === params.status)
    return { list, total: list.length }
  },

  /** 发起退款（仅前端态：写入内存退款单，等待主管审批+财务确认；财务确认时才真正落库） */
  async createRefund(payload: Partial<RefundRequest> & { receiptId: number; refundAmount: number; reason: string }): Promise<RefundRequest> {
    const receipt = await this.detail(payload.receiptId)
    if (receipt && payload.refundAmount > receipt.amount) {
      return Promise.reject(new Error(`退款金额不得超过实收金额 ¥${receipt.amount}`))
    }
    const id = (refundStore.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1
    const refund: RefundRequest = {
      id,
      refundNo: payload.refundNo || genNo('RF', id),
      receiptId: payload.receiptId,
      orderId: payload.orderId || receipt?.orderId || 0,
      orderNo: payload.orderNo || receipt?.orderNo || '',
      customerName: payload.customerName || receipt?.customerName || '',
      refundAmount: payload.refundAmount,
      reasonKey: payload.reasonKey || 'other',
      reason: payload.reason,
      refundWay: payload.refundWay || 'origin',
      applyTime: ts(),
      applicantId: payload.applicantId || 0,
      applicantName: payload.applicantName || '当前用户',
      approverId: 0, approverName: '', approvalTime: '',
      financeConfirmerId: 0, financeConfirmerName: '', financeConfirmTime: '',
      status: 'pending',
      remark: payload.remark || ''
    }
    refundStore.push(refund)
    appendTimeline({
      receiptId: refund.receiptId, orderId: refund.orderId,
      type: 'refund_applied',
      title: `退款申请 · ${refund.refundNo}`,
      detail: `${refund.applicantName} 发起退款 ¥${refund.refundAmount}，原因：${refund.reason}`,
      operator: refund.applicantName || '销售'
    })
    return refund
  },

  /** 主管审批（前端态） */
  async approveRefund(payload: { id: number; approverName?: string; approverId?: number; remark?: string }): Promise<RefundRequest> {
    const r = refundStore.find(x => x.id === payload.id)
    if (!r) return Promise.reject(new Error('退款记录不存在'))
    if (r.status !== 'pending') return Promise.reject(new Error('当前状态不可审批'))
    r.status = 'approved'
    r.approverId = payload.approverId || 0
    r.approverName = payload.approverName || '当前主管'
    r.approvalTime = ts()
    if (payload.remark) r.remark = payload.remark
    appendTimeline({
      receiptId: r.receiptId, orderId: r.orderId,
      type: 'refund_approved',
      title: `主管审批通过 · ${r.refundNo}`,
      detail: `${r.approverName} 审批通过，等待财务确认`,
      operator: r.approverName || '主管'
    })
    return r
  },

  /** 财务确认退款：落地真实 POST /receipt/refund（后端将原收款置为「已退款」） */
  async confirmRefund(payload: { id: number; financeConfirmerName?: string; financeConfirmerId?: number; refundWay?: RefundWayKey; remark?: string }): Promise<RefundRequest> {
    const r = refundStore.find(x => x.id === payload.id)
    if (!r) return Promise.reject(new Error('退款记录不存在'))
    if (r.status !== 'approved') return Promise.reject(new Error('需主管审批后才可财务确认'))
    await post('/receipt/refund', {
      receiptId: r.receiptId,
      amount: r.refundAmount,
      reason: r.reason,
      operatorId: payload.financeConfirmerId
    })
    r.status = 'completed'
    r.refundWay = payload.refundWay || r.refundWay || 'origin'
    r.financeConfirmerId = payload.financeConfirmerId || 0
    r.financeConfirmerName = payload.financeConfirmerName || '财务'
    r.financeConfirmTime = ts()
    if (payload.remark) r.remark = payload.remark
    appendTimeline({
      receiptId: r.receiptId, orderId: r.orderId,
      type: 'refund_completed',
      title: `财务退款完成 · ${r.refundNo}`,
      detail: `退款 ¥${r.refundAmount} 已执行（${refundWayLabel(r.refundWay)}）`,
      operator: r.financeConfirmerName || '财务'
    })
    return r
  },

  /** 驳回退款（前端态） */
  async rejectRefund(payload: { id: number; rejectReason?: string; operatorName?: string }): Promise<RefundRequest> {
    const r = refundStore.find(x => x.id === payload.id)
    if (!r) return Promise.reject(new Error('退款记录不存在'))
    if (r.status === 'completed' || r.status === 'rejected') {
      return Promise.reject(new Error('当前状态不可驳回'))
    }
    r.status = 'rejected'
    r.rejectReason = payload.rejectReason || '不符合退款条件'
    appendTimeline({
      receiptId: r.receiptId, orderId: r.orderId,
      type: 'refund_rejected',
      title: `退款驳回 · ${r.refundNo}`,
      detail: payload.rejectReason || '未通过审批',
      operator: payload.operatorName || '主管'
    })
    return r
  },

  /** 兼容旧接口 */
  refund(payload: Partial<RefundRequest> & { receiptId: number; refundAmount: number; reason: string }) {
    return this.createRefund(payload)
  },

  /** 联动时间线：后端无接口，返回模块内存事件（见 gapsNoBackend） */
  async getTimeline(params: { receiptId?: number; orderId?: number; limit?: number } = {}): Promise<ReceiptTimelineEvent[]> {
    let list = timelineStore.slice()
    if (params.receiptId) list = list.filter(e => e.receiptId === params.receiptId)
    if (params.orderId) list = list.filter(e => e.orderId === params.orderId)
    return list.slice(0, params.limit ?? 50)
  },

  /** GET /receipt/invoices（后端支持 customerId/status；customerName 在前端过滤） */
  async getInvoices(params: { page?: number; pageSize?: number; status?: string; customerName?: string } = {}): Promise<{ list: BizInvoice[]; total: number }> {
    const res = await get('/receipt/invoices', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      status: params.status ? INVOICE_STATUS_NUM[params.status] : undefined
    })
    const page = toPage<Raw>(unwrap(res))
    let list = page.list.map(adaptInvoice)
    let total = page.total
    if (params.customerName) {
      list = list.filter(i => (i.customerName || '').includes(params.customerName!))
      total = list.length
    }
    return { list, total }
  },

  /** POST /receipt/invoice（白名单映射；taxAmount/totalAmount 由前端按税率算好发后端） */
  async createInvoice(data: Partial<BizInvoice>): Promise<BizInvoice> {
    const amount = num(data.amount)
    const taxRate = data.taxRate ?? 6
    const taxAmount = +(amount * taxRate / 100).toFixed(2)
    const body: Record<string, any> = {
      invoiceNo: data.invoiceNo || undefined,
      orderId: data.orderId || undefined,
      receiptId: (data as any).receiptId || undefined,
      customerId: data.customerId || undefined,
      customerName: data.customerName || undefined,
      title: data.invoiceTitle || data.customerName || '',
      taxNo: data.taxNo || '',
      invoiceType: invoiceTypeBackend(data.invoiceType || 'vat_general'),
      amount,
      taxAmount,
      totalAmount: +(amount + taxAmount).toFixed(2),
      remark: data.remark || '',
      status: data.status ? INVOICE_STATUS_NUM[data.status] : 1
    }
    const id = unwrap<number>(await post('/receipt/invoice', body))
    return adaptInvoice({ ...body, id, invoiceDate: '', trackingNo: '', createTime: ts() })
  },

  /**
   * PUT /receipt/invoice/{id}（后端只读 {status,trackingNo}；invoiceNo/amount 等不可改）。
   * 开票/寄出/签收 三档状态推进都走此接口，mailNo 映射后端 trackingNo。
   */
  async updateInvoice(data: Partial<BizInvoice> & { id: number }): Promise<{ id: number }> {
    const body: Record<string, any> = {}
    if (data.status !== undefined) body.status = INVOICE_STATUS_NUM[data.status]
    if (data.mailNo !== undefined) body.trackingNo = data.mailNo
    await put(`/receipt/invoice/${data.id}`, body)
    return { id: data.id }
  },

  /**
   * 财务核对台汇总指标：后端 /summary 仅给当月 {count,totalAmount}，其余指标本文件聚合多接口在前端算出。
   * 返回形状与原 mock ReceiptSummary 完全一致。
   */
  async getSummary(): Promise<ReceiptSummary> {
    const [receipts, invoices, overdueRows, monthRaw] = await Promise.all([
      fetchAllReceipts(),
      fetchAllInvoices(),
      get('/receipt/overdue').then(r => unwrap<Raw[]>(r) || []).catch(() => [] as Raw[]),
      get('/receipt/summary').then(r => unwrap<Raw>(r) || {}).catch(() => ({} as Raw))
    ])
    const overduePlans = overdueRows.map(adaptPlan).filter(p => calcOverdueLevel(p).key !== 'none')
    const confirmed = receipts.filter(r => r.status === 'confirmed')
    const pending = receipts.filter(r => r.status === 'pending')
    return {
      totalReceipt: confirmed.reduce((s, r) => s + r.amount, 0),
      pendingReceipt: pending.reduce((s, r) => s + r.amount, 0),
      monthReceipt: num(monthRaw?.totalAmount),
      overdueAmount: overduePlans.reduce((s, p) => s + p.pendingAmount, 0),
      overdueCount: overduePlans.length,
      invoicePending: invoices.filter(i => i.status === 'pending').length,
      invoiceIssued: invoices.filter(i => i.status === 'issued' || i.status === 'mailed' || i.status === 'received').length,
      refundPending: refundStore.filter(r => r.status === 'pending' || r.status === 'approved').length
    }
  }
}
