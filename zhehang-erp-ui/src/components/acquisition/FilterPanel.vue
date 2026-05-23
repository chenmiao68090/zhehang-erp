<template>
  <div class="filter-panel">
    <!-- 维度行 -->
    <div class="fp-rows" :class="{ 'is-collapsed': !expanded }">
      <div
        v-for="(dim, idx) in visibleDimensions"
        :key="dim.code"
        class="fp-row"
        v-show="expanded || idx < COLLAPSED_COUNT"
      >
        <div class="fp-row__label">
          <span class="fp-row__name">{{ dim.label }}</span>
          <el-tooltip
            v-if="dim.tip"
            effect="dark"
            placement="top"
            :content="dim.tip"
          >
            <el-icon class="fp-row__tip"><InfoFilled /></el-icon>
          </el-tooltip>
        </div>

        <div class="fp-row__options">
          <!-- 级联选择器（注册地区） -->
          <template v-if="dim.type === 'cascader'">
            <el-cascader
              :model-value="cascaderValue(dim.code)"
              :options="dim.options as any"
              :props="{ checkStrictly: true, emitPath: true }"
              clearable
              filterable
              placeholder="请选择地区"
              size="small"
              class="fp-cascader"
              @change="(v: any) => onCascaderChange(dim.code, v)"
            />
          </template>

          <!-- 标签式选项 -->
          <template v-else>
            <span
              v-for="opt in dim.options"
              :key="opt.key"
              class="fp-tag"
              :class="{ 'is-active': isActive(dim, opt.key) }"
              @click="onTagClick(dim, opt)"
            >
              {{ opt.label }}
              <el-icon
                v-if="opt.key === 'custom'"
                class="fp-tag__caret"
              >
                <ArrowDown />
              </el-icon>
              <el-tooltip
                v-if="opt.tip"
                effect="dark"
                placement="top"
                :content="opt.tip"
              >
                <el-icon class="fp-tag__tip"><InfoFilled /></el-icon>
              </el-tooltip>
            </span>

            <!-- 自定义日期范围弹层 -->
            <el-date-picker
              v-if="hasCustom(dim) && isCustomActive(dim.code)"
              :model-value="customDateValue(dim.code)"
              type="daterange"
              size="small"
              value-format="YYYY-MM-DD"
              range-separator="→"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              class="fp-custom-picker"
              @update:model-value="(v: any) => onCustomDateChange(dim.code, v)"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- 已选条件 -->
    <div v-if="selectedChips.length" class="fp-selected">
      <span class="fp-selected__label">已选条件</span>
      <div class="fp-selected__chips">
        <span
          v-for="chip in selectedChips"
          :key="chip.dimCode + ':' + chip.optKey"
          class="fp-chip"
        >
          <span class="fp-chip__name">{{ chip.dimLabel }}：</span>
          <span class="fp-chip__val">{{ chip.optLabel }}</span>
          <el-icon class="fp-chip__close" @click="removeChip(chip)">
            <Close />
          </el-icon>
        </span>
        <span class="fp-clear" @click="clearAll">清空</span>
      </div>
    </div>

    <!-- 展开 / 收起 -->
    <div
      v-if="visibleDimensions.length > COLLAPSED_COUNT"
      class="fp-toggle"
      @click="expanded = !expanded"
    >
      <span>{{ expanded ? '收起筛选' : '展开更多筛选' }}</span>
      <el-icon class="fp-toggle__icon" :class="{ 'is-up': expanded }">
        <ArrowDown />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ElCascader,
  ElDatePicker,
  ElIcon,
  ElTooltip,
} from 'element-plus'
import {
  ArrowDown,
  Close,
  InfoFilled,
} from '@element-plus/icons-vue'

interface FilterOption {
  key: string
  label: string
  tip?: string
}

interface FilterDimension {
  code: string
  label: string
  type?: 'single' | 'multi' | 'cascader'
  tip?: string
  options: FilterOption[] | any[]
}

interface Props {
  /** 当前客群支持的筛选维度 code 列表 */
  availableFilters?: string[]
  /** 当前选中的筛选条件 */
  modelValue?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  availableFilters: () => [
    'occurDate',
    'companyType',
    'taxQualification',
    'establishTime',
    'region',
  ],
  modelValue: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: Record<string, any>): void
}>()

const COLLAPSED_COUNT = 4
const expanded = ref(false)

// 区域级联示例数据
const REGION_OPTIONS = [
  {
    value: 'zhejiang',
    label: '浙江省',
    children: [
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'binjiang', label: '滨江区' },
          { value: 'yuhang', label: '余杭区' },
        ],
      },
      { value: 'ningbo', label: '宁波市' },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      { value: 'nanjing', label: '南京市' },
      { value: 'suzhou', label: '苏州市' },
    ],
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      { value: 'pudong', label: '浦东新区' },
      { value: 'huangpu', label: '黄浦区' },
    ],
  },
  {
    value: 'beijing',
    label: '北京市',
    children: [
      { value: 'haidian', label: '海淀区' },
      { value: 'chaoyang', label: '朝阳区' },
    ],
  },
  {
    value: 'guangdong',
    label: '广东省',
    children: [
      { value: 'shenzhen', label: '深圳市' },
      { value: 'guangzhou', label: '广州市' },
    ],
  },
]

const FILTER_DIMENSIONS: Record<string, FilterDimension> = {
  occurDate: {
    code: 'occurDate',
    label: '发生日期',
    type: 'single',
    tip: '客户发生关键经营行为的时间窗口',
    options: [
      { key: 'all', label: '全部' },
      { key: 'recent1Month', label: '近1个月' },
      { key: 'recent3Months', label: '近3个月' },
      { key: 'recent6Months', label: '近半年' },
      { key: 'recent1Year', label: '近1年' },
      { key: 'custom', label: '自定义' },
    ],
  },
  companyType: {
    code: 'companyType',
    label: '公司类型',
    type: 'multi',
    options: [
      { key: 'individual', label: '个体户' },
      { key: 'enterprise', label: '企业' },
    ],
  },
  taxQualification: {
    code: 'taxQualification',
    label: '税务资质',
    type: 'single',
    options: [
      { key: 'all', label: '全部' },
      { key: 'general', label: '一般纳税人' },
      { key: 'smallScale', label: '小规模纳税人' },
      {
        key: 'suspectedSmallScale',
        label: '疑似小规模纳税人',
        tip: '基于发票数据与开票额度推断',
      },
      { key: 'other', label: '其他' },
    ],
  },
  establishTime: {
    code: 'establishTime',
    label: '成立时间',
    type: 'single',
    options: [
      { key: 'all', label: '全部' },
      { key: 'recent1Year', label: '近1年' },
      { key: 'recent3Years', label: '近3年' },
      { key: 'recent5Years', label: '近5年' },
      { key: 'recent10Years', label: '近10年' },
      { key: 'custom', label: '自定义' },
    ],
  },
  region: {
    code: 'region',
    label: '注册地区',
    type: 'cascader',
    options: REGION_OPTIONS,
  },
  registeredCapital: {
    code: 'registeredCapital',
    label: '注册资本',
    type: 'single',
    options: [
      { key: 'all', label: '全部' },
      { key: '0-100', label: '100万以下' },
      { key: '100-500', label: '100-500万' },
      { key: '500-1000', label: '500-1000万' },
      { key: '1000-5000', label: '1000-5000万' },
      { key: '5000+', label: '5000万以上' },
    ],
  },
  staffCount: {
    code: 'staffCount',
    label: '人员规模',
    type: 'single',
    options: [
      { key: 'all', label: '全部' },
      { key: '1-50', label: '50人以下' },
      { key: '50-200', label: '50-200人' },
      { key: '200-500', label: '200-500人' },
      { key: '500-1000', label: '500-1000人' },
      { key: '1000+', label: '1000人以上' },
    ],
  },
  enterpriseStatus: {
    code: 'enterpriseStatus',
    label: '经营状态',
    type: 'multi',
    options: [
      { key: '在业', label: '在业' },
      { key: '存续', label: '存续' },
      { key: '吊销', label: '吊销' },
      { key: '注销', label: '注销' },
    ],
  },
}

// 当前可见维度（按 availableFilters 顺序过滤）
const visibleDimensions = computed<FilterDimension[]>(() => {
  return (props.availableFilters || [])
    .map((c) => FILTER_DIMENSIONS[c])
    .filter(Boolean)
})

// 内部 filters 状态
const filters = ref<Record<string, any>>({ ...(props.modelValue || {}) })
watch(
  () => props.modelValue,
  (v) => {
    filters.value = { ...(v || {}) }
  },
  { deep: true },
)

function commit() {
  emit('update:modelValue', { ...filters.value })
}

// 是否选中
function isActive(dim: FilterDimension, key: string): boolean {
  const cur = filters.value[dim.code]
  if (dim.type === 'multi') {
    if (Array.isArray(cur)) return cur.includes(key)
    return false
  }
  // 单选：未设置默认 'all'
  if (cur === undefined || cur === null || cur === '') {
    return key === 'all'
  }
  // 自定义模式下保留 custom 高亮
  if (key === 'custom' && typeof cur === 'string' && cur.startsWith('custom:')) {
    return true
  }
  return cur === key
}

function isCustomActive(code: string): boolean {
  const cur = filters.value[code]
  return cur === 'custom' || (typeof cur === 'string' && cur.startsWith('custom:'))
}

function hasCustom(dim: FilterDimension): boolean {
  return (dim.options as FilterOption[]).some((o) => o.key === 'custom')
}

function customDateValue(code: string): [string, string] | null {
  const cur = filters.value[code]
  if (typeof cur === 'string' && cur.startsWith('custom:')) {
    const raw = cur.slice('custom:'.length)
    const parts = raw.split('~')
    if (parts.length === 2) return [parts[0], parts[1]]
  }
  return null
}

function onTagClick(dim: FilterDimension, opt: FilterOption) {
  if (dim.type === 'multi') {
    const cur = Array.isArray(filters.value[dim.code])
      ? [...filters.value[dim.code]]
      : []
    const i = cur.indexOf(opt.key)
    if (i >= 0) cur.splice(i, 1)
    else cur.push(opt.key)
    filters.value[dim.code] = cur
  } else {
    if (opt.key === 'all') {
      delete filters.value[dim.code]
    } else {
      filters.value[dim.code] = opt.key
    }
  }
  commit()
}

function onCustomDateChange(code: string, v: [string, string] | null) {
  if (!v || !v[0] || !v[1]) {
    filters.value[code] = 'custom'
  } else {
    filters.value[code] = `custom:${v[0]}~${v[1]}`
  }
  commit()
}

function cascaderValue(code: string) {
  const v = filters.value[code]
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v) return v.split('/')
  return []
}

function onCascaderChange(code: string, v: any) {
  if (!v || (Array.isArray(v) && v.length === 0)) {
    delete filters.value[code]
  } else {
    filters.value[code] = Array.isArray(v) ? v.join('/') : v
  }
  commit()
}

// 已选条件
interface Chip {
  dimCode: string
  dimLabel: string
  optKey: string
  optLabel: string
}

const selectedChips = computed<Chip[]>(() => {
  const list: Chip[] = []
  visibleDimensions.value.forEach((dim) => {
    const cur = filters.value[dim.code]
    if (cur === undefined || cur === null || cur === '') return

    if (dim.type === 'multi' && Array.isArray(cur)) {
      cur.forEach((k) => {
        const opt = (dim.options as FilterOption[]).find((o) => o.key === k)
        if (opt) {
          list.push({
            dimCode: dim.code,
            dimLabel: dim.label,
            optKey: k,
            optLabel: opt.label,
          })
        }
      })
      return
    }

    if (dim.type === 'cascader') {
      const path = typeof cur === 'string' ? cur.split('/') : cur
      const label = resolveCascaderLabel(REGION_OPTIONS, path)
      if (label) {
        list.push({
          dimCode: dim.code,
          dimLabel: dim.label,
          optKey: '__cascader__',
          optLabel: label,
        })
      }
      return
    }

    // 单选
    if (typeof cur === 'string' && cur.startsWith('custom:')) {
      const range = cur.slice('custom:'.length).replace('~', ' 至 ')
      list.push({
        dimCode: dim.code,
        dimLabel: dim.label,
        optKey: 'custom',
        optLabel: range,
      })
    } else if (cur !== 'all') {
      const opt = (dim.options as FilterOption[]).find((o) => o.key === cur)
      if (opt) {
        list.push({
          dimCode: dim.code,
          dimLabel: dim.label,
          optKey: opt.key,
          optLabel: opt.label,
        })
      }
    }
  })
  return list
})

function resolveCascaderLabel(opts: any[], path: any): string {
  if (!Array.isArray(path) || !path.length) return ''
  const labels: string[] = []
  let cur = opts
  for (const seg of path) {
    const found = cur?.find((o: any) => o.value === seg)
    if (!found) break
    labels.push(found.label)
    cur = found.children || []
  }
  return labels.join(' / ')
}

function removeChip(chip: Chip) {
  const dim = FILTER_DIMENSIONS[chip.dimCode]
  if (!dim) return
  if (dim.type === 'multi') {
    const cur = Array.isArray(filters.value[chip.dimCode])
      ? [...filters.value[chip.dimCode]]
      : []
    filters.value[chip.dimCode] = cur.filter((k: string) => k !== chip.optKey)
    if (!filters.value[chip.dimCode].length) delete filters.value[chip.dimCode]
  } else {
    delete filters.value[chip.dimCode]
  }
  commit()
}

function clearAll() {
  filters.value = {}
  commit()
}
</script>

<style scoped lang="scss">
.filter-panel {
  background: #fff;
  border: none;
  padding: 4px 4px 0;
  font-size: 13px;
  color: #303133;
}

.fp-rows {
  display: flex;
  flex-direction: column;
}

.fp-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  min-height: 32px;

  & + .fp-row {
    border-top: 1px dashed #f2f3f5;
  }

  &__label {
    flex: 0 0 88px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #666;
    line-height: 24px;
    user-select: none;
  }

  &__tip {
    color: #c0c4cc;
    font-size: 13px;
    cursor: help;
  }

  &__options {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 12px;
    line-height: 24px;
  }
}

.fp-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.18s ease, background 0.18s ease;
  user-select: none;

  &:hover {
    color: #409eff;
  }

  &.is-active {
    color: #409eff;
    background: rgba(64, 158, 255, 0.08);
    font-weight: 500;
  }

  &__caret {
    font-size: 12px;
    margin-left: 2px;
  }

  &__tip {
    font-size: 12px;
    color: #c0c4cc;
    margin-left: 2px;
  }
}

.fp-custom-picker {
  margin-left: 8px;
  width: 260px;

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #e4e7ed inset;
    border-radius: 4px;
  }
}

.fp-cascader {
  width: 280px;

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #e4e7ed inset;
    border-radius: 4px;
  }
}

/* 已选条件 */
.fp-selected {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-top: 8px;
  padding: 12px 0 4px;
  border-top: 1px dashed #f2f3f5;

  &__label {
    flex: 0 0 88px;
    color: #666;
    font-size: 13px;
    line-height: 26px;
  }

  &__chips {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
}

.fp-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  background: #f0f7ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
  line-height: 24px;

  &__name {
    color: #909399;
  }

  &__val {
    color: #409eff;
    font-weight: 500;
  }

  &__close {
    cursor: pointer;
    color: #a0cfff;
    font-size: 12px;
    margin-left: 2px;
    transition: color 0.18s ease;

    &:hover {
      color: #f56c6c;
    }
  }
}

.fp-clear {
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  margin-left: 4px;
  line-height: 26px;
  transition: color 0.18s ease;

  &:hover {
    color: #409eff;
  }
}

/* 展开 / 收起 */
.fp-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  padding: 8px 0;
  border-top: 1px dashed #f2f3f5;
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  transition: color 0.18s ease;
  user-select: none;

  &:hover {
    color: #409eff;
  }

  &__icon {
    font-size: 12px;
    transition: transform 0.25s ease;

    &.is-up {
      transform: rotate(180deg);
    }
  }
}
</style>
