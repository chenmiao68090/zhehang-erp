import { get, post, put, del } from './request'

// ==================== 类型定义 ====================

export interface ReportDefinition {
  id?: number
  name: string
  category: string
  type: 'table' | 'chart' | 'dashboard'
  dataSourceType: 'sql' | 'preset'
  sqlQuery?: string
  chartConfig?: string
  filterConfig?: string
  permissionType: 'public' | 'private' | 'role'
  status: number
  description?: string
  createTime?: string
  updateTime?: string
  createBy?: number
}

export interface ReportDataset {
  id?: number
  reportId: number
  datasetName: string
  dataSource: string
  queryConfig?: string
  description?: string
}

export interface ReportSchedule {
  id?: number
  reportId: number
  cronExpression: string
  recipients: string
  channel: 'email' | 'sms' | 'im'
  status: number
  description?: string
}

export interface ChartConfig {
  title?: string
  chartType: 'line' | 'bar' | 'pie' | 'table' | 'funnel' | 'radar' | 'kpi'
  dimensions?: string[]
  metrics?: string[]
  colors?: string[]
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  xAxis?: string
  yAxis?: string
}

export interface FilterConfig {
  filters: FilterItem[]
}

export interface FilterItem {
  field: string
  label: string
  type: 'dateRange' | 'select' | 'text'
  options?: { label: string; value: string }[]
  defaultValue?: any
}

// ==================== 报表定义接口 ====================
export const reportDefinitionApi = {
  list: (params: any) => get('/report/definition/list', params),
  detail: (id: number) => get(`/report/definition/${id}`),
  create: (data: ReportDefinition) => post('/report/definition', data),
  update: (data: ReportDefinition) => put('/report/definition', data),
  remove: (id: number) => del(`/report/definition/${id}`),
  copy: (id: number) => post(`/report/definition/copy/${id}`),
  listByCategory: (category?: string) => get('/report/definition/category', { category })
}

// ==================== 报表数据接口 ====================
export const reportDataApi = {
  execute: (reportId: number, params?: any) => get(`/report/data/execute/${reportId}`, params),
  listDatasets: (reportId: number) => get(`/report/data/dataset/${reportId}`),
  addDataset: (data: ReportDataset) => post('/report/data/dataset', data),
  updateDataset: (data: ReportDataset) => put('/report/data/dataset', data),
  removeDataset: (id: number) => del(`/report/data/dataset/${id}`)
}

// ==================== 报表订阅接口 ====================
export const reportScheduleApi = {
  list: (reportId: number) => get(`/report/schedule/${reportId}`),
  create: (data: ReportSchedule) => post('/report/schedule', data),
  update: (data: ReportSchedule) => put('/report/schedule', data),
  remove: (id: number) => del(`/report/schedule/${id}`)
}
