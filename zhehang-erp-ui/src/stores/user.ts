import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  advanceAuthLifecycleVersion,
  getRefreshToken,
  getToken,
  removeToken,
  setToken
} from '@/utils/auth'
import { loginApi, getUserInfoApi, logoutApi, type AuthStepResult } from '@/api/auth'
import { restoreAccessToken, restoreAccessTokenFromHttpOnlyCookie } from '@/api/request'
import { hasImpersonationSessionMarker } from '@/utils/impersonation-session'
import { resolveAuthenticatedAccessToken } from '@/utils/authenticated-access'

// 仅用于把后端返回的 role_key 显示成中文，不参与权限判断，也不允许前端切换角色。
export const SYSTEM_ROLES = [
  { value: 'admin', label: '超级管理员' },
  { value: 'boss', label: '老板' },
  { value: 'manager', label: '部门主管' },
  { value: 'sales', label: '电销' },
  { value: 'online_sales', label: '网销' },
  { value: 'finance', label: '财务/会计' },
  { value: 'finance_hq', label: '财务部' },
  { value: 'hr', label: '人事' },
  { value: 'staff', label: '普通员工' }
] as const

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<any>({})
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const identityLoaded = ref(false)
  // 角色管理是页面导航唯一来源：null=全部，[]=仅基础页，非空数组=多角色并集。
  const visibleModules = ref<string[] | null>(null)

  async function acceptAuthTokens(data: AuthStepResult) {
    const accessToken = await resolveAuthenticatedAccessToken(data, restoreAccessTokenFromHttpOnlyCookie)
    token.value = accessToken
    setToken(accessToken)
  }

  async function login(loginForm: { username: string; password: string; code?: string; uuid?: string }) {
    if (hasImpersonationSessionMarker()) throw new Error('请先退出员工视角')
    token.value = ''
    identityLoaded.value = false
    removeToken()
    const { data } = await loginApi(loginForm)
    return data
  }

  async function getUserInfo() {
    const { data } = await getUserInfoApi()
    userInfo.value = data.user
    roles.value = Array.isArray(data.roles) ? data.roles : []
    permissions.value = Array.isArray(data.permissions) ? data.permissions : []
    // 数组必须原样保留：空数组代表无业务模块；只有后端明确返回 null 才代表全部可见。
    // 字段缺失或格式异常属于权限数据故障，必须失败收紧为仅基础页。
    visibleModules.value = data.visibleModules === null
      ? null
      : (Array.isArray(data.visibleModules) ? data.visibleModules : [])
    identityLoaded.value = true
    return data
  }

  async function restoreSession() {
    if (hasImpersonationSessionMarker()) return false
    const restored = await restoreAccessToken()
    token.value = restored || ''
    return Boolean(restored)
  }

  async function logout() {
    if (hasImpersonationSessionMarker()) throw new Error('请先退出员工视角')
    const refreshToken = getRefreshToken()
    // 先让已经在途的刷新响应失效，避免退出后迟到响应把token重新写回本地。
    advanceAuthLifecycleVersion()
    try {
      // 兼容升级前access/refresh使用两个UUID的旧会话；新会话仅access也可撤销整对。
      await logoutApi(refreshToken)
    } finally {
      token.value = ''
      userInfo.value = {}
      roles.value = []
      permissions.value = []
      visibleModules.value = null
      identityLoaded.value = false
      removeToken()
    }
  }

  function resetIdentityState() {
    token.value = ''
    userInfo.value = {}
    roles.value = []
    permissions.value = []
    visibleModules.value = null
    identityLoaded.value = false
  }

  function resetState() {
    resetIdentityState()
    removeToken()
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    identityLoaded,
    visibleModules,
    login,
    acceptAuthTokens,
    getUserInfo,
    restoreSession,
    logout,
    resetIdentityState,
    resetState
  }
})
