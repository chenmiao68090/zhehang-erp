<template>
  <div class="metric-grid" :class="`columns-${Math.min(items.length, 5)}`">
    <div v-for="item in items" :key="item.label" class="metric-item" :class="`tone-${item.tone || 'neutral'}`">
      <span class="metric-label">{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
      <small>{{ item.hint }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface MetricItem {
  label: string
  value: string | number
  hint: string
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'
}

defineProps<{ items: MetricItem[] }>()
</script>

<style scoped lang="scss">
.metric-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border: 1px solid #dce3ec;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.metric-item {
  min-width: 0;
  min-height: 112px;
  padding: 18px 20px;
  border-right: 1px solid #e6ebf1;
  border-top: 3px solid #aab5c3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:last-child { border-right: 0; }
  &.tone-primary { border-top-color: #2563eb; }
  &.tone-success { border-top-color: #16805c; }
  &.tone-warning { border-top-color: #c57a11; }
  &.tone-danger { border-top-color: #c2413a; }

  strong {
    color: #172033;
    font-size: 25px;
    line-height: 1.2;
    font-weight: 700;
  }

  small {
    min-height: 18px;
    color: #768399;
    font-size: 12px;
    line-height: 1.5;
  }
}

.metric-label {
  color: #58677e;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 1180px) {
  .metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .metric-item:nth-child(3n) { border-right: 0; }
}

@media (max-width: 680px) {
  .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric-item {
    min-height: 98px;
    padding: 14px;
    border-right: 1px solid #e6ebf1;
  }
  .metric-item:nth-child(2n) { border-right: 0; }
  .metric-item:last-child:nth-child(odd) { grid-column: 1 / -1; border-right: 0; }
  .metric-item strong { font-size: 21px; }
}
</style>
