<template>
  <div ref="chartRef" class="pie-chart"></div>
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

const mockData = [
  { name: '官网', value: 4350 },
  { name: '广告投放', value: 3200 },
  { name: '老客转介', value: 2800 },
  { name: '渠道合作', value: 1900 },
  { name: '其他', value: 1100 }
]

const total = mockData.reduce((sum, d) => sum + d.value, 0)

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
        const p = params as { name: string; value: number; percent: number }
        return `${p.name}<br/>数量: ${p.value.toLocaleString()}<br/>占比: ${p.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      right: 12,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: '#8B8B9A', fontSize: 12 },
      formatter: (name: string) => {
        const item = mockData.find(d => d.name === name)
        const pct = item ? ((item.value / total) * 100).toFixed(1) : '0'
        return `${name}  ${pct}%`
      }
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: total.toLocaleString(),
          fill: '#EAEAEA',
          fontSize: 22,
          fontFamily: "'DIN Alternate', 'Roboto', monospace",
          fontWeight: 700,
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '55%',
        style: {
          text: '总计',
          fill: '#8B8B9A',
          fontSize: 12,
          textAlign: 'center'
        }
      }
    ],
    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['40%', '50%'],
        padAngle: 2,
        data: mockData,
        color: chartColors,
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(212, 175, 55, 0.3)'
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
.pie-chart {
  width: 100%;
  height: 100%;
  min-height: 240px;
}
</style>
