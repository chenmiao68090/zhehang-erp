import { orderApi, type BizOrder } from './order'
import { companyApi } from './company'
import { customerApi } from './crm'

export type SignalType =
  | 'new_company'
  | 'tax_abnormal'
  | 'business_abnormal'
  | 'address_abnormal'
  | 'annual_report'
  | 'ecommerce_tax'
  | 'peer_customer'

export type SignalStatus = 'new' | 'pooled' | 'queued' | 'assigned' | 'opportunity' | 'ordered' | 'ignored'
export type IntentLevel = 'A' | 'B' | 'C' | 'D' | 'invalid'

export interface EnterpriseEntity {
  id: number
  name: string
  shortName: string
  creditCode: string
  taxNo: string
  legalPerson: string
  registeredCapital: string
  establishDate: string
  businessStatus: '营业' | '存续' | '迁出' | '注销' | '异常'
  province: string
  city: string
  district: string
  address: string
  industry: string
  companyType: string
  employeeScale: string
  annualRevenue: string
  taxQualification: string
  riskTags: string[]
  contactCount: number
  contacts: Array<{ name: string; title: string; phone: string }>
  source: string
  updateTime: string
}

export interface MarketSignal {
  id: number
  entityId: number
  type: SignalType
  title: string
  scenario: string
  eventDate: string
  reason: string
  authority: string
  region: string
  expectedService: 'bookkeeping' | 'registration' | 'tax_planning' | 'qualification' | 'audit' | 'cancellation' | 'other'
  estimatedAmount: number
  score: number
  level: 'A' | 'B' | 'C' | 'D'
  contactCount: number
  status: SignalStatus
  ownerName: string
  tags: string[]
  createdAt: string
  lastActionAt: string
}

export interface CallTask {
  id: number
  signalId: number
  entityId: number
  customerId: number
  companyName: string
  contactName: string
  phone: string
  scriptType: string
  status: 'waiting' | 'calling' | 'done' | 'missed' | 'invalid'
  intent: IntentLevel | ''
  aiSummary: string
  nextAction: string
  ownerName: string
  scheduledAt: string
  callCount: number
  createdAt: string
}

export interface OnlineLead {
  id: number
  entityId: number
  companyName: string
  channel: '官网表单' | '企微' | '抖音' | '小红书' | '百度推广' | '老客转介绍'
  landingPage: string
  contactName: string
  phone: string
  demand: string
  utmCampaign: string
  cost: number
  score: number
  status: 'new' | 'qualified' | 'pooled' | 'queued' | 'ordered' | 'lost'
  duplicateRisk: 'none' | 'possible' | 'hit'
  receivedAt: string
}

export interface OnlineLeadCreatePayload {
  companyName: string
  channel: OnlineLead['channel']
  landingPage: string
  contactName: string
  phone: string
  demand: string
  utmCampaign?: string
  cost?: number
}

export interface GrowthActionLog {
  id: number
  time: string
  type: string
  title: string
  detail: string
  entityId?: number
  signalId?: number
  orderId?: number
}

export interface GrowthSnapshot {
  entityCount: number
  signalCount: number
  highValueSignalCount: number
  pooledCount: number
  callQueueCount: number
  intentCount: number
  onlineLeadCount: number
  orderCount: number
  orderAmount: number
  receiptAmount: number
  taskCount: number
  overdueTaskCount: number
  funnel: Array<{ stage: string; count: number; rate: number }>
  sourceRoi: Array<{ source: string; leads: number; cost: number; orders: number; amount: number; roi: number }>
  signalTypes: Array<{ type: SignalType; label: string; count: number; amount: number }>
  actionLogs: GrowthActionLog[]
}

export interface CompanyServiceSuggestion {
  service: string
  priority: '高' | '中' | '低'
  amount: number
  reason: string
}

export interface CompanyLinkageSummary {
  signals: { count: number; open: number; records: Array<{ title: string; status: SignalStatus; level: string }> }
  onlineLeads: { count: number; qualified: number; records: Array<{ channel: string; demand: string; status: string; score: number }> }
  customers: { count: number; records: Array<{ id: number; name: string; stage: string; ownerName: string }> }
  orders: { count: number; amount: number; records: Array<{ id: number; orderNo: string; status: string; amount: number }> }
  tasks: { count: number; overdue: number; records: Array<{ id: number; taskName: string; status: string; assigneeName: string }> }
  receipts: { count: number; amount: number; pendingAmount: number; records: Array<{ id: number; receiptNo: string; status: string; amount: number }> }
}

export interface CompanyResolveResult {
  matched: boolean
  confidence: number
  source: string
  keyword: string
  entity: EnterpriseEntity | null
  duplicateRisk: 'none' | 'possible' | 'hit'
  suggestions: CompanyServiceSuggestion[]
  linkage: CompanyLinkageSummary
  nextActions: string[]
}

const KEYS = {
  ENTITIES: 'biz_enterprise_entities',
  SIGNALS: 'biz_market_signals',
  CALL_TASKS: 'biz_call_tasks',
  ONLINE_LEADS: 'biz_online_leads',
  ACTION_LOG: 'biz_growth_action_log',
  CUSTOMERS: 'biz_customer_list',
  TASKS: 'biz_tasks',
  ORDERS: 'biz_orders',
  RECEIPTS: 'biz_receipts'
}

const signalLabelMap: Record<SignalType, string> = {
  new_company: '新企商机',
  tax_abnormal: '税务异常',
  business_abnormal: '经营异常',
  address_abnormal: '地址异常',
  annual_report: '年报客群',
  ecommerce_tax: '电商财税',
  peer_customer: '同行服务客户'
}

const delay = <T>(data: T, ms = 90): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), ms))

function pad(n: number, w = 2) {
  return String(n).padStart(w, '0')
}

function ts(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function dateOnly(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function readList<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list))
}

function paginate<T>(list: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length }
}

function maxId(list: Array<{ id?: number }>) {
  return list.reduce((m, i) => Math.max(m, Number(i.id || 0)), 0)
}

function logAction(entry: Omit<GrowthActionLog, 'id' | 'time'>) {
  const list = readList<GrowthActionLog>(KEYS.ACTION_LOG)
  list.unshift({
    id: maxId(list) + 1,
    time: ts(),
    ...entry
  })
  writeList(KEYS.ACTION_LOG, list.slice(0, 200))
}

function buildSeedEntities(): EnterpriseEntity[] {
  return [
    {
      id: 1001,
      name: '杭州漆园装饰工程有限公司',
      shortName: '漆园装饰',
      creditCode: '91330102MA2QY1001X',
      taxNo: '91330102MA2QY1001X',
      legalPerson: '林漆',
      registeredCapital: '100万人民币',
      establishDate: '2019-06-18',
      businessStatus: '营业',
      province: '浙江省',
      city: '杭州市',
      district: '上城区',
      address: '浙江省杭州市上城区湖悦商务中心1幢108室',
      industry: '建筑装饰和装修业',
      companyType: '有限责任公司',
      employeeScale: '1-1000人',
      annualRevenue: '100万以下',
      taxQualification: '小规模纳税人',
      riskTags: ['地址异常', '待解除异常'],
      contactCount: 12,
      contacts: [{ name: '林总', title: '负责人', phone: '18668973330' }],
      source: '探迹式拓客',
      updateTime: ts(-1)
    },
    {
      id: 1002,
      name: '杭州微妃美业有限公司',
      shortName: '微妃美业',
      creditCode: '91330110MA2QY1002X',
      taxNo: '91330110MA2QY1002X',
      legalPerson: '黄涛',
      registeredCapital: '170万人民币',
      establishDate: '2018-06-25',
      businessStatus: '营业',
      province: '浙江省',
      city: '杭州市',
      district: '拱墅区',
      address: '浙江省杭州市拱墅区祥符街道万达商业中心3幢2119室',
      industry: '理发及美容服务',
      companyType: '有限责任公司',
      employeeScale: '50人以下',
      annualRevenue: '1万-5万',
      taxQualification: '小规模纳税人',
      riskTags: ['经营异常'],
      contactCount: 21,
      contacts: [{ name: '黄总', title: '法人', phone: '13011143334' }],
      source: '探迹式拓客',
      updateTime: ts(-1)
    },
    {
      id: 1003,
      name: '浙江两杉生物科技有限公司',
      shortName: '两杉生物',
      creditCode: '91330108MA2QY1003X',
      taxNo: '91330108MA2QY1003X',
      legalPerson: '周沐',
      registeredCapital: '500万人民币',
      establishDate: '2026-05-12',
      businessStatus: '存续',
      province: '浙江省',
      city: '杭州市',
      district: '滨江区',
      address: '浙江省杭州市滨江区长河街道生物医药园2幢801室',
      industry: '科技推广和应用服务业',
      companyType: '有限责任公司',
      employeeScale: '50人以下',
      annualRevenue: '新设企业',
      taxQualification: '未核定',
      riskTags: ['T+7新企', '待税务报到'],
      contactCount: 5,
      contacts: [{ name: '周总', title: '创始人', phone: '15800331418' }],
      source: '企业新设监控',
      updateTime: ts(-2)
    },
    {
      id: 1004,
      name: '杭州杰固机械设备有限公司',
      shortName: '杰固机械',
      creditCode: '91330104MA2QY1004X',
      taxNo: '91330104MA2QY1004X',
      legalPerson: '张伟',
      registeredCapital: '10万人民币',
      establishDate: '2015-08-31',
      businessStatus: '异常',
      province: '浙江省',
      city: '杭州市',
      district: '江干区',
      address: '浙江省杭州市江干区彭埠街道云河家园商贸区配套营业用房临5幢23号',
      industry: '服装批发',
      companyType: '有限责任公司',
      employeeScale: '1-1000人',
      annualRevenue: '50万-100万',
      taxQualification: '一般纳税人',
      riskTags: ['税务非正常户'],
      contactCount: 5,
      contacts: [{ name: '张总', title: '法人', phone: '17702027009' }],
      source: '税务异常监控',
      updateTime: ts(-3)
    },
    {
      id: 1005,
      name: '杭州华烽智康科技有限公司',
      shortName: '华烽智康',
      creditCode: '91330105MA2QY1005X',
      taxNo: '91330105MA2QY1005X',
      legalPerson: '王文杰',
      registeredCapital: '10万人民币',
      establishDate: '2024-11-07',
      businessStatus: '营业',
      province: '浙江省',
      city: '杭州市',
      district: '滨江区',
      address: '浙江省杭州市滨江区长河街道月明路1040号3层39547室',
      industry: '计算机、软件及辅助设备零售',
      companyType: '有限责任公司',
      employeeScale: '50人以下',
      annualRevenue: '100万以下',
      taxQualification: '疑似小规模纳税人',
      riskTags: ['税务非正常户', '科技客户'],
      contactCount: 2,
      contacts: [{ name: '王总', title: '负责人', phone: '18505277788' }],
      source: '税务异常监控',
      updateTime: ts(-3)
    },
    {
      id: 1006,
      name: '杭州世御科技有限公司萧山分公司',
      shortName: '世御科技',
      creditCode: '91330109MA2QY1006X',
      taxNo: '91330109MA2QY1006X',
      legalPerson: '宋明',
      registeredCapital: '0万人民币',
      establishDate: '2015-11-03',
      businessStatus: '营业',
      province: '浙江省',
      city: '杭州市',
      district: '萧山区',
      address: '萧山区萧山经济技术开发区桥南区块鸿达路357号',
      industry: '计算机和辅助设备修理',
      companyType: '分公司',
      employeeScale: '501-999人',
      annualRevenue: '100万以下',
      taxQualification: '疑似小规模纳税人',
      riskTags: ['税务非正常户'],
      contactCount: 8,
      contacts: [{ name: '宋经理', title: '负责人', phone: '18622222222' }],
      source: '税务异常监控',
      updateTime: ts(-4)
    },
    {
      id: 1007,
      name: '杭州罗舍贸易有限公司',
      shortName: '罗舍贸易',
      creditCode: '91330109MA2QY1007X',
      taxNo: '91330109MA2QY1007X',
      legalPerson: '罗舍',
      registeredCapital: '100万人民币',
      establishDate: '2019-08-22',
      businessStatus: '注销',
      province: '浙江省',
      city: '杭州市',
      district: '萧山区',
      address: '浙江省杭州市萧山区蜀山街道市心南路1038号2423室',
      industry: '服装零售',
      companyType: '有限责任公司',
      employeeScale: '50人以下',
      annualRevenue: '100万以下',
      taxQualification: '疑似小规模纳税人',
      riskTags: ['简易注销', '潜在注销服务'],
      contactCount: 4,
      contacts: [{ name: '罗总', title: '法人', phone: '18633333333' }],
      source: '工商状态监控',
      updateTime: ts(-5)
    },
    {
      id: 1008,
      name: '大连中安华瑞自动化设备有限公司',
      shortName: '中安华瑞',
      creditCode: '91210204MA2QY1008X',
      taxNo: '91210204MA2QY1008X',
      legalPerson: '刘安',
      registeredCapital: '50万人民币',
      establishDate: '2008-12-17',
      businessStatus: '营业',
      province: '辽宁省',
      city: '大连市',
      district: '甘井子区',
      address: '辽宁省大连市甘井子区华东路94号',
      industry: '批发业',
      companyType: '有限责任公司',
      employeeScale: '50人以下',
      annualRevenue: '100万-500万',
      taxQualification: '一般纳税人',
      riskTags: ['新增欠税', '高开票需求'],
      contactCount: 8,
      contacts: [{ name: '刘总', title: '法人', phone: '18600000000' }],
      source: '税务异常监控',
      updateTime: ts(-1)
    },
    {
      id: 1009,
      name: '杭州云栖电子商务有限公司',
      shortName: '云栖电商',
      creditCode: '91330106MA2QY1009X',
      taxNo: '91330106MA2QY1009X',
      legalPerson: '陈悦',
      registeredCapital: '200万人民币',
      establishDate: '2026-05-25',
      businessStatus: '存续',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      address: '浙江省杭州市西湖区文三路数字经济园8幢601室',
      industry: '互联网零售',
      companyType: '有限责任公司',
      employeeScale: '50人以下',
      annualRevenue: '新设企业',
      taxQualification: '未核定',
      riskTags: ['T+1新企', '电商财税'],
      contactCount: 7,
      contacts: [{ name: '陈总', title: '创始人', phone: '19912345678' }],
      source: '线上线索',
      updateTime: ts()
    },
    {
      id: 1010,
      name: '宁波蔚蓝跨境贸易有限公司',
      shortName: '蔚蓝跨境',
      creditCode: '91330206MA2QY1010X',
      taxNo: '91330206MA2QY1010X',
      legalPerson: '沈蔚',
      registeredCapital: '300万人民币',
      establishDate: '2023-03-18',
      businessStatus: '营业',
      province: '浙江省',
      city: '宁波市',
      district: '北仑区',
      address: '浙江省宁波市北仑区梅山保税港区跨境园11幢302室',
      industry: '货物进出口',
      companyType: '有限责任公司',
      employeeScale: '50-100人',
      annualRevenue: '500万-1000万',
      taxQualification: '一般纳税人',
      riskTags: ['出口退税', '跨境电商'],
      contactCount: 9,
      contacts: [{ name: '沈总', title: '负责人', phone: '18800001111' }],
      source: '官网表单',
      updateTime: ts(-2)
    }
  ]
}

function buildSeedSignals(): MarketSignal[] {
  return [
    mkSignal(3001, 1003, 'new_company', 'T+7 新注册公司待税务报到', '新设企业通常需要代理记账、税务报到、银行三方协议', -1, '企业新设登记', '杭州市市场监督管理局', 'bookkeeping', 12800, ['T+7', '税务报到', '代理记账']),
    mkSignal(3002, 1009, 'new_company', 'T+1 电商新企商机', '刚注册的电商主体，适合工商、记账、开票、合规套餐', 0, '新设登记', '杭州市西湖区市场监督管理局', 'registration', 18800, ['T+1', '电商', '高转化']),
    mkSignal(3003, 1004, 'tax_abnormal', '税务非正常户解除需求', '税务异常不处理会影响开票、申报和经营信用', -2, '税务非正常户', '国家税务总局杭州市江干区税务局', 'tax_planning', 9800, ['税务异常', '一般纳税人']),
    mkSignal(3004, 1005, 'tax_abnormal', '科技企业税务非正常户', '疑似小规模纳税人，需核查申报与地址材料', -3, '税务非正常户', '国家税务总局杭州市滨江区税务局', 'tax_planning', 7800, ['科技客户', '税务异常']),
    mkSignal(3005, 1008, 'tax_abnormal', '新增欠税公告', '新增欠税客户通常需要补税、申报、滞纳金测算和解除异常', -1, '欠税公告', '大连市税务局', 'tax_planning', 13800, ['欠税公告', '高开票']),
    mkSignal(3006, 1001, 'business_abnormal', '经营异常名录解除', '登记住所或经营场所无法联系，适合地址挂靠和异常解除', -7, '通过登记住所无法联系', '杭州市上城区市场监督管理局', 'qualification', 6800, ['地址异常', '异常解除']),
    mkSignal(3007, 1002, 'address_abnormal', '美业客户地址异常解除', '美业门店工商地址与实际经营地址不一致，适合工商变更', -5, '经营场所异常', '杭州市拱墅区市场监督管理局', 'qualification', 5800, ['地址异常', '工商变更']),
    mkSignal(3008, 1007, 'business_abnormal', '简易注销与税务清算', '进入简易注销流程，需要税务清算、工商注销、账务归档', -8, '简易注销公告', '杭州市萧山区市场监督管理局', 'cancellation', 11800, ['注销服务', '税务清算']),
    mkSignal(3009, 1010, 'ecommerce_tax', '跨境电商出口退税与账务规范', '跨境贸易客户关注出口退税、发票、成本归集和税务风险', -2, '线上咨询', '官网表单', 'tax_planning', 26800, ['跨境电商', '出口退税']),
    mkSignal(3010, 1006, 'peer_customer', '同行服务客户可替换机会', '同行客户出现服务质量问题，适合切入代账与税务服务替换', -4, '同行服务质量问题', '客户回访渠道', 'bookkeeping', 16800, ['同行服务', '替换商机'])
  ]
}

function mkSignal(
  id: number,
  entityId: number,
  type: SignalType,
  title: string,
  scenario: string,
  offset: number,
  reason: string,
  authority: string,
  expectedService: MarketSignal['expectedService'],
  estimatedAmount: number,
  tags: string[]
): MarketSignal {
  const entity = buildSeedEntities().find(e => e.id === entityId)
  const contactCount = entity?.contactCount || 0
  const score = Math.min(98, 48 + contactCount * 2 + Math.round(estimatedAmount / 1000))
  return {
    id,
    entityId,
    type,
    title,
    scenario,
    eventDate: dateOnly(offset),
    reason,
    authority,
    region: `${entity?.city || ''}${entity?.district || ''}`,
    expectedService,
    estimatedAmount,
    score,
    level: score >= 85 ? 'A' : score >= 72 ? 'B' : score >= 58 ? 'C' : 'D',
    contactCount,
    status: id === 3009 ? 'queued' : 'new',
    ownerName: id === 3009 ? '张小兰' : '',
    tags,
    createdAt: ts(offset),
    lastActionAt: ts(offset)
  }
}

function buildSeedOnlineLeads(): OnlineLead[] {
  return [
    {
      id: 5001,
      entityId: 1010,
      companyName: '宁波蔚蓝跨境贸易有限公司',
      channel: '官网表单',
      landingPage: '出口退税服务落地页',
      contactName: '沈总',
      phone: '18800001111',
      demand: '跨境电商出口退税、发票合规和代理记账',
      utmCampaign: '2026-q2-export-tax',
      cost: 420,
      score: 91,
      status: 'qualified',
      duplicateRisk: 'none',
      receivedAt: ts(-1)
    },
    {
      id: 5002,
      entityId: 1009,
      companyName: '杭州云栖电子商务有限公司',
      channel: '抖音',
      landingPage: '新公司财税套餐',
      contactName: '陈总',
      phone: '19912345678',
      demand: '刚注册公司，需要税务报到、代账和开票咨询',
      utmCampaign: 'dy-new-company',
      cost: 260,
      score: 87,
      status: 'queued',
      duplicateRisk: 'possible',
      receivedAt: ts()
    },
    {
      id: 5003,
      entityId: 1002,
      companyName: '杭州微妃美业有限公司',
      channel: '小红书',
      landingPage: '美业门店工商变更',
      contactName: '黄总',
      phone: '13011143334',
      demand: '门店地址变更和经营异常处理',
      utmCampaign: 'xhs-beauty-tax',
      cost: 180,
      score: 78,
      status: 'new',
      duplicateRisk: 'none',
      receivedAt: ts(-2)
    },
    {
      id: 5004,
      entityId: 1008,
      companyName: '大连中安华瑞自动化设备有限公司',
      channel: '百度推广',
      landingPage: '税务异常解除',
      contactName: '刘总',
      phone: '18600000000',
      demand: '欠税公告处理、补申报和滞纳金测算',
      utmCampaign: 'baidu-tax-abnormal',
      cost: 520,
      score: 84,
      status: 'qualified',
      duplicateRisk: 'none',
      receivedAt: ts(-1)
    },
    {
      id: 5005,
      entityId: 1003,
      companyName: '浙江两杉生物科技有限公司',
      channel: '企微',
      landingPage: '新公司开户注册流程',
      contactName: '周总',
      phone: '15800331418',
      demand: '代理记账、税务报到、银行开户资料',
      utmCampaign: 'qw-new-company',
      cost: 0,
      score: 82,
      status: 'new',
      duplicateRisk: 'possible',
      receivedAt: ts(-3)
    }
  ]
}

function buildSeedCallTasks(): CallTask[] {
  return [
    mkCallTask(4001, 3009, 1010, '张小兰', '跨境财税诊断'),
    mkCallTask(4002, 3002, 1009, '李明', '新公司财税套餐')
  ]
}

function mkCallTask(id: number, signalId: number, entityId: number, ownerName: string, scriptType: string): CallTask {
  const entity = buildSeedEntities().find(e => e.id === entityId) as EnterpriseEntity
  const contact = entity.contacts[0]
  return {
    id,
    signalId,
    entityId,
    customerId: 0,
    companyName: entity.name,
    contactName: contact.name,
    phone: contact.phone,
    scriptType,
    status: 'waiting',
    intent: '',
    aiSummary: '',
    nextAction: '',
    ownerName,
    scheduledAt: ts(),
    callCount: 0,
    createdAt: ts(-1)
  }
}

function ensureSeed<T extends { id: number }>(key: string, builder: () => T[]) {
  const current = readList<T>(key)
  const seed = builder()
  let changed = false
  seed.forEach(item => {
    if (!current.some(row => row.id === item.id)) {
      current.push(item)
      changed = true
    }
  })
  if (changed || current.length === 0) writeList(key, current.length ? current : seed)
}

function ensureSamples() {
  ensureSeed(KEYS.ENTITIES, buildSeedEntities)
  ensureSeed(KEYS.SIGNALS, buildSeedSignals)
  ensureSeed(KEYS.ONLINE_LEADS, buildSeedOnlineLeads)
  ensureSeed(KEYS.CALL_TASKS, buildSeedCallTasks)
}

function getEntity(entityId: number): EnterpriseEntity | undefined {
  ensureSamples()
  return readList<EnterpriseEntity>(KEYS.ENTITIES).find(e => e.id === entityId)
}

function normalizeName(name: string) {
  return (name || '').replace(/[()（）\s]/g, '').toLowerCase()
}

function shortNameFromCompany(name: string) {
  return (name || '')
    .replace(/浙江省|浙江|杭州市|杭州|宁波市|宁波|有限责任公司|股份有限公司|有限公司|分公司/g, '')
    .slice(0, 4) || name.slice(0, 4)
}

function ensureEntityByCompanyName(payload: { companyName: string; contactName?: string; phone?: string; source?: string }): EnterpriseEntity {
  ensureSamples()
  const entities = readList<EnterpriseEntity>(KEYS.ENTITIES)
  const normalized = normalizeName(payload.companyName)
  let entity = entities.find(e => normalizeName(e.name) === normalized || e.name.includes(payload.companyName) || payload.companyName.includes(e.shortName))
  if (entity) return entity

  entity = {
    id: maxId(entities) + 1,
    name: payload.companyName,
    shortName: shortNameFromCompany(payload.companyName),
    creditCode: `待核验-${Date.now()}`,
    taxNo: '',
    legalPerson: '待核验',
    registeredCapital: '待核验',
    establishDate: dateOnly(),
    businessStatus: '存续',
    province: '浙江省',
    city: '杭州市',
    district: '待核验',
    address: '待工商接口核验',
    industry: '待核验行业',
    companyType: '待核验',
    employeeScale: '待核验',
    annualRevenue: '待核验',
    taxQualification: '待核定',
    riskTags: ['待工商核验'],
    contactCount: payload.phone ? 1 : 0,
    contacts: payload.phone ? [{ name: payload.contactName || '负责人', title: '表单联系人', phone: payload.phone }] : [],
    source: payload.source || '网销表单',
    updateTime: ts()
  }
  entities.unshift(entity)
  writeList(KEYS.ENTITIES, entities)
  return entity
}

function onlineLeadScore(payload: OnlineLeadCreatePayload, entity: EnterpriseEntity, duplicateRisk: OnlineLead['duplicateRisk']) {
  let score = 58
  if (payload.demand.includes('代理记账') || payload.demand.includes('税务')) score += 12
  if (payload.demand.includes('注册') || payload.demand.includes('新公司')) score += 10
  if (payload.demand.includes('异常') || payload.demand.includes('地址')) score += 10
  if (payload.phone) score += 8
  if (entity.contactCount >= 8) score += 6
  if (duplicateRisk === 'hit') score -= 12
  if (duplicateRisk === 'possible') score -= 5
  return Math.max(30, Math.min(98, score))
}

function ensureCustomer(entity: EnterpriseEntity, source = '拓客情报', poolType = 'new_leads') {
  const list = readList<any>(KEYS.CUSTOMERS)
  let customer = list.find(c =>
    c.entityId === entity.id ||
    c.creditCode === entity.creditCode ||
    normalizeName(c.name || c.company || c.customerName) === normalizeName(entity.name)
  )
  if (!customer) {
    customer = {
      id: maxId(list) + 2001,
      entityId: entity.id,
      name: entity.name,
      company: entity.name,
      customerName: entity.name,
      creditCode: entity.creditCode,
      taxNo: entity.taxNo,
      phone: entity.contacts[0]?.phone || '',
      contactName: entity.contacts[0]?.name || '',
      region: entity.city,
      industry: entity.industry,
      source,
      poolType,
      customerType: '企业客户',
      customerLevel: entity.riskTags.includes('高开票需求') || entity.contactCount >= 8 ? 'A' : 'B',
      followStage: 'new',
      dealStatus: 'new',
      ownership: 'pool',
      createTime: ts(),
      updateTime: ts()
    }
    list.push(customer)
  } else {
    customer.entityId = entity.id
    customer.creditCode = entity.creditCode
    customer.taxNo = entity.taxNo
    customer.phone = customer.phone || entity.contacts[0]?.phone || ''
    customer.contactName = customer.contactName || entity.contacts[0]?.name || ''
    customer.region = customer.region || entity.city
    customer.industry = customer.industry || entity.industry
    customer.source = customer.source || source
    customer.poolType = customer.poolType || poolType
    customer.updateTime = ts()
  }
  writeList(KEYS.CUSTOMERS, list)
  return customer
}

function updateSignal(id: number, patch: Partial<MarketSignal>) {
  const list = readList<MarketSignal>(KEYS.SIGNALS)
  const idx = list.findIndex(s => s.id === id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch, lastActionAt: ts() }
    writeList(KEYS.SIGNALS, list)
    return list[idx]
  }
  return null
}

function emptyLinkage(): CompanyLinkageSummary {
  return {
    signals: { count: 0, open: 0, records: [] },
    onlineLeads: { count: 0, qualified: 0, records: [] },
    customers: { count: 0, records: [] },
    orders: { count: 0, amount: 0, records: [] },
    tasks: { count: 0, overdue: 0, records: [] },
    receipts: { count: 0, amount: 0, pendingAmount: 0, records: [] }
  }
}

function companySuggestions(entity: EnterpriseEntity): CompanyServiceSuggestion[] {
  const tags = entity.riskTags.join(',')
  const list: CompanyServiceSuggestion[] = []
  const push = (item: CompanyServiceSuggestion) => {
    if (!list.some(row => row.service === item.service)) list.push(item)
  }

  if (tags.includes('新企') || entity.establishDate >= '2026-01-01') {
    push({ service: '代理记账 + 税务报到', priority: '高', amount: 12800, reason: '新设企业通常需要建账、税务报到、银行三方协议和首年记账。' })
    push({ service: '工商注册后续包', priority: '中', amount: 6800, reason: '适合补齐刻章、银行开户、社保公积金开户等后续事项。' })
  }
  if (tags.includes('税务')) {
    push({ service: '税务异常解除', priority: '高', amount: 9800, reason: '当前存在税务异常标签，若不处理可能影响开票、申报和经营信用。' })
  }
  if (tags.includes('地址') || tags.includes('经营异常')) {
    push({ service: '地址异常解除 / 工商变更', priority: '高', amount: 5800, reason: '经营地址异常适合转化工商变更、异常解除和挂靠地址服务。' })
  }
  if (entity.industry.includes('电子商务') || tags.includes('电商')) {
    push({ service: '电商财税合规', priority: '中', amount: 16800, reason: '电商主体通常关注开票、平台流水、进销项和税负测算。' })
  }
  if (entity.contactCount >= 8) {
    push({ service: '电销优先触达', priority: '中', amount: 0, reason: `联系方式 ${entity.contactCount} 个，适合优先进入电销队列。` })
  }
  if (!list.length) {
    push({ service: '代理记账标准套餐', priority: '中', amount: 9800, reason: '企业主体信息完整，可作为标准财税服务线索继续跟进。' })
  }
  return list.slice(0, 4)
}

function buildLinkage(entity: EnterpriseEntity): CompanyLinkageSummary {
  const signals = readList<MarketSignal>(KEYS.SIGNALS).filter(s => s.entityId === entity.id)
  const onlineLeads = readList<OnlineLead>(KEYS.ONLINE_LEADS).filter(l => l.entityId === entity.id)
  const customers = readList<any>(KEYS.CUSTOMERS).filter(c =>
    c.entityId === entity.id ||
    c.creditCode === entity.creditCode ||
    normalizeName(c.name || c.company || c.customerName) === normalizeName(entity.name)
  )
  const customerIds = new Set(customers.map(c => Number(c.id)))
  const orders = readList<any>(KEYS.ORDERS).filter(o => customerIds.has(Number(o.customerId)) || normalizeName(o.customerName || '') === normalizeName(entity.name))
  const orderIds = new Set(orders.map(o => Number(o.id)))
  const tasks = readList<any>(KEYS.TASKS).filter(t =>
    customerIds.has(Number(t.customerId)) ||
    normalizeName(t.customerName || '') === normalizeName(entity.name) ||
    String(t.taskContent || t.remark || '').includes(entity.shortName)
  )
  const receipts = readList<any>(KEYS.RECEIPTS).filter(r =>
    customerIds.has(Number(r.customerId)) ||
    orderIds.has(Number(r.orderId)) ||
    normalizeName(r.customerName || '') === normalizeName(entity.name)
  )
  const today = dateOnly()
  return {
    signals: {
      count: signals.length,
      open: signals.filter(s => !['ordered', 'ignored'].includes(s.status)).length,
      records: signals.slice(0, 3).map(s => ({ title: s.title, status: s.status, level: s.level }))
    },
    onlineLeads: {
      count: onlineLeads.length,
      qualified: onlineLeads.filter(l => ['qualified', 'queued', 'ordered'].includes(l.status)).length,
      records: onlineLeads.slice(0, 3).map(l => ({ channel: l.channel, demand: l.demand, status: l.status, score: l.score }))
    },
    customers: {
      count: customers.length,
      records: customers.slice(0, 3).map(c => ({ id: c.id, name: c.name || c.company || c.customerName, stage: c.followStage || c.dealStatus || '-', ownerName: c.ownerName || c.assigneeName || '未分配' }))
    },
    orders: {
      count: orders.length,
      amount: orders.reduce((s, o) => s + Number(o.finalAmount || o.amount || 0), 0),
      records: orders.slice(0, 3).map(o => ({ id: o.id, orderNo: o.orderNo || '-', status: o.status || o.approvalStatus || '-', amount: Number(o.finalAmount || o.amount || 0) }))
    },
    tasks: {
      count: tasks.length,
      overdue: tasks.filter(t => t.status !== 'completed' && t.planEndDate && t.planEndDate < today).length,
      records: tasks.slice(0, 3).map(t => ({ id: t.id, taskName: t.taskName || t.title || '-', status: t.status || '-', assigneeName: t.assigneeName || t.ownerName || '-' }))
    },
    receipts: {
      count: receipts.length,
      amount: receipts.filter(r => r.status === 'confirmed' || r.status === 'done').reduce((s, r) => s + Number(r.amount || r.receiptAmount || 0), 0),
      pendingAmount: receipts.filter(r => !['confirmed', 'done'].includes(r.status)).reduce((s, r) => s + Number(r.amount || r.receiptAmount || 0), 0),
      records: receipts.slice(0, 3).map(r => ({ id: r.id, receiptNo: r.receiptNo || r.no || '-', status: r.status || '-', amount: Number(r.amount || r.receiptAmount || 0) }))
    }
  }
}

function createFollowTask(customer: any, title: string, detail: string, priority: 'normal' | 'high' | 'urgent' = 'high') {
  const tasks = readList<any>(KEYS.TASKS)
  const id = maxId(tasks) + 1
  tasks.push({
    id,
    taskNo: `WT${new Date().getFullYear()}MK${pad(id, 4)}`,
    taskType: 'callback',
    taskName: title,
    orderId: 0,
    orderNo: '',
    customerId: customer.id,
    customerName: customer.name || customer.customerName || customer.company,
    assigneeId: 1003,
    assigneeName: customer.ownerName || '张小兰',
    assignerId: 1002,
    assignerName: '营销主管',
    priority,
    status: 'assigned',
    planStartDate: dateOnly(),
    planEndDate: dateOnly(2),
    actualStartTime: '',
    actualEndTime: '',
    taskContent: detail,
    deliverable: '',
    reviewerId: 0,
    reviewerName: '',
    reviewTime: '',
    reviewResult: '',
    reviewOpinion: '',
    remark: `M|营销跟进|${detail}`,
    createTime: ts()
  })
  writeList(KEYS.TASKS, tasks)
}

function serviceText(type: MarketSignal['expectedService']) {
  return ({
    bookkeeping: '代理记账',
    registration: '工商注册',
    tax_planning: '税务筹划',
    qualification: '工商/资质',
    audit: '审计服务',
    cancellation: '注销清算',
    other: '综合财税'
  } as Record<string, string>)[type] || '综合财税'
}

function servicePeriod(type: MarketSignal['expectedService']) {
  return type === 'bookkeeping' || type === 'tax_planning' ? '1year' : 'one_time'
}

function sourceCost(source: string) {
  const online = readList<OnlineLead>(KEYS.ONLINE_LEADS)
  return online.filter(l => l.channel === source).reduce((s, l) => s + Number(l.cost || 0), 0)
}

/** 把后端返回的工商主体缓存进本地（按 id / 信用代码 去重 upsert），供勾稽展示与离线回退 */
function cacheEntities(items: EnterpriseEntity[]) {
  if (!items || !items.length) return
  const list = readList<EnterpriseEntity>(KEYS.ENTITIES)
  items.forEach(item => {
    if (!item) return
    const idx = list.findIndex(e => (item.id && e.id === item.id) || (item.creditCode && e.creditCode === item.creditCode))
    if (idx >= 0) list[idx] = { ...list[idx], ...item }
    else list.unshift(item)
  })
  writeList(KEYS.ENTITIES, list)
}

/** 税务资质文本 → 客户表 taxpayerType（1 一般纳税人 / 2 小规模纳税人） */
function taxpayerTypeOf(taxQualification?: string): number | undefined {
  if (!taxQualification) return undefined
  if (taxQualification.includes('一般')) return 1
  if (taxQualification.includes('小规模')) return 2
  return undefined
}

export const enterpriseApi = {
  ensureSamples: () => delay(ensureSamples()),
  async list(params: { keyword?: string; region?: string; risk?: string; page?: number; pageSize?: number } = {}) {
    // 优先后端工商查询服务
    try {
      const res = await companyApi.list({
        keyword: params.keyword,
        region: params.region,
        risk: params.risk,
        pageNum: params.page || 1,
        pageSize: params.pageSize || 10
      })
      if (res && Array.isArray(res.list)) {
        cacheEntities(res.list)
        return { list: res.list, total: res.total }
      }
    } catch { /* 后端不可用，回退本地示例库 */ }
    ensureSamples()
    const keyword = (params.keyword || '').trim()
    let list = readList<EnterpriseEntity>(KEYS.ENTITIES)
    if (keyword) {
      list = list.filter(e =>
        e.name.includes(keyword) ||
        e.shortName.includes(keyword) ||
        e.creditCode.includes(keyword) ||
        e.legalPerson.includes(keyword)
      )
    }
    if (params.region) list = list.filter(e => `${e.province}${e.city}${e.district}`.includes(params.region!))
    if (params.risk) list = list.filter(e => e.riskTags.some(t => t.includes(params.risk!)))
    return paginate(list, params.page, params.pageSize || 10)
  },
  async search(keyword: string) {
    const k = (keyword || '').trim()
    if (!k) return [] as EnterpriseEntity[]
    try {
      const list = await companyApi.suggest(k, 8)
      if (list && list.length) {
        cacheEntities(list)
        return list
      }
    } catch { /* 回退本地 */ }
    ensureSamples()
    return readList<EnterpriseEntity>(KEYS.ENTITIES)
      .filter(e => e.name.includes(k) || e.shortName.includes(k) || e.creditCode.includes(k))
      .slice(0, 8)
  },
  detail(id: number) {
    return delay(getEntity(id) || null)
  },
  async resolveCompany(keyword: string): Promise<CompanyResolveResult> {
    const k = (keyword || '').trim()
    if (!k) {
      return {
        matched: false,
        confidence: 0,
        source: '工商查询服务',
        keyword: k,
        entity: null,
        duplicateRisk: 'none',
        suggestions: [],
        linkage: emptyLinkage(),
        nextActions: ['输入公司全称或统一社会信用代码后自动带出工商、税务与联系方式。']
      }
    }
    // 优先后端工商查询服务，失败回退本地示例库
    let entity: EnterpriseEntity | null = null
    let source = '工商查询服务'
    try {
      entity = await companyApi.detail(k)
    } catch { entity = null }
    if (entity) {
      cacheEntities([entity])
    } else {
      ensureSamples()
      const list = readList<EnterpriseEntity>(KEYS.ENTITIES)
      const normalized = normalizeName(k)
      entity =
        list.find(e => normalizeName(e.name) === normalized || e.creditCode === k) ||
        list.find(e => e.name.includes(k) || k.includes(e.shortName) || e.shortName.includes(k) || e.creditCode.includes(k)) ||
        null
      if (entity) source = '本地工商主体库'
    }

    if (!entity) {
      return {
        matched: false,
        confidence: 0,
        source,
        keyword: k,
        entity: null,
        duplicateRisk: 'none',
        suggestions: [],
        linkage: emptyLinkage(),
        nextActions: [
          '未命中工商库，可先保存为待核验线索。',
          '接入企查查/天眼查/探迹等真实工商接口后，可在这里实时拉取外部工商信息。',
          '核验通过后再生成客户主数据，避免重复客户和后续订单错挂。'
        ]
      }
    }

    const normalized = normalizeName(k)
    const linkage = buildLinkage(entity)
    const confidence = normalizeName(entity.name) === normalized || entity.creditCode === k ? 98 : 86
    const duplicateRisk: CompanyResolveResult['duplicateRisk'] =
      linkage.customers.count > 0 || linkage.orders.count > 0 ? 'hit' : linkage.signals.count > 0 || linkage.onlineLeads.count > 0 ? 'possible' : 'none'

    return {
      matched: true,
      confidence,
      source: entity.source || source,
      keyword: k,
      entity,
      duplicateRisk,
      suggestions: companySuggestions(entity),
      linkage,
      nextActions: [
        duplicateRisk === 'hit' ? '已存在客户或订单，建议先查看关联记录，避免撞单。' : '可生成客户主数据，并进入线索分配或电销队列。',
        entity.contactCount >= 8 ? '联系方式充足，建议优先安排电销首呼。' : '联系方式偏少，建议先补充法人/财务负责人联系方式。',
        entity.riskTags.length ? `关注风险标签：${entity.riskTags.join('、')}。` : '工商状态正常，可按标准财税套餐跟进。'
      ]
    }
  },
  async createCustomer(entityId: number) {
    ensureSamples()
    const entity = getEntity(entityId)
    if (!entity) return Promise.reject(new Error('企业主体不存在'))
    // 真落库到后端客户表（统一社会信用代码作为勾稽主键）
    let persisted = false
    try {
      await customerApi.create({
        name: entity.name,
        shortName: entity.shortName,
        creditCode: entity.creditCode,
        address: entity.address,
        industry: entity.industry,
        taxpayerType: taxpayerTypeOf(entity.taxQualification),
        source: entity.source || '企业主体库',
        remark: `工商自动带出 | 法人:${entity.legalPerson} | 注册资本:${entity.registeredCapital} | 成立:${entity.establishDate} | 状态:${entity.businessStatus}`
      })
      persisted = true
    } catch { /* 后端不可用则仅本地缓存 */ }
    // 同步本地，供页面勾稽即时展示
    const customer = ensureCustomer(entity, '企业主体库', 'new_leads')
    logAction({
      type: 'entity_customer',
      title: persisted ? '企业主体生成客户(已入库)' : '企业主体生成客户(本地)',
      detail: `${entity.name} 已写入客户主数据，后续线索/订单/任务统一按统一社会信用代码勾稽`,
      entityId
    })
    return customer
  },
  async stats() {
    try {
      const s = await companyApi.stats()
      if (s) return s
    } catch { /* 回退本地 */ }
    ensureSamples()
    const entities = readList<EnterpriseEntity>(KEYS.ENTITIES)
    return {
      total: entities.length,
      risky: entities.filter(e => e.riskTags.length > 0).length,
      newCompany: entities.filter(e => e.riskTags.some(t => t.includes('新企'))).length,
      contactRich: entities.filter(e => e.contactCount >= 8).length
    }
  }
}

export const marketApi = {
  ensureSamples: () => delay(ensureSamples()),
  signalLabel: (type: SignalType) => signalLabelMap[type],
  list(params: { type?: SignalType | ''; keyword?: string; status?: SignalStatus | ''; level?: string; page?: number; pageSize?: number } = {}) {
    ensureSamples()
    let list = readList<MarketSignal>(KEYS.SIGNALS)
    if (params.type) list = list.filter(s => s.type === params.type)
    if (params.status) list = list.filter(s => s.status === params.status)
    if (params.level) list = list.filter(s => s.level === params.level)
    const keyword = (params.keyword || '').trim()
    if (keyword) {
      const entities = readList<EnterpriseEntity>(KEYS.ENTITIES)
      list = list.filter(s => {
        const e = entities.find(row => row.id === s.entityId)
        return s.title.includes(keyword) || s.reason.includes(keyword) || (e?.name || '').includes(keyword)
      })
    }
    list = list.sort((a, b) => b.score - a.score || b.eventDate.localeCompare(a.eventDate))
    const page = paginate(list, params.page, params.pageSize || 10)
    return delay({
      ...page,
      list: page.list.map(signal => ({ ...signal, entity: getEntity(signal.entityId), typeLabel: signalLabelMap[signal.type] }))
    })
  },
  summary() {
    ensureSamples()
    const signals = readList<MarketSignal>(KEYS.SIGNALS)
    return delay({
      total: signals.length,
      high: signals.filter(s => s.level === 'A').length,
      queued: signals.filter(s => s.status === 'queued').length,
      ordered: signals.filter(s => s.status === 'ordered').length,
      amount: signals.reduce((s, i) => s + i.estimatedAmount, 0)
    })
  },
  addToPool(ids: number[]) {
    ensureSamples()
    const created: any[] = []
    ids.forEach(id => {
      const signal = updateSignal(id, { status: 'pooled' })
      const entity = signal ? getEntity(signal.entityId) : undefined
      if (!signal || !entity) return
      const customer = ensureCustomer(entity, signalLabelMap[signal.type], 'new_leads')
      created.push(customer)
      logAction({
        type: 'market_pool',
        title: '拓客情报加入公海',
        detail: `${entity.name} 由「${signalLabelMap[signal.type]}」进入公海池`,
        entityId: entity.id,
        signalId: signal.id
      })
    })
    return delay({ created: created.length, customers: created })
  },
  addToCallQueue(ids: number[], ownerName = '张小兰') {
    ensureSamples()
    const tasks = readList<CallTask>(KEYS.CALL_TASKS)
    let created = 0
    ids.forEach(id => {
      const signal = updateSignal(id, { status: 'queued', ownerName })
      const entity = signal ? getEntity(signal.entityId) : undefined
      if (!signal || !entity) return
      const customer = ensureCustomer(entity, signalLabelMap[signal.type], 'telemarketing')
      if (!tasks.some(t => t.signalId === signal.id)) {
        const contact = entity.contacts[0]
        tasks.unshift({
          id: maxId(tasks) + 1 + created,
          signalId: signal.id,
          entityId: entity.id,
          customerId: customer.id,
          companyName: entity.name,
          contactName: contact?.name || '负责人',
          phone: contact?.phone || '',
          scriptType: serviceText(signal.expectedService),
          status: 'waiting',
          intent: '',
          aiSummary: '',
          nextAction: '',
          ownerName,
          scheduledAt: ts(),
          callCount: 0,
          createdAt: ts()
        })
        created++
      }
      logAction({
        type: 'market_call',
        title: '加入电销队列',
        detail: `${entity.name} 已进入 ${ownerName} 的电销工作台`,
        entityId: entity.id,
        signalId: signal.id
      })
    })
    writeList(KEYS.CALL_TASKS, tasks)
    return delay({ created })
  },
  ignore(id: number) {
    const signal = updateSignal(id, { status: 'ignored' })
    if (signal) {
      logAction({
        type: 'market_ignore',
        title: '情报暂不跟进',
        detail: `${signal.title} 已标记为暂不跟进`,
        entityId: signal.entityId,
        signalId: signal.id
      })
    }
    return delay(signal)
  }
}

export const callDeskApi = {
  list(params: { status?: string; ownerName?: string; keyword?: string; page?: number; pageSize?: number } = {}) {
    ensureSamples()
    let list = readList<CallTask>(KEYS.CALL_TASKS)
    if (params.status) list = list.filter(t => t.status === params.status)
    if (params.ownerName) list = list.filter(t => t.ownerName.includes(params.ownerName!))
    const k = (params.keyword || '').trim()
    if (k) list = list.filter(t => t.companyName.includes(k) || t.contactName.includes(k) || t.phone.includes(k))
    list = list.sort((a, b) => (a.status === 'waiting' ? -1 : 1) - (b.status === 'waiting' ? -1 : 1) || b.scheduledAt.localeCompare(a.scheduledAt))
    return delay(paginate(list, params.page, params.pageSize || 10))
  },
  summary() {
    ensureSamples()
    const list = readList<CallTask>(KEYS.CALL_TASKS)
    return delay({
      waiting: list.filter(t => t.status === 'waiting').length,
      done: list.filter(t => t.status === 'done').length,
      intent: list.filter(t => t.intent === 'A' || t.intent === 'B').length,
      invalid: list.filter(t => t.status === 'invalid').length
    })
  },
  finish(payload: { id: number; intent: IntentLevel; summary?: string; nextAction?: string }) {
    ensureSamples()
    const tasks = readList<CallTask>(KEYS.CALL_TASKS)
    const idx = tasks.findIndex(t => t.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('通话任务不存在'))
    const task = tasks[idx]
    const isValid = payload.intent !== 'invalid' && payload.intent !== 'D'
    tasks[idx] = {
      ...task,
      status: payload.intent === 'invalid' ? 'invalid' : 'done',
      intent: payload.intent,
      aiSummary: payload.summary || defaultCallSummary(payload.intent, task.companyName),
      nextAction: payload.nextAction || defaultNextAction(payload.intent),
      callCount: task.callCount + 1
    }
    writeList(KEYS.CALL_TASKS, tasks)
    const signal = updateSignal(task.signalId, { status: isValid && (payload.intent === 'A' || payload.intent === 'B') ? 'opportunity' : 'assigned' })
    const entity = getEntity(task.entityId)
    const customer = entity ? ensureCustomer(entity, '电销工作台', 'telemarketing') : null
    if (customer && (payload.intent === 'A' || payload.intent === 'B')) {
      customer.followStage = 'opportunity'
      customer.dealStatus = 'opportunity'
      customer.ownerName = task.ownerName
      const customers = readList<any>(KEYS.CUSTOMERS)
      const cidx = customers.findIndex(c => c.id === customer.id)
      if (cidx >= 0) {
        customers[cidx] = customer
        writeList(KEYS.CUSTOMERS, customers)
      }
      createFollowTask(
        customer,
        `${task.companyName} - ${payload.intent}级意向复访`,
        `${tasks[idx].aiSummary}；下一步：${tasks[idx].nextAction}`,
        payload.intent === 'A' ? 'urgent' : 'high'
      )
    }
    logAction({
      type: 'call_finish',
      title: `通话完成 · ${payload.intent}级`,
      detail: `${task.companyName}：${tasks[idx].aiSummary}`,
      entityId: task.entityId,
      signalId: task.signalId
    })
    return delay({ task: tasks[idx], signal })
  }
}

function defaultCallSummary(intent: IntentLevel, companyName: string) {
  if (intent === 'A') return `${companyName} 明确需要财税服务，负责人同意今天发送报价并预约复谈。`
  if (intent === 'B') return `${companyName} 有需求但仍在比较服务商，需提供案例与价格方案。`
  if (intent === 'C') return `${companyName} 当前需求弱，建议 7 天后再次触达。`
  if (intent === 'D') return `${companyName} 暂无财税外包需求。`
  return `${companyName} 号码无效或拒接，需进入黑名单/空号复核。`
}

function defaultNextAction(intent: IntentLevel) {
  if (intent === 'A') return '发送报价并生成提单草稿'
  if (intent === 'B') return '发送行业案例，2天后复访'
  if (intent === 'C') return '7天后重新触达'
  if (intent === 'D') return '暂不跟进'
  return '标记号码异常并停止触达'
}

export const onlineLeadApi = {
  list(params: { channel?: string; status?: string; keyword?: string; page?: number; pageSize?: number } = {}) {
    ensureSamples()
    let list = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    if (params.channel) list = list.filter(l => l.channel === params.channel)
    if (params.status) list = list.filter(l => l.status === params.status)
    const k = (params.keyword || '').trim()
    if (k) list = list.filter(l => l.companyName.includes(k) || l.demand.includes(k) || l.phone.includes(k))
    list = list.sort((a, b) => b.score - a.score || b.receivedAt.localeCompare(a.receivedAt))
    return delay(paginate(list, params.page, params.pageSize || 10))
  },
  summary() {
    ensureSamples()
    const list = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    const channels = Array.from(new Set(list.map(l => l.channel))).map(channel => {
      const rows = list.filter(l => l.channel === channel)
      return {
        channel,
        leads: rows.length,
        cost: rows.reduce((s, r) => s + Number(r.cost || 0), 0),
        qualified: rows.filter(r => r.status === 'qualified' || r.status === 'queued' || r.status === 'ordered').length,
        avgScore: Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
      }
    })
    return delay({
      total: list.length,
      qualified: list.filter(l => l.status === 'qualified').length,
      queued: list.filter(l => l.status === 'queued').length,
      ordered: list.filter(l => l.status === 'ordered').length,
      channels
    })
  },
  create(payload: OnlineLeadCreatePayload) {
    ensureSamples()
    const companyName = payload.companyName.trim()
    if (!companyName) return Promise.reject(new Error('公司名称不能为空'))
    const entity = ensureEntityByCompanyName({ companyName, contactName: payload.contactName, phone: payload.phone, source: payload.channel })
    const linkage = buildLinkage(entity)
    const duplicateRisk: OnlineLead['duplicateRisk'] =
      linkage.customers.count > 0 || linkage.orders.count > 0 ? 'hit' : linkage.signals.count > 0 || linkage.onlineLeads.count > 0 ? 'possible' : 'none'
    const list = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    const lead: OnlineLead = {
      id: maxId(list) + 1,
      entityId: entity.id,
      companyName: entity.name,
      channel: payload.channel,
      landingPage: payload.landingPage || '财税服务落地页',
      contactName: payload.contactName || entity.contacts[0]?.name || '负责人',
      phone: payload.phone || entity.contacts[0]?.phone || '',
      demand: payload.demand || '财税服务咨询',
      utmCampaign: payload.utmCampaign || `${payload.channel}-manual`,
      cost: Number(payload.cost || 0),
      score: onlineLeadScore(payload, entity, duplicateRisk),
      status: 'new',
      duplicateRisk,
      receivedAt: ts()
    }
    list.unshift(lead)
    writeList(KEYS.ONLINE_LEADS, list)
    logAction({
      type: 'online_create',
      title: '网销线索入库',
      detail: `${lead.companyName} 由 ${lead.channel} 入库，已挂接 entityId=${entity.id}`,
      entityId: entity.id
    })
    return delay({ lead, entity, resolve: buildLinkage(entity) })
  },
  qualify(id: number) {
    const list = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    const idx = list.findIndex(l => l.id === id)
    if (idx < 0) return Promise.reject(new Error('网销线索不存在'))
    list[idx] = { ...list[idx], status: 'qualified', score: Math.max(list[idx].score, 80) }
    writeList(KEYS.ONLINE_LEADS, list)
    const entity = getEntity(list[idx].entityId)
    if (entity) ensureCustomer(entity, list[idx].channel, 'online')
    logAction({
      type: 'online_qualify',
      title: '网销线索完成清洗',
      detail: `${list[idx].companyName} 已标记为有效线索`,
      entityId: list[idx].entityId
    })
    return delay(list[idx])
  },
  async addToCallQueue(id: number) {
    const list = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    const idx = list.findIndex(l => l.id === id)
    if (idx < 0) return Promise.reject(new Error('网销线索不存在'))
    let signals = readList<MarketSignal>(KEYS.SIGNALS)
    let signal = signals.find(s => s.entityId === list[idx].entityId && s.type === 'ecommerce_tax')
    if (!signal) {
      const entity = getEntity(list[idx].entityId)
      signal = {
        id: maxId(signals) + 1,
        entityId: list[idx].entityId,
        type: 'ecommerce_tax',
        title: `${list[idx].channel}线索：${list[idx].demand}`,
        scenario: '线上触达线索转入销售队列',
        eventDate: dateOnly(),
        reason: list[idx].demand,
        authority: list[idx].channel,
        region: entity ? `${entity.city}${entity.district}` : '',
        expectedService: list[idx].demand.includes('注销') ? 'cancellation' : list[idx].demand.includes('工商') ? 'qualification' : 'bookkeeping',
        estimatedAmount: list[idx].score >= 88 ? 26800 : 12800,
        score: list[idx].score,
        level: list[idx].score >= 85 ? 'A' : 'B',
        contactCount: entity?.contactCount || 1,
        status: 'new',
        ownerName: '',
        tags: [list[idx].channel, '网销线索'],
        createdAt: ts(),
        lastActionAt: ts()
      }
      signals.unshift(signal)
      writeList(KEYS.SIGNALS, signals)
    }
    list[idx] = { ...list[idx], status: 'queued' }
    writeList(KEYS.ONLINE_LEADS, list)
    return marketApi.addToCallQueue([signal.id], '李明')
  }
}

export const growthLinkageApi = {
  async createOrderFromOnlineLead(onlineLeadId: number): Promise<BizOrder> {
    ensureSamples()
    const online = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    const idx = online.findIndex(l => l.id === onlineLeadId)
    if (idx < 0) throw new Error('网销线索不存在')
    const lead = online[idx]
    let signals = readList<MarketSignal>(KEYS.SIGNALS)
    let signal = signals.find(s => s.entityId === lead.entityId && s.reason.includes(lead.demand))
    if (!signal) {
      const entity = getEntity(lead.entityId)
      signal = {
        id: maxId(signals) + 1,
        entityId: lead.entityId,
        type: lead.demand.includes('新公司') || lead.demand.includes('注册') ? 'new_company' : 'ecommerce_tax',
        title: `${lead.channel}成交线索：${lead.demand}`,
        scenario: `${lead.landingPage} 转化，UTM=${lead.utmCampaign}`,
        eventDate: dateOnly(),
        reason: lead.demand,
        authority: lead.channel,
        region: entity ? `${entity.city}${entity.district}` : '',
        expectedService: lead.demand.includes('注销')
          ? 'cancellation'
          : lead.demand.includes('工商') || lead.demand.includes('地址')
            ? 'qualification'
            : lead.demand.includes('退税') || lead.demand.includes('税务')
              ? 'tax_planning'
              : 'bookkeeping',
        estimatedAmount: lead.score >= 88 ? 26800 : 12800,
        score: lead.score,
        level: lead.score >= 85 ? 'A' : 'B',
        contactCount: entity?.contactCount || 1,
        status: 'queued',
        ownerName: '李明',
        tags: [lead.channel, '网销成交'],
        createdAt: ts(),
        lastActionAt: ts()
      }
      signals.unshift(signal)
      writeList(KEYS.SIGNALS, signals)
    }
    online[idx] = { ...lead, status: 'ordered' }
    writeList(KEYS.ONLINE_LEADS, online)
    return this.createOrderFromSignal(signal.id)
  },
  async createOrderFromSignal(signalId: number): Promise<BizOrder> {
    ensureSamples()
    const signals = readList<MarketSignal>(KEYS.SIGNALS)
    const signal = signals.find(s => s.id === signalId)
    const entity = signal ? getEntity(signal.entityId) : undefined
    if (!signal || !entity) throw new Error('拓客情报不存在')
    const customer = ensureCustomer(entity, signalLabelMap[signal.type], 'telemarketing')
    const amount = signal.estimatedAmount || 9800
    const order = await orderApi.create({
      customerId: customer.id,
      customerName: entity.name,
      submitterId: 1003,
      submitterName: signal.ownerName || '张小兰',
      paymentMethod: amount > 16000 ? 'installment' : 'lump_sum',
      paymentTimeReq: '签约后3日内完成首款',
      commissionRate: 6,
      confirmMethod: 'phone',
      expectedSignDate: dateOnly(2),
      specialAgreement: `来源：${signalLabelMap[signal.type]}；原因：${signal.reason}`,
      remark: `增长链路自动生成：signalId=${signal.id}; entityId=${entity.id}`,
      items: [{
        id: 0,
        itemNo: '',
        orderId: 0,
        serviceType: signal.expectedService,
        servicePeriod: servicePeriod(signal.expectedService) as any,
        startDate: dateOnly(),
        endDate: signal.expectedService === 'bookkeeping' ? dateOnly(365) : dateOnly(30),
        description: `${serviceText(signal.expectedService)} - ${signal.title}`,
        specialRequirement: signal.scenario,
        amount,
        discountRate: 100,
        finalAmount: amount,
        itemStatus: 'pending'
      }]
    })
    const submitted = await orderApi.submit(order.id)
    updateSignal(signalId, { status: 'ordered' })
    const online = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    const onlineIdx = online.findIndex(l => l.entityId === entity.id)
    if (onlineIdx >= 0) {
      online[onlineIdx] = { ...online[onlineIdx], status: 'ordered' }
      writeList(KEYS.ONLINE_LEADS, online)
    }
    logAction({
      type: 'growth_order',
      title: '增长链路生成提单',
      detail: `${entity.name} 已生成提单 ${submitted.orderNo}，进入订单审批/财务核对链路`,
      entityId: entity.id,
      signalId,
      orderId: submitted.id
    })
    return submitted
  },
  snapshot(): Promise<GrowthSnapshot> {
    ensureSamples()
    const entities = readList<EnterpriseEntity>(KEYS.ENTITIES)
    const signals = readList<MarketSignal>(KEYS.SIGNALS)
    const callTasks = readList<CallTask>(KEYS.CALL_TASKS)
    const online = readList<OnlineLead>(KEYS.ONLINE_LEADS)
    const orders = readList<any>(KEYS.ORDERS)
    const receipts = readList<any>(KEYS.RECEIPTS)
    const tasks = readList<any>(KEYS.TASKS)
    const actionLogs = readList<GrowthActionLog>(KEYS.ACTION_LOG).slice(0, 8)
    const orderAmount = orders.reduce((s, o) => s + Number(o.finalAmount || 0), 0)
    const receiptAmount = receipts
      .filter(r => r.status === 'confirmed')
      .reduce((s, r) => s + Number(r.amount || r.receiptAmount || 0), 0)
    const sourceNames = Array.from(new Set([
      ...online.map(l => l.channel),
      ...signals.map(s => signalLabelMap[s.type])
    ]))
    const sourceRoi = sourceNames.map(source => {
      const onlineRows = online.filter(l => l.channel === source)
      const signalRows = signals.filter(s => signalLabelMap[s.type] === source)
      const entityIds = new Set([...onlineRows.map(l => l.entityId), ...signalRows.map(s => s.entityId)])
      const relatedOrders = orders.filter(o => {
        const customer = readList<any>(KEYS.CUSTOMERS).find(c => c.id === o.customerId)
        return customer && entityIds.has(customer.entityId)
      })
      const cost = sourceCost(source) || (signalRows.length ? signalRows.length * 18 : 0)
      const amount = relatedOrders.reduce((s, o) => s + Number(o.finalAmount || 0), 0)
      return {
        source,
        leads: onlineRows.length + signalRows.length,
        cost,
        orders: relatedOrders.length,
        amount,
        roi: cost ? Number((amount / cost).toFixed(2)) : amount > 0 ? 99 : 0
      }
    }).sort((a, b) => b.amount - a.amount)
    const funnel = [
      { stage: '市场情报', count: signals.length },
      { stage: '入池/入队', count: signals.filter(s => ['pooled', 'queued', 'assigned', 'opportunity', 'ordered'].includes(s.status)).length },
      { stage: '有效通话', count: callTasks.filter(t => t.status === 'done').length },
      { stage: '意向客户', count: callTasks.filter(t => t.intent === 'A' || t.intent === 'B').length },
      { stage: '提单审批', count: signals.filter(s => s.status === 'ordered').length },
      { stage: '服务交付', count: tasks.filter(t => String(t.remark || '').includes('来源:合同生效') || String(t.remark || '').startsWith('M|')).length }
    ].map((row, idx, arr) => ({
      ...row,
      rate: idx === 0 ? 100 : arr[0].count ? Math.round(row.count / arr[0].count * 100) : 0
    }))
    const signalTypes = (Object.keys(signalLabelMap) as SignalType[]).map(type => {
      const rows = signals.filter(s => s.type === type)
      return {
        type,
        label: signalLabelMap[type],
        count: rows.length,
        amount: rows.reduce((s, r) => s + r.estimatedAmount, 0)
      }
    }).filter(r => r.count > 0)
    return delay({
      entityCount: entities.length,
      signalCount: signals.length,
      highValueSignalCount: signals.filter(s => s.level === 'A').length,
      pooledCount: signals.filter(s => s.status === 'pooled').length,
      callQueueCount: callTasks.filter(t => t.status === 'waiting').length,
      intentCount: callTasks.filter(t => t.intent === 'A' || t.intent === 'B').length,
      onlineLeadCount: online.length,
      orderCount: orders.length,
      orderAmount,
      receiptAmount,
      taskCount: tasks.length,
      overdueTaskCount: tasks.filter(t => t.status === 'overdue').length,
      funnel,
      sourceRoi,
      signalTypes,
      actionLogs
    })
  }
}
