<template>
  <div class="im-details">
    <div class="detail-profile">
      <el-avatar :size="58" :src="conversation.avatarUrl">{{ conversation.name?.slice(0, 1) }}</el-avatar>
      <div>
        <h3>{{ conversation.name }}</h3>
        <p>{{ typeLabel }}<span v-if="conversation.memberCount > 2"> · {{ conversation.memberCount }} 人</span></p>
      </div>
    </div>

    <div v-if="conversation.businessType" class="business-link">
      <div class="business-icon"><el-icon><Briefcase /></el-icon></div>
      <div><small>关联业务</small><strong>{{ businessLabel }} #{{ conversation.businessId }}</strong></div>
      <el-icon><ArrowRight /></el-icon>
    </div>

    <el-tabs v-model="activeTab" stretch>
      <el-tab-pane label="成员" name="members">
        <div class="detail-section-head">
          <span>{{ members.length }} 名成员</span>
          <el-button v-if="canManageMembers" text :icon="UserFilled" title="添加成员" @click="$emit('add-members')" />
        </div>
        <div class="member-list">
          <div v-for="member in members" :key="member.userId" class="member-row">
            <span class="avatar-wrap">
              <el-avatar :size="34" :src="member.avatar">{{ member.name.slice(0, 1) }}</el-avatar>
              <i :class="{ online: member.online }" />
            </span>
            <span class="member-copy"><b>{{ member.name }}</b><small>{{ member.deptName || '未设置部门' }} · <em :class="{ online: member.online }">{{ presenceText(member.online, member.lastActiveAt) }}</em></small></span>
            <el-tag v-if="member.memberRole !== 'member'" size="small" effect="plain">{{ member.memberRole === 'owner' ? '群主' : '管理员' }}</el-tag>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="文件" name="files">
        <div v-if="files.length" class="file-list">
          <button v-for="file in files" :key="file.id" type="button" class="file-row" @click="$emit('download', file)">
            <span class="file-icon"><el-icon><component :is="file.image ? Picture : Document" /></el-icon></span>
            <span><b>{{ file.originalName }}</b><small>{{ formatBytes(file.fileSize) }} · {{ formatDate(file.createdAt) }}</small></span>
            <el-icon><Download /></el-icon>
          </button>
        </div>
        <el-empty v-else :image-size="64" description="暂无共享文件" />
      </el-tab-pane>

      <el-tab-pane label="设置" name="settings">
        <div class="setting-list">
          <label><span><b>置顶会话</b><small>固定在会话列表顶部</small></span><el-switch :model-value="conversation.pinned" @change="emitSetting('pinned', $event)" /></label>
          <label><span><b>消息免打扰</b><small>@我仍会进入提醒</small></span><el-switch :model-value="conversation.muted" @change="emitSetting('muted', $event)" /></label>
          <label><span><b>通知声音</b><small>当前账号的消息提示音</small></span><el-switch :model-value="preference.soundEnabled" @change="emitPreference('soundEnabled', $event)" /></label>
          <label><span><b>浏览器通知</b><small>页面不活跃时显示</small></span><el-switch :model-value="preference.browserNotification" @change="emitPreference('browserNotification', $event)" /></label>
          <div class="setting-select">
            <span><b>会话提醒范围</b><small>可只接收@消息</small></span>
            <el-select :model-value="conversation.notificationLevel" @change="emitSetting('notificationLevel', $event)">
              <el-option label="全部消息" value="all" />
              <el-option label="仅@我的" value="mention" />
              <el-option label="不提醒" value="none" />
            </el-select>
          </div>
        </div>
        <el-button v-if="conversation.canLeave" class="leave-button" plain type="danger" @click="$emit('leave')">退出群聊</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, Briefcase, Document, Download, Picture, UserFilled } from '@element-plus/icons-vue'
import type { ImAttachment, ImContact, ImConversation, ImPreference } from '@/api/im'
import { formatImPresence } from '@/utils/im-presence'
import { useImStore } from '@/stores/im'

const props = defineProps<{
  conversation: ImConversation
  members: ImContact[]
  files: ImAttachment[]
  preference: ImPreference
}>()

const emit = defineEmits<{
  setting: [key: string, value: unknown]
  preference: [key: keyof ImPreference, value: boolean]
  'add-members': []
  leave: []
  download: [file: ImAttachment]
}>()

const activeTab = ref('members')
const imStore = useImStore()
const canManageMembers = computed(() => ['owner', 'admin'].includes(props.conversation.memberRole))
const typeLabel = computed(() => ({ direct: '单聊', group: '普通群', department: '部门群', business: '业务群', announcement: '公告群', system: '系统通知' }[props.conversation.type] || '会话'))
const businessLabel = computed(() => ({ customer: '客户', lead: '线索', order: '提单', review: '审单', receipt: '收款', task: '待办', training: '培训' }[props.conversation.businessType || ''] || props.conversation.businessType))

function emitSetting(key: string, value: unknown) { emit('setting', key, value) }
function emitPreference(key: keyof ImPreference, value: unknown) { emit('preference', key, Boolean(value)) }
function presenceText(online: boolean, lastActiveAt?: string) { return formatImPresence(online, lastActiveAt, true, new Date(imStore.presenceClock)) }
function formatBytes(size = 0) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
function formatDate(value?: string) { return value ? new Date(value).toLocaleDateString('zh-CN') : '' }
</script>

<style scoped lang="scss">
.im-details { height: 100%; min-height: 0; display: flex; flex-direction: column; background: #fff; }
.detail-profile { display: flex; align-items: center; gap: 13px; padding: 20px 18px 16px; }
.detail-profile .el-avatar { flex: 0 0 auto; background: #e8f3ff; color: #3370ff; font-size: 20px; font-weight: 700; }
.detail-profile h3 { max-width: 195px; margin: 0 0 4px; overflow: hidden; font-size: 18px; text-overflow: ellipsis; white-space: nowrap; }
.detail-profile p { margin: 0; color: var(--text-muted); font-size: 13px; }
.business-link { display: grid; grid-template-columns: 36px 1fr 16px; align-items: center; gap: 10px; margin: 0 14px 12px; padding: 10px; border: 1px solid #d6e4ff; border-radius: 7px; background: #f7faff; color: var(--text-body); cursor: pointer; }
.business-link > .el-icon { color: var(--text-muted); }
.business-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 7px; background: #e8f3ff; color: #3370ff; }
.business-link div:nth-child(2) { min-width: 0; display: grid; gap: 2px; }
.business-link small { color: var(--text-muted); font-size: 12px; }
.business-link strong { overflow: hidden; color: var(--text-primary); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
:deep(.el-tabs) { min-height: 0; flex: 1; display: flex; flex-direction: column; }
:deep(.el-tabs__header) { margin: 0; padding: 0 10px; }
:deep(.el-tabs__content) { min-height: 0; flex: 1; overflow: auto; }
:deep(.el-tab-pane) { min-height: 100%; padding: 12px 14px 18px; }
.detail-section-head { height: 34px; display: flex; align-items: center; justify-content: space-between; color: var(--text-muted); font-size: 13px; }
.member-list, .file-list { display: grid; gap: 2px; }
.member-row { min-height: 52px; display: flex; align-items: center; gap: 10px; padding: 7px 4px; }
.avatar-wrap { position: relative; flex: 0 0 auto; }
.avatar-wrap .el-avatar { background: #f2f3f5; color: #4e5969; font-size: 13px; }
.avatar-wrap i { position: absolute; right: 0; bottom: 1px; width: 9px; height: 9px; border: 2px solid #fff; border-radius: 50%; background: #c9cdd4; }
.avatar-wrap i.online { background: #00b42a; }
.member-copy { min-width: 0; flex: 1; display: grid; gap: 3px; }
.member-copy b { overflow: hidden; color: var(--text-primary); font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.member-copy small { overflow: hidden; color: var(--text-muted); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.member-copy em { font-style: normal; }
.member-copy em.online { color: #00a82d; }
.file-row { min-width: 0; display: grid; grid-template-columns: 36px 1fr 18px; align-items: center; gap: 9px; padding: 9px 5px; border: 0; border-bottom: 1px solid var(--border-soft); background: #fff; color: var(--text-muted); text-align: left; cursor: pointer; }
.file-row:hover { background: #f7f8fa; }
.file-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 7px; background: #f2f7ff; color: #3370ff; }
.file-row > span:nth-child(2) { min-width: 0; display: grid; gap: 4px; }
.file-row b { overflow: hidden; color: var(--text-primary); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.file-row small { color: var(--text-muted); font-size: 12px; }
.setting-list { display: grid; }
.setting-list label, .setting-select { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--border-soft); }
.setting-list label > span, .setting-select > span { min-width: 0; display: grid; gap: 3px; }
.setting-list b { color: var(--text-primary); font-size: 14px; font-weight: 600; }
.setting-list small { color: var(--text-muted); font-size: 13px; }
.setting-select .el-select { width: 108px; }
.leave-button { width: 100%; margin-top: 18px; }
</style>
