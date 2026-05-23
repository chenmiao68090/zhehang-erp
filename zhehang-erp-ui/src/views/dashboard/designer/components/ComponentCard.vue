<template>
  <div
    class="component-card"
    :class="{ selected }"
    @click.stop="$emit('select')"
  >
    <div class="card-header">
      <span class="card-title">{{ widget.title }}</span>
      <div class="card-actions">
        <button class="action-btn" @click.stop="$emit('configure')" title="配置">
          <el-icon :size="14"><Setting /></el-icon>
        </button>
        <button class="action-btn danger" @click.stop="$emit('remove')" title="删除">
          <el-icon :size="14"><Delete /></el-icon>
        </button>
      </div>
    </div>
    <div class="card-content">
      <div class="widget-placeholder">
        <el-icon :size="28" class="placeholder-icon"><component :is="iconMap[widget.type]" /></el-icon>
        <span class="placeholder-text">{{ widget.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Setting, Delete, Odometer, TrendCharts, Histogram, PieChart, DataLine, More, Aim, Sort, Grid as GridIcon, Trophy, Loading, Calendar, Document, MapLocation, Filter, EditPen, Picture } from '@element-plus/icons-vue'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{
  widget: WidgetConfig
  selected: boolean
}>()

defineEmits<{
  select: []
  remove: []
  configure: []
}>()

const iconMap: Record<string, any> = {
  'number-card': Odometer,
  'line-chart': TrendCharts,
  'bar-chart': Histogram,
  'pie-chart': PieChart,
  'bar-horizontal': DataLine,
  'scatter-chart': More,
  'radar-chart': Aim,
  'funnel-chart': Sort,
  'heat-map': GridIcon,
  'leaderboard': Trophy,
  'progress-bar': Loading,
  'gantt-chart': Calendar,
  'data-table': Document,
  'map-chart': MapLocation,
  'filter': Filter,
  'rich-text': EditPen,
  'image': Picture,
}
</script>

<style scoped>
.component-card {
  width: 100%;
  height: 100%;
  background: #12121A;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
}

.component-card:hover {
  border-color: rgba(212, 175, 55, 0.3);
}

.component-card.selected {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.15), 0 4px 20px rgba(0, 0, 0, 0.3);
}

.card-header {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.08);
  flex-shrink: 0;
}

.card-title {
  color: #EAEAEA;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.component-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #8B8B9A;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.action-btn.danger:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.card-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  overflow: hidden;
}

.widget-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.placeholder-icon {
  color: rgba(212, 175, 55, 0.4);
}

.placeholder-text {
  color: #5A5A6E;
  font-size: 11px;
}
</style>
