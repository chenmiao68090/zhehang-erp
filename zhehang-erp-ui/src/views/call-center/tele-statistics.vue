<template>
  <div class="tele-board" v-loading="loading">
    <header class="board-head">
      <div>
        <h2>电销外呼统计</h2>
        <p>贴近现有销售体系风格，按云客同步话单统计电话量、接通率、通话时长和人员排名</p>
      </div>
      <div class="head-actions">
        <el-segmented v-model="range" :options="rangeOptions" @change="loadDashboard" />
        <el-button :icon="Refresh" @click="loadDashboard">刷新</el-button>
        <el-button type="primary" :loading="syncing" @click="syncNow">
          立即同步
        </el-button>
      </div>
    </header>

    <section class="kpi-grid">
      <article v-for="card in kpiCards" :key="card.key" class="kpi-card">
        <div class="kpi-label">{{ card.label }}</div>
        <div class="kpi-value">{{ card.value }}</div>
        <div class="kpi-sub" :class="card.tone">{{ card.sub }}</div>
      </article>
    </section>

    <section class="main-grid">
      <article class="panel trend-panel">
        <div class="panel-head">
          <div>
            <h3>组员电话统计</h3>
            <p>总电话量 / 接通量 / 有效沟通</p>
          </div>
          <span>{{ rangeLabel }}</span>
        </div>
        <div class="chart-wrap" v-if="trend.length">
          <svg viewBox="0 0 900 260" preserveAspectRatio="none" aria-label="外呼趋势">
            <line v-for="y in gridLines" :key="y" x1="46" x2="870" :y1="y" :y2="y" stroke="#e7edf6" />
            <polyline :points="linePoints('callCount')" fill="none" stroke="#1f5fbf" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <polyline :points="linePoints('connectedCount')" fill="none" stroke="#0f8b8d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <polyline :points="linePoints('validCount')" fill="none" stroke="#f28c28" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <text v-for="(item, index) in trend" :key="item.label" :x="chartX(index)" y="244" text-anchor="middle" fill="#667085" font-size="12" font-weight="700">
              {{ item.label }}
            </text>
          </svg>
          <div class="legend">
            <span><i class="blue"></i>外呼</span>
            <span><i class="teal"></i>接通</span>
            <span><i class="orange"></i>有效</span>
          </div>
        </div>
        <el-empty v-else description="当前时间范围暂无通话趋势" :image-size="90" />
      </article>

      <article class="panel rank-panel">
        <div class="panel-head">
          <div>
            <h3>呼叫排名</h3>
            <p>按电话量排序</p>
          </div>
        </div>
        <div class="rank-bars" v-if="topAgents.length">
          <div v-for="item in topAgents" :key="item.agentName" class="rank-bar-row">
            <span class="rank-name">{{ item.agentName }}</span>
            <div class="rank-track">
              <div class="rank-fill" :style="{ width: barWidth(item.callCount) }"></div>
            </div>
            <b>{{ item.callCount }}</b>
          </div>
        </div>
        <el-empty v-else description="暂无坐席排名" :image-size="80" />
      </article>

      <article class="panel table-panel">
        <div class="panel-head">
          <div>
            <h3>人员明细表</h3>
            <p>每个人的电话量、接通量、接通率、通话时长和有效沟通</p>
          </div>
        </div>
        <el-table :data="agents" height="334" class="agent-table" empty-text="暂无人员通话数据">
          <el-table-column label="成员" min-width="140">
            <template #default="{ row }">
              <span class="agent-cell"><i>{{ firstChar(row.agentName) }}</i>{{ row.agentName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="callCount" label="外呼" width="100" />
          <el-table-column prop="connectedCount" label="接通" width="100" />
          <el-table-column label="接通率" width="110">
            <template #default="{ row }">{{ row.connectRate || 0 }}%</template>
          </el-table-column>
          <el-table-column prop="totalDurationText" label="通话时长" width="130" />
          <el-table-column prop="validCount" label="有效沟通" width="110" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.rank)" effect="light" round>{{ statusText(row.rank) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </article>

      <aside class="side-stack">
        <article class="panel rate-panel">
          <div class="panel-head compact">
            <h3>接通率排行</h3>
            <span>TOP 5</span>
          </div>
          <div class="rate-list" v-if="connectRateRank.length">
            <div v-for="(item, index) in connectRateRank" :key="item.agentName" class="rate-item">
              <span class="rank-no" :class="rankClass(index)">{{ index + 1 }}</span>
              <b>{{ item.agentName }}</b>
              <em>{{ item.connectRate || 0 }}%</em>
            </div>
          </div>
          <el-empty v-else description="暂无接通率排行" :image-size="70" />
        </article>

        <article class="panel todo-panel">
          <div class="panel-head compact">
            <h3>今日待办</h3>
          </div>
          <div class="todo-list">
            <div v-for="item in todoRows" :key="item.label" class="todo-item">
              <span>{{ item.label }}</span>
              <b>{{ item.value }}</b>
            </div>
          </div>
          <p class="sync-tip">最近话单：{{ latestCallTime || '暂无' }}</p>
        </article>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import {
  callRecordApi,
  type CallDashboardAgent,
  type CallDashboardData,
  type CallDashboardRange,
  type CallDashboardSummary,
  type CallDashboardTrend
} from '@/api/call-record'

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T
}

const rangeOptions = [
  { label: '今日', value: 'today' },
  { label: '昨日', value: 'yesterday' },
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' }
]

const range = ref<CallDashboardRange>('today')
const loading = ref(false)
const syncing = ref(false)
const dashboard = ref<CallDashboardData | null>(null)

const emptySummary: CallDashboardSummary = {
  totalCalls: 0,
  connectedCount: 0,
  missedCount: 0,
  failedCount: 0,
  validCount: 0,
  recordCount: 0,
  highIntentCount: 0,
  connectRate: 0,
  validRate: 0,
  totalDuration: 0,
  totalDurationText: '0m 0s',
  avgDuration: 0,
  avgDurationText: '0m 0s',
  topAgentName: '暂无',
  topAgentCalls: 0
}

const summary = computed(() => dashboard.value?.summary || emptySummary)
const previousSummary = computed(() => dashboard.value?.previousSummary || emptySummary)
const agents = computed<CallDashboardAgent[]>(() => dashboard.value?.agents || [])
const trend = computed<CallDashboardTrend[]>(() => dashboard.value?.trend || [])
const todo = computed(() => dashboard.value?.todo || { callbackCount: 0, highIntentCount: 0, recordReviewCount: 0, lowConnectAgentCount: 0 })
const latestCallTime = computed(() => formatDateTime(summary.value.latestCallTime))

const rangeLabel = computed(() => rangeOptions.find(item => item.value === range.value)?.label || '今日')

const kpiCards = computed(() => [
  {
    key: 'total',
    label: '总电话量',
    value: formatNumber(summary.value.totalCalls),
    sub: deltaText(summary.value.totalCalls, previousSummary.value.totalCalls, '通'),
    tone: toneByDelta(summary.value.totalCalls, previousSummary.value.totalCalls)
  },
  {
    key: 'connected',
    label: '接通量',
    value: formatNumber(summary.value.connectedCount),
    sub: `未接 ${summary.value.missedCount || 0} / 失败 ${summary.value.failedCount || 0}`,
    tone: ''
  },
  {
    key: 'rate',
    label: '接通率',
    value: `${summary.value.connectRate || 0}%`,
    sub: '目标 40%',
    tone: (summary.value.connectRate || 0) >= 40 ? 'up' : 'down'
  },
  {
    key: 'duration',
    label: '通话时长',
    value: summary.value.totalDurationText || '0m 0s',
    sub: `平均 ${summary.value.avgDurationText || '0m 0s'}`,
    tone: ''
  },
  {
    key: 'valid',
    label: '有效沟通',
    value: formatNumber(summary.value.validCount),
    sub: `有效/接通 ${summary.value.validRate || 0}%`,
    tone: 'up'
  },
  {
    key: 'top',
    label: '今日排行第一',
    value: summary.value.topAgentName || '暂无',
    sub: `${summary.value.topAgentCalls || 0} 通`,
    tone: ''
  }
])

const topAgents = computed(() => agents.value.slice(0, 7))
const maxCalls = computed(() => Math.max(...topAgents.value.map(item => item.callCount || 0), 1))
const connectRateRank = computed(() => agents.value
  .filter(item => (item.callCount || 0) > 0)
  .slice()
  .sort((a, b) => (b.connectRate || 0) - (a.connectRate || 0))
  .slice(0, 5))

const todoRows = computed(() => [
  { label: '未接客户二次回拨', value: `${todo.value.callbackCount || 0} 条` },
  { label: '高意向客户待建任务', value: `${todo.value.highIntentCount || 0} 条` },
  { label: '录音质检待复盘', value: `${todo.value.recordReviewCount || 0} 条` },
  { label: '接通率低于35%坐席', value: `${todo.value.lowConnectAgentCount || 0} 人` }
])

const gridLines = [46, 96, 146, 196]
const maxTrendValue = computed(() => Math.max(
  ...trend.value.flatMap(item => [item.callCount || 0, item.connectedCount || 0, item.validCount || 0]),
  1
))

async function loadDashboard() {
  loading.value = true
  try {
    dashboard.value = unwrap(await callRecordApi.dashboard({ range: range.value }))
  } catch (e: any) {
    ElMessage.error(e?.message || '电销外呼看板加载失败')
  } finally {
    loading.value = false
  }
}

async function syncNow() {
  syncing.value = true
  try {
    const res: any = unwrap(await callRecordApi.syncYunkeFailed(20))
    ElMessage.success(`已同步 ${res?.inserted || 0} 条，更新 ${res?.updated || 0} 条`)
    await loadDashboard()
  } catch (e: any) {
    ElMessage.error(e?.message || '同步失败')
  } finally {
    syncing.value = false
  }
}

function chartX(index: number) {
  if (trend.value.length <= 1) return 458
  return 60 + index * (800 / (trend.value.length - 1))
}

function chartY(value?: number) {
  return 218 - ((value || 0) / maxTrendValue.value) * 168
}

function linePoints(key: 'callCount' | 'connectedCount' | 'validCount') {
  return trend.value.map((item, index) => `${chartX(index)},${chartY(item[key])}`).join(' ')
}

function barWidth(value?: number) {
  return `${Math.max(((value || 0) / maxCalls.value) * 100, 4)}%`
}

function firstChar(name?: string) {
  return name ? String(name).trim().charAt(0) : '客'
}

function formatNumber(value?: number) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function formatDateTime(value?: string) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 16)
}

function deltaText(current?: number, previous?: number, unit = '') {
  const cur = Number(current || 0)
  const prev = Number(previous || 0)
  if (!prev && cur) return `新增 ${formatNumber(cur)}${unit}`
  if (!prev) return '较前期持平'
  const diff = cur - prev
  const rate = Math.round((diff / prev) * 1000) / 10
  return `${diff >= 0 ? '较前期 +' : '较前期 '}${rate}%`
}

function toneByDelta(current?: number, previous?: number) {
  return Number(current || 0) >= Number(previous || 0) ? 'up' : 'down'
}

function rankClass(index: number) {
  return index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
}

function statusText(rank?: number) {
  if (!rank || rank <= 3) return '领先'
  if (rank <= 6) return '达标'
  return '追赶'
}

function statusType(rank?: number) {
  if (!rank || rank <= 3) return 'success'
  if (rank <= 6) return 'primary'
  return 'warning'
}

onMounted(loadDashboard)
</script>

<style scoped>
.tele-board {
  min-height: calc(100vh - 84px);
  padding: 18px;
  background: #f4f7fb;
  color: #1f2937;
  box-sizing: border-box;
}

.board-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.board-head h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 850;
  letter-spacing: 0;
}

.board-head p {
  margin: 8px 0 0;
  color: #667085;
  font-size: 14px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(31, 53, 89, .06);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-card {
  position: relative;
  overflow: hidden;
  min-height: 116px;
  background: #fff;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 10px 28px rgba(31, 53, 89, .07);
}

.kpi-card::after {
  content: "";
  position: absolute;
  top: -30px;
  right: -24px;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #eef4fb;
}

.kpi-label {
  color: #596579;
  font-size: 13px;
  font-weight: 800;
}

.kpi-value {
  margin-top: 16px;
  font-size: 28px;
  line-height: 1;
  font-weight: 850;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-sub {
  margin-top: 12px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
}

.kpi-sub.up { color: #0d8a58; }
.kpi-sub.down { color: #c34636; }

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.48fr) minmax(360px, .82fr);
  grid-template-rows: 320px 390px;
  gap: 16px;
}

.panel {
  min-width: 0;
  background: #fff;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(31, 53, 89, .07);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 18px 8px;
}

.panel-head.compact {
  align-items: center;
}

.panel-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 850;
}

.panel-head p,
.panel-head span {
  margin: 6px 0 0;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
}

.trend-panel {
  grid-column: 1;
  grid-row: 1;
}

.rank-panel {
  grid-column: 2;
  grid-row: 1;
}

.table-panel {
  grid-column: 1;
  grid-row: 2;
  overflow: hidden;
}

.side-stack {
  grid-column: 2;
  grid-row: 2;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 16px;
  min-height: 0;
}

.chart-wrap {
  position: relative;
  padding: 0 18px 12px;
}

.chart-wrap svg {
  width: 100%;
  height: 238px;
}

.legend {
  position: absolute;
  right: 34px;
  top: 10px;
  display: flex;
  gap: 24px;
  color: #344054;
  font-size: 12px;
  font-weight: 800;
}

.legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.legend .blue { background: #1f5fbf; }
.legend .teal { background: #0f8b8d; }
.legend .orange { background: #f28c28; }

.rank-bars {
  padding: 10px 18px 18px;
}

.rank-bar-row {
  display: grid;
  grid-template-columns: 76px 1fr 46px;
  align-items: center;
  gap: 10px;
  height: 30px;
  color: #344054;
  font-size: 13px;
  font-weight: 700;
}

.rank-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-track {
  height: 10px;
  border-radius: 999px;
  background: #e9eef7;
  overflow: hidden;
}

.rank-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #1f5fbf, #18a66f);
}

.agent-table {
  width: calc(100% - 36px);
  margin: 0 18px 18px;
}

.agent-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 750;
}

.agent-cell i {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eaf2ff;
  color: #1f5fbf;
  font-style: normal;
  font-weight: 850;
}

.rate-list,
.todo-list {
  padding: 0 18px 18px;
}

.rate-item,
.todo-item {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #edf1f6;
  font-size: 13px;
}

.rate-item b,
.todo-item span {
  flex: 1;
  color: #263244;
}

.rate-item em,
.todo-item b {
  min-width: 60px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #0d7a50;
  background: #e7f7ef;
  font-style: normal;
  font-weight: 850;
}

.rank-no {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #8b95a7;
  font-weight: 850;
  flex: 0 0 auto;
}

.rank-no.gold { background: linear-gradient(135deg, #f4a62a, #e05a47); }
.rank-no.silver { background: linear-gradient(135deg, #7b8ca7, #4d6f96); }
.rank-no.bronze { background: linear-gradient(135deg, #c67939, #9a5228); }

.sync-tip {
  margin: 0;
  padding: 0 18px 18px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1280px) {
  .board-head,
  .head-actions {
    flex-wrap: wrap;
  }

  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .main-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .trend-panel,
  .rank-panel,
  .table-panel,
  .side-stack {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
