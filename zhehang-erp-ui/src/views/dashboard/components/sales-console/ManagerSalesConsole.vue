<template>
  <div class="role-console">
    <SalesMetricGrid :items="metricItems" />

    <section class="console-section">
      <div class="section-heading"><div><h2>异常先行</h2><p>先清掉会影响成交和回款的事项</p></div></div>
      <div v-if="data.exceptions.length" class="exception-line">
        <div v-for="item in data.exceptions" :key="item.type" :class="`tone-${item.severity}`">
          <span>{{ item.label }}</span><b>{{ item.count }}</b><small v-if="item.amount">{{ money(item.amount) }}</small>
        </div>
      </div>
      <el-empty v-else description="当前没有销售或续费异常" :image-size="64" />
    </section>

    <section class="console-section">
      <div class="section-heading"><div><h2>今天要盯的人和事</h2><p>按逾期、未安排、今天到期依次排序</p></div></div>
      <SalesActionTable :rows="data.actions" @lead-click="$emit('lead-click', $event)" />
    </section>

    <section class="console-section">
      <div class="section-heading"><div><h2>部门销售漏斗</h2><p>点击阶段下钻到客户</p></div></div>
      <SalesFunnelStrip :stages="data.newBusinessFunnel" :history-available="data.historyAvailable" @stage-click="$emit('stage-click', $event)" />
    </section>

    <section class="console-section">
      <div class="section-heading"><div><h2>团队执行对比</h2><p>数据由系统按当前部门权限自动收敛</p></div></div>
      <el-table :data="data.team" empty-text="所选范围暂无员工数据">
        <el-table-column label="员工" min-width="120"><template #default="{ row }"><b>{{ row.ownerName || '-' }}</b></template></el-table-column>
        <el-table-column label="持有线索" width="92" prop="activeLeadCount" align="right" />
        <el-table-column label="逾期" width="78" align="right"><template #default="{ row }"><span :class="{ danger: row.overdueCount > 0 }">{{ row.overdueCount }}</span></template></el-table-column>
        <el-table-column label="未排下一步" width="108" prop="noNextActionCount" align="right" />
        <el-table-column label="确认到款" min-width="120" align="right"><template #default="{ row }"><b>{{ money(row.confirmedAmount) }}</b></template></el-table-column>
        <el-table-column label="订单" width="76" align="right"><template #default="{ row }">{{ row.confirmedOrderCount }} 单</template></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SalesActionItem, SalesConsoleOverview, SalesStageItem } from '@/api/sales-console'
import SalesMetricGrid, { type MetricItem } from './SalesMetricGrid.vue'
import SalesFunnelStrip from './SalesFunnelStrip.vue'
import SalesActionTable from './SalesActionTable.vue'

const props = defineProps<{ data: SalesConsoleOverview }>()
defineEmits<{
  (event: 'stage-click', stage: SalesStageItem): void
  (event: 'lead-click', row: SalesActionItem): void
}>()

const metricItems = computed<MetricItem[]>(() => [
  { label: '部门确认到款', value: money(props.data.metrics.confirmedAmount), hint: `${props.data.metrics.confirmedOrderCount} 单`, tone: 'success' },
  { label: '今天待跟进', value: props.data.taskSummary.todayActionCount, hint: '已安排在今天', tone: 'primary' },
  { label: '跟进逾期', value: props.data.taskSummary.overdueCount, hint: '需要当天处理', tone: 'danger' },
  { label: '未排下一步', value: props.data.taskSummary.noNextActionCount, hint: '容易造成漏跟进', tone: 'warning' },
  { label: '续费逾期', value: money(props.data.renewalSummary.overdueAmount), hint: `${props.data.renewalSummary.overdueCount} 笔`, tone: 'danger' }
])

function money(value?: number | null) {
  const amount = Number(value || 0)
  return Math.abs(amount) >= 10000
    ? `¥${(amount / 10000).toFixed(2)}万`
    : `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}
</script>

<style scoped lang="scss">
.role-console { display: flex; flex-direction: column; gap: 28px; }
.console-section { padding: 2px 0 4px; }
.section-heading { margin-bottom: 14px; }
.section-heading h2 { margin: 0; color: #1f2a3d; font-size: 17px; }
.section-heading p { margin: 4px 0 0; color: #7b8799; font-size: 13px; }
.exception-line { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid #dfe5ed; border-bottom: 1px solid #dfe5ed; }
.exception-line > div { min-height: 70px; padding: 13px 16px; border-right: 1px solid #e5eaf1; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 3px 10px; }
.exception-line > div:last-child { border-right: 0; }
.exception-line span { color: #59677c; font-size: 13px; }
.exception-line b { color: #c2413a; font-size: 20px; }
.exception-line small { grid-column: 1 / -1; color: #7f8a9b; font-size: 12px; }
.danger { color: #c2413a; }
@media (max-width: 840px) { .exception-line { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 680px) { .role-console { gap: 22px; } }
</style>
