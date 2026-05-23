<template>
  <div class="page-container project-detail-page">
    <!-- 顶部返回+标题 -->
    <div class="detail-header">
      <el-button @click="$router.back()" :icon="'ArrowLeft'">{{ $t('common.back') }}</el-button>
      <h2 v-if="project">{{ project.name }}</h2>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards" v-if="project">
      <div class="overview-card">
        <div class="overview-label">{{ $t('project.progress') }}</div>
        <el-progress type="circle" :percentage="project.progress || 0" :color="'#F26522'" :width="80" />
      </div>
      <div class="overview-card">
        <div class="overview-label">{{ $t('project.status') }}</div>
        <el-tag :type="statusTagType(project.status)">{{ statusLabel(project.status) }}</el-tag>
      </div>
      <div class="overview-card">
        <div class="overview-label">{{ $t('project.budget') }}</div>
        <div class="overview-value">¥{{ formatMoney(project.budget) }}</div>
      </div>
      <div class="overview-card">
        <div class="overview-label">{{ $t('project.actualCost') }}</div>
        <div class="overview-value">¥{{ formatMoney(project.actualCost) }}</div>
      </div>
      <div class="overview-card">
        <div class="overview-label">{{ $t('project.stats.totalTasks') }}</div>
        <div class="overview-value">{{ stats.completedTasks || 0 }}/{{ stats.totalTasks || 0 }}</div>
      </div>
      <div class="overview-card">
        <div class="overview-label">{{ $t('project.timesheet.totalHours') }}</div>
        <div class="overview-value">{{ stats.totalHours || 0 }}h</div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 任务列表 -->
      <el-tab-pane :label="$t('project.tabs.tasks')" name="tasks">
        <div class="tab-toolbar">
          <el-button type="primary" size="small" @click="handleAddTask">{{ $t('common.add') }}</el-button>
        </div>
        <el-table :data="tasks" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" stripe default-expand-all>
          <el-table-column prop="name" :label="$t('project.task.name')" min-width="200" />
          <el-table-column prop="assigneeId" :label="$t('project.task.assignee')" width="100" />
          <el-table-column prop="priority" :label="$t('project.task.priority')" width="80">
            <template #default="{ row }">
              <el-tag size="small" :type="priorityTagType(row.priority)">{{ priorityLabel(row.priority) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="$t('project.task.status')" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="taskStatusTagType(row.status)">{{ taskStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" :label="$t('project.task.progress')" width="140">
            <template #default="{ row }">
              <el-progress :percentage="row.progress || 0" :color="'#F26522'" :stroke-width="10" />
            </template>
          </el-table-column>
          <el-table-column prop="startDate" :label="$t('project.task.startDate')" width="110" />
          <el-table-column prop="endDate" :label="$t('project.task.endDate')" width="110" />
          <el-table-column :label="$t('common.edit')" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditTask(row)">{{ $t('common.edit') }}</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteTask(row)">{{ $t('common.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 里程碑 -->
      <el-tab-pane :label="$t('project.tabs.milestones')" name="milestones">
        <div class="tab-toolbar">
          <el-button type="primary" size="small" @click="handleAddMilestone">{{ $t('common.add') }}</el-button>
        </div>
        <el-table :data="milestones" stripe>
          <el-table-column prop="name" :label="$t('project.milestone.name')" min-width="150" />
          <el-table-column prop="targetDate" :label="$t('project.milestone.targetDate')" width="120" />
          <el-table-column prop="actualDate" :label="$t('project.milestone.actualDate')" width="120" />
          <el-table-column prop="status" :label="$t('project.milestone.status')" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="msStatusTagType(row.status)">{{ msStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.edit')" width="150">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditMilestone(row)">{{ $t('common.edit') }}</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteMilestone(row)">{{ $t('common.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 工时记录 -->
      <el-tab-pane :label="$t('project.tabs.timesheet')" name="timesheet">
        <div class="tab-toolbar">
          <el-button type="primary" size="small" @click="handleLogTime">{{ $t('project.timesheet.logTime') }}</el-button>
        </div>
        <el-table :data="timesheets" stripe>
          <el-table-column prop="taskId" :label="$t('project.timesheet.task')" width="120" />
          <el-table-column prop="employeeId" :label="$t('project.timesheet.employee')" width="120" />
          <el-table-column prop="workDate" :label="$t('project.timesheet.workDate')" width="120" />
          <el-table-column prop="hours" :label="$t('project.timesheet.hours')" width="100" />
          <el-table-column prop="description" :label="$t('project.timesheet.description')" min-width="200" />
          <el-table-column :label="$t('common.edit')" width="100">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="handleDeleteTimesheet(row)">{{ $t('common.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 文档 -->
      <el-tab-pane :label="$t('project.tabs.docs')" name="docs">
        <div class="tab-toolbar">
          <el-button type="primary" size="small" @click="handleUploadDoc">{{ $t('project.doc.upload') }}</el-button>
        </div>
        <el-table :data="docs" stripe>
          <el-table-column prop="title" :label="$t('project.doc.docTitle')" min-width="200" />
          <el-table-column prop="fileType" :label="$t('project.doc.fileType')" width="100" />
          <el-table-column prop="fileSize" :label="$t('project.doc.fileSize')" width="100">
            <template #default="{ row }">{{ formatFileSize(row.fileSize) }}</template>
          </el-table-column>
          <el-table-column prop="createTime" :label="$t('project.doc.uploadTime')" width="170" />
          <el-table-column :label="$t('common.edit')" width="100">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="handleDeleteDoc(row)">{{ $t('common.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 成员 -->
      <el-tab-pane :label="$t('project.tabs.members')" name="members">
        <div class="members-placeholder">
          <p>{{ $t('project.members') }}</p>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 任务编辑弹窗 -->
    <el-dialog v-model="taskDialogVisible" :title="taskIsEdit ? $t('common.edit') : $t('common.add')" width="600px" destroy-on-close>
      <el-form ref="taskFormRef" :model="taskForm" label-width="100px">
        <el-form-item :label="$t('project.task.name')" prop="name">
          <el-input v-model="taskForm.name" />
        </el-form-item>
        <el-form-item :label="$t('project.task.parentTask')">
          <el-select v-model="taskForm.parentId" clearable style="width: 100%">
            <el-option v-for="t in flatTasks" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('project.task.assignee')">
          <el-input v-model="taskForm.assigneeId" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('project.task.startDate')">
              <el-date-picker v-model="taskForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('project.task.endDate')">
              <el-date-picker v-model="taskForm.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('project.task.priority')">
              <el-select v-model="taskForm.priority" style="width: 100%">
                <el-option :label="$t('project.task.priorityOptions.low')" :value="1" />
                <el-option :label="$t('project.task.priorityOptions.medium')" :value="2" />
                <el-option :label="$t('project.task.priorityOptions.high')" :value="3" />
                <el-option :label="$t('project.task.priorityOptions.urgent')" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('project.task.estimatedHours')">
              <el-input-number v-model="taskForm.estimatedHours" :min="0" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('project.task.description')">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitTask">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 里程碑编辑弹窗 -->
    <el-dialog v-model="msDialogVisible" :title="msIsEdit ? $t('common.edit') : $t('common.add')" width="500px" destroy-on-close>
      <el-form ref="msFormRef" :model="msForm" label-width="110px">
        <el-form-item :label="$t('project.milestone.name')" prop="name">
          <el-input v-model="msForm.name" />
        </el-form-item>
        <el-form-item :label="$t('project.milestone.targetDate')">
          <el-date-picker v-model="msForm.targetDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('project.milestone.status')">
          <el-select v-model="msForm.status" style="width: 100%">
            <el-option :label="$t('project.milestone.statusOptions.pending')" :value="0" />
            <el-option :label="$t('project.milestone.statusOptions.inProgress')" :value="1" />
            <el-option :label="$t('project.milestone.statusOptions.completed')" :value="2" />
            <el-option :label="$t('project.milestone.statusOptions.delayed')" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('project.milestone.description')">
          <el-input v-model="msForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="msDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitMilestone">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 登记工时弹窗 -->
    <el-dialog v-model="tsDialogVisible" :title="$t('project.timesheet.logTime')" width="500px" destroy-on-close>
      <el-form ref="tsFormRef" :model="tsForm" label-width="100px">
        <el-form-item :label="$t('project.timesheet.task')">
          <el-select v-model="tsForm.taskId" clearable style="width: 100%">
            <el-option v-for="t in flatTasks" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('project.timesheet.workDate')">
          <el-date-picker v-model="tsForm.workDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('project.timesheet.hours')">
          <el-input-number v-model="tsForm.hours" :min="0.5" :max="24" :step="0.5" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('project.timesheet.description')">
          <el-input v-model="tsForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tsDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitTimesheet">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 上传文档弹窗 -->
    <el-dialog v-model="docDialogVisible" :title="$t('project.doc.upload')" width="500px" destroy-on-close>
      <el-form ref="docFormRef" :model="docForm" label-width="100px">
        <el-form-item :label="$t('project.doc.docTitle')">
          <el-input v-model="docForm.title" />
        </el-form-item>
        <el-form-item :label="$t('project.doc.fileType')">
          <el-input v-model="docForm.fileType" placeholder="pdf, docx, xlsx..." />
        </el-form-item>
        <el-form-item :label="$t('project.doc.fileSize')">
          <el-input-number v-model="docForm.fileSize" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="docDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitDoc">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectApi, taskApi, milestoneApi, timesheetApi, docApi } from '@/api/project'

const { t } = useI18n()
const route = useRoute()

const projectId = computed(() => Number(route.query.id))
const project = ref<any>(null)
const stats = ref<any>({})
const activeTab = ref('tasks')
const tasks = ref<any[]>([])
const flatTasks = ref<any[]>([])
const milestones = ref<any[]>([])
const timesheets = ref<any[]>([])
const docs = ref<any[]>([])

// Task dialog
const taskDialogVisible = ref(false)
const taskIsEdit = ref(false)
const taskFormRef = ref()
const taskForm = reactive({ id: undefined as any, name: '', parentId: undefined as any, assigneeId: '', startDate: '', endDate: '', priority: 2, estimatedHours: 0, description: '', projectId: 0 })

// Milestone dialog
const msDialogVisible = ref(false)
const msIsEdit = ref(false)
const msFormRef = ref()
const msForm = reactive({ id: undefined as any, name: '', targetDate: '', status: 0, description: '', projectId: 0 })

// Timesheet dialog
const tsDialogVisible = ref(false)
const tsFormRef = ref()
const tsForm = reactive({ taskId: undefined as any, workDate: '', hours: 1, description: '', projectId: 0 })

// Doc dialog
const docDialogVisible = ref(false)
const docFormRef = ref()
const docForm = reactive({ title: '', fileType: '', fileSize: 0, fileUrl: '', projectId: 0 })

const statusLabel = (s: number) => {
  const map: Record<number, string> = { 0: t('project.statusOptions.planning'), 1: t('project.statusOptions.inProgress'), 2: t('project.statusOptions.paused'), 3: t('project.statusOptions.completed'), 4: t('project.statusOptions.cancelled') }
  return map[s] || '-'
}
const statusTagType = (s: number) => ({ 0: 'info', 1: '', 2: 'warning', 3: 'success', 4: 'danger' }[s] || 'info')
const priorityLabel = (p: number) => ({ 1: t('project.task.priorityOptions.low'), 2: t('project.task.priorityOptions.medium'), 3: t('project.task.priorityOptions.high'), 4: t('project.task.priorityOptions.urgent') }[p] || '-')
const priorityTagType = (p: number) => ({ 1: 'info', 2: '', 3: 'warning', 4: 'danger' }[p] || 'info')
const taskStatusLabel = (s: number) => ({ 0: t('project.task.statusOptions.todo'), 1: t('project.task.statusOptions.inProgress'), 2: t('project.task.statusOptions.review'), 3: t('project.task.statusOptions.done'), 4: t('project.task.statusOptions.cancelled') }[s] || '-')
const taskStatusTagType = (s: number) => ({ 0: 'info', 1: '', 2: 'warning', 3: 'success', 4: 'danger' }[s] || 'info')
const msStatusLabel = (s: number) => ({ 0: t('project.milestone.statusOptions.pending'), 1: t('project.milestone.statusOptions.inProgress'), 2: t('project.milestone.statusOptions.completed'), 3: t('project.milestone.statusOptions.delayed') }[s] || '-')
const msStatusTagType = (s: number) => ({ 0: 'info', 1: '', 2: 'success', 3: 'danger' }[s] || 'info')
const formatMoney = (v: any) => v ? Number(v).toLocaleString() : '0'
const formatFileSize = (bytes: number) => { if (!bytes) return '-'; if (bytes < 1024) return bytes + 'B'; if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB'; return (bytes / 1048576).toFixed(1) + 'MB' }

const loadProject = async () => {
  const res = await projectApi.detail(projectId.value) as any
  project.value = res.data
}
const loadStats = async () => {
  const res = await projectApi.stats(projectId.value) as any
  stats.value = res.data || {}
}
const loadTasks = async () => {
  const res = await taskApi.tree(projectId.value) as any
  const list = res.data || []
  flatTasks.value = list
  // Build tree
  const map = new Map()
  list.forEach((t: any) => { t.children = []; map.set(t.id, t) })
  const tree: any[] = []
  list.forEach((t: any) => {
    if (t.parentId && map.has(t.parentId)) { map.get(t.parentId).children.push(t) } else { tree.push(t) }
  })
  tasks.value = tree
}
const loadMilestones = async () => { const res = await milestoneApi.list(projectId.value) as any; milestones.value = res.data || [] }
const loadTimesheets = async () => { const res = await timesheetApi.list({ projectId: projectId.value, pageNum: 1, pageSize: 100 }) as any; timesheets.value = res.data?.records || res.data?.list || res.data || [] }
const loadDocs = async () => { const res = await docApi.list(projectId.value) as any; docs.value = res.data || [] }

// Task CRUD
const handleAddTask = () => { taskIsEdit.value = false; Object.assign(taskForm, { id: undefined, name: '', parentId: undefined, assigneeId: '', startDate: '', endDate: '', priority: 2, estimatedHours: 0, description: '', projectId: projectId.value }); taskDialogVisible.value = true }
const handleEditTask = (row: any) => { taskIsEdit.value = true; Object.assign(taskForm, row); taskDialogVisible.value = true }
const handleDeleteTask = (row: any) => { ElMessageBox.confirm(t('common.delete') + '?', '', { type: 'warning' }).then(async () => { await taskApi.remove(row.id); ElMessage.success(t('common.success')); loadTasks(); loadStats() }).catch(() => {}) }
const submitTask = async () => { if (taskIsEdit.value) { await taskApi.update(taskForm) } else { await taskApi.create(taskForm) }; ElMessage.success(t('common.success')); taskDialogVisible.value = false; loadTasks(); loadStats() }

// Milestone CRUD
const handleAddMilestone = () => { msIsEdit.value = false; Object.assign(msForm, { id: undefined, name: '', targetDate: '', status: 0, description: '', projectId: projectId.value }); msDialogVisible.value = true }
const handleEditMilestone = (row: any) => { msIsEdit.value = true; Object.assign(msForm, row); msDialogVisible.value = true }
const handleDeleteMilestone = (row: any) => { ElMessageBox.confirm(t('common.delete') + '?', '', { type: 'warning' }).then(async () => { await milestoneApi.remove(row.id); ElMessage.success(t('common.success')); loadMilestones() }).catch(() => {}) }
const submitMilestone = async () => { if (msIsEdit.value) { await milestoneApi.update(msForm) } else { await milestoneApi.create(msForm) }; ElMessage.success(t('common.success')); msDialogVisible.value = false; loadMilestones() }

// Timesheet
const handleLogTime = () => { Object.assign(tsForm, { taskId: undefined, workDate: '', hours: 1, description: '', projectId: projectId.value }); tsDialogVisible.value = true }
const handleDeleteTimesheet = (row: any) => { ElMessageBox.confirm(t('common.delete') + '?', '', { type: 'warning' }).then(async () => { await timesheetApi.remove(row.id); ElMessage.success(t('common.success')); loadTimesheets(); loadStats() }).catch(() => {}) }
const submitTimesheet = async () => { await timesheetApi.create(tsForm); ElMessage.success(t('common.success')); tsDialogVisible.value = false; loadTimesheets(); loadStats() }

// Doc
const handleUploadDoc = () => { Object.assign(docForm, { title: '', fileType: '', fileSize: 0, fileUrl: '', projectId: projectId.value }); docDialogVisible.value = true }
const handleDeleteDoc = (row: any) => { ElMessageBox.confirm(t('common.delete') + '?', '', { type: 'warning' }).then(async () => { await docApi.remove(row.id); ElMessage.success(t('common.success')); loadDocs() }).catch(() => {}) }
const submitDoc = async () => { await docApi.create(docForm); ElMessage.success(t('common.success')); docDialogVisible.value = false; loadDocs() }

onMounted(() => {
  if (projectId.value) {
    loadProject(); loadStats(); loadTasks(); loadMilestones(); loadTimesheets(); loadDocs()
  }
})
</script>

<style scoped>
.detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.detail-header h2 { margin: 0; font-size: 20px; }
.overview-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
.overview-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color-light); border-radius: 8px; padding: 16px; text-align: center; }
.overview-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 8px; }
.overview-value { font-size: 20px; font-weight: 600; color: #F26522; }
.tab-toolbar { margin-bottom: 12px; }
.members-placeholder { padding: 40px; text-align: center; color: var(--el-text-color-secondary); }
</style>
