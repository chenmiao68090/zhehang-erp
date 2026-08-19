import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/** 销售体系:线索/客户/业绩,含已合并页面的隐藏兼容子路由。 */
export const crmRoutes: RouteRecordRaw[] = [
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer/workbench',
    meta: { title: '销售体系', icon: 'User', roles: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales'] },
    children: [
      {
        // 新人默认入口:把今日目标、待打队列、拨号和跟进记录收在一个工作场景内。
        path: 'workbench',
        name: 'LeadsWorkbench',
        component: () => import('@/views/call-center/tele-workbench.vue'),
        meta: { title: '今日工作', icon: 'Tickets' }
      },
      {
        // 找客户:公司公海和高价值客户统一在页内切换。
        path: 'lead',
        name: 'CrmLead',
        component: () => import('@/views/crm/lead.vue'),
        meta: { title: '找客户', icon: 'Search' }
      },
      {
        // 主管导入工具：独立五步页，不作为一线销售主导航展示。
        path: 'lead/import',
        name: 'CrmLeadImport',
        component: () => import('@/views/crm/lead-import.vue'),
        meta: {
          title: '批量导入公司资源',
          hidden: true,
          roles: ['admin', 'boss', 'manager', 'dept_manager']
        }
      },
      {
        // 我的客户统一承接已领取/已分配的跟进中客户和已成交客户。
        path: 'customers',
        name: 'SalesCustomerPortfolio',
        component: () => import('@/views/customer/portfolio.vue'),
        meta: { title: '我的客户', icon: 'UserFilled' }
      },
      {
        path: 'perf-board',
        name: 'SalesPerfBoard',
        component: () => import('@/views/dashboard/sales-operating-console.vue'),
        meta: { title: '销售经营台', icon: 'DataLine' }
      },
      {
        path: 'rank',
        name: 'SalesRank',
        component: () => import('@/views/crm/sales-rank.vue'),
        meta: { title: '龙虎榜TOP', icon: 'Trophy', hidden: true }
      },
      {
        path: 'team-perf-board',
        name: 'TeamPerfBoard',
        component: () => import('@/views/dashboard/biz-perf.vue'),
        meta: { title: '团队业绩看板', icon: 'DataAnalysis', scope: 'team', hidden: true }
      },
      {
        // 旧地址继续可用，统一回到今日工作。
        path: 'tele',
        name: 'TeleWorkbench',
        redirect: '/customer/workbench',
        meta: { title: '电销外呼', icon: 'PhoneFilled', hidden: true }
      },
      {
        path: 'tele-statistics',
        name: 'TeleStatistics',
        component: () => import('@/views/call-center/tele-statistics.vue'),
        meta: { title: '电销外呼统计', icon: 'TrendCharts', hidden: true }
      },
      {
        path: 'ad-leads',
        name: 'CustomerAdLeads',
        redirect: '/customer/lead',
        meta: { title: '投流线索（已停用）', hidden: true }
      },
      {
        path: 'treasure',
        name: 'CustomerTreasure',
        component: () => import('@/views/crm/lead.vue'),
        meta: { title: '藏金阁', icon: 'GoldMedal', tab: 'treasure', hidden: true }
      },
      {
        path: 'guide',
        name: 'SalesGuide',
        component: () => import('@/views/crm/sales-guide.vue'),
        meta: { title: '规则说明书', icon: 'Notebook', hidden: true }
      },
      {
        path: 'company-pool',
        redirect: '/customer/lead',
        meta: { title: '公司公海（已合并）', hidden: true }
      },
      {
        path: 'personal-pool',
        name: 'LeadsPersonalPool',
        redirect: '/customer/workbench',
        meta: { title: '我的线索', icon: 'User', hidden: true } /* 已并入"我的线索"工作台,旧链接统一跳转 */
      },
      {
        path: 'pool-admin',
        redirect: '/sys-flow/pool-admin',
        meta: { title: '公海管理', hidden: true } /* 已移至 系统设置→流程与规则,旧链接跳转 */
      },
      {
        path: 'private-domain',
        redirect: '/customer/lead',
        meta: { title: '私域运营（已下线）', hidden: true }
      }
    ]
  }
]
