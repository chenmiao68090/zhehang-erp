<template>
  <div class="page-container report-designer-page">
    <!-- 顶部工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-button @click="goBack"><el-icon><ArrowLeft /></el-icon>{{ $t('common.back') }}</el-button>
        <el-divider direction="vertical" />
        <el-input v-model="reportForm.name" :placeholder="$t('report.name')" style="width: 220px" />
      </div>
      <div class="toolbar-right">
        <el-button @click="handlePreview"><el-icon><View /></el-icon>{{ $t('report.preview') }}</el-button>
        <el-button type="primary" @click="handleSave"><el-icon><Check /></el-icon>{{ $t('common.save') }}</el-button>
      </div>
    </div>

    <!-- 三栏布局 -->
    <div class="designer-body">
      <!-- 左侧组件库 -->
      <div class="panel-left">
        <h4>{{ $t('report.componentLibrary') }}</h4>
        <div class="component-list">
          <div v-for="comp in componentTypes" :key="comp.type" class="component-item" draggable="true"
               @dragstart="onDragStart($event, comp.type)">
            <el-icon :size="22"><component :is="comp.icon" /></el-icon>
            <span>{{ comp.label }}</span>
          </div>
        </div>
        <el-divider />
        <h4>{{ $t('report.dataSourceType') }}</h4>
        <el-radio-group v-model="reportForm.dataSourceType" size="small">
          <el-radio-button value="preset">{{ $t('report.dataSourcePreset') }}</el-radio-button>
          <el-radio-button value="sql">{{ $t('report.dataSourceSql') }}</el-radio-button>
        </el-radio-group>
        <div v-if="reportForm.dataSourceType === 'preset'" class="data-config">
          <el-select v-model="reportForm.category" :placeholder="$t('report.category')" style="width: 100%; margin-top: 10px">
            <el-option label="CRM" value="crm" />
            <el-option :label="$t('report.categoryFinance')" value="finance" />
            <el-option :label="$t('report.categoryHrm')" value="hrm" />
            <el-option :label="$t('report.categorySales')" value="sales" />
          </el-select>
        </div>
        <div v-else class="data-config">
          <el-input v-model="reportForm.sqlQuery" type="textarea" :rows="5"
                    :placeholder="$t('report.sqlPlaceholder')" style="margin-top: 10px" />
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="panel-center" @dragover.prevent @drop="onDrop">
        <div v-if="canvasItems.length === 0" class="canvas-empty">
          <el-icon :size="48" color="#ddd"><DataAnalysis /></el-icon>
          <p>{{ $t('report.dragHint') }}</p>
        </div>
        <div v-else class="canvas-grid">
          <div v-for="(item, index) in canvasItems" :key="index"
               class="canvas-item" :class="{ selected: selectedIndex === index }"
               @click="selectItem(index)">
            <div class="item-header">
              <span>{{ item.title || getChartLabel(item.chartType) }}</span>
              <el-icon class="item-remove" @click.stop="removeItem(index)"><Close /></el-icon>
            </div>
            <div class="item-preview">
              <div :ref="(el: any) => setChartRef(el, index)" class="chart-preview-box"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="panel-right">
        <h4>{{ $t('report.properties') }}</h4>
        <template v-if="selectedIndex >= 0 && canvasItems[selectedIndex]">
          <el-form label-position="top" size="small">
            <el-form-item :label="$t('report.chartTitle')">
              <el-input v-model="canvasItems[selectedIndex].title" @change="renderChart(selectedIndex)" />
            </el-form-item>
            <el-form-item :label="$t('report.type')">
              <el-select v-model="canvasItems[selectedIndex].chartType" @change="renderChart(selectedIndex)">
                <el-option v-for="ct in componentTypes" :key="ct.type" :label="ct.label" :value="ct.type" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('report.dimension')">
              <el-input v-model="canvasItems[selectedIndex].xField" placeholder="X轴字段" @change="renderChart(selectedIndex)" />
            </el-form-item>
            <el-form-item :label="$t('report.metric')">
              <el-input v-model="canvasItems[selectedIndex].yField" placeholder="Y轴字段" @change="renderChart(selectedIndex)" />
            </el-form-item>
            <el-form-item :label="$t('report.color')">
              <el-color-picker v-model="canvasItems[selectedIndex].color" @change="renderChart(selectedIndex)" />
            </el-form-item>
            <el-form-item :label="$t('report.legendPosition')">
              <el-select v-model="canvasItems[selectedIndex].legendPosition" @change="renderChart(selectedIndex)">
                <el-option :label="$t('report.positionTop')" value="top" />
                <el-option :label="$t('report.positionBottom')" value="bottom" />
                <el-option :label="$t('report.positionLeft')" value="left" />
                <el-option :label="$t('report.positionRight')" value="right" />
              </el-select>
            </el-form-item>
          </el-form>
        </template>
        <div v-else class="no-selection">
          <p style="color: var(--el-text-color-secondary); text-align: center; margin-top: 40px;">
            {{ $t('report.noComponents') }}
          </p>
        </div>

        <!-- 后端尚未把筛选参数绑定到真实查询，入口明确停用，避免把原样数据伪装成筛选结果。 -->
        <el-divider />
        <h4>{{ $t('report.filterConfig') }}</h4>
        <el-alert
          title="筛选条件暂未开放"
          description="当前查询服务尚未接入参数绑定，系统不会展示或保存一个看似生效、实际未筛选的条件。"
          type="warning"
          :closable="false"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View, Check, Close, DataAnalysis, TrendCharts, Histogram, PieChart } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { reportDefinitionApi } from '@/api/report'
import type { ReportDefinition } from '@/api/report'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

interface CanvasItem {
  chartType: string
  title: string
  xField: string
  yField: string
  color: string
  legendPosition: string
}

const reportForm = reactive<Partial<ReportDefinition>>({
  name: '',
  category: 'crm',
  type: 'chart',
  dataSourceType: 'preset',
  sqlQuery: '',
  permissionType: 'public',
  status: 0
})

const canvasItems = ref<CanvasItem[]>([])
const selectedIndex = ref(-1)
const chartRefs = ref<(HTMLElement | null)[]>([])
const chartInstances = ref<(echarts.ECharts | null)[]>([])

const componentTypes = [
  { type: 'kpi', label: t('report.chartKpi'), icon: 'DataAnalysis' },
  { type: 'table', label: t('report.chartTable'), icon: 'Grid' },
  { type: 'line', label: t('report.chartLine'), icon: 'TrendCharts' },
  { type: 'bar', label: t('report.chartBar'), icon: 'Histogram' },
  { type: 'pie', label: t('report.chartPie'), icon: 'PieChart' },
  { type: 'funnel', label: t('report.chartFunnel'), icon: 'Sort' },
  { type: 'radar', label: t('report.chartRadar'), icon: 'Aim' }
]

function getChartLabel(type: string) {
  const found = componentTypes.find(c => c.type === type)
  return found ? found.label : type
}

function setChartRef(el: HTMLElement | null, index: number) {
  chartRefs.value[index] = el
  if (el) {
    nextTick(() => renderChart(index))
  }
}

function onDragStart(e: DragEvent, type: string) {
  e.dataTransfer?.setData('chartType', type)
}

function onDrop(e: DragEvent) {
  const type = e.dataTransfer?.getData('chartType')
  if (type) {
    canvasItems.value.push({
      chartType: type,
      title: '',
      xField: 'name',
      yField: 'value',
      color: '#3370ff',
      legendPosition: 'top'
    })
    nextTick(() => {
      selectedIndex.value = canvasItems.value.length - 1
      renderChart(canvasItems.value.length - 1)
    })
  }
}

function selectItem(index: number) {
  selectedIndex.value = index
}

function removeItem(index: number) {
  if (chartInstances.value[index]) {
    chartInstances.value[index]!.dispose()
  }
  canvasItems.value.splice(index, 1)
  chartInstances.value.splice(index, 1)
  chartRefs.value.splice(index, 1)
  if (selectedIndex.value >= canvasItems.value.length) {
    selectedIndex.value = canvasItems.value.length - 1
  }
}

function renderChart(index: number) {
  const el = chartRefs.value[index]
  if (!el) return
  const item = canvasItems.value[index]
  if (!item) return

  let instance = chartInstances.value[index]
  if (!instance) {
    instance = echarts.init(el)
    chartInstances.value[index] = instance
  }

  const previewData: Array<{ name: string; value: number }> = []

  const color = item.color || '#3370ff'
  let option: any = {}

  switch (item.chartType) {
    case 'line':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 13 } },
        tooltip: { trigger: 'axis' },
        legend: { show: true, [item.legendPosition === 'left' || item.legendPosition === 'right' ? item.legendPosition : item.legendPosition || 'top']: 0 },
        xAxis: { type: 'category', data: previewData.map(d => d.name) },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: previewData.map(d => d.value), smooth: true, itemStyle: { color }, areaStyle: { color: color + '33' } }]
      }
      break
    case 'bar':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 13 } },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: previewData.map(d => d.name) },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: previewData.map(d => d.value), itemStyle: { color, borderRadius: [4, 4, 0, 0] } }]
      }
      break
    case 'pie':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 13 } },
        tooltip: { trigger: 'item' },
        legend: { orient: 'horizontal', [item.legendPosition || 'bottom']: 0 },
        series: [{ type: 'pie', radius: ['35%', '60%'], data: previewData.map((d, i) => ({ ...d, itemStyle: { color: ['#3370ff', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i] } })) }]
      }
      break
    case 'kpi':
      instance.clear()
      option = {
        title: { text: item.title || 'KPI', left: 'center', textStyle: { fontSize: 13, color: '#666' } },
        graphic: realDataPreviewHint()
      }
      break
    case 'table':
      instance.clear()
      option = {
        title: { text: item.title || t('report.chartTable'), left: 'center', textStyle: { fontSize: 13 } },
        tooltip: {},
        xAxis: { type: 'category', data: previewData.map(d => d.name) },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: previewData.map(d => d.value), itemStyle: { color: '#3B82F6' } }]
      }
      break
    case 'funnel':
      instance.clear()
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 13 } },
        graphic: realDataPreviewHint()
      }
      break
    case 'radar':
      instance.clear()
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 13 } },
        graphic: realDataPreviewHint()
      }
      break
  }

  instance.setOption(option, true)
}

function realDataPreviewHint() {
  return {
    type: 'text',
    left: 'center',
    top: 'middle',
    style: {
      text: '设计器不展示演示数值\n保存后请到预览页加载真实数据',
      fill: '#909399',
      fontSize: 13,
      lineHeight: 22,
      align: 'center'
    }
  }
}

function goBack() {
  router.push('/report/list')
}

async function resolveCreatedReportId(data: Partial<ReportDefinition>): Promise<number | null> {
  const response: any = await reportDefinitionApi.list({
    pageNum: 1,
    pageSize: 50,
    name: data.name,
    category: data.category,
    type: data.type
  })
  const rows: ReportDefinition[] = response?.data?.records || response?.data?.list || []
  const saved = rows
    .filter(row =>
      row.name === data.name
      && row.category === data.category
      && row.type === data.type
      && row.dataSourceType === data.dataSourceType
      && row.chartConfig === data.chartConfig
      && row.filterConfig === data.filterConfig
    )
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0]
  return saved?.id ? Number(saved.id) : null
}

async function handleSave(): Promise<number | null> {
  if (!reportForm.name) {
    ElMessage.warning(t('common.pleaseInput') + t('report.name'))
    return null
  }
  const chartConfig = JSON.stringify(canvasItems.value)
  // 查询服务当前忽略筛选参数；固定清空旧配置，避免预览页出现无效筛选器。
  const data: any = { ...reportForm, chartConfig, filterConfig: '[]' }

  if (data.id) {
    await reportDefinitionApi.update(data)
  } else {
    const created: any = await reportDefinitionApi.create(data)
    const responseId = Number(created?.data?.id ?? created?.data ?? 0)
    const createdId = responseId > 0 ? responseId : await resolveCreatedReportId(data)
    if (!createdId) {
      ElMessage.warning('报表已提交保存，但未能确认真实编号；请返回报表列表后再预览。')
      return null
    }
    reportForm.id = createdId
    await router.replace({ path: route.path, query: { ...route.query, id: String(createdId) } })
  }
  ElMessage.success(t('report.saveSuccess'))
  return Number(reportForm.id || data.id) || null
}

async function handlePreview() {
  const savedId = await handleSave()
  if (savedId) {
    router.push({ path: '/report/preview', query: { id: String(savedId) } })
  }
}

async function loadReport(id: number) {
  const res: any = await reportDefinitionApi.detail(id)
  const data = res.data
  if (data) {
    Object.assign(reportForm, data)
    if (data.chartConfig) {
      try { canvasItems.value = JSON.parse(data.chartConfig) } catch {}
    }
    nextTick(() => {
      canvasItems.value.forEach((_, i) => renderChart(i))
    })
  }
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    loadReport(Number(id))
  }
})

onBeforeUnmount(() => {
  chartInstances.value.forEach(inst => inst?.dispose())
})
</script>

<style scoped>
.report-designer-page { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.designer-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 10px; }
.designer-body { flex: 1; display: flex; overflow: hidden; }
.panel-left, .panel-right {
  width: 240px; flex-shrink: 0; padding: 16px; overflow-y: auto;
  background: var(--el-bg-color); border-right: 1px solid var(--el-border-color-lighter);
}
.panel-right { border-right: none; border-left: 1px solid var(--el-border-color-lighter); }
.panel-left h4, .panel-right h4 { margin: 0 0 12px; font-size: 13px; color: var(--el-text-color-secondary); font-weight: 600; }
.component-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.component-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 8px; border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px; cursor: grab; font-size: 12px; transition: all 0.2s;
}
.component-item:hover { border-color: #3370ff; color: #3370ff; background: rgba(51, 112, 255,0.04); }
.panel-center {
  flex: 1; padding: 20px; overflow-y: auto;
  background: var(--el-fill-color-lighter);
}
.canvas-empty {
  height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  border: 2px dashed var(--el-border-color); border-radius: 8px;
}
.canvas-empty p { color: var(--el-text-color-placeholder); font-size: 14px; }
.canvas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
.canvas-item {
  background: var(--el-bg-color); border: 2px solid var(--el-border-color-lighter);
  border-radius: 8px; overflow: hidden; transition: all 0.2s;
}
.canvas-item.selected { border-color: #3370ff; box-shadow: 0 0 0 2px rgba(51, 112, 255,0.15); }
.item-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background: var(--el-fill-color-lighter);
  font-size: 13px; font-weight: 500;
}
.item-remove { cursor: pointer; color: var(--el-text-color-placeholder); }
.item-remove:hover { color: #3370ff; }
.item-preview { padding: 8px; }
.chart-preview-box { width: 100%; height: 220px; }
.data-config { margin-top: 8px; }
.no-selection { padding: 20px; }
</style>
