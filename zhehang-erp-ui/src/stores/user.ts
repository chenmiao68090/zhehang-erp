import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { loginApi, getUserInfoApi, logoutApi } from '@/api/auth'
import router from '@/router'
import { usePermissionStore } from './permission'

// 预定义系统角色（供 Header 角色切换组件等使用）
export const SYSTEM_ROLES = [
  { value: 'admin', label: '超级管理员' },
  { value: 'boss', label: '老板' },
  { value: 'manager', label: '主管' },
  { value: 'finance', label: '财务' },
  { value: 'sales', label: '销售' }
] as const

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<any>({})
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  async function login(loginForm: { username: string; password: string; code?: string }) {
    token.value = ''
    removeToken()
    const { data } = await loginApi(loginForm)
    const accessToken = data.accessToken || data.token
    token.value = accessToken
    setToken(accessToken)
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }
    return data
  }

  async function getUserInfo() {
    const { data } = await getUserInfoApi()
    userInfo.value = data.user
    roles.value = data.roles || ['admin']
    permissions.value = data.permissions || []
    return data
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      token.value = ''
      userInfo.value = {}
      roles.value = []
      permissions.value = []
      removeToken()
    }
  }

  function resetState() {
    token.value = ''
    userInfo.value = {}
    roles.value = []
    permissions.value = []
    removeToken()
  }

  /**
   * 切换当前用户角色，重新生成动态路由与菜单
   * @param newRole 目标角色 value
   */
  async function switchRole(newRole: string) {
    // 更新当前角色
    roles.value = [newRole]
    // 持久化选择
    localStorage.setItem('current_role', newRole)
    // 重置并重新生成路由（在方法内部获取 permissionStore 以避免循环依赖问题）
    const permissionStore = usePermissionStore()
    permissionStore.resetRoutes()
    const accessRoutes = await permissionStore.generateRoutes()
    accessRoutes.forEach((route) => router.addRoute(route))
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    login,
    getUserInfo,
    logout,
    resetState,
    switchRole
  }
})
