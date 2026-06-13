// ===== 合同管理 API（真实后端 /contract-mgmt，api 层做形状适配，保持与原 mock 版函数名/返回形状一致） =====
// 后端：modules/contract/BizContractController + BizContractServiceImpl + domain.BizContract
// 注意：响应拦截器 resolve 的是 R 信封 {code,message,data}，本文件内统一 unwrap 取 data 载荷。

import { get, post, put } from './request'

export interface ContractStageRecord {
  stage: 60 | 45 | 30 | 15 | 7 | 0
  status: 'pending' | 'done' | 'overdue'
  handler?: string
  handledAt?: string
  note?: string
}

export interface ContractLinkageRecord {
  time: string
  type: 'effective' | 'task_dispatched' | 'renew' | 'terminate' | 'stage_alert' | 'sign'
  title: string
  detail?: string
  by?: string
}

export interface BizContract {
  id: number
  contractNo: string
  orderId: number
  orderNo?: string
  customerId: number
  customerName?: string
  contractTemplateId: number
  templateName?: string
  contractName: string
  contractAmount: number
  startDate: string
  endDate: string
  signMethod: 'paper' | 'electronic' | 'fadada' | 'esign'
  signStatus: 'draft' | 'sent' | 'partial_signed' | 'signed' | 'expired' | 'terminated' | 'renewed'
  partyAName: string
  partyASigner: string
  partyASignTime: string
  partyBName: string
  partyBSigner: string
  partyBSignTime: string
  contractFileUrl: string
  signedFileUrl: string
  expireWarn: boolean
  remark: string
  createTime: string
  /** 版本号（续签自增，history() 内按版本链计算） */
  version?: number
  /** 父合同 ID（续签关联，对应后端 parentId） */
  parentContractId?: number
  /** 续签后的子合同 ID（后端无冗余字段，由同批数据反向推导） */
  renewedContractId?: number
  /** 续费阶梯状态（5 级 + 到期）——后端暂无对应表，本地保留 */
  renewStages?: ContractStageRecord[]
  /** 联动事件时间线（由后端签署/终止/续签字段合成） */
  linkageRecords?: ContractLinkageRecord[]
}

export interface BizContractTemplate {
  id: number
  templateName: string
  templateCode: string
  serviceType: 'bookkeeping' | 'registration' | 'tax_planning' | 'qualification' | 'audit' | 'cancellation' | 'other'
  templateContent: string
  variableJson: string
  version: string
  enabled: boolean
  createTime: string
  updateTime: string
}

/* ---------- 后端实体形状（与 Java Entity 字段一一对应，camelCase） ---------- */

/** modules/contract/domain/BizContract.java */
interface ServerContract {
  id: number
  contractNo: string
  title?: string
  orderId: number
  customerId: number
  customerName?: string
  salesmanId?: number
  deptId?: number
  templateId?: number
  /** new首签 renew续签 supplement补充 */
  contractType?: string
  parentId?: number
  amount?: number
  startDate?: string
  endDate?: string
  signDate?: string
  /** 1草稿 2待签署 3签署中 4已签署 5执行中 6已到期 7已终止 */
  status?: number
  /** online线上 offline线下 */
  signMode?: string
  signerOurs?: string
  signerTheirs?: string
  sendSignTime?: string
  confirmSignTime?: string
  terminateTime?: string
  terminateReason?: string
  content?: string
  attachments?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

/** modules/contract/domain/BizContractTemplate.java */
interface ServerTemplate {
  id: number
  name?: string
  category?: string
  applyType?: string
  content?: string
  variables?: string
  /** 0禁用 1启用 */
  status?: number
  remark?: string
  createTime?: string
  updateTime?: string
}

interface ServerPage<T> {
  records: T[]
  total: number
  size?: number
  current?: number
  pages?: number
}

const PARTY_B_NAME = '浙杭企业服务有限公司'

/** 拦截器返回 R 信封 {code,message,data}，取出 data 载荷 */
function unwrap<T>(res: any): T {
  return (res && typeof res === 'object' && 'data' in res ? res.data : res) as T
}

/* ---------- 枚举映射（语义以后端 BizContractServiceImpl 为准） ---------- */

const SIGN_STATUS_BY_CODE: Record<number, BizContract['signStatus']> = {
  1: 'draft',
  2: 'sent',
  3: 'sent',
  4: 'signed',
  5: 'signed',
  6: 'expired',
  7: 'terminated'
}
const CODE_BY_SIGN_STATUS: Record<string, number> = {
  draft: 1,
  sent: 3,
  partial_signed: 3,
  signed: 4,
  expired: 6,
  terminated: 7
}

const toSignMethod = (m?: string | null): BizContract['signMethod'] => (m === 'online' ? 'esign' : 'paper')
const toSignMode = (m?: string): 'online' | 'offline' =>
  m === 'paper' || m === 'electronic' ? 'offline' : 'online'

/* ---------- 续费阶梯：后端暂无对应表，用 localStorage 侧挂保留功能 ---------- */

const STAGE_KEY = 'contract_renew_stage_overlay'

function defaultStages(): ContractStageRecord[] {
  return [
    { stage: 60, status: 'pending' },
    { stage: 45, status: 'pending' },
    { stage: 30, status: 'pending' },
    { stage: 15, status: 'pending' },
    { stage: 7, status: 'pending' },
    { stage: 0, status: 'pending' }
  ]
}

function loadStageOverlay(): Record<string, ContractStageRecord[]> {
  try {
    return JSON.parse(localStorage.getItem(STAGE_KEY) || '{}') as Record<string, ContractStageRecord[]>
  } catch {
    return {}
  }
}
function saveStageOverlay(overlay: Record<string, ContractStageRecord[]>) {
  localStorage.setItem(STAGE_KEY, JSON.stringify(overlay))
}

const nowTs = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

function dayDiff(dateStr?: string): number {
  if (!dateStr) return NaN
  const a = new Date(dateStr).setHours(0, 0, 0, 0)
  const b = new Date().setHours(0, 0, 0, 0)
  return Math.round((a - b) / 86400000)
}

/* ---------- 形状适配 ---------- */

function adaptTemplate(s: ServerTemplate): BizContractTemplate {
  return {
    id: s.id,
    templateName: s.name || '',
    templateCode: s.applyType || `TPL_${s.id}`,
    serviceType: (s.category || 'other') as BizContractTemplate['serviceType'],
    templateContent: s.content || '',
    variableJson: s.variables || '[]',
    // 后端模板无版本字段，借 remark 持久化（saveTemplate 反向写入）
    version: s.remark && /^v/i.test(s.remark) ? s.remark : 'v1.0',
    enabled: s.status === 1,
    createTime: s.createTime || '',
    updateTime: s.updateTime || ''
  }
}

/** 模板 id→名称 缓存（合同上仅有 templateId，名称需自行勾稽） */
let tplIndexPromise: Promise<Map<number, string>> | null = null
function ensureTplIndex(): Promise<Map<number, string>> {
  if (!tplIndexPromise) {
    tplIndexPromise = get('/contract-mgmt/templates', undefined, { silentError: true })
      .then(res => {
        const arr = unwrap<ServerTemplate[]>(res) || []
        return new Map(arr.map(t => [t.id, t.name || ''] as [number, string]))
      })
      .catch(() => {
        tplIndexPromise = null
        return new Map<number, string>()
      })
  }
  return tplIndexPromise
}

function adaptContract(
  s: ServerContract,
  tplIndex: Map<number, string>,
  overlay: Record<string, ContractStageRecord[]>
): BizContract {
  const status = s.status ?? 1
  const signStatus = SIGN_STATUS_BY_CODE[status] || 'draft'

  // 联动时间线：由后端字段合成（后端在确认签署事务内自动派发交付任务 + 生成提成）
  const records: ContractLinkageRecord[] = []
  if (s.sendSignTime) {
    records.push({
      time: s.sendSignTime,
      type: 'sign',
      title: '已发送客户签署',
      detail: s.signMode === 'online' ? '线上签署通道已开启' : '线下/邮寄签署',
      by: s.signerOurs || '系统'
    })
  }
  if (s.confirmSignTime) {
    records.push({ time: s.confirmSignTime, type: 'sign', title: '甲方完成签署', by: s.signerTheirs || '客户' })
    records.push({
      time: s.confirmSignTime,
      type: 'effective',
      title: '合同生效',
      detail: '双方签署完成，进入履行阶段',
      by: '系统'
    })
    records.push({
      time: s.confirmSignTime,
      type: 'task_dispatched',
      title: '任务已派发',
      detail: '后端联动：客户资料收集、建账初始化、税务报到；并自动生成销售提成',
      by: '联动'
    })
  }
  if (s.contractType === 'renew' && s.parentId) {
    records.push({
      time: s.createTime || '',
      type: 'renew',
      title: '由原合同续签生成',
      detail: `父合同 ID：${s.parentId}`,
      by: '系统'
    })
  }
  if (s.terminateTime) {
    records.push({
      time: s.terminateTime,
      type: 'terminate',
      title: '合同终止',
      detail: s.terminateReason || '',
      by: '系统'
    })
  }

  const stages = overlay[String(s.id)]
  if (stages) {
    stages.forEach(st => {
      if (st.status !== 'pending') {
        records.push({
          time: st.handledAt || '',
          type: 'stage_alert',
          title: `${st.stage} 天阶梯处理`,
          detail: st.note,
          by: st.handler
        })
      }
    })
  }

  const left = dayDiff(s.endDate)
  const expireWarn = (status === 4 || status === 5) && !Number.isNaN(left) && left >= 0 && left <= 30

  return {
    id: s.id,
    contractNo: s.contractNo,
    orderId: s.orderId,
    orderNo: undefined, // 后端合同未冗余订单号，视图自带「未关联订单」兜底
    customerId: s.customerId,
    customerName: s.customerName,
    contractTemplateId: s.templateId ?? 0,
    templateName: s.templateId != null ? tplIndex.get(s.templateId) : undefined,
    contractName: s.title || '',
    contractAmount: Number(s.amount ?? 0),
    startDate: s.startDate || '',
    endDate: s.endDate || '',
    signMethod: toSignMethod(s.signMode),
    signStatus,
    partyAName: s.customerName || '',
    partyASigner: s.signerTheirs || '',
    partyASignTime: s.confirmSignTime || '',
    partyBName: PARTY_B_NAME,
    partyBSigner: s.signerOurs || '',
    partyBSignTime: s.sendSignTime || '',
    contractFileUrl: s.attachments || '',
    signedFileUrl: status >= 4 ? s.attachments || '' : '',
    expireWarn,
    remark: s.remark || '',
    createTime: s.createTime || '',
    version: s.contractType === 'renew' ? 2 : 1,
    parentContractId: s.parentId ?? undefined,
    renewedContractId: undefined, // 由 crossLink 在同批数据内反向推导
    renewStages: stages || defaultStages(),
    linkageRecords: records
  }
}

/** 同批数据内按 parentContractId 反向勾稽「已续签」关系（后端不回写父合同状态） */
function crossLink(list: BizContract[]) {
  const byId = new Map(list.map(c => [c.id, c] as [number, BizContract]))
  list.forEach(child => {
    if (!child.parentContractId) return
    const parent = byId.get(child.parentContractId)
    if (!parent) return
    parent.renewedContractId = child.id
    if (parent.signStatus === 'signed') parent.signStatus = 'renewed'
    parent.linkageRecords = [
      ...(parent.linkageRecords || []),
      {
        time: child.createTime || '',
        type: 'renew',
        title: '已生成续签合同',
        detail: `新合同：${child.contractNo}`,
        by: '系统'
      }
    ]
  })
}

/* ---------- 对外 API（函数名/入参/返回形状与原 mock 版保持一致） ---------- */

export const contractMgmtApi = {
  /** 兼容保留：真实后端无需种子数据，等价于拉取全量列表 */
  async ensureSamples(): Promise<BizContract[]> {
    const r = await this.list({ page: 1, pageSize: 999 })
    return r.list
  },

  async list(
    params: { page?: number; pageSize?: number; signStatus?: string; customerName?: string; contractNo?: string } = {}
  ): Promise<{ list: BizContract[]; total: number }> {
    const status =
      params.signStatus && params.signStatus !== 'renewed' ? CODE_BY_SIGN_STATUS[params.signStatus] : undefined
    const [tplIndex, res] = await Promise.all([
      ensureTplIndex(),
      get('/contract-mgmt/list', {
        pageNum: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        contractNo: params.contractNo || undefined,
        status
      })
    ])
    const pageData = unwrap<ServerPage<ServerContract>>(res) || { records: [], total: 0 }
    const overlay = loadStageOverlay()
    let list = (pageData.records || []).map(s => adaptContract(s, tplIndex, overlay))
    crossLink(list)
    // 后端列表不支持客户名模糊 / renewed 派生态，做当前页内兜底过滤
    if (params.customerName) {
      list = list.filter(c => (c.customerName || '').includes(params.customerName!))
    }
    if (params.signStatus === 'renewed') {
      list = list.filter(c => c.signStatus === 'renewed')
    }
    return { list, total: Number(pageData.total ?? list.length) }
  },

  async detail(id: number): Promise<BizContract | null> {
    const res = await get(`/contract-mgmt/${id}`, undefined, { silentError: true }).catch(() => null)
    const s = res ? unwrap<ServerContract | null>(res) : null
    if (!s || s.id == null) return null
    const tplIndex = await ensureTplIndex()
    return adaptContract(s, tplIndex, loadStageOverlay())
  },

  /** 后端按订单回填客户/金额/期限（generateFromOrder），其余表单字段仅用于拼标题与备注 */
  async generate(payload: {
    orderId: number
    orderNo?: string
    customerId: number
    customerName?: string
    templateId: number
    contractAmount: number
    startDate: string
    endDate: string
    partyAName: string
    partyBName?: string
    remark?: string
  }): Promise<BizContract> {
    const tplIndex = await ensureTplIndex()
    const tplName = tplIndex.get(payload.templateId)
    const title = `${payload.customerName || payload.partyAName || ''}${tplName || '服务合同'}`
    const res = await post('/contract-mgmt/generate', {
      orderId: payload.orderId,
      templateId: payload.templateId,
      title
    })
    const id = unwrap<number>(res)
    if (payload.remark) {
      await put(`/contract-mgmt/${id}`, { remark: payload.remark }).catch(() => {})
    }
    const created =
      (await this.detail(id)) || (await this.list({ page: 1, pageSize: 1 })).list[0]
    if (!created) return Promise.reject(new Error('合同已生成，但查询新合同失败'))
    return created
  },

  async update(data: Partial<BizContract> & { id: number }): Promise<BizContract> {
    const body: Record<string, unknown> = {}
    if (data.contractName !== undefined) body.title = data.contractName
    if (data.contractAmount !== undefined) body.amount = data.contractAmount
    if (data.startDate !== undefined) body.startDate = data.startDate || null
    if (data.endDate !== undefined) body.endDate = data.endDate || null
    if (data.remark !== undefined) body.remark = data.remark
    await put(`/contract-mgmt/${data.id}`, body)
    const fresh = await this.detail(data.id)
    if (!fresh) return Promise.reject(new Error('合同不存在'))
    return fresh
  },

  async sendSign(payload: { id: number; signMethod?: BizContract['signMethod'] }): Promise<BizContract> {
    await post(`/contract-mgmt/${payload.id}/send-sign`, { signMode: toSignMode(payload.signMethod) })
    const fresh = await this.detail(payload.id)
    if (!fresh) return Promise.reject(new Error('合同不存在'))
    return fresh
  },

  /**
   * 后端为一步制签署：confirm-sign 即置「已签署」，并在同事务内自动派发交付任务 + 生成销售提成。
   * 入参 party/signedFileUrl 为 mock 兼容保留（后端仅记录对方签署人 signerTheirs）。
   */
  async confirmSign(payload: {
    id: number
    party: 'A' | 'B'
    signer: string
    signedFileUrl?: string
  }): Promise<BizContract> {
    await post(`/contract-mgmt/${payload.id}/confirm-sign`, { signerTheirs: payload.signer })
    const fresh = await this.detail(payload.id)
    if (!fresh) return Promise.reject(new Error('合同不存在'))
    return fresh
  },

  /**
   * 兼容保留：合同生效→派交付任务/提成 已由后端在 confirm-sign 内自动编排
   * （BizContractServiceImpl.dispatchDeliveryTasks / generateCommission），无独立端点，此处仅返回最新详情。
   */
  async markEffective(payload: { id: number; taskTitles?: string[] }): Promise<BizContract> {
    const fresh = await this.detail(payload.id)
    if (!fresh) return Promise.reject(new Error('合同不存在'))
    return fresh
  },

  /** 更新阶梯处理状态（后端暂无续费阶梯表，本地持久化保留功能） */
  async updateStage(payload: {
    id: number
    stage: 60 | 45 | 30 | 15 | 7 | 0
    status: 'pending' | 'done' | 'overdue'
    handler?: string
    note?: string
  }): Promise<BizContract> {
    const overlay = loadStageOverlay()
    const stages = (overlay[String(payload.id)] || defaultStages()).map(s => ({ ...s }))
    const target = stages.find(s => s.stage === payload.stage)
    if (target) {
      target.status = payload.status
      target.handler = payload.handler || target.handler
      target.note = payload.note || target.note
      target.handledAt = payload.status === 'done' ? nowTs() : target.handledAt
    }
    overlay[String(payload.id)] = stages
    saveStageOverlay(overlay)
    const fresh = await this.detail(payload.id)
    if (!fresh) return Promise.reject(new Error('合同不存在'))
    return fresh
  },

  /** 版本链：按客户拉取后沿 parentContractId 双向追溯（后端无专用 history 端点） */
  async history(contractId: number): Promise<BizContract[]> {
    const target = await this.detail(contractId)
    if (!target) return []
    const res = await get(
      '/contract-mgmt/list',
      { pageNum: 1, pageSize: 500, customerId: target.customerId },
      { silentError: true }
    ).catch(() => null)
    const pageData = res ? unwrap<ServerPage<ServerContract>>(res) : null
    const tplIndex = await ensureTplIndex()
    const overlay = loadStageOverlay()
    const all = (pageData?.records || []).map(s => adaptContract(s, tplIndex, overlay))
    crossLink(all)
    const byId = new Map(all.map(c => [c.id, c] as [number, BizContract]))
    if (!byId.has(target.id)) byId.set(target.id, target)
    const start = byId.get(target.id)!

    const chain: BizContract[] = []
    let cur: BizContract | undefined = start
    while (cur && !chain.includes(cur)) {
      chain.unshift(cur)
      cur = cur.parentContractId ? byId.get(cur.parentContractId) : undefined
    }
    let nextId = start.renewedContractId
    while (nextId) {
      const nxt = byId.get(nextId)
      if (!nxt || chain.includes(nxt)) break
      chain.push(nxt)
      nextId = nxt.renewedContractId
    }
    chain.forEach((c, i) => {
      c.version = i + 1
    })
    return chain
  },

  /** 后端按原合同生成续签草稿（起止日期顺延一年），再把弹窗中的金额/期限/服务调整补写到新合同 */
  async renew(payload: {
    id: number
    startDate: string
    endDate: string
    contractAmount: number
    adjustService?: boolean
    serviceContent?: string
  }): Promise<BizContract> {
    const res = await post(`/contract-mgmt/${payload.id}/renew`, {})
    const newId = unwrap<number>(res)
    const body: Record<string, unknown> = {
      amount: payload.contractAmount,
      startDate: payload.startDate || null,
      endDate: payload.endDate || null
    }
    if (payload.adjustService && payload.serviceContent) {
      body.remark = `服务内容调整：${payload.serviceContent}`
    }
    await put(`/contract-mgmt/${newId}`, body).catch(() => {})
    const fresh = await this.detail(newId)
    if (!fresh) return Promise.reject(new Error('续签合同已生成，但查询失败'))
    return fresh
  },

  async terminate(payload: { id: number; reason: string }): Promise<BizContract> {
    await post(`/contract-mgmt/${payload.id}/terminate`, { reason: payload.reason })
    const fresh = await this.detail(payload.id)
    if (!fresh) return Promise.reject(new Error('合同不存在'))
    return fresh
  },

  /** 后端 /expiring 返回数组（无分页），此处客户端分页保持 {list,total} 形状 */
  async getExpiring(
    params: { days?: number; page?: number; pageSize?: number } = {}
  ): Promise<{ list: BizContract[]; total: number }> {
    const res = await get('/contract-mgmt/expiring', { days: params.days ?? 30 })
    const arr = unwrap<ServerContract[]>(res) || []
    const tplIndex = await ensureTplIndex()
    const overlay = loadStageOverlay()
    const all = arr.map(s => adaptContract(s, tplIndex, overlay))
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    return { list: all.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), total: all.length }
  },

  async getTemplates(
    params: { serviceType?: string; enabled?: boolean } = {}
  ): Promise<BizContractTemplate[]> {
    const res = await get('/contract-mgmt/templates', {
      category: params.serviceType || undefined,
      status: params.enabled == null ? undefined : params.enabled ? 1 : 0
    })
    return (unwrap<ServerTemplate[]>(res) || []).map(adaptTemplate)
  },

  async saveTemplate(data: Partial<BizContractTemplate>): Promise<BizContractTemplate> {
    const body: Record<string, unknown> = {}
    if (data.id) body.id = data.id
    if (data.templateName !== undefined) body.name = data.templateName
    if (data.serviceType !== undefined) body.category = data.serviceType
    if (data.templateCode !== undefined) body.applyType = data.templateCode
    if (data.templateContent !== undefined) body.content = data.templateContent
    if (data.variableJson !== undefined) body.variables = data.variableJson
    if (data.enabled !== undefined) body.status = data.enabled ? 1 : 0
    if (data.version !== undefined) body.remark = data.version // 后端模板无版本字段，借 remark 持久化
    const res = await post('/contract-mgmt/template', body)
    const id = unwrap<number>(res)
    tplIndexPromise = null // 模板名称缓存失效
    const all = await this.getTemplates()
    const saved = all.find(t => String(t.id) === String(id)) || all.find(t => t.id === data.id)
    if (!saved) return Promise.reject(new Error('模板已保存，但查询失败'))
    return saved
  }
}
