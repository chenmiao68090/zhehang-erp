import { get, post } from './request'

/** 刻章客户自助·公开提交字段(仅客户可见的基本信息) */
export interface SealPublicForm {
  companyName?: string
  legalPerson?: string
  phone?: string
  sealStatus?: string
  recordStatus?: string
  sealCity?: string
  sealMaterial?: string
  sealTypes?: string
  recipient?: string
  address?: string
  remark?: string
}

/** 自助表单下拉选项 */
export interface SealPublicOptions {
  sealStatuses: string[]
  recordStatuses: string[]
  sealCities: string[]
  sealMaterials: string[]
  sealTypes: string[]
}

export const sealPublicApi = {
  /** 凭24小时安全票据获取刻章自助表单选项 */
  options: (token: string) => get('/seal/public/options', undefined, publicTicketConfig(token)),
  /** 凭一次性安全票据提交基本信息并生成刻章提单草稿 */
  submit: (token: string, data: SealPublicForm) => post('/seal/public/submit', data, publicTicketConfig(token))
}

/** 票据走请求头，避免出现在服务端/Nginx访问日志；公开页失败自行展示，不跳后台登录。 */
function publicTicketConfig(token: string) {
  return {
    headers: { 'X-Seal-Ticket': token },
    silentError: true,
    skipAuthRedirect: true
  }
}
