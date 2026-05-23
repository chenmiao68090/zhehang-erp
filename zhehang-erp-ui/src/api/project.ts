import { get, post, put, del } from './request'

// 项目管理
export const projectApi = {
  list: (params: any) => get('/project/list', params),
  detail: (id: number) => get(`/project/${id}`),
  create: (data: any) => post('/project', data),
  update: (data: any) => put('/project', data),
  remove: (id: number) => del(`/project/${id}`),
  templates: () => get('/project/templates'),
  stats: (projectId: number) => get(`/project/stats/${projectId}`)
}

// 任务管理
export const taskApi = {
  tree: (projectId: number) => get('/project/task/tree', { projectId }),
  gantt: (projectId: number) => get('/project/task/gantt', { projectId }),
  board: (projectId: number) => get('/project/task/board', { projectId }),
  detail: (id: number) => get(`/project/task/${id}`),
  create: (data: any) => post('/project/task', data),
  update: (data: any) => put('/project/task', data),
  remove: (id: number) => del(`/project/task/${id}`),
  changeStatus: (id: number, status: number) => put('/project/task/status', { id, status })
}

// 里程碑
export const milestoneApi = {
  list: (projectId: number) => get('/project/milestone/list', { projectId }),
  create: (data: any) => post('/project/milestone', data),
  update: (data: any) => put('/project/milestone', data),
  remove: (id: number) => del(`/project/milestone/${id}`)
}

// 工时记录
export const timesheetApi = {
  list: (params: any) => get('/project/timesheet/list', params),
  create: (data: any) => post('/project/timesheet', data),
  update: (data: any) => put('/project/timesheet', data),
  remove: (id: number) => del(`/project/timesheet/${id}`),
  stats: (projectId: number) => get('/project/timesheet/stats', { projectId })
}

// 项目文档
export const docApi = {
  list: (projectId: number) => get('/project/doc/list', { projectId }),
  create: (data: any) => post('/project/doc', data),
  remove: (id: number) => del(`/project/doc/${id}`)
}
