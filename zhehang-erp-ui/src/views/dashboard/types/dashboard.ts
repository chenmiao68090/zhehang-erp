// === 组件类型枚举 (17种) ===
export type WidgetType =
  | 'number-card' | 'line-chart' | 'bar-chart' | 'pie-chart'
  | 'bar-horizontal' | 'scatter-chart' | 'radar-chart' | 'funnel-chart'
  | 'heat-map' | 'leaderboard' | 'progress-bar' | 'gantt-chart'
  | 'data-table' | 'map-chart' | 'rich-text' | 'filter' | 'image'

// === 数据源相关 ===
export interface DataSource {
  id: string
  name: string
  type: 'table' | 'api' | 'sql'
  tableName?: string
  apiEndpoint?: string
  sql?: string
  fields: DataField[]
}

export interface DataField {
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  enumValues?: { label: string; value: string }[]
  aggregations: AggregationType[]
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'distinct_count' | 'none'

// === 筛选条件 ===
export interface FilterCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'like' | 'between' | 'is_null'
  value: any
}

// === 指标配置 ===
export interface MetricConfig {
  field: string
  aggregation: AggregationType
  alias?: string
  format?: string  // 数字格式 如 '0,0.00'
  color?: string
}

// === 组件样式 ===
export interface WidgetStyle {
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  padding?: number
  titleColor?: string
  titleFontSize?: number
  showTitle?: boolean
  showBorder?: boolean
  showShadow?: boolean
}

// === 组件配置（核心） ===
export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  subtitle?: string
  dataSourceId: string
  filters: FilterCondition[]
  dimensions: string[]
  metrics: MetricConfig[]
  layout: WidgetLayout
  style: WidgetStyle
  options: Record<string, any>  // 组件特有配置
}

export interface WidgetLayout {
  x: number   // 栅格列位置 (0-23)
  y: number   // 行位置
  w: number   // 宽度（列数）
  h: number   // 高度（行数）
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

// === 驾驶舱配置 ===
export interface DashboardConfig {
  id: string
  name: string
  description?: string
  widgets: WidgetConfig[]
  theme: 'dark' | 'light'
  gridColumns: number  // 24
  refreshInterval?: number  // 秒
  createdAt: string
  updatedAt: string
  createdBy: string
  shared?: ShareConfig
}

export interface ShareConfig {
  enabled: boolean
  token?: string
  permission: 'view' | 'edit'
  expireAt?: string
}

// === 模板 ===
export type TemplateCategory = 'sales' | 'acquisition' | 'customer' | 'finance' | 'call-center'

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  thumbnail?: string
  widgets: Omit<WidgetConfig, 'id'>[]
  theme: 'dark' | 'light'
}

// === 数据查询 ===
export interface DataQueryRequest {
  dataSourceId: string
  dimensions: string[]
  metrics: MetricConfig[]
  filters: FilterCondition[]
  orderBy?: { field: string; direction: 'asc' | 'desc' }[]
  limit?: number
  offset?: number
}

export interface DataQueryResponse {
  columns: { name: string; type: string }[]
  rows: Record<string, any>[]
  total: number
  cached: boolean
  queryTime: number
}

// === 组件注册表 ===
export interface WidgetRegistryItem {
  type: WidgetType
  name: string
  icon: string
  category: 'chart' | 'data' | 'filter' | 'widget'
  description: string
  defaultW: number
  defaultH: number
  minW: number
  minH: number
  maxW?: number
  maxH?: number
}

// === 刷新策略 ===
export type RefreshStrategy = 'realtime' | 'near-realtime' | 'scheduled' | 'manual'

export interface RefreshConfig {
  strategy: RefreshStrategy
  interval?: number  // 秒
  wsEndpoint?: string
}
