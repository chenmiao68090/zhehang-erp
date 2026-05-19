import { get, post, put, del } from './request'

export interface OpenapiApp {
  id?: number
  appName: string
  appKey?: string
  appSecret?: string
  description?: string
  scopes?: string
  rateLimit?: number
  status?: number
  createTime?: string
}

export interface OpenapiStats {
  appCount: number
  todayCalls: number
}

export const openapiApi = {
  // 应用列表（分页）
  list: (params: { pageNum?: number; pageSize?: number; appName?: string }) =>
    get('/system/openapi/app/list', params),

  // 创建应用
  create: (data: OpenapiApp) => post<OpenapiApp>('/system/openapi/app', data),

  // 更新应用
  update: (id: number, data: OpenapiApp) => put('/system/openapi/app/' + id, data),

  // 删除应用
  remove: (id: number) => del('/system/openapi/app/' + id),

  // 重置密钥
  resetSecret: (id: number) => post<string>('/system/openapi/app/' + id + '/reset-secret'),

  // 启用/禁用
  changeStatus: (id: number, status: number) =>
    put('/system/openapi/app/' + id + '/status', { status }),

  // 统计概览
  stats: () => get<OpenapiStats>('/system/openapi/app/stats')
}
