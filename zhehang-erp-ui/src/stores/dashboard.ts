import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardConfig, WidgetConfig, WidgetLayout } from '@/views/dashboard/types/dashboard'
import { getDashboard, updateDashboard, getDashboardList } from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // 状态
  const currentDashboard = ref<DashboardConfig | null>(null)
  const dashboardList = ref<DashboardConfig[]>([])
  const selectedWidgetId = ref<string | null>(null)
  const isEditing = ref(true)
  const saveStatus = ref<'saved' | 'saving' | 'unsaved'>('saved')
  const theme = ref<'dark' | 'light'>('dark')
  const undoStack = ref<string[]>([])
  const redoStack = ref<string[]>([])

  // 计算属性
  const selectedWidget = computed(() => {
    if (!selectedWidgetId.value || !currentDashboard.value) return null
    return currentDashboard.value.widgets.find(w => w.id === selectedWidgetId.value) || null
  })

  const widgetCount = computed(() => currentDashboard.value?.widgets.length || 0)

  // 操作方法
  async function loadDashboard(id: string) {
    try {
      const res: any = await getDashboard(id)
      currentDashboard.value = res.data || res
    } catch {
      // 加载失败时使用空驾驶舱
      currentDashboard.value = {
        id,
        name: '未命名驾驶舱',
        widgets: [],
        theme: 'dark',
        gridColumns: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: ''
      }
    }
  }

  async function loadDashboardList() {
    try {
      const res: any = await getDashboardList()
      dashboardList.value = res.data || res
    } catch {
      dashboardList.value = []
    }
  }

  function addWidget(widget: WidgetConfig) {
    if (!currentDashboard.value) return
    pushUndoState()
    currentDashboard.value.widgets.push(widget)
    saveStatus.value = 'unsaved'
    triggerAutoSave()
  }

  function removeWidget(widgetId: string) {
    if (!currentDashboard.value) return
    pushUndoState()
    currentDashboard.value.widgets = currentDashboard.value.widgets.filter(w => w.id !== widgetId)
    if (selectedWidgetId.value === widgetId) selectedWidgetId.value = null
    saveStatus.value = 'unsaved'
    triggerAutoSave()
  }

  function updateWidget(widgetId: string, updates: Partial<WidgetConfig>) {
    if (!currentDashboard.value) return
    const idx = currentDashboard.value.widgets.findIndex(w => w.id === widgetId)
    if (idx === -1) return
    pushUndoState()
    currentDashboard.value.widgets[idx] = { ...currentDashboard.value.widgets[idx], ...updates }
    saveStatus.value = 'unsaved'
    triggerAutoSave()
  }

  function updateWidgetLayout(widgetId: string, layout: WidgetLayout) {
    if (!currentDashboard.value) return
    const widget = currentDashboard.value.widgets.find(w => w.id === widgetId)
    if (widget) {
      widget.layout = layout
      saveStatus.value = 'unsaved'
      triggerAutoSave()
    }
  }

  function updateLayouts(layouts: { i: string; x: number; y: number; w: number; h: number }[]) {
    if (!currentDashboard.value) return
    layouts.forEach(l => {
      const widget = currentDashboard.value!.widgets.find(w => w.id === l.i)
      if (widget) {
        widget.layout = { ...widget.layout, x: l.x, y: l.y, w: l.w, h: l.h }
      }
    })
    saveStatus.value = 'unsaved'
    triggerAutoSave()
  }

  function selectWidget(widgetId: string | null) {
    selectedWidgetId.value = widgetId
  }

  function setTheme(mode: 'dark' | 'light') {
    theme.value = mode
    if (currentDashboard.value) currentDashboard.value.theme = mode
  }

  // 自动保存 (防抖500ms)
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  function triggerAutoSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      if (!currentDashboard.value) return
      saveStatus.value = 'saving'
      try {
        await updateDashboard(currentDashboard.value.id, currentDashboard.value)
        saveStatus.value = 'saved'
      } catch {
        saveStatus.value = 'unsaved'
      }
    }, 500)
  }

  // 撤销/重做
  function pushUndoState() {
    if (!currentDashboard.value) return
    undoStack.value.push(JSON.stringify(currentDashboard.value.widgets))
    redoStack.value = []
    if (undoStack.value.length > 50) undoStack.value.shift()
  }

  function undo() {
    if (!currentDashboard.value || undoStack.value.length === 0) return
    redoStack.value.push(JSON.stringify(currentDashboard.value.widgets))
    const prev = undoStack.value.pop()!
    currentDashboard.value.widgets = JSON.parse(prev)
    saveStatus.value = 'unsaved'
    triggerAutoSave()
  }

  function redo() {
    if (!currentDashboard.value || redoStack.value.length === 0) return
    undoStack.value.push(JSON.stringify(currentDashboard.value.widgets))
    const next = redoStack.value.pop()!
    currentDashboard.value.widgets = JSON.parse(next)
    saveStatus.value = 'unsaved'
    triggerAutoSave()
  }

  function $reset() {
    currentDashboard.value = null
    dashboardList.value = []
    selectedWidgetId.value = null
    saveStatus.value = 'saved'
    undoStack.value = []
    redoStack.value = []
  }

  return {
    // 状态
    currentDashboard, dashboardList, selectedWidgetId, selectedWidget,
    isEditing, saveStatus, theme, widgetCount,
    undoStack, redoStack,
    // 方法
    loadDashboard, loadDashboardList,
    addWidget, removeWidget, updateWidget, updateWidgetLayout, updateLayouts,
    selectWidget, setTheme,
    triggerAutoSave, undo, redo, $reset
  }
})
