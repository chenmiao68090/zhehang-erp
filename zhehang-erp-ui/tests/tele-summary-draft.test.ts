import assert from 'node:assert/strict'
import test from 'node:test'
import {
  evaluateTeleSummaryDraftLead,
  isTeleSummaryDraftStaleError
} from '../src/utils/tele-summary-draft.ts'

test('keeps an unfinished summary for the current salesperson active private lead', () => {
  assert.equal(evaluateTeleSummaryDraftLead({
    id: 18,
    ownerId: 7,
    ownership: 'private',
    status: 1
  }, 18, 7), 'active')
})

test('marks deleted, returned, transferred and ended leads as stale', () => {
  assert.equal(evaluateTeleSummaryDraftLead(null, 18, 7), 'stale')
  assert.equal(evaluateTeleSummaryDraftLead({ id: 18, ownerId: null, ownership: 'pool', status: 1 }, 18, 7), 'stale')
  assert.equal(evaluateTeleSummaryDraftLead({ id: 18, ownerId: 9, ownership: 'private', status: 1 }, 18, 7), 'stale')
  assert.equal(evaluateTeleSummaryDraftLead({ id: 18, ownerId: 7, ownership: 'private', status: 3 }, 18, 7), 'stale')
})

test('keeps manual calls and unknown login bootstrap state', () => {
  assert.equal(evaluateTeleSummaryDraftLead(null, 0, 7), 'active')
  assert.equal(evaluateTeleSummaryDraftLead({ id: 18, ownerId: 7, ownership: 'private', status: 1 }, 18, null), 'unknown')
})

test('only treats ownership and existence errors as stale', () => {
  assert.equal(isTeleSummaryDraftStaleError(new Error('无权限查看该线索')), true)
  assert.equal(isTeleSummaryDraftStaleError(new Error('线索不存在或已删除')), true)
  assert.equal(isTeleSummaryDraftStaleError(new Error('网络连接异常，请稍后重试')), false)
})
