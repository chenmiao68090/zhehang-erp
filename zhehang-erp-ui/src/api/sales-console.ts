import { get } from './request'

export type SalesViewMode = 'boss' | 'manager' | 'employee'

export interface SalesConsoleQuery {
  startDate?: string
  endDate?: string
  ownerId?: number
  deptId?: number
  keyword?: string
  pageNum?: number
  pageSize?: number
}

export interface SalesMetricSummary {
  confirmedAmount: number
  confirmedOrderCount: number
  newBusinessAmount: number
  newBusinessCount: number
  renewalAmount: number
  renewalCount: number
  weightedForecastAmount: number
  forecastDataCompleteness: number
  targetConfigured: boolean
  targetAmount?: number | null
  targetGap?: number | null
}

export interface SalesTaskSummary {
  activeLeadCount: number
  todayActionCount: number
  overdueCount: number
  noNextActionCount: number
  highIntentCount: number
}

export interface SalesStageItem {
  code: string
  label: string
  order: number
  currentCount: number
  enteredCount: number
  advancedCount: number
  conversionRate?: number | null
  overdueCount: number
}

export interface RenewalSummary {
  outstandingCount: number
  outstandingAmount: number
  dueSoonCount: number
  dueSoonAmount: number
  overdueCount: number
  overdueAmount: number
  promisedCount: number
  promisedAmount: number
  badRiskCount: number
  badRiskAmount: number
}

export interface SalesActionItem {
  leadId: number
  companyName: string
  ownerId: number
  ownerName: string
  deptId?: number | null
  deptName?: string
  stageCode: string
  stageName: string
  nextActionType?: string
  nextActionTime?: string
  lastFollowTime?: string
  expectedAmount: number
  actionType: 'OVERDUE' | 'NO_ACTION' | 'TODAY'
  severity: string
  ageDays: number
  customerLevel?: string
}

export interface SalesExceptionItem {
  type: string
  label: string
  severity: string
  count: number
  amount?: number | null
}

export interface SalesBossAction {
  type: string
  title: string
  reason: string
  severity: string
  count: number
  amount?: number | null
}

export interface SalesTeamMember {
  ownerId: number
  ownerName: string
  deptId?: number
  deptName?: string
  activeLeadCount: number
  overdueCount: number
  noNextActionCount: number
  confirmedAmount: number
  confirmedOrderCount: number
}

export interface SalesOwnerOption {
  id: number
  name: string
  deptId?: number
  deptName?: string
}

export interface SalesDepartmentOption {
  id: number
  name: string
}

export interface SalesConsoleOverview {
  viewMode: SalesViewMode
  scope: { mode: string; label: string; ownerId?: number; deptId?: number }
  range: { startDate: string; endDate: string }
  dataSince?: string | null
  historyAvailable: boolean
  metrics: SalesMetricSummary
  taskSummary: SalesTaskSummary
  newBusinessFunnel: SalesStageItem[]
  renewalSummary: RenewalSummary
  actions: SalesActionItem[]
  exceptions: SalesExceptionItem[]
  bossActions: SalesBossAction[]
  team: SalesTeamMember[]
  filters: { owners: SalesOwnerOption[]; departments: SalesDepartmentOption[] }
}

export interface SalesStageCustomer {
  leadId: number
  companyName: string
  ownerId: number
  ownerName: string
  deptId?: number
  deptName?: string
  stageCode: string
  stageName: string
  stageEnteredAt?: string
  stageAgeDays: number
  nextActionType?: string
  nextActionTime?: string
  lastFollowTime?: string
  expectedAmount: number
  overdue: boolean
  customerLevel?: string
}

export interface PageResult<T> {
  records: T[]
  list?: T[]
  total: number
  current: number
  size: number
}

export function getSalesConsoleOverview(params: SalesConsoleQuery) {
  return get<{ data: SalesConsoleOverview }>('/crm/sales-console/overview', params)
}

export function getSalesStageCustomers(stageCode: string, params: SalesConsoleQuery) {
  return get<{ data: PageResult<SalesStageCustomer> }>(
    `/crm/sales-console/stages/${stageCode}/customers`,
    params
  )
}
