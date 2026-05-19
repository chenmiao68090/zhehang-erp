import { get, post, put, del } from './request'

// 部门管理
export const deptApi = {
  tree: () => get('/org/dept/tree'),
  detail: (id: number) => get(`/org/dept/${id}`),
  create: (data: any) => post('/org/dept', data),
  update: (data: any) => put('/org/dept', data),
  remove: (id: number) => del(`/org/dept/${id}`)
}

// 岗位管理
export const postApi = {
  list: (params: any) => get('/org/post/list', params),
  all: () => get('/org/post/all'),
  detail: (id: number) => get(`/org/post/${id}`),
  create: (data: any) => post('/org/post', data),
  update: (data: any) => put('/org/post', data),
  remove: (id: number) => del(`/org/post/${id}`)
}

// 员工管理
export const employeeApi = {
  list: (params: any) => get('/org/employee/list', params),
  detail: (id: number) => get(`/org/employee/${id}`),
  create: (data: any) => post('/org/employee', data),
  update: (data: any) => put('/org/employee', data),
  remove: (id: number) => del(`/org/employee/${id}`)
}

// 异动管理
export const transferApi = {
  list: (params: any) => get('/org/transfer/list', params),
  create: (data: any) => post('/org/transfer', data),
  approve: (data: any) => put('/org/transfer/approve', data)
}

// 组织架构
export const structureApi = {
  tree: () => get('/org/structure/tree')
}
