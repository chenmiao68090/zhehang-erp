import { get, post } from './request'

/** 云客集成配置 */
export interface YunkeConfig {
  id?: number
  company?: string
  partnerId?: string
  signKey?: string
  baseUrl?: string
  enabled?: number
}

export const yunkeApi = {
  /** 读配置(signKey 脱敏返回) */
  getConfig: () => get('/crm/yunke/config'),
  /** 保存配置(signKey 留空/掩码则不改) */
  saveConfig: (data: YunkeConfig) => post('/crm/yunke/config', data),
  /** 测试连接(调云客沟通统计验证凭证/签名/IP) */
  test: () => post('/crm/yunke/test'),
  /** 员工微信列表(真实数据,聚合云客多接口) */
  wechatStaffList: (params?: any) => get('/crm/yunke/wechat-staff-list', params),
  /** 微信聊天:不传talker=会话列表;传talker=该会话消息 */
  wechatChat: (params: any) => get('/crm/yunke/wechat-chat', params),
  /** 云客账号列表(供员工关联参考) */
  yunkeAccounts: () => get('/crm/yunke/yunke-accounts'),
  /** 云客成员列表(组织架构真实成员:姓名/手机/部门/职位,供员工关联下拉) */
  yunkeMembers: () => get('/crm/yunke/yunke-members'),
  /** 员工云客关联映射列表 */
  userMap: () => get('/crm/yunke/user-map'),
  /** 保存员工云客关联(批量) */
  saveUserMap: (data: any) => post('/crm/yunke/user-map', data),
  /** 给员工开通外呼([{userId,name,phone}]) */
  enableDial: (employees: any) => post('/crm/yunke/enable-dial', employees),
  /** 点击拨打({phone, userId?}) */
  dial: (data: any) => post('/crm/yunke/dial', data),
  /** 点击挂断({callId, userId?}) */
  hangup: (data: any) => post('/crm/yunke/hangup', data),
  /** 新增好友统计({beginYmd,endYmd,pageNum,pageSize}) */
  newFriends: (params?: any) => get('/crm/yunke/new-friends', params),
  /** 某员工朋友圈({wechatId,beginYmd?,endYmd?}) */
  moments: (params: any) => get('/crm/yunke/moments', params),
  /** 微信语音通话列表({beginYmd,endYmd,callType?,isSend?,pageNum,pageSize}) */
  voiceList: (params?: any) => get('/crm/yunke/voice-list', params),
  /** 可开通外呼的员工列表(不需system权限,供员工云客关联用) */
  staffCandidates: () => get('/crm/yunke/staff-candidates'),
  /** 部门+成员树(云客组织架构,供员工微信列表左侧按部门筛选) */
  deptTree: () => get('/crm/yunke/dept-tree')
}
