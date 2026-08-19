import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/** 订单与合同(飞哥版):与提单中心并列同一顶栏大类,但页面、接口和 feige_* 台账保持独立。 */
export const feigeOrderRoutes: RouteRecordRaw[] = [
  {
    // 订单与合同：并入同一顶栏大类，但页面、接口和 feige_* 台账仍保持独立。
    path: '/feige-order-contract',
    component: Layout,
    redirect: '/feige-order-contract/orders',
    meta: { title: '订单与合同', icon: 'DocumentChecked', roles: ['admin', 'boss', 'manager', 'dept_manager', 'finance', 'finance_hq', 'sales', 'online_sales'] },
    children: [
      { path: 'orders', name: 'FeigeOrderList', component: () => import('@/views/feige-order-contract/orders.vue'), meta: { title: '订单管理', icon: 'List' } },
      { path: 'new-order', name: 'FeigeOrderCreate', component: () => import('@/views/feige-order-contract/new-order.vue'), meta: { title: '待财务审核', icon: 'CircleCheck' } },
      { path: 'refunds', name: 'FeigeOrderRefunds', component: () => import('@/views/feige-order-contract/refunds.vue'), meta: { title: '退费订单', icon: 'RefreshLeft' } },
      { path: 'unreceived', name: 'FeigeOrderUnreceived', component: () => import('@/views/feige-order-contract/unreceived.vue'), meta: { title: '未收款订单', icon: 'Wallet' } },
      { path: 'contracts', name: 'FeigeAccountingContracts', component: () => import('@/views/feige-order-contract/contracts.vue'), meta: { title: '代理记账合同', icon: 'Document' } }
    ]
  }
]
