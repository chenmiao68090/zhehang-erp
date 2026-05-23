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
    component: () => import('@/views/login/index.vue'), // TODO: 404 page
    meta: { title: '404', hidden: true }
  },
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
    redirect: '/dashboard/list',
    meta: { title: '驾驶舱', icon: 'DataAnalysis' },
    children: [
      {
        path: 'list',
        name: 'DashboardList',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '驾驶舱', icon: 'DataAnalysis' }
      },
      {
        path: 'designer/:id',
        name: 'DashboardDesigner',
        component: () => import('@/views/dashboard/designer/index.vue'),
        meta: { title: '驾驶舱设计器', icon: 'Edit', hidden: true }
      },
      {
        path: 'preview/:id',
        name: 'DashboardPreview',
        component: () => import('@/views/dashboard/preview.vue'),
        meta: { title: '驾驶舱预览', icon: 'View', hidden: true }
      }
    ]
  },
  {
    path: '/leads',
    component: Layout,
    redirect: '/leads/dashboard',
    meta: { title: '客资管理', icon: 'Notebook' },
    children: [
      {
        path: 'dashboard',
        name: 'LeadsDashboard',
        component: () => import('@/views/crm/lead-dashboard.vue'),
        meta: { title: '运营看板', icon: 'DataAnalysis' }
      },
      {
        path: 'workbench',
        name: 'LeadsWorkbench',
        component: () => import('@/views/crm/lead-workbench.vue'),
        meta: { title: '运营工作台', icon: 'Monitor' }
      },
      {
        path: 'personal',
        name: 'LeadsPersonal',
        component: () => import('@/views/crm/lead-personal.vue'),
        meta: { title: '个人客资', icon: 'User' }
      },
      {
        path: 'pool',
        name: 'LeadsPool',
        component: () => import('@/views/crm/lead-pool.vue'),
        meta: { title: '公司公海', icon: 'OfficeBuilding' }
      },
      { path: 'call-center/agent', name: 'CcAgent', component: () => import('@/views/call-center/agent.vue'), meta: { title: '坐席管理', icon: 'Phone' } },
      { path: 'call-center/number', name: 'CcNumber', component: () => import('@/views/call-center/number.vue'), meta: { title: '号码管理' } },
      { path: 'call-center/ivr', name: 'CcIvr', component: () => import('@/views/call-center/ivr.vue'), meta: { title: 'IVR设计器' } },
      { path: 'call-center/skill', name: 'CcSkill', component: () => import('@/views/call-center/skill.vue'), meta: { title: '技能组' } },
      { path: 'call-center/call-record', name: 'CcCallRecord', component: () => import('@/views/call-center/call-record.vue'), meta: { title: '通话记录' } },
      { path: 'call-center/outbound', name: 'CcOutbound', component: () => import('@/views/call-center/outbound.vue'), meta: { title: '外呼任务' } },
      { path: 'call-center/monitor', name: 'CcMonitor', component: () => import('@/views/call-center/monitor.vue'), meta: { title: '实时监控' } },
      { path: 'call-center/report', name: 'CcReport', component: () => import('@/views/call-center/report.vue'), meta: { title: '话务报表' } }
    ]
  }
]

/** 动态路由 - 需要权限验证 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/acquisition',
    component: Layout,
    redirect: '/acquisition/tax-abnormal',
    meta: { title: 'acquisition.title', icon: 'Aim', permission: ['acquisition'] },
    children: [
      // === 基础业务 ===
      {
        path: 'tax-abnormal',
        name: 'AcqTaxAbnormal',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.taxAbnormal', icon: 'Warning', segmentCode: 'tax-abnormal', group: 'basicBusiness' }
      },
      {
        path: 'operation-abnormal',
        name: 'AcqOperationAbnormal',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.operationAbnormal', icon: 'Edit', segmentCode: 'operation-abnormal', group: 'basicBusiness' }
      },
      {
        path: 'bookkeeping',
        name: 'AcqBookkeeping',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.bookkeeping', icon: 'Notebook', segmentCode: 'bookkeeping', group: 'basicBusiness' }
      },
      {
        path: 'annual-report',
        name: 'AcqAnnualReport',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.annualReport', icon: 'Document', segmentCode: 'annual-report', group: 'basicBusiness' }
      },
      // === 同行切户 ===
      {
        path: 'peer-quality',
        name: 'AcqPeerQuality',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.peerQuality', icon: 'Service', segmentCode: 'peer-quality', group: 'peerSwitch' }
      },
      {
        path: 'peer-new',
        name: 'AcqPeerNew',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.peerNew', icon: 'OfficeBuilding', segmentCode: 'peer-new', group: 'peerSwitch' }
      },
      {
        path: 'peer-customer',
        name: 'AcqPeerCustomer',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.peerCustomer', icon: 'User', segmentCode: 'peer-customer', group: 'peerSwitch' }
      },
      // === 电商客群 ===
      {
        path: 'ecommerce',
        name: 'AcqEcommerce',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.ecommerceCompliance', icon: 'ShoppingCart', segmentCode: 'ecommerce', group: 'ecommerce' }
      },
      // === 新企商机 ===
      {
        path: 'new-biz-t1',
        name: 'AcqNewBizT1',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.newBizT1', icon: 'Timer', segmentCode: 'new-biz-t1', group: 'newBusiness' }
      },
      {
        path: 'new-biz-t7',
        name: 'AcqNewBizT7',
        component: () => import('@/views/acquisition/enterprise-list.vue'),
        meta: { title: 'acquisition.menu.newBizT7', icon: 'Calendar', segmentCode: 'new-biz-t7', group: 'newBusiness' }
      },
      // === 企业详情（隐藏路由）===
      {
        path: 'enterprise/:id',
        name: 'AcquisitionEnterpriseDetail',
        component: () => import('@/views/acquisition/enterprise-detail.vue'),
        meta: { title: 'acquisition.enterpriseDetail', hidden: true }
      }
    ]
  },
  {
    path: '/sales',
    component: Layout,
    meta: { title: '销售管理', icon: 'Coin' },
    children: [
      { path: 'quotation', name: 'SalesQuotation', component: () => import('@/views/sales/quotation.vue'), meta: { title: '报价管理' } },
      { path: 'order', name: 'SalesOrder', component: () => import('@/views/sales/order.vue'), meta: { title: '订单管理' } },
      { path: 'delivery', name: 'SalesDelivery', component: () => import('@/views/sales/delivery.vue'), meta: { title: '发货管理' } },
      { path: 'receipt', name: 'SalesReceipt', component: () => import('@/views/sales/receipt.vue'), meta: { title: '收款管理' } }
    ]
  },
  {
    path: '/crm',
    component: Layout,
    meta: { title: '客户关系', icon: 'User' },
    children: [
      { path: 'customer', name: 'CrmCustomer', component: () => import('@/views/crm/customer.vue'), meta: { title: '客户管理' } }
    ]
  },
  {
    path: '/finance',
    component: Layout,
    meta: { title: '财务管理', icon: 'Money' },
    children: [
      { path: 'voucher', name: 'FinVoucher', component: () => import('@/views/finance/voucher.vue'), meta: { title: '凭证管理' } },
      { path: 'ledger', name: 'FinLedger', component: () => import('@/views/finance/ledger.vue'), meta: { title: '账簿管理' } },
      { path: 'report', name: 'FinReport', component: () => import('@/views/finance/report.vue'), meta: { title: '财务报表' } },
      { path: 'tax', name: 'FinTax', component: () => import('@/views/finance/tax.vue'), meta: { title: '税务管理' } },
      { path: 'invoice', name: 'FinInvoice', component: () => import('@/views/finance/invoice.vue'), meta: { title: '发票管理' } },
      { path: 'reimburse', name: 'FinReimburse', component: () => import('@/views/finance/reimburse.vue'), meta: { title: '报销管理' } }
    ]
  },
  {
    path: '/project',
    component: Layout,
    meta: { title: '项目管理', icon: 'Briefcase' },
    children: [
      { path: 'list', name: 'ProjectList', component: () => import('@/views/project/list.vue'), meta: { title: '项目列表' } },
      { path: 'detail', name: 'ProjectDetail', component: () => import('@/views/project/detail.vue'), meta: { title: '项目详情', hidden: true } },
      { path: 'gantt', name: 'ProjectGantt', component: () => import('@/views/project/gantt.vue'), meta: { title: '甘特图' } },
      { path: 'board', name: 'ProjectBoard', component: () => import('@/views/project/board.vue'), meta: { title: '看板' } }
    ]
  },
  {
    path: '/supply',
    component: Layout,
    meta: { title: '供应链', icon: 'Van' },
    children: [
      { path: 'vendor', name: 'SupplyVendor', component: () => import('@/views/supply/vendor.vue'), meta: { title: '供应商管理' } },
      { path: 'purchase', name: 'SupplyPurchase', component: () => import('@/views/supply/purchase.vue'), meta: { title: '采购管理' } },
      { path: 'receipt', name: 'SupplyReceipt', component: () => import('@/views/supply/receipt.vue'), meta: { title: '入库管理' } }
    ]
  },
  {
    path: '/workflow',
    component: Layout,
    meta: { title: '工作流', icon: 'Connection' },
    children: [
      { path: 'designer', name: 'WfDesigner', component: () => import('@/views/workflow/designer.vue'), meta: { title: '流程设计' } },
      { path: 'todo', name: 'WfTodo', component: () => import('@/views/workflow/todo.vue'), meta: { title: '待办任务' } },
      { path: 'done', name: 'WfDone', component: () => import('@/views/workflow/done.vue'), meta: { title: '已办任务' } },
      { path: 'started', name: 'WfStarted', component: () => import('@/views/workflow/started.vue'), meta: { title: '我发起的' } }
    ]
  },
  {
    path: '/file',
    component: Layout,
    meta: { title: '文件知识', icon: 'FolderOpened' },
    children: [
      { path: 'manager', name: 'FileManager', component: () => import('@/views/file/manager.vue'), meta: { title: '文件管理' } },
      { path: 'kb', name: 'FileKb', component: () => import('@/views/file/kb.vue'), meta: { title: '知识库' } },
      { path: 'article', name: 'FileArticle', component: () => import('@/views/file/article.vue'), meta: { title: '文章管理' } }
    ]
  },
  {
    path: '/report',
    component: Layout,
    meta: { title: '报表中心', icon: 'PieChart' },
    children: [
      { path: 'designer', name: 'ReportDesigner', component: () => import('@/views/report/designer.vue'), meta: { title: '报表设计' } },
      { path: 'list', name: 'ReportList', component: () => import('@/views/report/list.vue'), meta: { title: '报表列表' } },
      { path: 'preview', name: 'ReportPreview', component: () => import('@/views/report/preview.vue'), meta: { title: '报表预览', hidden: true } }
    ]
  },
  {
    path: '/multidim',
    component: Layout,
    meta: { title: '多维表格', icon: 'Grid' },
    children: [
      { path: 'index', name: 'MultidimIndex', component: () => import('@/views/multidim/index.vue'), meta: { title: '表格列表' } },
      { path: 'detail', name: 'MultidimDetail', component: () => import('@/views/multidim/detail.vue'), meta: { title: '表格详情', hidden: true } }
    ]
  },
  {
    path: '/ai-chat',
    component: Layout,
    meta: { title: 'AI 助手', icon: 'ChatDotRound' },
    children: [
      { path: 'index', name: 'AiChat', component: () => import('@/views/ai-chat/index.vue'), meta: { title: 'AI 对话' } }
    ]
  },

  {
    path: '/hrm',
    component: Layout,
    meta: { title: '人力资源', icon: 'Avatar' },
    children: [
      { path: 'recruit', name: 'HrmRecruit', component: () => import('@/views/hrm/recruit.vue'), meta: { title: '招聘管理' } },
      { path: 'attendance', name: 'HrmAttendance', component: () => import('@/views/hrm/attendance.vue'), meta: { title: '考勤管理' } },
      { path: 'salary', name: 'HrmSalary', component: () => import('@/views/hrm/salary.vue'), meta: { title: '薪酬管理' } },
      { path: 'performance', name: 'HrmPerformance', component: () => import('@/views/hrm/performance.vue'), meta: { title: '绩效管理' } },
      { path: 'dept', name: 'OrgDept', component: () => import('@/views/org/dept.vue'), meta: { title: '部门管理' } },
      { path: 'post', name: 'OrgPost', component: () => import('@/views/org/post.vue'), meta: { title: '岗位管理' } },
      { path: 'employee', name: 'OrgEmployee', component: () => import('@/views/org/employee.vue'), meta: { title: '员工管理' } },
      { path: 'structure', name: 'OrgStructure', component: () => import('@/views/org/structure.vue'), meta: { title: '组织架构图' } }
    ]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      { path: 'user', name: 'SystemUser', component: () => import('@/views/system/user.vue'), meta: { title: '用户管理' } },
      { path: 'role', name: 'SystemRole', component: () => import('@/views/system/role.vue'), meta: { title: '角色管理' } },
      { path: 'menu', name: 'SystemMenu', component: () => import('@/views/system/menu.vue'), meta: { title: '菜单管理' } },
      { path: 'login-log', name: 'LoginLog', component: () => import('@/views/system/login-log.vue'), meta: { title: '登录日志' } },
      { path: 'oper-log', name: 'OperLog', component: () => import('@/views/system/oper-log.vue'), meta: { title: '操作日志' } },
      { path: 'notification', name: 'Notification', component: () => import('@/views/system/notification.vue'), meta: { title: '通知公告' } }
    ]
  }
]
