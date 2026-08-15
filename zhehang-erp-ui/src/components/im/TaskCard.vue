<template>
  <section class="task-card" :class="[`priority-${task.priority}`, { overdue: task.overdue }]" @click="$emit('open', task)">
    <header>
      <span class="task-mark"><el-icon><List /></el-icon></span>
      <div><small>工作待办</small><b>{{ task.title }}</b></div>
      <el-tag size="small" :type="statusMeta.type" effect="light">{{ statusMeta.label }}</el-tag>
    </header>
    <div class="task-meta">
      <span><el-icon><UserFilled /></el-icon>{{ responsibleNames }}</span>
      <span :class="{ late: task.overdue }"><el-icon><Clock /></el-icon>{{ deadlineText }}</span>
    </div>
    <p v-if="task.acceptanceStandard">验收标准：{{ task.acceptanceStandard }}</p>
    <footer>
      <span>{{ priorityLabel }}</span>
      <div @click.stop>
        <el-button v-if="task.canAccept" size="small" type="primary" @click="$emit('accept', task)">接收</el-button>
        <el-button v-if="task.canSubmit" size="small" type="primary" @click="$emit('submit', task)">提交完成</el-button>
        <el-button v-if="task.canReview" size="small" type="success" @click="$emit('review', task)">验收</el-button>
        <el-button size="small" text @click="$emit('open', task)">查看详情</el-button>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, List, UserFilled } from '@element-plus/icons-vue'
import type { ImWorkTask } from '@/api/im'

const props = defineProps<{ task: ImWorkTask }>()
defineEmits<{
  open: [task: ImWorkTask]
  accept: [task: ImWorkTask]
  submit: [task: ImWorkTask]
  review: [task: ImWorkTask]
}>()

const statusMeta = computed(() => ({
  pending_accept: { label: '待接收', type: 'warning' },
  in_progress: { label: '进行中', type: 'primary' },
  pending_review: { label: '待验收', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  cancelled: { label: '已取消', type: 'info' },
  overdue: { label: '已逾期', type: 'danger' }
} as const)[props.task.status] || { label: props.task.status, type: 'info' as const })
const responsibleNames = computed(() => {
  const names = props.task.participants.filter(item => item.role === 'responsible').map(item => item.name)
  return names.length > 2 ? `${names.slice(0, 2).join('、')} 等${names.length}人` : names.join('、') || '未指定'
})
const deadlineText = computed(() => new Date(props.task.deadlineAt).toLocaleString('zh-CN', {
  month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
}))
const priorityLabel = computed(() => ({ urgent: '紧急', important: '重要', normal: '普通' })[props.task.priority])
</script>

<style scoped>
.task-card { width: min(500px, 100%); overflow: hidden; border: 1px solid #d9dde5; border-left: 4px solid #3370ff; border-radius: 7px; background: #fff; color: #1d2129; cursor: pointer; }
.task-card.priority-urgent, .task-card.overdue { border-left-color: #f53f3f; }
.task-card.priority-important { border-left-color: #ff7d00; }
.task-card header { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 12px 13px 9px; }
.task-mark { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 6px; background: #e8f3ff; color: #3370ff; font-size: 18px; }
.task-card header div { min-width: 0; display: grid; gap: 2px; }
.task-card header small { color: #86909c; font-size: 12px; }
.task-card header b { overflow: hidden; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.task-meta { display: flex; flex-wrap: wrap; gap: 7px 18px; padding: 0 13px 9px 56px; color: #4e5969; font-size: 13px; }
.task-meta span { display: inline-flex; align-items: center; gap: 5px; }
.task-meta .late { color: #d92d20; font-weight: 600; }
.task-card > p { margin: 0; padding: 9px 13px; border-top: 1px solid #f0f1f3; color: #4e5969; font-size: 13px; line-height: 20px; white-space: pre-wrap; }
.task-card footer { min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 9px 6px 13px; border-top: 1px solid #f0f1f3; }
.task-card footer > span { color: #86909c; font-size: 12px; }
.task-card footer > div { display: flex; align-items: center; }
@media (max-width: 600px) {
  .task-card header { grid-template-columns: 30px minmax(0, 1fr) auto; padding-left: 10px; padding-right: 10px; }
  .task-mark { width: 30px; height: 30px; }
  .task-meta { padding-left: 49px; }
  .task-card footer { align-items: flex-start; flex-direction: column; }
}
</style>
