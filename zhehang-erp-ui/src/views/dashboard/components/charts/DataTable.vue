<template>
  <div class="data-table-widget">
    <el-table
      :data="mockData"
      stripe
      height="100%"
      :header-cell-style="{ backgroundColor: '#1A1A25', color: '#8B8B9A' }"
      :cell-style="{ color: '#EAEAEA' }"
    >
      <el-table-column prop="name" label="客户名称" sortable min-width="120" />
      <el-table-column prop="source" label="来源渠道" sortable min-width="100" />
      <el-table-column prop="amount" label="成交金额" sortable min-width="110">
        <template #default="{ row }">
          <span class="amount-cell">¥{{ row.amount.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="成交日期" sortable min-width="110" />
      <el-table-column prop="status" label="状态" sortable min-width="90">
        <template #default="{ row }">
          <span :class="['status-tag', `status-${row.statusType}`]">{{ row.status }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const sources = ['官网', '电话', '展会', '转介绍', '广告']
const statuses = [
  { label: '已成交', type: 'success' },
  { label: '跟进中', type: 'warning' },
  { label: '已流失', type: 'danger' }
]

const mockData = Array.from({ length: 20 }, (_, i) => {
  const status = statuses[i % 3]
  return {
    name: `客户${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`,
    source: sources[i % sources.length],
    amount: Math.round(Math.random() * 500000 + 10000),
    date: `2026-0${Math.floor(Math.random() * 4 + 1)}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`,
    status: status.label,
    statusType: status.type
  }
})
</script>

<style scoped>
.data-table-widget {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.amount-cell {
  font-family: 'DIN Alternate', 'Roboto', monospace;
  font-weight: 500;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.status-success {
  background: rgba(0, 208, 132, 0.15);
  color: #00D084;
}

.status-warning {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.status-danger {
  background: rgba(255, 107, 107, 0.15);
  color: #FF6B6B;
}

:deep(.el-table) {
  background-color: transparent;
  --el-table-border-color: rgba(255, 255, 255, 0.06);
}

:deep(.el-table tr) {
  background-color: #12121A;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #16161F;
}

:deep(.el-table th.el-table__cell) {
  background-color: #1A1A25;
  color: #8B8B9A;
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

:deep(.el-table td.el-table__cell) {
  border-bottom-color: rgba(255, 255, 255, 0.06);
  color: #EAEAEA;
}

:deep(.el-table__body-wrapper) {
  background-color: #12121A;
}

:deep(.el-table__empty-block) {
  background-color: #12121A;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(212, 175, 55, 0.05);
}
</style>
