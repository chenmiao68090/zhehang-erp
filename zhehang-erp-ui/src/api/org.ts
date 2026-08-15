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

export interface EmployeeListParams {
  pageNum?: number
  pageSize?: number
  name?: string
  deptId?: number
  postId?: number
  status?: number
  /** 员工与账号主列表排除离职人员，离职历史统一进入离职人员中心。 */
  excludeResigned?: boolean
}

// 员工管理
export const employeeApi = {
  list: (params: EmployeeListParams = {}) => get('/org/employee/list', params),
  // 全员选人最小字段（无手机/身份证/附件/账号角色），任务、资产、通讯录等下拉必须用此接口
  options: () => get('/org/employee/options'),
  // 全员花名册(无身份证/手机等隐私字段),限 HR/管理员/老板,用于设假期额度等需要全员名单的场景
  roster: () => get('/org/employee/roster'),
  // 当前登录人的员工档案(本人可读,用于员工自助同步部门/岗位/工号)
  me: () => get('/org/employee/me'),
  // 合同到期提醒:合同结束日期在今天~今天+days 之间(即将到期)的在职员工,供 HR 跟进续签
  contractExpiring: (days?: number) => get('/org/employee/contract-expiring', { days }),
  nextCode: () => get('/org/employee/next-code'),
  detail: (id: number) => get(`/org/employee/${id}`),
  create: (data: any) => post('/org/employee', data),
  update: (data: any) => put('/org/employee', data),
  remove: (id: number) => del(`/org/employee/${id}`),
  resetPwd: (id: number) => put(`/org/employee/${id}/account/resetPwd`, {}),
  changeAccountStatus: (id: number, accountEnabled: boolean) => put(`/org/employee/${id}/account/status`, null, { params: { accountEnabled } }),
  /** 专用离职入口：后端在同一事务内登记离职、停用账号并使当前会话失效。 */
  resign: (id: number, resignDate: string) => put(`/org/employee/${id}/resign`, { resignDate })
}

// 异动管理(建单即自动发起审批中心 transfer 流程;后端孤儿口 /org/transfer/approve 已下线)
export const transferApi = {
  list: (params: any) => get('/org/transfer/list', params),
  create: (data: any) => post('/org/transfer', data)
}

// 组织架构
export const structureApi = {
  tree: () => get('/org/structure/tree')
}
