// ===== 渠道管理 API（localStorage Mock 模式） =====

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
function genNo(prefix: string, id: number) {
  const d = new Date()
  return `${prefix}${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(id).padStart(4, '0')}`
}

function seedSuppliers(): BizSupplier[] {
  return []
}

function seedAddresses(): BizAddressResource[] {
  return []
}

function seedProcurements(): BizProcurement[] {
  return []
}

function seedChannelCosts(): BizChannelCost[] {
  return []
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
        const addr: BizAddressResource = {
          id: newId,
          resourceNo: `ADR${String(newId).padStart(5, '0')}`,
          supplierId: cur.supplierId,
          supplierName: cur.supplierName || '',
          province: '浙江省',
          city: '杭州市',
          district: parts[0]?.length <= 4 ? parts[0] : '萧山区',
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
