<template>
  <div class="sales-operating-console">
    <header class="console-header">
      <div class="title-group">
        <div class="title-line">
          <el-tooltip content="返回今日工作" placement="bottom">
            <el-button class="mobile-back" :icon="ArrowLeft" circle aria-label="返回今日工作" @click="router.push('/customer/workbench')" />
          </el-tooltip>
          <h1>销售经营台</h1>
          <el-tag v-if="overview" effect="plain" type="info">{{ overview.scope.label }}</el-tag>
        </div>
        <p>{{ viewSubtitle }}</p>
      </div>

      <el-segmented v-model="activeView" :options="viewOptions" class="view-switch" />
    </header>

    <div v-if="activeView === 'overview'" class="console-toolbar">
      <div class="filter-group">
        <el-date-picker
          v-model="dateRange"
          class="date-range"
          type="daterange"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="false"
          :editable="false"
          :disabled-date="disableFutureDate"
          unlink-panels
          @change="reloadFromFirstPage"
        />
        <el-select
          v-if="canFilterTeam && departmentOptions.length > 1"
          v-model="selectedDeptId"
          clearable
          filterable
          placeholder="全部部门"
          class="scope-select"
          @change="onDepartmentChange"
        >
          <el-option v-for="dept in departmentOptions" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-select
          v-if="canFilterTeam && ownerOptions.length > 1"
          v-model="selectedOwnerId"
          clearable
          filterable
          placeholder="全部员工"
          class="scope-select"
          @change="loadOverview"
        >
          <el-option
            v-for="owner in filteredOwnerOptions"
            :key="owner.id"
            :label="owner.deptName ? `${owner.name} · ${owner.deptName}` : owner.name"
            :value="owner.id"
          />
        </el-select>
      </div>
      <el-tooltip content="刷新经营数据" placement="top">
        <el-button :icon="Refresh" circle :loading="loading" aria-label="刷新经营数据" @click="loadOverview" />
      </el-tooltip>
    </div>

    <SalesAiInsightPanel
      v-if="activeView === 'overview' && overview && ['boss', 'manager'].includes(overview.viewMode)"
      :query="currentQuery"
    />

    <main v-if="activeView === 'overview'" class="overview-body" v-loading="loading">
      <el-result v-if="errorMessage && !loading" icon="warning" title="销售经营台加载失败" :sub-title="errorMessage">
        <template #extra><el-button type="primary" :icon="Refresh" @click="loadOverview">重新加载</el-button></template>
      </el-result>

      <template v-else-if="overview">
        <BossSalesConsole
          v-if="overview.viewMode === 'boss'"
          :data="overview"
          @stage-click="openStage"
        />
        <ManagerSalesConsole
          v-else-if="overview.viewMode === 'manager'"
          :data="overview"
          @stage-click="openStage"
          @lead-click="openLead"
        />
        <EmployeeSalesConsole
          v-else
          :data="overview"
          @stage-click="openStage"
          @lead-click="openLead"
        />
      </template>
    </main>

    <section v-else class="legacy-shell">
      <BizPerf />
    </section>

    <SalesStageDrawer
      v-model="stageDrawerOpen"
      :stage="selectedStage"
      :query="currentQuery"
      @lead-click="openLead"
    />
    <Customer360Drawer v-model="customerDrawerOpen" :lead-id="selectedLeadId" @changed="loadOverview" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  getSalesConsoleOverview,
  type SalesActionItem,
  type SalesConsoleOverview,
  type SalesConsoleQuery,
  type SalesStageCustomer,
  type SalesStageItem
} from '@/api/sales-console'
import Customer360Drawer from '@/components/sales/Customer360Drawer.vue'
import SalesAiInsightPanel from '@/components/sales/SalesAiInsightPanel.vue'
import BizPerf from './biz-perf.vue'
import BossSalesConsole from './components/sales-console/BossSalesConsole.vue'
import ManagerSalesConsole from './components/sales-console/ManagerSalesConsole.vue'
import EmployeeSalesConsole from './components/sales-console/EmployeeSalesConsole.vue'
import SalesStageDrawer from './components/sales-console/SalesStageDrawer.vue'

const viewOptions = [
  { label: '经营概览', value: 'overview' },
  { label: '业绩与录音', value: 'performance' }
]

const router = useRouter()

const activeView = ref<'overview' | 'performance'>('overview')
const loading = ref(false)
const errorMessage = ref('')
const overview = ref<SalesConsoleOverview | null>(null)
const dateRange = ref<[string, string]>([
  dayjs().startOf('month').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD')
])
const selectedDeptId = ref<number | undefined>()
const selectedOwnerId = ref<number | undefined>()
const stageDrawerOpen = ref(false)
const selectedStage = ref<SalesStageItem | null>(null)
const customerDrawerOpen = ref(false)
const selectedLeadId = ref<number | null>(null)

const canFilterTeam = computed(() => overview.value?.viewMode === 'boss' || overview.value?.viewMode === 'manager')
const departmentOptions = computed(() => overview.value?.filters?.departments || [])
const ownerOptions = computed(() => overview.value?.filters?.owners || [])
const filteredOwnerOptions = computed(() => selectedDeptId.value
  ? ownerOptions.value.filter(owner => owner.deptId === selectedDeptId.value)
  : ownerOptions.value)

const currentQuery = computed<SalesConsoleQuery>(() => ({
  startDate: dateRange.value?.[0],
  endDate: dateRange.value?.[1],
  deptId: selectedDeptId.value,
  ownerId: selectedOwnerId.value
}))

const viewSubtitle = computed(() => {
  if (!overview.value) return '把销售执行、成交到款和续费风险放在一页看清'
  if (overview.value.viewMode === 'boss') return '三分钟看结果、风险和需要拍板的事项'
  if (overview.value.viewMode === 'manager') return '先看异常，再盯团队执行和客户推进'
  return '今天该做什么、先做什么、做到什么结果'
})

onMounted(loadOverview)

async function loadOverview() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response: any = await getSalesConsoleOverview(currentQuery.value)
    overview.value = response?.data ?? response
  } catch (error: any) {
    errorMessage.value = error?.message || '请稍后重试'
    if (!overview.value) ElMessage.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

function reloadFromFirstPage() {
  loadOverview()
}

function onDepartmentChange() {
  if (selectedOwnerId.value && !filteredOwnerOptions.value.some(item => item.id === selectedOwnerId.value)) {
    selectedOwnerId.value = undefined
  }
  loadOverview()
}

function openStage(stage: SalesStageItem) {
  selectedStage.value = stage
  stageDrawerOpen.value = true
}

function openLead(row: SalesActionItem | SalesStageCustomer) {
  selectedLeadId.value = Number(row.leadId)
  customerDrawerOpen.value = true
}

function disableFutureDate(date: Date) {
  return dayjs(date).isAfter(dayjs(), 'day')
}
</script>

<style scoped lang="scss">
.sales-operating-console {
  min-height: 100%;
  padding: 20px;
  background: #f6f8fb;
  color: #243147;
}

.console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.title-line { display: flex; align-items: center; gap: 10px; }
.mobile-back { display: none; }
.title-group h1 { margin: 0; color: #172033; font-size: 24px; line-height: 1.35; }
.title-group p { margin: 5px 0 0; color: #738096; font-size: 13px; }
.view-switch { flex: 0 0 auto; }

.console-toolbar {
  min-height: 56px;
  padding: 10px 0;
  margin-bottom: 20px;
  border-top: 1px solid #dfe5ed;
  border-bottom: 1px solid #dfe5ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.filter-group { min-width: 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.date-range { width: 276px; }
.scope-select { width: 180px; }
.overview-body { min-height: 420px; }
.legacy-shell { min-width: 0; }
.legacy-shell :deep(.result-page-head) { display: none; }
.legacy-shell :deep(.biz-perf) { padding: 0; background: transparent; }

@media (max-width: 900px) {
  .sales-operating-console { padding: 20px; }
  .console-header { align-items: flex-start; }
}

@media (max-width: 680px) {
  .sales-operating-console { padding: 20px; }
  .console-header { flex-direction: column; gap: 14px; margin-bottom: 14px; }
  .title-group h1 { font-size: 21px; }
  .mobile-back { display: inline-flex; flex: 0 0 auto; }
  .view-switch { width: 100%; }
  .console-toolbar { align-items: flex-start; }
  .filter-group { width: calc(100% - 46px); }
  .date-range, .scope-select { width: 100%; }
}
</style>
