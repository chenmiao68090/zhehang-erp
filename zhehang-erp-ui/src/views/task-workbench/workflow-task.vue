<template>
  <div class="task-workbench task-workbench-page workflow-task-page">
    <header class="page-head page-heading">
      <div class="page-title">
        <div class="eyebrow"><el-icon><Calendar /></el-icon> 任务工单 · 工作计划</div>
        <h2>工作计划任务</h2>
        <p>按日、周、月执行固定工作，完成标准、量化结果和未完成原因全程留痕。</p>
      </div>
      <el-tag v-if="isLocalDemo" type="warning" size="large" effect="dark">LOCAL-DEMO 演示数据</el-tag>
    </header>

    <el-alert
      v-if="isLocalDemo"
      title="当前仅展示明确标记的本地演示任务，不会写入生产数据。"
      type="warning"
      show-icon
      :closable="false"
    />
    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" />

    <section class="toolbar-card">
      <el-segmented v-model="cycleType" :options="cycleOptions" @change="handleCycleChange" />
      <div class="period-nav">
        <el-button :icon="ArrowLeft" circle @click="movePeriod(-1)" />
        <el-date-picker
          v-if="cycleType === 'daily'"
          v-model="selectedDate"
          type="date"
          value-format="YYYY-MM-DD"
          :clearable="false"
          @change="handleDailyChange"
        />
        <el-date-picker
          v-else-if="cycleType === 'weekly'"
          v-model="selectedWeekDate"
          type="week"
          format="YYYY 第 ww 周"
          :clearable="false"
          @change="handleWeekChange"
        />
        <el-date-picker
          v-else
          v-model="selectedMonth"
          type="month"
          value-format="YYYY-MM"
          :clearable="false"
          @change="loadTasks"
        />
        <el-button :icon="ArrowRight" circle @click="movePeriod(1)" />
        <el-button @click="goCurrent">回到当前</el-button>
      </div>
    </section>

    <section v-if="cycleType === 'daily'" class="calendar-card">
      <div class="calendar-head">
        <strong>{{ calendarYear }} 年 {{ calendarMonth }} 月完成热力图</strong>
        <span>颜色越深代表完成率越高，灰色代表尚无任务。</span>
      </div>
      <div class="week-labels"><span v-for="day in weekLabels" :key="day">{{ day }}</span></div>
      <div class="calendar-grid">
        <button
          v-for="cell in calendarCells"
          :key="cell.key"
          type="button"
          class="calendar-cell"
          :class="[{ muted: !cell.inMonth, selected: cell.date === selectedDate }, heatClass(cell.rate)]"
          :disabled="!cell.inMonth"
          @click="selectCalendarDate(cell.date)"
        >
          <span>{{ cell.day }}</span>
          <strong v-if="cell.total">{{ cell.rate }}%</strong>
          <small v-if="cell.total">{{ cell.done }}/{{ cell.total }}</small>
        </button>
      </div>
    </section>

    <el-alert
      v-if="isExempt"
      title="当前账号不在本周期必报范围内"
      description="仍可查看任务；如需提交报告，请联系部门主管调整必报范围。"
      type="success"
      show-icon
      :closable="false"
    />

    <WorkflowTaskPanel
      :title="panelTitle"
      :tasks="tasks"
      :loading="loading"
      @action="handleAction"
      @save-detail="saveDetail"
      @save-remark="saveRemark"
    />

    <section class="summary-card">
      <div>
        <h3>{{ cycleLabel }}工作总结</h3>
        <p>写清本周期产出、未完成原因和需要协助的事项。</p>
      </div>
      <el-input v-model="summary" type="textarea" :rows="4" maxlength="2000" show-word-limit placeholder="请输入工作总结" />
      <el-button type="primary" :loading="savingSummary" @click="saveSummary">保存总结</el-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Calendar } from '@element-plus/icons-vue'
import type { PageResult, WorkflowMonthStat, WorkflowTask } from '@/api/feige-task'
import { feigeTaskData, feigeTaskLocalDemo } from '@feige-task-data-source'
import WorkflowTaskPanel, { type WorkflowTaskRow } from './components/WorkflowTaskPanel.vue'
import './common.scss'

type CycleType = 'daily' | 'weekly' | 'monthly'
interface DayStat { total: number; done: number; rate: number }

const isLocalDemo = computed(() => feigeTaskLocalDemo())
const cycleType = ref<CycleType>('daily')
const cycleOptions = [
  { label: '每日任务', value: 'daily' },
  { label: '每周任务', value: 'weekly' },
  { label: '每月任务', value: 'monthly' }
]
const today = new Date()
const selectedDate = ref(formatDate(today))
const selectedWeekDate = ref<Date>(today)
const selectedWeek = ref(formatWeek(today))
const selectedMonth = ref(formatMonth(today))
const calendarYear = ref(today.getFullYear())
const calendarMonth = ref(today.getMonth() + 1)
const monthStats = ref<Record<string, DayStat>>({})
const tasks = ref<WorkflowTaskRow[]>([])
const summary = ref('')
const isExempt = ref(false)
const loading = ref(false)
const savingSummary = ref(false)
const loadError = ref('')
const weekLabels = ['一', '二', '三', '四', '五', '六', '日']

function unwrap<T>(response: any): T {
  return (response?.data?.data ?? response?.data ?? response) as T
}
function pad(value: number) { return String(value).padStart(2, '0') }
function formatDate(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` }
function formatMonth(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}` }
function formatWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d.getTime() - start.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${pad(week)}`
}

const periodKey = computed(() => cycleType.value === 'daily' ? selectedDate.value : cycleType.value === 'weekly' ? selectedWeek.value : selectedMonth.value)
const cycleLabel = computed(() => cycleType.value === 'daily' ? '每日' : cycleType.value === 'weekly' ? '每周' : '每月')
const panelTitle = computed(() => `${periodKey.value} · ${cycleLabel.value}任务`)

const calendarCells = computed(() => {
  const first = new Date(calendarYear.value, calendarMonth.value - 1, 1)
  const days = new Date(calendarYear.value, calendarMonth.value, 0).getDate()
  const offset = (first.getDay() || 7) - 1
  const cells: Array<{ key: string; day: number | ''; date: string; inMonth: boolean; total: number; done: number; rate: number }> = []
  for (let i = 0; i < offset; i++) cells.push({ key: `pre-${i}`, day: '', date: '', inMonth: false, total: 0, done: 0, rate: 0 })
  for (let day = 1; day <= days; day++) {
    const date = `${calendarYear.value}-${pad(calendarMonth.value)}-${pad(day)}`
    const stat = monthStats.value[date] || { total: 0, done: 0, rate: 0 }
    cells.push({ key: date, day, date, inMonth: true, ...stat })
  }
  while (cells.length % 7) cells.push({ key: `next-${cells.length}`, day: '', date: '', inMonth: false, total: 0, done: 0, rate: 0 })
  return cells
})

function heatClass(rate: number) {
  if (!rate) return 'heat-0'
  if (rate < 50) return 'heat-1'
  if (rate < 80) return 'heat-2'
  if (rate < 100) return 'heat-3'
  return 'heat-4'
}

function toPanelTask(row: WorkflowTask): WorkflowTaskRow {
  return {
    id: row.id,
    taskName: row.taskName,
    taskDesc: row.completionStandard,
    workContent: row.workContent,
    acceptanceStandard: row.completionStandard,
    isDone: row.status === 'done' ? 1 : 0,
    doneTime: row.completedTime,
    undoneReason: row.undoneReason,
    remark: row.remark,
    source: 'template',
    detailFields: (row.metrics || []).map(metric => ({ key: metric.code, label: metric.label, unit: metric.unit, target: metric.target })),
    workDetail: Object.fromEntries((row.metrics || []).map(metric => [metric.code, Number(metric.value || 0)]))
  }
}

async function loadMonthStats() {
  try {
    const result = unwrap<WorkflowMonthStat[]>(await feigeTaskData.workflowMonthStats({ month: `${calendarYear.value}-${pad(calendarMonth.value)}` })) || []
    monthStats.value = Object.fromEntries(result.map(day => [day.date, { total: day.total, done: day.done, rate: day.rate }]))
  } catch {
    monthStats.value = {}
    loadError.value = '工作计划热力图加载失败，请稍后重试。生产环境不会用演示数据替代。'
  }
}

async function loadTasks() {
  loadError.value = ''
  loading.value = true
  try {
    const result = unwrap<PageResult<WorkflowTask> & { summary?: string; isExempt?: boolean }>(await feigeTaskData.workflowTasks({ cycleType: cycleType.value === 'daily' ? 'day' : cycleType.value === 'weekly' ? 'week' : 'month', periodKey: periodKey.value, pageNum: 1, pageSize: 100 }))
    tasks.value = (result?.records || []).map(toPanelTask)
    summary.value = result?.summary || ''
    isExempt.value = !!result?.isExempt
  } catch {
    tasks.value = []
    summary.value = ''
    loadError.value = '工作计划加载失败，请稍后重试。生产环境不会用本地样例填充。'
  } finally { loading.value = false }
}

async function runAction(task: WorkflowTaskRow, action: string, data: Record<string, unknown> = {}) {
  try {
    const apiAction = action === 'save-detail' ? 'detail' : action
    const payload = (action === 'save-detail' || (action === 'done' && Array.isArray(task.detailFields) && task.detailFields.length > 0))
      ? {
          metrics: (Array.isArray(task.detailFields) ? task.detailFields : []).map(field => ({
            code: field.key,
            label: field.label,
            unit: field.unit,
            target: field.target,
            value: Number(data[field.key] ?? 0)
          }))
        }
      : data
    await feigeTaskData.workflowAction(Number(task.id), apiAction, payload)
    ElMessage.success(feigeTaskLocalDemo() ? 'LOCAL-DEMO：仅更新当前预览' : '操作成功')
    await Promise.all([loadTasks(), loadMonthStats()])
  } catch { ElMessage.error('操作失败，请检查权限或任务状态') }
}

function handleAction(task: WorkflowTaskRow, action: 'done' | 'undo' | 'undone', data?: Record<string, unknown>) { return runAction(task, action, data) }
function saveDetail(task: WorkflowTaskRow, values: Record<string, number>) { return runAction(task, 'save-detail', values) }
function saveRemark(task: WorkflowTaskRow, remark: string) { return runAction(task, 'remark', { remark }) }

async function saveSummary() {
  if (!summary.value.trim()) return ElMessage.warning('请先填写工作总结')
  savingSummary.value = true
  try {
    await feigeTaskData.workflowSummary({ cycleType: cycleType.value === 'daily' ? 'day' : cycleType.value === 'weekly' ? 'week' : 'month', periodKey: periodKey.value, summary: summary.value.trim() })
    ElMessage.success(feigeTaskLocalDemo() ? 'LOCAL-DEMO：总结仅保存在当前预览' : '工作总结已保存')
  } catch { ElMessage.error('工作总结保存失败') }
  finally { savingSummary.value = false }
}

function selectCalendarDate(date: string) { selectedDate.value = date; loadTasks() }
function handleDailyChange(value: string) {
  const date = new Date(`${value}T00:00:00`)
  calendarYear.value = date.getFullYear()
  calendarMonth.value = date.getMonth() + 1
  loadMonthStats()
  loadTasks()
}
function handleWeekChange(value: Date) { selectedWeek.value = formatWeek(new Date(value)); loadTasks() }
function handleCycleChange() { loadTasks(); if (cycleType.value === 'daily') loadMonthStats() }
function movePeriod(direction: number) {
  if (cycleType.value === 'daily') {
    const date = new Date(`${selectedDate.value}T00:00:00`); date.setDate(date.getDate() + direction); selectedDate.value = formatDate(date)
    calendarYear.value = date.getFullYear(); calendarMonth.value = date.getMonth() + 1; loadMonthStats()
  } else if (cycleType.value === 'weekly') {
    const date = new Date(selectedWeekDate.value); date.setDate(date.getDate() + direction * 7); selectedWeekDate.value = date; selectedWeek.value = formatWeek(date)
  } else {
    const [year, month] = selectedMonth.value.split('-').map(Number); const date = new Date(year, month - 1 + direction, 1); selectedMonth.value = formatMonth(date)
  }
  loadTasks()
}
function goCurrent() {
  selectedDate.value = formatDate(today); selectedWeekDate.value = today; selectedWeek.value = formatWeek(today); selectedMonth.value = formatMonth(today)
  calendarYear.value = today.getFullYear(); calendarMonth.value = today.getMonth() + 1
  loadMonthStats(); loadTasks()
}

onMounted(() => { loadMonthStats(); loadTasks() })
</script>

<style scoped lang="scss">
.workflow-task-page { display: grid; gap: 16px; }
.toolbar-card { display: flex; justify-content: space-between; gap: 16px; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; }
.period-nav { display: flex; gap: 8px; align-items: center; }
.calendar-card, .summary-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; }
.calendar-head { display: flex; justify-content: space-between; gap: 12px; color: #6b7280; margin-bottom: 14px; }
.calendar-head strong { color: #111827; }
.week-labels, .calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(70px, 1fr)); gap: 6px; }
.week-labels span { text-align: center; font-size: 12px; color: #6b7280; padding: 5px; }
.calendar-cell { min-height: 74px; border: 1px solid #e5e7eb; border-radius: 8px; display: grid; gap: 2px; justify-items: start; padding: 8px; cursor: pointer; color: #111827; }
.calendar-cell strong { font-size: 16px; }
.calendar-cell small { opacity: .75; }
.calendar-cell.selected { outline: 2px solid #2563eb; }
.calendar-cell.muted { opacity: .2; cursor: default; }
.heat-0 { background: #f8fafc; } .heat-1 { background: #dbeafe; } .heat-2 { background: #93c5fd; } .heat-3 { background: #3b82f6; color: #fff; } .heat-4 { background: #15803d; color: #fff; }
.summary-card { display: grid; grid-template-columns: 220px 1fr auto; gap: 16px; align-items: center; }
.summary-card h3 { margin: 0 0 6px; } .summary-card p { margin: 0; color: #6b7280; line-height: 1.5; }
@media (max-width: 960px) { .toolbar-card, .calendar-head { align-items: stretch; flex-direction: column; } .period-nav { flex-wrap: wrap; } .summary-card { grid-template-columns: 1fr; } .calendar-cell { min-height: 58px; } }
</style>
