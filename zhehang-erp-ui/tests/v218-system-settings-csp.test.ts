import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

test('Vue-i18n uses CSP-safe JIT compilation and production verifies the emitted bundle', () => {
  const vite = read('vite.config.ts')
  const verify = read('scripts/verify-production-build.mjs')

  assert.match(vite, /__INTLIFY_JIT_COMPILATION__:\s*true/)
  assert.match(vite, /__INTLIFY_DROP_MESSAGE_COMPILER__:\s*false/)
  assert.match(vite, /__VUE_I18N_LEGACY_API__:\s*false/)
  assert.match(verify, /vendor-i18n/)
  assert.match(verify, /CSP-unsafe Vue-i18n runtime compiler/)
  assert.match(verify, /unresolved Vue-i18n feature flag/)
})

test('system settings keeps one safe source of truth for users, permissions, dictionary, logs and files', () => {
  const routes = read('src/router/routes.ts')
  const legacyStart = routes.indexOf('// 旧「系统管理」入口保留为隐藏兼容层')
  assert.notEqual(legacyStart, -1)
  const legacyRoutes = routes.slice(legacyStart)

  assert.match(routes, /title:\s*'员工与账号'/)
  assert.match(routes, /title:\s*'角色与权限'/)
  assert.match(legacyRoutes, /path:\s*'user',[^\n]+\/sys-account\/employee/)
  assert.match(legacyRoutes, /path:\s*'role-permission',[^\n]+\/sys-org\/role/)
  assert.match(legacyRoutes, /path:\s*'dict',[^\n]+\/sys-flow\/dict/)
  assert.match(legacyRoutes, /path:\s*'system-log',[^\n]+\/sys-log\/oper-log/)
  assert.match(legacyRoutes, /path:\s*'file-manager',[^\n]+\/file\/manager/)

  for (const [from, to] of [
    ['/system-management/user', '/sys-org/employee'],
    ['/isystem/roleUserList', '/sys-org/role'],
    ['/system-management/permission', '/sys-org/menu'],
    ['/system-management/dict', '/sys-flow/dict'],
    ['/system-management/log', '/sys-log/login-log'],
    ['/oss/file', '/file/manager']
  ]) {
    assert.ok(routes.includes(`path: '${from}', redirect: '${to}'`), `${from} should safely redirect to ${to}`)
  }
  assert.match(routes, /path:\s*'\/system-management\/log'[^\n]+platformOnly:\s*true/)
})

test('unsafe Feige administration consoles are not exposed by the compatibility layer', () => {
  const routes = read('src/router/routes.ts')
  const legacyStart = routes.indexOf('// 旧「系统管理」入口保留为隐藏兼容层')
  const legacyRoutes = routes.slice(legacyStart)

  for (const path of ['data-source', 'online-user', 'quartz-job', 'ai-config']) {
    assert.doesNotMatch(legacyRoutes, new RegExp(`path:\\s*['\"]${path}['\"]`))
  }

  for (const path of [
    '/system-management/data-source',
    '/system-management/quartz',
    '/system-management/online-user',
    '/system-management/ai-config'
  ]) {
    assert.ok(!routes.includes(`path: '${path}'`), `${path} must not be exposed`)
  }
})
