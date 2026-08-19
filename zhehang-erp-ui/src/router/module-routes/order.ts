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
      // 合同管理:从提单中心菜单移除,保留隐藏路由(供 /contract、续签提醒等旧链接 + 合同功能仍可用)
      { path: 'contract', name: 'ContractManage', component: () => import('@/views/order/contract.vue'), meta: { title: '合同管理', icon: 'Document', hidden: true } },
      // 提单系统:从菜单移除(转后台),保留隐藏路由供首页/私域/转订单等旧链接使用
      { path: 'bill', name: 'OrderBill', component: () => import('@/views/order/bill.vue'), meta: { title: '提单系统', icon: 'Tickets', hidden: true } }
    ]
  }
]
