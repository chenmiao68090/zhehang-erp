<template>
  <div
    class="canvas-container"
    @drop="handleDrop"
    @dragover.prevent
    @dragenter.prevent
    @click.self="$emit('select-widget', null)"
  >
    <div v-if="widgets.length === 0" class="canvas-empty">
      <el-icon :size="48" class="empty-icon"><Plus /></el-icon>
      <p class="empty-title">从左侧拖拽组件到画布</p>
      <p class="empty-desc">或选择模板快速开始</p>
    </div>

    <grid-layout
      v-else
      v-model:layout="layoutData"
      :col-num="24"
      :row-height="40"
      :margin="[16, 16]"
      :is-draggable="true"
      :is-resizable="true"
      :vertical-compact="true"
      :use-css-transforms="true"
      @layout-updated="handleLayoutUpdated"
    >
      <grid-item
        v-for="item in layoutData"
        :key="item.i"
        :i="item.i"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :min-w="item.minW"
        :min-h="item.minH"
        @click.stop="selectWidget(item.i)"
      >
        <ComponentCard
          :widget="getWidgetById(item.i)!"
          :selected="item.i === selectedWidgetId"
          @select="selectWidget(item.i)"
          @remove="$emit('remove-widget', item.i)"
          @configure="selectWidget(item.i)"
        />
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout-v3'
import { Plus } from '@element-plus/icons-vue'
import type { WidgetConfig, WidgetRegistryItem } from '@/views/dashboard/types/dashboard'
import { useGridLayout } from '@/views/dashboard/designer/composables/useGridLayout'
import ComponentCard from './ComponentCard.vue'

interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

const props = defineProps<{
  widgets: WidgetConfig[]
  selectedWidgetId: string
}>()

const emit = defineEmits<{
  'update:widgets': [widgets: WidgetConfig[]]
  'select-widget': [widget: WidgetConfig | null]
  'add-widget': [widget: WidgetConfig]
  'remove-widget': [widgetId: string]
}>()

const { findAvailablePosition } = useGridLayout()

const layoutData = ref<LayoutItem[]>([])

watch(
  () => props.widgets,
  (widgets) => {
    layoutData.value = widgets.map((w) => ({
      i: w.id,
      x: w.layout.x,
      y: w.layout.y,
      w: w.layout.w,
      h: w.layout.h,
      minW: w.layout.minW,
      minH: w.layout.minH,
    }))
  },
  { immediate: true, deep: true }
)

function getWidgetById(id: string): WidgetConfig | undefined {
  return props.widgets.find((w) => w.id === id)
}

function selectWidget(id: string) {
  const widget = getWidgetById(id)
  emit('select-widget', widget ?? null)
}

function handleLayoutUpdated(newLayout: LayoutItem[]) {
  const updated = props.widgets.map((w) => {
    const layoutItem = newLayout.find((l) => l.i === w.id)
    if (layoutItem) {
      return {
        ...w,
        layout: {
          ...w.layout,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        },
      }
    }
    return w
  })
  emit('update:widgets', updated)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const data = event.dataTransfer?.getData('application/x-widget-type')
  if (!data) return

  const registryItem: WidgetRegistryItem = JSON.parse(data)
  const position = findAvailablePosition(props.widgets, registryItem.defaultW, registryItem.defaultH)

  const newWidget: WidgetConfig = {
    id: `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: registryItem.type,
    title: registryItem.name,
    dataSourceId: '',
    filters: [],
    dimensions: [],
    metrics: [],
    layout: {
      x: position.x,
      y: position.y,
      w: registryItem.defaultW,
      h: registryItem.defaultH,
      minW: registryItem.minW,
      minH: registryItem.minH,
    },
    style: {
      showTitle: true,
      borderRadius: 12,
      padding: 16,
    },
    options: {},
  }

  emit('add-widget', newWidget)
}
</script>

<style scoped>
.canvas-container {
  flex: 1;
  background: #0A0A0F;
  overflow: auto;
  padding: 24px;
  position: relative;
}

.canvas-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.canvas-container::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.2);
  border-radius: 3px;
}

.canvas-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  user-select: none;
}

.empty-icon {
  color: rgba(212, 175, 55, 0.3);
  margin-bottom: 16px;
}

.empty-title {
  color: #8B8B9A;
  font-size: 16px;
  margin: 0 0 8px;
}

.empty-desc {
  color: #5A5A6E;
  font-size: 13px;
  margin: 0;
}

:deep(.vue-grid-item) {
  transition: all 0.2s ease;
}

:deep(.vue-grid-item.vue-grid-placeholder) {
  background: rgba(212, 175, 55, 0.1) !important;
  border: 2px dashed rgba(212, 175, 55, 0.4) !important;
  border-radius: 12px;
}

:deep(.vue-grid-item > .vue-resizable-handle) {
  background: none;
  width: 16px;
  height: 16px;
  bottom: 4px;
  right: 4px;
}

:deep(.vue-grid-item > .vue-resizable-handle::after) {
  content: '';
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(212, 175, 55, 0.4);
  border-bottom: 2px solid rgba(212, 175, 55, 0.4);
}
</style>
