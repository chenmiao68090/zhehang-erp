import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/** 会计体系(代理记账业务线):已从导航下线,仅保留页面与深链。 */
export const financeRoutes: RouteRecordRaw[] = [
  {
    // 会计体系(代理记账业务线)已按用户要求从导航下线(2026-07-19):大类与菜单不再显示,
    // 页面代码与深链保留(代账业务线还在,提单中心代账单未动),要重启时去掉 hidden 并恢复 NAV_GROUPS 条目即可。
    // 注意 MODULE_GROUP['/accounting'] 必须保留,否则本组变"无归类恒可见"反而对全角色开放。
    path: '/accounting',
    component: Layout,
    redirect: '/accounting/board',
    meta: { title: '会计体系', icon: 'Money', roles: ['admin', 'boss', 'manager', 'finance', 'finance_hq'], hidden: true },
    children: [
      { path: 'board', name: 'AccountingBoard', component: () => import('@/views/accounting/workspace.vue'), meta: { title: '代账工作台', icon: 'Odometer' } },
    ]
  }
]
