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
        <span v-if="lastUpdateTime" class="last-update">数据更新于 {{ lastUpdateTime }}</span>
        <el-badge :value="alertTotal" :hidden="alertTotal === 0" type="danger" class="alert-badge">
          <el-icon :size="18" color="#94a3b8"><Bell /></el-icon>
        </el-badge>
        <el-tag size="small" type="warning">管理员</el-tag>
        <el-button type="warning" plain size="small" :icon="RefreshLeft" @click="resetLayout">
          {{ $t('cockpit.resetLayout') }}
        </el-button>
        <el-button type="primary" :icon="Refresh" circle size="small" @click="refreshAll" :loading="loading" />
      </div>
    </header>

    <el-alert
      v-if="dashboardError"
      class="dashboard-error"
      type="error"
      :closable="false"
      show-icon
      :title="dashboardError"
    />

    <!-- Time Range Toolbar -->
    <div class="time-toolbar">
      <div class="mode-switch">
        <el-radio-group v-model="dashboardMode" size="small" @change="onModeChange">
          <el-radio-button value="strategic">
            <el-icon :size="12"><TrendCharts /></el-icon> 战略模式
          </el-radio-button>
          <el-radio-button value="analysis">
            <el-icon :size="12"><DataAnalysis /></el-icon> 分析模式
          </el-radio-button>
          <el-radio-button value="operation">
            <el-icon :size="12"><Monitor /></el-icon> 操作模式
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="time-quick-btns">
        <el-radio-group v-model="timeRange" size="small" @change="onTimeRangeChange">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
          <el-radio-button value="quarter">本季度</el-radio-button>
          <el-radio-button value="year">本年</el-radio-button>
          <el-radio-button value="custom">自定义</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-if="timeRange === 'custom'"
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          @change="onTimeRangeChange"
        />
      </div>
      <div class="time-compare">
        <el-switch v-model="showYoY" size="small" active-text="同比" />
        <el-switch v-model="showMoM" size="small" active-text="环比" />
      </div>
    </div>

    <!-- 战略模式：只展示后端真实 KPI 与基于真实 KPI 生成的摘要。 -->
    <div v-if="dashboardMode === 'strategic'" class="strategic-view">
      <div class="strategic-kpis">
        <div v-for="kpi in strategicKpis" :key="kpi.key" class="strategic-kpi-card">
          <div class="strategic-kpi-header">
            <span class="strategic-kpi-label">{{ kpi.label }}</span>
          </div>
          <div class="strategic-kpi-value">
            <span class="strategic-number">{{ formatNumber(kpi.value) }}</span>
            <span class="strategic-unit">{{ kpi.unit }}</span>
          </div>
          <div class="strategic-kpi-compare">
            <div class="compare-item">
              <span class="compare-label">{{ kpi.rateLabel }}</span>
              <span class="compare-value" :class="kpi.rate >= 0 ? 'up' : 'down'">
                {{ kpi.rate >= 0 ? '+' : '' }}{{ kpi.rate.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="strategic-summary">
        <div class="summary-header">
          <h3>AI 经营摘要</h3>
          <el-button size="small" type="primary" @click="loadAiSummary" :loading="aiLoading">刷新分析</el-button>
        </div>
        <div class="summary-content">
          <div v-if="aiLoading" class="ai-loading">正在分析经营数据...</div>
          <div v-else-if="aiSummaryError" class="ai-empty ai-error">{{ aiSummaryError }}</div>
          <div v-else-if="aiContent" v-html="sanitizeHtml(renderMarkdown(aiContent))"></div>
          <div v-else class="ai-empty">点击刷新获取AI经营分析摘要</div>
        </div>
      </div>
    </div>

    <!-- 操作模式：提醒与事件全部来自后端真实聚合，不展示静态待办。 -->
    <div v-if="dashboardMode === 'operation'" class="operation-view">
      <div class="operation-left">
        <div class="operation-alerts">
          <h3>
            <el-icon><Bell /></el-icon> 经营提醒 <el-badge :value="alertTotal" type="danger" />
          </h3>
          <div class="alert-list-op">
            <div v-for="alert in realAlertItems" :key="alert.key" class="alert-item-op">
              <div class="alert-level-dot"></div>
              <div class="alert-op-content">
                <span class="alert-op-title">{{ alert.title }}</span>
                <span class="alert-op-time">{{ alert.description }}</span>
              </div>
              <strong>{{ alert.value }}{{ alert.unit }}</strong>
            </div>
            <el-empty v-if="alertsLoaded && alertTotal === 0" description="当前没有待处理经营提醒" :image-size="64" />
            <el-empty v-else-if="!alertsLoaded" description="经营提醒加载失败，不能判定为零" :image-size="64" />
          </div>
        </div>
      </div>
      <div class="operation-right">
        <div class="operation-events">
          <h3><el-icon><Clock /></el-icon> 实时事件流 <span class="event-live">● LIVE</span></h3>
          <div class="event-stream">
            <div v-for="(evt, idx) in events.slice(0, 30)" :key="idx" class="event-stream-item">
              <span class="event-stream-time">{{ evt.time }}</span>
              <span class="event-stream-tag" :class="'event-' + evt.type">{{ evt.type === 'sign' ? '签约' : evt.type === 'receipt' ? '回款' : evt.type === 'follow' ? '跟进' : evt.type === 'lead' ? '线索' : '预警' }}</span>
              <span class="event-stream-content">{{ evt.content }}</span>
            </div>
            <el-empty v-if="eventsLoaded && events.length === 0" description="当前筛选区间没有事件" :image-size="64" />
            <el-empty v-else-if="!eventsLoaded" description="事件加载失败，不能判定为空" :image-size="64" />
          </div>
        </div>
      </div>
    </div>

    <!-- Draggable Grid Layout (Analysis Mode) -->
    <GridLayout
      v-show="dashboardMode === 'analysis'"
      v-model:layout="layout"
      :col-num="12"
      :row-height="80"
      :is-draggable="true"
      :is-resizable="true"
      :margin="[16, 16]"
      :use-css-transforms="true"
      @layout-updated="onLayoutUpdated"
    >
      <GridItem
        v-for="item in layout"
        :key="item.i"
        :i="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        drag-allow-from=".drag-handle"
        @resized="onWidgetResized"
      >
        <div class="grid-widget">
          <div class="widget-header">
            <span class="widget-title">{{ widgetTitle(item.i) }}</span>
            <span v-if="item.i === 'revenueTrend' && isDrilledRevenue" class="drill-breadcrumb">
              <el-button text size="small" @click="exitRevenueDrill">
                <el-icon><Back /></el-icon> 返回月度
              </el-button>
              <span class="drill-path">/ {{ revenueDrillPath.join(' / ') }}</span>
            </span>
            <span v-if="item.i === 'regionMap' && isDrilledRegion" class="drill-breadcrumb">
              <el-button text size="small" @click="exitRegionDrill">
                <el-icon><Back /></el-icon> 返回全国
              </el-button>
              <span class="drill-path">/ {{ regionDrillPath.join(' / ') }}</span>
            </span>
            <div class="widget-actions">
              <el-icon
                v-if="['revenueTrend','customerSource','salesRank','regionMap'].includes(item.i)"
                class="fullscreen-btn"
                :size="14"
                @click="openFullscreen(item.i)"
              ><FullScreen /></el-icon>
              <el-icon class="drag-handle" :size="14"><Rank /></el-icon>
            </div>
          </div>
          <div class="widget-body" :class="'widget-body-' + item.i">
            <!-- KPI -->
            <template v-if="item.i === 'kpi'">
              <div v-if="loading && !kpiData" class="skeleton-row">
                <el-skeleton :rows="1" animated />
              </div>
              <div v-else class="kpi-row">
                <div v-for="kpi in kpiCards" :key="kpi.key" class="kpi-card">
                  <div class="kpi-icon" :style="{ background: kpi.color }">
                    <el-icon :size="22" color="#fff"><component :is="kpi.icon" /></el-icon>
                  </div>
                  <div class="kpi-body">
                    <div class="kpi-value">
                      <span class="kpi-number">{{ formatNumber(kpi.value) }}</span>
                      <span v-if="kpi.unit" class="kpi-unit">{{ kpi.unit }}</span>
                    </div>
                    <div class="kpi-label">{{ kpi.label }}</div>
                    <div class="kpi-rate" :class="kpi.rate >= 0 ? 'up' : 'down'">
                      <el-icon :size="12"><CaretTop v-if="kpi.rate >= 0" /><CaretBottom v-else /></el-icon>
                      <span>{{ Math.abs(kpi.rate).toFixed(1) }}%</span>
                      <span class="rate-label">{{ kpi.rateLabel }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Revenue Trend Chart -->
            <div v-else-if="item.i === 'revenueTrend'" ref="revenueTrendRef" class="chart-canvas"></div>

            <!-- Customer Source Pie -->
            <div v-else-if="item.i === 'customerSource'" ref="customerSourceRef" class="chart-canvas"></div>

            <!-- Sales Rank -->
            <div v-else-if="item.i === 'salesRank'" ref="salesRankRef" class="chart-canvas"></div>

            <!-- Recent Events -->
            <div v-else-if="item.i === 'recentEvents'" class="event-list">
              <div v-for="(evt, idx) in events" :key="idx" class="event-item">
                <span class="event-tag" :class="'event-' + evt.type">{{ $t('cockpit.event.' + evt.type) }}</span>
                <span class="event-content">{{ evt.content }}</span>
                <span class="event-time">{{ evt.time }}</span>
              </div>
              <el-empty v-if="eventsLoaded && events.length === 0" description="当前筛选区间没有事件" :image-size="56" />
              <el-empty v-else-if="!eventsLoaded" description="事件加载失败" :image-size="56" />
            </div>

            <!-- Region Map -->
            <div v-else-if="item.i === 'regionMap'" ref="regionMapRef" class="chart-canvas"></div>

            <!-- 经营提醒：仅展示后端已提供的真实聚合。 -->
            <div v-else-if="item.i === 'alerts'" class="alert-panel">
              <div class="alert-summary">
                <span class="alert-count warning">待处理 {{ alertTotal }}</span>
                <span class="alert-count info">按当前筛选区间及实时快照统计</span>
              </div>
              <div class="alert-list">
                <div
                  v-for="alert in realAlertItems"
                  :key="alert.key"
                  class="alert-item alert-warning"
                >
                  <div class="alert-level-bar"></div>
                  <div class="alert-content">
                    <div class="alert-top">
                      <span class="alert-title">{{ alert.title }}</span>
                      <el-tag type="warning" size="small">{{ alert.value }}{{ alert.unit }}</el-tag>
                    </div>
                    <div class="alert-desc">{{ alert.description }}</div>
                  </div>
                </div>
                <el-empty v-if="alertsLoaded && alertTotal === 0" description="当前没有待处理经营提醒" :image-size="64" />
                <el-empty v-else-if="!alertsLoaded" description="经营提醒加载失败，不能判定为零" :image-size="64" />
              </div>
            </div>
          </div>
        </div>
      </GridItem>
    </GridLayout>

    <!-- Fullscreen Chart Dialog -->
    <el-dialog v-model="fullscreenVisible" :title="fullscreenTitle" fullscreen destroy-on-close>
      <div ref="fullscreenChartRef" class="fullscreen-chart"></div>
    </el-dialog>

    <!-- AI Analysis Assistant Panel -->
    <div class="ai-assistant" :class="{ expanded: aiExpanded }">
      <div class="ai-toggle-bar" @click="aiExpanded = !aiExpanded">
        <el-icon :size="18"><DataAnalysis /></el-icon>
        <span>AI 智能分析</span>
        <el-badge :value="aiMessages.length" :hidden="aiMessages.length === 0" :max="99" />
        <el-icon :size="14"><ArrowLeft v-if="aiExpanded" /><ArrowRight v-else /></el-icon>
      </div>

      <div v-show="aiExpanded" class="ai-panel-body">
        <!-- Quick Actions -->
        <div class="ai-quick-actions">
          <el-button size="small" type="primary" plain @click="aiQuickAction('diagnose')">
            <el-icon><Warning /></el-icon> 智能诊断
          </el-button>
          <el-button size="small" type="success" plain @click="aiQuickAction('report')">
            <el-icon><Document /></el-icon> 生成报告
          </el-button>
          <el-button size="small" type="warning" plain @click="aiQuickAction('predict')">
            <el-icon><TrendCharts /></el-icon> 趋势预测
          </el-button>
        </div>

        <!-- Chat Messages -->
        <div class="ai-messages" ref="aiMessagesRef">
          <div v-if="aiMessages.length === 0" class="ai-welcome">
            <div class="welcome-icon"><el-icon :size="32"><DataAnalysis /></el-icon></div>
            <h4>AI 分析助手</h4>
            <p>您可以用自然语言提问，例如：</p>
            <p class="ai-welcome-note">仅在已配置真实模型且服务可用时返回分析；失败会明确提示。</p>
            <div class="welcome-suggestions">
              <span class="suggestion-chip" @click="askAi('本月哪个获客渠道ROI最低？')">本月哪个获客渠道ROI最低？</span>
              <span class="suggestion-chip" @click="askAi('分析同行渠道应收风险')">分析同行渠道应收风险</span>
              <span class="suggestion-chip" @click="askAi('预测下月签约和回款趋势')">预测下月签约和回款趋势</span>
            </div>
          </div>
          <div v-for="(msg, idx) in aiMessages" :key="idx" class="ai-message" :class="msg.role">
            <div class="msg-avatar">
              <el-icon v-if="msg.role === 'assistant'" :size="16"><DataAnalysis /></el-icon>
              <el-icon v-else :size="16"><UserIcon /></el-icon>
            </div>
            <div class="msg-bubble">
              <div v-if="msg.role === 'assistant'" class="msg-content" v-html="sanitizeHtml(renderMarkdown(msg.content))"></div>
              <div v-else class="msg-content">{{ msg.content }}</div>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>
          <div v-if="aiLoading" class="ai-typing">
            <div class="typing-dots"><span></span><span></span><span></span></div>
            <span>正在分析中...</span>
          </div>
        </div>

        <!-- Input Area -->
        <div class="ai-input-area">
          <el-input
            v-model="aiInput"
            placeholder="输入您的数据分析问题..."
            size="default"
            @keyup.enter="sendAiMessage"
            :disabled="aiLoading"
          >
            <template #append>
              <el-button :icon="Promotion" @click="sendAiMessage" :loading="aiLoading" />
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { GridLayout, GridItem } from 'grid-layout-plus'
// Note: grid-layout-plus v1.x auto-injects its CSS via vite-plugin-css-injected-by-js, no manual import needed
import {
  Refresh, RefreshLeft, CaretTop, CaretBottom, DataAnalysis, Rank, FullScreen,
  User as UserIcon, Money, TrendCharts, Briefcase, List as ListIcon, Connection,
  Bell, Monitor, Clock, Back,
  ArrowLeft, ArrowRight, Warning, Promotion, Document
} from '@element-plus/icons-vue'
import {
  getCockpitKpi, getRevenueTrend, getCustomerSource,
  getSalesRank, getRecentEvents, getRegionDistribution,
  getAlerts, getAiSummary, getRevenueDrillDown, getRegionDrillDown
} from '@/api/cockpit'
import type { CockpitKpi, RecentEvent, AlertData, CustomerSource, SalesRank, RegionDistribution, CockpitParams } from '@/api/cockpit'
import { sendChat } from '@/api/ai'
import { sanitizeHtml } from '@/utils/sanitize-html'

const { t } = useI18n()

// Layout
interface LayoutItem { i: string; x: number; y: number; w: number; h: number }
const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'kpi', x: 0, y: 0, w: 12, h: 2 },
  { i: 'revenueTrend', x: 0, y: 2, w: 8, h: 4 },
  { i: 'customerSource', x: 8, y: 2, w: 4, h: 4 },
  { i: 'salesRank', x: 0, y: 6, w: 8, h: 4 },
  { i: 'recentEvents', x: 8, y: 6, w: 4, h: 4 },
  { i: 'regionMap', x: 0, y: 10, w: 8, h: 5 },
  { i: 'alerts', x: 8, y: 10, w: 4, h: 5 }
]
const LAYOUT_STORAGE_KEY = 'cockpit_layout'

function loadLayout(): LayoutItem[] {
  const saved = localStorage.getItem(LAYOUT_STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length === DEFAULT_LAYOUT.length) {
        return parsed
      }
    } catch { /* ignore */ }
  }
  return DEFAULT_LAYOUT.map(item => ({ ...item }))
}
const layout = ref<LayoutItem[]>(loadLayout())

function onLayoutUpdated(newLayout: LayoutItem[]) {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayout))
}

function resetLayout() {
  layout.value = DEFAULT_LAYOUT.map(item => ({ ...item }))
  localStorage.removeItem(LAYOUT_STORAGE_KEY)
  nextTick(() => handleResize())
}

// State
const loading = ref(false)
const currentTime = ref('')
const lastUpdateTime = ref('')
const dashboardError = ref('')
const events = ref<RecentEvent[]>([])
const eventsLoaded = ref(false)
const alertsLoaded = ref(false)
const alerts = reactive<AlertData>({
  overdueReceiptCount: 0, overdueReceiptAmount: 0,
  riskCustomerCount: 0, expiringContractCount: 0,
  stockWarningCount: 0, abnormalApprovalCount: 0
})

interface RealAlertItem {
  key: string
  title: string
  description: string
  value: number
  unit: string
}

// 接口暂时只提供聚合计数，没有明细、阈值、严重级别与触发时间。
// 因此页面只展示可由后端数据直接证明的四项事实，不再补造预警明细。
const realAlertItems = computed<RealAlertItem[]>(() => [
  {
    key: 'pending-receipt',
    title: '待确认收款',
    description: `当前区间待确认金额 ${formatCurrency(alerts.overdueReceiptAmount)}`,
    value: Number(alerts.overdueReceiptCount || 0),
    unit: '笔'
  },
  {
    key: 'disabled-customer',
    title: '已停用客户',
    description: '当前客户状态快照，不等同于流失或风险分级',
    value: Number(alerts.riskCustomerCount || 0),
    unit: '家'
  },
  {
    key: 'expiring-contract',
    title: '30 天内到期合同',
    description: '合同结束日在今天至未来 30 天内，且尚未终止',
    value: Number(alerts.expiringContractCount || 0),
    unit: '份'
  },
  {
    key: 'rejected-order',
    title: '区间内驳回订单',
    description: '按订单创建时间和驳回状态统计',
    value: Number(alerts.abnormalApprovalCount || 0),
    unit: '单'
  }
])
const alertTotal = computed(() => realAlertItems.value.reduce((sum, item) => sum + item.value, 0))
const aiExpanded = ref(false)
const aiLoading = ref(false)
const aiContent = ref('')
const aiProvider = ref('')
const aiSummaryError = ref('')

// AI Assistant state
interface AiMessage {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const aiMessages = ref<AiMessage[]>([])
const aiInput = ref('')
const aiMessagesRef = ref<HTMLDivElement>()
const aiConversationId = ref('')

function sendAiMessage() {
  const text = aiInput.value.trim()
  if (!text || aiLoading.value) return
  askAi(text)
}

function scrollAiToBottom() {
  nextTick(() => {
    if (aiMessagesRef.value) {
      aiMessagesRef.value.scrollTop = aiMessagesRef.value.scrollHeight
    }
  })
}

async function askAi(question: string) {
  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  aiMessages.value.push({ role: 'user', content: question, time: now })
  aiInput.value = ''
  aiLoading.value = true
  scrollAiToBottom()

  // 调用真实 AI 接口 /ai/chat；后端不可用或未配置模型时明确显示失败。
  let reply = ''
  try {
    const res: any = await sendChat({ message: question, conversationId: aiConversationId.value || undefined })
    reply = res.data?.reply || ''
    if (res.data?.conversationId) aiConversationId.value = res.data.conversationId
  } catch {
    reply = 'AI 分析服务暂时不可用，请稍后再试。'
  }

  aiMessages.value.push({
    role: 'assistant',
    content: reply || '（未返回内容）',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  })

  aiLoading.value = false
  scrollAiToBottom()
}

function aiQuickAction(action: string) {
  const questions: Record<string, string> = {
    diagnose: '请对当前数字总部数据进行智能诊断，识别所有异常指标并分析根本原因',
    report: '请基于当前数据生成一份完整的经营分析报告，包含关键发现和改进建议',
    predict: '请分析当前业务趋势，预测下个季度的关键指标走向'
  }
  askAi(questions[action] || '请分析当前数据')
}

// Dashboard mode switch
type DashboardMode = 'strategic' | 'analysis' | 'operation'
const dashboardMode = ref<DashboardMode>('analysis')
let operationTimer: ReturnType<typeof setInterval> | null = null

function onModeChange(mode: DashboardMode) {
  if (operationTimer) {
    clearInterval(operationTimer)
    operationTimer = null
  }
  if (mode === 'operation') {
    operationTimer = setInterval(refreshAll, 5000)
  }
  nextTick(() => handleResize())
}

// 战略 KPI 仅使用接口直接返回的值和增长率，不推算环比、不虚构目标达成率。
const strategicKpis = computed(() => {
  const d = kpiData.value
  if (!d) return []
  return [
    { key: 'revenue', label: '本月签约额', value: (d.totalRevenue / 10000).toFixed(0), unit: '万元', rate: d.revenueGrowthRate, rateLabel: '同比' },
    { key: 'customers', label: '服务客户数', value: d.totalCustomers, unit: '家', rate: d.customerGrowthRate, rateLabel: '同比' },
    { key: 'receipt', label: '本月回款', value: (d.monthReceipt / 10000).toFixed(0), unit: '万元', rate: d.receiptGrowthRate, rateLabel: '环比' },
    { key: 'contracts', label: '待签订单', value: d.pendingContracts, unit: '份', rate: d.pendingContractsRate, rateLabel: '环比' }
  ]
})

// Time range filter
const timeRange = ref('month')
const customDateRange = ref<[Date, Date] | null>(null)
const showYoY = ref(false)
const showMoM = ref(false)

function onTimeRangeChange() {
  refreshAll()
}

/** 把日期格式化为后端期望的 yyyy-MM-dd */
function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 根据当前时间筛选构造请求参数。
 * - 自定义且选了起止日期：传 startDate/endDate（后端优先用区间）
 * - 其它：传 period（today/week/month/quarter/year）
 */
function buildPeriodParams(): CockpitParams {
  if (timeRange.value === 'custom' && customDateRange.value && customDateRange.value.length === 2) {
    return {
      startDate: fmtDate(customDateRange.value[0]),
      endDate: fmtDate(customDateRange.value[1])
    }
  }
  return { period: timeRange.value }
}

// Fullscreen chart dialog
const fullscreenVisible = ref(false)
const fullscreenTitle = ref('')
const fullscreenChartRef = ref<HTMLDivElement>()
let fullscreenChartInstance: echarts.ECharts | null = null

function getChartInstance(id: string): echarts.ECharts | null {
  switch (id) {
    case 'revenueTrend': return revenueTrendChart
    case 'customerSource': return customerSourceChart
    case 'salesRank': return salesRankChart
    case 'regionMap': return regionMapChart
    default: return null
  }
}

function openFullscreen(widgetId: string) {
  fullscreenTitle.value = widgetTitle(widgetId)
  fullscreenVisible.value = true
  nextTick(() => {
    if (fullscreenChartRef.value) {
      if (fullscreenChartInstance) {
        fullscreenChartInstance.dispose()
        fullscreenChartInstance = null
      }
      fullscreenChartInstance = echarts.init(fullscreenChartRef.value)
      const sourceChart = getChartInstance(widgetId)
      if (sourceChart) {
        fullscreenChartInstance.setOption(sourceChart.getOption())
      }
    }
  })
}

watch(fullscreenVisible, (val) => {
  if (!val && fullscreenChartInstance) {
    fullscreenChartInstance.dispose()
    fullscreenChartInstance = null
  }
})

// KPI
const kpiData = ref<CockpitKpi | null>(null)
const kpiCards = computed(() => {
  const d = kpiData.value
  if (!d) return []
  return [
    { key: 'customers', label: t('cockpit.kpi.totalCustomers'), value: d.totalCustomers, rate: d.customerGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'UserIcon', color: '#3370ff', unit: '' },
    { key: 'newCustomers', label: t('cockpit.kpi.newCustomers'), value: d.newCustomersMonth, rate: d.newCustomerGrowthRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Connection', color: '#10B981', unit: '' },
    { key: 'revenue', label: t('cockpit.kpi.totalRevenue'), value: (d.totalRevenue / 10000).toFixed(0), rate: d.revenueGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'TrendCharts', color: '#3B82F6', unit: t('cockpit.unit.tenThousand') },
    { key: 'receipt', label: t('cockpit.kpi.monthReceipt'), value: (d.monthReceipt / 10000).toFixed(0), rate: d.receiptGrowthRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Money', color: '#8B5CF6', unit: t('cockpit.unit.tenThousand') },
    { key: 'contracts', label: t('cockpit.kpi.pendingContracts'), value: d.pendingContracts, rate: d.pendingContractsRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Briefcase', color: '#F59E0B', unit: '' },
    { key: 'employees', label: t('cockpit.kpi.totalEmployees'), value: d.totalEmployees, rate: d.employeeGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'ListIcon', color: '#06B6D4', unit: '' }
  ]
})

// Widget title map
function widgetTitle(i: string): string {
  const map: Record<string, string> = {
    kpi: t('cockpit.kpi.coreMetrics'),
    revenueTrend: t('cockpit.chart.revenueTrend'),
    customerSource: t('cockpit.chart.customerSource'),
    salesRank: t('cockpit.chart.salesRank'),
    recentEvents: t('cockpit.chart.recentEvents'),
    regionMap: t('cockpit.chart.regionMap'),
    alerts: t('cockpit.chart.alerts')
  }
  return map[i] || i
}

// 下钻状态
const revenueDrillPath = ref<string[]>([]) // 面包屑路径: ['2024年', '3月']
const regionDrillPath = ref<string[]>([])
const isDrilledRevenue = computed(() => revenueDrillPath.value.length > 0)
const isDrilledRegion = computed(() => regionDrillPath.value.length > 0)
type RevenueDrillPoint = { date: string; revenue: number; receipt: number }
type RegionDrillPoint = { city: string; count: number }

// Chart refs - use array refs because GridItem can be re-rendered
const revenueTrendRef = ref<HTMLDivElement[] | HTMLDivElement>()
const customerSourceRef = ref<HTMLDivElement[] | HTMLDivElement>()
const salesRankRef = ref<HTMLDivElement[] | HTMLDivElement>()
const regionMapRef = ref<HTMLDivElement[] | HTMLDivElement>()
let revenueTrendChart: echarts.ECharts | null = null
let customerSourceChart: echarts.ECharts | null = null
let salesRankChart: echarts.ECharts | null = null
let regionMapChart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function getEl(ref: any): HTMLDivElement | undefined {
  if (!ref) return undefined
  return Array.isArray(ref) ? ref[0] : ref
}

// Timer
let refreshTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

// Theme colors
const COLORS = ['#3370ff', '#5a8bff', '#FFB347', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4']

function updateClock() {
  const d = new Date()
  currentTime.value = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatNumber(val: any): string {
  const n = Number(val)
  if (isNaN(n)) return String(val)
  return n.toLocaleString()
}

function formatCurrency(val: any): string {
  const n = Number(val || 0)
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function renderMarkdown(md: string): string {
  return sanitizeHtml(md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>'))
}

// Data loaders
async function loadKpi(): Promise<boolean> {
  try {
    const res: any = await getCockpitKpi(buildPeriodParams())
    if (!res?.data) throw new Error('核心指标为空')
    kpiData.value = res.data
    return true
  } catch {
    kpiData.value = null
    return false
  }
}

async function loadRevenueTrend(): Promise<boolean> {
  try {
    const res: any = await getRevenueTrend(buildPeriodParams())
    const data = res.data || []
    const el = getEl(revenueTrendRef.value)
    if (!revenueTrendChart && el) {
      revenueTrendChart = echarts.init(el)
      observeChart(el)
    }
    const months = data.map((d: any) => d.month)
    revenueTrendChart?.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: [t('cockpit.chart.revenue'), t('cockpit.chart.receipt')], textStyle: { color: '#64748b' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: months, axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#dcdfe6' } } },
      yAxis: [
        { type: 'value', axisLabel: { color: '#64748b', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { lineStyle: { color: '#eef1f6' } } },
        { type: 'value', axisLabel: { color: '#64748b', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { show: false } }
      ],
      series: [
        { name: t('cockpit.chart.revenue'), type: 'bar', data: data.map((d: any) => d.revenue), itemStyle: { color: '#3370ff', borderRadius: [4, 4, 0, 0] }, barWidth: '35%' },
        { name: t('cockpit.chart.receipt'), type: 'line', yAxisIndex: 1, data: data.map((d: any) => d.receipt), smooth: true, lineStyle: { color: '#3B82F6', width: 3 }, itemStyle: { color: '#3B82F6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) } }
      ]
    })
    revenueTrendChart?.off('click')
    revenueTrendChart?.on('click', (params: any) => {
      if (params.componentType === 'series' && !isDrilledRevenue.value) {
        drillRevenue(params.name)
      }
    })
    return true
  } catch {
    revenueTrendChart?.setOption(renderEmptyChartOption('营收趋势加载失败', '未使用历史或随机数据兜底'), true)
    return false
  }
}

function renderEmptyChartOption(text: string, subtext = '请返回上一级或稍后重试') {
  return {
    tooltip: { show: false },
    title: {
      text,
      subtext,
      left: 'center',
      top: 'middle',
      textStyle: { color: '#cbd5e1', fontSize: 14, fontWeight: 600 },
      subtextStyle: { color: '#64748b', fontSize: 12, lineHeight: 20 }
    },
    xAxis: { show: false, type: 'category', data: [] },
    yAxis: { show: false, type: 'value' },
    series: []
  }
}

function renderRevenueDrillOption(data: RevenueDrillPoint[]) {
  return {
    tooltip: { trigger: 'axis' },
    title: { show: false },
    legend: { data: ['日营收', '日回款'], textStyle: { color: '#64748b' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#dcdfe6' } } },
    yAxis: [
      { type: 'value', axisLabel: { color: '#64748b', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { lineStyle: { color: '#eef1f6' } } },
      { type: 'value', axisLabel: { color: '#64748b', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { show: false } }
    ],
    series: [
      { name: '日营收', type: 'bar', data: data.map(d => d.revenue), itemStyle: { color: '#3370ff', borderRadius: [4, 4, 0, 0] }, barWidth: '35%' },
      { name: '日回款', type: 'line', yAxisIndex: 1, data: data.map(d => d.receipt), smooth: true, lineStyle: { color: '#3B82F6', width: 3 }, itemStyle: { color: '#3B82F6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) } }
    ]
  }
}

async function drillRevenue(month: string) {
  revenueDrillPath.value = [month]
  try {
    const res: any = await getRevenueDrillDown({ month })
    const data: RevenueDrillPoint[] = res.data || []
    revenueTrendChart?.setOption(
      data.length
        ? renderRevenueDrillOption(data)
        : renderEmptyChartOption(`${month} 暂无日明细`, '该月份没有可下钻的营收或回款记录'),
      true
    )
  } catch {
    revenueTrendChart?.setOption(renderEmptyChartOption('营收下钻数据加载失败', '接口异常，未使用随机数据兜底'), true)
  }
}

function exitRevenueDrill() {
  revenueDrillPath.value = []
  loadRevenueTrend()
}

async function loadCustomerSource(): Promise<boolean> {
  try {
    const res: any = await getCustomerSource(buildPeriodParams())
    // 真实后端数据，随时间筛选变化；区间内无新增客户则为空数组，按真实情况展示空图
    const data: CustomerSource[] = res.data || []
    const el = getEl(customerSourceRef.value)
    if (!customerSourceChart && el) {
      customerSourceChart = echarts.init(el)
      observeChart(el)
    }
    customerSourceChart?.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#64748b' } },
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
        label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: data.map((d: any, i: number) => ({ name: d.source, value: d.count, itemStyle: { color: COLORS[i % COLORS.length] } }))
      }]
    })
    return true
  } catch {
    customerSourceChart?.setOption(renderEmptyChartOption('客户来源加载失败', '未使用历史或随机数据兜底'), true)
    return false
  }
}

async function loadSalesRank(): Promise<boolean> {
  try {
    const res: any = await getSalesRank(buildPeriodParams())
    // 真实后端数据(按签约人聚合实付额)，随时间筛选变化；横向柱图需倒序使第一名在顶部
    const source: SalesRank[] = res.data || []
    const data = [...source].reverse()
    const el = getEl(salesRankRef.value)
    if (!salesRankChart && el) {
      salesRankChart = echarts.init(el)
      observeChart(el)
    }
    salesRankChart?.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '10%', top: '3%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: '#64748b', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { lineStyle: { color: '#eef1f6' } } },
      yAxis: { type: 'category', data: data.map((d: any) => d.employeeName), axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: '#dcdfe6' } } },
      series: [{
        type: 'bar', data: data.map((d: any) => ({
          value: d.amount,
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#3370ff' }, { offset: 1, color: '#5a8bff' }]), borderRadius: [0, 4, 4, 0] }
        })),
        barWidth: '60%',
        label: { show: true, position: 'right', color: '#64748b', formatter: (p: any) => (p.value / 10000).toFixed(0) + 'w' }
      }]
    })
    return true
  } catch {
    salesRankChart?.setOption(renderEmptyChartOption('销售排行加载失败', '未使用历史或随机数据兜底'), true)
    return false
  }
}

async function loadEvents(): Promise<boolean> {
  try {
    const res: any = await getRecentEvents(buildPeriodParams())
    // 真实后端数据(区间内最近任务/事件)，随时间筛选变化
    events.value = res.data || []
    eventsLoaded.value = true
    return true
  } catch {
    events.value = []
    eventsLoaded.value = false
    return false
  }
}

async function loadRegionMap(): Promise<boolean> {
  try {
    const res: any = await getRegionDistribution(buildPeriodParams())
    // 真实后端数据(按线索注册区域分组)，随时间筛选变化
    const data: RegionDistribution[] = res.data || []
    const el = getEl(regionMapRef.value)
    if (!regionMapChart && el) {
      regionMapChart = echarts.init(el)
      observeChart(el)
    }
    const provinces = data.map((d: any) => d.province)
    const counts = data.map((d: any) => d.count)
    regionMapChart?.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '6%', top: '3%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: provinces, axisLabel: { color: '#64748b', rotate: 30 }, axisLine: { lineStyle: { color: '#dcdfe6' } } },
      yAxis: { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#eef1f6' } } },
      series: [{
        type: 'bar', data: counts.map((v: number) => ({
          value: v,
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3370ff' }, { offset: 1, color: 'rgba(51, 112, 255,0.3)' }]), borderRadius: [4, 4, 0, 0] }
        })),
        barWidth: '60%'
      }]
    })
    regionMapChart?.off('click')
    regionMapChart?.on('click', (params: any) => {
      if (params.componentType === 'series' && !isDrilledRegion.value) {
        drillRegion(params.name)
      }
    })
    return true
  } catch {
    regionMapChart?.setOption(renderEmptyChartOption('区域分布加载失败', '未使用历史或随机数据兜底'), true)
    return false
  }
}

function renderRegionDrillOption(data: RegionDrillPoint[]) {
  const cities = data.map(d => d.city)
  const counts = data.map(d => d.count)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    title: { show: false },
    grid: { left: '3%', right: '6%', top: '3%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: cities, axisLabel: { color: '#64748b', rotate: 30 }, axisLine: { lineStyle: { color: '#dcdfe6' } } },
    yAxis: { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#eef1f6' } } },
    series: [{
      type: 'bar', data: counts.map((v: number) => ({
        value: v,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: 'rgba(59,130,246,0.3)' }]), borderRadius: [4, 4, 0, 0] }
      })),
      barWidth: '60%'
    }]
  }
}

async function drillRegion(province: string) {
  regionDrillPath.value = [province]
  try {
    const res: any = await getRegionDrillDown({ province })
    const data: RegionDrillPoint[] = res.data || []
    regionMapChart?.setOption(
      data.length
        ? renderRegionDrillOption(data)
        : renderEmptyChartOption(`${province} 暂无城市明细`, '当前只有区域汇总数据，未返回城市维度'),
      true
    )
  } catch {
    regionMapChart?.setOption(renderEmptyChartOption('区域下钻暂不可用', '后端尚未返回城市维度，未使用随机数据兜底'), true)
  }
}

function exitRegionDrill() {
  regionDrillPath.value = []
  loadRegionMap()
}

async function loadAlerts(): Promise<boolean> {
  try {
    const res: any = await getAlerts(buildPeriodParams())
    Object.assign(alerts, res.data || {})
    alertsLoaded.value = true
    return true
  } catch {
    Object.assign(alerts, {
      overdueReceiptCount: 0, overdueReceiptAmount: 0,
      riskCustomerCount: 0, expiringContractCount: 0,
      stockWarningCount: 0, abnormalApprovalCount: 0
    })
    alertsLoaded.value = false
    return false
  }
}

async function loadAiSummary() {
  aiLoading.value = true
  aiContent.value = ''
  aiSummaryError.value = ''
  try {
    const res: any = await getAiSummary()
    aiContent.value = res.data?.content || ''
    aiProvider.value = res.data?.provider || ''
    if (!aiContent.value) aiSummaryError.value = 'AI 服务未返回可用内容。'
  } catch (error: any) {
    aiSummaryError.value = error?.message || 'AI 经营摘要暂时不可用，请稍后重试。'
  } finally {
    aiLoading.value = false
  }
}

async function refreshAll() {
  if (loading.value) return
  loading.value = true
  try {
    const results = await Promise.all([
      loadKpi(), loadRevenueTrend(), loadCustomerSource(),
      loadSalesRank(), loadEvents(), loadRegionMap(), loadAlerts()
    ])
    const failed = results.filter(result => !result).length
    if (failed === 0) {
      dashboardError.value = ''
      lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
    } else {
      dashboardError.value = `${failed} 项经营数据加载失败；页面已清空对应旧数据，请刷新重试。`
      lastUpdateTime.value = ''
    }
  } finally {
    loading.value = false
  }
}

function handleResize() {
  revenueTrendChart?.resize()
  customerSourceChart?.resize()
  salesRankChart?.resize()
  regionMapChart?.resize()
}

function onWidgetResized(i: string) {
  nextTick(() => {
    if (i === 'revenueTrend') revenueTrendChart?.resize()
    if (i === 'customerSource') customerSourceChart?.resize()
    if (i === 'salesRank') salesRankChart?.resize()
    if (i === 'regionMap') regionMapChart?.resize()
  })
}

function observeChart(el: HTMLElement) {
  if (resizeObserver) resizeObserver.observe(el)
}

// Persist layout changes (defensive — onLayoutUpdated covers it but watch handles edge cases)
watch(layout, (val) => {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)

  // Setup ResizeObserver for chart containers
  resizeObserver = new ResizeObserver(() => {
    handleResize()
  })

  refreshAll()
  refreshTimer = setInterval(refreshAll, 30000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (refreshTimer) clearInterval(refreshTimer)
  if (operationTimer) clearInterval(operationTimer)
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  revenueTrendChart?.dispose()
  customerSourceChart?.dispose()
  salesRankChart?.dispose()
  regionMapChart?.dispose()
  fullscreenChartInstance?.dispose()
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
  margin-bottom: 16px; padding: 16px 24px;
  background: rgba(30, 41, 59, 0.8); border-radius: 12px;
  border: 1px solid rgba(51, 112, 255, 0.2);
}
.header-left {
  .header-title { font-size: 24px; font-weight: 700; color: #3370ff; margin: 0; }
  .header-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; display: block; }
}
.header-right {
  display: flex; align-items: center; gap: 12px;
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; animation: pulse 2s infinite; }
  .realtime-text { font-size: 12px; color: #10B981; white-space: nowrap; }
  .current-time { font-size: 14px; color: #94a3b8; font-family: 'Courier New', monospace; white-space: nowrap; }
  .last-update { font-size: 11px; color: #64748b; white-space: nowrap; }
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

// Time Range Toolbar
.time-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 20px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  border: 1px solid #334155;
}
.time-quick-btns {
  display: flex;
  align-items: center;
  gap: 12px;
}
.time-compare {
  display: flex;
  align-items: center;
  gap: 16px;
}
.fullscreen-chart {
  width: 100%;
  height: 70vh;
}

// Grid Widget Wrapper
.grid-widget {
  width: 100%;
  height: 100%;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: border-color 0.25s, box-shadow 0.25s;
  overflow: hidden;
  &:hover {
    border-color: rgba(51, 112, 255, 0.35);
    box-shadow: 0 6px 22px rgba(51, 112, 255, 0.1);
  }
}
.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.6);
  .widget-title {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
    letter-spacing: 0.3px;
  }
  .widget-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .fullscreen-btn {
    cursor: pointer;
    color: rgba(148, 163, 184, 0.5);
    transition: color 0.2s, transform 0.2s;
    &:hover { color: #3370ff; transform: scale(1.15); }
  }
  .drag-handle {
    cursor: move;
    color: rgba(148, 163, 184, 0.4);
    transition: color 0.2s, transform 0.2s;
    &:hover { color: #3370ff; transform: scale(1.15); }
  }
}
.widget-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.drill-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  font-size: 12px;
  color: #94a3b8;
}
.drill-path {
  color: #3370ff;
  font-weight: 500;
}

// KPI Row (inside widget)
.kpi-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  height: 100%;
}
.kpi-card {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); border-color: rgba(51, 112, 255, 0.4); }
}
.kpi-icon {
  width: 40px; height: 40px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.kpi-body { flex: 1; min-width: 0; }
.kpi-value { display: flex; align-items: baseline; gap: 4px; }
.kpi-number { font-size: 19px; font-weight: 700; color: #f8fafc; }
.kpi-unit { font-size: 11px; color: #64748b; }
.kpi-label { font-size: 11px; color: #64748b; margin-top: 2px; }
.kpi-rate {
  display: flex; align-items: center; gap: 3px; font-size: 10px; margin-top: 2px;
  &.up { color: #10B981; }
  &.down { color: #EF4444; }
  .rate-label { color: #475569; margin-left: 2px; }
}
.kpi-sparkline {
  margin-top: 4px;
  .sparkline-svg {
    width: 60px;
    height: 20px;
    display: block;
  }
}
.skeleton-row {
  width: 100%;
  padding: 8px 4px;
  :deep(.el-skeleton__item) {
    background: linear-gradient(90deg, rgba(51, 65, 85, 0.4) 25%, rgba(71, 85, 105, 0.6) 37%, rgba(51, 65, 85, 0.4) 63%);
    background-size: 400% 100%;
  }
}

// Charts
.chart-canvas { flex: 1; width: 100%; min-height: 0; }

// Events
.event-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; }
.event-item {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  background: rgba(15, 23, 42, 0.6); border-radius: 8px;
  transition: background 0.2s;
  &:hover { background: rgba(51, 112, 255, 0.08); }
}
.event-tag {
  font-size: 11px; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; font-weight: 500;
  &.event-sign { background: rgba(16, 185, 129, 0.15); color: #10B981; }
  &.event-receipt { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
  &.event-follow { background: rgba(51, 112, 255, 0.15); color: #3370ff; }
  &.event-lead { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; }
  &.event-alert { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
}
.event-content { flex: 1; font-size: 13px; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event-time { font-size: 11px; color: #475569; flex-shrink: 0; }

// Alerts (IDCP 三级预警体系)
.alert-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.alert-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
  .alert-count {
    font-size: 13px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
    letter-spacing: 0.5px;
    &.critical { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
    &.warning { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
    &.info { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
  }
}
.alert-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}
.alert-item {
  display: flex;
  align-items: stretch;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
  &:hover { border-color: rgba(51, 112, 255, 0.3); background: rgba(15, 23, 42, 0.75); }
  &.alert-critical .alert-level-bar { background: #EF4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
  &.alert-warning  .alert-level-bar { background: #F59E0B; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
  &.alert-info     .alert-level-bar { background: #3B82F6; box-shadow: 0 0 8px rgba(59, 130, 246, 0.4); }
}
.alert-level-bar {
  width: 3px;
  border-radius: 2px;
  margin-right: 12px;
  flex-shrink: 0;
}
.alert-content {
  flex: 1;
  min-width: 0;
}
.alert-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 8px;
}
.alert-title {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.alert-desc {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.alert-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #475569;
}
.alert-deviation {
  display: flex;
  align-items: center;
  gap: 2px;
  &.deviation-up   { color: #EF4444; }
  &.deviation-down { color: #10B981; }
  &.deviation-flat { color: #94a3b8; }
}
.alert-time, .alert-module { color: #64748b; }
.alert-action {
  display: flex;
  align-items: center;
  margin-left: 8px;
  flex-shrink: 0;
}
.alert-badge {
  margin-right: 4px;
  :deep(.el-badge__content) {
    border: none;
    box-shadow: 0 0 0 2px rgba(30, 41, 59, 0.9);
  }
}

// 预警详情弹窗
.alert-detail {
  .detail-header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .detail-level {
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    flex-shrink: 0;
    &.level-critical { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
    &.level-warning  { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
    &.level-info     { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
  }
  .detail-info {
    flex: 1;
    min-width: 0;
    h3 { margin: 0 0 4px; font-size: 16px; }
    p  { margin: 0; color: #64748b; font-size: 13px; }
  }
  .detail-metrics {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }
  .metric-item {
    text-align: center;
    flex: 1;
    min-width: 80px;
  }
  .metric-label {
    display: block;
    font-size: 12px;
    color: #64748b;
  }
  .metric-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    margin-top: 4px;
    &.module-value { font-size: 14px; }
  }
  .text-danger  { color: #EF4444; }
  .text-success { color: #10B981; }
  .detail-cause {
    h4 { margin: 0 0 12px; font-size: 14px; }
    p  { margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6; }
  }
}

// AI Loading / Empty (shared with strategic-summary)
.ai-loading { text-align: center; padding: 24px; color: #3370ff; font-size: 14px; }
.ai-empty { text-align: center; padding: 24px; color: #64748b; font-size: 13px; }

// AI Assistant Panel
.ai-assistant {
  position: fixed;
  right: 0;
  top: 80px;
  bottom: 20px;
  width: 48px;
  z-index: 100;
  transition: width 0.3s ease;
  display: flex;

  &.expanded {
    width: 420px;
  }
}

.ai-toggle-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: rgba(51, 112, 255, 0.9);
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  color: #fff;
  font-size: 12px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transition: all 0.2s;
  &:hover { background: rgba(217, 85, 26, 0.95); }

  .expanded & {
    writing-mode: horizontal-tb;
    flex-direction: row;
    border-radius: 0;
    padding: 10px 16px;
  }
}

.ai-panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.98);
  border-left: 1px solid #334155;
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.ai-quick-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #1e293b;
  flex-wrap: wrap;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-welcome {
  text-align: center;
  padding: 40px 20px;
  .welcome-icon { color: #3370ff; margin-bottom: 12px; }
  h4 { color: #e2e8f0; font-size: 16px; margin: 0 0 8px; }
  p { color: #64748b; font-size: 13px; margin: 0 0 16px; }
  .ai-welcome-note { color: #F59E0B; font-size: 12px; margin: -8px 0 14px; }
}

.welcome-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-chip {
  display: inline-block;
  padding: 8px 14px;
  background: rgba(51, 112, 255, 0.1);
  border: 1px solid rgba(51, 112, 255, 0.3);
  border-radius: 20px;
  color: #3370ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(51, 112, 255, 0.2); }
}

.ai-message {
  display: flex;
  gap: 10px;

  &.user {
    flex-direction: row-reverse;
    .msg-bubble { background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3); }
    .msg-avatar { background: #3B82F6; }
  }
  &.assistant {
    .msg-bubble { background: rgba(51, 112, 255, 0.08); border-color: rgba(51, 112, 255, 0.2); }
    .msg-avatar { background: #3370ff; }
  }
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.msg-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid;
  font-size: 13px;
  line-height: 1.6;
  color: #cbd5e1;

  :deep(h3) { font-size: 14px; color: #3370ff; margin: 8px 0 4px; }
  :deep(h4) { font-size: 13px; color: #e2e8f0; margin: 6px 0 4px; }
  :deep(strong) { color: #f8fafc; }
  :deep(ul) { padding-left: 16px; margin: 4px 0; }
  :deep(li) { margin: 2px 0; font-size: 12px; }
}

.msg-sql {
  margin-top: 8px;
  border-top: 1px solid rgba(51, 65, 85, 0.5);
  padding-top: 8px;
}

.sql-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  cursor: pointer;
  &:hover { color: #94a3b8; }
}

.sql-code {
  margin-top: 6px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #10B981;
  white-space: pre-wrap;
  word-break: break-all;
}

.msg-time {
  display: block;
  font-size: 10px;
  color: #475569;
  margin-top: 4px;
}

.ai-typing {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #94a3b8;
}

.typing-dots {
  display: flex;
  gap: 4px;
  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3370ff;
    animation: typingBounce 1.4s infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.ai-input-area {
  padding: 12px 16px;
  border-top: 1px solid #1e293b;
}

// Grid Layout Plus overrides
:deep(.vgl-layout) {
  background: transparent;
}
:deep(.vgl-item--placeholder) {
  background: rgba(51, 112, 255, 0.15) !important;
  border: 2px dashed rgba(51, 112, 255, 0.6) !important;
  border-radius: 12px;
  opacity: 1 !important;
}
:deep(.vgl-item--resizing),
:deep(.vgl-item--dragging) {
  z-index: 10;
  opacity: 0.9;
}
:deep(.vgl-item > .vgl-item__resizer) {
  opacity: 0.4;
  &:hover { opacity: 1; }
}

// Mode Switch
.mode-switch {
  margin-right: 20px;
}

// Strategic Mode
.strategic-view {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  min-height: calc(100vh - 200px);
}
.strategic-kpis {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.strategic-kpi-card {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
  &:hover { border-color: rgba(51, 112, 255, 0.4); transform: translateY(-2px); }
}
.strategic-kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.strategic-kpi-label {
  font-size: 14px;
  color: #94a3b8;
}
.strategic-kpi-value {
  margin-bottom: 16px;
}
.strategic-number {
  font-size: 42px;
  font-weight: 700;
  color: #f8fafc;
  font-family: 'Courier New', monospace;
}
.strategic-unit {
  font-size: 14px;
  color: #64748b;
  margin-left: 8px;
}
.strategic-kpi-compare {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}
.compare-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.compare-label {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}
.compare-value {
  font-size: 14px;
  font-weight: 600;
  &.up { color: #10B981; }
  &.down { color: #EF4444; }
}
.strategic-summary {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    h3 { margin: 0; font-size: 16px; color: #e2e8f0; }
  }
  .summary-content {
    flex: 1;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.7;
    color: #cbd5e1;
  }
}

// Operation Mode
.operation-view {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  min-height: calc(100vh - 200px);
}
.operation-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.operation-alerts, .operation-todo, .operation-events {
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #e2e8f0;
    margin: 0 0 16px;
  }
}
.operation-right {
  display: flex;
  flex-direction: column;
}
.operation-events {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.event-live {
  font-size: 12px;
  color: #10B981;
  margin-left: auto;
  animation: pulse 2s infinite;
}
.event-stream {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.event-stream-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 6px;
  font-size: 13px;
}
.event-stream-time {
  font-size: 11px;
  color: #475569;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
}
.event-stream-tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  &.event-sign { background: rgba(16, 185, 129, 0.15); color: #10B981; }
  &.event-receipt { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
  &.event-follow { background: rgba(51, 112, 255, 0.15); color: #3370ff; }
  &.event-lead { background: rgba(139, 92, 246, 0.15); color: #8B5CF6; }
  &.event-alert { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
}
.event-stream-content {
  color: #cbd5e1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.alert-list-op {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.alert-item-op {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.5);
  &.alert-critical .alert-level-dot { background: #EF4444; box-shadow: 0 0 6px #EF4444; }
  &.alert-warning .alert-level-dot { background: #F59E0B; box-shadow: 0 0 6px #F59E0B; }
}
.alert-level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.alert-op-content {
  display: flex;
  justify-content: space-between;
  flex: 1;
}
.alert-op-title { font-size: 13px; color: #e2e8f0; }
.alert-op-time { font-size: 11px; color: #475569; }
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 6px;
}
.todo-text {
  flex: 1;
  font-size: 13px;
  color: #cbd5e1;
  &.done { text-decoration: line-through; color: #475569; }
}

// Light enterprise theme alignment
.cockpit-page {
  background: #f5f7fb;
  color: var(--text-primary);
}

.cockpit-header,
.time-toolbar,
.grid-widget,
.strategic-kpi-card,
.strategic-summary,
.operation-alerts,
.operation-todo,
.operation-events {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
}

.cockpit-header {
  .header-title {
    color: var(--text-primary);
    white-space: nowrap;
  }

  .header-subtitle,
  .current-time,
  .last-update {
    color: var(--text-muted);
  }
}

.header-left {
  min-width: 150px;
}

.time-toolbar {
  :deep(.el-radio-button__inner) {
    background: #fff;
    border-color: var(--border-color);
    color: var(--text-secondary);
  }
}

.widget-header {
  border-bottom-color: var(--border-soft);

  .widget-title {
    color: var(--text-primary);
  }
}

.grid-widget:hover,
.strategic-kpi-card:hover {
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
}

.kpi-card,
.event-item,
.alert-item,
.event-stream-item,
.alert-item-op,
.todo-item {
  background: #f8fafc;
  border: 1px solid var(--border-soft);
}

.event-item:hover,
.alert-item:hover {
  background: #eff6ff;
  border-color: rgba(37, 99, 235, 0.18);
}

.kpi-number,
.event-content,
.alert-title,
.strategic-number,
.operation-alerts h3,
.operation-todo h3,
.operation-events h3,
.alert-op-title,
.todo-text,
.strategic-summary .summary-header h3 {
  color: var(--text-primary);
}

.kpi-unit,
.kpi-label,
.rate-label,
.event-time,
.alert-desc,
.alert-meta,
.alert-time,
.alert-module,
.event-stream-time,
.alert-op-time,
.strategic-kpi-label,
.strategic-unit,
.compare-label {
  color: var(--text-muted);
}

.strategic-summary .summary-content,
.event-stream-content {
  color: var(--text-secondary);
}

.ai-panel-body {
  background: #fff;
  border-left: 1px solid var(--border-color);
  box-shadow: -12px 0 28px rgba(15, 23, 42, 0.08);
}

.ai-toggle-bar {
  background: var(--brand-primary);

  &:hover {
    background: var(--brand-primary-hover);
  }
}

.ai-welcome {
  h4 {
    color: var(--text-primary);
  }

  p {
    color: var(--text-muted);
  }
}

.msg-bubble {
  color: var(--text-secondary);
}

.ai-message {
  &.assistant .msg-bubble {
    background: #f8fafc;
    border-color: var(--border-soft);
  }

  &.user .msg-bubble {
    background: #eff6ff;
    border-color: #bfdbfe;
  }
}

.msg-bubble {
  :deep(h3) {
    color: var(--brand-primary);
  }

  :deep(h4),
  :deep(strong) {
    color: var(--text-primary);
  }
}

.sql-code {
  background: #f8fafc;
  color: var(--success-color);
}

// Responsive
@media (max-width: 1440px) {
  .kpi-row { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
