<template>
  <el-dialog
    v-model="open"
    :title="record ? `编辑${page.title}` : page.primaryLabel"
    width="min(820px, 94vw)"
    append-to-body
    destroy-on-close
    class="suite-form-dialog"
    @closed="reset"
  >
    <div class="dialog-lead">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ page.description }}</span>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="suite-form">
      <div class="form-grid">
        <el-form-item v-if="canManage" label="负责人" prop="ownerId">
          <el-select v-model="form.ownerId" filterable placeholder="请选择负责人" style="width: 100%">
            <el-option v-for="staff in staffOptions" :key="staff.id" :label="`${staff.name} · ${staff.deptName || '未分部门'}`" :value="staff.id" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="item in page.fields"
          :key="item.key"
          :label="item.label"
          :prop="`data.${item.key}`"
          :class="{ 'span-2': item.span === 2 || item.type === 'textarea' }"
        >
          <el-input
            v-if="!item.type || item.type === 'text'"
            v-model="form.data[item.key]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            clearable
          />
          <el-input
            v-else-if="item.type === 'textarea'"
            v-model="form.data[item.key]"
            type="textarea"
            :rows="4"
            maxlength="1000"
            show-word-limit
            :placeholder="item.placeholder || `请输入${item.label}`"
          />
          <el-input-number
            v-else-if="item.type === 'number' || item.type === 'money' || item.type === 'rate'"
            v-model="form.data[item.key]"
            :min="item.min ?? 0"
            :max="item.max ?? (item.type === 'rate' ? 100 : 99999999)"
            :precision="item.type === 'money' ? 2 : 0"
            controls-position="right"
            style="width: 100%"
          />
          <el-select v-else-if="item.type === 'select'" v-model="form.data[item.key]" filterable clearable :placeholder="`请选择${item.label}`" style="width: 100%">
            <el-option v-for="choice in item.options || []" :key="String(choice.value)" :label="choice.label" :value="choice.value" />
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="form.data[item.key]"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="`请选择${item.label}`"
            style="width: 100%"
          />
          <el-date-picker
            v-else-if="item.type === 'datetime'"
            v-model="form.data[item.key]"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :placeholder="`请选择${item.label}`"
            style="width: 100%"
          />
          <el-date-picker
            v-else-if="item.type === 'month'"
            v-model="form.data[item.key]"
            type="month"
            value-format="YYYY-MM"
            :placeholder="`请选择${item.label}`"
            style="width: 100%"
          />
          <el-switch v-else-if="item.type === 'switch'" v-model="form.data[item.key]" />
          <el-rate v-else-if="item.type === 'rate'" v-model="form.data[item.key]" show-score />
          <span v-if="item.unit" class="field-unit">{{ item.unit }}</span>
        </el-form-item>
        <el-form-item label="附件资料" class="span-2">
          <el-upload v-model:file-list="files" action="#" :auto-upload="false" multiple :limit="8" class="suite-upload">
            <el-button :icon="Upload">选择附件</el-button>
            <template #tip>
              <div class="el-upload__tip">最多8个，单个不超过20MB；正式环境上传到浙杭受控文件服务，本地预览仅记录文件名。</div>
            </template>
          </el-upload>
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules, type UploadUserFile } from 'element-plus'
import { InfoFilled, Upload } from '@element-plus/icons-vue'
import type { FeigeSuiteRecord, FeigeSuiteRecordPayload, FeigeSuiteStaffOption } from '@/api/feige-suite'
import { fileInfoApi } from '@/api/file'
import type { FeigeSuitePageConfig } from '../types'

const props = defineProps<{
  modelValue: boolean
  page: FeigeSuitePageConfig
  record?: FeigeSuiteRecord | null
  staffOptions: FeigeSuiteStaffOption[]
  canManage: boolean
  preview: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [payload: FeigeSuiteRecordPayload, done: (success: boolean, message?: string) => void]
}>()

const open = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const formRef = ref<FormInstance>()
const saving = ref(false)
const files = ref<UploadUserFile[]>([])
const form = ref<{ ownerId?: number; status?: string; data: Record<string, any> }>({ data: {} })

const rules = computed<FormRules>(() => {
  const result: FormRules = {}
  for (const item of props.page.fields) {
    if (item.required) result[`data.${item.key}`] = [{ required: true, message: `请填写${item.label}`, trigger: item.type === 'select' ? 'change' : 'blur' }]
  }
  if (props.canManage) result.ownerId = [{ required: true, message: '请选择负责人', trigger: 'change' }]
  return result
})

function initialData(): Record<string, any> {
  const result: Record<string, any> = {}
  for (const item of props.page.fields) {
    result[item.key] = item.type === 'switch' ? true : item.type === 'number' || item.type === 'money' || item.type === 'rate' ? 0 : ''
  }
  return result
}

function hydrate(): void {
  const record = props.record
  form.value = {
    ownerId: record?.ownerId || props.staffOptions[0]?.id,
    status: record?.status,
    data: { ...initialData(), ...(record?.data || {}) }
  }
  files.value = Array.isArray(record?.data?.attachments)
    ? record!.data.attachments.map((attachment: string | { id?: number; name?: string }, index: number) => ({
        name: typeof attachment === 'string' ? attachment : attachment.name || `附件${index + 1}`,
        uid: index + 1,
        status: 'success',
        response: typeof attachment === 'string' ? { name: attachment } : attachment
      }))
    : []
  nextTick(() => formRef.value?.clearValidate())
}

watch(() => [props.modelValue, props.record?.id, props.page.code], () => { if (props.modelValue) hydrate() }, { immediate: true })

async function submit(): Promise<void> {
  if (!await formRef.value?.validate().catch(() => false)) return
  saving.value = true
  try {
    const attachments = await persistAttachments()
    const data = { ...form.value.data, attachments }
    const titleField = props.page.fields.find((item) => item.key === 'title') || props.page.fields[0]
    const title = String(data.title || data[titleField?.key] || props.page.title).trim()
    const result = await new Promise<{ success: boolean; message?: string }>((resolve) => {
      emit('save', {
        title,
        categoryCode: String(data.category || data.templateType || '').trim() || undefined,
        ownerId: form.value.ownerId,
        status: form.value.status,
        amount: Number(data.amount || data.actual || data.netSalary || data.commission || 0),
        bizDate: data.bizDate || data.expenseDate || data.examDate,
        dueDate: data.dueDate || data.endDate,
        data
      }, (success, message) => resolve({ success, message }))
    })
    if (!result.success) throw new Error(result.message || '保存失败')
    open.value = false
  } catch (error: any) {
    ElMessage.error(error?.message || '表单保存失败')
  } finally {
    saving.value = false
  }
}

async function persistAttachments(): Promise<Array<{ id?: number; name: string; size?: number }>> {
  const result: Array<{ id?: number; name: string; size?: number }> = []
  for (const item of files.value) {
    const raw = item.raw as File | undefined
    const existing = item.response as { id?: number; name?: string; size?: number } | undefined
    if (!raw) {
      result.push({ id: existing?.id, name: existing?.name || item.name, size: existing?.size || item.size })
      continue
    }
    if (raw.size > 20 * 1024 * 1024) throw new Error(`附件“${raw.name}”超过20MB`)
    if (props.preview) {
      result.push({ name: raw.name, size: raw.size })
      continue
    }
    const response: any = await fileInfoApi.upload(raw, undefined, { silentError: true })
    const info = response?.data || response
    if (!info?.id) throw new Error(`附件“${raw.name}”上传失败`)
    result.push({ id: Number(info.id), name: info.name || info.originalName || raw.name, size: raw.size })
  }
  return result
}

function reset(): void {
  formRef.value?.resetFields()
  files.value = []
}
</script>

<style scoped>
.dialog-lead { display: flex; align-items: flex-start; gap: 8px; padding: 11px 14px; margin-bottom: 18px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; line-height: 22px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 18px; }
.span-2 { grid-column: 1 / -1; }
.field-unit { margin-left: 8px; color: #64748b; font-size: 14px; }
.suite-upload { width: 100%; }
:deep(.el-form-item__label) { font-size: 15px; font-weight: 600; color: #334155; }
:deep(.el-input__wrapper), :deep(.el-select__wrapper) { min-height: 42px; }
@media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } }
</style>
