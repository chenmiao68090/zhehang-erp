import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { imApi, type ImConversation, type ImMessage, type ImPreference, type ImUnreadSummary } from '@/api/im'
import { useUserStore } from '@/stores/user'
import { hasImpersonationSessionMarker } from '@/utils/impersonation-session'

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'offline'
type RealtimeEvent = { eventId?: string; type: string; serverTime?: string; data?: any }
type PresenceState = { online: boolean; lastActiveAt?: string }

const defaultSummary: ImUnreadSummary = { badgeCount: 0, totalUnread: 0, mentionUnread: 0, unreadConversations: 0 }
const defaultPreference: ImPreference = { browserNotification: false, soundEnabled: true, desktopEnabled: true }

export const useImStore = defineStore('im', () => {
  const summary = ref<ImUnreadSummary>({ ...defaultSummary })
  const recent = ref<ImConversation[]>([])
  const preference = ref<ImPreference>({ ...defaultPreference })
  const connectionState = ref<ConnectionState>('idle')
  const lastServerTime = ref('')
  const presenceClock = ref(Date.now())
  const initialized = ref(false)
  const badgeText = computed(() => summary.value.badgeCount > 99 ? '99+' : String(summary.value.badgeCount || ''))

  let socket: WebSocket | null = null
  let heartbeatTimer: number | undefined
  let pollTimer: number | undefined
  let reconnectTimer: number | undefined
  let reconnectAttempt = 0
  let broadcast: BroadcastChannel | null = null
  const seenEvents = new Set<string>()
  const presenceByUser = new Map<number, PresenceState>()
  const originalTitle = document.title.replace(/^\(\d+\+?\)\s*/, '')

  async function initialize() {
    if (hasImpersonationSessionMarker()) {
      disconnect()
      return
    }
    if (initialized.value) return
    initialized.value = true
    if ('BroadcastChannel' in window) {
      const effectiveUserId = Number(useUserStore().userInfo?.id || 0)
      broadcast = new BroadcastChannel(`zhehang-im-events:${effectiveUserId || 'unknown'}`)
      broadcast.onmessage = (event) => applyEvent(event.data as RealtimeEvent, false)
    }
    await Promise.allSettled([refreshSummary(), refreshRecent(), loadPreference()])
    connect()
    pollTimer = window.setInterval(() => {
      presenceClock.value = Date.now()
      refreshSummary()
      if (socket?.readyState !== WebSocket.OPEN) refreshRecent()
    }, 15000)
    window.addEventListener('online', connect)
    window.addEventListener('offline', handleOffline)
  }

  async function refreshSummary() {
    try {
      const { data } = await imApi.summary()
      summary.value = data || { ...defaultSummary }
      updateDocumentTitle()
    } catch {
      // 登录切换或后端暂不可用时保留上次状态，轮询会自动修复。
    }
  }

  async function refreshRecent() {
    try {
      const { data } = await imApi.conversations({ pageSize: 10 })
      recent.value = (data.items || []).map(withKnownPresence)
    } catch {
      // 降级轮询失败时不清空已有会话。
    }
  }

  async function loadPreference() {
    try {
      const { data } = await imApi.preference()
      preference.value = { ...defaultPreference, ...data }
    } catch {
      preference.value = { ...defaultPreference }
    }
  }

  async function savePreference(patch: Partial<ImPreference>) {
    const { data } = await imApi.updatePreference(patch)
    preference.value = { ...preference.value, ...data }
  }

  async function connect() {
    if (hasImpersonationSessionMarker()) {
      disconnect()
      return
    }
    if (!navigator.onLine) {
      connectionState.value = 'offline'
      return
    }
    if (socket && [WebSocket.CONNECTING, WebSocket.OPEN].includes(socket.readyState)) return
    clearReconnect()
    connectionState.value = reconnectAttempt ? 'reconnecting' : 'connecting'
    try {
      const { data } = await imApi.realtimeTicket()
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const url = `${protocol}//${window.location.host}${data.webSocketPath}?ticket=${encodeURIComponent(data.ticket)}`
      socket = new WebSocket(url)
      socket.onopen = () => {
        connectionState.value = 'connected'
        reconnectAttempt = 0
        presenceByUser.clear()
        heartbeatTimer = window.setInterval(() => sendSocket({ type: 'ping', at: Date.now() }), 20000)
        refreshSummary()
        refreshRecent()
      }
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as RealtimeEvent
          if (payload.eventId) sendSocket({ type: 'ack', eventId: payload.eventId })
          applyEvent(payload, true)
        } catch {
          // 丢弃非协议消息。
        }
      }
      socket.onclose = () => scheduleReconnect()
      socket.onerror = () => socket?.close()
    } catch {
      scheduleReconnect()
    }
  }

  function applyEvent(event: RealtimeEvent, shouldBroadcast: boolean) {
    if (hasImpersonationSessionMarker()) return
    if (!event?.type) return
    if (event.eventId) {
      if (seenEvents.has(event.eventId)) return
      seenEvents.add(event.eventId)
      if (seenEvents.size > 500) seenEvents.delete(seenEvents.values().next().value as string)
    }
    if (event.serverTime) {
      lastServerTime.value = event.serverTime
      presenceClock.value = Date.now()
    }
    if (shouldBroadcast && broadcast) broadcast.postMessage(event)
    if (event.type === 'message.created') {
      const message = event.data?.message as ImMessage | undefined
      const userStore = useUserStore()
      if (message) message.mine = Number(message.senderId) === Number(userStore.userInfo?.id)
      if (message && !message.mine) imApi.delivered(message.conversationId, message.seq).catch(() => {})
      refreshSummary()
      refreshRecent()
      if (message && !message.mine) notifyWhenInactive(message)
    } else if (event.type === 'presence.changed') {
      const userId = Number(event.data?.userId)
      if (userId) {
        presenceByUser.set(userId, { online: Boolean(event.data?.online), lastActiveAt: event.data?.lastActiveAt })
        recent.value = recent.value.map(withKnownPresence)
      }
    } else if (['message.updated', 'message.recalled', 'receipt.delivered', 'receipt.read', 'conversation.updated', 'member.joined', 'member.left', 'task.updated', 'notification.updated'].includes(event.type)) {
      refreshSummary()
      refreshRecent()
    }
    window.dispatchEvent(new CustomEvent('zhehang-im-event', { detail: event }))
  }

  function notifyWhenInactive(message: ImMessage) {
    if (preference.value.soundEnabled) playNotificationSound()
    if (!('Notification' in window) || !document.hidden || !preference.value.browserNotification || Notification.permission !== 'granted') return
    const notification = new Notification(message.senderName || '内部消息', {
      body: ['text', 'task', 'business', 'system', 'announcement'].includes(message.messageType)
        ? message.text.slice(0, 100)
        : `[${message.messageType === 'image' ? '图片' : '文件'}]`,
      icon: message.senderAvatar || '/logo.svg',
      tag: `im-${message.conversationId}`
    })
    notification.onclick = () => {
      window.focus()
      window.location.href = `/message/center?conversationId=${message.conversationId}`
      notification.close()
    }
  }

  function withKnownPresence(conversation: ImConversation) {
    if (conversation.type !== 'direct' || !conversation.peerUserId) return conversation
    const presence = presenceByUser.get(Number(conversation.peerUserId))
    return presence
      ? { ...conversation, peerOnline: presence.online, peerLastActiveAt: presence.lastActiveAt || conversation.peerLastActiveAt }
      : conversation
  }

  function playNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = 620
      gain.gain.setValueAtTime(0.04, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.18)
    } catch {
      // 浏览器禁止自动播放时静默。
    }
  }

  function sendSocket(payload: Record<string, unknown>) {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload))
  }

  function scheduleReconnect() {
    clearHeartbeat()
    if (!initialized.value || !navigator.onLine) {
      connectionState.value = 'offline'
      return
    }
    connectionState.value = 'reconnecting'
    reconnectAttempt += 1
    const delay = Math.min(30000, 1000 * 2 ** Math.min(reconnectAttempt, 5)) + Math.round(Math.random() * 500)
    reconnectTimer = window.setTimeout(connect, delay)
  }

  function handleOffline() {
    connectionState.value = 'offline'
    socket?.close()
  }

  function disconnect() {
    initialized.value = false
    clearHeartbeat()
    clearReconnect()
    if (pollTimer) window.clearInterval(pollTimer)
    pollTimer = undefined
    socket?.close(1000, 'logout')
    socket = null
    broadcast?.close()
    broadcast = null
    summary.value = { ...defaultSummary }
    recent.value = []
    preference.value = { ...defaultPreference }
    connectionState.value = 'idle'
    lastServerTime.value = ''
    reconnectAttempt = 0
    seenEvents.clear()
    presenceByUser.clear()
    document.title = originalTitle
    window.removeEventListener('online', connect)
    window.removeEventListener('offline', handleOffline)
  }

  function clearHeartbeat() {
    if (heartbeatTimer) window.clearInterval(heartbeatTimer)
    heartbeatTimer = undefined
  }

  function clearReconnect() {
    if (reconnectTimer) window.clearTimeout(reconnectTimer)
    reconnectTimer = undefined
  }

  function updateDocumentTitle() {
    const count = summary.value.badgeCount
    document.title = count > 0 ? `(${count > 99 ? '99+' : count}) ${originalTitle}` : originalTitle
  }

  return {
    summary,
    recent,
    preference,
    connectionState,
    lastServerTime,
    presenceClock,
    badgeText,
    initialize,
    connect,
    disconnect,
    refreshSummary,
    refreshRecent,
    loadPreference,
    savePreference
  }
})
