<template>
  <div class="preview-shell">
    <!-- 顶栏 -->
    <header class="preview-bar">
      <div class="bar-left">
        <span class="bar-mark">
          <span class="mark-line"></span>
          <span class="mark-text">PREVIEW</span>
        </span>
        <h1 class="bar-title">
          <span class="bar-cn">{{ dashboard?.name || '加载中…' }}</span>
          <span class="bar-en">Read-Only Mode</span>
        </h1>
      </div>
      <div class="bar-meta">
        <span class="meta-item">
          <span class="meta-dot meta-dot--live"></span>
          <span class="meta-label">实时</span>
        </span>
        <span class="meta-sep"></span>
        <span class="meta-item">
          <el-icon><DataAnalysis /></el-icon>
          <span class="meta-label">{{ dashboard?.widgets?.length ?? 0 }} 组件</span>
        </span>
        <span class="meta-sep"></span>
        <span class="meta-item meta-item--time">
          <el-icon><Refresh /></el-icon>
          <span class="meta-label">{{ lastRefreshLabel }}</span>
        </span>
      </div>
      <div class="bar-actions">
        <button class="bar-btn" @click="handleRefresh" :class="{ 'is-loading': refreshing }">
          <el-icon><Refresh /></el-icon>
          <span>刷新</span>
        </button>
        <button class="bar-btn" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          <span>编辑</span>
        </button>
        <button class="bar-btn bar-btn--close" @click="handleClose">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="state-loading">
      <div class="loading-frame">
        <div class="loading-shimmer"></div>
        <p>正在拉取驾驶舱配置…</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!dashboard || !dashboard.widgets?.length" class="state-empty">
      <div class="empty-mark">
        <span class="mark-line"></span>
        <span class="mark-text">EMPTY</span>
      </div>
      <h3>该驾驶舱暂无组件</h3>
      <p>请前往设计器添加图表或组件。</p>
      <button class="bar-btn bar-btn--primary" @click="handleEdit">前往设计器</button>
    </div>

    <!-- 网格 -->
    <main v-else class="preview-canvas" ref="canvasRef">
      <grid-layout
        v-model:layout="layoutData"
        :col-num="24"
        :row-height="40"
        :margin="[16, 16]"
        :is-draggable="false"
        :is-resizable="false"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <grid-item
          v-for="item in layoutData"
          :key="item.i"
          :i="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
        >
          <div class="widget-wrap">
            <div v-if="getWidget(item.i)?.style?.showTitle !== false" class="widget-head">
              <div class="widget-titles">
                <h4 class="widget-title">{{ getWidget(item.i)?.title || '未命名组件' }}</h4>
                <span v-if="getWidget(item.i)?.subtitle" class="widget-sub">{{ getWidget(item.i)?.subtitle }}</span>
              </div>
              <span class="widget-tag">{{ widgetTypeLabel(getWidget(item.i)?.type) }}</span>
            </div>
            <div class="widget-body">
              <component
                v-if="resolveComponent(getWidget(item.i)?.type)"
                :is="resolveComponent(getWidget(item.i)?.type)"
                :widget="getWidget(item.i)"
                :config="getWidget(item.i)"
                :data="mockData[item.i]"
                :readonly="true"
                :preview="true"
              />
              <div v-else class="widget-fallback">
                <el-icon :size="22"><Picture /></el-icon>
                <span>组件类型 {{ getWidget(item.i)?.type }} 暂未注册</span>
              </div>
            </div>
          </div>
        </grid-item>
      </grid-layout>
    </main>

    <!-- 底部装饰 -->
    <footer class="preview-foot">
      <span class="foot-line"></span>
      <span class="foot-text">© ZheHang ERP · Dashboard Preview</span>
      <span class="foot-line"></span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GridLayout, GridItem } from 'vue-grid-layout-v3'
import { ElMessage } from 'element-plus'
import {
  Refresh, Edit, Close, DataAnalysis, Picture
} from '@element-plus/icons-vue'
import type { DashboardConfig, WidgetConfig, WidgetType } from '@/views/dashboard/types/dashboard'
import { getDashboard } from '@/api/dashboard'
import { getChartComponent } from '@/views/dashboard/components/charts/index'
import { useAutoRefresh } from '@/views/dashboard/designer/composables/useAutoRefresh'

interface LayoutItem { i: string; x: number; y: number; w: number; h: number }

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const refreshing = ref(false)
const dashboard = ref<DashboardConfig | null>(null)
const layoutData = ref<LayoutItem[]>([])
const lastRefreshTime = ref<number>(Date.now())
const mockData = ref<Record<string, unknown>>({})

const lastRefreshLabel = computed(() => {
  const d = new Date(lastRefreshTime.value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

function getWidget(id: string): WidgetConfig | undefined {
  return dashboard.value?.widgets?.find((w) => w.id === id)
}

function resolveComponent(type?: WidgetType) {
  if (!type) return null
  return getChartComponent(type) ?? null
}

function widgetTypeLabel(type?: WidgetType) {
  const map: Record<string, string> = {
    'number-card': '数字卡片',
    'line-chart': '折线图',
    'bar-chart': '柱状图',
    'pie-chart': '饼图',
    'bar-horizontal': '条形图',
    'scatter-chart': '散点图',
    'radar-chart': '雷达图',
    'funnel-chart': '漏斗图',
    'heat-map': '热力图',
    'leaderboard': '排行榜',
    'progress-bar': '进度条',
    'gantt-chart': '甘特图',
    'data-table': '数据表',
    'map-chart': '地图',
    'rich-text': '富文本',
    'filter': '筛选器',
    'image': '图片',
  }
  return type ? (map[type] || type) : ''
}

function syncLayout() {
  layoutData.value = (dashboard.value?.widgets ?? []).map((w) => ({
    i: w.id,
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
  }))
}

async function loadDashboard() {
  loading.value = true
  const id = route.params.id as string
  try {
    const res = await getDashboard(id)
    dashboard.value = res.data
  } catch {
    dashboard.value = buildMockDashboard(id)
  } finally {
    syncLayout()
    refreshMockData()
    lastRefreshTime.value = Date.now()
    loading.value = false
  }
}

function buildMockDashboard(id: string): DashboardConfig {
  const now = new Date().toISOString()
  return {
    id,
    name: '示例预览看板',
    description: '后端未就绪时的占位数据',
    widgets: [],
    theme: 'dark',
    gridColumns: 24,
    createdAt: now,
    updatedAt: now,
    createdBy: 'preview',
  }
}

function refreshMockData() {
  const next: Record<string, unknown> = {}
  for (const w of dashboard.value?.widgets ?? []) {
    next[w.id] = generateMock(w)
  }
  mockData.value = next
}

function generateMock(w: WidgetConfig): unknown {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)
  switch (w.type) {
    case 'number-card':
      return { value: rand(1000, 99999), trend: rand(-20, 30), unit: '' }
    case 'line-chart':
    case 'bar-chart':
      return {
        xAxis: ['一月', '二月', '三月', '四月', '五月', '六月'],
        series: [{ name: '数据', data: Array.from({ length: 6 }, () => rand(80, 800)) }],
      }
    case 'pie-chart':
    case 'funnel-chart':
      return [
        { name: '直销', value: rand(100, 500) },
        { name: '渠道', value: rand(100, 500) },
        { name: '线上', value: rand(100, 500) },
        { name: '其它', value: rand(50, 200) },
      ]
    case 'leaderboard':
      return Array.from({ length: 8 }, (_, i) => ({ name: `选手 ${i + 1}`, value: rand(100, 999) }))
    case 'progress-bar':
      return Array.from({ length: 4 }, (_, i) => ({ name: `指标 ${i + 1}`, value: rand(20, 100) }))
    default:
      return {}
  }
}

const { onRefresh, start, stop, refresh } = useAutoRefresh({ strategy: 'scheduled', interval: 60 })
onRefresh(() => {
  refreshMockData()
  lastRefreshTime.value = Date.now()
})

async function handleRefresh() {
  refreshing.value = true
  try {
    await refresh()
    ElMessage.success('已刷新')
  } finally {
    setTimeout(() => { refreshing.value = false }, 400)
  }
}

function handleEdit() {
  const id = dashboard.value?.id || (route.params.id as string)
  if (id) router.push({ path: `/dashboard/designer/${id}` })
}

function handleClose() {
  if (window.history.length > 1) router.back()
  else router.push({ path: '/dashboard' })
}

watch(() => dashboard.value?.widgets, syncLayout, { deep: true })

onMounted(async () => {
  await loadDashboard()
  start()
})

onBeforeUnmount(() => {
  stop()
})
</script>

<style scoped>
.preview-shell {
  width: 100vw;
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at 90% -10%, rgba(212, 175, 55, 0.06), transparent 60%),
    radial-gradient(800px 500px at -10% 110%, rgba(212, 175, 55, 0.04), transparent 60%),
    #0A0A0F;
  color: #EAEAEA;
  font-family: 'PingFang SC', 'Source Han Sans CN', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}

/* === 顶栏 === */
.preview-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 32px;
  background: rgba(10, 10, 15, 0.86);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}
.bar-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.bar-mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.mark-line {
  width: 28px;
  height: 1px;
  background: linear-gradient(90deg, #D4AF37, transparent);
}
.mark-text {
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 11px;
  letter-spacing: 0.4em;
  color: #D4AF37;
  font-weight: 600;
}
.bar-title {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.bar-cn {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #EAEAEA;
}
.bar-en {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-style: italic;
  font-size: 14px;
  color: #5A5A6E;
}

.bar-meta {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  color: #8B8B9A;
  font-size: 12px;
  letter-spacing: 0.04em;
}
.meta-item { display: inline-flex; align-items: center; gap: 6px; }
.meta-item--time .meta-label { font-family: 'Cormorant Garamond', serif; letter-spacing: 0.1em; color: #D4AF37; }
.meta-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5A5A6E;
}
.meta-dot--live {
  background: #00D084;
  box-shadow: 0 0 8px rgba(0, 208, 132, 0.6);
  animation: meta-pulse 1.6s ease-in-out infinite;
}
@keyframes meta-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.meta-sep {
  width: 1px;
  height: 14px;
  background: rgba(212, 175, 55, 0.2);
}

.bar-actions { display: flex; align-items: center; gap: 8px; }
.bar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 10px;
  color: #EAEAEA;
  font-size: 12px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.25s ease;
}
.bar-btn:hover {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.45);
  color: #D4AF37;
}
.bar-btn.is-loading .el-icon {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}
.bar-btn--close { padding: 9px 12px; }
.bar-btn--primary {
  background: linear-gradient(135deg, #D4AF37, #F2D06B);
  color: #0A0A0F;
  border: none;
  font-weight: 600;
}

/* === 状态 === */
.state-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}
.loading-frame {
  text-align: center;
  color: #8B8B9A;
}
.loading-shimmer {
  width: 120px;
  height: 2px;
  margin: 0 auto 20px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.state-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #8B8B9A;
}
.empty-mark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.empty-mark .mark-line {
  width: 36px;
}
.state-empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: #EAEAEA;
  margin: 0 0 8px;
  letter-spacing: 0.05em;
}
.state-empty p { margin: 0 0 24px; font-size: 13px; }

/* === 画布 === */
.preview-canvas {
  flex: 1;
  padding: 24px 32px 12px;
  overflow: auto;
}
.preview-canvas::-webkit-scrollbar { width: 6px; height: 6px; }
.preview-canvas::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.2);
  border-radius: 3px;
}

.widget-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #14141C 0%, #10101A 100%);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.widget-wrap::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent);
  opacity: 0.5;
}
.widget-wrap:hover {
  border-color: rgba(212, 175, 55, 0.35);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.widget-head {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.1);
  flex-shrink: 0;
}
.widget-titles { min-width: 0; }
.widget-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #EAEAEA;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.widget-sub {
  display: block;
  font-size: 11px;
  color: #5A5A6E;
  margin-top: 2px;
}
.widget-tag {
  font-family: 'Cormorant Garamond', serif;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #D4AF37;
  text-transform: uppercase;
  flex-shrink: 0;
  padding: 2px 8px;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 999px;
}
.widget-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 8px 12px 12px;
  min-height: 0;
}
.widget-fallback {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #5A5A6E;
  font-size: 12px;
  border: 1px dashed rgba(212, 175, 55, 0.15);
  border-radius: 8px;
}

/* === 底部 === */
.preview-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 18px 0 28px;
}
.foot-line {
  height: 1px;
  width: 80px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
}
.foot-text {
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #5A5A6E;
}

:deep(.vue-grid-item) { transition: none; }
</style>
