<template>
  <div class="action-table-wrap">
    <el-table
      v-if="rows.length"
      :data="rows"
      class="action-table"
      row-key="leadId"
      @row-click="row => $emit('lead-click', row)"
    >
      <el-table-column label="优先" width="74">
        <template #default="{ row }">
          <el-tag size="small" :type="tagType(row.actionType)" effect="light">{{ actionLabel(row.actionType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户" min-width="180" show-overflow-tooltip>
        <template #default="{ row }"><b class="company-name">{{ row.companyName || '未命名客户' }}</b></template>
      </el-table-column>
      <el-table-column label="阶段" min-width="112">
        <template #default="{ row }">{{ row.stageName }}</template>
      </el-table-column>
      <el-table-column label="下一步" min-width="190">
        <template #default="{ row }">
          <div class="next-action">
            <span>{{ row.nextActionType || '待安排' }}</span>
            <small :class="{ overdue: row.actionType === 'OVERDUE' }">{{ timeLabel(row.nextActionTime) }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="负责人" min-width="104" show-overflow-tooltip>
        <template #default="{ row }">{{ row.ownerName || '-' }}</template>
      </el-table-column>
      <el-table-column label="预计金额" width="112" align="right">
        <template #default="{ row }">{{ money(row.expectedAmount) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="74" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click.stop="$emit('lead-click', row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="rows.length" class="action-mobile-list">
      <button v-for="row in rows" :key="row.leadId" type="button" class="action-mobile-item" @click="$emit('lead-click', row)">
        <div class="mobile-item-head">
          <el-tag size="small" :type="tagType(row.actionType)" effect="light">{{ actionLabel(row.actionType) }}</el-tag>
          <span>{{ row.stageName }}</span>
        </div>
        <b>{{ row.companyName || '未命名客户' }}</b>
        <div class="mobile-item-action">
          <span>{{ row.nextActionType || '待安排下一步' }}</span>
          <small :class="{ overdue: row.actionType === 'OVERDUE' }">{{ timeLabel(row.nextActionTime) }}</small>
        </div>
        <div class="mobile-item-foot">
          <span>{{ row.ownerName || '-' }}</span>
          <strong>{{ money(row.expectedAmount) }}</strong>
        </div>
      </button>
    </div>
    <el-empty v-else description="当前没有需要处理的销售动作" :image-size="72" />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { SalesActionItem } from '@/api/sales-console'

defineProps<{ rows: SalesActionItem[] }>()
defineEmits<{ (event: 'lead-click', row: SalesActionItem): void }>()

function actionLabel(type: SalesActionItem['actionType']) {
  return type === 'OVERDUE' ? '逾期' : type === 'NO_ACTION' ? '未安排' : '今天'
}

function tagType(type: SalesActionItem['actionType']) {
  return type === 'OVERDUE' ? 'danger' : type === 'NO_ACTION' ? 'warning' : 'primary'
}

function timeLabel(value?: string) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '尚未设置时间'
}

function money(value?: number) {
  const amount = Number(value || 0)
  return amount === 0 ? '-' : `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}
</script>

<style scoped lang="scss">
.action-table-wrap {
  min-height: 160px;
  border-top: 1px solid #e5eaf1;
  border-bottom: 1px solid #e5eaf1;
}

.action-table :deep(.el-table__row) { cursor: pointer; }
.action-mobile-list { display: none; }
.company-name { color: #243147; font-weight: 650; }
.next-action { display: flex; flex-direction: column; gap: 3px; }
.next-action small { color: #7b8799; font-size: 12px; }
.next-action small.overdue { color: #c2413a; }

@media (max-width: 680px) {
  .action-table-wrap { border-top: 0; }
  .action-table { display: none; }
  .action-mobile-list { display: flex; flex-direction: column; border-top: 1px solid #e5eaf1; }
  .action-mobile-item {
    width: 100%;
    padding: 14px 4px;
    border: 0;
    border-bottom: 1px solid #e5eaf1;
    background: transparent;
    color: #243147;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .mobile-item-head, .mobile-item-action, .mobile-item-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .mobile-item-head > span { color: #6f7c90; font-size: 12px; }
  .mobile-item-action { align-items: flex-start; color: #4c5b70; font-size: 13px; }
  .mobile-item-action small { color: #7b8799; white-space: nowrap; }
  .mobile-item-action small.overdue { color: #c2413a; }
  .mobile-item-foot { color: #7b8799; font-size: 12px; }
  .mobile-item-foot strong { color: #253147; font-size: 13px; }
}
</style>
