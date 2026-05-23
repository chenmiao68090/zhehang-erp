<template>
  <div ref="chartRef" class="scatter-chart"></div>
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

function generateScatterData(count: number): number[][] {
  const data: number[][] = []
  for (let i = 0; i < count; i++) {
    data.push([
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 80 + 20)
    ])
  }
  return data
}

const mockData = [
  { name: 'A类客户', data: generateScatterData(10) },
  { name: 'B类客户', data: generateScatterData(10) },
  { name: 'C类客户', data: generateScatterData(10) }
]

function buildOption(): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    grid: { top: 40, right: 20, bottom: 40, left: 60 },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(18,18,26,0.95)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      textStyle: { color: '#EAEAEA', fontSize: 12 },
      formatter(params: any) {
        const d = params.data
        return `${params.seriesName}<br/>转化率: ${d[0]}%<br/>满意度: ${d[1]}%<br/>交易额: ${d[2]}万`
      }
    },
    legend: {
      top: 8,
      right: 12,
      textStyle: { color: '#8B8B9A', fontSize: 12 }
    },
    xAxis: {
      type: 'value',
      name: '转化率(%)',
      nameTextStyle: { color: '#8B8B9A', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#8B8B9A', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '满意度(%)',
      nameTextStyle: { color: '#8B8B9A', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#8B8B9A', fontSize: 11 }
    },
    series: mockData.map((s, i) => ({
      name: s.name,
      type: 'scatter' as const,
      data: s.data,
      symbolSize(val: number[]) {
        return Math.max(10, Math.min(40, val[2] / 2.5))
      },
      itemStyle: {
        color: chartColors[i],
        opacity: 0.8
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
.scatter-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
