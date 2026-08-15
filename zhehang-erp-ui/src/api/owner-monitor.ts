import { get } from './request'

/** 收款日记账事实统计：金额来自全部未作废登记，包含草稿、待审、驳回待修和反审核。 */
export interface OwnerCashStats {
  todayAmount: number
  todayCount: number
  todayMatched: number
  todayUnmatched: number
  monthAmount: number
  monthMatched: number
  monthUnmatched: number
  waitingCount: number
  partialCount: number
  pendingReviewCount: number
  exceptionCount: number
  over24hCount: number
}

export function getOwnerCashStats() {
  return get<OwnerCashStats>('/dashboard/owner-monitor/cash-stats')
}
