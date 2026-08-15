<template>
  <!-- 审批动态表单字段渲染:按 formConfig 逐类型渲染成真实 Element Plus 控件。
       readonly=true 时用于设计器"预览"/审批只读展示;可编辑时用于发起填写。 -->
  <div class="approval-form-fields">
    <template v-for="field in parsedFields" :key="field.field">
      <el-alert
        v-if="field.type === 'description'"
        :title="field.label"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 14px"
      />
      <el-form-item v-else :label="field.label" :required="field.required">
        <el-input v-if="field.type === 'text'" v-model="model[field.field]" :disabled="readonly" />
        <el-input v-else-if="field.type === 'textarea'" v-model="model[field.field]" type="textarea" :rows="3" :disabled="readonly" />
        <el-input-number v-else-if="field.type === 'number'" v-model="model[field.field]" :min="0" :disabled="readonly" style="width: 100%" />
        <el-input-number v-else-if="field.type === 'amount'" v-model="model[field.field]" :min="0" :precision="2" :step="100" controls-position="right" placeholder="0.00" :disabled="readonly" style="width: 100%" />
        <el-date-picker v-else-if="field.type === 'date'" v-model="model[field.field]" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" :disabled="readonly" style="width: 100%" />
        <el-date-picker v-else-if="field.type === 'datetime'" v-model="model[field.field]" type="datetime" value-format="YYYY-MM-DD HH:mm" placeholder="请选择时间" :disabled="readonly" style="width: 100%" />
        <el-date-picker v-else-if="field.type === 'daterange'" v-model="model[field.field]" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" :disabled="readonly" style="width: 100%" />
        <el-select v-else-if="field.type === 'select'" v-model="model[field.field]" :disabled="readonly" style="width: 100%" placeholder="请选择">
          <el-option v-for="opt in (field.options || [])" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-else-if="field.type === 'multiselect'" v-model="model[field.field]" multiple filterable collapse-tags :disabled="readonly" style="width: 100%" placeholder="可多选">
          <el-option v-for="opt in (field.options || [])" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <div v-else-if="field.type === 'attachment'" class="aff-attach-hint">
          <el-icon><Paperclip /></el-icon><span>附件上传</span>
        </div>
        <el-input v-else v-model="model[field.field]" :disabled="readonly" />
      </el-form-item>
    </template>
    <el-empty v-if="!parsedFields.length" description="该流程暂无表单字段" :image-size="60" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Paperclip } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  /** 表单配置:JSON 字符串或已解析数组 */
  formConfig?: string | any[]
  /** v-model 值容器 */
  modelValue?: Record<string, any>
  readonly?: boolean
}>(), {
  formConfig: '',
  modelValue: () => ({}),
  readonly: false
})

const model = computed(() => props.modelValue || {})

const parsedFields = computed<any[]>(() => {
  const raw = props.formConfig
  if (Array.isArray(raw)) return raw
  try {
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
})
</script>

<style scoped>
.aff-attach-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
