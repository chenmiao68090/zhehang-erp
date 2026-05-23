<template>
  <div class="designer-container">
    <Toolbar
      :dashboard-name="currentDashboard?.name ?? '未命名驾驶舱'"
      :save-status="saveStatus"
      @update:name="handleUpdateName"
      @save="handleSave"
      @preview="handlePreview"
      @back="handleBack"
    />
    <div class="designer-body">
      <ComponentPanel
        v-show="showComponentPanel"
        @select-template="handleSelectTemplate"
      />
      <Canvas
        :widgets="currentDashboard?.widgets ?? []"
        :selected-widget-id="selectedWidget?.id ?? ''"
        @update:widgets="handleUpdateWidgets"
        @select-widget="handleSelectWidget"
        @add-widget="handleAddWidget"
        @remove-widget="handleRemoveWidget"
      />
      <ConfigPanel
        v-show="showConfigPanel"
        :widget="selectedWidget"
        @update:widget="handleUpdateWidget"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { DashboardConfig, WidgetConfig } from '@/views/dashboard/types/dashboard'
import { getTheme } from '@/views/dashboard/theme'
import { getDashboard, updateDashboard } from '@/api/dashboard'
import Toolbar from './components/Toolbar.vue'
import ComponentPanel from './components/ComponentPanel.vue'
import Canvas from './components/Canvas.vue'
import ConfigPanel from './components/ConfigPanel.vue'

const route = useRoute()
const router = useRouter()

const currentDashboard = ref<DashboardConfig | null>(null)
const selectedWidget = ref<WidgetConfig | null>(null)
const isEditing = ref(false)
const saveStatus = ref<'saved' | 'saving' | 'unsaved'>('saved')
const showComponentPanel = ref(true)
const showConfigPanel = ref(true)

const theme = computed(() => getTheme(currentDashboard.value?.theme ?? 'dark'))

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    try {
      const res = await getDashboard(id)
      currentDashboard.value = res.data
      isEditing.value = true
    } catch {
      currentDashboard.value = {
        id: '',
        name: '未命名驾驶舱',
        widgets: [],
        theme: 'dark',
        gridColumns: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: '',
      }
    }
  } else {
    currentDashboard.value = {
      id: '',
      name: '未命名驾驶舱',
      widgets: [],
      theme: 'dark',
      gridColumns: 24,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '',
    }
  }
})

function handleUpdateName(name: string) {
  if (currentDashboard.value) {
    currentDashboard.value.name = name
    saveStatus.value = 'unsaved'
  }
}

async function handleSave() {
  if (!currentDashboard.value) return
  saveStatus.value = 'saving'
  try {
    await updateDashboard(currentDashboard.value.id, currentDashboard.value)
    saveStatus.value = 'saved'
  } catch {
    saveStatus.value = 'unsaved'
  }
}

function handlePreview() {
  const id = currentDashboard.value?.id
  if (id) {
    router.push({ path: `/dashboard/view/${id}` })
  }
}

function handleBack() {
  router.back()
}

function handleSelectTemplate(templateId: string) {
  // TODO: 加载模板数据
  void templateId
}

function handleUpdateWidgets(widgets: WidgetConfig[]) {
  if (currentDashboard.value) {
    currentDashboard.value.widgets = widgets
    saveStatus.value = 'unsaved'
  }
}

function handleSelectWidget(widget: WidgetConfig | null) {
  selectedWidget.value = widget
}

function handleAddWidget(widget: WidgetConfig) {
  if (currentDashboard.value) {
    currentDashboard.value.widgets.push(widget)
    selectedWidget.value = widget
    saveStatus.value = 'unsaved'
  }
}

function handleRemoveWidget(widgetId: string) {
  if (currentDashboard.value) {
    currentDashboard.value.widgets = currentDashboard.value.widgets.filter(w => w.id !== widgetId)
    if (selectedWidget.value?.id === widgetId) {
      selectedWidget.value = null
    }
    saveStatus.value = 'unsaved'
  }
}

function handleUpdateWidget(widget: WidgetConfig) {
  if (currentDashboard.value) {
    const idx = currentDashboard.value.widgets.findIndex(w => w.id === widget.id)
    if (idx !== -1) {
      currentDashboard.value.widgets[idx] = widget
      selectedWidget.value = widget
      saveStatus.value = 'unsaved'
    }
  }
}
</script>

<style scoped>
.designer-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0A0A0F;
  overflow: hidden;
}

.designer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
