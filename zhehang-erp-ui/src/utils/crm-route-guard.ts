/**
 * CRM 路由权限映射与守卫
 * 用于在路由跳转前检查角色是否拥有访问权限
 */
import type { RouteLocationNormalized } from 'vue-router'
import {
  type CrmPermission,
  type CrmRole,
  hasPermission,
} from '@/utils/crm-permission'

/**
 * CRM 路由 -> 所需权限映射
 * key: 路由 name(必须与 routes.ts 中的 name 一致)
 * value: 访问该路由所需权限点
 */
export const crmRoutePermissions: Record<string, CrmPermission> = {
  // 公海池管理
  PoolAdmin: 'pool:config',
  // 分配规则配置
  DistributeConfig: 'rule:config',
  // 回收规则配置
  RecycleConfig: 'rule:config',
  // 撞单管理
  CollisionManage: 'pool:view_team',
  // 保有量配置
  HoldingConfig: 'holding:config',
  // 全公司客户视图
  CustomerAll: 'pool:view_all',
  // 团队客户视图
  CustomerTeam: 'pool:view_team',
}

/**
 * 检查角色对指定路由是否有访问权限
 * 未在映射中声明的路由视为公开(true)
 */
export function checkCrmRoutePermission(
  routeName: string,
  role: CrmRole,
): boolean {
  const required = crmRoutePermissions[routeName]
  if (!required) return true
  return hasPermission(role, required)
}

/**
 * Vue Router 守卫工厂
 *
 * 使用方式(在 router/index.ts 中):
 *   router.beforeEach(createCrmRouteGuard(() => currentRole.value))
 *
 * @param getRole 返回当前角色的函数(便于单测注入)
 */
export function createCrmRouteGuard(getRole: () => CrmRole) {
  return (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: (path?: string | false) => void,
  ) => {
    const name = String(to.name || '')
    if (!name) {
      next()
      return
    }
    const role = getRole()
    if (checkCrmRoutePermission(name, role)) {
      next()
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `[CRM Permission] 角色 [${role}] 无权访问路由 [${name}], 已拦截`,
      )
      next('/403')
    }
  }
}

/**
 * 获取路由所需的权限文案(用于 UI 提示)
 */
export function getRouteRequiredPermission(
  routeName: string,
): CrmPermission | null {
  return crmRoutePermissions[routeName] || null
}
