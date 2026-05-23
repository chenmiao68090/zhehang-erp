<template>
  <div ref="chartRef" class="gantt-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useResizeObserver } from '@vueuse/core'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

interface TaskItem {
  name: string
  start: string
  end: string
  progress: number
}

const mockData: TaskItem[] = [
  { name: '需求分析', start: '2026-05-01', end: '2026-05-08', progress: 100 },
  { name: 'UI设计', start: '2026-05-06', end: '2026-05-15', progress: 85 },
  { name: '前端开发', start: '2026-05-12', end: '2026-05-28', progress: 60 },
  { name: '测试验收', start: '2026-05-25', end: '2026-06-05', progress: 20 },
  { name: '正式上线', start: '2026-06-03', end: '2026-06-10', progress: 0 }
]

const startDate = new Date('2026-05-01').getTime()
const endDate = new Date('2026-06-10').getTime()

function buildOption(): echarts.EChartsOption {
  const categories = mockData.map(t => t.name)

  return {
    backgroundColor: 'transparent',
    grid: { top: 30, right: 40, bottom: 40, left: 100 },
    tooltip: {
      backgroundColor: 'rgba(18,18,26,0.95)',
      borderColor: 'rgba(212,175,55,0.2)',
      borderWidth: 1,
      textStyle: { color: '#EAEAEA', fontSize: 12 },
      formatter(params: any) {
        const task = mockData[params.dataIndex]
        return `${task.name}<br/>开始: ${task.start}<br/>结束: ${task.end}<br/>进度: ${task.progress}%`
      }
    },
    xAxis: {
      type: 'time',
      min: startDate,
      max: endDate,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: {
        color: '#8B8B9A',
        fontSize: 10,
        formatter: '{M}-{d}'
      }
    },
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#8B8B9A', fontSize: 11 }
    },
    series: [
      {
        type: 'custom',
        renderItem(_params: any, api: any) {
          const categoryIndex = api.value(0)
          const startVal = api.coord([api.value(1), categoryIndex])
          const endVal = api.coord([api.value(2), categoryIndex])
          const height = api.size([0, 1])[1] * 0.5
          const progress = api.value(3) as number

          const totalWidth = endVal[0] - startVal[0]
          const progressWidth = totalWidth * (progress / 100)

          const group: any = {
            type: 'group',
            children: [
              {
                type: 'rect',
                shape: {
                  x: startVal[0],
                  y: startVal[1] - height / 2,
                  width: totalWidth,
                  height: height,
                  r: 3
                },
                style: {
                  fill: 'rgba(212,175,55,0.2)'
                }
              },
              {
                type: 'rect',
                shape: {
                  x: startVal[0],
                  y: startVal[1] - height / 2,
                  width: progressWidth,
                  height: height,
                  r: 3
                },
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#D4AF37' },
                    { offset: 1, color: '#F2D06B' }
                  ])
                }
              }
            ]
          }
          return group
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: mockData.map((task, i) => [
          i,
          new Date(task.start).getTime(),
          new Date(task.end).getTime(),
          task.progress
        ])
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
.gantt-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
