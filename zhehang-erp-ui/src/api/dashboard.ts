import { get, post, put, del } from './request'
import type {
  DashboardConfig,
  WidgetConfig,
  DataQueryRequest,
  DataQueryResponse,
  DataSource,
  DataField,
  DashboardTemplate
} from '@/views/dashboard/types/dashboard'

// ===================== 驾驶舱 CRUD =====================

export function getDashboardList(params?: { page?: number; size?: number; keyword?: string }) {
  return get<{ data: DashboardConfig[]; total: number }>('/api/v1/dashboards', params)
}

export function createDashboard(data: Partial<DashboardConfig>) {
  return post<{ data: DashboardConfig }>('/api/v1/dashboards', data)
}

export function getDashboard(id: string) {
  return get<{ data: DashboardConfig }>(`/api/v1/dashboards/${id}`)
}

export function updateDashboard(id: string, data: Partial<DashboardConfig>) {
  return put<{ data: DashboardConfig }>(`/api/v1/dashboards/${id}`, data)
}

export function deleteDashboard(id: string) {
  return del(`/api/v1/dashboards/${id}`)
}

export function cloneDashboard(id: string) {
  return post<{ data: DashboardConfig }>(`/api/v1/dashboards/${id}/clone`)
}

// ===================== 组件操作 =====================

export function addWidget(dashboardId: string, widget: Omit<WidgetConfig, 'id'>) {
  return post<{ data: WidgetConfig }>(`/api/v1/dashboards/${dashboardId}/widgets`, widget)
}

export function updateWidget(dashboardId: string, widgetId: string, data: Partial<WidgetConfig>) {
  return put<{ data: WidgetConfig }>(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`, data)
}

export function deleteWidget(dashboardId: string, widgetId: string) {
  return del(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`)
}

export function reorderWidgets(dashboardId: string, widgetIds: string[]) {
  return post(`/api/v1/dashboards/${dashboardId}/widgets/reorder`, { widgetIds })
}

// ===================== 数据查询 =====================

export function queryData(data: DataQueryRequest) {
  return post<{ data: DataQueryResponse }>('/api/v1/dashboards/query', data)
}

export function queryWidgetData(dashboardId: string, widgetId: string) {
  return post<{ data: DataQueryResponse }>(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}/data`)
}

// ===================== 数据源 =====================

export function getDataSources() {
  return get<{ data: DataSource[] }>('/api/v1/dashboards/data-sources')
}

export function getDataSourceFields(dataSourceId: string) {
  return get<{ data: DataField[] }>(`/api/v1/dashboards/data-sources/${dataSourceId}/fields`)
}

// ===================== 模板 =====================

export function getTemplates(params?: { category?: string }) {
  return get<{ data: DashboardTemplate[] }>('/api/v1/dashboards/templates', params)
}

export function createFromTemplate(templateId: string, name: string) {
  return post<{ data: DashboardConfig }>('/api/v1/dashboards/from-template', { templateId, name })
}

// ===================== 分享 =====================

export function shareDashboard(id: string, data: { permission: 'view' | 'edit'; expireAt?: string }) {
  return post<{ data: { token: string } }>(`/api/v1/dashboards/${id}/share`, data)
}

export function unshareDashboard(id: string) {
  return del(`/api/v1/dashboards/${id}/share`)
}
