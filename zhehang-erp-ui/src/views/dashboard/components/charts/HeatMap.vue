<template>
  <div ref="chartRef" class="heat-map-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)

function generateHeatData(): number[][] {
  const data: number[][] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      let base = 20
      if (h >= 9 && h <= 18) base = 60
      if (h >= 10 && h <= 12) base = 80
      if (h >= 14 && h <= 16) base = 75
      if (d >= 5) base = Math.round(base * 0.4)
      data.push([d, h, Math.round(base + Math.random() * 20)])
    }
  }
  return data
}

const mockData = generateHeatData()

function buildOption(): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    grid: { top: 20, right: 60, bottom: 40, left: 60 },
    tooltip: {
      backgroundColor: 'rgba(18,18,26,0.95)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      textStyle: { color: '#EAEAEA', fontSize: 12 },
      formatter(params: any) {
        const d = params.data
        return `${days[d[0]]} ${hours[d[1]]}<br/>通话量: ${d[2]}`
      }
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#8B8B9A', fontSize: 11 },
      splitArea: { show: false }
    },
    yAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#8B8B9A', fontSize: 10 },
      splitArea: { show: false }
    },
    visualMap: {
      min: 0,
      max: 100,
      show: true,
      orient: 'vertical',
      right: 0,
      top: 'center',
      itemHeight: 120,
      textStyle: { color: '#8B8B9A', fontSize: 10 },
      inRange: {
        color: ['#12121A', '#1a3a1a', '#D4AF37']
      }
    },
    series: [
      {
        type: 'heatmap',
        data: mockData,
        itemStyle: {
          borderColor: '#0A0A0F',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            borderColor: '#D4AF37',
            borderWidth: 1
          }
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
.heat-map-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
