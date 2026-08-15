import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { consumeLogoutTransition, markLogoutTransition } from '../src/utils/logout-transition.ts'

function read(relativePath: string) {
  return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf8')
}

test('login account form does not invoke the runtime i18n compiler under strict CSP', () => {
  const source = read('src/views/login/index.vue')

  assert.doesNotMatch(source, /\$t\s*\(/)
  assert.match(source, /placeholder="请输入用户名"/)
  assert.match(source, /placeholder="请输入密码"/)
  assert.match(source, />记住我<\/el-checkbox>/)
  assert.match(source, /\n\s*登 录\n/)
})

test('strict CSP remains enabled instead of allowing unsafe eval', () => {
  const source = read('nginx.conf')
  const cspLine = source.split('\n').find((line) => line.includes('script-src')) || ''

  assert.match(cspLine, /script-src 'self'/)
  assert.doesNotMatch(cspLine, /unsafe-eval/)
})

test('the release keeps a real-browser strict-CSP login regression', () => {
  const source = read('scripts/verify-login-strict-csp.mjs')

  assert.match(source, /document\.querySelectorAll\('input'\)\.length/)
  assert.match(source, /systemErrors/)
  assert.match(source, /cspEvalEvents/)
  assert.match(source, /unsafe-eval/)
  assert.match(source, /Fetch\.failRequest/)
  assert.match(source, /\/api\/auth\/login/)
})

test('only a confirmed logout transition bypasses Cookie session restoration once', () => {
  const source = read('src/router/guard.ts')
  const loginBoundary = source.indexOf('if (!token && confirmedLogout)')
  const restoreAttempt = source.indexOf('await userStore.restoreSession()')

  assert.ok(loginBoundary >= 0, 'login boundary must exist')
  assert.ok(restoreAttempt > loginBoundary, 'login must be allowed before any refresh attempt')
  assert.match(source, /consumeLogoutTransition\(\)/)
})

test('logout transition marker is single-use', () => {
  const values = new Map<string, string>()
  const storage = {
    getItem(key: string) { return values.get(key) ?? null },
    setItem(key: string, value: string) { values.set(key, value) },
    removeItem(key: string) { values.delete(key) }
  }

  markLogoutTransition(storage)
  assert.equal(consumeLogoutTransition(storage), true)
  assert.equal(consumeLogoutTransition(storage), false)
})

test('logout replaces the document only after server confirmation', () => {
  const source = read('src/components/layout/SidebarAccount.vue')
  const start = source.indexOf('async function handleLogout()')
  const end = source.indexOf('\n}\n\nconst pwdVisible', start)
  const logoutSource = source.slice(start, end)

  assert.ok(start >= 0 && end > start, 'logout handler must exist')
  assert.match(logoutSource, /await userStore\.logout\(\)/)
  assert.match(logoutSource, /markLogoutTransition\(\)/)
  assert.match(logoutSource, /window\.location\.replace\('\/login'\)/)
  assert.match(logoutSource, /catch\s*\(_error\)/)
  assert.match(logoutSource, /window\.location\.reload\(\)/)
  assert.doesNotMatch(logoutSource, /finally\s*\{/)
  assert.doesNotMatch(logoutSource, /router\.(push|replace)\('\/login'\)/)
})
