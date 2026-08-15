<template>
  <el-dialog
    v-model="visible"
    :title="`手工补发${taskTypeLabel}`"
    width="min(820px, 96vw)"
    top="4vh"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-alert
      v-if="!enabledProcesses.length"
      type="warning"
      show-icon
      :closable="false"
      title="当前没有已启用的审批流程"
      description="请先配置并启用流程，再创建任务。专项类型也在专项审批流程中配置。"
    />
    <div v-if="!enabledProcesses.length" class="empty-action"><el-button type="primary" link @click="emit('configure')">立即配置流程</el-button></div>
    <el-alert
      v-else
      type="info"
      show-icon
      :closable="false"
      title="手工补发不会修改关联订单"
      description="可补充未命中自动规则或生成失败的任务；审批人与动态表单以所选流程为准。"
    />

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="create-form">
      <div class="form-grid">
        <el-form-item label="审批流程" prop="processId">
          <el-select v-model="form.processId" filterable placeholder="请选择已启用流程" style="width:100%" @change="handleProcessChange">
            <el-option v-for="item in enabledProcesses" :key="item.id" :label="processLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="taskType === 'special'" label="专项类型">
          <el-input :model-value="selectedProcess?.processName || ''" disabled placeholder="随专项流程确定" />
          <div class="field-help">类型编码：{{ selectedProcess?.businessTypeCode || '尚未配置' }}</div>
        </el-form-item>
        <el-form-item v-else label="业务类型">
          <el-input v-model="form.businessTypeName" maxlength="150" placeholder="选填，例如代理记账" />
        </el-form-item>

        <el-form-item label="关联订单">
          <el-select v-model="form.orderId" filterable clearable placeholder="选填；选择后自动带入订单资料" style="width:100%" @change="handleOrderChange">
            <el-option v-for="item in orders" :key="item.id" :label="orderLabel(item)" :value="item.id" />
          </el-select>
          <div class="field-help">不关联订单仍可补发，但费用与订单流程记录不可联查。</div>
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" maxlength="200" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="订单编号">
          <el-input v-model="form.orderNo" maxlength="64" placeholder="选填，便于业务核对" />
        </el-form-item>
        <el-form-item label="业务负责人" prop="businessOwnerId">
          <el-select v-model="form.businessOwnerId" filterable placeholder="请选择任务归属人员" style="width:100%">
            <el-option v-for="item in staff" :key="item.id" :label="staffLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务人员">
          <el-select v-model="form.servicePersonId" filterable clearable placeholder="选填" style="width:100%">
            <el-option v-for="item in staff" :key="item.id" :label="staffLabel(item)" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="查看范围">
          <el-radio-group v-model="form.scopeType"><el-radio-button value="personal">个人</el-radio-button><el-radio-button value="team">团队</el-radio-button></el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.scopeType === 'team'" label="团队 / 项目部门" prop="teamName">
          <el-input v-model="form.teamName" maxlength="150" placeholder="请输入团队或项目部门名称" />
        </el-form-item>
        <el-form-item label="所属地区">
          <el-input v-model="form.region" maxlength="150" placeholder="选填" />
        </el-form-item>

        <template v-if="taskType === 'recurring'">
          <el-form-item label="服务开始月" prop="startMonth"><el-date-picker v-model="form.startMonth" type="month" value-format="YYYY-MM" style="width:100%" /></el-form-item>
          <el-form-item label="服务结束月" prop="endMonth"><el-date-picker v-model="form.endMonth" type="month" value-format="YYYY-MM" style="width:100%" /></el-form-item>
        </template>

        <el-form-item label="订单金额">
          <el-input-number v-model="form.amount" :min="0" :precision="2" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="已知费用金额">
          <el-input-number v-model="form.expenseAmount" :min="0" :precision="2" controls-position="right" style="width:100%" />
        </el-form-item>
      </div>

      <el-form-item label="任务备注">
        <el-input v-model="form.remarks" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="填写交付要求或补发原因" />
      </el-form-item>
      <el-form-item label="最终确认">
        <el-switch v-model="form.finalConfirm" :active-value="1" :inactive-value="0" />
        <span class="switch-help">开启后，最终步骤必须由业务负责人本人确认。</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible=false">取消</el-button>
      <el-button type="primary" :loading="saving" :disabled="!enabledProcesses.length" @click="submit">创建任务</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { AuditProcess, AuditTaskCreatePayload, StaffOption, TaskOrderOption } from '@/api/feige-task'
import { createTaskRequestKey } from '../request-key'

const props = defineProps<{
  taskType: 'once' | 'recurring' | 'project_dept' | 'special'
  processes: AuditProcess[]
  staff: StaffOption[]
  orders: TaskOrderOption[]
}>()
const emit = defineEmits<{
  (event: 'create', payload: AuditTaskCreatePayload): void
  (event: 'configure'): void
}>()
const visible = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<any>({})
const enabledProcesses = computed(() => props.processes.filter(item => Number(item.enabled) === 1))
const selectedProcess = computed(() => enabledProcesses.value.find(item => item.id === Number(form.processId)))
const taskTypeLabel = computed(() => ({ once: '一次性任务', recurring: '周期任务', project_dept: '项目部门任务', special: '专项任务' })[props.taskType])
const rules = computed<FormRules>(() => ({
  processId: [{ required: true, message: '请选择审批流程', trigger: 'change' }],
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  businessOwnerId: [{ required: true, message: '请选择业务负责人', trigger: 'change' }],
  teamName: form.scopeType === 'team' ? [{ required: true, message: '请输入团队或项目部门名称', trigger: 'blur' }] : [],
  startMonth: props.taskType === 'recurring' ? [{ required: true, message: '请选择服务开始月', trigger: 'change' }] : [],
  endMonth: props.taskType === 'recurring' ? [{ required: true, message: '请选择服务结束月', trigger: 'change' }] : []
}))

function reset() {
  Object.assign(form, {
    processId: enabledProcesses.value[0]?.id,
    orderId: undefined,
    orderNo: '',
    companyName: '',
    businessTypeCode: '',
    businessTypeName: '',
    businessOwnerId: undefined,
    scopeType: props.taskType === 'project_dept' ? 'team' : 'personal',
    teamName: '',
    region: '',
    amount: 0,
    expenseAmount: 0,
    startMonth: '',
    endMonth: '',
    servicePersonId: undefined,
    remarks: '',
    finalConfirm: 0
  })
  handleProcessChange()
}

function open() {
  reset()
  form.requestKey = createTaskRequestKey()
  visible.value = true
}

function handleProcessChange() {
  const process = selectedProcess.value
  form.businessTypeCode = process?.businessTypeCode || ''
  if (props.taskType === 'special') form.businessTypeName = process?.processName || ''
}

function handleOrderChange(id?: number) {
  const order = props.orders.find(item => item.id === Number(id))
  if (!order) return
  form.orderNo = order.orderNo
  form.companyName = order.companyName
  form.region = order.region || ''
  form.amount = Number(order.amount || 0)
  if (props.taskType !== 'special') form.businessTypeName = order.businessType || ''
  if (!selectedProcess.value?.businessTypeCode) form.businessTypeCode = order.businessType || ''
  if (order.salesmanId && props.staff.some(item => item.id === order.salesmanId)) form.businessOwnerId = order.salesmanId
}

async function submit() {
  if (!await formRef.value?.validate()) return
  if (props.taskType === 'special' && !selectedProcess.value?.businessTypeCode) return ElMessage.warning('专项流程尚未配置专项类型编码')
  if (props.taskType === 'recurring' && form.startMonth > form.endMonth) return ElMessage.warning('服务结束月不能早于开始月')
  const payload: AuditTaskCreatePayload = {
    requestKey: form.requestKey,
    processId: Number(form.processId),
    orderId: form.orderId || undefined,
    orderNo: form.orderNo.trim() || undefined,
    companyName: form.companyName.trim(),
    businessTypeCode: selectedProcess.value?.businessTypeCode || undefined,
    businessTypeName: form.businessTypeName.trim() || undefined,
    businessOwnerId: Number(form.businessOwnerId),
    scopeType: form.scopeType,
    teamName: form.scopeType === 'team' ? form.teamName.trim() : undefined,
    region: form.region.trim() || undefined,
    amount: Number(form.amount || 0),
    expenseAmount: Number(form.expenseAmount || 0),
    startMonth: props.taskType === 'recurring' ? form.startMonth : undefined,
    endMonth: props.taskType === 'recurring' ? form.endMonth : undefined,
    servicePersonId: form.servicePersonId || undefined,
    remarks: form.remarks.trim() || undefined,
    finalConfirm: Number(form.finalConfirm || 0)
  }
  emit('create', payload)
}

function setSaving(value: boolean, close = false) {
  saving.value = value
  if (close) visible.value = false
}

function processLabel(item: AuditProcess) {
  const special = props.taskType === 'special' && item.businessTypeCode ? ` · ${item.businessTypeCode}` : ''
  return `${item.processName}${special}`
}

function orderLabel(item: TaskOrderOption) {
  return `${item.orderNo} · ${item.companyName}${item.businessType ? ` · ${item.businessType}` : ''}`
}

function staffLabel(item: StaffOption) {
  return `${item.name}${item.deptName ? ` · ${item.deptName}` : ''}`
}

defineExpose({ open, setSaving })
</script>

<style scoped>
.create-form { margin-top: 16px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.field-help { margin-top: 5px; color: #94a3b8; font-size: 12px; line-height: 1.4; }
.switch-help { margin-left: 10px; color: #64748b; font-size: 12px; }
.empty-action { margin: 4px 0 0; text-align: right; }
@media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } }
</style>
