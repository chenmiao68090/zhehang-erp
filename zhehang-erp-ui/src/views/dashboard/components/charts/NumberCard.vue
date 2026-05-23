<template>
  <div class="number-card">
    <div class="number-card__label">{{ config.title || '指标' }}</div>
    <div class="number-card__main">
      <span class="number-card__value">{{ formattedValue }}</span>
      <span class="number-card__unit">{{ mockData.unit }}</span>
      <span class="number-card__arrow" :class="mockData.trend >= 0 ? 'up' : 'down'">
        {{ mockData.trend >= 0 ? '↑' : '↓' }}
      </span>
    </div>
    <div class="number-card__footer">
      <span class="number-card__trend" :class="mockData.trend >= 0 ? 'up' : 'down'">
        同比 {{ mockData.trend >= 0 ? '+' : '' }}{{ mockData.trend }}%
      </span>
      <svg class="number-card__sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline :points="sparklinePoints" fill="none" stroke="#D4AF37" stroke-width="1.5" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const mockData = { value: 128560, unit: '元', trend: 12.5, sparkline: [65, 70, 68, 72, 75, 80, 85] }

const formattedValue = computed(() => {
  return mockData.value.toLocaleString()
})

const sparklinePoints = computed(() => {
  const data = mockData.sparkline
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = 100 / (data.length - 1)
  return data.map((v, i) => `${i * step},${30 - ((v - min) / range) * 26}`).join(' ')
})
</script>

<style scoped>
.number-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to top right, rgba(212, 175, 55, 0.03), transparent);
}

.number-card__label {
  font-size: 14px;
  color: #8B8B9A;
  margin-bottom: 12px;
}

.number-card__main {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 16px;
}

.number-card__value {
  font-size: 36px;
  font-family: 'DIN Alternate', 'Roboto', monospace;
  color: #EAEAEA;
  font-weight: 700;
  line-height: 1;
}

.number-card__unit {
  font-size: 14px;
  color: #8B8B9A;
}

.number-card__arrow {
  font-size: 18px;
  margin-left: 4px;
}

.number-card__arrow.up {
  color: #00D084;
}

.number-card__arrow.down {
  color: #FF6B6B;
}

.number-card__footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.number-card__trend {
  font-size: 12px;
}

.number-card__trend.up {
  color: #00D084;
}

.number-card__trend.down {
  color: #FF6B6B;
}

.number-card__sparkline {
  width: 80px;
  height: 24px;
}
</style>
