<template>
  <section class="workflow-task-panel">
    <div class="panel-head">
      <div>
        <h3>{{ title }}</h3>
        <p>共 {{ tasks.length }} 项，已完成 {{ doneCount }} 项</p>
      </div>
      <el-progress
        type="dashboard"
        :width="72"
        :stroke-width="7"
        :percentage="completionRate"
        :color="progressColor"
      />
    </div>

    <el-empty v-if="!loading && tasks.length === 0" :description="emptyDescription || '当前周期没有工作计划；请联系主管检查计划模板和适用角色'" :image-size="76" />
    <el-skeleton v-else-if="loading" :rows="4" animated />

    <div v-else class="task-list">
      <article v-for="task in tasks" :key="task.id" class="task-card" :class="{ done: task.isDone === 1 }">
        <div class="task-main">
          <button class="state-button" type="button" :aria-label="task.isDone === 1 ? '撤回完成' : '标记完成'" @click="toggle(task)">
            <el-icon><CircleCheckFilled v-if="task.isDone === 1" /><Clock v-else /></el-icon>
          </button>
          <div class="task-copy">
            <div class="task-title-row">
              <strong>{{ task.taskName }}</strong>
              <el-tag v-if="task.source === 'template'" size="small" effect="plain">模板任务</el-tag>
              <el-tag v-if="task.priority === 'urgent'" size="small" type="danger">紧急</el-tag>
              <span v-if="task.doneTime" class="done-time">{{ task.doneTime }}</span>
            </div>
            <p v-if="task.workContent" class="work-content">{{ task.workContent }}</p>
            <p v-if="task.acceptanceStandard || task.taskDesc" class="acceptance">
              <span>完成标准</span>{{ task.acceptanceStandard || task.taskDesc }}
            </p>
            <p v-if="task.undoneReason" class="undone-reason">未完成原因：{{ task.undoneReason }}</p>
          </div>
        </div>

        <div v-if="metricFields(task).length" class="metric-grid">
          <label v-for="field in metricFields(task)" :key="field.key">
            <span>{{ field.label }}</span>
            <el-input-number
              v-model="drafts[task.id][field.key]"
              :min="0"
              :precision="field.precision || 0"
              controls-position="right"
            />
            <em>{{ field.unit }}</em>
          </label>
          <el-button type="primary" plain @click="$emit('save-detail', task, { ...drafts[task.id] })">保存量化结果</el-button>
        </div>

        <div class="task-footer">
          <el-input
            v-model="remarkDrafts[task.id]"
            maxlength="500"
            show-word-limit
            placeholder="补充工作备注"
            @keyup.enter="$emit('save-remark', task, remarkDrafts[task.id])"
          />
          <el-button @click="$emit('save-remark', task, remarkDrafts[task.id])">保存备注</el-button>
          <el-button v-if="task.isDone === 1" type="warning" plain @click="requestUndone(task)">登记未完成</el-button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { CircleCheckFilled, Clock } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

export interface WorkflowMetricField {
  key: string
  label: string
  unit?: string
  precision?: number
  target?: number | string
}

export interface WorkflowTaskRow {
  id: number | string
  taskName: string
  taskDesc?: string
  workContent?: string
  acceptanceStandard?: string
  source?: string
  priority?: string
  isDone?: number
  doneTime?: string
  undoneReason?: string
  remark?: string
  detailFields?: WorkflowMetricField[] | string
  workDetail?: Record<string, number> | string
}

const props = defineProps<{
  title: string
  tasks: WorkflowTaskRow[]
  loading?: boolean
  emptyDescription?: string
}>()

const emit = defineEmits<{
  (event: 'action', task: WorkflowTaskRow, action: 'done' | 'undo' | 'undone', data?: Record<string, unknown>): void
  (event: 'save-detail', task: WorkflowTaskRow, values: Record<string, number>): void
  (event: 'save-remark', task: WorkflowTaskRow, remark: string): void
}>()

const drafts = reactive<Record<string, Record<string, number>>>({})
const remarkDrafts = reactive<Record<string, string>>({})

function parseJson<T>(value: T | string | undefined, fallback: T): T {
  if (typeof value !== 'string') return value || fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

function metricFields(task: WorkflowTaskRow) {
  return parseJson<WorkflowMetricField[]>(task.detailFields, [])
}

function syncDrafts() {
  props.tasks.forEach((task) => {
    const key = String(task.id)
    const saved = parseJson<Record<string, number>>(task.workDetail, {})
    drafts[key] = { ...saved }
    metricFields(task).forEach((field) => {
      if (drafts[key][field.key] == null) drafts[key][field.key] = 0
    })
    remarkDrafts[key] = task.remark || ''
  })
}

watch(() => props.tasks, syncDrafts, { immediate: true, deep: true })

const doneCount = computed(() => props.tasks.filter((task) => task.isDone === 1).length)
const completionRate = computed(() => props.tasks.length ? Math.round(doneCount.value / props.tasks.length * 100) : 0)
const progressColor = computed(() => completionRate.value >= 80 ? '#16a34a' : completionRate.value >= 50 ? '#f59e0b' : '#2563eb')

function toggle(task: WorkflowTaskRow) {
  emit('action', task, task.isDone === 1 ? 'undo' : 'done',
    task.isDone === 1 ? undefined : { ...drafts[String(task.id)] })
}

async function requestUndone(task: WorkflowTaskRow) {
  try {
    const { value } = await ElMessageBox.prompt('请说明未完成原因，主管可在下属视图中查看。', '登记未完成', {
      inputType: 'textarea',
      inputPlaceholder: '请输入具体原因',
      inputValidator: (text) => !!String(text || '').trim() || '未完成原因不能为空'
    })
    emit('action', task, 'undone', { reason: String(value).trim() })
  } catch {
    // 用户取消登记时保持原任务状态。
  }
}
</script>

<style scoped lang="scss">
.workflow-task-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
.panel-head { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eef2f7; padding-bottom: 12px; margin-bottom: 14px; }
.panel-head h3 { margin: 0 0 5px; font-size: 18px; color: #111827; }
.panel-head p { margin: 0; color: #6b7280; }
.task-list { display: grid; gap: 12px; }
.task-card { border: 1px solid #e5e7eb; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px; background: #fff; }
.task-card.done { border-left-color: #22c55e; background: #f8fff9; }
.task-main { display: flex; gap: 12px; }
.state-button { border: 0; background: transparent; color: #f59e0b; font-size: 24px; cursor: pointer; padding: 0; height: 28px; }
.done .state-button { color: #22c55e; }
.task-copy { min-width: 0; flex: 1; }
.task-title-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.task-title-row strong { font-size: 15px; color: #111827; }
.done-time { margin-left: auto; color: #6b7280; font-size: 12px; }
.work-content { color: #4b5563; margin: 8px 0; line-height: 1.6; }
.acceptance { background: #effaf3; color: #166534; padding: 8px 10px; border-radius: 6px; margin: 8px 0; }
.acceptance span { font-weight: 700; margin-right: 8px; }
.undone-reason { background: #fff7ed; color: #c2410c; padding: 8px 10px; border-radius: 6px; }
.metric-grid { display: flex; gap: 12px; flex-wrap: wrap; align-items: end; background: #f8fafc; padding: 12px; margin-top: 12px; border-radius: 8px; }
.metric-grid label { display: grid; grid-template-columns: auto 120px auto; gap: 6px; align-items: center; color: #374151; }
.metric-grid em { font-style: normal; color: #6b7280; }
.task-footer { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
.task-footer .el-input { flex: 1; }
@media (max-width: 900px) { .task-footer { align-items: stretch; flex-direction: column; } .metric-grid { align-items: stretch; flex-direction: column; } }
</style>
