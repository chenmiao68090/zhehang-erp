import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { ALWAYS_VISIBLE_GROUPS, asyncRoutes, constantRoutes, LEGACY_VISIBLE_GROUP_BY_ROUTE, MODULE_GROUP } from '@/router/routes'
import { filterRoutesByVisibleModules } from '@/router/visible-module-filter'
import router from '@/router'
import { useUserStore } from './user'
import { hasImpersonationSessionMarker } from '@/utils/impersonation-session'
import { hasRequiredRole } from '@/utils/role-access'

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])
  const menuList = ref<RouteRecordRaw[]>([])

  const SETTINGS_GOVERNANCE_ROUTE_NAMES = new Set(['SysRuleCenter', 'SysFieldMapping'])

  /**
   * 规则/字段目录的后端固定由 boss/super_admin 守门。普通角色即使角色设置放行整个
   * “系统设置”大类，也不能得到一个必然 403 的可见入口；原领域设置隐藏深链继续保留。
   * 这不是第二套业务菜单配置，只是把固定后端能力边界同步到导航层；
   * boss 仍必须在角色设置 visible_modules 中被显式放行，本函数不自动扩权。
   */
  function filterSettingsGovernanceAccess(routes: RouteRecordRaw[], allowed: boolean): RouteRecordRaw[] {
    return routes.map((route) => {
      if (route.path !== '/sys-flow') return route
      if (allowed) {
        // visible_modules 可只勾选其中一个新中心；父路由必须指向实际被保留的第一个可见子页。
        const firstVisibleCenter = (route.children || [])
          .find((child) => SETTINGS_GOVERNANCE_ROUTE_NAMES.has(String(child.name || '')) && !child.meta?.hidden)
        if (!firstVisibleCenter) return route
        const redirect = firstVisibleCenter.path.startsWith('/')
          ? firstVisibleCenter.path
          : `/sys-flow/${firstVisibleCenter.path}`
        return { ...route, redirect }
      }
      return {
        ...route,
        redirect: '/404',
        meta: { ...route.meta, hidden: true },
        children: (route.children || []).filter((child) => !SETTINGS_GOVERNANCE_ROUTE_NAMES.has(String(child.name || '')))
      }
    })
  }

  /** 过滤唯一平台账号专属入口，避免 boss 全量路由短路显示后端必然 403 的菜单。 */
  function filterPlatformOnly(routes: RouteRecordRaw[], isPlatformAccount: boolean): RouteRecordRaw[] {
    if (isPlatformAccount) return routes
    return routes
      .filter((route) => !route.meta?.platformOnly)
      .map((route) => route.children?.length
        ? { ...route, children: filterPlatformOnly(route.children, false) }
        : route)
  }

  /** 用户明确禁止代登录查看私人聊天；菜单隐藏只是体验层，路由守卫和后端仍会独立拒绝。 */
  function filterImpersonationRestricted(routes: RouteRecordRaw[]): RouteRecordRaw[] {
    if (!hasImpersonationSessionMarker()) return routes
    return routes
      .filter((route) => route.path !== '/message' && route.redirect !== '/message/center')
      .map((route) => route.children?.length
        ? {
            ...route,
            children: route.children.filter((child) => child.path !== '/message' && child.redirect !== '/message/center')
          }
        : route)
  }

  /**
   * 少数经营管理入口需要先按角色做“是否出现”过滤。visible_modules 仍是业务导航
   * 的唯一配置来源；这里仅用于不能出现在普通员工首页的老板专属入口。
   * 真正的数据权限仍由路由守卫和后端接口再次校验。
   */
  function filterRoleRestricted(
    routes: RouteRecordRaw[],
    roles: string[],
    userId?: number | string
  ): RouteRecordRaw[] {
    return routes
      .filter((route) => {
        const required = (route.meta as any)?.showForRoles as string[] | undefined
        return !required || hasRequiredRole(roles, required, userId)
      })
      .map((route) => route.children?.length
        ? { ...route, children: filterRoleRestricted(route.children, roles, userId) }
        : route)
  }

  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const userStore = useUserStore()
    // 复制角色: 标识形如 'sales__a1b2',表示该角色由模板角色 sales 复制而来,应继承其菜单可见性。
    // 把每个标识按 '__' 前缀展开为"有效角色集"(同时保留原标识),用于后续 meta.roles 匹配。
    const expandRoles = (rs: string[]): string[] => {
      const set = new Set<string>()
      const privileged = new Set(['admin', 'super_admin', 'sys_admin', 'boss'])
      rs.forEach((r) => {
        if (!r) return
        set.add(r)
        const sep = r.indexOf('__')
        const base = sep > 0 ? r.slice(0, sep) : ''
        if (sep > 0 && !privileged.has(base)) set.add(base)
      })
      return Array.from(set)
    }
    const roles = expandRoles(userStore.roles)

    let accessedRoutes: RouteRecordRaw[]
    // 唯一最高角色由后端补充 admin 别名；迁移窗口兼容精确 super_admin。
    const isAdmin = roles.includes('admin') || roles.includes('super_admin')
    const canManageSettingsGovernance = isAdmin || roles.includes('boss')
    const isPlatformAccount = Number(userStore.userInfo?.id) === 1

    // 页面导航只认角色管理页保存的 visible_modules，不再被 meta.roles 或旧 sys_role_menu 二次缩小。
    // 接口操作权限、数据范围、平台专属及代登录限制仍由各自安全层独立校验。
    if (isAdmin) {
      accessedRoutes = asyncRoutes
    } else {
      accessedRoutes = filterRoutesByVisibleModules(
        asyncRoutes,
        userStore.visibleModules,
        MODULE_GROUP,
        LEGACY_VISIBLE_GROUP_BY_ROUTE,
        ALWAYS_VISIBLE_GROUPS
      )
    }
    accessedRoutes = filterSettingsGovernanceAccess(accessedRoutes, canManageSettingsGovernance)
    accessedRoutes = filterPlatformOnly(accessedRoutes, isPlatformAccount)
    accessedRoutes = filterImpersonationRestricted(accessedRoutes)
    accessedRoutes = filterRoleRestricted(accessedRoutes, roles, userStore.userInfo?.id)

    // 常量路由里也混有业务菜单，同样使用同一份角色可见模块配置。
    let visibleConstant: RouteRecordRaw[]
    if (isAdmin) {
      visibleConstant = constantRoutes
    } else {
      visibleConstant = filterRoutesByVisibleModules(
        constantRoutes,
        userStore.visibleModules,
        MODULE_GROUP,
        LEGACY_VISIBLE_GROUP_BY_ROUTE,
        ALWAYS_VISIBLE_GROUPS
      )
    }
    visibleConstant = filterSettingsGovernanceAccess(visibleConstant, canManageSettingsGovernance)
    visibleConstant = filterPlatformOnly(visibleConstant, isPlatformAccount)
    visibleConstant = filterImpersonationRestricted(visibleConstant)
    visibleConstant = filterRoleRestricted(visibleConstant, roles, userStore.userInfo?.id)

    addRoutes.value = accessedRoutes
    routes.value = visibleConstant.concat(accessedRoutes)
    menuList.value = routes.value.filter((r) => !r.meta?.hidden && !(r.meta as any)?.navigationHidden)

    return accessedRoutes
  }

  function resetRoutes() {
    // 从 router 中递归移除所有动态路由；多数顶级分组没有 name，不能只删顶层。
    const removeRouteTree = (route: RouteRecordRaw) => {
      route.children?.forEach(removeRouteTree)
      if (route.name && router.hasRoute(route.name as string)) {
        router.removeRoute(route.name as string)
      }
    }
    addRoutes.value.forEach(removeRouteTree)
    // 清空状态，恢复为常量路由
    addRoutes.value = []
    routes.value = [...constantRoutes]
    menuList.value = routes.value.filter((r) => !r.meta?.hidden && !(r.meta as any)?.navigationHidden)
  }

  return {
    routes,
    addRoutes,
    menuList,
    generateRoutes,
    resetRoutes
  }
})
