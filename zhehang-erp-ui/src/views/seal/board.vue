<template>
  <div class="seal-board">
    <header class="sb-head">
      <div>
        <h2 class="sb-title">印章业务看板</h2>
        <p class="sb-sub">按年汇总刻章收款、成本、利润、新签与效率，底部保留月度明细表用于复盘。</p>
      </div>
      <div class="sb-actions">
        <el-date-picker
          v-model="year"
          type="year"
          value-format="YYYY"
          placeholder="选择年份"
          :clearable="false"
          class="sb-year"
          @change="load"
        />
        <el-button :loading="loading" @click="load">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </header>

    <section class="sb-kpis">
      <article v-for="item in kpis" :key="item.key" class="sb-kpi" :class="`sb-kpi--${item.tone}`">
        <div>
          <span class="sb-kpi-label">{{ item.label }}</span>
          <strong class="sb-kpi-value">{{ item.value }}</strong>
        </div>
        <div class="sb-kpi-foot">
          <span>{{ item.note }}</span>
          <b :class="item.deltaClass">{{ item.delta }}</b>
        </div>
      </article>
    </section>

    <el-skeleton v-if="loading && !months.length" :rows="8" animated />

    <template v-else>
      <el-empty v-if="!hasData" :description="`${year} 年还没有刻章提单或成本数据`" :image-size="96" />

      <template v-else>
        <section class="sb-main-grid">
          <article class="sb-panel sb-trend">
            <div class="sb-panel-head">
              <div>
                <h3>月度收款趋势</h3>
                <p>根据刻章提单收款汇总，帮助判断哪个月份业务拉动最明显。</p>
              </div>
              <el-tag type="success" effect="light">{{ bestRevenueLabel }}</el-tag>
            </div>

            <div class="sb-bars">
              <div v-for="m in fullMonths" :key="m.month" class="sb-bar-item">
                <div class="sb-bar-wrap">
                  <div class="sb-bar-value">{{ shortMoney(m.revenue) }}</div>
                  <div class="sb-bar" :class="{ 'is-focus': m.month === focusMonth?.month }" :style="{ height: barHeight(m.revenue) }" />
                </div>
                <span>{{ monthLabel(m.month) }}</span>
              </div>
            </div>

            <div class="sb-summary-strip">
              <div>
                <span>最佳月份</span>
                <b>{{ bestRevenueMonth ? `${monthLabel(bestRevenueMonth.month)} · ${fmtMoney(bestRevenueMonth.revenue)}` : '—' }}</b>
              </div>
              <div>
                <span>最低利润率</span>
                <b :class="worstProfitRateMonth ? profitClass(worstProfitRateMonth.profitRate) : ''">
                  {{ worstProfitRateMonth ? `${monthLabel(worstProfitRateMonth.month)} · ${fmtPct(worstProfitRateMonth.profitRate)}` : '—' }}
                </b>
              </div>
              <div>
                <span>成本最高月</span>
                <b>{{ highestCostMonth ? `${monthLabel(highestCostMonth.month)} · ${fmtMoney(highestCostMonth.cost)}` : '—' }}</b>
              </div>
              <div>
                <span>当前关注</span>
                <b>{{ focusMonth ? `${monthLabel(focusMonth.month)} · ${focusAction}` : '暂无' }}</b>
              </div>
            </div>
          </article>

          <article class="sb-panel">
            <div class="sb-panel-head">
              <div>
                <h3>经营提示</h3>
                <p>把月度数据自动翻译成下一步要看的问题。</p>
              </div>
              <el-tag type="warning" effect="light">{{ insights.length }} 条提示</el-tag>
            </div>

            <div class="sb-insights">
              <div v-for="item in insights" :key="item.title" class="sb-insight">
                <i :class="`is-${item.tone}`" />
                <div>
                  <b>{{ item.title }}</b>
                  <span>{{ item.desc }}</span>
                </div>
                <em :class="`is-${item.tone}`">{{ item.tag }}</em>
              </div>
            </div>
          </article>
        </section>

        <section class="sb-month-cards">
          <article v-for="m in monthCards" :key="m.month" class="sb-month-card" :class="{ 'is-focus': m.month === focusMonth?.month }">
            <strong>{{ monthLabel(m.month) }}</strong>
            <span>收款 {{ shortMoney(m.revenue) }}</span>
            <span>利润率 <b :class="profitClass(m.profitRate)">{{ fmtPct(m.profitRate) }}</b></span>
          </article>
        </section>

        <section class="sb-ledger">
          <div class="sb-panel-head">
            <div>
              <h3>月度指标明细</h3>
              <p>保留原有“指标 × 月份”口径，并补充全年汇总与动作建议。</p>
            </div>
            <el-tag effect="plain">共 {{ activeMonthCount }} 个月有数据</el-tag>
          </div>

          <div class="sb-table-scroll">
            <table class="sb-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th v-for="m in fullMonths" :key="m.month">{{ monthLabel(m.month) }}</th>
                  <th>全年</th>
                  <th>动作建议</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in detailRows" :key="row.key">
                  <td>{{ row.label }}</td>
                  <td v-for="m in fullMonths" :key="m.month" :class="cellClass(row.key, valueOf(row.key, m))">
                    {{ formatByType(valueOf(row.key, m), row.fmt) }}
                  </td>
                  <td :class="cellClass(row.key, row.yearValue)">{{ formatByType(row.yearValue, row.fmt) }}</td>
                  <td>{{ row.action }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <p class="sb-tip">数据说明：收款、刻章数量、新签来自「刻章业务提单」；总成本来自「刻章成本明细」。利润 = 收款 - 成本，日刻章量 = 当月刻章数 ÷ 当月有提单的天数。</p>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { sealBoardApi } from '@/api/seal'

interface MonthMetric {
  month: string
  revenue: number
  cost: number
  profit: number
  profitRate: number
  sealCount: number
  avgPrice: number
  dailyCount: number
  newCount: number
  newAmount: number
}

interface DetailRow {
  key: keyof Omit<MonthMetric, 'month'>
  label: string
  fmt: 'money' | 'pct' | 'int' | 'num1'
  yearValue: number
  action: string
}

const year = ref(String(new Date().getFullYear()))
const months = ref<MonthMetric[]>([])
const loading = ref(false)

const toNum = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const emptyMonth = (month: string): MonthMetric => ({
  month,
  revenue: 0,
  cost: 0,
  profit: 0,
  profitRate: 0,
  sealCount: 0,
  avgPrice: 0,
  dailyCount: 0,
  newCount: 0,
  newAmount: 0
})

const normalizeMonth = (raw: any): MonthMetric => ({
  month: String(raw?.month || ''),
  revenue: toNum(raw?.revenue),
  cost: toNum(raw?.cost),
  profit: toNum(raw?.profit),
  profitRate: toNum(raw?.profitRate),
  sealCount: toNum(raw?.sealCount),
  avgPrice: toNum(raw?.avgPrice),
  dailyCount: toNum(raw?.dailyCount),
  newCount: toNum(raw?.newCount),
  newAmount: toNum(raw?.newAmount)
})

const load = async () => {
  loading.value = true
  try {
    const res: any = await sealBoardApi.summary(year.value)
    months.value = ((res?.data ?? res) || [])
      .map(normalizeMonth)
      .filter((m: MonthMetric) => /^\d{4}-\d{2}$/.test(m.month))
      .sort((a: MonthMetric, b: MonthMetric) => a.month.localeCompare(b.month))
  } catch {
    months.value = []
    ElMessage.error('印章业务看板加载失败')
  } finally {
    loading.value = false
  }
}

const fullMonths = computed(() => {
  const byMonth = new Map<string, MonthMetric>(months.value.map((m) => [m.month, m]))
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year.value}-${String(i + 1).padStart(2, '0')}`
    return byMonth.get(month) || emptyMonth(month)
  })
})

const hasData = computed(() => fullMonths.value.some((m) =>
  m.revenue || m.cost || m.profit || m.sealCount || m.newCount || m.newAmount
))
const activeMonthCount = computed(() => fullMonths.value.filter((m) =>
  m.revenue || m.cost || m.sealCount || m.newCount || m.newAmount
).length)

const sum = (key: keyof Omit<MonthMetric, 'month'>) => fullMonths.value.reduce((s, m) => s + toNum(m[key]), 0)
const totalRevenue = computed(() => sum('revenue'))
const totalCost = computed(() => sum('cost'))
const totalProfit = computed(() => totalRevenue.value - totalCost.value)
const totalSealCount = computed(() => sum('sealCount'))
const totalNewCount = computed(() => sum('newCount'))
const totalNewAmount = computed(() => sum('newAmount'))
const yearProfitRate = computed(() => totalRevenue.value > 0 ? totalProfit.value / totalRevenue.value : 0)
const yearAvgPrice = computed(() => totalSealCount.value > 0 ? totalRevenue.value / totalSealCount.value : 0)
const yearDailyCount = computed(() => {
  const list = fullMonths.value.filter((m) => m.dailyCount > 0)
  return list.length ? list.reduce((s, m) => s + m.dailyCount, 0) / list.length : 0
})
const newAmountRate = computed(() => totalRevenue.value > 0 ? totalNewAmount.value / totalRevenue.value : 0)

const maxBy = (getter: (m: MonthMetric) => number, onlyPositive = true) => {
  const list = fullMonths.value.filter((m) => !onlyPositive || getter(m) > 0)
  if (!list.length) return undefined
  return list.reduce((best, item) => getter(item) > getter(best) ? item : best, list[0])
}
const minBy = (getter: (m: MonthMetric) => number, onlyPositive = true) => {
  const list = fullMonths.value.filter((m) => !onlyPositive || getter(m) > 0)
  if (!list.length) return undefined
  return list.reduce((best, item) => getter(item) < getter(best) ? item : best, list[0])
}

const bestRevenueMonth = computed(() => maxBy((m) => m.revenue))
const highestCostMonth = computed(() => maxBy((m) => m.cost))
const worstProfitRateMonth = computed(() => minBy((m) => m.profitRate, true))
const bestRevenueLabel = computed(() => bestRevenueMonth.value ? `${monthLabel(bestRevenueMonth.value.month)}收款最高` : '暂无趋势')

const focusMonth = computed(() => {
  const now = new Date()
  const currentMonth = `${year.value}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const current = fullMonths.value.find((m) => m.month === currentMonth)
  if (current && (current.revenue || current.cost || current.sealCount || current.newCount)) return current
  const list = fullMonths.value.filter((m) => m.revenue || m.cost || m.sealCount || m.newCount || m.newAmount)
  return list.length ? list[list.length - 1] : undefined
})
const previousFocusMonth = computed(() => {
  if (!focusMonth.value) return undefined
  const index = fullMonths.value.findIndex((m) => m.month === focusMonth.value?.month)
  if (index <= 0) return undefined
  return fullMonths.value[index - 1]
})

const monthCards = computed(() => {
  const active = fullMonths.value.filter((m) => m.revenue || m.cost || m.sealCount || m.newCount || m.newAmount)
  if (active.length >= 6) return active.slice(Math.max(active.length - 6, 0))
  return fullMonths.value.slice(0, 6)
})

const mom = (current?: number, previous?: number) => {
  if (!previous) return ''
  const rate = ((current || 0) - previous) / previous
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${(rate * 100).toFixed(1)}%`
}
const momClass = (current?: number, previous?: number) => {
  if (!previous) return ''
  return (current || 0) >= previous ? 'is-up' : 'is-down'
}

const kpis = computed(() => [
  {
    key: 'revenue',
    label: '年度收款',
    value: fmtMoney(totalRevenue.value),
    note: `覆盖 ${activeMonthCount.value} 个月`,
    delta: bestRevenueMonth.value ? `峰值 ${monthLabel(bestRevenueMonth.value.month)}` : '暂无',
    deltaClass: 'is-up',
    tone: 'blue'
  },
  {
    key: 'profit',
    label: '年度利润',
    value: fmtMoney(totalProfit.value),
    note: `平均利润率 ${fmtPct(yearProfitRate.value)}`,
    delta: totalProfit.value >= 0 ? '盈利' : '亏损',
    deltaClass: totalProfit.value >= 0 ? 'is-up' : 'is-down',
    tone: 'green'
  },
  {
    key: 'seal',
    label: '刻章数量',
    value: `${fmtInt(totalSealCount.value)} 枚`,
    note: `日均 ${fmtNum1(yearDailyCount.value)} 枚`,
    delta: maxBy((m) => m.sealCount) ? `${monthLabel(maxBy((m) => m.sealCount)!.month)}峰值` : '暂无',
    deltaClass: 'is-warn',
    tone: 'orange'
  },
  {
    key: 'avg',
    label: '单章均价',
    value: fmtMoney(yearAvgPrice.value),
    note: previousFocusMonth.value ? `较上月 ${mom(focusMonth.value?.avgPrice, previousFocusMonth.value.avgPrice)}` : '等待对比',
    delta: focusMonth.value ? `${monthLabel(focusMonth.value.month)} ${fmtMoney(focusMonth.value.avgPrice)}` : '暂无',
    deltaClass: momClass(focusMonth.value?.avgPrice, previousFocusMonth.value?.avgPrice),
    tone: 'teal'
  },
  {
    key: 'new',
    label: '新签贡献',
    value: fmtMoney(totalNewAmount.value),
    note: `新签 ${fmtInt(totalNewCount.value)} 个`,
    delta: `占收款 ${fmtPct(newAmountRate.value)}`,
    deltaClass: 'is-up',
    tone: 'purple'
  }
])

const focusAction = computed(() => {
  const m = focusMonth.value
  if (!m) return '暂无数据'
  if (m.profitRate > 0 && m.profitRate < 0.25) return '复核成本'
  if (previousFocusMonth.value && m.avgPrice < previousFocusMonth.value.avgPrice) return '关注低价'
  if (m.newCount > 0) return '跟进新签'
  return '稳定复盘'
})

const insights = computed(() => {
  const list: { title: string; desc: string; tag: string; tone: 'green' | 'orange' | 'red' | 'blue' }[] = []
  if (bestRevenueMonth.value) {
    list.push({
      title: '收款峰值已定位',
      desc: `${monthLabel(bestRevenueMonth.value.month)}收款 ${fmtMoney(bestRevenueMonth.value.revenue)}，可复盘当月来源、对接人和业务类型。`,
      tag: '增长',
      tone: 'green'
    })
  }
  if (worstProfitRateMonth.value && worstProfitRateMonth.value.profitRate < 0.3) {
    list.push({
      title: '低利润月份需复核',
      desc: `${monthLabel(worstProfitRateMonth.value.month)}利润率 ${fmtPct(worstProfitRateMonth.value.profitRate)}，建议检查固定成本、外区域登报或返点费用。`,
      tag: '利润',
      tone: 'orange'
    })
  }
  if (highestCostMonth.value && highestCostMonth.value.cost > 0) {
    const costRate = highestCostMonth.value.revenue > 0 ? highestCostMonth.value.cost / highestCostMonth.value.revenue : 0
    list.push({
      title: '成本最高月可单独追踪',
      desc: `${monthLabel(highestCostMonth.value.month)}成本 ${fmtMoney(highestCostMonth.value.cost)}${costRate ? `，占当月收款 ${fmtPct(costRate)}` : ''}，请确认成本附件是否齐全。`,
      tag: '成本',
      tone: costRate > 0.75 ? 'red' : 'blue'
    })
  }
  if (totalNewCount.value > 0) {
    list.push({
      title: '新签客户可以转后续经营',
      desc: `全年新签 ${fmtInt(totalNewCount.value)} 个，贡献 ${fmtMoney(totalNewAmount.value)}，建议把高价值新签同步到长期合作客户或CRM跟进。`,
      tag: '新签',
      tone: 'green'
    })
  }
  if (previousFocusMonth.value && focusMonth.value && focusMonth.value.avgPrice < previousFocusMonth.value.avgPrice) {
    list.push({
      title: '单章均价出现下滑',
      desc: `${monthLabel(focusMonth.value.month)}单章均价 ${fmtMoney(focusMonth.value.avgPrice)}，较上月 ${mom(focusMonth.value.avgPrice, previousFocusMonth.value.avgPrice)}，建议排查低价套章。`,
      tag: '价格',
      tone: 'orange'
    })
  }
  return list.slice(0, 4)
})

const detailRows = computed<DetailRow[]>(() => [
  { key: 'revenue', label: '总收款', fmt: 'money', yearValue: totalRevenue.value, action: bestRevenueMonth.value ? `复盘${monthLabel(bestRevenueMonth.value.month)}` : '等待数据' },
  { key: 'cost', label: '总成本', fmt: 'money', yearValue: totalCost.value, action: highestCostMonth.value ? `核对${monthLabel(highestCostMonth.value.month)}成本` : '补成本' },
  { key: 'profit', label: '月度利润', fmt: 'money', yearValue: totalProfit.value, action: totalProfit.value >= 0 ? '保持利润' : '压降成本' },
  { key: 'profitRate', label: '利润率', fmt: 'pct', yearValue: yearProfitRate.value, action: '守住利润率' },
  { key: 'sealCount', label: '总刻章数量', fmt: 'int', yearValue: totalSealCount.value, action: '按峰值排产' },
  { key: 'avgPrice', label: '单章均价', fmt: 'money', yearValue: yearAvgPrice.value, action: '排查低价单' },
  { key: 'dailyCount', label: '日刻章量', fmt: 'num1', yearValue: yearDailyCount.value, action: '优化排班' },
  { key: 'newCount', label: '新签个数', fmt: 'int', yearValue: totalNewCount.value, action: '转长期跟进' },
  { key: 'newAmount', label: '新签金额', fmt: 'money', yearValue: totalNewAmount.value, action: '复购触达' }
])

const maxRevenue = computed(() => Math.max(...fullMonths.value.map((m) => m.revenue), 0))
const barHeight = (v: number) => {
  if (!maxRevenue.value || !v) return '8px'
  return `${Math.max(12, Math.round((v / maxRevenue.value) * 180))}px`
}

const monthLabel = (m: string) => {
  const mm = Number(m.slice(5, 7))
  return Number.isFinite(mm) && mm > 0 ? `${mm}月` : '—'
}
const fmtMoney = (n?: number) => `¥${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const shortMoney = (n?: number) => {
  const v = Number(n || 0)
  if (!v) return '¥0'
  if (Math.abs(v) >= 10000) return `¥${(v / 10000).toFixed(1)}万`
  return `¥${Math.round(v).toLocaleString()}`
}
const fmtPct = (n?: number) => `${(Number(n || 0) * 100).toFixed(0)}%`
const fmtInt = (n?: number) => Math.round(Number(n || 0)).toLocaleString()
const fmtNum1 = (n?: number) => Number(n || 0).toFixed(1)
const formatByType = (v: number, fmt: DetailRow['fmt']) => {
  if (fmt === 'money') return fmtMoney(v)
  if (fmt === 'pct') return fmtPct(v)
  if (fmt === 'int') return fmtInt(v)
  return fmtNum1(v)
}
const valueOf = (key: DetailRow['key'], m: MonthMetric) => toNum(m[key])
const profitClass = (v: number) => {
  if (v < 0) return 'is-down'
  if (v > 0 && v < 0.3) return 'is-warn'
  return 'is-up'
}
const cellClass = (key: DetailRow['key'], value: number) => {
  if (key === 'profit' || key === 'profitRate') return profitClass(value)
  if ((key === 'revenue' || key === 'sealCount' || key === 'newCount' || key === 'newAmount') && value > 0) return 'is-up-soft'
  return ''
}

onMounted(load)
</script>

<style scoped>
.seal-board {
  min-height: 100%;
  padding: 18px;
  background: #f5f7fb;
}

.sb-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.sb-title {
  margin: 0;
  color: #172033;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 760;
}

.sb-sub {
  margin: 6px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.sb-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.sb-year {
  width: 132px;
}

.sb-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.sb-kpi {
  min-height: 118px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #dce4ef;
  border-top-width: 4px;
  border-radius: 8px;
  background: #fff;
}

.sb-kpi--blue { border-top-color: #2f77d5; }
.sb-kpi--green { border-top-color: #19a66a; }
.sb-kpi--orange { border-top-color: #f08a24; }
.sb-kpi--teal { border-top-color: #0d9488; }
.sb-kpi--purple { border-top-color: #8b5cf6; }

.sb-kpi-label {
  display: block;
  color: #667085;
  font-size: 13px;
  font-weight: 650;
}

.sb-kpi-value {
  display: block;
  margin-top: 10px;
  color: #172033;
  font-size: 26px;
  line-height: 1.1;
  font-weight: 820;
}

.sb-kpi-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  color: #667085;
  font-size: 12px;
  line-height: 1.45;
}

.sb-kpi-foot b {
  white-space: nowrap;
}

.sb-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.52fr) minmax(340px, .9fr);
  gap: 16px;
  margin-bottom: 16px;
}

.sb-panel,
.sb-ledger {
  border: 1px solid #dce4ef;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
}

.sb-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.sb-panel-head h3 {
  margin: 0;
  color: #172033;
  font-size: 16px;
  font-weight: 760;
}

.sb-panel-head p {
  margin: 4px 0 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.5;
}

.sb-bars {
  height: 252px;
  display: grid;
  grid-template-columns: repeat(12, minmax(28px, 1fr));
  align-items: end;
  gap: 10px;
  padding-top: 28px;
  border-bottom: 1px solid #dce4ef;
}

.sb-bar-item {
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.sb-bar-wrap {
  width: 100%;
  min-height: 190px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-direction: column;
  gap: 6px;
}

.sb-bar-value {
  min-height: 16px;
  color: #344054;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.sb-bar {
  width: 100%;
  max-width: 48px;
  min-height: 8px;
  border-radius: 6px 6px 0 0;
  background: #6aa8ed;
  transition: height .2s ease;
}

.sb-bar.is-focus {
  background: #2563eb;
}

.sb-bar-item span {
  color: #667085;
  font-size: 12px;
  font-weight: 650;
}

.sb-summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(130px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.sb-summary-strip div {
  min-height: 70px;
  padding: 12px;
  border: 1px solid #e3eaf3;
  border-radius: 8px;
  background: #f8fafc;
}

.sb-summary-strip span {
  display: block;
  color: #667085;
  font-size: 12px;
}

.sb-summary-strip b {
  display: block;
  margin-top: 6px;
  color: #172033;
  font-size: 15px;
}

.sb-insights {
  display: grid;
  gap: 2px;
}

.sb-insight {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 10px;
  align-items: flex-start;
  padding: 13px 0;
  border-bottom: 1px solid #edf1f6;
}

.sb-insight:last-child {
  border-bottom: 0;
}

.sb-insight i {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #2f77d5;
}

.sb-insight b {
  display: block;
  color: #172033;
  font-size: 14px;
  font-weight: 760;
}

.sb-insight span {
  display: block;
  margin-top: 5px;
  color: #667085;
  font-size: 12px;
  line-height: 1.55;
}

.sb-insight em {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  padding: 0 8px;
  background: #eef6ff;
  color: #2463ad;
  font-size: 12px;
  font-style: normal;
  font-weight: 720;
  white-space: nowrap;
}

.sb-insight .is-green,
.sb-insight em.is-green {
  background: #e8f8f0;
  color: #12815a;
}

.sb-insight i.is-green {
  background: #19a66a;
}

.sb-insight em.is-orange {
  background: #fff4e6;
  color: #b45309;
}

.sb-insight i.is-orange {
  background: #f08a24;
}

.sb-insight em.is-red {
  background: #fff1f1;
  color: #b42318;
}

.sb-insight i.is-red {
  background: #d94b4b;
}

.sb-insight em.is-blue {
  background: #eef6ff;
  color: #2463ad;
}

.sb-insight i.is-blue {
  background: #2f77d5;
}

.sb-month-cards {
  display: grid;
  grid-template-columns: repeat(6, minmax(130px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.sb-month-card {
  min-height: 82px;
  padding: 12px;
  border: 1px solid #dce4ef;
  border-radius: 8px;
  background: #fff;
}

.sb-month-card.is-focus {
  border-color: #2f77d5;
  box-shadow: 0 0 0 2px rgba(47, 119, 213, .08);
}

.sb-month-card strong,
.sb-month-card span {
  display: block;
}

.sb-month-card strong {
  color: #172033;
  font-size: 14px;
  font-weight: 760;
}

.sb-month-card span {
  margin-top: 6px;
  color: #667085;
  font-size: 12px;
}

.sb-ledger {
  padding: 18px 18px 14px;
}

.sb-table-scroll {
  overflow-x: auto;
  border: 1px solid #dce4ef;
  border-radius: 8px;
}

.sb-table {
  width: 100%;
  min-width: 1260px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  color: #172033;
  font-size: 12px;
}

.sb-table th,
.sb-table td {
  height: 36px;
  padding: 8px;
  border-right: 1px solid #e3eaf3;
  border-bottom: 1px solid #e3eaf3;
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.sb-table th {
  background: #f1f5f9;
  color: #475467;
  font-weight: 760;
}

.sb-table th:first-child,
.sb-table td:first-child {
  width: 116px;
  text-align: left;
  color: #172033;
  font-weight: 760;
  background: #f8fafc;
}

.sb-table th:last-child,
.sb-table td:last-child {
  width: 116px;
  border-right: 0;
}

.sb-table tr:last-child td {
  border-bottom: 0;
}

.sb-tip {
  margin: 10px 0 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.6;
}

.is-up {
  color: #14945f !important;
  font-weight: 760;
}

.is-up-soft {
  color: #14945f;
  font-weight: 700;
}

.is-down {
  color: #d94b4b !important;
  font-weight: 760;
}

.is-warn {
  color: #f08a24 !important;
  font-weight: 760;
}

@media (max-width: 1280px) {
  .sb-kpis {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }

  .sb-main-grid {
    grid-template-columns: 1fr;
  }

  .sb-month-cards {
    grid-template-columns: repeat(3, minmax(130px, 1fr));
  }
}

@media (max-width: 760px) {
  .seal-board {
    padding: 12px;
  }

  .sb-actions,
  .sb-year {
    width: 100%;
  }

  .sb-kpis,
  .sb-summary-strip,
  .sb-month-cards {
    grid-template-columns: 1fr;
  }

  .sb-bars {
    gap: 6px;
  }

  .sb-bar-value {
    display: none;
  }
}
</style>
