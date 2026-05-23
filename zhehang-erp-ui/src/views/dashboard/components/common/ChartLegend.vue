<template>
  <div class="chart-legend" :class="`chart-legend--${direction}`">
    <div
      v-for="item in items"
      :key="item.name"
      class="legend-item"
      :class="{ 'legend-item--disabled': disabledSet.has(item.name) }"
      @click="handleToggle(item.name)"
    >
      <span
        class="legend-dot"
        :style="{ backgroundColor: item.color }"
      ></span>
      <span class="legend-label">{{ item.name }}</span>
      <span v-if="item.value !== undefined" class="legend-value">{{ item.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface LegendItem {
  name: string
  color: string
  value?: string | number
}

interface Props {
  items: LegendItem[]
  direction?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
})

const emit = defineEmits<{
  toggle: [name: string]
}>()

const disabledSet = ref<Set<string>>(new Set())

function handleToggle(name: string) {
  if (disabledSet.value.has(name)) {
    disabledSet.value.delete(name)
  } else {
    disabledSet.value.add(name)
  }
  emit('toggle', name)
}
</script>

<style scoped>
.chart-legend {
  display: flex;
  gap: 16px;
}

.chart-legend--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.chart-legend--vertical {
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
  user-select: none;
}

.legend-item--disabled {
  opacity: 0.3;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 12px;
  color: #8B8B9A;
  white-space: nowrap;
}

.legend-value {
  font-size: 12px;
  color: #EAEAEA;
  font-weight: 500;
  margin-left: 4px;
}
</style>
