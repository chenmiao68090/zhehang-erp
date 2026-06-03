<template>
  <div class="message-center" v-click-outside="closePanel">
    <button class="message-trigger" type="button" @click="togglePanel">
      <el-badge :value="stats.unread" :max="99" :hidden="stats.unread === 0">
        <el-icon :size="18"><Bell /></el-icon>
      </el-badge>
    </button>

    <transition name="msg-dropdown">
      <section v-show="visible" class="msg-panel">
        <header class="msg-head">
          <div>
            <h3>消息中心</h3>
            <p>{{ stats.unread }} 条未读 · {{ stats.pending }} 条待处理 · {{ stats.urgent }} 条加急 · {{ preferenceLine }}</p>
          </div>
          <el-button link type="primary" :disabled="stats.unread === 0" @click="markAllRead">全部已读</el-button>
        </header>

        <div class="msg-summary">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="summary-item"
            :class="{ active: activeTab === tab.key }"
            type="button"
            @click="switchTab(tab.key)"
          >
            <span>{{ tab.label }}</span>
            <strong>{{ tab.count }}</strong>
          </button>
        </div>

        <div class="msg-list">
          <div v-if="messages.length === 0" class="msg-empty">暂无消息</div>
          <article
            v-for="item in messages"
            :key="item.id"
            class="msg-card"
            :class="{ unread: !item.isRead }"
            @click="openItem(item)"
          >
            <div class="msg-icon" :class="item.type">
              <el-icon>
                <component :is="typeIcon(item.type)" />
              </el-icon>
            </div>
            <div class="msg-body">
              <div class="msg-title-row">
                <span class="msg-title">{{ item.title }}</span>
                <span class="priority" :class="item.priority">{{ priorityText(item.priority) }}</span>
              </div>
              <p>{{ item.content }}</p>
              <div class="msg-meta">
                <span>{{ item.module }}</span>
                <span>{{ formatRelativeTime(item.createTime) }}</span>
                <span v-if="item.isLater">稍后处理</span>
              </div>
              <div class="msg-card-actions" @click.stop>
                <el-button link :icon="Star" :class="{ active: item.isStarred }" title="星标" @click="toggleStar(item)" />
                <el-button link :icon="Clock" :class="{ active: item.isLater }" title="稍后处理" @click="toggleLater(item)" />
                <el-button v-if="!item.isRead" link :icon="Check" title="标为已读" @click="markRead(item)" />
                <el-button v-if="item.link" link type="primary" @click="openItem(item)">
                  {{ item.actionText || '处理' }}
                </el-button>
              </div>
            </div>
          </article>
        </div>

        <footer class="msg-foot">
          <div class="msg-foot-left">
            <el-button text @click="refresh">刷新</el-button>
            <el-button text @click="goNotificationPage">设置</el-button>
          </div>
          <el-button type="primary" @click="goNotificationPage">查看全部</el-button>
        </footer>
      </section>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClickOutside as vClickOutside } from 'element-plus'
import {
  Bell,
  ChatDotRound,
  Check,
  Clock,
  DocumentChecked,
  Notebook,
  OfficeBuilding,
  Star,
  Stamp,
  Tickets,
  Van,
  Wallet,
  Warning
} from '@element-plus/icons-vue'
import {
  getNotificationStats,
  getNotificationPreferences,
  listNotification,
  readAllNotification,
  readNotification,
  toggleLaterNotification,
  toggleStarNotification,
  type NotificationBox,
  type NotificationItem,
  type NotificationPreferences,
  type NotificationPriority,
  type NotificationType
} from '@/api/notification'

const router = useRouter()
const visible = ref(false)
const activeTab = ref<NotificationBox>('inbox')
const messages = ref<NotificationItem[]>([])
const stats = ref({ total: 0, unread: 0, pending: 0, done: 0, urgent: 0, later: 0, starred: 0, archived: 0 })
const preferences = ref<NotificationPreferences>({
  enabled: true,
  desktopEnabled: true,
  soundEnabled: false,
  quietEnabled: true,
  quietStart: '20:00',
  quietEnd: '08:30',
  urgentBreaksQuiet: true,
  dailyDigest: true,
  digestTime: '09:00',
  mutedTypes: []
})

const tabs = computed(() => [
  { key: 'inbox' as NotificationBox, label: '全部', count: stats.value.total },
  { key: 'unread' as NotificationBox, label: '未读', count: stats.value.unread },
  { key: 'later' as NotificationBox, label: '稍后', count: stats.value.later },
  { key: 'starred' as NotificationBox, label: '星标', count: stats.value.starred }
])

const preferenceLine = computed(() => {
  if (!preferences.value.enabled) return '提醒关闭'
  if (isQuietNow.value && preferences.value.urgentBreaksQuiet) return '免打扰中'
  if (isQuietNow.value) return '勿扰中'
  return '提醒开启'
})

const isQuietNow = computed(() => {
  const pref = preferences.value
  if (!pref.quietEnabled) return false
  return isTimeWithinRange(currentTimeText(), pref.quietStart, pref.quietEnd)
})

onMounted(() => {
  refresh()
  window.addEventListener('zhehang-message-updated', refresh)
  window.addEventListener('zhehang-message-preference-updated', refresh)
})

onBeforeUnmount(() => {
  window.removeEventListener('zhehang-message-updated', refresh)
  window.removeEventListener('zhehang-message-preference-updated', refresh)
})

async function refresh() {
  const [statsRes, listRes, prefRes] = await Promise.all([
    getNotificationStats(),
    listNotification({ box: activeTab.value, pageNum: 1, pageSize: 6 }),
    getNotificationPreferences()
  ])
  stats.value = statsRes.data
  messages.value = listRes.data.records
  preferences.value = prefRes.data
}

function togglePanel() {
  visible.value = !visible.value
  if (visible.value) refresh()
}

function closePanel() {
  visible.value = false
}

function switchTab(tab: NotificationBox) {
  activeTab.value = tab
  refresh()
}

async function markAllRead() {
  await readAllNotification()
  await refresh()
}

async function markRead(item: NotificationItem) {
  await readNotification(item.id)
  await refresh()
}

async function toggleStar(item: NotificationItem) {
  await toggleStarNotification(item.id)
  await refresh()
}

async function toggleLater(item: NotificationItem) {
  await toggleLaterNotification(item.id)
  await refresh()
}

async function openItem(item: NotificationItem) {
  if (!item.isRead) {
    await readNotification(item.id)
  }
  visible.value = false
  if (item.link) {
    router.push(item.link)
  } else {
    router.push('/system/notification')
  }
}

function goNotificationPage() {
  visible.value = false
  router.push('/system/notification')
}

function typeIcon(type: NotificationType) {
  const map = {
    system: Bell,
    approval: Stamp,
    task: DocumentChecked,
    message: ChatDotRound,
    finance: Wallet,
    customer: OfficeBuilding,
    order: Tickets,
    channel: Van,
    tax: Notebook
  }
  return map[type] || Bell
}

function priorityText(priority?: NotificationPriority) {
  const map = { urgent: '加急', high: '重要', normal: '普通', low: '低' }
  return map[priority || 'normal']
}

function currentTimeText() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return (hour || 0) * 60 + (minute || 0)
}

function isTimeWithinRange(current: string, start: string, end: string) {
  const now = timeToMinutes(current)
  const from = timeToMinutes(start)
  const to = timeToMinutes(end)
  if (from === to) return true
  if (from < to) return now >= from && now < to
  return now >= from || now < to
}

function formatRelativeTime(value: string) {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return value || '-'
  const diff = Date.now() - time
  const minute = 60 * 1000
  const hour = 60 * minute
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  if (diff < 24 * hour) return `${Math.floor(diff / hour)} 小时前`
  return new Date(value).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.message-center {
  position: relative;
  display: flex;
  align-items: center;
}

.message-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    color: var(--brand-primary);
    background: #f2f7ff;
  }
}

.msg-panel {
  position: absolute;
  top: 43px;
  right: -88px;
  width: 430px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 16px 42px rgba(31, 35, 41, 0.16);
  z-index: 2100;
}

.msg-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border-soft);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--text-muted);
  }
}

.msg-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px 14px;
  background: #f7f8fa;
}

.summary-item {
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 8px 4px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;

  span {
    font-size: 12px;
  }

  strong {
    font-size: 17px;
    color: var(--text-primary);
  }

  &.active {
    border-color: #bedaff;
    background: #fff;

    span,
    strong {
      color: var(--brand-primary);
    }
  }
}

.msg-list {
  max-height: 410px;
  overflow-y: auto;
  padding: 8px;
}

.msg-empty {
  padding: 42px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.msg-card {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  padding: 11px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.16s ease;

  &:hover {
    background: #f7f8fa;
  }

  &.unread {
    background: #f2f7ff;

    .msg-title::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 6px;
      border-radius: 50%;
      background: var(--brand-primary);
      vertical-align: 2px;
    }
  }
}

.msg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #e8f3ff;
  color: var(--brand-primary);

  &.finance { background: #e8ffea; color: #00a024; }
  &.customer,
  &.tax { background: #eef2ff; color: #626aef; }
  &.order,
  &.approval { background: #fff7e8; color: #ff7d00; }
  &.channel { background: #e8f7ff; color: #1682c7; }
  &.task { background: #f0f5ff; color: #3370ff; }
  &.message { background: #f5efff; color: #8e55ff; }
}

.msg-body {
  min-width: 0;

  p {
    display: -webkit-box;
    overflow: hidden;
    margin: 5px 0 7px;
    color: var(--text-body);
    font-size: 12px;
    line-height: 1.5;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.msg-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.msg-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 650;
}

.priority {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 999px;
  background: #f2f3f5;
  color: var(--text-muted);
  font-size: 11px;

  &.urgent {
    background: #fff0f0;
    color: #f53f3f;
  }

  &.high {
    background: #fff7e8;
    color: #ff7d00;
  }
}

.msg-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-muted);
  font-size: 11px;
}

.msg-card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 24px;
  margin-top: 4px;

  :deep(.el-button) {
    min-height: 22px;
    padding: 0 4px;
  }

  .active {
    color: var(--brand-primary);
  }
}

.msg-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid var(--border-soft);
  background: #fff;
}

.msg-foot-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.msg-dropdown-enter-active,
.msg-dropdown-leave-active {
  transition: all 0.18s ease;
}

.msg-dropdown-enter-from,
.msg-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .msg-panel {
    right: -132px;
    width: calc(100vw - 24px);
  }
}
</style>
