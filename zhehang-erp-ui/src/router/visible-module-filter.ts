export interface VisibleModuleRoute {
  path: string
  redirect?: unknown
  component?: unknown
  components?: unknown
  meta?: { hidden?: boolean }
  children?: VisibleModuleRoute[]
}

export type LegacyVisibleGroupMap = Record<string, string | string[]>

/** 顶级 hidden 组只有全重定向子项时，视为不占菜单的旧路径兼容壳。 */
function isPureRedirectShell(route: VisibleModuleRoute): boolean {
  if (!route.meta?.hidden) return false
  const kids = route.children || []
  if (!kids.length) return !!route.redirect
  return kids.every((child) => !!child.redirect && !child.component && !child.components)
}

export function fullVisibleChildPath(parentPath: string, childPath: string): string {
  if (!childPath) return parentPath
  if (childPath.startsWith('/')) return childPath
  return (parentPath + '/' + childPath).replace(/\/+/g, '/')
}

function legacyGroupsForRoute(routePath: string, legacyGroupsByRoute: LegacyVisibleGroupMap): string[] {
  const value = legacyGroupsByRoute[routePath]
  return Array.isArray(value) ? value : (value ? [value] : [])
}

/**
 * 按角色页保存的 visible_modules 过滤顶层路由。
 *
 * - null：全部可见；
 * - []：只保留全员基础组和无归类路由；
 * - 大类名/旧大类名：只放行对应顶层路由；
 * - 子页完整路径：只保留命中子页。
 */
export function filterRoutesByVisibleModules<T extends VisibleModuleRoute>(
  routes: T[],
  visibleModules: string[] | null,
  moduleGroups: Record<string, string>,
  legacyGroupsByRoute: LegacyVisibleGroupMap,
  alwaysVisibleGroups: ReadonlySet<string>
): T[] {
  if (visibleModules === null) return routes
  if (!visibleModules.length) {
    return routes.filter((route) => {
      const group = moduleGroups[route.path]
      return !group || alwaysVisibleGroups.has(group)
    })
  }

  const allow = new Set(visibleModules)
  const result: T[] = []
  routes.forEach((route) => {
    if (isPureRedirectShell(route)) {
      result.push(route)
      return
    }

    const group = moduleGroups[route.path]
    if (!group || alwaysVisibleGroups.has(group)) {
      result.push(route)
      return
    }

    const legacyGroups = legacyGroupsForRoute(route.path, legacyGroupsByRoute)
    if (allow.has(group) || legacyGroups.some((legacyGroup) => allow.has(legacyGroup))) {
      result.push(route)
      return
    }

    const children = route.children || []
    if (children.length) {
      const keptChildren = children.filter((child) => (
        child.meta?.hidden || allow.has(fullVisibleChildPath(route.path, child.path))
      ))
      if (keptChildren.some((child) => !child.meta?.hidden)) {
        result.push({ ...route, children: keptChildren } as T)
      }
      return
    }

    if (allow.has(route.path)) result.push(route)
  })
  return result
}
