// ===== 地址资源总览 API（只读聚合，后端 modules/channel 下 /address-overview） =====
// 数据源：挂靠地址资源表 biz_address_resource，以 region（所属区域）为行政区维度。
// request.ts 的响应拦截器已解开 R 信封，get() 直接 resolve 出 data 载荷。

import { get } from './request'

/** 按行政区分组的数量条目 */
export interface AreaCount {
  area: string
  count: number
}

/** 地址清单行（字段与后端 /address-overview/list 返回一致） */
export interface OverviewAddressRow {
  id: number
  resourceNo?: string
  address?: string
  region?: string
  status?: string
  supplierId?: number
  customerId?: number
  contractId?: number
  purchasePrice?: number
  suggestedPrice?: number
  stockInDate?: string
  soldDate?: string
  expireDate?: string
  createTime?: string
}

/** 汇总统计 */
export interface OverviewSummary {
  total: number
  available: number
  used: number
  reserved: number
  sold: number
  expired: number
  abnormal: number
  statusCount: Record<string, number>
}

export const addressOverviewApi = {
  /** GET /address-overview/by-area —— 按行政区分组统计 */
  byArea: () => get<AreaCount[]>('/address-overview/by-area'),

  /** GET /address-overview/list?area=&status= —— 某行政区地址清单 */
  list: (params: { area?: string; status?: string } = {}) =>
    get<OverviewAddressRow[]>('/address-overview/list', params),

  /** GET /address-overview/summary —— 地址总量/已用/空闲等汇总 */
  summary: () => get<OverviewSummary>('/address-overview/summary')
}
