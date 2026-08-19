import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/**
 * 系统管理大类:规则与字段、组织与权限、第三方对接、平台与审计、报表看板,
 * 以及全部旧系统设置路径的隐藏兼容层(只做精确重定向,不注册父级通配符)。
 */
export const systemRoutes: RouteRecordRaw[] = [
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
