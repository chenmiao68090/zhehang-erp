<template>
  <div class="progress-bar-widget">
    <div v-for="(item, index) in mockData" :key="index" class="progress-item">
      <div class="progress-header">
        <span class="progress-label">{{ item.label }}</span>
        <span class="progress-value">{{ item.value }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{
            width: item.value + '%',
            background: getGradient(index)
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const chartColors = ['#D4AF37', '#00D084', '#5B8DEF', '#FF9F43', '#8B7BFF', '#FF6B6B', '#4ECDC4', '#C9B037']

const mockData = [
  { label: '月度目标', value: 75 },
  { label: '季度目标', value: 60 },
  { label: '年度目标', value: 45 },
  { label: '团队目标', value: 82 }
]

function getGradient(index: number): string {
  const color = chartColors[index % chartColors.length]
  return `linear-gradient(90deg, ${color}99, ${color})`
}
</script>

<style scoped>
.progress-bar-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 16px 20px;
  box-sizing: border-box;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 13px;
  color: #EAEAEA;
}

.progress-value {
  font-size: 14px;
  font-family: 'DIN Alternate', 'Roboto', monospace;
  font-weight: 600;
  color: #EAEAEA;
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1.2s ease;
}
</style>
