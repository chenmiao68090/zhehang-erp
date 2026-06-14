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
        <el-badge :value="criticalCount" :hidden="criticalCount === 0" type="danger" class="alert-badge">
          <el-icon :size="18" color="#94a3b8"><Bell /></el-icon>
        </el-badge>
        <el-tag size="small" type="warning">管理员</el-tag>
        <el-button type="warning" plain size="small" :icon="RefreshLeft" @click="resetLayout">
          {{ $t('cockpit.resetLayout') }}
        </el-button>
        <el-button type="primary" :icon="Refresh" circle size="small" @click="refreshAll" :loading="loading" />
      </div>
    </header>

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

    <!-- Strategic Mode -->
    <div v-if="dashboardMode === 'strategic'" class="strategic-view">
      <div class="strategic-kpis">
        <div v-for="kpi in strategicKpis" :key="kpi.key" class="strategic-kpi-card">
          <div class="strategic-kpi-header">
            <span class="strategic-kpi-label">{{ kpi.label }}</span>
            <el-tag :type="kpi.status" size="small" effect="plain">{{ kpi.statusText }}</el-tag>
          </div>
          <div class="strategic-kpi-value">
            <span class="strategic-number">{{ formatNumber(kpi.value) }}</span>
            <span class="strategic-unit">{{ kpi.unit }}</span>
          </div>
          <div class="strategic-kpi-compare">
            <div class="compare-item">
              <span class="compare-label">同比</span>
              <span class="compare-value" :class="kpi.yoyRate >= 0 ? 'up' : 'down'">
                {{ kpi.yoyRate >= 0 ? '+' : '' }}{{ kpi.yoyRate.toFixed(1) }}%
              </span>
            </div>
            <div class="compare-item">
              <span class="compare-label">环比</span>
              <span class="compare-value" :class="kpi.momRate >= 0 ? 'up' : 'down'">
                {{ kpi.momRate >= 0 ? '+' : '' }}{{ kpi.momRate.toFixed(1) }}%
              </span>
            </div>
            <div class="compare-item">
              <span class="compare-label">
                目标达成
                <el-tag v-if="kpi.targetExample" size="small" type="info" effect="plain" class="example-tag">示例</el-tag>
              </span>
              <span class="compare-value">{{ kpi.targetRate.toFixed(0) }}%</span>
            </div>
          </div>
          <el-progress :percentage="kpi.targetRate" :stroke-width="4" :show-text="false"
            :color="kpi.targetRate >= 100 ? '#10B981' : kpi.targetRate >= 80 ? '#F59E0B' : '#EF4444'" />
        </div>
      </div>
      <div class="strategic-summary">
        <div class="summary-header">
          <h3>AI 经营摘要</h3>
          <el-button size="small" type="primary" @click="loadAiSummary" :loading="aiLoading">刷新分析</el-button>
        </div>
        <div class="summary-content">
          <div v-if="aiLoading" class="ai-loading">正在分析经营数据...</div>
          <div v-else-if="aiContent" v-html="renderMarkdown(aiContent)"></div>
          <div v-else class="ai-empty">点击刷新获取AI经营分析摘要</div>
        </div>
      </div>
    </div>

    <!-- Operation Mode -->
    <div v-if="dashboardMode === 'operation'" class="operation-view">
      <div class="operation-left">
        <div class="operation-alerts">
          <h3>
            <el-icon><Bell /></el-icon> 实时告警 <el-badge :value="criticalCount" type="danger" />
            <el-tag size="small" type="info" effect="plain" class="example-tag">示例</el-tag>
          </h3>
          <div class="alert-list-op">
            <div v-for="alert in alertItems.filter(a => a.level === 'critical' || a.level === 'warning')" :key="alert.id"
              class="alert-item-op" :class="'alert-' + alert.level">
              <div class="alert-level-dot"></div>
              <div class="alert-op-content">
                <span class="alert-op-title">{{ alert.title }}</span>
                <span class="alert-op-time">{{ alert.triggerTime }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="operation-todo">
          <h3>
            <el-icon><List /></el-icon> 待办事项
            <el-tag size="small" type="info" effect="plain" class="example-tag">示例</el-tag>
          </h3>
          <div class="todo-list">
            <div v-for="(todo, idx) in todoItems" :key="idx" class="todo-item">
              <el-checkbox :model-value="todo.done" size="small" />
              <span class="todo-text" :class="{ done: todo.done }">{{ todo.text }}</span>
              <el-tag size="small" :type="todo.priority === 'high' ? 'danger' : todo.priority === 'medium' ? 'warning' : 'info'">
                {{ todo.priority === 'high' ? '紧急' : todo.priority === 'medium' ? '重要' : '一般' }}
              </el-tag>
            </div>
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
                    <div class="kpi-sparkline">
                      <svg viewBox="0 0 60 20" class="sparkline-svg">
                        <polyline :points="kpi.sparkline" fill="none" :stroke="kpi.color" stroke-width="1.5" />
                      </svg>
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
            </div>

            <!-- Region Map -->
            <div v-else-if="item.i === 'regionMap'" ref="regionMapRef" class="chart-canvas"></div>

            <!-- Alerts (IDCP 三级预警体系) -->
            <div v-else-if="item.i === 'alerts'" class="alert-panel">
              <div class="alert-summary">
                <span class="alert-count critical">紧急 {{ criticalCount }}</span>
                <span class="alert-count warning">警告 {{ warningCount }}</span>
                <span class="alert-count info">关注 {{ infoCount }}</span>
                <el-tooltip content="预警明细暂为示例数据，后端预警明细接口接入后将替换为真实数据" placement="top">
                  <el-tag size="small" type="info" effect="plain" class="example-tag">示例数据</el-tag>
                </el-tooltip>
              </div>
              <div class="alert-list">
                <div
                  v-for="alert in alertItems"
                  :key="alert.id"
                  class="alert-item"
                  :class="'alert-' + alert.level"
                >
                  <div class="alert-level-bar"></div>
                  <div class="alert-content">
                    <div class="alert-top">
                      <span class="alert-title">{{ alert.title }}</span>
                      <el-tag :type="alertTagType(alert.level)" size="small">{{ alertLevelText(alert.level) }}</el-tag>
                    </div>
                    <div class="alert-desc">{{ alert.description }}</div>
                    <div class="alert-meta">
                      <span class="alert-deviation" :class="'deviation-' + alert.trend">
                        <el-icon :size="12">
                          <CaretTop v-if="alert.trend === 'up'" />
                          <CaretBottom v-else-if="alert.trend === 'down'" />
                          <Minus v-else />
                        </el-icon>
                        偏离 {{ Math.abs(alert.deviation) }}%
                      </span>
                      <span class="alert-time">{{ alert.triggerTime }}</span>
                      <span class="alert-module">{{ alert.module }}</span>
                    </div>
                  </div>
                  <div class="alert-action">
                    <el-button size="small" text type="primary" @click="openAlertDetail(alert)">详情</el-button>
                  </div>
                </div>
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

    <!-- 预警详情与根因分析弹窗 -->
    <el-dialog
      v-model="alertDetailVisible"
      :title="'预警详情 - ' + (currentAlert?.title || '')"
      width="600px"
    >
      <div class="alert-detail" v-if="currentAlert">
        <div class="detail-header">
          <div class="detail-level" :class="'level-' + currentAlert.level">
            {{ alertLevelText(currentAlert.level) }}
          </div>
          <div class="detail-info">
            <h3>{{ currentAlert.title }}</h3>
            <p>{{ currentAlert.description }}</p>
          </div>
        </div>
        <el-divider />
        <div class="detail-metrics">
          <div class="metric-item">
            <span class="metric-label">当前值</span>
            <span class="metric-value">{{ currentAlert.value }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">阈值</span>
            <span class="metric-value">{{ currentAlert.threshold }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">偏离度</span>
            <span
              class="metric-value"
              :class="currentAlert.deviation > 0 ? 'text-danger' : 'text-success'"
            >{{ currentAlert.deviation > 0 ? '+' : '' }}{{ currentAlert.deviation }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">来源模块</span>
            <span class="metric-value module-value">{{ currentAlert.module }}</span>
          </div>
        </div>
        <el-divider />
        <div class="detail-cause">
          <h4>根因分析</h4>
          <el-timeline>
            <el-timeline-item timestamp="因素1" placement="top" color="#F26522">
              <p>主要原因：该指标在过去7天持续偏离目标，已影响获客、回款或交付链路。</p>
            </el-timeline-item>
            <el-timeline-item timestamp="因素2" placement="top" color="#F59E0B">
              <p>次要原因：关联模块存在未闭环动作，需要同步查看责任人、客户、订单与渠道记录。</p>
            </el-timeline-item>
            <el-timeline-item timestamp="建议" placement="top" color="#10B981">
              <p>建议进入 {{ currentAlert.module }} 模块定位明细，明确责任人、截止时间和处理结果。</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
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
            <p class="ai-welcome-note">AI 分析能力建设中，未配置模型时将返回引导性提示。</p>
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
              <div class="msg-content" v-html="msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content"></div>
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
  Bell, Minus, Monitor, Clock, List, Back,
  ArrowLeft, ArrowRight, Warning, Promotion, Document
} from '@element-plus/icons-vue'
import {
  getCockpitKpi, getRevenueTrend, getCustomerSource,
  getSalesRank, getRecentEvents, getRegionDistribution,
  getAlerts, getAiSummary, getRevenueDrillDown, getRegionDrillDown
} from '@/api/cockpit'
import type { CockpitKpi, RecentEvent, AlertData, CustomerSource, SalesRank, RegionDistribution } from '@/api/cockpit'
import { sendChat } from '@/api/ai'

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
const events = ref<RecentEvent[]>([])
const alerts = reactive<AlertData>({
  overdueReceiptCount: 0, overdueReceiptAmount: 0,
  riskCustomerCount: 0, expiringContractCount: 0,
  stockWarningCount: 0, abnormalApprovalCount: 0
})

// IDCP 三级预警体系
interface AlertItem {
  id: string
  title: string
  description: string
  level: 'critical' | 'warning' | 'info'
  value: number
  threshold: number
  deviation: number
  trend: 'up' | 'down' | 'flat'
  triggerTime: string
  module: string
}

// 示例数据：后端 /dashboard/cockpit/alerts 仅返回各类预警的汇总计数（逾期应收/风险客户/到期合同等），
// 暂无"预警明细列表"接口（标题/描述/等级/偏离度/触发时间/来源模块）。故以下明细为示例，
// 界面上对该面板标注"示例"，待后端提供明细接口后替换为真实数据。
const alertItems = ref<AlertItem[]>([
  { id: '1', title: '同行渠道应收超账期', description: '杭企伙伴等渠道客户超过账期仍有未回款订单', level: 'critical', value: 4, threshold: 2, deviation: 100, trend: 'up', triggerTime: '10分钟前', module: '渠道管理' },
  { id: '2', title: '网销ROI低于目标', description: '信息流投放 ROI 低于 3.2，线索成本连续 3 日上升', level: 'critical', value: 2.8, threshold: 3.2, deviation: 13, trend: 'down', triggerTime: '18分钟前', module: '营销获客' },
  { id: '3', title: '代理记账续费临期', description: '30天内到期客户未完成回访，需客户成功介入', level: 'warning', value: 18, threshold: 10, deviation: 80, trend: 'up', triggerTime: '45分钟前', module: '服务交付' },
  { id: '4', title: '工商注册材料卡点', description: '客户材料未齐导致交付节点延后，影响承诺周期', level: 'warning', value: 9, threshold: 5, deviation: 80, trend: 'up', triggerTime: '1小时前', module: '订单交付' },
  { id: '5', title: '地址资源低库存', description: '西湖区、滨江区可售挂靠地址资源低于安全线', level: 'warning', value: 16, threshold: 30, deviation: 47, trend: 'down', triggerTime: '2小时前', module: '地址资源池' },
  { id: '6', title: '工商信息补全率不足', description: '今日新增企业客户统一社会信用代码和法人信息未补全', level: 'info', value: 86, threshold: 95, deviation: 9, trend: 'flat', triggerTime: '3小时前', module: '客户中心' }
])

const alertDetailVisible = ref(false)
const currentAlert = ref<AlertItem | null>(null)

const criticalCount = computed(() => alertItems.value.filter(a => a.level === 'critical').length)
const warningCount = computed(() => alertItems.value.filter(a => a.level === 'warning').length)
const infoCount = computed(() => alertItems.value.filter(a => a.level === 'info').length)

function alertTagType(level: string): 'danger' | 'warning' | 'info' {
  return level === 'critical' ? 'danger' : level === 'warning' ? 'warning' : 'info'
}

function alertLevelText(level: string): string {
  return level === 'critical' ? '紧急' : level === 'warning' ? '警告' : '关注'
}

function openAlertDetail(alert: AlertItem) {
  currentAlert.value = alert
  alertDetailVisible.value = true
}
const aiExpanded = ref(false)
const aiLoading = ref(false)
const aiContent = ref('')
const aiProvider = ref('')

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

  // 调用真实 AI 接口 /ai/chat；后端不可用或未配置模型时会返回兜底文案
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
    diagnose: '请对当前驾驶舱数据进行智能诊断，识别所有异常指标并分析根本原因',
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

// Strategic mode KPI computed
// 说明：value 与 yoyRate 取自后端真实 KPI；momRate 暂用真实增长率估算；
// targetRate / status / statusText（目标达成率与达标状态）后端暂无目标配置接口，为示例值，
// 故界面上对"目标达成"标注"示例"，避免冒充真实达成率。
const strategicKpis = computed(() => {
  const d = kpiData.value
  if (!d) return []
  return [
    { key: 'revenue', label: '本月签约额', value: (d.totalRevenue / 10000).toFixed(0), unit: '万元', yoyRate: d.revenueGrowthRate, momRate: d.receiptGrowthRate * 0.8, targetRate: 87, status: 'warning' as const, statusText: '接近目标', targetExample: true },
    { key: 'customers', label: '服务客户数', value: d.totalCustomers, unit: '家', yoyRate: d.customerGrowthRate, momRate: d.newCustomerGrowthRate, targetRate: 102, status: 'success' as const, statusText: '已达标', targetExample: true },
    { key: 'receipt', label: '本月回款', value: (d.monthReceipt / 10000).toFixed(0), unit: '万元', yoyRate: d.receiptGrowthRate, momRate: d.receiptGrowthRate * 1.1, targetRate: 73, status: 'danger' as const, statusText: '需关注', targetExample: true },
    { key: 'contracts', label: '待签订单', value: d.pendingContracts, unit: '份', yoyRate: d.pendingContractsRate, momRate: d.pendingContractsRate * 0.6, targetRate: 95, status: 'success' as const, statusText: '正常', targetExample: true }
  ]
})

// Operation mode todo items
// 示例数据：驾驶舱暂未接入待办/工作流接口，界面已对该区块标注"示例"。
const todoItems = ref([
  { text: '冻结超账期同行渠道新增订单权限', done: false, priority: 'high' as const },
  { text: '复盘抖音信息流低 ROI 投放计划', done: false, priority: 'high' as const },
  { text: '确认滨江区挂靠地址资源补充计划', done: false, priority: 'medium' as const },
  { text: '跟进 18 户代理记账续费回访', done: false, priority: 'medium' as const },
  { text: '核对昨日新增企业工商信息补全率', done: true, priority: 'low' as const },
  { text: '同步工商注册材料缺失清单给销售', done: false, priority: 'low' as const }
])

// Time range filter
const timeRange = ref('month')
const customDateRange = ref<[Date, Date] | null>(null)
const showYoY = ref(false)
const showMoM = ref(false)

function onTimeRangeChange() {
  refreshAll()
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

function generateSparkline(): string {
  const points: number[] = Array.from({ length: 7 }, () => Math.random() * 14 + 3)
  return points.map((y, i) => `${i * 10},${20 - y}`).join(' ')
}

// KPI
const kpiData = ref<CockpitKpi | null>(null)
const kpiCards = computed(() => {
  const d = kpiData.value
  if (!d) return []
  return [
    { key: 'customers', label: t('cockpit.kpi.totalCustomers'), value: d.totalCustomers, rate: d.customerGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'UserIcon', color: '#F26522', unit: '', sparkline: generateSparkline() },
    { key: 'newCustomers', label: t('cockpit.kpi.newCustomers'), value: d.newCustomersMonth, rate: d.newCustomerGrowthRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Connection', color: '#10B981', unit: '', sparkline: generateSparkline() },
    { key: 'revenue', label: t('cockpit.kpi.totalRevenue'), value: (d.totalRevenue / 10000).toFixed(0), rate: d.revenueGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'TrendCharts', color: '#3B82F6', unit: t('cockpit.unit.tenThousand'), sparkline: generateSparkline() },
    { key: 'receipt', label: t('cockpit.kpi.monthReceipt'), value: (d.monthReceipt / 10000).toFixed(0), rate: d.receiptGrowthRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Money', color: '#8B5CF6', unit: t('cockpit.unit.tenThousand'), sparkline: generateSparkline() },
    { key: 'contracts', label: t('cockpit.kpi.pendingContracts'), value: d.pendingContracts, rate: d.pendingContractsRate, rateLabel: t('cockpit.kpi.mom'), icon: 'Briefcase', color: '#F59E0B', unit: '', sparkline: generateSparkline() },
    { key: 'employees', label: t('cockpit.kpi.totalEmployees'), value: d.totalEmployees, rate: d.employeeGrowthRate, rateLabel: t('cockpit.kpi.yoy'), icon: 'ListIcon', color: '#06B6D4', unit: '', sparkline: generateSparkline() }
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
const COLORS = ['#F26522', '#FF8C42', '#FFB347', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4']

const defaultCustomerSources: CustomerSource[] = [
  { source: '抖音信息流', count: 286 },
  { source: '百度搜索', count: 238 },
  { source: '电销拓客', count: 216 },
  { source: '同行转介绍', count: 168 },
  { source: '企查工商库', count: 142 },
  { source: '老客户复购', count: 126 },
  { source: '自然咨询', count: 110 }
]

const defaultSalesRank: SalesRank[] = [
  { rank: 1, employeeName: '张星', department: '网销一组', amount: 2860000, growthRate: 18.5 },
  { rank: 2, employeeName: '李娜', department: '电销一组', amount: 2450000, growthRate: 12.3 },
  { rank: 3, employeeName: '王明', department: '渠道销售组', amount: 2180000, growthRate: 22.1 },
  { rank: 4, employeeName: '赵静', department: '网销二组', amount: 1960000, growthRate: -5.2 },
  { rank: 5, employeeName: '刘强', department: '企业服务组', amount: 1850000, growthRate: 8.7 },
  { rank: 6, employeeName: '陈芳', department: '客户成功组', amount: 1720000, growthRate: 15.4 },
  { rank: 7, employeeName: '周海', department: '渠道销售组', amount: 1580000, growthRate: 3.2 },
  { rank: 8, employeeName: '杨雪', department: '网销一组', amount: 1460000, growthRate: -2.1 },
  { rank: 9, employeeName: '吴磊', department: '电销二组', amount: 1320000, growthRate: 9.8 },
  { rank: 10, employeeName: '孙亮', department: '企业服务组', amount: 1180000, growthRate: 6.5 }
]

const defaultEvents: RecentEvent[] = [
  { type: 'sign', content: '与杭州松柏科技签约代理记账+税务顾问年度服务，金额￥12.8万', time: '2分钟前', operator: '张星' },
  { type: 'receipt', content: '收到同行渠道「杭企伙伴」挂靠地址批量订单回款￥45.6万', time: '15分钟前', operator: '李娜' },
  { type: 'follow', content: '跟进滨江新注册企业工商注册+银行开户需求，客户意向积极', time: '30分钟前', operator: '王明' },
  { type: 'lead', content: '新线索：浙江两杉生物科技自动带出工商信息并进入电销队列', time: '1小时前', operator: '系统' },
  { type: 'sign', content: '与杭州华锋智康签订税务异常解除专项服务￥8.6万', time: '1.5小时前', operator: '赵静' },
  { type: 'receipt', content: '收到金华美达商贸代理记账续费回款￥3.28万', time: '2小时前', operator: '刘强' },
  { type: 'alert', content: '渠道「杭企伙伴」应收超过账期 9 天，建议冻结新增订单', time: '3小时前', operator: '系统' },
  { type: 'follow', content: '完成西湖区挂靠地址资源补充沟通，预计新增 20 套', time: '4小时前', operator: '陈芳' }
]

const defaultRegionDistribution: RegionDistribution[] = [
  { province: '西湖区', count: 186 },
  { province: '滨江区', count: 165 },
  { province: '上城区', count: 142 },
  { province: '拱墅区', count: 128 },
  { province: '萧山区', count: 116 },
  { province: '余杭区', count: 98 },
  { province: '钱塘区', count: 86 },
  { province: '临平区', count: 72 },
  { province: '宁波', count: 65 },
  { province: '嘉兴', count: 52 }
]

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
    const el = getEl(revenueTrendRef.value)
    if (!revenueTrendChart && el) {
      revenueTrendChart = echarts.init(el)
      observeChart(el)
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
    revenueTrendChart?.off('click')
    revenueTrendChart?.on('click', (params: any) => {
      if (params.componentType === 'series' && !isDrilledRevenue.value) {
        drillRevenue(params.name)
      }
    })
  } catch { /* fallback */ }
}

function renderRevenueDrillOption(data: { date: string; revenue: number; receipt: number }[]) {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['日营收', '日回款'], textStyle: { color: '#94a3b8' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { color: '#94a3b8' }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: [
      { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { show: false } }
    ],
    series: [
      { name: '日营收', type: 'bar', data: data.map(d => d.revenue), itemStyle: { color: '#F26522', borderRadius: [4, 4, 0, 0] }, barWidth: '35%' },
      { name: '日回款', type: 'line', yAxisIndex: 1, data: data.map(d => d.receipt), smooth: true, lineStyle: { color: '#3B82F6', width: 3 }, itemStyle: { color: '#3B82F6' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]) } }
    ]
  }
}

function generateMockRevenueDrill(_month: string): { date: string; revenue: number; receipt: number }[] {
  const days = 30
  return Array.from({ length: days }, (_, i) => ({
    date: `${i + 1}日`,
    revenue: Math.floor(Math.random() * 80000 + 20000),
    receipt: Math.floor(Math.random() * 60000 + 15000)
  }))
}

async function drillRevenue(month: string) {
  revenueDrillPath.value = [month]
  let data: { date: string; revenue: number; receipt: number }[]
  try {
    const res: any = await getRevenueDrillDown({ month })
    data = (res.data && res.data.length) ? res.data : generateMockRevenueDrill(month)
  } catch {
    data = generateMockRevenueDrill(month)
  }
  revenueTrendChart?.setOption(renderRevenueDrillOption(data), true)
}

function exitRevenueDrill() {
  revenueDrillPath.value = []
  loadRevenueTrend()
}

async function loadCustomerSource() {
  try {
    const res: any = await getCustomerSource()
    let data: CustomerSource[] = res.data || []
    if (!data.length || data.some(item => ['网络推广', '展会活动', '自主拜访'].includes(item.source))) {
      data = defaultCustomerSources
    }
    const el = getEl(customerSourceRef.value)
    if (!customerSourceChart && el) {
      customerSourceChart = echarts.init(el)
      observeChart(el)
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
    let source: SalesRank[] = res.data || []
    if (!source.length || source.some(item => item.department.includes('销售一部') || item.department.includes('销售三部'))) {
      source = defaultSalesRank
    }
    const data = [...source].reverse()
    const el = getEl(salesRankRef.value)
    if (!salesRankChart && el) {
      salesRankChart = echarts.init(el)
      observeChart(el)
    }
    salesRankChart?.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '10%', top: '3%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: '#94a3b8', formatter: (v: number) => (v / 10000).toFixed(0) + 'w' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      yAxis: { type: 'category', data: data.map((d: any) => d.employeeName), axisLabel: { color: '#94a3b8' }, axisLine: { lineStyle: { color: '#334155' } } },
      series: [{
        type: 'bar', data: data.map((d: any) => ({
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
    const data: RecentEvent[] = res.data || []
    if (!data.length || data.some(item => /设备采购|机械商机|采购意向/.test(item.content))) {
      events.value = defaultEvents
    } else {
      events.value = data
    }
  } catch { /* fallback */ }
}

async function loadRegionMap() {
  try {
    const res: any = await getRegionDistribution()
    let data: RegionDistribution[] = res.data || []
    if (!data.length || data.some(item => ['浙江', '江苏', '广东', '上海'].includes(item.province))) {
      data = defaultRegionDistribution
    }
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
      xAxis: { type: 'category', data: provinces, axisLabel: { color: '#94a3b8', rotate: 30 }, axisLine: { lineStyle: { color: '#334155' } } },
      yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
      series: [{
        type: 'bar', data: counts.map((v: number) => ({
          value: v,
          itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#F26522' }, { offset: 1, color: 'rgba(242,101,34,0.3)' }]), borderRadius: [4, 4, 0, 0] }
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
  } catch { /* fallback */ }
}

function renderRegionDrillOption(data: { city: string; count: number }[]) {
  const cities = data.map(d => d.city)
  const counts = data.map(d => d.count)
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '6%', top: '3%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: cities, axisLabel: { color: '#94a3b8', rotate: 30 }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: { type: 'value', axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [{
      type: 'bar', data: counts.map((v: number) => ({
        value: v,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: 'rgba(59,130,246,0.3)' }]), borderRadius: [4, 4, 0, 0] }
      })),
      barWidth: '60%'
    }]
  }
}

function generateMockRegionDrill(province: string): { city: string; count: number }[] {
  const cities = ['市区A', '市区B', '市区C', '市区D', '市区E', '市区F']
  return cities.map(city => ({ city: province + city, count: Math.floor(Math.random() * 50 + 5) }))
}

async function drillRegion(province: string) {
  regionDrillPath.value = [province]
  let data: { city: string; count: number }[]
  try {
    const res: any = await getRegionDrillDown({ province })
    data = (res.data && res.data.length) ? res.data : generateMockRegionDrill(province)
  } catch {
    data = generateMockRegionDrill(province)
  }
  regionMapChart?.setOption(renderRegionDrillOption(data), true)
}

function exitRegionDrill() {
  regionDrillPath.value = []
  loadRegionMap()
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
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
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
  border: 1px solid rgba(242, 101, 34, 0.2);
}
.header-left {
  .header-title { font-size: 24px; font-weight: 700; color: #F26522; margin: 0; }
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
  border-radius: 10px;
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
    border-color: rgba(242, 101, 34, 0.35);
    box-shadow: 0 6px 22px rgba(242, 101, 34, 0.1);
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
    &:hover { color: #F26522; transform: scale(1.15); }
  }
  .drag-handle {
    cursor: move;
    color: rgba(148, 163, 184, 0.4);
    transition: color 0.2s, transform 0.2s;
    &:hover { color: #F26522; transform: scale(1.15); }
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
  color: #F26522;
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
  border-radius: 10px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); border-color: rgba(242, 101, 34, 0.4); }
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
  &:hover { border-color: rgba(242, 101, 34, 0.3); background: rgba(15, 23, 42, 0.75); }
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
.ai-loading { text-align: center; padding: 24px; color: #F26522; font-size: 14px; }
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
  background: rgba(242, 101, 34, 0.9);
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
  .welcome-icon { color: #F26522; margin-bottom: 12px; }
  h4 { color: #e2e8f0; font-size: 16px; margin: 0 0 8px; }
  p { color: #64748b; font-size: 13px; margin: 0 0 16px; }
  .ai-welcome-note { color: #F59E0B; font-size: 12px; margin: -8px 0 14px; }
}

// 示例数据标签（用于标注尚未接入真实接口的局部区块）
.example-tag {
  margin-left: 8px;
  vertical-align: middle;
  font-weight: 400;
}

.welcome-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-chip {
  display: inline-block;
  padding: 8px 14px;
  background: rgba(242, 101, 34, 0.1);
  border: 1px solid rgba(242, 101, 34, 0.3);
  border-radius: 20px;
  color: #F26522;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(242, 101, 34, 0.2); }
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
    .msg-bubble { background: rgba(242, 101, 34, 0.08); border-color: rgba(242, 101, 34, 0.2); }
    .msg-avatar { background: #F26522; }
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

  :deep(h3) { font-size: 14px; color: #F26522; margin: 8px 0 4px; }
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
    background: #F26522;
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
  background: rgba(242, 101, 34, 0.15) !important;
  border: 2px dashed rgba(242, 101, 34, 0.6) !important;
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
  &:hover { border-color: rgba(242, 101, 34, 0.4); transform: translateY(-2px); }
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
  .example-tag {
    margin-left: 4px;
    height: 16px;
    padding: 0 4px;
    line-height: 14px;
    font-size: 10px;
  }
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
  &.event-follow { background: rgba(242, 101, 34, 0.15); color: #F26522; }
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
