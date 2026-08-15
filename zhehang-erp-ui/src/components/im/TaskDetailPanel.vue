<template>
  <div class="task-detail-panel">
    <template v-if="task">
      <header>
        <div class="title-line">
          <el-tag :type="statusMeta.type">{{ statusMeta.label }}</el-tag>
          <el-tag :type="priorityMeta.type" effect="plain">{{ priorityMeta.label }}</el-tag>
        </div>
        <h2>{{ task.title }}</h2>
        <p>由 {{ task.creatorName }} 创建 · {{ formatTime(task.createdAt) }}</p>
      </header>

      <section class="detail-section">
        <h3>执行信息</h3>
        <dl>
          <dt>责任人</dt><dd>{{ people('responsible') }}</dd>
          <dt>协同人</dt><dd>{{ people('collaborator') || '无' }}</dd>
          <dt>所属部门</dt><dd>{{ task.deptName || '未设置' }}</dd>
          <dt>截止时间</dt><dd :class="{ danger: task.overdue }">{{ formatTime(task.deadlineAt) }}</dd>
          <dt>验收人</dt><dd>{{ task.reviewerName }}</dd>
        </dl>
      </section>

      <section class="detail-section">
        <h3>验收标准</h3>
        <p class="long-text">{{ task.acceptanceStandard }}</p>
      </section>

      <section v-if="task.businessType || task.customerId" class="detail-section">
        <h3>关联业务</h3>
        <p>{{ businessLabel }}<template v-if="task.businessId"> #{{ task.businessId }}</template><template v-if="task.customerId"> · 客户 #{{ task.customerId }}</template></p>
      </section>

      <section v-if="task.resultText || task.rejectReason" class="detail-section result-section">
        <h3>{{ task.rejectReason ? '驳回原因' : '处理结果' }}</h3>
        <p class="long-text">{{ task.rejectReason || task.resultText }}</p>
        <div v-if="task.resultAttachments?.length" class="evidence-list">
          <button v-for="file in task.resultAttachments" :key="file.id" type="button" @click="$emit('download', file)">
            <el-icon><Document /></el-icon><span>{{ file.originalName }}</span><el-icon><Download /></el-icon>
          </button>
        </div>
      </section>

      <section class="detail-section timeline-section">
        <h3>处理时间线</h3>
        <el-timeline>
          <el-timeline-item v-for="item in task.timeline || []" :key="item.id" :timestamp="formatTime(item.createdAt)" placement="top">
            <b>{{ actionLabel(item.actionType) }}</b>
            <p>{{ item.operatorName }}<template v-if="item.comment"> · {{ item.comment }}</template></p>
          </el-timeline-item>
        </el-timeline>
      </section>

      <footer>
        <el-button text @click="$emit('source', task.sourceMessageId)">查看来源消息</el-button>
        <span />
        <el-button v-if="task.canCancel" type="danger" plain @click="$emit('cancel', task)">取消待办</el-button>
        <el-button v-if="task.canAccept" type="primary" @click="$emit('accept', task)">接收待办</el-button>
        <el-button v-if="task.canSubmit" type="primary" @click="$emit('submit', task)">提交完成</el-button>
        <el-button v-if="task.canReview" type="success" @click="$emit('review', task)">验收处理</el-button>
      </footer>
    </template>
    <el-skeleton v-else :rows="8" animated />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document, Download } from '@element-plus/icons-vue'
import type { ImAttachment, ImWorkTask } from '@/api/im'

const props = defineProps<{ task: ImWorkTask | null }>()
defineEmits<{
  source: [messageId: number]
  download: [file: ImAttachment]
  accept: [task: ImWorkTask]
  submit: [task: ImWorkTask]
  review: [task: ImWorkTask]
  cancel: [task: ImWorkTask]
}>()

const statusMeta = computed(() => ({
  pending_accept: { label: '待接收', type: 'warning' }, in_progress: { label: '进行中', type: 'primary' },
  pending_review: { label: '待验收', type: 'warning' }, completed: { label: '已完成', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' }, cancelled: { label: '已取消', type: 'info' },
  overdue: { label: '已逾期', type: 'danger' }
} as const)[props.task?.status || 'pending_accept'])
const priorityMeta = computed(() => ({
  urgent: { label: '紧急', type: 'danger' }, important: { label: '重要', type: 'warning' }, normal: { label: '普通', type: 'info' }
} as const)[props.task?.priority || 'normal'])
const businessLabel = computed(() => ({ customer: '客户', lead: '线索', order: '提单', review: '审单', receipt: '收款', contract: '合同', issue: '客户问题', training: '培训' } as Record<string, string>)[props.task?.businessType || ''] || props.task?.businessType || '业务事项')

function people(role: string) { return props.task?.participants.filter(item => item.role === role).map(item => item.name).join('、') || '' }
function formatTime(value?: string) { return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-' }
function actionLabel(action: string) { return ({ created: '创建待办', accepted: '接收待办', submitted: '提交完成', approved: '验收通过', rejected: '验收驳回', cancelled: '取消待办', overdue: '系统标记逾期' } as Record<string, string>)[action] || action }
</script>

<style scoped>
.task-detail-panel { min-height: 100%; color: #1d2129; }
.task-detail-panel > header { padding: 0 0 18px; border-bottom: 1px solid #e5e6eb; }
.title-line { display: flex; gap: 7px; }
.task-detail-panel h2 { margin: 12px 0 6px; font-size: 20px; line-height: 29px; }
.task-detail-panel header p, .detail-section > p { margin: 0; color: #86909c; font-size: 13px; }
.detail-section { padding: 17px 0; border-bottom: 1px solid #f0f1f3; }
.detail-section h3 { margin: 0 0 12px; font-size: 15px; }
.detail-section dl { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 10px 12px; margin: 0; font-size: 14px; }
.detail-section dt { color: #86909c; }
.detail-section dd { margin: 0; }
.danger { color: #d92d20; font-weight: 650; }
.long-text { color: #1d2129 !important; font-size: 14px !important; line-height: 22px; white-space: pre-wrap; }
.evidence-list { display: grid; gap: 6px; margin-top: 10px; }
.evidence-list button { min-height: 40px; display: grid; grid-template-columns: 22px minmax(0, 1fr) 22px; align-items: center; gap: 7px; border: 1px solid #e5e6eb; border-radius: 6px; background: #fff; color: #4e5969; text-align: left; cursor: pointer; }
.evidence-list span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timeline-section :deep(.el-timeline) { padding-left: 4px; }
.timeline-section b { font-size: 14px; }
.timeline-section p { margin: 4px 0 0; color: #86909c; font-size: 13px; line-height: 19px; }
.task-detail-panel > footer { position: sticky; bottom: 0; display: flex; align-items: center; gap: 7px; padding: 12px 0 4px; background: #fff; }
.task-detail-panel > footer span { flex: 1; }
@media (max-width: 600px) { .task-detail-panel > footer { flex-wrap: wrap; } .task-detail-panel > footer span { display: none; } }
</style>
