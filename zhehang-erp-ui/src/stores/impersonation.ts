import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  impersonationApi,
  type ImpersonationSessionView,
  type ImpersonationStartResult
} from '@/api/impersonation'
import { advanceAuthLifecycleVersion } from '@/utils/auth'
import {
  assertImpersonationStorageAvailable,
  claimImpersonationTabOwnership,
  clearImpersonationSession,
  getOrCreateTabId,
  hasImpersonationSessionMarker,
  IMPERSONATION_ACTOR_USER_ID,
  isAllowedImpersonationTargetUserId,
  isCurrentImpersonationValid,
  isImpersonationExpired,
  markImpersonationRestorePending,
  readImpersonationSession,
  releaseImpersonationTabOwnership,
  sanitizeReturnUrl,
  writeImpersonationSession,
  type StoredImpersonationSession
} from '@/utils/impersonation-session'
import { useImStore } from '@/stores/im'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

function unwrapData<T>(response: unknown): T {
  const value = response as { data?: T } | T
  return ((value as { data?: T })?.data ?? value) as T
}

function currentPath(): string {
  if (typeof window === 'undefined') return '/'
  return sanitizeReturnUrl(`${window.location.pathname}${window.location.search}${window.location.hash}`)
}

export const useImpersonationStore = defineStore('impersonation', () => {
  const session = ref<StoredImpersonationSession | null>(readImpersonationSession())
  const bootstrapped = ref(false)
  const switching = ref(false)
  const ending = ref(false)
  const active = computed(() => session.value !== null)
  const current = computed(() => session.value)
  let expiryTimer: number | undefined

  function clearExpiryTimer() {
    if (expiryTimer !== undefined && typeof window !== 'undefined') window.clearTimeout(expiryTimer)
    expiryTimer = undefined
  }

  function scheduleExpiry() {
    clearExpiryTimer()
    if (!session.value || typeof window === 'undefined') return
    const expiresAt = new Date(session.value.expireTime).getTime()
    const delay = expiresAt - Date.now()
    if (!Number.isFinite(delay) || delay <= 0) {
      restoreAdministratorLocally('expired')
      return
    }
    expiryTimer = window.setTimeout(() => restoreAdministratorLocally('expired'), Math.min(delay + 50, 2_147_000_000))
  }

  function resetRuntimeIdentity() {
    useImStore().disconnect()
    usePermissionStore().resetRoutes()
    useUserStore().resetIdentityState()
  }

  function restoreAdministratorLocally(_reason = 'invalid') {
    const returnUrl = session.value?.returnUrl || readImpersonationSession()?.returnUrl || '/'
    clearExpiryTimer()
    resetRuntimeIdentity()
    releaseImpersonationTabOwnership()
    markImpersonationRestorePending()
    clearImpersonationSession()
    session.value = null
    bootstrapped.value = false
    advanceAuthLifecycleVersion()
    if (typeof window !== 'undefined') window.location.replace(sanitizeReturnUrl(returnUrl))
  }

  function mergeCurrent(view: ImpersonationSessionView, stored: StoredImpersonationSession): StoredImpersonationSession {
    return {
      ...stored,
      sessionId: String(view.sessionId || stored.sessionId),
      actorName: String(view.actorName || stored.actorName || '超级管理员'),
      targetUserId: Number(view.targetUserId || stored.targetUserId),
      targetName: String(view.targetName || stored.targetName),
      targetDeptName: String(view.targetDeptName || stored.targetDeptName || ''),
      roleNames: Array.isArray(view.roleNames) ? view.roleNames.map(String) : stored.roleNames,
      multipleRoles: Boolean(view.multipleRoles),
      reason: String(view.reason || stored.reason || ''),
      startTime: String(view.startTime || stored.startTime),
      expireTime: String(view.expireTime || stored.expireTime)
    }
  }

  async function bootstrap(): Promise<boolean> {
    if (!hasImpersonationSessionMarker()) {
      session.value = null
      bootstrapped.value = true
      return false
    }
    if (bootstrapped.value && session.value) return true

    const stored = readImpersonationSession()
    if (!stored || stored.tabId !== getOrCreateTabId() || isImpersonationExpired(stored)) {
      session.value = stored
      restoreAdministratorLocally(stored ? 'expired' : 'invalid')
      return false
    }
    if (!await claimImpersonationTabOwnership(stored.sessionId)) {
      session.value = stored
      restoreAdministratorLocally('duplicate-tab')
      return false
    }

    const response = await impersonationApi.current()
    const view = unwrapData<ImpersonationSessionView>(response)
    if (!isCurrentImpersonationValid(view, stored)) {
      restoreAdministratorLocally('mismatch')
      return false
    }
    const merged = mergeCurrent(view, stored)
    writeImpersonationSession(merged)
    session.value = merged
    bootstrapped.value = true
    scheduleExpiry()
    return true
  }

  async function start(targetUserId: number, reason: string): Promise<void> {
    if (switching.value || hasImpersonationSessionMarker()) throw new Error('当前已处于员工视角，不能嵌套切换')
    const normalizedReason = reason.trim()
    if (!normalizedReason) throw new Error('请填写本次切换原因')
    switching.value = true
    try {
      assertImpersonationStorageAvailable()
      const tabId = getOrCreateTabId()
      const response = await impersonationApi.start({ targetUserId, reason: normalizedReason, tabId })
      const result = unwrapData<ImpersonationStartResult>(response)
      if (!result?.impersonationToken || !result.sessionId
        || Number(result.actorUserId) !== IMPERSONATION_ACTOR_USER_ID
        || !isAllowedImpersonationTargetUserId(result.targetUserId)) {
        throw new Error('后端未返回有效的员工视角会话')
      }
      const stored: StoredImpersonationSession = {
        token: result.impersonationToken,
        sessionId: String(result.sessionId),
        actorUserId: IMPERSONATION_ACTOR_USER_ID,
        actorName: String(result.actorName || '超级管理员'),
        targetUserId: Number(result.targetUserId),
        targetName: String(result.targetName || '员工'),
        targetDeptName: String(result.targetDeptName || ''),
        roleNames: Array.isArray(result.roleNames) ? result.roleNames.map(String) : [],
        multipleRoles: Boolean(result.multipleRoles),
        reason: normalizedReason,
        startTime: String(result.startTime || new Date().toISOString()),
        expireTime: String(result.expireTime || ''),
        returnUrl: currentPath(),
        tabId
      }
      if (isImpersonationExpired(stored)) throw new Error('员工视角会话有效期异常，请重试')
      writeImpersonationSession(stored)
      session.value = stored
      advanceAuthLifecycleVersion()
      resetRuntimeIdentity()
      if (typeof window !== 'undefined') window.location.replace('/')
    } finally {
      switching.value = false
    }
  }

  async function end(): Promise<void> {
    if (ending.value) return
    ending.value = true
    try {
      if (hasImpersonationSessionMarker()) await impersonationApi.end('manual')
    } finally {
      restoreAdministratorLocally('manual')
      ending.value = false
    }
  }

  return {
    session,
    current,
    active,
    bootstrapped,
    switching,
    ending,
    bootstrap,
    start,
    end,
    restoreAdministratorLocally
  }
})
