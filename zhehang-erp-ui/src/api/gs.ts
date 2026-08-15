import { get, post, put, del } from './request'

/** 工商业务·工商订单与办理进度 */
export interface GsOrder {
  id?: number | string
  companyName?: string
  businessType?: string
  businessItems?: string
  businessItemRemark?: string
  customer?: string
  phone?: string
  legalPhone?: string
  recipient?: string
  recipientPhone?: string
  recipientAddress?: string
  handler?: string
  /** 分配的办事员 userId */
  assigneeId?: number | string | null
  /** 办事员姓名(后端列表回显,只读) */
  assigneeName?: string
  fee?: number
  receivedDate?: string
  deadline?: string
  status?: string
  progressNote?: string
  remark?: string
  /** 备注2 */
  remark2?: string
  /** 客户资料(法人身份证/其他附件)JSON:{key:{fileId,fileName}} */
  documents?: string
  createTime?: string
  updateTime?: string
}

/** 可分配的办事员(已开通账号的员工) */
export interface GsColleague {
  userId: number | string
  name: string
  deptName?: string
}

export const gsOrderApi = {
  list: (params: any) => get('/gs/order/list', params),
  create: (data: GsOrder) => post('/gs/order', data),
  update: (data: GsOrder) => put('/gs/order', data),
  updateProgress: (id: number | string, status: string, progressNote: string) =>
    post('/gs/order/progress', { id, status, progressNote }),
  remove: (id: number | string) => del(`/gs/order/${id}`),
  /** 当前登录人是否为「分配人」视角(工商主管/管理员) */
  isAssigner: () => get('/gs/order/is-assigner'),
  /** 可分配的办事员列表 */
  colleagues: () => get('/gs/order/colleagues'),
  /** 审核工单:pass=true 通过(→待分配) / false 驳回 */
  review: (id: number | string, pass: boolean, progressNote?: string) =>
    post('/gs/order/review', { id, pass, progressNote }),
  /** 分配办事员:设 assigneeId + 置办理中 */
  assign: (id: number | string, assigneeId: number | string, handler?: string) =>
    post('/gs/order/assign', { id, assigneeId, handler })
}
