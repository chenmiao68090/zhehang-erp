import { get, post } from './request'

// ========== 类型定义 ==========

/** KPI 指标卡 */
export interface CockpitKpi {
  totalCustomers: number
  customerGrowthRate: number
  newCustomersMonth: number
  newCustomerGrowthRate: number
  totalRevenue: number
  revenueGrowthRate: number
  monthReceipt: number
  receiptGrowthRate: number
  pendingContracts: number
  pendingContractsRate: number
  totalEmployees: number
  employeeGrowthRate: number
}

/** 营收趋势 */
export interface RevenueTrend {
  month: string
  revenue: number
  receipt: number
}

/** 客户来源分布 */
export interface CustomerSource {
  source: string
  count: number
}

/** 业绩排行 */
export interface SalesRank {
  rank: number
  employeeName: string
  department: string
  amount: number
  growthRate: number
}

/** 最新动态 */
export interface RecentEvent {
  type: 'sign' | 'receipt' | 'follow' | 'lead' | 'alert'
  content: string
  time: string
  operator: string
}

/** 区域分布 */
export interface RegionDistribution {
  province: string
  count: number
}

/** 预警数据 */
export interface AlertData {
  overdueReceiptCount: number
  overdueReceiptAmount: number
  riskCustomerCount: number
  expiringContractCount: number
  stockWarningCount: number
  abnormalApprovalCount: number
}

/** AI 摘要 */
export interface AiSummary {
  content: string
  generatedAt: string
  provider: string
}

// ========== API 调用 ==========

const BASE = '/dashboard/cockpit'

/**
 * 时间筛选参数。
 * - period: today/week/month/quarter/year，默认 month
 * - startDate/endDate: 自定义区间 (yyyy-MM-dd)，同时传入时后端优先用区间
 */
export interface CockpitParams {
  period?: string
  startDate?: string
  endDate?: string
}

/** KPI 指标 */
export function getCockpitKpi(params?: CockpitParams) {
  return get<{ data: CockpitKpi }>(BASE + '/kpi', params)
}

/** 营收趋势 */
export function getRevenueTrend(params?: CockpitParams) {
  return get<{ data: RevenueTrend[] }>(BASE + '/revenue-trend', params)
}

/** 客户来源分布 */
export function getCustomerSource(params?: CockpitParams) {
  return get<{ data: CustomerSource[] }>(BASE + '/customer-source', params)
}

/** 业绩排行 */
export function getSalesRank(params?: CockpitParams) {
  return get<{ data: SalesRank[] }>(BASE + '/sales-rank', params)
}

/** 最新动态 */
export function getRecentEvents(params?: CockpitParams) {
  return get<{ data: RecentEvent[] }>(BASE + '/recent-events', params)
}

/** 区域分布 */
export function getRegionDistribution(params?: CockpitParams) {
  return get<{ data: RegionDistribution[] }>(BASE + '/region-distribution', params)
}

/** 预警卡片 */
export function getAlerts(params?: CockpitParams) {
  return get<{ data: AlertData }>(BASE + '/alerts', params)
}

/** AI 经营分析摘要 */
export function getAiSummary() {
  return post<{ data: AiSummary }>(BASE + '/ai-summary')
}

/** 营收趋势下钻 - 按月查看日数据 */
export function getRevenueDrillDown(params: { month: string }) {
  return get<{ data: { date: string; revenue: number; receipt: number }[] }>(BASE + '/revenue-drill', params)
}

/** 区域分布下钻 - 按省查看城市数据 */
export function getRegionDrillDown(params: { province: string }) {
  return get<{ data: { city: string; count: number }[] }>(BASE + '/region-drill', params)
}
