import { get, post, put, del } from './request'

// ==================== 类型定义 ====================

/** 字段配置 */
export interface FieldConfig {
  options?: string[]
  precision?: number
  linkedTableId?: number
  formula?: string
  [key: string]: any
}

/** 字段定义 */
export interface FieldDef {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'attachment' | 'user' | 'link' | 'formula'
  config: FieldConfig
}

/** 筛选条件 */
export interface FilterCondition {
  fieldId: string
  operator: string
  value: any
}

/** 排序条件 */
export interface SortCondition {
  fieldId: string
  direction: 'asc' | 'desc'
}

/** 视图定义 */
export interface ViewDef {
  id: string
  name: string
  type: 'grid' | 'kanban' | 'gantt' | 'calendar' | 'gallery'
  filterConfig: FilterCondition[]
  sortConfig: SortCondition[]
  groupBy: string
}

/** 多维表格 */
export interface MultidimTable {
  id: number
  name: string
  description: string
  icon: string
  category: string
  fieldSchema: string
  viewConfig: string
  templateId: number | null
  createTime: string
  updateTime: string
  createBy: number
  updateBy: number
}

/** 多维表格记录 */
export interface MultidimRecord {
  id: number
  tableId: number
  data: string
  createTime: string
  updateTime: string
}

/** 多维表格模板 */
export interface MultidimTemplate {
  id: number
  name: string
  category: string
  icon: string
  description: string
  fieldSchema: string
  viewConfig: string
}

/** 记录查询参数 */
export interface RecordQueryDTO {
  tableId: number
  viewId?: string
  filters?: FilterCondition[]
  sorts?: SortCondition[]
  pageNum?: number
  pageSize?: number
  keyword?: string
}

// ==================== API 接口 ====================

// 表格管理
export const tableApi = {
  list: (params: any) => get('/multidim/table/list', params),
  detail: (id: number) => get(`/multidim/table/${id}`),
  create: (data: Partial<MultidimTable>) => post('/multidim/table', data),
  update: (data: Partial<MultidimTable>) => put('/multidim/table', data),
  remove: (id: number) => del(`/multidim/table/${id}`),
  createFromTemplate: (templateId: number, name?: string) =>
    post('/multidim/table/fromTemplate', { templateId, name }),
  copy: (id: number) => post(`/multidim/table/copy/${id}`),
  // 字段管理
  addField: (tableId: number, field: FieldDef) =>
    post(`/multidim/table/${tableId}/field`, field),
  updateField: (tableId: number, field: FieldDef) =>
    put(`/multidim/table/${tableId}/field`, field),
  deleteField: (tableId: number, fieldId: string) =>
    del(`/multidim/table/${tableId}/field/${fieldId}`),
  // 视图管理
  addView: (tableId: number, view: ViewDef) =>
    post(`/multidim/table/${tableId}/view`, view),
  updateView: (tableId: number, view: ViewDef) =>
    put(`/multidim/table/${tableId}/view`, view),
  deleteView: (tableId: number, viewId: string) =>
    del(`/multidim/table/${tableId}/view/${viewId}`)
}

// 记录管理
export const recordApi = {
  query: (data: RecordQueryDTO) => post('/multidim/record/query', data),
  detail: (id: number) => get(`/multidim/record/${id}`),
  create: (data: Partial<MultidimRecord>) => post('/multidim/record', data),
  update: (data: Partial<MultidimRecord>) => put('/multidim/record', data),
  remove: (id: number) => del(`/multidim/record/${id}`),
  batchDelete: (ids: number[]) => post('/multidim/record/batchDelete', ids)
}

// 模板管理
export const templateApi = {
  list: (category?: string) => get('/multidim/template/list', { category }),
  detail: (id: number) => get(`/multidim/template/${id}`)
}
