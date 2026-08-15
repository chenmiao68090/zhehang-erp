import { get, post, del } from './request'

export interface DailyReport {
  id: number
  reportDate: string
  todayWork: string
  tomorrowPlan: string
}

export const dailyReportApi = {
  /** 我的日报(最近30条) */
  list: () => get('/dashboard/daily-report/list'),
  /** 新增日报(ccUserIds:逗号分隔的 userId,可选) */
  create: (data: { reportDate: string; todayWork: string; tomorrowPlan: string; ccUserIds?: string }) =>
    post('/dashboard/daily-report', data),
  /** 删除自己的日报 */
  remove: (id: number) => del(`/dashboard/daily-report/${id}`),
  /** 可抄送的同事列表(已开通账号的员工) */
  colleagues: () => get('/dashboard/daily-report/colleagues'),
  /** 抄送给我的日报(含作者姓名) */
  ccToMe: () => get('/dashboard/daily-report/cc-to-me')
}
