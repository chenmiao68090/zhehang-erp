// ===== 任务中心 API（localStorage Mock 模式） =====

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

const TASK_KEY = 'biz_tasks'
const HO_KEY = 'biz_task_handovers'
const CM_KEY = 'biz_commissions'
const SA_KEY = 'biz_satisfactions'

export const TASK_ASSIGNEES = ['陈会计', '王会计', '李税务', '赵工商', '胡客服', '周主管', '林项目']

export const TASK_CONTRACT_OPTIONS = [
  { id: 8101, no: 'HT202606001', customer: '杭州启辰科技有限公司' },
  { id: 8102, no: 'HT202606002', customer: '宁波星禾贸易有限公司' },
  { id: 8103, no: 'HT202605018', customer: '嘉兴禾木服饰有限公司' },
  { id: 8104, no: 'HT202604022', customer: '湖州清源环保科技有限公司' }
]

const delay = <T>(d: T, ms = 100): Promise<T> => new Promise(r => setTimeout(() => r(d), ms))
const ts = (off = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}
const dateOnly = (off = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return d.toISOString().slice(0, 10)
}
function load<T>(key: string, builder: () => T[]): T[] {
  const raw = localStorage.getItem(key)
  if (raw) { try { return JSON.parse(raw) as T[] } catch { /* ignore */ } }
  const seed = builder()
  localStorage.setItem(key, JSON.stringify(seed))
  return seed
}
function save<T>(key: string, list: T[]) { localStorage.setItem(key, JSON.stringify(list)) }
function paginate<T>(list: T[], page = 1, pageSize = 10) {
  return { list: list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), total: list.length }
}

function seedTasks(): BizTask[] {
  const year = new Date().getFullYear()
  const month = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()
  const taskNo = (cat: string, id: number) => `WT${year}${cat}${String(id).padStart(4, '0')}`
  const task = (row: Partial<BizTask> & { id: number; cat: string; subType: string; taskName: string; status: BizTask['status'] }): BizTask => ({
    id: row.id,
    taskNo: row.taskNo || taskNo(row.cat, row.id),
    taskType: row.taskType || 'other',
    taskName: row.taskName,
    orderId: row.orderId || 0,
    orderNo: row.orderNo || '',
    customerId: row.customerId || 0,
    customerName: row.customerName || '',
    assigneeId: row.assigneeId || 0,
    assigneeName: row.assigneeName || '',
    assignerId: row.assignerId || 1002,
    assignerName: row.assignerName || '周主管',
    priority: row.priority || 'normal',
    status: row.status,
    planStartDate: row.planStartDate || dateOnly(0),
    planEndDate: row.planEndDate || dateOnly(7),
    actualStartTime: row.actualStartTime || '',
    actualEndTime: row.actualEndTime || '',
    taskContent: row.taskContent || '',
    deliverable: row.deliverable || '',
    reviewerId: row.reviewerId || 0,
    reviewerName: row.reviewerName || '',
    reviewTime: row.reviewTime || '',
    reviewResult: row.reviewResult || '',
    reviewOpinion: row.reviewOpinion || '',
    remark: row.remark || `${row.cat}|${row.subType}|${row.taskContent || ''}`,
    createTime: row.createTime || ts(-row.id)
  })
  const currentPlanEnd = `${month}-15`
  return [
    task({ id: 1, cat: 'A', subType: '客户资料收集', taskName: '杭州启辰科技 - 客户资料收集', customerId: 2001, customerName: '杭州启辰科技有限公司', priority: 'high', status: 'pending', planEndDate: dateOnly(3), taskContent: '收集执照、法人身份证、开户地址等建账资料。' }),
    task({ id: 2, cat: 'A', subType: '建账初始化', taskName: '宁波星禾贸易 - 建账初始化', customerId: 2002, customerName: '宁波星禾贸易有限公司', assigneeId: 2001, assigneeName: '陈会计', priority: 'normal', status: 'assigned', planEndDate: dateOnly(5), taskContent: '完成账套初始化并确认科目模板。' }),
    task({ id: 3, cat: 'A', subType: '税务报到', taskName: '绍兴麦田咨询 - 税务报到', customerId: 2003, customerName: '绍兴麦田咨询有限公司', assigneeId: 2101, assigneeName: '李税务', priority: 'urgent', status: 'in_progress', planEndDate: dateOnly(-2), actualStartTime: ts(-3), taskContent: '办理税务登记、税种核定和申报账号确认。' }),
    task({ id: 4, cat: 'A', subType: '银行签约', taskName: '浙江云帆实业 - 银行签约跟进', customerId: 2004, customerName: '浙江云帆实业有限公司', assigneeId: 2201, assigneeName: '赵工商', priority: 'normal', status: 'reviewing', planEndDate: dateOnly(-1), actualStartTime: ts(-4), actualEndTime: ts(-1), taskContent: '三方协议签约材料已提交, 等待验收。' }),
    task({ id: 5, cat: 'A', subType: '公司注册', taskName: '嘉兴禾木服饰 - 公司注册收尾', customerId: 2005, customerName: '嘉兴禾木服饰有限公司', assigneeId: 2201, assigneeName: '赵工商', priority: 'normal', status: 'completed', planEndDate: dateOnly(-8), actualStartTime: ts(-12), actualEndTime: ts(-9), reviewerId: 1002, reviewerName: '周主管', reviewTime: ts(-8), reviewResult: 'pass', reviewOpinion: '材料齐全, 已完成。', taskContent: '完成设立登记和执照领取。' }),
    task({ id: 6, cat: 'B', subType: '月度记账', taskName: '杭州启辰科技有限公司 - 月度记账', customerId: 2001, customerName: '杭州启辰科技有限公司', assigneeId: 2001, assigneeName: '陈会计', priority: 'normal', status: 'in_progress', taskType: 'bookkeeping', planStartDate: `${month}-01`, planEndDate: currentPlanEnd, actualStartTime: ts(-2), taskContent: `${month} 月度记账周期任务` }),
    task({ id: 7, cat: 'B', subType: '月度纳税申报', taskName: '杭州启辰科技有限公司 - 月度纳税申报', customerId: 2001, customerName: '杭州启辰科技有限公司', assigneeId: 2101, assigneeName: '李税务', priority: 'normal', status: 'assigned', taskType: 'bookkeeping', planStartDate: `${month}-01`, planEndDate: currentPlanEnd, taskContent: `${month} 月度纳税申报周期任务` }),
    task({ id: 8, cat: 'B', subType: '月度记账', taskName: '宁波星禾贸易有限公司 - 月度记账', customerId: 2002, customerName: '宁波星禾贸易有限公司', assigneeId: 2002, assigneeName: '王会计', priority: 'normal', status: 'reviewing', taskType: 'bookkeeping', planStartDate: `${month}-01`, planEndDate: currentPlanEnd, actualStartTime: ts(-6), actualEndTime: ts(-1), taskContent: `${month} 月度记账周期任务` }),
    task({ id: 9, cat: 'B', subType: '月度纳税申报', taskName: '宁波星禾贸易有限公司 - 月度纳税申报', customerId: 2002, customerName: '宁波星禾贸易有限公司', assigneeId: 2101, assigneeName: '李税务', priority: 'high', status: 'completed', taskType: 'bookkeeping', planStartDate: `${month}-01`, planEndDate: currentPlanEnd, actualStartTime: ts(-9), actualEndTime: ts(-4), reviewerId: 1002, reviewerName: '周主管', reviewTime: ts(-3), reviewResult: 'pass', reviewOpinion: '申报完成。', taskContent: `${month} 月度纳税申报周期任务` }),
    task({ id: 10, cat: 'C', subType: '客户挽回', taskName: '绍兴麦田咨询 - 客户挽回', customerId: 2003, customerName: '绍兴麦田咨询有限公司', assigneeId: 2301, assigneeName: '胡客服', priority: 'high', status: 'assigned', planEndDate: dateOnly(4), taskType: 'callback', taskContent: '满意度一般, 由项目部跟进客户反馈。' }),
    task({ id: 11, cat: 'D', subType: '老板安排', taskName: '浙江云帆实业 - 大客户续约方案', customerId: 2004, customerName: '浙江云帆实业有限公司', assigneeId: 2401, assigneeName: '林项目', priority: 'urgent', status: 'pending', planEndDate: dateOnly(2), taskContent: '整理大客户续约报价与服务承诺。' })
  ]
}

function seedHandovers(): BizTaskHandover[] {
  return []
}

function seedCommissions(): BizCommission[] {
  const month = (offset = 0) => {
    const d = new Date()
    d.setMonth(d.getMonth() + offset)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  const p0 = month(0)
  const p1 = month(-1)
  const p2 = month(-2)
  const rows: Array<Partial<BizCommission> & { id: number; baseAmount: number; commissionRate: number; status: BizCommission['status'] }> = [
    { id: 1, orderId: 9001, orderNo: 'DD202606001', customerName: '杭州启辰科技有限公司', salespersonId: 1003, salespersonName: '张小兰', baseAmount: 38600, commissionRate: 6, bonusAmount: 300, deductionAmount: 0, period: p0, status: 'pending', remark: '新签工商财税套餐' },
    { id: 2, orderId: 9002, orderNo: 'DD202606002', customerName: '宁波星禾贸易有限公司', salespersonId: 1004, salespersonName: '李明', baseAmount: 52800, commissionRate: 5, bonusAmount: 0, deductionAmount: 200, period: p0, status: 'sales_confirmed', salesConfirmTime: ts(-1), remark: '含客户退款扣回' },
    { id: 3, orderId: 9003, orderNo: 'DD202606003', customerName: '绍兴麦田咨询有限公司', salespersonId: 1005, salespersonName: '王倩', baseAmount: 24600, commissionRate: 7, bonusAmount: 200, deductionAmount: 0, period: p0, status: 'manager_reviewed', salesConfirmTime: ts(-2), managerReviewTime: ts(-1), remark: '续费激励' },
    { id: 4, orderId: 9004, orderNo: 'DD202606004', customerName: '浙江云帆实业有限公司', salespersonId: 1003, salespersonName: '张小兰', baseAmount: 66800, commissionRate: 5.5, bonusAmount: 500, deductionAmount: 0, period: p0, status: 'finance_confirmed', salesConfirmTime: ts(-3), managerReviewTime: ts(-2), financeConfirmTime: ts(-1), remark: '大客户奖励' },
    { id: 5, orderId: 9005, orderNo: 'DD202605011', customerName: '杭州佳禾餐饮管理有限公司', salespersonId: 1006, salespersonName: '赵晨', baseAmount: 41800, commissionRate: 6, bonusAmount: 0, deductionAmount: 0, period: p1, status: 'boss_approved', salesConfirmTime: ts(-12), managerReviewTime: ts(-11), financeConfirmTime: ts(-10), bossApproveTime: ts(-9), remark: '待财务发放' },
    { id: 6, orderId: 9006, orderNo: 'DD202605018', customerName: '嘉兴禾木服饰有限公司', salespersonId: 1004, salespersonName: '李明', baseAmount: 33600, commissionRate: 5, bonusAmount: 150, deductionAmount: 0, period: p1, status: 'paid', salesConfirmTime: ts(-20), managerReviewTime: ts(-19), financeConfirmTime: ts(-18), bossApproveTime: ts(-17), payTime: ts(-15), remark: '银行批量发放' },
    { id: 7, orderId: 9007, orderNo: 'DD202604022', customerName: '湖州清源环保科技有限公司', salespersonId: 1005, salespersonName: '王倩', baseAmount: 57800, commissionRate: 6, bonusAmount: 400, deductionAmount: 0, period: p2, status: 'paid', salesConfirmTime: ts(-50), managerReviewTime: ts(-49), financeConfirmTime: ts(-48), bossApproveTime: ts(-47), payTime: ts(-45), remark: '已发放' },
    { id: 8, orderId: 9008, orderNo: 'DD202604026', customerName: '杭州景行文化传播有限公司', salespersonId: 1006, salespersonName: '赵晨', baseAmount: 18800, commissionRate: 5, bonusAmount: 0, deductionAmount: 940, period: p2, status: 'rejected', salesConfirmTime: ts(-46), remark: '客户退款比例待复核' }
  ]
  return rows.map((row) => {
    const commissionAmount = +(row.baseAmount * row.commissionRate / 100).toFixed(2)
    const bonusAmount = row.bonusAmount || 0
    const deductionAmount = row.deductionAmount || 0
    return {
      id: row.id,
      commissionNo: `TC${String(row.period).replace('-', '')}${String(row.id).padStart(3, '0')}`,
      orderId: row.orderId || 0,
      orderNo: row.orderNo || '',
      customerName: row.customerName || '',
      salespersonId: row.salespersonId || 0,
      salespersonName: row.salespersonName || '',
      baseAmount: row.baseAmount,
      commissionRate: row.commissionRate,
      commissionAmount,
      bonusAmount,
      deductionAmount,
      finalAmount: commissionAmount + bonusAmount - deductionAmount,
      period: row.period || p0,
      status: row.status,
      salesConfirmTime: row.salesConfirmTime || '',
      managerReviewTime: row.managerReviewTime || '',
      financeConfirmTime: row.financeConfirmTime || '',
      bossApproveTime: row.bossApproveTime || '',
      payTime: row.payTime || '',
      remark: row.remark || '',
      createTime: row.createTime || ts(-row.id)
    }
  })
}

function seedSatisfactions(): BizSatisfaction[] {
  return []
}

function genNo(prefix: string, id: number) {
  const d = new Date()
  return `${prefix}${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(id).padStart(3, '0')}`
}

export const taskApi = {
  ensureSamples(categories: string[] = ['A', 'B', 'C', 'D']) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const seed = seedTasks()
    let nextId = (list.reduce((m, t) => Math.max(m, t.id), 0) || 0) + 1
    let created = 0
    categories.forEach((cat) => {
      const exists = list.some(t => (t.remark || '').startsWith(`${cat}|`))
      if (exists) return
      seed.filter(t => (t.remark || '').startsWith(`${cat}|`)).forEach((item) => {
        const next = {
          ...item,
          id: nextId,
          taskNo: item.taskNo.replace(/\d{4}$/, String(nextId).padStart(4, '0'))
        }
        list.push(next)
        nextId++
        created++
      })
    })
    if (created) save(TASK_KEY, list)
    return delay({ created, total: list.length })
  },
  list(params: { page?: number; pageSize?: number; status?: string; taskType?: string; assigneeName?: string; priority?: string; customerName?: string } = {}) {
    let list = load<BizTask>(TASK_KEY, seedTasks)
    if (params.status) list = list.filter(t => t.status === params.status)
    if (params.taskType) list = list.filter(t => t.taskType === params.taskType)
    if (params.assigneeName) list = list.filter(t => (t.assigneeName || '').includes(params.assigneeName!))
    if (params.priority) list = list.filter(t => t.priority === params.priority)
    if (params.customerName) list = list.filter(t => (t.customerName || '').includes(params.customerName!))
    list = list.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''))
    return delay(paginate(list, params.page, params.pageSize))
  },
  detail(id: number) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    return delay(list.find(t => t.id === id) || null)
  },
  create(data: Partial<BizTask>): Promise<BizTask> {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const id = (list.reduce((m, t) => Math.max(m, t.id), 0) || 0) + 1
    const next: BizTask = {
      id,
      taskNo: data.taskNo || genNo('WT', id),
      taskType: data.taskType || 'other',
      taskName: data.taskName || `任务${id}`,
      orderId: data.orderId || 0,
      orderNo: data.orderNo || '',
      customerId: data.customerId || 0,
      customerName: data.customerName || '',
      assigneeId: data.assigneeId || 0,
      assigneeName: data.assigneeName || '',
      assignerId: data.assignerId || 1002,
      assignerName: data.assignerName || '主管',
      priority: data.priority || 'normal',
      status: data.assigneeId ? 'assigned' : 'pending',
      planStartDate: data.planStartDate || dateOnly(),
      planEndDate: data.planEndDate || dateOnly(7),
      actualStartTime: '',
      actualEndTime: '',
      taskContent: data.taskContent || '',
      deliverable: '',
      reviewerId: 0, reviewerName: '', reviewTime: '',
      reviewResult: '', reviewOpinion: '',
      remark: data.remark || '',
      createTime: ts()
    }
    list.push(next)
    save(TASK_KEY, list)
    return delay(next)
  },
  assign(payload: { id: number; assigneeId: number; assigneeName?: string }) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const idx = list.findIndex(t => t.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('任务不存在'))
    if (list[idx].status !== 'pending' && list[idx].status !== 'assigned') {
      return Promise.reject(new Error('当前状态不可指派'))
    }
    list[idx] = {
      ...list[idx],
      assigneeId: payload.assigneeId,
      assigneeName: payload.assigneeName || list[idx].assigneeName,
      status: 'assigned'
    }
    save(TASK_KEY, list)
    return delay(list[idx])
  },
  start(id: number) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const idx = list.findIndex(t => t.id === id)
    if (idx < 0) return Promise.reject(new Error('任务不存在'))
    if (list[idx].status !== 'assigned') return Promise.reject(new Error('任务未被指派或已开始'))
    list[idx] = { ...list[idx], status: 'in_progress', actualStartTime: ts() }
    save(TASK_KEY, list)
    return delay(list[idx])
  },
  complete(payload: { id: number; deliverable?: string; remark?: string }) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const idx = list.findIndex(t => t.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('任务不存在'))
    if (list[idx].status !== 'in_progress' && list[idx].status !== 'overdue') {
      return Promise.reject(new Error('当前状态不可提交完成'))
    }
    list[idx] = {
      ...list[idx],
      status: 'reviewing',
      actualEndTime: ts(),
      deliverable: payload.deliverable || list[idx].deliverable,
      remark: payload.remark || list[idx].remark
    }
    save(TASK_KEY, list)
    return delay(list[idx])
  },
  review(payload: { id: number; reviewerId?: number; reviewerName?: string; result: 'pass' | 'fail'; opinion: string }) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const idx = list.findIndex(t => t.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('任务不存在'))
    if (list[idx].status !== 'reviewing') return Promise.reject(new Error('任务未在复核中'))
    list[idx] = {
      ...list[idx],
      reviewerId: payload.reviewerId || 1002,
      reviewerName: payload.reviewerName || '主管',
      reviewTime: ts(),
      reviewResult: payload.result,
      reviewOpinion: payload.opinion,
      status: payload.result === 'pass' ? 'completed' : 'in_progress',
      actualEndTime: payload.result === 'pass' ? list[idx].actualEndTime : ''
    }
    save(TASK_KEY, list)
    return delay(list[idx])
  },
  myTasks(params: { assigneeId: number; status?: string; page?: number; pageSize?: number }) {
    let list = load<BizTask>(TASK_KEY, seedTasks).filter(t => t.assigneeId === params.assigneeId)
    if (params.status) list = list.filter(t => t.status === params.status)
    return delay(paginate(list, params.page, params.pageSize))
  },
  overdue(params: { page?: number; pageSize?: number } = {}) {
    const today = dateOnly()
    const list = load<BizTask>(TASK_KEY, seedTasks).filter(t =>
      t.status !== 'completed' && t.status !== 'closed' && t.planEndDate < today
    )
    return delay(paginate(list, params.page, params.pageSize))
  },
  stats() {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    return delay({
      total: list.length,
      pending: list.filter(t => t.status === 'pending').length,
      assigned: list.filter(t => t.status === 'assigned').length,
      inProgress: list.filter(t => t.status === 'in_progress').length,
      reviewing: list.filter(t => t.status === 'reviewing').length,
      completed: list.filter(t => t.status === 'completed').length,
      closed: list.filter(t => t.status === 'closed').length,
      overdue: list.filter(t => t.status === 'overdue').length
    })
  }
}

export const handoverApi = {
  list(params: { page?: number; pageSize?: number; status?: string; fromUserName?: string } = {}) {
    let list = load<BizTaskHandover>(HO_KEY, seedHandovers)
    if (params.status) list = list.filter(h => h.status === params.status)
    if (params.fromUserName) list = list.filter(h => (h.fromUserName || '').includes(params.fromUserName!))
    return delay(paginate(list, params.page, params.pageSize))
  },
  create(data: Partial<BizTaskHandover>): Promise<BizTaskHandover> {
    const list = load<BizTaskHandover>(HO_KEY, seedHandovers)
    const id = (list.reduce((m, h) => Math.max(m, h.id), 0) || 0) + 1
    const items = (data.items || []).map((it, i) => ({
      ...it,
      id: id * 100 + i + 1,
      handoverId: id,
      status: it.status || 'pending'
    }) as BizTaskHandoverItem)
    const next: BizTaskHandover = {
      id,
      handoverNo: data.handoverNo || genNo('HO', id),
      fromUserId: data.fromUserId || 0,
      fromUserName: data.fromUserName || '',
      toUserId: data.toUserId || 0,
      toUserName: data.toUserName || '',
      reason: data.reason || 'transfer',
      handoverDate: data.handoverDate || dateOnly(),
      status: 'pending',
      approverId: 0, approverName: '', approvalTime: '',
      items,
      remark: data.remark || '',
      createTime: ts()
    }
    list.push(next)
    save(HO_KEY, list)
    return delay(next)
  },
  updateItem(payload: { handoverId: number; itemId: number; status: 'pending' | 'confirmed' | 'rejected'; remark?: string }) {
    const list = load<BizTaskHandover>(HO_KEY, seedHandovers)
    const idx = list.findIndex(h => h.id === payload.handoverId)
    if (idx < 0) return Promise.reject(new Error('交接单不存在'))
    const items = list[idx].items.map(it =>
      it.id === payload.itemId ? { ...it, status: payload.status, remark: payload.remark || it.remark } : it
    )
    list[idx] = { ...list[idx], items, status: list[idx].status === 'pending' ? 'in_progress' : list[idx].status }
    save(HO_KEY, list)
    return delay(list[idx])
  },
  complete(payload: { id: number; approverId?: number; approverName?: string }) {
    const list = load<BizTaskHandover>(HO_KEY, seedHandovers)
    const idx = list.findIndex(h => h.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('交接单不存在'))
    if (list[idx].items.some(it => it.status !== 'confirmed')) {
      return Promise.reject(new Error('仍有未确认项'))
    }
    list[idx] = {
      ...list[idx],
      status: 'completed',
      approverId: payload.approverId || 1002,
      approverName: payload.approverName || '主管',
      approvalTime: ts()
    }
    save(HO_KEY, list)
    return delay(list[idx])
  }
}

export const commissionApi = {
  list(params: { page?: number; pageSize?: number; status?: string; period?: string; salespersonName?: string; keyword?: string } = {}) {
    let list = load<BizCommission>(CM_KEY, seedCommissions)
    if (params.status) list = list.filter(c => c.status === params.status)
    if (params.period) list = list.filter(c => c.period === params.period)
    if (params.salespersonName) list = list.filter(c => (c.salespersonName || '').includes(params.salespersonName!))
    if (params.keyword) {
      const kw = params.keyword.trim()
      list = list.filter(c => [c.commissionNo, c.orderNo, c.customerName, c.salespersonName, c.remark].some(v => (v || '').includes(kw)))
    }
    list = list.sort((a, b) => {
      const periodCompare = (b.period || '').localeCompare(a.period || '')
      return periodCompare || (b.createTime || '').localeCompare(a.createTime || '')
    })
    return delay(paginate(list, params.page, params.pageSize))
  },
  ensureSamples() {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    if (list.length > 0) return delay({ created: 0, total: list.length })
    const seed = seedCommissions()
    save(CM_KEY, seed)
    return delay({ created: seed.length, total: seed.length })
  },
  detail(id: number) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    return delay(list.find(c => c.id === id) || null)
  },
  generate(payload: { orderId: number; orderNo?: string; customerName?: string; salespersonId: number; salespersonName?: string; baseAmount: number; commissionRate: number; period: string; bonusAmount?: number; deductionAmount?: number }) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const id = (list.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
    const commissionAmount = +(payload.baseAmount * payload.commissionRate / 100).toFixed(2)
    const bonus = payload.bonusAmount || 0
    const deduction = payload.deductionAmount || 0
    const next: BizCommission = {
      id,
      commissionNo: `TC${payload.period.replace('-', '')}${String(id).padStart(3, '0')}`,
      orderId: payload.orderId,
      orderNo: payload.orderNo || '',
      customerName: payload.customerName || '',
      salespersonId: payload.salespersonId,
      salespersonName: payload.salespersonName || '',
      baseAmount: payload.baseAmount,
      commissionRate: payload.commissionRate,
      commissionAmount,
      bonusAmount: bonus,
      deductionAmount: deduction,
      finalAmount: commissionAmount + bonus - deduction,
      period: payload.period,
      status: 'pending',
      salesConfirmTime: '', managerReviewTime: '', financeConfirmTime: '', bossApproveTime: '', payTime: '',
      remark: '', createTime: ts()
    }
    list.push(next)
    save(CM_KEY, list)
    return delay(next)
  },
  salesConfirm(payload: { id: number; opinion?: string }) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('结算单不存在'))
    if (list[idx].status !== 'pending') return Promise.reject(new Error('结算单状态错误'))
    list[idx] = { ...list[idx], status: 'sales_confirmed', salesConfirmTime: ts(), remark: payload.opinion || list[idx].remark }
    save(CM_KEY, list)
    return delay(list[idx])
  },
  managerReview(payload: { id: number; pass: boolean; opinion?: string }) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('结算单不存在'))
    if (list[idx].status !== 'sales_confirmed') return Promise.reject(new Error('销售未确认'))
    list[idx] = { ...list[idx], status: payload.pass ? 'manager_reviewed' : 'rejected', managerReviewTime: ts(), remark: payload.opinion || list[idx].remark }
    save(CM_KEY, list)
    return delay(list[idx])
  },
  financeConfirm(payload: { id: number; pass: boolean; opinion?: string }) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('结算单不存在'))
    if (list[idx].status !== 'manager_reviewed') return Promise.reject(new Error('主管未复核'))
    list[idx] = { ...list[idx], status: payload.pass ? 'finance_confirmed' : 'rejected', financeConfirmTime: ts(), remark: payload.opinion || list[idx].remark }
    save(CM_KEY, list)
    return delay(list[idx])
  },
  bossApprove(payload: { id: number; pass: boolean; opinion?: string }) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('结算单不存在'))
    if (list[idx].status !== 'finance_confirmed') return Promise.reject(new Error('财务未确认'))
    list[idx] = { ...list[idx], status: payload.pass ? 'boss_approved' : 'rejected', bossApproveTime: ts(), remark: payload.opinion || list[idx].remark }
    save(CM_KEY, list)
    return delay(list[idx])
  },
  reject(payload: { id: number; opinion?: string }) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('结算单不存在'))
    list[idx] = { ...list[idx], status: 'rejected', remark: payload.opinion || list[idx].remark }
    save(CM_KEY, list)
    return delay(list[idx])
  },
  markPaid(payload: { id: number }) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('结算单不存在'))
    if (list[idx].status !== 'boss_approved') return Promise.reject(new Error('结算单未完成审批'))
    list[idx] = { ...list[idx], status: 'paid', payTime: ts() }
    save(CM_KEY, list)
    return delay(list[idx])
  }
}

// ===== 周期任务自动生成 =====
export const PERIODIC_RULES = [
  { subType: '月度记账', rule: '每月 1 日自动生成，次月 15 日前完成', day: 1, freq: 'monthly' },
  { subType: '月度纳税申报', rule: '每月 1 日自动生成，申报期截止前完成', day: 1, freq: 'monthly' },
  { subType: '季度财务报表', rule: '季度结束后 20 天内完成', day: 1, freq: 'quarterly' },
  { subType: '年度汇算清缴', rule: '次年 5 月 31 日前完成', day: 1, freq: 'yearly' },
  { subType: '年度工商年报', rule: '次年 6 月 30 日前完成', day: 1, freq: 'yearly' }
]

export const periodicApi = {
  // 检查并自动生成本月周期任务（按客户数量批量创建）
  ensureMonthly(period: string) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const existed = list.filter(t =>
      (t.remark || '').startsWith('B|') && (t.planEndDate || '').startsWith(period)
    )
    if (existed.length > 0) {
      return delay({ generated: 0, total: existed.length, message: '本月任务已生成' })
    }
    const customers = [
      { id: 2001, name: '杭州启辰科技有限公司', accountant: '陈会计', taxpayer: '李税务' },
      { id: 2002, name: '宁波星禾贸易有限公司', accountant: '王会计', taxpayer: '李税务' },
      { id: 2003, name: '绍兴麦田咨询有限公司', accountant: '陈会计', taxpayer: '赵工商' },
      { id: 2004, name: '浙江云帆实业有限公司', accountant: '王会计', taxpayer: '李税务' }
    ]
    let nextId = list.reduce((m, t) => Math.max(m, t.id), 0) + 1
    const [y, mo] = period.split('-').map(Number)
    const lastDay = new Date(y, mo, 0).getDate()
    const planEnd = `${period}-${String(Math.min(15, lastDay)).padStart(2, '0')}`
    const planStart = `${period}-01`
    let generated = 0
    customers.forEach((c, i) => {
      list.push({
        id: nextId, taskNo: `WT${y}B${String(nextId).padStart(4, '0')}`,
        taskType: 'bookkeeping', taskName: `${c.name} - 月度记账`, orderId: 0, orderNo: '',
        customerId: c.id, customerName: c.name,
        assigneeId: 2000 + i, assigneeName: c.accountant,
        assignerId: 1002, assignerName: '',
        priority: 'normal', status: 'assigned',
        planStartDate: planStart, planEndDate: planEnd,
        actualStartTime: '', actualEndTime: '',
        taskContent: `${period} 月度记账周期任务`, deliverable: '',
        reviewerId: 0, reviewerName: '', reviewTime: '',
        reviewResult: '', reviewOpinion: '',
        remark: 'B|月度记账|',
        createTime: ts()
      } as BizTask)
      nextId++
      generated++
      list.push({
        id: nextId, taskNo: `WT${y}B${String(nextId).padStart(4, '0')}`,
        taskType: 'bookkeeping', taskName: `${c.name} - 月度纳税申报`, orderId: 0, orderNo: '',
        customerId: c.id, customerName: c.name,
        assigneeId: 2100 + i, assigneeName: c.taxpayer,
        assignerId: 1002, assignerName: '',
        priority: 'normal', status: 'assigned',
        planStartDate: planStart, planEndDate: planEnd,
        actualStartTime: '', actualEndTime: '',
        taskContent: `${period} 月度纳税申报周期任务`, deliverable: '',
        reviewerId: 0, reviewerName: '', reviewTime: '',
        reviewResult: '', reviewOpinion: '',
        remark: 'B|月度纳税申报|',
        createTime: ts()
      } as BizTask)
      nextId++
      generated++
    })
    save(TASK_KEY, list)
    return delay({ generated, total: generated, message: `已为 ${customers.length} 个客户批量生成 ${generated} 条周期任务` })
  },
  // 计算逾期升级级别
  escalation(task: BizTask) {
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

// ===== 项目部子任务（C 类） =====
export interface BizSubTask {
  id: number; projectId: number; name: string;
  assigneeId: number; assigneeName: string;
  planStart: string; planEnd: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  remark: string
}

// ===== 满意度评分自动升级（创建 C/D 类任务） =====
export const escalationApi = {
  // 评分 <=2 时自动创建升级任务，1分→D类老板，2分→C类项目部
  fromSatisfaction(payload: { customerId: number; customerName: string; score: number; feedback: string }) {
    if (payload.score >= 3) return Promise.resolve(null)
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const id = (list.reduce((m, t) => Math.max(m, t.id), 0) || 0) + 1
    const isComplaint = payload.score === 1
    const cat = isComplaint ? 'D' : 'C'
    const subType = isComplaint ? '客户投诉处理' : '客户挽回'
    const next: BizTask = {
      id, taskNo: `WT${new Date().getFullYear()}${cat}${String(id).padStart(4, '0')}`,
      taskType: 'callback', taskName: `${payload.customerName} - ${subType}（满意度 ${payload.score} 分）`,
      orderId: 0, orderNo: '',
      customerId: payload.customerId, customerName: payload.customerName,
      assigneeId: isComplaint ? 9001 : 1002,
      assigneeName: '',
      assignerId: 2050, assignerName: '客服胡蕊',
      priority: 'urgent', status: 'assigned',
      planStartDate: dateOnly(0), planEndDate: dateOnly(isComplaint ? 1 : 7),
      actualStartTime: '', actualEndTime: '',
      taskContent: `因满意度评分仅 ${payload.score} 分自动升级。客户反馈：${payload.feedback || '（无）'}`,
      deliverable: '',
      reviewerId: 0, reviewerName: '', reviewTime: '',
      reviewResult: '', reviewOpinion: '',
      remark: `${cat}|${subType}|来源:满意度回访`,
      createTime: ts()
    }
    list.push(next)
    save(TASK_KEY, list)
    return delay(next)
  },
  // 3分自动创建 15 天后再次回访
  fromSatisfactionFollowUp(payload: { customerId: number; customerName: string; score: number }) {
    if (payload.score !== 3) return Promise.resolve(null)
    const list = load<BizSatisfaction>(SA_KEY, seedSatisfactions)
    const id = (list.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1
    const next: BizSatisfaction = {
      id, surveyNo: genNo('SA', id),
      orderId: 0, orderNo: '',
      customerId: payload.customerId, customerName: payload.customerName,
      surveyType: 'phone',
      callbackerId: 2050, callbackerName: '客服胡蕊',
      scheduledTime: ts(15), actualTime: '',
      serviceScore: 0, attitudeScore: 0, efficiencyScore: 0, overallScore: 0,
      feedback: '', improvementSuggestion: '',
      status: 'pending', createTime: ts()
    }
    list.push(next)
    save(SA_KEY, list)
    return delay(next)
  }
}

// ===== 交接完成触发建账初始化任务 =====
export const handoverHooks = {
  triggerAccountInit(payload: { customerId: number; customerName: string; accountantName: string }) {
    const list = load<BizTask>(TASK_KEY, seedTasks)
    const id = (list.reduce((m, t) => Math.max(m, t.id), 0) || 0) + 1
    const next: BizTask = {
      id, taskNo: `WT${new Date().getFullYear()}A${String(id).padStart(4, '0')}`,
      taskType: 'bookkeeping', taskName: `${payload.customerName} - 建账初始化`,
      orderId: 0, orderNo: '',
      customerId: payload.customerId, customerName: payload.customerName,
      assigneeId: 2003, assigneeName: payload.accountantName,
      assignerId: 1002, assignerName: '',
      priority: 'high', status: 'assigned',
      planStartDate: dateOnly(0), planEndDate: dateOnly(7),
      actualStartTime: '', actualEndTime: '',
      taskContent: '客户资料交接完成，自动触发建账初始化任务，请在 7 日内完成账套搭建。',
      deliverable: '',
      reviewerId: 0, reviewerName: '', reviewTime: '',
      reviewResult: '', reviewOpinion: '',
      remark: 'A|建账初始化|来源:客户交接',
      createTime: ts()
    }
    list.push(next)
    save(TASK_KEY, list)
    return delay(next)
  }
}

// ===== 提成自动汇总（按月） =====
export const commissionAggregator = {
  // 模拟从已完成订单批量汇总提成（含退款扣回）
  monthlyAggregate(period: string) {
    const list = load<BizCommission>(CM_KEY, seedCommissions)
    const exist = list.filter(c => c.period === period && c.status !== 'rejected')
    if (exist.length > 0) {
      return delay({ created: 0, total: exist.length, message: `${period} 已汇总过 ${exist.length} 条提成` })
    }
    const sources: { orderId: number; orderNo: string; customerName: string; salespersonId: number; salespersonName: string; baseAmount: number; commissionRate: number; bonusAmount: number; deductionAmount: number }[] = [
      { orderId: 9201, orderNo: `DD${period.replace('-', '')}101`, customerName: '杭州远拓信息技术有限公司', salespersonId: 1003, salespersonName: '张小兰', baseAmount: 46200, commissionRate: 6, bonusAmount: 200, deductionAmount: 0 },
      { orderId: 9202, orderNo: `DD${period.replace('-', '')}102`, customerName: '宁波蓝鲸供应链有限公司', salespersonId: 1004, salespersonName: '李明', baseAmount: 35800, commissionRate: 5.5, bonusAmount: 0, deductionAmount: 0 },
      { orderId: 9203, orderNo: `DD${period.replace('-', '')}103`, customerName: '温州启明机械有限公司', salespersonId: 1005, salespersonName: '王倩', baseAmount: 52800, commissionRate: 5, bonusAmount: 300, deductionAmount: 0 },
      { orderId: 9204, orderNo: `DD${period.replace('-', '')}104`, customerName: '嘉兴松果企业管理有限公司', salespersonId: 1006, salespersonName: '赵晨', baseAmount: 21800, commissionRate: 6, bonusAmount: 0, deductionAmount: 180 }
    ]
    let nextId = (list.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
    sources.forEach(s => {
      const cm = +(s.baseAmount * s.commissionRate / 100).toFixed(2)
      list.push({
        id: nextId,
        commissionNo: `TC${period.replace('-', '')}${String(nextId).padStart(3, '0')}`,
        orderId: s.orderId, orderNo: s.orderNo, customerName: s.customerName,
        salespersonId: s.salespersonId, salespersonName: s.salespersonName,
        baseAmount: s.baseAmount, commissionRate: s.commissionRate, commissionAmount: cm,
        bonusAmount: s.bonusAmount, deductionAmount: s.deductionAmount,
        finalAmount: cm + s.bonusAmount - s.deductionAmount,
        period, status: 'pending',
        salesConfirmTime: '', managerReviewTime: '', financeConfirmTime: '', bossApproveTime: '', payTime: '',
        remark: s.deductionAmount > 0 ? '本月含退款扣回' : '系统按月自动汇总',
        createTime: ts()
      })
      nextId++
    })
    save(CM_KEY, list)
    return delay({ created: sources.length, total: sources.length, message: `已自动汇总 ${period} 提成 ${sources.length} 条` })
  }
}

// ===== 标准交接清单 =====
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

export const satisfactionApi = {
  list(params: { page?: number; pageSize?: number; status?: string; customerName?: string } = {}) {
    let list = load<BizSatisfaction>(SA_KEY, seedSatisfactions)
    if (params.status) list = list.filter(s => s.status === params.status)
    if (params.customerName) list = list.filter(s => (s.customerName || '').includes(params.customerName!))
    return delay(paginate(list, params.page, params.pageSize))
  },
  create(data: Partial<BizSatisfaction>): Promise<BizSatisfaction> {
    const list = load<BizSatisfaction>(SA_KEY, seedSatisfactions)
    const id = (list.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1
    const overall = data.overallScore ||
      (data.serviceScore && data.attitudeScore && data.efficiencyScore
        ? Math.round(((data.serviceScore + data.attitudeScore + data.efficiencyScore) / 3))
        : 0)
    const next: BizSatisfaction = {
      id,
      surveyNo: data.surveyNo || genNo('SA', id),
      orderId: data.orderId || 0,
      orderNo: data.orderNo || '',
      customerId: data.customerId || 0,
      customerName: data.customerName || '',
      surveyType: data.surveyType || 'phone',
      callbackerId: data.callbackerId || 0,
      callbackerName: data.callbackerName || '',
      scheduledTime: data.scheduledTime || ts(),
      actualTime: data.actualTime || '',
      serviceScore: data.serviceScore || 0,
      attitudeScore: data.attitudeScore || 0,
      efficiencyScore: data.efficiencyScore || 0,
      overallScore: overall,
      feedback: data.feedback || '',
      improvementSuggestion: data.improvementSuggestion || '',
      status: data.status || 'pending',
      createTime: ts()
    }
    list.push(next)
    save(SA_KEY, list)
    return delay(next)
  },
  getPending(params: { page?: number; pageSize?: number } = {}) {
    const list = load<BizSatisfaction>(SA_KEY, seedSatisfactions).filter(s => s.status === 'pending')
    return delay(paginate(list, params.page, params.pageSize))
  }
}
