<template>
  <div class="page-container notification-page">
    <div class="page-header">
      <h2>{{ $t('notification.title') }}</h2>
      <div class="header-actions">
        <el-button @click="handleMarkAllRead" :icon="Check">{{ $t('notification.markAllRead') }}</el-button>
        <el-button @click="handleBatchDelete" :icon="Delete" :disabled="selectedIds.length === 0">{{ $t('notification.batchDelete') }}</el-button>
        <el-button @click="showSettings = true" :icon="Setting">{{ $t('notification.settings') }}</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane :label="tabLabel('all')" name="all" />
      <el-tab-pane :label="tabLabel('unread')" name="unread" />
      <el-tab-pane :label="tabLabel('system')" name="system" />
      <el-tab-pane :label="tabLabel('approval')" name="approval" />
      <el-tab-pane :label="tabLabel('task')" name="task" />
    </el-tabs>

    <div class="notification-list" v-loading="loading">
      <div v-if="filteredList.length === 0" class="empty-state">
        <el-empty :description="$t('notification.noNotification')" />
      </div>
      <div v-else>
        <div v-for="item in filteredList" :key="item.id" class="notification-item" :class="{ unread: !item.isRead }" @click="handleClick(item)">
          <el-checkbox v-model="item.selected" @click.stop @change="updateSelectedIds" />
          <div class="notif-dot" v-if="!item.isRead"></div>
          <div class="notif-icon" :class="item.type">
            <el-icon :size="20">
              <Bell v-if="item.type === 'system'" />
              <Stamp v-else-if="item.type === 'approval'" />
              <DocumentChecked v-else-if="item.type === 'task'" />
              <ChatDotRound v-else />
            </el-icon>
          </div>
          <div class="notif-body">
            <div class="notif-title">{{ item.title }}</div>
            <div class="notif-content">{{ item.content }}</div>
          </div>
          <div class="notif-meta">
            <el-tag :type="typeTagType(item.type)" size="small" effect="plain">{{ $t('notification.' + item.type) }}</el-tag>
            <span class="notif-time">{{ item.createTime }}</span>
          </div>
          <div class="notif-actions" @click.stop>
            <el-button v-if="!item.isRead" link type="primary" size="small" @click="markRead(item)">{{ $t('notification.markRead') }}</el-button>
            <el-button link type="danger" size="small" @click="deleteItem(item)">{{ $t('notification.delete') }}</el-button>
          </div>
        </div>
      </div>
      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="pageNum" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="loadData" />
      </div>
    </div>

    <el-dialog v-model="showSettings" :title="$t('notification.settingsTitle')" width="480px">
      <el-form label-width="120px">
        <el-form-item :label="$t('notification.emailNotify')"><el-switch v-model="settings.emailEnabled" /></el-form-item>
        <el-form-item :label="$t('notification.browserNotify')"><el-switch v-model="settings.browserEnabled" /></el-form-item>
        <el-form-item :label="$t('notification.frequency')">
          <el-radio-group v-model="settings.frequency">
            <el-radio value="realtime">{{ $t('notification.realtime') }}</el-radio>
            <el-radio value="daily">{{ $t('notification.daily') }}</el-radio>
            <el-radio value="weekly">{{ $t('notification.weekly') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettings = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveSettings">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Stamp, DocumentChecked, ChatDotRound, Check, Delete, Setting } from '@element-plus/icons-vue'
import type { NotificationItem } from '@/api/notification'

const router = useRouter()
const { t } = useI18n()
const activeTab = ref('all')
const loading = ref(false)
const showSettings = ref(false)
const pageNum = ref(1)
const pageSize = ref(15)
const total = ref(0)
const selectedIds = ref<number[]>([])
const settings = ref({ emailEnabled: true, browserEnabled: true, frequency: 'realtime' })

interface NotifItemExt extends NotificationItem { selected?: boolean }

const notifications = ref<NotifItemExt[]>([
  { id: 1, title: '系统升级维护通知', content: 'ERP系统将于5月20日凌晨2:00-5:00进行版本升级，届时系统暂停服务。', type: 'system', isRead: false, createTime: '2026-05-18 09:30', sender: '系统管理员' },
  { id: 2, title: '报销审批待处理', content: '张三提交的差旅报销申请（¥3,200）等待您审批。', type: 'approval', isRead: false, createTime: '2026-05-18 08:45', link: '/workflow/todo' },
  { id: 3, title: '合同到期提醒', content: '杭州科技有限公司服务合同将于2026-06-01到期，请及时跟进续签。', type: 'task', isRead: false, createTime: '2026-05-17 16:20' },
  { id: 4, title: '新客户分配通知', content: '系统已将新线索"宁波精密制造有限公司"分配给您，请尽快联系。', type: 'message', isRead: false, createTime: '2026-05-17 14:10' },
  { id: 5, title: '考勤异常提醒', content: '您5月15日下午签退记录缺失，请补签或联系HR。', type: 'system', isRead: true, createTime: '2026-05-16 09:00' },
  { id: 6, title: '月度绩效评估开始', content: '2026年4月份绩效自评已开放，请在5月22日前完成。', type: 'task', isRead: true, createTime: '2026-05-15 10:00' },
  { id: 7, title: '端午节放假通知', content: '2026年端午节5月28日至30日放假调休，共3天。', type: 'system', isRead: true, createTime: '2026-05-14 11:30' },
  { id: 8, title: '采购订单审批', content: '李四提交的办公用品采购订单（¥5,800）等待审批。', type: 'approval', isRead: true, createTime: '2026-05-13 15:40' }
])
total.value = notifications.value.length

const filteredList = computed(() => {
  let list = notifications.value
  if (activeTab.value === 'unread') list = list.filter(n => !n.isRead)
  else if (activeTab.value !== 'all') list = list.filter(n => n.type === activeTab.value)
  return list
})

function tabLabel(tab: string) {
  const map: Record<string, string> = { all: t('notification.all'), unread: t('notification.unread'), system: t('notification.system'), approval: t('notification.approval'), task: t('notification.task') }
  let count = 0
  if (tab === 'unread' || tab === 'all') count = notifications.value.filter(n => !n.isRead).length
  else count = notifications.value.filter(n => n.type === tab && !n.isRead).length
  return count > 0 ? map[tab] + ' (' + count + ')' : map[tab]
}

function typeTagType(type: string) {
  const map: Record<string, any> = { system: 'info', approval: 'warning', task: 'success', message: '' }
  return map[type] || ''
}

function handleTabChange() { pageNum.value = 1 }
function handleClick(item: NotifItemExt) { if (!item.isRead) item.isRead = true; if (item.link) router.push(item.link) }
function markRead(item: NotifItemExt) { item.isRead = true; ElMessage.success(t('common.success')) }

function deleteItem(item: NotifItemExt) {
  ElMessageBox.confirm(t('notification.delete') + '?', '', { type: 'warning' }).then(() => {
    notifications.value = notifications.value.filter(n => n.id !== item.id)
    ElMessage.success(t('common.success'))
  }).catch(() => {})
}

function handleMarkAllRead() { notifications.value.forEach(n => n.isRead = true); ElMessage.success(t('common.success')) }

function handleBatchDelete() {
  ElMessageBox.confirm(t('notification.batchDelete') + '?', '', { type: 'warning' }).then(() => {
    notifications.value = notifications.value.filter(n => !selectedIds.value.includes(n.id))
    selectedIds.value = []
    ElMessage.success(t('common.success'))
  }).catch(() => {})
}

function updateSelectedIds() { selectedIds.value = notifications.value.filter(n => n.selected).map(n => n.id) }
function saveSettings() { showSettings.value = false; ElMessage.success(t('common.success')) }
function loadData() { /* API call placeholder */ }
onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.notification-page {
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; h2 { font-size: 18px; font-weight: 600; color: #1e293b; } }
}
.notification-list { margin-top: 8px; }
.notification-item {
  display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 8px; margin-bottom: 8px;
  background: #fff; border: 1px solid #f1f5f9; transition: all 0.2s; cursor: pointer;
  &:hover { border-color: #F26522; box-shadow: 0 2px 8px rgba(242,101,34,0.08); }
  &.unread { background: #fef7f2; border-color: #fde0cc; }
}
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #F26522; flex-shrink: 0; }
.notif-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; &.system { background: #3B82F6; } &.approval { background: #F59E0B; } &.task { background: #10B981; } &.message { background: #8B5CF6; } }
.notif-body { flex: 1; min-width: 0; }
.notif-title { font-size: 14px; font-weight: 500; color: #1e293b; margin-bottom: 4px; }
.notif-content { font-size: 13px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notif-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.notif-time { font-size: 12px; color: #94a3b8; white-space: nowrap; }
.notif-actions { display: flex; gap: 4px; flex-shrink: 0; }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 0; }
.empty-state { padding: 40px 0; }

html.dark {
  .notification-item { background: var(--el-bg-color); border-color: var(--el-border-color); }
  .notification-item.unread { background: #2a1a10; border-color: #4a2a15; }
  .notif-title { color: var(--el-text-color-primary); }
  .notif-content { color: var(--el-text-color-regular); }
  .page-header h2 { color: var(--el-text-color-primary); }
}
</style>
