import { get, post, put, del } from './request'

// 报价管理
export const quotationApi = {
  list: (params: any) => get('/sales/quotation/list', params),
  detail: (id: number) => get(`/sales/quotation/${id}`),
  create: (data: any) => post('/sales/quotation', data),
  update: (data: any) => put('/sales/quotation', data),
  remove: (id: number) => del(`/sales/quotation/${id}`),
  send: (id: number) => post(`/sales/quotation/send/${id}`),
  confirm: (id: number) => post(`/sales/quotation/confirm/${id}`),
  newVersion: (id: number) => post(`/sales/quotation/newVersion/${id}`)
}

// 销售订单
export const salesOrderApi = {
  list: (params: any) => get('/sales/order/list', params),
  detail: (id: number) => get(`/sales/order/${id}`),
  create: (data: any) => post('/sales/order', data),
  update: (data: any) => put('/sales/order', data),
  remove: (id: number) => del(`/sales/order/${id}`),
  approve: (id: number) => post(`/sales/order/approve/${id}`),
  changeStatus: (data: { id: number; status: number }) => post('/sales/order/changeStatus', data),
  fromQuotation: (quotationId: number) => post(`/sales/order/fromQuotation/${quotationId}`)
}

// 发货管理
export const deliveryApi = {
  list: (params: any) => get('/sales/delivery/list', params),
  detail: (id: number) => get(`/sales/delivery/${id}`),
  create: (data: any) => post('/sales/delivery', data),
  update: (data: any) => put('/sales/delivery', data),
  remove: (id: number) => del(`/sales/delivery/${id}`)
}

// 回款管理
export const receiptApi = {
  list: (params: any) => get('/sales/receipt/list', params),
  detail: (id: number) => get(`/sales/receipt/${id}`),
  create: (data: any) => post('/sales/receipt', data),
  update: (data: any) => put('/sales/receipt', data),
  remove: (id: number) => del(`/sales/receipt/${id}`),
  overdue: () => get('/sales/receipt/overdue'),
  stats: () => get('/sales/receipt/stats')
}

// 销售提成
export const commissionApi = {
  list: (params: any) => get('/sales/commission/list', params),
  calculate: (orderId: number) => post(`/sales/commission/calculate/${orderId}`),
  statistics: (period?: string) => get('/sales/commission/statistics', { period })
}
