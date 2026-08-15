import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeImMessages, type ImMessageIdentity } from '../src/utils/im-message-merge.ts'

type Message = ImMessageIdentity & { text: string }

function optimistic(clientMessageId: string): Message {
  return { id: -1, conversationId: 7, clientMessageId, seq: 13, status: 'sending', text: '测试', createdAt: '2026-07-13 02:00:00' }
}

function canonical(clientMessageId: string): Message {
  return { id: '1934428712345678901', conversationId: 7, clientMessageId, seq: 13, status: 'sent', text: '测试', createdAt: '2026-07-13 02:00:01' }
}

test('WebSocket正式消息替换本地发送中消息', () => {
  const result = mergeImMessages([optimistic('client-001')], [canonical('client-001')])
  assert.equal(result.length, 1)
  assert.equal(result[0].status, 'sent')
  assert.equal(String(result[0].id), '1934428712345678901')
})

test('HTTP ACK晚到不会追加第二条消息', () => {
  const server = canonical('client-002')
  const result = mergeImMessages([optimistic('client-002'), server], [server])
  assert.equal(result.length, 1)
})

test('既有发送中和已发送重复项会被收敛', () => {
  const result = mergeImMessages([canonical('client-003'), optimistic('client-003')])
  assert.equal(result.length, 1)
  assert.equal(result[0].status, 'sent')
})

test('相同正文但不同幂等键仍是两条真实消息', () => {
  const result = mergeImMessages([canonical('client-004')], [{ ...canonical('client-005'), id: '1934428712345678902', seq: 14 }])
  assert.equal(result.length, 2)
})

test('没有clientMessageId时按正式messageId去重', () => {
  const first = { ...canonical(''), clientMessageId: '', id: '1934428712345678903' }
  const result = mergeImMessages([first], [{ ...first, status: 'sent' }])
  assert.equal(result.length, 1)
})
