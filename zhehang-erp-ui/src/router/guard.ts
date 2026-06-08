import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getToken } from '@/utils/auth'

const whiteList = ['/login', '/404']

// Mock 固定 Token：用于无后端环境下的本地登录验证
const MOCK_TOKEN = 'mock_admin_token'
// 开发环境允许后端不可用时回退 Mock 登录，生产环境仍只在显式开启时启用
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.DEV

// 角色昵称映射：用于 Mock 模式下根据当前角色动态展示用户昵称
function getRoleNickname(role: string): string {
  const map: Record<string, string> = {
    admin: '系统管理员',
    boss: '张总',
    manager: '李主管',
    finance: '王会计',
    sales: '赵销售'
  }
  return map[role] || '用户'
}

function resolveLoginRedirect(redirect: unknown): string {
  const rawTarget = Array.isArray(redirect) ? redirect[0] : redirect
  if (typeof rawTarget !== 'string') {
    return '/'
  }
  let target = rawTarget
  try {
    target = decodeURIComponent(rawTarget)
  } catch (_error) {
    target = rawTarget
  }
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/login')) {
    return '/'
  }
  return target
}

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const token = getToken()

    if (token) {
      if (to.path === '/login') {
        next(resolveLoginRedirect(to.query.redirect))
        return
      }

      const userStore = useUserStore()
      const permissionStore = usePermissionStore()

      // 已加载角色与动态路由，直接放行
      if (userStore.roles.length > 0 && permissionStore.routes.length > 0) {
        next()
        return
      }

      try {
        // Mock 模式:跳过后端用户信息请求,按 localStorage 角色加载菜单
        if (USE_MOCK && token === MOCK_TOKEN) {
          const savedRole = localStorage.getItem('current_role') || 'admin'
          userStore.roles = [savedRole]
          userStore.userInfo = {
            username: savedRole,
            nickname: getRoleNickname(savedRole),
            avatar: ''
          }
        } else {
          await userStore.getUserInfo()
        }

        const accessRoutes = await permissionStore.generateRoutes()
        accessRoutes.forEach((route) => {
          router.addRoute(route)
        })

        // 重新进入目标路由，确保新增的动态路由生效
        next({ ...to, replace: true })
      } catch (error) {
        try {
          await userStore.logout()
        } catch (_logoutError) {
          userStore.resetState()
        }
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    } else {
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    }
  })
}
