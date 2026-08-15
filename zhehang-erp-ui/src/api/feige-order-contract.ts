import { get, post, put } from './request'

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages?: number
}

export interface FeigeOrder {
  id: number
  orderNo: string
  orderDate: string
  companyName: string
  contacts?: string
  contactPhone?: string
  region?: string
  address?: string
  salesmanId: number
  salesmanName: string
  deptId?: number
  businessType: string
  opportunitySource?: string
  deliveryMethod?: string
  orderAmount: number
  contractAmount: number
  finalPaymentAmount: number
  receivedAmount: number
  outstandingAmount: number
  collectionTime?: string
  collectionAccountNumber?: string
  recurring: number
  voucher?: string
  status: string
  remarks?: string
  createTime?: string
  teamName?: string
  companyId?: number
  customerSource?: string
  sourceDetail?: string
  auditStatus?: string
  auditRemark?: string
  auditorName?: string
  auditTime?: string
  flowProgress?: string
  currentStep?: string
  taskStatus?: string
  repurchaseCount?: number
  companyNature?: string
  businessData?: Record<string, any> | string
}

export interface FeigeOrderPayload {
  orderDate?: string
  companyName: string
  contacts?: string
  contactPhone?: string
  region?: string
  address?: string
  salesmanId?: number
  businessType: string
  opportunitySource?: string
  deliveryMethod?: string
  orderAmount?: number
  contractAmount?: number
  finalPaymentAmount?: number
  receivedAmount?: number
  collectionTime?: string
  collectionAccountNumber?: string
  recurring?: number
  voucher?: string
  remarks?: string
  createContract?: boolean
  contractSignDate?: string
  contractExpireDate?: string
  contractPayType?: string
  contractGiftMonth?: number
  enterpriseNature?: string
  teamName?: string
  customerSource?: string
  sourceDetail?: string
  businessData?: Record<string, any> | string
}

export interface FeigeOrderStep {
  id: number
  orderId: number
  stepNo: number
  stepName: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  assigneeName?: string
  completedTime?: string
  remark?: string
}

export interface FeigeAuditPayload {
  result: 'approved' | 'rejected'
  remark?: string
}

export interface FeigePayment {
  id: number
  orderId: number
  paymentTime: string
  amount: number
  paymentMethod?: string
  accountNumber?: string
  status: string
  voucher?: string
  remarks?: string
}

export interface FeigeRefund {
  id: number
  orderId: number
  orderNo: string
  companyName: string
  refundAmount: number
  reason: string
  status: string
  salesmanName: string
  reviewerName?: string
  reviewTime?: string
  reviewComment?: string
  completedTime?: string
  createTime?: string
}

export interface FeigeContract {
  id: number
  contractNo: string
  orderId?: number
  orderNo?: string
  companyName: string
  salesmanId: number
  salesmanName: string
  deptId?: number
  servicePersonId?: number
  servicePersonName?: string
  serviceStaffJson?: string
  contractAmount: number
  signDate?: string
  expireDate?: string
  contractStatus: string
  lossFlag: number
  lossReason?: string
  retentionMeasure?: string
  finalDecision?: string
  backupFlag: number
  remarks?: string
  payType?: string
  giftMonth: number
  enterpriseNature?: string
  manualBusinessTag?: string
  createTime?: string
  paidAmount?: number
  customerSource?: string
  signerName?: string
  productName?: string
  renewalStatus?: string
  totalSpending?: number
  customerOrderCount?: number
  referralCount?: number
  followupCount?: number
  collectionCount?: number
  serviceMonths?: number
  enterpriseLevel?: string
  businessTag?: string
  relatedCompanyName?: string
  relatedStatus?: string
  weworkGroupBound?: number
  financeDirectorName?: string
  financeAdvisorName?: string
  accountantName?: string
}

export interface FeigeContractPayload {
  orderId?: number
  companyName: string
  salesmanId?: number
  servicePersonId?: number
  serviceStaffJson?: string
  contractAmount?: number
  signDate?: string
  expireDate?: string
  contractStatus?: string
  lossFlag?: number
  lossReason?: string
  retentionMeasure?: string
  finalDecision?: string
  backupFlag?: number
  remarks?: string
  payType?: string
  giftMonth?: number
  enterpriseNature?: string
  manualBusinessTag?: string
  paidAmount?: number
  customerSource?: string
  signerName?: string
  productName?: string
  renewalStatus?: string
  enterpriseLevel?: string
  businessTag?: string
}

export interface FeigeContractRenewal {
  id: number
  contractId: number
  renewalDate: string
  startDate?: string
  expireDate?: string
  amount: number
  giftMonth?: number
  payType?: string
  operatorName?: string
  remark?: string
}

export interface FeigeContractChangeLog {
  id: number
  contractId: number
  changeType: string
  changeDesc: string
  operatorName?: string
  createTime: string
}

export interface FeigeContractHandover {
  id: number
  sourceStaffName: string
  targetStaffName: string
  serviceRole: string
  contractCount: number
  status: string
  operatorName?: string
  createTime: string
  revokedTime?: string
}

export interface StaffOption {
  id: number
  name: string
  deptId?: number
  deptName?: string
}

export interface OperationLog {
  id: number
  operationType: string
  operationDesc: string
  operatorName?: string
  remarks?: string
  createTime?: string
}

export interface DashboardStats {
  total: number
  inProgress: number
  completed: number
  refunding: number
  contractAmount: number
  receivedAmount: number
  outstandingAmount: number
}

export const feigeOrderApi = {
  dashboard: () => get<DashboardStats>('/feige-order-contract/dashboard'),
  staffOptions: () => get<StaffOption[]>('/feige-order-contract/staff-options'),
  orders: (params: Record<string, any>) => get<PageResult<FeigeOrder>>('/feige-order-contract/orders', params),
  order: (id: number) => get<FeigeOrder>(`/feige-order-contract/orders/${id}`),
  createOrder: (data: FeigeOrderPayload) => post<number>('/feige-order-contract/orders', data),
  updateOrder: (id: number, data: FeigeOrderPayload) => put<void>(`/feige-order-contract/orders/${id}`, data),
  auditOrders: (params: Record<string, any>) => get<PageResult<FeigeOrder>>('/feige-order-contract/audit-orders', params),
  auditOrder: (id: number, data: FeigeAuditPayload) => post<void>(`/feige-order-contract/orders/${id}/audit`, data),
  rejectOrder: (id: number, reason: string) => post<void>(`/feige-order-contract/orders/${id}/reject`, { reason }),
  confirmOrder: (id: number) => post<void>(`/feige-order-contract/orders/${id}/confirm`),
  completeOrder: (id: number) => post<void>(`/feige-order-contract/orders/${id}/complete`),
  steps: (id: number) => get<FeigeOrderStep[]>(`/feige-order-contract/orders/${id}/steps`),
  payments: (id: number) => get<FeigePayment[]>(`/feige-order-contract/orders/${id}/payments`),
  addPayment: (id: number, data: Record<string, any>) => post<number>(`/feige-order-contract/orders/${id}/payments`, data),
  logs: (id: number) => get<OperationLog[]>(`/feige-order-contract/orders/${id}/logs`),
  unreceived: (params: Record<string, any>) => get<PageResult<FeigeOrder>>('/feige-order-contract/unreceived', params),
  refunds: (params: Record<string, any>) => get<PageResult<FeigeRefund>>('/feige-order-contract/refunds', params),
  applyRefund: (orderId: number, data: { refundAmount: number; reason: string }) => post<number>(`/feige-order-contract/orders/${orderId}/refunds`, data),
  approveRefund: (id: number, comment?: string) => post<void>(`/feige-order-contract/refunds/${id}/approve`, { comment }),
  rejectRefund: (id: number, comment?: string) => post<void>(`/feige-order-contract/refunds/${id}/reject`, { comment }),
  completeRefund: (id: number, comment?: string) => post<void>(`/feige-order-contract/refunds/${id}/complete`, { comment }),
  contracts: (params: Record<string, any>) => get<PageResult<FeigeContract>>('/feige-order-contract/contracts', params),
  contract: (id: number) => get<FeigeContract>(`/feige-order-contract/contracts/${id}`),
  contractRenewals: (id: number) => get<FeigeContractRenewal[]>(`/feige-order-contract/contracts/${id}/renewals`),
  contractChanges: (id: number) => get<FeigeContractChangeLog[]>(`/feige-order-contract/contracts/${id}/changes`),
  createContract: (data: FeigeContractPayload) => post<number>('/feige-order-contract/contracts', data),
  updateContract: (id: number, data: FeigeContractPayload) => put<void>(`/feige-order-contract/contracts/${id}`, data),
  renewContract: (id: number, data: Record<string, any>) => post<number>(`/feige-order-contract/contracts/${id}/renewals`, data),
  terminateContract: (id: number, reason: string) => post<void>(`/feige-order-contract/contracts/${id}/terminate`, { reason }),
  restoreContract: (id: number, reason: string) => post<void>(`/feige-order-contract/contracts/${id}/restore`, { reason }),
  handoverPreview: (data: Record<string, any>) => post<FeigeContract[]>('/feige-order-contract/contracts/handover/preview', data),
  handover: (data: Record<string, any>) => post<number>('/feige-order-contract/contracts/handover', data),
  handoverHistory: () => get<FeigeContractHandover[]>('/feige-order-contract/contracts/handover/history'),
  revokeHandover: (id: number) => post<void>(`/feige-order-contract/contracts/handover/${id}/revoke`)
}
