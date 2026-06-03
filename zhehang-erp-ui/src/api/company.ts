import { get } from './request'
import type { EnterpriseEntity } from './growth'

/**
 * 工商企业信息查询（对接后端 /company）。
 *
 * 后端默认使用内置示例库（免密钥、可演示），未来可切换天眼查/企查查等真实接口，
 * 前端调用方式不变。返回结构与 EnterpriseEntity 对齐，便于「填公司名自动带出工商信息」。
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
