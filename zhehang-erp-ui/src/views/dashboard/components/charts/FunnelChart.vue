<template>
  <div ref="chartRef" class="funnel-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const chartColors = ['#D4AF37', '#00D084', '#5B8DEF', '#FF9F43', '#8B7BFF']

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const mockData = [
  { name: '线索', value: 5200 },
  { name: '商机', value: 3800 },
  { name: '报价', value: 2400 },
  { name: '谈判', value: 1500 },
  { name: '成交', value: 860 }
]

function buildOption(): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(18,18,26,0.95)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      textStyle: { color: '#EAEAEA', fontSize: 12 },
      formatter: (params: any) => {
        const p = params as { name: string; value: number }
        return `${p.name}: ${p.value.toLocaleString()}`
      }
    },
    series: [
      {
        type: 'funnel',
        left: '15%',
        right: '15%',
        top: 20,
        bottom: 20,
        sort: 'descending',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          color: '#EAEAEA',
          fontSize: 13,
          formatter: '{b}\n{c}'
        },
        itemStyle: {
          borderWidth: 0
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 12,
            shadowColor: 'rgba(212, 175, 55, 0.3)'
          }
        },
        data: mockData.map((d, i) => ({
          ...d,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: echarts.color.modifyAlpha(chartColors[i], 0.7) },
              { offset: 1, color: chartColors[i] }
            ])
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
.funnel-chart {
  width: 100%;
  height: 100%;
  min-height: 240px;
}
</style>
