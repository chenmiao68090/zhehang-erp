<template>
  <div class="suite-page" :style="{ '--suite-color': group.color }">
    <div v-if="isPreview" class="demo-banner">
      <el-icon><InfoFilled /></el-icon>
      <span>当前为隔离本地演示：公司、员工、金额和附件均为虚构数据，所有操作只保存在本机内存。</span>
    </div>

    <PageSpecialty
      :page="page"
      :records="records"
      :total="summary.total"
      :statuses="summary.statuses"
      @run-action="runAction"
      @view="openDetail"
    />

    <section class="workspace">
      <div class="workspace-toolbar">
        <div class="workspace-scope">
          <el-segmented v-if="page.tabs?.length" v-model="activeTab" :options="page.tabs.map((item) => item.label)" />
          <span>共 {{ total }} 条</span>
        </div>
        <div class="head-actions">
          <el-button :icon="Refresh" :loading="loading" @click="refresh">刷新</el-button>
          <el-button v-if="capabilities.canCreate" type="primary" :icon="Plus" @click="openCreate">{{ page.primaryLabel }}</el-button>
        </div>
      </div>

      <div class="filter-row">
        <el-input v-model="query.keyword" :placeholder="page.keywordPlaceholder || `搜索${page.title}名称、编号或说明`" clearable class="keyword-input" @keyup.enter="search">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <template v-for="filter in visibleFilters" :key="filter.key">
          <el-select v-if="filter.key === 'ownerId'" v-model="query[filter.key]" clearable filterable :placeholder="filter.label" class="filter-control">
            <el-option v-for="staff in staffOptions" :key="staff.id" :label="`${staff.name} · ${staff.deptName || '未分部门'}`" :value="staff.id" />
          </el-select>
          <el-select v-else-if="filter.key === 'status'" v-model="query[filter.key]" clearable :placeholder="filter.label" class="filter-control">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-else-if="filter.type === 'select'" v-model="query[filter.key]" clearable filterable :placeholder="filter.label" class="filter-control">
            <el-option v-for="item in filter.options || []" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
          <el-date-picker v-else-if="filter.type === 'date'" v-model="query[filter.key]" type="date" value-format="YYYY-MM-DD" :placeholder="filter.label" class="filter-control" />
          <el-date-picker v-else-if="filter.type === 'month'" v-model="query[filter.key]" type="month" value-format="YYYY-MM" :placeholder="filter.label" class="filter-control" />
          <el-input v-else v-model="query[filter.key]" clearable :placeholder="filter.label" class="filter-control" />
        </template>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button v-if="page.filters.length > 3" text :icon="showAllFilters ? ArrowUp : ArrowDown" @click="showAllFilters = !showAllFilters">{{ showAllFilters ? '收起' : '更多筛选' }}</el-button>
      </div>

      <div class="table-toolbar">
        <div>
          <strong>{{ page.title }}</strong>
          <span>已选 {{ selected.length }} 条</span>
        </div>
        <div>
          <el-button :icon="Download" @click="exportCsv">导出当前结果</el-button>
          <el-button v-if="selected.length && capabilities.canWrite && supportsBatchComplete" type="success" plain @click="batchComplete">批量完成</el-button>
          <el-button v-if="selected.length && capabilities.canWrite" type="danger" plain @click="batchRemove">批量删除</el-button>
        </div>
      </div>

      <div v-if="page.kind === 'cards'" v-loading="loading" class="card-grid">
        <article v-for="record in records" :key="record.id" class="business-card" @click="openDetail(record)">
          <div class="business-card-head">
            <div class="record-avatar">{{ record.title.slice(0, 1) }}</div>
            <div><strong>{{ record.title }}</strong><small>{{ record.recordNo }}</small></div>
            <el-tag :type="statusType(record.status)" size="small">{{ statusLabel(record.status) }}</el-tag>
          </div>
          <p>{{ firstDescription(record) }}</p>
          <div class="card-fields">
            <span v-for="column in page.columns.slice(0, 4)" :key="column.key"><small>{{ column.label }}</small><strong>{{ displayValue(valueOf(record, column.key), column.type) }}</strong></span>
          </div>
          <div class="card-footer" @click.stop>
            <span>{{ record.ownerName }}</span>
            <div>
              <el-button link type="primary" @click="openDetail(record)">详情</el-button>
              <el-button v-if="capabilities.canWrite" link type="primary" @click="openEdit(record)">编辑</el-button>
              <el-dropdown v-if="capabilities.canWrite" trigger="click" @command="(command: string) => runAction(record, command)">
                <el-button link type="primary">更多<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
                <template #dropdown><el-dropdown-menu><el-dropdown-item v-for="item in visibleActions(record)" :key="item.key" :command="item.key" :class="item.type === 'danger' ? 'danger-item' : ''">{{ item.label }}</el-dropdown-item><el-dropdown-item divided command="__delete" class="danger-item">删除</el-dropdown-item></el-dropdown-menu></template>
              </el-dropdown>
            </div>
          </div>
        </article>
        <el-empty v-if="!loading && !records.length" description="当前筛选条件下暂无记录" />
      </div>

      <el-table v-else v-loading="loading" :data="records" row-key="id" stripe class="suite-table" @selection-change="selected = $event">
        <el-table-column v-if="capabilities.canWrite" type="selection" width="48" fixed="left" />
        <el-table-column label="业务编号" prop="recordNo" min-width="190" fixed="left" show-overflow-tooltip />
        <el-table-column v-for="column in page.columns" :key="column.key" :label="column.label" :min-width="column.minWidth" :width="column.width" :show-overflow-tooltip="column.tooltip !== false">
          <template #default="{ row }">
            <el-tag v-if="column.type === 'status'" :type="statusType(String(valueOf(row, column.key)))" effect="light">{{ statusLabel(String(valueOf(row, column.key))) }}</el-tag>
            <el-progress v-else-if="column.type === 'progress'" :percentage="progressValue(valueOf(row, column.key))" :stroke-width="8" />
            <span v-else-if="column.type === 'money'" class="money">{{ displayValue(valueOf(row, column.key), 'money') }}</span>
            <span v-else-if="column.type === 'score'" class="score-value">{{ displayValue(valueOf(row, column.key), 'score') }}</span>
            <el-tag v-else-if="column.type === 'boolean'" :type="valueOf(row, column.key) ? 'success' : 'info'" size="small">{{ valueOf(row, column.key) ? '是' : '否' }}</el-tag>
            <span v-else>{{ displayValue(valueOf(row, column.key), column.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="负责人" prop="ownerName" min-width="135" />
        <el-table-column label="状态" min-width="108" fixed="right">
          <template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ statusLabel(row.status) }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button v-if="capabilities.canWrite" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-dropdown v-if="capabilities.canWrite" trigger="click" @command="(command: string) => runAction(row, command)">
              <el-button link type="primary">更多<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
              <template #dropdown><el-dropdown-menu><el-dropdown-item v-for="item in visibleActions(row)" :key="item.key" :command="item.key" :class="item.type === 'danger' ? 'danger-item' : ''">{{ item.label }}</el-dropdown-item><el-dropdown-item divided command="__delete" class="danger-item">删除</el-dropdown-item></el-dropdown-menu></template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template #empty><el-empty description="当前筛选条件下暂无业务记录" :image-size="100" /></template>
      </el-table>

      <div class="pagination-row">
        <span>共 {{ total }} 条</span>
        <el-pagination v-model:current-page="query.current" v-model:page-size="query.size" :total="total" :page-sizes="[10, 20, 50, 100]" layout="sizes, prev, pager, next, jumper" @change="loadRecords" />
      </div>
    </section>

    <section v-if="page.notes?.length" class="page-notes">
      <strong>业务说明</strong>
      <span v-for="note in page.notes" :key="note">{{ note }}</span>
    </section>

    <RecordFormDialog v-model="formVisible" :page="page" :record="editing" :staff-options="staffOptions" :can-manage="capabilities.canManage" :preview="isPreview" @save="saveRecord" />
    <RecordDetailDrawer v-model="detailVisible" :page="page" :record="detail" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, ArrowUp, Download, InfoFilled, Plus, Refresh, Search } from '@element-plus/icons-vue'
import type { FeigeSuiteActionConfig, FeigeSuiteColumnConfig, FeigeSuitePageConfig } from './types'
import type { FeigeSuiteCapabilities, FeigeSuiteRecord, FeigeSuiteRecordPayload, FeigeSuiteStaffOption } from '@/api/feige-suite'
import { FEIGE_SUITE_GROUPS, requireFeigeSuitePage } from './catalog'
import { announceDemoMode, feigeSuiteDataSource, previewEnabled } from '@feige-suite-data-source'
import PageSpecialty from './components/PageSpecialty.vue'
import RecordDetailDrawer from './components/RecordDetailDrawer.vue'
import RecordFormDialog from './components/RecordFormDialog.vue'

const props = defineProps<{ pageCode?: string }>()
const route = useRoute()
const currentCode = computed(() => props.pageCode || String(route.meta.pageCode || ''))
const page = computed<FeigeSuitePageConfig>(() => requireFeigeSuitePage(currentCode.value))
const group = computed(() => FEIGE_SUITE_GROUPS.find((item) => item.code === page.value.group) || FEIGE_SUITE_GROUPS[0])
const isPreview = previewEnabled()

const loading = ref(false)
const showAllFilters = ref(false)
const activeTab = ref('')
const records = ref<FeigeSuiteRecord[]>([])
const selected = ref<FeigeSuiteRecord[]>([])
const total = ref(0)
const staffOptions = ref<FeigeSuiteStaffOption[]>([])
const summary = reactive<{ total: number; statuses: Record<string, number> }>({ total: 0, statuses: {} })
const capabilities = reactive<FeigeSuiteCapabilities>({ manager: false, finance: false, hr: false, canCreate: false, canWrite: false, canManage: false, scope: 'visible_users' })
const formVisible = ref(false)
const detailVisible = ref(false)
const editing = ref<FeigeSuiteRecord | null>(null)
const detail = ref<FeigeSuiteRecord | null>(null)
const query = reactive<Record<string, any>>({ keyword: '', current: 1, size: 20 })

const statusOptions = [
  { label: '草稿', value: 'draft' }, { label: '正常', value: 'active' }, { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'in_progress' }, { label: '已通过', value: 'approved' }, { label: '已驳回', value: 'rejected' },
  { label: '已完成', value: 'completed' }, { label: '已归档', value: 'archived' }, { label: '已启用', value: 'enabled' },
  { label: '已停用', value: 'disabled' }, { label: '已发布', value: 'published' }, { label: '已撤回', value: 'revoked' },
  { label: '未读', value: 'unread' }, { label: '已读', value: 'read' }, { label: '已发放', value: 'paid' }, { label: '已锁定', value: 'locked' }
]
const STATUS_LABELS = Object.fromEntries(statusOptions.map((item) => [item.value, item.label]))
const visibleFilters = computed(() => showAllFilters.value ? page.value.filters : page.value.filters.slice(0, 3))
const supportsBatchComplete = computed(() => page.value.actions.some((item) => item.key === 'complete'))

onMounted(() => announceDemoMode())
watch(currentCode, () => initialize(), { immediate: true })

async function initialize(): Promise<void> {
  activeTab.value = page.value.tabs?.[0]?.label || ''
  Object.keys(query).forEach((key) => { if (!['keyword', 'current', 'size'].includes(key)) delete query[key] })
  query.keyword = ''
  query.current = 1
  await Promise.all([loadMetadata(), loadRecords()])
}

async function loadMetadata(): Promise<void> {
  try {
    const [staff, permission, pageSummary] = await Promise.all([
      feigeSuiteDataSource.staffOptions(), feigeSuiteDataSource.capabilities(page.value.code), feigeSuiteDataSource.summary(page.value.code)
    ])
    staffOptions.value = staff
    Object.assign(capabilities, permission)
    summary.total = pageSummary.total
    summary.statuses = pageSummary.statuses || {}
  } catch (error: any) {
    ElMessage.error(error?.message || '页面信息加载失败')
  }
}

async function loadRecords(): Promise<void> {
  loading.value = true
  try {
    const result = await feigeSuiteDataSource.records(page.value.code, { ...query })
    records.value = result.records || []
    total.value = result.total || 0
  } catch (error: any) {
    ElMessage.error(error?.message || '业务数据加载失败')
    records.value = []
    total.value = 0
  } finally { loading.value = false }
}

async function refresh(): Promise<void> { await Promise.all([loadMetadata(), loadRecords()]); ElMessage.success('数据已刷新') }
function search(): void { query.current = 1; loadRecords() }
function resetQuery(): void { Object.keys(query).forEach((key) => { if (!['current', 'size'].includes(key)) query[key] = '' }); query.current = 1; loadRecords() }
function openCreate(): void { editing.value = null; formVisible.value = true }
function openEdit(record: FeigeSuiteRecord): void { editing.value = record; formVisible.value = true }

async function openDetail(record: FeigeSuiteRecord): Promise<void> {
  detailVisible.value = true
  detail.value = null
  try { detail.value = await feigeSuiteDataSource.detail(page.value.code, record.id) }
  catch (error: any) { detailVisible.value = false; ElMessage.error(error?.message || '详情加载失败') }
}

async function saveRecord(payload: FeigeSuiteRecordPayload, done: (success: boolean, message?: string) => void): Promise<void> {
  try {
    if (editing.value) await feigeSuiteDataSource.update(page.value.code, editing.value.id, { ...payload, version: editing.value.version })
    else await feigeSuiteDataSource.create(page.value.code, payload)
    ElMessage.success(editing.value ? '业务资料已更新' : '业务记录已创建')
    editing.value = null
    await Promise.all([loadMetadata(), loadRecords()])
    done(true)
  } catch (error: any) { done(false, error?.message || '保存失败') }
}

function actionConfig(actionKey: string): FeigeSuiteActionConfig | undefined { return page.value.actions.find((item) => item.key === actionKey) }
function visibleActions(record: FeigeSuiteRecord): FeigeSuiteActionConfig[] { return page.value.actions.filter((item) => actionVisible(record.status, item.key)) }
function actionVisible(status: string, actionKey: string): boolean {
  const map: Record<string, string[]> = {
    start: ['pending'], submit: ['draft', 'rejected'], approve: ['pending'], reject: ['pending'], complete: ['active', 'approved', 'in_progress', 'pending'],
    archive: ['active', 'completed', 'read', 'unread'], restore: ['archived', 'rejected', 'revoked', 'completed', 'read'], publish: ['draft', 'revoked'], revoke: ['published'],
    enable: ['disabled'], disable: ['enabled'], pay: ['approved'], lock: ['approved', 'paid'], unlock: ['locked'], 'mark-read': ['unread']
  }
  return !map[actionKey] || map[actionKey].includes(status)
}

async function runAction(record: FeigeSuiteRecord, actionKey: string): Promise<void> {
  if (actionKey === '__delete') return removeRecord(record)
  const config = actionConfig(actionKey)
  if (!config) return
  let remark = ''
  try {
    if (config.requiresRemark) {
      const result = await ElMessageBox.prompt(`请填写“${config.label}”原因`, config.label, { inputType: 'textarea', inputValidator: (value) => value.trim().length >= 2 || '至少填写2个字' })
      remark = result.value
    } else {
      await ElMessageBox.confirm(`确认对“${record.title}”执行${config.label}？`, '确认操作', { type: config.type === 'danger' ? 'warning' : 'info' })
    }
    await feigeSuiteDataSource.action(page.value.code, record.id, { action: actionKey, remark, version: record.version })
    ElMessage.success(`${config.label}成功`)
    await Promise.all([loadMetadata(), loadRecords()])
  } catch (error: any) { if (error !== 'cancel' && error !== 'close') ElMessage.error(error?.message || `${config.label}失败`) }
}

async function removeRecord(record: FeigeSuiteRecord): Promise<void> {
  try {
    await ElMessageBox.confirm(`删除“${record.title}”后无法在页面恢复，确认继续？`, '删除确认', { type: 'warning' })
    await feigeSuiteDataSource.remove(page.value.code, record.id)
    ElMessage.success('删除成功')
    await Promise.all([loadMetadata(), loadRecords()])
  } catch (error: any) { if (error !== 'cancel' && error !== 'close') ElMessage.error(error?.message || '删除失败') }
}

async function batchComplete(): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认将已选${selected.value.length}条记录批量完成？`, '批量完成', { type: 'info' })
    await Promise.all(selected.value.map((item) => feigeSuiteDataSource.action(page.value.code, item.id, { action: 'complete', version: item.version })))
    ElMessage.success('批量完成成功'); await refresh()
  } catch (error: any) { if (error !== 'cancel' && error !== 'close') ElMessage.error(error?.message || '批量操作失败') }
}

async function batchRemove(): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除已选${selected.value.length}条记录？`, '批量删除', { type: 'warning' })
    await Promise.all(selected.value.map((item) => feigeSuiteDataSource.remove(page.value.code, item.id)))
    ElMessage.success('批量删除成功'); await refresh()
  } catch (error: any) { if (error !== 'cancel' && error !== 'close') ElMessage.error(error?.message || '批量删除失败') }
}

function exportCsv(): void {
  const columns = [{ key: 'recordNo', label: '业务编号' }, ...page.value.columns, { key: 'ownerName', label: '负责人' }, { key: 'status', label: '状态' }]
  const csv = [columns.map((item) => item.label), ...records.value.map((record) => columns.map((item) => displayValue(valueOf(record, item.key), item.key === 'status' ? 'status' : (item as FeigeSuiteColumnConfig).type)))].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  link.download = `${page.value.title}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click(); URL.revokeObjectURL(link.href)
}

function valueOf(record: FeigeSuiteRecord, key: string): any { return (record as any)[key] ?? record.data?.[key] }
function progressValue(value: any): number { return Math.min(100, Math.max(0, Number(value) || 0)) }
function displayValue(value: any, type?: string): string {
  if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') return '-'
  if (type === 'status') return statusLabel(String(value))
  if (type === 'money') return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (type === 'boolean') return value ? '是' : '否'
  return String(value)
}
function firstDescription(record: FeigeSuiteRecord): string { return String(record.data?.description || record.data?.content || record.data?.notes || record.data?.remark || `${page.value.title}的LOCAL-DEMO业务记录。`) }
function statusLabel(status: string): string { return STATUS_LABELS[status] || status || '-' }
function statusType(status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  if (['approved', 'completed', 'enabled', 'published', 'paid', 'active', 'read'].includes(status)) return 'success'
  if (['rejected', 'revoked'].includes(status)) return 'danger'
  if (['pending', 'in_progress', 'draft', 'unread'].includes(status)) return 'warning'
  return 'info'
}
</script>

<style scoped>
.suite-page { min-height: calc(100vh - 104px); padding: 0; background: #f5f7fa; color: #1e293b; }
.head-actions { display: flex; gap: 9px; }
.head-actions :deep(.el-button) { min-height: 40px; }
.demo-banner { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 10px 14px; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 14px; }
.workspace { background: #fff; border: 1px solid #dfe5ec; border-radius: 7px; overflow: hidden; }
.workspace-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 64px; padding: 11px 16px; border-bottom: 1px solid #e5eaf0; }
.workspace-scope { display: flex; min-width: 0; align-items: center; gap: 14px; }
.workspace-scope > span { color: #64748b; font-size: 14px; white-space: nowrap; }
.filter-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 15px 16px; border-bottom: 1px solid #e5eaf0; }
.keyword-input { width: min(360px, 100%); }
.filter-control { width: 170px; }
.filter-row :deep(.el-input__wrapper), .filter-row :deep(.el-select__wrapper) { min-height: 40px; }
.table-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 16px; border-bottom: 1px solid #e5eaf0; }
.table-toolbar > div { display: flex; align-items: center; gap: 10px; }
.table-toolbar strong { font-size: 17px; }
.table-toolbar span { color: #64748b; font-size: 14px; }
.suite-table { width: 100%; font-size: 15px; }
.suite-table :deep(.el-table__header th) { height: 44px; color: #334155; background: #f8fafc; font-weight: 600; }
.suite-table :deep(.el-table__row td) { height: 56px; }
.money { color: #166534; font-weight: 700; }
.score-value { color: #1d4ed8; font-weight: 700; }
.pagination-row { display: flex; align-items: center; justify-content: flex-end; gap: 14px; min-height: 62px; padding: 0 16px; border-top: 1px solid #e5eaf0; }
.pagination-row > span { color: #64748b; font-size: 14px; }
.card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; min-height: 240px; padding: 16px; }
.business-card { padding: 15px; border: 1px solid #dfe5ec; border-radius: 7px; background: #fff; cursor: pointer; transition: border-color .16s, box-shadow .16s; }
.business-card:hover { border-color: var(--suite-color); box-shadow: 0 5px 16px rgb(15 23 42 / 8%); }
.business-card-head { display: flex; align-items: center; gap: 10px; }
.business-card-head > div:nth-child(2) { min-width: 0; flex: 1; }
.business-card-head strong { display: block; overflow: hidden; color: #0f172a; font-size: 16px; text-overflow: ellipsis; white-space: nowrap; }
.business-card-head small { display: block; margin-top: 3px; overflow: hidden; color: #94a3b8; text-overflow: ellipsis; white-space: nowrap; }
.record-avatar { display: grid; flex: 0 0 38px; width: 38px; height: 38px; place-items: center; color: #fff; background: var(--suite-color); border-radius: 6px; font-weight: 700; }
.business-card > p { height: 44px; margin: 13px 0; overflow: hidden; color: #64748b; font-size: 14px; line-height: 22px; }
.card-fields { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 11px 0; border-top: 1px dashed #dbe4f0; border-bottom: 1px dashed #dbe4f0; }
.card-fields span { min-width: 0; }
.card-fields small, .card-fields strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-fields small { color: #94a3b8; }
.card-fields strong { margin-top: 3px; color: #334155; font-size: 14px; }
.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 9px; color: #64748b; }
.page-notes { display: flex; flex-direction: column; gap: 5px; margin-top: 13px; padding: 13px 16px; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; line-height: 22px; }
.page-notes strong { color: #334155; }
:deep(.danger-item) { color: #dc2626; }
@media (max-width: 1180px) { .card-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 760px) { .workspace-toolbar, .table-toolbar { align-items: stretch; flex-direction: column; } .workspace-scope { justify-content: space-between; overflow-x: auto; } .head-actions { width: 100%; } .head-actions .el-button { flex: 1; } .filter-control, .keyword-input { width: 100%; } .card-grid { grid-template-columns: 1fr; } .pagination-row { overflow-x: auto; justify-content: flex-start; } }
</style>
