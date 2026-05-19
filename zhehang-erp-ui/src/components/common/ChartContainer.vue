<template>
  <div class="chart-container" :style="{ height: height }">
    <div class="chart-header" v-if="title">
      <h4>{{ title }}</h4>
      <slot name="extra" />
    </div>
    <div ref="chartRef" class="chart-body" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

interface Props {
  title?: string
  height?: string
  option: any
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px'
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(props.option)
}

function resize() {
  chartInstance?.resize()
}

watch(() => props.option, (newOpt) => {
  chartInstance?.setOption(newOpt, true)
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  chartInstance?.dispose()
})

defineExpose({ chartInstance, resize })
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .chart-body {
    flex: 1;
    width: 100%;
    min-height: 0;
  }
}
</style>
