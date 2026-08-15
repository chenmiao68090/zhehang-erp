import type { RouteRecordRaw } from 'vue-router'
import { FEIGE_SUITE_GROUPS, FEIGE_SUITE_PAGES, pagesByGroup } from '@/views/feige-suite/catalog'

const Layout = () => import('@/components/layout/MainLayout.vue')
const SuitePage = () => import('@/views/feige-suite/page.vue')

const GROUP_ROLES: Record<string, string[]> = {
  learning: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales', 'finance', 'finance_hq', 'hr', 'staff'],
  consultant: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales'],
  management: ['admin', 'boss', 'manager', 'dept_manager'],
  finance: ['admin', 'boss', 'manager', 'finance', 'finance_hq'],
  knowledge: ['admin', 'boss', 'manager', 'dept_manager', 'sales', 'online_sales', 'finance', 'finance_hq', 'hr', 'staff'],
  salary: ['admin', 'boss', 'manager', 'finance', 'finance_hq', 'hr', 'staff'],
  reimbursement: ['admin', 'boss', 'manager', 'dept_manager', 'finance', 'finance_hq', 'hr', 'sales', 'online_sales', 'staff'],
  notice: ['admin', 'boss', 'manager', 'dept_manager', 'finance', 'finance_hq', 'hr', 'sales', 'online_sales', 'staff']
}

function routeName(group: string, code: string): string {
  return `FeigeSuite_${group}_${code}`.replaceAll('-', '_')
}

function childRoute(page: (typeof FEIGE_SUITE_PAGES)[number], path = page.code): RouteRecordRaw {
  return {
    path,
    name: routeName(page.group, page.code),
    component: SuitePage,
    props: { pageCode: page.code },
    meta: { title: page.title, icon: page.icon, pageCode: page.code, legacyPath: page.legacyPath }
  }
}

export const FEIGE_SUITE_ROUTES: RouteRecordRaw[] = FEIGE_SUITE_GROUPS
  .filter((group) => group.code !== 'hr')
  .map((group) => {
    const children = pagesByGroup(group.code).map((page) => childRoute(page))
    return {
      path: group.basePath,
      component: Layout,
      redirect: `${group.basePath}/${children[0].path}`,
      meta: { title: group.title, icon: group.icon, roles: GROUP_ROLES[group.code] },
      children
    }
  })

export const FEIGE_HR_CHILD_ROUTES: RouteRecordRaw[] = pagesByGroup('hr').map((page) => childRoute(page, `feige-${page.code}`))
