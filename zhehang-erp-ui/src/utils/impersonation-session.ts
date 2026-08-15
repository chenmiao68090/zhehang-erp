export const IMPERSONATION_SESSION_KEY = 'zhehang_erp_impersonation_session'
export const IMPERSONATION_ACTOR_USER_ID = 3
const TAB_ID_PREFIX = 'zhehang-erp-tab:'
let restorePending = false
let ownedSessionId = ''
let releaseOwnership: (() => void) | undefined
let ownershipChannel: BroadcastChannel | null = null
let pageRestoreGuardInstalled = false

type OwnershipMessageType = 'claim' | 'contender' | 'occupied'

interface OwnershipMessage {
  type: OwnershipMessageType
  claimId: string
  targetId?: string
}

export interface StoredImpersonationSession {
  token: string
  sessionId: string
  actorUserId: number
  actorName: string
  targetUserId: number
  targetName: string
  targetDeptName: string
  roleNames: string[]
  multipleRoles: boolean
  reason: string
  startTime: string
  expireTime: string
  returnUrl: string
  tabId: string
}

export type AuthenticationMode = 'base' | 'impersonation'

export interface AuthenticationSelection {
  mode: AuthenticationMode
  token: string
  session: StoredImpersonationSession | null
}

export interface CurrentImpersonationProof {
  active?: boolean
  sessionId?: string
  targetUserId?: number
}

export function isAllowedImpersonationTargetUserId(value: unknown): boolean {
  const userId = Number(value)
  return Number.isSafeInteger(userId) && userId > 1 && userId !== IMPERSONATION_ACTOR_USER_ID
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function parseImpersonationSession(raw: string | null): StoredImpersonationSession | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<StoredImpersonationSession>
    if (!value || typeof value !== 'object') return null
    if (!String(value.token || '').trim() || !String(value.sessionId || '').trim()) return null
    if (Number(value.actorUserId) !== IMPERSONATION_ACTOR_USER_ID
      || !isAllowedImpersonationTargetUserId(value.targetUserId)) return null
    if (!String(value.expireTime || '').trim() || !String(value.tabId || '').trim()) return null
    return {
      token: String(value.token),
      sessionId: String(value.sessionId),
      actorUserId: IMPERSONATION_ACTOR_USER_ID,
      actorName: String(value.actorName || '超级管理员'),
      targetUserId: Number(value.targetUserId),
      targetName: String(value.targetName || '员工'),
      targetDeptName: String(value.targetDeptName || ''),
      roleNames: Array.isArray(value.roleNames) ? value.roleNames.map(String).filter(Boolean) : [],
      multipleRoles: Boolean(value.multipleRoles),
      reason: String(value.reason || ''),
      startTime: String(value.startTime || ''),
      expireTime: String(value.expireTime),
      returnUrl: sanitizeReturnUrl(value.returnUrl),
      tabId: String(value.tabId)
    }
  } catch {
    return null
  }
}

/**
 * 只要当前标签页存在代登录标记，就必须保持 fail-closed。
 * 即使记录损坏或令牌过期，也不能静默回退到 localStorage 中的超级管理员令牌。
 */
export function selectAuthentication(baseToken: string, rawSession: string | null): AuthenticationSelection {
  if (rawSession === null) return { mode: 'base', token: baseToken, session: null }
  const session = parseImpersonationSession(rawSession)
  return {
    mode: 'impersonation',
    token: session?.token || '',
    session
  }
}

export function getAuthenticationSelection(baseToken: string): AuthenticationSelection {
  if (restorePending) return { mode: 'impersonation', token: '', session: null }
  const storage = getSessionStorage()
  const raw = storage?.getItem(IMPERSONATION_SESSION_KEY) ?? null
  return selectAuthentication(baseToken, raw)
}

export function markImpersonationRestorePending(): void {
  restorePending = true
}

export function hasImpersonationSessionMarker(): boolean {
  const storage = getSessionStorage()
  if (!storage) return false
  try {
    return storage.getItem(IMPERSONATION_SESSION_KEY) !== null
  } catch {
    return false
  }
}

export function shouldReloadImpersonationAfterPageRestore(persisted: boolean, hasMarker: boolean): boolean {
  return persisted && hasMarker
}

/**
 * BFCache 会连同 Pinia 的 bootstrapped 状态一起恢复，但 pagehide 已释放标签页所有权。
 * 代登录页从 BFCache 返回时必须进行一次完整重载，重新竞争所有权并向后端校验 /current；
 * 普通刷新、普通管理员页面和没有代登录标记的历史页面不受影响。
 */
export function installImpersonationPageRestoreGuard(): void {
  if (typeof window === 'undefined' || pageRestoreGuardInstalled) return
  pageRestoreGuardInstalled = true
  window.addEventListener('pageshow', (event: PageTransitionEvent) => {
    if (shouldReloadImpersonationAfterPageRestore(event.persisted, hasImpersonationSessionMarker())) {
      window.location.reload()
    }
  })
}

export function readImpersonationSession(): StoredImpersonationSession | null {
  const storage = getSessionStorage()
  if (!storage) return null
  try {
    return parseImpersonationSession(storage.getItem(IMPERSONATION_SESSION_KEY))
  } catch {
    return null
  }
}

export function writeImpersonationSession(session: StoredImpersonationSession): void {
  const storage = getSessionStorage()
  if (!storage) throw new Error('当前浏览器不支持安全的标签页会话存储')
  storage.setItem(IMPERSONATION_SESSION_KEY, JSON.stringify(session))
}

export function assertImpersonationStorageAvailable(): void {
  const storage = getSessionStorage()
  if (!storage) throw new Error('当前浏览器不支持安全的标签页会话存储')
  const probeKey = `${IMPERSONATION_SESSION_KEY}:probe`
  try {
    storage.setItem(probeKey, '1')
    storage.removeItem(probeKey)
  } catch {
    throw new Error('当前浏览器禁止标签页会话存储，无法安全切换员工视角')
  }
}

export function clearImpersonationSession(): void {
  const storage = getSessionStorage()
  if (!storage) return
  try {
    storage.removeItem(IMPERSONATION_SESSION_KEY)
  } catch {
    /* private mode may reject storage writes */
  }
}

export function getOrCreateTabId(): string {
  if (typeof window === 'undefined') return ''
  try {
    if (window.name.startsWith(TAB_ID_PREFIX)) return window.name.slice(TAB_ID_PREFIX.length)
    const tabId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.name = `${TAB_ID_PREFIX}${tabId}`
    return tabId
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

function createOwnershipClaimId(): string {
  const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  return `${Date.now().toString(36)}:${randomPart}`
}

function readOwnershipMessage(value: unknown): OwnershipMessage | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<OwnershipMessage>
  if (!['claim', 'contender', 'occupied'].includes(String(candidate.type))) return null
  if (!String(candidate.claimId || '').trim()) return null
  return {
    type: candidate.type as OwnershipMessageType,
    claimId: String(candidate.claimId),
    targetId: candidate.targetId ? String(candidate.targetId) : undefined
  }
}

function releaseOwnershipOnPageHide(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('pagehide', releaseImpersonationTabOwnership, { once: true })
}

/**
 * Web Locks 不可用时，通过同源 BroadcastChannel 竞选唯一所有者。
 * 已持有者会拒绝后来者；同时启动的标签页按随机 claimId 确定唯一胜者。
 */
async function claimWithBroadcastChannel(sessionId: string): Promise<boolean | null> {
  if (typeof BroadcastChannel === 'undefined') return null

  const claimId = createOwnershipClaimId()
  const contenders = new Set<string>([claimId])
  let occupied = false
  let channel: BroadcastChannel
  try {
    channel = new BroadcastChannel(`zhehang-impersonation-owner:${sessionId}`)
  } catch {
    return null
  }

  channel.onmessage = (event: MessageEvent<unknown>) => {
    const message = readOwnershipMessage(event.data)
    if (!message || message.claimId === claimId) return
    if (message.type === 'claim') {
      contenders.add(message.claimId)
      channel.postMessage({ type: 'contender', claimId, targetId: message.claimId } satisfies OwnershipMessage)
      return
    }
    if (message.targetId !== claimId) return
    if (message.type === 'contender') contenders.add(message.claimId)
    if (message.type === 'occupied') occupied = true
  }

  channel.postMessage({ type: 'claim', claimId } satisfies OwnershipMessage)
  await new Promise<void>((resolve) => setTimeout(resolve, 180))

  const winner = Array.from(contenders).sort()[0]
  if (occupied || winner !== claimId) {
    channel.close()
    return false
  }

  ownedSessionId = sessionId
  ownershipChannel = channel
  channel.onmessage = (event: MessageEvent<unknown>) => {
    const message = readOwnershipMessage(event.data)
    if (message?.type !== 'claim' || message.claimId === claimId) return
    channel.postMessage({ type: 'occupied', claimId, targetId: message.claimId } satisfies OwnershipMessage)
  }
  releaseOwnershipOnPageHide()
  return true
}

/** Web Locks（或 BroadcastChannel 兼容层）保证同一代登录会话最多由一个标签页持有。 */
export async function claimImpersonationTabOwnership(sessionId: string): Promise<boolean> {
  if (ownedSessionId === sessionId) return true
  if (ownedSessionId) return false

  const lockManager = typeof navigator === 'undefined' ? undefined : (navigator as any).locks
  if (!lockManager?.request) {
    const claimed = await claimWithBroadcastChannel(sessionId)
    if (claimed !== null) return claimed
    // 无法证明单标签页唯一所有权时失败收紧；不能仅凭 opener 推断不存在复制标签页。
    return false
  }

  return new Promise<boolean>((resolve) => {
    void lockManager.request(
      `zhehang-impersonation:${sessionId}`,
      { mode: 'exclusive', ifAvailable: true },
      async (lock: unknown) => {
        if (!lock) {
          resolve(false)
          return
        }
        ownedSessionId = sessionId
        releaseOwnershipOnPageHide()
        await new Promise<void>((release) => {
          releaseOwnership = release
          resolve(true)
        })
        if (ownedSessionId === sessionId) ownedSessionId = ''
        releaseOwnership = undefined
      }
    )
  })
}

export function releaseImpersonationTabOwnership(): void {
  const release = releaseOwnership
  releaseOwnership = undefined
  release?.()
  ownershipChannel?.close()
  ownershipChannel = null
  ownedSessionId = ''
}

export function isImpersonationExpired(session: StoredImpersonationSession | null, now = Date.now()): boolean {
  if (!session) return true
  const expiresAt = new Date(session.expireTime).getTime()
  return !Number.isFinite(expiresAt) || expiresAt <= now
}

export function isCurrentImpersonationValid(
  current: CurrentImpersonationProof | null | undefined,
  stored: StoredImpersonationSession
): boolean {
  return current?.active === true
    && String(current.sessionId || '') === stored.sessionId
    && Number(current.targetUserId) === stored.targetUserId
}

export function sanitizeReturnUrl(value: unknown): string {
  const path = typeof value === 'string' ? value : '/'
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/login')) return '/'
  return path
}
