import test from 'node:test'
import assert from 'node:assert/strict'
import { formatImPresence } from '../src/utils/im-presence.ts'

const now = new Date(2026, 6, 13, 10, 30, 0)

test('online state takes precedence over last active time', () => {
  assert.equal(formatImPresence(true, '2026-07-12T09:00:00', false, now), '在线')
})

test('recent offline users show a useful relative time', () => {
  assert.equal(formatImPresence(false, '2026-07-13T10:29:20', false, now), '刚刚在线')
  assert.equal(formatImPresence(false, '2026-07-13T10:18:00', false, now), '12分钟前在线')
  assert.equal(formatImPresence(false, '2026-07-13T09:05:00', false, now), '今天 09:05在线')
})

test('older offline users show yesterday or calendar date', () => {
  assert.equal(formatImPresence(false, '2026-07-12T21:06:00', false, now), '昨天 21:06在线')
  assert.equal(formatImPresence(false, '2026-06-30T08:00:00', true, now), '6/30')
})

test('missing or invalid last activity falls back to offline', () => {
  assert.equal(formatImPresence(false, undefined, false, now), '离线')
  assert.equal(formatImPresence(false, 'invalid', false, now), '离线')
})
