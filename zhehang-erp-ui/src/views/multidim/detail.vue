<template>
  <div class="multidim-detail">
    <!-- 顶部 -->
    <div class="detail-header">
      <div class="header-left">
        <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
        <el-icon class="table-icon"><Grid /></el-icon>
        <el-input
          v-model="tableName"
          class="table-name-input"
          @blur="updateTableName"
          @keyup.enter="updateTableName"
        />
      </div>
      <div class="header-right">
        <el-button text @click="exportData">
          <el-icon><Download /></el-icon>
          {{ $t('multidim.exportData') }}
        </el-button>
      </div>
    </div>

    <!-- 视图Tab -->
    <div class="view-tabs">
      <div class="tabs-left">
        <div
          v-for="v in views"
          :key="v.id"
          class="view-tab"
          :class="{ active: currentViewId === v.id }"
          @click="switchView(v.id)"
        >
          <el-icon class="view-icon">
            <component :is="getViewIcon(v.type)" />
          </el-icon>
          <span>{{ v.name }}</span>
          <el-icon
            v-if="views.length > 1"
            class="del-view"
            @click.stop="removeView(v.id)"
          ><Close /></el-icon>
        </div>
        <el-dropdown trigger="click" @command="addNewView">
          <el-button class="add-view-btn" link>
            <el-icon><Plus /></el-icon>
            {{ $t('multidim.addView') }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="grid"><el-icon><Grid /></el-icon> {{ $t('multidim.gridView') }}</el-dropdown-item>
              <el-dropdown-item command="kanban"><el-icon><Operation /></el-icon> {{ $t('multidim.kanbanView') }}</el-dropdown-item>
              <el-dropdown-item command="gantt"><el-icon><Calendar /></el-icon> {{ $t('multidim.ganttView') }}</el-dropdown-item>
              <el-dropdown-item command="calendar"><el-icon><Calendar /></el-icon> {{ $t('multidim.calendarView') }}</el-dropdown-item>
              <el-dropdown-item command="gallery"><el-icon><Picture /></el-icon> {{ $t('multidim.galleryView') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button size="small" @click="filterDialogVisible = true">
          <el-icon><Filter /></el-icon> {{ $t('multidim.filter') }}
          <el-tag v-if="currentView?.filterConfig?.length" size="small" type="warning" effect="plain" style="margin-left:4px;">{{ currentView.filterConfig.length }}</el-tag>
        </el-button>
        <el-button size="small" @click="sortDialogVisible = true">
          <el-icon><Sort /></el-icon> {{ $t('multidim.sort') }}
          <el-tag v-if="currentView?.sortConfig?.length" size="small" type="warning" effect="plain" style="margin-left:4px;">{{ currentView.sortConfig.length }}</el-tag>
        </el-button>
        <el-button size="small" @click="groupDialogVisible = true">
          <el-icon><Menu /></el-icon> {{ $t('multidim.group') }}
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchKey"
          size="small"
          :placeholder="$t('common.search')"
          prefix-icon="Search"
          clearable
          style="width: 200px"
        />
        <el-button size="small" type="primary" @click="addRecord">
          <el-icon><Plus /></el-icon>
          {{ $t('multidim.addRecord') }}
        </el-button>
      </div>
    </div>

    <!-- 视图主体 -->
    <div class="view-container">
      <!-- 表格视图 -->
      <GridView
        v-if="currentView?.type === 'grid'"
        :fields="visibleFields"
        :records="filteredRecords"
        @update-cell="updateCell"
        @add-field="fieldDialogVisible = true"
        @delete-field="deleteField"
        @batch-delete="batchDelete"
        @delete-record="deleteRecord"
      />
      <!-- 看板视图 -->
      <KanbanView
        v-else-if="currentView?.type === 'kanban'"
        :fields="fields"
        :records="filteredRecords"
        :group-by="currentView.groupBy"
        @update-card="updateCardGroup"
        @click-card="onClickCard"
      />
      <!-- 甘特图视图 -->
      <GanttView
        v-else-if="currentView?.type === 'gantt'"
        :fields="fields"
        :records="filteredRecords"
      />
      <!-- 日历视图 -->
      <CalendarView
        v-else-if="currentView?.type === 'calendar'"
        :fields="fields"
        :records="filteredRecords"
        @click-event="onClickCard"
      />
      <!-- 画廊视图 -->
      <GalleryView
        v-else-if="currentView?.type === 'gallery'"
        :fields="fields"
        :records="filteredRecords"
        @click-card="onClickCard"
      />
    </div>

    <!-- 添加字段弹窗 -->
    <el-dialog v-model="fieldDialogVisible" :title="$t('multidim.addField')" width="500px">
      <el-form :model="fieldForm" label-width="100px">
        <el-form-item :label="$t('multidim.fieldName')">
          <el-input v-model="fieldForm.name" />
        </el-form-item>
        <el-form-item :label="$t('multidim.fieldType')">
          <el-select v-model="fieldForm.type" style="width: 100%">
            <el-option v-for="t in fieldTypes" :key="t.value" :label="$t(t.label)" :value="t.value">
              <el-icon><component :is="t.icon" /></el-icon>
              <span style="margin-left: 8px">{{ $t(t.label) }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="['select','multiselect'].includes(fieldForm.type)" :label="$t('multidim.options')">
          <el-tag
            v-for="(opt, idx) in fieldForm.config.options"
            :key="idx"
            closable
            style="margin: 2px"
            @close="fieldForm.config.options!.splice(idx, 1)"
          >{{ opt }}</el-tag>
          <el-input
            v-if="optionInputVisible"
            ref="optionInputRef"
            v-model="optionInput"
            size="small"
            style="width: 120px"
            @keyup.enter="addOption"
            @blur="addOption"
          />
          <el-button v-else size="small" @click="showOptionInput">+ {{ $t('multidim.addOption') }}</el-button>
        </el-form-item>
        <el-form-item v-if="fieldForm.type === 'number'" :label="$t('multidim.precision')">
          <el-input-number v-model="fieldForm.config.precision" :min="0" :max="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fieldDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveField">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 筛选弹窗 -->
    <el-dialog v-model="filterDialogVisible" :title="$t('multidim.filter')" width="600px">
      <div v-for="(f, idx) in tempFilters" :key="idx" class="filter-row">
        <el-select v-model="f.fieldId" :placeholder="$t('multidim.fieldSelect')" style="width: 30%">
          <el-option v-for="fd in fields" :key="fd.id" :label="fd.name" :value="fd.id" />
        </el-select>
        <el-select v-model="f.operator" :placeholder="$t('multidim.operator')" style="width: 25%">
          <el-option :label="$t('multidim.equals')" value="eq" />
          <el-option :label="$t('multidim.notEquals')" value="ne" />
          <el-option :label="$t('multidim.contains')" value="contains" />
          <el-option :label="$t('multidim.isEmpty')" value="empty" />
          <el-option :label="$t('multidim.isNotEmpty')" value="notEmpty" />
        </el-select>
        <el-input v-model="f.value" :placeholder="$t('multidim.value')" style="width: 30%" />
        <el-icon class="del-row" @click="tempFilters.splice(idx, 1)"><Close /></el-icon>
      </div>
      <el-button link type="primary" @click="tempFilters.push({fieldId:'',operator:'eq',value:''})">+ {{ $t('multidim.addFilter') }}</el-button>
      <template #footer>
        <el-button @click="filterDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="applyFilters">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 排序弹窗 -->
    <el-dialog v-model="sortDialogVisible" :title="$t('multidim.sort')" width="500px">
      <div v-for="(s, idx) in tempSorts" :key="idx" class="filter-row">
        <el-select v-model="s.fieldId" :placeholder="$t('multidim.fieldSelect')" style="width: 50%">
          <el-option v-for="fd in fields" :key="fd.id" :label="fd.name" :value="fd.id" />
        </el-select>
        <el-select v-model="s.direction" style="width: 35%">
          <el-option :label="$t('multidim.ascending')" value="asc" />
          <el-option :label="$t('multidim.descending')" value="desc" />
        </el-select>
        <el-icon class="del-row" @click="tempSorts.splice(idx, 1)"><Close /></el-icon>
      </div>
      <el-button link type="primary" @click="tempSorts.push({fieldId:'',direction:'asc'})">+ {{ $t('multidim.addSort') }}</el-button>
      <template #footer>
        <el-button @click="sortDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="applySorts">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 分组弹窗 -->
    <el-dialog v-model="groupDialogVisible" :title="$t('multidim.group')" width="400px">
      <el-form label-width="100px">
        <el-form-item :label="$t('multidim.groupByField')">
          <el-select v-model="tempGroupBy" clearable :placeholder="$t('multidim.noGroup')" style="width: 100%">
            <el-option v-for="fd in selectFields" :key="fd.id" :label="fd.name" :value="fd.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="applyGroup">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 记录详情弹窗 -->
    <el-dialog v-model="recordDialogVisible" :title="$t('common.edit')" width="600px">
      <el-form v-if="editingRecord" label-width="120px">
        <el-form-item v-for="fd in fields" :key="fd.id" :label="fd.name">
          <FieldEditor v-model="editingRecord.data[fd.id]" :field="fd" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveRecordEdit">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Plus, Close, Grid, Operation, Calendar, Picture,
  Filter, Sort, Menu, Download, Search
} from '@element-plus/icons-vue'
import { tableApi, recordApi } from '@/api/multidim'
import type { FieldDef, ViewDef, MultidimTable, MultidimRecord, FilterCondition, SortCondition } from '@/api/multidim'
import GridView from './components/GridView.vue'
import KanbanView from './components/KanbanView.vue'
import GanttView from './components/GanttView.vue'
import CalendarView from './components/CalendarView.vue'
import GalleryView from './components/GalleryView.vue'
import FieldEditor from './components/FieldEditor.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tableId = ref<number>(Number(route.query.id) || 0)
const tableInfo = ref<MultidimTable | null>(null)
const tableName = ref('')
const fields = ref<FieldDef[]>([])
const views = ref<ViewDef[]>([])
const records = ref<Array<{ id: number; data: Record<string, any> }>>([])
const currentViewId = ref<string>('')
const searchKey = ref('')

const fieldDialogVisible = ref(false)
const filterDialogVisible = ref(false)
const sortDialogVisible = ref(false)
const groupDialogVisible = ref(false)
const recordDialogVisible = ref(false)

const fieldForm = ref<{ id?: string; name: string; type: any; config: any }>({
  name: '', type: 'text', config: { options: [] }
})
const optionInput = ref('')
const optionInputVisible = ref(false)
const optionInputRef = ref()

const tempFilters = ref<FilterCondition[]>([])
const tempSorts = ref<SortCondition[]>([])
const tempGroupBy = ref('')
const editingRecord = ref<{ id: number; data: Record<string, any> } | null>(null)

const fieldTypes = [
  { value: 'text', label: 'multidim.text', icon: 'Document' },
  { value: 'number', label: 'multidim.number', icon: 'Histogram' },
  { value: 'date', label: 'multidim.date', icon: 'Calendar' },
  { value: 'select', label: 'multidim.select', icon: 'CircleCheck' },
  { value: 'multiselect', label: 'multidim.multiselect', icon: 'Operation' },
  { value: 'user', label: 'multidim.user', icon: 'User' }
]

const currentView = computed<ViewDef | undefined>(() => views.value.find(v => v.id === currentViewId.value))
const visibleFields = computed(() => fields.value)
const selectFields = computed(() => fields.value.filter(f => f.type === 'select'))

const filteredRecords = computed(() => {
  let list = records.value
  if (searchKey.value) {
    const k = searchKey.value.toLowerCase()
    list = list.filter(r => Object.values(r.data || {}).some(v => String(v ?? '').toLowerCase().includes(k)))
  }
  if (currentView.value?.filterConfig?.length) {
    for (const f of currentView.value.filterConfig) {
      if (!f.fieldId) continue
      list = list.filter(r => {
        const v = r.data?.[f.fieldId]
        if (f.operator === 'eq') return String(v ?? '') === String(f.value ?? '')
        if (f.operator === 'ne') return String(v ?? '') !== String(f.value ?? '')
        if (f.operator === 'contains') return String(v ?? '').includes(String(f.value ?? ''))
        if (f.operator === 'empty') return v == null || v === ''
        if (f.operator === 'notEmpty') return v != null && v !== ''
        return true
      })
    }
  }
  if (currentView.value?.sortConfig?.length) {
    list = [...list].sort((a, b) => {
      for (const s of currentView.value!.sortConfig) {
        if (!s.fieldId) continue
        const va = a.data?.[s.fieldId] ?? ''
        const vb = b.data?.[s.fieldId] ?? ''
        if (va === vb) continue
        const cmp = va > vb ? 1 : -1
        return s.direction === 'asc' ? cmp : -cmp
      }
      return 0
    })
  }
  return list
})

onMounted(() => loadTable())

async function loadTable() {
  if (!tableId.value) return
  try {
    const res: any = await tableApi.detail(tableId.value)
    tableInfo.value = res.data
    tableName.value = res.data.name
    fields.value = parseJson(res.data.fieldSchema, [])
    views.value = parseJson(res.data.viewConfig, [])
    if (views.value.length > 0) currentViewId.value = views.value[0].id
    await loadRecords()
  } catch (e) {
    loadMockData()
  }
}

function loadMockData() {
  tableName.value = '示例表格'
  fields.value = [
    { id: 'f1', name: '姓名', type: 'text', config: {} },
    { id: 'f2', name: '公司', type: 'text', config: {} },
    { id: 'f3', name: '状态', type: 'select', config: { options: ['新线索', '跟进中', '已成交', '已流失'] } },
    { id: 'f4', name: '最后跟进', type: 'date', config: {} },
    { id: 'f5', name: '负责人', type: 'user', config: {} }
  ]
  views.value = [
    { id: 'v1', name: '表格视图', type: 'grid', filterConfig: [], sortConfig: [], groupBy: '' },
    { id: 'v2', name: '看板视图', type: 'kanban', filterConfig: [], sortConfig: [], groupBy: 'f3' }
  ]
  currentViewId.value = 'v1'
  records.value = [
    { id: 1, data: { f1: '张三', f2: '阿里巴巴', f3: '跟进中', f4: '2026-05-15', f5: '李经理' } },
    { id: 2, data: { f1: '李四', f2: '腾讯', f3: '新线索', f4: '2026-05-17', f5: '王经理' } },
    { id: 3, data: { f1: '王五', f2: '百度', f3: '已成交', f4: '2026-05-10', f5: '李经理' } },
    { id: 4, data: { f1: '赵六', f2: '字节跳动', f3: '跟进中', f4: '2026-05-16', f5: '张经理' } },
    { id: 5, data: { f1: '钱七', f2: '美团', f3: '已流失', f4: '2026-05-08', f5: '王经理' } }
  ]
}

async function loadRecords() {
  try {
    const res: any = await recordApi.query({ tableId: tableId.value, pageSize: 1000, pageNum: 1 })
    const list = res.data?.records || []
    records.value = list.map((r: MultidimRecord) => ({ id: r.id, data: parseJson(r.data, {}) }))
  } catch (e) {
    if (records.value.length === 0) {
      records.value = [
        { id: 1, data: {} }
      ]
    }
  }
}

function parseJson(s: any, fallback: any) {
  if (!s) return fallback
  if (typeof s !== 'string') return s
  try { return JSON.parse(s) } catch { return fallback }
}

function getViewIcon(type: string) {
  const map: Record<string, string> = { grid: 'Grid', kanban: 'Operation', gantt: 'Calendar', calendar: 'Calendar', gallery: 'Picture' }
  return map[type] || 'Grid'
}

async function updateTableName() {
  if (!tableInfo.value) return
  if (tableName.value === tableInfo.value.name) return
  tableInfo.value.name = tableName.value
  try {
    await tableApi.update({ id: tableId.value, name: tableName.value })
    ElMessage.success(t('multidim.saveSuccess'))
  } catch (e) { /* mock ok */ }
}

function switchView(id: string) {
  currentViewId.value = id
}

async function addNewView(type: string) {
  const view: ViewDef = {
    id: 'v' + Date.now(),
    name: t(`multidim.${type}View`),
    type: type as any,
    filterConfig: [],
    sortConfig: [],
    groupBy: type === 'kanban' ? (selectFields.value[0]?.id || '') : ''
  }
  views.value.push(view)
  currentViewId.value = view.id
  await persistViews()
}

async function removeView(id: string) {
  await ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirm'), { type: 'warning' })
  views.value = views.value.filter(v => v.id !== id)
  if (currentViewId.value === id) currentViewId.value = views.value[0]?.id || ''
  await persistViews()
}

async function persistViews() {
  if (!tableId.value) return
  try { await tableApi.update({ id: tableId.value, viewConfig: JSON.stringify(views.value) }) } catch { /* mock */ }
}

async function persistFields() {
  if (!tableId.value) return
  try { await tableApi.update({ id: tableId.value, fieldSchema: JSON.stringify(fields.value) }) } catch { /* mock */ }
}

function showOptionInput() {
  optionInputVisible.value = true
  nextTick(() => optionInputRef.value?.focus?.())
}

function addOption() {
  if (optionInput.value) {
    if (!fieldForm.value.config.options) fieldForm.value.config.options = []
    fieldForm.value.config.options.push(optionInput.value)
  }
  optionInput.value = ''
  optionInputVisible.value = false
}

async function saveField() {
  if (!fieldForm.value.name) {
    ElMessage.warning(t('multidim.fieldName'))
    return
  }
  const field: FieldDef = {
    id: fieldForm.value.id || ('f' + Date.now()),
    name: fieldForm.value.name,
    type: fieldForm.value.type,
    config: fieldForm.value.config
  }
  fields.value.push(field)
  await persistFields()
  ElMessage.success(t('multidim.saveSuccess'))
  fieldDialogVisible.value = false
  fieldForm.value = { name: '', type: 'text', config: { options: [] } }
}

async function deleteField(fieldId: string) {
  await ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirm'), { type: 'warning' })
  fields.value = fields.value.filter(f => f.id !== fieldId)
  await persistFields()
  ElMessage.success(t('multidim.deleteSuccess'))
}

async function addRecord() {
  const newRec = { id: Date.now(), data: {} as Record<string, any> }
  try {
    const res: any = await recordApi.create({ tableId: tableId.value, data: '{}' })
    newRec.id = res.data?.id || newRec.id
  } catch { /* mock */ }
  records.value.unshift(newRec)
  editingRecord.value = newRec
  recordDialogVisible.value = true
}

async function updateCell(recordId: number, fieldId: string, value: any) {
  const rec = records.value.find(r => r.id === recordId)
  if (!rec) return
  rec.data[fieldId] = value
  try { await recordApi.update({ id: recordId, data: JSON.stringify(rec.data) }) } catch { /* mock */ }
}

async function updateCardGroup(recordId: number, groupValue: any) {
  const groupBy = currentView.value?.groupBy
  if (!groupBy) return
  const rec = records.value.find(r => r.id === recordId)
  if (!rec) return
  rec.data[groupBy] = groupValue
  try { await recordApi.update({ id: recordId, data: JSON.stringify(rec.data) }) } catch { /* mock */ }
}

function onClickCard(rec: any) {
  editingRecord.value = rec
  recordDialogVisible.value = true
}

async function saveRecordEdit() {
  if (!editingRecord.value) return
  try {
    await recordApi.update({ id: editingRecord.value.id, data: JSON.stringify(editingRecord.value.data) })
  } catch { /* mock */ }
  ElMessage.success(t('multidim.saveSuccess'))
  recordDialogVisible.value = false
}

async function deleteRecord(recordId: number) {
  await ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirm'), { type: 'warning' })
  try { await recordApi.remove(recordId) } catch { /* mock */ }
  records.value = records.value.filter(r => r.id !== recordId)
  ElMessage.success(t('multidim.deleteSuccess'))
}

async function batchDelete(ids: number[]) {
  if (ids.length === 0) return
  await ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirm'), { type: 'warning' })
  try { await recordApi.batchDelete(ids) } catch { /* mock */ }
  records.value = records.value.filter(r => !ids.includes(r.id))
  ElMessage.success(t('multidim.deleteSuccess'))
}

watch(filterDialogVisible, (v) => {
  if (v) tempFilters.value = JSON.parse(JSON.stringify(currentView.value?.filterConfig || []))
})
watch(sortDialogVisible, (v) => {
  if (v) tempSorts.value = JSON.parse(JSON.stringify(currentView.value?.sortConfig || []))
})
watch(groupDialogVisible, (v) => {
  if (v) tempGroupBy.value = currentView.value?.groupBy || ''
})

async function applyFilters() {
  if (!currentView.value) return
  currentView.value.filterConfig = tempFilters.value.filter(f => f.fieldId)
  await persistViews()
  filterDialogVisible.value = false
}
async function applySorts() {
  if (!currentView.value) return
  currentView.value.sortConfig = tempSorts.value.filter(s => s.fieldId)
  await persistViews()
  sortDialogVisible.value = false
}
async function applyGroup() {
  if (!currentView.value) return
  currentView.value.groupBy = tempGroupBy.value
  await persistViews()
  groupDialogVisible.value = false
}

function exportData() {
  const headers = fields.value.map(f => f.name).join(',')
  const rows = filteredRecords.value.map(r =>
    fields.value.map(f => String(r.data?.[f.id] ?? '').replace(/,/g, '，')).join(',')
  ).join('\n')
  const csv = '\uFEFF' + headers + '\n' + rows
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${tableName.value || 'multidim'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function goBack() {
  router.push('/multidim')
}
</script>

<style scoped>
.multidim-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-icon {
  font-size: 18px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  padding: 4px;
}
.back-icon:hover {
  color: #F26522;
}
.table-icon {
  color: #F26522;
  font-size: 20px;
}
.table-name-input {
  width: 320px;
}
.table-name-input :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  padding-left: 4px;
}
.table-name-input :deep(.el-input__wrapper):hover {
  background: var(--el-fill-color-light);
}
.view-tabs {
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
.tabs-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
}
.view-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  transition: all 0.2s;
}
.view-tab:hover {
  color: var(--el-text-color-primary);
}
.view-tab.active {
  color: #F26522;
  border-bottom-color: #F26522;
  font-weight: 500;
}
.view-icon {
  font-size: 14px;
}
.del-view {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}
.view-tab:hover .del-view {
  opacity: 0.6;
}
.view-tab .del-view:hover {
  opacity: 1;
  color: var(--el-color-danger);
}
.add-view-btn {
  margin-left: 8px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}
.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.view-container {
  flex: 1;
  overflow: auto;
  background: var(--el-bg-color);
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.del-row {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  padding: 4px;
}
.del-row:hover {
  color: var(--el-color-danger);
}
</style>
