import { get, post, put } from './request'

/** 客户问题工单 */
export interface CustomerIssue {
  id?: number | string
  issueNo?: string
  customerId?: number
  customerName?: string
  source?: string
  issueType?: string
  priority?: string
  description?: string
  ownerId?: number
  ownerName?: string
  assistId?: number
  assistName?: string
  deptId?: number
  deadline?: string
  status?: string
  result?: string
  resolveTime?: string
  bossInvolved?: number
  needReview?: number
  reviewNote?: string
  createBy?: number
  createTime?: string
  _saving?: boolean
}

/** 工单流转记录 */
export interface CustomerIssueLog {
  id?: number
  issueId?: number
  action?: string
  fromStatus?: string
  toStatus?: string
  operatorId?: number
  operatorName?: string
  remark?: string
  createTime?: string
}

export const customerIssueApi = {
  list: (params: any) => get('/crm/issue/list', params),
  detail: (id: number | string) => get(`/crm/issue/${id}`),
  stats: () => get('/crm/issue/stats'),
  create: (data: CustomerIssue) => post('/crm/issue', data),
  createFromMessage: (data: {
    messageId: number
    description: string
    ownerId: number
    deadline: string
    priority?: string
    issueType?: string
    customerId?: number
    customerName?: string
  }) => post('/crm/issue/from-message', data),
  update: (data: CustomerIssue) => put('/crm/issue', data),
  assign: (
    id: number | string,
    data: { ownerId?: number; ownerName?: string; assistId?: number; assistName?: string }
  ) => post(`/crm/issue/${id}/assign`, data),
  changeStatus: (id: number | string, data: { status: string; result?: string; remark?: string }) =>
    post(`/crm/issue/${id}/status`, data),
  close: (id: number | string, data?: { remark?: string }) => post(`/crm/issue/${id}/close`, data || {})
}

/** 员工候选(给工单选负责人/协助人用,免 system:user:list 权限,返回 [{id,name,phone}]) */
export const staffCandidatesApi = (): Promise<Array<{ id: number; name: string; phone?: string }>> =>
  get('/crm/yunke/staff-candidates')
