import { storageGet, storageRemove } from './safe-storage'
import {
  getAuthenticationSelection,
  hasImpersonationSessionMarker,
  type AuthenticationSelection
} from './impersonation-session'

const TOKEN_KEY = 'zhehang_erp_token'
const REFRESH_TOKEN_KEY = 'refreshToken'
let baseToken = ''
let authLifecycleVersion = 0

// V210 migration: old browser storage may contain renewable credentials. They are
// consumed once by /auth/refresh and then deleted; access tokens never return to storage.
storageRemove(TOKEN_KEY)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === TOKEN_KEY || event.key === REFRESH_TOKEN_KEY) {
      authLifecycleVersion += 1
    }
  })
}

export function getAuthLifecycleVersion(): number {
  return authLifecycleVersion
}

export function advanceAuthLifecycleVersion(): void {
  authLifecycleVersion += 1
}

export function getToken(): string {
  return getCurrentAuthentication().token
}

export function getCurrentAuthentication(): AuthenticationSelection {
  return getAuthenticationSelection(getBaseToken())
}

export function getBaseToken(): string {
  return baseToken
}

export function isImpersonating(): boolean {
  return hasImpersonationSessionMarker()
}

export function setToken(token: string): void {
  baseToken = token
}

export function getRefreshToken(): string {
  return storageGet(REFRESH_TOKEN_KEY) || ''
}

export function clearLegacyRefreshToken(): void {
  storageRemove(REFRESH_TOKEN_KEY)
}

export function removeToken(): void {
  advanceAuthLifecycleVersion()
  baseToken = ''
  storageRemove(TOKEN_KEY)
  storageRemove(REFRESH_TOKEN_KEY)
}
