<template>
  <div class="report-page">
    <!-- ============== 页头 ============== -->
    <div class="page-header">
      <div class="header-text">
        <div class="eyebrow">{{ $t('cc.report.eyebrow') }}</div>
        <h2 class="title">{{ $t('cc.report.title') }}</h2>
        <p class="subtitle">{{ $t('cc.report.subtitle') }}</p>
      </div>
      <div class="header-aside">
        <div class="now-time">{{ nowText }}</div>
        <div class="now-tag">{{ periodTag }}</div>
      </div>
    </div>

    <!-- ============== 工具栏 ============== -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="period" @change="onPeriodChange">
          <el-radio-button label="day">{{ $t('cc.report.period.day') }}</el-radio-button>
          <el-radio-button label="week">{{ $t('cc.report.period.week') }}</el-radio-button>
          <el-radio-button label="month">{{ $t('cc.report.period.month') }}</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="dateRange"
          :type="datePickerType"
          range-separator="→"
          :start-placeholder="$t('cc.report.action.startPlaceholder')"
          :end-placeholder="$t('cc.report.action.endPlaceholder')"
          :format="dateFormat"
          :value-format="dateFormat"
          class="date-picker"
          @change="loadAll"
        />
      </div>
      <div class="toolbar-right">
        <el-button :icon="Refresh" plain @click="loadAll">{{ $t('cc.report.action.refresh') }}</el-button>
        <el-button type="primary" :icon="Download" @click="onExport">{{ $t('cc.report.action.export') }}</el-button>
      </div>
    </div>

    <!-- ============== KPI 指标卡 ============== -->
    <div class="kpi-grid">
      <!-- 总通话数 -->
      <div class="kpi-card kpi-total">
        <div class="kpi-corner"></div>
        <div class="kpi-head">
          <span class="kpi-eyebrow">TOTAL · CALLS</span>
          <span class="kpi-tag">{{ $t('cc.report.kpi.currentPeriod') }}</span>
        </div>
        <div class="kpi-label">{{ $t('cc.report.kpi.totalCalls') }}</div>
        <div class="kpi-value">
          <span class="num">{{ kpi.totalCalls.toLocaleString() }}</span>
        </div>
        <div class="kpi-meta">
          <span class="kpi-trend" :class="kpi.totalTrend >= 0 ? 'up' : 'down'">
            <el-icon><component :is="kpi.totalTrend >= 0 ? ArrowUp : ArrowDown" /></el-icon>
            {{ Math.abs(kpi.totalTrend).toFixed(1) }}%
          </span>
          <span class="vs">{{ $t('cc.report.kpi.comparePrev') }}</span>
        </div>
        <div class="kpi-bar">
          <div class="kpi-bar-fill" :style="{ width: '76%' }"></div>
        </div>
      </div>

      <!-- 接通率 -->
      <div class="kpi-card kpi-answer">
        <div class="kpi-corner"></div>
        <div class="kpi-head">
          <span class="kpi-eyebrow">ANSWER · RATE</span>
          <span class="kpi-tag">{{ $t('cc.report.kpi.sla') }}</span>
        </div>
        <div class="kpi-label">{{ $t('cc.report.kpi.answerRate') }}</div>
        <div class="kpi-value with-ring">
          <div class="ring-wrap">
            <div ref="ringRef" class="kpi-ring"></div>
            <div class="ring-center">
              <div class="ring-num">{{ (kpi.answerRate * 100).toFixed(1) }}<small>%</small></div>
            </div>
          </div>
          <div class="ring-side">
            <div class="ring-row"><i class="dot dot-gold"></i><span>{{ $t('cc.report.kpi.answered') }}</span><b>{{ kpi.answeredCalls.toLocaleString() }}</b></div>
            <div class="ring-row"><i class="dot dot-mute"></i><span>{{ $t('cc.report.kpi.missed') }}</span><b>{{ kpi.missedCalls.toLocaleString() }}</b></div>
          </div>
        </div>
      </div>

      <!-- 平均通话时长 -->
      <div class="kpi-card kpi-duration">
        <div class="kpi-corner"></div>
        <div class="kpi-head">
          <span class="kpi-eyebrow">AVG · DURATION</span>
          <span class="kpi-tag">mm:ss</span>
        </div>
        <div class="kpi-label">{{ $t('cc.report.kpi.avgDuration') }}</div>
        <div class="kpi-value">
          <span class="num mono">{{ formatDur(kpi.avgDuration) }}</span>
        </div>
        <div class="kpi-meta">
          <span class="kpi-trend" :class="kpi.durationTrend >= 0 ? 'up' : 'down'">
            <el-icon><component :is="kpi.durationTrend >= 0 ? ArrowUp : ArrowDown" /></el-icon>
            {{ Math.abs(kpi.durationTrend).toFixed(1) }}%
          </span>
          <span class="vs">{{ $t('cc.report.kpi.comparePrev') }}</span>
        </div>
        <div ref="sparkRef" class="kpi-spark"></div>
      </div>

      <!-- 客户满意度 -->
      <div class="kpi-card kpi-satisfaction">
        <div class="kpi-corner"></div>
        <div class="kpi-head">
          <span class="kpi-eyebrow">SATISFACTION</span>
          <span class="kpi-tag">CSAT</span>
        </div>
        <div class="kpi-label">{{ $t('cc.report.kpi.satisfaction') }}</div>
        <div class="kpi-value">
          <span class="num">{{ kpi.satisfaction.toFixed(2) }}</span>
          <span class="unit">/ 5.0</span>
        </div>
        <div class="kpi-stars">
          <span
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ on: n <= Math.floor(kpi.satisfaction), half: n === Math.ceil(kpi.satisfaction) && kpi.satisfaction % 1 >= 0.3 && kpi.satisfaction % 1 < 0.8 }"
          >★</span>
        </div>
        <div class="kpi-sub">{{ $t('cc.report.kpi.satisfactionBase', { count: kpi.satisfactionCount.toLocaleString() }) }}</div>
      </div>
    </div>

    <!-- ============== 通话趋势 ============== -->
    <div class="chart-card trend-card">
      <div class="card-head">
        <div class="card-head-text">
          <div class="card-eyebrow">{{ $t('cc.report.chart.trendEyebrow') }}</div>
          <div class="card-title">{{ $t('cc.report.chart.trendTitle') }}</div>
        </div>
        <div class="legend-pills">
          <span class="pill pill-inbound"><i></i>{{ $t('cc.report.chart.legendInbound') }}</span>
          <span class="pill pill-outbound"><i></i>{{ $t('cc.report.chart.legendOutbound') }}</span>
        </div>
      </div>
      <div ref="trendRef" class="chart-canvas trend-canvas"></div>
    </div>

    <!-- ============== 热力图 + 坐席排名 ============== -->
    <div class="dual-grid">
      <div class="chart-card heatmap-card">
        <div class="card-head">
          <div class="card-head-text">
            <div class="card-eyebrow">{{ $t('cc.report.chart.heatmapEyebrow') }}</div>
            <div class="card-title">{{ $t('cc.report.chart.heatmapTitle') }}</div>
          </div>
          <div class="card-meta">{{ $t('cc.report.chart.heatmapMeta') }}</div>
        </div>
        <div ref="heatmapRef" class="chart-canvas heatmap-canvas"></div>
      </div>

      <div class="chart-card ranking-card">
        <div class="card-head">
          <div class="card-head-text">
            <div class="card-eyebrow">{{ $t('cc.report.chart.rankingEyebrow') }}</div>
            <div class="card-title">{{ $t('cc.report.chart.rankingTitle') }}</div>
          </div>
          <el-radio-group v-model="rankBy" size="small" @change="renderRanking">
            <el-radio-button label="answered">{{ $t('cc.report.chart.rankByAnswered') }}</el-radio-button>
            <el-radio-button label="satisfaction">{{ $t('cc.report.chart.rankBySatisfaction') }}</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="rankingRef" class="chart-canvas ranking-canvas"></div>
      </div>
    </div>

    <!-- ============== 数据表格 ============== -->
    <div class="chart-card table-card">
      <div class="card-head">
        <div class="card-head-text">
          <div class="card-eyebrow">{{ $t('cc.report.table.eyebrow') }}</div>
          <div class="card-title">{{ $t('cc.report.table.title') }}</div>
        </div>
        <div class="card-meta">{{ $t('cc.report.table.meta', { count: tableData.length }) }}</div>
      </div>
      <el-table
        :data="tableData"
        stripe
        show-summary
        :summary-method="getSummaries"
        class="report-table"
        :default-sort="{ prop: 'date', order: 'descending' }"
      >
        <el-table-column prop="date" :label="$t('cc.report.table.date')" sortable min-width="120">
          <template #default="{ row }">
            <span class="cell-date">{{ row.date }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="inbound" :label="$t('cc.report.table.inbound')" sortable align="right" min-width="100">
          <template #default="{ row }">
            <span class="cell-num gold">{{ row.inbound }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="outbound" :label="$t('cc.report.table.outbound')" sortable align="right" min-width="100">
          <template #default="{ row }">
            <span class="cell-num cyan">{{ row.outbound }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('cc.report.table.answerRate')"
          sortable
          :sort-by="(r) => r.answered / Math.max(r.inbound, 1)"
          align="right"
          min-width="120"
        >
          <template #default="{ row }">
            <span class="rate" :class="{ good: row.answered / row.inbound > 0.9, warn: row.answered / row.inbound < 0.8 }">
              {{ ((row.answered / Math.max(row.inbound, 1)) * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('cc.report.table.avgDuration')" prop="avgTalkSec" sortable align="right" min-width="110">
          <template #default="{ row }">
            <span class="cell-num mono">{{ formatDur(row.avgTalkSec) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('cc.report.table.serviceLevel')" prop="serviceLevel" sortable align="right" min-width="180">
          <template #default="{ row }">
            <div class="sl-bar">
              <div class="sl-fill" :style="{ width: (row.serviceLevel * 100) + '%' }"></div>
              <span class="sl-text">{{ (row.serviceLevel * 100).toFixed(0) }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('cc.report.table.satisfaction')" align="right" min-width="110">
          <template #default="{ row }">
            <span class="sat-score">★ {{ getSatScore(row).toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getReportData, exportReport, type ReportDataPoint } from '@/api/call-center'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type Period = 'day' | 'week' | 'month'

const period = ref<Period>('day')
const dateRange = ref<string[]>([])
const rankBy = ref<'answered' | 'satisfaction'>('answered')
const tableData = ref<ReportDataPoint[]>([])
const nowText = ref('')

const periodTag = computed(() =>
  period.value === 'day' ? t('cc.report.period.dayTag')
    : period.value === 'week' ? t('cc.report.period.weekTag')
    : t('cc.report.period.monthTag')
)
const datePickerType = computed<'daterange' | 'monthrange'>(() =>
  period.value === 'month' ? 'monthrange' : 'daterange'
)
const dateFormat = computed(() => (period.value === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'))

const kpi = reactive({
  totalCalls: 0,
  totalTrend: 8.4,
  answerRate: 0,
  answeredCalls: 0,
  missedCalls: 0,
  avgDuration: 0,
  durationTrend: -2.1,
  satisfaction: 4.62,
  satisfactionCount: 0
})

const trendRef = ref<HTMLElement>()
const heatmapRef = ref<HTMLElement>()
const rankingRef = ref<HTMLElement>()
const ringRef = ref<HTMLElement>()
const sparkRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let heatmapChart: echarts.ECharts | null = null
let rankingChart: echarts.ECharts | null = null
let ringChart: echarts.ECharts | null = null
let sparkChart: echarts.ECharts | null = null
let clockTimer: any = null

const COLORS = {
  gold: '#D4AF37',
  green: '#00D084',
  red: '#FF6B6B',
  cyan: '#4ECDC4',
  purple: '#9B59B6',
  text: 'rgba(255,255,255,0.72)',
  axis: 'rgba(255,255,255,0.16)'
}

const tooltipBase = {
  backgroundColor: 'rgba(15,12,20,0.94)',
  borderColor: COLORS.gold,
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: '#F0E6D3', fontSize: 12, fontFamily: 'inherit' },
  extraCssText: 'box-shadow: 0 12px 32px rgba(0,0,0,0.55); backdrop-filter: blur(8px); border-radius: 6px;'
}

function pad(n: number) { return String(n).padStart(2, '0') }

function formatDur(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return pad(m) + ':' + pad(s)
}

function getSatScore(row: ReportDataPoint) {
  return Math.min(5, Math.max(4, 4 + (row.serviceLevel - 0.85) * 5))
}

function tick() {
  const d = new Date()
  nowText.value =
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
}

async function loadAll() {
  const res = await getReportData({ dimension: period.value })
  tableData.value = res.data
  computeKpi(res.data)
  await nextTick()
  renderTrend()
  renderHeatmap()
  renderRanking()
  renderRing()
  renderSpark()
}

function computeKpi(data: ReportDataPoint[]) {
  if (!data.length) return
  const totalIn = data.reduce((a, b) => a + b.inbound, 0)
  const totalOut = data.reduce((a, b) => a + b.outbound, 0)
  const totalAns = data.reduce((a, b) => a + b.answered, 0)
  const avgDur = Math.round(data.reduce((a, b) => a + b.avgTalkSec, 0) / data.length)
  const avgSl = data.reduce((a, b) => a + b.serviceLevel, 0) / data.length

  kpi.totalCalls = totalIn + totalOut
  kpi.answeredCalls = totalAns
  kpi.missedCalls = totalIn - totalAns
  kpi.answerRate = totalAns / Math.max(totalIn, 1)
  kpi.avgDuration = avgDur
  kpi.satisfaction = Math.min(5, Math.max(4, 4 + (avgSl - 0.85) * 5))
  kpi.satisfactionCount = totalAns
  kpi.totalTrend = +(Math.sin(data.length) * 12 + 5.2).toFixed(1)
  kpi.durationTrend = +(Math.cos(data.length) * 6 - 1.4).toFixed(1)
}

function renderTrend() {
  if (!trendRef.value) return
  if (!trendChart) trendChart = echarts.init(trendRef.value)
  const data = tableData.value
  trendChart.setOption({
    grid: { top: 28, left: 56, right: 32, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      ...tooltipBase,
      axisPointer: {
        type: 'cross',
        lineStyle: { color: COLORS.gold, opacity: 0.45, type: 'dashed' },
        crossStyle: { color: COLORS.gold, opacity: 0.45 }
      }
    },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      boundaryGap: false,
      axisLine: { lineStyle: { color: COLORS.axis } },
      axisLabel: { color: COLORS.text, fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: COLORS.text, fontSize: 11 },
      splitLine: { lineStyle: { color: COLORS.axis, type: 'dashed' } }
    },
    series: [
      {
        name: t('cc.report.chart.legendInbound'), type: 'line', smooth: true, showSymbol: false,
        data: data.map(d => d.inbound),
        lineStyle: { width: 2.6, color: COLORS.gold, shadowColor: 'rgba(212,175,55,0.5)', shadowBlur: 8 },
        itemStyle: { color: COLORS.gold, borderColor: '#0F0C14', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(212,175,55,0.48)' },
            { offset: 1, color: 'rgba(212,175,55,0.02)' }
          ])
        },
        emphasis: { focus: 'series', scale: true }
      },
      {
        name: t('cc.report.chart.legendOutbound'), type: 'line', smooth: true, showSymbol: false,
        data: data.map(d => d.outbound),
        lineStyle: { width: 2.6, color: COLORS.cyan, shadowColor: 'rgba(78,205,196,0.45)', shadowBlur: 8 },
        itemStyle: { color: COLORS.cyan, borderColor: '#0F0C14', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(78,205,196,0.42)' },
            { offset: 1, color: 'rgba(78,205,196,0.02)' }
          ])
        },
        emphasis: { focus: 'series', scale: true }
      }
    ]
  })
}
function renderHeatmap() {
  if (!heatmapRef.value) return
  if (!heatmapChart) heatmapChart = echarts.init(heatmapRef.value)
  const days = [
    t('cc.report.weekday.mon'),
    t('cc.report.weekday.tue'),
    t('cc.report.weekday.wed'),
    t('cc.report.weekday.thu'),
    t('cc.report.weekday.fri'),
    t('cc.report.weekday.sat'),
    t('cc.report.weekday.sun')
  ]
  const hours = Array.from({ length: 24 }).map((_, h) => pad(h) + ':00')
  const data: [number, number, number][] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      let v: number
      if (h >= 9 && h <= 11) v = 60 + Math.round(Math.sin(d + h) * 18) + 10
      else if (h >= 14 && h <= 17) v = 72 + Math.round(Math.cos(d + h) * 16) + 8
      else if (h >= 8 && h <= 18) v = 32 + Math.round(Math.abs(Math.sin(h * d)) * 18)
      else if (h >= 19 && h <= 22) v = 18 + Math.round(Math.abs(Math.cos(h)) * 12)
      else v = Math.round(Math.abs(Math.sin(h)) * 8)
      if (d >= 5) v = Math.round(v * 0.5)
      data.push([h, d, Math.max(0, v)])
    }
  }
  heatmapChart.setOption({
    tooltip: {
      ...tooltipBase,
      formatter: (p: any) =>
        days[p.value[1]] + ' ' + hours[p.value[0]] +
        '<br/><span style="color:#D4AF37;font-weight:600;font-size:14px">' + p.value[2] + '</span> ' + t('cc.report.chart.unitCall')
    },
    grid: { top: 16, left: 56, right: 24, bottom: 64 },
    xAxis: {
      type: 'category', data: hours,
      axisLine: { lineStyle: { color: COLORS.axis } },
      axisTick: { show: false },
      axisLabel: { color: COLORS.text, fontSize: 10, interval: 1 }
    },
    yAxis: {
      type: 'category', data: days,
      axisLine: { lineStyle: { color: COLORS.axis } },
      axisTick: { show: false },
      axisLabel: { color: COLORS.text, fontSize: 11 }
    },
    visualMap: {
      min: 0, max: 100, calculable: true,
      orient: 'horizontal', left: 'center', bottom: 8,
      itemWidth: 12, itemHeight: 160,
      textStyle: { color: COLORS.text, fontSize: 10 },
      inRange: { color: ['rgba(212,175,55,0.04)', 'rgba(212,175,55,0.28)', '#D4AF37', '#FF6B6B'] }
    },
    series: [{
      name: t('cc.report.chart.density'), type: 'heatmap', data, progressive: 1000,
      label: { show: false },
      itemStyle: { borderRadius: 3, borderColor: 'rgba(15,12,20,0.85)', borderWidth: 1 },
      emphasis: { itemStyle: { borderColor: COLORS.gold, borderWidth: 1.5, shadowBlur: 10, shadowColor: COLORS.gold } }
    }]
  })
}

function renderRanking() {
  if (!rankingRef.value) return
  if (!rankingChart) rankingChart = echarts.init(rankingRef.value)
  const agents = [
    { name: '张敏', answered: 248, satisfaction: 4.92 },
    { name: '陈静', answered: 232, satisfaction: 4.85 },
    { name: '李伟', answered: 219, satisfaction: 4.71 },
    { name: '王芳', answered: 205, satisfaction: 4.68 },
    { name: '赵磊', answered: 198, satisfaction: 4.55 },
    { name: '孙浩', answered: 176, satisfaction: 4.42 },
    { name: '周婷', answered: 163, satisfaction: 4.31 },
    { name: '吴江', answered: 142, satisfaction: 4.10 }
  ]
  const key = rankBy.value
  const sorted = [...agents].sort((a: any, b: any) => b[key] - a[key])
  const max = (sorted[0] as any)[key]
  rankingChart.setOption({
    tooltip: {
      ...tooltipBase, trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(212,175,55,0.08)' } },
      formatter: (p: any) => {
        const item = p[0]
        const suffix = key === 'satisfaction' ? ' / 5.0' : ' ' + t('cc.report.chart.unitCall')
        return item.name + '<br/><span style="color:#D4AF37;font-weight:600">' + item.value + '</span>' + suffix
      }
    },
    grid: { top: 12, left: 64, right: 56, bottom: 12 },
    xAxis: {
      type: 'value',
      max: key === 'satisfaction' ? 5 : Math.ceil(max / 50) * 50,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: COLORS.text, fontSize: 10 },
      splitLine: { lineStyle: { color: COLORS.axis, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: sorted.map(a => a.name).reverse(),
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: COLORS.text, fontSize: 12, fontWeight: 500 }
    },
    series: [{
      type: 'bar',
      data: sorted.map((a: any) => a[key]).reverse(),
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(212,175,55,0.18)' },
          { offset: 0.6, color: 'rgba(212,175,55,0.7)' },
          { offset: 1, color: '#F5D770' }
        ]),
        shadowColor: 'rgba(212,175,55,0.4)', shadowBlur: 10
      },
      label: {
        show: true, position: 'right',
        color: COLORS.gold, fontWeight: 600, fontSize: 11,
        fontFamily: 'DIN Alternate, monospace'
      }
    }]
  })
}

function renderRing() {
  if (!ringRef.value) return
  if (!ringChart) ringChart = echarts.init(ringRef.value)
  const pct = +(kpi.answerRate * 100).toFixed(1)
  ringChart.setOption({
    series: [{
      type: 'pie', radius: ['68%', '92%'], silent: true, startAngle: 90,
      label: { show: false }, labelLine: { show: false },
      data: [
        { value: pct, name: 'A', itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#F5D770' },
            { offset: 1, color: '#D4AF37' }
          ])
        } },
        { value: 100 - pct, name: 'B', itemStyle: { color: 'rgba(255,255,255,0.06)' } }
      ]
    }]
  })
}

function renderSpark() {
  if (!sparkRef.value) return
  if (!sparkChart) sparkChart = echarts.init(sparkRef.value)
  sparkChart.setOption({
    grid: { top: 2, left: 0, right: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: tableData.value.map(d => d.date), boundaryGap: false },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line', smooth: true, showSymbol: false,
      data: tableData.value.map(d => d.avgTalkSec),
      lineStyle: { width: 1.6, color: COLORS.cyan },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(78,205,196,0.45)' },
          { offset: 1, color: 'rgba(78,205,196,0)' }
        ])
      }
    }]
  })
}

function getSummaries({ columns, data }: any) {
  const res: string[] = []
  columns.forEach((_c: any, i: number) => {
    if (i === 0) { res[i] = t('cc.report.table.summary'); return }
    if (i === 1) { res[i] = data.reduce((s: number, r: any) => s + r.inbound, 0).toString(); return }
    if (i === 2) { res[i] = data.reduce((s: number, r: any) => s + r.outbound, 0).toString(); return }
    if (i === 3) {
      const ti = data.reduce((s: number, r: any) => s + r.inbound, 0) || 1
      const ta = data.reduce((s: number, r: any) => s + r.answered, 0)
      res[i] = ((ta / ti) * 100).toFixed(1) + '%'
      return
    }
    if (i === 4) {
      const avg = Math.round(data.reduce((s: number, r: any) => s + r.avgTalkSec, 0) / Math.max(data.length, 1))
      res[i] = formatDur(avg)
      return
    }
    if (i === 5) {
      const avg = data.reduce((s: number, r: any) => s + r.serviceLevel, 0) / Math.max(data.length, 1)
      res[i] = (avg * 100).toFixed(0) + '%'
      return
    }
    if (i === 6) {
      const avg = data.reduce((s: number, r: any) => s + getSatScore(r), 0) / Math.max(data.length, 1)
      res[i] = '★ ' + avg.toFixed(2)
      return
    }
    res[i] = ''
  })
  return res
}

function onPeriodChange() { loadAll() }

async function onExport() {
  ElMessage.success(t('cc.report.message.exporting'))
  try {
    await exportReport({ dimension: period.value, dateRange: dateRange.value })
    const headers = [
      t('cc.report.exportFile.headers.date'),
      t('cc.report.exportFile.headers.inbound'),
      t('cc.report.exportFile.headers.outbound'),
      t('cc.report.exportFile.headers.answerRate'),
      t('cc.report.exportFile.headers.avgDurationSec'),
      t('cc.report.exportFile.headers.serviceLevel'),
      t('cc.report.exportFile.headers.satisfaction')
    ]
    const rows = tableData.value.map(r => [
      r.date, r.inbound, r.outbound,
      ((r.answered / Math.max(r.inbound, 1)) * 100).toFixed(1) + '%',
      r.avgTalkSec,
      (r.serviceLevel * 100).toFixed(0) + '%',
      getSatScore(r).toFixed(2)
    ])
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = t('cc.report.exportFile.prefix') + '-' + period.value + '-' + Date.now() + '.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    ElMessage.success(t('cc.report.message.exportSuccess'))
  } catch {
    ElMessage.error(t('cc.report.message.exportFailed'))
  }
}

function handleResize() {
  trendChart?.resize()
  heatmapChart?.resize()
  rankingChart?.resize()
  ringChart?.resize()
  sparkChart?.resize()
}

onMounted(() => {
  tick()
  clockTimer = setInterval(tick, 1000)
  loadAll()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  heatmapChart?.dispose()
  rankingChart?.dispose()
  ringChart?.dispose()
  sparkChart?.dispose()
})
</script>

<style scoped>
/* ============== 页面骨架 ============== */
.report-page {
  padding: 18px 22px 32px;
  min-height: calc(100vh - 84px);
  background:
    radial-gradient(1200px 600px at 12% -10%, rgba(212,175,55,0.10), transparent 60%),
    radial-gradient(900px 500px at 95% 110%, rgba(78,205,196,0.06), transparent 55%),
    var(--bg-base, #0B0A0F);
  color: var(--text-primary, #F0E6D3);
}

/* ============== 页头 ============== */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 18px 4px 22px;
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(212,175,55,0.18);
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--gold-dark, #8B7355);
  margin-bottom: 6px;
}
.title {
  margin: 0;
  font-size: 26px;
  letter-spacing: 4px;
  color: var(--text-primary, #F0E6D3);
  font-weight: 500;
  position: relative;
  padding-left: 14px;
}
.title::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 3px;
  background: linear-gradient(135deg, #D4AF37, #C5A55A);
  border-radius: 2px;
}
.subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-muted, #5E5A52);
  letter-spacing: 1px;
}
.header-aside {
  display: flex; align-items: center; gap: 10px;
}
.now-time {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  font-size: 14px;
  color: var(--gold-champagne, #C5A55A);
  letter-spacing: 1px;
}
.now-tag {
  font-size: 10px;
  letter-spacing: 2px;
  padding: 3px 10px;
  border: 1px solid rgba(212,175,55,0.3);
  color: #D4AF37;
  border-radius: 12px;
}
.now-tag::before {
  content: '';
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #D4AF37;
  margin-right: 6px;
  vertical-align: 1px;
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(212,175,55,0.55); }
  70%  { box-shadow: 0 0 0 10px rgba(212,175,55,0); }
  100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
}

/* ============== 工具栏 ============== */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 18px;
  background: linear-gradient(180deg, rgba(26,26,36,0.92), rgba(18,18,26,0.92));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 12px;
}
.toolbar-left { display: flex; align-items: center; gap: 14px; }
.toolbar-right { display: flex; gap: 10px; }
.date-picker { width: 280px; }

/* ============== KPI 网格 ============== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}
@media (max-width: 1280px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
.kpi-card {
  position: relative;
  padding: 18px 20px 16px;
  background: linear-gradient(150deg, rgba(28,24,38,0.92), rgba(16,14,22,0.96));
  border: 1px solid rgba(212,175,55,0.22);
  border-radius: 14px;
  overflow: hidden;
  transition: transform .25s ease, box-shadow .25s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 38px rgba(212,175,55,0.18);
}
.kpi-corner {
  position: absolute;
  top: 0; right: 0;
  width: 70px; height: 70px;
  background:
    linear-gradient(135deg, transparent 50%, rgba(212,175,55,0.18) 50%);
  border-top-right-radius: 14px;
  pointer-events: none;
}
.kpi-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.kpi-eyebrow {
  font-size: 10px; letter-spacing: 3px;
  color: #8B7355;
}
.kpi-tag {
  font-size: 10px; letter-spacing: 1px;
  color: #D4AF37;
  padding: 2px 8px;
  border: 1px solid rgba(212,175,55,0.35);
  border-radius: 10px;
}
.kpi-label {
  font-size: 13px;
  color: rgba(240,230,211,0.75);
  letter-spacing: 2px;
  margin-bottom: 10px;
}
.kpi-value {
  display: flex; align-items: baseline; gap: 6px;
  margin-bottom: 12px;
}
.kpi-value .num {
  font-size: 34px; font-weight: 700;
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #F5D770, #D4AF37 60%, #B89530);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: 1px;
}
.kpi-value .num.mono {
  background: linear-gradient(135deg, #4ECDC4, #6FE0D6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}
.kpi-value .unit {
  font-size: 13px;
  color: #5E5A52;
}
.kpi-meta {
  display: flex; align-items: center; gap: 10px;
  font-size: 11px; color: #6E6A60;
}
.kpi-trend {
  display: inline-flex; align-items: center; gap: 4px;
  font-weight: 600; font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}
.kpi-trend.up   { color: #00D084; background: rgba(0,208,132,0.10); }
.kpi-trend.down { color: #FF6B6B; background: rgba(255,107,107,0.10); }
.kpi-trend .el-icon { font-size: 12px; }
.kpi-bar {
  margin-top: 12px;
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  overflow: hidden;
}
.kpi-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(212,175,55,0.2), #D4AF37);
  border-radius: 2px;
  transition: width .8s ease;
}

/* 接通率 ring */
.kpi-value.with-ring {
  display: flex; align-items: center; gap: 14px;
}
.ring-wrap {
  position: relative;
  width: 84px; height: 84px;
  flex-shrink: 0;
}
.kpi-ring { width: 100%; height: 100%; }
.ring-center {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.ring-num {
  font-family: 'DIN Alternate', monospace;
  font-size: 20px;
  font-weight: 700;
  color: #F5D770;
}
.ring-num small {
  font-size: 11px; margin-left: 1px; color: #C5A55A;
}
.ring-side {
  flex: 1;
  display: flex; flex-direction: column; gap: 6px;
  font-size: 11px;
  color: rgba(240,230,211,0.7);
}
.ring-row {
  display: flex; align-items: center; gap: 6px;
}
.ring-row b {
  margin-left: auto;
  font-family: 'DIN Alternate', monospace;
  color: #F0E6D3;
  font-weight: 600;
}
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.dot-gold { background: #D4AF37; box-shadow: 0 0 6px rgba(212,175,55,0.6); }
.dot-mute { background: rgba(255,255,255,0.18); }

/* spark line in duration card */
.kpi-spark { height: 38px; margin-top: 6px; }

/* satisfaction stars */
.kpi-stars { display: flex; gap: 3px; margin-bottom: 6px; }
.kpi-stars .star {
  font-size: 16px; color: rgba(255,255,255,0.14);
  transition: color .2s;
}
.kpi-stars .star.on   { color: #D4AF37; text-shadow: 0 0 6px rgba(212,175,55,0.5); }
.kpi-stars .star.half { color: #C5A55A; }
.kpi-sub {
  font-size: 11px; color: #6E6A60;
}
.kpi-sub b { color: #C5A55A; font-family: 'DIN Alternate', monospace; }

/* ============== 图表卡 ============== */
.chart-card {
  background: linear-gradient(180deg, rgba(26,26,36,0.92), rgba(16,14,22,0.94));
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 18px;
  position: relative;
}
.chart-card::before {
  content: '';
  position: absolute;
  left: 18px; right: 18px; top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent);
}
.card-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.card-eyebrow {
  font-size: 10px; letter-spacing: 3px; color: #8B7355;
}
.card-title {
  font-size: 15px; letter-spacing: 2px;
  color: #F0E6D3; font-weight: 500;
  margin-top: 2px;
}
.card-meta {
  font-size: 11px; letter-spacing: 1px; color: #6E6A60;
}
.legend-pills {
  display: flex; gap: 10px;
}
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 11px;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(240,230,211,0.85);
}
.pill i {
  width: 8px; height: 8px; border-radius: 50%;
}
.pill-inbound  i { background: #D4AF37; box-shadow: 0 0 6px rgba(212,175,55,0.6); }
.pill-outbound i { background: #4ECDC4; box-shadow: 0 0 6px rgba(78,205,196,0.6); }

.chart-canvas { width: 100%; height: 320px; }
.trend-canvas { height: 320px; }
.heatmap-canvas { height: 360px; }
.ranking-canvas { height: 360px; }

/* dual grid */
.dual-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
}
@media (max-width: 1100px) { .dual-grid { grid-template-columns: 1fr; } }
.dual-grid .chart-card { margin-bottom: 0; }

/* ============== 表格 ============== */
.report-table {
  background: transparent !important;
  --el-table-border-color: rgba(212,175,55,0.12);
  --el-table-header-bg-color: rgba(26,22,36,0.6);
  --el-table-tr-bg-color: transparent;
}
:deep(.report-table th.el-table__cell) {
  background: rgba(26,22,36,0.6) !important;
  color: #D4AF37 !important;
  font-weight: 600;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(212,175,55,0.22);
  font-size: 12px;
}
:deep(.report-table tr) { background: transparent !important; }
:deep(.report-table td.el-table__cell) {
  background: transparent !important;
  border-bottom-color: rgba(212,175,55,0.08);
  color: #F0E6D3;
}
:deep(.report-table .el-table__row--striped td.el-table__cell) {
  background: rgba(212,175,55,0.025) !important;
}
:deep(.report-table .el-table__row:hover td) {
  background: rgba(212,175,55,0.06) !important;
}
:deep(.report-table .el-table__footer-wrapper .cell) {
  color: #D4AF37 !important;
  font-weight: 700;
  letter-spacing: 1px;
}
:deep(.report-table .el-table__footer tr td) {
  background: rgba(20,16,30,0.6) !important;
  border-top: 1px solid rgba(212,175,55,0.3);
}
.cell-date {
  font-family: 'DIN Alternate', monospace;
  color: #C5A55A; letter-spacing: 1px;
}
.cell-num { font-family: 'DIN Alternate', monospace; font-weight: 600; }
.cell-num.gold { color: #D4AF37; }
.cell-num.cyan { color: #4ECDC4; }
.cell-num.mono { color: #F0E6D3; letter-spacing: 1px; }
.rate {
  font-family: 'DIN Alternate', monospace; font-weight: 600;
  color: #C5A55A;
}
.rate.good { color: #00D084; }
.rate.warn { color: #FF6B6B; }
.sat-score {
  font-family: 'DIN Alternate', monospace;
  color: #F5D770; font-weight: 600;
  letter-spacing: 1px;
}

/* 服务水平进度条 */
.sl-bar {
  position: relative;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
  margin: 6px 0 4px;
}
.sl-fill {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(212,175,55,0.4), #D4AF37 80%, #F5D770);
  border-radius: 3px;
  transition: width .6s ease;
}
.sl-text {
  position: absolute; right: -34px; top: -4px;
  font-size: 11px;
  font-family: 'DIN Alternate', monospace;
  color: #C5A55A;
  font-weight: 600;
}

/* element-plus 元素增强 */
:deep(.el-radio-group .el-radio-button__inner) {
  background: rgba(26,22,36,0.6);
  border-color: rgba(212,175,55,0.25);
  color: rgba(240,230,211,0.7);
  letter-spacing: 1px;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #D4AF37, #C5A55A);
  border-color: #D4AF37;
  color: #1a1a24;
  box-shadow: 0 0 12px rgba(212,175,55,0.4);
}
:deep(.el-date-editor.el-input__wrapper),
:deep(.el-date-editor) {
  background: rgba(26,22,36,0.6) !important;
  border: 1px solid rgba(212,175,55,0.22) !important;
  box-shadow: none !important;
}
:deep(.el-button) {
  background: rgba(26,22,36,0.6);
  border-color: rgba(212,175,55,0.25);
  color: rgba(240,230,211,0.85);
}
:deep(.el-button:hover) {
  border-color: #D4AF37;
  color: #D4AF37;
  background: rgba(212,175,55,0.08);
}
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #D4AF37, #C5A55A);
  border-color: #D4AF37;
  color: #1a1a24;
}
:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #F5D770, #D4AF37);
  color: #1a1a24;
  box-shadow: 0 6px 18px rgba(212,175,55,0.4);
}
</style>

