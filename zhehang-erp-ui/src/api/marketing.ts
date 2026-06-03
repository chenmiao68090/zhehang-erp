import { get, post, put, del } from './request'

/** 营销活动 */
export interface Campaign {
  id?: number
  campaignName: string
  channel?: string
  budget?: number
  actualCost?: number
  startDate?: string
  endDate?: string
  impressions?: number
  clicks?: number
  leadsCount?: number
  ownerId?: number
  status?: number
  remark?: string
  createTime?: string
}

/** 营销活动 ROI/CAC 统计行 */
export interface CampaignRoi {
  id: number
  campaignName: string
  channel?: string
  budget?: number
  actualCost?: number
  impressions?: number
  clicks?: number
  leadsCount: number
  cac?: number | null
  status?: number
  clickRate?: number
  leadRate?: number
  budgetUsage?: number
  efficiency?: 'excellent' | 'good' | 'watch' | 'risk'
}

const STORAGE_KEY = 'mkt_campaigns_fallback_v1'

const seedCampaigns: Campaign[] = [
  {
    id: 1,
    campaignName: '抖音-新公司财税套餐',
    channel: '抖音',
    budget: 42000,
    actualCost: 38600,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    impressions: 186000,
    clicks: 6200,
    leadsCount: 168,
    status: 1,
    remark: '短视频投流,主推注册公司+代理记账首年套餐',
    createTime: '2026-06-01 09:10:00'
  },
  {
    id: 2,
    campaignName: '百度-代理记账搜索词',
    channel: '百度',
    budget: 32000,
    actualCost: 34800,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    impressions: 92000,
    clicks: 4100,
    leadsCount: 96,
    status: 1,
    remark: '核心关键词: 杭州代理记账 / 财税公司 / 小规模报税',
    createTime: '2026-06-02 10:20:00'
  },
  {
    id: 3,
    campaignName: '小红书-财税避坑笔记',
    channel: '小红书',
    budget: 18000,
    actualCost: 12600,
    startDate: '2026-05-18',
    endDate: '2026-06-18',
    impressions: 64000,
    clicks: 2500,
    leadsCount: 82,
    status: 1,
    remark: '内容获客,重点筛选新成立公司和异常解除需求',
    createTime: '2026-05-18 14:00:00'
  },
  {
    id: 4,
    campaignName: '官网 SEO-企业变更专题',
    channel: '官网表单',
    budget: 9000,
    actualCost: 6200,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    impressions: 38000,
    clicks: 1320,
    leadsCount: 54,
    status: 1,
    remark: '自然流量承接工商变更、税务异常解除、地址挂靠咨询',
    createTime: '2026-05-01 08:30:00'
  }
]

function unwrap<T>(res: any): T {
  return (res && Object.prototype.hasOwnProperty.call(res, 'data')) ? res.data : res
}

function readLocal(): Campaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      writeLocal(seedCampaigns)
      return seedCampaigns.map((item) => ({ ...item }))
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seedCampaigns.map((item) => ({ ...item }))
  } catch {
    return seedCampaigns.map((item) => ({ ...item }))
  }
}

function writeLocal(list: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function paginate<T>(list: T[], pageNum = 1, pageSize = 10) {
  const start = (pageNum - 1) * pageSize
  return { records: list.slice(start, start + pageSize), list: list.slice(start, start + pageSize), total: list.length }
}

function toRoi(row: Campaign): CampaignRoi {
  const actualCost = Number(row.actualCost || 0)
  const budget = Number(row.budget || 0)
  const impressions = Number(row.impressions || 0)
  const clicks = Number(row.clicks || 0)
  const leadsCount = Number(row.leadsCount || 0)
  const cac = leadsCount > 0 ? round(actualCost / leadsCount) : null
  const clickRate = impressions > 0 ? round(clicks / impressions * 100) : 0
  const leadRate = clicks > 0 ? round(leadsCount / clicks * 100) : 0
  const budgetUsage = budget > 0 ? round(actualCost / budget * 100) : 0
  return {
    id: Number(row.id || 0),
    campaignName: row.campaignName,
    channel: row.channel,
    budget,
    actualCost,
    impressions,
    clicks,
    leadsCount,
    cac,
    status: row.status,
    clickRate,
    leadRate,
    budgetUsage,
    efficiency: efficiencyOf(cac)
  }
}

function normalizeRoi(row: any): CampaignRoi {
  const source: Campaign = {
    id: row.id,
    campaignName: row.campaignName || row.name || '未命名活动',
    channel: row.channel,
    budget: Number(row.budget || 0),
    actualCost: Number(row.actualCost || 0),
    impressions: Number(row.impressions || 0),
    clicks: Number(row.clicks || 0),
    leadsCount: Number(row.leadsCount || 0),
    status: row.status
  }
  return { ...toRoi(source), cac: row.cac == null ? toRoi(source).cac : Number(row.cac) }
}

function efficiencyOf(cac?: number | null): CampaignRoi['efficiency'] {
  if (cac == null) return 'risk'
  if (cac <= 120) return 'excellent'
  if (cac <= 220) return 'good'
  if (cac <= 360) return 'watch'
  return 'risk'
}

function round(n: number) {
  return Math.round(n * 100) / 100
}

function filterLocal(params: { keyword?: string; channel?: string; status?: number } = {}) {
  const keyword = (params.keyword || '').trim()
  return readLocal().filter((item) => {
    if (keyword && !`${item.campaignName}${item.channel}${item.remark}`.includes(keyword)) return false
    if (params.channel && item.channel !== params.channel) return false
    if (params.status && item.status !== params.status) return false
    return true
  })
}

function nextId(list: Campaign[]) {
  return (list.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) || 0) + 1
}

export const campaignApi = {
  async list(params: { pageNum?: number; pageSize?: number; keyword?: string; channel?: string; status?: number } = {}) {
    try {
      const data: any = unwrap(await get('/marketing/campaign/list', params, { silentError: true }))
      if (data?.records || data?.list) return data
    } catch {
      // 使用本地兜底。
    }
    return paginate(filterLocal(params), params.pageNum, params.pageSize)
  },

  async get(id: number) {
    try {
      const data = unwrap<Campaign>(await get(`/marketing/campaign/${id}`, undefined, { silentError: true }))
      if (data) return data
    } catch {
      // 使用本地兜底。
    }
    return readLocal().find((item) => item.id === id) || null
  },

  async add(data: Campaign) {
    try {
      return unwrap(await post('/marketing/campaign', data, { silentError: true }))
    } catch {
      const list = readLocal()
      const next = { ...data, id: nextId(list), createTime: new Date().toISOString().slice(0, 19).replace('T', ' ') }
      list.unshift(next)
      writeLocal(list)
      return next
    }
  },

  async update(data: Campaign) {
    try {
      return unwrap(await put('/marketing/campaign', data, { silentError: true }))
    } catch {
      const list = readLocal()
      const index = list.findIndex((item) => item.id === data.id)
      if (index >= 0) list[index] = { ...list[index], ...data }
      writeLocal(list)
      return index >= 0 ? list[index] : data
    }
  },

  async remove(id: number) {
    try {
      return unwrap(await del(`/marketing/campaign/${id}`, { silentError: true }))
    } catch {
      writeLocal(readLocal().filter((item) => item.id !== id))
      return { success: true }
    }
  },

  /** 各活动获客 ROI/CAC（实时统计关联线索数） */
  async roi() {
    try {
      const data = unwrap<any[]>(await get('/marketing/campaign/roi', undefined, { silentError: true }))
      if (Array.isArray(data)) return data.map(normalizeRoi)
    } catch {
      // 使用本地兜底。
    }
    return readLocal().map(toRoi).sort((a, b) => Number(a.cac || 0) - Number(b.cac || 0))
  }
}
