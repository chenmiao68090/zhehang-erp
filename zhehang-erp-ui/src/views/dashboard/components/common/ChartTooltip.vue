<template>
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div
        v-show="visible"
        class="chart-tooltip"
        :class="`chart-tooltip--${placement}`"
        :style="tooltipStyle"
      >
        <div class="chart-tooltip__content">
          <slot></slot>
        </div>
        <div class="chart-tooltip__arrow"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  x: number
  y: number
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
})

const tooltipStyle = computed(() => {
  const offset = 10
  let left = props.x
  let top = props.y

  switch (props.placement) {
    case 'top':
      top = props.y - offset
      return { left: `${left}px`, top: `${top}px`, transform: 'translate(-50%, -100%)' }
    case 'bottom':
      top = props.y + offset
      return { left: `${left}px`, top: `${top}px`, transform: 'translate(-50%, 0)' }
    case 'left':
      left = props.x - offset
      return { left: `${left}px`, top: `${top}px`, transform: 'translate(-100%, -50%)' }
    case 'right':
      left = props.x + offset
      return { left: `${left}px`, top: `${top}px`, transform: 'translate(0, -50%)' }
    default:
      return { left: `${left}px`, top: `${top}px`, transform: 'translate(-50%, -100%)' }
  }
})
</script>

<style scoped>
.chart-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  max-width: 300px;
}

.chart-tooltip__content {
  background: rgba(18, 18, 26, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #EAEAEA;
  line-height: 1.5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}

.chart-tooltip__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(18, 18, 26, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.2);
  transform: rotate(45deg);
}

/* Arrow placement */
.chart-tooltip--top .chart-tooltip__arrow {
  bottom: -5px;
  left: 50%;
  margin-left: -4px;
  border-top: none;
  border-left: none;
}

.chart-tooltip--bottom .chart-tooltip__arrow {
  top: -5px;
  left: 50%;
  margin-left: -4px;
  border-bottom: none;
  border-right: none;
}

.chart-tooltip--left .chart-tooltip__arrow {
  right: -5px;
  top: 50%;
  margin-top: -4px;
  border-bottom: none;
  border-left: none;
}

.chart-tooltip--right .chart-tooltip__arrow {
  left: -5px;
  top: 50%;
  margin-top: -4px;
  border-top: none;
  border-right: none;
}

/* Transition */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
