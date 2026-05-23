<template>
  <div ref="chartRef" class="radar-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const mockIndicators = [
  { name: '获客能力', max: 100 },
  { name: '转化率', max: 100 },
  { name: '客单价', max: 100 },
  { name: '复购率', max: 100 },
  { name: '满意度', max: 100 }
]

const mockData = [
  { name: '本季度', values: [85, 72, 68, 55, 90] },
  { name: '上季度', values: [70, 65, 72, 60, 78] }
]

const seriesColors = ['#D4AF37', '#5B8DEF']

function buildOption(): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(18,18,26,0.95)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      textStyle: { color: '#EAEAEA', fontSize: 12 }
    },
    legend: {
      bottom: 8,
      textStyle: { color: '#8B8B9A', fontSize: 12 },
      data: mockData.map(d => d.name)
    },
    radar: {
      indicator: mockIndicators,
      shape: 'polygon',
      splitNumber: 4,
      center: ['50%', '48%'],
      radius: '65%',
      axisName: {
        color: '#8B8B9A',
        fontSize: 11
      },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(212,175,55,0.02)',
            'rgba(212,175,55,0.05)',
            'rgba(212,175,55,0.02)',
            'rgba(212,175,55,0.05)'
          ]
        }
      },
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.06)' }
      },
      axisLine: {
        lineStyle: { color: 'rgba(255,255,255,0.08)' }
      }
    },
    series: [
      {
        type: 'radar',
        data: mockData.map((d, i) => ({
          name: d.name,
          value: d.values,
          lineStyle: { color: seriesColors[i], width: 2 },
          itemStyle: { color: seriesColors[i] },
          areaStyle: {
            color: echarts.color.modifyAlpha(seriesColors[i], 0.15)
          }
        }))
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
.radar-chart {
  width: 100%;
  height: 100%;
  min-height: 260px;
}
</style>
