<template>
  <div class="page-container gantt-page">
    <!-- 顶部工具栏 -->
    <div class="gantt-toolbar">
      <el-select v-model="selectedProjectId" :placeholder="$t('project.board.selectProject')" style="width: 240px" @change="loadGanttData">
        <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
      <el-radio-group v-model="timeScale" size="small" @change="recalcLayout">
        <el-radio-button value="day">{{ $t('project.gantt.day') }}</el-radio-button>
        <el-radio-button value="week">{{ $t('project.gantt.week') }}</el-radio-button>
        <el-radio-button value="month">{{ $t('project.gantt.month') }}</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="!selectedProjectId" class="gantt-empty">
      <el-empty :description="$t('project.board.selectProject')" />
    </div>

    <div v-else class="gantt-container">
      <!-- 左侧任务列表 -->
      <div class="gantt-left">
        <div class="gantt-left-header">
          <span class="col-name">{{ $t('project.task.name') }}</span>
          <span class="col-assignee">{{ $t('project.task.assignee') }}</span>
          <span class="col-date">{{ $t('project.task.startDate') }}</span>
          <span class="col-date">{{ $t('project.task.endDate') }}</span>
        </div>
        <div class="gantt-left-body">
          <div v-for="task in ganttTasks" :key="task.id" class="gantt-left-row">
            <span class="col-name" :title="task.name">{{ task.name }}</span>
            <span class="col-assignee">{{ task.assigneeId || '-' }}</span>
            <span class="col-date">{{ task.startDate || '-' }}</span>
            <span class="col-date">{{ task.endDate || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧甘特图 -->
      <div class="gantt-right" ref="ganttRightRef">
        <!-- 时间轴头部 -->
        <div class="gantt-timeline-header">
          <div v-for="(col, idx) in timeColumns" :key="idx" class="timeline-col" :style="{ width: colWidth + 'px' }">
            {{ col.label }}
          </div>
        </div>
        <!-- 任务条 -->
        <div class="gantt-timeline-body" :style="{ width: totalWidth + 'px' }">
          <div v-for="task in ganttTasks" :key="task.id" class="gantt-row">
            <div
              v-if="task.startDate && task.endDate"
              class="gantt-bar"
              :style="getBarStyle(task)"
              :title="`${task.name} (${task.progress || 0}%)`"
            >
              <div class="gantt-bar-progress" :style="{ width: (task.progress || 0) + '%' }"></div>
              <span class="gantt-bar-label">{{ task.name }}</span>
            </div>
          </div>
          <!-- 今日线 -->
          <div class="today-line" :style="{ left: todayOffset + 'px' }" v-if="todayOffset >= 0">
            <span class="today-label">{{ $t('project.gantt.todayLine') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { projectApi, taskApi } from '@/api/project'

const { t } = useI18n()

const selectedProjectId = ref<number | undefined>(undefined)
const projects = ref<any[]>([])
const ganttTasks = ref<any[]>([])
const timeScale = ref('day')
const ganttRightRef = ref()

interface TimeCol { label: string; date: Date }
const timeColumns = ref<TimeCol[]>([])
const colWidth = ref(40)

const loadProjects = async () => {
  const res = await projectApi.list({ pageNum: 1, pageSize: 100 }) as any
  projects.value = res.data?.records || res.data?.list || []
  if (projects.value.length > 0 && !selectedProjectId.value) {
    selectedProjectId.value = projects.value[0].id
    loadGanttData()
  }
}

const loadGanttData = async () => {
  if (!selectedProjectId.value) return
  const res = await taskApi.gantt(selectedProjectId.value) as any
  ganttTasks.value = res.data || []
  recalcLayout()
}

const recalcLayout = () => {
  // Determine date range
  let minDate = new Date()
  let maxDate = new Date()
  let hasDate = false
  ganttTasks.value.forEach(t => {
    if (t.startDate) { const d = new Date(t.startDate); if (!hasDate || d < minDate) minDate = new Date(d); hasDate = true }
    if (t.endDate) { const d = new Date(t.endDate); if (!hasDate || d > maxDate) maxDate = new Date(d); hasDate = true }
  })
  if (!hasDate) { minDate = new Date(); maxDate = new Date(minDate.getTime() + 30 * 86400000) }
  // Add padding
  minDate = new Date(minDate.getTime() - 7 * 86400000)
  maxDate = new Date(maxDate.getTime() + 7 * 86400000)

  // Generate columns
  const cols: TimeCol[] = []
  if (timeScale.value === 'day') {
    colWidth.value = 36
    const cur = new Date(minDate)
    while (cur <= maxDate) { cols.push({ label: `${cur.getMonth() + 1}/${cur.getDate()}`, date: new Date(cur) }); cur.setDate(cur.getDate() + 1) }
  } else if (timeScale.value === 'week') {
    colWidth.value = 60
    const cur = new Date(minDate)
    cur.setDate(cur.getDate() - cur.getDay())
    while (cur <= maxDate) { cols.push({ label: `W${getWeekNum(cur)}`, date: new Date(cur) }); cur.setDate(cur.getDate() + 7) }
  } else {
    colWidth.value = 80
    const cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    while (cur <= maxDate) { cols.push({ label: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`, date: new Date(cur) }); cur.setMonth(cur.getMonth() + 1) }
  }
  timeColumns.value = cols
}

const totalWidth = computed(() => timeColumns.value.length * colWidth.value)
const projectStartDate = computed(() => timeColumns.value.length > 0 ? timeColumns.value[0].date : new Date())

const getBarStyle = (task: any) => {
  if (!task.startDate || !task.endDate || timeColumns.value.length === 0) return { display: 'none' }
  const start = new Date(task.startDate)
  const end = new Date(task.endDate)
  const origin = projectStartDate.value
  const dayMs = 86400000
  let unitMs = dayMs
  if (timeScale.value === 'week') unitMs = 7 * dayMs
  else if (timeScale.value === 'month') unitMs = 30 * dayMs

  const left = ((start.getTime() - origin.getTime()) / unitMs) * colWidth.value
  const width = Math.max(((end.getTime() - start.getTime()) / unitMs) * colWidth.value, colWidth.value)
  const statusColors: Record<number, string> = { 0: '#909399', 1: '#F26522', 2: '#E6A23C', 3: '#67C23A', 4: '#C0C4CC' }
  return { left: left + 'px', width: width + 'px', backgroundColor: statusColors[task.status] || '#F26522' }
}

const todayOffset = computed(() => {
  if (timeColumns.value.length === 0) return -1
  const today = new Date()
  const origin = projectStartDate.value
  const dayMs = 86400000
  let unitMs = dayMs
  if (timeScale.value === 'week') unitMs = 7 * dayMs
  else if (timeScale.value === 'month') unitMs = 30 * dayMs
  return ((today.getTime() - origin.getTime()) / unitMs) * colWidth.value
})

const getWeekNum = (d: Date) => {
  const oneJan = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7)
}

onMounted(() => { loadProjects() })
</script>

<style scoped>
.gantt-toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.gantt-empty { padding: 60px 0; }
.gantt-container { display: flex; border: 1px solid var(--el-border-color-light); border-radius: 8px; overflow: hidden; height: calc(100vh - 220px); }
.gantt-left { width: 380px; min-width: 380px; border-right: 1px solid var(--el-border-color-light); overflow-y: auto; }
.gantt-left-header { display: flex; align-items: center; height: 40px; background: var(--el-fill-color-light); border-bottom: 1px solid var(--el-border-color-light); padding: 0 8px; font-weight: 600; font-size: 12px; }
.gantt-left-body { overflow-y: auto; }
.gantt-left-row { display: flex; align-items: center; height: 36px; padding: 0 8px; border-bottom: 1px solid var(--el-border-color-extra-light); font-size: 12px; }
.gantt-left-row:hover { background: var(--el-fill-color-lighter); }
.col-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-assignee { width: 60px; text-align: center; }
.col-date { width: 80px; text-align: center; }
.gantt-right { flex: 1; overflow: auto; position: relative; }
.gantt-timeline-header { display: flex; height: 40px; background: var(--el-fill-color-light); border-bottom: 1px solid var(--el-border-color-light); position: sticky; top: 0; z-index: 2; }
.timeline-col { display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--el-text-color-secondary); border-right: 1px solid var(--el-border-color-extra-light); }
.gantt-timeline-body { position: relative; min-height: 100%; }
.gantt-row { height: 36px; position: relative; border-bottom: 1px solid var(--el-border-color-extra-light); }
.gantt-bar { position: absolute; top: 6px; height: 24px; border-radius: 4px; overflow: hidden; display: flex; align-items: center; cursor: pointer; transition: opacity 0.2s; }
.gantt-bar:hover { opacity: 0.85; }
.gantt-bar-progress { position: absolute; left: 0; top: 0; height: 100%; background: rgba(255,255,255,0.3); }
.gantt-bar-label { position: relative; z-index: 1; padding: 0 6px; font-size: 11px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.today-line { position: absolute; top: 0; bottom: 0; width: 2px; background: #F56C6C; z-index: 3; }
.today-label { position: absolute; top: -18px; left: -10px; font-size: 10px; color: #F56C6C; white-space: nowrap; }
</style>
