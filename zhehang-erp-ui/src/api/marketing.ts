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
}

export const campaignApi = {
  list: (params: { pageNum?: number; pageSize?: number; keyword?: string; channel?: string; status?: number }) =>
    get<{ records: Campaign[]; total: number }>('/marketing/campaign/list', params),
  get: (id: number) => get<Campaign>(`/marketing/campaign/${id}`),
  add: (data: Campaign) => post('/marketing/campaign', data),
  update: (data: Campaign) => put('/marketing/campaign', data),
  remove: (id: number) => del(`/marketing/campaign/${id}`),
  /** 各活动获客 ROI/CAC（实时统计关联线索数） */
  roi: () => get<CampaignRoi[]>('/marketing/campaign/roi')
}
