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

/** 业绩看板 - 单条业务线到款 */
export interface BizPerfLine {
  name: string
  amount: number
}

/** 业绩看板 - 汇总数据 */
export interface BizPerfData {
  total: number
  lines: BizPerfLine[]
}

/**
 * 业绩看板数据
 * @param period 时间范围 month/year，默认 year
 * @param scope 数据范围 person/team，可选
 */
export function getBizPerf(period?: string, scope?: string) {
  return get<{ data: BizPerfData }>(BASE + '/biz-perf', { period, scope })
}

/** 业绩排行 - 单人行(到款按订单财务确认口径归业务员) */
export interface PerfRankRow {
  userId: number
  name: string
  deptName?: string | null
  amount: number
  orderCount: number
  avgAmount: number
  share: number
  rank: number
  prevRank?: number | null
  prevAmount?: number | null
  currentUser?: boolean
}

/** 业绩排行 - 汇总数据 */
export interface PerfRankData {
  list: PerfRankRow[]
  me: { rank: number | null; amount: number; orderCount: number; total: number }
  teamTotal: number
  startDate: string
  endDate: string
}

/**
 * 业绩排行(我的结果页):按业务员统计区间内已到款金额/单数,含上一等长周期名次对比。
 * @param startDate yyyy-MM-dd,为空默认本月1日
 * @param endDate   yyyy-MM-dd,为空默认今天
 */
export function getPerfRank(startDate?: string, endDate?: string) {
  return get<{ data: PerfRankData }>(BASE + '/perf-rank', { startDate, endDate })
}

/**
 * cockpit 接口聚合对象（业绩看板页按 cockpitApi.getBizPerf 方式调用）
 */
export const cockpitApi = {
  getBizPerf,
  getPerfRank
}
