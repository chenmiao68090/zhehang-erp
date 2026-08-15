/**
 * Source-only releases intentionally do not carry local `.env.*` files.
 * Use the same-origin API gateway as the safe default while still allowing
 * an explicit development or staging override.
 */
export function resolveApiBaseUrl(configured?: string | null): string {
  const value = String(configured || '').trim().replace(/\/+$/, '')
  return value || '/api'
}

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl(import.meta.env?.VITE_API_BASE_URL)
}

export function resolveApiUrl(path: unknown, configured?: string | null): string {
  const value = String(path || '').trim()
  if (!value) return resolveApiBaseUrl(configured)
  if (/^https?:\/\//i.test(value)) return value
  if (value === '/api' || value.startsWith('/api/')) return value
  return `${resolveApiBaseUrl(configured)}/${value.replace(/^\/+/, '')}`
}
