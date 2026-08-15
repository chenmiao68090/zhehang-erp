<template>
  <el-dialog :model-value="modelValue" class="feige-order-dialog" width="min(980px, 94vw)" :title="order ? '修改订单' : '新增订单'" destroy-on-close @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="form-section-title"><span>1</span>客户信息</div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="客户名称" prop="companyName"><el-input v-model="form.companyName" placeholder="请输入客户或企业全称" maxlength="200" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="所在区域"><el-input v-model="form.region" placeholder="省 / 市 / 区" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="企业性质"><el-select v-model="form.enterpriseNature" clearable style="width:100%"><el-option label="小规模纳税人" value="小规模纳税人" /><el-option label="一般纳税人" value="一般纳税人" /><el-option label="个体工商户" value="个体工商户" /><el-option label="其他" value="其他" /></el-select></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="联系人"><el-input v-model="form.contacts" placeholder="客户联系人" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="联系电话"><el-input v-model="form.contactPhone" placeholder="手机号或企业电话" /></el-form-item></el-col>
        <el-col :xs="24" :sm="24" :lg="8"><el-form-item label="详细地址"><el-input v-model="form.address" placeholder="客户经营或联系地址" /></el-form-item></el-col>
      </el-row>

      <div class="form-section-title"><span>2</span>订单信息</div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="下单时间" prop="orderDate"><el-date-picker v-model="form.orderDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="业务人员"><el-select v-model="form.salesmanId" clearable style="width:100%"><el-option v-for="item in staff" :key="item.id" :label="`${item.name} · ${item.deptName || '未分组'}`" :value="item.id" /></el-select></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="所属团队"><el-input v-model="form.teamName" placeholder="随业务人员自动带出，也可补充" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="业务类型" prop="businessType"><el-select v-model="form.businessType" style="width:100%" @change="onBusinessTypeChange"><el-option v-for="item in selectableBusinessTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="客户来源"><el-select v-model="form.customerSource" clearable filterable allow-create style="width:100%"><el-option v-for="item in sourceOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="来源说明"><el-input v-model="form.sourceDetail" placeholder="活动、渠道或批次名称" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="交付方式"><el-select v-model="form.deliveryMethod" clearable style="width:100%"><el-option label="线上办理" value="online" /><el-option label="到店办理" value="onsite" /><el-option label="上门服务" value="door" /><el-option label="邮寄交付" value="mail" /></el-select></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="复购订单"><el-switch v-model="recurring" inline-prompt active-text="是" inactive-text="否" /></el-form-item></el-col>
      </el-row>

      <div class="form-section-title"><span>3</span>金额与收款</div>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="订单金额"><el-input-number v-model="form.orderAmount" :min="0" :precision="2" controls-position="right" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="合同金额" prop="contractAmount"><el-input-number v-model="form.contractAmount" :min="0" :precision="2" controls-position="right" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="成交金额"><el-input-number v-model="form.finalPaymentAmount" :min="0" :precision="2" controls-position="right" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="实收金额"><el-input-number v-model="form.receivedAmount" :min="0" :max="Number(form.contractAmount || 0)" :precision="2" controls-position="right" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="收款时间"><el-date-picker v-model="form.collectionTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="收款账户"><el-input v-model="form.collectionAccountNumber" placeholder="账户简称或尾号" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="收款凭证"><el-input v-model="form.voucher" placeholder="选择现有附件或填写本地演示说明" /></el-form-item></el-col>
      </el-row>

      <div class="form-section-title"><span>4</span>业务办理内容</div>
      <el-alert :title="form.businessType === 'seal' ? '刻章业务使用现有完整刻章提单，仍进入原刻章台账和办理流程，不重复生成通用订单。' : '业务字段随业务类型变化；通用订单仍使用订单管理台账。'" type="info" :closable="false" show-icon />
      <el-row :gutter="16" style="margin-top:14px">
        <template v-if="form.businessType === 'bookkeeping'">
          <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="服务年度"><el-input v-model="businessData.serviceYear" placeholder="例如 2026" /></el-form-item></el-col>
          <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="纳税区域"><el-input v-model="businessData.taxArea" placeholder="所属税务区域" /></el-form-item></el-col>
          <el-col :xs="24" :sm="12" :lg="8"><el-form-item label="资料是否齐全"><el-switch v-model="businessData.materialReady" /></el-form-item></el-col>
        </template>
        <template v-else-if="form.businessType === 'invoice'">
          <el-col :xs="24" :sm="12"><el-form-item label="开票项目"><el-input v-model="businessData.invoiceItem" /></el-form-item></el-col>
          <el-col :xs="24" :sm="12"><el-form-item label="开票金额"><el-input-number v-model="businessData.invoiceAmount" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
        </template>
        <template v-else>
          <el-col :span="24"><el-form-item label="办理要求"><el-input v-model="businessData.requirement" type="textarea" :rows="3" placeholder="填写该业务的具体办理内容、资料和交付要求" /></el-form-item></el-col>
        </template>
      </el-row>

      <div class="form-section-title"><span>5</span>合同与备注</div>
      <div class="contract-switch-row"><div><strong>同时建立代理记账合同</strong><p>仅写入独立合同台账</p></div><el-switch v-model="form.createContract" /></div>
      <el-row v-if="form.createContract" :gutter="16" style="margin-top:12px">
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="合同开始"><el-date-picker v-model="form.contractSignDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="合同截止"><el-date-picker v-model="form.contractExpireDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="付款周期"><el-select v-model="form.contractPayType" style="width:100%"><el-option label="月付" value="monthly" /><el-option label="季付" value="quarterly" /><el-option label="年付" value="annual" /><el-option label="一次性" value="once" /></el-select></el-form-item></el-col>
        <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="赠送月份"><el-input-number v-model="form.contractGiftMonth" :min="0" :max="36" style="width:100%" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="订单备注"><el-input v-model="form.remarks" type="textarea" :rows="4" maxlength="1000" show-word-limit placeholder="记录客户约定、特殊要求和交接事项" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="close">取消</el-button><el-button type="primary" :loading="saving" @click="submit">保存并提交审核</el-button></template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { FeigeOrder, FeigeOrderPayload, StaffOption } from '@/api/feige-order-contract'
import { businessTypes } from '../options'
import { feigeOrderData } from '../data-source'

const props = withDefaults(defineProps<{ modelValue: boolean; order?: FeigeOrder | null; staff: StaffOption[]; allowSeal?: boolean }>(), {
  allowSeal: false
})
interface SealOrderPrefill {
  regDate?: string
  companyName?: string
  phone?: string
  address?: string
  ownerName?: string
  perfDept?: string
}

const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: []; 'seal-requested': [prefill: SealOrderPrefill] }>()
const formRef = ref<FormInstance>()
const saving = ref(false)
const businessData = reactive<Record<string, any>>({})
const sourceOptions = ['新媒体', '客户转介绍', '线下活动', '渠道合作', '老客户复购', '自然到访', '合作伙伴', '其他']
const selectableBusinessTypes = computed(() => businessTypes.filter((item) => item.value !== 'seal' || props.allowSeal || props.order?.businessType === 'seal'))
const blank = (): FeigeOrderPayload => ({ orderDate: new Date().toLocaleDateString('sv-SE'), companyName: '', contacts: '', contactPhone: '', region: '', address: '', salesmanId: undefined, teamName: '', businessType: 'bookkeeping', customerSource: '', sourceDetail: '', opportunitySource: '', deliveryMethod: '', orderAmount: 0, contractAmount: 0, finalPaymentAmount: 0, receivedAmount: 0, collectionTime: '', collectionAccountNumber: '', recurring: 0, voucher: '', remarks: '', createContract: false, contractSignDate: '', contractExpireDate: '', contractPayType: 'annual', contractGiftMonth: 0, enterpriseNature: '' })
const form = reactive<FeigeOrderPayload>(blank())
const recurring = computed({ get: () => form.recurring === 1, set: (value: boolean) => { form.recurring = value ? 1 : 0 } })
const rules: FormRules = {
  companyName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  orderDate: [{ required: true, message: '请选择下单日期', trigger: 'change' }],
  businessType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  contractAmount: [{ validator: (_rule, _value, callback) => Number(form.receivedAmount || 0) > Number(form.contractAmount || 0) ? callback(new Error('实收金额不能超过合同金额')) : callback(), trigger: 'change' }]
}

watch(() => props.modelValue, (visible) => {
  if (!visible) return
  Object.assign(form, blank(), props.order ? { ...props.order, createContract: false } : {})
  Object.keys(businessData).forEach((key) => delete businessData[key])
  Object.assign(businessData, props.order?.businessData || {})
})
watch(() => form.salesmanId, (id) => { const selected = props.staff.find((item) => item.id === id); if (selected) form.teamName = selected.deptName || '' })

function close() { emit('update:modelValue', false) }
function requestSealOrder() {
  if (props.order?.id || form.businessType !== 'seal') return false
  if (!props.allowSeal) {
    ElMessage.error('当前角色未配置刻章提单权限，请联系管理员')
    return true
  }
  const selected = props.staff.find((item) => item.id === form.salesmanId)
  emit('seal-requested', {
    regDate: form.orderDate || undefined,
    companyName: form.companyName.trim() || undefined,
    phone: form.contactPhone?.trim() || undefined,
    address: form.address?.trim() || undefined,
    ownerName: selected?.name || undefined,
    perfDept: selected?.deptName || undefined
  })
  close()
  return true
}
function onBusinessTypeChange(value: string) {
  if (value === 'seal') requestSealOrder()
}
async function submit() {
  if (requestSealOrder()) return
  if (!(await formRef.value?.validate().catch(() => false))) return
  if (form.createContract && form.contractSignDate && form.contractExpireDate && form.contractExpireDate < form.contractSignDate) return ElMessage.warning('合同截止日期不能早于开始日期')
  saving.value = true
  try {
    const payload = { ...form, opportunitySource: form.customerSource, businessData: { ...businessData } }
    if (props.order?.id) await feigeOrderData.updateOrder(props.order.id, payload)
    else await feigeOrderData.createOrder(payload)
    ElMessage.success(props.order ? '订单已更新' : '订单已保存并进入财务审核')
    close(); emit('saved')
  } finally { saving.value = false }
}
</script>
