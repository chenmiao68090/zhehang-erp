import { get, post } from './request'

export type ReviewStatus =
  | 'ACCEPT_PENDING'
  | 'ACCEPT_REJECTED'
  | 'PROCESSING'
  | 'COMPLETE_PENDING'
  | 'COMPLETE_REJECTED'
  | 'COMPLETED'
  | 'VOIDED'

export interface OrderReview {
  id: number
  reviewNo?: string
  orderType?: string
  orderId?: number
  orderNo?: string
  customerId?: number
  customerName?: string
  businessType?: string
  receivableAmount?: number
  receivedAmount?: number
  salesUserId?: number
  salesName?: string
  handlerUserId?: number
  handlerName?: string
  deptId?: number
  currentNode?: string
  reviewStatus: ReviewStatus | string
  deadline?: string
  submittedAt?: string
  completedAt?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface ReviewRecord {
  id: number
  nodeCode?: string
  nodeName?: string
  action?: string
  result?: string
  operatorId?: number
  operatorName?: string
  opinion?: string
  attachments?: string
  beforeStatus?: string
  afterStatus?: string
  operatedAt?: string
}

export interface ReviewAttachment {
  id: number
  name: string
  mimeType?: string
  size?: number
}

export interface OrderReviewDetail {
  review: OrderReview
  contract?: Record<string, any>
  payment?: Record<string, any>
  accept?: Record<string, any>
  complete?: Record<string, any>
  records: ReviewRecord[]
}

export interface ReviewStats {
  total: number
  pendingContract?: number
  pendingPayment?: number
  pendingAssign: number
  pendingAccept: number
  processing: number
  pendingConfirm: number
  completed: number
  rejected: number
  overdue: number
}

export interface ReviewPage {
  list: OrderReview[]
  total: number
}

function unwrap<T>(response: any): T {
  if (response && typeof response === 'object' && 'code' in response && 'data' in response) {
    return response.data as T
  }
  return response as T
}

export const orderReviewApi = {
  async list(params: { pageNum?: number; pageSize?: number; status?: string; keyword?: string }): Promise<ReviewPage> {
    const data = unwrap<any>(await get('/order/review/list', params))
    const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data?.list) ? data.list : [])
    return { list, total: Number(data?.total || list.length || 0) }
  },
  async stats(): Promise<ReviewStats> {
    return unwrap<ReviewStats>(await get('/order/review/stats'))
  },
  async detail(id: number): Promise<OrderReviewDetail> {
    return unwrap<OrderReviewDetail>(await get(`/order/review/${id}`))
  },
  downloadAttachment(id: number, fileId: number) {
    return get(`/order/review/${id}/attachments/${fileId}`, undefined, { responseType: 'blob', silentError: true })
  },
  /** 合同审理(部门主管):提单类审核单的第一个真人节点 */
  contractReview(id: number, data: { pass: boolean; opinion?: string }) {
    return post(`/order/review/${id}/contract/review`, data)
  },
  /** 到款确认(财务):提单类审核单的第二个真人节点 */
  paymentReview(id: number, data: { pass: boolean; opinion?: string }) {
    return post(`/order/review/${id}/payment/review`, data)
  },
  assignHandler(id: number, data: { handlerUserId: number; deadline: string; remark?: string }) {
    return post(`/order/review/${id}/assign-handler`, data)
  },
  accept(id: number, data: { materialsReady: boolean; expectedCompleteTime?: string; remark?: string }) {
    return post(`/order/review/${id}/accept`, data)
  },
  submitComplete(id: number, data: { resultDesc: string; attachments: ReviewAttachment[]; remark?: string }) {
    return post(`/order/review/${id}/complete/submit`, data)
  },
  confirmComplete(id: number, data: { pass: boolean; opinion?: string }) {
    return post(`/order/review/${id}/complete/confirm`, data)
  }
}
