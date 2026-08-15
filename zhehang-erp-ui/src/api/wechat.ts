import { get } from './request'

/** 微信好友(云客同步) */
export interface WechatFriend {
  id?: number | string
  companyCode?: string
  wxId?: string
  friendWxId?: string
  friendNickname?: string
  friendRemark?: string
  friendAlias?: string
  gender?: number
  region?: string
  contactLabelValues?: string
  description?: string
  friendWxPhone?: string
  fromType?: string
  addType?: number
  noteDes?: string
  topFlag?: string
  lastChangeType?: string
  updateTime?: string
}

export const wechatFriendApi = {
  list: (params: any) => get('/crm/wechat-friend/list', params),
  stats: () => get('/crm/wechat-friend/stats')
}
