// ===== 渠道管理 API（真实后端：modules/channel 下 /supplier /address /procurement /channel-cost） =====
// 说明：
// 1. request.ts 的响应拦截器 resolve 的是 R 信封 {code,message,data}，这里统一用 unwrap() 取 data 载荷。
// 2. 分页接口返回 MyBatis-Plus IPage {records,total,...}，api 层适配成视图期望的 {list,total}。
// 3. 后端 Jackson 开启了 FAIL_ON_UNKNOWN_PROPERTIES（JacksonConfig 用 new ObjectMapper()），
//    所以所有写入请求体都按后端 Entity 字段白名单构造，不能把视图表单整包发出去。
// 4. 导出的函数名与返回形状保持与原 mock 版一致，字段在本文件内做双向映射。

import { get, post, put, del } from './request'
import { syncPrivateAddressInventoryFromStockIn } from './private-domain'

// ---------- 视图层类型（保持原 mock 形状，视图零改动） ----------

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
  status: 'active' | 'paused' | 'blacklist' | 'terminated' | 'potential'
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
  status: 'available' | 'reserved' | 'sold' | 'expired' | 'abnormal'
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
  status: 'draft' | 'pending_approval' | 'pending_boss' | 'approved' | 'paid' | 'stocked' | 'rejected' | 'cancelled'
  stockInTime: string
  stockedAddressIds?: number[]
  remark: string
  createTime: string
}

export interface BizChannelCost {
  id: number
  costNo: string
  channelType: string
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
const isDateStr = (v: any): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)
const today = () => new Date().toISOString().slice(0, 10)
const currentYm = () => new Date().toISOString().slice(0, 7)

function inferCityFromRegion (region: string) {
  if (region.includes('义乌')) return '金华市'
  if (region.includes('宁波')) return '宁波市'
  if (region.includes('温州')) return '温州市'
  return '杭州市'
}

function inferDistrictFromAddressParts (parts: string[]) {
  const first = parts[0] || ''
  const second = parts[1] || ''
  if (first.endsWith('市') && second) return second
  return first && first.length <= 4 ? first : '萧山区'
}

function parseRegions (raw?: string): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    if (Array.isArray(v)) return v.map(String)
  } catch { /* 非 JSON 时按分隔符拆 */ }
  return String(raw).split(/[\n,，、;；]+/).map(s => s.trim()).filter(Boolean)
}

function parseDetailAddresses (raw?: string): string {
  if (!raw) return ''
  try {
    const v = JSON.parse(raw)
    if (Array.isArray(v)) return v.map(String).join('\n')
  } catch { /* 原样返回 */ }
  return String(raw)
}

// ---------- 供应商缓存（地址/采购单需要 join 出 supplierName，后端列表不带名称） ----------

type RawSupplier = Record<string, any>
let supplierCache: Map<number, RawSupplier> | null = null

function fillSupplierCache (records: RawSupplier[]) {
  supplierCache = new Map(records.map(s => [Number(s.id), s]))
}

async function supplierMap (): Promise<Map<number, RawSupplier>> {
  if (supplierCache) return supplierCache
  try {
    const res = await get('/supplier/list', { pageNum: 1, pageSize: 500 }, { silentError: true })
    fillSupplierCache(toPage<RawSupplier>(unwrap(res)).list)
  } catch {
    supplierCache = supplierCache || new Map()
  }
  return supplierCache!
}

// ---------- 供应商：后端实体 BizSupplier(channel/domain) <-> 视图形状 ----------

function adaptSupplier (s: RawSupplier): BizSupplier {
  return {
    id: Number(s.id),
    supplierNo: s.supplierNo || '',
    supplierName: s.name || '',
    shortName: s.shortName || '',
    supplierType: 'address', // 后端无 supplierType 字段，渠道模块语义即地址供应商
    contactName: s.contactName || '',
    contactPhone: s.contactPhone || '',
    contactWechat: s.contactWechat || '',
    contactEmail: '', // 后端无该字段
    companyAddress: s.address || '',
    regions: parseRegions(s.supplyRegions),
    detailAddresses: parseDetailAddresses(s.detailAddresses),
    yearlyPrice: num(s.priceAnnual),
    halfYearPrice: num(s.priceSemiAnnual),
    quarterPrice: num(s.priceQuarterly),
    minYears: s.minContractYears ?? 1,
    hasRebate: Number(s.hasRebate) === 1,
    rebateRate: num(s.rebateRate),
    settleCycle: (s.rebateCycle || 'quarterly') as BizSupplier['settleCycle'],
    payMethod: (s.paymentMethod || 'prepay') as BizSupplier['payMethod'],
    creditDays: s.creditDays ?? 0,
    contractNo: s.cooperationContractNo || '',
    cooperateLevel: (s.supplierLevel || 'C') as BizSupplier['cooperateLevel'],
    cooperateStartDate: s.cooperationStart || '',
    cooperateEndDate: s.cooperationEnd || '',
    renewCondition: s.renewalTerms || '',
    bankAccount: '', // 后端无字段（见 gapsNoBackend）
    bankName: '',
    taxNo: '',
    totalProcurement: 0, // 后端无累计口径，视图回退展示 yearlyPrice
    totalCommission: 0,
    rating: 0,
    status: (s.status || 'active') as BizSupplier['status'],
    remark: s.remark || '',
    createTime: s.createTime || ''
  }
}

/** 视图表单 -> 后端实体白名单（只发后端存在的字段，避免 FAIL_ON_UNKNOWN_PROPERTIES 400） */
function toBackendSupplier (data: Partial<BizSupplier> & { id?: number }) {
  const body: Record<string, any> = {}
  if (data.id) body.id = data.id
  if (data.supplierNo !== undefined) body.supplierNo = data.supplierNo || undefined
  if (data.supplierName !== undefined) body.name = data.supplierName
  if (data.shortName !== undefined) body.shortName = data.shortName
  if (data.status !== undefined) body.status = data.status
  if (data.contactName !== undefined) body.contactName = data.contactName
  if (data.contactPhone !== undefined) body.contactPhone = data.contactPhone
  if (data.contactWechat !== undefined) body.contactWechat = data.contactWechat
  if (data.companyAddress !== undefined) body.address = data.companyAddress
  if (data.regions !== undefined) body.supplyRegions = JSON.stringify(data.regions || [])
  if (data.detailAddresses !== undefined) body.detailAddresses = data.detailAddresses
  if (data.yearlyPrice !== undefined) body.priceAnnual = data.yearlyPrice
  if (data.halfYearPrice !== undefined) body.priceSemiAnnual = data.halfYearPrice
  if (data.quarterPrice !== undefined) body.priceQuarterly = data.quarterPrice
  if (data.minYears !== undefined) body.minContractYears = data.minYears
  if (data.hasRebate !== undefined) body.hasRebate = data.hasRebate ? 1 : 0
  if (data.rebateRate !== undefined) body.rebateRate = data.rebateRate
  if (data.settleCycle !== undefined) body.rebateCycle = data.settleCycle
  if (data.payMethod !== undefined) body.paymentMethod = data.payMethod
  if (data.creditDays !== undefined) body.creditDays = data.creditDays
  if (data.contractNo !== undefined) body.cooperationContractNo = data.contractNo
  if (isDateStr(data.cooperateStartDate)) body.cooperationStart = data.cooperateStartDate.slice(0, 10)
  if (isDateStr(data.cooperateEndDate)) body.cooperationEnd = data.cooperateEndDate.slice(0, 10)
  if (data.renewCondition !== undefined) body.renewalTerms = data.renewCondition
  if (data.cooperateLevel !== undefined) body.supplierLevel = data.cooperateLevel
  if (data.remark !== undefined) body.remark = data.remark
  return body
}

export const supplierApi = {
  /** GET /supplier/list（后端仅支持 name/status 过滤；cooperateLevel 前端过滤；supplierType 后端无此维度，忽略） */
  async list (params: { page?: number; pageSize?: number; supplierType?: string; status?: string; supplierName?: string; cooperateLevel?: string } = {}): Promise<{ list: BizSupplier[]; total: number }> {
    const res = await get('/supplier/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      name: params.supplierName || undefined,
      status: params.status || undefined
    })
    const page = toPage<RawSupplier>(unwrap(res))
    fillSupplierCache(page.list)
    let list = page.list.map(adaptSupplier)
    let total = page.total
    if (params.cooperateLevel) {
      list = list.filter(s => s.cooperateLevel === params.cooperateLevel)
      total = list.length
    }
    return { list, total }
  },
  async detail (id: number): Promise<BizSupplier | null> {
    const raw = unwrap<RawSupplier | null>(await get(`/supplier/${id}`))
    return raw ? adaptSupplier(raw) : null
  },
  async create (data: Partial<BizSupplier>): Promise<BizSupplier> {
    const id = unwrap<number>(await post('/supplier', toBackendSupplier(data)))
    supplierCache = null
    const created = await this.detail(Number(id))
    return created || ({ ...adaptSupplier({}), ...data, id: Number(id) } as BizSupplier)
  },
  async update (data: Partial<BizSupplier> & { id: number }): Promise<BizSupplier> {
    await put('/supplier', toBackendSupplier(data))
    supplierCache = null
    const updated = await this.detail(data.id)
    return updated || ({ ...adaptSupplier({}), ...data } as BizSupplier)
  },
  async delete (id: number): Promise<{ success: boolean }> {
    await del(`/supplier/${id}`)
    supplierCache = null
    return { success: true }
  }
}

// ---------- 地址资源：后端实体 BizAddressResource(channel/domain) <-> 视图形状 ----------

function adaptAddress (a: RawSupplier, suppliers: Map<number, RawSupplier>): BizAddressResource {
  const region = a.region || ''
  const sup = suppliers.get(Number(a.supplierId))
  return {
    id: Number(a.id),
    resourceNo: a.resourceNo || '',
    supplierId: Number(a.supplierId || 0),
    supplierName: sup?.name || '',
    province: '浙江省',
    city: inferCityFromRegion(region),
    district: region,
    detailAddress: a.address || '',
    addressType: 'commercial', // 后端无地址类型字段
    area: 0,
    monthlyCost: Math.round(num(a.purchasePrice) / 12),
    yearlyCost: num(a.purchasePrice),
    status: (a.status || 'available') as BizAddressResource['status'],
    reservedBy: Number(a.customerId || 0),
    reservedByName: '', // 后端只存 customerId，无名称
    reservedTime: '',
    soldOrderId: Number(a.contractId || 0),
    soldOrderNo: a.contractId ? String(a.contractId) : '',
    soldTime: a.soldDate || '',
    remark: '',
    createTime: a.createTime || ''
  }
}

export const addressApi = {
  /** GET /address/list（后端支持 status/region；supplierId/city 在前端过滤） */
  async list (params: { page?: number; pageSize?: number; status?: string; city?: string; district?: string; supplierId?: number } = {}): Promise<{ list: BizAddressResource[]; total: number }> {
    const [res, suppliers] = await Promise.all([
      get('/address/list', {
        pageNum: params.page || 1,
        pageSize: params.pageSize || 10,
        status: params.status || undefined,
        region: params.district || params.city || undefined
      }),
      supplierMap()
    ])
    const page = toPage<RawSupplier>(unwrap(res))
    let list = page.list.map(a => adaptAddress(a, suppliers))
    let total = page.total
    if (params.supplierId) {
      list = list.filter(a => a.supplierId === params.supplierId)
      total = list.length
    }
    return { list, total }
  },
  /** GET /address/available（仅 region 过滤；addressType 后端无该字段，忽略） */
  async available (params: { city?: string; district?: string; addressType?: string } = {}): Promise<BizAddressResource[]> {
    const [res, suppliers] = await Promise.all([
      get('/address/available', { region: params.district || params.city || undefined }),
      supplierMap()
    ])
    const rows = unwrap<RawSupplier[]>(res) || []
    return rows.map(a => adaptAddress(a, suppliers))
  },
  /** POST /address/{id}/reserve（后端只接收 customerId/orderId；reservedByName 无处持久化） */
  async reserve (payload: { id: number; reservedBy: number; reservedByName?: string }): Promise<{ success: boolean }> {
    await post(`/address/${payload.id}/reserve`, { customerId: payload.reservedBy })
    return { success: true }
  },
  /** POST /address/{id}/sell */
  async sell (payload: { id: number; orderId: number; orderNo?: string }): Promise<{ success: boolean }> {
    await post(`/address/${payload.id}/sell`, { orderId: payload.orderId })
    return { success: true }
  },
  /** POST /address/{id}/release */
  async release (id: number): Promise<{ success: boolean }> {
    await post(`/address/${id}/release`)
    return { success: true }
  }
}

// ---------- 资源补充单：后端实体 BizProcurement(channel/domain) <-> 视图形状 ----------
// 注意：后端为单级审批（pending_approval -> approved/rejected），不存在 pending_boss 二级审批。

function adaptProcurement (p: RawSupplier, suppliers: Map<number, RawSupplier>): BizProcurement {
  const totalAmount = num(p.totalAmount)
  const actualPaid = p.actualPaid === null || p.actualPaid === undefined ? undefined : num(p.actualPaid)
  const rebateRate = totalAmount > 0 && actualPaid !== undefined && actualPaid < totalAmount
    ? +((1 - actualPaid / totalAmount) * 100).toFixed(2)
    : 0
  const sup = suppliers.get(Number(p.supplierId))
  const approvals: BizApprovalRecord[] = p.approvalTime
    ? [{
        level: 'manager',
        approverId: Number(p.approverId || 0),
        approverName: '',
        approvalTime: p.approvalTime || '',
        pass: p.status !== 'rejected',
        opinion: p.approvalOpinion || ''
      }]
    : []
  return {
    id: Number(p.id),
    procurementNo: p.procurementNo || '',
    supplierId: Number(p.supplierId || 0),
    supplierName: sup?.name || '',
    procurementType: 'address', // 后端无类型字段，渠道采购语义默认地址
    procurementContent: p.purchaseNote || '',
    quantity: Number(p.quantity || 0),
    unitPrice: num(p.unitPrice),
    totalAmount,
    payCycle: (p.paymentCycle || 'yearly') as BizProcurement['payCycle'],
    rebateRate,
    payAmount: actualPaid ?? totalAmount,
    addressLines: p.addressDetail || '',
    applicantId: Number(p.buyerId || p.createBy || 0),
    applicantName: '', // 后端只存 buyerId/createBy(用户ID)，无姓名
    applyTime: p.purchaseDate || p.createTime || '',
    approverId: Number(p.approverId || 0),
    approverName: '',
    approvalTime: p.approvalTime || '',
    approvalOpinion: p.approvalOpinion || '',
    approvals,
    needBossApproval: false, // 后端单级审批
    payerId: 0,
    paymentTime: p.paymentDate || '',
    status: (p.status || 'draft') as BizProcurement['status'],
    stockInTime: p.status === 'stocked' ? (p.updateTime || '') : '',
    stockedAddressIds: [],
    remark: '',
    createTime: p.createTime || ''
  }
}

export const procurementApi = {
  /** GET /procurement/list（后端支持 supplierId/status；procurementType 后端无此维度，忽略） */
  async list (params: { page?: number; pageSize?: number; status?: string; supplierId?: number; procurementType?: string } = {}): Promise<{ list: BizProcurement[]; total: number }> {
    const [res, suppliers] = await Promise.all([
      get('/procurement/list', {
        pageNum: params.page || 1,
        pageSize: params.pageSize || 10,
        supplierId: params.supplierId || undefined,
        status: params.status || undefined
      }),
      supplierMap()
    ])
    const page = toPage<RawSupplier>(unwrap(res))
    return { list: page.list.map(p => adaptProcurement(p, suppliers)), total: page.total }
  },
  async detail (id: number): Promise<BizProcurement | null> {
    const [raw, suppliers] = await Promise.all([get(`/procurement/${id}`), supplierMap()])
    const p = unwrap<RawSupplier | null>(raw)
    return p ? adaptProcurement(p, suppliers) : null
  },
  /** POST /procurement（白名单映射到后端实体字段） */
  async create (data: Partial<BizProcurement>): Promise<BizProcurement> {
    const body: Record<string, any> = {
      supplierId: data.supplierId,
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice || 0,
      totalAmount: data.totalAmount ?? (data.quantity || 1) * (data.unitPrice || 0),
      actualPaid: data.payAmount ?? data.totalAmount,
      paymentCycle: data.payCycle || 'yearly',
      addressDetail: data.addressLines || '',
      purchaseNote: [data.procurementContent, data.remark].filter(Boolean).join('；'),
      purchaseDate: today(),
      status: 'pending_approval'
    }
    const id = unwrap<number>(await post('/procurement', body))
    return { ...adaptProcurement({ ...body, id, purchaseNote: body.purchaseNote, status: 'pending_approval' }, await supplierMap()), supplierName: data.supplierName || '' }
  },
  /**
   * POST /procurement/approve
   * 后端为单级审批，只读取 {id,pass,approverId}；opinion/level 后端不持久化。
   */
  async approve (payload: { id: number; pass: boolean; opinion?: string; level?: 'manager' | 'boss'; approverId?: number; approverName?: string }): Promise<{ success: boolean }> {
    await post('/procurement/approve', {
      id: payload.id,
      pass: payload.pass,
      approverId: payload.approverId || undefined
    })
    return { success: true }
  },
  /** POST /procurement/{id}/pay */
  async pay (payload: { id: number; payerId?: number }): Promise<{ success: boolean }> {
    await post(`/procurement/${payload.id}/pay`)
    return { success: true }
  },
  /**
   * POST /procurement/{id}/stock-in
   * 后端 stockIn 只把单据置为 stocked，不会自动生成地址资源；
   * 这里在 api 层补齐原 mock 的联动：按 addressDetail 行明细批量 POST /address 入池，
   * 并同步私域地址库存口径（私域模块当前仍为本地实现）。
   */
  async stockIn (id: number): Promise<BizProcurement & { stockedAddressIds: number[] }> {
    const raw = unwrap<RawSupplier | null>(await get(`/procurement/${id}`))
    await post(`/procurement/${id}/stock-in`)
    const suppliers = await supplierMap()
    const sup = raw ? suppliers.get(Number(raw.supplierId)) : undefined
    const stockedIds: number[] = []
    const lines = String(raw?.addressDetail || '').split('\n').map(s => s.trim()).filter(Boolean)
    for (const line of lines) {
      const parts = line.split(/[\s·,，]+/).filter(Boolean)
      const district = inferDistrictFromAddressParts(parts)
      try {
        const newId = unwrap<number>(await post('/address', {
          supplierId: raw?.supplierId,
          procurementId: id,
          address: line,
          region: district,
          purchasePrice: num(raw?.unitPrice),
          suggestedPrice: Math.round(num(raw?.unitPrice) * 1.6),
          status: 'available',
          stockInDate: today()
        }, { silentError: true }))
        if (newId) stockedIds.push(Number(newId))
        syncPrivateAddressInventoryFromStockIn({
          city: inferCityFromRegion(district),
          district,
          addressType: 'commercial',
          supplierName: sup?.name || '',
          quantity: 1,
          yearlyCost: num(raw?.unitPrice),
          remark: `资源补充单 ${raw?.procurementNo || id} 上架同步`
        })
      } catch { /* 单条入池失败不阻断整体上架 */ }
    }
    const base = raw ? adaptProcurement({ ...raw, status: 'stocked' }, suppliers) : ({ id } as unknown as BizProcurement)
    return { ...base, status: 'stocked', stockedAddressIds: stockedIds }
  },
  /** 已生成地址资源：按 procurementId 反查地址池（后端地址实体带 procurementId 字段） */
  async stockedAddresses (id: number): Promise<BizAddressResource[]> {
    const [res, suppliers] = await Promise.all([
      get('/address/list', { pageNum: 1, pageSize: 500 }),
      supplierMap()
    ])
    const page = toPage<RawSupplier>(unwrap(res))
    return page.list.filter(a => Number(a.procurementId) === Number(id)).map(a => adaptAddress(a, suppliers))
  }
}

// ---------- 渠道投放成本：后端实体 BizChannelCost(channel/domain) <-> 视图形状 ----------
// 后端按 period(yyyy-MM) 存月度汇总：costAmount/leadCount/convertedCount/orderCount/revenue。
// 注意：后端 roi = revenue/cost*100（毛口径），前端展示口径为 (revenue-cost)/cost*100（净口径），
// 视图自己用原始数字重算，这里 roi 字段按前端净口径补齐，保持原 mock 语义。

function adaptCost (c: RawSupplier): BizChannelCost {
  const cost = num(c.costAmount)
  const revenue = num(c.revenue)
  const leads = Number(c.leadCount || 0)
  const conv = Number(c.convertedCount || 0)
  const period = c.period || (c.createTime || '').slice(0, 7)
  return {
    id: Number(c.id),
    costNo: `CC${String(c.id || '')}`,
    channelType: c.channelType || 'other',
    channelName: c.channelName || '',
    campaignName: c.remark || c.channelName || '',
    startDate: period ? `${period}-01` : '',
    endDate: period ? `${period}-28` : '',
    budgetAmount: cost, // 后端无预算字段，用实际投放占位
    actualCost: cost,
    leadCount: leads,
    conversionCount: conv,
    conversionAmount: revenue,
    costPerLead: leads ? +(cost / leads).toFixed(2) : 0,
    costPerConversion: conv ? +(cost / conv).toFixed(2) : 0,
    roi: cost ? +(((revenue - cost) / cost) * 100).toFixed(2) : 0,
    status: 'completed', // 后端无投放状态字段
    remark: c.remark || '',
    createTime: c.createTime || ''
  }
}

function toBackendCost (data: Partial<BizChannelCost> & { id?: number }) {
  const body: Record<string, any> = {
    channelName: data.channelName || '',
    channelType: data.channelType || 'other',
    period: (isDateStr(data.startDate) ? data.startDate.slice(0, 7) : '') || currentYm(),
    costAmount: data.actualCost || 0,
    leadCount: data.leadCount || 0,
    convertedCount: data.conversionCount || 0,
    orderCount: data.conversionCount || 0,
    revenue: data.conversionAmount || 0,
    remark: data.remark || data.campaignName || ''
  }
  if (data.id) body.id = data.id
  return body
}

async function fetchAllCosts (channelType?: string): Promise<BizChannelCost[]> {
  const res = await get('/channel-cost/list', { pageNum: 1, pageSize: 500, channelType: channelType || undefined })
  return toPage<RawSupplier>(unwrap(res)).list.map(adaptCost)
}

export const channelCostApi = {
  /** GET /channel-cost/list（后端支持 channelType/period；status 后端无该字段，忽略） */
  async list (params: { page?: number; pageSize?: number; channelType?: string; status?: string } = {}): Promise<{ list: BizChannelCost[]; total: number }> {
    const res = await get('/channel-cost/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 10,
      channelType: params.channelType || undefined
    })
    const page = toPage<RawSupplier>(unwrap(res))
    return { list: page.list.map(adaptCost), total: page.total }
  },
  /** POST /channel-cost（saveChannelCost 同时承担新增/更新，roi 由后端按 revenue/cost 重算） */
  async create (data: Partial<BizChannelCost>): Promise<BizChannelCost> {
    const id = unwrap<number>(await post('/channel-cost', toBackendCost(data)))
    return adaptCost({ ...toBackendCost(data), id })
  },
  async update (data: Partial<BizChannelCost> & { id: number }): Promise<BizChannelCost> {
    await post('/channel-cost', toBackendCost(data))
    return adaptCost(toBackendCost(data))
  },
  /** 渠道 ROI 汇总：基于列表数据按渠道聚合（保持原 mock 的净 ROI 口径与返回形状） */
  async getRoi (): Promise<ChannelROI[]> {
    const list = await fetchAllCosts()
    const groups = new Map<string, ChannelROI>()
    for (const c of list) {
      const acc = groups.get(c.channelType) || {
        channelType: c.channelType,
        channelName: c.channelName,
        totalCost: 0, totalLeads: 0, totalConversions: 0, totalRevenue: 0,
        costPerLead: 0, costPerConversion: 0, roi: 0
      }
      acc.totalCost += c.actualCost
      acc.totalLeads += c.leadCount
      acc.totalConversions += c.conversionCount
      acc.totalRevenue += c.conversionAmount
      groups.set(c.channelType, acc)
    }
    return Array.from(groups.values()).map(g => ({
      ...g,
      costPerLead: g.totalLeads ? +(g.totalCost / g.totalLeads).toFixed(2) : 0,
      costPerConversion: g.totalConversions ? +(g.totalCost / g.totalConversions).toFixed(2) : 0,
      roi: g.totalCost ? +((g.totalRevenue - g.totalCost) / g.totalCost * 100).toFixed(2) : 0
    }))
  },
  /** 检测连续 >= streak 个月净 ROI < 0 的渠道（后端无此接口，按 period 月度数据在前端聚合） */
  async detectNegativeStreaks (streak = 2): Promise<{ channelType: string; channelName: string; months: string[] }[]> {
    const list = await fetchAllCosts()
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
    return result
  },
  /** 单条详情：后端无 /channel-cost/{id}，从列表中取 */
  async detail (id: number): Promise<BizChannelCost | null> {
    const list = await fetchAllCosts()
    return list.find(c => c.id === id) || null
  }
}

// ---------- 同行渠道：后端实体 BizChannelPartner(channel/domain) <-> 视图形状 ----------
// 后端 /channel-partner/*（BizChannelPartnerController），regions 后端存 JSON 字符串、前端用 string[]。
// 写请求按白名单 toBackendPartner 构造（后端 FAIL_ON_UNKNOWN_PROPERTIES，整包发送会 400）。

export interface ChannelPartner {
  id: number
  code: string
  name: string
  type: 'peer' | 'park' | 'agency' | 'business'
  contactName: string
  contactPhone: string
  ownerName: string
  regions: string[]
  basePrice: number
  settleMode: string
  creditLimit: number
  receivable: number
  monthOrders: number
  monthRevenue: number
  level: 'A' | 'B' | 'C'
  status: 'active' | 'watch' | 'paused'
  remark: string
}

function adaptPartner (p: RawSupplier): ChannelPartner {
  return {
    id: Number(p.id),
    code: p.partnerNo || '',
    name: p.name || '',
    type: (p.partnerType || 'peer') as ChannelPartner['type'],
    contactName: p.contactName || '',
    contactPhone: p.contactPhone || '',
    ownerName: p.ownerName || '',
    regions: parseRegions(p.regions),
    basePrice: num(p.basePrice),
    settleMode: p.settleMode || '单笔结清',
    creditLimit: num(p.creditLimit),
    receivable: num(p.receivable),
    monthOrders: Number(p.monthOrders || 0),
    monthRevenue: num(p.monthRevenue),
    level: (p.partnerLevel || 'B') as ChannelPartner['level'],
    status: (p.status || 'active') as ChannelPartner['status'],
    remark: p.remark || ''
  }
}

/** 视图表单 -> 后端实体白名单（只发后端存在字段，避免 FAIL_ON_UNKNOWN_PROPERTIES 400） */
function toBackendPartner (data: Partial<ChannelPartner> & { id?: number }) {
  const body: Record<string, any> = {}
  if (data.id) body.id = data.id
  if (data.code !== undefined) body.partnerNo = data.code || undefined
  if (data.name !== undefined) body.name = data.name
  if (data.type !== undefined) body.partnerType = data.type
  if (data.contactName !== undefined) body.contactName = data.contactName
  if (data.contactPhone !== undefined) body.contactPhone = data.contactPhone
  if (data.ownerName !== undefined) body.ownerName = data.ownerName
  if (data.regions !== undefined) body.regions = JSON.stringify(data.regions || [])
  if (data.basePrice !== undefined) body.basePrice = data.basePrice
  if (data.settleMode !== undefined) body.settleMode = data.settleMode
  if (data.creditLimit !== undefined) body.creditLimit = data.creditLimit
  if (data.receivable !== undefined) body.receivable = data.receivable
  if (data.monthOrders !== undefined) body.monthOrders = data.monthOrders
  if (data.monthRevenue !== undefined) body.monthRevenue = data.monthRevenue
  if (data.level !== undefined) body.partnerLevel = data.level
  if (data.status !== undefined) body.status = data.status
  if (data.remark !== undefined) body.remark = data.remark
  return body
}

export const channelPartnerApi = {
  async list (params: { page?: number; pageSize?: number; keyword?: string; type?: string; level?: string; status?: string } = {}): Promise<{ list: ChannelPartner[]; total: number }> {
    const res = await get('/channel-partner/list', {
      pageNum: params.page || 1,
      pageSize: params.pageSize || 100,
      keyword: params.keyword || undefined,
      partnerType: params.type || undefined,
      partnerLevel: params.level || undefined,
      status: params.status || undefined
    })
    const page = toPage<RawSupplier>(unwrap(res))
    return { list: page.list.map(adaptPartner), total: page.total }
  },
  async detail (id: number): Promise<ChannelPartner | null> {
    const raw = unwrap<RawSupplier | null>(await get(`/channel-partner/${id}`))
    return raw ? adaptPartner(raw) : null
  },
  async create (data: Partial<ChannelPartner>): Promise<number> {
    return unwrap<number>(await post('/channel-partner', toBackendPartner(data)))
  },
  async update (data: Partial<ChannelPartner> & { id: number }): Promise<number> {
    return unwrap<number>(await put('/channel-partner', toBackendPartner(data)))
  },
  /** 状态切换：复用 update 只发 {id,status}（MyBatis-Plus updateById 对 null 字段不更新），避免 query 传参坑 */
  async changeStatus (id: number, status: string): Promise<{ success: boolean }> {
    await put('/channel-partner', toBackendPartner({ id, status: status as ChannelPartner['status'] }))
    return { success: true }
  },
  async delete (id: number): Promise<{ success: boolean }> {
    await del(`/channel-partner/${id}`)
    return { success: true }
  }
}
