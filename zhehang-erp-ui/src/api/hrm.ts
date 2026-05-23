import { get, post, put, del } from './request'

// 招聘管理
export const recruitApi = {
  list: (params: any) => get('/hrm/recruit/list', params),
  detail: (id: number) => get(`/hrm/recruit/${id}`),
  create: (data: any) => post('/hrm/recruit', data),
  update: (data: any) => put('/hrm/recruit', data),
  remove: (id: number) => del(`/hrm/recruit/${id}`),
  changeStatus: (data: { id: number; status: number }) => put('/hrm/recruit/status', data)
}

// 简历管理
export const resumeApi = {
  list: (params: any) => get('/hrm/resume/list', params),
  create: (data: any) => post('/hrm/resume', data),
  update: (data: any) => put('/hrm/resume', data),
  remove: (id: number) => del(`/hrm/resume/${id}`),
  changeStatus: (data: { id: number; status: number; evaluation?: string }) => put('/hrm/resume/status', data)
}

// 考勤管理
export const attendanceApi = {
  list: (params: any) => get('/hrm/attendance/list', params),
  clockIn: (employeeId: number) => post('/hrm/attendance/clock-in', { employeeId }),
  clockOut: (employeeId: number) => post('/hrm/attendance/clock-out', { employeeId }),
  stats: (params: { employeeId: number; month: string }) => get('/hrm/attendance/stats', params)
}

// 请假管理
export const leaveApi = {
  list: (params: any) => get('/hrm/leave/list', params),
  create: (data: any) => post('/hrm/leave', data),
  approve: (data: { id: number; approverId: number; approved: boolean }) => put('/hrm/leave/approve', data)
}

// 薪资管理
export const salaryApi = {
  list: (params: any) => get('/hrm/salary/list', params),
  create: (data: any) => post('/hrm/salary', data),
  update: (data: any) => put('/hrm/salary', data),
  calculate: (salaryMonth: string) => post('/hrm/salary/calculate', { salaryMonth }),
  pay: (salaryMonth: string) => post('/hrm/salary/pay', { salaryMonth }),
  slip: (id: number) => get(`/hrm/salary/slip/${id}`)
}

// 绩效管理
export const performanceApi = {
  list: (params: any) => get('/hrm/performance/list', params),
  create: (data: any) => post('/hrm/performance', data),
  update: (data: any) => put('/hrm/performance', data),
  remove: (id: number) => del(`/hrm/performance/${id}`),
  evaluate: (data: { id: number; selfScore: number; leaderScore: number; evaluation: string }) => put('/hrm/performance/evaluate', data),
  statistics: (params: { period?: string; type?: number }) => get('/hrm/performance/statistics', params)
}

// 培训管理
export const trainingApi = {
  list: (params: any) => get('/hrm/training/list', params),
  create: (data: any) => post('/hrm/training', data),
  update: (data: any) => put('/hrm/training', data),
  remove: (id: number) => del(`/hrm/training/${id}`),
  enroll: (data: { trainingId: number; employeeId: number }) => post('/hrm/training/enroll', data)
}