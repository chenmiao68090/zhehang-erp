import { del, get, post, put } from './request'

export interface OpsAdFeedback {
  id?: number
  feedbackDate: string
  platform: string
  accountName?: string
  campaignName?: string
  spendAmount: number
  totalLeads: number
  validLeads: number
  invalidLeads: number
  conversionCount: number
  revenueAmount: number
  ownerName?: string
  status?: 'normal' | 'watch' | 'paused'
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface OpsAdFeedbackQuery {
  pageNum?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  platform?: string
  keyword?: string
}

export interface PageResult<T> {
  list: T[]
  records?: T[]
  total: number
}

export interface OpsAdSummaryItem {
  platform?: string
  date?: string
  totalLeads: number
  validLeads: number
  invalidLeads: number
  conversionCount?: number
  spendAmount: number
  revenueAmount?: number
  validRate?: number
  costPerLead?: number
  roi?: number
}

export interface OpsAdSummary {
  totalLeads: number
  validLeads: number
  invalidLeads: number
  conversionCount: number
  spendAmount: number
  revenueAmount: number
  validRate: number
  costPerLead: number
  roi: number
  byPlatform: OpsAdSummaryItem[]
  byDay: OpsAdSummaryItem[]
  alerts: string[]
}

function unwrap<T = any>(res: any): T {
  if (res && typeof res === 'object' && 'code' in res && 'data' in res) return res.data as T
  return res as T
}

export const operationServiceApi = {
  async listFeedback(params: OpsAdFeedbackQuery) {
    const data = unwrap<PageResult<OpsAdFeedback>>(await get('/ops/ad-feedback/list', params))
    const list = Array.isArray(data?.list) ? data.list : (Array.isArray(data?.records) ? data.records : [])
    return { ...data, list, total: Number(data?.total || list.length || 0) }
  },
  async getSummary(params: Omit<OpsAdFeedbackQuery, 'pageNum' | 'pageSize'>) {
    return unwrap<OpsAdSummary>(await get('/ops/ad-feedback/summary', params))
  },
  async saveFeedback(payload: OpsAdFeedback) {
    const body = {
      id: payload.id,
      feedbackDate: payload.feedbackDate,
      platform: payload.platform,
      accountName: payload.accountName,
      campaignName: payload.campaignName,
      spendAmount: Number(payload.spendAmount || 0),
      totalLeads: Number(payload.totalLeads || 0),
      validLeads: Number(payload.validLeads || 0),
      invalidLeads: Number(payload.invalidLeads || 0),
      conversionCount: Number(payload.conversionCount || 0),
      revenueAmount: Number(payload.revenueAmount || 0),
      ownerName: payload.ownerName,
      status: payload.status || 'normal',
      remark: payload.remark
    }
    return unwrap<number>(payload.id ? await put('/ops/ad-feedback', body) : await post('/ops/ad-feedback', body))
  },
  async deleteFeedback(id: number) {
    return unwrap<void>(await del(`/ops/ad-feedback/${id}`))
  }
}
