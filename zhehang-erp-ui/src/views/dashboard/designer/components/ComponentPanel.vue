<template>
  <div class="component-panel">
    <div class="panel-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'components' }"
        @click="activeTab = 'components'"
      >
        组件库
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'templates' }"
        @click="activeTab = 'templates'"
      >
        模板库
      </button>
    </div>

    <div class="panel-content">
      <!-- 组件库 -->
      <div v-show="activeTab === 'components'" class="component-list">
        <div
          v-for="category in componentCategories"
          :key="category.key"
          class="category-section"
        >
          <div
            class="category-header"
            @click="toggleCategory(category.key)"
          >
            <span class="category-name">{{ category.label }}</span>
            <el-icon class="category-arrow" :class="{ collapsed: !expandedCategories[category.key] }">
              <ArrowDown />
            </el-icon>
          </div>
          <div v-show="expandedCategories[category.key]" class="category-items">
            <div
              v-for="item in category.items"
              :key="item.type"
              class="widget-item"
              draggable="true"
              @dragstart="handleDragStart($event, item)"
            >
              <el-icon class="widget-icon"><component :is="item.icon" /></el-icon>
              <div class="widget-info">
                <span class="widget-name">{{ item.name }}</span>
                <span class="widget-desc">{{ item.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模板库 -->
      <div v-show="activeTab === 'templates'" class="template-list">
        <div
          v-for="category in templateCategories"
          :key="category.key"
          class="template-category"
        >
          <div class="template-category-title">{{ category.label }}</div>
          <div class="template-grid">
            <div
              v-for="tpl in category.templates"
              :key="tpl.id"
              class="template-card"
              @click="$emit('select-template', tpl.id)"
            >
              <div class="template-thumbnail">
                <el-icon :size="24"><DataBoard /></el-icon>
              </div>
              <span class="template-name">{{ tpl.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import {
  ArrowDown, Odometer, TrendCharts, Histogram, PieChart,
  DataLine, More, Aim, Sort, Grid, Trophy, Loading,
  Calendar, Document, MapLocation, Filter, EditPen, Picture, DataBoard
} from '@element-plus/icons-vue'
import type { WidgetRegistryItem } from '@/views/dashboard/types/dashboard'

defineEmits<{
  'select-template': [templateId: string]
}>()

const activeTab = ref<'components' | 'templates'>('components')

const WIDGET_REGISTRY: WidgetRegistryItem[] = [
  { type: 'number-card', name: '数字卡片', icon: 'Odometer', category: 'chart', description: '展示核心指标数值', defaultW: 6, defaultH: 3, minW: 4, minH: 2 },
  { type: 'line-chart', name: '折线图', icon: 'TrendCharts', category: 'chart', description: '趋势变化分析', defaultW: 12, defaultH: 6, minW: 6, minH: 4 },
  { type: 'bar-chart', name: '柱状图', icon: 'Histogram', category: 'chart', description: '分类数据对比', defaultW: 12, defaultH: 6, minW: 6, minH: 4 },
  { type: 'pie-chart', name: '饼图', icon: 'PieChart', category: 'chart', description: '占比分布', defaultW: 8, defaultH: 6, minW: 6, minH: 5 },
  { type: 'bar-horizontal', name: '条形图', icon: 'DataLine', category: 'chart', description: '横向对比', defaultW: 12, defaultH: 6, minW: 6, minH: 4 },
  { type: 'scatter-chart', name: '散点图', icon: 'More', category: 'chart', description: '相关性分析', defaultW: 12, defaultH: 6, minW: 6, minH: 4 },
  { type: 'radar-chart', name: '雷达图', icon: 'Aim', category: 'chart', description: '多维度评估', defaultW: 8, defaultH: 6, minW: 6, minH: 5 },
  { type: 'funnel-chart', name: '漏斗图', icon: 'Sort', category: 'chart', description: '转化流程', defaultW: 8, defaultH: 6, minW: 6, minH: 5 },
  { type: 'heat-map', name: '热力图', icon: 'Grid', category: 'chart', description: '密度分布', defaultW: 12, defaultH: 6, minW: 8, minH: 5 },
  { type: 'leaderboard', name: '排行榜', icon: 'Trophy', category: 'chart', description: '排名展示', defaultW: 8, defaultH: 6, minW: 6, minH: 4 },
  { type: 'progress-bar', name: '进度条', icon: 'Loading', category: 'chart', description: '目标完成度', defaultW: 6, defaultH: 3, minW: 4, minH: 2 },
  { type: 'gantt-chart', name: '甘特图', icon: 'Calendar', category: 'chart', description: '时间规划', defaultW: 24, defaultH: 8, minW: 12, minH: 6 },
  { type: 'data-table', name: '数据表格', icon: 'Document', category: 'data', description: '明细数据展示', defaultW: 24, defaultH: 8, minW: 12, minH: 4 },
  { type: 'map-chart', name: '地图', icon: 'MapLocation', category: 'chart', description: '地理分布', defaultW: 12, defaultH: 8, minW: 8, minH: 6 },
  { type: 'filter', name: '筛选器', icon: 'Filter', category: 'filter', description: '全局数据筛选', defaultW: 24, defaultH: 2, minW: 8, minH: 2 },
  { type: 'rich-text', name: '富文本', icon: 'EditPen', category: 'widget', description: '自定义文本内容', defaultW: 12, defaultH: 4, minW: 4, minH: 2 },
  { type: 'image', name: '图片', icon: 'Picture', category: 'widget', description: '展示图片', defaultW: 8, defaultH: 5, minW: 4, minH: 3 },
]

const iconMap: Record<string, any> = {
  Odometer, TrendCharts, Histogram, PieChart, DataLine,
  More, Aim, Sort, Grid, Trophy, Loading, Calendar,
  Document, MapLocation, Filter, EditPen, Picture,
}

const componentCategories = computed(() => [
  { key: 'chart', label: '图表类', items: WIDGET_REGISTRY.filter(i => i.category === 'chart') },
  { key: 'data', label: '数据类', items: WIDGET_REGISTRY.filter(i => i.category === 'data') },
  { key: 'filter', label: '筛选器', items: WIDGET_REGISTRY.filter(i => i.category === 'filter') },
  { key: 'widget', label: '小部件', items: WIDGET_REGISTRY.filter(i => i.category === 'widget') },
])

const expandedCategories = reactive<Record<string, boolean>>({
  chart: true,
  data: true,
  filter: true,
  widget: true,
})

function toggleCategory(key: string) {
  expandedCategories[key] = !expandedCategories[key]
}

function handleDragStart(event: DragEvent, item: WidgetRegistryItem) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/x-widget-type', JSON.stringify(item))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const templateCategories = [
  {
    key: 'sales', label: '销售',
    templates: [
      { id: 'sales-overview', name: '销售概览' },
      { id: 'sales-detail', name: '销售明细' },
      { id: 'sales-trend', name: '销售趋势' },
    ],
  },
  {
    key: 'acquisition', label: '获客',
    templates: [
      { id: 'acq-funnel', name: '获客漏斗' },
      { id: 'acq-channel', name: '渠道分析' },
    ],
  },
  {
    key: 'customer', label: '客户',
    templates: [
      { id: 'cust-overview', name: '客户概览' },
      { id: 'cust-lifecycle', name: '客户生命周期' },
    ],
  },
  {
    key: 'finance', label: '财务',
    templates: [
      { id: 'fin-summary', name: '财务汇总' },
      { id: 'fin-cashflow', name: '现金流分析' },
      { id: 'fin-profit', name: '利润分析' },
    ],
  },
  {
    key: 'call-center', label: '呼叫中心',
    templates: [
      { id: 'call-realtime', name: '实时监控' },
      { id: 'call-performance', name: '坐席绩效' },
    ],
  },
]
</script>

<style scoped>
.component-panel {
  width: 240px;
  background: #12121A;
  border-right: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  color: #8B8B9A;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #D4AF37;
  border-bottom-color: #D4AF37;
}

.tab-btn:hover:not(.active) {
  color: #EAEAEA;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.panel-content::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.2);
  border-radius: 2px;
}

.category-section {
  margin-bottom: 4px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.category-name {
  color: #8B8B9A;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-arrow {
  color: #8B8B9A;
  font-size: 12px;
  transition: transform 0.2s ease;
}

.category-arrow.collapsed {
  transform: rotate(-90deg);
}

.category-items {
  padding: 0 8px;
}

.widget-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  margin-bottom: 2px;
}

.widget-item:hover {
  background: rgba(212, 175, 55, 0.08);
}

.widget-item:active {
  cursor: grabbing;
  background: rgba(212, 175, 55, 0.12);
}

.widget-icon {
  color: #D4AF37;
  font-size: 18px;
  flex-shrink: 0;
}

.widget-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.widget-name {
  color: #EAEAEA;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget-desc {
  color: #5A5A6E;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-list {
  padding: 0 12px;
}

.template-category {
  margin-bottom: 16px;
}

.template-category-title {
  color: #8B8B9A;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  padding: 0 4px;
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.05);
}

.template-thumbnail {
  width: 100%;
  aspect-ratio: 16/10;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D4AF37;
}

.template-name {
  color: #EAEAEA;
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
