/** 通用分页请求 */
export interface PageQuery {
  pageNum: number
  pageSize: number
  [key: string]: any
}

/** 通用分页响应 */
export interface PageResult<T = any> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

/** 通用 API 响应 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  deptId: number
  deptName: string
  roles: string[]
  permissions: string[]
}

/** 菜单信息 */
export interface MenuItem {
  id: number
  parentId: number
  name: string
  path: string
  component: string
  icon: string
  sort: number
  type: number
  visible: boolean
  children?: MenuItem[]
}
