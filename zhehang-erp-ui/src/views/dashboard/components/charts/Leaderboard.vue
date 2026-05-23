<template>
  <div class="leaderboard">
    <div
      v-for="(item, index) in mockData"
      :key="item.name"
      class="leaderboard__row"
    >
      <span class="leaderboard__rank" :class="getRankClass(index)">
        {{ index + 1 }}
      </span>
      <span class="leaderboard__name">{{ item.name }}</span>
      <span class="leaderboard__value">{{ item.value.toLocaleString() }}</span>
      <div class="leaderboard__bar-bg">
        <div
          class="leaderboard__bar-fill"
          :style="{ width: getBarWidth(item.value) + '%', backgroundColor: getBarColor(index) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

const mockData = [
  { name: '张明', value: 1285600 },
  { name: '李娜', value: 1120300 },
  { name: '王强', value: 980500 },
  { name: '赵丽', value: 870200 },
  { name: '陈伟', value: 760800 },
  { name: '刘芳', value: 650400 },
  { name: '周杰', value: 540100 },
  { name: '吴磊', value: 430700 }
]

const maxValue = Math.max(...mockData.map(d => d.value))

const rankColors = ['#D4AF37', '#C0C0C0', '#CD7F32']

function getRankClass(index: number) {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

function getBarColor(index: number) {
  return rankColors[index] || 'rgba(255,255,255,0.2)'
}

function getBarWidth(value: number) {
  return (value / maxValue) * 100
}
</script>

<style scoped>
.leaderboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  overflow-y: auto;
}

.leaderboard__row {
  display: grid;
  grid-template-columns: 28px 1fr auto 100px;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}

.leaderboard__rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-family: 'DIN Alternate', 'Roboto', monospace;
  color: #8B8B9A;
  font-weight: 600;
}

.leaderboard__rank.gold {
  background: #D4AF37;
  color: #0A0A0F;
  border-radius: 50%;
}

.leaderboard__rank.silver {
  background: #C0C0C0;
  color: #0A0A0F;
  border-radius: 50%;
}

.leaderboard__rank.bronze {
  background: #CD7F32;
  color: #0A0A0F;
  border-radius: 50%;
}

.leaderboard__name {
  font-size: 13px;
  color: #EAEAEA;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leaderboard__value {
  font-size: 14px;
  font-family: 'DIN Alternate', 'Roboto', monospace;
  color: #EAEAEA;
  font-weight: 600;
  text-align: right;
}

.leaderboard__bar-bg {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.leaderboard__bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}
</style>
