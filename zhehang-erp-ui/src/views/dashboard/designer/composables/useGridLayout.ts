import { ref, computed, type Ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { WidgetConfig, WidgetLayout } from '@/views/dashboard/types/dashboard'

// === 栅格常量 ===
export const GRID_COLUMNS = 24
export const ROW_HEIGHT = 40
export const GAP = 16

export interface GridConfig {
  columns: number
  rowHeight: number
  gap: number
}

export interface PixelPosition {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 24列栅格布局管理 composable
 */
export function useGridLayout() {
  const containerRef = ref<HTMLElement | null>(null)
  const { width: containerWidth } = useElementSize(containerRef)

  const gridConfig = computed<GridConfig>(() => ({
    columns: GRID_COLUMNS,
    rowHeight: ROW_HEIGHT,
    gap: GAP,
  }))

  /**
   * 计算单列宽度
   */
  function getColumnWidth(width: number): number {
    if (width <= 0) return 0
    // 总间距 = (columns + 1) * gap (左右两侧 + 列间)
    const totalGap = (GRID_COLUMNS + 1) * GAP
    return (width - totalGap) / GRID_COLUMNS
  }

  /**
   * 将栅格坐标转为像素位置
   */
  function calculatePosition(layout: WidgetLayout, width: number): PixelPosition {
    const colWidth = getColumnWidth(width)
    const left = GAP + layout.x * (colWidth + GAP)
    const top = GAP + layout.y * (ROW_HEIGHT + GAP)
    const widgetWidth = layout.w * colWidth + (layout.w - 1) * GAP
    const widgetHeight = layout.h * ROW_HEIGHT + (layout.h - 1) * GAP
    return {
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.max(0, widgetWidth),
      height: Math.max(0, widgetHeight),
    }
  }

  /**
   * 检测两个 layout 是否重叠
   */
  function isOverlap(a: WidgetLayout, b: WidgetLayout): boolean {
    return !(
      a.x + a.w <= b.x ||
      b.x + b.w <= a.x ||
      a.y + a.h <= b.y ||
      b.y + b.h <= a.y
    )
  }

  /**
   * 查找可放置位置（自上而下、自左而右扫描）
   */
  function findAvailablePosition(
    existingWidgets: WidgetConfig[],
    newW: number,
    newH: number
  ): { x: number; y: number } {
    const w = Math.min(newW, GRID_COLUMNS)
    const layouts = existingWidgets.map((it) => it.layout)
    const maxY =
      layouts.reduce((acc, l) => Math.max(acc, l.y + l.h), 0) + newH
    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x <= GRID_COLUMNS - w; x++) {
        const candidate: WidgetLayout = { x, y, w, h: newH }
        const collide = layouts.some((l) => isOverlap(candidate, l))
        if (!collide) {
          return { x, y }
        }
      }
    }
    return { x: 0, y: maxY }
  }

  /**
   * 吸附到最近的栅格线
   */
  function snapToGrid(
    x: number,
    y: number,
    width: number
  ): { x: number; y: number } {
    const colWidth = getColumnWidth(width)
    const unitX = colWidth + GAP
    const unitY = ROW_HEIGHT + GAP
    const gridX = Math.round((x - GAP) / unitX)
    const gridY = Math.round((y - GAP) / unitY)
    return {
      x: Math.max(0, Math.min(GRID_COLUMNS - 1, gridX)),
      y: Math.max(0, gridY),
    }
  }

  /**
   * 验证所有组件无重叠且在栅格范围内
   */
  function validateLayout(widgets: WidgetConfig[]): boolean {
    for (const widget of widgets) {
      const l = widget.layout
      if (l.x < 0 || l.y < 0 || l.x + l.w > GRID_COLUMNS || l.w <= 0 || l.h <= 0) {
        return false
      }
    }
    for (let i = 0; i < widgets.length; i++) {
      for (let j = i + 1; j < widgets.length; j++) {
        if (isOverlap(widgets[i].layout, widgets[j].layout)) {
          return false
        }
      }
    }
    return true
  }

  return {
    gridConfig,
    containerRef: containerRef as Ref<HTMLElement | null>,
    containerWidth,
    calculatePosition,
    findAvailablePosition,
    snapToGrid,
    validateLayout,
    getColumnWidth,
    isOverlap,
  }
}

export type UseGridLayoutReturn = ReturnType<typeof useGridLayout>
