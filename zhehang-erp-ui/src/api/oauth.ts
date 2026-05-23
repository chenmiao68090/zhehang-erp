import { get, post } from './request'

export interface OAuthConfig {
  id?: number
  provider: string
  appId?: string
  appSecret?: string
  agentId?: string
  redirectUri?: string
  enabled: number
}

export const oauthApi = {
  // 获取所有第三方登录配置
  configList: () => get<OAuthConfig[]>('/auth/oauth/config/list'),

  // 获取指定供应商配置
  getConfig: (provider: string) => get<OAuthConfig>(`/auth/oauth/config/${provider}`),

  // 保存/更新配置
  saveConfig: (data: OAuthConfig) => post('/auth/oauth/config/save', data),

  // 测试连接
  testConnection: (provider: string) => get<boolean>(`/auth/oauth/config/test/${provider}`),

  // 获取授权URL（前端登录页跳转）
  getAuthorizeUrl: (provider: string, state?: string) =>
    get<string>('/auth/oauth/authorize-url', { provider, state: state || '' }),

  // 回调处理
  handleCallback: (provider: string, code: string, state?: string) =>
    get('/auth/oauth/callback/' + provider, { code, state: state || '' }),

  // 绑定第三方账号
  bind: (provider: string, code: string) => post('/auth/oauth/bind', { provider, code }),

  // 解绑
  unbind: (provider: string) => post('/auth/oauth/unbind', { provider })
}
