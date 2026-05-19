<template>
  <div class="page-container board-page">
    <!-- 顶部工具栏 -->
    <div class="board-toolbar">
      <el-select v-model="selectedProjectId" :placeholder="$t('project.board.selectProject')" style="width: 240px" @change="loadBoardData">
        <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
    </div>

    <div v-if="!selectedProjectId" class="board-empty">
      <el-empty :description="$t('project.board.selectProject')" />
    </div>

    <!-- 看板主体 -->
    <div v-else class="board-columns">
      <div
        v-for="col in columns"
        :key="col.key"
        class="board-column"
        @dragover.prevent
        @drop="onDrop($event, col.key)"
      >
        <div class="board-column-header" :style="{ borderTopColor: col.color }">
          <span class="board-column-title">{{ col.label }}</span>
          <el-badge :value="(boardData[col.key] || []).length" type="info" />
        </div>
        <div class="board-column-body">
          <div
            v-for="task in (boardData[col.key] || [])"
            :key="task.id"
            class="board-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
          >
            <div class="board-card-header">
              <span class="board-card-name">{{ task.name }}</span>
              <el-tag size="small" :type="priorityTagType(task.priority)">{{ priorityLabel(task.priority) }}</el-tag>
            </div>
            <div class="board-card-body">
              <div class="board-card-meta">
                <span class="board-card-assignee">
                  <el-avatar :size="20" style="background: #F26522; font-size: 10px;">{{ (task.assigneeId || '?').toString().charAt(0) }}</el-avatar>
                  <span>{{ task.assigneeId || '-' }}</span>
                </span>
                <span v-if="task.endDate" class="board-card-date">{{ task.endDate }}</span>
              </div>
              <el-progress :percentage="task.progress || 0" :color="'#F26522'" :stroke-width="6" :show-text="false" style="margin-top: 8px" />
            </div>
            <div class="board-card-actions">
              <el-button
                v-for="target in getMovableColumns(col.key)"
                :key="target.key"
                size="small"
                link
                @click="moveTask(task, target.key)"
              >
                → {{ target.label }}
              </el-button>
            </div>
          </div>
          <div v-if="!(boardData[col.key] || []).length" class="board-card-empty">
            {{ $t('common.noData') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { projectApi, taskApi } from '@/api/project'

const { t } = useI18n()

const selectedProjectId = ref<number | undefined>(undefined)
const projects = ref<any[]>([])
const boardData = reactive<Record<string, any[]>>({ todo: [], inProgress: [], review: [], done: [] })

const columns = [
  { key: 'todo', label: t('project.board.todo'), color: '#909399', status: 0 },
  { key: 'inProgress', label: t('project.board.inProgress'), color: '#F26522', status: 1 },
  { key: 'review', label: t('project.board.review'), color: '#E6A23C', status: 2 },
  { key: 'done', label: t('project.board.done'), color: '#67C23A', status: 3 }
]

const statusMap: Record<string, number> = { todo: 0, inProgress: 1, review: 2, done: 3 }

let draggedTask: any = null

const priorityLabel = (p: number) => ({ 1: t('project.task.priorityOptions.low'), 2: t('project.task.priorityOptions.medium'), 3: t('project.task.priorityOptions.high'), 4: t('project.task.priorityOptions.urgent') }[p] || '-')
const priorityTagType = (p: number) => ({ 1: 'info', 2: '', 3: 'warning', 4: 'danger' }[p] || 'info')

const loadProjects = async () => {
  const res = await projectApi.list({ pageNum: 1, pageSize: 100 }) as any
  projects.value = res.data?.records || res.data?.list || []
  if (projects.value.length > 0 && !selectedProjectId.value) {
    selectedProjectId.value = projects.value[0].id
    loadBoardData()
  }
}

const loadBoardData = async () => {
  if (!selectedProjectId.value) return
  const res = await taskApi.board(selectedProjectId.value) as any
  const data = res.data || {}
  boardData.todo = data.todo || []
  boardData.inProgress = data.inProgress || []
  boardData.review = data.review || []
  boardData.done = data.done || []
}

const onDragStart = (event: DragEvent, task: any) => {
  draggedTask = task
  if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move' }
}

const onDrop = async (event: DragEvent, targetKey: string) => {
  event.preventDefault()
  if (!draggedTask) return
  const targetStatus = statusMap[targetKey]
  if (draggedTask.status === targetStatus) return
  await moveTask(draggedTask, targetKey)
  draggedTask = null
}

const moveTask = async (task: any, targetKey: string) => {
  const targetStatus = statusMap[targetKey]
  try {
    await taskApi.changeStatus(task.id, targetStatus)
    ElMessage.success(t('common.success'))
    loadBoardData()
  } catch (e) {
    // ignore
  }
}

const getMovableColumns = (currentKey: string) => {
  return columns.filter(c => c.key !== currentKey)
}

onMounted(() => { loadProjects() })
</script>

<style scoped>
.board-toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.board-empty { padding: 60px 0; }
.board-columns { display: flex; gap: 16px; height: calc(100vh - 220px); overflow-x: auto; }
.board-column { flex: 1; min-width: 280px; max-width: 360px; display: flex; flex-direction: column; background: var(--el-fill-color-lighter); border-radius: 8px; overflow: hidden; }
.board-column-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 3px solid; background: var(--el-bg-color); }
.board-column-title { font-weight: 600; font-size: 14px; }
.board-column-body { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.board-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 8px; padding: 12px; cursor: grab; transition: all 0.2s; }
.board-card:hover { box-shadow: 0 4px 12px rgba(242, 101, 34, 0.12); border-color: #F26522; }
.board-card:active { cursor: grabbing; }
.board-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
.board-card-name { font-size: 13px; font-weight: 500; line-height: 1.4; flex: 1; }
.board-card-meta { display: flex; justify-content: space-between; align-items: center; }
.board-card-assignee { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-text-color-secondary); }
.board-card-date { font-size: 11px; color: var(--el-text-color-placeholder); }
.board-card-actions { display: flex; gap: 4px; margin-top: 8px; border-top: 1px solid var(--el-border-color-extra-light); padding-top: 8px; }
.board-card-empty { padding: 24px; text-align: center; color: var(--el-text-color-placeholder); font-size: 12px; }
</style>
