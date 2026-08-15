<template>
  <div class="role-console">
    <SalesMetricGrid :items="metricItems" />

    <section class="console-section">
      <div class="section-heading"><div><h2>今日作战清单</h2><p>先处理逾期，再补齐未安排，最后完成今天动作</p></div></div>
      <SalesActionTable :rows="data.actions" @lead-click="$emit('lead-click', $event)" />
    </section>

    <section class="console-section">
      <div class="section-heading"><div><h2>我的客户推进</h2><p>点击阶段查看自己名下的客户</p></div></div>
      <SalesFunnelStrip :stages="data.newBusinessFunnel" :history-available="data.historyAvailable" @stage-click="$emit('stage-click', $event)" />
    </section>

    <section class="console-section result-band">
      <div><span>本期确认到款</span><b>{{ money(data.metrics.confirmedAmount) }}</b><small>{{ data.metrics.confirmedOrderCount }} 单</small></div>
      <div><span>新业务到款</span><b>{{ money(data.metrics.newBusinessAmount) }}</b><small>{{ data.metrics.newBusinessCount }} 单</small></div>
      <div><span>续费到款</span><b>{{ money(data.metrics.renewalAmount) }}</b><small>{{ data.metrics.renewalCount }} 单</small></div>
      <div><span>加权预测</span><b>{{ money(data.metrics.weightedForecastAmount) }}</b><small>完整度 {{ data.metrics.forecastDataCompleteness }}%</small></div>
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
  { label: '今天待跟进', value: props.data.taskSummary.todayActionCount, hint: '今天必须完成', tone: 'primary' },
  { label: '已经逾期', value: props.data.taskSummary.overdueCount, hint: '优先处理', tone: 'danger' },
  { label: '未排下一步', value: props.data.taskSummary.noNextActionCount, hint: '完成后立即补齐', tone: 'warning' },
  { label: '高意向客户', value: props.data.taskSummary.highIntentCount, hint: '重点推进成交', tone: 'success' },
  { label: '持有客户', value: props.data.taskSummary.activeLeadCount, hint: '当前跟进中', tone: 'neutral' }
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
.result-band { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid #dfe5ed; border-bottom: 1px solid #dfe5ed; }
.result-band > div { min-height: 90px; padding: 15px 18px; border-right: 1px solid #e7ebf1; display: flex; flex-direction: column; justify-content: space-between; }
.result-band > div:last-child { border-right: 0; }
.result-band span { color: #657389; font-size: 12px; }
.result-band b { color: #1f2a3d; font-size: 19px; }
.result-band small { color: #8993a3; font-size: 12px; }
@media (max-width: 760px) { .result-band { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 680px) { .role-console { gap: 22px; } }
</style>
