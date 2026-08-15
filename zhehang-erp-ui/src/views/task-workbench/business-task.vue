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
      <div class="page-title"><h2>业务任务</h2><el-tag effect="plain">任务管理</el-tag><p>{{ businessIntro }}</p></div>
      <div class="heading-actions">
        <el-button v-if="capabilities.bridgeManage && capabilities.bridgeTriggerSupported" @click="configRef?.open('rule')">自动生成规则</el-button>
        <el-button v-if="capabilities.manager" type="primary" @click="createRef?.open()">手工补发</el-button>
        <el-button :loading="loading" @click="loadRows">刷新</el-button>
      </div>
    </div>

    <div class="page-card">
      <el-tabs v-model="activeStatus" class="business-tabs" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in tabs" :key="tab.value" :name="tab.value">
          <template #label>
            <span class="tab-label">{{ tab.label }}<span v-if="activeStatus === tab.value" class="tab-count">{{ pagination.total }}</span></span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <el-form class="legacy-search-form" :inline="true" @submit.prevent>
        <el-form-item label="订单编号">
          <el-input v-model="filters.orderNo" clearable placeholder="请输入订单编号" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="公司名称">
          <el-input v-model="filters.companyName" clearable placeholder="请输入公司名称" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-wrap">
        <el-table v-loading="loading" :data="rows" row-key="id" border :empty-text="capabilities.manager ? '当前环节暂无任务，可用右上角手工补发' : '当前环节暂无任务'">
          <el-table-column prop="orderNo" label="订单编号" width="150" align="center" />
          <el-table-column prop="companyName" label="公司名称" min-width="200" align="center" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.companyName || '-' }}</span>
              <el-tooltip v-if="row.managerReviewStatus === 'rejected'" :content="row.managerReviewRemark || '经理审核驳回'">
                <el-tag class="review-state-tag" type="danger" size="small">已驳回</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column v-if="activeStatus === 'pending_manager_audit'" prop="createTime" label="创建时间" width="180" align="center" />
          <template v-else>
            <el-table-column prop="assigneeName" label="分配人员" width="120" align="center" />
            <el-table-column prop="receivedUserName" label="接收人" width="120" align="center" />
            <el-table-column prop="costCategory" label="成本类目" width="150" align="center" />
            <el-table-column prop="costAmount" label="成本金额" width="120" align="center">
              <template #default="{ row }">{{ row.costAmount == null ? '-' : row.costAmount }}</template>
            </el-table-column>
            <el-table-column prop="receivedTime" label="接收时间" width="180" align="center" />
          </template>
          <el-table-column label="操作" width="230" fixed="right" align="center">
            <template #default="{ row }">
              <el-button v-if="activeStatus === 'pending_manager_audit' && canUse(row, 'canManagerReview')" type="primary" link @click="openManagerAudit(row)">审核</el-button>
              <el-button v-if="(activeStatus === 'public_sea' || activeStatus === 'assigned_to_me') && canUse(row, 'canReceive')" type="primary" link @click="confirmSimple(row, 'receive', '确认接收', `确定要接收订单 ${row.orderNo || '-'} 的任务吗？`)">接收</el-button>

              <template v-if="activeStatus === 'task' && canUse(row, 'canOperate')">
                <el-button type="primary" link @click="openCost(row)">填写成本</el-button>
                <el-button v-if="canUse(row, 'canHandover')" type="primary" link @click="confirmSimple(row, 'handover', '确认交接', `确定要交接订单 ${row.orderNo || '-'} 的任务吗？`)">去交接</el-button>
                <el-button v-if="canUse(row, 'canReassign')" type="primary" link @click="openReassign(row)">转分配</el-button>
                <el-button type="danger" link @click="openException(row)">转为异常</el-button>
              </template>

              <el-button v-if="activeStatus === 'handover' && canUse(row, 'canConfirmHandover')" type="primary" link @click="confirmSimple(row, 'confirm-handover', '确认完成', `确定订单 ${row.orderNo || '-'} 的交接已完成吗？`)">确认完成</el-button>
              <template v-if="activeStatus === 'problem_task'">
                <el-button v-if="canUse(row, 'canReassign')" type="primary" link @click="openReassign(row)">转分配</el-button>
                <el-button v-if="canUse(row, 'canRecycle')" type="danger" link @click="confirmSimple(row, 'recycle', '移入回收站', '确认将该任务移入回收站？')">回收站</el-button>
              </template>
              <el-button v-if="activeStatus === 'recycle_bin' && canUse(row, 'canReassign')" type="primary" link @click="openReassign(row)">转分配</el-button>
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

    <el-dialog v-model="managerVisible" title="工商经理审核" width="800px" append-to-body destroy-on-close :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="审核结果" required>
          <el-radio-group v-model="managerForm.result"><el-radio value="approved">通过</el-radio><el-radio value="rejected">驳回</el-radio></el-radio-group>
        </el-form-item>
        <template v-if="managerForm.result === 'approved'">
          <el-form-item label="分配方式" required>
            <el-radio-group v-model="managerForm.targetStatus"><el-radio value="public_sea">放入公海</el-radio><el-radio value="assigned_to_me">指定工商人员</el-radio></el-radio-group>
          </el-form-item>
          <el-form-item v-if="managerForm.targetStatus === 'assigned_to_me'" label="指定工商人员" required>
            <el-select v-model="managerForm.assigneeId" filterable style="width: 100%" placeholder="请选择工商人员">
              <el-option v-for="item in staffOptions" :key="item.id" :label="staffLabel(item)" :value="item.id" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="审核备注">
          <el-input v-model="managerForm.remark" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="managerVisible = false">取消</el-button><el-button :type="managerForm.result === 'rejected' ? 'danger' : 'primary'" :loading="submitting" @click="submitManagerAudit">确认提交</el-button></template>
    </el-dialog>

    <el-dialog v-model="costVisible" title="填写成本信息" width="600px" append-to-body destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="成本类目" required><el-input v-model="costForm.category" placeholder="请输入成本类目" maxlength="100" /></el-form-item>
        <el-form-item label="成本金额" required><el-input-number v-model="costForm.costAmount" :min="0" :precision="2" controls-position="right" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="costVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitCost">确定</el-button></template>
    </el-dialog>

    <el-dialog v-model="staffVisible" title="转分配工商人员" width="600px" append-to-body destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="工商人员" required>
          <el-select v-model="staffForm.staffId" filterable style="width: 100%" placeholder="请选择工商人员">
            <el-option v-for="item in staffOptions" :key="item.id" :label="staffLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="staffVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitReassign">确定</el-button></template>
    </el-dialog>

    <el-dialog v-model="exceptionVisible" title="转为异常" width="600px" append-to-body destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="原因" required><el-input v-model="exceptionForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入原因" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="exceptionVisible = false">取消</el-button><el-button type="danger" :loading="submitting" @click="submitException">确定</el-button></template>
    </el-dialog>

    <BusinessTaskCreateDialog ref="createRef" :staff="staffOptions" :orders="orderOptions" @create="createBusinessTask" />
    <TaskConfigDialog ref="configRef" task-type="business" :roles="[]" :staff="staffOptions" :capabilities="capabilities" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { BusinessTask, BusinessTaskCreatePayload, FeigeTaskCapabilities, PageResult, StaffOption, TaskOrderOption } from '@/api/feige-task'
import { feigeTaskData, feigeTaskLocalDemo } from '@feige-task-data-source'
import BusinessTaskCreateDialog from './components/BusinessTaskCreateDialog.vue'
import TaskConfigDialog from './components/TaskConfigDialog.vue'

const tabs = [
  { value: 'pending_manager_audit', label: '工商经理审核' },
  { value: 'public_sea', label: '公海待接收' },
  { value: 'assigned_to_me', label: '待本人接收' },
  { value: 'task', label: '任务' },
  { value: 'handover', label: '交接' },
  { value: 'completed', label: '已完单' },
  { value: 'problem_task', label: '问题任务' },
  { value: 'recycle_bin', label: '回收站' }
]

const activeStatus = ref('pending_manager_audit')
const rows = ref<BusinessTask[]>([])
const staffOptions = ref<StaffOption[]>([])
const orderOptions = ref<TaskOrderOption[]>([])
const CLOSED_CAPABILITIES: FeigeTaskCapabilities = {
  manager: false,
  bridgeManage: false,
  bridgeTriggerSupported: false,
  contractConversionSupported: false,
  addressConversionSupported: false
}
const capabilities = ref<FeigeTaskCapabilities>({ ...CLOSED_CAPABILITIES })
const businessIntro = computed(() => capabilities.value.bridgeTriggerSupported
  ? '订单创建或财务审核通过后可按启用规则自动生成任务；经理也可手工补发未覆盖或生成失败的任务。'
  : '经理可关联真实订单手工补发任务；自动生成入口仅在后端能力开放后显示。')
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const activeTask = ref<BusinessTask | null>(null)
const filters = reactive({ orderNo: '', companyName: '' })
const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 })

const managerVisible = ref(false)
const managerForm = reactive({ result: 'approved', targetStatus: 'public_sea', assigneeId: undefined as number | undefined, remark: '' })
const costVisible = ref(false)
const costForm = reactive({ category: '', costAmount: 0 })
const staffVisible = ref(false)
const staffForm = reactive({ staffId: undefined as number | undefined })
const exceptionVisible = ref(false)
const exceptionForm = reactive({ reason: '' })
const createRef = ref<InstanceType<typeof BusinessTaskCreateDialog>>()
const configRef = ref<InstanceType<typeof TaskConfigDialog>>()

onMounted(async () => {
  const [capabilityResult, staffResult] = await Promise.allSettled([feigeTaskData.capabilities(), feigeTaskData.staffOptions(), loadRows()])
  if (capabilityResult.status === 'fulfilled') capabilities.value = capabilityResult.value || { ...CLOSED_CAPABILITIES }
  else capabilities.value = { ...CLOSED_CAPABILITIES }
  if (staffResult.status === 'fulfilled') staffOptions.value = staffResult.value || []
  else ElMessage.error(`人员选项加载失败：${errorText(staffResult.reason)}`)
  if (capabilities.value.manager) await loadOrderOptions()
})

async function loadOrderOptions() {
  try { orderOptions.value = await feigeTaskData.orderOptions({ pageSize: 100 }) || [] }
  catch (error) { orderOptions.value = []; ElMessage.warning(`可关联订单加载失败：${errorText(error)}`) }
}

async function createBusinessTask(payload: BusinessTaskCreatePayload) {
  createRef.value?.setSaving(true)
  try {
    await feigeTaskData.createBusinessTask(payload)
    createRef.value?.setSaving(false, true)
    ElMessage.success(feigeTaskLocalDemo() ? 'LOCAL-DEMO：业务任务已补发' : '业务任务已补发')
    activeStatus.value = 'pending_manager_audit'
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
    const result = await feigeTaskData.businessTasks({
      status: activeStatus.value,
      orderNo: filters.orderNo.trim() || undefined,
      companyName: filters.companyName.trim() || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    const page = normalizePage(result)
    rows.value = page.records
    pagination.total = page.total
  } catch (error) {
    rows.value = []
    pagination.total = 0
    errorMessage.value = `业务任务加载失败：${errorText(error)}`
  } finally {
    loading.value = false
  }
}

function normalizePage(result: PageResult<BusinessTask> | any) {
  const value = result?.data?.data ?? result?.data ?? result?.result ?? result ?? {}
  const records = Array.isArray(value) ? value : (value.records || value.list || value.rows || [])
  return { records, total: Number(value.total ?? value.totalCount ?? records.length) }
}

function handleTabChange() { pagination.pageNum = 1; loadRows() }
function handleSearch() { pagination.pageNum = 1; loadRows() }
function handlePageChange() { loadRows() }
function handleSizeChange() { pagination.pageNum = 1; loadRows() }
function resetFilters() { filters.orderNo = ''; filters.companyName = ''; pagination.pageNum = 1; loadRows() }

function openManagerAudit(row: BusinessTask) {
  activeTask.value = row
  managerForm.result = 'approved'
  managerForm.targetStatus = 'public_sea'
  managerForm.assigneeId = undefined
  managerForm.remark = ''
  managerVisible.value = true
}

async function submitManagerAudit() {
  if (!activeTask.value) return
  if (managerForm.result === 'approved' && managerForm.targetStatus === 'assigned_to_me' && !managerForm.assigneeId) return ElMessage.warning('请选择经办人员')
  if (managerForm.result === 'rejected' && !managerForm.remark.trim()) return ElMessage.warning('请填写驳回原因')
  await runAction(activeTask.value, managerForm.result === 'approved' ? 'approve' : 'reject', {
    targetStatus: managerForm.targetStatus,
    assigneeId: managerForm.assigneeId,
    remark: managerForm.remark.trim() || undefined
  }, '经理审核已提交', () => { managerVisible.value = false })
}

function openCost(row: BusinessTask) {
  activeTask.value = row
  costForm.category = ''
  costForm.costAmount = Number(row.costAmount || 0)
  costVisible.value = true
}

async function submitCost() {
  if (!activeTask.value || !costForm.category.trim()) return ElMessage.warning('请填写成本类目')
  if (costForm.costAmount < 0) return ElMessage.warning('成本金额不能小于 0')
  await runAction(activeTask.value, 'cost', { costCategory: costForm.category.trim(), costAmount: costForm.costAmount }, '成本已保存', () => { costVisible.value = false })
}

function openReassign(row: BusinessTask) {
  activeTask.value = row
  staffForm.staffId = row.assigneeId
  staffVisible.value = true
}

async function submitReassign() {
  if (!activeTask.value || !staffForm.staffId) return ElMessage.warning('请选择人员')
  await runAction(activeTask.value, 'reassign', { assigneeId: staffForm.staffId }, '任务已重新指派', () => { staffVisible.value = false })
}

function openException(row: BusinessTask) {
  activeTask.value = row
  exceptionForm.reason = ''
  exceptionVisible.value = true
}

async function submitException() {
  if (!activeTask.value) return
  if (!exceptionForm.reason.trim()) return ElMessage.warning('请填写问题说明')
  await runAction(activeTask.value, 'exception', { targetStatus: 'problem_task', reason: exceptionForm.reason.trim() }, '已转入问题任务', () => { exceptionVisible.value = false })
}

async function confirmSimple(row: BusinessTask, action: string, title: string, message: string) {
  try {
    await ElMessageBox.confirm(message, title, { type: action === 'recycle' ? 'warning' : 'info', confirmButtonText: '确认', cancelButtonText: '取消' })
    await runAction(row, action, {}, `${title}成功`)
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(errorText(error))
  }
}

async function runAction(row: BusinessTask, action: string, payload: Record<string, any>, successText: string, done?: () => void) {
  submitting.value = true
  try {
    await feigeTaskData.businessAction(row.id, action, payload)
    ElMessage.success(successText)
    done?.()
    await loadRows()
  } catch (error) {
    ElMessage.error(`操作失败：${errorText(error)}`)
  } finally {
    submitting.value = false
  }
}

function staffLabel(item: StaffOption) { return `${item.name}${item.deptName ? ` · ${item.deptName}` : ''}` }
function canUse(row: BusinessTask, capability: keyof BusinessTask) { return feigeTaskLocalDemo() || row[capability] === true }
function errorText(error: any) { return error?.response?.data?.message || error?.message || '未知错误' }
</script>

<style lang="scss" src="./common.scss"></style>
<style scoped>.heading-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}</style>
