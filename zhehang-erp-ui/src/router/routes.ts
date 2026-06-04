import type { RouteRecordRaw } from 'vue-router'

const Layout = () => import('@/components/layout/MainLayout.vue')

/** 静态路由 - 不需要权限 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
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
  { path: '/crm/customer', redirect: '/leads/workbench', meta: { hidden: true } },
  { path: '/crm/follow', redirect: '/leads/workbench', meta: { hidden: true } },
  { path: '/crm/lead', redirect: '/customer/company-pool', meta: { hidden: true } },
  { path: '/crm/contract', redirect: '/order/contract', meta: { hidden: true } },
  { path: '/sales/order', redirect: '/order/bill', meta: { hidden: true } },
  { path: '/finance/voucher', redirect: '/finance/journal', meta: { hidden: true } },
  { path: '/finance/report', redirect: '/dashboard/cockpit', meta: { hidden: true } },
  { path: '/workflow/todo', redirect: '/task-center/once', meta: { hidden: true } },
  { path: '/collaboration/notification', redirect: '/system/notification', meta: { hidden: true } },
  { path: '/leads/enterprise-master', redirect: '/customer/enterprise-master', meta: { hidden: true } },
  { path: '/leads/company-pool', redirect: '/customer/company-pool', meta: { hidden: true } },
  { path: '/leads/personal-pool', redirect: '/customer/personal-pool', meta: { hidden: true } },
  { path: '/leads/service-renewal', redirect: '/customer/service-renewal', meta: { hidden: true } },
  { path: '/leads/pool-admin', redirect: '/customer/pool-admin', meta: { hidden: true } },
  { path: '/leads/collision-manage', redirect: '/customer/collision-manage', meta: { hidden: true } },
  { path: '/supply/channel-cost', redirect: '/leads/online-roi', meta: { hidden: true } },
  { path: '/org/dept', redirect: '/hrm/dept', meta: { hidden: true } },
  { path: '/org/post', redirect: '/hrm/post', meta: { hidden: true } },
  { path: '/org/employee', redirect: '/hrm/employee', meta: { hidden: true } },
  { path: '/org/structure', redirect: '/hrm/structure', meta: { hidden: true } },
  { path: '/ai-chat/index', component: () => import('@/views/ai-chat/index.vue'), meta: { title: 'AI 助手', hidden: true } },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard/home',
    meta: { title: '首页', icon: 'HomeFilled' },
    children: [
      {
        path: 'dashboard/home',
        name: 'Home',
        component: () => import('@/views/dashboard/home.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      }
    ]
  },
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/cockpit',
    meta: { title: '驾驶舱', icon: 'DataAnalysis' },
    children: [
      {
        path: 'cockpit',
        name: 'Cockpit',
        component: () => import('@/views/dashboard/cockpit.vue'),
        meta: { title: '驾驶舱', icon: 'DataAnalysis' }
      },
      {
        path: 'marketing-stats',
        name: 'MarketingStats',
        component: () => import('@/views/report/marketing-stats.vue'),
        meta: { title: '营销统计', icon: 'TrendCharts' }
      }
    ]
  },
  {
    path: '/leads',
    component: Layout,
    redirect: '/leads/workbench',
    meta: { title: '营销获客', icon: 'Notebook' },
    children: [
      {
        path: 'workbench',
        name: 'LeadsWorkbench',
        component: () => import('@/views/leads/workbench.vue'),
        meta: { title: '运营工作台', icon: 'Monitor' }
      },
      {
        path: 'market-intelligence',
        name: 'MarketIntelligence',
        component: () => import('@/views/leads/market-intelligence.vue'),
        meta: { title: '拓客情报', icon: 'Aim' }
      },
      {
        path: 'call-workbench',
        name: 'CallWorkbench',
        component: () => import('@/views/leads/call-workbench.vue'),
        meta: { title: '电销工作台', icon: 'Phone' }
      },
      {
        path: 'online-leads',
        name: 'OnlineLeads',
        component: () => import('@/views/leads/online-leads.vue'),
        meta: { title: '网销线索', icon: 'Promotion' }
      },
      {
        path: 'online-roi',
        name: 'OnlineRoi',
        component: () => import('@/views/supply/channel-cost.vue'),
        meta: { title: '网销投产比', icon: 'TrendCharts' }
      },
      {
        path: 'campaign',
        name: 'MktCampaign',
        component: () => import('@/views/marketing/campaign.vue'),
        meta: { title: '营销活动', icon: 'Histogram' }
      }
    ]
  },
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer/enterprise-master',
    meta: { title: '客户中心', icon: 'User' },
    children: [
      {
        path: 'enterprise-master',
        name: 'EnterpriseMaster',
        component: () => import('@/views/leads/enterprise-master.vue'),
        meta: { title: '企业主体库', icon: 'OfficeBuilding' }
      },
      {
        path: 'company-pool',
        name: 'LeadsCompanyPool',
        component: () => import('@/views/leads/company-pool.vue'),
        meta: { title: '公司公海', icon: 'OfficeBuilding' }
      },
      {
        path: 'personal-pool',
        name: 'LeadsPersonalPool',
        component: () => import('@/views/leads/personal-pool.vue'),
        meta: { title: '个人私海', icon: 'User' }
      },
      {
        path: 'service-renewal',
        name: 'ServiceRenewal',
        component: () => import('@/views/leads/service-renewal.vue'),
        meta: { title: '续费管理', icon: 'Calendar' }
      },
      {
        path: 'pool-admin',
        name: 'PoolAdmin',
        component: () => import('@/views/leads/pool-admin.vue'),
        meta: { title: '公海管理', icon: 'Setting' }
      },
      {
        path: 'collision-manage',
        name: 'CollisionManage',
        component: () => import('@/views/leads/collision-manage.vue'),
        meta: { title: '撞单管理', icon: 'Warning' }
      }
    ]
  }
]

/** 动态路由 - 需要权限验证 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/order',
    component: Layout,
    redirect: '/order/bill',
    meta: { title: '订单合同', icon: 'Document', roles: ['admin', 'boss', 'manager', 'finance', 'sales'] },
    children: [
      { path: 'bill', name: 'OrderBill', component: () => import('@/views/order/bill.vue'), meta: { title: '提单系统', icon: 'Tickets', roles: ['admin', 'boss', 'manager', 'finance', 'sales'] } },
      { path: 'finance-check', name: 'OrderFinanceCheck', component: () => import('@/views/order/finance-check.vue'), meta: { title: '财务核对', icon: 'Checked', roles: ['admin', 'boss', 'finance'] } },
      { path: 'contract', name: 'OrderContract', component: () => import('@/views/order/contract.vue'), meta: { title: '合同管理', icon: 'Document', roles: ['admin', 'boss', 'manager', 'finance'] } }
    ]
  },
  {
    path: '/task-center',
    component: Layout,
    redirect: '/task-center/once',
    meta: { title: '服务交付', icon: 'List', roles: ['admin', 'boss', 'manager', 'sales'] },
    children: [
      { path: 'once', name: 'TaskOnce', component: () => import('@/views/task-center/once.vue'), meta: { title: '一次性任务', icon: 'DocumentChecked' } },
      { path: 'periodic', name: 'TaskPeriodic', component: () => import('@/views/task-center/periodic.vue'), meta: { title: '周期性任务', icon: 'Timer' } },
      { path: 'department', name: 'TaskDepartment', component: () => import('@/views/task-center/department.vue'), meta: { title: '项目部任务', icon: 'Suitcase' } },
      { path: 'boss', name: 'TaskBoss', component: () => import('@/views/task-center/boss.vue'), meta: { title: '老板安排任务', icon: 'Star' } },
      { path: 'handover', name: 'TaskHandover', component: () => import('@/views/task-center/handover.vue'), meta: { title: '客户交接', icon: 'Switch' } },
      { path: 'commission', name: 'TaskCommission', component: () => import('@/views/task-center/commission.vue'), meta: { title: '提成结算', icon: 'Money' } },
      { path: 'sales-performance', name: 'SalesPerformance', component: () => import('@/views/sales/performance.vue'), meta: { title: '销售业绩', icon: 'TrendCharts' } },
      { path: 'satisfaction', name: 'TaskSatisfaction', component: () => import('@/views/task-center/satisfaction.vue'), meta: { title: '满意度回访', icon: 'Star' } }
    ]
  },
  {
    path: '/business',
    component: Layout,
    redirect: '/business/index',
    meta: { title: '业务管理', icon: 'Briefcase', roles: ['admin', 'boss', 'manager'] },
    children: [
      { path: 'index', name: 'BusinessIndex', component: () => import('@/views/business/index.vue'), meta: { title: '业务管理', icon: 'Briefcase' } }
    ]
  },
  {
    path: '/supply',
    component: Layout,
    redirect: '/supply/channel-partner',
    meta: { title: '渠道管理', icon: 'Van', roles: ['admin', 'boss', 'manager'] },
    children: [
      { path: 'channel-partner', name: 'SupplyChannelPartner', component: () => import('@/views/supply/channel-partner.vue'), meta: { title: '同行渠道' } },
      { path: 'vendor', name: 'SupplyVendor', component: () => import('@/views/supply/vendor.vue'), meta: { title: '地址供应商' } },
      { path: 'receipt', name: 'SupplyReceipt', component: () => import('@/views/supply/receipt.vue'), meta: { title: '地址资源池' } },
      { path: 'purchase', name: 'SupplyPurchase', component: () => import('@/views/supply/purchase.vue'), meta: { title: '资源补充单' } }
    ]
  },
  {
    path: '/finance',
    component: Layout,
    redirect: '/finance/journal',
    meta: { title: '财务结算', icon: 'Wallet', roles: ['admin', 'boss', 'finance'] },
    children: [
      { path: 'journal', name: 'FinJournal', component: () => import('@/views/finance/journal.vue'), meta: { title: '日记账', icon: 'Notebook' } },
      { path: 'petty-cash', name: 'FinPettyCash', component: () => import('@/views/finance/petty-cash.vue'), meta: { title: '备用金管理', icon: 'Money' } },
      { path: 'expense', name: 'FinExpense', component: () => import('@/views/finance/expense.vue'), meta: { title: '业务支出管理', icon: 'CreditCard' } },
      { path: 'reimburse', name: 'FinReimburse', component: () => import('@/views/finance/reimburse.vue'), meta: { title: '报销管理', icon: 'Tickets' } },
      { path: 'salary', name: 'FinSalary', component: () => import('@/views/finance/salary.vue'), meta: { title: '薪酬管理', icon: 'Coin' } },
      { path: 'cost', name: 'FinCost', component: () => import('@/views/finance/cost.vue'), meta: { title: '管理成本', icon: 'PieChart' } },
      { path: 'performance', name: 'FinPerformance', component: () => import('@/views/finance/performance.vue'), meta: { title: '绩效提成', icon: 'TrendCharts' } }
    ]
  },
  {
    path: '/hrm',
    component: Layout,
    meta: { title: '人力组织', icon: 'Avatar', roles: ['admin', 'boss', 'manager'] },
    children: [
      { path: 'structure', name: 'OrgStructure', component: () => import('@/views/org/structure.vue'), meta: { title: '组织架构图' } },
      { path: 'dept', name: 'OrgDept', component: () => import('@/views/org/dept.vue'), meta: { title: '部门管理' } },
      { path: 'post', name: 'OrgPost', component: () => import('@/views/org/post.vue'), meta: { title: '岗位管理' } },
      { path: 'employee', name: 'OrgEmployee', component: () => import('@/views/org/employee.vue'), meta: { title: '员工管理' } },
      { path: 'recruit', name: 'HrmRecruit', component: () => import('@/views/hrm/recruit.vue'), meta: { title: '招聘管理' } },
      { path: 'interview', name: 'HrmInterview', component: () => import('@/views/hrm/interview.vue'), meta: { title: '面试管理' } },
      { path: 'attendance', name: 'HrmAttendance', component: () => import('@/views/hrm/attendance.vue'), meta: { title: '考勤管理' } },
      { path: 'contract', name: 'HrmContract', component: () => import('@/views/hrm/contract.vue'), meta: { title: '劳动合同管理' } },
      { path: 'archive', name: 'HrmArchive', component: () => import('@/views/hrm/archive.vue'), meta: { title: '人员档案管理' } }
    ]
  },
  {
    path: '/file',
    component: Layout,
    meta: { title: '培训中心', icon: 'FolderOpened', roles: ['admin', 'boss', 'manager', 'sales'] },
    children: [
      { path: 'manager', name: 'FileManager', component: () => import('@/views/file/manager.vue'), meta: { title: '文件管理' } },
      { path: 'kb', name: 'FileKb', component: () => import('@/views/file/kb.vue'), meta: { title: '知识库' } },
      { path: 'article', name: 'FileArticle', component: () => import('@/views/file/article.vue'), meta: { title: '文章管理' } }
    ]
  },
  {
    path: '/call-center',
    component: Layout,
    redirect: '/call-center/monitor',
    meta: { title: '呼叫中心', icon: 'Phone', roles: ['admin', 'boss', 'manager', 'sales'] },
    children: [
      { path: 'monitor', name: 'CallCenterMonitor', component: () => import('@/views/call-center/monitor.vue'), meta: { title: '实时监控', icon: 'Monitor' } },
      { path: 'call-record', name: 'CallCenterRecord', component: () => import('@/views/call-center/call-record.vue'), meta: { title: '通话记录', icon: 'Document' } },
      { path: 'outbound', name: 'CallCenterOutbound', component: () => import('@/views/call-center/outbound.vue'), meta: { title: '外呼任务', icon: 'Promotion' } },
      { path: 'agent', name: 'CallCenterAgent', component: () => import('@/views/call-center/agent.vue'), meta: { title: '坐席管理', icon: 'Avatar' } },
      { path: 'skill', name: 'CallCenterSkill', component: () => import('@/views/call-center/skill.vue'), meta: { title: '技能组', icon: 'Connection' } },
      { path: 'number', name: 'CallCenterNumber', component: () => import('@/views/call-center/number.vue'), meta: { title: '号码与线路', icon: 'PhoneFilled' } },
      { path: 'ivr', name: 'CallCenterIvr', component: () => import('@/views/call-center/ivr.vue'), meta: { title: 'IVR 流程', icon: 'Share' } },
      { path: 'report', name: 'CallCenterReport', component: () => import('@/views/call-center/report.vue'), meta: { title: '通话报表', icon: 'TrendCharts' } }
    ]
  },
  {
    path: '/collaboration',
    component: Layout,
    redirect: '/collaboration/chat',
    meta: { title: '协作中心', icon: 'ChatLineSquare', roles: ['admin', 'boss', 'manager', 'sales'] },
    children: [
      { path: 'chat', name: 'CollabChat', component: () => import('@/views/collaboration/chat.vue'), meta: { title: '即时消息', icon: 'ChatDotRound' } },
      { path: 'contacts', name: 'CollabContacts', component: () => import('@/views/collaboration/contacts.vue'), meta: { title: '通讯录', icon: 'Notebook' } },
      { path: 'meeting', name: 'CollabMeeting', component: () => import('@/views/collaboration/meeting.vue'), meta: { title: '视频会议', icon: 'VideoCameraFilled' } },
      { path: 'docs', name: 'CollabDocs', component: () => import('@/views/collaboration/docs.vue'), meta: { title: '协作文档', icon: 'Document' } }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'Setting', roles: ['admin', 'boss', 'manager'] },
    children: [
      { path: 'user', name: 'SystemUser', component: () => import('@/views/system/user.vue'), meta: { title: '用户管理' } },
      { path: 'role', name: 'SystemRole', component: () => import('@/views/system/role.vue'), meta: { title: '角色管理' } },
      { path: 'menu', name: 'SystemMenu', component: () => import('@/views/system/menu.vue'), meta: { title: '菜单管理' } },
      { path: 'login-log', name: 'LoginLog', component: () => import('@/views/system/login-log.vue'), meta: { title: '登录日志' } },
      { path: 'oper-log', name: 'OperLog', component: () => import('@/views/system/oper-log.vue'), meta: { title: '操作日志' } },
      { path: 'notification', name: 'Notification', component: () => import('@/views/system/notification.vue'), meta: { title: '消息中心' } },
      { path: 'distribute-config', name: 'DistributeConfig', component: () => import('@/views/system/distribute-config.vue'), meta: { title: '分配规则', icon: 'Connection' } },
      { path: 'recycle-config', name: 'RecycleConfig', component: () => import('@/views/system/recycle-config.vue'), meta: { title: '回收规则', icon: 'RefreshRight' } },
      { path: 'operation', name: 'RuleEngine', component: () => import('@/views/system/operation.vue'), meta: { title: '流程引擎', icon: 'SetUp' } }
    ]
  }
]
