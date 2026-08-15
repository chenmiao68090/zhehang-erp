// 受控字段维护 API —— 后端 /system/dict(SysDictController)
// 仅供字段匹配设置中心维护已接入目录；业务页面统一通过 settings-governance options 读取。
import { get, post, put, del } from './request'

export interface SysDictType {
  id?: number
  dictName: string
  dictType: string
  status?: number // 0正常 1停用
  remark?: string
  createTime?: string
}

export interface SysDictData {
  id?: number
  dictType: string
  dictLabel: string
  dictValue: string
  dictSort?: number
  isDefault?: number // 0否 1是
  status?: number // 0正常 1停用
  remark?: string
}

export const dictTypeApi = {
  list: (params: { pageNum?: number; pageSize?: number; dictName?: string; dictType?: string; status?: number }) =>
    get('/system/dict/type/list', params),
  all: () => get('/system/dict/type/all'),
  detail: (id: number) => get(`/system/dict/type/${id}`),
  create: (data: SysDictType) => post('/system/dict/type', data),
  update: (data: SysDictType) => put('/system/dict/type', data),
  remove: (id: number) => del(`/system/dict/type/${id}`)
}

export const dictDataApi = {
  /** 某类型下全部字典项(管理用,含停用) */
  list: (dictType: string) => get(`/system/dict/data/list/${dictType}`),
  detail: (id: number) => get(`/system/dict/data/${id}`),
  create: (data: SysDictData) => post('/system/dict/data', data),
  update: (data: SysDictData) => put('/system/dict/data', data),
  remove: (id: number) => del(`/system/dict/data/${id}`)
}
