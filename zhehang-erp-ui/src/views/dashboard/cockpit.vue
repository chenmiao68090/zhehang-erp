<template>
  <div class="cockpit-page">
    <!-- Header -->
    <header class="cockpit-header">
      <div class="header-left">
        <h1 class="header-title">{{ $t('cockpit.title') }}</h1>
        <span class="header-subtitle">{{ $t('cockpit.subtitle') }}</span>
      </div>
      <div class="header-right">
        <span class="live-dot"></span>
        <span class="realtime-text">{{ $t('cockpit.realtime') }}</span>
        <span class="current-time">{{ currentTime }}</span>
        <el-button type="primary" :icon="Refresh" circle size="small" @click="refreshAll" :loading="loading" />
      </div>
    </header>

    <!-- KPI Row -->
    <section class="kpi-row">
      <div v-for="item in kpiCards" :key="item.key" class="kpi-card">
        <div class="kpi-icon" :style="{ background: item.color }">
          <el-icon :size="22" color="#fff"><component :is="item.icon" /></el-icon>
        </div>
        <div class="kpi-body">
          <div class="kpi-value">
            <span class="kpi-number">{{ formatNumber(item.value) }}</span>
            <span v-if="item.unit" class="kpi-unit">{{ item.unit }}</span>
          </div>
          <div class="kpi-label">{{ item.label }}</div>
          <div class="kpi-rate" :class="item.rate >= 0 ? 'up' : 'down'">
            <el-icon :size="12"><CaretTop v-if="item.rate >= 0" /><CaretBottom v-else /></el-icon>
            <span>{{ Math.abs(item.rate).toFixed(1) }}%</span>
            <span class="rate-label">{{ item.rateLabel }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Row 2: Revenue Trend + Customer Source Pie -->
    <section class="chart-row">
      <div class="chart-panel chart-large">
        <div class="panel-header">
          <h3>{{ $t('cockpit.chart.revenueTrend') }}</h3>
        </div>
        <div ref="revenueTrendRef" class="chart-canvas"></div>
      </div>
      <div class="chart-panel chart-small">
        <div class="panel-header">
          <h3>{{ $t('cockpit.chart.customerSource') }}</h3>
        </div>
        <div ref="customerSourceRef" class="chart-canvas"></div>
      </div>
    </section>

    <!-- Row 3: Sales Rank + Event Feed -->
    <section class="chart-row">
      <div class="chart-panel chart-large">
        <div class="panel-header">
          <h3>{{ $t('cockpit.chart.salesRank') }}</h3>
        </div>
        <div ref="salesRankRef" class="chart-canvas"></div>
      </div>
      <div class="chart-panel chart-small">
        <div class="panel-header">
          <h3>{{ $t('cockpit.chart.recentEvents') }}</h3>
        </div>
        <div class="event-list">
          <div v-for="(evt, idx) in events" :key="idx" class="event-item">
            <span class="event-tag" :class="'event-' + evt.type">{{ $t('cockpit.event.' + evt.type) }}</span>
            <span class="event-content">{{ evt.content }}</span>
            <span class="event-time">{{ evt.time }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Row 4: Region Map + Alerts -->
    <section class="chart-row">
      <div class="chart-panel chart-large">
        <div class="panel-header">
          <h3>{{ $t('cockpit.chart.regionMap') }}</h3>
        </div>
        <div ref="regionMapRef" class="chart-canvas chart-canvas-tall"></div>
      </div>
      <div class="chart-panel chart-small">
        <div class="panel-header">
          <h3>{{ $t('cockpit.chart.alerts') }}</h3>
        </div>
        <div class="alert-grid">
          <div class="alert-card alert-danger">
            <div class="alert-num">{{ alerts.overdueReceiptCount }}</div>
            <div class="alert-label">{{ $t('cockpit.alert.overdueReceipt') }}</div>
            <div class="alert-extra">{{ $t('cockpit.unit.tenThousand') }} {{ (alerts.overdueReceiptAmount / 10000).toFixed(1) }}</div>
          </div>
          <div class="alert-card alert-warning">
            <div class="alert-num">{{ alerts.riskCustomerCount }}</div>
            <div class="alert-label">{{ $t('cockpit.alert.riskCustomer') }}</div>
          </div>
          <div class="alert-card alert-info">
            <div class="alert-num">{{ alerts.expiringContractCount }}</div>
            <div class="alert-label">{{ $t('cockpit.alert.expiringContract') }}</div>
          </div>
          <div class="alert-card alert-secondary">
            <div class="alert-num">{{ alerts.abnormalApprovalCount }}</div>
            <div class="alert-label">{{ $t('cockpit.alert.abnormalApproval') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Summary Floating Panel -->
    <div class="ai-panel" :class="{ expanded: aiExpanded }">
      <div class="ai-toggle" @click="aiExpanded = !aiExpanded">
        <el-icon :size="18"><DataAnalysis /></el-icon>
        <span v-if="!aiExpanded">{{ $t('cockpit.chart.aiSummary') }}</span>
      </div>
      <div v-if="aiExpanded" class="ai-body">
        <div class="ai-header">
          <h4>{{ $t('cockpit.chart.aiSummary') }}</h4>
          <el-button size="small" type="primary" @click="loadAiSummary" :loading="aiLoading">
            {{ aiContent ? $t('cockpit.ai.regenerate') : $t('cockpit.ai.generate') }}
          </el-button>
        </div>
        <div v-if="aiLoading" class="ai-loading">{{ $t('cockpit.ai.analyzing') }}</div>
        <div v-else-if="aiContent" class="ai-content" v-html="renderMarkdown(aiContent)"></div>
        <div v-else class="ai-empty">{{ $t('cockpit.ai.empty') }}</div>
        <div v-if="aiProvider" class="ai-footer">{{ $t('cockpit.ai.poweredBy', { provider: aiProvider }) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import {
  Refresh, CaretTop, CaretBottom, DataAnalysis,
  User as UserIcon, Money, TrendCharts, Briefcase, List as ListIcon, Connection
} from '@element-plus/icons-vue'
import {
  getCockpitKpi, getRevenueTrend, getCustomerSource,
  getSalesRank, getRecentEvents, getRegionDistribution,
  getAlerts, getAiSummary
} from '@/api/cockpit'
import type { CockpitKpi, RecentEvent, AlertData } from '@/api/cockpit'

const { t } = useI18n()

// State
const loading = ref(false)
const currentTime = ref('')
const events = ref<RecentEvent[]>([])
const alerts = reactive<AlertData>({
  overdueReceiptCount: 0, overdueReceiptAmount: 0,
  riskCustomerCount: 0, expiringContractCount: 0,
  stockWarningCount: 0, abnormalApprovalCount: 0
})
const aiExpanded = ref(false)
const aiLoading = ref(false)
const aiContent = ref('')
const aiProvider = ref('')

// KPI
const kpiData = ref<CockpitKpi | null>(null)
const kpiCards = computed(() => {
  const d = kpiData.value
  if (!d) return []
  return [
    { key: 'customers', label: t('cockpit.kpi.totalCustomers'), value: d.totalCustomers, rate: d.customerGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'UserIcon', color: '#F26522', unit: '' },
    { key: 'newCustomers', label: t('cockpit.kpi.newCustomers'), value: d.newCustomersMonth, rate: d.newCustomerGrowthRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Connection', color: '#10B981', unit: '' },
    { key: 'revenue', label: t('cockpit.kpi.totalRevenue'), value: (d.totalRevenue / 10000).toFixed(0), rate: d.revenueGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'TrendCharts', color: '#3B82F6', unit: t('cockpit.unit.tenThousand') },
    { key: 'receipt', label: t('cockpit.kpi.monthReceipt'), value: (d.monthReceipt / 10000).toFixed(0), rate: d.receiptGrowthRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Money', color: '#8B5CF6', unit: t('cockpit.unit.tenThousand') },
    { key: 'contracts', label: t('cockpit.kpi.pendingContracts'), value: d.pendingContracts, rate: d.pendingContractsRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Briefcase', color: '#F59E0B', unit: '' },
    { key: 'employees', label: t('cockpit.kpi.totalEmployees'), value: d.totalEmployees, rate: d.employeeGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'ListIcon', color: '#06B6D4', unit: '' }
  ]
})

// Chart refs
const revenueTrendRef = ref<HTMLDivElement>()
const customerSourceRef = ref<HTMLDivElement>()
const salesRankRef = ref<HTMLDivElement>()
const regionMapRef = ref<HTMLDivElement>()
let revenueTrendChart: echarts.ECharts | null = null
let customerSourceChart: echarts.ECharts | null = null
let salesRankChart: echarts.ECharts | null = null
let regionMapChart: echarts.ECharts | null = null

// Timer
let refreshTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

// Theme colors
const COLORS = ['#F26522', '#FF8C42', '#FFB347', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4']

function updateClock() {
  const d = new Date()
  currentTime.value = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatNumber(val: any): string {
  const n = Number(val)
  if (isNaN(n)) return String(val)
  return n.toLocaleString()
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

// Data loaders
async function loadKpi() {
  try {
    const res: any = await getCockpitKpi()
    kpiData.value = res.data
  } catch { /* fallback */ }
}

async function loadRevenueTrend() {
  try {
    const res: any = await getRevenueTrend()
    const data = res.data || []
    if (!revenueTrendChart && revenueTrendRef.value) {
      revenueTrendChart = echarts.init(revenueTrendRef.value)
    }
    const months = data.map((d: any) => d.month)
    revenueTrendChart?.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: [t('cockpit.chart.revenue'), t('cockpit.chart.receipt')], textStyle: { color: '#94a3b8' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: months, axisLabel: { color: '#94a3b8' }, axisLine: { lineStyle: { color: '#334155' } } },
      yAxis: [
        { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { lineStyle: { color: '#1e293b' } } },
        { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { show: false } }
      ],
      series: [
        { name: t('cockpit.chart.revenue'), type: 'bar', data: data.map((d: any) => d.revenue), itemStyle: { color: '#F26522', borderRadius: [4, 4, 0, 0] }, barWidth: '35%' },
        { name: t('cockpit.chart.receipt'), type: 'line', yAxisIndex: 1, data: data.map((d: any) => d.receipt), smooth: true, lineStyle: { color: '#3B82F6', width: 3 }, itemStyle: { color: '#3B82F6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) } }
      ]
    })
  } catch { /* fallback */ }
}

async function loadCustomerSource() {
  try {
    const res: any = await getCustomerSource()
    const data = res.data || []
    if (!customerSourceChart && customerSourceRef.value) {
      customerSourceChart = echarts.init(customerSourceRef.value)
    }
    customerSourceChart?.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#94a3b8' } },
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
        label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: data.map((d: any, i: number) => ({ name: d.source, value: d.count, itemStyle: { color: COLORS[i % COLORS.length] } }))
      }]
    })
  } catch { /* fallback */ }
}

async function loadSalesRank() {
  try {
    const res: any = await getSalesRank()
    const data = (res.data || []).reverse()
    if (!salesRankChart && salesRankRef.value) {
      salesRankChart = echarts.init(salesRankRef.value)
    }
    salesRankChart?.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '10%', top: '3%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      yAxis: { type: 'category', data: data.map((d: any) => d.employeeName), axisLabel: { color: '#94a3b8' }, axisLine: { lineStyle: { color: '#334155' } } },
      series: [{
        type: 'bar', data: data.map((d: any, i: number) => ({
          value: d.amount,
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#F26522' }, { offset: 1, color: '#FF8C42' }]), borderRadius: [0, 4, 4, 0] }
        })),
        barWidth: '60%',
        label: { show: true, position: 'right', color: '#94a3b8', formatter: (p: any) => (p.value / 10000).toFixed(0) + 'w' }
      }]
    })
  } catch { /* fallback */ }
}

async function loadEvents() {
  try {
    const res: any = await getRecentEvents()
    events.value = res.data || []
  } catch { /* fallback */ }
}

async function loadRegionMap() {
  try {
    const res: any = await getRegionDistribution()
    const data = res.data || []
    if (!regionMapChart && regionMapRef.value) {
      regionMapChart = echarts.init(regionMapRef.value)
    }
    // Use scatter on map simulation - since china map requires geo json registration
    // We'll use a bar chart as region distribution fallback
    const provinces = data.map((d: any) => d.province)
    const counts = data.map((d: any) => d.count)
    regionMapChart?.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '6%', top: '3%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: provinces, axisLabel: { color: '#94a3b8', rotate: 30 }, axisLine: { lineStyle: { color: '#334155' } } },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      series: [{
        type: 'bar', data: counts.map((v: number, i: number) => ({
          value: v,
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#F26522' }, { offset: 1, color: 'rgba(242,101,34,0.3)' }]), borderRadius: [4, 4, 0, 0] }
        })),
        barWidth: '60%'
      }]
    })
  } catch { /* fallback */ }
}

async function loadAlerts() {
  try {
    const res: any = await getAlerts()
    Object.assign(alerts, res.data || {})
  } catch { /* fallback */ }
}

async function loadAiSummary() {
  aiLoading.value = true
  aiContent.value = ''
  try {
    const res: any = await getAiSummary()
    aiContent.value = res.data?.content || ''
    aiProvider.value = res.data?.provider || ''
  } catch { /* fallback */ }
  aiLoading.value = false
}

async function refreshAll() {
  loading.value = true
  await Promise.all([
    loadKpi(), loadRevenueTrend(), loadCustomerSource(),
    loadSalesRank(), loadEvents(), loadRegionMap(), loadAlerts()
  ])
  loading.value = false
}

function handleResize() {
  revenueTrendChart?.resize()
  customerSourceChart?.resize()
  salesRankChart?.resize()
  regionMapChart?.resize()
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  refreshAll()
  refreshTimer = setInterval(refreshAll, 30000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  window.removeEventListener('resize', handleResize)
  revenueTrendChart?.dispose()
  customerSourceChart?.dispose()
  salesRankChart?.dispose()
  regionMapChart?.dispose()
})
</script>

<style lang="scss" scoped>
.cockpit-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  position: relative;
}

// Header
.cockpit-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 16px 24px;
  background: rgba(30, 41, 59, 0.8); border-radius: 12px;
  border: 1px solid rgba(242, 101, 34, 0.2);
}
.header-left {
  .header-title { font-size: 24px; font-weight: 700; color: #F26522; margin: 0; }
  .header-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; display: block; }
}
.header-right {
  display: flex; align-items: center; gap: 12px;
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; animation: pulse 2s infinite; }
  .realtime-text { font-size: 12px; color: #10B981; }
  .current-time { font-size: 14px; color: #94a3b8; font-family: 'Courier New', monospace; }
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

// KPI Row
.kpi-row {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 20px;
}
.kpi-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 16px; background: rgba(30, 41, 59, 0.8);
  border-radius: 12px; border: 1px solid #334155;
  transition: all 0.3s;
  &:hover { transform: translateY(-3px); border-color: rgba(242, 101, 34, 0.4); box-shadow: 0 8px 24px rgba(242, 101, 34, 0.15); }
}
.kpi-icon {
  width: 46px; height: 46px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.kpi-body { flex: 1; min-width: 0; }
.kpi-value { display: flex; align-items: baseline; gap: 4px; }
.kpi-number { font-size: 22px; font-weight: 700; color: #f8fafc; }
.kpi-unit { font-size: 12px; color: #64748b; }
.kpi-label { font-size: 12px; color: #64748b; margin-top: 4px; }
.kpi-rate {
  display: flex; align-items: center; gap: 3px; font-size: 11px; margin-top: 4px;
  &.up { color: #10B981; }
  &.down { color: #EF4444; }
  .rate-label { color: #475569; margin-left: 2px; }
}

// Chart rows
.chart-row { display: flex; gap: 16px; margin-bottom: 20px; }
.chart-panel {
  background: rgba(30, 41, 59, 0.8); border-radius: 12px; border: 1px solid #334155;
  padding: 16px 20px; display: flex; flex-direction: column;
}
.chart-large { flex: 6; }
.chart-small { flex: 4; }
.panel-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  h3 { font-size: 15px; font-weight: 600; color: #e2e8f0; margin: 0; }
}
.chart-canvas { flex: 1; min-height: 280px; }
.chart-canvas-tall { min-height: 340px; }

// Events
.event-list { flex: 1; overflow-y: auto; max-height: 310px; display: flex; flex-direction: column; gap: 8px; }
.event-item {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  background: rgba(15, 23, 42, 0.6); border-radius: 8px;
  transition: background 0.2s;
  &:hover { background: rgba(242, 101, 34, 0.08); }
}
.event-tag {
  font-size: 11px; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; font-weight: 500;
  &.event-sign { background: rgba(16, 185, 129, 0.15); color: #10B981; }
  &.event-receipt { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
  &.event-follow { background: rgba(242, 101, 34, 0.15); color: #F26522; }
  &.event-lead { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; }
  &.event-alert { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
}
.event-content { flex: 1; font-size: 13px; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event-time { font-size: 11px; color: #475569; flex-shrink: 0; }

// Alerts
.alert-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; flex: 1; }
.alert-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 20px 12px; border-radius: 10px; text-align: center;
  &.alert-danger { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
  &.alert-warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); }
  &.alert-info { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); }
  &.alert-secondary { background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(100, 116, 139, 0.3); }
}
.alert-num { font-size: 28px; font-weight: 700; color: #f8fafc; }
.alert-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
.alert-extra { font-size: 11px; color: #64748b; margin-top: 4px; }

// AI Panel
.ai-panel {
  position: fixed; right: 20px; top: 50%; transform: translateY(-50%);
  z-index: 100; transition: all 0.3s;
  &.expanded { width: 380px; }
}
.ai-toggle {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px; background: #F26522; border-radius: 8px;
  cursor: pointer; color: #fff; font-size: 13px; font-weight: 500;
  box-shadow: 0 4px 16px rgba(242, 101, 34, 0.4);
  transition: all 0.2s;
  &:hover { background: #d9551a; transform: scale(1.05); }
}
.ai-body {
  margin-top: 8px; background: rgba(30, 41, 59, 0.95); border: 1px solid #334155;
  border-radius: 12px; padding: 16px; max-height: 500px; overflow-y: auto;
  backdrop-filter: blur(12px);
}
.ai-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  h4 { font-size: 14px; font-weight: 600; color: #e2e8f0; margin: 0; }
}
.ai-loading { text-align: center; padding: 24px; color: #F26522; font-size: 14px; }
.ai-content {
  font-size: 13px; line-height: 1.7; color: #cbd5e1;
  :deep(h3) { font-size: 15px; color: #F26522; margin: 12px 0 6px; }
  :deep(h4) { font-size: 14px; color: #e2e8f0; margin: 10px 0 4px; }
  :deep(strong) { color: #f8fafc; }
  :deep(ul) { padding-left: 16px; margin: 4px 0; }
  :deep(li) { margin: 2px 0; }
}
.ai-empty { text-align: center; padding: 24px; color: #64748b; font-size: 13px; }
.ai-footer { text-align: right; font-size: 11px; color: #475569; margin-top: 10px; padding-top: 8px; border-top: 1px solid #1e293b; }

// Responsive
@media (max-width: 1440px) {
  .kpi-row { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .chart-row { flex-direction: column; }
  .chart-large, .chart-small { flex: 1; }
}
</style>
