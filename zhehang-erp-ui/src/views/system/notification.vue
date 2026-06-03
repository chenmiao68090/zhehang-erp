<template>
  <div class="page-container notification-page">
    <header class="page-titlebar">
      <div>
        <h2>消息中心</h2>
        <p>像飞书一样把待办、预警、协作和业务通知集中到一个工作流入口。</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <el-button :icon="Check" type="primary" :disabled="stats.unread === 0" @click="handleMarkAllRead">
          全部已读
        </el-button>
        <el-button :icon="Delete" plain @click="handleReset">重置演示数据</el-button>
      </div>
    </header>

    <section class="metric-grid">
      <div class="metric-card unread">
        <span>未读消息</span>
        <strong>{{ stats.unread }}</strong>
        <small>需要今天处理</small>
      </div>
      <div class="metric-card urgent">
        <span>加急预警</span>
        <strong>{{ stats.urgent }}</strong>
        <small>经营风险优先看</small>
      </div>
      <div class="metric-card later">
        <span>稍后处理</span>
        <strong>{{ stats.later }}</strong>
        <small>已进入跟进清单</small>
      </div>
      <div class="metric-card starred">
        <span>星标消息</span>
        <strong>{{ stats.starred }}</strong>
        <small>重点事项保留</small>
      </div>
    </section>

    <section class="message-shell">
      <aside class="message-sidebar">
        <div class="side-section">
          <span class="side-title">收件箱</span>
          <button
            v-for="folder in folders"
            :key="folder.key"
            class="side-item"
            :class="{ active: activeBox === folder.key && !activeType }"
            type="button"
            @click="selectBox(folder.key)"
          >
            <el-icon><component :is="folder.icon" /></el-icon>
            <span>{{ folder.label }}</span>
            <em>{{ folder.count }}</em>
          </button>
        </div>

        <div class="side-section">
          <span class="side-title">业务类型</span>
          <button
            v-for="type in typeFilters"
            :key="type.key"
            class="side-item"
            :class="{ active: activeType === type.key }"
            type="button"
            @click="selectType(type.key)"
          >
            <el-icon><component :is="type.icon" /></el-icon>
            <span>{{ type.label }}</span>
          </button>
        </div>
      </aside>

      <main class="message-workspace">
        <div class="workspace-toolbar">
          <div>
            <h3>{{ currentTitle }}</h3>
            <p>{{ total }} 条消息 · 支持搜索、星标、稍后、归档和业务跳转</p>
          </div>
          <div class="toolbar-controls">
            <el-input
              v-model="query.keyword"
              class="message-search"
              placeholder="搜索标题、客户、模块或内容"
              clearable
              @clear="handleQuery"
              @keyup.enter="handleQuery"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="query.priority" placeholder="优先级" clearable class="priority-select" @change="handleQuery">
              <el-option label="加急" value="urgent" />
              <el-option label="重要" value="high" />
              <el-option label="普通" value="normal" />
              <el-option label="低优先级" value="low" />
            </el-select>
          </div>
        </div>

        <div class="quick-row">
          <el-tag effect="plain">消息卡片</el-tag>
          <el-tag effect="plain" type="primary">点击跳转业务页</el-tag>
          <el-tag effect="plain" type="success">已读/未读同步</el-tag>
          <el-tag effect="plain" type="warning">后续可接实时推送</el-tag>
        </div>

        <div class="message-list" v-loading="loading">
          <el-empty v-if="messages.length === 0" description="暂无消息" />
          <article
            v-for="item in messages"
            v-else
            :key="item.id"
            class="business-message"
            :class="{ unread: !item.isRead, archived: item.isArchived }"
            @click="openDetail(item)"
          >
            <el-checkbox class="select-dot" :model-value="!item.isRead" disabled />

            <div class="message-avatar" :class="item.type">
              <el-icon :size="20"><component :is="typeIcon(item.type)" /></el-icon>
            </div>

            <div class="message-main">
              <div class="message-title-row">
                <h4>{{ item.title }}</h4>
                <el-tag :type="priorityTag(item.priority)" effect="plain" size="small">
                  {{ priorityText(item.priority) }}
                </el-tag>
                <el-tag v-if="item.isLater" type="warning" effect="plain" size="small">稍后</el-tag>
                <el-tag v-if="item.isStarred" type="primary" effect="plain" size="small">星标</el-tag>
              </div>
              <p class="message-content">{{ item.content }}</p>
              <div class="message-tags">
                <span>{{ item.module || '系统' }}</span>
                <span v-if="item.scene">{{ item.scene }}</span>
                <span v-if="item.entityName">{{ item.entityName }}</span>
                <span v-for="tag in item.tags || []" :key="tag">#{{ tag }}</span>
              </div>
            </div>

            <div class="message-side">
              <span>{{ formatTime(item.createTime) }}</span>
              <strong>{{ item.sender || '系统' }}</strong>
              <div class="message-actions" @click.stop>
                <el-button v-if="item.link" type="primary" size="small" @click="goBusiness(item)">
                  {{ item.actionText || '去处理' }}
                </el-button>
                <el-button size="small" @click="toggleRead(item)">
                  {{ item.isRead ? '标未读' : '已读' }}
                </el-button>
              </div>
            </div>

            <div class="more-actions" @click.stop>
              <el-button link :icon="Star" :class="{ active: item.isStarred }" @click="toggleStar(item)" />
              <el-button link :icon="Clock" :class="{ active: item.isLater }" @click="toggleLater(item)" />
              <el-button v-if="activeBox !== 'archived'" link :icon="FolderOpened" @click="archiveItem(item)" />
              <el-button v-else link :icon="Refresh" @click="restoreItem(item)" />
              <el-button link type="danger" :icon="Delete" @click="deleteItem(item)" />
            </div>
          </article>
        </div>

        <el-pagination
          v-if="total > query.pageSize"
          class="pagination-wrap"
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :page-sizes="[8, 12, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </main>
    </section>

    <el-drawer v-model="detailVisible" title="消息详情" size="460px">
      <div v-if="currentItem" class="detail-panel">
        <div class="detail-top">
          <div class="message-avatar" :class="currentItem.type">
            <el-icon :size="22"><component :is="typeIcon(currentItem.type)" /></el-icon>
          </div>
          <div>
            <h3>{{ currentItem.title }}</h3>
            <p>{{ currentItem.module }} · {{ formatTime(currentItem.createTime) }}</p>
          </div>
        </div>

        <div class="detail-content">{{ currentItem.content }}</div>

        <dl class="detail-meta">
          <div>
            <dt>发送方</dt>
            <dd>{{ currentItem.sender || '系统' }}</dd>
          </div>
          <div>
            <dt>业务对象</dt>
            <dd>{{ currentItem.entityName || '-' }}</dd>
          </div>
          <div>
            <dt>处理场景</dt>
            <dd>{{ currentItem.scene || '-' }}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>{{ currentItem.isRead ? '已读' : '未读' }}</dd>
          </div>
        </dl>

        <div class="detail-actions">
          <el-button v-if="currentItem.link" type="primary" @click="goBusiness(currentItem)">
            {{ currentItem.actionText || '去处理' }}
          </el-button>
          <el-button @click="toggleLater(currentItem)">{{ currentItem.isLater ? '取消稍后' : '稍后处理' }}</el-button>
          <el-button @click="toggleStar(currentItem)">{{ currentItem.isStarred ? '取消星标' : '星标' }}</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  ChatDotRound,
  Check,
  Clock,
  Delete,
  DocumentChecked,
  FolderOpened,
  Notebook,
  OfficeBuilding,
  Refresh,
  Search,
  Stamp,
  Star,
  Tickets,
  Van,
  Wallet
} from '@element-plus/icons-vue'
import {
  archiveNotification,
  deleteNotification,
  getNotificationStats,
  listNotification,
  readAllNotification,
  readNotification,
  resetNotificationDemoData,
  restoreNotification,
  toggleLaterNotification,
  toggleStarNotification,
  unreadNotification,
  type NotificationBox,
  type NotificationItem,
  type NotificationPriority,
  type NotificationType
} from '@/api/notification'

const router = useRouter()
const activeBox = ref<NotificationBox>('inbox')
const activeType = ref<NotificationType | ''>('')
const loading = ref(false)
const total = ref(0)
const messages = ref<NotificationItem[]>([])
const currentItem = ref<NotificationItem | null>(null)
const detailVisible = ref(false)
const stats = ref({ total: 0, unread: 0, urgent: 0, later: 0, starred: 0, archived: 0 })

const query = reactive({
  keyword: '',
  priority: '' as NotificationPriority | '',
  pageNum: 1,
  pageSize: 8
})

const folders = computed(() => [
  { key: 'inbox' as NotificationBox, label: '全部消息', count: stats.value.total, icon: Bell },
  { key: 'unread' as NotificationBox, label: '未读', count: stats.value.unread, icon: Check },
  { key: 'starred' as NotificationBox, label: '星标', count: stats.value.starred, icon: Star },
  { key: 'later' as NotificationBox, label: '稍后处理', count: stats.value.later, icon: Clock },
  { key: 'archived' as NotificationBox, label: '已归档', count: stats.value.archived, icon: FolderOpened }
])

const typeFilters = [
  { key: 'finance' as NotificationType, label: '财务消息', icon: Wallet },
  { key: 'customer' as NotificationType, label: '客户消息', icon: OfficeBuilding },
  { key: 'order' as NotificationType, label: '订单合同', icon: Tickets },
  { key: 'channel' as NotificationType, label: '渠道账期', icon: Van },
  { key: 'tax' as NotificationType, label: '税务报税', icon: Notebook },
  { key: 'task' as NotificationType, label: '任务待办', icon: DocumentChecked },
  { key: 'approval' as NotificationType, label: '审批', icon: Stamp },
  { key: 'message' as NotificationType, label: '@我协作', icon: ChatDotRound }
]

const currentTitle = computed(() => {
  const type = typeFilters.find((item) => item.key === activeType.value)
  if (type) return type.label
  return folders.value.find((item) => item.key === activeBox.value)?.label || '全部消息'
})

onMounted(async () => {
  await handleRefresh()
})

async function loadData() {
  loading.value = true
  try {
    const res = await listNotification({
      keyword: query.keyword,
      priority: query.priority || undefined,
      box: activeBox.value,
      type: activeType.value || undefined,
      pageNum: query.pageNum,
      pageSize: query.pageSize
    })
    messages.value = res.data.records
    total.value = Number(res.data.total || messages.value.length)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  const res = await getNotificationStats()
  stats.value = res.data
}

async function handleRefresh() {
  await Promise.all([loadStats(), loadData()])
}

function handleQuery() {
  query.pageNum = 1
  loadData()
}

function selectBox(box: NotificationBox) {
  activeBox.value = box
  activeType.value = ''
  query.pageNum = 1
  loadData()
}

function selectType(type: NotificationType) {
  activeType.value = type
  activeBox.value = 'inbox'
  query.pageNum = 1
  loadData()
}

async function handleMarkAllRead() {
  await readAllNotification()
  ElMessage.success('已全部标记为已读')
  await handleRefresh()
}

async function handleReset() {
  await ElMessageBox.confirm('确认重置消息中心演示数据？', '提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
  await resetNotificationDemoData()
  ElMessage.success('已重置消息数据')
  await handleRefresh()
}

async function openDetail(item: NotificationItem) {
  currentItem.value = item
  detailVisible.value = true
  if (!item.isRead) {
    await readNotification(item.id)
    item.isRead = true
    await loadStats()
  }
}

async function toggleRead(item: NotificationItem) {
  if (item.isRead) {
    await unreadNotification(item.id)
  } else {
    await readNotification(item.id)
  }
  await handleRefresh()
}

async function toggleStar(item: NotificationItem) {
  await toggleStarNotification(item.id)
  await handleRefresh()
  if (currentItem.value?.id === item.id) currentItem.value = { ...item, isStarred: !item.isStarred }
}

async function toggleLater(item: NotificationItem) {
  await toggleLaterNotification(item.id)
  await handleRefresh()
  if (currentItem.value?.id === item.id) currentItem.value = { ...item, isLater: !item.isLater }
}

async function archiveItem(item: NotificationItem) {
  await archiveNotification(item.id)
  await handleRefresh()
}

async function restoreItem(item: NotificationItem) {
  await restoreNotification(item.id)
  await handleRefresh()
}

async function deleteItem(item: NotificationItem) {
  await ElMessageBox.confirm(`确认删除「${item.title}」？`, '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await deleteNotification(item.id)
  if (currentItem.value?.id === item.id) {
    detailVisible.value = false
    currentItem.value = null
  }
  await handleRefresh()
}

async function goBusiness(item: NotificationItem) {
  if (!item.isRead) await readNotification(item.id)
  detailVisible.value = false
  if (item.link) router.push(item.link)
  await handleRefresh()
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
  return ({ urgent: '加急', high: '重要', normal: '普通', low: '低优先级' } as Record<NotificationPriority, string>)[priority || 'normal']
}

function priorityTag(priority?: NotificationPriority) {
  const map: Record<NotificationPriority, 'danger' | 'warning' | 'info' | 'success'> = {
    urgent: 'danger',
    high: 'warning',
    normal: 'info',
    low: 'success'
  }
  return map[priority || 'normal']
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '-'
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<style lang="scss" scoped>
.notification-page {
  padding: 16px;
}

.page-titlebar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 22px;
    font-weight: 700;
    line-height: 30px;
  }

  p {
    margin: 5px 0 0;
    color: var(--text-muted);
    font-size: 13px;
  }
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.metric-card {
  position: relative;
  display: grid;
  gap: 4px;
  min-height: 96px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;

  span,
  small {
    color: var(--text-muted);
    font-size: 12px;
  }

  strong {
    color: var(--text-primary);
    font-size: 28px;
    line-height: 34px;
  }

  &::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 16px;
    width: 8px;
    height: 32px;
    border-radius: 99px;
    background: #3370ff;
  }

  &.urgent::after { background: #f53f3f; }
  &.later::after { background: #ff7d00; }
  &.starred::after { background: #626aef; }
}

.message-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 14px;
  align-items: flex-start;
}

.message-sidebar,
.message-workspace {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
}

.message-sidebar {
  padding: 12px;
  position: sticky;
  top: 76px;
}

.side-section + .side-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);
}

.side-title {
  display: block;
  margin: 0 0 8px 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-body);
  cursor: pointer;
  text-align: left;
  transition: background 0.16s ease, color 0.16s ease;

  span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  em {
    min-width: 22px;
    color: var(--text-muted);
    font-size: 12px;
    font-style: normal;
    text-align: right;
  }

  &:hover,
  &.active {
    background: #e8f3ff;
    color: var(--brand-primary);

    em {
      color: var(--brand-primary);
    }
  }
}

.message-workspace {
  min-width: 0;
  padding: 14px;
}

.workspace-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-soft);

  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 17px;
  }

  p {
    margin: 5px 0 0;
    color: var(--text-muted);
    font-size: 12px;
  }
}

.toolbar-controls {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.message-search {
  width: 260px;
}

.priority-select {
  width: 118px;
}

.quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.message-list {
  min-height: 320px;
}

.business-message {
  position: relative;
  display: grid;
  grid-template-columns: 22px 42px minmax(0, 1fr) 190px 120px;
  gap: 12px;
  align-items: center;
  min-height: 112px;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;

  & + .business-message {
    margin-top: 10px;
  }

  &:hover {
    border-color: #bedaff;
    box-shadow: 0 8px 22px rgba(31, 35, 41, 0.08);
  }

  &.unread {
    background: #f7fbff;
    border-color: #bedaff;
  }

  &.archived {
    opacity: 0.76;
  }
}

.select-dot {
  pointer-events: none;
}

.message-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
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

.message-main {
  min-width: 0;
}

.message-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  h4 {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    margin: 0;
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.message-content {
  display: -webkit-box;
  overflow: hidden;
  margin: 7px 0 9px;
  color: var(--text-body);
  font-size: 13px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    color: var(--text-muted);
    font-size: 12px;
  }
}

.message-side {
  display: grid;
  gap: 7px;
  justify-items: end;
  color: var(--text-muted);
  font-size: 12px;

  strong {
    color: var(--text-body);
    font-weight: 500;
  }
}

.message-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.more-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 3px;

  .active {
    color: var(--brand-primary);
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.detail-top {
  display: flex;
  gap: 12px;
  align-items: center;

  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 18px;
  }

  p {
    margin: 4px 0 0;
    color: var(--text-muted);
    font-size: 12px;
  }
}

.detail-content {
  margin-top: 18px;
  padding: 14px;
  border-radius: 8px;
  background: #f7f8fa;
  color: var(--text-body);
  font-size: 14px;
  line-height: 1.7;
}

.detail-meta {
  display: grid;
  gap: 12px;
  margin: 18px 0;

  div {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-soft);
  }

  dt {
    color: var(--text-muted);
  }

  dd {
    margin: 0;
    color: var(--text-primary);
    text-align: right;
  }
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 1180px) {
  .message-shell {
    grid-template-columns: 1fr;
  }

  .message-sidebar {
    position: static;
  }

  .business-message {
    grid-template-columns: 22px 42px minmax(0, 1fr);
  }

  .message-side,
  .more-actions {
    grid-column: 3;
    justify-items: start;
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .page-titlebar,
  .workspace-toolbar,
  .toolbar-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .message-search,
  .priority-select {
    width: 100%;
  }
}
</style>
