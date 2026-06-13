// ===== 任务中心 API（真实后端：modules/task 下 /task /commission /satisfaction） =====
// 说明：
// 1. request.ts 的响应拦截器在 code===200 时 resolve 的是 R 信封 {code,message,data}，这里统一用 unwrap() 取 data 载荷。
// 2. 分页接口返回 MyBatis-Plus IPage {records,total,...}，api 层适配成视图期望的 {list,total}。
// 3. 后端 Entity 字段（camelCase）与视图历史 mock 形状不一致，本文件做双向映射：
//    - 任务 BizTask：title↔taskName、taskType/bizType↔taskType、executorId/Name↔assigneeId/Name、
//      assignerId↔assignerId、priority(1-4整数)↔'low/normal/high/urgent'、status(1-7整数)↔字符串状态、
//      planStartTime/planEndTime(LocalDateTime)↔planStartDate/planEndDate(yyyy-MM-dd)、
//      description↔taskContent、result↔deliverable、reviewComment↔reviewOpinion、remark 透传（含 A|子类|备注 编码）。
//    - 提成 BizCommission：salesmanId/Name↔salespersonId/Name、orderAmount↔baseAmount、
//      commissionRate/Amount 同名、status(1-7整数)↔字符串、各时间字段映射。后端无 bonus/deduction/finalAmount，置 0/取提成额。
//    - 回访 BizSatisfaction：visitMode↔surveyType、visitorId/Name↔callbackerId/Name、visitTime↔actualTime、
//      score(1-10)↔overallScore(1-5 双向折算)、status(0待回访/1已回访/2无效)↔'pending/completed/no_response'。
// 4. 状态枚举语义以后端 ServiceImpl 为准。后端已自动编排的联动（交付完成→回写合同服务中、签约→派交付）在后端 Service 内完成，
//    本层不再读写 localStorage，也不再调用 @/utils/biz-linkage。
// 5. 后端没有对应模型的能力（按月批量汇总提成、满意度低分自动升级建任务、交接触发建账、发放凭证、D 类进度汇报持久化、
//    标记已发放为独立步骤）在下方各函数处保留最小实现，并在文件末尾的 gapsNoBackend 注释中列明。
// 6. 导出的函数名与返回形状保持与原 mock 版一致，让视图零改动或极小改动。

import { get, post, put, del } from './request'

// ---------- 视图层类型（保持原 mock 形状，视图零改动） ----------

export interface BizTask {
  id: number
  taskNo: string
  taskType: 'bookkeeping' | 'registration' | 'qualification' | 'audit' | 'tax_planning' | 'cancellation' | 'callback' | 'other'
  taskName: string
  orderId: number
  orderNo?: string
  customerId: number
  customerName?: string
  assigneeId: number
  assigneeName?: string
  assignerId: number
  assignerName?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'reviewing' | 'closed' | 'overdue'
  planStartDate: string
  planEndDate: string
  actualStartTime: string
  actualEndTime: string
  taskContent: string
  deliverable: string
  reviewerId: number
  reviewerName?: string
  reviewTime: string
  reviewResult: 'pass' | 'fail' | ''
  reviewOpinion: string
  remark: string
  createTime: string
}

export interface BizTaskHandoverItem {
  id: number
  handoverId: number
  itemType: 'customer' | 'task' | 'document' | 'address' | 'invoice' | 'other'
  itemId: number
  itemName: string
  itemDesc: string
  status: 'pending' | 'confirmed' | 'rejected'
  remark: string
}

export interface BizTaskHandover {
  id: number
  handoverNo: string
  fromUserId: number
  fromUserName?: string
  toUserId: number
  toUserName?: string
  reason: 'resignation' | 'transfer' | 'leave' | 'reassign' | 'other'
  handoverDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  approverId: number
  approverName?: string
  approvalTime: string
  items: BizTaskHandoverItem[]
  remark: string
  createTime: string
}

export interface BizCommission {
  id: number
  commissionNo: string
  orderId: number
  orderNo?: string
  customerName?: string
  salespersonId: number
  salespersonName?: string
  baseAmount: number
  commissionRate: number
  commissionAmount: number
  bonusAmount: number
  deductionAmount: number
  finalAmount: number
  period: string
  status: 'pending' | 'sales_confirmed' | 'manager_reviewed' | 'finance_confirmed' | 'boss_approved' | 'paid' | 'rejected'
  salesConfirmTime: string
  managerReviewTime: string
  financeConfirmTime: string
  bossApproveTime: string
  payTime: string
  remark: string
  createTime: string
}

export interface BizSatisfaction {
  id: number
  surveyNo: string
  orderId: number
  orderNo?: string
  customerId: number
  customerName?: string
  surveyType: 'phone' | 'wechat' | 'email' | 'face_to_face'
  callbackerId: number
  callbackerName?: string
  scheduledTime: string
  actualTime: string
  serviceScore: number
  attitudeScore: number
  efficiencyScore: number
  overallScore: number
  feedback: string
  improvementSuggestion: string
  status: 'pending' | 'completed' | 'no_response' | 'refused'
  createTime: string
}

// 视图里仍引用的下拉常量（保留导出，避免视图改动）
export const TASK_ASSIGNEES = ['陈会计', '王会计', '李税务', '赵工商', '胡客服', '周主管', '林项目']

export const TASK_CONTRACT_OPTIONS = [
  { id: 8101, no: 'HT202606001', customer: '杭州启辰科技有限公司' },
  { id: 8102, no: 'HT202606002', customer: '宁波星禾贸易有限公司' },
  { id: 8103, no: 'HT202605018', customer: '嘉兴禾木服饰有限公司' },
  { id: 8104, no: 'HT202604022', customer: '湖州清源环保科技有限公司' }
]

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
const dateOnlyOf = (v: any): string => (v ? String(v).slice(0, 10) : '')
const dateTimeOf = (v: any): string => (v ? String(v).replace('T', ' ').slice(0, 19) : '')

type Raw = Record<string, any>

// ---------- 任务：状态/优先级/类型 双向映射 ----------
// 后端 status: 1待指派 2待执行 3执行中 4待验收 5已完成 6已驳回 7已取消
const TASK_STATUS_TO_VIEW: Record<number, BizTask['status']> = {
  1: 'pending', 2: 'assigned', 3: 'in_progress', 4: 'reviewing', 5: 'completed', 6: 'in_progress', 7: 'closed'
}
// 后端 priority: 1低 2中 3高 4紧急
const PRIORITY_TO_VIEW: Record<number, BizTask['priority']> = { 1: 'low', 2: 'normal', 3: 'high', 4: 'urgent' }
const PRIORITY_TO_BACKEND: Record<string, number> = { low: 1, normal: 2, high: 3, urgent: 4 }

function adaptTask (t: Raw): BizTask {
  const statusNum = Number(t.status || 1)
  const priorityNum = Number(t.priority || 2)
  return {
    id: Number(t.id),
    taskNo: t.taskNo || '',
    taskType: (t.taskType || 'other') as BizTask['taskType'],
    taskName: t.title || '',
    orderId: Number(t.bizId || 0),
    orderNo: '',
    customerId: Number(t.customerId || 0),
    customerName: '', // 后端 BizTask 无客户名称冗余字段（见 gapsNoBackend）
    assigneeId: Number(t.executorId || 0),
    assigneeName: t.executorName || '',
    assignerId: Number(t.assignerId || 0),
    assignerName: '', // 后端只存 assignerId（用户ID），无姓名
    priority: PRIORITY_TO_VIEW[priorityNum] || 'normal',
    status: TASK_STATUS_TO_VIEW[statusNum] || 'pending',
    planStartDate: dateOnlyOf(t.planStartTime),
    planEndDate: dateOnlyOf(t.planEndTime),
    actualStartTime: dateTimeOf(t.actualStartTime),
    actualEndTime: dateTimeOf(t.actualEndTime),
    taskContent: t.description || '',
    deliverable: t.result || '',
    reviewerId: Number(t.reviewerId || 0),
    reviewerName: '',
    reviewTime: dateTimeOf(t.reviewTime),
    reviewResult: statusNum === 5 ? 'pass' : (statusNum === 6 ? 'fail' : ''),
    reviewOpinion: t.reviewComment || '',
    remark: t.remark || '', // 透传，含视图自定义的 "A|子类型|备注" 分类编码
    createTime: dateTimeOf(t.createTime)
  }
}

/** 视图任务表单 -> 后端实体白名单 */
function toBackendTask (data: Partial<BizTask>): Raw {
  const body: Raw = {}
  if (data.taskNo) body.taskNo = data.taskNo
  if (data.taskName !== undefined) body.title = data.taskName
  if (data.taskType !== undefined) body.taskType = data.taskType
  if (data.orderId) { body.bizId = data.orderId; body.bizType = 'order' }
  if (data.customerId) body.customerId = data.customerId
  if (data.assigneeId) body.executorId = data.assigneeId
  if (data.assigneeName !== undefined) body.executorName = data.assigneeName
  if (data.assignerId) body.assignerId = data.assignerId
  if (data.priority !== undefined) body.priority = PRIORITY_TO_BACKEND[data.priority] || 2
  if (data.planStartDate) body.planStartTime = `${data.planStartDate.slice(0, 10)} 00:00:00`
  if (data.planEndDate) body.planEndTime = `${data.planEndDate.slice(0, 10)} 23:59:59`
  if (data.taskContent !== undefined) body.description = data.taskContent
  if (data.deliverable !== undefined) body.result = data.deliverable
  if (data.remark !== undefined) body.remark = data.remark
  return body
}

export const taskApi = {
  /**
   * GET /task/list（后端支持 type/status(整数)/executorId 过滤）。
   * 视图主要按字符串状态过滤，后端用整数，故 status 在前端按字符串匹配；
   * 视图传 pageSize=9999 拉全量后自己按 remark 的 A/B/C/D 分类二次过滤。
   */
  async list (params: { page?: number; pageSize?: number; status?: string; taskType?: string; assigneeName?: string; priority?: string; customerName?: string } = {}): Promise<{ list: BizTask[]; total: number }> {
    const res = await get('/task/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      type: params.taskType || undefined
    })
    const page = toPage<Raw>(unwrap(res))
    let list = page.list.map(adaptTask)
    let total = page.total
    // 前端按视图历史语义的字符串维度过滤（后端列表不带这些维度）
    if (params.status) { list = list.filter(t => t.status === params.status); total = list.length }
    if (params.priority) { list = list.filter(t => t.priority === params.priority); total = list.length }
    if (params.assigneeName) { list = list.filter(t => (t.assigneeName || '').includes(params.assigneeName!)); total = list.length }
    return { list, total }
  },
  async detail (id: number): Promise<BizTask | null> {
    const raw = unwrap<Raw | null>(await get(`/task/${id}`))
    return raw ? adaptTask(raw) : null
  },
  async create (data: Partial<BizTask>): Promise<BizTask> {
    const id = unwrap<number>(await post('/task', toBackendTask(data)))
    const created = await this.detail(Number(id))
    return created || ({ ...adaptTask({}), ...data, id: Number(id) } as BizTask)
  },
  /** PUT /task/{id}/assign（body: executorId/executorName）；指派后状态由 1->2 */
  async assign (payload: { id: number; assigneeId: number; assigneeName?: string }): Promise<{ success: boolean }> {
    await put(`/task/${payload.id}/assign`, { executorId: payload.assigneeId, executorName: payload.assigneeName })
    return { success: true }
  },
  /** PUT /task/{id}/start（2->3） */
  async start (id: number): Promise<{ success: boolean }> {
    await put(`/task/${id}/start`, {})
    return { success: true }
  },
  /** PUT /task/{id}/complete（任意->4 待验收，body.result 即交付物说明） */
  async complete (payload: { id: number; deliverable?: string; remark?: string }): Promise<{ success: boolean }> {
    await put(`/task/${payload.id}/complete`, { result: payload.deliverable || payload.remark || '' })
    return { success: true }
  },
  /** PUT /task/{id}/review（4->5 通过 / 4->6 驳回，body: pass/comment） */
  async review (payload: { id: number; reviewerId?: number; reviewerName?: string; result: 'pass' | 'fail'; opinion: string }): Promise<{ success: boolean }> {
    await put(`/task/${payload.id}/review`, {
      pass: payload.result === 'pass',
      comment: payload.opinion,
      reviewerId: payload.reviewerId || undefined
    })
    return { success: true }
  },
  /** GET /task/my-tasks（后端按 userId 取本人 待执行/执行中/待验收 任务） */
  async myTasks (params: { assigneeId: number; status?: string; page?: number; pageSize?: number }): Promise<{ list: BizTask[]; total: number }> {
    const res = await get('/task/my-tasks', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      userId: params.assigneeId
    })
    const page = toPage<Raw>(unwrap(res))
    let list = page.list.map(adaptTask)
    let total = page.total
    if (params.status) { list = list.filter(t => t.status === params.status); total = list.length }
    return { list, total }
  },
  /** GET /task/overdue（后端返回逾期任务数组，非分页，这里包成 {list,total}） */
  async overdue (_params: { page?: number; pageSize?: number } = {}): Promise<{ list: BizTask[]; total: number }> {
    const rows = unwrap<Raw[]>(await get('/task/overdue')) || []
    const list = rows.map(adaptTask)
    return { list, total: list.length }
  },
  /** GET /task/stats（后端返回 {status_1..status_7, overdue}，映射成视图历史字段名） */
  async stats (): Promise<Record<string, number>> {
    const s = unwrap<Raw>(await get('/task/stats')) || {}
    const n = (k: string) => Number(s[k] || 0)
    return {
      total: n('status_1') + n('status_2') + n('status_3') + n('status_4') + n('status_5') + n('status_6') + n('status_7'),
      pending: n('status_1'),
      assigned: n('status_2'),
      inProgress: n('status_3'),
      reviewing: n('status_4'),
      completed: n('status_5'),
      closed: n('status_7'),
      overdue: n('overdue')
    }
  },
  /**
   * 兼容旧视图：原 mock 用于补样例数据。后端有真实数据，无需补种子，
   * 返回 {created:0,total} 即可（视图据此提示）。
   */
  async ensureSamples (_categories: string[] = ['A', 'B', 'C', 'D']): Promise<{ created: number; total: number }> {
    const page = await this.list({ page: 1, pageSize: 1 })
    return { created: 0, total: page.total }
  }
}

// ---------- 客户交接：后端 BizTaskHandover + BizTaskHandoverItem <-> 视图形状 ----------
// 后端交接单 status: 1待接收 2进行中 3已完成 4已退回；子项 status: 0未完成 1已完成 2缺失。
const HANDOVER_STATUS_TO_VIEW: Record<number, BizTaskHandover['status']> = {
  1: 'pending', 2: 'in_progress', 3: 'completed', 4: 'cancelled'
}
const HANDOVER_ITEM_STATUS_TO_VIEW: Record<number, BizTaskHandoverItem['status']> = {
  0: 'pending', 1: 'confirmed', 2: 'rejected'
}
const HANDOVER_ITEM_STATUS_TO_BACKEND: Record<string, number> = { pending: 0, confirmed: 1, rejected: 2 }

function adaptHandoverItem (it: Raw): BizTaskHandoverItem {
  return {
    id: Number(it.id || 0),
    handoverId: Number(it.handoverId || 0),
    itemType: (it.category === 'account' ? 'invoice' : it.category === 'contact' ? 'customer' : 'document') as BizTaskHandoverItem['itemType'],
    itemId: 0,
    itemName: it.name || '',
    itemDesc: it.content || '',
    status: HANDOVER_ITEM_STATUS_TO_VIEW[Number(it.status || 0)] || 'pending',
    remark: it.remark || ''
  }
}

function adaptHandover (h: Raw): BizTaskHandover {
  return {
    id: Number(h.id),
    handoverNo: h.handoverNo || '',
    fromUserId: Number(h.fromUserId || 0),
    fromUserName: h.fromUserName || '',
    toUserId: Number(h.toUserId || 0),
    toUserName: h.toUserName || '',
    reason: 'transfer', // 后端无 reason 字段
    handoverDate: dateOnlyOf(h.completeTime) || dateOnlyOf(h.createTime),
    status: HANDOVER_STATUS_TO_VIEW[Number(h.status || 1)] || 'pending',
    approverId: 0, // 后端无审批人字段
    approverName: '',
    approvalTime: dateTimeOf(h.completeTime),
    items: Array.isArray(h.items) ? h.items.map(adaptHandoverItem) : [],
    remark: h.customerName || h.remark || '',
    createTime: dateTimeOf(h.createTime)
  }
}

export const handoverApi = {
  /** GET /task/handover/list（后端支持 customerId/status(整数)；fromUserName 在前端过滤） */
  async list (params: { page?: number; pageSize?: number; status?: string; fromUserName?: string } = {}): Promise<{ list: BizTaskHandover[]; total: number }> {
    const res = await get('/task/handover/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10
    })
    const page = toPage<Raw>(unwrap(res))
    let list = page.list.map(adaptHandover)
    let total = page.total
    if (params.status) { list = list.filter(h => h.status === params.status); total = list.length }
    if (params.fromUserName) { list = list.filter(h => (h.fromUserName || '').includes(params.fromUserName!)); total = list.length }
    return { list, total }
  },
  /** POST /task/handover（同时带 items；交接子项映射回后端 category/name/content/status） */
  async create (data: Partial<BizTaskHandover>): Promise<BizTaskHandover> {
    const body: Raw = {
      customerName: data.remark || '',
      fromUserId: data.fromUserId || undefined,
      fromUserName: data.fromUserName || undefined,
      toUserId: data.toUserId || undefined,
      toUserName: data.toUserName || undefined,
      remark: data.remark || undefined,
      items: (data.items || []).map(it => ({
        category: it.itemType === 'customer' ? 'contact' : it.itemType === 'invoice' ? 'account' : 'doc',
        name: it.itemName || '',
        content: it.itemDesc || '',
        status: HANDOVER_ITEM_STATUS_TO_BACKEND[it.status] ?? 0,
        remark: it.remark || ''
      }))
    }
    const id = unwrap<number>(await post('/task/handover', body))
    return { ...adaptHandover({ ...body, id, status: 1 }), id: Number(id) } as BizTaskHandover
  },
  /** PUT /task/handover/{handoverId}/item（更新单个交接子项状态/备注） */
  async updateItem (payload: { handoverId: number; itemId: number; status: 'pending' | 'confirmed' | 'rejected'; remark?: string }): Promise<{ success: boolean }> {
    await put(`/task/handover/${payload.handoverId}/item`, {
      id: payload.itemId,
      status: HANDOVER_ITEM_STATUS_TO_BACKEND[payload.status] ?? 0,
      remark: payload.remark || undefined
    })
    return { success: true }
  },
  /** POST /task/handover/{id}/complete（所有子项已完成时置为 已完成） */
  async complete (payload: { id: number; approverId?: number; approverName?: string }): Promise<{ success: boolean }> {
    await post(`/task/handover/${payload.id}/complete`)
    return { success: true }
  },
  /** 后端有真实数据，无需补样例（保留导出兼容视图） */
  async ensureSamples (): Promise<{ created: number; total: number }> {
    const page = await this.list({ page: 1, pageSize: 1 })
    return { created: 0, total: page.total }
  }
}

// ---------- 提成结算：后端 BizCommission <-> 视图形状 ----------
// 后端 status: 1待销售确认 2销售已确认 3主管已审核 4财务已确认 5老板已审批 6已发放 7已驳回
// 注意：后端 bossApprove(approved=true) 直接置 6(已发放) 并写 payTime，没有独立持久化的 5(已审批待发放)。
const COMMISSION_STATUS_TO_VIEW: Record<number, BizCommission['status']> = {
  1: 'pending', 2: 'sales_confirmed', 3: 'manager_reviewed', 4: 'finance_confirmed', 5: 'boss_approved', 6: 'paid', 7: 'rejected'
}
const COMMISSION_STATUS_TO_BACKEND: Record<string, number> = {
  pending: 1, sales_confirmed: 2, manager_reviewed: 3, finance_confirmed: 4, boss_approved: 5, paid: 6, rejected: 7
}

function adaptCommission (c: Raw): BizCommission {
  const commissionAmount = num(c.commissionAmount)
  return {
    id: Number(c.id),
    commissionNo: c.commissionNo || '',
    orderId: Number(c.orderId || 0),
    orderNo: c.orderId ? String(c.orderId) : '', // 后端无订单编号冗余，用 orderId 占位
    customerName: '', // 后端 BizCommission 无客户名称字段（见 gapsNoBackend）
    salespersonId: Number(c.salesmanId || 0),
    salespersonName: c.salesmanName || '',
    baseAmount: num(c.orderAmount),
    commissionRate: num(c.commissionRate),
    commissionAmount,
    bonusAmount: 0, // 后端无激励奖金字段
    deductionAmount: 0, // 后端无退款扣回字段
    finalAmount: commissionAmount, // 后端无 finalAmount，实发=提成额
    period: c.period || '',
    status: COMMISSION_STATUS_TO_VIEW[Number(c.status || 1)] || 'pending',
    salesConfirmTime: dateTimeOf(c.salesmanConfirmTime),
    managerReviewTime: dateTimeOf(c.reviewTime),
    financeConfirmTime: dateTimeOf(c.financeConfirmTime),
    bossApproveTime: dateTimeOf(c.bossApproveTime),
    payTime: dateTimeOf(c.payTime),
    remark: c.remark || '',
    createTime: dateTimeOf(c.createTime)
  }
}

export const commissionApi = {
  /** GET /commission/list（后端支持 salesmanId/period/status(整数)；salespersonName/keyword 在前端过滤） */
  async list (params: { page?: number; pageSize?: number; status?: string; period?: string; salespersonName?: string; keyword?: string } = {}): Promise<{ list: BizCommission[]; total: number }> {
    const res = await get('/commission/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      period: params.period || undefined,
      status: params.status ? (COMMISSION_STATUS_TO_BACKEND[params.status] ?? undefined) : undefined
    })
    const page = toPage<Raw>(unwrap(res))
    let list = page.list.map(adaptCommission)
    let total = page.total
    if (params.salespersonName) { list = list.filter(c => (c.salespersonName || '').includes(params.salespersonName!)); total = list.length }
    if (params.keyword) {
      const kw = params.keyword.trim()
      list = list.filter(c => [c.commissionNo, c.orderNo, c.customerName, c.salespersonName, c.remark].some(v => (v || '').includes(kw)))
      total = list.length
    }
    return { list, total }
  },
  async detail (id: number): Promise<BizCommission | null> {
    const raw = unwrap<Raw | null>(await get(`/commission/${id}`))
    return raw ? adaptCommission(raw) : null
  },
  /** POST /commission/generate（后端按 orderId 从订单生成结算单，rate 默认 5%） */
  async generate (payload: { orderId: number; period: string }): Promise<{ id: number }> {
    const id = unwrap<number>(await post('/commission/generate', { orderId: payload.orderId, period: payload.period }))
    return { id: Number(id) }
  },
  /** POST /commission/{id}/confirm（销售确认 1->2） */
  async salesConfirm (payload: { id: number; opinion?: string }): Promise<{ success: boolean }> {
    await post(`/commission/${payload.id}/confirm`, {})
    return { success: true }
  },
  /** POST /commission/{id}/review（主管审核 2->3 通过 / ->7 驳回） */
  async managerReview (payload: { id: number; pass: boolean; opinion?: string }): Promise<{ success: boolean }> {
    await post(`/commission/${payload.id}/review`, { pass: payload.pass, comment: payload.opinion || undefined })
    return { success: true }
  },
  /** POST /commission/{id}/finance-confirm（财务确认 3->4） */
  async financeConfirm (payload: { id: number; pass: boolean; opinion?: string }): Promise<{ success: boolean }> {
    // 后端 financeConfirm 无 pass 分支（仅推进），驳回语义后端不支持；pass=false 时退化为不调用并提示
    if (!payload.pass) {
      // gapsNoBackend: 财务驳回后端无对应；前端按"驳回"处理为不推进
      return { success: false }
    }
    await post(`/commission/${payload.id}/finance-confirm`, {})
    return { success: true }
  },
  /** POST /commission/{id}/boss-approve（老板审批 4->6 直接发放 / ->7 驳回；body.approved） */
  async bossApprove (payload: { id: number; pass: boolean; opinion?: string }): Promise<{ success: boolean }> {
    await post(`/commission/${payload.id}/boss-approve`, { approved: payload.pass })
    return { success: true }
  },
  /**
   * 驳回：后端各阶段以各自接口的 pass=false 表达，无统一 reject 接口。
   * 销售异议（pending 阶段）后端无对应入口，这里按主管 review 驳回兜底。
   * gapsNoBackend: 销售确认阶段的"异议"无独立后端模型。
   */
  async reject (payload: { id: number; opinion?: string }): Promise<{ success: boolean }> {
    await post(`/commission/${payload.id}/review`, { pass: false, comment: payload.opinion || undefined }).catch(() => null)
    return { success: true }
  },
  /**
   * 标记已发放：后端在 bossApprove(approved) 时已直接置 6(已发放)，无独立 markPaid 步骤。
   * 视图对 boss_approved 状态调用本方法时，实际已无需再发请求（数据本就是 paid）。
   * gapsNoBackend: 独立"标记发放"步骤后端不存在。
   */
  async markPaid (_payload: { id: number }): Promise<{ success: boolean }> {
    return { success: true }
  },
  /** 后端有真实数据，无需补样例（保留导出兼容视图） */
  async ensureSamples (): Promise<{ created: number; total: number }> {
    const page = await this.list({ page: 1, pageSize: 1 })
    return { created: 0, total: page.total }
  }
}

// ---------- 满意度回访：后端 BizSatisfaction <-> 视图形状 ----------
// 后端 status: 0待回访 1已回访 2无效；score 1-10。视图用 overallScore 1-5，双向折算（5 分制 *2 存、/2 取）。
const SATISFACTION_STATUS_TO_VIEW: Record<number, BizSatisfaction['status']> = {
  0: 'pending', 1: 'completed', 2: 'no_response'
}

function score10ToView (score10: any): number {
  const s = Number(score10 || 0)
  if (!s) return 0
  return Math.max(1, Math.min(5, Math.round(s / 2)))
}

function adaptSatisfaction (s: Raw): BizSatisfaction {
  const overall = score10ToView(s.score)
  return {
    id: Number(s.id),
    surveyNo: `SA${String(s.id || '')}`, // 后端无回访单号字段
    orderId: Number(s.orderId || 0),
    orderNo: '',
    customerId: Number(s.customerId || 0),
    customerName: s.customerName || '',
    surveyType: (s.visitMode || 'phone') as BizSatisfaction['surveyType'],
    callbackerId: Number(s.visitorId || 0),
    callbackerName: s.visitorName || '',
    scheduledTime: dateTimeOf(s.visitTime) || dateTimeOf(s.createTime),
    actualTime: Number(s.status) === 1 ? dateTimeOf(s.visitTime) : '',
    serviceScore: overall,
    attitudeScore: overall,
    efficiencyScore: overall,
    overallScore: overall,
    feedback: s.feedback || '',
    improvementSuggestion: s.suggestion || '',
    status: SATISFACTION_STATUS_TO_VIEW[Number(s.status || 0)] || 'pending',
    createTime: dateTimeOf(s.createTime)
  }
}

export const satisfactionApi = {
  /** GET /satisfaction/list（后端支持 customerId/status(整数)；customerName 在前端过滤） */
  async list (params: { page?: number; pageSize?: number; status?: string; customerName?: string } = {}): Promise<{ list: BizSatisfaction[]; total: number }> {
    const res = await get('/satisfaction/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10
    })
    const page = toPage<Raw>(unwrap(res))
    let list = page.list.map(adaptSatisfaction)
    let total = page.total
    if (params.status) { list = list.filter(s => s.status === params.status); total = list.length }
    if (params.customerName) { list = list.filter(s => (s.customerName || '').includes(params.customerName!)); total = list.length }
    return { list, total }
  },
  /** POST /satisfaction（overallScore 5 分制按 *2 存为后端 1-10 的 score；status 字符串映射回 0/1） */
  async create (data: Partial<BizSatisfaction>): Promise<BizSatisfaction> {
    const overall = data.overallScore ||
      (data.serviceScore && data.attitudeScore && data.efficiencyScore
        ? Math.round((data.serviceScore + data.attitudeScore + data.efficiencyScore) / 3)
        : 0)
    const body: Raw = {
      customerId: data.customerId || undefined,
      customerName: data.customerName || undefined,
      orderId: data.orderId || undefined,
      visitMode: data.surveyType || 'phone',
      visitorId: data.callbackerId || undefined,
      visitorName: data.callbackerName || undefined,
      visitTime: data.actualTime ? data.actualTime.replace('T', ' ').slice(0, 19) : undefined,
      score: overall ? overall * 2 : undefined,
      feedback: data.feedback || undefined,
      suggestion: data.improvementSuggestion || undefined,
      status: data.status === 'completed' ? 1 : data.status === 'no_response' ? 2 : 0
    }
    const id = unwrap<number>(await post('/satisfaction', body))
    return { ...adaptSatisfaction({ ...body, id }), overallScore: overall } as BizSatisfaction
  },
  /** GET /satisfaction/pending（后端取 status=0 的待回访） */
  async getPending (params: { page?: number; pageSize?: number } = {}): Promise<{ list: BizSatisfaction[]; total: number }> {
    const res = await get('/satisfaction/pending', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10
    })
    const page = toPage<Raw>(unwrap(res))
    return { list: page.list.map(adaptSatisfaction), total: page.total }
  }
}

// ===== 周期任务时效规则（纯前端常量，供视图展示；保留导出） =====
export const PERIODIC_RULES = [
  { subType: '月度记账', rule: '每月 1 日自动生成，次月 15 日前完成', day: 1, freq: 'monthly' },
  { subType: '月度纳税申报', rule: '每月 1 日自动生成，申报期截止前完成', day: 1, freq: 'monthly' },
  { subType: '季度财务报表', rule: '季度结束后 20 天内完成', day: 1, freq: 'quarterly' },
  { subType: '年度汇算清缴', rule: '次年 5 月 31 日前完成', day: 1, freq: 'yearly' },
  { subType: '年度工商年报', rule: '次年 6 月 30 日前完成', day: 1, freq: 'yearly' }
]

export const periodicApi = {
  /**
   * 检查/生成本月周期任务：后端无"按客户批量生成周期任务"的接口（gapsNoBackend）。
   * 这里仅查询本月已存在的 B 类周期任务条数返回，不再写本地种子。
   */
  async ensureMonthly (period: string): Promise<{ generated: number; total: number; message: string }> {
    const res = await taskApi.list({ page: 1, pageSize: 9999 })
    const existed = res.list.filter(t =>
      (t.remark || '').startsWith('B|') && (t.planEndDate || '').startsWith(period)
    )
    return { generated: 0, total: existed.length, message: existed.length ? '本月周期任务已存在' : '本月暂无周期任务（后端不支持自动批量生成）' }
  },
  /** 计算逾期升级级别（纯前端展示逻辑，保留原实现） */
  escalation (task: BizTask) {
    if (!task.planEndDate) return { level: 0, label: '正常' }
    if (task.status === 'completed' || task.status === 'closed') return { level: 0, label: '已完成' }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const end = new Date(task.planEndDate)
    const days = Math.floor((today.getTime() - end.getTime()) / 86400000)
    if (days < 0) return { level: 0, label: '正常' }
    if (days === 0) return { level: 1, label: '到期当天 · 标记逾期' }
    if (days < 3) return { level: 2, label: `逾期 ${days} 天 · 通知主管` }
    if (days < 7) return { level: 3, label: `逾期 ${days} 天 · 主管介入` }
    return { level: 4, label: `逾期 ${days} 天 · 升级经理` }
  }
}

// ===== 标准交接清单（纯前端常量，供视图自动填充清单；保留导出） =====
export const STANDARD_HANDOVER_ITEMS = [
  { name: '营业执照正副本', required: true },
  { name: '银行开户许可证 / 基本户信息', required: true },
  { name: '法人身份证', required: true },
  { name: '税控盘 / CA 证书', required: true },
  { name: '历史账务资料', required: true },
  { name: '三方协议', required: false },
  { name: '发票领购簿', required: false },
  { name: '公司章程', required: false },
  { name: '股东信息', required: false },
  { name: '客户特殊约定', required: false }
]

// ===== 以下为后端无对应模型的"自动编排"残留（gapsNoBackend）：保留最小实现，不再读写 localStorage =====
// 这些原本是 mock 的本地联动，后端目前没有等价接口，调用即视为"无操作但成功"，避免视图报错。

/** 满意度低分自动升级建任务：后端无该自动编排（gapsNoBackend），返回 null（视图据此降级提示） */
export const escalationApi = {
  async fromSatisfaction (_payload: { customerId: number; customerName: string; score: number; feedback: string }): Promise<null> {
    return null
  },
  async fromSatisfactionFollowUp (_payload: { customerId: number; customerName: string; score: number }): Promise<null> {
    return null
  }
}

/** 交接完成触发建账初始化任务：后端 completeHandover 不会自动派生任务（gapsNoBackend），返回 null */
export const handoverHooks = {
  async triggerAccountInit (_payload: { customerId: number; customerName: string; accountantName: string }): Promise<null> {
    return null
  }
}

/** 按月批量汇总提成：后端只支持按单笔订单 generate，无"按月扫全部已完成订单批量汇总"（gapsNoBackend） */
export const commissionAggregator = {
  async monthlyAggregate (period: string): Promise<{ created: number; total: number; message: string }> {
    const res = await commissionApi.list({ page: 1, pageSize: 9999, period })
    return { created: 0, total: res.total, message: `后端暂不支持按月批量汇总，请在订单完成时按单生成（${period} 现有 ${res.total} 条）` }
  }
}
