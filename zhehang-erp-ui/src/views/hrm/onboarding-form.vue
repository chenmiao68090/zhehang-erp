<template>
  <div class="onboarding-public">
    <div class="form-shell">
      <section class="form-hero">
        <div>
          <div class="eyebrow">ZHEHANG · 入职登记</div>
          <h1>{{ info.name || '候选人' }}，请完善入职信息</h1>
          <p>
            {{ info.positionName || '待入职岗位' }}
            <span v-if="info.tokenExpiresAt"> · 有效期至 {{ formatDateTime(info.tokenExpiresAt) }}</span>
          </p>
        </div>
        <el-tag :type="statusType(info.status)" size="large">{{ statusLabel(info.status) }}</el-tag>
      </section>

      <el-card shadow="never" class="form-card" v-loading="loading">
        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
          class="submit-alert"
        />
        <template v-else>
          <el-alert
            v-if="submitted"
            title="信息已提交，HR 确认后会继续发送 Offer。"
            type="success"
            show-icon
            :closable="false"
            class="submit-alert"
          />
          <el-form ref="formRef" :model="formModel" :rules="rules" label-position="top">
            <el-row :gutter="16">
              <el-col v-for="field in fields" :key="field.key" :span="field.type === 'textarea' ? 24 : 12">
                <el-form-item :label="field.label" :prop="field.key">
                  <el-input
                    v-if="field.type === 'textarea'"
                    v-model="formModel[field.key]"
                    type="textarea"
                    :rows="4"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                  />
                  <el-select
                    v-else-if="field.type === 'select'"
                    v-model="formModel[field.key]"
                    clearable
                    filterable
                    style="width: 100%"
                    :placeholder="field.placeholder || `请选择${field.label}`"
                  >
                    <el-option v-for="item in field.options || []" :key="item" :label="item" :value="item" />
                  </el-select>
                  <el-date-picker
                    v-else-if="field.type === 'date'"
                    v-model="formModel[field.key]"
                    type="date"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                    :placeholder="field.placeholder || `请选择${field.label}`"
                  />
                  <el-input
                    v-else
                    v-model="formModel[field.key]"
                    :placeholder="field.placeholder || `请输入${field.label}`"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="form-actions">
            <el-button type="primary" size="large" :loading="submitting" :disabled="closed" @click="submitForm">提交登记表</el-button>
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { onboardingApi } from '@/api/hrm'

type FormField = {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'date'
  required?: boolean
  placeholder?: string
  options?: string[]
}

const route = useRoute()
const token = String(route.params.token || '')
const loading = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const formRef = ref()
const info = reactive<any>({})
const formModel = reactive<Record<string, any>>({})
const fields = ref<FormField[]>([])

const rules = computed(() => {
  const result: Record<string, any[]> = {}
  fields.value.forEach((field) => {
    if (field.required) {
      result[field.key] = [{ required: true, message: `请填写${field.label}`, trigger: field.type === 'select' ? 'change' : 'blur' }]
    }
  })
  return result
})

const closed = computed(() => submitted.value || Number(info.status) >= 1)

function statusLabel(status: number) {
  return ({ 0: '待填写', 1: '已提交', 2: '已确认', 3: 'Offer已生成', 4: 'Offer已发送', 5: '员工草稿', 6: '已入职', 7: '已取消' } as any)[Number(status)] || '待填写'
}

function statusType(status: number) {
  return ({ 0: 'warning', 1: 'primary', 2: 'success', 3: 'success', 4: 'success', 5: 'success', 6: 'success', 7: 'danger' } as any)[Number(status)] || 'warning'
}

function parseJson<T>(value: any, fallback: T): T {
  if (!value) return fallback
  if (typeof value === 'object') return value as T
  try {
    return JSON.parse(value)
  } catch (_error) {
    return fallback
  }
}

function fillDefaults() {
  fields.value.forEach((field) => {
    if (formModel[field.key] === undefined) {
      formModel[field.key] = ''
    }
  })
  if (!formModel.name && info.name) formModel.name = info.name
  if (!formModel.phone && info.phone) formModel.phone = info.phone
  if (!formModel.email && info.email) formModel.email = info.email
}

function readPublicError(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

async function loadInfo() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res: any = await onboardingApi.publicInfo(token)
    Object.assign(info, res.data || {})
    fields.value = parseJson<FormField[]>(info.formSchema, [])
    Object.assign(formModel, parseJson<Record<string, any>>(info.formData, {}))
    fillDefaults()
    submitted.value = Number(info.status) >= 1
  } catch (error: any) {
    errorMessage.value = readPublicError(error, '登记链接无效或已过期，请联系 HR 重新发送。')
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    await onboardingApi.publicSubmit(token, { formData: formModel })
    submitted.value = true
    info.status = 1
    ElMessage.success('登记表已提交')
  } catch (error: any) {
    const message = readPublicError(error, '提交失败，请联系 HR 处理。')
    errorMessage.value = message
    ElMessage.error(message)
  } finally {
    submitting.value = false
  }
}

onMounted(loadInfo)
</script>

<style scoped>
.onboarding-public {
  min-height: 100vh;
  padding: 32px 16px;
  background: #f6f7fb;
}

.form-shell {
  max-width: 980px;
  margin: 0 auto;
}

.form-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 28px;
  margin-bottom: 16px;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb 0%, #7aa7ff 100%);
}

.eyebrow {
  display: inline-flex;
  padding: 3px 10px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
}

.form-hero h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.form-hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
}

.form-card {
  border-radius: 8px;
}

.submit-alert {
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

@media (max-width: 768px) {
  .form-hero {
    flex-direction: column;
  }
}
</style>
