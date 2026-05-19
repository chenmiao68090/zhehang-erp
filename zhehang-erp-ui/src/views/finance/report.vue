<template>
  <div class="finance-report">
    <el-card shadow="never">
      <!-- Tabs -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane :label="$t('finance.report.balanceSheet')" name="balanceSheet" />
        <el-tab-pane :label="$t('finance.report.incomeStatement')" name="incomeStatement" />
        <el-tab-pane :label="$t('finance.report.cashFlow')" name="cashFlow" />
      </el-tabs>

      <!-- Toolbar -->
      <div class="toolbar">
        <el-form :model="queryParams" inline>
          <el-form-item :label="$t('finance.report.period')">
            <el-date-picker v-model="queryParams.period" type="month" value-format="YYYY-MM"
              :placeholder="$t('common.pleaseSelect')" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
            <el-button type="success" @click="handleGenerate">{{ $t('finance.report.generate') }}</el-button>
          </el-form-item>
        </el-form>
        <div class="export-btns">
          <el-button @click="handleExport('excel')">{{ $t('finance.report.exportExcel') }}</el-button>
          <el-button @click="handleExport('pdf')">{{ $t('finance.report.exportPdf') }}</el-button>
        </div>
      </div>

      <!-- Balance Sheet -->
      <div v-if="activeTab === 'balanceSheet'" v-loading="loading">
        <h3 class="report-title">{{ $t('finance.report.balanceSheet') }}</h3>
        <p class="report-period">{{ queryParams.period || '--' }}</p>
        <el-table :data="reportData" border stripe>
          <el-table-column prop="item" :label="$t('finance.report.item')" min-width="200" />
          <el-table-column prop="endBalance" :label="$t('finance.report.endBalance')" width="160" align="right">
            <template #default="{ row }">{{ formatAmount(row.endBalance) }}</template>
          </el-table-column>
          <el-table-column prop="beginBalance" :label="$t('finance.report.beginBalance')" width="160" align="right">
            <template #default="{ row }">{{ formatAmount(row.beginBalance) }}</template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Income Statement -->
      <div v-if="activeTab === 'incomeStatement'" v-loading="loading">
        <h3 class="report-title">{{ $t('finance.report.incomeStatement') }}</h3>
        <p class="report-period">{{ queryParams.period || '--' }}</p>
        <el-table :data="reportData" border stripe>
          <el-table-column prop="item" :label="$t('finance.report.item')" min-width="200" />
          <el-table-column prop="currentAmount" :label="$t('finance.report.currentAmount')" width="160" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentAmount) }}</template>
          </el-table-column>
          <el-table-column prop="cumulativeAmount" :label="$t('finance.report.cumulativeAmount')" width="160" align="right">
            <template #default="{ row }">{{ formatAmount(row.cumulativeAmount) }}</template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Cash Flow -->
      <div v-if="activeTab === 'cashFlow'" v-loading="loading">
        <h3 class="report-title">{{ $t('finance.report.cashFlow') }}</h3>
        <p class="report-period">{{ queryParams.period || '--' }}</p>
        <el-table :data="reportData" border stripe>
          <el-table-column prop="item" :label="$t('finance.report.item')" min-width="250" />
          <el-table-column prop="currentAmount" :label="$t('finance.report.currentAmount')" width="160" align="right">
            <template #default="{ row }">{{ formatAmount(row.currentAmount) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { reportApi } from '@/api/finance'

const { t } = useI18n()

const loading = ref(false)
const activeTab = ref('balanceSheet')
const reportData = ref<any[]>([])

const queryParams = reactive({
  period: ''
})

function formatAmount(val: number) {
  return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
}

async function getReport() {
  loading.value = true
  try {
    let res: any
    switch (activeTab.value) {
      case 'balanceSheet':
        res = await reportApi.balanceSheet({ period: queryParams.period })
        break
      case 'incomeStatement':
        res = await reportApi.incomeStatement({ period: queryParams.period })
        break
      case 'cashFlow':
        res = await reportApi.cashFlow({ period: queryParams.period })
        break
    }
    reportData.value = res?.data || []
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  getReport()
}

function handleSearch() {
  getReport()
}

async function handleGenerate() {
  if (!queryParams.period) {
    ElMessage.warning(t('common.pleaseSelect') + ' ' + t('finance.report.period'))
    return
  }
  loading.value = true
  try {
    await reportApi.generate({ reportType: activeTab.value, period: queryParams.period })
    ElMessage.success(t('common.success'))
    getReport()
  } finally {
    loading.value = false
  }
}

function handleExport(type: string) {
  ElMessage.info(t('finance.report.exporting'))
  // Export logic placeholder
}

onMounted(() => {
  getReport()
})
</script>

<style scoped>
.finance-report {
  padding: 16px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.export-btns {
  display: flex;
  gap: 8px;
}
.report-title {
  text-align: center;
  margin: 16px 0 4px;
  font-size: 18px;
}
.report-period {
  text-align: center;
  color: #666;
  margin-bottom: 16px;
}
</style>
