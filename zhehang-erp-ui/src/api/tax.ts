import { get } from './request'

/** 报税日历待办行 */
export interface TaxCalendarItem {
  creditCode: string
  companyName: string
  taxpayerType?: number
  collectionType?: string
  taxAuthority?: string
  taxTypes?: string
  filingCycle?: string
  taxOfficer?: string
  month: string
  deadline: string
  status: string
}

/** 兼容请求拦截器返回「整个响应包({code,data})」或「已解包数据」两种情况 */
function unwrap<T>(res: any): T {
  return res && Object.prototype.hasOwnProperty.call(res, 'data') ? res.data : res
}

export const taxCalendarApi = {
  /** 某月各客户应申报待办（month 形如 2026-06，缺省取当月） */
  async list(month?: string): Promise<TaxCalendarItem[]> {
    const res = await get('/crm/tax-profile/calendar', month ? { month } : {}, { silentError: true })
    const data = unwrap<TaxCalendarItem[]>(res)
    return Array.isArray(data) ? data : []
  }
}
