export interface ImMessageIdentity {
  id?: number | string | null
  conversationId?: number | string | null
  clientMessageId?: string | null
  seq?: number | string | null
  createdAt?: string | null
  status?: string | null
  error?: string
}

function serverId(message: ImMessageIdentity) {
  if (message.id === null || message.id === undefined || message.id === '') return ''
  const value = String(message.id)
  return value.startsWith('-') || value === '0' ? '' : value
}

function clientKey(message: ImMessageIdentity) {
  const clientId = message.clientMessageId?.trim()
  if (!clientId) return ''
  return `${String(message.conversationId ?? '')}:${clientId}`
}

function identities(message: ImMessageIdentity) {
  const keys: string[] = []
  const client = clientKey(message)
  const id = serverId(message)
  if (client) keys.push(`client:${client}`)
  if (id) keys.push(`id:${id}`)
  return keys
}

function mergeRecord<T extends ImMessageIdentity>(current: T, incoming: T): T {
  const currentServer = Boolean(serverId(current))
  const incomingServer = Boolean(serverId(incoming))
  const merged = (currentServer && !incomingServer
    ? { ...incoming, ...current }
    : { ...current, ...incoming }) as T
  if (serverId(merged) && merged.status !== 'failed') delete merged.error
  return merged
}

/**
 * 合并本地乐观消息、HTTP ACK、WebSocket、历史分页和断线补拉。
 * clientMessageId 是首选身份，正式 messageId 只作兼容兜底。
 */
export function mergeImMessages<T extends ImMessageIdentity>(...groups: T[][]): T[] {
  const result: T[] = []
  for (const message of groups.flat()) {
    const messageKeys = new Set(identities(message))
    const matches: number[] = []
    result.forEach((existing, index) => {
      if (identities(existing).some(key => messageKeys.has(key))) matches.push(index)
    })
    if (!matches.length) {
      result.push(message)
      continue
    }
    const target = matches[0]
    let merged = result[target]
    for (const index of matches.slice(1)) merged = mergeRecord(merged, result[index])
    merged = mergeRecord(merged, message)
    for (const index of matches.slice(1).sort((a, b) => b - a)) result.splice(index, 1)
    result[target] = merged
  }
  return result.sort((a, b) => {
    const seqDiff = Number(a.seq || 0) - Number(b.seq || 0)
    if (seqDiff) return seqDiff
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  })
}
