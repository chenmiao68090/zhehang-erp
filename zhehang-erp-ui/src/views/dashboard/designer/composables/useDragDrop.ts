import { ref, shallowRef } from 'vue'
import type { WidgetType } from '@/views/dashboard/types/dashboard'
import type { UseGridLayoutReturn } from './useGridLayout'

export interface DropPosition {
  x: number
  y: number
  pixelLeft: number
  pixelTop: number
}

/**
 * 拖拽逻辑 composable，支持组件面板 → 画布的 HTML5 拖放
 */
export function useDragDrop(gridLayout: UseGridLayoutReturn) {
  const isDragging = ref(false)
  const draggedWidget = shallowRef<WidgetType | null>(null)
  const dropPosition = ref<DropPosition | null>(null)

  /**
   * 从组件面板开始拖拽
   */
  function startDrag(widgetType: WidgetType, event: DragEvent): void {
    isDragging.value = true
    draggedWidget.value = widgetType
    dropPosition.value = null

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData('application/x-widget-type', widgetType)
      event.dataTransfer.setData('text/plain', widgetType)
    }
  }

  /**
   * 计算放置预览位置
   */
  function onDragOver(event: DragEvent): void {
    if (!isDragging.value && !event.dataTransfer?.types.includes('application/x-widget-type')) {
      return
    }
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }

    const container = gridLayout.containerRef.value
    if (!container) return

    const rect = container.getBoundingClientRect()
    const offsetX = event.clientX - rect.left
    const offsetY = event.clientY - rect.top

    const width = gridLayout.containerWidth.value
    const snapped = gridLayout.snapToGrid(offsetX, offsetY, width)

    const colWidth = gridLayout.getColumnWidth(width)
    const pixelLeft = snapped.x * (colWidth + 16) + 16
    const pixelTop = snapped.y * (40 + 16) + 16

    dropPosition.value = {
      x: snapped.x,
      y: snapped.y,
      pixelLeft,
      pixelTop,
    }
  }

  /**
   * 完成放置
   */
  function onDrop(event: DragEvent): {
    widgetType: WidgetType
    x: number
    y: number
  } | null {
    event.preventDefault()
    const widgetType =
      (event.dataTransfer?.getData('application/x-widget-type') as WidgetType) ||
      draggedWidget.value
    const pos = dropPosition.value

    cancelDrag()

    if (!widgetType || !pos) {
      return null
    }
    return {
      widgetType,
      x: pos.x,
      y: pos.y,
    }
  }

  /**
   * 取消拖拽
   */
  function cancelDrag(): void {
    isDragging.value = false
    draggedWidget.value = null
    dropPosition.value = null
  }

  return {
    isDragging,
    draggedWidget,
    dropPosition,
    startDrag,
    onDragOver,
    onDrop,
    cancelDrag,
  }
}

export type UseDragDropReturn = ReturnType<typeof useDragDrop>
