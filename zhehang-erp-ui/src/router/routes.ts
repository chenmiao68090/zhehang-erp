import type { RouteRecordRaw } from 'vue-router'
import { FEIGE_HR_CHILD_ROUTES, FEIGE_SUITE_ROUTES } from './feige-suite-routes'
import { LOCAL_PREVIEW_ROUTES } from '@local-preview-routes'

const Layout = () => import('@/components/layout/MainLayout.vue')

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
  { name: '系统管理', icon: 'Setting', color: '#64748b' },
  { name: '中台监控', icon: 'View', color: '#0d9488' },
  { name: '审批中心', icon: 'Stamp', color: '#f59e0b' },
  { name: '运营体系', icon: 'TrendCharts', color: '#ec4899' },
  { name: '印章体系', icon: 'Stamp', color: '#f97316' }
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
  '/order': '提单与订单',
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
  '/operation-service': '运营体系',
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
  {
    // 审单业务消息深链:办事人员可能没有提单中心菜单,但仍须进入自己被分配的审单。
    path: '/business-review',
    component: Layout,
    meta: { hidden: true },
    children: [
      { path: '', name: 'OrderReviewDeepLink', component: () => import('@/views/order/review-center.vue'), meta: { title: '审单执行', hidden: true } }
    ]
  },
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
  },
  // 三个历史入口统一进入经营监控中心；保留精确深链，不制造第二套菜单或权限入口。
  { path: '/boss-console', redirect: '/dashboard/cockpit?view=overview', meta: { hidden: true } },
  { path: '/boss-console/index', redirect: '/dashboard/cockpit?view=overview', meta: { hidden: true } },
  { path: '/analysis', redirect: '/dashboard/cockpit?view=analysis', meta: { hidden: true } },
  { path: '/analysis/index', redirect: '/dashboard/cockpit?view=analysis', meta: { hidden: true } },
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
  },
  {
    path: '/operation-service',
    component: Layout,
    redirect: '/operation-service/ad-feedback',
    meta: { title: '运营服务中心', icon: 'TrendCharts', roles: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales'] },
    children: [
      {
        path: 'ad-feedback',
        name: 'OperationServiceCenter',
        component: () => import('@/views/operation/service-center.vue'),
        meta: { title: '运营看板', icon: 'Odometer' }
      },
      { path: 'meituan', name: 'OpMeituan', component: () => import('@/views/operation/meituan-data.vue'), meta: { title: '美团数据', icon: 'Shop' } },
      { path: 'douyin', name: 'OpDouyin', component: () => import('@/views/operation/douyin-data.vue'), meta: { title: '抖音数据', icon: 'VideoPlay' } },
      { path: 'xiaohongshu', name: 'OpXiaohongshu', component: () => import('@/views/operation/xiaohongshu-data.vue'), meta: { title: '小红书数据', icon: 'Reading' } },
      { path: 'shipinhao', name: 'OpShipinhao', component: () => import('@/views/operation/shipinhao-data.vue'), meta: { title: '视频号数据', icon: 'VideoCamera' } },
      { path: 'kuaishou', name: 'OpKuaishou', component: () => import('@/views/operation/kuaishou-data.vue'), meta: { title: '快手数据', icon: 'Film' } }
    ]
  },
  {
    path: '/approval',
    component: Layout,
    redirect: '/approval/center',
    meta: { title: '审批中心', icon: 'Stamp' },
    children: [
      // 审批中心:飞书风三栏工作台(发起申请/待办/已办/抄送我/已发起/全公司,五合一)
      { path: 'center', name: 'ApprovalCenter', component: () => import('@/views/approval/approval-center.vue'), meta: { title: '审批中心', icon: 'Stamp' } },
      // 双页合一:原独立"发起申请"页已并入审批中心,旧路由重定向保留
      { path: 'index', redirect: '/approval/center', meta: { hidden: true } }
    ]
  },
  {
    path: '/culture',
    component: Layout,
    redirect: '/culture/index',
    meta: { title: '人文中心', icon: 'Star' },
    children: [
      // 员工风采(照片墙)已作为页内首个标签嵌入企业文化页(culture/index.vue),不再单列菜单项
      { path: 'index', name: 'CultureCenter', component: () => import('@/views/culture/index.vue'), meta: { title: '人文中心', icon: 'Star' } },
      // 我的薪资(员工自助):无 roles=全员可见,查看已发放工资条并签字确认/异常反馈
      { path: 'my-payslip', name: 'HrmMyPayslip', component: () => import('@/views/hrm/my-payslip.vue'), meta: { title: '我的薪资', icon: 'Wallet' } },
      // 员工自助服务门户(飞书建议 180):无 roles=全员可见,聚合个人档案/人事异动时间线/我的合同/快捷入口
      { path: 'self-service', name: 'HrmSelfService', component: () => import('@/views/hrm/self-service.vue'), meta: { title: '员工自助', icon: 'Postcard' } }
    ]
  }
]

/** 动态路由 - 需要权限验证 */
export const asyncRoutes: RouteRecordRaw[] = [
  ...FEIGE_SUITE_ROUTES,
  {
    // 中台监控:微信/云客/外呼监察(老板监控销售的微信运营、通话、外呼),从销售体系归拢过来
    path: '/inspect',
    component: Layout,
    redirect: '/inspect/wechat-staff',
    meta: { title: '中台监控', icon: 'View', roles: ['admin', 'boss', 'manager', 'dept_manager'] },
    children: [
      {
        // 员工微信:云客「沟通」模块员工微信列表(组织架构+聊天+朋友圈+新增好友)
        path: 'wechat-staff',
        name: 'CustomerWechatStaff',
        component: () => import('@/views/customer/wechat-staff-list.vue'),
        meta: { title: '员工微信', icon: 'Iphone' }
      },
      {
        // 微信好友:云客工作手机个人微信好友自动同步
        path: 'wechat-friends',
        name: 'WechatFriends',
        component: () => import('@/views/customer/wechat-friends.vue'),
        meta: { title: '微信好友', icon: 'ChatDotRound' }
      },
      {
        // 微信语音通话:销售和客户的微信语音/视频通话记录(含录音)
        path: 'wechat-voice',
        name: 'CustomerWechatVoice',
        component: () => import('@/views/customer/wechat-voice.vue'),
        meta: { title: '微信语音通话', icon: 'Microphone' }
      },
      {
        // 通话记录:云客工作手机完整话单(含时长+录音)自动同步
        path: 'call-records',
        name: 'CustomerCallRecords',
        component: () => import('@/views/customer/call-records.vue'),
        meta: { title: '通话记录', icon: 'Phone' }
      },
      {
        path: 'yunke-config',
        redirect: '/sys-inspect/yunke-config',
        meta: { title: '云客对接配置', hidden: true } /* 已移至 系统设置→集成与对接 */
      },
      {
        path: 'yunke-user-map',
        redirect: '/sys-inspect/yunke-user-map',
        meta: { title: '员工云客关联', hidden: true } /* 已移至 系统设置→集成与对接 */
      }
    ]
  },
  {
    // V227:旧提单中心只退出可见导航，页面、路由、审批和数据继续保留作深链与回退。
    path: '/order',
    component: Layout,
    redirect: '/feige-order-contract/orders',
    meta: { title: '提单中心', icon: 'Tickets', navigationHidden: true, roles: ['admin', 'boss', 'manager', 'dept_manager', 'finance', 'finance_hq', 'sales', 'online_sales'] },
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
  },
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
  },
  {
    path: '/seal',
    component: Layout,
    redirect: '/seal/board',
    meta: { title: '刻章业务', icon: 'Stamp', roles: ['admin', 'boss', 'manager', 'finance', 'finance_hq'] },
    children: [
      { path: 'board', name: 'SealBoard', component: () => import('@/views/seal/board.vue'), meta: { title: '印章业务看板', icon: 'Odometer' } },
      { path: 'inventory', name: 'SealInventory', component: () => import('@/views/seal/inventory.vue'), meta: { title: '库存与采购', icon: 'Box' } },
      { path: 'partner', name: 'SealPartner', component: () => import('@/views/partner/index.vue'), meta: { title: '长期合作客户', icon: 'Star' } },
      { path: 'new-sign', name: 'SealNewSign', component: () => import('@/views/seal/new-sign.vue'), meta: { title: '新签客户数据', icon: 'DataLine' } },
      { path: 'out-region', name: 'SealOutRegion', component: () => import('@/views/seal/out-region.vue'), meta: { title: '外区域合作', icon: 'Connection' } },
      { path: 'cost', name: 'SealCost', component: () => import('@/views/seal/cost.vue'), meta: { title: '刻章成本明细', icon: 'Money' } }
    ]
  },
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/seal-use',
    meta: { title: '行政管理', icon: 'OfficeBuilding', roles: ['admin', 'boss', 'manager', 'hr', 'dept_manager'] },
    children: [
      { path: 'seal-use', name: 'AdminSealUse', component: () => import('@/views/admin/seal-use.vue'), meta: { title: '印章登记', icon: 'Stamp' } },
      { path: 'asset', name: 'AdminAsset', component: () => import('@/views/admin/asset.vue'), meta: { title: '固定资产', icon: 'Goods' } },
      { path: 'supply', name: 'AdminSupply', component: () => import('@/views/admin/supply.vue'), meta: { title: '办公用品', icon: 'Box' } },
      { path: 'hr-expense', name: 'AdminHrExpense', component: () => import('@/views/admin/hr-expense.vue'), meta: { title: '人事行政支出', icon: 'Tickets' } }
    ]
  },
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
  },
  {
    path: '/customer-issue',
    component: Layout,
    redirect: '/customer-issue/list',
    meta: { title: '服务工单', icon: 'Warning' },
    children: [
      { path: 'list', name: 'CustomerIssueList', component: () => import('@/views/crm/customer-issue.vue'), meta: { title: '服务工单', icon: 'Warning' } }
    ]
  },
  {
    path: '/task-workbench',
    component: Layout,
    redirect: '/task-workbench/business-task',
    meta: { title: '任务工单', icon: 'Tickets' },
    children: [
      { path: 'business-task', name: 'FeigeBusinessTask', component: () => import('@/views/task-workbench/business-task.vue'), meta: { title: '业务任务', icon: 'List' } },
      { path: 'one-time-task', name: 'FeigeOneTimeTask', component: () => import('@/views/task-workbench/one-time-task.vue'), meta: { title: '一次性任务', icon: 'Checked' } },
      { path: 'recurring-task', name: 'FeigeRecurringTask', component: () => import('@/views/task-workbench/recurring-task.vue'), meta: { title: '周期任务', icon: 'Calendar' } },
      { path: 'project-dept-task', name: 'FeigeProjectDeptTask', component: () => import('@/views/task-workbench/project-dept-task.vue'), meta: { title: '项目部门任务', icon: 'Tickets' } },
      { path: 'special-task', name: 'FeigeSpecialTask', component: () => import('@/views/task-workbench/special-task.vue'), meta: { title: '专项任务', icon: 'Flag' } },
      { path: 'workflow-task', name: 'FeigeWorkflowTask', component: () => import('@/views/task-workbench/workflow-task.vue'), meta: { title: '工作计划任务', icon: 'Calendar' } },
      { path: 'workflow-report', name: 'FeigeWorkflowReport', component: () => import('@/views/task-workbench/workflow-report.vue'), meta: { title: '工作计划报表', icon: 'DataAnalysis' } },
      { path: 'goal-setting', name: 'FeigeGoalSetting', component: () => import('@/views/task-workbench/goal-setting.vue'), meta: { title: '目标设置', icon: 'TrendCharts' } },
      { path: 'workflow-template', name: 'FeigeWorkflowTemplate', component: () => import('@/views/task-workbench/workflow-template.vue'), meta: { title: '计划模板', icon: 'Document' } },
      { path: 'subordinate-view', name: 'FeigeSubordinateView', component: () => import('@/views/task-workbench/subordinate-view.vue'), meta: { title: '下属工作视图', icon: 'User' } }
    ]
  },
  {
    path: '/hrm',
    component: Layout,
    meta: { title: '人力组织', icon: 'Avatar', roles: ['admin', 'boss', 'manager', 'dept_manager', 'hr'] },
    children: [
      ...FEIGE_HR_CHILD_ROUTES,
      // 人力组织保留招聘/考勤;组织架构(架构图/岗位)已下线,部门管理与员工管理迁至「系统管理」
      { path: 'recruit', name: 'HrmRecruit', component: () => import('@/views/hrm/recruit.vue'), meta: { title: '招聘管理', icon: 'UserFilled' } },
      { path: 'attendance', name: 'HrmAttendance', component: () => import('@/views/hrm/leave-management.vue'), meta: { title: '假勤管理', icon: 'Calendar' } },
      // 工资条核算(飞书 194):旧「薪酬核算/薪酬模板」已下线并收敛到此页;.vue 文件保留未删,路由仅隐藏+重定向(可逆)
      { path: 'payslip', name: 'HrmPayslip', component: () => import('@/views/hrm/payslip.vue'), meta: { title: '工资条核算', icon: 'Postcard', roles: ['admin', 'boss', 'hr'] } },
      { path: 'social-fund', name: 'HrmSocialFund', component: () => import('@/views/hrm/social-fund.vue'), meta: { title: '社保公积金', icon: 'Coin', roles: ['admin', 'boss', 'hr'] } },
      { path: 'salary', redirect: '/hrm/payslip', meta: { hidden: true } },
      { path: 'salary-template', redirect: '/hrm/payslip', meta: { hidden: true } },
      { path: 'contract-expiring', name: 'HrmContractExpiring', component: () => import('@/views/hrm/contract-expiring.vue'), meta: { title: '合同到期提醒', icon: 'AlarmClock' } },
      { path: 'labor-contract', name: 'HrmLaborContract', component: () => import('@/views/hrm/labor-contract.vue'), meta: { title: '劳动合同管理', icon: 'Document', roles: ['admin', 'boss', 'hr'] } },
      // 组织架构补全(飞书建议 159/160):在职人员 / 离职人员(含离职交接 SOP 附件),员工数据走既有只读 /org/employee/list
      { path: 'active-staff', name: 'HrmActiveStaff', component: () => import('@/views/hrm/active-staff.vue'), meta: { title: '在职人员', icon: 'User', roles: ['admin', 'boss', 'hr'] } },
      { path: 'resigned-staff', name: 'HrmResignedStaff', redirect: '/sys-org/resigned-staff', meta: { hidden: true } },
      // 旧路径兼容重定向(hidden):部门/架构图/岗位/组织架构→系统管理·部门管理;员工/合同/档案→系统管理·员工管理;面试→招聘
      { path: 'organization', redirect: '/system/dept', meta: { hidden: true } },
      { path: 'structure', redirect: '/system/dept', meta: { hidden: true } },
      { path: 'dept', redirect: '/system/dept', meta: { hidden: true } },
      { path: 'post', redirect: '/system/dept', meta: { hidden: true } },
      { path: 'employee', redirect: '/system/employee', meta: { hidden: true } },
      { path: 'interview', redirect: '/hrm/recruit', meta: { hidden: true } },
      { path: 'contract', redirect: '/system/employee', meta: { hidden: true } },
      { path: 'archive', redirect: '/system/employee', meta: { hidden: true } }
    ]
  },
  {
    path: '/file',
    component: Layout,
    redirect: '/file/ai-qa',
    // 知识文库入口已从「培训中心」下线;保留旧路由供历史链接访问,不再进左侧菜单。
    meta: { title: '知识文库', icon: 'Collection', hidden: true, roles: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales', 'finance', 'finance_hq', 'hr', 'staff'] },
    children: [
      { path: 'ai-qa', name: 'FileAiQa', component: () => import('@/views/file/ai-qa.vue'), meta: { title: 'AI知识问答', icon: 'MagicStick' } },
      { path: 'manager', name: 'FileManager', component: () => import('@/views/file/manager.vue'), meta: { title: '文件管理', icon: 'Folder' } },
      { path: 'kb', name: 'FileKb', component: () => import('@/views/file/kb.vue'), meta: { title: '知识库', icon: 'Reading' } },
      { path: 'article', name: 'FileArticle', component: () => import('@/views/file/article.vue'), meta: { title: '文章管理', icon: 'Memo' } }
    ]
  },
  // 旧呼叫中心是纯前端内存演示；全部旧深链统一进入真实销售工作台。
  { path: '/call-center', redirect: '/customer/workbench', meta: { hidden: true } },
  { path: '/call-center/:pathMatch(.*)*', redirect: '/customer/workbench', meta: { hidden: true } },
  // ===== 系统设置:规则和字段治理只展示两个统一目录入口 =====
  // 旧销售规则、撞单、合同模板、审批流程和字典路径继续保留为隐藏深链；
  // 新中心只负责说明真实来源与影响，具体写入仍由原领域接口守门，绝不复制第二套规则。
  {
    path: '/sys-flow',
    component: Layout,
    redirect: '/sys-flow/rule-center',
    meta: { title: '规则与字段设置', icon: 'Setting' },
    children: [
      { path: 'rule-center', name: 'SysRuleCenter', component: () => import('@/views/system/rule-center.vue'), meta: { title: '规则设定中心', icon: 'Guide' } },
      { path: 'field-mapping', name: 'SysFieldMapping', component: () => import('@/views/system/field-mapping.vue'), meta: { title: '字段匹配设置中心', icon: 'Connection' } },
      { path: 'pool-admin', name: 'SysFlowPoolAdmin', component: () => import('@/views/leads/pool-admin.vue'), meta: { title: '公海私海规则', icon: 'Setting', roles: ['admin', 'boss'], hidden: true } },
      { path: 'collision', name: 'SysFlowCollision', component: () => import('@/views/leads/collision-manage.vue'), meta: { title: '撞单管理', icon: 'Aim', roles: ['admin', 'boss', 'manager'], hidden: true } },
      { path: 'contract-template', name: 'SysOrderContractTemplate', component: () => import('@/views/order/contract-template.vue'), meta: { title: '合同模板管理', icon: 'Document', roles: ['admin', 'boss', 'manager'], hidden: true } },
      { path: 'workflow', name: 'SysApprovalWorkflow', component: () => import('@/views/workflow/designer.vue'), meta: { title: '审批流程设置', icon: 'Stamp', roles: ['admin', 'boss', 'manager'], hidden: true } },
      { path: 'dict', redirect: '/sys-flow/field-mapping', meta: { title: '选项字典', roles: ['admin', 'super_admin', 'sys_admin', 'boss'], hidden: true } }
    ]
  },
  // 【提单中心设置】已并入「业务规则」;保留隐藏重定向兜底,旧链接不失效。
  {
    path: '/sys-order',
    component: Layout,
    redirect: '/sys-flow/contract-template',
    meta: { title: '提单中心设置', icon: 'Tickets', roles: ['admin', 'boss', 'manager'], hidden: true },
    children: [
      { path: 'contract-template', redirect: '/sys-flow/contract-template', meta: { hidden: true } }
    ]
  },
  // 【审批设置】已并入「业务规则」;保留隐藏重定向兜底,旧链接不失效。
  {
    path: '/sys-approval',
    component: Layout,
    redirect: '/sys-flow/workflow',
    meta: { title: '审批设置', icon: 'Stamp', roles: ['admin', 'boss', 'manager'], hidden: true },
    children: [
      { path: 'workflow', redirect: '/sys-flow/workflow', meta: { hidden: true } }
    ]
  },
  // 【第三方对接】原「检察体系设置」改名:云客是当前唯一真实的第三方对接入口,页面与路径全部不动。
  // 旧「集成与对接」(/sys-integration)在生产本就是指向此处的隐藏兼容层,维持不动。
  {
    path: '/sys-inspect',
    component: Layout,
    // 重定向指向组内全部角色都可见的子项(yunke-config 对 manager/dept_manager 隐藏,指它会白屏)
    redirect: '/sys-inspect/yunke-user-map',
    meta: { title: '第三方对接', icon: 'Connection', roles: ['admin', 'super_admin', 'sys_admin', 'boss', 'manager', 'dept_manager'] },
    children: [
      { path: 'yunke-config', name: 'SysInspectYunkeConfig', component: () => import('@/views/customer/yunke-config.vue'), meta: { title: '云客对接配置', icon: 'Setting', roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
      { path: 'yunke-user-map', name: 'SysInspectYunkeUserMap', component: () => import('@/views/customer/yunke-user-map.vue'), meta: { title: '员工云客关联', icon: 'Connection' } }
    ]
  },
  // 【组织与权限设置】原「组织与人事设置」+「角色与权限」合并为一组:
  // 部门/岗位/员工对 hr 开放;角色管理(含角色权限设置标签页)仅管理员/老板可见,子路由 roles 收窄。
  // 权限设置(配置权限按钮跳转)与菜单管理保留能力但从导航隐藏,避免误改全站菜单树。
  {
    path: '/sys-org',
    component: Layout,
    redirect: '/sys-org/dept',
    meta: { title: '组织与权限', icon: 'OfficeBuilding', roles: ['admin', 'super_admin', 'sys_admin', 'boss', 'hr'] },
    children: [
      { path: 'dept', name: 'SysOrgDept', component: () => import('@/views/org/dept.vue'), meta: { title: '部门管理', icon: 'OfficeBuilding' } },
      // 岗位管理软下线(2026-07-20 用户拍板"岗位去掉只留角色"):hidden 保能力不删数据,恢复=去掉 hidden
      { path: 'post', name: 'SysOrgPost', component: () => import('@/views/org/post.vue'), meta: { title: '岗位管理', icon: 'Postcard', hidden: true } },
      { path: 'employee', name: 'SysOrgEmployee', component: () => import('@/views/org/employee.vue'), meta: { title: '员工与账号', icon: 'Avatar' } },
      { path: 'resigned-staff', name: 'SysOrgResignedStaff', component: () => import('@/views/hrm/resigned-staff.vue'), meta: { title: '离职人员中心', icon: 'Remove', hidden: true } },
      { path: 'role', name: 'SysAuthRole', component: () => import('@/views/system/role.vue'), meta: { title: '角色与权限', icon: 'UserFilled', roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
      { path: 'permission', redirect: '/sys-org/role', meta: { hidden: true } },
      { path: 'menu', name: 'SysAuthMenu', component: () => import('@/views/system/menu.vue'), meta: { title: '菜单管理', icon: 'Menu', hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } }
    ]
  },
  // 员工与账号已并入「组织与人事设置」;保留隐藏重定向兜底,旧链接不失效。
  {
    path: '/sys-account',
    component: Layout,
    redirect: '/sys-org/employee',
    meta: { title: '员工与账号', icon: 'Avatar', roles: ['admin', 'super_admin', 'sys_admin', 'boss', 'hr'], hidden: true },
    children: [
      { path: 'employee', redirect: '/sys-org/employee', meta: { hidden: true } }
    ]
  },
  // 【角色与权限】已并入「组织与权限设置」(角色权限设置成为角色管理页内标签页);保留隐藏重定向兜底,旧链接不失效。
  {
    path: '/sys-authority',
    component: Layout,
    redirect: '/sys-org/role',
    meta: { title: '角色与权限', icon: 'Lock', roles: ['admin', 'super_admin', 'sys_admin', 'boss'], hidden: true },
    children: [
      { path: 'role', redirect: '/sys-org/role', meta: { hidden: true } },
      { path: 'role-perm', redirect: { path: '/sys-org/role', query: { tab: 'perm' } }, meta: { hidden: true } },
      { path: 'permission', redirect: '/sys-org/role', meta: { hidden: true } },
      { path: 'menu', redirect: '/sys-org/menu', meta: { hidden: true } }
    ]
  },
  // 旧“集成与对接”只作隐藏兼容层；当前唯一真实集成入口是云客主动同步配置。
  {
    path: '/sys-integration',
    component: Layout,
    redirect: '/sys-inspect/yunke-config',
    meta: { title: '集成与对接', icon: 'Connection', roles: ['admin', 'super_admin', 'sys_admin', 'boss'], hidden: true },
    children: [
      { path: 'openapi', redirect: '/sys-inspect/yunke-config', meta: { hidden: true } },
      { path: 'callcenter', redirect: '/sys-inspect/yunke-config', meta: { title: '外呼对接', icon: 'Phone', hidden: true } },
      { path: 'yunke-config', redirect: '/sys-inspect/yunke-config', meta: { hidden: true } },
      { path: 'yunke-user-map', redirect: '/sys-inspect/yunke-user-map', meta: { hidden: true } }
    ]
  },
  // 【平台与审计】原「日志审计」改名;组内全部是平台运维页,platformOnly 留在组级语义正确
  // (老板/普通管理员本就不可见,仅平台运维账号可见,行为与改名前完全一致)。
  {
    path: '/sys-log',
    component: Layout,
    redirect: '/sys-log/login-log',
    meta: { title: '平台与审计', icon: 'Tickets', roles: ['admin', 'super_admin', 'sys_admin'], platformOnly: true },
    children: [
      { path: 'login-log', name: 'SysLogLogin', component: () => import('@/views/system/login-log.vue'), meta: { title: '登录日志', icon: 'Key' } },
      { path: 'oper-log', name: 'SysLogOper', component: () => import('@/views/system/oper-log.vue'), meta: { title: '操作日志', icon: 'Document' } }
    ]
  },
  // 【数据字典】已并入「业务规则」并改名「选项字典」;保留隐藏重定向兜底,旧链接不失效。
  {
    path: '/sys-dict',
    component: Layout,
    redirect: '/sys-flow/dict',
    meta: { title: '数据字典', icon: 'Collection', roles: ['admin', 'super_admin', 'sys_admin', 'boss'], hidden: true },
    children: [
      { path: 'index', redirect: '/sys-flow/dict', meta: { hidden: true } }
    ]
  },
  // 「系统管理」旧深链只做精确、安全的兼容映射，不注册父级通配符。
  // 角色授权仍归「角色与权限」；菜单树仅保留隐藏管理页；平台日志维持 platformOnly。
  { path: '/system-management/user', redirect: '/sys-org/employee', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss', 'hr'] } },
  { path: '/isystem/user', redirect: '/sys-org/employee', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss', 'hr'] } },
  { path: '/system-management/role', redirect: '/sys-org/role', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
  { path: '/isystem/roleUserList', redirect: '/sys-org/role', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
  { path: '/system-management/permission', redirect: '/sys-org/menu', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
  { path: '/isystem/permission', redirect: '/sys-org/menu', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
  { path: '/isystem/newPermissionList', redirect: '/sys-org/menu', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
  { path: '/system-management/dict', redirect: '/sys-flow/dict', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
  { path: '/isystem/dict', redirect: '/sys-flow/dict', meta: { hidden: true, roles: ['admin', 'super_admin', 'sys_admin', 'boss'] } },
  { path: '/system-management/log', redirect: '/sys-log/login-log', meta: { hidden: true, platformOnly: true, roles: ['admin', 'super_admin', 'sys_admin'] } },
  { path: '/isystem/log', redirect: '/sys-log/login-log', meta: { hidden: true, platformOnly: true, roles: ['admin', 'super_admin', 'sys_admin'] } },
  { path: '/system-management/oss', redirect: '/file/manager', meta: { hidden: true, roles: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales', 'finance', 'finance_hq', 'hr', 'staff'] } },
  { path: '/oss/file', redirect: '/file/manager', meta: { hidden: true, roles: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales', 'finance', 'finance_hq', 'hr', 'staff'] } },
  // 旧「报表与看板」从导航退役，但保留完整路由、权限和页面，兼容历史收藏与消息深链。
  {
    path: '/report',
    component: Layout,
    redirect: '/report/list',
    meta: { title: '报表与看板', icon: 'DataAnalysis', roles: ['admin', 'super_admin', 'sys_admin', 'boss'], hidden: true },
    children: [
      { path: 'list', name: 'ReportCenter', component: () => import('@/views/report/list.vue'), meta: { title: '报表中心', icon: 'Grid' } },
      { path: 'designer', name: 'ReportDesigner', component: () => import('@/views/report/designer.vue'), meta: { title: '报表设计器', icon: 'MagicStick', roles: ['admin', 'super_admin', 'sys_admin'], platformOnly: true } },
      { path: 'preview', name: 'ReportPreview', component: () => import('@/views/report/preview.vue'), meta: { title: '报表预览', icon: 'View', hidden: true } }
    ]
  },
  // 旧「系统管理」入口保留为隐藏兼容层:整体重定向到新子模块,兼容旧链接/收藏/跨页跳转。
  {
    path: '/system',
    component: Layout,
    redirect: '/sys-org/dept',
    meta: { title: '系统设置', icon: 'Setting', roles: ['admin', 'boss', 'manager'], hidden: true },
    children: [
      // 旧路径全部保留为隐藏重定向,指向拆分后的新子模块(兼容旧收藏/跨页跳转/外部链接)。
      { path: 'index', redirect: '/sys-org/dept', meta: { hidden: true } },
      { path: 'dept', redirect: '/sys-org/dept', meta: { hidden: true } },
      { path: 'post', redirect: '/sys-org/post', meta: { hidden: true } },
      { path: 'user', redirect: '/sys-account/employee', meta: { hidden: true } },
      { path: 'employee', redirect: '/sys-account/employee', meta: { hidden: true } },
      { path: 'role', redirect: '/sys-org/role', meta: { hidden: true } },
      { path: 'role-permission', redirect: { path: '/sys-org/role', query: { tab: 'perm' } }, meta: { hidden: true } },
      { path: 'permission', redirect: '/sys-org/role', meta: { hidden: true } },
      { path: 'menu', redirect: '/sys-org/menu', meta: { hidden: true } },
      // 旧「数据字典」只映射到浙杭已有「选项字典」，不导入旧字典数据。
      { path: 'dict', redirect: '/sys-flow/dict', meta: { hidden: true } },
      { path: 'data-dict', redirect: '/sys-flow/dict', meta: { hidden: true } },
      // 旧系统日志/文件收口到现有安全页；仍由目标路由的原权限守门。
      { path: 'system-log', redirect: '/sys-log/oper-log', meta: { hidden: true } },
      { path: 'file', redirect: '/file/manager', meta: { hidden: true } },
      { path: 'file-manager', redirect: '/file/manager', meta: { hidden: true } },
      { path: 'workflow-designer', redirect: '/sys-flow/workflow', meta: { hidden: true } },
      { path: 'operation', redirect: '/sys-flow/pool-admin', meta: { hidden: true } },
      { path: 'collision-manage', redirect: '/sys-flow/collision', meta: { hidden: true } },
      { path: 'callcenter-config', redirect: '/sys-inspect/yunke-config', meta: { hidden: true } },
      { path: 'oauth-config', redirect: '/sys-inspect/yunke-config', meta: { hidden: true } },
      { path: 'openapi', redirect: '/sys-inspect/yunke-config', meta: { hidden: true } },
      { path: 'login-log', redirect: '/sys-log/login-log', meta: { hidden: true } },
      { path: 'oper-log', redirect: '/sys-log/oper-log', meta: { hidden: true } },
      { path: 'notification', redirect: '/message/center', meta: { hidden: true } },
      { path: 'distribute-config', redirect: { path: '/sys-flow/pool-admin', query: { menu: 'weight' } }, meta: { hidden: true } },
      { path: 'recycle-config', redirect: { path: '/sys-flow/pool-admin', query: { menu: 'recycle' } }, meta: { hidden: true } },
      { path: 'pool-config', redirect: { path: '/sys-flow/pool-admin', query: { menu: 'pool' } }, meta: { hidden: true } },
      { path: 'call-config', redirect: '/sys-inspect/yunke-config', meta: { hidden: true } },
    ]
  }
]
