import { get, post, put, del } from './request'

// User Management
export const userApi = {
  list: (params: any) => get('/system/user/list', params),
  detail: (id: number) => get(`/system/user/${id}`),
  create: (data: any) => post('/system/user', data),
  update: (data: any) => put('/system/user', data),
  remove: (id: number) => del(`/system/user/${id}`),
  resetPwd: (data: { userId: number; newPassword: string }) => put('/system/user/resetPwd', null, { params: data }),
  changeStatus: (data: { userId: number; status: number }) => put('/system/user/status', null, { params: data }),
  export: (params: any) => get('/system/user/export', params, { responseType: 'blob' })
}

// Role Management
export const roleApi = {
  list: (params: any) => get('/system/role/list', params),
  detail: (id: number) => get(`/system/role/${id}`),
  create: (data: any) => post('/system/role', data),
  update: (data: any) => put('/system/role', data),
  remove: (id: number) => del(`/system/role/${id}`),
  assignMenus: (roleId: number, menuIds: number[]) => put(`/system/role/${roleId}/menus`, menuIds),
  dataScope: (data: any) => put('/system/role/dataScope', data),
  all: () => get<any>('/system/role/all')
}

// Menu Management
export const menuApi = {
  list: (params?: any) => get('/system/menu/list', params),
  detail: (id: number) => get(`/system/menu/${id}`),
  create: (data: any) => post('/system/menu', data),
  update: (data: any) => put('/system/menu', data),
  remove: (id: number) => del(`/system/menu/${id}`),
  treeselect: () => get('/system/menu/tree'),
  roleMenuTreeselect: (roleId: number) => get(`/system/menu/tree/role/${roleId}`)
}

// Department Tree
export const deptApi = {
  treeselect: () => get('/org/dept/tree')
}

// Login Log
export const loginLogApi = {
  list: (params: any) => get('/system/log/login/list', params),
  clean: () => del('/system/log/login/clean'),
  export: (params: any) => get('/system/log/login/export', params, { responseType: 'blob' })
}

// Operation Log
export const operLogApi = {
  list: (params: any) => get('/system/log/oper/list', params),
  detail: (id: number) => get(`/system/log/oper/${id}`),
  clean: () => del('/system/log/oper/clean'),
  export: (params: any) => get('/system/log/oper/export', params, { responseType: 'blob' })
}
