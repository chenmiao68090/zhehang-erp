<template>
  <el-dialog
    v-model="visible"
    title="手工补发业务任务"
    width="min(620px, 94vw)"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-alert
      title="补充未命中自动规则或生成失败的业务任务"
      description="如任务来自订单，请选择关联订单以带入订单编号和负责人；本操作不会修改订单本身。"
      type="info"
      show-icon
      :closable="false"
    />
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="create-form">
      <el-form-item label="关联订单">
        <el-select v-model="form.orderId" filterable clearable placeholder="选填；选择后自动带入公司、订单号和负责人" style="width:100%" @change="handleOrderChange">
          <el-option v-for="item in orders" :key="item.id" :label="orderLabel(item)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="公司名称" prop="companyName">
        <el-input v-model="form.companyName" maxlength="200" show-word-limit placeholder="请输入公司名称" />
      </el-form-item>
      <el-form-item label="订单编号">
        <el-input v-model="form.orderNo" maxlength="64" placeholder="选填，例如订单编号" />
      </el-form-item>
      <el-form-item label="业务负责人" prop="businessOwnerId">
        <el-select v-model="form.businessOwnerId" filterable placeholder="请选择任务责任人" style="width:100%">
          <el-option v-for="item in staff" :key="item.id" :label="staffLabel(item)" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="补发说明">
        <el-input v-model="form.remarks" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="说明补发原因或交付要求" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible=false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">创建任务</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { BusinessTaskCreatePayload, StaffOption, TaskOrderOption } from '@/api/feige-task'
import { createTaskRequestKey } from '../request-key'

const props = defineProps<{ staff: StaffOption[]; orders: TaskOrderOption[] }>()
const emit = defineEmits<{ (event: 'create', payload: BusinessTaskCreatePayload): void }>()
const visible = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<BusinessTaskCreatePayload>({ requestKey: '', orderId: undefined, companyName: '', orderNo: '', businessOwnerId: undefined, remarks: '' })
const rules: FormRules = {
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  businessOwnerId: [{ required: true, message: '请选择业务负责人', trigger: 'change' }]
}

function open() {
  Object.assign(form, { requestKey: createTaskRequestKey(), orderId: undefined, companyName: '', orderNo: '', businessOwnerId: undefined, remarks: '' })
  visible.value = true
}

function handleOrderChange(id?: number) {
  const order = props.orders.find(item => item.id === Number(id))
  if (!order) return
  form.companyName = order.companyName
  form.orderNo = order.orderNo
  if (order.salesmanId && props.staff.some(item => item.id === order.salesmanId)) form.businessOwnerId = order.salesmanId
}

async function submit() {
  if (!await formRef.value?.validate()) return
  emit('create', {
    requestKey: form.requestKey,
    orderId: form.orderId || undefined,
    companyName: form.companyName.trim(),
    orderNo: form.orderNo?.trim() || undefined,
    businessOwnerId: form.businessOwnerId,
    remarks: form.remarks?.trim() || undefined
  })
}

function orderLabel(item: TaskOrderOption) {
  return `${item.orderNo} · ${item.companyName}`
}

function setSaving(value: boolean, close = false) {
  saving.value = value
  if (close) visible.value = false
}

function staffLabel(item: StaffOption) {
  return `${item.name}${item.deptName ? ` · ${item.deptName}` : ''}`
}

defineExpose({ open, setSaving })
</script>

<style scoped>
.create-form { margin-top: 16px; }
</style>
