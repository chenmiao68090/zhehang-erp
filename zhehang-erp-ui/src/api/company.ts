import { get } from './request'

/** 后端工商主体查询的统一返回结构。 */
export interface EnterpriseEntity {
  id: number
  name: string
  shortName: string
  creditCode: string
  taxNo: string
  legalPerson: string
  registeredCapital: string
  establishDate: string
  businessStatus: '营业' | '存续' | '迁出' | '注销' | '异常'
  province: string
  city: string
  district: string
  address: string
  industry: string
  companyType: string
  employeeScale: string
  annualRevenue: string
  taxQualification: string
  riskTags: string[]
  contactCount: number
  contacts: Array<{ name: string; title: string; phone: string }>
  source: string
  updateTime: string
}

/**
 * 工商企业信息查询（对接后端 /company）。
 *
 * 仅展示后端企业数据提供方返回的可核验结果；未配置真实数据源时返回空结果，
 * 不使用浏览器种子或示例公司冒充正式工商数据。
 */
export const companyApi = {
  /** 输入联想：返回候选企业 */
  suggest: (keyword: string, limit = 8) =>
    get<EnterpriseEntity[]>('/company/suggest', { keyword, limit }),

  /** 自动带出：按公司名/信用代码返回单个企业完整工商信息（无命中返回 null） */
  detail: (keyword: string) =>
    get<EnterpriseEntity | null>('/company/detail', { keyword }),

  /** 企业主体库分页 */
  list: (params: { keyword?: string; region?: string; risk?: string; pageNum?: number; pageSize?: number }) =>
    get<{ list: EnterpriseEntity[]; total: number }>('/company/list', params),

  /** 概览统计 */
  stats: () =>
    get<{ total: number; risky: number; newCompany: number; contactRich: number }>('/company/stats')
}
