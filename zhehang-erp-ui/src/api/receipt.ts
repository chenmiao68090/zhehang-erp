// ===== 财务核对 API（localStorage Mock 模式） =====
import { onPaymentConfirmed } from '@/utils/biz-linkage'

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

const RC_KEY = 'biz_receipts'
const PL_KEY = 'biz_receipt_plans'
const IV_KEY = 'biz_invoices'
const RF_KEY = 'biz_refunds'
const TL_KEY = 'biz_receipt_timeline'

const delay = <T>(data: T, ms = 100): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

const ts = (off = 0): string => {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}
const dateOnly = (off = 0): string => {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return d.toISOString().slice(0, 10)
}

function pad4(n: number) { return String(n).padStart(4, '0') }
function genNo(prefix: string, n: number) {
  const d = new Date()
  return `${prefix}${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${pad4(n)}`
}

function load<T>(key: string, builder: () => T[]): T[] {
  const raw = localStorage.getItem(key)
  if (raw) {
    try { return JSON.parse(raw) as T[] } catch { /* ignore */ }
  }
  const seed = builder()
  localStorage.setItem(key, JSON.stringify(seed))
  return seed
}
function save<T>(key: string, list: T[]) { localStorage.setItem(key, JSON.stringify(list)) }

function seedReceipts(): BizReceipt[] {
  return [
    {
      id: 1,
      receiptNo: genNo('RC', 1),
      orderId: 110,
      orderNo: 'TD2026060110',
      customerId: 110,
      customerName: '杭州启明电商有限公司',
      amount: 13200,
      paymentChannel: 'bank',
      paymentTime: ts(-1),
      receiptType: 'full',
      voucherUrl: '',
      confirmerId: 0,
      confirmerName: '',
      confirmTime: '',
      status: 'pending',
      remark: '客户已转账，待财务核对到账凭证',
      createTime: ts(-1)
    },
    {
      id: 2,
      receiptNo: genNo('RC', 2),
      orderId: 111,
      orderNo: 'TD2026060111',
      customerId: 111,
      customerName: '宁波蔚蓝企业管理有限公司',
      amount: 3000,
      paymentChannel: 'wechat',
      paymentTime: ts(0),
      receiptType: 'deposit',
      voucherUrl: '',
      confirmerId: 0,
      confirmerName: '',
      confirmTime: '',
      status: 'pending',
      remark: '审计报告定金，待确认',
      createTime: ts()
    },
    {
      id: 3,
      receiptNo: genNo('RC', 3),
      orderId: 101,
      orderNo: 'TD2026060101',
      customerId: 101,
      customerName: '杭州森禾科技有限公司',
      amount: 16800,
      paymentChannel: 'bank',
      paymentTime: ts(-2),
      receiptType: 'full',
      voucherUrl: '/mock/receipt_3.png',
      confirmerId: 1003,
      confirmerName: '王会计',
      confirmTime: ts(-2),
      status: 'confirmed',
      remark: '年度代理记账款已确认',
      createTime: ts(-3)
    },
    {
      id: 4,
      receiptNo: genNo('RC', 4),
      orderId: 102,
      orderNo: 'TD2026060102',
      customerId: 102,
      customerName: '浙江云桥贸易有限公司',
      amount: 6800,
      paymentChannel: 'alipay',
      paymentTime: ts(-3),
      receiptType: 'full',
      voucherUrl: '/mock/receipt_4.png',
      confirmerId: 1003,
      confirmerName: '王会计',
      confirmTime: ts(-3),
      status: 'confirmed',
      remark: '工商注册服务费已确认',
      createTime: ts(-4)
    },
    {
      id: 5,
      receiptNo: genNo('RC', 5),
      orderId: 105,
      orderNo: 'TD2026060105',
      customerId: 105,
      customerName: '绍兴南麓服饰有限公司',
      amount: 18000,
      paymentChannel: 'bank',
      paymentTime: ts(-12),
      receiptType: 'installment',
      voucherUrl: '/mock/receipt_5.png',
      confirmerId: 1003,
      confirmerName: '王会计',
      confirmTime: ts(-12),
      status: 'confirmed',
      remark: '上半年度服务费已确认',
      createTime: ts(-13)
    },
    {
      id: 6,
      receiptNo: genNo('RC', 6),
      orderId: 103,
      orderNo: 'TD2026060103',
      customerId: 103,
      customerName: '杭州叁木文化传媒有限公司',
      amount: 8000,
      paymentChannel: 'bank',
      paymentTime: ts(-5),
      receiptType: 'deposit',
      voucherUrl: '',
      confirmerId: 1003,
      confirmerName: '王会计',
      confirmTime: ts(-5),
      status: 'rejected',
      remark: '付款方名称不一致，已驳回销售补充材料',
      createTime: ts(-6)
    },
    {
      id: 7,
      receiptNo: genNo('RC', 7),
      orderId: 104,
      orderNo: 'TD2026060104',
      customerId: 104,
      customerName: '湖州锦辰餐饮管理有限公司',
      amount: 12000,
      paymentChannel: 'pos',
      paymentTime: ts(-28),
      receiptType: 'full',
      voucherUrl: '/mock/receipt_7.png',
      confirmerId: 1003,
      confirmerName: '王会计',
      confirmTime: ts(-28),
      status: 'refunded',
      remark: '客户退费，收款已退款',
      createTime: ts(-30)
    }
  ]
}

function seedPlans(): BizReceiptPlan[] {
  return [
    {
      id: 1,
      planNo: genNo('PL', 1),
      orderId: 110,
      orderNo: 'TD2026060110',
      customerId: 110,
      customerName: '杭州启明电商有限公司',
      totalAmount: 13200,
      installmentNo: 1,
      installmentTotal: 1,
      planAmount: 13200,
      paidAmount: 0,
      pendingAmount: 13200,
      planDate: dateOnly(-8),
      paidDate: '',
      status: 'overdue',
      reminderCount: 1,
      lastReminderTime: ts(-2),
      remark: '全款待确认，确认后生成合同草稿'
    },
    {
      id: 2,
      planNo: genNo('PL', 2),
      orderId: 111,
      orderNo: 'TD2026060111',
      customerId: 111,
      customerName: '宁波蔚蓝企业管理有限公司',
      totalAmount: 9800,
      installmentNo: 1,
      installmentTotal: 2,
      planAmount: 3000,
      paidAmount: 0,
      pendingAmount: 3000,
      planDate: dateOnly(2),
      paidDate: '',
      status: 'pending',
      reminderCount: 0,
      lastReminderTime: '',
      remark: '审计报告定金'
    },
    {
      id: 3,
      planNo: genNo('PL', 3),
      orderId: 105,
      orderNo: 'TD2026060105',
      customerId: 105,
      customerName: '绍兴南麓服饰有限公司',
      totalAmount: 36000,
      installmentNo: 1,
      installmentTotal: 2,
      planAmount: 18000,
      paidAmount: 18000,
      pendingAmount: 0,
      planDate: dateOnly(-180),
      paidDate: dateOnly(-12),
      status: 'paid',
      reminderCount: 0,
      lastReminderTime: '',
      remark: '上半年度已结清'
    },
    {
      id: 4,
      planNo: genNo('PL', 4),
      orderId: 105,
      orderNo: 'TD2026060105',
      customerId: 105,
      customerName: '绍兴南麓服饰有限公司',
      totalAmount: 36000,
      installmentNo: 2,
      installmentTotal: 2,
      planAmount: 18000,
      paidAmount: 0,
      pendingAmount: 18000,
      planDate: dateOnly(12),
      paidDate: '',
      status: 'pending',
      reminderCount: 0,
      lastReminderTime: '',
      remark: '下半年度待收'
    },
    {
      id: 5,
      planNo: genNo('PL', 5),
      orderId: 103,
      orderNo: 'TD2026060103',
      customerId: 103,
      customerName: '杭州叁木文化传媒有限公司',
      totalAmount: 25800,
      installmentNo: 2,
      installmentTotal: 2,
      planAmount: 17800,
      paidAmount: 0,
      pendingAmount: 17800,
      planDate: dateOnly(-22),
      paidDate: '',
      status: 'overdue',
      reminderCount: 2,
      lastReminderTime: ts(-3),
      remark: '资质代办尾款逾期，主管需介入'
    },
    {
      id: 6,
      planNo: genNo('PL', 6),
      orderId: 106,
      orderNo: 'TD2026060106',
      customerId: 106,
      customerName: '嘉兴禾创智能装备有限公司',
      totalAmount: 58000,
      installmentNo: 2,
      installmentTotal: 2,
      planAmount: 38000,
      paidAmount: 0,
      pendingAmount: 38000,
      planDate: dateOnly(-46),
      paidDate: '',
      status: 'overdue',
      reminderCount: 4,
      lastReminderTime: ts(-1),
      remark: '方案落地尾款逾期，建议暂停服务交付'
    }
  ]
}

function seedInvoices(): BizInvoice[] {
  return [
    {
      id: 1,
      invoiceNo: genNo('INV', 1),
      orderId: 101,
      orderNo: 'TD2026060101',
      customerId: 101,
      customerName: '杭州森禾科技有限公司',
      invoiceTitle: '杭州森禾科技有限公司',
      taxNo: '91330100MA2H000001',
      invoiceType: 'vat_general',
      amount: 16800,
      taxRate: 6,
      taxAmount: 1008,
      status: 'pending',
      issueTime: '',
      mailNo: '',
      remark: '收款确认后待开票',
      createTime: ts(-2)
    },
    {
      id: 2,
      invoiceNo: genNo('INV', 2),
      orderId: 102,
      orderNo: 'TD2026060102',
      customerId: 102,
      customerName: '浙江云桥贸易有限公司',
      invoiceTitle: '浙江云桥贸易有限公司',
      taxNo: '91330000MA2H000002',
      invoiceType: 'electronic',
      amount: 6800,
      taxRate: 6,
      taxAmount: 408,
      status: 'issued',
      issueTime: ts(-2),
      mailNo: '',
      remark: '电子票已开具',
      createTime: ts(-3)
    },
    {
      id: 3,
      invoiceNo: genNo('INV', 3),
      orderId: 105,
      orderNo: 'TD2026060105',
      customerId: 105,
      customerName: '绍兴南麓服饰有限公司',
      invoiceTitle: '绍兴南麓服饰有限公司',
      taxNo: '91330600MA2H000003',
      invoiceType: 'vat_special',
      amount: 18000,
      taxRate: 6,
      taxAmount: 1080,
      status: 'mailed',
      issueTime: ts(-10),
      mailNo: 'SF1234567890',
      remark: '专票已寄出',
      createTime: ts(-12)
    },
    {
      id: 4,
      invoiceNo: genNo('INV', 4),
      orderId: 104,
      orderNo: 'TD2026060104',
      customerId: 104,
      customerName: '湖州锦辰餐饮管理有限公司',
      invoiceTitle: '湖州锦辰餐饮管理有限公司',
      taxNo: '91330500MA2H000004',
      invoiceType: 'vat_general',
      amount: 12000,
      taxRate: 6,
      taxAmount: 720,
      status: 'received',
      issueTime: ts(-26),
      mailNo: 'SF9876543210',
      remark: '客户已确认收到',
      createTime: ts(-28)
    }
  ]
}

function seedRefunds(): RefundRequest[] {
  return [
    {
      id: 1,
      refundNo: genNo('RF', 1),
      receiptId: 7,
      orderId: 104,
      orderNo: 'TD2026060104',
      customerName: '湖州锦辰餐饮管理有限公司',
      refundAmount: 12000,
      reasonKey: 'agreement_terminated',
      reason: '客户经营计划调整，双方协商解除',
      refundWay: 'origin',
      applyTime: ts(-20),
      applicantId: 1001,
      applicantName: '陈思羽',
      approverId: 1010,
      approverName: '李主管',
      approvalTime: ts(-19),
      financeConfirmerId: 1003,
      financeConfirmerName: '王会计',
      financeConfirmTime: ts(-18),
      status: 'completed',
      remark: '已原路退回'
    },
    {
      id: 2,
      refundNo: genNo('RF', 2),
      receiptId: 5,
      orderId: 105,
      orderNo: 'TD2026060105',
      customerName: '绍兴南麓服饰有限公司',
      refundAmount: 2000,
      reasonKey: 'service_unsatisfied',
      reason: '客户要求扣减部分服务费',
      refundWay: 'bank_transfer',
      applyTime: ts(-1),
      applicantId: 1001,
      applicantName: '周慧',
      approverId: 0,
      approverName: '',
      approvalTime: '',
      financeConfirmerId: 0,
      financeConfirmerName: '',
      financeConfirmTime: '',
      status: 'pending',
      remark: ''
    },
    {
      id: 3,
      refundNo: genNo('RF', 3),
      receiptId: 4,
      orderId: 102,
      orderNo: 'TD2026060102',
      customerName: '浙江云桥贸易有限公司',
      refundAmount: 800,
      reasonKey: 'other',
      reason: '刻章费用客户自行承担，需退回差额',
      refundWay: 'origin',
      applyTime: ts(-2),
      applicantId: 1001,
      applicantName: '李建国',
      approverId: 1010,
      approverName: '李主管',
      approvalTime: ts(-1),
      financeConfirmerId: 0,
      financeConfirmerName: '',
      financeConfirmTime: '',
      status: 'approved',
      remark: '等待财务执行'
    }
  ]
}

function paginate<T>(list: T[], page = 1, pageSize = 10) {
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

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

// ===== 逾期阶梯判定函数 =====
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

// ===== 时间线事件 =====
function loadTimeline(): ReceiptTimelineEvent[] {
  const raw = localStorage.getItem(TL_KEY)
  if (raw) {
    try { return JSON.parse(raw) as ReceiptTimelineEvent[] } catch { /* ignore */ }
  }
  return []
}
function saveTimeline(list: ReceiptTimelineEvent[]) {
  localStorage.setItem(TL_KEY, JSON.stringify(list))
}
function appendTimeline(evt: Omit<ReceiptTimelineEvent, 'id' | 'time'> & { time?: string }) {
  const list = loadTimeline()
  const id = (list.reduce((m, e) => Math.max(m, e.id), 0) || 0) + 1
  list.unshift({
    id,
    receiptId: evt.receiptId,
    orderId: evt.orderId,
    type: evt.type,
    title: evt.title,
    detail: evt.detail,
    operator: evt.operator,
    time: evt.time || ts()
  })
  // 最多保留 100 条
  saveTimeline(list.slice(0, 100))
}

function seedTimelineFromData(
  receipts: BizReceipt[],
  refunds: RefundRequest[],
  plans: BizReceiptPlan[]
): ReceiptTimelineEvent[] {
  const confirmed = receipts.filter(r => r.status === 'confirmed')
  const refunded = refunds.find(r => r.status === 'completed')
  const urgentPlan = plans
    .filter(p => p.status !== 'paid' && calcOverdueLevel(p).days >= 30)
    .sort((a, b) => calcOverdueLevel(b).days - calcOverdueLevel(a).days)[0]

  const events: ReceiptTimelineEvent[] = confirmed.slice(0, 2).map((receipt, idx) => ({
    id: idx + 1,
    receiptId: receipt.id,
    orderId: receipt.orderId,
    type: 'receipt_confirmed',
    title: `收款确认 · ${receipt.receiptNo}`,
    detail: `财务确认 ${receipt.customerName} 收款 ¥${receipt.amount}`,
    time: receipt.confirmTime || receipt.paymentTime || ts(-idx),
    operator: receipt.confirmerName || '财务'
  }))

  if (confirmed[0]) {
    events.push({
      id: events.length + 1,
      receiptId: confirmed[0].id,
      orderId: confirmed[0].orderId,
      type: 'contract_generated',
      title: `合同草稿已存在 · #${confirmed[0].orderNo || confirmed[0].orderId}`,
      detail: '历史全额收款已进入合同管理，后续确认收款将自动校验是否需要生成合同草稿',
      time: ts(-1),
      operator: '系统'
    })
  }
  if (refunded) {
    events.push({
      id: events.length + 1,
      receiptId: refunded.receiptId,
      orderId: refunded.orderId,
      type: 'refund_completed',
      title: `退款完成 · ${refunded.refundNo}`,
      detail: `${refunded.customerName} 已退款 ¥${refunded.refundAmount}`,
      time: refunded.financeConfirmTime || refunded.approvalTime || refunded.applyTime,
      operator: refunded.financeConfirmerName || '财务'
    })
  }
  if (urgentPlan) {
    events.push({
      id: events.length + 1,
      orderId: urgentPlan.orderId,
      type: 'overdue_escalation',
      title: `逾期升级 · ${urgentPlan.orderNo}`,
      detail: `${urgentPlan.customerName} 逾期 ${calcOverdueLevel(urgentPlan).days} 天，${calcOverdueLevel(urgentPlan).action}`,
      time: urgentPlan.lastReminderTime || ts(-1),
      operator: '系统'
    })
  }

  return events.sort((a, b) => (b.time || '').localeCompare(a.time || ''))
}

function ensureSeedStorage() {
  let receipts = load<BizReceipt>(RC_KEY, seedReceipts)
  let plans = load<BizReceiptPlan>(PL_KEY, seedPlans)
  let invoices = load<BizInvoice>(IV_KEY, seedInvoices)
  let refunds = load<RefundRequest>(RF_KEY, seedRefunds)

  if (receipts.length === 0) {
    receipts = seedReceipts()
    save(RC_KEY, receipts)
  }
  if (plans.length === 0) {
    plans = seedPlans()
    save(PL_KEY, plans)
  }
  if (invoices.length === 0) {
    invoices = seedInvoices()
    save(IV_KEY, invoices)
  }
  if (refunds.length === 0) {
    refunds = seedRefunds()
    save(RF_KEY, refunds)
  }
  if (loadTimeline().length === 0) {
    saveTimeline(seedTimelineFromData(receipts, refunds, plans))
  }

  return { receipts, plans, invoices, refunds, timeline: loadTimeline() }
}

function settlePlansForReceipt(receipt: BizReceipt, actualAmount: number) {
  const plans = load<BizReceiptPlan>(PL_KEY, seedPlans)
  const orderPlans = plans
    .filter(p => p.orderId === receipt.orderId)
    .sort((a, b) => a.installmentNo - b.installmentNo || (a.planDate || '').localeCompare(b.planDate || ''))
  let remaining = Math.max(actualAmount, 0)
  let changed = false

  orderPlans.forEach(plan => {
    if (remaining <= 0 || plan.status === 'paid') return
    const payable = Math.max(plan.planAmount - plan.paidAmount, 0)
    if (payable <= 0) return
    const paid = Math.min(payable, remaining)
    plan.paidAmount = +(plan.paidAmount + paid).toFixed(2)
    plan.pendingAmount = +Math.max(plan.planAmount - plan.paidAmount, 0).toFixed(2)
    plan.paidDate = dateOnly()
    plan.status = plan.pendingAmount <= 0 ? 'paid' : 'partial'
    plan.remark = [plan.remark, `财务确认收款 ${receipt.receiptNo}，本期核销 ¥${paid.toFixed(2)}`]
      .filter(Boolean)
      .join(' | ')
    remaining = +(remaining - paid).toFixed(2)
    changed = true
  })

  if (changed) save(PL_KEY, plans)

  const refreshed = plans.filter(p => p.orderId === receipt.orderId)
  const unpaid = refreshed.filter(p => p.status !== 'paid')
  return {
    hasPlans: refreshed.length > 0,
    allPaid: refreshed.length > 0 && unpaid.length === 0,
    unpaidCount: unpaid.length
  }
}

export const receiptApi = {
  ensureSamples() {
    return delay(ensureSeedStorage())
  },
  list(params: { page?: number; pageSize?: number; status?: string; orderNo?: string; customerName?: string } = {}) {
    let list = load<BizReceipt>(RC_KEY, seedReceipts)
    if (params.status) list = list.filter(r => r.status === params.status)
    if (params.orderNo) list = list.filter(r => (r.orderNo || '').includes(params.orderNo!))
    if (params.customerName) list = list.filter(r => (r.customerName || '').includes(params.customerName!))
    list = list.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''))
    return delay(paginate(list, params.page, params.pageSize))
  },
  detail(id: number) {
    const list = load<BizReceipt>(RC_KEY, seedReceipts)
    return delay(list.find(r => r.id === id) || null)
  },
  create(data: Partial<BizReceipt>): Promise<BizReceipt> {
    const list = load<BizReceipt>(RC_KEY, seedReceipts)
    const id = (list.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1
    const next: BizReceipt = {
      id,
      receiptNo: data.receiptNo || genNo('RC', id),
      orderId: data.orderId || 0,
      orderNo: data.orderNo || '',
      customerId: data.customerId || 0,
      customerName: data.customerName || '',
      amount: data.amount || 0,
      paymentChannel: data.paymentChannel || 'bank',
      paymentTime: data.paymentTime || ts(),
      receiptType: data.receiptType || 'deposit',
      voucherUrl: data.voucherUrl || '',
      confirmerId: 0,
      confirmerName: '',
      confirmTime: '',
      status: data.status || 'pending',
      remark: data.remark || '',
      createTime: ts()
    }
    list.push(next)
    save(RC_KEY, list)
    return delay(next)
  },
  confirm(payload: { id: number; confirmerId?: number; confirmerName?: string; status?: 'confirmed' | 'rejected'; remark?: string; actualAmount?: number }) {
    const list = load<BizReceipt>(RC_KEY, seedReceipts)
    const idx = list.findIndex(r => r.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('收款记录不存在'))
    if (list[idx].status !== 'pending') return Promise.reject(new Error('当前状态不可确认'))
    const finalStatus: BizReceipt['status'] = payload.status || 'confirmed'
    const expectedAmount = list[idx].amount
    const actualAmount = payload.actualAmount != null ? payload.actualAmount : expectedAmount
    list[idx] = {
      ...list[idx],
      status: finalStatus,
      amount: actualAmount,
      confirmerId: payload.confirmerId || 1003,
      confirmerName: payload.confirmerName || '财务',
      confirmTime: ts(),
      remark: payload.remark || list[idx].remark
    }
    save(RC_KEY, list)

    // 联动事件：收款确认 → 检查是否最后一期，生成待开票，追加时间线
    if (finalStatus === 'confirmed') {
      const receipt = list[idx]
      appendTimeline({
        receiptId: receipt.id,
        orderId: receipt.orderId,
        type: 'receipt_confirmed',
        title: `收款确认 · ${receipt.receiptNo}`,
        detail: `财务确认 ${receipt.customerName} 收款 ¥${receipt.amount}`,
        operator: receipt.confirmerName || '财务'
      })

      const settleResult = settlePlansForReceipt(receipt, actualAmount)
      const fullyMatched = actualAmount >= expectedAmount
      const isLastInstallment =
        settleResult.allPaid ||
        (fullyMatched && (receipt.receiptType === 'full' || receipt.receiptType === 'final'))

      if (isLastInstallment) {
        appendTimeline({
          receiptId: receipt.id,
          orderId: receipt.orderId,
          type: 'order_completed',
          title: `订单全额收齐 · #${receipt.orderNo || receipt.orderId}`,
          detail: settleResult.hasPlans ? '本单分期计划已全部结清' : '本单为一次性全额收款',
          operator: receipt.confirmerName || '系统'
        })
        const linkRes = onPaymentConfirmed({
          receiptId: receipt.id,
          orderId: receipt.orderId,
          isLast: true,
          amount: receipt.amount
        })
        appendTimeline({
          receiptId: receipt.id,
          orderId: receipt.orderId,
          type: 'contract_generated',
          title: linkRes.ok ? `合同草稿生成 · #${receipt.orderNo || receipt.orderId}` : `合同生成检查 · #${receipt.orderNo || receipt.orderId}`,
          detail: linkRes.message,
          operator: '系统'
        })
      }
      // 自动生成待开票记录（若该收款还没有发票）
      const invoices = load<BizInvoice>(IV_KEY, seedInvoices)
      const exists = invoices.find(iv => iv.orderId === receipt.orderId && iv.amount === receipt.amount && iv.status === 'pending')
      if (!exists) {
        const id = (invoices.reduce((m, i) => Math.max(m, i.id), 0) || 0) + 1
        invoices.push({
          id,
          invoiceNo: `INV${new Date().getFullYear()}${pad4(id)}`,
          orderId: receipt.orderId,
          orderNo: receipt.orderNo || '',
          customerId: receipt.customerId,
          customerName: receipt.customerName || '',
          invoiceTitle: receipt.customerName || '',
          taxNo: '',
          invoiceType: 'vat_general',
          amount: receipt.amount,
          taxRate: 6,
          taxAmount: +(receipt.amount * 0.06).toFixed(2),
          status: 'pending',
          issueTime: '', mailNo: '',
          remark: '收款确认后自动生成待开票',
          createTime: ts()
        })
        save(IV_KEY, invoices)
      }
    }
    return delay(list[idx])
  },
  getPlans(params: { page?: number; pageSize?: number; status?: string; orderNo?: string } = {}) {
    let list = load<BizReceiptPlan>(PL_KEY, seedPlans)
    if (params.status) list = list.filter(p => p.status === params.status)
    if (params.orderNo) list = list.filter(p => (p.orderNo || '').includes(params.orderNo!))
    return delay(paginate(list, params.page, params.pageSize))
  },
  markPlanPaid(payload: { id: number; paidAmount: number; paidDate?: string }) {
    const list = load<BizReceiptPlan>(PL_KEY, seedPlans)
    const idx = list.findIndex(p => p.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('计划不存在'))
    const plan = list[idx]
    const totalPaid = plan.paidAmount + payload.paidAmount
    plan.paidAmount = totalPaid
    plan.pendingAmount = Math.max(plan.planAmount - totalPaid, 0)
    plan.paidDate = payload.paidDate || dateOnly()
    plan.status = totalPaid >= plan.planAmount ? 'paid' : 'partial'
    list[idx] = plan
    save(PL_KEY, list)
    return delay(plan)
  },
  getOverdue(params: { page?: number; pageSize?: number } = {}) {
    const list = load<BizReceiptPlan>(PL_KEY, seedPlans)
      .filter(p => p.status !== 'paid')
      .map(p => ({ ...p, overdueLevel: calcOverdueLevel(p).key, overdueAction: calcOverdueLevel(p).action }))
      .filter(p => p.overdueLevel !== 'none')
      .sort((a, b) => calcOverdueLevel(b).days - calcOverdueLevel(a).days)
    return delay(paginate(list, params.page, params.pageSize))
  },
  // ===== 退款业务 =====
  getRefunds(params: { page?: number; pageSize?: number; status?: string } = {}) {
    let list = load<RefundRequest>(RF_KEY, seedRefunds)
    if (params.status) list = list.filter(r => r.status === params.status)
    list = list.sort((a, b) => (b.applyTime || '').localeCompare(a.applyTime || ''))
    return delay(paginate(list, params.page, params.pageSize))
  },
  createRefund(payload: Partial<RefundRequest> & { receiptId: number; refundAmount: number; reason: string }) {
    const list = load<RefundRequest>(RF_KEY, seedRefunds)
    // 校验退款金额不大于实收金额
    const receipts = load<BizReceipt>(RC_KEY, seedReceipts)
    const r = receipts.find(x => x.id === payload.receiptId)
    if (r && payload.refundAmount > r.amount) {
      return Promise.reject(new Error(`退款金额不得超过实收金额 ¥${r.amount}`))
    }
    const id = (list.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1
    const refund: RefundRequest = {
      id,
      refundNo: payload.refundNo || genNo('RF', id),
      receiptId: payload.receiptId,
      orderId: payload.orderId || (r?.orderId ?? 0),
      orderNo: payload.orderNo || (r?.orderNo ?? ''),
      customerName: payload.customerName || (r?.customerName ?? ''),
      refundAmount: payload.refundAmount,
      reasonKey: payload.reasonKey || 'other',
      reason: payload.reason,
      refundWay: payload.refundWay || 'origin',
      applyTime: ts(),
      applicantId: payload.applicantId || 1001,
      applicantName: payload.applicantName || '当前用户',
      approverId: 0, approverName: '', approvalTime: '',
      financeConfirmerId: 0, financeConfirmerName: '', financeConfirmTime: '',
      status: 'pending',
      remark: payload.remark || ''
    }
    list.push(refund)
    save(RF_KEY, list)
    appendTimeline({
      receiptId: refund.receiptId, orderId: refund.orderId,
      type: 'refund_applied',
      title: `退款申请 · ${refund.refundNo}`,
      detail: `${refund.applicantName} 发起退款¥${refund.refundAmount}，原因：${refund.reason}`,
      operator: refund.applicantName || '销售'
    })
    return delay(refund)
  },
  approveRefund(payload: { id: number; approverName?: string; approverId?: number; remark?: string }) {
    const list = load<RefundRequest>(RF_KEY, seedRefunds)
    const idx = list.findIndex(r => r.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('退款记录不存在'))
    if (list[idx].status !== 'pending') return Promise.reject(new Error('当前状态不可审批'))
    list[idx] = {
      ...list[idx],
      status: 'approved',
      approverId: payload.approverId || 1010,
      approverName: payload.approverName || '当前主管',
      approvalTime: ts(),
      remark: payload.remark || list[idx].remark
    }
    save(RF_KEY, list)
    appendTimeline({
      receiptId: list[idx].receiptId, orderId: list[idx].orderId,
      type: 'refund_approved',
      title: `主管审批通过 · ${list[idx].refundNo}`,
      detail: `${list[idx].approverName} 审批通过，等待财务确认`,
      operator: list[idx].approverName || '主管'
    })
    return delay(list[idx])
  },
  confirmRefund(payload: { id: number; financeConfirmerName?: string; refundWay?: RefundWayKey; remark?: string }) {
    const list = load<RefundRequest>(RF_KEY, seedRefunds)
    const idx = list.findIndex(r => r.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('退款记录不存在'))
    if (list[idx].status !== 'approved') return Promise.reject(new Error('需主管审批后才可财务确认'))
    list[idx] = {
      ...list[idx],
      status: 'completed',
      refundWay: payload.refundWay || list[idx].refundWay || 'origin',
      financeConfirmerId: 1003,
      financeConfirmerName: payload.financeConfirmerName || '财务赵敏',
      financeConfirmTime: ts(),
      remark: payload.remark || list[idx].remark
    }
    save(RF_KEY, list)
    // 同步更新原收款状态为已退款
    const receipts = load<BizReceipt>(RC_KEY, seedReceipts)
    const ridx = receipts.findIndex(x => x.id === list[idx].receiptId)
    if (ridx >= 0) {
      receipts[ridx].status = 'refunded'
      save(RC_KEY, receipts)
    }
    appendTimeline({
      receiptId: list[idx].receiptId, orderId: list[idx].orderId,
      type: 'refund_completed',
      title: `财务退款完成 · ${list[idx].refundNo}`,
      detail: `退款¥${list[idx].refundAmount}已执行（${refundWayLabel(list[idx].refundWay)}）`,
      operator: list[idx].financeConfirmerName || '财务'
    })
    return delay(list[idx])
  },
  rejectRefund(payload: { id: number; rejectReason?: string; operatorName?: string }) {
    const list = load<RefundRequest>(RF_KEY, seedRefunds)
    const idx = list.findIndex(r => r.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('退款记录不存在'))
    if (list[idx].status === 'completed' || list[idx].status === 'rejected') {
      return Promise.reject(new Error('当前状态不可驳回'))
    }
    list[idx] = {
      ...list[idx],
      status: 'rejected',
      rejectReason: payload.rejectReason || '不符合退款条件',
      remark: list[idx].remark
    }
    save(RF_KEY, list)
    appendTimeline({
      receiptId: list[idx].receiptId, orderId: list[idx].orderId,
      type: 'refund_rejected',
      title: `退款驳回 · ${list[idx].refundNo}`,
      detail: payload.rejectReason || '未通过审批',
      operator: payload.operatorName || '主管'
    })
    return delay(list[idx])
  },
  // 兼容旧接口
  refund(payload: Partial<RefundRequest> & { receiptId: number; refundAmount: number; reason: string }) {
    return (this as any).createRefund(payload)
  },
  getTimeline(params: { receiptId?: number; orderId?: number; limit?: number } = {}) {
    let list = loadTimeline()
    if (params.receiptId) list = list.filter(e => e.receiptId === params.receiptId)
    if (params.orderId) list = list.filter(e => e.orderId === params.orderId)
    return delay(list.slice(0, params.limit ?? 50))
  },
  getInvoices(params: { page?: number; pageSize?: number; status?: string; customerName?: string } = {}) {
    let list = load<BizInvoice>(IV_KEY, seedInvoices)
    if (params.status) list = list.filter(i => i.status === params.status)
    if (params.customerName) list = list.filter(i => (i.customerName || '').includes(params.customerName!))
    return delay(paginate(list, params.page, params.pageSize))
  },
  createInvoice(data: Partial<BizInvoice>): Promise<BizInvoice> {
    const list = load<BizInvoice>(IV_KEY, seedInvoices)
    const id = (list.reduce((m, i) => Math.max(m, i.id), 0) || 0) + 1
    const amount = data.amount || 0
    const taxRate = data.taxRate ?? 6
    const next: BizInvoice = {
      id,
      invoiceNo: data.invoiceNo || `INV${new Date().getFullYear()}${pad4(id)}`,
      orderId: data.orderId || 0,
      orderNo: data.orderNo || '',
      customerId: data.customerId || 0,
      customerName: data.customerName || '',
      invoiceTitle: data.invoiceTitle || '',
      taxNo: data.taxNo || '',
      invoiceType: data.invoiceType || 'vat_general',
      amount,
      taxRate,
      taxAmount: +(amount * taxRate / 100).toFixed(2),
      status: data.status || 'pending',
      issueTime: '',
      mailNo: '',
      remark: data.remark || '',
      createTime: ts()
    }
    list.push(next)
    save(IV_KEY, list)
    return delay(next)
  },
  updateInvoice(data: Partial<BizInvoice> & { id: number }) {
    const list = load<BizInvoice>(IV_KEY, seedInvoices)
    const idx = list.findIndex(i => i.id === data.id)
    if (idx < 0) return Promise.reject(new Error('发票不存在'))
    const merged = { ...list[idx], ...data } as BizInvoice
    if (data.amount != null || data.taxRate != null) {
      merged.taxAmount = +(merged.amount * merged.taxRate / 100).toFixed(2)
    }
    if (data.status === 'issued' && !merged.issueTime) merged.issueTime = ts()
    list[idx] = merged
    save(IV_KEY, list)
    return delay(merged)
  },
  getSummary(): Promise<ReceiptSummary> {
    const receipts = load<BizReceipt>(RC_KEY, seedReceipts)
    const plans = load<BizReceiptPlan>(PL_KEY, seedPlans)
    const invoices = load<BizInvoice>(IV_KEY, seedInvoices)
    const refunds = load<RefundRequest>(RF_KEY, seedRefunds)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    // 逾期计算：以逾期阶梯判定为准，覆盖 status 为 overdue 与 pending 超期两种场景
    const overduePlans = plans.filter(p => p.status !== 'paid' && calcOverdueLevel(p).key !== 'none')
    return delay({
      totalReceipt: receipts.filter(r => r.status === 'confirmed').reduce((s, r) => s + r.amount, 0),
      pendingReceipt: receipts.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0),
      monthReceipt: receipts
        .filter(r => r.status === 'confirmed' && new Date(r.paymentTime.replace(' ', 'T')).getTime() >= monthStart.getTime())
        .reduce((s, r) => s + r.amount, 0),
      overdueAmount: overduePlans.reduce((s, p) => s + p.pendingAmount, 0),
      overdueCount: overduePlans.length,
      invoicePending: invoices.filter(i => i.status === 'pending').length,
      invoiceIssued: invoices.filter(i => i.status === 'issued' || i.status === 'mailed' || i.status === 'received').length,
      refundPending: refunds.filter(r => r.status === 'pending' || r.status === 'approved').length
    })
  }
}
