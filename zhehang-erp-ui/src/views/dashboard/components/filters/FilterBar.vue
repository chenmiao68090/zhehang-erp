<template>
  <div class="filter-bar">
    <div class="filter-bar__inner">
      <!-- 日期范围选择器 -->
      <div class="filter-item">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
      </div>

      <!-- 部门下拉选择器 -->
      <div class="filter-item">
        <el-select
          v-model="department"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择部门"
          @change="handleDepartmentChange"
        >
          <el-option
            v-for="opt in departmentOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>

      <!-- 搜索输入框 -->
      <div class="filter-item">
        <el-input
          v-model="keyword"
          placeholder="搜索关键词"
          :prefix-icon="Search"
          clearable
          @input="handleKeywordChange"
        />
      </div>

      <!-- 重置按钮 -->
      <div class="filter-item">
        <el-button class="reset-btn" @click="handleReset">
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { WidgetConfig, FilterCondition } from '@/views/dashboard/types/dashboard'

interface Props {
  config: WidgetConfig
  filters: FilterCondition[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:filters': [filters: FilterCondition[]]
}>()

const dateRange = ref<[string, string] | null>(null)
const department = ref<string[]>([])
const keyword = ref('')

const departmentOptions = [
  { label: '销售部', value: 'sales' },
  { label: '市场部', value: 'marketing' },
  { label: '技术部', value: 'tech' },
  { label: '财务部', value: 'finance' },
  { label: '人事部', value: 'hr' },
]

function buildFilters(): FilterCondition[] {
  const conditions: FilterCondition[] = []
  if (dateRange.value) {
    conditions.push({
      field: 'date',
      operator: 'between',
      value: dateRange.value,
    })
  }
  if (department.value.length > 0) {
    conditions.push({
      field: 'department',
      operator: 'in',
      value: department.value,
    })
  }
  if (keyword.value.trim()) {
    conditions.push({
      field: 'keyword',
      operator: 'like',
      value: keyword.value.trim(),
    })
  }
  return conditions
}

function handleDateChange() {
  emit('update:filters', buildFilters())
}

function handleDepartmentChange() {
  emit('update:filters', buildFilters())
}

function handleKeywordChange() {
  emit('update:filters', buildFilters())
}

function handleReset() {
  dateRange.value = null
  department.value = []
  keyword.value = ''
  emit('update:filters', [])
}

// 初始化时同步外部filters
watch(
  () => props.filters,
  (newFilters) => {
    const dateFilter = newFilters.find((f) => f.field === 'date')
    const deptFilter = newFilters.find((f) => f.field === 'department')
    const kwFilter = newFilters.find((f) => f.field === 'keyword')
    if (dateFilter) dateRange.value = dateFilter.value
    if (deptFilter) department.value = deptFilter.value
    if (kwFilter) keyword.value = kwFilter.value
  },
  { immediate: true }
)
</script>

<style scoped>
.filter-bar {
  width: 100%;
  padding: 12px 16px;
  background-color: #12121A;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.15);
}

.filter-bar__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.filter-item {
  flex-shrink: 0;
}

.reset-btn {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #D4AF37;
  border-radius: 8px;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
  color: #F2D06B;
}

:deep(.el-input__wrapper) {
  background-color: #1A1A25;
  border-color: rgba(212, 175, 55, 0.15);
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #EAEAEA;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  border-color: #D4AF37;
}

:deep(.el-date-editor) {
  --el-date-editor-width: 240px;
}

:deep(.el-select) {
  min-width: 160px;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(212, 175, 55, 0.35);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #D4AF37;
  box-shadow: none;
}

:deep(.el-select__tags .el-tag) {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.2);
  color: #D4AF37;
}

:deep(.el-input__prefix) {
  color: #8B8B9A;
}
</style>
