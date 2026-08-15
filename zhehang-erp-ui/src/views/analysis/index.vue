<template>
  <div class="analysis-page">
    <div class="ap-head">
      <h2>经营分析</h2>
      <div class="ap-tools">
        <el-date-picker v-model="year" type="year" value-format="YYYY" format="YYYY年" placeholder="选择年份" @change="reloadOverview" />
      </div>
    </div>

    <el-tabs v-model="tab" class="ap-tabs">
      <el-tab-pane label="销售分析" name="sales">
        <div class="ap-cards">
          <div class="ap-card blue"><b>{{ sales.funnel.leadTotal }}</b><span>线索总数</span></div>
          <div class="ap-card blue"><b>{{ sales.funnel.following }}</b><span>跟进中</span></div>
          <div class="ap-card green"><b>{{ sales.funnel.converted }}</b><span>已转化</span></div>
          <div class="ap-card"><b>{{ sales.yearCalls }}</b><span>本年通话</span></div>
        </div>
        <div ref="salesChartRef" class="ap-chart"></div>
        <el-table :data="sales.effort" size="small" border stripe style="margin-top:14px">
          <el-table-column prop="agent_name" label="销售" min-width="120" />
          <el-table-column prop="call_cnt" label="通话量" width="110" align="right" />
          <el-table-column prop="connected" label="接通量" width="110" align="right" />
          <el-table-column label="接通率" width="110" align="right">
            <template #default="{ row }">{{ callRate(row) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="经营总览" name="overview">
        <div class="ap-cards">
          <div class="ap-card"><b>{{ fmtMoney(summary.yearReceipt) }}</b><span>今年累计收款</span></div>
          <div class="ap-card"><b>{{ summary.yearOrders }}</b><span>今年确认订单</span></div>
          <div class="ap-card"><b>{{ summary.yearNewCustomers }}</b><span>今年新增客户</span></div>
        </div>
        <div ref="overviewChartRef" class="ap-chart"></div>
      </el-tab-pane>

      <el-tab-pane label="新单分析" name="newOrders">
        <div class="ap-filter">
          <el-select v-model="newOrderMonth" clearable placeholder="全部月份" style="width:140px" @change="loadNewOrders">
            <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="m" />
          </el-select>
        </div>
        <el-table :data="newOrderRows" size="small" border stripe>
          <el-table-column prop="ym" label="月份" width="100" />
          <el-table-column prop="service_type" label="服务类型" />
          <el-table-column prop="cnt" label="单数" width="90" align="right" />
          <el-table-column label="金额" width="140" align="right">
            <template #default="{ row }">{{ fmtMoney(row.amount) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="续费分析" name="renewal">
        <div class="ap-cards">
          <div class="ap-card"><b>{{ fmtMoney(renewal.sumReceivable) }}</b><span>本年应收</span></div>
          <div class="ap-card"><b>{{ fmtMoney(renewal.sumArrears) }}</b><span>本年欠费</span></div>
          <div class="ap-card"><b>{{ renewal.confirmedOrders }}</b><span>本年确认续费单</span></div>
        </div>
        <el-table :data="renewal.monthly" size="small" border stripe>
          <el-table-column prop="ym" label="月份" width="100" />
          <el-table-column label="应收" align="right"><template #default="{ row }">{{ fmtMoney(row.receivable) }}</template></el-table-column>
          <el-table-column label="已收" align="right"><template #default="{ row }">{{ fmtMoney(row.received) }}</template></el-table-column>
          <el-table-column label="欠费" align="right"><template #default="{ row }">{{ fmtMoney(row.arrears) }}</template></el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="流失风险" name="loss">
        <div class="ap-cards">
          <div class="ap-card warn"><b>{{ loss.count }}</b><span>90天内到期未续</span></div>
        </div>
        <el-table :data="loss.list" size="small" border stripe>
          <el-table-column prop="customer_name" label="客户" min-width="160" />
          <el-table-column prop="contract_no" label="合同号" width="150" />
          <el-table-column label="到期日" width="110"><template #default="{ row }">{{ (row.end_date || '').slice(0, 10) }}</template></el-table-column>
          <el-table-column label="金额" width="120" align="right"><template #default="{ row }">{{ fmtMoney(row.amount) }}</template></el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="客户价值" name="customerValue">
        <div ref="valueChartRef" class="ap-chart"></div>
      </el-tab-pane>

      <el-tab-pane label="线索投产" name="leadRoi">
        <el-table :data="leadRows" size="small" border stripe>
          <el-table-column prop="sourceLabel" label="来源" width="140" />
          <el-table-column prop="lead_cnt" label="线索数" width="100" align="right" />
          <el-table-column prop="converted" label="已转化" width="100" align="right" />
          <el-table-column label="转化率" width="100" align="right">
            <template #default="{ row }">{{ leadRate(row) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import * as echarts from 'echarts'
import { analysisApi } from '@/api/analysis'

const year = ref(String(new Date().getFullYear()))
const tab = ref('sales')
const newOrderMonth = ref<number | undefined>()
const overviewChartRef = ref<HTMLElement>()
const valueChartRef = ref<HTMLElement>()
const salesChartRef = ref<HTMLElement>()

const summary = reactive({ yearReceipt: 0, yearOrders: 0, yearNewCustomers: 0 })
const overviewMonths = ref<Array<Record<string, any>>>([])
const newOrderRows = ref<Array<Record<string, any>>>([])
const renewal = reactive({ sumReceivable: 0, sumArrears: 0, confirmedOrders: 0, monthly: [] as Array<Record<string, any>> })
const loss = reactive({ count: 0, list: [] as Array<Record<string, any>> })
const customerValueBands = ref<Array<Record<string, any>>>([])
const leadRows = ref<Array<Record<string, any>>>([])
const sales = reactive({
  funnel: { leadTotal: 0, following: 0, converted: 0 },
  yearCalls: 0, follows: [] as Array<Record<string, any>>, calls: [] as Array<Record<string, any>>,
  effort: [] as Array<Record<string, any>>
})

const SOURCE_LABELS: Record<number, string> = {
  1: '工商公开名单', 2: '客户转介绍', 3: '美团投流', 4: '抖音投流', 5: '线下来客',
  6: '其他投流', 7: '名单采购/电销', 8: '渠道合作', 9: '私域二开', 10: '其他'
}

function fmtMoney(n: unknown): string {
  const v = Number(n || 0)
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function leadRate(row: Record<string, any>): string {
  const total = Number(row.lead_cnt || 0)
  if (!total) return '-'
  return `${((Number(row.converted || 0) / total) * 100).toFixed(1)}%`
}

function callRate(row: Record<string, any>): string {
  const total = Number(row.call_cnt || 0)
  if (!total) return '-'
  return `${((Number(row.connected || 0) / total) * 100).toFixed(1)}%`
}

async function loadSales() {
  const { data } = await analysisApi.sales(Number(year.value)) as any
  const funnel = data?.funnel || []
  const find = (s: number) => Number(funnel.find((f: any) => Number(f.status) === s)?.cnt || 0)
  sales.funnel = { leadTotal: find(1) + find(2) + find(3), following: find(2), converted: find(3) }
  sales.follows = data?.follows || []
  sales.calls = data?.calls || []
  sales.effort = data?.effort || []
  sales.yearCalls = (sales.calls || []).reduce((s2: number, m: any) => s2 + Number(m.cnt || 0), 0)
  await nextTick()
  if (salesChartRef.value) {
    const chart = echarts.getInstanceByDom(salesChartRef.value) || echarts.init(salesChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['跟进量', '通话量'] },
      grid: { left: 60, right: 20, top: 40, bottom: 30 },
      xAxis: { type: 'category', data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`) },
      yAxis: { type: 'value' },
      series: [
        { name: '跟进量', type: 'bar', data: sales.follows.map((m: any) => Number(m.cnt || 0)) },
        { name: '通话量', type: 'line', smooth: true, data: sales.calls.map((m: any) => Number(m.cnt || 0)) }
      ]
    })
  }
}

async function loadOverview() {
  const { data } = await analysisApi.overview(Number(year.value)) as any
  const months = data?.months || []
  overviewMonths.value = months
  summary.yearReceipt = months.reduce((s: number, m: any) => s + Number(m.receipt || 0), 0)
  summary.yearOrders = months.reduce((s: number, m: any) => s + Number(m.orderCount || 0), 0)
  summary.yearNewCustomers = months.reduce((s: number, m: any) => s + Number(m.newCustomers || 0), 0)
  await nextTick()
  drawOverview(months)
}

function drawOverview(months: Array<Record<string, any>>) {
  if (!overviewChartRef.value) return
  const chart = echarts.getInstanceByDom(overviewChartRef.value) || echarts.init(overviewChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['收款金额', '订单金额'] },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: months.map((m) => `${m.month}月`) },
    yAxis: { type: 'value' },
    series: [
      { name: '收款金额', type: 'bar', data: months.map((m) => Number(m.receipt || 0)) },
      { name: '订单金额', type: 'line', smooth: true, data: months.map((m) => Number(m.orderAmount || 0)) }
    ]
  })
}

async function loadNewOrders() {
  const { data } = await analysisApi.newOrders(Number(year.value), newOrderMonth.value) as any
  newOrderRows.value = data?.detail || []
}

async function loadRenewal() {
  const { data } = await analysisApi.renewal(Number(year.value)) as any
  renewal.monthly = data?.receivableMonthly || []
  renewal.sumReceivable = (renewal.monthly || []).reduce((s: number, m: any) => s + Number(m.receivable || 0), 0)
  renewal.sumArrears = (renewal.monthly || []).reduce((s: number, m: any) => s + Number(m.arrears || 0), 0)
  const monthly = data?.monthly || []
  renewal.confirmedOrders = monthly.reduce((s: number, m: any) => s + Number(m.cnt || 0), 0)
}

async function loadLoss() {
  const { data } = await analysisApi.loss() as any
  loss.count = Number(data?.count || 0)
  loss.list = data?.list || []
}

async function loadCustomerValue() {
  const { data } = await analysisApi.customerValue() as any
  customerValueBands.value = data?.bands || []
  await nextTick()
  if (valueChartRef.value) {
    const chart = echarts.getInstanceByDom(valueChartRef.value) || echarts.init(valueChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie', radius: ['40%', '68%'],
        data: customerValueBands.value.map((b: any) => ({ name: `${b.band} 类客户`, value: Number(b.cnt || 0) }))
      }]
    })
  }
}

async function loadLeadRoi() {
  const { data } = await analysisApi.leadRoi() as any
  leadRows.value = (data?.leads || []).map((row: any) => ({
    ...row,
    sourceLabel: SOURCE_LABELS[Number(row.source)] || `来源${row.source}`
  }))
}

function reloadOverview() {
  loadSales()
  loadOverview()
  loadNewOrders()
  loadRenewal()
  loadLeadRoi()
}

onMounted(() => {
  reloadOverview()
  loadLoss()
  loadCustomerValue()
})
</script>

<style scoped>
.analysis-page { padding: 18px 22px; background: #fff; border-radius: 8px; }
.ap-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.ap-head h2 { margin: 0; font-size: 18px; }
.ap-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.ap-card { padding: 14px 16px; border: 1px solid #e5e6eb; border-radius: 9px; background: #f8f9fb; }
.ap-card b { display: block; font-size: 22px; color: #1f2329; }
.ap-card.warn b { color: #f53f3f; }
.ap-card.blue b { color: #3370ff; }
.ap-card.green b { color: #14b8a6; }
.ap-card span { font-size: 12px; color: #86909c; }
.ap-chart { height: 320px; }
.ap-filter { margin-bottom: 12px; }
@media (max-width: 640px) {
  .ap-cards { grid-template-columns: 1fr; }
}
</style>
