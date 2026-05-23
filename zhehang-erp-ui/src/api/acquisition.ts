import { get, post, del } from './request'

// acquisition 模块统一使用静默配置：API 失败时不弹出全局错误提示，便于页面降级到 mock 数据
const SILENT = { silent: true }

// 企业相关API
export const enterpriseApi = {
  // 企业分页列表
  list: (params: any) => get('/acquisition/enterprise/list', params, SILENT),
  // 各Tab统计数量
  stats: (params?: any) => get('/acquisition/enterprise/stats', params, SILENT),
  // 企业详情
  detail: (id: number | string) => get(`/acquisition/enterprise/${id}`, undefined, SILENT),
  // 批量解锁联系方式
  batchUnlock: (data: { enterpriseIds: number[] }) => post('/acquisition/enterprise/batch-unlock', data, SILENT),
  // 批量添加到CRM
  batchAddCrm: (data: { enterpriseIds: number[]; crmType: string; ownerId?: number }) => post('/acquisition/enterprise/batch-add-crm', data, SILENT),
  // 导出
  exportExcel: (data: any) => post('/acquisition/enterprise/export', data, SILENT)
}

// 客群相关API
export const segmentApi = {
  // 客群列表
  list: () => get('/acquisition/segment/list', undefined, SILENT),
  // 按客群获取企业
  enterprises: (code: string, params: any) => get(`/acquisition/segment/${code}/enterprises`, params, SILENT)
}

// 筛选方案API
export const filterTemplateApi = {
  // 获取筛选方案列表
  list: () => get('/acquisition/filter-template/list', undefined, SILENT),
  // 保存筛选方案
  save: (data: { templateName: string; templateDesc?: string; filterConditions: any }) => post('/acquisition/filter-template', data, SILENT),
  // 删除筛选方案
  remove: (id: number | string) => del(`/acquisition/filter-template/${id}`, SILENT)
}
