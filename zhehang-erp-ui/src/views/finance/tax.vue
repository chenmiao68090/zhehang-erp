<template>
  <div class="finance-tax">
    <!-- Search -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item :label="$t('finance.tax.customerId')">
          <el-input v-model="queryParams.customerId" :placeholder="$t('common.pleaseInput')" clearable />
        </el-form-item>
        <el-form-item :label="$t('finance.tax.taxType')">
          <el-select v-model="queryParams.taxType" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option :label="$t('finance.tax.typeVat')" value="VAT" />
            <el-option :label="$t('finance.tax.typeCorporate')" value="CORPORATE" />
            <el-option :label="$t('finance.tax.typePersonal')" value="PERSONAL" />
            <el-option :label="$t('finance.tax.typeStamp')" value="STAMP" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('finance.tax.period')">
          <el-date-picker v-model="queryParams.period" type="month" value-format="YYYY-MM" :placeholder="$t('common.pleaseSelect')" />
        </el-form-item>
        <el-form-item :label="$t('finance.tax.status')">
          <el-select v-model="queryParams.status" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option :label="$t('finance.tax.statusPending')" :value="0" />
            <el-option :label="$t('finance.tax.statusDeclared')" :value="1" />
            <el-option :label="$t('finance.tax.statusPaid')" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('finance.tax.title') }}</span>
          <el-button type="primary" @click="handleAdd">{{ $t('common.add') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="customerId" :label="$t('finance.tax.customerId')" width="120" />
        <el-table-column prop="taxType" :label="$t('finance.tax.taxType')" width="120">
          <template #default="{ row }">{{ getTaxTypeLabel(row.taxType) }}</template>
        </el-table-column>
        <el-table-column prop="period" :label="$t('finance.tax.period')" width="100" />
        <el-table-column prop="taxableAmount" :label="$t('finance.tax.taxableAmount')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.taxableAmount) }}</template>
        </el-table-column>
        <el-table-column prop="taxRate" :label="$t('finance.tax.taxRate')" width="100" align="right">
          <template #default="{ row }">{{ (row.taxRate * 100).toFixed(1) }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" :label="$t('finance.tax.taxAmount')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.taxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('finance.tax.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" :label="$t('finance.tax.deadline')" width="120">
          <template #default="{ row }">
            <span :class="{ 'overdue-text': isOverdue(row) }">{{ row.deadline }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operation')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)" v-if="row.status === 0">{{ $t('common.edit') }}</el-button>
            <el-button link type="success" @click="handleDeclare(row)" v-if="row.status === 0">{{ $t('finance.tax.declare') }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-if="row.status === 0">{{ $t('common.delete') }}</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('finance.tax.customerId')" prop="customerId">
          <el-input v-model="form.customerId" />
        </el-form-item>
        <el-form-item :label="$t('finance.tax.taxType')" prop="taxType">
          <el-select v-model="form.taxType" style="width:100%">
            <el-option :label="$t('finance.tax.typeVat')" value="VAT" />
            <el-option :label="$t('finance.tax.typeCorporate')" value="CORPORATE" />
            <el-option :label="$t('finance.tax.typePersonal')" value="PERSONAL" />
            <el-option :label="$t('finance.tax.typeStamp')" value="STAMP" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('finance.tax.period')" prop="period">
          <el-date-picker v-model="form.period" type="month" value-format="YYYY-MM" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('finance.tax.taxableAmount')" prop="taxableAmount">
          <el-input-number v-model="form.taxableAmount" :precision="2" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('finance.tax.taxRate')" prop="taxRate">
          <el-input-number v-model="form.taxRate" :precision="4" :min="0" :max="1" :step="0.01" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('finance.tax.taxAmount')" prop="taxAmount">
          <el-input-number v-model="form.taxAmount" :precision="2" :min="0" style="width:100%" />
        </el-form-item>
        <el-form-item :label="$t('finance.tax.deadline')" prop="deadline">
          <el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" style="width:100%" />
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
import { taxApi } from '@/api/finance'

const { t } = useI18n()

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  customerId: '',
  taxType: '',
  period: '',
  status: undefined as number | undefined
})

const form = reactive({
  id: undefined as number | undefined,
  customerId: '',
  taxType: '',
  period: '',
  taxableAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  deadline: ''
})

const rules = {
  taxType: [{ required: true, message: () => t('common.pleaseSelect'), trigger: 'change' }],
  period: [{ required: true, message: () => t('common.pleaseSelect'), trigger: 'change' }],
  taxableAmount: [{ required: true, message: () => t('common.pleaseInput'), trigger: 'blur' }]
}

function getTaxTypeLabel(type: string) {
  const map: Record<string, string> = { VAT: t('finance.tax.typeVat'), CORPORATE: t('finance.tax.typeCorporate'), PERSONAL: t('finance.tax.typePersonal'), STAMP: t('finance.tax.typeStamp') }
  return map[type] || type
}

function getStatusLabel(status: number) {
  const map: Record<number, string> = { 0: t('finance.tax.statusPending'), 1: t('finance.tax.statusDeclared'), 2: t('finance.tax.statusPaid') }
  return map[status] || ''
}

function getStatusType(status: number) {
  const map: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success' }
  return map[status] || 'info'
}

function isOverdue(row: any) {
  return row.status === 0 && row.deadline && new Date(row.deadline) < new Date()
}

function formatAmount(val: number) {
  return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
}

async function getList() {
  loading.value = true
  try {
    const res = await taxApi.list(queryParams)
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.pageNum = 1
  getList()
}

function handleReset() {
  queryParams.customerId = ''
  queryParams.taxType = ''
  queryParams.period = ''
  queryParams.status = undefined
  handleSearch()
}

function handleAdd() {
  dialogTitle.value = t('common.add')
  Object.assign(form, { id: undefined, customerId: '', taxType: '', period: '', taxableAmount: 0, taxRate: 0, taxAmount: 0, deadline: '' })
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
      await taxApi.update(form)
    } else {
      await taxApi.add(form)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

async function handleDeclare(row: any) {
  await ElMessageBox.confirm(t('finance.tax.confirmDeclare'), t('common.confirm'))
  await taxApi.declare(row.id)
  ElMessage.success(t('common.success'))
  getList()
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirm'))
  await taxApi.remove(row.id)
  ElMessage.success(t('common.success'))
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.finance-tax {
  padding: 16px;
}
.search-card {
  margin-bottom: 16px;
}
.table-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
.overdue-text {
  color: #f56c6c;
  font-weight: bold;
}
</style>
