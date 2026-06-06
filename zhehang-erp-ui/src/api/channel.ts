// ===== 渠道管理 API（localStorage Mock 模式） =====

import { syncPrivateAddressInventoryFromStockIn } from './private-domain'

export interface BizSupplier {
  id: number
  supplierNo: string
  supplierName: string
  shortName?: string
  supplierType: 'address' | 'platform' | 'service' | 'agent' | 'other'
  contactName: string
  contactPhone: string
  contactWechat?: string
  contactEmail: string
  companyAddress?: string
  regions?: string[]
  detailAddresses?: string
  yearlyPrice?: number
  halfYearPrice?: number
  quarterPrice?: number
  minYears?: number
  hasRebate?: boolean
  rebateRate?: number
  settleCycle?: 'monthly' | 'quarterly' | 'yearly'
  payMethod?: 'prepay' | 'monthly' | 'quarterly' | 'per_order'
  creditDays?: number
  contractNo?: string
  cooperateLevel: 'A' | 'B' | 'C' | 'D'
  cooperateStartDate: string
  cooperateEndDate?: string
  renewCondition?: string
  bankAccount: string
  bankName: string
  taxNo: string
  totalProcurement: number
  totalCommission: number
  rating: number
  status: 'active' | 'paused' | 'blacklist'
  remark: string
  createTime: string
}

export interface BizAddressResource {
  id: number
  resourceNo: string
  supplierId: number
  supplierName?: string
  province: string
  city: string
  district: string
  detailAddress: string
  addressType: 'commercial' | 'residential' | 'park' | 'co_working'
  area: number
  monthlyCost: number
  yearlyCost: number
  status: 'available' | 'reserved' | 'sold' | 'expired'
  reservedBy: number
  reservedByName?: string
  reservedTime: string
  soldOrderId: number
  soldOrderNo?: string
  soldTime: string
  remark: string
  createTime: string
}

export interface BizApprovalRecord {
  level: 'manager' | 'boss'
  approverId: number
  approverName: string
  approvalTime: string
  pass: boolean
  opinion: string
}

export interface BizProcurement {
  id: number
  procurementNo: string
  supplierId: number
  supplierName?: string
  procurementType: 'address' | 'service' | 'tool' | 'data'
  procurementContent: string
  quantity: number
  unitPrice: number
  totalAmount: number
  payCycle?: 'yearly' | 'half' | 'quarter'
  rebateRate?: number
  payAmount?: number
  addressLines?: string
  applicantId: number
  applicantName?: string
  applyTime: string
  approverId: number
  approverName?: string
  approvalTime: string
  approvalOpinion: string
  approvals?: BizApprovalRecord[]
  needBossApproval?: boolean
  payerId: number
  paymentTime: string
  status: 'draft' | 'pending_approval' | 'pending_boss' | 'approved' | 'paid' | 'stocked' | 'rejected'
  stockInTime: string
  stockedAddressIds?: number[]
  remark: string
  createTime: string
}

export interface BizChannelCost {
  id: number
  costNo: string
  channelType: 'baidu' | 'tencent' | 'douyin' | 'kuaishou' | 'zhihu' | 'xiaohongshu' | 'offline' | 'other'
  channelName: string
  campaignName: string
  startDate: string
  endDate: string
  budgetAmount: number
  actualCost: number
  leadCount: number
  conversionCount: number
  conversionAmount: number
  costPerLead: number
  costPerConversion: number
  roi: number
  status: 'planning' | 'running' | 'paused' | 'completed'
  remark: string
  createTime: string
}

export interface ChannelROI {
  channelType: string
  channelName: string
  totalCost: number
  totalLeads: number
  totalConversions: number
  totalRevenue: number
  costPerLead: number
  costPerConversion: number
  roi: number
}

const SP_KEY = 'biz_suppliers'
const AD_KEY = 'biz_address_resources'
const PR_KEY = 'biz_procurements'
const CC_KEY = 'biz_channel_costs'
const SEED_VERSION = '2026-06-07-supply-operational-v1'

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
  const versionKey = `${key}_seed_version`
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as T[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch { /* ignore */ }
  }
  const seed = builder()
  localStorage.setItem(key, JSON.stringify(seed))
  if (seed.length > 0) localStorage.setItem(versionKey, SEED_VERSION)
  return seed
}
function save<T>(key: string, list: T[]) { localStorage.setItem(key, JSON.stringify(list)) }
function paginate<T>(list: T[], page = 1, pageSize = 10) {
  return { list: list.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize), total: list.length }
}
function genNo(prefix: string, id: number) {
  const d = new Date()
  return `${prefix}${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(id).padStart(4, '0')}`
}

function inferCityFromAddress(detail: string, district: string) {
  if (detail.includes('义乌') || district.includes('义乌')) return '金华市'
  if (detail.includes('宁波') || district.includes('宁波')) return '宁波市'
  if (detail.includes('温州') || district.includes('温州')) return '温州市'
  return '杭州市'
}

function inferDistrictFromAddressParts(parts: string[]) {
  const first = parts[0] || ''
  const second = parts[1] || ''
  if (first.endsWith('市') && second) return second
  return first.length <= 4 ? first : '萧山区'
}

function seedSuppliers(): BizSupplier[] {
  return [
    {
      id: 1,
      supplierNo: 'SUP20260001',
      supplierName: '杭州运河企服园区管理有限公司',
      shortName: '运河企服',
      supplierType: 'address',
      contactName: '沈经理',
      contactPhone: '13857120011',
      contactWechat: 'yhqifu001',
      contactEmail: 'address@yhqifu.cn',
      companyAddress: '浙江省杭州市拱墅区祥园路 108 号智慧信息产业园',
      regions: ['杭州市拱墅区', '杭州市上城区'],
      detailAddresses: '拱墅区祥园路园区地址\n上城区湖滨商务秘书地址',
      yearlyPrice: 1800,
      halfYearPrice: 1080,
      quarterPrice: 620,
      minYears: 1,
      hasRebate: true,
      rebateRate: 6,
      settleCycle: 'quarterly',
      payMethod: 'prepay',
      creditDays: 0,
      contractNo: 'ZH-ADDR-2026-001',
      cooperateLevel: 'A',
      cooperateStartDate: dateOnly(-220),
      cooperateEndDate: dateOnly(145),
      renewCondition: '提前 30 天确认续签,低于 20 个库存需补货',
      bankAccount: '6222022600001001',
      bankName: '招商银行杭州分行',
      taxNo: '91330105MA2YH001X1',
      totalProcurement: 46800,
      totalCommission: 2800,
      rating: 4.8,
      status: 'active',
      remark: '主力挂靠地址供应商,适合同行批量拿货',
      createTime: ts(-180)
    },
    {
      id: 2,
      supplierNo: 'SUP20260002',
      supplierName: '杭州钱塘商务秘书有限公司',
      shortName: '钱塘秘书',
      supplierType: 'address',
      contactName: '周总',
      contactPhone: '13777880022',
      contactWechat: 'qtms002',
      contactEmail: 'service@qtms.cn',
      companyAddress: '浙江省杭州市钱塘区白杨街道科技园 9 幢',
      regions: ['杭州市钱塘区', '杭州市滨江区'],
      detailAddresses: '钱塘区白杨街道园区地址\n滨江区长河街道数创中心',
      yearlyPrice: 2200,
      halfYearPrice: 1280,
      quarterPrice: 760,
      minYears: 1,
      hasRebate: true,
      rebateRate: 8,
      settleCycle: 'monthly',
      payMethod: 'monthly',
      creditDays: 15,
      contractNo: 'ZH-ADDR-2026-002',
      cooperateLevel: 'A',
      cooperateStartDate: dateOnly(-168),
      cooperateEndDate: dateOnly(196),
      renewCondition: '月结对账,异常地址 2 小时内响应',
      bankAccount: '6217002600002002',
      bankName: '建设银行钱塘支行',
      taxNo: '91330114MA2QT002X2',
      totalProcurement: 52800,
      totalCommission: 4100,
      rating: 4.7,
      status: 'active',
      remark: '钱塘/滨江可售量稳定,适合网销高意向客户',
      createTime: ts(-150)
    },
    {
      id: 3,
      supplierNo: 'SUP20260003',
      supplierName: '义乌云商园企业管理有限公司',
      shortName: '义乌云商',
      supplierType: 'address',
      contactName: '何经理',
      contactPhone: '13957930033',
      contactWechat: 'ywcloud003',
      contactEmail: 'addr@ywcloud.cn',
      companyAddress: '浙江省金华市义乌市稠城街道电商产业园 3 幢',
      regions: ['义乌市稠城街道', '义乌市北苑街道'],
      detailAddresses: '稠城街道电商园区地址\n北苑街道跨境电商园',
      yearlyPrice: 1600,
      halfYearPrice: 980,
      quarterPrice: 580,
      minYears: 1,
      hasRebate: true,
      rebateRate: 5,
      settleCycle: 'quarterly',
      payMethod: 'per_order',
      creditDays: 7,
      contractNo: 'ZH-ADDR-2026-003',
      cooperateLevel: 'B',
      cooperateStartDate: dateOnly(-90),
      cooperateEndDate: dateOnly(275),
      renewCondition: '库存低于 5 个时补充,同行客户优先锁定',
      bankAccount: '6228482600003003',
      bankName: '农业银行义乌支行',
      taxNo: '91330782MA2YW003X3',
      totalProcurement: 25600,
      totalCommission: 1260,
      rating: 4.3,
      status: 'active',
      remark: '义乌地址价格优势明显,当前需关注低库存',
      createTime: ts(-82)
    },
    {
      id: 4,
      supplierNo: 'SUP20260004',
      supplierName: '浙江企服数智平台有限公司',
      shortName: '企服数智',
      supplierType: 'platform',
      contactName: '刘运营',
      contactPhone: '13606510044',
      contactWechat: 'qfsz004',
      contactEmail: 'ops@qfsz.cn',
      companyAddress: '浙江省杭州市西湖区文三路 90 号',
      regions: ['杭州市', '金华市', '宁波市'],
      detailAddresses: '工商信息核验 API\n智能外呼线索包\n企微社群运营工具',
      yearlyPrice: 36000,
      halfYearPrice: 19800,
      quarterPrice: 10800,
      minYears: 1,
      hasRebate: false,
      rebateRate: 0,
      settleCycle: 'yearly',
      payMethod: 'prepay',
      creditDays: 0,
      contractNo: 'ZH-TOOL-2026-001',
      cooperateLevel: 'B',
      cooperateStartDate: dateOnly(-120),
      cooperateEndDate: dateOnly(245),
      renewCondition: '按调用量和坐席数续费',
      bankAccount: '6212262600004004',
      bankName: '工商银行文三路支行',
      taxNo: '91330106MA2QF004X4',
      totalProcurement: 36000,
      totalCommission: 0,
      rating: 4.2,
      status: 'active',
      remark: '支撑工商信息自动补全、线索清洗和外呼触达',
      createTime: ts(-120)
    }
  ]
}

function seedAddresses(): BizAddressResource[] {
  const rows: Array<Partial<BizAddressResource> & Pick<BizAddressResource, 'id' | 'supplierId' | 'supplierName' | 'district' | 'detailAddress' | 'addressType' | 'yearlyCost' | 'status'>> = [
    { id: 1, supplierId: 1, supplierName: '杭州运河企服园区管理有限公司', district: '拱墅区', detailAddress: '祥园路智慧信息产业园 A 座 108 室', addressType: 'park', yearlyCost: 1800, status: 'available' },
    { id: 2, supplierId: 1, supplierName: '杭州运河企服园区管理有限公司', district: '拱墅区', detailAddress: '祥园路智慧信息产业园 B 座 216 室', addressType: 'park', yearlyCost: 1800, status: 'available' },
    { id: 3, supplierId: 1, supplierName: '杭州运河企服园区管理有限公司', district: '上城区', detailAddress: '湖滨商务秘书中心 12 楼 1206 室', addressType: 'commercial', yearlyCost: 2100, status: 'reserved', reservedBy: 1008, reservedByName: '陈女士', reservedTime: ts(-1) },
    { id: 4, supplierId: 1, supplierName: '杭州运河企服园区管理有限公司', district: '拱墅区', detailAddress: '祥园路智慧信息产业园 C 座 305 室', addressType: 'park', yearlyCost: 1800, status: 'sold', reservedByName: '浙江朗和装饰工程有限公司', soldOrderId: 2026060701, soldOrderNo: 'TD202606079835', soldTime: ts(-3) },
    { id: 5, supplierId: 2, supplierName: '杭州钱塘商务秘书有限公司', district: '钱塘区', detailAddress: '白杨街道科技园 9 幢 501 室', addressType: 'co_working', yearlyCost: 2200, status: 'available' },
    { id: 6, supplierId: 2, supplierName: '杭州钱塘商务秘书有限公司', district: '钱塘区', detailAddress: '白杨街道科技园 9 幢 502 室', addressType: 'co_working', yearlyCost: 2200, status: 'available' },
    { id: 7, supplierId: 2, supplierName: '杭州钱塘商务秘书有限公司', district: '滨江区', detailAddress: '长河街道数创中心 3 幢 810 室', addressType: 'commercial', yearlyCost: 2400, status: 'available' },
    { id: 8, supplierId: 2, supplierName: '杭州钱塘商务秘书有限公司', district: '滨江区', detailAddress: '长河街道数创中心 3 幢 811 室', addressType: 'commercial', yearlyCost: 2400, status: 'reserved', reservedBy: 1012, reservedByName: '王经理', reservedTime: ts() },
    { id: 9, supplierId: 2, supplierName: '杭州钱塘商务秘书有限公司', district: '钱塘区', detailAddress: '下沙跨境电商园 2 幢 608 室', addressType: 'park', yearlyCost: 2000, status: 'sold', reservedByName: '杭州启辰企业管理有限公司', soldOrderId: 2026060702, soldOrderNo: 'TD202606071542', soldTime: ts(-8) },
    { id: 10, supplierId: 3, supplierName: '义乌云商园企业管理有限公司', district: '义乌市', detailAddress: '稠城街道电商产业园 3 幢 211 室', addressType: 'park', yearlyCost: 1600, status: 'available' },
    { id: 11, supplierId: 3, supplierName: '义乌云商园企业管理有限公司', district: '义乌市', detailAddress: '北苑街道跨境电商园 5 幢 409 室', addressType: 'park', yearlyCost: 1650, status: 'available' },
    { id: 12, supplierId: 3, supplierName: '义乌云商园企业管理有限公司', district: '义乌市', detailAddress: '稠城街道电商产业园 3 幢 212 室', addressType: 'park', yearlyCost: 1600, status: 'sold', reservedByName: '义乌市诚达财税服务部', soldOrderId: 2026060703, soldOrderNo: 'TD202606071554', soldTime: ts(-2) },
    { id: 13, supplierId: 1, supplierName: '杭州运河企服园区管理有限公司', district: '拱墅区', detailAddress: '祥园路智慧信息产业园 D 座 901 室', addressType: 'park', yearlyCost: 1700, status: 'expired', soldOrderId: 2025121201, soldOrderNo: 'TD202512120018', soldTime: ts(-178) },
    { id: 14, supplierId: 2, supplierName: '杭州钱塘商务秘书有限公司', district: '滨江区', detailAddress: '长河街道数创中心 5 幢 1201 室', addressType: 'commercial', yearlyCost: 2600, status: 'available' }
  ]
  return rows.map(item => ({
    province: '浙江省',
    city: item.district === '义乌市' ? '金华市' : '杭州市',
    area: item.addressType === 'commercial' ? 45 : 30,
    monthlyCost: Math.round((item.yearlyCost || 0) / 12),
    reservedBy: 0,
    reservedByName: '',
    reservedTime: '',
    soldOrderId: 0,
    soldOrderNo: '',
    soldTime: '',
    remark: item.status === 'expired' ? '到期待续签或重新上架' : '首批业务样例资源',
    createTime: ts(-30 + item.id),
    ...item,
    resourceNo: `ADR${String(item.id).padStart(5, '0')}`
  } as BizAddressResource))
}

function seedProcurements(): BizProcurement[] {
  return [
    {
      id: 1,
      procurementNo: 'PO2026060001',
      supplierId: 1,
      supplierName: '杭州运河企服园区管理有限公司',
      procurementType: 'address',
      procurementContent: '年付 · 拱墅园区地址补货 4 个',
      quantity: 4,
      unitPrice: 1800,
      totalAmount: 7200,
      payCycle: 'yearly',
      rebateRate: 6,
      payAmount: 6768,
      addressLines: '拱墅区 祥园路智慧信息产业园 A 座 108 室\n拱墅区 祥园路智慧信息产业园 B 座 216 室\n拱墅区 祥园路智慧信息产业园 C 座 305 室\n拱墅区 祥园路智慧信息产业园 D 座 901 室',
      applicantId: 1006,
      applicantName: '渠道经理',
      applyTime: ts(-18),
      approverId: 9001,
      approverName: '老板',
      approvalTime: ts(-17),
      approvalOpinion: '低库存补货,同意上架',
      approvals: [
        { level: 'manager', approverId: 1002, approverName: '渠道主管', approvalTime: ts(-17), pass: true, opinion: '供应商价格稳定,同意' },
        { level: 'boss', approverId: 9001, approverName: '老板', approvalTime: ts(-17), pass: true, opinion: '金额超 3000,同意补货' }
      ],
      needBossApproval: true,
      payerId: 1003,
      paymentTime: ts(-16),
      status: 'stocked',
      stockInTime: ts(-15),
      stockedAddressIds: [1, 2, 4, 13],
      remark: '补足拱墅主力地址,支持私域和同行渠道销售',
      createTime: ts(-18)
    },
    {
      id: 2,
      procurementNo: 'PO2026060002',
      supplierId: 2,
      supplierName: '杭州钱塘商务秘书有限公司',
      procurementType: 'address',
      procurementContent: '年付 · 钱塘/滨江地址补货 5 个',
      quantity: 5,
      unitPrice: 2200,
      totalAmount: 11000,
      payCycle: 'yearly',
      rebateRate: 8,
      payAmount: 10120,
      addressLines: '钱塘区 白杨街道科技园 9 幢 501 室\n钱塘区 白杨街道科技园 9 幢 502 室\n滨江区 长河街道数创中心 3 幢 810 室\n滨江区 长河街道数创中心 3 幢 811 室\n钱塘区 下沙跨境电商园 2 幢 608 室',
      applicantId: 1006,
      applicantName: '渠道经理',
      applyTime: ts(-9),
      approverId: 1002,
      approverName: '渠道主管',
      approvalTime: ts(-8),
      approvalOpinion: '通过,等待财务付款',
      approvals: [
        { level: 'manager', approverId: 1002, approverName: '渠道主管', approvalTime: ts(-8), pass: true, opinion: '网销成交需求较多,建议补货' }
      ],
      needBossApproval: true,
      payerId: 0,
      paymentTime: '',
      status: 'pending_boss',
      stockInTime: '',
      stockedAddressIds: [],
      remark: '钱塘/滨江需求增长,需老板二级审批',
      createTime: ts(-9)
    },
    {
      id: 3,
      procurementNo: 'PO2026060003',
      supplierId: 3,
      supplierName: '义乌云商园企业管理有限公司',
      procurementType: 'address',
      procurementContent: '年付 · 义乌同行地址补货 3 个',
      quantity: 3,
      unitPrice: 1600,
      totalAmount: 4800,
      payCycle: 'yearly',
      rebateRate: 5,
      payAmount: 4560,
      addressLines: '义乌市 稠城街道电商产业园 3 幢 211 室\n义乌市 北苑街道跨境电商园 5 幢 409 室\n义乌市 稠城街道电商产业园 3 幢 212 室',
      applicantId: 1006,
      applicantName: '渠道经理',
      applyTime: ts(-1),
      approverId: 1002,
      approverName: '渠道主管',
      approvalTime: ts(),
      approvalOpinion: '已通过,待财务付款',
      approvals: [
        { level: 'manager', approverId: 1002, approverName: '渠道主管', approvalTime: ts(), pass: true, opinion: '义乌库存偏低,先补 3 个' }
      ],
      needBossApproval: true,
      payerId: 0,
      paymentTime: '',
      status: 'approved',
      stockInTime: '',
      stockedAddressIds: [],
      remark: '私域地址预警生成的补货需求',
      createTime: ts(-1)
    },
    {
      id: 4,
      procurementNo: 'PO2026060004',
      supplierId: 4,
      supplierName: '浙江企服数智平台有限公司',
      procurementType: 'tool',
      procurementContent: '季付 · 工商信息核验 API 与线索清洗',
      quantity: 1,
      unitPrice: 10800,
      totalAmount: 10800,
      payCycle: 'quarter',
      rebateRate: 0,
      payAmount: 10800,
      addressLines: '',
      applicantId: 1007,
      applicantName: '网销运营',
      applyTime: ts(-5),
      approverId: 9001,
      approverName: '老板',
      approvalTime: ts(-4),
      approvalOpinion: '通过,需跟踪调用量和转化',
      approvals: [
        { level: 'manager', approverId: 1002, approverName: '运营主管', approvalTime: ts(-4), pass: true, opinion: '用于公司名称自动补工商信息' },
        { level: 'boss', approverId: 9001, approverName: '老板', approvalTime: ts(-4), pass: true, opinion: '同意,月度复盘 ROI' }
      ],
      needBossApproval: true,
      payerId: 1003,
      paymentTime: ts(-3),
      status: 'paid',
      stockInTime: '',
      stockedAddressIds: [],
      remark: '支撑探迹/销帮帮类工商信息能力',
      createTime: ts(-5)
    }
  ]
}

function seedChannelCosts(): BizChannelCost[] {
  const rows = [
    { id: 1, channelType: 'douyin', channelName: '抖音信息流', campaignName: '6月代理记账线索', startDate: dateOnly(-18), endDate: dateOnly(12), budgetAmount: 30000, actualCost: 18600, leadCount: 214, conversionCount: 18, conversionAmount: 96800, status: 'running', remark: '短视频素材 3 套,重点投杭州小微企业' },
    { id: 2, channelType: 'baidu', channelName: '百度搜索', campaignName: '工商注册关键词', startDate: dateOnly(-20), endDate: dateOnly(10), budgetAmount: 26000, actualCost: 17200, leadCount: 126, conversionCount: 14, conversionAmount: 74200, status: 'running', remark: '工商注册、公司变更、代理记账词包' },
    { id: 3, channelType: 'tencent', channelName: '腾讯广告', campaignName: '企微私域加粉', startDate: dateOnly(-16), endDate: dateOnly(14), budgetAmount: 18000, actualCost: 9600, leadCount: 168, conversionCount: 9, conversionAmount: 41800, status: 'running', remark: '企微承接,需跟踪首响和二次触达' },
    { id: 4, channelType: 'xiaohongshu', channelName: '小红书种草', campaignName: '异常解除内容投放', startDate: dateOnly(-30), endDate: dateOnly(), budgetAmount: 9000, actualCost: 6200, leadCount: 52, conversionCount: 4, conversionAmount: 14800, status: 'completed', remark: '适合税务异常、地址异常咨询' },
    { id: 5, channelType: 'offline', channelName: '同行渠道转介绍', campaignName: '地址挂靠同行批发', startDate: dateOnly(-12), endDate: dateOnly(18), budgetAmount: 6000, actualCost: 3200, leadCount: 31, conversionCount: 11, conversionAmount: 68600, status: 'running', remark: '挂靠地址批量成交,需管控账期' },
    { id: 6, channelType: 'kuaishou', channelName: '快手信息流', campaignName: '低价注册测试', startDate: dateOnly(-70), endDate: dateOnly(-40), budgetAmount: 12000, actualCost: 8800, leadCount: 96, conversionCount: 3, conversionAmount: 7600, status: 'completed', remark: '连续低 ROI,建议暂停或重做落地页' },
    { id: 7, channelType: 'kuaishou', channelName: '快手信息流', campaignName: '5月代账获客复盘', startDate: dateOnly(-38), endDate: dateOnly(-8), budgetAmount: 10000, actualCost: 7200, leadCount: 82, conversionCount: 2, conversionAmount: 5600, status: 'completed', remark: '连续两月亏损,系统应提示停投' },
    { id: 8, channelType: 'zhihu', channelName: '知乎问答', campaignName: '老板财税风险问答', startDate: dateOnly(-24), endDate: dateOnly(6), budgetAmount: 6000, actualCost: 2800, leadCount: 24, conversionCount: 3, conversionAmount: 12600, status: 'running', remark: '长尾内容带来高客单咨询' }
  ] as Array<Omit<BizChannelCost, 'costNo' | 'costPerLead' | 'costPerConversion' | 'roi' | 'createTime'>>
  return rows.map(row => ({
    ...row,
    costNo: `CC2026${String(row.id).padStart(4, '0')}`,
    costPerLead: row.leadCount ? +(row.actualCost / row.leadCount).toFixed(2) : 0,
    costPerConversion: row.conversionCount ? +(row.actualCost / row.conversionCount).toFixed(2) : 0,
    roi: row.actualCost ? +((row.conversionAmount - row.actualCost) / row.actualCost * 100).toFixed(2) : 0,
    createTime: ts(-20 + row.id)
  }))
}

export const supplierApi = {
  list(params: { page?: number; pageSize?: number; supplierType?: string; status?: string; supplierName?: string; cooperateLevel?: string } = {}) {
    let list = load<BizSupplier>(SP_KEY, seedSuppliers)
    if (params.supplierType) list = list.filter(s => s.supplierType === params.supplierType)
    if (params.status) list = list.filter(s => s.status === params.status)
    if (params.cooperateLevel) list = list.filter(s => s.cooperateLevel === params.cooperateLevel)
    if (params.supplierName) list = list.filter(s => s.supplierName.includes(params.supplierName!))
    return delay(paginate(list, params.page, params.pageSize))
  },
  detail(id: number) {
    const list = load<BizSupplier>(SP_KEY, seedSuppliers)
    return delay(list.find(s => s.id === id) || null)
  },
  create(data: Partial<BizSupplier>): Promise<BizSupplier> {
    const list = load<BizSupplier>(SP_KEY, seedSuppliers)
    const id = (list.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1
    const next: BizSupplier = {
      id,
      supplierNo: data.supplierNo || `SUP${String(id).padStart(6, '0')}`,
      supplierName: data.supplierName || `供应商${id}`,
      supplierType: data.supplierType || 'service',
      contactName: data.contactName || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      cooperateLevel: data.cooperateLevel || 'C',
      cooperateStartDate: data.cooperateStartDate || dateOnly(),
      bankAccount: data.bankAccount || '',
      bankName: data.bankName || '',
      taxNo: data.taxNo || '',
      totalProcurement: 0, totalCommission: 0,
      rating: data.rating || 4,
      status: data.status || 'active',
      remark: data.remark || '',
      createTime: ts()
    }
    list.push(next)
    save(SP_KEY, list)
    return delay(next)
  },
  update(data: Partial<BizSupplier> & { id: number }) {
    const list = load<BizSupplier>(SP_KEY, seedSuppliers)
    const idx = list.findIndex(s => s.id === data.id)
    if (idx < 0) return Promise.reject(new Error('供应商不存在'))
    list[idx] = { ...list[idx], ...data } as BizSupplier
    save(SP_KEY, list)
    return delay(list[idx])
  },
  delete(id: number) {
    const list = load<BizSupplier>(SP_KEY, seedSuppliers)
    const idx = list.findIndex(s => s.id === id)
    if (idx < 0) return Promise.reject(new Error('供应商不存在'))
    list.splice(idx, 1)
    save(SP_KEY, list)
    return delay({ success: true })
  }
}

export const addressApi = {
  list(params: { page?: number; pageSize?: number; status?: string; city?: string; district?: string; supplierId?: number } = {}) {
    let list = load<BizAddressResource>(AD_KEY, seedAddresses)
    if (params.status) list = list.filter(a => a.status === params.status)
    if (params.city) list = list.filter(a => a.city.includes(params.city!))
    if (params.district) list = list.filter(a => a.district.includes(params.district!))
    if (params.supplierId) list = list.filter(a => a.supplierId === params.supplierId)
    return delay(paginate(list, params.page, params.pageSize))
  },
  available(params: { city?: string; district?: string; addressType?: string } = {}) {
    let list = load<BizAddressResource>(AD_KEY, seedAddresses).filter(a => a.status === 'available')
    if (params.city) list = list.filter(a => a.city.includes(params.city!))
    if (params.district) list = list.filter(a => a.district.includes(params.district!))
    if (params.addressType) list = list.filter(a => a.addressType === params.addressType)
    return delay(list)
  },
  reserve(payload: { id: number; reservedBy: number; reservedByName?: string }) {
    const list = load<BizAddressResource>(AD_KEY, seedAddresses)
    const idx = list.findIndex(a => a.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('地址资源不存在'))
    if (list[idx].status !== 'available') return Promise.reject(new Error('该地址已不可预占'))
    list[idx] = {
      ...list[idx],
      status: 'reserved',
      reservedBy: payload.reservedBy,
      reservedByName: payload.reservedByName || '',
      reservedTime: ts()
    }
    save(AD_KEY, list)
    return delay(list[idx])
  },
  sell(payload: { id: number; orderId: number; orderNo?: string }) {
    const list = load<BizAddressResource>(AD_KEY, seedAddresses)
    const idx = list.findIndex(a => a.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('地址资源不存在'))
    if (list[idx].status !== 'reserved' && list[idx].status !== 'available') {
      return Promise.reject(new Error('该地址不可销售'))
    }
    list[idx] = {
      ...list[idx],
      status: 'sold',
      soldOrderId: payload.orderId,
      soldOrderNo: payload.orderNo || '',
      soldTime: ts()
    }
    save(AD_KEY, list)
    return delay(list[idx])
  },
  release(id: number) {
    const list = load<BizAddressResource>(AD_KEY, seedAddresses)
    const idx = list.findIndex(a => a.id === id)
    if (idx < 0) return Promise.reject(new Error('地址资源不存在'))
    if (list[idx].status !== 'reserved') return Promise.reject(new Error('仅预占状态可释放'))
    list[idx] = {
      ...list[idx],
      status: 'available',
      reservedBy: 0, reservedByName: '', reservedTime: ''
    }
    save(AD_KEY, list)
    return delay(list[idx])
  }
}

export const procurementApi = {
  list(params: { page?: number; pageSize?: number; status?: string; supplierId?: number; procurementType?: string } = {}) {
    let list = load<BizProcurement>(PR_KEY, seedProcurements)
    if (params.status) list = list.filter(p => p.status === params.status)
    if (params.supplierId) list = list.filter(p => p.supplierId === params.supplierId)
    if (params.procurementType) list = list.filter(p => p.procurementType === params.procurementType)
    return delay(paginate(list, params.page, params.pageSize))
  },
  detail(id: number) {
    const list = load<BizProcurement>(PR_KEY, seedProcurements)
    return delay(list.find(p => p.id === id) || null)
  },
  create(data: Partial<BizProcurement>): Promise<BizProcurement> {
    const list = load<BizProcurement>(PR_KEY, seedProcurements)
    const id = (list.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1
    const quantity = data.quantity || 1
    const unitPrice = data.unitPrice || 0
    const totalAmount = data.totalAmount || quantity * unitPrice
    const next: BizProcurement = {
      id,
      procurementNo: data.procurementNo || genNo('PO', id),
      supplierId: data.supplierId || 0,
      supplierName: data.supplierName || '',
      procurementType: data.procurementType || 'service',
      procurementContent: data.procurementContent || '',
      quantity, unitPrice, totalAmount,
      payCycle: data.payCycle,
      rebateRate: data.rebateRate || 0,
      payAmount: data.payAmount ?? totalAmount,
      addressLines: data.addressLines || '',
      applicantId: data.applicantId || 1001,
      applicantName: data.applicantName || '当前用户',
      applyTime: ts(),
      approverId: 0, approverName: '', approvalTime: '', approvalOpinion: '',
      approvals: [],
      needBossApproval: totalAmount > 3000,
      payerId: 0, paymentTime: '',
      status: 'pending_approval',
      stockInTime: '', remark: data.remark || '',
      createTime: ts()
    }
    list.push(next)
    save(PR_KEY, list)
    return delay(next)
  },
  approve(payload: { id: number; pass: boolean; opinion?: string; level?: 'manager' | 'boss'; approverId?: number; approverName?: string }) {
    const list = load<BizProcurement>(PR_KEY, seedProcurements)
    const idx = list.findIndex(p => p.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('资源补充单不存在'))
    const current = list[idx]
    const level = payload.level || (current.status === 'pending_boss' ? 'boss' : 'manager')
    if (level === 'manager' && current.status !== 'pending_approval') {
      return Promise.reject(new Error('当前状态不可主管审批'))
    }
    if (level === 'boss' && current.status !== 'pending_boss') {
      return Promise.reject(new Error('当前状态不可老板审批'))
    }
    const approvals = (current.approvals || []).slice()
    approvals.push({
      level,
      approverId: payload.approverId || (level === 'boss' ? 9001 : 1002),
      approverName: payload.approverName || (level === 'boss' ? '老板' : '主管'),
      approvalTime: ts(),
      pass: payload.pass,
      opinion: payload.opinion || (payload.pass ? '审批通过' : '审批驳回')
    })
    let nextStatus: BizProcurement['status']
    if (!payload.pass) {
      nextStatus = 'rejected'
    } else if (level === 'manager' && (current.needBossApproval || current.totalAmount > 3000)) {
      nextStatus = 'pending_boss'
    } else {
      nextStatus = 'approved'
    }
    list[idx] = {
      ...current,
      status: nextStatus,
      approvals,
      approverId: payload.approverId || (level === 'boss' ? 9001 : 1002),
      approverName: payload.approverName || (level === 'boss' ? '老板' : '主管'),
      approvalTime: ts(),
      approvalOpinion: payload.opinion || (payload.pass ? '审批通过' : '审批驳回'),
      needBossApproval: current.needBossApproval ?? current.totalAmount > 3000
    }
    save(PR_KEY, list)
    return delay(list[idx])
  },
  pay(payload: { id: number; payerId?: number }) {
    const list = load<BizProcurement>(PR_KEY, seedProcurements)
    const idx = list.findIndex(p => p.id === payload.id)
    if (idx < 0) return Promise.reject(new Error('资源补充单不存在'))
    if (list[idx].status !== 'approved') return Promise.reject(new Error('未审批通过'))
    list[idx] = { ...list[idx], status: 'paid', payerId: payload.payerId || 1003, paymentTime: ts() }
    save(PR_KEY, list)
    return delay(list[idx])
  },
  stockIn(id: number) {
    const list = load<BizProcurement>(PR_KEY, seedProcurements)
    const idx = list.findIndex(p => p.id === id)
    if (idx < 0) return Promise.reject(new Error('资源补充单不存在'))
    if (list[idx].status !== 'paid') return Promise.reject(new Error('未付款不可上架'))
    const cur = list[idx]
    // 联动：地址类资源上架时批量新增地址资源
    const stockedIds: number[] = []
    if (cur.procurementType === 'address') {
      const addrList = load<BizAddressResource>(AD_KEY, seedAddresses)
      const baseId = (addrList.reduce((m, a) => Math.max(m, a.id), 0) || 0)
      const lines = (cur.addressLines || '')
        .split('\n').map(s => s.trim()).filter(Boolean)
      const total = Math.max(cur.quantity || 0, lines.length)
      for (let i = 0; i < total; i++) {
        const newId = baseId + i + 1
        const detail = lines[i] || `${cur.supplierName || '供应商'} 批量地址 #${i + 1}`
        // 从供应商地址尝试解析区域，否则默认杭州
        const parts = detail.split(/[\s·,，]+/).filter(Boolean)
        const district = inferDistrictFromAddressParts(parts)
        const addr: BizAddressResource = {
          id: newId,
          resourceNo: `ADR${String(newId).padStart(5, '0')}`,
          supplierId: cur.supplierId,
          supplierName: cur.supplierName || '',
          province: '浙江省',
          city: inferCityFromAddress(detail, district),
          district,
          detailAddress: detail,
          addressType: 'commercial',
          area: 30,
          monthlyCost: Math.round((cur.unitPrice || 0) / 12),
          yearlyCost: cur.unitPrice || 0,
          status: 'available',
          reservedBy: 0, reservedByName: '', reservedTime: '',
          soldOrderId: 0, soldOrderNo: '', soldTime: '',
          remark: `来自资源补充单 ${cur.procurementNo}`,
          createTime: ts()
        }
        addrList.push(addr)
        stockedIds.push(newId)
        syncPrivateAddressInventoryFromStockIn({
          city: addr.city,
          district: addr.district,
          addressType: addr.addressType,
          supplierName: addr.supplierName || cur.supplierName || '',
          quantity: 1,
          yearlyCost: addr.yearlyCost,
          remark: `资源补充单 ${cur.procurementNo} 上架同步`
        })
      }
      save(AD_KEY, addrList)
    }
    list[idx] = { ...cur, status: 'stocked', stockInTime: ts(), stockedAddressIds: stockedIds }
    save(PR_KEY, list)
    return delay(list[idx])
  },
  stockedAddresses(id: number) {
    const list = load<BizProcurement>(PR_KEY, seedProcurements)
    const cur = list.find(p => p.id === id)
    if (!cur || !cur.stockedAddressIds?.length) return delay([] as BizAddressResource[])
    const addrList = load<BizAddressResource>(AD_KEY, seedAddresses)
    return delay(addrList.filter(a => cur.stockedAddressIds!.includes(a.id)))
  }
}

export const channelCostApi = {
  list(params: { page?: number; pageSize?: number; channelType?: string; status?: string } = {}) {
    let list = load<BizChannelCost>(CC_KEY, seedChannelCosts)
    if (params.channelType) list = list.filter(c => c.channelType === params.channelType)
    if (params.status) list = list.filter(c => c.status === params.status)
    return delay(paginate(list, params.page, params.pageSize))
  },
  create(data: Partial<BizChannelCost>): Promise<BizChannelCost> {
    const list = load<BizChannelCost>(CC_KEY, seedChannelCosts)
    const id = (list.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
    const actual = data.actualCost || 0
    const leads = data.leadCount || 0
    const conv = data.conversionCount || 0
    const revenue = data.conversionAmount || 0
    const next: BizChannelCost = {
      id,
      costNo: data.costNo || `CC${new Date().getFullYear()}${String(id).padStart(4, '0')}`,
      channelType: data.channelType || 'other',
      channelName: data.channelName || '',
      campaignName: data.campaignName || '',
      startDate: data.startDate || dateOnly(),
      endDate: data.endDate || dateOnly(30),
      budgetAmount: data.budgetAmount || 0,
      actualCost: actual,
      leadCount: leads,
      conversionCount: conv,
      conversionAmount: revenue,
      costPerLead: leads ? +(actual / leads).toFixed(2) : 0,
      costPerConversion: conv ? +(actual / conv).toFixed(2) : 0,
      roi: actual ? +((revenue - actual) / actual * 100).toFixed(2) : 0,
      status: data.status || 'planning',
      remark: data.remark || '',
      createTime: ts()
    }
    list.push(next)
    save(CC_KEY, list)
    return delay(next)
  },
  update(data: Partial<BizChannelCost> & { id: number }) {
    const list = load<BizChannelCost>(CC_KEY, seedChannelCosts)
    const idx = list.findIndex(c => c.id === data.id)
    if (idx < 0) return Promise.reject(new Error('渠道投放不存在'))
    const merged = { ...list[idx], ...data } as BizChannelCost
    merged.costPerLead = merged.leadCount ? +(merged.actualCost / merged.leadCount).toFixed(2) : 0
    merged.costPerConversion = merged.conversionCount ? +(merged.actualCost / merged.conversionCount).toFixed(2) : 0
    merged.roi = merged.actualCost ? +((merged.conversionAmount - merged.actualCost) / merged.actualCost * 100).toFixed(2) : 0
    list[idx] = merged
    save(CC_KEY, list)
    return delay(merged)
  },
  getRoi(): Promise<ChannelROI[]> {
    const list = load<BizChannelCost>(CC_KEY, seedChannelCosts)
    const groups = new Map<string, ChannelROI>()
    for (const c of list) {
      const key = c.channelType
      const acc = groups.get(key) || {
        channelType: c.channelType,
        channelName: c.channelName,
        totalCost: 0, totalLeads: 0, totalConversions: 0, totalRevenue: 0,
        costPerLead: 0, costPerConversion: 0, roi: 0
      }
      acc.totalCost += c.actualCost
      acc.totalLeads += c.leadCount
      acc.totalConversions += c.conversionCount
      acc.totalRevenue += c.conversionAmount
      groups.set(key, acc)
    }
    const result: ChannelROI[] = Array.from(groups.values()).map(g => ({
      ...g,
      costPerLead: g.totalLeads ? +(g.totalCost / g.totalLeads).toFixed(2) : 0,
      costPerConversion: g.totalConversions ? +(g.totalCost / g.totalConversions).toFixed(2) : 0,
      roi: g.totalCost ? +((g.totalRevenue - g.totalCost) / g.totalCost * 100).toFixed(2) : 0
    }))
    return delay(result)
  },
  // 检测连续 >=2 个月 ROI<0 的渠道
  detectNegativeStreaks(streak = 2): Promise<{ channelType: string; channelName: string; months: string[] }[]> {
    const list = load<BizChannelCost>(CC_KEY, seedChannelCosts)
    const byChannel = new Map<string, Map<string, { cost: number; revenue: number; name: string }>>()
    for (const c of list) {
      const ym = (c.startDate || c.createTime || '').slice(0, 7)
      if (!ym) continue
      const ch = byChannel.get(c.channelType) || new Map()
      const cur = ch.get(ym) || { cost: 0, revenue: 0, name: c.channelName }
      cur.cost += c.actualCost
      cur.revenue += c.conversionAmount
      ch.set(ym, cur)
      byChannel.set(c.channelType, ch)
    }
    const result: { channelType: string; channelName: string; months: string[] }[] = []
    byChannel.forEach((months, channelType) => {
      const sorted = Array.from(months.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      let run: string[] = []
      let bestRun: string[] = []
      let chName = ''
      for (const [ym, agg] of sorted) {
        chName = agg.name
        const roi = agg.cost ? (agg.revenue - agg.cost) / agg.cost * 100 : 0
        if (agg.cost > 0 && roi < 0) {
          run.push(ym)
          if (run.length > bestRun.length) bestRun = run.slice()
        } else {
          run = []
        }
      }
      if (bestRun.length >= streak) {
        result.push({ channelType, channelName: chName, months: bestRun })
      }
    })
    return delay(result)
  },
  // 获取单个渠道详情
  detail(id: number) {
    const list = load<BizChannelCost>(CC_KEY, seedChannelCosts)
    return delay(list.find(c => c.id === id) || null)
  }
}
