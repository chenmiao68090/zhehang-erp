<template>
  <div class="divider-widget" :class="[`divider--${direction}`, `divider--${lineStyle}`]">
    <template v-if="direction === 'horizontal'">
      <span v-if="config.title" class="divider__line divider__line--left"></span>
      <span v-if="config.title" class="divider__text">{{ config.title }}</span>
      <span v-if="config.title" class="divider__line divider__line--right"></span>
      <span v-if="!config.title" class="divider__line divider__line--full"></span>
    </template>
    <template v-else>
      <span class="divider__line divider__line--vertical"></span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

interface Props {
  config: WidgetConfig
}

const props = defineProps<Props>()

const direction = computed(() => props.config.options?.direction || 'horizontal')
const lineStyle = computed(() => props.config.options?.lineStyle || 'gradient')
</script>

<style scoped>
.divider-widget {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* Horizontal */
.divider--horizontal {
  flex-direction: row;
  padding: 0 8px;
}

.divider__line {
  flex: 1;
  height: 1px;
}

.divider__line--full {
  width: 100%;
  height: 1px;
}

.divider__line--left,
.divider__line--right,
.divider__line--full {
  flex: 1;
}

/* Gradient style (default) */
.divider--gradient .divider__line--full {
  background: linear-gradient(90deg, transparent, #D4AF37 50%, transparent);
}

.divider--gradient .divider__line--left {
  background: linear-gradient(90deg, transparent, #D4AF37);
}

.divider--gradient .divider__line--right {
  background: linear-gradient(90deg, #D4AF37, transparent);
}

/* Solid style */
.divider--solid .divider__line--full,
.divider--solid .divider__line--left,
.divider--solid .divider__line--right {
  background: #D4AF37;
}

/* Dashed style */
.divider--dashed .divider__line--full,
.divider--dashed .divider__line--left,
.divider--dashed .divider__line--right {
  background: transparent;
  border-top: 1px dashed rgba(212, 175, 55, 0.5);
  height: 0;
}

/* Text */
.divider__text {
  flex-shrink: 0;
  padding: 0 12px;
  font-size: 12px;
  color: #8B8B9A;
  white-space: nowrap;
}

/* Vertical */
.divider--vertical {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: auto;
  height: 100%;
  padding: 8px 0;
}

.divider__line--vertical {
  width: 1px;
  height: 100%;
}

.divider--gradient .divider__line--vertical {
  background: linear-gradient(180deg, transparent, #D4AF37 50%, transparent);
}

.divider--solid .divider__line--vertical {
  background: #D4AF37;
}

.divider--dashed .divider__line--vertical {
  background: transparent;
  border-left: 1px dashed rgba(212, 175, 55, 0.5);
  width: 0;
}
</style>
