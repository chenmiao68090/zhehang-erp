<template>
  <div class="perf-table">
    <!-- 顶部:标题/Tab + 工具区(筛选/导出) -->
    <div v-if="$slots.tabs || title || $slots.toolbar" class="perf-table__bar">
      <div class="perf-table__left">
        <slot name="tabs">
          <span v-if="title" class="perf-table__title">{{ title }}</span>
        </slot>
      </div>
      <div class="perf-table__right">
        <slot name="toolbar" />
      </div>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="data"
      :border="border"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      :show-summary="showSummary"
      :summary-method="summaryMethod"
      :empty-text="emptyText"
      header-cell-class-name="perf-th"
      @selection-change="(v: any[]) => emit('selection-change', v)"
      @sort-change="(s: any) => emit('sort-change', s)"
    >
      <el-table-column v-if="selection" type="selection" width="48" align="center" fixed="left" />
      <el-table-column v-if="showIndex" type="index" label="#" width="56" align="center" fixed="left" />

      <template v-for="col in columns" :key="col.prop || col.label">
        <!-- 分组表头(两级) -->
        <el-table-column v-if="col.children && col.children.length" :label="col.label" align="center">
          <el-table-column
            v-for="child in col.children"
            :key="child.prop || child.label"
            :prop="child.prop"
            :label="child.label"
            :width="child.width"
            :min-width="child.minWidth || 90"
            :align="child.align || 'center'"
            :sortable="child.sortable"
          >
            <template #default="scope">
              <slot :name="`cell-${child.prop}`" :row="scope.row" :value="scope.row[child.prop as string]">
                {{ formatCell(child, scope.row) }}
              </slot>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- 普通列 -->
        <el-table-column
          v-else
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :align="col.align || 'center'"
          :fixed="col.fixed"
          :sortable="col.sortable"
        >
          <template #default="scope">
            <slot :name="`cell-${col.prop}`" :row="scope.row" :value="scope.row[col.prop as string]">
              {{ formatCell(col, scope.row) }}
            </slot>
          </template>
        </el-table-column>
      </template>

      <el-table-column v-if="$slots.action" label="操作" :width="actionWidth" fixed="right" align="center">
        <template #default="scope">
          <slot name="action" :row="scope.row" :index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部:右侧合计文案 + 分页 -->
    <div v-if="$slots.footer || showPagination" class="perf-table__footer">
      <el-pagination
        v-if="showPagination"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        size="small"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
      />
      <div class="perf-table__summary-text"><slot name="footer" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface PerfColumn {
  prop?: string
  label: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  /** 货币/数字格式化:'money' 保留两位千分位,'int' 整数,默认原样 */
  format?: 'money' | 'int'
  /** 分组表头的子列 */
  children?: PerfColumn[]
}

interface Props {
  columns: PerfColumn[]
  data?: any[]
  loading?: boolean
  title?: string
  border?: boolean
  stripe?: boolean
  height?: string | number
  maxHeight?: string | number
  selection?: boolean
  showIndex?: boolean
  showPagination?: boolean
  total?: number
  actionWidth?: number | string
  emptyText?: string
  /** 是否显示底部合计行 */
  showSummary?: boolean
  /** 合计行首列文案 */
  summaryText?: string
  /** 显式指定合计值 { prop: value };未指定的数值列自动求和 */
  summaryData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  border: true,
  stripe: true,
  selection: false,
  showIndex: false,
  showPagination: false,
  total: 0,
  actionWidth: 160,
  emptyText: '暂无数据',
  showSummary: false,
  summaryText: '合计'
})

const emit = defineEmits(['selection-change', 'sort-change', 'page-change'])

const tableRef = ref()
const currentPage = ref(1)
const pageSize = ref(20)

function fmt(value: any, format?: PerfColumn['format']) {
  if (value === null || value === undefined || value === '') return format ? '0' : '-'
  if (format === 'money') {
    const n = Number(value)
    return isNaN(n) ? String(value) : n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (format === 'int') {
    const n = Number(value)
    return isNaN(n) ? String(value) : String(Math.round(n))
  }
  return value
}

function formatCell(col: PerfColumn, row: any) {
  return fmt(col.prop ? row[col.prop] : '', col.format)
}

/** 扁平化叶子列(用于合计行对齐) */
function leafColumns(): PerfColumn[] {
  const leaves: PerfColumn[] = []
  for (const c of props.columns) {
    if (c.children && c.children.length) leaves.push(...c.children)
    else leaves.push(c)
  }
  return leaves
}

function summaryMethod({ columns }: { columns: any[]; data: any[] }): string[] {
  const leaves = leafColumns()
  // el-table 的 columns 含 selection/index/操作 等占位列,按其 property 对齐
  return columns.map((column: any, idx: number) => {
    if (idx === 0) return props.summaryText
    const prop = column.property as string | undefined
    if (!prop) return ''
    const def = leaves.find((l) => l.prop === prop)
    // 显式合计优先
    if (props.summaryData && props.summaryData[prop] !== undefined) {
      return String(fmt(props.summaryData[prop], def?.format))
    }
    // 数值列自动求和
    let sum = 0
    let numeric = true
    for (const row of props.data) {
      const v = Number(row[prop])
      if (isNaN(v)) { numeric = false; break }
      sum += v
    }
    return numeric ? String(fmt(sum, def?.format || 'money')) : ''
  })
}

function onSizeChange(size: number) {
  pageSize.value = size
  emit('page-change', { pageNum: currentPage.value, pageSize: size })
}
function onCurrentChange(page: number) {
  currentPage.value = page
  emit('page-change', { pageNum: page, pageSize: pageSize.value })
}

defineExpose({ tableRef })
</script>

<style lang="scss" scoped>
.perf-table {
  background: #fff;
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 8px;
  padding: 14px;

  &__bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  &__left { display: flex; align-items: center; gap: 16px; }
  &__title { font-size: 15px; font-weight: 600; color: var(--text-primary, #303133); }
  &__right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
  }
  &__summary-text {
    margin-left: auto;
    color: #f56c6c;
    font-size: 13px;
    display: flex;
    gap: 18px;
  }
}
:deep(.perf-th) {
  background: #f5f7fa !important;
  color: #303133;
  font-weight: 600;
}
</style>
