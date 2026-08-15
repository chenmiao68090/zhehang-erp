import { get } from './request'

/** 仪表盘统计数据 */
export interface DashboardStats {
  todoCount: number
  approvalCount: number
  customerFollowCount: number
  monthlyPerformance: number
}

/** 待办事项 */
export interface TodoItem {
  id: number
  title: string
  type: 'approval' | 'task' | 'follow' | 'other'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'done'
  dueDate: string
  link?: string
}

/** 通知公告 */
export interface NoticeItem {
  id: number
  title: string
  type: 'notice' | 'announcement'
  publishTime: string
  publisher: string
}

/** 获取仪表盘统计数据 */
export function getDashboardStats() {
  return get<{ data: DashboardStats }>('/dashboard/stats')
}

/** 获取待办事项列表 */
export function getTodoList(params?: { status?: string; pageNum?: number; pageSize?: number }) {
  return get<{ data: TodoItem[] }>('/dashboard/todo/list', params)
}

/** 获取最近公告 */
export function getRecentNotices() {
  return get<{ data: NoticeItem[] }>('/dashboard/notices')
}

/** 老板总控台:一次拉全部今日关键统计 + 异常清单 + 员工执行排行(仅老板/超管) */
export function getBossOverview() {
  return get<any>('/dashboard/boss/overview')
}
