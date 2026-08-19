import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/** 审单业务消息深链:属静态路由(不做权限过滤),故与提单中心分开导出。 */
export const orderDeepLinkRoutes: RouteRecordRaw[] = [
  {
    // 审单业务消息深链:办事人员可能没有提单中心菜单,但仍须进入自己被分配的审单。
    path: '/business-review',
    component: Layout,
    meta: { hidden: true },
    children: [
      { path: '', name: 'OrderReviewDeepLink', component: () => import('@/views/order/review-center.vue'), meta: { title: '审单执行', hidden: true } }
    ]
  }
]

/** 提单中心(V227 起只做深链与回退,不进可见导航)。 */
export const orderRoutes: RouteRecordRaw[] = [
  {
    // V227:旧提单中心只退出可见导航，页面、路由、审批和数据继续保留作深链与回退。
    path: '/order',
    component: Layout,
    redirect: '/feige-order-contract/orders',
    meta: { title: '提单中心', icon: 'Tickets', hidden: true, roles: ['admin', 'boss', 'manager', 'dept_manager', 'finance', 'finance_hq', 'sales', 'online_sales'] },
    children: [
      // —— 旧业务提单页已彻底关闭:深链也不再渲染页面,统一落到飞哥订单 ——
      { path: 'bookkeeping', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      { path: 'address', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      // 刻章提单已迁回印章体系,深链落到新入口。
      { path: 'seal-order', redirect: '/seal/order', meta: { hidden: true } },
      { path: 'gs-order', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      // 审单中心仍在使用,保留真实页面。
      { path: 'review', name: 'OrderReviewCenter', component: () => import('@/views/order/review-center.vue'), meta: { title: '审单中心', icon: 'Stamp' } },
      // 旧“建设中”提单不再占菜单；规则说明书也已关闭,历史收藏直接落到飞哥订单。
      { path: 'legal', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      { path: 'bank', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      { path: 'project-apply', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      { path: 'other-value', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      // —— 说明文档已关闭 ——
      { path: 'guide', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      // V238 退役旧订单系统:旧提单系统(bill)与旧合同管理(contract)页面已删除(零流量,数据源 biz_order 为空),
      // 历史收藏统一落到飞哥订单/代理记账合同。
      { path: 'bill', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      { path: 'contract', redirect: '/feige-order-contract/contracts', meta: { hidden: true } }
    ]
  }
]
