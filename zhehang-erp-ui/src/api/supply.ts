import { get, post, put, del } from './request'

// Vendor Management
export const vendorApi = {
  list: (params: any) => get('/supply/vendor/list', params),
  detail: (id: number) => get('/supply/vendor/' + id),
  add: (data: any) => post('/supply/vendor', data),
  update: (data: any) => put('/supply/vendor', data),
  remove: (id: number) => del('/supply/vendor/' + id),
  updateRating: (id: number, rating: number) => put('/supply/vendor/rating', null, { params: { id, rating } }),
  all: () => get('/supply/vendor/all')
}

// Purchase Request
export const purchaseReqApi = {
  list: (params: any) => get('/supply/purchase-req/list', params),
  detail: (id: number) => get('/supply/purchase-req/' + id),
  add: (data: any) => post('/supply/purchase-req', data),
  update: (data: any) => put('/supply/purchase-req', data),
  remove: (id: number) => del('/supply/purchase-req/' + id),
  submit: (id: number) => put('/supply/purchase-req/submit/' + id),
  approve: (id: number) => put('/supply/purchase-req/approve/' + id),
  reject: (id: number) => put('/supply/purchase-req/reject/' + id)
}

// Purchase Order
export const purchaseOrderApi = {
  list: (params: any) => get('/supply/purchase-order/list', params),
  detail: (id: number) => get('/supply/purchase-order/' + id),
  add: (data: any) => post('/supply/purchase-order', data),
  update: (data: any) => put('/supply/purchase-order', data),
  remove: (id: number) => del('/supply/purchase-order/' + id),
  confirm: (id: number) => put('/supply/purchase-order/confirm/' + id),
  ship: (id: number) => put('/supply/purchase-order/ship/' + id),
  arrive: (id: number) => put('/supply/purchase-order/arrive/' + id)
}

// Receipt
export const receiptApi = {
  list: (params: any) => get('/supply/receipt/list', params),
  detail: (id: number) => get('/supply/receipt/' + id),
  add: (data: any) => post('/supply/receipt', data),
  update: (data: any) => put('/supply/receipt', data),
  remove: (id: number) => del('/supply/receipt/' + id),
  inspect: (id: number, result: number) => put('/supply/receipt/inspect/' + id, null, { params: { result } })
}

// Return
export const returnApi = {
  list: (params: any) => get('/supply/return/list', params),
  detail: (id: number) => get('/supply/return/' + id),
  add: (data: any) => post('/supply/return', data),
  update: (data: any) => put('/supply/return', data),
  remove: (id: number) => del('/supply/return/' + id),
  process: (id: number) => put('/supply/return/process/' + id),
  complete: (id: number) => put('/supply/return/complete/' + id)
}

// Reconciliation
export const reconciliationApi = {
  summary: () => get('/supply/reconciliation/summary')
}
