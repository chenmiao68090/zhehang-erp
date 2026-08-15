import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  IMPERSONATION_ACTOR_USER_ID,
  isCurrentImpersonationValid,
  isImpersonationExpired,
  parseImpersonationSession,
  sanitizeReturnUrl,
  selectAuthentication,
  shouldReloadImpersonationAfterPageRestore,
  type StoredImpersonationSession
} from '../src/utils/impersonation-session.ts'

const session: StoredImpersonationSession = {
  token: 'impersonation.jwt',
  sessionId: 'session-1',
  actorUserId: IMPERSONATION_ACTOR_USER_ID,
  actorName: '超级管理员',
  targetUserId: 27,
  targetName: '测试员工',
  targetDeptName: '销售部',
  roleNames: ['销售人员'],
  multipleRoles: false,
  reason: '检查销售人员权限',
  startTime: '2026-07-19T00:00:00+08:00',
  expireTime: '2099-07-19T00:30:00+08:00',
  returnUrl: '/dashboard/home',
  tabId: 'tab-1'
}

test('current-tab impersonation token takes precedence without replacing the base token', () => {
  const selected = selectAuthentication('admin.jwt', JSON.stringify(session))
  assert.equal(selected.mode, 'impersonation')
  assert.equal(selected.token, 'impersonation.jwt')
  assert.equal(selected.session?.targetUserId, 27)
})

test('a corrupt impersonation marker fails closed and never falls back to administrator', () => {
  const selected = selectAuthentication('admin.jwt', '{broken')
  assert.equal(selected.mode, 'impersonation')
  assert.equal(selected.token, '')
  assert.equal(selected.session, null)
})

test('no marker uses the original administrator session unchanged', () => {
  assert.deepEqual(selectAuthentication('admin.jwt', null), {
    mode: 'base',
    token: 'admin.jwt',
    session: null
  })
})

test('session parsing enforces fixed actor and rejects nested/platform targets', () => {
  assert.equal(parseImpersonationSession(JSON.stringify({ ...session, actorUserId: 9 })), null)
  assert.equal(parseImpersonationSession(JSON.stringify({ ...session, targetUserId: 1 })), null)
  assert.equal(parseImpersonationSession(JSON.stringify({ ...session, targetUserId: 3 })), null)
  assert.equal(parseImpersonationSession(JSON.stringify(session))?.actorUserId, 3)
})

test('expiry and return URL helpers are fail closed', () => {
  assert.equal(isImpersonationExpired({ ...session, expireTime: '2020-01-01T00:00:00Z' }), true)
  assert.equal(isImpersonationExpired(session), false)
  assert.equal(sanitizeReturnUrl('//evil.example'), '/')
  assert.equal(sanitizeReturnUrl('/login?next=/system'), '/')
  assert.equal(sanitizeReturnUrl('/customer/workbench?tab=mine'), '/customer/workbench?tab=mine')
})

test('current session restore requires active server proof and the exact target session', () => {
  assert.equal(isCurrentImpersonationValid({
    active: true,
    sessionId: session.sessionId,
    targetUserId: session.targetUserId
  }, session), true)
  assert.equal(isCurrentImpersonationValid({
    active: false,
    sessionId: session.sessionId,
    targetUserId: session.targetUserId
  }, session), false)
  assert.equal(isCurrentImpersonationValid({
    active: true,
    sessionId: 'another-session',
    targetUserId: session.targetUserId
  }, session), false)
  assert.equal(isCurrentImpersonationValid({
    active: true,
    sessionId: session.sessionId,
    targetUserId: 99
  }, session), false)
})

test('BFCache restore reloads only an impersonated tab so bootstrap and ownership run again', () => {
  assert.equal(shouldReloadImpersonationAfterPageRestore(true, true), true)
  assert.equal(shouldReloadImpersonationAfterPageRestore(false, true), false)
  assert.equal(shouldReloadImpersonationAfterPageRestore(true, false), false)

  const guardPath = fileURLToPath(new URL('../src/router/guard.ts', import.meta.url))
  const guardSource = readFileSync(guardPath, 'utf8')
  assert.match(guardSource, /installImpersonationPageRestoreGuard\(\)/)

  const sessionPath = fileURLToPath(new URL('../src/utils/impersonation-session.ts', import.meta.url))
  const sessionSource = readFileSync(sessionPath, 'utf8')
  assert.match(sessionSource, /addEventListener\('pageshow'/)
  assert.match(sessionSource, /event\.persisted/)
  assert.match(sessionSource, /window\.location\.reload\(\)/)
})

test('tab ownership never silently allows duplicate sessions when Web Locks are missing', () => {
  const ownershipPath = fileURLToPath(new URL('../src/utils/impersonation-session.ts', import.meta.url))
  const ownershipSource = readFileSync(ownershipPath, 'utf8')
  assert.match(ownershipSource, /async function claimWithBroadcastChannel/)
  assert.match(ownershipSource, /new BroadcastChannel/)
  assert.match(ownershipSource, /if \(claimed !== null\) return claimed[\s\S]*return false/)
  assert.doesNotMatch(ownershipSource, /window\.opener/)
  assert.doesNotMatch(ownershipSource, /if \(!lockManager\?\.request\) return true/)
})

test('request 401 branches out before administrator refresh and IM refuses impersonation startup', () => {
  const requestPath = fileURLToPath(new URL('../src/api/request.ts', import.meta.url))
  const requestSource = readFileSync(requestPath, 'utf8')
  const http401 = requestSource.indexOf("if (cfg._authMode === 'impersonation')")
  const refresh = requestSource.indexOf('requestNewToken(', http401)
  assert.ok(http401 >= 0, 'HTTP 401 impersonation branch must exist')
  assert.ok(refresh > http401, 'impersonation 401 must exit before refresh is attempted')

  const imPath = fileURLToPath(new URL('../src/stores/im.ts', import.meta.url))
  const imSource = readFileSync(imPath, 'utf8')
  const initialize = imSource.indexOf('async function initialize()')
  const deny = imSource.indexOf('hasImpersonationSessionMarker()', initialize)
  const channel = imSource.indexOf('new BroadcastChannel', initialize)
  assert.ok(initialize >= 0 && deny > initialize && channel > deny, 'IM must deny impersonation before opening BroadcastChannel')
})
