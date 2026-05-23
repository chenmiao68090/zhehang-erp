import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getToken } from '@/utils/auth'

const whiteList = ['/login', '/404']

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const token = getToken()

    if (token) {
      if (to.path === '/login') {
        next({ path: '/' })
      } else {
        const userStore = useUserStore()
        if (userStore.roles.length > 0) {
          next()
        } else {
          try {
            await userStore.getUserInfo()
            const permissionStore = usePermissionStore()
            const routes = await permissionStore.generateRoutes()
            routes.forEach((route) => {
              router.addRoute(route)
            })
            next({ ...to, replace: true })
          } catch (error) {
            await userStore.logout()
            next(`/login?redirect=${to.path}`)
          }
        }
      }
    } else {
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
      }
    }
  })
}
