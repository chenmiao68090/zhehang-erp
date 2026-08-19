import type { RouteRecordRaw } from 'vue-router'
import { FEIGE_SUITE_ROUTES } from './feige-suite-routes'
import { LOCAL_PREVIEW_ROUTES } from '@local-preview-routes'
import { crmRoutes } from './module-routes/crm'
import { dashboardRoutes } from './module-routes/dashboard'
import { feigeOrderRoutes } from './module-routes/feige-order'
import { financeRoutes } from './module-routes/finance'
import { adminRoutes, cultureRoutes, hrmRoutes } from './module-routes/hrm'
import { approvalRoutes, callCenterRoutes, fileRoutes, inspectRoutes, sealRoutes } from './module-routes/misc'
import { orderDeepLinkRoutes, orderRoutes } from './module-routes/order'
import { systemRoutes } from './module-routes/system'
import { taskRoutes } from './module-routes/task'

// 具体路由定义按业务域拆分在 ./module-routes/*.ts;本文件只保留导航分组常量、
// 公共/兼容路由与最终的合并顺序(顺序即导航顺序,调整前务必确认对应大类)。

/**
 * 顶部"大类"导航(两级导航:顶部=大类,左侧=该大类下的模块/子菜单)。
 * 顺序即顶栏从左到右的展示顺序。icon 为已全局注册的 Element Plus 图标名。
 */
export const NAV_GROUPS: { name: string; icon: string; color: string }[] = [
  { name: '首页', icon: 'HomeFilled', color: '#3370ff' },
  { name: '销售体系', icon: 'User', color: '#14b8a6' },
  { name: '提单与订单', icon: 'Tickets', color: '#8b5cf6' },
  { name: '任务管理', icon: 'ChatDotRound', color: '#f43f5e' },
  { name: '管家中心', icon: 'DataAnalysis', color: '#7c3aed' },
  { name: '管理体系', icon: 'OfficeBuilding', color: '#0f766e' },
  { name: '财务中心', icon: 'Wallet', color: '#d97706' },
  { name: '学习中心', icon: 'Reading', color: '#2563eb' },
  { name: '人事中心', icon: 'Avatar', color: '#ef4444' },
  { name: '工资管理', icon: 'Coin', color: '#16a34a' },
  { name: '报销管理', icon: 'Document', color: '#ea580c' },
  { name: '中台监控', icon: 'View', color: '#0d9488' },
  { name: '审批中心', icon: 'Stamp', color: '#f59e0b' },
  { name: '印章体系', icon: 'Stamp', color: '#f97316' },
  { name: '系统管理', icon: 'Setting', color: '#64748b' }
]

/** 全员基础模块：不受角色“可见模块”开关收窄。 */
export const ALWAYS_VISIBLE_GROUPS = new Set<string>(['首页'])

/** 顶层模块路径 → 所属大类。改归类只动这里,不用动每个路由的 meta。 */
export const MODULE_GROUP: Record<string, string> = {
  '/': '首页',
  '/dashboard': '首页',
  '/boss-console': '首页',
  '/message': '首页',
  '/analysis': '首页',
  '/customer': '销售体系',
  '/feige-order-contract': '提单与订单',
  '/feige-learning': '学习中心',
  '/feige-consultant': '管家中心',
  '/feige-management': '管理体系',
  '/feige-finance': '财务中心',
  '/feige-knowledge': '学习中心',
  '/feige-salary': '工资管理',
  '/feige-reimbursement': '报销管理',
  '/feige-notice': '系统管理',
  '/inspect': '中台监控',
  '/approval': '审批中心',
  // 既有客户问题闭环仍是独立“服务工单”，但与新任务工作台并列在“任务管理”大类下。
  // NAV_GROUPS 不存在“服务工单”大类；若单独归组，受限角色会丢失原入口。
  '/customer-issue': '任务管理',
  '/task-workbench': '任务管理',
  '/accounting': '会计体系',
  '/seal': '印章体系',
  '/hrm': '人事中心',
  '/admin': '人事中心',
  '/culture': '人事中心',
  '/sys-org': '系统管理',
  '/sys-account': '系统管理',
  '/sys-authority': '系统管理',
  '/sys-flow': '系统管理',
  '/sys-order': '系统管理',
  '/sys-approval': '系统管理',
  '/sys-inspect': '系统管理',
  '/sys-integration': '系统管理',
  '/sys-log': '系统管理',
  '/sys-dict': '系统管理',
  '/report': '系统管理',
  '/system': '系统管理'
}

/**
 * 顶栏合并/改名不扩大原角色可见范围。
 * 存量 visible_modules 仍可能保存旧大类名；按顶层路由分别兼容，避免因新分组名丢页，
 * 也避免只有其中一个原模块权限时被顺带放大到同组其他模块。
 */
export const LEGACY_VISIBLE_GROUP_BY_ROUTE: Record<string, string | string[]> = {
  '/order': '提单中心',
  '/feige-order-contract': '订单与合同',
  '/customer-issue': '任务工单',
  '/task-workbench': '任务工单',
  '/feige-learning': ['培训中心', '学习体系'],
  '/feige-consultant': '顾问体系',
  '/inspect': '检察体系',
  '/feige-knowledge': '知识智库',
  '/hrm': '人事行政',
  '/admin': '人事行政',
  '/culture': '人事行政',
  '/sys-org': '系统设置',
  '/sys-account': '系统设置',
  '/sys-authority': '系统设置',
  '/sys-flow': '系统设置',
  '/sys-order': '系统设置',
  '/sys-approval': '系统设置',
  '/sys-inspect': '系统设置',
  '/sys-integration': '系统设置',
  '/sys-log': '系统设置',
  '/sys-dict': '系统设置',
  '/report': '系统设置',
  '/system': '系统设置',
  // V230将通知5页收进“系统管理”；旧通告名和V228新通知名都只放行本路由。
  '/feige-notice': ['系统通告', '系统通知']
}

/** 静态路由 - 不需要权限 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/onboarding/form/:token',
    name: 'OnboardingPublicForm',
    component: () => import('@/views/hrm/onboarding-form.vue'),
    meta: { title: '入职登记', hidden: true, public: true }
  },
  {
    path: '/onboarding/public/:token',
    redirect: (to) => `/onboarding/form/${to.params.token}`,
    meta: { hidden: true, public: true }
  },
  {
    path: '/seal/submit',
    name: 'SealPublicSubmit',
    component: () => import('@/views/seal/public-submit.vue'),
    meta: { title: '刻章资料提交', hidden: true, public: true }
  },
  ...LOCAL_PREVIEW_ROUTES,
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: { title: '500', hidden: true }
  },
  { path: '/crm/customer', redirect: '/customer/customers', meta: { hidden: true } },
  // AI开发中心已退役；历史收藏和通知深链统一回首页。
  { path: '/ai-dev/:pathMatch(.*)*', redirect: '/', meta: { hidden: true } },
  // 培训中心已整体下线；历史收藏和通知深链统一回首页，避免员工落入失效页面。
  { path: '/training/:pathMatch(.*)*', redirect: '/', meta: { hidden: true } },
  { path: '/crm/follow', redirect: '/leads/workbench', meta: { hidden: true } },
  { path: '/crm/lead', redirect: '/customer/lead', meta: { hidden: true } },
  { path: '/crm/contract', redirect: '/order/contract', meta: { hidden: true } },
  { path: '/contract', redirect: '/order/contract', meta: { hidden: true } },
  { path: '/contract/index', redirect: '/order/contract', meta: { hidden: true } },
  { path: '/seal/registration', redirect: '/order/seal-order', meta: { hidden: true } },
  { path: '/sales/order', redirect: '/order/bill', meta: { hidden: true } },
  ...orderDeepLinkRoutes,
  { path: '/workflow/todo', redirect: '/approval/center', meta: { hidden: true } },
  { path: '/collaboration/notification', redirect: '/message/center', meta: { hidden: true } },
  { path: '/leads/company-pool', redirect: '/customer/lead', meta: { hidden: true } },
  { path: '/leads/online-leads', redirect: '/customer/lead', meta: { hidden: true } },
  { path: '/leads/personal-pool', redirect: '/customer/workbench', meta: { hidden: true } },
  { path: '/leads/service-renewal', redirect: '/order/contract', meta: { hidden: true } },
  { path: '/leads/pool-admin', redirect: '/sys-flow/pool-admin', meta: { hidden: true } },
  { path: '/leads/collision-manage', redirect: '/sys-flow/collision', meta: { hidden: true } },
  { path: '/leads/workbench', redirect: '/customer/workbench', meta: { hidden: true } },
  // 旧私域页仅使用浏览器本地数据，已下线；历史入口统一回到真实线索池。
  { path: '/leads/private-domain', redirect: '/customer/lead', meta: { hidden: true } },
  { path: '/leads', redirect: '/customer', meta: { hidden: true } },
  { path: '/customer/service-renewal', redirect: '/order/contract', meta: { hidden: true } },
  { path: '/customer/collision-manage', redirect: '/system/collision-manage', meta: { hidden: true } },
  { path: '/scrm/private-domain', redirect: '/customer/lead', meta: { hidden: true } },
  { path: '/system/user', redirect: '/system/employee', meta: { hidden: true } },
  { path: '/org/dept', redirect: '/hrm/dept', meta: { hidden: true } },
  { path: '/org/post', redirect: '/hrm/post', meta: { hidden: true } },
  { path: '/org/employee', redirect: '/hrm/employee', meta: { hidden: true } },
  { path: '/org/structure', redirect: '/hrm/structure', meta: { hidden: true } },
  // 旧 AI 助手页只有本地固定回复；统一跳转到使用真实 /ai/chat 的数字总部。
  { path: '/ai-chat/index', redirect: '/dashboard/cockpit', meta: { title: 'AI 助手', hidden: true } },
  ...dashboardRoutes,
  // 三个历史入口统一进入经营监控中心；保留精确深链，不制造第二套菜单或权限入口。
  { path: '/boss-console', redirect: '/dashboard/cockpit?view=overview', meta: { hidden: true } },
  { path: '/boss-console/index', redirect: '/dashboard/cockpit?view=overview', meta: { hidden: true } },
  { path: '/analysis', redirect: '/dashboard/cockpit?view=analysis', meta: { hidden: true } },
  { path: '/analysis/index', redirect: '/dashboard/cockpit?view=analysis', meta: { hidden: true } },
  ...crmRoutes,
  ...approvalRoutes,
  ...cultureRoutes
]

/** 动态路由 - 需要权限验证 */
export const asyncRoutes: RouteRecordRaw[] = [
  ...FEIGE_SUITE_ROUTES,
  ...inspectRoutes,
  ...orderRoutes,
  ...feigeOrderRoutes,
  ...sealRoutes,
  ...adminRoutes,
  ...financeRoutes,
  ...taskRoutes,
  ...hrmRoutes,
  ...fileRoutes,
  ...callCenterRoutes,
  ...systemRoutes
]
