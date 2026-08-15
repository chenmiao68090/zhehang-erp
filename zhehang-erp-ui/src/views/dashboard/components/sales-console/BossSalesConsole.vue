<template>
  <div class="role-console boss-console">
    <SalesMetricGrid :items="metricItems" />

    <section class="console-section">
      <div class="section-heading">
        <div><h2>老板三分钟</h2><p>先看需要拍板的事项，再看团队明细</p></div>
      </div>
      <div class="decision-list">
        <div v-for="item in data.bossActions" :key="item.type" class="decision-item" :class="`tone-${item.severity}`">
          <span class="decision-mark"></span>
          <div><b>{{ item.title }}</b><p>{{ item.reason }}</p></div>
          <strong v-if="item.amount">{{ money(item.amount) }}</strong>
          <strong v-else-if="item.count">{{ item.count }} 项</strong>
          <strong v-else>正常</strong>
        </div>
      </div>
    </section>

    <section class="console-section">
      <div class="section-heading">
        <div><h2>新业务销售漏斗</h2><p>点击任一阶段查看客户明细</p></div>
        <span class="history-note">{{ historyText }}</span>
      </div>
      <SalesFunnelStrip :stages="data.newBusinessFunnel" :history-available="data.historyAvailable" @stage-click="$emit('stage-click', $event)" />
    </section>

    <section class="console-section renewal-section">
      <div class="section-heading"><div><h2>续费与存量风险</h2><p>按当前应收台账实时统计</p></div></div>
      <div class="renewal-grid">
        <div><span>全部待收</span><b>{{ money(data.renewalSummary.outstandingAmount) }}</b><small>{{ data.renewalSummary.outstandingCount }} 笔</small></div>
        <div><span>30天内到期</span><b>{{ money(data.renewalSummary.dueSoonAmount) }}</b><small>{{ data.renewalSummary.dueSoonCount }} 笔</small></div>
        <div class="is-danger"><span>已经逾期</span><b>{{ money(data.renewalSummary.overdueAmount) }}</b><small>{{ data.renewalSummary.overdueCount }} 笔</small></div>
        <div><span>承诺付款</span><b>{{ money(data.renewalSummary.promisedAmount) }}</b><small>{{ data.renewalSummary.promisedCount }} 笔</small></div>
        <div class="is-danger"><span>坏账风险</span><b>{{ money(data.renewalSummary.badRiskAmount) }}</b><small>{{ data.renewalSummary.badRiskCount }} 笔</small></div>
      </div>
    </section>

    <section class="console-section">
      <div class="section-heading"><div><h2>团队执行</h2><p>按逾期数量优先排序</p></div></div>
      <el-table :data="data.team" empty-text="所选范围暂无团队数据">
        <el-table-column label="员工" min-width="120"><template #default="{ row }"><b>{{ row.ownerName || '-' }}</b></template></el-table-column>
        <el-table-column label="部门" min-width="110" prop="deptName" show-overflow-tooltip />
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
import dayjs from 'dayjs'
import type { SalesConsoleOverview, SalesStageItem } from '@/api/sales-console'
import SalesMetricGrid, { type MetricItem } from './SalesMetricGrid.vue'
import SalesFunnelStrip from './SalesFunnelStrip.vue'

const props = defineProps<{ data: SalesConsoleOverview }>()
defineEmits<{ (event: 'stage-click', stage: SalesStageItem): void }>()

const metricItems = computed<MetricItem[]>(() => [
  { label: '确认到款', value: money(props.data.metrics.confirmedAmount), hint: `${props.data.metrics.confirmedOrderCount} 单，财务确认口径`, tone: 'success' },
  { label: '新业务到款', value: money(props.data.metrics.newBusinessAmount), hint: `${props.data.metrics.newBusinessCount} 单`, tone: 'primary' },
  { label: '续费到款', value: money(props.data.metrics.renewalAmount), hint: `${props.data.metrics.renewalCount} 单`, tone: 'success' },
  { label: '加权预测', value: money(props.data.metrics.weightedForecastAmount), hint: `数据完整度 ${props.data.metrics.forecastDataCompleteness}%`, tone: 'warning' },
  { label: '经营目标', value: props.data.metrics.targetConfigured ? money(props.data.metrics.targetAmount || 0) : '未配置', hint: '未配置前不计算目标差额', tone: 'neutral' }
])

const historyText = computed(() => props.data.historyAvailable && props.data.dataSince
  ? `推进记录自 ${dayjs(props.data.dataSince).format('YYYY-MM-DD')} 起`
  : '推进率从本功能上线后开始统计')

function money(value?: number | null) {
  const amount = Number(value || 0)
  if (Math.abs(amount) >= 10000) return `¥${(amount / 10000).toFixed(2)}万`
  return `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}
</script>

<style scoped lang="scss">
.role-console { display: flex; flex-direction: column; gap: 28px; }
.console-section { padding: 2px 0 4px; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 14px; }
.section-heading h2 { margin: 0; color: #1f2a3d; font-size: 17px; line-height: 1.4; }
.section-heading p { margin: 4px 0 0; color: #7b8799; font-size: 13px; }
.history-note { color: #768399; font-size: 12px; }
.decision-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.decision-item { min-width: 0; min-height: 92px; padding: 15px 16px; border: 1px solid #dce3ec; border-radius: 7px; background: #fff; display: grid; grid-template-columns: 5px minmax(0, 1fr) auto; gap: 12px; align-items: start; }
.decision-mark { width: 4px; height: 100%; min-height: 48px; border-radius: 2px; background: #2563eb; }
.decision-item.tone-danger .decision-mark { background: #c2413a; }
.decision-item.tone-warning .decision-mark { background: #c57a11; }
.decision-item.tone-success .decision-mark { background: #16805c; }
.decision-item b { color: #253147; font-size: 14px; }
.decision-item p { margin: 6px 0 0; color: #6f7c90; font-size: 12px; line-height: 1.55; }
.decision-item strong { white-space: nowrap; color: #243147; font-size: 14px; }
.renewal-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-top: 1px solid #dfe5ed; border-bottom: 1px solid #dfe5ed; }
.renewal-grid > div { min-height: 90px; padding: 15px 18px; border-right: 1px solid #e7ebf1; display: flex; flex-direction: column; justify-content: space-between; }
.renewal-grid > div:last-child { border-right: 0; }
.renewal-grid span { color: #657389; font-size: 12px; }
.renewal-grid b { color: #1f2a3d; font-size: 18px; }
.renewal-grid small { color: #8993a3; font-size: 12px; }
.renewal-grid .is-danger b, .danger { color: #c2413a; }

@media (max-width: 1000px) {
  .decision-list { grid-template-columns: 1fr; }
  .renewal-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 680px) {
  .role-console { gap: 22px; }
  .section-heading { align-items: flex-start; flex-direction: column; gap: 5px; }
  .renewal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .renewal-grid > div { min-height: 82px; padding: 13px; }
  .decision-item { grid-template-columns: 4px minmax(0, 1fr); }
  .decision-item strong { grid-column: 2; }
}
</style>
