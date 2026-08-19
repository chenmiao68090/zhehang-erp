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
      // —— 已上线的业务提单(排前面,彩色图标) ——
      { path: 'bookkeeping', name: 'OrderBookkeeping', component: () => import('@/views/order/bookkeeping.vue'), meta: { title: '代理记账提单', icon: 'Money' } },
      { path: 'address', name: 'OrderAddress', component: () => import('@/views/order/address-order.vue'), meta: { title: '挂靠地址提单', icon: 'MapLocation' } },
      { path: 'seal-order', name: 'OrderSealBill', component: () => import('@/views/seal/registration.vue'), meta: { title: '刻章业务提单', icon: 'Stamp' } },
      { path: 'gs-order', name: 'OrderGsBill', component: () => import('@/views/order/gs-submit.vue'), meta: { title: '工商业务提单', icon: 'OfficeBuilding' } },
      { path: 'review', name: 'OrderReviewCenter', component: () => import('@/views/order/review-center.vue'), meta: { title: '审单中心', icon: 'Stamp' } },
      // 旧“建设中”提单不再占菜单；历史收藏统一落到规则说明书。
      { path: 'legal', redirect: '/order/guide', meta: { hidden: true } },
      { path: 'bank', redirect: '/order/guide', meta: { hidden: true } },
      { path: 'project-apply', redirect: '/order/guide', meta: { hidden: true } },
      { path: 'other-value', redirect: '/order/guide', meta: { hidden: true } },
      // —— 说明文档(垫底) ——
      { path: 'guide', name: 'OrderGuide', component: () => import('@/views/order/order-guide.vue'), meta: { title: '提单规则说明书', icon: 'Notebook' } },
      // V238 退役旧订单系统:旧提单系统(bill)与旧合同管理(contract)页面已删除(零流量,数据源 biz_order 为空),
      // 历史收藏统一落到飞哥订单/代理记账合同。
      { path: 'bill', redirect: '/feige-order-contract/orders', meta: { hidden: true } },
      { path: 'contract', redirect: '/feige-order-contract/contracts', meta: { hidden: true } }
    ]
  }
]
