import { get, post, put, del } from './request'

export interface SealOrder {
  id?: number
  regDate?: string
  perfDept?: string
  ownerName?: string
  bizType?: string
  partnerId?: number
  billYear?: string
  billMonth?: string
  companyName?: string
  legalPerson?: string
  phone?: string
  idCardFront?: string
  idCardFrontName?: string
  idCardBack?: string
  idCardBackName?: string
  sealTypes?: string
  sealStatus?: string
  recordStatus?: string
  sealCity?: string
  sealMaterial?: string
  fee?: number
  payAccount?: string
  customerAlipayQr?: string
  outRegionFee?: number
  payMethod?: string
  payDate?: string
  recipient?: string
  address?: string
  isMail?: number
  isRecord?: number
  isShipped?: number
  trackingNo?: string
  isDelivered?: number
  handlerIsLegal?: number
  isWePublish?: number
  documents?: string
  deliveryType?: string
  publishFee?: number
  opCostTotal?: number
  needInvoice?: number
  invoiceInfo?: string
  invoiceDone?: number
  rebateCost?: number
  refundAmount?: number
  status?: string
  remark?: string
}

export interface SealPublicToken {
  token: string
  expiresAt: number
}

export const sealOrderApi = {
  list: (params: { pageNum?: number; pageSize?: number; keyword?: string; status?: string; needInvoice?: number; invoiceDone?: number }) =>
    get('/seal/order/list', params),
  create: (data: SealOrder) => post('/seal/order', data),
  update: (data: SealOrder) => put('/seal/order', data),
  remove: (id: number) => del(`/seal/order/${id}`),
  /** 登录经办人生成绑定当前公司、24小时有效的一次性客户链接 */
  issuePublicToken: () => post('/seal/public/token')
}

/** 印章耗材库存 */
export interface SealStock {
  id?: number | string
  itemName?: string
  spec?: string
  unit?: string
  quantity?: number
  safetyStock?: number
  unitPrice?: number
  purchaseDate?: string
  buyQty?: number
  buyPrice?: number
  discount?: number
  invoiceDone?: number
  invoiceFile?: string
  purchaseLink?: string
  supplier?: string
  remark?: string
}

export const sealStockApi = {
  list: (keyword?: string) => get('/seal/stock/list', { keyword }),
  create: (data: SealStock) => post('/seal/stock', data),
  update: (data: SealStock) => put('/seal/stock', data),
  adjust: (id: number | string, delta: number, reason?: string) => post('/seal/stock/adjust', { id, delta, reason }),
  logs: (id: number | string) => get(`/seal/stock/${id}/logs`),
  remove: (id: number | string) => del(`/seal/stock/${id}`)
}

/** 印章库存盘点 */
export interface SealStockCheck {
  id?: number | string
  itemName?: string
  bookQty?: number
  actualQty?: number
  diff?: number
  checkDate?: string
  operator?: string
  remark?: string
}

export const stockCheckApi = {
  list: () => get('/seal/stock-check/list'),
  save: (data: SealStockCheck) => post('/seal/stock-check', data),
  remove: (id: number | string) => del(`/seal/stock-check/${id}`)
}

/** 印章耗材采购 */
export interface SealPurchase {
  id?: number | string
  itemName?: string
  spec?: string
  quantity?: number
  unitPrice?: number
  amount?: number
  supplier?: string
  purchaseDate?: string
  operator?: string
  status?: string
  remark?: string
}

export const sealPurchaseApi = {
  list: (params: any) => get('/seal/purchase/list', params),
  create: (data: SealPurchase) => post('/seal/purchase', data),
  update: (data: SealPurchase) => put('/seal/purchase', data),
  arrive: (id: number | string) => post(`/seal/purchase/${id}/arrive`),
  remove: (id: number | string) => del(`/seal/purchase/${id}`)
}

/** 外区域合作(浙江省内、杭州以外的备案/刻章合作商名录) */
export interface OutRegion {
  id?: number | string
  city?: string
  contactGroup?: string
  contactPerson?: string
  contactPhone?: string
  recordOnlyPrice?: number
  recordEngrave?: string
  legalSealRecord?: string
  needHalfPhoto?: string
  publicSealSize?: string
  payQrcode?: string
  hzRecordPrice?: number
  hzReportOnly?: string
  remark?: string
}

export const outRegionApi = {
  list: (keyword?: string) => get('/seal/out-region/list', { keyword }),
  save: (data: OutRegion) => post('/seal/out-region', data),
  remove: (id: number | string) => del(`/seal/out-region/${id}`)
}

/** 刻章成本明细(按月) */
export interface SealCost {
  id?: number | string
  costYear?: string
  costMonth?: string
  costType?: string
  costCategory?: string
  amount?: number
  description?: string
  attachment?: string
  remark?: string
}

export const sealCostApi = {
  /** 查某月成本明细 */
  list: (month?: string, year?: string) => get('/seal/cost/list', { month, year }),
  /** 批量保存某月成本明细(先删该月旧明细再整表插入) */
  batchSave: (year: string, month: string, lines: SealCost[]) =>
    post('/seal/cost/batch', { year, month, lines }),
  remove: (id: number | string) => del(`/seal/cost/${id}`)
}

/** 印章业务看板·某年各月指标 */
export const sealBoardApi = {
  summary: (year: string) => get('/seal/board/summary', { year })
}
