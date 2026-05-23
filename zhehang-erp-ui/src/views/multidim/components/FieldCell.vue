<template>
  <div class="field-cell" :class="`cell-${field.type}`">
    <!-- 文本 -->
    <span v-if="field.type === 'text'" class="cell-text">{{ value || '-' }}</span>
    <!-- 数字 -->
    <span v-else-if="field.type === 'number'" class="cell-number">{{ formatNumber(value) }}</span>
    <!-- 日期 -->
    <span v-else-if="field.type === 'date'" class="cell-date">
      <el-icon v-if="value"><Calendar /></el-icon>
      {{ value || '-' }}
    </span>
    <!-- 单选 -->
    <el-tag
      v-else-if="field.type === 'select' && value"
      :type="getTagType(value)"
      size="small"
      effect="light"
    >{{ value }}</el-tag>
    <span v-else-if="field.type === 'select'" class="cell-empty">-</span>
    <!-- 多选 -->
    <div v-else-if="field.type === 'multiselect'" class="cell-multiselect">
      <el-tag v-for="v in (Array.isArray(value) ? value : [])" :key="v" size="small" type="info" effect="light" style="margin-right:4px;">{{ v }}</el-tag>
      <span v-if="!value || (Array.isArray(value) && value.length === 0)" class="cell-empty">-</span>
    </div>
    <!-- 人员 -->
    <div v-else-if="field.type === 'user'" class="cell-user">
      <el-avatar v-if="value" :size="22" style="background:#F26522;font-size:11px;">{{ String(value).slice(0,1) }}</el-avatar>
      <span>{{ value || '-' }}</span>
    </div>
    <!-- 附件 -->
    <span v-else-if="field.type === 'attachment'" class="cell-empty">
      <el-icon><Paperclip /></el-icon> {{ value ? '已附件' : '-' }}
    </span>
    <!-- 关联 -->
    <span v-else-if="field.type === 'link'" class="cell-link">{{ value || '-' }}</span>
    <!-- 公式 -->
    <span v-else-if="field.type === 'formula'" class="cell-formula">{{ value || '-' }}</span>
    <!-- 默认 -->
    <span v-else>{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Paperclip } from '@element-plus/icons-vue'
import type { FieldDef } from '@/api/multidim'

const props = defineProps<{
  field: FieldDef
  value: any
}>()

function formatNumber(v: any): string {
  if (v == null || v === '') return '-'
  const n = Number(v)
  if (isNaN(n)) return String(v)
  const precision = props.field.config?.precision ?? 2
  return n.toFixed(precision)
}

function getTagType(value: string): any {
  const colors: any = ['primary', 'success', 'warning', 'info', 'danger']
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return colors[hash % colors.length]
}
</script>

<style scoped>
.field-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  min-height: 22px;
}
.cell-empty { color: var(--el-text-color-placeholder); }
.cell-number { font-variant-numeric: tabular-nums; }
.cell-user { gap: 6px; }
.cell-multiselect { flex-wrap: wrap; }
.cell-link { color: #F26522; cursor: pointer; }
.cell-formula { color: var(--el-color-primary); font-style: italic; }
</style>
