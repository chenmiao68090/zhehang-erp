<template>
  <div ref="chartRef" class="line-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const chartColors = ['#D4AF37', '#00D084', '#5B8DEF', '#FF9F43', '#8B7BFF', '#FF6B6B', '#4ECDC4', '#C9B037']

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const mockData = {
  categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    { name: '营收', data: [420, 530, 480, 620, 710, 830] },
    { name: '成本', data: [280, 320, 310, 380, 420, 460] }
  ]
}

function buildOption(): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    grid: { top: 40, right: 20, bottom: 40, left: 60 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(18,18,26,0.95)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      textStyle: { color: '#EAEAEA', fontSize: 12 }
    },
    legend: {
      top: 8,
      right: 12,
      textStyle: { color: '#8B8B9A', fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: mockData.categories,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: '#8B8B9A', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#8B8B9A', fontSize: 11 }
    },
    series: mockData.series.map((s, i) => ({
      name: s.name,
      type: 'line' as const,
      data: s.data,
      smooth: true,
      lineStyle: { width: 2, color: chartColors[i] },
      itemStyle: { color: chartColors[i] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: echarts.color.modifyAlpha(chartColors[i], 0.2) },
          { offset: 1, color: echarts.color.modifyAlpha(chartColors[i], 0) }
        ])
      },
      symbol: 'circle',
      symbolSize: 6
    }))
  }
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(buildOption())
  }
})

useResizeObserver(chartRef, () => {
  chartInstance?.resize()
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
