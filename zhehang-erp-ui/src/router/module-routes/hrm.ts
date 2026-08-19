import type { RouteRecordRaw } from 'vue-router'
import { FEIGE_HR_CHILD_ROUTES } from '../feige-suite-routes'
import { Layout } from './layout'

/** 人文中心:全员基础模块(无 roles),含员工自助与我的薪资;属静态路由。 */
export const cultureRoutes: RouteRecordRaw[] = [
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

/** 行政管理:印章登记/固定资产/办公用品/人事行政支出(归「人事中心」大类)。 */
export const adminRoutes: RouteRecordRaw[] = [
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
  }
]

/** 人力组织:招聘/假勤/薪酬/合同,组织架构与员工管理已迁至「系统管理」。 */
export const hrmRoutes: RouteRecordRaw[] = [
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
  }
]
