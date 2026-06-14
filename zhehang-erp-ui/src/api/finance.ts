import { get, post, put, del } from './request'

// Voucher Management
export const voucherApi = {
  list: (params: any) => get('/finance/voucher/list', params),
  detail: (id: number) => get(`/finance/voucher/${id}`),
  add: (data: any) => post('/finance/voucher', data),
  update: (data: any) => put('/finance/voucher', data),
  remove: (id: number) => del(`/finance/voucher/${id}`),
  audit: (id: number) => put(`/finance/voucher/audit/${id}`),
  post: (id: number) => put(`/finance/voucher/post/${id}`),
  voidVoucher: (id: number) => put(`/finance/voucher/void/${id}`)
}

// Ledger Query
export const ledgerApi = {
  general: (params: any) => get('/finance/ledger/general', params),
  detail: (params: any) => get('/finance/ledger/detail', params),
  balance: (params: any) => get('/finance/ledger/balance', params),
  journal: (params: any) => get('/finance/ledger/journal', params)
}

// Financial Report
export const reportApi = {
  list: (params: any) => get('/finance/report/list', params),
  detail: (id: number) => get(`/finance/report/${id}`),
  generate: (data: any) => post('/finance/report/generate', data),
  balanceSheet: (params: any) => get('/finance/report/balance-sheet', params),
  incomeStatement: (params: any) => get('/finance/report/income-statement', params),
  cashFlow: (params: any) => get('/finance/report/cash-flow', params)
}

// Tax Management
export const taxApi = {
  list: (params: any) => get('/finance/tax/list', params),
  add: (data: any) => post('/finance/tax', data),
  update: (data: any) => put('/finance/tax', data),
  remove: (id: number) => del(`/finance/tax/${id}`),
  declare: (id: number) => put(`/finance/tax/declare/${id}`),
  summary: (params: any) => get('/finance/tax/summary', params)
}

// Invoice Management
export const invoiceApi = {
  list: (params: any) => get('/finance/invoice/list', params),
  add: (data: any) => post('/finance/invoice', data),
  update: (data: any) => put('/finance/invoice', data),
  remove: (id: number) => del(`/finance/invoice/${id}`),
  stats: () => get('/finance/invoice/stats')
}

// Expense Reimbursement
export const reimburseApi = {
  list: (params: any) => get('/finance/reimburse/list', params),
  detail: (id: number) => get(`/finance/reimburse/${id}`),
  submit: (data: any) => post('/finance/reimburse', data),
  update: (data: any) => put('/finance/reimburse', data),
  approve: (data: any) => put('/finance/reimburse/approve', data),
  pay: (id: number) => put(`/finance/reimburse/pay/${id}`)
}

// Receivable/Payable
export const receivableApi = {
  list: (params: any) => get('/finance/receivable/list', params),
  add: (data: any) => post('/finance/receivable', data),
  receive: (data: any) => put('/finance/receivable/receive', data),
  aging: (params: any) => get('/finance/receivable/aging', params),
  overdue: () => get('/finance/receivable/overdue')
}

// 备用金管理（真实后端 FinPettyCashController /finance/petty-cash/*）
export const pettyCashApi = {
  list: (params: any) => get('/finance/petty-cash/list', params),
  detail: (id: number) => get(`/finance/petty-cash/${id}`),
  add: (data: any) => post('/finance/petty-cash', data),
  update: (data: any) => put('/finance/petty-cash', data),
  changeStatus: (id: number, status: string) => put('/finance/petty-cash', { id, status }),
  remove: (id: number) => del(`/finance/petty-cash/${id}`)
}

// 业务支出管理（真实后端 FinExpenseController /finance/expense/*）
export const expenseApi = {
  list: (params: any) => get('/finance/expense/list', params),
  detail: (id: number) => get(`/finance/expense/${id}`),
  add: (data: any) => post('/finance/expense', data),
  update: (data: any) => put('/finance/expense', data),
  changeStatus: (id: number, status: string) => put('/finance/expense', { id, status }),
  remove: (id: number) => del(`/finance/expense/${id}`)
}

// 管理成本（真实后端 FinCostController /finance/cost/*）
export const costApi = {
  list: (params: any) => get('/finance/cost/list', params),
  detail: (id: number) => get(`/finance/cost/${id}`),
  add: (data: any) => post('/finance/cost', data),
  update: (data: any) => put('/finance/cost', data),
  changeStatus: (id: number, status: string) => put('/finance/cost', { id, status }),
  remove: (id: number) => del(`/finance/cost/${id}`)
}
