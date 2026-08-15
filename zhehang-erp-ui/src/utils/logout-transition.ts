const LOGOUT_TRANSITION_KEY = 'zhehang_logout_transition'

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function getSessionStorage(): SessionStorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function markLogoutTransition(storage: SessionStorageLike | null = getSessionStorage()) {
  try {
    storage?.setItem(LOGOUT_TRANSITION_KEY, '1')
  } catch {
    // sessionStorage 不可用时仍允许服务端正常退出；最坏只会多一次失败的 Cookie 恢复。
  }
}

export function consumeLogoutTransition(storage: SessionStorageLike | null = getSessionStorage()): boolean {
  if (!storage) return false
  try {
    const marked = storage.getItem(LOGOUT_TRANSITION_KEY) === '1'
    storage.removeItem(LOGOUT_TRANSITION_KEY)
    return marked
  } catch {
    return false
  }
}
