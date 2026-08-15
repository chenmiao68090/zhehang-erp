<template>
  <div class="sales-page biz-perf">
    <header class="result-page-head">
      <h1>{{ pageTitle }}</h1>
    </header>

    <el-tabs v-model="activeTab" class="result-tabs">
      <el-tab-pane label="通话排行" name="ranking" />
      <el-tab-pane label="业绩排行" name="personal" />
      <el-tab-pane label="通话录音" name="recordings" />
    </el-tabs>

    <!-- ===== 业绩排行:到款口径=订单财务确认(finance_confirm_time),归属=业务员 ===== -->
    <section v-show="activeTab === 'personal'" class="pr-panel" v-loading="perfLoading">
      <div class="pr-stats">
        <div class="pr-stat">
          <span class="pr-label">我的所选日期到款</span>
          <b class="pr-value">{{ formatWan(perfMe.amount) }}</b>
        </div>
        <div class="pr-stat">
          <span class="pr-label">我的成交</span>
          <b class="pr-value">{{ perfMe.orderCount }}<em>单</em></b>
        </div>
        <div class="pr-stat">
          <span class="pr-label">当前排名</span>
          <b v-if="perfMe.rank" class="pr-value">{{ perfMe.rank }}<em>/ {{ perfMe.total }} 名</em></b>
          <b v-else class="pr-value pr-none">--<em>暂未上榜</em></b>
        </div>
      </div>

      <div class="pr-toolbar">
        <div class="visibility-note">
          <el-icon><View /></el-icon>
          <strong>全员可见 · 全公司</strong>
          <span>到款按订单财务确认归业务员,升降与上一等长周期对比</span>
        </div>
        <div class="pr-controls">
          <div class="date-control">
            <span>日期范围</span>
            <el-date-picker
              v-model="perfRange"
              class="leaderboard-date-range"
              type="daterange"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :clearable="false"
              :editable="false"
              :disabled-date="disableFutureLeaderboardDate"
              unlink-panels
              @change="handlePerfDateChange"
            />
          </div>
          <el-segmented v-model="perfPeriod" :options="leaderboardPeriodOptions" @change="handlePerfPeriodChange" />
          <el-button class="pr-cast-btn" @click="openCast">📺 投屏模式</el-button>
          <el-tooltip content="刷新业绩排行" placement="top">
            <el-button class="refresh-rank" :icon="Refresh" circle :loading="perfLoading" @click="loadPerfRank" />
          </el-tooltip>
        </div>
      </div>

      <el-alert
        v-if="perfError"
        class="leaderboard-error"
        type="error"
        :closable="false"
        show-icon
        title="业绩排行加载失败"
      >
        <template #default>
          <el-button link type="primary" @click="loadPerfRank">重新加载</el-button>
        </template>
      </el-alert>

      <div v-else-if="!perfLoading && perfRows.length === 0" class="pr-empty">
        <p>所选区间还没有财务确认到款的订单</p>
      </div>

      <template v-else>
        <div v-if="riseStar || fallStar" class="pr-stars">
          <div v-if="riseStar" class="pr-star is-rise">
            <span class="pr-ava">{{ firstCharacter(riseStar.name) }}</span>
            <div class="pr-star-body">
              <div class="pr-star-t">🚀 进步之星</div>
              <div class="pr-star-n">
                {{ riseStar.name }}
                <span class="pr-delta is-up">↑ {{ (riseStar.prevRank || 0) - riseStar.rank }} 名</span>
                <small>{{ formatWan(riseStar.amount) }}{{ perfMoM(riseStar) }}</small>
              </div>
            </div>
          </div>
          <div v-if="fallStar" class="pr-star is-fall">
            <span class="pr-ava">{{ firstCharacter(fallStar.name) }}</span>
            <div class="pr-star-body">
              <div class="pr-star-t">🔔 需要关注</div>
              <div class="pr-star-n">
                {{ fallStar.name }}
                <span class="pr-delta is-down">↓ {{ fallStar.rank - (fallStar.prevRank || 0) }} 名</span>
                <small>{{ formatWan(fallStar.amount) }}{{ perfMoM(fallStar) }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="pr-board">
          <div v-if="podiumOrder.length" class="pr-podium">
            <div v-for="p in podiumOrder" :key="p.row.userId" class="pr-pod" :class="p.cls">
              <span class="pr-ava">{{ firstCharacter(p.row.name) }}</span>
              <div class="pr-pod-n">{{ p.row.name }} <span class="pr-delta" :class="perfDelta(p.row).cls">{{ perfDelta(p.row).text }}</span></div>
              <div class="pr-pod-m">{{ formatWan(p.row.amount) }}</div>
              <div class="pr-pod-base">{{ p.row.rank }}</div>
            </div>
          </div>
          <el-table :data="perfRows" class="pr-table" :row-class-name="perfRowClass">
            <el-table-column label="排名" width="64" align="center">
              <template #default="{ row }"><span class="pr-rankchip" :class="rankChipClass(row.rank)">{{ row.rank }}</span></template>
            </el-table-column>
            <el-table-column label="升降" width="72" align="center">
              <template #default="{ row }"><span class="pr-delta" :class="perfDelta(row).cls">{{ perfDelta(row).text }}</span></template>
            </el-table-column>
            <el-table-column label="销售" min-width="120">
              <template #default="{ row }"><span class="pr-name">{{ row.name }}<em v-if="row.currentUser">(我)</em></span></template>
            </el-table-column>
            <el-table-column label="部门" min-width="96" show-overflow-tooltip>
              <template #default="{ row }">{{ row.deptName || '—' }}</template>
            </el-table-column>
            <el-table-column label="到款金额" min-width="104" align="right">
              <template #default="{ row }"><b class="pr-amount">{{ formatWan(row.amount) }}</b></template>
            </el-table-column>
            <el-table-column label="成交单数" width="92" align="right">
              <template #default="{ row }">{{ row.orderCount }} 单</template>
            </el-table-column>
            <el-table-column label="客单价" width="96" align="right">
              <template #default="{ row }">{{ formatWan(row.avgAmount) }}</template>
            </el-table-column>
            <el-table-column label="占团队比重" min-width="120">
              <template #default="{ row }">
                <div class="pr-share"><i :style="{ width: Math.min(Number(row.share) || 0, 100) + '%' }"></i></div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </section>

    <section v-show="activeTab === 'ranking'" class="leaderboard-panel" v-loading="leaderboardLoading">
      <div class="self-summary">
        <div class="self-stat self-calls">
          <span>我的{{ leaderboardPeriodLabel }}</span>
          <strong>{{ formatInteger(selfRow.callCount) }}</strong>
          <em>通</em>
        </div>
        <div class="self-target">
          <div class="target-line">
            <span class="target-copy">
              目标 <b>{{ formatInteger(leaderboardData.targetCount) }}</b> 通
              <small>每人每日 {{ formatInteger(leaderboardData.targetPerDay) }} 通</small>
            </span>
            <strong>{{ formatPercent(selfRow.targetProgress) }}</strong>
          </div>
          <el-progress
            :percentage="progressBarValue(selfRow.targetProgress)"
            :show-text="false"
            :stroke-width="9"
            :color="progressColor(selfRow.targetProgress)"
          />
        </div>
        <div class="self-stat">
          <span>当前第</span>
          <strong>{{ selfRow.rank || '--' }}</strong>
          <em>名</em>
        </div>
        <div class="self-stat gap-stat">
          <span>{{ gapTitle }}</span>
          <strong>{{ gapValue }}</strong>
          <em>{{ leaderboardData.gapUnit }}</em>
        </div>
      </div>

      <div class="leaderboard-toolbar">
        <div class="visibility-note">
          <el-icon><View /></el-icon>
          <strong>全员可见 · 全公司</strong>
          <span>只展示当前公司已绑定坐席的汇总数据</span>
        </div>
        <div class="leaderboard-controls">
          <div class="date-control">
            <span>日期范围</span>
            <el-date-picker
              v-model="leaderboardDateRange"
              class="leaderboard-date-range"
              type="daterange"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :clearable="false"
              :editable="false"
              :disabled-date="disableFutureLeaderboardDate"
              unlink-panels
              @change="handleLeaderboardDateChange"
            />
          </div>
          <el-segmented
            v-model="leaderboardPeriod"
            :options="leaderboardPeriodOptions"
            @change="handleLeaderboardPeriodChange"
          />
          <div class="metric-control">
            <span>排行口径</span>
            <el-segmented v-model="leaderboardMetric" :options="leaderboardMetricOptions" />
          </div>
          <el-tooltip content="刷新排行数据" placement="top">
            <el-button class="refresh-rank" :icon="Refresh" circle :loading="leaderboardLoading" @click="loadLeaderboard" />
          </el-tooltip>
        </div>
      </div>

      <el-alert
        v-if="leaderboardError"
        class="leaderboard-error"
        type="error"
        :closable="false"
        show-icon
        title="通话排行加载失败"
      >
        <template #default>
          <el-button link type="primary" @click="loadLeaderboard">重新加载</el-button>
        </template>
      </el-alert>

      <div class="leaderboard-table-wrap">
        <el-table
          :data="leaderboardData.rows"
          class="leaderboard-table"
          :row-class-name="leaderboardRowClass"
          empty-text="当前时间范围暂无已绑定坐席的通话数据"
        >
          <el-table-column label="排名" width="64" align="center" fixed="left">
            <template #default="{ row }">
              <span class="rank-number" :class="rankNumberClass(row.rank)">{{ row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售" min-width="132" fixed="left">
            <template #default="{ row }">
              <div class="agent-name-cell">
                <span class="agent-avatar">{{ firstCharacter(row.agentName) }}</span>
                <el-tooltip :content="row.agentName" placement="top" :disabled="String(row.agentName || '').length <= 8">
                  <strong class="agent-name text-ellipsis">{{ row.agentName }}</strong>
                </el-tooltip>
                <em v-if="row.currentUser">我</em>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="deptName" label="部门" min-width="108" show-overflow-tooltip />
          <el-table-column label="拨打量" width="90" align="right">
            <template #default="{ row }"><b class="primary-value">{{ formatInteger(row.callCount) }}</b> 通</template>
          </el-table-column>
          <el-table-column label="接通量" width="90" align="right">
            <template #default="{ row }">{{ formatInteger(row.connectedCount) }} 通</template>
          </el-table-column>
          <el-table-column label="接通率" width="88" align="right">
            <template #default="{ row }">{{ formatPercent(row.connectRate) }}</template>
          </el-table-column>
          <el-table-column label="有效沟通" width="100" align="right">
            <template #default="{ row }">{{ formatInteger(row.validCount) }} 通</template>
          </el-table-column>
          <el-table-column label="有效率" width="88" align="right">
            <template #default="{ row }">{{ formatPercent(row.validRate) }}</template>
          </el-table-column>
          <el-table-column prop="totalDurationText" label="通话时长" width="108" align="right" />
          <el-table-column label="目标进度" min-width="180">
            <template #default="{ row }">
              <div class="target-progress-cell">
                <strong :class="progressTone(row.targetProgress)">{{ formatPercent(row.targetProgress) }}</strong>
                <el-progress
                  :percentage="progressBarValue(row.targetProgress)"
                  :show-text="false"
                  :stroke-width="7"
                  :color="progressColor(row.targetProgress)"
                />
                <span>{{ formatInteger(row.callCount) }} / {{ formatInteger(row.targetCount) }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <footer class="leaderboard-footnote">
        <span>数据来自系统真实话单</span>
        <span>有效沟通：已接通且通话不少于 60 秒；有效率=有效沟通÷拨打量</span>
        <span>{{ leaderboardRangeLabel }}目标：每人每日 {{ formatInteger(leaderboardData.targetPerDay) }} 通 × {{ leaderboardData.periodDays }} 天 = {{ formatInteger(leaderboardData.targetCount) }} 通</span>
      </footer>
    </section>

    <CallRecordingPanel v-if="activeTab === 'recordings'" />

    <!-- 投屏模式:深色全屏大字榜,Esc 或按钮退出,每小时自动刷新 -->
    <div v-if="castMode" class="pr-cast-overlay">
      <div class="pr-cast-head">
        <span class="pr-cast-title">🏆 业绩排行<small>{{ perfRange[0] }} 至 {{ perfRange[1] }} · 按到款(财务确认)</small></span>
        <span class="pr-cast-meta">每小时自动刷新 · {{ castUpdatedAt }} 更新<button type="button" class="pr-cast-exit" @click="closeCast">退出 Esc</button></span>
      </div>
      <div class="pr-cast-list">
        <div
          v-for="row in perfRows"
          :key="row.userId"
          class="pr-cast-row"
          :class="[row.currentUser ? 'is-me' : '', row.rank <= 3 ? 'is-r' + row.rank : '']"
        >
          <span class="pr-cast-rank">{{ row.rank }}</span>
          <span class="pr-cast-delta" :class="perfDelta(row).cls">{{ perfDelta(row).text }}</span>
          <span class="pr-cast-name">{{ row.name }}<small>{{ row.deptName || '' }} · {{ row.orderCount }} 单</small></span>
          <span class="pr-cast-money">{{ castWan(row.amount) }}<i>万</i></span>
        </div>
        <div v-if="!perfRows.length" class="pr-cast-empty">所选区间暂无到款数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { cockpitApi, type PerfRankData, type PerfRankRow } from '@/api/cockpit'
import CallRecordingPanel from './components/call-recording-panel.vue'
import {
  callRecordApi,
  type CallLeaderboardData,
  type CallLeaderboardMetric,
  type CallLeaderboardPeriod,
  type CallLeaderboardRow
} from '@/api/call-record'

defineOptions({ name: 'BizPerfBoard' })

// 业务线分类色板(数据驱动的语义色,保留)
const COLORS = [
  '#3370ff', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899',
  '#06b6d4', '#10b981', '#6366f1', '#ef4444'
]
const colorAt = (idx: number) => COLORS[idx % COLORS.length]

const route = useRoute()
const pageTitle = computed(() => (route.meta?.title as string) || '业绩看板')
const scopeLabel = computed(() => (route.meta?.scope === 'team' ? '团队' : '个人'))
const activeTab = ref<'personal' | 'ranking' | 'recordings'>('ranking')

// ====== 全公司通话排行 ======
const leaderboardPeriodOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]
const leaderboardMetricOptions = [
  { label: '拨打量', value: 'calls' },
  { label: '有效沟通', value: 'effective' },
  { label: '接通率', value: 'connectRate' }
]

type LeaderboardDateRange = [string, string]

const toIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayIsoDate = () => toIsoDate(new Date())

const rangeForPeriod = (periodValue: Exclude<CallLeaderboardPeriod, 'custom'>): LeaderboardDateRange => {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (periodValue === 'week') {
    const mondayOffset = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - mondayOffset)
  } else if (periodValue === 'month') {
    start.setDate(1)
  }
  return [toIsoDate(start), toIsoDate(today)]
}

const normalizeDateRange = (value: unknown): LeaderboardDateRange | null => {
  if (!Array.isArray(value) || value.length !== 2) return null
  const start = String(value[0] || '')
  const end = String(value[1] || '')
  const pattern = /^\d{4}-\d{2}-\d{2}$/
  if (!pattern.test(start) || !pattern.test(end) || start > end) return null
  return [start, end]
}

const dateRangeDays = ([start, end]: LeaderboardDateRange) => {
  const [startYear, startMonth, startDay] = start.split('-').map(Number)
  const [endYear, endMonth, endDay] = end.split('-').map(Number)
  const startUtc = Date.UTC(startYear, startMonth - 1, startDay)
  const endUtc = Date.UTC(endYear, endMonth - 1, endDay)
  return Math.round((endUtc - startUtc) / 86400000) + 1
}

const inferPeriod = (range: LeaderboardDateRange): CallLeaderboardPeriod => {
  for (const periodValue of ['today', 'week', 'month'] as const) {
    const preset = rangeForPeriod(periodValue)
    if (preset[0] === range[0] && preset[1] === range[1]) return periodValue
  }
  return 'custom'
}

const emptyLeaderboardRow = (): CallLeaderboardRow => ({
  agentName: '我',
  deptName: '未设置部门',
  callCount: 0,
  connectedCount: 0,
  connectRate: 0,
  validCount: 0,
  validRate: 0,
  totalDuration: 0,
  totalDurationText: '0:00:00',
  targetCount: 400,
  targetProgress: 0,
  currentUser: true
})

const emptyLeaderboard = (): CallLeaderboardData => ({
  period: 'today',
  metric: 'calls',
  startDate: todayIsoDate(),
  endDate: todayIsoDate(),
  targetPerDay: 400,
  periodDays: 1,
  targetCount: 400,
  gapUnit: '通',
  self: emptyLeaderboardRow(),
  rows: []
})

const leaderboardPeriod = ref<CallLeaderboardPeriod>('today')
const leaderboardMetric = ref<CallLeaderboardMetric>('calls')
const leaderboardDateRange = ref<LeaderboardDateRange>(rangeForPeriod('today'))
const lastValidDateRange = ref<LeaderboardDateRange>([
  leaderboardDateRange.value[0],
  leaderboardDateRange.value[1]
])
const leaderboardLoading = ref(false)
const leaderboardError = ref(false)
const leaderboardData = ref<CallLeaderboardData>(emptyLeaderboard())
const selfRow = computed(() => leaderboardData.value.self || emptyLeaderboardRow())
const leaderboardPeriodLabel = computed(() =>
  leaderboardPeriodOptions.find(item => item.value === leaderboardPeriod.value)?.label || '所选日期'
)
const leaderboardRangeLabel = computed(() => {
  const [start, end] = leaderboardDateRange.value
  return start === end ? start : `${start} 至 ${end}`
})
const gapTitle = computed(() => {
  if (!selfRow.value.rank) return '暂未上榜'
  return selfRow.value.rank === 1 ? '领先第二名' : '距前一名'
})
const gapValue = computed(() => {
  const gap = leaderboardData.value.gapToPrevious
  if (gap === undefined || gap === null) return '--'
  return leaderboardData.value.gapUnit === '%' ? formatDecimal(gap) : formatInteger(gap)
})

// ====== 业绩排行(到款口径=订单财务确认归业务员,与旧"业务线到款"同源同径) ======
const perfPeriod = ref<CallLeaderboardPeriod>('month')
const perfRange = ref<LeaderboardDateRange>(rangeForPeriod('month'))
const perfLastValid = ref<LeaderboardDateRange>([perfRange.value[0], perfRange.value[1]])
const perfLoading = ref(false)
const perfError = ref(false)
const perfRows = ref<PerfRankRow[]>([])
const perfMe = ref<PerfRankData['me']>({ rank: null, amount: 0, orderCount: 0, total: 0 })
const castUpdatedAt = ref('--:--')

// ====== 金额格式化:统一 "¥X.X万" ======
const formatWan = (yuan: number): string => {
  const wan = (Number(yuan) || 0) / 10000
  return `¥${wan.toFixed(1)}万`
}
const castWan = (yuan: number): string => ((Number(yuan) || 0) / 10000).toFixed(1)

const loadPerfRank = async () => {
  perfLoading.value = true
  perfError.value = false
  try {
    const res: any = await cockpitApi.getPerfRank(perfRange.value[0], perfRange.value[1])
    const data = (res?.data ?? res ?? {}) as Partial<PerfRankData>
    perfRows.value = Array.isArray(data.list) ? (data.list as PerfRankRow[]) : []
    perfMe.value = { rank: null, amount: 0, orderCount: 0, total: 0, ...(data.me || {}) }
    castUpdatedAt.value = new Date().toTimeString().slice(0, 5)
  } catch (e: any) {
    perfRows.value = []
    perfMe.value = { rank: null, amount: 0, orderCount: 0, total: 0 }
    perfError.value = true
    ElMessage.error(e?.message || '业绩排行加载失败,请重试')
  } finally {
    perfLoading.value = false
  }
}

const handlePerfPeriodChange = (value: unknown) => {
  if (value !== 'today' && value !== 'week' && value !== 'month') return
  const range = rangeForPeriod(value)
  perfRange.value = range
  perfLastValid.value = [range[0], range[1]]
  loadPerfRank()
}

const handlePerfDateChange = (value: unknown) => {
  const range = normalizeDateRange(value)
  if (!range) {
    perfRange.value = [perfLastValid.value[0], perfLastValid.value[1]]
    return
  }
  if (dateRangeDays(range) > 366) {
    ElMessage.warning('日期范围最多选择 366 天')
    perfRange.value = [perfLastValid.value[0], perfLastValid.value[1]]
    return
  }
  perfRange.value = range
  perfLastValid.value = [range[0], range[1]]
  perfPeriod.value = inferPeriod(range)
  loadPerfRank()
}

// 升降标记:与上一等长周期名次对比;上期不在榜=「新」
const perfDelta = (row: PerfRankRow): { cls: string; text: string } => {
  if (row.prevRank == null) return { cls: 'is-new', text: '新' }
  if (row.prevRank > row.rank) return { cls: 'is-up', text: `↑${row.prevRank - row.rank}` }
  if (row.prevRank < row.rank) return { cls: 'is-down', text: `↓${row.rank - row.prevRank}` }
  return { cls: 'is-flat', text: '—' }
}
const perfMoM = (row: PerfRankRow): string => {
  const prev = Number(row.prevAmount)
  if (!prev || prev <= 0) return ''
  const pct = ((Number(row.amount) - prev) / prev) * 100
  return ` · 较上期 ${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`
}
const riseStar = computed<PerfRankRow | null>(() => {
  let best: PerfRankRow | null = null
  let bestGain = 0
  for (const r of perfRows.value) {
    if (r.prevRank == null) continue
    const gain = r.prevRank - r.rank
    if (gain > bestGain) { best = r; bestGain = gain }
  }
  return bestGain > 0 ? best : null
})
const fallStar = computed<PerfRankRow | null>(() => {
  let best: PerfRankRow | null = null
  let bestDrop = 0
  for (const r of perfRows.value) {
    if (r.prevRank == null) continue
    const drop = r.rank - r.prevRank
    if (drop > bestDrop) { best = r; bestDrop = drop }
  }
  return bestDrop > 0 ? best : null
})
// 领奖台按 2-1-3 站位
const podiumOrder = computed(() => {
  const t = perfRows.value.slice(0, 3)
  const order: { row: PerfRankRow; cls: string }[] = []
  if (t[1]) order.push({ row: t[1], cls: 'is-second' })
  if (t[0]) order.push({ row: t[0], cls: 'is-first' })
  if (t[2]) order.push({ row: t[2], cls: 'is-third' })
  return order
})
const rankChipClass = (rank: number) => (rank === 1 ? 'is-g' : rank === 2 ? 'is-s' : rank === 3 ? 'is-b' : '')
const perfRowClass = ({ row }: { row: PerfRankRow }) => (row.currentUser ? 'is-current-user' : '')

// ====== 投屏模式(H):全屏深色大字榜,Esc 退出,每小时自动刷新 ======
const castMode = ref(false)
let castTimer: number | null = null
const onCastKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCast() }
const openCast = () => {
  castMode.value = true
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onCastKey)
  castTimer = window.setInterval(loadPerfRank, 60 * 60 * 1000)
}
const closeCast = () => {
  if (!castMode.value) return
  castMode.value = false
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onCastKey)
  if (castTimer != null) { window.clearInterval(castTimer); castTimer = null }
}
onUnmounted(closeCast)

const loadLeaderboard = async () => {
  leaderboardLoading.value = true
  leaderboardError.value = false
  try {
    const params: {
      period: CallLeaderboardPeriod
      metric: CallLeaderboardMetric
      startDate?: string
      endDate?: string
    } = {
      period: leaderboardPeriod.value,
      metric: leaderboardMetric.value
    }
    if (leaderboardPeriod.value === 'custom') {
      params.startDate = leaderboardDateRange.value[0]
      params.endDate = leaderboardDateRange.value[1]
    }
    const res: any = await callRecordApi.leaderboard(params)
    const data = (res?.data ?? res ?? {}) as Partial<CallLeaderboardData>
    leaderboardData.value = {
      ...emptyLeaderboard(),
      ...data,
      self: { ...emptyLeaderboardRow(), ...(data.self || {}) },
      rows: Array.isArray(data.rows) ? data.rows : []
    }
    const responseRange = normalizeDateRange([data.startDate, data.endDate])
    if (responseRange) {
      leaderboardDateRange.value = responseRange
      lastValidDateRange.value = [responseRange[0], responseRange[1]]
    }
    if (data.period) leaderboardPeriod.value = data.period
  } catch (e: any) {
    leaderboardData.value = emptyLeaderboard()
    leaderboardError.value = true
    ElMessage.error(e?.message || '通话排行加载失败，请重试')
  } finally {
    leaderboardLoading.value = false
  }
}

const handleLeaderboardPeriodChange = (value: unknown) => {
  if (value !== 'today' && value !== 'week' && value !== 'month') return
  leaderboardPeriod.value = value
  const range = rangeForPeriod(value)
  leaderboardDateRange.value = range
  lastValidDateRange.value = [range[0], range[1]]
  loadLeaderboard()
}

const handleLeaderboardDateChange = (value: unknown) => {
  const range = normalizeDateRange(value)
  if (!range) {
    leaderboardDateRange.value = [lastValidDateRange.value[0], lastValidDateRange.value[1]]
    return
  }
  const days = dateRangeDays(range)
  if (days > 366) {
    ElMessage.warning('日期范围最多选择 366 天')
    leaderboardDateRange.value = [lastValidDateRange.value[0], lastValidDateRange.value[1]]
    return
  }
  leaderboardDateRange.value = range
  lastValidDateRange.value = [range[0], range[1]]
  leaderboardPeriod.value = inferPeriod(range)
  loadLeaderboard()
}

const disableFutureLeaderboardDate = (date: Date) => toIsoDate(date) > todayIsoDate()

const formatInteger = (value?: number) => Math.round(Number(value || 0)).toLocaleString('zh-CN')
const formatDecimal = (value?: number) => {
  const number = Number(value || 0)
  return Number.isInteger(number) ? number.toFixed(0) : number.toFixed(1)
}
const formatPercent = (value?: number) => `${formatDecimal(value)}%`
const progressBarValue = (value?: number) => Math.min(Math.max(Number(value || 0), 0), 100)
const progressColor = (value?: number) => Number(value || 0) >= 100 ? '#16a34a' : '#c56a08'
const progressTone = (value?: number) => Number(value || 0) >= 100 ? 'is-achieved' : 'is-behind'
const firstCharacter = (value?: string) => String(value || '销').trim().charAt(0) || '销'
const rankNumberClass = (rank?: number) => rank && rank <= 3 ? `is-top-${rank}` : ''
const leaderboardRowClass = ({ row }: { row: CallLeaderboardRow }) => row.currentUser ? 'is-current-user' : ''

watch(leaderboardMetric, () => {
  if (activeTab.value === 'ranking') loadLeaderboard()
})
watch(activeTab, (tab) => {
  if (tab === 'ranking') loadLeaderboard()
  else loadPerfRank()
})

onMounted(() => {
  loadLeaderboard()
})
</script>

<style scoped lang="scss">
@use '../../styles/sales-common.scss';

.biz-perf {
  min-width: 0;
  padding: 20px 24px 28px;
  color: #1f2937;
}
.bp-pending { color: var(--text-subtle) !important; font-size: 20px; }

.result-page-head {
  display: flex;
  align-items: center;
  min-height: 42px;
}
.result-page-head h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.35;
  font-weight: 750;
  letter-spacing: 0;
  color: #172033;
}
.result-tabs { margin-top: 12px; }
:deep(.result-tabs > .el-tabs__header) { margin: 0 0 20px; }
:deep(.result-tabs > .el-tabs__header .el-tabs__item) {
  height: 48px;
  padding: 0 26px;
  font-size: 16px;
  font-weight: 650;
}
:deep(.result-tabs > .el-tabs__content) { display: none; }
.personal-result-head { margin-top: 0; }

.leaderboard-panel {
  min-width: 0;
  min-height: 420px;
}
.self-summary {
  display: grid;
  grid-template-columns: minmax(190px, 0.9fr) minmax(320px, 1.8fr) minmax(165px, 0.8fr) minmax(180px, 0.9fr);
  align-items: stretch;
  min-height: 88px;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.self-stat,
.self-target {
  min-width: 0;
  padding: 20px 28px;
  border-right: 1px solid #e8edf4;
}
.self-stat:last-child { border-right: 0; }
.self-stat {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}
.self-stat span {
  color: #667085;
  font-size: 15px;
  font-weight: 600;
}
.self-stat strong {
  color: #164ea6;
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.self-stat em {
  color: #526179;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
}
.self-target {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 11px;
}
.target-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #4b5565;
  font-size: 15px;
}
.target-line b { color: #24324a; font-size: 18px; }
.target-copy {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
  white-space: nowrap;
}
.target-copy small {
  margin-left: 4px;
  color: #7b879b;
  font-size: 12px;
  font-weight: 500;
}
.target-line strong {
  color: #164ea6;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}
.gap-stat strong { color: #c45f08; }

.leaderboard-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin: 20px 0 14px;
}
.visibility-note {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  color: #344054;
  font-size: 15px;
}
.visibility-note .el-icon { color: #1765d1; font-size: 18px; }
.visibility-note strong { font-weight: 700; }
.visibility-note span { color: #7b879b; font-size: 13px; }
.leaderboard-controls {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.date-control,
.metric-control {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.date-control > span,
.metric-control > span {
  color: #667085;
  font-size: 13px;
  font-weight: 600;
}
:deep(.leaderboard-date-range) {
  --el-date-editor-width: 230px;
  width: 230px !important;
}
:deep(.leaderboard-date-range.el-range-editor.el-input__wrapper) {
  min-height: 40px;
  padding: 0 10px;
  font-size: 14px;
}
:deep(.leaderboard-controls .el-segmented) {
  min-height: 40px;
  padding: 3px;
  border: 1px solid #dfe5ee;
  background: #f7f9fc;
}
:deep(.leaderboard-controls .el-segmented__item) {
  min-width: 72px;
  min-height: 32px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 650;
}
:deep(.metric-control .el-segmented__item) { min-width: 84px; }
.refresh-rank { width: 40px; height: 40px; }
.leaderboard-error { margin-bottom: 12px; }

.leaderboard-table-wrap {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  background: #fff;
}
:deep(.leaderboard-table) { --el-table-border-color: #edf1f6; }
:deep(.leaderboard-table th.el-table__cell) {
  height: 54px;
  padding: 0;
  background: #f7f9fc;
  color: #344054;
  font-size: 14px;
  font-weight: 750;
}
:deep(.leaderboard-table td.el-table__cell) {
  height: 58px;
  padding: 0;
  color: #344054;
  font-size: 15px;
}
:deep(.leaderboard-table .cell) { line-height: 1.4; }
:deep(.leaderboard-table .is-current-user > td.el-table__cell) {
  background: #edf5ff !important;
  color: #164ea6;
}
:deep(.leaderboard-table .is-current-user:hover > td.el-table__cell) { background: #e5f0ff !important; }
.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #475467;
  font-size: 15px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.rank-number.is-top-1,
.rank-number.is-top-2,
.rank-number.is-top-3 {
  border-radius: 7px;
  color: #fff;
}
.rank-number.is-top-1 { background: #bd8215; }
.rank-number.is-top-2 { background: #788496; }
.rank-number.is-top-3 { background: #ad6335; }
.agent-name-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.agent-avatar {
  display: inline-flex;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #e8f1ff;
  color: #1765d1;
  font-size: 14px;
  font-weight: 750;
}
.agent-name { min-width: 0; color: inherit; font-size: 15px; }
.agent-name-cell em {
  flex: 0 0 auto;
  color: #1765d1;
  font-size: 13px;
  font-style: normal;
  font-weight: 750;
}
.primary-value { color: #164ea6; font-size: 16px; font-variant-numeric: tabular-nums; }
.target-progress-cell {
  display: grid;
  grid-template-columns: 46px minmax(32px, 1fr) 58px;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.target-progress-cell strong,
.target-progress-cell span {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.target-progress-cell strong { font-size: 15px; }
.target-progress-cell strong.is-achieved { color: #16803b; }
.target-progress-cell strong.is-behind { color: #b85c08; }
.target-progress-cell span { color: #526179; font-size: 13px; text-align: right; }
.leaderboard-footnote {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
  padding: 13px 4px 0;
  color: #7b879b;
  font-size: 13px;
}
.leaderboard-footnote span + span::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  margin: 0 9px 3px 0;
  border-radius: 50%;
  background: #aab3c2;
}

/* donut */
.bp-donut-wrap {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
  padding: 8px 4px;
}
.bp-donut-svg { flex: 0 0 auto; }
.bp-donut-seg { transition: opacity 0.2s ease, stroke-width 0.2s ease; cursor: pointer; }
.bp-donut-center-main { font-size: 22px; font-weight: 700; fill: var(--text-primary); }
.bp-donut-center-sub { font-size: 13px; fill: var(--text-muted); }

/* 图例 */
.bp-legend {
  flex: 1 1 320px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bp-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.15s;
  cursor: pointer;
}
.bp-legend-item:hover,
.bp-legend-item.active { background: var(--el-color-primary-light-9); }
.bp-legend-dot { flex: 0 0 auto; width: 12px; height: 12px; border-radius: 3px; }
.bp-legend-name { flex: 1 1 auto; font-size: 14px; color: var(--text-primary); }
.bp-legend-amount { flex: 0 0 auto; font-size: 14px; font-weight: 600; color: var(--text-primary); min-width: 90px; text-align: right; font-variant-numeric: tabular-nums; }
.bp-legend-pct { flex: 0 0 auto; font-size: 13px; color: var(--text-muted); min-width: 56px; text-align: right; font-variant-numeric: tabular-nums; }

.text-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 1440px) {
  .biz-perf { padding: 18px 20px 24px; }
  .self-summary { grid-template-columns: minmax(170px, 0.8fr) minmax(280px, 1.5fr) minmax(145px, 0.7fr) minmax(160px, 0.8fr); }
  .self-stat,
  .self-target { padding: 18px 20px; }
  .leaderboard-toolbar { align-items: flex-start; }
  .visibility-note { flex-wrap: wrap; max-width: 300px; }
  .leaderboard-controls { gap: 8px; }
  :deep(.leaderboard-controls .el-segmented__item) { min-width: 64px; padding: 0 10px; }
  :deep(.metric-control .el-segmented__item) { min-width: 76px; }
}

@media (max-width: 1100px) {
  .self-summary { grid-template-columns: 1fr 1.5fr; }
  .self-stat:nth-child(2),
  .self-target:nth-child(2) { border-right: 0; }
  .self-stat:nth-child(-n + 2),
  .self-target:nth-child(-n + 2) { border-bottom: 1px solid #e8edf4; }
  .leaderboard-toolbar { align-items: stretch; flex-direction: column; }
  .visibility-note { max-width: none; }
  .leaderboard-controls { justify-content: flex-start; }
}

@media (max-width: 720px) {
  .biz-perf { padding: 16px; }
  .result-page-head h1 { font-size: 24px; }
  :deep(.result-tabs > .el-tabs__header .el-tabs__item) { padding: 0 18px; }
  .self-summary { grid-template-columns: 1fr; }
  .self-stat,
  .self-target { min-height: 74px; border-right: 0; border-bottom: 1px solid #e8edf4; }
  .self-stat:last-child { border-bottom: 0; }
  .leaderboard-controls { align-items: flex-start; flex-direction: column; }
  .date-control,
  .metric-control { width: 100%; }
  :deep(.leaderboard-date-range) { --el-date-editor-width: 100%; width: 100% !important; }
  :deep(.leaderboard-controls .el-segmented) { max-width: 100%; overflow-x: auto; }
}

/* ===== 业绩排行(组合方案 A领奖台+F升降+H投屏) ===== */
.pr-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
.pr-stat { background: #fff; border: 1px solid #e8ecf2; border-radius: 8px; padding: 13px 16px; }
.pr-label { font-size: 12px; color: #7d8aa0; display: block; }
.pr-value { font-size: 24px; font-weight: 700; color: #1d2433; font-variant-numeric: tabular-nums; }
.pr-value em { font-style: normal; font-size: 13px; font-weight: 400; color: #7d8aa0; margin-left: 3px; }
.pr-value.pr-none { color: #99a3b5; }
.pr-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.pr-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pr-cast-btn { background: #1d2433; border-color: #1d2433; color: #fff; font-weight: 600; }
.pr-cast-btn:hover, .pr-cast-btn:focus { background: #303b52; border-color: #303b52; color: #fff; }
.pr-empty { background: #fff; border: 1px solid #e8ecf2; border-radius: 8px; padding: 48px 0; text-align: center; color: #99a3b5; font-size: 13px; }
.pr-empty p { margin: 0; }

.pr-stars { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.pr-star { border-radius: 8px; padding: 13px 16px; display: flex; align-items: center; gap: 11px; }
.pr-star.is-rise { background: linear-gradient(135deg, #e9f7ee, #f6fdf8); border: 1px solid #cdeeda; }
.pr-star.is-fall { background: linear-gradient(135deg, #fdf2ec, #fefaf7); border: 1px solid #f6dcc8; }
.pr-star .pr-ava { width: 38px; height: 38px; font-size: 14px; }
.pr-star-t { font-size: 11px; color: #7d8aa0; }
.pr-star-n { font-weight: 700; font-size: 14px; color: #1d2433; }
.pr-star-n small { font-weight: 400; font-size: 11px; color: #7d8aa0; margin-left: 6px; }

.pr-ava { width: 26px; height: 26px; border-radius: 50%; background: #e5efff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex: none; }
.pr-delta { display: inline-flex; align-items: center; font-size: 11.5px; font-weight: 700; border-radius: 4px; padding: 1px 7px; }
.pr-delta.is-up { color: #16a34a; background: #e9f7ee; }
.pr-delta.is-down { color: #dc2626; background: #fdeeee; }
.pr-delta.is-flat { color: #7d8aa0; background: #f2f4f8; }
.pr-delta.is-new { color: #2563eb; background: #eaf1fe; }

.pr-board { background: #fff; border: 1px solid #e8ecf2; border-radius: 8px; overflow: hidden; }
.pr-podium { display: flex; align-items: flex-end; justify-content: center; gap: 14px; padding: 22px 10px 0; }
.pr-pod { text-align: center; width: 158px; }
.pr-pod .pr-ava { width: 44px; height: 44px; font-size: 16px; margin: 0 auto 6px; display: flex; }
.pr-pod.is-first .pr-ava { width: 54px; height: 54px; background: #fdf3d7; color: #b8860b; box-shadow: 0 0 0 3px #f3ddad; }
.pr-pod.is-second .pr-ava { background: #eef1f5; color: #6b7787; box-shadow: 0 0 0 3px #dde3ec; }
.pr-pod.is-third .pr-ava { background: #f7e9de; color: #b0713c; box-shadow: 0 0 0 3px #ecd4c0; }
.pr-pod-n { font-weight: 600; font-size: 13px; color: #1d2433; }
.pr-pod-m { font-size: 19px; font-weight: 700; color: #1d2433; font-variant-numeric: tabular-nums; }
.pr-pod-base { border-radius: 8px 8px 0 0; margin-top: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 15px; }
.pr-pod.is-first .pr-pod-base { height: 66px; background: linear-gradient(180deg, #e9b93a, #cf9a13); }
.pr-pod.is-second .pr-pod-base { height: 48px; background: linear-gradient(180deg, #aab4c2, #8d99a9); }
.pr-pod.is-third .pr-pod-base { height: 38px; background: linear-gradient(180deg, #c98d5d, #b0713c); }

.pr-rankchip { display: inline-flex; width: 22px; height: 22px; border-radius: 6px; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; background: #eef1f5; color: #6b7787; }
.pr-rankchip.is-g { background: #fdf3d7; color: #b8860b; }
.pr-rankchip.is-s { background: #eef1f5; color: #6b7787; }
.pr-rankchip.is-b { background: #f7e9de; color: #b0713c; }
.pr-name em { font-style: normal; color: #2563eb; font-size: 11px; margin-left: 3px; }
.pr-amount { font-variant-numeric: tabular-nums; }
.pr-share { height: 6px; border-radius: 3px; background: #eef1f6; overflow: hidden; min-width: 90px; }
.pr-share i { display: block; height: 100%; border-radius: 3px; background: #2563eb; }
.pr-table { width: 100%; }
.pr-table :deep(.is-current-user) { background: #f2f7ff; }
.pr-table :deep(.is-current-user td:first-child) { box-shadow: inset 3px 0 0 #2563eb; }

/* 投屏浮层 */
.pr-cast-overlay { position: fixed; inset: 0; z-index: 3000; background: #0b1220; display: flex; flex-direction: column; overflow-y: auto; }
.pr-cast-head { display: flex; justify-content: space-between; align-items: center; padding: 26px 42px 10px; color: #dfe6f3; flex-wrap: wrap; gap: 10px; }
.pr-cast-title { font-size: 24px; font-weight: 700; letter-spacing: .04em; }
.pr-cast-title small { color: #5d6b8a; font-weight: 400; font-size: 13px; margin-left: 12px; }
.pr-cast-meta { font-size: 13px; color: #5d6b8a; display: inline-flex; align-items: center; gap: 12px; }
.pr-cast-exit { background: transparent; border: 1px solid #2a3654; color: #8fa0c4; border-radius: 6px; padding: 4px 14px; font-size: 12px; cursor: pointer; }
.pr-cast-exit:hover { border-color: #5b8def; color: #cfe0ff; }
.pr-cast-list { padding: 8px 18px 30px; }
.pr-cast-row { display: grid; grid-template-columns: 74px 52px 1fr auto; align-items: center; gap: 16px; padding: 16px 26px; border-bottom: 1px solid rgba(255,255,255,.06); }
.pr-cast-row:last-child { border-bottom: 0; }
.pr-cast-row.is-me { background: rgba(91,141,239,.12); box-shadow: inset 3px 0 0 #5b8def; border-radius: 6px; }
.pr-cast-rank { font-size: 30px; font-weight: 800; color: #3c4a68; font-variant-numeric: tabular-nums; text-align: center; }
.pr-cast-row.is-r1 .pr-cast-rank { color: #e9b93a; }
.pr-cast-row.is-r2 .pr-cast-rank { color: #aab4c2; }
.pr-cast-row.is-r3 .pr-cast-rank { color: #c98d5d; }
.pr-cast-delta { font-size: 15px; font-weight: 700; text-align: center; }
.pr-cast-delta.is-up { color: #4ade80; }
.pr-cast-delta.is-down { color: #f87171; }
.pr-cast-delta.is-flat, .pr-cast-delta.is-new { color: #475877; }
.pr-cast-name { color: #dfe6f3; font-size: 20px; font-weight: 600; }
.pr-cast-name small { color: #5d6b8a; font-size: 13px; font-weight: 400; margin-left: 10px; }
.pr-cast-money { color: #fff; font-size: 30px; font-weight: 800; font-variant-numeric: tabular-nums; }
.pr-cast-money i { font-style: normal; font-size: 14px; font-weight: 400; color: #7d8aa0; margin-left: 3px; }
.pr-cast-empty { color: #5d6b8a; text-align: center; padding: 60px 0; font-size: 15px; }

@media (max-width: 768px) {
  .pr-stats, .pr-stars { grid-template-columns: 1fr; }
  .pr-podium { gap: 8px; }
  .pr-pod { width: 108px; }
  .pr-cast-row { grid-template-columns: 46px 40px 1fr auto; padding: 12px 14px; }
  .pr-cast-name { font-size: 15px; }
  .pr-cast-money { font-size: 20px; }
}
</style>
