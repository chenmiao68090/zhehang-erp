import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useImpersonationStore } from '@/stores/impersonation'
import { getToken } from '@/utils/auth'
import {
  hasImpersonationSessionMarker,
  installImpersonationPageRestoreGuard
} from '@/utils/impersonation-session'
import { consumeLogoutTransition } from '@/utils/logout-transition'
import { isPublicRoute } from './public-route'
import { hasRequiredRole } from '@/utils/role-access'

const whiteList = ['/login']

function isWhiteRoute(path: string) {
  return whiteList.includes(path)
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

function canAccessRequiredRoute(to: any, userStore: ReturnType<typeof useUserStore>): boolean {
  const required = (to.meta as any)?.requiredRoles as string[] | undefined
  return !required || hasRequiredRole(userStore.roles, required, userStore.userInfo?.id)
}

export function setupRouterGuard(router: Router) {
  installImpersonationPageRestoreGuard()
  router.beforeEach(async (to, _from, next) => {
    const hasImpersonation = hasImpersonationSessionMarker()
    // 公共页先于 JWT 登录态判断放行，避免浏览器残留/过期 JWT 把客户链接重定向到登录页。
    if (isPublicRoute(to.path, to.matched) && !hasImpersonation) {
      next()
      return
    }

    const impersonationStore = useImpersonationStore()
    if (hasImpersonation) {
      try {
        if (!await impersonationStore.bootstrap()) {
          next(false)
          return
        }
      } catch (_error) {
        impersonationStore.restoreAdministratorLocally('invalid')
        next(false)
        return
      }
      // 私人聊天属于代登录查看模式的集中禁区，入口和直达地址都不放行。
      if (to.path.startsWith('/message')
        || ['/login', '/404', '/500'].includes(to.path)
        || isPublicRoute(to.path, to.matched)) {
        next('/')
        return
      }
    }

    const userStore = useUserStore()
    let token = getToken()

    // 只在服务端确认退出成功后的整页跳转中跳过一次 Cookie 恢复。
    // 普通打开 /login 时仍恢复有效会话，避免旧账号 Cookie 与新登录流程混杂。
    const confirmedLogout = !hasImpersonation
      && to.path === '/login'
      && consumeLogoutTransition()
    if (!token && confirmedLogout) {
      next()
      return
    }

    if (!token && !hasImpersonation && !isPublicRoute(to.path, to.matched)) {
      try {
        if (await userStore.restoreSession()) token = getToken()
      } catch {
        userStore.resetState()
      }
    }

    if (token) {
      if (to.path === '/login') {
        next(resolveLoginRedirect(to.query.redirect))
        return
      }

      const permissionStore = usePermissionStore()

      // 已加载角色与动态路由，直接放行
      if (userStore.identityLoaded && permissionStore.routes.length > 0) {
        if (!canAccessRequiredRoute(to, userStore)) {
          next('/')
          return
        }
        next()
        return
      }

      try {
        // 登录身份、角色和权限只接受后端签发的真实会话结果。
        await userStore.getUserInfo()

        if (!canAccessRequiredRoute(to, userStore)) {
          next('/')
          return
        }

        const accessRoutes = await permissionStore.generateRoutes()
        accessRoutes.forEach((route) => {
          router.addRoute(route)
        })

        // 重新进入目标路由，确保新增的动态路由生效
        next({ ...to, replace: true })
      } catch (error) {
        if (hasImpersonationSessionMarker() || impersonationStore.active) {
          impersonationStore.restoreAdministratorLocally('invalid')
          next(false)
          return
        }
        try {
          await userStore.logout()
        } catch (_logoutError) {
          userStore.resetState()
        }
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    } else {
      if (isWhiteRoute(to.path)) {
        next()
      } else {
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }
    }
  })
}
