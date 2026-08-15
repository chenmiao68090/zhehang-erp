import type { RouteRecordRaw } from 'vue-router'
import { FEIGE_SUITE_PAGES } from '@/views/feige-suite/catalog'

const SuitePage = () => import('@/views/feige-suite/page.vue')

export const LOCAL_PREVIEW_ROUTES: RouteRecordRaw[] = [
  {
    path: '/local-preview/sales-ai-copilot',
    component: () => import('@/views/local-preview/sales-ai-copilot.vue'),
    meta: { title: '销售 AI 教练本地验收', hidden: true, public: true }
  },
  {
    path: '/local-preview/feige-suite',
    component: () => import('@/views/feige-suite/preview-layout.vue'),
    redirect: '/local-preview/feige-suite/learning/knowledge-exam?suitePreview=1',
    meta: { title: '业务中心本地预览', hidden: true, public: true },
    children: FEIGE_SUITE_PAGES.map((page) => ({
      path: `${page.group}/${page.code}`,
      name: `Local_FeigeSuite_${page.group}_${page.code}`.replaceAll('-', '_'),
      component: SuitePage,
      props: { pageCode: page.code },
      meta: { title: page.title, pageCode: page.code, public: true, legacyPath: page.legacyPath }
    }))
  },
  {
    path: '/local-preview/feige-order-contract',
    component: () => import('@/views/feige-order-contract/preview-layout.vue'),
    redirect: '/local-preview/feige-order-contract/orders?zhehangPreview=1',
    meta: { title: '订单与合同本地预览', hidden: true, public: true },
    children: [
      { path: 'orders', component: () => import('@/views/feige-order-contract/orders.vue'), meta: { title: '订单管理', public: true } },
      { path: 'new-order', component: () => import('@/views/feige-order-contract/new-order.vue'), meta: { title: '新单录入', public: true } },
      { path: 'refunds', component: () => import('@/views/feige-order-contract/refunds.vue'), meta: { title: '退费订单', public: true } },
      { path: 'unreceived', component: () => import('@/views/feige-order-contract/unreceived.vue'), meta: { title: '未收款订单', public: true } },
      { path: 'contracts', component: () => import('@/views/feige-order-contract/contracts.vue'), meta: { title: '代理记账合同', public: true } }
    ]
  },
  {
    path: '/local-preview/feige-task',
    component: () => import('@/views/task-workbench/preview-layout.vue'),
    redirect: '/local-preview/feige-task/business-task?taskPreview=1',
    meta: { title: '任务工单十页本地预览', hidden: true, public: true },
    children: [
      { path: 'business-task', component: () => import('@/views/task-workbench/business-task.vue'), meta: { title: '业务任务', public: true } },
      { path: 'one-time-task', component: () => import('@/views/task-workbench/one-time-task.vue'), meta: { title: '一次性任务', public: true } },
      { path: 'recurring-task', component: () => import('@/views/task-workbench/recurring-task.vue'), meta: { title: '周期任务', public: true } },
      { path: 'project-dept-task', component: () => import('@/views/task-workbench/project-dept-task.vue'), meta: { title: '项目部门任务', public: true } },
      { path: 'special-task', component: () => import('@/views/task-workbench/special-task.vue'), meta: { title: '专项任务', public: true } },
      { path: 'workflow-task', component: () => import('@/views/task-workbench/workflow-task.vue'), meta: { title: '工作计划任务', public: true } },
      { path: 'workflow-report', component: () => import('@/views/task-workbench/workflow-report.vue'), meta: { title: '工作计划报表', public: true } },
      { path: 'goal-setting', component: () => import('@/views/task-workbench/goal-setting.vue'), meta: { title: '目标设置', public: true } },
      { path: 'workflow-template', component: () => import('@/views/task-workbench/workflow-template.vue'), meta: { title: '计划模板', public: true } },
      { path: 'subordinate-view', component: () => import('@/views/task-workbench/subordinate-view.vue'), meta: { title: '下属工作视图', public: true } }
    ]
  }
]
