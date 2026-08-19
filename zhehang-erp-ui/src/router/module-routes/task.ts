import type { RouteRecordRaw } from 'vue-router'
import { Layout } from './layout'

/**
 * 任务管理大类:既有「服务工单」(客户问题闭环)与新「任务工单」工作台并列。
 * 两者的顶层路径都单独归组,受限角色不会因为合并大类而丢原入口。
 */
export const taskRoutes: RouteRecordRaw[] = [
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
  }
]
