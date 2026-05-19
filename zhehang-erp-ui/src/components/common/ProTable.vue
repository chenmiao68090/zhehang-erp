<template>
  <div class="pro-table">
    <div class="pro-table-header" v-if="$slots.header || showToolbar">
      <div class="table-title">
        <slot name="header">
          <h3 v-if="title">{{ title }}</h3>
        </slot>
      </div>
      <div class="table-toolbar">
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
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column v-if="selection" type="selection" width="50" align="center" />
      <el-table-column v-if="showIndex" type="index" label="序号" width="60" align="center" />
      <slot />
      <el-table-column v-if="$slots.action" label="操作" :width="actionWidth" fixed="right" align="center">
        <template #default="scope">
          <slot name="action" :row="scope.row" :index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="showPagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  data?: any[]
  loading?: boolean
  title?: string
  border?: boolean
  stripe?: boolean
  height?: string | number
  selection?: boolean
  showIndex?: boolean
  showToolbar?: boolean
  showPagination?: boolean
  total?: number
  actionWidth?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  border: true,
  stripe: true,
  selection: false,
  showIndex: true,
  showToolbar: true,
  showPagination: true,
  total: 0,
  actionWidth: 180
})

const emit = defineEmits(['selection-change', 'sort-change', 'page-change'])

const tableRef = ref()
const currentPage = ref(1)
const pageSize = ref(20)

function handleSelectionChange(val: any[]) {
  emit('selection-change', val)
}

function handleSortChange(sort: any) {
  emit('sort-change', sort)
}

function handleSizeChange(size: number) {
  pageSize.value = size
  emit('page-change', { pageNum: currentPage.value, pageSize: size })
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  emit('page-change', { pageNum: page, pageSize: pageSize.value })
}

defineExpose({ tableRef })
</script>

<style lang="scss" scoped>
.pro-table {
  .pro-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .table-title h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .table-toolbar {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
