import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { loginApi, getUserInfoApi, logoutApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<any>({})
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  async function login(loginForm: { username: string; password: string; code?: string }) {
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

  return {
    token,
    userInfo,
    roles,
    permissions,
    login,
    getUserInfo,
    logout,
    resetState
  }
})
