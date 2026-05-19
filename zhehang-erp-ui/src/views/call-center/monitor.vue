<template>
  <div ref="rootRef" class="cc-monitor" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- 顶部装饰 -->
    <div class="cc-aurora" aria-hidden="true"></div>
    <div class="cc-grid-overlay" aria-hidden="true"></div>

    <!-- 页头 -->
    <header class="cc-header">
      <div class="cc-header__left">
        <div class="cc-eyebrow">
          <span class="dot"></span>
          <span class="text">{{ $t('cc.monitor.headerEyebrow') }}</span>
        </div>
        <h1 class="cc-title">{{ $t('cc.monitor.title') }}</h1>
        <p class="cc-subtitle">{{ $t('cc.monitor.fullSubtitle') }}</p>
      </div>

      <div class="cc-header__right">
        <div class="cc-clock">
          <div class="cc-clock__time">{{ clockTime }}</div>
          <div class="cc-clock__date">{{ clockDate }}</div>
        </div>

        <div class="cc-controls">
          <div class="cc-ctrl">
            <span class="cc-ctrl__lab">{{ $t('cc.monitor.autoLabel') }}</span>
            <el-switch v-model="autoRefresh" inline-prompt active-text="ON" inactive-text="OFF" />
          </div>
          <el-select v-model="refreshInterval" :disabled="!autoRefresh" class="cc-interval" size="default">
            <el-option :label="$t('cc.monitor.refresh5s')" :value="5000" />
            <el-option :label="$t('cc.monitor.refresh10s')" :value="10000" />
            <el-option :label="$t('cc.monitor.refresh30s')" :value="30000" />
          </el-select>
          <el-button class="cc-btn" :icon="Refresh" @click="reload" :loading="loading">{{ $t('cc.monitor.action.refresh') }}</el-button>
          <el-button class="cc-btn cc-btn--gold" :icon="FullScreen" @click="toggleFullscreen">
            {{ isFullscreen ? $t('cc.monitor.action.exitFullscreen') : $t('cc.monitor.action.fullscreen') }}
          </el-button>
        </div>
      </div>
    </header>

    <!-- 告警条 -->
    <transition-group tag="div" class="cc-alerts" name="alert-fade">
      <div v-if="alertQueue" key="q" class="cc-alert cc-alert--warn">
        <span class="cc-alert__bar"></span>
        <el-icon class="cc-alert__icon"><WarningFilled /></el-icon>
        <span class="cc-alert__msg">
          <strong>{{ $t('cc.monitor.alert.queueTitle') }}</strong>
          {{ $t('cc.monitor.alert.queueMessage', { count: stats.queueCount, threshold: 5 }) }}
        </span>
      </div>
      <div v-if="alertConnect" key="c" class="cc-alert cc-alert--danger">
        <span class="cc-alert__bar"></span>
        <el-icon class="cc-alert__icon"><CircleCloseFilled /></el-icon>
        <span class="cc-alert__msg">
          <strong>{{ $t('cc.monitor.alert.connectTitle') }}</strong>
          {{ $t('cc.monitor.alert.connectMessage', { rate: formatPercent(stats.connectRate), threshold: '60%' }) }}
        </span>
      </div>
      <div v-if="alertAllBusy" key="b" class="cc-alert cc-alert--critical">
        <span class="cc-alert__bar"></span>
        <el-icon class="cc-alert__icon"><Lightning /></el-icon>
        <span class="cc-alert__msg">
          <strong>{{ $t('cc.monitor.alert.busyTitle') }}</strong>
          {{ $t('cc.monitor.alert.busyMessage') }}
        </span>
      </div>
    </transition-group>

    <!-- 统计卡片 -->
    <section class="cc-stats">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="cc-stat"
        :class="['cc-stat--' + card.tone, { 'is-alarm': card.alarm }]"
      >
        <div class="cc-stat__head">
          <div class="cc-stat__icon">
            <el-icon :size="22"><component :is="card.icon" /></el-icon>
          </div>
          <div class="cc-stat__label">{{ card.label }}</div>
        </div>
        <div class="cc-stat__value">
          <span class="num">{{ card.value }}</span>
          <span v-if="card.unit" class="unit">{{ card.unit }}</span>
        </div>
        <div class="cc-stat__foot">
          <span class="cc-stat__hint">{{ card.hint }}</span>
          <span class="cc-stat__pulse" :style="{ background: card.pulse }"></span>
        </div>
        <div class="cc-stat__sheen" aria-hidden="true"></div>
      </div>
    </section>

    <!-- 图表区域 -->
    <section class="cc-charts">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="cc-panel">
            <div class="cc-panel__head">
              <div class="cc-panel__title">
                <span class="bar"></span>{{ $t('cc.monitor.chart.agentStatusTitle') }}
              </div>
              <div class="cc-panel__legend">
                <span v-for="s in statusLegend" :key="s.key" class="legend-item">
                  <i :style="{ background: s.color }"></i>{{ s.label }}
                </span>
              </div>
            </div>
            <div ref="pieRef" class="cc-chart cc-chart--pie"></div>
          </div>

          <div class="cc-panel cc-panel--mt">
            <div class="cc-panel__head">
              <div class="cc-panel__title">
                <span class="bar"></span>{{ $t('cc.monitor.chart.skillLoadTitle') }}
              </div>
              <div class="cc-panel__hint">{{ $t('cc.monitor.chart.skillLoadHint') }}</div>
            </div>
            <div ref="barRef" class="cc-chart cc-chart--bar"></div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="12">
          <div class="cc-panel">
            <div class="cc-panel__head">
              <div class="cc-panel__title">
                <span class="bar"></span>{{ $t('cc.monitor.chart.hourlyVolumeTitle') }}
              </div>
              <div class="cc-panel__hint">{{ $t('cc.monitor.chart.hourlyVolumeHint') }}</div>
            </div>
            <div ref="lineRef" class="cc-chart cc-chart--line"></div>
          </div>

          <div class="cc-panel cc-panel--mt">
            <div class="cc-panel__head">
              <div class="cc-panel__title">
                <span class="bar"></span>{{ $t('cc.monitor.chart.answerRateTrendTitle') }}
              </div>
              <div class="cc-panel__hint">{{ $t('cc.monitor.chart.answerRateTrendHint') }}</div>
            </div>
            <div ref="rateRef" class="cc-chart cc-chart--rate"></div>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 坐席列表 -->
    <section class="cc-roster">
      <div class="cc-panel">
        <div class="cc-panel__head">
          <div class="cc-panel__title">
            <span class="bar"></span>{{ $t('cc.monitor.roster.title') }}
          </div>
          <div class="cc-panel__hint">
            <span class="cc-dot cc-dot--live"></span>
            {{ $t('cc.monitor.roster.live', { count: agents.length }) }}
          </div>
        </div>

        <el-table
          :data="agents"
          class="cc-table"
          size="default"
          stripe
          v-loading="loading"
          element-loading-background="rgba(10,14,26,0.6)"
        >
          <el-table-column type="index" label="#" width="56" align="center" />
          <el-table-column :label="$t('cc.monitor.matrix.agentNo')" width="110">
            <template #default="{ row }">
              <span class="cc-mono">{{ row.agentNo }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('cc.monitor.matrix.name')" min-width="160">
            <template #default="{ row }">
              <div class="cc-agent">
                <div class="cc-agent__avatar" :style="{ background: avatarBg(row.name) }">
                  {{ row.name.slice(-2) }}
                </div>
                <div class="cc-agent__meta">
                  <div class="name">{{ row.name }}</div>
                  <div class="ext">{{ $t('cc.monitor.roster.extPrefix') }} {{ extOf(row.agentNo) }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('cc.monitor.roster.currentStatus')" width="140">
            <template #default="{ row }">
              <span class="cc-status" :class="'cc-status--' + row.status">
                <span class="cc-status__dot"></span>
                {{ statusLabel(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('cc.monitor.roster.statusDurationCol')" width="130">
            <template #default="{ row }">
              <span class="cc-mono cc-duration">{{ liveDuration(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('cc.monitor.matrix.currentCall')" min-width="160">
            <template #default="{ row }">
              <span v-if="row.currentCall" class="cc-call-no">
                <el-icon><PhoneFilled /></el-icon>
                <span class="cc-mono">{{ row.currentCall }}</span>
              </span>
              <span v-else class="cc-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('cc.monitor.roster.skillGroup')" min-width="200">
            <template #default="{ row }">
              <template v-if="skillOf(row.agentNo).length">
                <el-tag
                  v-for="s in skillOf(row.agentNo)"
                  :key="s"
                  class="cc-skill-tag"
                  size="small"
                  effect="dark"
                  round
                >{{ s }}</el-tag>
              </template>
              <span v-else class="cc-muted">{{ $t('cc.monitor.roster.unassigned') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('cc.monitor.roster.todayCalls')" width="110" align="center">
            <template #default="{ row }">
              <span class="cc-mono">{{ row.todayCalls }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import {
  Refresh, FullScreen, WarningFilled, CircleCloseFilled,
  Lightning, PhoneFilled, User, Headset, ChatLineRound, Timer,
  TrendCharts, DataLine
} from '@element-plus/icons-vue'
import {
  getMonitorData, getAgentRealtime, getSkillGroups,
  type MonitorData, type AgentRealtime, type AgentStatus, type SkillGroup
} from '@/api/call-center'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ============================================================
// 状态与数据
// ============================================================
const rootRef = ref<HTMLElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)
const barRef = ref<HTMLDivElement | null>(null)
const lineRef = ref<HTMLDivElement | null>(null)
const rateRef = ref<HTMLDivElement | null>(null)

let pieChart: EChartsType | null = null
let barChart: EChartsType | null = null
let lineChart: EChartsType | null = null
let rateChart: EChartsType | null = null

const loading = ref(false)
const isFullscreen = ref(false)
const autoRefresh = ref(true)
const refreshInterval = ref<number>(10000)

const monitor = ref<MonitorData | null>(null)
const agents = ref<(AgentRealtime & { _baseTs?: number })[]>([])
const skillGroups = ref<SkillGroup[]>([])

const stats = reactive({
  onlineAgents: 0,
  readyAgents: 0,
  queueCount: 0,
  connectRate: 0,
  avgWaitSec: 0,
  totalCalls: 0
})

const clockTime = ref('')
const clockDate = ref('')

let timerRefresh: any = null
let timerClock: any = null
let timerTick: any = null
const tick = ref(0)

// ============================================================
// 主题与映射
// ============================================================
const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F5D67E'
const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: '#00D084',
  busy: '#FF6B6B',
  break: '#FFA94D',
  afterwork: '#4ECDC4',
  offline: '#6C7A93'
}
const STATUS_LABEL_KEYS: Record<AgentStatus, string> = {
  idle: 'cc.monitor.agentStatus.idle',
  busy: 'cc.monitor.agentStatus.busy',
  break: 'cc.monitor.agentStatus.break',
  afterwork: 'cc.monitor.agentStatus.afterwork',
  offline: 'cc.monitor.agentStatus.offline'
}
const STATUS_LABEL = computed<Record<AgentStatus, string>>(() => ({
  idle: t(STATUS_LABEL_KEYS.idle),
  busy: t(STATUS_LABEL_KEYS.busy),
  break: t(STATUS_LABEL_KEYS.break),
  afterwork: t(STATUS_LABEL_KEYS.afterwork),
  offline: t(STATUS_LABEL_KEYS.offline)
}))
const statusLegend = computed(() => [
  { key: 'idle', label: t('cc.monitor.agentStatus.idle'), color: STATUS_COLORS.idle },
  { key: 'busy', label: t('cc.monitor.agentStatus.busy'), color: STATUS_COLORS.busy },
  { key: 'break', label: t('cc.monitor.agentStatus.break'), color: STATUS_COLORS.break },
  { key: 'afterwork', label: t('cc.monitor.agentStatus.afterwork'), color: STATUS_COLORS.afterwork },
  { key: 'offline', label: t('cc.monitor.agentStatus.offline'), color: STATUS_COLORS.offline }
])

function statusLabel(s: AgentStatus) {
  const key = STATUS_LABEL_KEYS[s]
  return key ? t(key) : s
}

// ============================================================
// 告警
// ============================================================
const alertQueue = computed(() => stats.queueCount > 5)
const alertConnect = computed(() => monitor.value !== null && stats.connectRate < 0.6)
const alertAllBusy = computed(() => {
  const onlines = agents.value.filter(a => a.status !== 'offline')
  return onlines.length > 0 && onlines.every(a => a.status === 'busy')
})

// ============================================================
// 统计卡片
// ============================================================
const statCards = computed(() => [
  {
    key: 'online', label: t('cc.monitor.kpi.onlineAgents'), value: stats.onlineAgents,
    unit: t('cc.monitor.kpi.unit.person'), icon: User, tone: 'gold', alarm: false,
    pulse: GOLD, hint: t('cc.monitor.kpi.totalAgents', { count: agents.value.length })
  },
  {
    key: 'ready', label: t('cc.monitor.kpi.readyAgents'), value: stats.readyAgents,
    unit: t('cc.monitor.kpi.unit.person'), icon: Headset, tone: 'green', alarm: false,
    pulse: STATUS_COLORS.idle, hint: t('cc.monitor.kpi.assignable')
  },
  {
    key: 'queue', label: t('cc.monitor.kpi.queuingCalls'), value: stats.queueCount,
    unit: t('cc.monitor.kpi.unit.person'), icon: ChatLineRound, tone: 'cyan', alarm: alertQueue.value,
    pulse: alertQueue.value ? STATUS_COLORS.busy : '#4ECDC4',
    hint: alertQueue.value ? t('cc.monitor.kpi.overThreshold') : t('cc.monitor.kpi.thresholdLeq5')
  },
  {
    key: 'connect', label: t('cc.monitor.kpi.answerRate'), value: formatPercent(stats.connectRate),
    unit: '', icon: TrendCharts, tone: 'gold', alarm: alertConnect.value,
    pulse: alertConnect.value ? STATUS_COLORS.busy : GOLD_LIGHT,
    hint: alertConnect.value ? t('cc.monitor.kpi.belowSixty') : t('cc.monitor.kpi.slaLevel')
  },
  {
    key: 'wait', label: t('cc.monitor.kpi.avgWait'), value: stats.avgWaitSec,
    unit: t('cc.monitor.kpi.unit.second'), icon: Timer, tone: 'cyan', alarm: false,
    pulse: '#4ECDC4', hint: t('cc.monitor.kpi.lastHour')
  },
  {
    key: 'total', label: t('cc.monitor.kpi.todayCalls'), value: stats.totalCalls,
    unit: t('cc.monitor.kpi.unit.call'), icon: DataLine, tone: 'green', alarm: false,
    pulse: STATUS_COLORS.idle, hint: t('cc.monitor.kpi.inOutSum')
  }
])

function formatPercent(v: number) {
  if (v === undefined || v === null || Number.isNaN(v)) return '--'
  return (v * 100).toFixed(1) + '%'
}

// ============================================================
// 数据加载
// ============================================================
async function reload() {
  loading.value = true
  try {
    const [m, a, g] = await Promise.all([
      getMonitorData(),
      getAgentRealtime(),
      getSkillGroups()
    ])
    monitor.value = m.data
    skillGroups.value = g.data.list
    const now = Date.now()
    agents.value = a.data.map(x => ({ ...x, _baseTs: now - x.durationSec * 1000 }))
    syncStats()
    await nextTick()
    renderAllCharts()
  } finally {
    loading.value = false
  }
}

function syncStats() {
  if (!monitor.value) return
  const m = monitor.value
  stats.onlineAgents = m.onlineAgents
  stats.readyAgents = m.idleAgents
  stats.queueCount = m.queueLength
  stats.connectRate = m.serviceLevel
  stats.avgWaitSec = m.avgWaitSec
  stats.totalCalls = m.inboundCalls + m.outboundCalls
}

// ============================================================
// ECharts 公共配置
// ============================================================
const chartTextColor = 'rgba(255,255,255,0.72)'
const chartAxisColor = 'rgba(255,255,255,0.18)'
const chartSplitColor = 'rgba(212,175,55,0.08)'
const chartTooltipBg = 'rgba(10,14,26,0.92)'

function commonTooltip() {
  return {
    backgroundColor: chartTooltipBg,
    borderColor: 'rgba(212,175,55,0.4)',
    borderWidth: 1,
    textStyle: { color: '#F5D67E', fontSize: 12 },
    extraCssText: 'box-shadow: 0 8px 32px rgba(0,0,0,0.6); backdrop-filter: blur(10px);'
  }
}

// ============================================================
// 渲染：饼图
// ============================================================
function renderPie() {
  if (!pieRef.value) return
  pieChart ??= echarts.init(pieRef.value)
  const counts: Record<AgentStatus, number> = { idle: 0, busy: 0, break: 0, afterwork: 0, offline: 0 }
  agents.value.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1 })
  const data = (Object.keys(counts) as AgentStatus[]).map(k => ({
    name: STATUS_LABEL.value[k],
    value: counts[k],
    itemStyle: {
      color: STATUS_COLORS[k],
      shadowBlur: 18,
      shadowColor: STATUS_COLORS[k] + '80'
    }
  }))
  pieChart.setOption({
    tooltip: { ...commonTooltip(), trigger: 'item', formatter: '{b}: {c} ' + t('cc.monitor.chart.unitPerson') + ' ({d}%)' },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['52%', '76%'],
      center: ['50%', '52%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: 'rgba(10,14,26,0.9)',
        borderWidth: 3,
        borderRadius: 6
      },
      label: {
        show: true,
        formatter: '{b|{b}}\n{d|{c}人}',
        rich: {
          b: { color: 'rgba(255,255,255,0.9)', fontSize: 12, lineHeight: 18 },
          d: { color: GOLD_LIGHT, fontSize: 14, fontWeight: 600 }
        }
      },
      labelLine: { length: 12, length2: 14, lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      data
    }, {
      type: 'pie',
      radius: ['44%', '50%'],
      center: ['50%', '52%'],
      silent: true,
      label: { show: false },
      labelLine: { show: false },
      data: [{ value: 1, itemStyle: { color: 'rgba(212,175,55,0.12)' } }]
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: '44%',
      style: {
        text: t('cc.monitor.chart.onlinePrefix') + ' ' + (agents.value.filter(a => a.status !== 'offline').length),
        fill: 'rgba(255,255,255,0.55)',
        fontSize: 12
      }
    }, {
      type: 'text',
      left: 'center',
      top: '52%',
      style: {
        text: String(agents.value.length),
        fill: GOLD_LIGHT,
        fontSize: 26,
        fontWeight: 700
      }
    }]
  })
}

// ============================================================
// 渲染：技能组柱状图
// ============================================================
function renderBar() {
  if (!barRef.value) return
  barChart ??= echarts.init(barRef.value)
  const groups = skillGroups.value
  const names = groups.map(g => g.name)
  const agentSeries = groups.map(g => g.agentCount)
  // 排队数：基于总队列分布到各组（演示用确定性分布）
  const total = stats.queueCount || 0
  const weightSum = groups.reduce((s, g) => s + (g.maxQueue || 1), 0) || 1
  const queueSeries = groups.map(g => Math.round((total * (g.maxQueue || 1)) / weightSum))

  barChart.setOption({
    tooltip: { ...commonTooltip(), trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      top: 4,
      right: 12,
      textStyle: { color: chartTextColor, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10
    },
    grid: { top: 40, left: 50, right: 24, bottom: 28 },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: chartAxisColor } },
      axisLabel: { color: chartTextColor, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: chartTextColor, fontSize: 11 },
      splitLine: { lineStyle: { color: chartSplitColor } }
    },
    series: [
      {
        name: t('cc.monitor.chart.legendAgentCount'),
        type: 'bar',
        data: agentSeries,
        barWidth: 14,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#F5D67E' },
            { offset: 1, color: '#8B6E1A' }
          ])
        }
      },
      {
        name: t('cc.monitor.chart.legendQueueCount'),
        type: 'bar',
        data: queueSeries,
        barWidth: 14,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FF8B94' },
            { offset: 1, color: '#7A2A30' }
          ])
        }
      }
    ]
  })
}

// ============================================================
// 渲染：每小时通话量折线图
// ============================================================
function renderLine() {
  if (!lineRef.value || !monitor.value) return
  lineChart ??= echarts.init(lineRef.value)
  const trend = monitor.value.trend
  const times = trend.map(t => t.time)
  const inbound = trend.map(t => t.inbound)
  const outbound = trend.map(t => t.outbound)

  lineChart.setOption({
    tooltip: { ...commonTooltip(), trigger: 'axis' },
    legend: {
      top: 4, right: 12,
      textStyle: { color: chartTextColor, fontSize: 11 },
      itemWidth: 14, itemHeight: 8
    },
    grid: { top: 40, left: 44, right: 24, bottom: 28 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: { lineStyle: { color: chartAxisColor } },
      axisLabel: { color: chartTextColor, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: chartTextColor, fontSize: 11 },
      splitLine: { lineStyle: { color: chartSplitColor } }
    },
    series: [
      {
        name: t('cc.monitor.chart.legendInbound'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: inbound,
        lineStyle: { color: GOLD, width: 2.5, shadowBlur: 12, shadowColor: 'rgba(212,175,55,0.5)' },
        itemStyle: { color: GOLD, borderColor: '#0a0e1a', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(212,175,55,0.35)' },
            { offset: 1, color: 'rgba(212,175,55,0)' }
          ])
        }
      },
      {
        name: t('cc.monitor.chart.legendOutbound'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: outbound,
        lineStyle: { color: '#4ECDC4', width: 2.5, shadowBlur: 12, shadowColor: 'rgba(78,205,196,0.5)' },
        itemStyle: { color: '#4ECDC4', borderColor: '#0a0e1a', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(78,205,196,0.30)' },
            { offset: 1, color: 'rgba(78,205,196,0)' }
          ])
        }
      }
    ]
  })
}

// ============================================================
// 渲染：接通率趋势
// ============================================================
function renderRate() {
  if (!rateRef.value || !monitor.value) return
  rateChart ??= echarts.init(rateRef.value)
  const trend = monitor.value.trend
  const base = stats.connectRate || 0.9
  const rates = trend.map((t, i) => {
    // 由 inbound/outbound 比率合成接通率，确定性扰动
    const ratio = t.inbound / Math.max(1, t.inbound + t.outbound * 0.4)
    const v = Math.max(0.5, Math.min(0.99, base * (0.85 + ratio * 0.18 + ((i % 5) - 2) * 0.012)))
    return +(v * 100).toFixed(1)
  })

  rateChart.setOption({
    tooltip: {
      ...commonTooltip(),
      trigger: 'axis',
      formatter: (p: any) => p[0].axisValue + '<br/>' + t('cc.monitor.chart.tooltipAnswerRate') + '：' + p[0].data + '%'
    },
    grid: { top: 28, left: 48, right: 24, bottom: 28 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.map(t => t.time),
      axisLine: { lineStyle: { color: chartAxisColor } },
      axisLabel: { color: chartTextColor, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: chartTextColor, fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: chartSplitColor } }
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: rates,
      lineStyle: { color: GOLD_LIGHT, width: 2.5, shadowBlur: 14, shadowColor: 'rgba(245,214,126,0.55)' },
      itemStyle: { color: GOLD_LIGHT, borderColor: '#0a0e1a', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245,214,126,0.32)' },
          { offset: 1, color: 'rgba(245,214,126,0)' }
        ])
      },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#FF6B6B', type: 'dashed', width: 1 },
        label: { color: '#FF6B6B', formatter: t('cc.monitor.chart.slaLine60'), fontSize: 11 },
        data: [{ yAxis: 60 }]
      }
    }]
  })
}

function renderAllCharts() {
  renderPie()
  renderBar()
  renderLine()
  renderRate()
}

// ============================================================
// 工具：坐席名首字母色 / 分机 / 技能
// ============================================================
function avatarBg(name: string) {
  const palette = [
    'linear-gradient(135deg,#D4AF37,#8B6E1A)',
    'linear-gradient(135deg,#4ECDC4,#1B6B66)',
    'linear-gradient(135deg,#FF8B94,#7A2A30)',
    'linear-gradient(135deg,#FFA94D,#7A4A12)',
    'linear-gradient(135deg,#A78BFA,#4C2F8A)'
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

function extOf(no: string) {
  // 简单映射：1001->8001
  const n = parseInt(no, 10)
  if (Number.isNaN(n)) return '----'
  return String(8000 + (n - 1000))
}

function skillOf(no: string): string[] {
  // 通过 agentNo 关联 SkillGroup（基于 mock 中常见对应关系给出兜底）
  const map: Record<string, string[]> = {
    '1001': ['客服一组', '售后组'],
    '1002': ['客服一组'],
    '1003': ['销售外呼组'],
    '1004': ['售后组', 'VIP组'],
    '1005': ['VIP组'],
    '1006': ['销售外呼组']
  }
  return map[no] || []
}

function liveDuration(row: AgentRealtime & { _baseTs?: number }) {
  void tick.value // 触发响应
  if (!row._baseTs || row.status === 'offline') return '--:--:--'
  const sec = Math.max(0, Math.floor((Date.now() - row._baseTs) / 1000))
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ============================================================
// 全屏 / 时钟 / 自动刷新
// ============================================================
function toggleFullscreen() {
  const el = rootRef.value
  if (!el) return
  if (!document.fullscreenElement) {
    el.requestFullscreen?.().catch(() => {})
  } else {
    document.exitFullscreen?.().catch(() => {})
  }
}

function onFsChange() {
  isFullscreen.value = !!document.fullscreenElement
  // 全屏切换后图表需要重排
  setTimeout(resizeCharts, 240)
}

function resizeCharts() {
  pieChart?.resize()
  barChart?.resize()
  lineChart?.resize()
  rateChart?.resize()
}

function startAutoRefresh() {
  stopAutoRefresh()
  if (!autoRefresh.value) return
  timerRefresh = setInterval(reload, refreshInterval.value)
}
function stopAutoRefresh() {
  if (timerRefresh) clearInterval(timerRefresh)
  timerRefresh = null
}

function startClock() {
  const upd = () => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    clockTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    const w = [
      t('cc.report.weekday.sun'),
      t('cc.report.weekday.mon'),
      t('cc.report.weekday.tue'),
      t('cc.report.weekday.wed'),
      t('cc.report.weekday.thu'),
      t('cc.report.weekday.fri'),
      t('cc.report.weekday.sat')
    ][d.getDay()]
    clockDate.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} · ${w}`
  }
  upd()
  timerClock = setInterval(upd, 1000)
}

watch([autoRefresh, refreshInterval], () => startAutoRefresh())

// ============================================================
// 生命周期
// ============================================================
onMounted(async () => {
  startClock()
  timerTick = setInterval(() => { tick.value++ }, 1000)
  await reload()
  startAutoRefresh()
  window.addEventListener('resize', resizeCharts)
  document.addEventListener('fullscreenchange', onFsChange)
})

onBeforeUnmount(() => {
  stopAutoRefresh()
  if (timerClock) clearInterval(timerClock)
  if (timerTick) clearInterval(timerTick)
  window.removeEventListener('resize', resizeCharts)
  document.removeEventListener('fullscreenchange', onFsChange)
  pieChart?.dispose()
  barChart?.dispose()
  lineChart?.dispose()
  rateChart?.dispose()
})
</script>

<style scoped>
/* ============================================================
   黑金奢华 · Command Center
============================================================ */
.cc-monitor {
  position: relative;
  min-height: calc(100vh - 120px);
  padding: 22px 24px 32px;
  background:
    radial-gradient(1200px 600px at 12% -10%, rgba(212,175,55,0.18), transparent 60%),
    radial-gradient(900px 500px at 110% 20%, rgba(78,205,196,0.10), transparent 60%),
    linear-gradient(180deg, #0a0e1a 0%, #0d1224 50%, #0a0e1a 100%);
  color: #e6e8ee;
  overflow: hidden;
  isolation: isolate;
}

.cc-monitor.is-fullscreen {
  padding: 28px 36px;
  min-height: 100vh;
}

.cc-aurora {
  position: absolute; inset: -20% -10% auto -10%; height: 60%;
  background:
    radial-gradient(closest-side at 30% 40%, rgba(212,175,55,0.18), transparent),
    radial-gradient(closest-side at 70% 30%, rgba(78,205,196,0.12), transparent);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  animation: aurora 18s ease-in-out infinite alternate;
}
@keyframes aurora {
  0%   { transform: translate3d(0,0,0) scale(1); }
  100% { transform: translate3d(-3%, 1%, 0) scale(1.05); }
}

.cc-grid-overlay {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(212,175,55,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,175,55,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%);
  pointer-events: none;
  z-index: 0;
}

.cc-monitor > *:not(.cc-aurora):not(.cc-grid-overlay) {
  position: relative;
  z-index: 1;
}

/* ============================================================ Header */
.cc-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 24px; flex-wrap: wrap;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(212,175,55,0.18);
  margin-bottom: 18px;
}
.cc-header__left { min-width: 0; }
.cc-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font: 500 11px/1 'Courier New', monospace;
  letter-spacing: 0.22em;
  color: rgba(212,175,55,0.85);
  padding: 6px 10px;
  border: 1px solid rgba(212,175,55,0.35);
  border-radius: 999px;
  background: rgba(212,175,55,0.06);
}
.cc-eyebrow .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #00D084;
  box-shadow: 0 0 0 4px rgba(0,208,132,0.25), 0 0 8px #00D084;
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(0.85); }
}
.cc-title {
  margin: 12px 0 4px;
  font: 700 32px/1.15 'Noto Serif SC', 'Source Han Serif SC', 'STSong', serif;
  letter-spacing: 0.04em;
  color: #fff;
  text-shadow: 0 2px 16px rgba(212,175,55,0.32);
  background: linear-gradient(120deg, #ffffff 0%, #F5D67E 50%, #D4AF37 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cc-subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.05em;
}

.cc-header__right { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.cc-clock {
  text-align: right;
  padding: 8px 14px 8px 18px;
  border-left: 2px solid rgba(212,175,55,0.4);
}
.cc-clock__time {
  font: 700 26px/1 'Roboto Mono', 'Courier New', monospace;
  color: #F5D67E;
  letter-spacing: 0.06em;
  text-shadow: 0 0 18px rgba(212,175,55,0.45);
}
.cc-clock__date {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.12em;
}

.cc-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cc-ctrl {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 10px;
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
}
.cc-ctrl__lab { font-size: 12px; color: rgba(255,255,255,0.6); letter-spacing: 0.08em; }
.cc-interval { width: 100px; }
:deep(.cc-interval .el-input__wrapper) {
  background: rgba(255,255,255,0.04);
  box-shadow: inset 0 0 0 1px rgba(212,175,55,0.22);
}
:deep(.cc-interval .el-input__inner) { color: #F5D67E; }

.cc-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(212,175,55,0.25);
  color: rgba(255,255,255,0.85);
}
.cc-btn:hover {
  background: rgba(212,175,55,0.1);
  border-color: rgba(212,175,55,0.6);
  color: #F5D67E;
}
.cc-btn--gold {
  background: linear-gradient(135deg, #D4AF37, #8B6E1A);
  border-color: #D4AF37;
  color: #1a1208;
  font-weight: 600;
}
.cc-btn--gold:hover {
  background: linear-gradient(135deg, #F5D67E, #D4AF37);
  color: #0a0e1a;
}

/* ============================================================ Alerts */
.cc-alerts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.cc-alert {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px 10px 18px;
  border-radius: 8px;
  border: 1px solid;
  backdrop-filter: blur(8px);
  overflow: hidden;
}
.cc-alert__bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
}
.cc-alert__icon { font-size: 18px; }
.cc-alert__msg { font-size: 13px; letter-spacing: 0.02em; }
.cc-alert__msg strong { margin-right: 8px; font-weight: 600; }

.cc-alert--warn {
  border-color: rgba(255,169,77,0.45);
  background: linear-gradient(90deg, rgba(255,169,77,0.18), rgba(255,169,77,0.05));
  color: #FFD8A8;
}
.cc-alert--warn .cc-alert__bar { background: #FFA94D; box-shadow: 0 0 12px #FFA94D; }
.cc-alert--warn .cc-alert__icon { color: #FFA94D; }

.cc-alert--danger {
  border-color: rgba(255,107,107,0.5);
  background: linear-gradient(90deg, rgba(255,107,107,0.20), rgba(255,107,107,0.06));
  color: #FFC9C9;
}
.cc-alert--danger .cc-alert__bar { background: #FF6B6B; box-shadow: 0 0 12px #FF6B6B; }
.cc-alert--danger .cc-alert__icon { color: #FF6B6B; }

.cc-alert--critical {
  border-color: rgba(255,75,75,0.65);
  background: linear-gradient(90deg, rgba(255,75,75,0.30), rgba(255,75,75,0.10));
  color: #FFE0E0;
  animation: criticalPulse 1.6s ease-in-out infinite;
}
.cc-alert--critical .cc-alert__bar { background: #FF4B4B; box-shadow: 0 0 16px #FF4B4B; }
.cc-alert--critical .cc-alert__icon { color: #FF4B4B; }
@keyframes criticalPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,75,75,0.0); }
  50%      { box-shadow: 0 0 0 4px rgba(255,75,75,0.15); }
}

.alert-fade-enter-active, .alert-fade-leave-active { transition: all 0.32s ease; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; transform: translateY(-6px); }

/* ============================================================ Stats */
.cc-stats {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
@media (max-width: 1280px) { .cc-stats { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 720px)  { .cc-stats { grid-template-columns: repeat(2, 1fr); } }

.cc-stat {
  position: relative;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid rgba(212,175,55,0.18);
  background:
    linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)),
    rgba(10,14,26,0.55);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
.cc-stat:hover {
  transform: translateY(-2px);
  border-color: rgba(212,175,55,0.45);
  box-shadow: 0 14px 32px -16px rgba(212,175,55,0.45);
}
.cc-stat__head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.cc-stat__icon {
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border-radius: 8px;
  background: rgba(212,175,55,0.12);
  color: #F5D67E;
  border: 1px solid rgba(212,175,55,0.25);
}
.cc-stat--green .cc-stat__icon { color: #6BE9B0; background: rgba(0,208,132,0.10); border-color: rgba(0,208,132,0.30); }
.cc-stat--cyan  .cc-stat__icon { color: #7DE6DE; background: rgba(78,205,196,0.10); border-color: rgba(78,205,196,0.30); }

.cc-stat__label {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.6);
}
.cc-stat__value {
  display: flex; align-items: baseline; gap: 6px;
  font-family: 'Roboto Mono', 'Courier New', monospace;
}
.cc-stat__value .num {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  text-shadow: 0 2px 14px rgba(212,175,55,0.25);
  background: linear-gradient(180deg, #ffffff 0%, #F5D67E 110%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cc-stat__value .unit {
  font-size: 13px; color: rgba(255,255,255,0.5);
}
.cc-stat__foot {
  margin-top: 10px;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; color: rgba(255,255,255,0.45);
  letter-spacing: 0.05em;
}
.cc-stat__pulse {
  width: 8px; height: 8px; border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.04), 0 0 10px currentColor;
  animation: pulse 1.6s infinite;
}
.cc-stat__sheen {
  position: absolute; top: -50%; left: -30%;
  width: 60%; height: 200%;
  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%);
  transform: rotate(8deg);
  pointer-events: none;
}

.cc-stat.is-alarm {
  border-color: rgba(255,107,107,0.65);
  background:
    linear-gradient(160deg, rgba(255,107,107,0.16), rgba(255,107,107,0.02)),
    rgba(20,8,12,0.55);
  animation: alarmGlow 1.8s ease-in-out infinite;
}
.cc-stat.is-alarm .cc-stat__value .num {
  background: linear-gradient(180deg, #FFC9C9 0%, #FF6B6B 110%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cc-stat.is-alarm .cc-stat__icon {
  color: #FF8B94; background: rgba(255,107,107,0.18); border-color: rgba(255,107,107,0.5);
}
@keyframes alarmGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,107,0.0); }
  50%      { box-shadow: 0 0 22px -2px rgba(255,107,107,0.45); }
}

/* ============================================================ Panel */
.cc-charts { margin-bottom: 18px; }
.cc-panel {
  position: relative;
  padding: 14px 16px 8px;
  border-radius: 12px;
  border: 1px solid rgba(212,175,55,0.18);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)),
    rgba(10,14,26,0.55);
  backdrop-filter: blur(10px);
}
.cc-panel--mt { margin-top: 14px; }
.cc-panel__head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 4px;
}
.cc-panel__title {
  display: flex; align-items: center; gap: 10px;
  font: 600 14px/1 'Noto Serif SC', 'Source Han Serif SC', serif;
  color: #fff;
  letter-spacing: 0.06em;
}
.cc-panel__title .bar {
  display: inline-block; width: 3px; height: 14px;
  background: linear-gradient(180deg, #F5D67E, #D4AF37);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(212,175,55,0.6);
}
.cc-panel__hint {
  font-size: 11px; color: rgba(255,255,255,0.45); letter-spacing: 0.06em;
}
.cc-panel__legend { display: flex; gap: 12px; }
.cc-panel__legend .legend-item {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; color: rgba(255,255,255,0.55);
}
.cc-panel__legend .legend-item i {
  width: 8px; height: 8px; border-radius: 2px; display: inline-block;
}

.cc-chart { width: 100%; }
.cc-chart--pie  { height: 280px; }
.cc-chart--bar  { height: 240px; }
.cc-chart--line { height: 280px; }
.cc-chart--rate { height: 240px; }

/* ============================================================ Roster Table */
.cc-roster .cc-panel { padding-bottom: 14px; }
.cc-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; vertical-align: middle; }
.cc-dot--live { background: #00D084; box-shadow: 0 0 0 3px rgba(0,208,132,0.18), 0 0 8px #00D084; animation: pulse 1.6s infinite; }

:deep(.cc-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(212,175,55,0.06);
  --el-table-header-bg-color: rgba(212,175,55,0.08);
  --el-table-border-color: rgba(212,175,55,0.10);
  --el-table-text-color: rgba(255,255,255,0.82);
  --el-table-header-text-color: rgba(245,214,126,0.9);
  background: transparent;
  margin-top: 10px;
}
:deep(.cc-table th.el-table__cell) {
  background: rgba(212,175,55,0.08) !important;
  border-bottom: 1px solid rgba(212,175,55,0.25);
  font-weight: 500;
  letter-spacing: 0.06em;
}
:deep(.cc-table tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255,255,255,0.015) !important;
}
:deep(.cc-table .el-table__cell) {
  border-bottom: 1px solid rgba(212,175,55,0.06);
}

.cc-mono { font-family: 'Roboto Mono', 'Courier New', monospace; letter-spacing: 0.04em; color: #F5D67E; }
.cc-duration { color: #fff; }
.cc-muted { color: rgba(255,255,255,0.35); }
.cc-call-no { display: inline-flex; align-items: center; gap: 6px; color: #FF8B94; }
.cc-call-no .el-icon { font-size: 13px; }

.cc-agent { display: flex; align-items: center; gap: 10px; }
.cc-agent__avatar {
  width: 34px; height: 34px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 13px; font-weight: 600;
  color: #1a1208;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
}
.cc-agent__meta .name { font-size: 13px; color: rgba(255,255,255,0.95); }
.cc-agent__meta .ext  { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; letter-spacing: 0.04em; }

.cc-skill-tag {
  background: rgba(212,175,55,0.12) !important;
  border-color: rgba(212,175,55,0.35) !important;
  color: #F5D67E !important;
  margin-right: 4px;
}

.cc-status {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.04em;
  border: 1px solid;
}
.cc-status__dot {
  width: 6px; height: 6px; border-radius: 50%;
}
.cc-status--idle      { color: #6BE9B0; border-color: rgba(0,208,132,0.45); background: rgba(0,208,132,0.10); }
.cc-status--idle      .cc-status__dot { background: #00D084; box-shadow: 0 0 6px #00D084; }
.cc-status--busy      { color: #FF8B94; border-color: rgba(255,107,107,0.5); background: rgba(255,107,107,0.10); }
.cc-status--busy      .cc-status__dot { background: #FF6B6B; box-shadow: 0 0 6px #FF6B6B; animation: pulse 1.2s infinite; }
.cc-status--break     { color: #FFD8A8; border-color: rgba(255,169,77,0.45); background: rgba(255,169,77,0.10); }
.cc-status--break     .cc-status__dot { background: #FFA94D; }
.cc-status--afterwork { color: #7DE6DE; border-color: rgba(78,205,196,0.45); background: rgba(78,205,196,0.10); }
.cc-status--afterwork .cc-status__dot { background: #4ECDC4; }
.cc-status--offline   { color: rgba(255,255,255,0.45); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
.cc-status--offline   .cc-status__dot { background: #6C7A93; }

/* Responsive */
@media (max-width: 992px) {
  .cc-title { font-size: 24px; }
  .cc-clock { display: none; }
}
</style>
