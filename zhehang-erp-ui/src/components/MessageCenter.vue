<template>
  <div class="im-entry" :class="{ 'sidebar-bottom': props.placement === 'sidebar-bottom' }" v-click-outside="close">
    <button class="im-trigger" type="button" title="消息" @click="toggle">
      <el-badge :value="imStore.badgeText" :hidden="imStore.summary.badgeCount === 0" class="im-badge">
        <el-icon :size="20"><ChatDotRound /></el-icon>
      </el-badge>
    </button>

    <transition name="im-pop">
      <section v-if="visible" class="im-popover">
        <header class="im-popover-head">
          <div>
            <h3>消息</h3>
            <p>
              <span class="connection-dot" :class="imStore.connectionState" />
              {{ connectionText }}
            </p>
          </div>
          <el-button text :icon="Refresh" title="刷新" @click="refresh" />
        </header>

        <div class="im-summary">
          <button type="button" @click="goCenter('unread')">
            <strong>{{ imStore.summary.totalUnread }}</strong><span>未读消息</span>
          </button>
          <button type="button" @click="goCenter('mention')">
            <strong>{{ imStore.summary.mentionUnread }}</strong><span>@我的</span>
          </button>
          <button type="button" @click="goCenter('all')">
            <strong>{{ imStore.summary.unreadConversations }}</strong><span>待查看会话</span>
          </button>
        </div>

        <div class="im-recent-title">
          <span>最近消息</span>
          <button type="button" @click="goCenter('all')">全部会话</button>
        </div>

        <div class="im-recent-list">
          <button
            v-for="conversation in imStore.recent"
            :key="conversation.id"
            class="im-recent-row"
            type="button"
            @click="openConversation(conversation.id)"
          >
            <span class="im-avatar-wrap">
              <el-avatar :size="38" :src="conversation.avatarUrl" class="im-avatar">{{ conversation.name?.slice(0, 1) || '消' }}</el-avatar>
              <i v-if="conversation.type === 'direct'" :class="{ online: conversation.peerOnline }" />
            </span>
            <span class="im-recent-body">
              <span class="im-recent-line">
                <b>{{ conversation.name }}</b>
                <time>{{ formatTime(conversation.lastMessageAt) }}</time>
              </span>
              <span class="im-recent-line preview">
                <em v-if="conversation.draft">[草稿] {{ conversation.draft }}</em>
                <span v-else>{{ conversation.lastSenderName ? `${conversation.lastSenderName}：` : '' }}{{ conversation.lastMessageText || '开始沟通' }}</span>
                <small v-if="conversation.type === 'direct'" class="im-presence" :class="{ online: conversation.peerOnline }">{{ presenceText(conversation.peerOnline, conversation.peerLastActiveAt) }}</small>
                <el-icon v-if="conversation.muted" title="免打扰"><MuteNotification /></el-icon>
                <i v-if="conversation.mentionCount">@我</i>
                <u v-if="conversation.unreadCount">{{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}</u>
              </span>
            </span>
          </button>
          <div v-if="!imStore.recent.length" class="im-empty">
            <el-icon><ChatLineRound /></el-icon>
            <span>暂无会话</span>
          </div>
        </div>

        <footer>
          <button type="button" @click="goCenter('all')">
            进入内部沟通
            <el-icon><ArrowRight /></el-icon>
          </button>
        </footer>
      </section>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClickOutside as vClickOutside } from 'element-plus'
import { ArrowRight, ChatDotRound, ChatLineRound, MuteNotification, Refresh } from '@element-plus/icons-vue'
import { useImStore } from '@/stores/im'
import { formatImPresence } from '@/utils/im-presence'

const props = withDefaults(defineProps<{
  placement?: 'top-right' | 'sidebar-bottom'
}>(), {
  placement: 'top-right'
})

const router = useRouter()
const imStore = useImStore()
const visible = ref(false)

const connectionText = computed(() => ({
  connected: '实时连接正常',
  connecting: '正在连接',
  reconnecting: '正在恢复连接',
  offline: '离线，内容会保留',
  idle: '准备连接'
}[imStore.connectionState]))

onMounted(() => imStore.initialize())

function toggle() {
  visible.value = !visible.value
  if (visible.value) refresh()
}

function close() {
  visible.value = false
}

async function refresh() {
  await Promise.allSettled([imStore.refreshSummary(), imStore.refreshRecent()])
}

function goCenter(filter: string) {
  close()
  router.push({ path: '/message/center', query: filter === 'all' ? {} : { filter } })
}

function openConversation(id: number) {
  close()
  router.push({ path: '/message/center', query: { conversationId: String(id) } })
}

function presenceText(online: boolean, lastActiveAt?: string) {
  return formatImPresence(online, lastActiveAt, true, new Date(imStore.presenceClock))
}

function formatTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped lang="scss">
.im-entry { position: relative; display: flex; align-items: center; }
.im-trigger {
  width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
  border: 0; border-radius: 8px; background: transparent; color: var(--text-body); cursor: pointer;
  &:hover { color: var(--brand-primary); background: #f2f7ff; }
}
:deep(.im-badge .el-badge__content) { top: 2px; right: 5px; min-width: 17px; height: 17px; line-height: 15px; padding: 0 4px; border: 2px solid #fff; font-size: 10px; }
.im-popover {
  position: absolute; z-index: 2200; top: 45px; right: -84px; width: 420px; max-height: min(620px, calc(100vh - 82px));
  overflow: hidden; background: #fff; border: 1px solid var(--border-color); border-radius: 8px;
  box-shadow: 0 18px 48px rgba(31, 35, 41, .18);
}
.im-entry.sidebar-bottom .im-popover { top: auto; right: auto; bottom: 46px; left: 0; }
.im-popover-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px 12px; border-bottom: 1px solid var(--border-soft); }
.im-popover-head h3 { margin: 0; font-size: 18px; line-height: 24px; }
.im-popover-head p { display: flex; align-items: center; gap: 6px; margin: 4px 0 0; color: var(--text-muted); font-size: 12px; }
.connection-dot { width: 7px; height: 7px; border-radius: 50%; background: #c9cdd4; }
.connection-dot.connected { background: #00b42a; }
.connection-dot.connecting, .connection-dot.reconnecting { background: #ff7d00; }
.connection-dot.offline { background: #f53f3f; }
.im-summary { display: grid; grid-template-columns: repeat(3, 1fr); padding: 12px 14px; gap: 8px; background: #f7f8fa; }
.im-summary button { display: grid; gap: 2px; padding: 9px 4px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; }
.im-summary button:hover { background: #e8f3ff; }
.im-summary strong { color: var(--text-primary); font-size: 19px; line-height: 24px; }
.im-summary span { color: var(--text-muted); font-size: 12px; }
.im-recent-title { display: flex; justify-content: space-between; align-items: center; padding: 13px 16px 8px; color: var(--text-primary); font-size: 14px; font-weight: 650; }
.im-recent-title button { border: 0; background: none; color: var(--brand-primary); cursor: pointer; font-size: 12px; }
.im-recent-list { max-height: 390px; overflow: auto; padding: 0 8px 8px; }
.im-recent-row { width: 100%; min-height: 62px; display: flex; align-items: center; gap: 11px; padding: 9px 10px; border: 0; border-radius: 7px; background: #fff; text-align: left; cursor: pointer; }
.im-recent-row:hover { background: #f5f7fa; }
.im-avatar-wrap { position: relative; flex: 0 0 auto; }
.im-avatar { background: #e8f3ff; color: #3370ff; font-weight: 700; }
.im-avatar-wrap i { position: absolute; right: 0; bottom: 1px; width: 9px; height: 9px; border: 2px solid #fff; border-radius: 50%; background: #c9cdd4; }
.im-avatar-wrap i.online { background: #00b42a; }
.im-recent-body { min-width: 0; flex: 1; display: grid; gap: 5px; }
.im-recent-line { min-width: 0; display: flex; align-items: center; gap: 6px; }
.im-recent-line b { flex: 1; overflow: hidden; color: var(--text-primary); font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.im-recent-line time { color: var(--text-muted); font-size: 11px; }
.im-recent-line.preview > span, .im-recent-line.preview > em { flex: 1; min-width: 0; overflow: hidden; color: var(--text-muted); font-size: 12px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.im-recent-line.preview > em { color: #f53f3f; }
.im-recent-line.preview .im-presence { flex: 0 0 auto; color: var(--text-muted); font-size: 11px; white-space: nowrap; }
.im-recent-line.preview .im-presence.online { color: #00a82d; }
.im-recent-line.preview i { color: #f53f3f; font-size: 11px; font-style: normal; white-space: nowrap; }
.im-recent-line.preview u { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: #f53f3f; color: #fff; font-size: 10px; line-height: 18px; text-align: center; text-decoration: none; }
.im-empty { height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); }
.im-empty .el-icon { font-size: 28px; }
footer { padding: 10px 14px; border-top: 1px solid var(--border-soft); }
footer button { width: 100%; height: 38px; display: flex; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 7px; background: #f2f7ff; color: var(--brand-primary); font-weight: 650; cursor: pointer; }
.im-pop-enter-active, .im-pop-leave-active { transition: opacity .16s ease, transform .16s ease; transform-origin: top right; }
.sidebar-bottom .im-pop-enter-active, .sidebar-bottom .im-pop-leave-active { transform-origin: bottom left; }
.im-pop-enter-from, .im-pop-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }
@media (max-width: 720px) {
  .im-popover { position: fixed; top: 62px; right: 8px; left: 8px; width: auto; }
  .im-entry.sidebar-bottom .im-popover { top: auto; right: 8px; bottom: 72px; left: 8px; width: auto; }
}
</style>
