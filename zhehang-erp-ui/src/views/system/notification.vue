<template>
  <div class="page-container notification-page">
    <div class="page-titlebar">
      <div>
        <h2>{{ $t('notification.title') }}</h2>
        <p>{{ $t('notification.unreadSummary', { count: unreadCount }) }}</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="handleRefresh">{{ $t('common.refresh') }}</el-button>
        <el-button type="primary" :icon="Check" :disabled="unreadCount === 0" @click="handleMarkAllRead">
          {{ $t('notification.markAllRead') }}
        </el-button>
        <el-button type="danger" plain :icon="Delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          {{ $t('notification.batchDelete') }}
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" :inline="true">
        <el-form-item :label="$t('notification.keyword')">
          <el-input
            v-model="queryParams.keyword"
            :placeholder="$t('notification.keywordPlaceholder')"
            clearable
            @clear="handleQuery"
            @keyup.enter="handleQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">{{ $t('common.search') }}</el-button>
          <el-button @click="resetQuery">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-tabs v-model="activeTab" class="notification-tabs" @tab-change="handleTabChange">
      <el-tab-pane :label="tabLabel('all')" name="all" />
      <el-tab-pane :label="tabLabel('unread')" name="unread" />
      <el-tab-pane :label="$t('notification.system')" name="system" />
      <el-tab-pane :label="$t('notification.approval')" name="approval" />
      <el-tab-pane :label="$t('notification.task')" name="task" />
      <el-tab-pane :label="$t('notification.message')" name="message" />
    </el-tabs>

    <div v-if="selectedIds.length" class="selection-bar">
      <span>{{ $t('notification.selectedCount', { count: selectedIds.length }) }}</span>
      <el-button link type="primary" @click="clearSelection">{{ $t('notification.clearSelection') }}</el-button>
    </div>

    <div class="notification-list" v-loading="loading">
      <el-empty v-if="notifications.length === 0" class="empty-state" :description="$t('notification.noNotification')" />
      <template v-else>
        <article
          v-for="item in notifications"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.isRead, selected: selectedIds.includes(item.id) }"
          @click="handleClick(item)"
        >
          <el-checkbox
            class="select-checkbox"
            :model-value="selectedIds.includes(item.id)"
            @click.stop
            @change="(checked) => toggleSelect(item.id, checked)"
          />
          <span v-if="!item.isRead" class="notif-dot" />
          <div class="notif-icon" :class="item.type">
            <el-icon :size="20">
              <Bell v-if="item.type === 'system'" />
              <Stamp v-else-if="item.type === 'approval'" />
              <DocumentChecked v-else-if="item.type === 'task'" />
              <ChatDotRound v-else />
            </el-icon>
          </div>
          <div class="notif-body">
            <div class="notif-title-row">
              <span class="notif-title">{{ item.title }}</span>
              <el-tag v-if="!item.isRead" size="small" type="danger" effect="plain">{{ $t('notification.unread') }}</el-tag>
            </div>
            <div class="notif-content">{{ item.content || $t('notification.noContent') }}</div>
          </div>
          <div class="notif-meta">
            <el-tag :type="typeTagType(item.type)" size="small" effect="plain">{{ $t(`notification.${item.type}`) }}</el-tag>
            <span class="notif-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <div class="notif-actions" @click.stop>
            <el-button v-if="!item.isRead" link type="primary" size="small" @click="markRead(item)">
              {{ $t('notification.markRead') }}
            </el-button>
            <el-button link type="danger" size="small" @click="deleteItem(item)">
              {{ $t('notification.delete') }}
            </el-button>
          </div>
        </article>
      </template>
    </div>

    <el-pagination
      v-if="total > queryParams.pageSize"
      class="pagination-wrap"
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 15, 30, 50]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
    />

    <el-drawer v-model="detailVisible" :title="$t('notification.detail')" size="420px">
      <div v-if="currentItem" class="detail-panel">
        <div class="detail-heading">
          <el-tag :type="typeTagType(currentItem.type)" effect="plain">{{ $t(`notification.${currentItem.type}`) }}</el-tag>
          <el-tag :type="currentItem.isRead ? 'info' : 'danger'" effect="plain">
            {{ currentItem.isRead ? $t('notification.readStatus') : $t('notification.unread') }}
          </el-tag>
        </div>
        <h3>{{ currentItem.title }}</h3>
        <div class="detail-time">{{ formatTime(currentItem.createTime) }}</div>
        <div class="detail-content">{{ currentItem.content || $t('notification.noContent') }}</div>
        <div class="detail-meta">
          <div>
            <span>{{ $t('notification.sender') }}</span>
            <strong>{{ currentItem.sender || $t('notification.systemSender') }}</strong>
          </div>
          <div>
            <span>{{ $t('notification.link') }}</span>
            <el-button v-if="currentItem.link" link type="primary" @click="goLink(currentItem.link)">
              {{ $t('notification.openLink') }}
            </el-button>
            <strong v-else>{{ $t('notification.noLink') }}</strong>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Stamp, DocumentChecked, ChatDotRound, Check, Delete, Refresh, Search } from '@element-plus/icons-vue'
import {
  deleteNotification,
  getUnreadCount,
  listNotification,
  readAllNotification,
  readNotification,
  type NotificationItem,
  type NotificationType
} from '@/api/notification'

type NotificationTab = 'all' | 'unread' | NotificationType

const router = useRouter()
const { t } = useI18n()

const activeTab = ref<NotificationTab>('all')
const loading = ref(false)
const total = ref(0)
const unreadCount = ref(0)
const selectedIds = ref<number[]>([])
const notifications = ref<NotificationItem[]>([])
const detailVisible = ref(false)
const currentItem = ref<NotificationItem | null>(null)

const queryParams = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 15
})

const currentListIds = computed(() => notifications.value.map((item) => item.id))

onMounted(() => {
  loadData()
  loadUnreadCount()
})

async function loadData() {
  loading.value = true
  try {
    const res: any = await listNotification(buildListParams())
    const page = res.data || {}
    notifications.value = (page.records || page.list || []).map(normalizeNotification)
    total.value = Number(page.total || notifications.value.length)
    selectedIds.value = selectedIds.value.filter((id) => currentListIds.value.includes(id))
  } finally {
    loading.value = false
  }
}

async function loadUnreadCount() {
  const res: any = await getUnreadCount()
  unreadCount.value = Number(res.data || 0)
}

function buildListParams() {
  const params: any = {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize
  }
  const keyword = queryParams.keyword.trim()
  if (keyword) {
    params.keyword = keyword
  }
  if (activeTab.value === 'unread') {
    params.isRead = 0
  } else if (activeTab.value !== 'all') {
    params.type = activeTab.value
  }
  return params
}

function normalizeNotification(item: any): NotificationItem {
  return {
    ...item,
    type: normalizeType(item.type),
    isRead: item.isRead === true || item.isRead === 1
  }
}

function normalizeType(type: unknown): NotificationType {
  const typeMap: Record<string, NotificationType> = {
    '1': 'system',
    '2': 'approval',
    '3': 'task',
    '4': 'message',
    system: 'system',
    approval: 'approval',
    task: 'task',
    message: 'message'
  }
  return typeMap[String(type)] || 'system'
}

function tabLabel(tab: NotificationTab) {
  if (tab === 'all') {
    return unreadCount.value > 0 ? `${t('notification.all')} (${unreadCount.value})` : t('notification.all')
  }
  if (tab === 'unread') {
    return unreadCount.value > 0 ? `${t('notification.unread')} (${unreadCount.value})` : t('notification.unread')
  }
  return t(`notification.${tab}`)
}

function typeTagType(type: NotificationType) {
  const map: Record<NotificationType, 'info' | 'warning' | 'success' | 'primary'> = {
    system: 'info',
    approval: 'warning',
    task: 'success',
    message: 'primary'
  }
  return map[type]
}

function handleTabChange() {
  queryParams.pageNum = 1
  clearSelection()
  loadData()
}

function handleQuery() {
  queryParams.pageNum = 1
  loadData()
}

function resetQuery() {
  queryParams.keyword = ''
  handleQuery()
}

async function handleRefresh() {
  await loadData()
  await loadUnreadCount()
}

async function handleClick(item: NotificationItem) {
  currentItem.value = item
  detailVisible.value = true
  if (!item.isRead) {
    await markRead(item, false)
  }
}

async function markRead(item: NotificationItem, showMessage = true) {
  if (item.isRead) return
  await readNotification(item.id)
  item.isRead = true
  if (currentItem.value?.id === item.id) {
    currentItem.value = { ...item }
  }
  await loadUnreadCount()
  if (showMessage) {
    ElMessage.success(t('common.success'))
  }
}

async function handleMarkAllRead() {
  if (unreadCount.value === 0) return
  await ElMessageBox.confirm(t('notification.allReadConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
  await readAllNotification()
  notifications.value.forEach((item) => {
    item.isRead = true
  })
  unreadCount.value = 0
  ElMessage.success(t('common.success'))
}

async function deleteItem(item: NotificationItem) {
  await ElMessageBox.confirm(t('notification.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
  await deleteNotification(item.id)
  notifications.value = notifications.value.filter((notification) => notification.id !== item.id)
  selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
  total.value = Math.max(0, total.value - 1)
  if (currentItem.value?.id === item.id) {
    detailVisible.value = false
    currentItem.value = null
  }
  await loadUnreadCount()
  ElMessage.success(t('common.success'))
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(t('notification.batchDeleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
  const ids = [...selectedIds.value]
  await Promise.all(ids.map((id) => deleteNotification(id)))
  selectedIds.value = []
  await loadData()
  await loadUnreadCount()
  ElMessage.success(t('common.success'))
}

function toggleSelect(id: number, checked: string | number | boolean) {
  const isChecked = Boolean(checked)
  if (isChecked && !selectedIds.value.includes(id)) {
    selectedIds.value.push(id)
  }
  if (!isChecked) {
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id)
  }
}

function clearSelection() {
  selectedIds.value = []
}

function goLink(link: string) {
  if (/^https?:\/\//.test(link)) {
    window.open(link, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(link)
}

function formatTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
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
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.filter-card {
  margin-bottom: 12px;

  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.notification-tabs {
  margin-bottom: 8px;
}

.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px 12px;
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.notification-list {
  min-height: 180px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;

  &:hover,
  &.selected {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  }

  &.unread {
    border-color: #ffd2b8;
    background: #fff7f2;
  }
}

.select-checkbox {
  flex-shrink: 0;
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f26522;
  flex-shrink: 0;
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  &.system {
    background: #3b82f6;
  }

  &.approval {
    background: #f59e0b;
  }

  &.task {
    background: #10b981;
  }

  &.message {
    background: #6366f1;
  }
}

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin-bottom: 4px;
}

.notif-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.notif-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.notif-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.notif-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.notif-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.empty-state {
  padding: 44px 0;
}

.detail-panel {
  h3 {
    margin: 14px 0 8px;
    font-size: 18px;
    line-height: 26px;
    color: var(--el-text-color-primary);
  }
}

.detail-heading {
  display: flex;
  gap: 8px;
}

.detail-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.detail-content {
  margin-top: 20px;
  padding: 14px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-regular);
  line-height: 1.7;
  white-space: pre-wrap;
}

.detail-meta {
  margin-top: 18px;
  display: grid;
  gap: 12px;

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
  }

  span {
    color: var(--el-text-color-secondary);
  }

  strong {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

@media (max-width: 768px) {
  .page-titlebar,
  .notification-item {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions,
  .notif-meta,
  .notif-actions {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .notif-meta {
    flex-direction: row;
  }
}
</style>
