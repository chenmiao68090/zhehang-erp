import { get, post, del } from './request'

// 人文中心可维护内容（行政制度 policy / 企业文化 culture / 员工风采荣誉 honor）
export const contentApi = {
  // type 可选：policy / culture / honor，不传返回全部
  list: (type?: string) => get('/culture/content/list', type ? { type } : {}),
  detail: (id: number) => get(`/culture/content/${id}`),
  // 新增/编辑：含 id 走更新，无 id 走新增
  save: (data: any) => post('/culture/content', data),
  remove: (id: number) => del(`/culture/content/${id}`)
}
