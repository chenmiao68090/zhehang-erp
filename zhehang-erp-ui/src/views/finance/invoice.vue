<template>
  <div class="finance-invoice">
    <!-- Stats Cards -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ $t('finance.invoice.inputTotal') }}</div>
          <div class="stat-value input-color">{{ formatAmount(stats.inputTotal) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ $t('finance.invoice.outputTotal') }}</div>
          <div class="stat-value output-color">{{ formatAmount(stats.outputTotal) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ $t('finance.invoice.difference') }}</div>
          <div class="stat-value">{{ formatAmount(stats.outputTotal - stats.inputTotal) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <!-- Tabs -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane :label="$t('finance.invoice.all')" name="all" />
        <el-tab-pane :label="$t('finance.invoice.input')" name="INPUT" />
        <el-tab-pane :label="$t('finance.invoice.output')" name="OUTPUT" />
      </el-tabs>

      <!-- Search -->
      <el-form :model="queryParams" inline class="search-form">
        <el-form-item :label="$t('finance.invoice.invoiceNo')">
          <el-input v-model="queryParams.invoiceNo" :placeholder="$t('common.pleaseInput')" clearable />
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.customerId')">
          <el-input v-model="queryParams.customerId" :placeholder="$t('common.pleaseInput')" clearable />
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.invoiceType')">
          <el-select v-model="queryParams.invoiceType" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option :label="$t('finance.invoice.typeNormal')" value="NORMAL" />
            <el-option :label="$t('finance.invoice.typeSpecial')" value="SPECIAL" />
            <el-option :label="$t('finance.invoice.typeElectronic')" value="ELECTRONIC" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.invoiceDate')">
          <el-date-picker v-model="queryParams.dateRange" type="daterange" value-format="YYYY-MM-DD"
            :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- Toolbar -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">{{ $t('common.add') }}</el-button>
      </div>

      <!-- Table -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="invoiceNo" :label="$t('finance.invoice.invoiceNo')" width="180" />
        <el-table-column prop="invoiceType" :label="$t('finance.invoice.invoiceType')" width="100">
          <template #default="{ row }">{{ getInvoiceTypeLabel(row.invoiceType) }}</template>
        </el-table-column>
        <el-table-column prop="direction" :label="$t('finance.invoice.direction')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.direction === 'INPUT' ? 'success' : 'warning'">
              {{ row.direction === 'INPUT' ? $t('finance.invoice.input') : $t('finance.invoice.output') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customerId" :label="$t('finance.invoice.customerId')" width="120" />
        <el-table-column prop="amount" :label="$t('finance.invoice.amount')" width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="taxAmount" :label="$t('finance.invoice.taxAmount')" width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="totalAmount" :label="$t('finance.invoice.totalAmount')" width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column prop="invoiceDate" :label="$t('finance.invoice.invoiceDate')" width="120" />
        <el-table-column prop="status" :label="$t('finance.invoice.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'info'">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operation')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
        class="pagination"
      />
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('finance.invoice.invoiceNo')" prop="invoiceNo">
          <el-input v-model="form.invoiceNo" />
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.customerId')" prop="customerId">
          <el-input v-model="form.customerId" />
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.invoiceType')" prop="invoiceType">
          <el-select v-model="form.invoiceType" style="width:100%">
            <el-option :label="$t('finance.invoice.typeNormal')" value="NORMAL" />
            <el-option :label="$t('finance.invoice.typeSpecial')" value="SPECIAL" />
            <el-option :label="$t('finance.invoice.typeElectronic')" value="ELECTRONIC" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.direction')" prop="direction">
          <el-radio-group v-model="form.direction">
            <el-radio value="INPUT">{{ $t('finance.invoice.input') }}</el-radio>
            <el-radio value="OUTPUT">{{ $t('finance.invoice.output') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.amount')" prop="amount">
          <el-input-number v-model="form.amount" :precision="2" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.taxAmount')" prop="taxAmount">
          <el-input-number v-model="form.taxAmount" :precision="2" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.totalAmount')" prop="totalAmount">
          <el-input-number v-model="form.totalAmount" :precision="2" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('finance.invoice.invoiceDate')" prop="invoiceDate">
          <el-date-picker v-model="form.invoiceDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { invoiceApi } from '@/api/finance'

const { t } = useI18n()

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const activeTab = ref('all')

const stats = reactive({ inputTotal: 0, outputTotal: 0 })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  invoiceNo: '',
  customerId: '',
  invoiceType: '',
  direction: '',
  dateRange: [] as string[]
})

const form = reactive({
  id: undefined as number | undefined,
  invoiceNo: '',
  customerId: '',
  invoiceType: '',
  direction: 'INPUT',
  amount: 0,
  taxAmount: 0,
  totalAmount: 0,
  invoiceDate: ''
})

const rules = {
  invoiceNo: [{ required: true, message: () => t('common.pleaseInput'), trigger: 'blur' }],
  invoiceType: [{ required: true, message: () => t('common.pleaseSelect'), trigger: 'change' }],
  direction: [{ required: true, message: () => t('common.pleaseSelect'), trigger: 'change' }],
  amount: [{ required: true, message: () => t('common.pleaseInput'), trigger: 'blur' }]
}

function getInvoiceTypeLabel(type: string) {
  const map: Record<string, string> = { NORMAL: t('finance.invoice.typeNormal'), SPECIAL: t('finance.invoice.typeSpecial'), ELECTRONIC: t('finance.invoice.typeElectronic') }
  return map[type] || type
}

function getStatusLabel(status: number) {
  const map: Record<number, string> = { 0: t('finance.invoice.statusDraft'), 1: t('finance.invoice.statusValid'), 2: t('finance.invoice.statusVoid') }
  return map[status] || ''
}

function formatAmount(val: number) {
  return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
}

async function getList() {
  loading.value = true
  try {
    const params = { ...queryParams, direction: activeTab.value === 'all' ? '' : activeTab.value }
    const res = await invoiceApi.list(params)
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

async function getStats() {
  try {
    const res = await invoiceApi.stats()
    stats.inputTotal = res.data?.inputTotal || 0
    stats.outputTotal = res.data?.outputTotal || 0
  } catch (e) { /* ignore */ }
}

function handleTabChange() {
  queryParams.pageNum = 1
  getList()
}

function handleSearch() {
  queryParams.pageNum = 1
  getList()
}

function handleReset() {
  queryParams.invoiceNo = ''
  queryParams.customerId = ''
  queryParams.invoiceType = ''
  queryParams.dateRange = []
  handleSearch()
}

function handleAdd() {
  dialogTitle.value = t('common.add')
  Object.assign(form, { id: undefined, invoiceNo: '', customerId: '', invoiceType: '', direction: 'INPUT', amount: 0, taxAmount: 0, totalAmount: 0, invoiceDate: '' })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  dialogTitle.value = t('common.edit')
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (form.id) {
      await invoiceApi.update(form)
    } else {
      await invoiceApi.add(form)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    getList()
    getStats()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirm'))
  await invoiceApi.remove(row.id)
  ElMessage.success(t('common.success'))
  getList()
  getStats()
}

onMounted(() => {
  getList()
  getStats()
})
</script>

<style scoped>
.finance-invoice {
  padding: 16px;
}
.stats-row {
  margin-bottom: 16px;
}
.stat-card {
  text-align: center;
}
.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #F26522;
}
.input-color {
  color: #67c23a;
}
.output-color {
  color: #e6a23c;
}
.search-form {
  margin-bottom: 16px;
}
.toolbar {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
