import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/** 审批中心:飞书风三栏工作台,全员基础模块(无 roles);属静态路由。 */
export const approvalRoutes: RouteRecordRaw[] = [
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
  }
]

/** 中台监控:微信/云客/外呼监察(页面全部在 views/customer 下)。 */
export const inspectRoutes: RouteRecordRaw[] = [
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
  }
]

/** 印章体系:刻章业务看板与成本台账。 */
export const sealRoutes: RouteRecordRaw[] = [
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
  }
]

/** 知识文库:入口已下线,保留旧路由供历史链接访问。 */
export const fileRoutes: RouteRecordRaw[] = [
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
  }
]

/** 旧呼叫中心兼容层:纯前端内存演示已下线,深链统一进真实销售工作台。 */
export const callCenterRoutes: RouteRecordRaw[] = [
  // 旧呼叫中心是纯前端内存演示；全部旧深链统一进入真实销售工作台。
  { path: '/call-center', redirect: '/customer/workbench', meta: { hidden: true } },
  { path: '/call-center/:pathMatch(.*)*', redirect: '/customer/workbench', meta: { hidden: true } }
]
