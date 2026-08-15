import { get, post, del } from './request'

/** 服务单位收款详情行 */
export interface CollectItem {
  collectType?: string   // 收款类型
  account?: string       // 收款账户
  collectDate?: string   // 收款日期
  orderNo?: string       // 客户单号/付款单号
}
/** 付款单位信息行 */
export interface PayerUnit {
  companyName?: string   // 企业名称
  contactName?: string   // 对接人姓名
  contactPhone?: string  // 对接人号码
}
/** 服务事项收款明细行 */
export interface ServiceItem {
  serviceMatter?: string // 服务事项
  contractStart?: string // 合同开始
  contractEnd?: string   // 合同结束
  serviceDays?: number   // 服务时长天
  amount?: number        // 收款金额
}
/** 尾款情况行 */
export interface BalanceItem {
  matter?: string        // 尾款事项
  amount?: number        // 尾款金额
}

/** 地址业务报单 */
export interface AddressOrder {
  id?: number
  companyName?: string
  customerSource?: string
  /** @deprecated 旧字段仅用于历史接口兼容，地址报单页面不再录入或回传。 */
  registerType?: string
  addressType?: string
  companyAddress?: string
  legalName?: string
  legalPhone?: string
  legalIdCard?: string
  stewardId?: number
  stewardName?: string
  salesId?: number
  salesName?: string
  /** @deprecated 合同日期以contractStart/contractEnd为准，页面不再维护所属年月。 */
  bizYear?: number
  /** @deprecated 收款日期以collectItems各行日期为准，页面不再维护所属年月。 */
  bizMonth?: number
  contractStart?: string
  contractEnd?: string
  payCycle?: string
  giftMonths?: number
  hasRebate?: number
  rebateRecipient?: string
  rebateAlipayQrFileId?: number
  /** 4 个子表:后端为 JSON 字符串,前端存取时序列化/反序列化 */
  collectItems?: string
  payerUnits?: string
  serviceItems?: string
  balanceItems?: string
  collectTotal?: number
  status?: string
  remark?: string
  createTime?: string
}

/** 选人下拉:同事(已开通账号员工) */
export interface Colleague {
  userId: number
  name: string
  deptName?: string
}

export const addressOrderApi = {
  list: (params?: any) => get('/order/address-order/list', params),
  detail: (id: number) => get(`/order/address-order/${id}`),
  rebate: (id: number) => get(`/order/address-order/${id}/rebate`),
  save: (data: any) => post('/order/address-order', data),
  submit: (id: number) => post(`/order/address-order/${id}/submit`),
  remove: (id: number) => del(`/order/address-order/${id}`),
  colleagues: () => get('/order/address-order/colleagues')
}
