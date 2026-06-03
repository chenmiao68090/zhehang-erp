<template>
  <div class="message-center" v-click-outside="closePanel">
    <el-badge :value="unreadTotal" :max="99" :hidden="unreadTotal === 0" class="notification-badge">
      <el-icon class="header-icon" @click="togglePanel" :size="20"><Bell /></el-icon>
    </el-badge>
    <transition name="msg-dropdown">
      <div class="msg-panel" v-show="visible">
        <div class="msg-panel-header">
          <span>{{ $t('notification.title') }}</span>
          <el-link type="primary" :underline="false" @click="handleMarkAllRead">{{ $t('common.markAllRead') }}</el-link>
        </div>
        <el-tabs v-model="activeTab" class="msg-tabs" stretch>
          <el-tab-pane name="notification">
            <template #label>{{ $t('notification.tabs.notification') }}<el-badge :value="unreadNotif" :hidden="unreadNotif === 0" :max="99" /></template>
            <div class="msg-list">
              <div v-if="notifList.length === 0" class="msg-empty">{{ $t('notification.noNotification') }}</div>
              <div v-for="item in notifList.slice(0, 5)" :key="item.id" class="msg-item" :class="{ unread: !item.isRead }" @click="handleItemClick(item)">
                <div class="msg-item-dot" v-if="!item.isRead"></div>
                <div class="msg-item-body"><div class="msg-item-title">{{ item.title }}</div><div class="msg-item-time">{{ item.createTime }}</div></div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="message">
            <template #label>{{ $t('notification.message') }}<el-badge :value="unreadMsg" :hidden="unreadMsg === 0" :max="99" /></template>
            <div class="msg-list">
              <div v-if="msgList.length === 0" class="msg-empty">{{ $t('notification.noNotification') }}</div>
              <div v-for="item in msgList.slice(0, 5)" :key="item.id" class="msg-item" :class="{ unread: !item.isRead }" @click="handleItemClick(item)">
                <div class="msg-item-dot" v-if="!item.isRead"></div>
                <div class="msg-item-body"><div class="msg-item-title">{{ item.title }}</div><div class="msg-item-time">{{ item.createTime }}</div></div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="todo">
            <template #label>{{ $t('notification.tabs.todo') }}<el-badge :value="unreadTodo" :hidden="unreadTodo === 0" :max="99" /></template>
            <div class="msg-list">
              <div v-if="todoList.length === 0" class="msg-empty">{{ $t('notification.noNotification') }}</div>
              <div v-for="item in todoList.slice(0, 5)" :key="item.id" class="msg-item" :class="{ unread: !item.isRead }" @click="handleItemClick(item)">
                <div class="msg-item-dot" v-if="!item.isRead"></div>
                <div class="msg-item-body"><div class="msg-item-title">{{ item.title }}</div><div class="msg-item-time">{{ item.createTime }}</div></div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="msg-panel-footer" @click="goNotificationPage">{{ $t('common.viewAll') }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Bell } from '@element-plus/icons-vue'
import { ClickOutside as vClickOutside } from 'element-plus'

const router = useRouter()
const { t } = useI18n()
const visible = ref(false)
const activeTab = ref('notification')

interface MsgItem { id: number; title: string; createTime: string; isRead: boolean; link?: string; type: string }

const notifList = ref<MsgItem[]>([
  { id: 1, title: '系统升级维护通知', createTime: '09:30', isRead: false, type: 'system' },
  { id: 2, title: '端午节放假通知', createTime: '昨天', isRead: false, type: 'system' },
  { id: 3, title: '考勤异常提醒', createTime: '05-16', isRead: true, type: 'system' }
])
const msgList = ref<MsgItem[]>([
  { id: 4, title: '新客户分配通知', createTime: '14:10', isRead: false, type: 'message' },
  { id: 5, title: '李四回复了您的评论', createTime: '昨天', isRead: true, type: 'message' }
])
const todoList = ref<MsgItem[]>([
  { id: 6, title: '审批张三的报销申请', createTime: '08:45', isRead: false, link: '/task-center/once', type: 'approval' },
  { id: 7, title: '合同到期跟进提醒', createTime: '昨天', isRead: false, link: '/order/contract', type: 'task' },
  { id: 8, title: '完成月度销售报告', createTime: '05-16', isRead: true, type: 'task' }
])

const unreadNotif = computed(() => notifList.value.filter(n => !n.isRead).length)
const unreadMsg = computed(() => msgList.value.filter(n => !n.isRead).length)
const unreadTodo = computed(() => todoList.value.filter(n => !n.isRead).length)
const unreadTotal = computed(() => unreadNotif.value + unreadMsg.value + unreadTodo.value)

function togglePanel() { visible.value = !visible.value }
function closePanel() { visible.value = false }
function handleItemClick(item: MsgItem) { item.isRead = true; if (item.link) { visible.value = false; router.push(item.link) } }
function handleMarkAllRead() { notifList.value.forEach(n => n.isRead = true); msgList.value.forEach(n => n.isRead = true); todoList.value.forEach(n => n.isRead = true) }
function goNotificationPage() { visible.value = false; router.push('/system/notification') }
</script>

<style lang="scss" scoped>
.message-center { position: relative; display: flex; align-items: center; }
.header-icon { cursor: pointer; color: #64748b; &:hover { color: #F26522; } }
.notification-badge { display: flex; align-items: center; }
.msg-panel { position: absolute; top: 40px; right: -60px; width: 340px; background: #fff; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 2100; overflow: hidden; }
.msg-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; font-size: 15px; font-weight: 600; border-bottom: 1px solid #f1f5f9; }
.msg-tabs {
  :deep(.el-tabs__header) { margin: 0; padding: 0 8px; }
  :deep(.el-tabs__nav-wrap::after) { height: 1px; }
  :deep(.el-tabs__item) { height: 40px; font-size: 13px; }
  :deep(.el-badge) { margin-left: 4px; }
}
.msg-list { max-height: 280px; overflow-y: auto; padding: 4px 0; }
.msg-empty { text-align: center; padding: 32px 0; color: #94a3b8; font-size: 13px; }
.msg-item { display: flex; align-items: flex-start; gap: 8px; padding: 10px 16px; cursor: pointer; transition: background 0.15s; &:hover { background: #f8fafc; } &.unread { background: #fef7f2; } }
.msg-item-dot { width: 6px; height: 6px; border-radius: 50%; background: #F26522; flex-shrink: 0; margin-top: 6px; }
.msg-item-body { flex: 1; min-width: 0; }
.msg-item-title { font-size: 13px; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.msg-item-time { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.msg-panel-footer { text-align: center; padding: 10px; font-size: 13px; color: #F26522; border-top: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s; &:hover { background: #fef7f2; } }
.msg-dropdown-enter-active, .msg-dropdown-leave-active { transition: all 0.2s ease; }
.msg-dropdown-enter-from, .msg-dropdown-leave-to { opacity: 0; transform: translateY(-8px); }

html.dark {
  .msg-panel { background: var(--el-bg-color); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .msg-panel-header { border-color: var(--el-border-color); }
  .msg-panel-footer { border-color: var(--el-border-color); }
  .msg-item:hover { background: var(--el-bg-color-overlay); }
  .msg-item.unread { background: #2a1a10; }
  .msg-item-title { color: var(--el-text-color-regular); }
}
</style>
