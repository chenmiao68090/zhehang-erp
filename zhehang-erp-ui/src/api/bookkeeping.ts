import { get, post, del } from './request'

/** 代理记账提单 */
export interface BookkeepingOrder {
  id?: number
  leadId?: number
  companyName?: string
  contactName?: string
  phone?: string
  creditCode?: string
  contractAmount?: number
  serviceStart?: string
  serviceEnd?: string
  signDate?: string
  payMethod?: string
  serviceContent?: string
  /** 合同附件 JSON 字符串:[{name,url,fileId}] */
  contractFile?: string
  status?: string
  remark?: string
  /** 公司性质(6 项固定下拉) */
  companyNature?: string
  /** 合作周期(一年/多年) */
  coopPeriod?: string
  /** 合作开始时间 */
  coopStart?: string
  /** 合作到期时间 */
  coopEnd?: string
  /** 注册地址 */
  regAddress?: string
  /** 注册地址归属(客户/公司) */
  regAddressOwner?: string
  /** 代账金额 */
  bookkeepingAmount?: number
  /** 特殊备注 */
  specialRemark?: string
  createTime?: string
}

export const bookkeepingApi = {
  list: (params?: any) => get('/bookkeeping-order/list', params),
  save: (data: any) => post('/bookkeeping-order', data),
  remove: (id: number) => del(`/bookkeeping-order/${id}`),
  /** 提交审核:进审单中心「合同审理」节点,提单锁定为审核中 */
  submitReview: (id: number) => post(`/bookkeeping-order/${id}/submit-review`)
}
