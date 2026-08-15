import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { isPublicRoute } from '../src/router/public-route.ts'

test('recognizes meta-public and legacy onboarding public routes', () => {
  assert.equal(isPublicRoute('/seal/submit', [{ meta: { public: true } }]), true)
  assert.equal(isPublicRoute('/onboarding/form/safe-ticket', []), true)
  assert.equal(isPublicRoute('/order/seal-order', [{ meta: { public: false } }]), false)
})

test('does not treat login as a public business page', () => {
  assert.equal(isPublicRoute('/login', []), false)
})

test('router bypasses stale JWT handling before reading the login token', () => {
  const guardPath = fileURLToPath(new URL('../src/router/guard.ts', import.meta.url))
  const source = readFileSync(guardPath, 'utf8')
  const publicBypass = source.indexOf('if (isPublicRoute(to.path, to.matched))')
  const tokenRead = source.indexOf('const token = getToken()')

  assert.ok(publicBypass >= 0, 'public-route bypass must exist')
  assert.ok(tokenRead >= 0, 'token read must exist')
  assert.ok(publicBypass < tokenRead, 'public route must bypass authentication before stale JWT is read')
})
