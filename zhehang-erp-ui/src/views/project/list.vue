<template>
  <div class="page-container project-list-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="queryParams" inline>
        <el-form-item :label="$t('project.name')">
          <el-input v-model="queryParams.name" :placeholder="$t('project.name')" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item :label="$t('project.type')">
          <el-select v-model="queryParams.type" :placeholder="$t('project.type')" clearable>
            <el-option :label="$t('project.typeOptions.internal')" :value="1" />
            <el-option :label="$t('project.typeOptions.external')" :value="2" />
            <el-option :label="$t('project.typeOptions.rd')" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('project.status')">
          <el-select v-model="queryParams.status" :placeholder="$t('project.status')" clearable>
            <el-option :label="$t('project.statusOptions.planning')" :value="0" />
            <el-option :label="$t('project.statusOptions.inProgress')" :value="1" />
            <el-option :label="$t('project.statusOptions.paused')" :value="2" />
            <el-option :label="$t('project.statusOptions.completed')" :value="3" />
            <el-option :label="$t('project.statusOptions.cancelled')" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">{{ $t('common.search') }}</el-button>
          <el-button @click="resetQuery">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="search-bar-right">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="table">{{ $t('project.tableView') }}</el-radio-button>
          <el-radio-button value="card">{{ $t('project.cardView') }}</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="handleAdd">{{ $t('common.add') }}</el-button>
      </div>
    </div>

    <!-- 表格视图 -->
    <el-table v-if="viewMode === 'table'" :data="tableData" v-loading="loading" stripe>
      <el-table-column prop="name" :label="$t('project.name')" min-width="150">
        <template #default="{ row }">
          <el-link type="primary" @click="goDetail(row)">{{ row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="code" :label="$t('project.code')" width="120" />
      <el-table-column prop="type" :label="$t('project.type')" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ typeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="managerId" :label="$t('project.manager')" width="100" />
      <el-table-column prop="progress" :label="$t('project.progress')" width="160">
        <template #default="{ row }">
          <el-progress :percentage="row.progress || 0" :color="'#F26522'" :stroke-width="14" :text-inside="true" />
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('project.status')" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" :label="$t('project.startDate')" width="110" />
      <el-table-column prop="endDate" :label="$t('project.endDate')" width="110" />
      <el-table-column :label="$t('common.edit')" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 卡片视图 -->
    <div v-else class="project-card-grid">
      <div v-for="item in tableData" :key="item.id" class="project-card" @click="goDetail(item)">
        <div class="project-card-header">
          <span class="project-card-name">{{ item.name }}</span>
          <el-tag size="small" :type="statusTagType(item.status)">{{ statusLabel(item.status) }}</el-tag>
        </div>
        <div class="project-card-body">
          <el-progress :percentage="item.progress || 0" :color="'#F26522'" :stroke-width="10" />
          <div class="project-card-info">
            <span>{{ $t('project.manager') }}: {{ item.managerId || '-' }}</span>
            <span>{{ item.startDate }} ~ {{ item.endDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? $t('common.edit') : $t('common.add')" width="650px" destroy-on-close>
      <div v-if="!isEdit && !showForm" class="create-mode-select">
        <el-button size="large" @click="createFromTemplate">{{ $t('project.createFromTemplate') }}</el-button>
        <el-button size="large" type="primary" @click="showForm = true">{{ $t('project.createBlank') }}</el-button>
      </div>
      <el-form v-if="showForm || isEdit" ref="formRef" :model="formData" :rules="rules" label-width="110px">
        <el-form-item :label="$t('project.name')" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item :label="$t('project.code')" prop="code">
          <el-input v-model="formData.code" />
        </el-form-item>
        <el-form-item :label="$t('project.type')" prop="type">
          <el-select v-model="formData.type" style="width: 100%">
            <el-option :label="$t('project.typeOptions.internal')" :value="1" />
            <el-option :label="$t('project.typeOptions.external')" :value="2" />
            <el-option :label="$t('project.typeOptions.rd')" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('project.manager')">
          <el-input v-model="formData.managerId" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('project.startDate')">
              <el-date-picker v-model="formData.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('project.endDate')">
              <el-date-picker v-model="formData.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('project.budget')">
          <el-input-number v-model="formData.budget" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('project.description')">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer v-if="showForm || isEdit">
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 模板选择弹窗 -->
    <el-dialog v-model="templateVisible" :title="$t('project.selectTemplate')" width="500px">
      <el-table :data="templates" @row-click="applyTemplate" highlight-current-row>
        <el-table-column prop="name" :label="$t('project.template')" />
        <el-table-column prop="description" :label="$t('project.description')" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectApi } from '@/api/project'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const viewMode = ref('table')
const dialogVisible = ref(false)
const templateVisible = ref(false)
const isEdit = ref(false)
const showForm = ref(false)
const formRef = ref()
const templates = ref<any[]>([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined
})

const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  type: 1,
  customerId: undefined as number | undefined,
  managerId: undefined as string | undefined,
  startDate: '',
  endDate: '',
  budget: 0,
  description: ''
})

const rules = {
  name: [{ required: true, message: t('project.name'), trigger: 'blur' }],
  code: [{ required: true, message: t('project.code'), trigger: 'blur' }],
  type: [{ required: true, message: t('project.type'), trigger: 'change' }]
}

const typeLabel = (type: number) => {
  const map: Record<number, string> = { 1: t('project.typeOptions.internal'), 2: t('project.typeOptions.external'), 3: t('project.typeOptions.rd') }
  return map[type] || '-'
}

const statusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: t('project.statusOptions.planning'), 1: t('project.statusOptions.inProgress'),
    2: t('project.statusOptions.paused'), 3: t('project.statusOptions.completed'), 4: t('project.statusOptions.cancelled')
  }
  return map[status] || '-'
}

const statusTagType = (status: number) => {
  const map: Record<number, string> = { 0: 'info', 1: '', 2: 'warning', 3: 'success', 4: 'danger' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await projectApi.list(queryParams) as any
    tableData.value = res.data?.records || res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.name = ''
  queryParams.type = undefined
  queryParams.status = undefined
  queryParams.pageNum = 1
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  showForm.value = false
  Object.assign(formData, { id: undefined, name: '', code: '', type: 1, customerId: undefined, managerId: undefined, startDate: '', endDate: '', budget: 0, description: '' })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  showForm.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(t('common.delete') + '?', '', { type: 'warning' }).then(async () => {
    await projectApi.remove(row.id)
    ElMessage.success(t('common.success'))
    loadData()
  }).catch(() => {})
}

const goDetail = (row: any) => {
  router.push({ name: 'ProjectDetail', query: { id: row.id } })
}

const createFromTemplate = async () => {
  const res = await projectApi.templates() as any
  templates.value = res.data || []
  templateVisible.value = true
}

const applyTemplate = (row: any) => {
  formData.name = row.name
  templateVisible.value = false
  showForm.value = true
}

const submitForm = async () => {
  await formRef.value?.validate()
  if (isEdit.value) {
    await projectApi.update(formData)
  } else {
    await projectApi.create(formData)
  }
  ElMessage.success(t('common.success'))
  dialogVisible.value = false
  loadData()
}

onMounted(() => { loadData() })
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.search-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.project-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.project-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}
.project-card:hover {
  box-shadow: 0 4px 12px rgba(242, 101, 34, 0.15);
  border-color: #F26522;
}
.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.project-card-name {
  font-weight: 600;
  font-size: 15px;
}
.project-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.project-card-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.create-mode-select {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 40px 0;
}
</style>
