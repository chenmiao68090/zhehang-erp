import { get, post, put, del } from './request'

export interface DashboardMemo {
  id?: number
  content: string
  remindTime?: string
  priority?: number
  category?: string
  completed?: boolean
  completedTime?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface MemoSummary {
  pending: number
  today: number
  doneToday: number
  overdue: number
}

export const memoApi = {
  list: (params?: { scope?: 'home' | 'today' | 'week' | 'all'; completed?: boolean; keyword?: string; limit?: number }) =>
    get('/dashboard/memo/list', params),
  summary: () => get('/dashboard/memo/summary'),
  create: (data: DashboardMemo) => post('/dashboard/memo', data),
  update: (data: DashboardMemo) => put('/dashboard/memo', data),
  complete: (id: number, completed: boolean) => put(`/dashboard/memo/${id}/complete`, { completed }),
  remove: (id: number) => del(`/dashboard/memo/${id}`)
}
