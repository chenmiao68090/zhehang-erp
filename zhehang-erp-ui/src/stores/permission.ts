import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { asyncRoutes, constantRoutes } from '@/router/routes'
import { useUserStore } from './user'
import { menuApi } from '@/api/system'

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])
  const menuList = ref<RouteRecordRaw[]>([])

  function hasPermission(roles: string[], route: RouteRecordRaw): boolean {
    if (route.meta?.roles) {
      return roles.some((role) => (route.meta!.roles as string[]).includes(role))
    }
    return true
  }

  function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
    const res: RouteRecordRaw[] = []
    routes.forEach((route) => {
      const tmp = { ...route }
      if (hasPermission(roles, tmp)) {
        if (tmp.children) {
          tmp.children = filterAsyncRoutes(tmp.children, roles)
        }
        res.push(tmp)
      }
    })
    return res
  }

  /** Generate routes based on user roles */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const userStore = useUserStore()
    const roles = userStore.roles

    let accessedRoutes: RouteRecordRaw[]

    // If admin, use all async routes; otherwise filter by role
    if (roles.includes('admin')) {
      accessedRoutes = asyncRoutes
    } else {
      accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
    }

    // Try to load menu from backend (for dynamic routing support)
    try {
      const { data } = await menuApi.treeselect() as any
      if (data && data.length > 0) {
        // Backend menus available, can merge with frontend routes
        // For now, use frontend-defined routes filtered by role
      }
    } catch (_e) {
      // Fallback to frontend routes filtering
    }

    addRoutes.value = accessedRoutes
    routes.value = constantRoutes.concat(accessedRoutes)
    menuList.value = routes.value.filter((r) => !r.meta?.hidden)

    return accessedRoutes
  }

  function resetRoutes() {
    routes.value = []
    addRoutes.value = []
    menuList.value = []
  }

  return {
    routes,
    addRoutes,
    menuList,
    generateRoutes,
    resetRoutes
  }
})
