import { get } from './request'

/** 经营分析(只读聚合,老板/主管/经理可见) */
export const analysisApi = {
  overview: (year?: number) => get('/analysis/overview', { year }),
  newOrders: (year?: number, month?: number) => get('/analysis/new-orders', { year, month }),
  renewal: (year?: number) => get('/analysis/renewal', { year }),
  loss: () => get('/analysis/loss'),
  customerValue: () => get('/analysis/customer-value'),
  leadRoi: (start?: string, end?: string) => get('/analysis/lead-roi', { start, end }),
  sales: (year?: number) => get('/analysis/sales', { year })
}
