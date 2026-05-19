const PREFIX = 'zh_erp_'

export function getStorage(key: string): string | null {
  return localStorage.getItem(PREFIX + key)
}

export function setStorage(key: string, value: string): void {
  localStorage.setItem(PREFIX + key, value)
}

export function removeStorage(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

export function clearStorage(): void {
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith(PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}
