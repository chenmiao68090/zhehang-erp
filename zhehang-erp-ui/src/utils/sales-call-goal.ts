export const SALES_DAILY_CALL_TARGET = 400

export interface SalesCallRecordLike {
  callTime?: string
}

export interface SalesCallGoalSnapshot {
  target: number
  callCount: number
  remaining: number
  completionRate: number
  noonActual: number
  afternoonActual: number
  checkpointTarget: number
  checkpointLabel: string
  checkpointGap: number
  currentPace: number
  requiredPace: number
}

function parseCallTime(value?: string) {
  if (!value) return null
  const date = new Date(String(value).replace('T', ' ').replace(/-/g, '/'))
  return Number.isNaN(date.getTime()) ? null : date
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

function workingHoursElapsed(now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes <= 9 * 60) return 0
  if (minutes <= 12 * 60) return (minutes - 9 * 60) / 60
  if (minutes <= 13 * 60) return 3
  return Math.min(8, 3 + (minutes - 13 * 60) / 60)
}

function workingHoursRemaining(now: Date) {
  return Math.max(0, 8 - workingHoursElapsed(now))
}

function nextCheckpoint(now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes < 12 * 60) return { target: 100, label: '上午12点' }
  if (minutes < 15 * 60) return { target: 250, label: '下午15点' }
  return { target: SALES_DAILY_CALL_TARGET, label: '下班前' }
}

export function buildSalesCallGoalSnapshot(
  now: Date,
  callCountValue: number,
  records: SalesCallRecordLike[] = []
): SalesCallGoalSnapshot {
  const callCount = Math.max(0, Number(callCountValue || 0))
  const todayCalls = records
    .map(item => parseCallTime(item.callTime))
    .filter((date): date is Date => !!date && isSameDay(date, now))
  const noonActual = todayCalls.filter(date => date.getHours() < 12).length
  const afternoonActual = todayCalls.filter(date => {
    const minutes = date.getHours() * 60 + date.getMinutes()
    return minutes <= 15 * 60
  }).length
  const checkpoint = nextCheckpoint(now)
  const elapsed = workingHoursElapsed(now)
  const remainingHours = workingHoursRemaining(now)

  return {
    target: SALES_DAILY_CALL_TARGET,
    callCount,
    remaining: Math.max(0, SALES_DAILY_CALL_TARGET - callCount),
    completionRate: Math.min(100, Math.round(callCount * 100 / SALES_DAILY_CALL_TARGET)),
    noonActual,
    afternoonActual,
    checkpointTarget: checkpoint.target,
    checkpointLabel: checkpoint.label,
    checkpointGap: Math.max(0, checkpoint.target - callCount),
    currentPace: elapsed > 0 ? Math.round(callCount / elapsed) : 0,
    requiredPace: remainingHours > 0
      ? Math.ceil(Math.max(0, SALES_DAILY_CALL_TARGET - callCount) / remainingHours)
      : Math.max(0, SALES_DAILY_CALL_TARGET - callCount)
  }
}
