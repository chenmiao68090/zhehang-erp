import { get, put, del } from './request'

/** 通知项 */
export interface NotificationItem {
  id: number
  title: string
  content: string
  type: 'system' | 'approval' | 'task' | 'message'
  isRead: boolean
  link?: string
  createTime: string
  sender?: string
}

/** 获取通知列表 */
export function listNotification(params?: { type?: string; isRead?: number; pageNum?: number; pageSize?: number }) {
  return get<{ data: { list: NotificationItem[]; total: number } }>('/system/notification/list', params)
}

/** 标记单条已读 */
export function readNotification(id: number) {
  return put<{ data: null }>(`/system/notification/read/${id}`)
}

/** 全部标记已读 */
export function readAllNotification() {
  return put<{ data: null }>('/system/notification/readAll')
}

/** 删除通知 */
export function deleteNotification(id: number) {
  return del<{ data: null }>(`/system/notification/${id}`)
}

/** 获取未读数量 */
export function getUnreadCount() {
  return get<{ data: number }>('/system/notification/unreadCount')
}
