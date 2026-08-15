import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSalesCallGoalSnapshot, SALES_DAILY_CALL_TARGET } from '../src/utils/sales-call-goal.ts'

test('computes the fixed 400-call target and afternoon checkpoint', () => {
  const now = new Date(2026, 6, 13, 14, 0, 0)
  const records = [
    { callTime: '2026-07-13 10:00:00' },
    { callTime: '2026-07-13 12:30:00' },
    { callTime: '2026-07-13 14:00:00' },
    { callTime: '2026-07-12 10:00:00' }
  ]
  const snapshot = buildSalesCallGoalSnapshot(now, 168, records)

  assert.equal(snapshot.target, SALES_DAILY_CALL_TARGET)
  assert.equal(snapshot.callCount, 168)
  assert.equal(snapshot.remaining, 232)
  assert.equal(snapshot.completionRate, 42)
  assert.equal(snapshot.noonActual, 1)
  assert.equal(snapshot.afternoonActual, 3)
  assert.equal(snapshot.checkpointTarget, 250)
  assert.equal(snapshot.checkpointGap, 82)
  assert.equal(snapshot.checkpointLabel, '下午15点')
  assert.equal(snapshot.currentPace, 42)
  assert.equal(snapshot.requiredPace, 58)
})

test('never returns negative remaining calls after exceeding the target', () => {
  const snapshot = buildSalesCallGoalSnapshot(new Date(2026, 6, 13, 18, 30), 420)
  assert.equal(snapshot.remaining, 0)
  assert.equal(snapshot.completionRate, 100)
  assert.equal(snapshot.requiredPace, 0)
  assert.equal(snapshot.checkpointGap, 0)
})

test('uses the noon checkpoint before midday and ignores invalid dates', () => {
  const snapshot = buildSalesCallGoalSnapshot(new Date(2026, 6, 13, 10, 30), 45, [
    { callTime: 'invalid' },
    { callTime: '2026-07-13 09:30:00' }
  ])
  assert.equal(snapshot.checkpointTarget, 100)
  assert.equal(snapshot.checkpointLabel, '上午12点')
  assert.equal(snapshot.noonActual, 1)
  assert.equal(snapshot.checkpointGap, 55)
  assert.ok(snapshot.currentPace > 0)
  assert.ok(snapshot.requiredPace > 0)
})
