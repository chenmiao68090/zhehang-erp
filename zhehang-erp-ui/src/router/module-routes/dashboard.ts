import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/** 首页大类:个人中心 / 内部沟通 / 经营监控中心(顺序即左侧目录顺序)。 */
export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard/home',
    meta: { title: '个人中心', icon: 'HomeFilled' },
    children: [
      {
        path: 'dashboard/home',
        name: 'Home',
        component: () => import('@/views/dashboard/home.vue'),
        meta: { title: '个人中心', icon: 'HomeFilled' }
      }
    ]
  },
  {
    // 内部沟通归入「首页」左侧目录，并紧随个人中心；仍是全员基础模块。
    // 保留 /message/center 兼容消息铃铛、历史收藏和实时通知深链。
    path: '/message',
    component: Layout,
    redirect: '/message/center',
    meta: { title: '内部沟通', icon: 'ChatDotRound' },
    children: [
      { path: 'center', name: 'MessageCenterPage', component: () => import('@/views/message/center.vue'), meta: { title: '内部沟通', icon: 'ChatDotRound', breadcrumb: false } }
    ]
  },
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/cockpit',
    meta: {
      title: '经营监控中心',
      icon: 'DataAnalysis',
      showForRoles: ['super_admin', 'boss'],
      requiredRoles: ['super_admin', 'boss']
    },
    children: [
      {
        path: 'cockpit',
        name: 'OwnerMonitorCenter',
        component: () => import('@/views/dashboard/owner-monitor.vue'),
        meta: {
          title: '经营监控中心',
          icon: 'DataAnalysis',
          showForRoles: ['super_admin', 'boss'],
          requiredRoles: ['super_admin', 'boss']
        }
      }
    ]
  }
]
