<template>
  <div ref="chartRef" class="bar-horizontal-chart"></div>
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
  categories: ['市场部', '销售部', '研发部', '运营部', '客服部', '财务部', '人事部', '产品部'],
  values: [1280, 1120, 980, 870, 760, 650, 540, 480]
}

function buildOption(): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    grid: { top: 20, right: 60, bottom: 20, left: 100 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(18,18,26,0.95)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      textStyle: { color: '#EAEAEA', fontSize: 12 }
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#8B8B9A', fontSize: 11 }
    },
    yAxis: {
      type: 'category',
      data: mockData.categories,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#8B8B9A', fontSize: 11 }
    },
    series: [
      {
        type: 'bar',
        data: mockData.values,
        barMaxWidth: 20,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(212,175,55,0.6)' },
            { offset: 1, color: chartColors[0] }
          ])
        },
        label: {
          show: true,
          position: 'right',
          color: '#EAEAEA',
          fontSize: 11,
          fontFamily: "'DIN Alternate', 'Roboto', monospace"
        }
      }
    ]
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
.bar-horizontal-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
