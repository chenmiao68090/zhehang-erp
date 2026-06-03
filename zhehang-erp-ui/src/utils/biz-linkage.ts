/**
 * 业务模块联动工具（强化版）
 *
 * 实现完整业务闭环：
 *   公海私海 → 提单（客户签约中）
 *           → 财务（最后一期收款 自动生成合同草稿）
 *           → 合同（生效后 自动派发服务任务）
 *           → 任务（一次性任务全部完成 客户进入服务中）
 *           → 渠道（地址预留 / 售出 / 释放）
 * 以及：退款回滚、合同到期入藏金阁、订单完成豁免回收 等流程。
 *
 * 数据存储：直接操作各模块 API Mock 真实 localStorage Key，
 * 所有联动操作均写入 biz_linkage_log（保留最近 200 条），便于在前端独立验证联动效果。
 *
 * 联动函数统一返回 LinkageResult，便于调用方根据结果决定 UI 提示。
 */

import { setStorage } from './storage'

/** 真实业务 Key（与各模块 API Mock 数据 Key 严格保持一致） */
const KEYS = {
  ORDERS: 'biz_orders',
  ORDER_MIRROR: 'biz_order_list', // 兼容旧逻辑：订单完成镜像
  CONTRACTS: 'biz_contracts',
  CONTRACT_TEMPLATES: 'biz_contract_templates',
  TASKS: 'biz_tasks',
  COMMISSIONS: 'biz_commissions',
  RECEIPTS: 'biz_receipts',
  REFUNDS: 'biz_refunds',
  ADDRESSES: 'biz_address_resources',
  CUSTOMERS: 'biz_customer_list',
  LINKAGE_LOG: 'biz_linkage_log'
}

/** 联动函数统一返回结构 */
export interface LinkageResult {
  ok: boolean
  message: string
  data?: any
}

/* ============================== 通用工具 ============================== */

function pad(n: number, w = 2) { return String(n).padStart(w, '0') }
function ts(off = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function dateOnly(off = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function readList<T = any>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeList<T = any>(key: string, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // ignore quota / serialize 异常
  }
}

/** 联动日志：成功 / 失败 均写入，方便排查 */
function logLinkage(action: string, payload: Record<string, any>, result?: LinkageResult) {
  const entry = {
    time: ts(),
    action,
    ok: result?.ok ?? true,
    message: result?.message,
    payload
  }
  try {
    const list: any[] = JSON.parse(localStorage.getItem(KEYS.LINKAGE_LOG) || '[]')
    list.unshift(entry)
    localStorage.setItem(KEYS.LINKAGE_LOG, JSON.stringify(list.slice(0, 200)))
  } catch {
    // ignore
  }
}

function genContractNo(id: number): string {
  const d = new Date()
  return `HT${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(id, 4)}`
}

function genTaskNo(prefix: string, id: number): string {
  const d = new Date()
  return `WT${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${prefix}${pad(id, 3)}`
}

/* ====================== 1) 提单提交 → 客户签约中 ====================== */

/**
 * 提单提交时调用：客户状态 → "签约中"，保护期延长至 30 天。
 * 该函数与 order.ts 中的 triggerCustomerSigning 等价，作为通用钩子对外暴露，
 * 便于其它入口（如 CRM 直接挂单）也能复用。
 */
export function onCustomerSigning(customerId: number, orderNo?: string): LinkageResult {
  if (!customerId) {
    const r: LinkageResult = { ok: false, message: '客户ID缺失' }
    logLinkage('onCustomerSigning', { customerId, orderNo }, r)
    return r
  }
  const list = readList<any>(KEYS.CUSTOMERS)
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
  if (orderNo) customer.lastOrderNo = orderNo
  writeList(KEYS.CUSTOMERS, list)
  const r: LinkageResult = { ok: true, message: '客户状态已变更为「签约中」，保护期 30 天' }
  logLinkage('onCustomerSigning', { customerId, orderNo }, r)
  return r
}

/* ====================== 2) 提单驳回 → 客户恢复 ====================== */

/**
 * 提单被驳回时调用：客户回到上一跟进阶段，15 天回收规则重新生效。
 */
export function onCustomerRestore(customerId: number, orderNo?: string): LinkageResult {
  if (!customerId) {
    const r: LinkageResult = { ok: false, message: '客户ID缺失' }
    logLinkage('onCustomerRestore', { customerId, orderNo }, r)
    return r
  }
  const list = readList<any>(KEYS.CUSTOMERS)
  const customer = list.find(c => c.id === customerId)
  if (!customer) {
    const r: LinkageResult = { ok: false, message: '客户不存在' }
    logLinkage('onCustomerRestore', { customerId, orderNo }, r)
    return r
  }
  customer.followStage = customer.previousStage || 'following'
  customer.dealStatus = 'following'
  customer.protectDays = 15
  customer.protectExpireAt = new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString()
  if (orderNo) customer.lastRejectedOrder = orderNo
  writeList(KEYS.CUSTOMERS, list)
  const r: LinkageResult = { ok: true, message: '客户已恢复原跟进阶段，15 天回收规则生效' }
  logLinkage('onCustomerRestore', { customerId, orderNo }, r)
  return r
}

/* ============== 3) 财务确认收款 → 自动生成合同草稿 ============== */

function defaultRenewStages() {
  return [60, 45, 30, 15, 7, 0].map(stage => ({ stage, status: 'pending' as const }))
}

/**
 * 财务确认最后一期 / 一次性收款时调用：
 * 在合同模块创建一条与订单关联的草稿合同，待销售/法务进一步签署。
 * 若同一订单已存在合同，则跳过。
 */
export function onPaymentConfirmed(payload: {
  receiptId: number
  orderId: number
  isLast: boolean
  amount?: number
}): LinkageResult {
  if (!payload.isLast) {
    const r: LinkageResult = { ok: false, message: '非最后一期收款，跳过合同自动生成' }
    logLinkage('onPaymentConfirmed', payload, r)
    return r
  }
  if (!payload.orderId) {
    const r: LinkageResult = { ok: false, message: '订单ID缺失' }
    logLinkage('onPaymentConfirmed', payload, r)
    return r
  }
  const orders = readList<any>(KEYS.ORDERS)
  const order = orders.find(o => o.id === payload.orderId)
  if (!order) {
    const r: LinkageResult = { ok: false, message: '订单不存在，无法生成合同' }
    logLinkage('onPaymentConfirmed', payload, r)
    return r
  }
  const contracts = readList<any>(KEYS.CONTRACTS)
  if (contracts.some(c => c.orderId === payload.orderId)) {
    const r: LinkageResult = { ok: false, message: '该订单已存在合同，跳过自动生成' }
    logLinkage('onPaymentConfirmed', payload, r)
    return r
  }
  const templates = readList<any>(KEYS.CONTRACT_TEMPLATES)
  const item0 = (order.items && order.items[0]) || {}
  const serviceType = item0.serviceType || 'other'
  const tpl = templates.find(t => t.serviceType === serviceType && t.enabled !== false)
    || templates.find(t => t.enabled !== false)
    || templates[0]
  const id = (contracts.reduce((m: number, c: any) => Math.max(m, c.id || 0), 0) || 0) + 1
  const start = item0.startDate || dateOnly(0)
  const end = item0.endDate || dateOnly(365)
  const next = {
    id,
    contractNo: genContractNo(id),
    orderId: order.id,
    orderNo: order.orderNo || '',
    customerId: order.customerId,
    customerName: order.customerName || '',
    contractTemplateId: tpl?.id || 0,
    templateName: tpl?.templateName || '通用服务合同',
    contractName: `${order.customerName || ''}${tpl?.templateName || '服务合同'}`,
    contractAmount: payload.amount ?? order.finalAmount ?? 0,
    startDate: start,
    endDate: end,
    signMethod: 'electronic',
    signStatus: 'draft',
    partyAName: order.customerName || '',
    partyASigner: '',
    partyASignTime: '',
    partyBName: '浙杭企业服务有限公司',
    partyBSigner: '',
    partyBSignTime: '',
    contractFileUrl: `/mock/contract_${id}.pdf`,
    signedFileUrl: '',
    expireWarn: false,
    remark: `财务确认最后一期收款，自动生成合同草稿（收款 #${payload.receiptId}）`,
    createTime: ts(),
    version: 1,
    renewStages: defaultRenewStages(),
    linkageRecords: [
      {
        time: ts(),
        type: 'sign',
        title: '合同草稿自动生成',
        detail: `由财务确认收款触发（订单 ${order.orderNo || order.id}）`,
        by: '系统'
      }
    ]
  }
  contracts.push(next)
  writeList(KEYS.CONTRACTS, contracts)
  const r: LinkageResult = { ok: true, message: `合同草稿 ${next.contractNo} 已自动生成`, data: next }
  logLinkage('onPaymentConfirmed', payload, r)
  return r
}

/* ============== 4) 合同生效 → 自动拆解服务任务 ============== */

interface TaskTpl { name: string; days: number; type: string; priority?: 'low' | 'normal' | 'high' | 'urgent' }

const SERVICE_TASK_TEMPLATES: Record<string, TaskTpl[]> = {
  bookkeeping: [
    { name: '客户资料收集', days: 3, type: 'bookkeeping', priority: 'high' },
    { name: '建账初始化', days: 5, type: 'bookkeeping', priority: 'high' },
    { name: '税务报到', days: 3, type: 'bookkeeping', priority: 'normal' }
  ],
  registration: [
    { name: '公司注册', days: 18, type: 'registration', priority: 'high' }
  ],
  tax_planning: [
    { name: '税务诊断', days: 5, type: 'tax_planning', priority: 'high' },
    { name: '方案设计', days: 10, type: 'tax_planning', priority: 'normal' }
  ],
  qualification: [
    { name: '资质材料准备', days: 5, type: 'qualification', priority: 'normal' },
    { name: '提交申请', days: 5, type: 'qualification', priority: 'normal' },
    { name: '跟进结果', days: 10, type: 'qualification', priority: 'normal' }
  ],
  audit: [
    { name: '财务对账', days: 5, type: 'audit', priority: 'normal' },
    { name: '出具审计报告', days: 10, type: 'audit', priority: 'high' }
  ],
  cancellation: [
    { name: '税务清算', days: 15, type: 'cancellation', priority: 'normal' },
    { name: '工商注销', days: 30, type: 'cancellation', priority: 'normal' }
  ],
  other: [
    { name: '执行任务', days: 7, type: 'other', priority: 'normal' }
  ]
}

/**
 * 合同确认生效后调用：根据合同模板对应的服务类型自动派发任务清单。
 * 同时将客户状态置为「服务准备中」。
 */
export function onContractEffective(contractId: number): LinkageResult {
  const contracts = readList<any>(KEYS.CONTRACTS)
  const contract = contracts.find(c => c.id === contractId)
  if (!contract) {
    const r: LinkageResult = { ok: false, message: '合同不存在' }
    logLinkage('onContractEffective', { contractId }, r)
    return r
  }
  const templates = readList<any>(KEYS.CONTRACT_TEMPLATES)
  const tpl = templates.find(t => t.id === contract.contractTemplateId)
  const serviceType = (tpl?.serviceType as string) || 'other'
  const items = SERVICE_TASK_TEMPLATES[serviceType] || SERVICE_TASK_TEMPLATES.other

  // 防重派发：若已有同合同任务则跳过
  const tasks = readList<any>(KEYS.TASKS)
  const dispatched = tasks.filter(t =>
    (t.remark || '').includes('合同生效') && t.customerId === contract.customerId && t.orderId === contract.orderId
  )
  if (dispatched.length > 0) {
    const r: LinkageResult = { ok: false, message: '该合同已派发过任务，跳过' }
    logLinkage('onContractEffective', { contractId, serviceType }, r)
    return r
  }

  let nextId = (tasks.reduce((m: number, t: any) => Math.max(m, t.id || 0), 0) || 0) + 1
  let cursor = 0
  const created: any[] = []
  items.forEach(({ name, days, type, priority }) => {
    const startDate = dateOnly(cursor)
    const endDate = dateOnly(cursor + days)
    const task = {
      id: nextId,
      taskNo: genTaskNo('A', nextId),
      taskType: type,
      taskName: `${contract.customerName || ''} - ${name}`,
      orderId: contract.orderId || 0,
      orderNo: contract.orderNo || '',
      customerId: contract.customerId || 0,
      customerName: contract.customerName || '',
      assigneeId: 0,
      assigneeName: '',
      assignerId: 1002,
      assignerName: '主管',
      priority: priority || 'normal',
      status: 'pending',
      planStartDate: startDate,
      planEndDate: endDate,
      actualStartTime: '',
      actualEndTime: '',
      taskContent: `合同 ${contract.contractNo} 自动派发：${name}`,
      deliverable: '',
      reviewerId: 0,
      reviewerName: '',
      reviewTime: '',
      reviewResult: '',
      reviewOpinion: '',
      remark: `A|${name}|来源:合同生效`,
      createTime: ts()
    }
    tasks.push(task)
    created.push(task)
    nextId++
    cursor += days
  })
  writeList(KEYS.TASKS, tasks)

  // 客户状态：服务准备中
  const customers = readList<any>(KEYS.CUSTOMERS)
  let customer = customers.find(c => c.id === contract.customerId)
  if (!customer && contract.customerId) {
    customer = { id: contract.customerId }
    customers.push(customer)
  }
  if (customer) {
    customer.dealStatus = 'serving_prep'
    customer.followStage = 'serving_prep'
    customer.servicePreparedAt = ts()
    customer.exemptRecycle = true
    writeList(KEYS.CUSTOMERS, customers)
  }

  const r: LinkageResult = {
    ok: true,
    message: `已自动派发 ${created.length} 条服务任务`,
    data: { tasks: created, titles: items.map(i => i.name) }
  }
  logLinkage('onContractEffective', { contractId, serviceType }, r)
  return r
}

/* ============== 5) 任务全部完成 → 客户服务中 ============== */

/**
 * 检查指定客户的全部一次性任务是否都已完成，若是则将客户状态从
 * 「服务准备中」更新为「服务中」。
 *
 * 一次性任务定义：remark 不以 'B|' 开头（B 类为周期任务）。
 */
export function onAllTasksCompleted(customerId: number): LinkageResult {
  if (!customerId) {
    const r: LinkageResult = { ok: false, message: '客户ID缺失' }
    logLinkage('onAllTasksCompleted', { customerId }, r)
    return r
  }
  const tasks = readList<any>(KEYS.TASKS)
  const customerTasks = tasks.filter(t => t.customerId === customerId)
  if (customerTasks.length === 0) {
    const r: LinkageResult = { ok: false, message: '客户暂无关联任务' }
    logLinkage('onAllTasksCompleted', { customerId }, r)
    return r
  }
  const oneTimeTasks = customerTasks.filter(t => !(t.remark || '').startsWith('B|'))
  if (oneTimeTasks.length === 0) {
    const r: LinkageResult = { ok: false, message: '客户暂无一次性任务' }
    logLinkage('onAllTasksCompleted', { customerId }, r)
    return r
  }
  const allDone = oneTimeTasks.every(t => t.status === 'completed' || t.status === 'closed')
  if (!allDone) {
    const remain = oneTimeTasks.filter(t => t.status !== 'completed' && t.status !== 'closed').length
    const r: LinkageResult = { ok: false, message: `仍有 ${remain} 条一次性任务未完成` }
    logLinkage('onAllTasksCompleted', { customerId, remain }, r)
    return r
  }
  const customers = readList<any>(KEYS.CUSTOMERS)
  let customer = customers.find(c => c.id === customerId)
  if (!customer) {
    customer = { id: customerId }
    customers.push(customer)
  }
  customer.dealStatus = 'serving'
  customer.followStage = 'serving'
  customer.servingSince = ts()
  customer.exemptRecycle = true
  writeList(KEYS.CUSTOMERS, customers)
  const r: LinkageResult = {
    ok: true,
    message: `客户 ${customer.name || customerId} 进入「服务中」`,
    data: { customer, taskCount: oneTimeTasks.length }
  }
  logLinkage('onAllTasksCompleted', { customerId }, r)
  return r
}

/* ============== 6) 合同到期未续签 → 客户入藏金阁 ============== */

/**
 * 合同到期且无续签意向（或超期 15 天未续签）时调用：
 * 合同状态置为 expired，客户进入藏金阁公海池供全员认领。
 */
export function onContractExpiredNoRenew(contractId: number, reason = '到期未续签'): LinkageResult {
  const contracts = readList<any>(KEYS.CONTRACTS)
  const idx = contracts.findIndex(c => c.id === contractId)
  if (idx < 0) {
    const r: LinkageResult = { ok: false, message: '合同不存在' }
    logLinkage('onContractExpiredNoRenew', { contractId }, r)
    return r
  }
  const contract = contracts[idx]
  const records = contract.linkageRecords ? [...contract.linkageRecords] : []
  records.push({
    time: ts(),
    type: 'terminate',
    title: '到期未续签 · 入藏金阁',
    detail: reason,
    by: '系统'
  })
  contracts[idx] = {
    ...contract,
    signStatus: 'expired',
    expiredAt: ts(),
    expireWarn: false,
    linkageRecords: records
  }
  writeList(KEYS.CONTRACTS, contracts)

  // 客户进入藏金阁
  if (contract.customerId) {
    const customers = readList<any>(KEYS.CUSTOMERS)
    let customer = customers.find(c => c.id === contract.customerId)
    if (!customer) {
      customer = { id: contract.customerId, name: contract.customerName }
      customers.push(customer)
    }
    customer.poolType = 'treasure'
    customer.followStage = 'lost'
    customer.dealStatus = 'expired'
    customer.exemptRecycle = false
    customer.recycledAt = ts()
    customer.lastContractNo = contract.contractNo
    writeList(KEYS.CUSTOMERS, customers)
  }

  const r: LinkageResult = { ok: true, message: '合同已标记到期，客户已转入藏金阁公海池' }
  logLinkage('onContractExpiredNoRenew', { contractId, reason }, r)
  return r
}

/* ============== 7) 退款完成 → 合同终止 + 任务取消 + 提成扣回 ============== */

/**
 * 财务确认退款完成时调用：
 *  1) 关联订单 → cancelled
 *  2) 关联合同 → terminated
 *  3) 关联未完成任务 → closed（cancelledReason: order_refunded）
 *  4) 关联已结算提成 → revoked = true
 *  5) 客户进入冻结库
 */
export function onRefundCompleted(orderId: number, refundAmount?: number): LinkageResult {
  if (!orderId) {
    const r: LinkageResult = { ok: false, message: '订单ID缺失' }
    logLinkage('onRefundCompleted', { orderId, refundAmount }, r)
    return r
  }
  // 1) 订单
  const orders = readList<any>(KEYS.ORDERS)
  const oidx = orders.findIndex(o => o.id === orderId)
  let customerId = 0
  if (oidx >= 0) {
    customerId = orders[oidx].customerId || 0
    orders[oidx] = {
      ...orders[oidx],
      status: 'cancelled',
      refundedAt: ts(),
      refundAmount: refundAmount ?? orders[oidx].refundAmount ?? 0
    }
    writeList(KEYS.ORDERS, orders)
  }

  // 2) 合同
  const contracts = readList<any>(KEYS.CONTRACTS)
  const targetContractIds: number[] = []
  contracts.forEach((c, i) => {
    if (c.orderId === orderId && c.signStatus !== 'terminated') {
      const records = c.linkageRecords ? [...c.linkageRecords] : []
      records.push({ time: ts(), type: 'terminate', title: '合同终止（退款）', detail: '财务确认退款，关联合同自动终止', by: '系统' })
      contracts[i] = { ...c, signStatus: 'terminated', terminatedAt: ts(), linkageRecords: records }
      targetContractIds.push(c.id)
    }
  })
  if (targetContractIds.length) writeList(KEYS.CONTRACTS, contracts)

  // 3) 任务
  const tasks = readList<any>(KEYS.TASKS)
  let cancelledTasks = 0
  tasks.forEach((t, i) => {
    const matchOrder = t.orderId === orderId
    const matchContract = targetContractIds.includes(t.contractId)
    const stillRunning = t.status !== 'completed' && t.status !== 'closed'
    if ((matchOrder || matchContract) && stillRunning) {
      tasks[i] = {
        ...t,
        status: 'closed',
        actualEndTime: ts(),
        remark: `${t.remark || ''}|已取消(退款)`,
        reviewOpinion: '订单退款，任务自动取消',
        cancelledReason: 'order_refunded'
      }
      cancelledTasks++
    }
  })
  if (cancelledTasks > 0) writeList(KEYS.TASKS, tasks)

  // 4) 提成
  const commissions = readList<any>(KEYS.COMMISSIONS)
  let revokedCommissions = 0
  commissions.forEach((cm, i) => {
    if (cm.orderId === orderId && !cm.revoked) {
      commissions[i] = {
        ...cm,
        revoked: true,
        revokedAt: ts(),
        revokeReason: '关联订单退款',
        // 标记为待扣回，由财务后续处理
        status: cm.status === 'paid' ? cm.status : 'rejected',
        remark: `${cm.remark || ''}｜待扣回（退款 ¥${refundAmount ?? '-'}）`
      }
      revokedCommissions++
    }
  })
  if (revokedCommissions > 0) writeList(KEYS.COMMISSIONS, commissions)

  // 5) 客户冻结
  if (customerId) {
    const customers = readList<any>(KEYS.CUSTOMERS)
    let customer = customers.find(c => c.id === customerId)
    if (!customer) {
      customer = { id: customerId }
      customers.push(customer)
    }
    customer.poolType = 'frozen'
    customer.dealStatus = 'frozen'
    customer.followStage = 'frozen'
    customer.frozenAt = ts()
    customer.exemptRecycle = false
    writeList(KEYS.CUSTOMERS, customers)
  }

  const r: LinkageResult = {
    ok: true,
    message: `退款联动完成：${targetContractIds.length} 个合同终止 / ${cancelledTasks} 条任务取消 / ${revokedCommissions} 条提成待扣回`,
    data: {
      contracts: targetContractIds.length,
      cancelledTasks,
      revokedCommissions
    }
  }
  logLinkage('onRefundCompleted', { orderId, refundAmount }, r)
  return r
}

/* ============== 8) 渠道地址：预留 / 售出 / 释放 ============== */

/**
 * 销售在提单中选择挂靠地址 → 该地址置为「已预留」。
 * 24 小时未签约则由前端定时器或运维任务调用 onAddressReleased。
 */
export function onAddressReserved(payload: {
  addressId: number
  reservedBy?: number
  reservedByName?: string
  orderNo?: string
}): LinkageResult {
  if (!payload.addressId) {
    const r: LinkageResult = { ok: false, message: '地址ID缺失' }
    logLinkage('onAddressReserved', payload, r)
    return r
  }
  const list = readList<any>(KEYS.ADDRESSES)
  const idx = list.findIndex(a => a.id === payload.addressId)
  if (idx < 0) {
    const r: LinkageResult = { ok: false, message: '地址资源不存在' }
    logLinkage('onAddressReserved', payload, r)
    return r
  }
  if (list[idx].status === 'sold') {
    const r: LinkageResult = { ok: false, message: '该地址已售出，无法预留' }
    logLinkage('onAddressReserved', payload, r)
    return r
  }
  list[idx] = {
    ...list[idx],
    status: 'reserved',
    reservedBy: payload.reservedBy || list[idx].reservedBy || 0,
    reservedByName: payload.reservedByName || list[idx].reservedByName || '',
    reservedTime: ts(),
    reservedOrderNo: payload.orderNo || ''
  }
  writeList(KEYS.ADDRESSES, list)
  const r: LinkageResult = { ok: true, message: '地址已预留（24 小时内未签约自动释放）' }
  logLinkage('onAddressReserved', payload, r)
  return r
}

/**
 * 合同签署完成后：地址置为「已售出」，写入订单关联。
 */
export function onAddressSold(payload: { addressId: number; orderId: number; orderNo?: string }): LinkageResult {
  if (!payload.addressId) {
    const r: LinkageResult = { ok: false, message: '地址ID缺失' }
    logLinkage('onAddressSold', payload, r)
    return r
  }
  const list = readList<any>(KEYS.ADDRESSES)
  const idx = list.findIndex(a => a.id === payload.addressId)
  if (idx < 0) {
    const r: LinkageResult = { ok: false, message: '地址资源不存在' }
    logLinkage('onAddressSold', payload, r)
    return r
  }
  list[idx] = {
    ...list[idx],
    status: 'sold',
    soldOrderId: payload.orderId,
    soldOrderNo: payload.orderNo || '',
    soldTime: ts()
  }
  writeList(KEYS.ADDRESSES, list)
  const r: LinkageResult = { ok: true, message: '地址状态已变更为「已售出」' }
  logLinkage('onAddressSold', payload, r)
  return r
}

/**
 * 24 小时未签约自动释放：地址恢复为「未使用」。
 */
export function onAddressReleased(addressId: number, reason = '24小时未签约自动释放'): LinkageResult {
  if (!addressId) {
    const r: LinkageResult = { ok: false, message: '地址ID缺失' }
    logLinkage('onAddressReleased', { addressId, reason }, r)
    return r
  }
  const list = readList<any>(KEYS.ADDRESSES)
  const idx = list.findIndex(a => a.id === addressId)
  if (idx < 0) {
    const r: LinkageResult = { ok: false, message: '地址资源不存在' }
    logLinkage('onAddressReleased', { addressId, reason }, r)
    return r
  }
  if (list[idx].status !== 'reserved') {
    const r: LinkageResult = { ok: false, message: '仅预留状态可释放' }
    logLinkage('onAddressReleased', { addressId, reason, status: list[idx].status }, r)
    return r
  }
  list[idx] = {
    ...list[idx],
    status: 'available',
    reservedBy: 0,
    reservedByName: '',
    reservedTime: '',
    reservedOrderNo: '',
    releaseReason: reason
  }
  writeList(KEYS.ADDRESSES, list)
  const r: LinkageResult = { ok: true, message: '地址已释放为「未使用」' }
  logLinkage('onAddressReleased', { addressId, reason }, r)
  return r
}

/* ============== 续费阶梯 / 利润计算 / 豁免回收 ============== */

/**
 * 服务到期触发续费流程
 * 60天:通知销售  30天:通知主管  7天:最后努力  0天:入藏金阁
 */
export function onServiceExpiring(contractId: number, daysLeft: number): LinkageResult {
  const contracts = readList<any>(KEYS.CONTRACTS)
  const idx = contracts.findIndex(c => c.id === contractId)
  if (idx < 0) {
    const r: LinkageResult = { ok: false, message: '合同不存在' }
    logLinkage('onServiceExpiring', { contractId, daysLeft }, r)
    return r
  }
  let action = ''
  let target: 'sales' | 'manager' | 'team' | 'treasure' = 'sales'
  if (daysLeft <= 0) {
    return onContractExpiredNoRenew(contractId, '续费倒计时归零，自动入藏金阁')
  } else if (daysLeft <= 7) {
    action = '最后努力提醒'
    target = 'team'
  } else if (daysLeft <= 30) {
    action = '通知主管介入'
    target = 'manager'
  } else if (daysLeft <= 60) {
    action = '通知销售跟进'
    target = 'sales'
  } else {
    const r: LinkageResult = { ok: false, message: '尚未进入续费阶梯' }
    logLinkage('onServiceExpiring', { contractId, daysLeft }, r)
    return r
  }
  contracts[idx] = { ...contracts[idx], expireWarn: true }
  writeList(KEYS.CONTRACTS, contracts)
  const r: LinkageResult = { ok: true, message: `${action}（推送对象：${target}）` }
  logLinkage('onServiceExpiring', { contractId, daysLeft, action, target }, r)
  return r
}

/** 提单选择挂靠地址时计算利润 */
export function calculateAddressProfit(purchasePrice: number, salePrice: number) {
  const profit = salePrice - purchasePrice
  const profitRate = salePrice > 0 ? (profit / salePrice) * 100 : 0
  const result = {
    profit: Math.round(profit * 100) / 100,
    profitRate: Math.round(profitRate * 100) / 100
  }
  logLinkage('calculateAddressProfit', { purchasePrice, salePrice, ...result })
  return result
}

/** 客户成交后从回收机制豁免 */
export function exemptFromRecycle(customerId: number): LinkageResult {
  if (!customerId) {
    const r: LinkageResult = { ok: false, message: '客户ID缺失' }
    logLinkage('exemptFromRecycle', { customerId }, r)
    return r
  }
  const customers = readList<any>(KEYS.CUSTOMERS)
  let customer = customers.find(c => c.id === customerId)
  if (!customer) {
    customer = { id: customerId }
    customers.push(customer)
  }
  customer.dealStatus = customer.dealStatus === 'frozen' ? 'frozen' : 'closed'
  customer.exemptRecycle = true
  customer.exemptAt = ts()
  writeList(KEYS.CUSTOMERS, customers)
  try {
    setStorage(`customer_exempt_${customerId}`, '1')
  } catch {
    // ignore
  }
  const r: LinkageResult = { ok: true, message: '客户已豁免 15 天回收规则' }
  logLinkage('exemptFromRecycle', { customerId }, r)
  return r
}

/**
 * 订单完成（兼容旧逻辑）：
 *  - 同步 mirror 中订单状态
 *  - 客户豁免回收
 *  - 写入联动日志
 */
export function onOrderCompleted(orderId: number): LinkageResult {
  const mirror = readList<any>(KEYS.ORDER_MIRROR)
  const mIdx = mirror.findIndex(o => o.id === orderId)
  if (mIdx >= 0) {
    mirror[mIdx] = { ...mirror[mIdx], status: 'completed', completedAt: ts() }
    writeList(KEYS.ORDER_MIRROR, mirror)
  }
  const orders = readList<any>(KEYS.ORDERS)
  const order = orders.find(o => o.id === orderId)
  if (!order) {
    const r: LinkageResult = { ok: false, message: '订单不存在' }
    logLinkage('onOrderCompleted', { orderId }, r)
    return r
  }
  if (order.customerId) exemptFromRecycle(order.customerId)
  const r: LinkageResult = { ok: true, message: '订单完成联动已执行' }
  logLinkage('onOrderCompleted', { orderId, customerId: order.customerId }, r)
  return r
}

/** 导出便捷的命名空间，便于在 Vue 页面以 import { bizLinkage } 形式使用 */
export const bizLinkage = {
  onCustomerSigning,
  onCustomerRestore,
  onPaymentConfirmed,
  onContractEffective,
  onAllTasksCompleted,
  onContractExpiredNoRenew,
  onRefundCompleted,
  onAddressReserved,
  onAddressSold,
  onAddressReleased,
  onServiceExpiring,
  calculateAddressProfit,
  exemptFromRecycle,
  onOrderCompleted
}

export default bizLinkage
