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

/** KPI 指标 */
export function getCockpitKpi() {
  return get<{ data: CockpitKpi }>(BASE + '/kpi')
}

/** 营收趋势 */
export function getRevenueTrend() {
  return get<{ data: RevenueTrend[] }>(BASE + '/revenue-trend')
}

/** 客户来源分布 */
export function getCustomerSource() {
  return get<{ data: CustomerSource[] }>(BASE + '/customer-source')
}

/** 业绩排行 */
export function getSalesRank() {
  return get<{ data: SalesRank[] }>(BASE + '/sales-rank')
}

/** 最新动态 */
export function getRecentEvents() {
  return get<{ data: RecentEvent[] }>(BASE + '/recent-events')
}

/** 区域分布 */
export function getRegionDistribution() {
  return get<{ data: RegionDistribution[] }>(BASE + '/region-distribution')
}

/** 预警卡片 */
export function getAlerts() {
  return get<{ data: AlertData }>(BASE + '/alerts')
}

/** AI 经营分析摘要 */
export function getAiSummary() {
  return post<{ data: AiSummary }>(BASE + '/ai-summary')
}
