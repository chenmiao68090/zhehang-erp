<template>
  <div class="lead-dashboard">
    <!-- 顶部装饰条 + 标题区 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-eyebrow">
          <span class="eyebrow-dot"></span>
          <span>CRM · OPERATION CENTER</span>
        </div>
        <h1 class="header-title">
          运营看板
          <span class="title-accent">/ Lead Insights</span>
        </h1>
        <p class="header-sub">实时洞察线索流转、转化与销售跟进效能</p>
      </div>
      <div class="header-right">
        <div class="header-clock">
          <span class="clock-time">{{ nowTime }}</span>
          <span class="clock-date">{{ nowDate }}</span>
        </div>
        <el-button class="refresh-btn" @click="refreshAll" :loading="loading">
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
      </div>
    </div>

    <!-- KPI 卡片 -->
    <div class="kpi-row">
      <div
        v-for="(stat, idx) in statCards"
        :key="idx"
        class="kpi-card"
        :style="{ '--card-accent': stat.bgColor }"
      >
        <div class="kpi-deco"></div>
        <div class="kpi-icon" :style="{ background: stat.bgColor }">
          <el-icon :size="22" color="#fff"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="kpi-info">
          <div class="kpi-label">{{ stat.label }}</div>
          <div class="kpi-value">
            <span class="kpi-num">{{ stat.value }}</span>
            <span class="kpi-suffix" v-if="stat.suffix">{{ stat.suffix }}</span>
          </div>
          <div class="kpi-trend" :class="{ up: stat.trend >= 0 }">
            <el-icon :size="12">
              <component :is="stat.trend >= 0 ? 'CaretTop' : 'CaretBottom'" />
            </el-icon>
            <span>{{ Math.abs(stat.trend) }}% vs 上周</span>
          </div>
        </div>
        <div class="kpi-spark">
          <svg viewBox="0 0 80 28" preserveAspectRatio="none">
            <polyline
              :points="stat.spark"
              fill="none"
              :stroke="stat.bgColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- 中部图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <div class="chart-title">线索来源分布</div>
              <div class="chart-sub">Source Composition · 按来源渠道统计</div>
            </div>
            <div class="chart-tag">{{ totalLeads }} 条</div>
          </div>
          <div ref="sourceChartRef" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <div class="chart-title">跟进状态分布</div>
              <div class="chart-sub">Funnel Stage · 阶段流转漏斗</div>
            </div>
            <div class="chart-tag tag-emerald">{{ conversionRate }}% 转化</div>
          </div>
          <div ref="statusChartRef" class="chart-body"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 底部图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <div class="chart-title">线索新增趋势</div>
              <div class="chart-sub">Daily Inflow · 近 7 天每日新增数量</div>
            </div>
            <div class="chart-tag tag-blue">+{{ weekTotal }}</div>
          </div>
          <div ref="trendChartRef" class="chart-body"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <div class="chart-title">销售跟进排行</div>
              <div class="chart-sub">Sales Leaderboard · 跟进数量排名</div>
            </div>
            <div class="chart-tag">{{ rankList.length }} 人</div>
          </div>
          <div class="rank-body">
            <div
              v-for="(item, idx) in rankList"
              :key="item.name"
              class="rank-item"
              :class="{ 'top-1': idx === 0, 'top-2': idx === 1, 'top-3': idx === 2 }"
            >
              <div class="rank-no">
                <span v-if="idx < 3" class="rank-medal">{{ ['Ⅰ','Ⅱ','Ⅲ'][idx] }}</span>
                <span v-else>{{ String(idx + 1).padStart(2, '0') }}</span>
              </div>
              <div class="rank-avatar">{{ item.name.slice(-1) }}</div>
              <div class="rank-main">
                <div class="rank-line">
                  <span class="rank-name">{{ item.name }}</span>
                  <span class="rank-count">
                    <span class="rank-num">{{ item.count }}</span>
                    <span class="rank-unit">条</span>
                  </span>
                </div>
                <div class="rank-bar-bg">
                  <div
                    class="rank-bar"
                    :style="{
                      width: (item.count / maxCount * 100) + '%',
                      background: idx < 3
                        ? 'linear-gradient(90deg, #D4AF37, #F4D03F)'
                        : 'linear-gradient(90deg, rgba(212,175,55,0.5), rgba(212,175,55,0.25))'
                    }"
                  ></div>
                </div>
              </div>
              <div class="rank-rate">{{ item.rate }}%</div>
            </div>
            <div v-if="!rankList.length" class="rank-empty">暂无数据</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  Notebook, Plus, TrendCharts, Bell, Refresh,
  CaretTop, CaretBottom, DataAnalysis
} from '@element-plus/icons-vue'

// ========== 数据模型 ==========
interface Lead {
  id: number
  name: string
  company: string
  phone: string
  registerDate: string
  email: string
  source: number
  status: number
  pool: number
  ownerId: number | null
  ownerName: string
  lastFollowTime: string
  createTime: string
  remark: string
}

const STORAGE_KEY = 'crm_leads_data'
const SOURCE_MAP = ['', '天眼查', '老客户转介绍', '运营-美团', '运营-抖音', '线下来客']
const STATUS_MAP = ['', '新建', '初步接洽', '需求确认', '方案报价', '谈判审核', '成交']
const PALETTE = ['#D4AF37', '#F26522', '#3B82F6', '#10B981', '#8B5CF6']

// ========== 状态 ==========
const loading = ref(false)
const leads = ref<Lead[]>([])
const nowTime = ref('')
const nowDate = ref('')
let clockTimer: number | null = null

// ========== ECharts 引用 ==========
const sourceChartRef = ref<HTMLDivElement>()
const statusChartRef = ref<HTMLDivElement>()
const trendChartRef = ref<HTMLDivElement>()
let sourceChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null

// ========== Mock 数据生成 ==========
function genMockLeads(): Lead[] {
  const names = ['张磊','李娜','王磊','刘洋','陈静','杨帆','赵雷','黄薇','周倩','吴昊','郑斌','孙琳']
  const companies = ['北方贸易','华东科技','启明星','锐航集团','远见信息','蓝海动力','金石资本','宏图实业','晨光新材','九州物联']
  const list: Lead[] = []
  const today = new Date()
  for (let i = 0; i < 156; i++) {
    const offset = Math.floor(Math.random() * 60)
    const d = new Date(today)
    d.setDate(d.getDate() - offset)
    const dateStr = d.toISOString().slice(0, 10)
    list.push({
      id: i + 1,
      name: companies[i % companies.length] + (i > companies.length ? i : ''),
      company: names[i % names.length],
      phone: '138' + String(10000000 + i),
      registerDate: dateStr,
      email: '上海市浦东新区',
      source: 1 + Math.floor(Math.random() * 5),
      status: 1 + Math.floor(Math.random() * 6),
      pool: Math.random() > 0.6 ? 1 : 0,
      ownerId: 1 + (i % 6),
      ownerName: ['张磊','李娜','王磊','刘洋','陈静','杨帆'][i % 6],
      lastFollowTime: dateStr + ' 09:00',
      createTime: dateStr + ' 09:00',
      remark: ''
    })
  }
  return list
}

function loadLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data) && data.length > 0) {
        leads.value = data
        return
      }
    }
  } catch (e) {
    /* ignore */
  }
  leads.value = genMockLeads()
}

// ========== 统计计算 ==========
const totalLeads = computed(() => leads.value.length)

const monthNew = computed(() => {
  const now = new Date()
  const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  return leads.value.filter(l => (l.createTime || l.registerDate || '').startsWith(ym)).length
})

const dealCount = computed(() => leads.value.filter(l => l.status === 6).length)
const conversionRate = computed(() => {
  if (!totalLeads.value) return 0
  return Math.round((dealCount.value / totalLeads.value) * 1000) / 10
})

const pendingCount = computed(() =>
  leads.value.filter(l => l.status === 1 || l.status === 2).length
)

function genSpark(seed: number): string {
  const points: string[] = []
  let v = 14
  for (let i = 0; i < 10; i++) {
    v += (Math.sin(seed + i) + Math.random() * 0.6 - 0.3) * 4
    v = Math.max(4, Math.min(24, v))
    points.push(`${i * 8.8},${(28 - v).toFixed(1)}`)
  }
  return points.join(' ')
}

const statCards = computed(() => [
  {
    label: '线索总量',
    value: formatNum(totalLeads.value),
    suffix: '',
    icon: Notebook,
    bgColor: '#F26522',
    trend: 12.4,
    spark: genSpark(1)
  },
  {
    label: '本月新增',
    value: formatNum(monthNew.value),
    suffix: '',
    icon: Plus,
    bgColor: '#3B82F6',
    trend: 8.7,
    spark: genSpark(2)
  },
  {
    label: '转化率',
    value: conversionRate.value,
    suffix: '%',
    icon: TrendCharts,
    bgColor: '#10B981',
    trend: 3.2,
    spark: genSpark(3)
  },
  {
    label: '待跟进',
    value: formatNum(pendingCount.value),
    suffix: '',
    icon: Bell,
    bgColor: '#F59E0B',
    trend: -5.1,
    spark: genSpark(4)
  }
])

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  return String(n)
}

// 来源分布
const sourceData = computed(() => {
  const counts = [0, 0, 0, 0, 0]
  leads.value.forEach(l => {
    const idx = (l.source || 1) - 1
    if (idx >= 0 && idx < 5) counts[idx]++
  })
  return SOURCE_MAP.slice(1).map((name, i) => ({ name, value: counts[i] }))
})

// 状态分布
const statusData = computed(() => {
  const counts = [0, 0, 0, 0, 0, 0]
  leads.value.forEach(l => {
    const idx = (l.status || 1) - 1
    if (idx >= 0 && idx < 6) counts[idx]++
  })
  return STATUS_MAP.slice(1).map((name, i) => ({ name, value: counts[i] }))
})

// 近7天趋势
const trendData = computed(() => {
  const days: { date: string; label: string; count: number }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    days.push({
      date,
      label: (d.getMonth() + 1) + '/' + d.getDate(),
      count: 0
    })
  }
  leads.value.forEach(l => {
    const date = (l.createTime || l.registerDate || '').slice(0, 10)
    const day = days.find(x => x.date === date)
    if (day) day.count++
  })
  return days
})
const weekTotal = computed(() => trendData.value.reduce((s, d) => s + d.count, 0))

// 销售排行
const rankList = computed(() => {
  const map = new Map<string, number>()
  leads.value.forEach(l => {
    const name = l.ownerName || '未分配'
    map.set(name, (map.get(name) || 0) + 1)
  })
  const arr = Array.from(map.entries())
    .filter(([n]) => n !== '未分配')
    .map(([name, count]) => ({
      name,
      count,
      rate: totalLeads.value ? Math.round(count / totalLeads.value * 1000) / 10 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  return arr
})
const maxCount = computed(() => rankList.value[0]?.count || 1)

// ========== ECharts 配置 ==========
const AXIS_COLOR = 'rgba(212, 175, 55, 0.18)'
const TEXT_COLOR = '#A8A8B3'
const TEXT_BRIGHT = '#E5E5EC'

function renderSourceChart() {
  if (!sourceChartRef.value) return
  if (!sourceChart) sourceChart = echarts.init(sourceChartRef.value, undefined, { renderer: 'canvas' })
  sourceChart.setOption({
    backgroundColor: 'transparent',
    color: PALETTE,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(18, 18, 26, 0.95)',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      textStyle: { color: TEXT_BRIGHT, fontSize: 12 },
      formatter: '{b}<br/><span style="color:#D4AF37">●</span> {c} 条 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 12,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      formatter: (name: string) => {
        const item = sourceData.value.find(d => d.name === name)
        return `{a|${name}}  {b|${item?.value || 0}}`
      },
      textStyle: {
        color: TEXT_COLOR,
        fontSize: 12,
        rich: {
          a: { color: TEXT_COLOR, fontSize: 12 },
          b: { color: '#D4AF37', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }
        }
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['34%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#0A0A0F',
          borderWidth: 3,
          borderRadius: 4
        },
        label: {
          show: true,
          position: 'center',
          formatter: () => `{val|${totalLeads.value}}\n{lbl|TOTAL LEADS}`,
          rich: {
            val: {
              color: '#D4AF37',
              fontSize: 26,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              lineHeight: 32
            },
            lbl: {
              color: TEXT_COLOR,
              fontSize: 10,
              letterSpacing: 2,
              lineHeight: 18
            }
          }
        },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: {
            shadowBlur: 18,
            shadowColor: 'rgba(212, 175, 55, 0.45)'
          }
        },
        data: sourceData.value
      }
    ]
  })
}

function renderStatusChart() {
  if (!statusChartRef.value) return
  if (!statusChart) statusChart = echarts.init(statusChartRef.value, undefined, { renderer: 'canvas' })
  const sorted = [...statusData.value].sort((a, b) => b.value - a.value)
  const names = sorted.map(d => d.name)
  const values = sorted.map(d => d.value)
  const max = Math.max(...values, 1)
  statusChart.setOption({
    backgroundColor: 'transparent',
    grid: { top: 16, right: 30, bottom: 12, left: 80, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(18, 18, 26, 0.95)',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      textStyle: { color: TEXT_BRIGHT, fontSize: 12 }
    },
    xAxis: {
      type: 'value',
      max,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: names,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: TEXT_BRIGHT, fontSize: 12, fontWeight: 500 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            borderRadius: [0, 7, 7, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(212, 175, 55, ' + (0.85 - i * 0.1) + ')' },
              { offset: 1, color: 'rgba(242, 101, 34, ' + (0.85 - i * 0.1) + ')' }
            ])
          }
        })),
        label: {
          show: true,
          position: 'right',
          color: '#D4AF37',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}'
        },
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(212, 175, 55, 0.06)',
          borderRadius: [0, 7, 7, 0]
        }
      }
    ]
  })
}

function renderTrendChart() {
  if (!trendChartRef.value) return
  if (!trendChart) trendChart = echarts.init(trendChartRef.value, undefined, { renderer: 'canvas' })
  const labels = trendData.value.map(d => d.label)
  const values = trendData.value.map(d => d.count)
  trendChart.setOption({
    backgroundColor: 'transparent',
    grid: { top: 28, right: 24, bottom: 32, left: 36 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(18, 18, 26, 0.95)',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      textStyle: { color: TEXT_BRIGHT, fontSize: 12 },
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/><span style="color:#D4AF37">●</span> 新增 ${p.value} 条`
      }
    },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: AXIS_COLOR } },
      axisTick: { show: false },
      axisLabel: { color: TEXT_COLOR, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: TEXT_COLOR, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
      splitLine: { lineStyle: { color: AXIS_COLOR, type: 'dashed' } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: values,
        lineStyle: {
          width: 2.5,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#F4D03F' },
            { offset: 1, color: '#D4AF37' }
          ])
        },
        itemStyle: {
          color: '#D4AF37',
          borderColor: '#0A0A0F',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(212, 175, 55, 0.35)' },
            { offset: 1, color: 'rgba(212, 175, 55, 0.02)' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: '#F4D03F',
            shadowBlur: 12,
            shadowColor: 'rgba(244, 208, 63, 0.6)'
          }
        }
      }
    ]
  })
}

// ========== 时钟 ==========
function tick() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  nowTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  const week = ['日','一','二','三','四','五','六'][d.getDay()]
  nowDate.value = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} 周${week}`
}

// ========== 生命周期 ==========
function renderAll() {
  nextTick(() => {
    renderSourceChart()
    renderStatusChart()
    renderTrendChart()
  })
}

function refreshAll() {
  loading.value = true
  setTimeout(() => {
    loadLeads()
    renderAll()
    loading.value = false
  }, 400)
}

function handleResize() {
  sourceChart?.resize()
  statusChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  loadLeads()
  tick()
  clockTimer = window.setInterval(tick, 1000)
  renderAll()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener('resize', handleResize)
  sourceChart?.dispose()
  statusChart?.dispose()
  trendChart?.dispose()
})

// 显式引用避免被摇树
void DataAnalysis
</script>

<style lang="scss" scoped>
.lead-dashboard {
  padding: 16px;
  background: #0A0A0F;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========== 顶部标题区 ========== */
.page-header {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 22px 24px;
  background: var(--bg-card, #12121A);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.12), transparent 40%),
      radial-gradient(circle at 100% 100%, rgba(242, 101, 34, 0.08), transparent 40%);
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent);
  }
}
.header-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(212, 175, 55, 0.75);
  margin-bottom: 8px;
}
.eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #D4AF37;
  box-shadow: 0 0 10px #D4AF37;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.header-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #E5E5EC;
  letter-spacing: 0.5px;
  display: flex;
  align-items: baseline;
  gap: 12px;

  .title-accent {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 400;
    color: rgba(212, 175, 55, 0.55);
    letter-spacing: 1px;
  }
}
.header-sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #A8A8B3;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.header-clock {
  text-align: right;
  .clock-time {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    color: #D4AF37;
    line-height: 1.1;
    letter-spacing: 1px;
  }
  .clock-date {
    display: block;
    font-size: 11px;
    color: #A8A8B3;
    margin-top: 2px;
    letter-spacing: 1px;
  }
}
.refresh-btn {
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #D4AF37;
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.18);
    border-color: rgba(212, 175, 55, 0.55);
    color: #F4D03F;
  }
}

/* ========== KPI 卡片 ========== */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  background: var(--bg-card, #12121A);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.5);
    transform: translateY(-3px);
    box-shadow:
      0 8px 28px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(212, 175, 55, 0.1);

    .kpi-deco { opacity: 1; transform: translateX(0); }
    .kpi-spark { opacity: 1; }
  }
}
.kpi-deco {
  position: absolute;
  top: -20px; right: -20px;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: var(--card-accent);
  filter: blur(36px);
  opacity: 0.45;
  transition: all 0.4s ease;
}
.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  box-shadow: 0 6px 18px -4px var(--card-accent);
}
.kpi-info {
  flex: 1;
  position: relative;
  z-index: 1;
  min-width: 0;
}
.kpi-label {
  font-size: 12px;
  color: #A8A8B3;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1.1;

  .kpi-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 30px;
    font-weight: 700;
    color: #D4AF37;
    letter-spacing: -0.5px;
    background: linear-gradient(180deg, #F4D03F 0%, #D4AF37 70%, #B8941F 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .kpi-suffix {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: rgba(212, 175, 55, 0.7);
  }
}
.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 6px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #EF4444;

  &.up { color: #10B981; }
}
.kpi-spark {
  position: absolute;
  right: 14px;
  bottom: 12px;
  width: 80px;
  height: 28px;
  opacity: 0.55;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

/* ========== 图表卡片 ========== */
.chart-row { margin: 0 !important; }
.chart-row + .chart-row { margin-top: 0 !important; }
.chart-card {
  background: var(--bg-card, #12121A);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 18px 20px 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(212, 175, 55, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(212, 175, 55, 0.08);
  }
}
.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}
.chart-title {
  font-weight: 600;
  font-size: 15px;
  color: #E5E5EC;
}
.chart-sub {
  font-size: 11px;
  color: #6A6A75;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
  margin-top: 3px;
}
.chart-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.25);

  &.tag-emerald {
    background: rgba(16, 185, 129, 0.12);
    color: #10B981;
    border-color: rgba(16, 185, 129, 0.3);
  }
  &.tag-blue {
    background: rgba(59, 130, 246, 0.12);
    color: #3B82F6;
    border-color: rgba(59, 130, 246, 0.3);
  }
}
.chart-body {
  width: 100%;
  height: 300px;
}

/* ========== 排行榜 ========== */
.rank-body {
  height: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 2px; }
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(212, 175, 55, 0.08);
  transition: all 0.25s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.05);
    border-color: rgba(212, 175, 55, 0.2);
  }
  &.top-1 {
    background: linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.02));
    border-color: rgba(212, 175, 55, 0.45);
  }
  &.top-2 {
    background: linear-gradient(90deg, rgba(212,175,55,0.12), rgba(212,175,55,0.01));
    border-color: rgba(212, 175, 55, 0.3);
  }
  &.top-3 {
    background: linear-gradient(90deg, rgba(212,175,55,0.08), rgba(212,175,55,0.01));
    border-color: rgba(212, 175, 55, 0.22);
  }
}
.rank-no {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #6A6A75;
  flex-shrink: 0;

  .rank-medal {
    font-size: 14px;
    font-weight: 700;
    color: #D4AF37;
    text-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
  }
}
.rank-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(242, 101, 34, 0.18));
  border: 1px solid rgba(212, 175, 55, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #E5E5EC;
  font-weight: 600;
  flex-shrink: 0;
}
.rank-main {
  flex: 1;
  min-width: 0;
}
.rank-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 5px;
}
.rank-name {
  font-size: 13px;
  color: #E5E5EC;
  font-weight: 500;
}
.rank-count {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  .rank-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: #D4AF37;
  }
  .rank-unit {
    font-size: 10px;
    color: #A8A8B3;
  }
}
.rank-bar-bg {
  height: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px;
  overflow: hidden;
}
.rank-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.rank-rate {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #6A6A75;
  width: 42px;
  text-align: right;
  flex-shrink: 0;
}
.rank-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6A6A75;
  font-size: 13px;
}

@media (max-width: 1280px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
