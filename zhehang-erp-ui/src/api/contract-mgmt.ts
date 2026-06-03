// ===== 合同管理 API（localStorage Mock 模式） =====

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
  /** 版本号（续签自增） */
  version?: number
  /** 父合同 ID（续签关联） */
  parentContractId?: number
  /** 续签后的子合同 ID */
  renewedContractId?: number
  /** 续费阶梯状态（5 级 + 到期） */
  renewStages?: ContractStageRecord[]
  /** 联动事件时间线 */
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

const CT_KEY = 'biz_contracts'
const TP_KEY = 'biz_contract_templates'

const delay = <T>(data: T, ms = 100): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms))

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
  if (raw) {
    try { return JSON.parse(raw) as T[] } catch { /* ignore */ }
  }
  const seed = builder()
  localStorage.setItem(key, JSON.stringify(seed))
  return seed
}
function save<T>(key: string, list: T[]) { localStorage.setItem(key, JSON.stringify(list)) }
function paginate<T>(list: T[], page = 1, pageSize = 10) {
  return { list: list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), total: list.length }
}

function seedTemplates(): BizContractTemplate[] {
  return [
    {
      id: 1, templateName: '代理记账服务合同', templateCode: 'TPL_BOOKKEEPING',
      serviceType: 'bookkeeping',
      templateContent: '甲方：${partyAName}\n乙方：${partyBName}\n服务内容：${serviceContent}\n服务期限：${startDate} 至 ${endDate}\n服务费用：人民币 ${contractAmount} 元\n付款方式：${paymentMethod}',
      variableJson: '["partyAName","partyBName","startDate","endDate","contractAmount","serviceContent","paymentMethod"]',
      version: 'v2.1', enabled: true, createTime: ts(-90), updateTime: ts(-15)
    },
    {
      id: 2, templateName: '工商注册服务合同', templateCode: 'TPL_REGISTRATION',
      serviceType: 'registration',
      templateContent: '甲方：${partyAName}\n乙方：${partyBName}\n注册地址：${registerAddress}\n服务内容：核名、设立登记、刻章、银行开户、税务报到\n服务费用：人民币 ${contractAmount} 元',
      variableJson: '["partyAName","partyBName","registerAddress","contractAmount","serviceContent"]',
      version: 'v1.5', enabled: true, createTime: ts(-80), updateTime: ts(-10)
    },
    {
      id: 3, templateName: '税务筹划服务合同', templateCode: 'TPL_TAX_PLAN',
      serviceType: 'tax_planning',
      templateContent: '甲方：${partyAName}\n乙方：${partyBName}\n服务内容：${serviceContent}\n咨询期限：${startDate} 至 ${endDate}\n服务费用：人民币 ${contractAmount} 元',
      variableJson: '["partyAName","partyBName","startDate","endDate","contractAmount","serviceContent"]',
      version: 'v1.3', enabled: true, createTime: ts(-60), updateTime: ts(-20)
    },
    {
      id: 4, templateName: '资质代办服务合同', templateCode: 'TPL_QUALIFICATION',
      serviceType: 'qualification',
      templateContent: '甲方：${partyAName}\n乙方：${partyBName}\n资质类型：${qualificationType}\n服务内容：${serviceContent}\n服务费用：人民币 ${contractAmount} 元（含规费 ${governmentFee} 元）',
      variableJson: '["partyAName","partyBName","qualificationType","serviceContent","contractAmount","governmentFee"]',
      version: 'v1.2', enabled: true, createTime: ts(-50), updateTime: ts(-7)
    },
    {
      id: 5, templateName: '综合服务合同', templateCode: 'TPL_COMPREHENSIVE',
      serviceType: 'other',
      templateContent: '甲方：${partyAName}\n乙方：${partyBName}\n综合服务清单：${serviceContent}\n服务期限：${startDate} 至 ${endDate}\n服务费用：人民币 ${contractAmount} 元（${amountDetail}）\n付款条款：${paymentClause}',
      variableJson: '["partyAName","partyBName","startDate","endDate","contractAmount","serviceContent","amountDetail","paymentClause"]',
      version: 'v1.0', enabled: true, createTime: ts(-40), updateTime: ts(-5)
    }
  ]
}

function defaultStages(): ContractStageRecord[] {
  return [
    { stage: 60, status: 'pending' },
    { stage: 45, status: 'pending' },
    { stage: 30, status: 'pending' },
    { stage: 15, status: 'pending' },
    { stage: 7,  status: 'pending' },
    { stage: 0,  status: 'pending' }
  ]
}

function seedContracts(): BizContract[] {
  const base = (data: Partial<BizContract> & {
    id: number
    contractTemplateId: number
    templateName: string
    contractName: string
    customerId: number
    customerName: string
    contractAmount: number
    startDate: string
    endDate: string
    signStatus: BizContract['signStatus']
  }): BizContract => ({
    id: data.id,
    contractNo: genContractNo(data.id),
    orderId: data.orderId || data.id,
    orderNo: data.orderNo || `TD${String(data.id).padStart(8, '0')}`,
    customerId: data.customerId,
    customerName: data.customerName,
    contractTemplateId: data.contractTemplateId,
    templateName: data.templateName,
    contractName: data.contractName,
    contractAmount: data.contractAmount,
    startDate: data.startDate,
    endDate: data.endDate,
    signMethod: data.signMethod || 'esign',
    signStatus: data.signStatus,
    partyAName: data.partyAName || data.customerName,
    partyASigner: data.partyASigner || '',
    partyASignTime: data.partyASignTime || '',
    partyBName: data.partyBName || '浙杭企业服务有限公司',
    partyBSigner: data.partyBSigner || '',
    partyBSignTime: data.partyBSignTime || '',
    contractFileUrl: data.contractFileUrl || `/mock/contract_${data.id}.pdf`,
    signedFileUrl: data.signedFileUrl || '',
    expireWarn: data.expireWarn ?? false,
    remark: data.remark || '',
    createTime: data.createTime || ts(-data.id),
    version: data.version || 1,
    parentContractId: data.parentContractId,
    renewedContractId: data.renewedContractId,
    renewStages: data.renewStages || defaultStages(),
    linkageRecords: data.linkageRecords || []
  })

  return [
    base({
      id: 1,
      orderId: 101,
      orderNo: 'TD2026060101',
      customerId: 101,
      customerName: '杭州森禾科技有限公司',
      contractTemplateId: 1,
      templateName: '代理记账服务合同',
      contractName: '杭州森禾科技有限公司代理记账年度服务',
      contractAmount: 16800,
      startDate: dateOnly(5),
      endDate: dateOnly(370),
      signStatus: 'draft',
      signMethod: 'paper',
      remark: '草稿待客户确认付款条款',
      createTime: ts(-2)
    }),
    base({
      id: 2,
      orderId: 102,
      orderNo: 'TD2026060102',
      customerId: 102,
      customerName: '浙江云桥贸易有限公司',
      contractTemplateId: 2,
      templateName: '工商注册服务合同',
      contractName: '浙江云桥贸易有限公司工商注册服务',
      contractAmount: 6800,
      startDate: dateOnly(1),
      endDate: dateOnly(31),
      signStatus: 'sent',
      signMethod: 'esign',
      partyBSigner: '陈苗',
      partyBSignTime: ts(-1),
      linkageRecords: [
        { time: ts(-1), type: 'sign', title: '已发送客户签署', detail: '电子签署通道已创建', by: '陈苗' }
      ],
      createTime: ts(-3)
    }),
    base({
      id: 3,
      orderId: 103,
      orderNo: 'TD2026060103',
      customerId: 103,
      customerName: '杭州叁木文化传媒有限公司',
      contractTemplateId: 4,
      templateName: '资质代办服务合同',
      contractName: '杭州叁木文化传媒有限公司资质代办服务',
      contractAmount: 25800,
      startDate: dateOnly(-3),
      endDate: dateOnly(120),
      signStatus: 'partial_signed',
      signMethod: 'electronic',
      partyBSigner: '李建国',
      partyBSignTime: ts(-4),
      linkageRecords: [
        { time: ts(-4), type: 'sign', title: '乙方完成签署', by: '李建国' }
      ],
      createTime: ts(-6)
    }),
    base({
      id: 4,
      orderId: 104,
      orderNo: 'TD2026060104',
      customerId: 104,
      customerName: '湖州锦辰餐饮管理有限公司',
      contractTemplateId: 1,
      templateName: '代理记账服务合同',
      contractName: '湖州锦辰餐饮管理有限公司代理记账服务',
      contractAmount: 12000,
      startDate: dateOnly(-60),
      endDate: dateOnly(210),
      signStatus: 'signed',
      signMethod: 'paper',
      partyASigner: '沈总',
      partyASignTime: ts(-62),
      partyBSigner: '陈苗',
      partyBSignTime: ts(-62),
      signedFileUrl: '/mock/contract_4_signed.pdf',
      linkageRecords: [
        { time: ts(-62), type: 'effective', title: '合同生效', detail: '双方签署完成', by: '系统' },
        { time: ts(-61), type: 'task_dispatched', title: '任务已派发', detail: '资料收集、建账、税务报到', by: '联动' }
      ],
      createTime: ts(-65)
    }),
    base({
      id: 5,
      orderId: 105,
      orderNo: 'TD2026060105',
      customerId: 105,
      customerName: '绍兴南麓服饰有限公司',
      contractTemplateId: 5,
      templateName: '综合服务合同',
      contractName: '绍兴南麓服饰有限公司综合财税服务',
      contractAmount: 36000,
      startDate: dateOnly(-340),
      endDate: dateOnly(12),
      signStatus: 'signed',
      signMethod: 'esign',
      partyASigner: '周经理',
      partyASignTime: ts(-340),
      partyBSigner: '王晓敏',
      partyBSignTime: ts(-340),
      signedFileUrl: '/mock/contract_5_signed.pdf',
      expireWarn: true,
      renewStages: [
        { stage: 60, status: 'done', handler: '陈苗', handledAt: ts(-48), note: '已确认续签预算' },
        { stage: 45, status: 'done', handler: '陈苗', handledAt: ts(-35), note: '客户要求调整服务包' },
        { stage: 30, status: 'done', handler: '李建国', handledAt: ts(-18), note: '主管已介入报价' },
        { stage: 15, status: 'pending' },
        { stage: 7, status: 'pending' },
        { stage: 0, status: 'pending' }
      ],
      linkageRecords: [
        { time: ts(-340), type: 'effective', title: '合同生效', by: '系统' },
        { time: ts(-18), type: 'stage_alert', title: '30 天阶梯处理', detail: '主管已介入报价', by: '李建国' }
      ],
      createTime: ts(-345)
    }),
    base({
      id: 6,
      orderId: 106,
      orderNo: 'TD2026060106',
      customerId: 106,
      customerName: '嘉兴禾创智能装备有限公司',
      contractTemplateId: 3,
      templateName: '税务筹划服务合同',
      contractName: '嘉兴禾创智能装备有限公司税务筹划项目',
      contractAmount: 58000,
      startDate: dateOnly(-300),
      endDate: dateOnly(42),
      signStatus: 'signed',
      signMethod: 'esign',
      partyASigner: '赵总',
      partyASignTime: ts(-300),
      partyBSigner: '陈思羽',
      partyBSignTime: ts(-300),
      signedFileUrl: '/mock/contract_6_signed.pdf',
      expireWarn: true,
      renewStages: [
        { stage: 60, status: 'done', handler: '陈思羽', handledAt: ts(-10), note: '已建续签商机' },
        { stage: 45, status: 'pending' },
        { stage: 30, status: 'pending' },
        { stage: 15, status: 'pending' },
        { stage: 7, status: 'pending' },
        { stage: 0, status: 'pending' }
      ],
      createTime: ts(-305)
    }),
    base({
      id: 7,
      orderId: 107,
      orderNo: 'TD2025050107',
      customerId: 107,
      customerName: '宁波佳瑞供应链有限公司',
      contractTemplateId: 1,
      templateName: '代理记账服务合同',
      contractName: '宁波佳瑞供应链有限公司代理记账服务',
      contractAmount: 15000,
      startDate: dateOnly(-390),
      endDate: dateOnly(-28),
      signStatus: 'renewed',
      signMethod: 'paper',
      partyASigner: '刘总',
      partyASignTime: ts(-390),
      partyBSigner: '周慧',
      partyBSignTime: ts(-390),
      signedFileUrl: '/mock/contract_7_signed.pdf',
      renewedContractId: 8,
      linkageRecords: [
        { time: ts(-30), type: 'renew', title: '已生成续签合同', detail: '新合同 v2 已进入草稿', by: '系统' }
      ],
      createTime: ts(-395)
    }),
    base({
      id: 8,
      orderId: 108,
      orderNo: 'TD2026060108',
      customerId: 107,
      customerName: '宁波佳瑞供应链有限公司',
      contractTemplateId: 1,
      templateName: '代理记账服务合同',
      contractName: '宁波佳瑞供应链有限公司代理记账服务（续签 v2）',
      contractAmount: 18000,
      startDate: dateOnly(-27),
      endDate: dateOnly(338),
      signStatus: 'draft',
      signMethod: 'paper',
      parentContractId: 7,
      version: 2,
      remark: '由合同续签生成，待客户补签',
      linkageRecords: [
        { time: ts(-30), type: 'renew', title: '由 v1 续签生成', detail: '原合同已归档', by: '系统' }
      ],
      createTime: ts(-30)
    }),
    base({
      id: 9,
      orderId: 109,
      orderNo: 'TD2026060109',
      customerId: 109,
      customerName: '杭州启沣咨询有限公司',
      contractTemplateId: 5,
      templateName: '综合服务合同',
      contractName: '杭州启沣咨询有限公司综合服务',
      contractAmount: 9800,
      startDate: dateOnly(-90),
      endDate: dateOnly(90),
      signStatus: 'terminated',
      signMethod: 'electronic',
      partyASigner: '何总',
      partyASignTime: ts(-90),
      partyBSigner: '杨树',
      partyBSignTime: ts(-90),
      remark: '客户经营计划调整，双方协商终止',
      linkageRecords: [
        { time: ts(-80), type: 'effective', title: '合同生效', by: '系统' },
        { time: ts(-12), type: 'terminate', title: '合同终止', detail: '客户经营计划调整', by: '管理员' }
      ],
      createTime: ts(-95)
    })
  ]
}

function genContractNo(id: number) {
  const d = new Date()
  return `HT${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${String(id).padStart(4, '0')}`
}

export const contractMgmtApi = {
  ensureSamples() {
    const list = load<BizContract>(CT_KEY, seedContracts)
    if (list.length) return delay(list)
    const seed = seedContracts()
    save(CT_KEY, seed)
    return delay(seed)
  },
  list(params: { page?: number; pageSize?: number; signStatus?: string; customerName?: string; contractNo?: string } = {}) {
    let list = load<BizContract>(CT_KEY, seedContracts)
    if (params.signStatus) list = list.filter(c => c.signStatus === params.signStatus)
    if (params.customerName) list = list.filter(c => (c.customerName || '').includes(params.customerName!))
    if (params.contractNo) list = list.filter(c => c.contractNo.includes(params.contractNo!))
    list = list.sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''))
    return delay(paginate(list, params.page, params.pageSize))
  },
  detail(id: number) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    return delay(list.find(c => c.id === id) || null)
  },
  generate(payload: { orderId: number; orderNo?: string; customerId: number; customerName?: string; templateId: number; contractAmount: number; startDate: string; endDate: string; partyAName: string; partyBName?: string; remark?: string }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const templates = load<BizContractTemplate>(TP_KEY, seedTemplates)
    const tpl = templates.find(t => t.id === payload.templateId)
    if (!tpl) return Promise.reject(new Error('模板不存在'))
    const id = (list.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
    const next: BizContract = {
      id,
      contractNo: genContractNo(id),
      orderId: payload.orderId,
      orderNo: payload.orderNo || '',
      customerId: payload.customerId,
      customerName: payload.customerName || '',
      contractTemplateId: tpl.id,
      templateName: tpl.templateName,
      contractName: `${payload.customerName || ''}${tpl.templateName}`,
      contractAmount: payload.contractAmount,
      startDate: payload.startDate,
      endDate: payload.endDate,
      signMethod: 'electronic',
      signStatus: 'draft',
      partyAName: payload.partyAName,
      partyASigner: '',
      partyASignTime: '',
      partyBName: payload.partyBName || '浙杭企业服务有限公司',
      partyBSigner: '',
      partyBSignTime: '',
      contractFileUrl: `/mock/contract_${id}.pdf`,
      signedFileUrl: '',
      expireWarn: false,
      remark: payload.remark || '',
      createTime: ts(),
      version: 1,
      renewStages: defaultStages(),
      linkageRecords: []
    }
    list.push(next)
    save(CT_KEY, list)
    return delay(next)
  },
  update(data: Partial<BizContract> & { id: number }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const idx = list.findIndex(c => c.id === data.id)
    if (idx < 0) return Promise.reject(new Error('合同不存在'))
    if (list[idx].signStatus !== 'draft') return Promise.reject(new Error('非草稿状态不可编辑'))
    list[idx] = { ...list[idx], ...data } as BizContract
    save(CT_KEY, list)
    return delay(list[idx])
  },
  sendSign(payload: { id: number; signMethod?: BizContract['signMethod'] }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('合同不存在'))
    if (list[idx].signStatus !== 'draft') return Promise.reject(new Error('非草稿状态不可发起签约'))
    list[idx] = {
      ...list[idx],
      signStatus: 'sent',
      signMethod: payload.signMethod || list[idx].signMethod,
      partyBSigner: list[idx].partyBSigner || '陈苗',
      partyBSignTime: list[idx].partyBSignTime || ts()
    }
    save(CT_KEY, list)
    return delay(list[idx])
  },
  confirmSign(payload: { id: number; party: 'A' | 'B'; signer: string; signedFileUrl?: string }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('合同不存在'))
    const next = { ...list[idx] }
    if (payload.party === 'A') {
      next.partyASigner = payload.signer
      next.partyASignTime = ts()
    } else {
      next.partyBSigner = payload.signer
      next.partyBSignTime = ts()
    }
    const records = next.linkageRecords ? [...next.linkageRecords] : []
    records.push({
      time: ts(),
      type: 'sign',
      title: payload.party === 'A' ? '甲方完成签署' : '乙方完成签署',
      by: payload.signer
    })
    if (next.partyASignTime && next.partyBSignTime) {
      next.signStatus = 'signed'
      next.signedFileUrl = payload.signedFileUrl || `/mock/contract_${next.id}_signed.pdf`
      records.push({ time: ts(), type: 'effective', title: '合同生效', detail: '已双方签署完成，进入履行阶段', by: '系统' })
    } else {
      next.signStatus = 'partial_signed'
    }
    next.linkageRecords = records
    list[idx] = next
    save(CT_KEY, list)
    return delay(next)
  },
  /** 手动标记生效联动：记录任务已派发 */
  markEffective(payload: { id: number; taskTitles?: string[] }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('合同不存在'))
    const next = { ...list[idx] }
    const records = next.linkageRecords ? [...next.linkageRecords] : []
    const titles = payload.taskTitles && payload.taskTitles.length
      ? payload.taskTitles.join('、')
      : '服务执行任务'
    records.push({
      time: ts(),
      type: 'task_dispatched',
      title: '任务已派发',
      detail: `已自动创建：${titles}`,
      by: '联动'
    })
    next.linkageRecords = records
    list[idx] = next
    save(CT_KEY, list)
    return delay(next)
  },
  /** 更新阶梯处理状态 */
  updateStage(payload: { id: number; stage: 60 | 45 | 30 | 15 | 7 | 0; status: 'pending' | 'done' | 'overdue'; handler?: string; note?: string }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('合同不存在'))
    const next = { ...list[idx] }
    const stages = (next.renewStages || defaultStages()).map(s => ({ ...s }))
    const target = stages.find(s => s.stage === payload.stage)
    if (target) {
      target.status = payload.status
      target.handler = payload.handler || target.handler
      target.note = payload.note || target.note
      target.handledAt = payload.status === 'done' ? ts() : target.handledAt
    }
    next.renewStages = stages
    const records = next.linkageRecords ? [...next.linkageRecords] : []
    records.push({
      time: ts(),
      type: 'stage_alert',
      title: `${payload.stage} 天阶梯处理`,
      detail: payload.note,
      by: payload.handler
    })
    next.linkageRecords = records
    list[idx] = next
    save(CT_KEY, list)
    return delay(next)
  },
  /** 按 customerId 查看历史版本链 */
  history(contractId: number) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const target = list.find(c => c.id === contractId)
    if (!target) return delay([] as BizContract[])
    const chain: BizContract[] = []
    // 向上追溯父合同
    let cur: BizContract | undefined = target
    while (cur) {
      chain.unshift(cur)
      const pid = cur.parentContractId
      cur = pid ? list.find(c => c.id === pid) : undefined
    }
    // 向下追溯子合同
    let nextId = target.renewedContractId
    while (nextId) {
      const nxt = list.find(c => c.id === nextId)
      if (!nxt) break
      chain.push(nxt)
      nextId = nxt.renewedContractId
    }
    return delay(chain)
  },
  renew(payload: { id: number; startDate: string; endDate: string; contractAmount: number; adjustService?: boolean; serviceContent?: string }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const old = list.find(c => c.id === payload.id)
    if (!old) return Promise.reject(new Error('原合同不存在'))
    if (old.signStatus !== 'signed' && old.signStatus !== 'expired') {
      return Promise.reject(new Error('当前状态不可续签'))
    }
    const newId = (list.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
    const oldVersion = old.version || 1
    const renewed: BizContract = {
      ...old,
      id: newId,
      contractNo: genContractNo(newId),
      contractName: `${old.contractName.replace(/\uff08续签 v\d+\uff09$/, '')}（续签 v${oldVersion + 1}）`,
      contractAmount: payload.contractAmount,
      startDate: payload.startDate,
      endDate: payload.endDate,
      signStatus: 'draft',
      partyASigner: '', partyASignTime: '',
      partyBSigner: '', partyBSignTime: '',
      signedFileUrl: '',
      expireWarn: false,
      remark: payload.adjustService && payload.serviceContent
        ? `由合同${old.contractNo}续签；服务内容调整：${payload.serviceContent}`
        : `由合同${old.contractNo}续签`,
      createTime: ts(),
      version: oldVersion + 1,
      parentContractId: old.id,
      renewedContractId: undefined,
      renewStages: defaultStages(),
      linkageRecords: [
        { time: ts(), type: 'renew', title: `由 v${oldVersion} 续签生成`, detail: `原合同：${old.contractNo}`, by: '系统' }
      ]
    }
    const oldIdx = list.findIndex(c => c.id === old.id)
    const oldRecords = old.linkageRecords ? [...old.linkageRecords] : []
    oldRecords.push({ time: ts(), type: 'renew', title: '已生成续签合同', detail: `新合同 v${oldVersion + 1}：${renewed.contractNo}`, by: '系统' })
    list[oldIdx] = { ...old, signStatus: 'renewed', renewedContractId: newId, linkageRecords: oldRecords }
    list.push(renewed)
    save(CT_KEY, list)
    return delay(renewed)
  },
  terminate(payload: { id: number; reason: string }) {
    const list = load<BizContract>(CT_KEY, seedContracts)
    const idx = list.findIndex(c => c.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('合同不存在'))
    if (list[idx].signStatus === 'terminated') return Promise.reject(new Error('合同已终止'))
    const records = list[idx].linkageRecords ? [...list[idx].linkageRecords!] : []
    records.push({ time: ts(), type: 'terminate', title: '合同终止', detail: payload.reason, by: '管理员' })
    list[idx] = {
      ...list[idx],
      signStatus: 'terminated',
      remark: `${list[idx].remark || ''}【终止】${payload.reason}`,
      linkageRecords: records
    }
    save(CT_KEY, list)
    return delay(list[idx])
  },
  getExpiring(params: { days?: number; page?: number; pageSize?: number } = {}) {
    const days = params.days ?? 30
    const limit = new Date()
    limit.setDate(limit.getDate() + days)
    const list = load<BizContract>(CT_KEY, seedContracts).filter(c => {
      if (c.signStatus !== 'signed') return false
      const end = new Date(c.endDate)
      return end.getTime() <= limit.getTime() && end.getTime() >= Date.now() - 86400000
    })
    return delay(paginate(list, params.page, params.pageSize))
  },
  getTemplates(params: { serviceType?: string; enabled?: boolean } = {}) {
    let list = load<BizContractTemplate>(TP_KEY, seedTemplates)
    if (params.serviceType) list = list.filter(t => t.serviceType === params.serviceType)
    if (params.enabled != null) list = list.filter(t => t.enabled === params.enabled)
    return delay(list)
  },
  saveTemplate(data: Partial<BizContractTemplate>) {
    const list = load<BizContractTemplate>(TP_KEY, seedTemplates)
    if (data.id) {
      const idx = list.findIndex(t => t.id === data.id)
      if (idx < 0) return Promise.reject(new Error('模板不存在'))
      list[idx] = { ...list[idx], ...data, updateTime: ts() } as BizContractTemplate
      save(TP_KEY, list)
      return delay(list[idx])
    }
    const id = (list.reduce((m, t) => Math.max(m, t.id), 0) || 0) + 1
    const next: BizContractTemplate = {
      id,
      templateName: data.templateName || `模板${id}`,
      templateCode: data.templateCode || `TPL_${id}`,
      serviceType: data.serviceType || 'other',
      templateContent: data.templateContent || '',
      variableJson: data.variableJson || '[]',
      version: data.version || 'v1.0',
      enabled: data.enabled ?? true,
      createTime: ts(),
      updateTime: ts()
    }
    list.push(next)
    save(TP_KEY, list)
    return delay(next)
  }
}
