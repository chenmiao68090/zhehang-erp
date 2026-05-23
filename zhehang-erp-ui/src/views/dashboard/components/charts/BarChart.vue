<template>
  <div ref="chartRef" class="bar-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

const props = defineProps<{ config: WidgetConfig }>()

const chartColors = ['#D4AF37', '#00D084', '#5B8DEF', '#FF9F43', '#8B7BFF', '#FF6B6B', '#4ECDC4', '#C9B037']

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const mockData = {
  categories: ['华东', '华南', '华北', '华中', '西南', '西北', '东北'],
  series: [
    { name: '2024年', data: [320, 280, 250, 210, 190, 150, 120] },
    { name: '2025年', data: [380, 340, 290, 260, 230, 180, 160] }
  ]
}

function buildOption(): echarts.EChartsOption {
  const isStacked = props.config.options?.stacked === true
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
      type: 'bar' as const,
      data: s.data,
      stack: isStacked ? 'total' : undefined,
      barMaxWidth: 24,
      itemStyle: {
        borderRadius: [4, 4, 0, 0] as [number, number, number, number],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: chartColors[i] },
          { offset: 1, color: echarts.color.modifyAlpha(chartColors[i], 0.4) }
        ])
      }
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
.bar-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
