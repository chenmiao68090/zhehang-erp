import { get, post, put, del } from './request'

// User Management
export const userApi = {
  list: (params: any) => get('/system/user/list', params),
  detail: (id: number) => get(`/system/user/${id}`),
  create: (data: any) => post('/system/user', data),
  update: (data: any) => put('/system/user', data),
  remove: (id: number) => del(`/system/user/${id}`),
  resetPwd: (data: { userId: number }) => put('/system/user/resetPwd', data),
  resetMfa: (data: { userId: number }) => put('/system/user/resetMfa', data),
  // 当前登录用户自助修改密码(校验原密码)
  updateMyPwd: (data: { oldPassword: string; newPassword: string }) => put('/system/user/profile/updatePwd', data),
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
  savePermissionSettings: (data: { roleId: number; dataScope: number; visibleModules: string | null; menuIds: number[] }) =>
    put('/system/role/permissionSettings', data),
  all: () => get<any>('/system/role/all'),
  // 角色成员(给角色分配对应人员)
  members: (roleId: number) => get<any>(`/system/role/${roleId}/members`),
  memberCandidates: (keyword?: string) => get<any>('/system/role/candidates', { keyword }),
  addMembers: (roleId: number, userIds: number[]) => post(`/system/role/${roleId}/members`, { userIds }),
  removeMember: (roleId: number, userId: number) => del(`/system/role/${roleId}/members/${userId}`)
}

// Menu Management
export const menuApi = {
  list: (params?: any) => get('/system/menu/list', params),
  detail: (id: number) => get(`/system/menu/${id}`),
  create: (data: any) => post('/system/menu', data),
  update: (data: any) => put('/system/menu', data),
  remove: (id: number) => del(`/system/menu/${id}`),
  treeselect: () => get('/system/menu/tree'),
  // 部门树(原先与菜单 treeselect 同名会覆盖菜单口径,改名为 deptTreeselect 避免覆盖)
  deptTreeselect: () => get('/org/dept/tree'),
  roleMenuTreeselect: (roleId: number) => get(`/system/menu/tree/role/${roleId}`),
  // 后端按 sys_role_menu 生成的当前用户可见路由树(RouterVO)
  getRouters: () => get('/system/menu/routers')
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
