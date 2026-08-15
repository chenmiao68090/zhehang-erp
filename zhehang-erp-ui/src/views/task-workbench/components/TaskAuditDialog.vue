<template>
  <el-dialog v-model="visible" title="审核任务" width="min(1000px, 96vw)" top="4vh" destroy-on-close append-to-body :close-on-click-modal="false">
    <div v-loading="loading" class="audit-dialog-body">
      <section class="audit-section">
        <h3>任务信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公司名称">{{ info.companyName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="业务类型">{{ info.businessTypeName || info.businessType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ info.orderNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="任务类型"><el-tag :type="taskTypeTag">{{ taskTypeText }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ info.orderCreateTime || info.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="业务人员">{{ info.salesman || info.salesmanName || info.salesName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="订单金额"><strong class="amount primary">{{ money(info.contractAmount ?? info.amount) }}</strong></el-descriptions-item>
          <el-descriptions-item label="当前步骤">{{ info.stepName || '-' }}<span v-if="info.stepNo">（第 {{ info.stepNo }}/{{ info.stepCount || '-' }} 步）</span></el-descriptions-item>
          <el-descriptions-item label="服务人员">{{ info.servicePersonName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属团队">{{ info.teamName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="费用金额"><strong class="amount warning">{{ money(info.expenseAmount) }}</strong></el-descriptions-item>
          <el-descriptions-item v-if="info.startMonth || info.endMonth" label="服务周期">{{ info.startMonth || '-' }} 至 {{ info.endMonth || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-alert v-if="isFinalConfirm" class="audit-alert" type="warning" show-icon :closable="false" title="最终确认步骤" description="必须由订单业务人员本人确认，系统不会绕过本人权限。" />

        <div v-if="parallelTasks.length > 1" class="parallel-block">
          <div class="minor-title">选择审核角色</div>
          <el-radio-group v-model="form.selectedTaskId" class="parallel-grid">
            <el-radio v-for="item in parallelTasks" :key="item.id" :value="String(item.id)" border>
              <span>{{ item.roleName || '-' }}</span><small>{{ item.assignedUserName ? ` · ${item.assignedUserName}` : '' }}</small>
            </el-radio>
          </el-radio-group>
        </div>
      </section>

      <section class="audit-section">
        <h3>审核表单</h3>
        <el-form label-position="top">
          <div v-if="dynamicFields.length" class="dynamic-grid">
            <el-form-item v-for="field in dynamicFields" :key="field.key" :label="field.label" :required="field.required">
              <el-input v-if="field.type === 'textarea'" v-model="form.dynamicData[field.key]" type="textarea" :rows="3" :placeholder="field.placeholder || `请输入${field.label}`" />
              <el-input-number v-else-if="field.type === 'number'" v-model="form.dynamicData[field.key]" :min="field.min ?? 0" :precision="field.precision ?? 0" controls-position="right" style="width:100%" />
              <el-select v-else-if="field.type === 'select'" v-model="form.dynamicData[field.key]" clearable filterable style="width:100%"><el-option v-for="option in field.options || []" :key="option.value ?? option" :label="option.label ?? option" :value="option.value ?? option" /></el-select>
              <el-date-picker v-else-if="field.type === 'date' || field.type === 'datetime'" v-model="form.dynamicData[field.key]" :type="field.type === 'datetime' ? 'datetime' : 'date'" :value-format="field.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'" style="width:100%" />
              <el-switch v-else-if="field.type === 'switch'" v-model="form.dynamicData[field.key]" />
              <el-input v-else v-model="form.dynamicData[field.key]" :placeholder="field.placeholder || `请输入${field.label}`" />
            </el-form-item>
          </div>

          <div v-if="hasNextAuditor" class="indicator-card">
            <div class="minor-title">下个流程审批人员</div>
            <el-select v-model="form.nextAuditorId" clearable filterable placeholder="请选择下个审批人员" style="width:100%">
              <el-option v-for="item in staff" :key="staffId(item)" :label="staffName(item)" :value="staffId(item)" />
            </el-select>
          </div>

          <div v-if="hasCostInput" class="indicator-card">
            <div class="minor-title row-between"><span>成本填写</span><el-button type="primary" plain size="small" @click="addCost">添加报销项</el-button></div>
            <div v-for="(item, index) in form.costItems" :key="index" class="cost-row">
              <el-input v-model="item.expenseName" placeholder="报销名称" />
              <el-input v-model="item.categoryName" placeholder="报销类目" />
              <el-input-number v-model="item.amount" :min="0" :precision="2" controls-position="right" placeholder="金额" />
              <el-input v-model="item.remark" placeholder="备注" />
              <el-button type="danger" link @click="form.costItems.splice(index, 1)">删除</el-button>
            </div>
          </div>

          <div v-if="showContractConversion || showAddressConversion" class="indicator-card conversion-grid">
            <el-form-item v-if="showContractConversion" label="流程完成后转为合同"><el-switch v-model="form.convertContract" inline-prompt active-text="是" inactive-text="否" /></el-form-item>
            <el-form-item v-if="showAddressConversion" label="流程完成后转为地址"><el-switch v-model="form.convertAddress" inline-prompt active-text="是" inactive-text="否" /></el-form-item>
          </div>

          <el-empty v-if="!dynamicFields.length && !hasVisibleIndicators" :image-size="60" description="此步骤无需填写附加表单，可直接审核" />
        </el-form>
      </section>

      <section class="audit-section">
        <h3>审核操作</h3>
        <el-alert v-if="info.auditAllowed === false" type="warning" show-icon :closable="false" title="当前账号没有该步骤审核权限" />
        <el-form v-else label-position="top">
          <el-form-item label="审核结果" required><el-radio-group v-model="form.result"><el-radio-button value="approved">审核通过</el-radio-button><el-radio-button value="rejected">审核驳回</el-radio-button></el-radio-group></el-form-item>
          <el-form-item v-if="form.result === 'rejected'" label="驳回原因" required><el-input v-model="form.rejectReason" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="请明确写出需要补充或修改的内容" /></el-form-item>
          <el-form-item label="审核备注"><el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="选填，记录本次审核依据" /></el-form-item>
        </el-form>
      </section>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button v-if="info.auditAllowed !== false" :type="form.result === 'rejected' ? 'danger' : 'primary'" :loading="submitting" @click="submit">{{ form.result === 'rejected' ? '确认驳回' : '确认通过' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FeigeTaskCapabilities } from '@/api/feige-task'

const props = withDefaults(defineProps<{
  modelValue: boolean
  task?: any
  detail?: any
  staff?: any[]
  capabilities?: FeigeTaskCapabilities
  loading?: boolean
  submitting?: boolean
}>(), {
  task: () => ({}),
  detail: () => ({}),
  staff: () => [],
  capabilities: () => ({
    manager: false,
    bridgeManage: false,
    bridgeTriggerSupported: false,
    contractConversionSupported: false,
    addressConversionSupported: false
  }),
  loading: false,
  submitting: false
})
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'submit', payload: Record<string, any>): void
}>()
const visible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const info = computed(() => ({ ...(props.task || {}), ...(props.detail?.task || props.detail || {}) }))
const parallelTasks = computed<any[]>(() => props.detail?.parallelTasks || info.value.parallelTasks || [])
const indicators = computed<any[]>(() => props.detail?.indicators || info.value.indicators || [])
const selectedParallel = computed(() => parallelTasks.value.find((item) => String(item.id) === form.selectedTaskId))
const isFinalConfirm = computed(() => Boolean(selectedParallel.value?.isFinalConfirm ?? info.value.isFinalConfirm))
const hasNextAuditor = computed(() => indicators.value.some((item) => item.indicatorType === 'next_auditor'))
const hasCostInput = computed(() => indicators.value.some((item) => item.indicatorType === 'cost_input'))
const hasConvertContract = computed(() => indicators.value.some((item) => item.indicatorType === 'convert_contract'))
const hasConvertAddress = computed(() => indicators.value.some((item) => item.indicatorType === 'convert_address'))
const contractConversionSupported = computed(() => props.capabilities.contractConversionSupported)
const addressConversionSupported = computed(() => props.capabilities.addressConversionSupported)
const showContractConversion = computed(() => hasConvertContract.value && contractConversionSupported.value)
const showAddressConversion = computed(() => hasConvertAddress.value && addressConversionSupported.value)
const hasVisibleIndicators = computed(() => hasNextAuditor.value || hasCostInput.value || showContractConversion.value || showAddressConversion.value)

const dynamicFields = computed<any[]>(() => {
  const source = props.detail?.formFields ?? props.detail?.formConfig?.fields ?? info.value.formFields ?? info.value.fields ?? []
  if (Array.isArray(source)) return source.map(normalizeField)
  if (typeof source === 'string') {
    try {
      const parsed = JSON.parse(source)
      return (Array.isArray(parsed) ? parsed : parsed?.fields || []).map(normalizeField)
    } catch { return [] }
  }
  return []
})

const form = reactive({
  selectedTaskId: '', result: 'approved', rejectReason: '', remark: '', nextAuditorId: undefined as any,
  dynamicData: {} as Record<string, any>, costItems: [] as Array<Record<string, any>>, convertContract: false, convertAddress: false
})

watch(() => props.modelValue, (open) => {
  if (!open) return
  const first = parallelTasks.value[0]
  form.selectedTaskId = String(first?.id ?? info.value.id ?? '')
  form.result = 'approved'; form.rejectReason = ''; form.remark = ''; form.nextAuditorId = undefined
  form.dynamicData = {}; form.costItems = []; form.convertContract = false; form.convertAddress = false
  for (const field of dynamicFields.value) {
    form.dynamicData[field.key] = info.value.formValues?.[field.key] ?? field.defaultValue ?? field.value ?? ''
  }
  if (hasCostInput.value) addCost()
})

function normalizeField(field: any, index: number) {
  return {
    ...field,
    key: field.key || field.code || field.field || `field_${index}`,
    label: field.label || field.title || field.name || `字段${index + 1}`,
    type: ({ text: 'input' } as Record<string, string>)[field.fieldType] || field.type || field.fieldType || field.componentType || 'input'
  }
}
function addCost() { form.costItems.push({ expenseName: '', categoryName: '', amount: 0, remark: '' }) }
function staffId(item: any) { return item.id ?? item.userId ?? item.value }
function staffName(item: any) { return item.name ?? item.realName ?? item.userName ?? item.label }
function money(value: any) { return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
const taskTypeText = computed(() => ({ once: '一次性任务', recurring: '周期任务', project_dept: '项目部门任务', special: '专项任务' } as Record<string, string>)[info.value.taskType] || info.value.taskTypeName || '-')
const taskTypeTag = computed(() => ({ once: 'primary', recurring: 'success', project_dept: 'warning', special: 'danger' } as Record<string, any>)[info.value.taskType] || 'info')

function submit() {
  if (form.result === 'rejected' && !form.rejectReason.trim()) return ElMessage.warning('请填写驳回原因')
  if (form.result === 'approved') {
    for (const field of dynamicFields.value) {
      if (field.required && (form.dynamicData[field.key] === '' || form.dynamicData[field.key] == null)) return ElMessage.warning(`请填写${field.label}`)
    }
    if (hasNextAuditor.value && !form.nextAuditorId && !isFinalConfirm.value) return ElMessage.warning('请选择下个审批人员')
    if (hasCostInput.value && form.costItems.some((item) => !item.expenseName || Number(item.amount) <= 0)) return ElMessage.warning('请完整填写报销名称和金额')
  }
  const formData = Object.fromEntries(Object.entries(form.dynamicData)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined))
  emit('submit', {
    taskId: form.selectedTaskId || info.value.id,
    result: form.result,
    remark: form.remark.trim() || undefined,
    rejectReason: form.result === 'rejected' ? form.rejectReason.trim() : undefined,
    nextAuditorId: form.result === 'approved' ? form.nextAuditorId : undefined,
    formData,
    costItems: form.result === 'approved' && hasCostInput.value ? form.costItems.map((item) => ({ ...item })) : undefined,
    convertContract: form.result === 'approved' && showContractConversion.value ? form.convertContract : undefined,
    convertAddress: form.result === 'approved' && showAddressConversion.value ? form.convertAddress : undefined
  })
}
</script>
