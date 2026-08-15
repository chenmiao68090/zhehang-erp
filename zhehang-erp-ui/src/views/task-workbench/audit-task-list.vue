<template>
  <section class="task-workbench">
    <el-alert
      v-if="feigeTaskLocalDemo()"
      class="demo-banner"
      type="warning"
      show-icon
      :closable="false"
      title="LOCAL-DEMO 本地验收模式"
      description="当前全部公司、人员、订单和金额均为虚构数据，不连接生产环境。"
    />
    <el-alert v-if="errorMessage" class="error-alert" type="error" show-icon :closable="false" :title="errorMessage" />

    <div class="page-head">
      <div class="page-title">
        <h2>{{ title }}</h2>
        <el-tag effect="plain">任务管理</el-tag>
        <el-tag v-if="feigeTaskLocalDemo()" type="warning">LOCAL-DEMO</el-tag>
        <p>{{ description }}</p>
      </div>
      <div class="heading-actions">
        <el-button v-if="capabilities.bridgeManage" @click="configRef?.open('process')">{{ capabilities.bridgeTriggerSupported ? '流程与生成规则' : '审批流程设置' }}</el-button>
        <el-button v-if="capabilities.manager" type="primary" @click="createRef?.open()">手工补发</el-button>
        <el-button :loading="loading" @click="loadRows">刷新</el-button>
      </div>
    </div>

    <div class="page-card">
      <el-tabs v-model="filters.status" class="status-tabs" @tab-change="handleStatusChange">
        <el-tab-pane label="待审核" name="pending" />
        <el-tab-pane label="已审核" name="approved" />
        <el-tab-pane label="已驳回" name="rejected" />
      </el-tabs>

      <div v-if="filters.status === 'pending'" class="step-strip" aria-label="流程步骤筛选">
        <button type="button" class="step-chip" :class="{ 'is-active': filters.stepNo === undefined }" @click="selectStep(undefined)">全部步骤</button>
        <button
          v-for="step in stepOptions"
          :key="step"
          type="button"
          class="step-chip"
          :class="{ 'is-active': filters.stepNo === step }"
          @click="selectStep(step)"
        >
          第 {{ step }} 步
        </button>
        <button type="button" class="step-chip" :class="{ 'is-active': filters.stepNo === 'completed' }" @click="selectStep('completed')">已完成</button>
      </div>

      <div class="toolbar">
        <div class="toolbar-main">
          <el-input v-model="filters.keyword" class="search-input" clearable placeholder="搜索公司名称或订单编号" @keyup.enter="handleSearch" />
          <el-input v-model="filters.businessType" class="filter-select" clearable placeholder="业务类型" @keyup.enter="handleSearch" />
          <el-select v-model="filters.salesId" class="filter-select" clearable filterable placeholder="业务人员">
            <el-option v-for="item in staffOptions" :key="item.id" :label="staffLabel(item)" :value="item.id" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
        <div class="toolbar-extra">
          <span class="muted">查看范围</span>
          <el-radio-group v-model="filters.scopeType" @change="handleScopeChange">
            <el-radio-button value="personal">我的</el-radio-button>
            <el-radio-button value="team">团队</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="table-wrap">
        <el-table v-loading="loading" :data="rows" row-key="id" border :empty-text="auditEmptyText">
          <el-table-column label="客户 / 订单" min-width="230" fixed="left">
            <template #default="{ row }">
              <div class="company-cell">
                <strong>{{ row.companyName || '-' }}</strong>
                <small>{{ row.orderNo || '未关联订单编号' }}</small>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="105" align="center">
            <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间" min-width="165" />
          <el-table-column prop="salesName" label="业务人员" width="120" />
          <el-table-column v-if="taskType !== 'special'" prop="businessType" label="业务类型" min-width="150" show-overflow-tooltip />
          <el-table-column v-else prop="businessType" label="专项类型" min-width="165" show-overflow-tooltip />

          <el-table-column v-if="taskType === 'recurring'" label="服务周期" min-width="190">
            <template #default="{ row }">{{ row.startMonth || '-' }} 至 {{ row.endMonth || '-' }}</template>
          </el-table-column>
          <el-table-column v-if="taskType === 'project_dept'" prop="teamName" label="项目部门" min-width="150" show-overflow-tooltip />
          <el-table-column v-if="taskType === 'project_dept'" prop="servicePersonName" label="项目负责人" width="125" />
          <el-table-column v-if="taskType === 'special'" prop="servicePersonName" label="工商专员" width="125" />
          <el-table-column v-if="taskType === 'once' || taskType === 'recurring'" prop="servicePersonName" label="服务人员" width="125" />

          <el-table-column prop="region" label="所属地区" min-width="145" show-overflow-tooltip />
          <el-table-column label="订单金额" width="125" align="right">
            <template #default="{ row }"><span class="money">{{ money(row.amount) }}</span></template>
          </el-table-column>
          <el-table-column label="费用明细" width="125" align="center">
            <template #default="{ row }"><el-button type="primary" link @click="openPayments(row)">{{ money(row.expenseAmount) }}</el-button></template>
          </el-table-column>
          <el-table-column label="流程进度" min-width="180">
            <template #default="{ row }">
              <button type="button" class="plain-action" @click="openSteps(row)">
                <span>{{ row.stepName || '查看流程' }}</span>
                <el-progress :percentage="progress(row)" :show-text="false" :stroke-width="6" />
                <small>第 {{ row.stepNo || '-' }}/{{ row.stepCount || '-' }} 步</small>
              </button>
            </template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'pending'" type="primary" link @click="openAudit(row)">审核</el-button>
              <el-button type="primary" link @click="openLogs(row)">操作记录</el-button>
              <el-button v-if="canChangeSpecialist(row)" type="warning" link @click="openSpecialist(row)">修改工商专员</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <TaskAuditDialog
      v-model="auditVisible"
      :task="activeTask"
      :detail="auditDetail"
      :staff="staffOptions"
      :capabilities="capabilities"
      :loading="detailLoading"
      :submitting="submitting"
      @submit="submitAudit"
    />

    <TaskRecordDrawer v-model="recordVisible" :title="recordTitle" :mode="recordMode" :rows="recordRows" :loading="recordLoading" />

    <el-dialog v-model="specialistVisible" title="修改工商专员" width="480px" append-to-body destroy-on-close>
      <p class="form-note">只调整当前专项任务的承办人，不修改员工角色和部门权限。</p>
      <el-form label-position="top">
        <el-form-item label="工商专员" required>
          <el-select v-model="specialistId" filterable placeholder="请选择人员" style="width: 100%">
            <el-option v-for="item in staffOptions" :key="item.id" :label="staffLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="specialistVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveSpecialist">确认调整</el-button>
      </template>
    </el-dialog>

    <AuditTaskCreateDialog ref="createRef" :task-type="taskType" :processes="processes" :staff="staffOptions" :orders="orderOptions" @create="createAuditTask" @configure="configRef?.open('process')" />
    <TaskConfigDialog v-if="capabilities.bridgeManage" ref="configRef" :task-type="taskType" :roles="roleOptions" :staff="staffOptions" :capabilities="capabilities" @changed="loadProcesses" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { AuditProcess, AuditTask, AuditTaskCreatePayload, FeigeTaskCapabilities, PageResult, RoleTreeNode, StaffOption, TaskOrderOption } from '@/api/feige-task'
import { feigeTaskData, feigeTaskLocalDemo } from '@feige-task-data-source'
import AuditTaskCreateDialog from './components/AuditTaskCreateDialog.vue'
import TaskAuditDialog from './components/TaskAuditDialog.vue'
import TaskConfigDialog from './components/TaskConfigDialog.vue'
import TaskRecordDrawer from './components/TaskRecordDrawer.vue'

const props = defineProps<{
  taskType: 'once' | 'recurring' | 'project_dept' | 'special'
  title: string
  description: string
}>()

const rows = ref<AuditTask[]>([])
const loading = ref(false)
const errorMessage = ref('')
const staffOptions = ref<StaffOption[]>([])
const roleOptions = ref<RoleTreeNode[]>([])
const orderOptions = ref<TaskOrderOption[]>([])
const processes = ref<AuditProcess[]>([])
const CLOSED_CAPABILITIES: FeigeTaskCapabilities = {
  manager: false,
  bridgeManage: false,
  bridgeTriggerSupported: false,
  contractConversionSupported: false,
  addressConversionSupported: false
}
const capabilities = ref<FeigeTaskCapabilities>({ ...CLOSED_CAPABILITIES })
const filters = reactive({
  status: 'pending',
  scopeType: 'personal',
  keyword: '',
  businessType: '',
  salesId: undefined as number | undefined,
  stepNo: undefined as number | 'completed' | undefined
})
const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 })

const auditVisible = ref(false)
const detailLoading = ref(false)
const submitting = ref(false)
const activeTask = ref<AuditTask | null>(null)
const auditDetail = ref<any>({})

const recordVisible = ref(false)
const recordLoading = ref(false)
const recordMode = ref<'payments' | 'steps' | 'logs'>('logs')
const recordTitle = ref('')
const recordRows = ref<any[]>([])

const specialistVisible = ref(false)
const specialistId = ref<number>()
const createRef = ref<InstanceType<typeof AuditTaskCreateDialog>>()
const configRef = ref<InstanceType<typeof TaskConfigDialog>>()

const stepOptions = computed(() => {
  const count = Math.max(0, ...rows.value.map((row) => Number(row.stepCount || 0)))
  return Array.from({ length: count }, (_, index) => index + 1)
})
const auditEmptyText = computed(() => {
  if (!capabilities.value.manager) return '暂无符合条件的任务'
  return capabilities.value.bridgeTriggerSupported
    ? '暂无任务，可配置流程与自动生成规则，或手工补发'
    : '暂无任务，可先配置流程后手工补发'
})

onMounted(async () => {
  const [capabilityResult, staffResult] = await Promise.allSettled([feigeTaskData.capabilities(), feigeTaskData.staffOptions(), loadRows()])
  if (capabilityResult.status === 'fulfilled') capabilities.value = capabilityResult.value || { ...CLOSED_CAPABILITIES }
  else capabilities.value = { ...CLOSED_CAPABILITIES }
  if (staffResult.status === 'fulfilled') staffOptions.value = staffResult.value || []
  else ElMessage.error(`人员选项加载失败：${errorText(staffResult.reason)}`)
  if (capabilities.value.bridgeManage) {
    const [roleResult, orderResult] = await Promise.allSettled([feigeTaskData.roleTree(), feigeTaskData.orderOptions({ pageSize: 100 }), loadProcesses()])
    if (roleResult.status === 'fulfilled') roleOptions.value = roleResult.value || []
    else ElMessage.warning(`角色选项加载失败：${errorText(roleResult.reason)}`)
    if (orderResult.status === 'fulfilled') orderOptions.value = orderResult.value || []
    else ElMessage.warning(`可关联订单加载失败：${errorText(orderResult.reason)}`)
  }
  else if (capabilities.value.manager) {
    const [orderResult] = await Promise.allSettled([feigeTaskData.orderOptions({ pageSize: 100 }), loadProcesses()])
    if (orderResult.status === 'fulfilled') orderOptions.value = orderResult.value || []
    else ElMessage.warning(`可关联订单加载失败：${errorText(orderResult.reason)}`)
  }
})

async function loadProcesses() {
  try { processes.value = await feigeTaskData.auditProcesses({ taskType: props.taskType }) || [] }
  catch (error) { processes.value = []; ElMessage.warning(`审批流程加载失败：${errorText(error)}`) }
}

async function createAuditTask(payload: AuditTaskCreatePayload) {
  createRef.value?.setSaving(true)
  try {
    await feigeTaskData.createAuditTask(payload)
    createRef.value?.setSaving(false, true)
    ElMessage.success(feigeTaskLocalDemo() ? 'LOCAL-DEMO：审批任务已补发' : '审批任务已补发')
    filters.status = 'pending'
    filters.stepNo = undefined
    pagination.pageNum = 1
    await loadRows()
  } catch (error) {
    createRef.value?.setSaving(false)
    ElMessage.error(`任务创建失败：${errorText(error)}`)
  }
}

async function loadRows() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await feigeTaskData.auditTasks({
      taskType: props.taskType,
      status: filters.stepNo === 'completed' ? undefined : filters.status,
      scopeType: filters.scopeType,
      keyword: filters.keyword.trim() || undefined,
      businessType: filters.businessType.trim() || undefined,
      salesId: filters.salesId,
      stepNo: typeof filters.stepNo === 'number' ? filters.stepNo : undefined,
      showCompleted: filters.stepNo === 'completed' || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    const page = normalizePage(result)
    rows.value = page.records
    pagination.total = page.total
  } catch (error) {
    rows.value = []
    pagination.total = 0
    errorMessage.value = `任务列表加载失败：${errorText(error)}`
  } finally {
    loading.value = false
  }
}

function normalizePage(result: PageResult<AuditTask> | any) {
  const value = result?.data?.data ?? result?.data ?? result?.result ?? result ?? {}
  const records = Array.isArray(value) ? value : (value.records || value.list || value.rows || [])
  return { records, total: Number(value.total ?? value.totalCount ?? records.length) }
}

function handleSearch() { pagination.pageNum = 1; loadRows() }
function resetFilters() {
  filters.keyword = ''
  filters.businessType = ''
  filters.salesId = undefined
  filters.stepNo = undefined
  pagination.pageNum = 1
  loadRows()
}
function handleStatusChange() { pagination.pageNum = 1; filters.stepNo = undefined; loadRows() }
function handleScopeChange() { pagination.pageNum = 1; loadRows() }
function selectStep(step?: number | 'completed') { filters.stepNo = step; pagination.pageNum = 1; loadRows() }
function handlePageChange() { loadRows() }
function handleSizeChange() { pagination.pageNum = 1; loadRows() }

async function openAudit(row: AuditTask) {
  activeTask.value = row
  auditDetail.value = {}
  auditVisible.value = true
  detailLoading.value = true
  try {
    auditDetail.value = await feigeTaskData.auditTaskDetail(row.id)
  } catch (error) {
    ElMessage.error(`任务详情加载失败：${errorText(error)}`)
    auditVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

async function submitAudit(payload: Record<string, any>) {
  if (!activeTask.value) return
  submitting.value = true
  try {
    await feigeTaskData.auditAction(activeTask.value.id, payload)
    ElMessage.success(payload.result === 'rejected' ? '已驳回任务' : '审核已通过')
    auditVisible.value = false
    await loadRows()
  } catch (error) {
    ElMessage.error(`审核提交失败：${errorText(error)}`)
  } finally {
    submitting.value = false
  }
}

async function openPayments(row: AuditTask) {
  if (!row.orderId) return ElMessage.warning('当前任务未关联订单，无法查看费用明细')
  openRecord('payments', `${row.companyName} · 收款与费用明细`)
  try { recordRows.value = await feigeTaskData.auditTaskPayments(row.orderId) || [] }
  catch (error) { ElMessage.error(`费用明细加载失败：${errorText(error)}`) }
  finally { recordLoading.value = false }
}

async function openSteps(row: AuditTask) {
  if (!row.orderId) return ElMessage.warning('当前任务未关联订单，无法查看流程')
  openRecord('steps', `${row.companyName} · 流程进度`)
  try { recordRows.value = await feigeTaskData.auditTaskSteps(row.orderId) || [] }
  catch (error) { ElMessage.error(`流程记录加载失败：${errorText(error)}`) }
  finally { recordLoading.value = false }
}

async function openLogs(row: AuditTask) {
  openRecord('logs', `${row.companyName} · 操作记录`)
  try {
    const detail = await feigeTaskData.auditTaskDetail(row.id)
    recordRows.value = detail?.logs || []
  } catch (error) {
    ElMessage.error(`操作记录加载失败：${errorText(error)}`)
  } finally {
    recordLoading.value = false
  }
}

function openRecord(mode: 'payments' | 'steps' | 'logs', titleText: string) {
  recordMode.value = mode
  recordTitle.value = titleText
  recordRows.value = []
  recordLoading.value = true
  recordVisible.value = true
}

function openSpecialist(row: AuditTask) {
  activeTask.value = row
  specialistId.value = row.servicePersonId
  specialistVisible.value = true
}

function canChangeSpecialist(row: AuditTask | any) {
  return feigeTaskLocalDemo()
    ? props.taskType === 'special' && row.status === 'pending'
    : row.canChangeGsSpecialist === true
}

async function saveSpecialist() {
  if (!activeTask.value || !specialistId.value) return ElMessage.warning('请选择工商专员')
  submitting.value = true
  try {
    await feigeTaskData.auditAction(activeTask.value.id, { action: 'reassign_specialist', servicePersonId: specialistId.value })
    ElMessage.success('工商专员已调整')
    specialistVisible.value = false
    await loadRows()
  } catch (error) {
    ElMessage.error(`工商专员调整失败：${errorText(error)}`)
  } finally {
    submitting.value = false
  }
}

function staffLabel(item: StaffOption) { return `${item.name}${item.deptName ? ` · ${item.deptName}` : ''}` }
function statusLabel(status: string) { return ({ pending: '待审核', approved: '已通过', rejected: '已驳回' } as Record<string, string>)[status] || status || '-' }
function statusType(status: string) { return ({ pending: 'warning', approved: 'success', rejected: 'danger' } as Record<string, any>)[status] || 'info' }
function money(value: any) { return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function progress(row: AuditTask) { return row.stepCount ? Math.min(100, Math.round(Number(row.stepNo || 0) / Number(row.stepCount) * 100)) : 0 }
function errorText(error: any) { return error?.response?.data?.message || error?.message || '未知错误' }
</script>

<style lang="scss" src="./common.scss"></style>
<style scoped lang="scss">
.plain-action { display: grid; width: 100%; gap: 4px; padding: 0; border: 0; background: transparent; color: #1677ff; text-align: left; cursor: pointer; }
.plain-action small { color: #94a3b8; }
.heading-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>
