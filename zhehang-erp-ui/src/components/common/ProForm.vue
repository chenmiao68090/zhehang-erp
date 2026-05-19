<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    :inline="inline"
    :disabled="disabled"
  >
    <slot />
    <el-form-item v-if="showActions" class="form-actions">
      <el-button type="primary" @click="handleSubmit">
        {{ submitText || $t('common.confirm') }}
      </el-button>
      <el-button @click="handleReset">
        {{ resetText || $t('common.reset') }}
      </el-button>
      <slot name="actions" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  model: Record<string, any>
  rules?: FormRules
  labelWidth?: string
  inline?: boolean
  disabled?: boolean
  showActions?: boolean
  submitText?: string
  resetText?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '100px',
  inline: false,
  disabled: false,
  showActions: true
})

const emit = defineEmits(['submit', 'reset'])
const formRef = ref<FormInstance>()

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', props.model)
    }
  })
}

function handleReset() {
  formRef.value?.resetFields()
  emit('reset')
}

defineExpose({ formRef, validate: () => formRef.value?.validate() })
</script>

<style lang="scss" scoped>
.form-actions {
  margin-top: 24px;
}
</style>
