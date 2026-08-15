import { get, post, put, del } from './request'

/** 长期合作客户 */
export interface Partner {
  id?: number | string
  companyName?: string
  contact?: string
  phone?: string
  decisionMaker?: string
  decisionPhone?: string
  bizOwnerName?: string
  bizOwnerPhone?: string
  settleMethod?: string
  needInvoice?: number
  invoiceInfo?: string
  monthlyAvg?: number
  bizType?: string
  level?: string
  sinceDate?: string
  remark?: string
  mailMethod?: string
  mailAddress?: string
  prices?: PartnerPrice[]
}

/** 协议价明细 */
export interface PartnerPrice {
  id?: number | string
  partnerId?: number | string
  itemName?: string
  price?: number
  unit?: string
  remark?: string
}

/** 历史合作记录(按月) */
export interface PartnerHistory {
  id?: number | string
  partnerId?: number | string
  coopMonth?: string
  amount?: number
  settled?: number
  invoiceDone?: number
  vouchers?: string
  remark?: string
}

export const partnerApi = {
  list: (params: any) => get('/partner/list', params),
  create: (data: Partner) => post('/partner', data),
  update: (data: Partner) => put('/partner', data),
  remove: (id: number | string) => del(`/partner/${id}`),
  // 协议价
  prices: (id: number | string) => get(`/partner/${id}/prices`),
  addPrice: (data: PartnerPrice) => post('/partner/price', data),
  updatePrice: (data: PartnerPrice) => put('/partner/price', data),
  removePrice: (id: number | string) => del(`/partner/price/${id}`),
  // 历史合作记录
  history: (id: number | string) => get(`/partner/${id}/history`),
  addHistory: (data: PartnerHistory) => post('/partner/history', data),
  updateHistory: (data: PartnerHistory) => put('/partner/history', data),
  removeHistory: (id: number | string) => del(`/partner/history/${id}`)
}

/** 协议价行内编辑:列表 + 批量保存 */
export const partnerPriceApi = {
  /** 查某客户的协议价列表 */
  list: (partnerId: number | string) => get('/partner/price/list', { partnerId }),
  /** 批量保存某客户的协议价(先删旧价再批量插入) */
  batchSave: (partnerId: number | string, prices: PartnerPrice[]) =>
    post('/partner/price/batch', { partnerId, prices })
}
