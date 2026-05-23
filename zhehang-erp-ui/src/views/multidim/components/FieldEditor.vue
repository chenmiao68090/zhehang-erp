<template>
  <el-input v-if="field.type === 'text'" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
  <el-input-number
    v-else-if="field.type === 'number'"
    :model-value="modelValue"
    :precision="field.config?.precision ?? 2"
    @update:model-value="$emit('update:modelValue', $event)"
    style="width: 100%"
  />
  <el-date-picker
    v-else-if="field.type === 'date'"
    :model-value="modelValue"
    type="date"
    value-format="YYYY-MM-DD"
    style="width: 100%"
    @update:model-value="$emit('update:modelValue', $event)"
  />
  <el-select
    v-else-if="field.type === 'select'"
    :model-value="modelValue"
    clearable
    style="width: 100%"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-option v-for="o in (field.config?.options || [])" :key="o" :label="o" :value="o" />
  </el-select>
  <el-select
    v-else-if="field.type === 'multiselect'"
    :model-value="modelValue || []"
    multiple
    clearable
    style="width: 100%"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-option v-for="o in (field.config?.options || [])" :key="o" :label="o" :value="o" />
  </el-select>
  <el-input
    v-else-if="field.type === 'user'"
    :model-value="modelValue"
    placeholder="请输入人员姓名"
    @update:model-value="$emit('update:modelValue', $event)"
  />
  <el-input v-else :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import type { FieldDef } from '@/api/multidim'
defineProps<{ modelValue: any; field: FieldDef }>()
defineEmits<{ (e: 'update:modelValue', v: any): void }>()
</script>
