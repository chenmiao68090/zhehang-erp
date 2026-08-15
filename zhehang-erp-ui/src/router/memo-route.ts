import type { RouteRecordRaw } from 'vue-router'

/**
 * 个人备忘录独立页。
 *
 * 该路由作为「首页」Layout 的隐藏子路由注入：
 * - URL 独立为 /memo；
 * - 仍处于首页大类，不会让侧边栏失去归属；
 * - 不额外占用侧边栏菜单，由首页备忘卡片进入。
 */
export const memoRoute: RouteRecordRaw = {
  path: 'memo',
  name: 'PersonalMemo',
  component: () => import('@/views/dashboard/memo.vue'),
  meta: { title: '我的备忘录', icon: 'Memo', hidden: true }
}

export function registerMemoRoute(routes: RouteRecordRaw[]) {
  const homeLayout = routes.find(route => route.path === '/')
  if (!homeLayout?.children) return
  const exists = homeLayout.children.some(route => route.name === memoRoute.name || route.path === memoRoute.path)
  if (!exists) homeLayout.children.push(memoRoute)
}
