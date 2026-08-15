type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

function getStorage(): StorageLike | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const memory = new Map<string, string>()

export function storageGet(key: string): string | null {
  const storage = getStorage()
  if (!storage) return memory.get(key) ?? null
  try {
    return storage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

export function storageSet(key: string, value: string): void {
  memory.set(key, value)
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    /* storage may be unavailable in embedded preview/private mode */
  }
}

export function storageRemove(key: string): void {
  memory.delete(key)
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    /* storage may be unavailable in embedded preview/private mode */
  }
}

export function storageKeys(): string[] {
  const storage = getStorage()
  if (!storage) return Array.from(memory.keys())
  try {
    return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(Boolean) as string[]
  } catch {
    return Array.from(memory.keys())
  }
}
