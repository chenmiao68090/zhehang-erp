<template>
  <div class="page-container report-preview-page">
    <!-- 顶部工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <el-button @click="goBack"><el-icon><ArrowLeft /></el-icon>{{ $t('common.back') }}</el-button>
        <el-divider direction="vertical" />
        <h3 class="report-title">{{ reportData?.name || $t('report.preview') }}</h3>
        <el-tag v-if="reportData" size="small" :type="reportData.status === 1 ? 'success' : 'warning'">
          {{ reportData.status === 1 ? $t('report.statusPublished') : $t('report.statusDraft') }}
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleExportExcel"><el-icon><Download /></el-icon>{{ $t('report.exportExcel') }}</el-button>
        <!-- 订阅定时推送:后端 report_schedule 只存不推送(无 @Scheduled 任务真正发送),暂隐藏避免误导;待补定时任务后再放开 -->
        <el-button v-if="false" @click="showSubscribe = true"><el-icon><Bell /></el-icon>{{ $t('report.subscribe') }}</el-button>
        <el-button type="primary" @click="goEdit"><el-icon><Edit /></el-icon>{{ $t('common.edit') }}</el-button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div v-loading="loading" class="preview-body">
      <div v-if="executeError && !loading" class="empty-state">
        <el-result icon="error" title="报表数据源不可用" :sub-title="executeError">
          <template #extra><el-button type="primary" @click="executeReport">重新查询</el-button></template>
        </el-result>
      </div>
      <div v-else-if="chartItems.length === 0 && !loading" class="empty-state">
        <el-empty description="报表尚未配置图表" />
      </div>
      <div v-else-if="queryResult.length === 0 && !loading" class="empty-state">
        <el-empty description="查询成功，当前条件下暂无真实数据" />
      </div>
      <div v-else class="preview-grid">
        <div v-for="(item, index) in chartItems" :key="index" class="preview-card">
          <div class="card-title">{{ item.title || getChartLabel(item.chartType) }}</div>
          <!-- KPI card special rendering -->
          <template v-if="item.chartType === 'kpi'">
            <div class="kpi-display">
              <div class="kpi-value">{{ getKpiValue(index) }}</div>
              <div class="kpi-label">{{ item.title }}</div>
            </div>
          </template>
          <!-- Table rendering -->
          <template v-else-if="item.chartType === 'table'">
            <el-table :data="queryResult" size="small" max-height="320" stripe border>
              <el-table-column v-for="col in tableColumns" :key="col" :prop="col" :label="col" min-width="120" />
            </el-table>
          </template>
          <!-- Chart rendering -->
          <template v-else>
            <div :ref="(el: any) => setChartRef(el, index)" class="chart-container"></div>
          </template>
        </div>
      </div>
    </div>

    <!-- 订阅对话框 -->
    <el-dialog v-model="showSubscribe" :title="$t('report.subscribeReport')" width="500px">
      <el-form :model="scheduleForm" label-width="100px">
        <el-form-item :label="$t('report.cronExpression')">
          <el-input v-model="scheduleForm.cronExpression" placeholder="0 0 8 * * ?" />
        </el-form-item>
        <el-form-item :label="$t('report.recipients')">
          <el-input v-model="scheduleForm.recipients" />
        </el-form-item>
        <el-form-item :label="$t('report.channel')">
          <el-select v-model="scheduleForm.channel">
            <el-option :label="$t('report.channelEmail')" value="email" />
            <el-option :label="$t('report.channelSms')" value="sms" />
            <el-option :label="$t('report.channelIm')" value="im" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSubscribe = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitSubscribe">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Bell, Edit } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { reportDefinitionApi, reportDataApi, reportScheduleApi } from '@/api/report'
import type { ReportDefinition } from '@/api/report'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const reportData = ref<ReportDefinition | null>(null)
const chartItems = ref<any[]>([])
const queryResult = ref<any[]>([])
const executeError = ref('')
const showSubscribe = ref(false)
const chartRefs = ref<(HTMLElement | null)[]>([])
const chartInstances = ref<(echarts.ECharts | null)[]>([])

const scheduleForm = reactive({
  cronExpression: '0 0 8 * * ?',
  recipients: '',
  channel: 'email'
})

const tableColumns = computed(() => {
  if (queryResult.value.length === 0) return []
  return Object.keys(queryResult.value[0])
})

const componentTypes = [
  { type: 'kpi', label: t('report.chartKpi') },
  { type: 'table', label: t('report.chartTable') },
  { type: 'line', label: t('report.chartLine') },
  { type: 'bar', label: t('report.chartBar') },
  { type: 'pie', label: t('report.chartPie') },
  { type: 'funnel', label: t('report.chartFunnel') },
  { type: 'radar', label: t('report.chartRadar') }
]

function getChartLabel(type: string) {
  const found = componentTypes.find(c => c.type === type)
  return found ? found.label : type
}

function getKpiValue(index: number) {
  if (queryResult.value.length > 0 && queryResult.value[index]) {
    return queryResult.value[index].value ?? queryResult.value[index].count ?? '-'
  }
  return '-'
}

function setChartRef(el: HTMLElement | null, index: number) {
  chartRefs.value[index] = el
}

function goBack() {
  router.push('/report/list')
}

function goEdit() {
  if (reportData.value?.id) {
    router.push({ path: '/report/designer', query: { id: String(reportData.value.id) } })
  }
}

async function loadReport() {
  const id = route.query.id
  if (!id) return

  loading.value = true
  try {
    const res: any = await reportDefinitionApi.detail(Number(id))
    reportData.value = res.data
    if (res.data?.chartConfig) {
      try { chartItems.value = JSON.parse(res.data.chartConfig) } catch {}
    }
    await executeReport()
  } finally {
    loading.value = false
  }
}

async function executeReport() {
  const id = route.query.id
  if (!id) return
  executeError.value = ''
  try {
    // 后端当前只执行已保存的数据集，不消费动态筛选参数；不展示无效筛选入口。
    const res: any = await reportDataApi.execute(Number(id))
    queryResult.value = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
  } catch (error: any) {
    queryResult.value = []
    executeError.value = error?.message || '查询失败，请检查报表的数据集、表名和字段配置。'
  }
  nextTick(() => {
    chartItems.value.forEach((item, idx) => {
      if (item.chartType !== 'kpi' && item.chartType !== 'table') {
        renderChart(idx, item)
      }
    })
  })
}

function renderChart(index: number, item: any) {
  const el = chartRefs.value[index]
  if (!el) return

  let instance = chartInstances.value[index]
  if (!instance) {
    instance = echarts.init(el)
    chartInstances.value[index] = instance
  }

  const data = queryResult.value
  if (!data.length) {
    instance.clear()
    return
  }

  const color = item.color || '#3370ff'
  const xData = data.map((d: any) => d[item.xField] || d.name || d.metric || '')
  const yData = data.map((d: any) => Number(d[item.yField] || d.value || d.count || 0))
  let option: any = {}

  switch (item.chartType) {
    case 'line':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        grid: { top: 50, bottom: 30, left: 50, right: 20 },
        xAxis: { type: 'category', data: xData },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: yData, smooth: true, itemStyle: { color }, areaStyle: { color: color + '22' } }]
      }
      break
    case 'bar':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        grid: { top: 50, bottom: 30, left: 50, right: 20 },
        xAxis: { type: 'category', data: xData },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: yData, itemStyle: { color, borderRadius: [4, 4, 0, 0] } }]
      }
      break
    case 'pie':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'item' },
        legend: { orient: 'horizontal', bottom: 0 },
        series: [{ type: 'pie', radius: ['35%', '65%'],
          data: data.map((d: any, i: number) => ({ name: d.name || d.metric, value: Number(d.value || d.count || 0),
            itemStyle: { color: ['#3370ff', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][i % 6] } }))
        }]
      }
      break
    case 'funnel':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'item' },
        series: [{ type: 'funnel', left: '10%', width: '80%',
          data: data.map((d: any) => ({ name: d.name || d.metric, value: Number(d.value || d.count || 0) }))
        }]
      }
      break
    case 'radar':
      option = {
        title: { text: item.title, left: 'center', textStyle: { fontSize: 14 } },
        radar: { indicator: data.map((d: any) => ({ name: d.name || d.metric, max: Math.max(...yData) * 1.2 || 100 })) },
        series: [{ type: 'radar', data: [{ value: yData, itemStyle: { color } }] }]
      }
      break
  }

  instance.setOption(option, true)
}

function handleExportExcel() {
  if (queryResult.value.length === 0) {
    ElMessage.warning(t('common.noData'))
    return
  }
  const cols = tableColumns.value
  let csv = cols.join(',') + '\n'
  queryResult.value.forEach(row => {
    csv += cols.map(c => row[c] ?? '').join(',') + '\n'
  })
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = (reportData.value?.name || 'report') + '.csv'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(t('common.success'))
}

async function submitSubscribe() {
  if (!reportData.value?.id) return
  await reportScheduleApi.create({
    reportId: reportData.value.id,
    cronExpression: scheduleForm.cronExpression,
    recipients: scheduleForm.recipients,
    channel: scheduleForm.channel as any,
    status: 1
  })
  ElMessage.success(t('common.success'))
  showSubscribe.value = false
}

onMounted(() => {
  loadReport()
})

onBeforeUnmount(() => {
  chartInstances.value.forEach(inst => inst?.dispose())
})
</script>

<style scoped>
.report-preview-page { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.preview-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 10px; }
.report-title { margin: 0; font-size: 16px; font-weight: 600; }
.preview-body { flex: 1; padding: 20px; overflow-y: auto; background: var(--el-fill-color-lighter); }
.preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.preview-card {
  background: var(--el-bg-color); border-radius: 8px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.card-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; color: var(--el-text-color-primary); }
.chart-container { width: 100%; height: 300px; }
.kpi-display { text-align: center; padding: 30px 0; }
.kpi-value { font-size: 42px; font-weight: 700; color: #3370ff; line-height: 1.2; }
.kpi-label { font-size: 14px; color: var(--el-text-color-secondary); margin-top: 8px; }
.empty-state { display: flex; justify-content: center; align-items: center; min-height: 400px; }
</style>
