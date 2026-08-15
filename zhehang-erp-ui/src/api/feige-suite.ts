import { del, get, post, put } from './request'

function unwrap<T>(request: Promise<any>): Promise<T> {
  return request.then((response) => {
    if (response && typeof response === 'object' && 'code' in response && 'data' in response) {
      return response.data as T
    }
    return response as T
  })
}

export interface FeigeSuiteRecord {
  id: number
  pageCode: string
  recordNo: string
  title: string
  categoryCode?: string
  status: string
  ownerId: number
  ownerName: string
  deptId?: number
  deptName?: string
  amount?: number
  bizDate?: string
  dueDate?: string
  source?: string
  sortNo?: number
  version?: number
  createTime?: string
  updateTime?: string
  data: Record<string, any>
  logs?: FeigeSuiteAuditLog[]
}

export interface FeigeSuiteAuditLog {
  id: number
  action: string
  fromStatus?: string
  toStatus?: string
  operatorName?: string
  remark?: string
  createTime?: string
}

export interface FeigeSuitePageResult {
  records: FeigeSuiteRecord[]
  total: number
  current: number
  size: number
  pages?: number
}

export interface FeigeSuiteCapabilities {
  manager: boolean
  finance: boolean
  hr: boolean
  canCreate: boolean
  canWrite: boolean
  canManage: boolean
  scope: 'visible_users' | 'shared'
}

export interface FeigeSuiteStaffOption {
  id: number
  name: string
  deptId?: number
  deptName?: string
}

export interface FeigeSuiteRecordPayload {
  title: string
  categoryCode?: string
  status?: string
  ownerId?: number
  amount?: number
  bizDate?: string
  dueDate?: string
  sortNo?: number
  version?: number
  data: Record<string, any>
}

export const feigeSuiteApi = {
  pages: () => unwrap<any[]>(get('/feige-suite/pages')),
  staffOptions: () => unwrap<FeigeSuiteStaffOption[]>(get('/feige-suite/staff-options')),
  capabilities: (pageCode: string) => unwrap<FeigeSuiteCapabilities>(get(`/feige-suite/pages/${pageCode}/capabilities`)),
  summary: (pageCode: string) => unwrap<{ total: number; statuses: Record<string, number> }>(get(`/feige-suite/pages/${pageCode}/summary`)),
  records: (pageCode: string, params: Record<string, any>) => {
    const { current, size, keyword, status, ownerId, bizDate, ...customFilters } = params
    const filters = Object.fromEntries(Object.entries(customFilters).filter(([, value]) => value !== '' && value !== null && value !== undefined))
    return unwrap<FeigeSuitePageResult>(get(`/feige-suite/pages/${pageCode}/records`, {
      pageNum: current,
      pageSize: size,
      keyword: keyword || undefined,
      status: status || undefined,
      ownerId: ownerId || undefined,
      startDate: bizDate || undefined,
      endDate: bizDate || undefined,
      filters: Object.keys(filters).length ? JSON.stringify(filters) : undefined
    }))
  },
  detail: (pageCode: string, id: number) => unwrap<FeigeSuiteRecord>(get(`/feige-suite/pages/${pageCode}/records/${id}`)),
  create: (pageCode: string, data: FeigeSuiteRecordPayload) => unwrap<number>(post(`/feige-suite/pages/${pageCode}/records`, data)),
  update: (pageCode: string, id: number, data: FeigeSuiteRecordPayload) => unwrap<void>(put(`/feige-suite/pages/${pageCode}/records/${id}`, data)),
  action: (pageCode: string, id: number, data: { action: string; remark?: string; version?: number }) => unwrap<void>(post(`/feige-suite/pages/${pageCode}/records/${id}/action`, data)),
  remove: (pageCode: string, id: number) => unwrap<void>(del(`/feige-suite/pages/${pageCode}/records/${id}`))
}
