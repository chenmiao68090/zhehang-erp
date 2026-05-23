import type { Component } from 'vue'
import type { WidgetType } from '@/views/dashboard/types/dashboard'

import NumberCard from './NumberCard.vue'
import LineChart from './LineChart.vue'
import BarChart from './BarChart.vue'
import PieChart from './PieChart.vue'
import BarHorizontalChart from './BarHorizontalChart.vue'
import ScatterChart from './ScatterChart.vue'
import RadarChart from './RadarChart.vue'
import FunnelChart from './FunnelChart.vue'
import HeatMap from './HeatMap.vue'
import Leaderboard from './Leaderboard.vue'
import ProgressBar from './ProgressBar.vue'
import GanttChart from './GanttChart.vue'
import DataTable from './DataTable.vue'
import MapChart from './MapChart.vue'

export const chartComponentMap: Record<string, Component> = {
  'number-card': NumberCard,
  'line-chart': LineChart,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  'bar-horizontal': BarHorizontalChart,
  'scatter-chart': ScatterChart,
  'radar-chart': RadarChart,
  'funnel-chart': FunnelChart,
  'heat-map': HeatMap,
  'leaderboard': Leaderboard,
  'progress-bar': ProgressBar,
  'gantt-chart': GanttChart,
  'data-table': DataTable,
  'map-chart': MapChart,
}

export function getChartComponent(type: WidgetType): Component | undefined {
  return chartComponentMap[type]
}
