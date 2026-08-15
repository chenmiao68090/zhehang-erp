import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  LOGIN_PAGE_UPDATED_MESSAGE,
  resolveAuthenticatedAccessToken
} from '../src/utils/authenticated-access.ts'

test('V214 accepts the V210+ access-only login contract without reading a refresh token', async () => {
  let restoreCalls = 0
  const access = await resolveAuthenticatedAccessToken({
    action: 'AUTHENTICATED',
    accessToken: 'test.access.only'
  }, async () => {
    restoreCalls += 1
    return 'unexpected.restored.access'
  })

  assert.equal(access, 'test.access.only')
  assert.equal(restoreCalls, 0)
})

test('an AUTHENTICATED response without access restores once from the HttpOnly cookie', async () => {
  let restoreCalls = 0
  const access = await resolveAuthenticatedAccessToken({
    action: 'AUTHENTICATED'
  }, async () => {
    restoreCalls += 1
    return 'test.cookie.restored.access'
  })

  assert.equal(access, 'test.cookie.restored.access')
  assert.equal(restoreCalls, 1)
})

test('a failed Cookie restore is attempted once and gives an actionable page-refresh message', async () => {
  let restoreCalls = 0
  await assert.rejects(
    resolveAuthenticatedAccessToken({ action: 'AUTHENTICATED' }, async () => {
      restoreCalls += 1
      return null
    }),
    { message: LOGIN_PAGE_UPDATED_MESSAGE }
  )

  assert.equal(restoreCalls, 1)
  assert.match(LOGIN_PAGE_UPDATED_MESSAGE, /页面已更新/)
  assert.match(LOGIN_PAGE_UPDATED_MESSAGE, /刷新页面/)
})

test('the login chain accepts AUTHENTICATED tokens in exactly one layer', () => {
  const storePath = fileURLToPath(new URL('../src/stores/user.ts', import.meta.url))
  const storeSource = readFileSync(storePath, 'utf8')
  const loginStart = storeSource.indexOf('async function login(')
  const loginEnd = storeSource.indexOf('\n  async function getUserInfo(', loginStart)
  const loginSource = storeSource.slice(loginStart, loginEnd)

  assert.ok(loginStart >= 0 && loginEnd > loginStart, 'user store login function must exist')
  assert.doesNotMatch(loginSource, /acceptAuthTokens\(/)

  const viewPath = fileURLToPath(new URL('../src/views/login/index.vue', import.meta.url))
  const viewSource = readFileSync(viewPath, 'utf8')
  const processStart = viewSource.indexOf('async function processAuthResult(')
  const processEnd = viewSource.indexOf('\nasync function submitInitialPassword(', processStart)
  const processSource = viewSource.slice(processStart, processEnd)

  assert.ok(processStart >= 0 && processEnd > processStart, 'login result processor must exist')
  assert.match(processSource, /await userStore\.acceptAuthTokens\(result\)/)
})

test('the V214 fallback sends an empty body and never reads a legacy refresh token', () => {
  const requestPath = fileURLToPath(new URL('../src/api/request.ts', import.meta.url))
  const requestSource = readFileSync(requestPath, 'utf8')
  const performStart = requestSource.indexOf('async function performCookieOnlyTokenRefresh(')
  const performEnd = requestSource.indexOf('\n/**\n * V214 login compatibility path.', performStart)
  const performSource = requestSource.slice(performStart, performEnd)
  const fallbackStart = requestSource.indexOf('export async function restoreAccessTokenFromHttpOnlyCookie(')
  const fallbackEnd = requestSource.indexOf('\nfunction redirectToLogin(', fallbackStart)
  const fallbackSource = requestSource.slice(fallbackStart, fallbackEnd)

  assert.ok(performStart >= 0 && performEnd > performStart, 'Cookie-only request must exist')
  assert.ok(fallbackStart >= 0 && fallbackEnd > fallbackStart, 'Cookie-only wrapper must exist')
  assert.doesNotMatch(performSource + fallbackSource, /getRefreshToken\(/)
  assert.match(performSource, /service\.post\([\s\S]*?'\/auth\/refresh',[\s\S]*?\{\},/)
  assert.match(fallbackSource, /lockManager\.request\([\s\S]*?'zhehang-auth-refresh'/)
  assert.match(fallbackSource, /performCookieOnlyTokenRefresh\(lifecycleVersion\)/)

  const storePath = fileURLToPath(new URL('../src/stores/user.ts', import.meta.url))
  const storeSource = readFileSync(storePath, 'utf8')
  assert.match(storeSource, /resolveAuthenticatedAccessToken\(data, restoreAccessTokenFromHttpOnlyCookie\)/)
})
