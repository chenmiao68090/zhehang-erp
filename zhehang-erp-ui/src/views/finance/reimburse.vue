<template>
  <div class="finance-reimburse">
    <!-- Search -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item :label="$t('finance.reimburse.reimburseNo')">
          <el-input v-model="queryParams.reimburseNo" :placeholder="$t('common.pleaseInput')" clearable />
        </el-form-item>
        <el-form-item :label="$t('finance.reimburse.applicant')">
          <el-input v-model="queryParams.applicantId" :placeholder="$t('common.pleaseInput')" clearable />
        </el-form-item>
        <el-form-item :label="$t('finance.reimburse.status')">
          <el-select v-model="queryParams.status" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option :label="$t('finance.reimburse.statusDraft')" :value="0" />
            <el-option :label="$t('finance.reimburse.statusPending')" :value="1" />
            <el-option :label="$t('finance.reimburse.statusApproved')" :value="2" />
            <el-option :label="$t('finance.reimburse.statusRejected')" :value="3" />
            <el-option :label="$t('finance.reimburse.statusPaid')" :value="4" />
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
          <span>{{ $t('finance.reimburse.title') }}</span>
          <el-button type="primary" @click="handleAdd">{{ $t('common.add') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="reimburseNo" :label="$t('finance.reimburse.reimburseNo')" width="180" />
        <el-table-column prop="title" :label="$t('finance.reimburse.expenseTitle')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="applicantId" :label="$t('finance.reimburse.applicant')" width="120" />
        <el-table-column prop="totalAmount" :label="$t('finance.reimburse.totalAmount')" width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('finance.reimburse.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('finance.reimburse.applyTime')" width="170" />
        <el-table-column :label="$t('common.operation')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">{{ $t('common.view') }}</el-button>
            <el-button link type="primary" @click="handleEdit(row)" v-if="row.status === 0">{{ $t('common.edit') }}</el-button>
            <el-button link type="success" @click="handleApprove(row, true)" v-if="row.status === 1">{{ $t('finance.reimburse.approve') }}</el-button>
            <el-button link type="danger" @click="handleApprove(row, false)" v-if="row.status === 1">{{ $t('finance.reimburse.reject') }}</el-button>
            <el-button link type="warning" @click="handlePay(row)" v-if="row.status === 2">{{ $t('finance.reimburse.pay') }}</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item :label="$t('finance.reimburse.expenseTitle')" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item :label="$t('finance.reimburse.remark')">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>

        <!-- Detail Items -->
        <div class="detail-section">
          <div class="detail-header">
            <span>{{ $t('finance.reimburse.details') }}</span>
            <el-button type="primary" size="small" @click="addDetail">{{ $t('common.add') }}</el-button>
          </div>
          <el-table :data="form.details" border size="small">
            <el-table-column :label="$t('finance.reimburse.expenseType')" width="150">
              <template #default="{ row }">
                <el-select v-model="row.expenseType" size="small">
                  <el-option :label="$t('finance.reimburse.typeTravel')" value="TRAVEL" />
                  <el-option :label="$t('finance.reimburse.typeMeal')" value="MEAL" />
                  <el-option :label="$t('finance.reimburse.typeTransport')" value="TRANSPORT" />
                  <el-option :label="$t('finance.reimburse.typeOffice')" value="OFFICE" />
                  <el-option :label="$t('finance.reimburse.typeOther')" value="OTHER" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="$t('finance.reimburse.amount')" width="130">
              <template #default="{ row }">
                <el-input-number v-model="row.amount" :precision="2" :min="0" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('finance.reimburse.description')" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.description" size="small" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.operation')" width="60">
              <template #default="{ $index }">
                <el-button link type="danger" @click="removeDetail($index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="detail-total">
            {{ $t('finance.reimburse.totalAmount') }}: <span class="amount">{{ formatAmount(computedTotal) }}</span>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { reimburseApi } from '@/api/finance'

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
  reimburseNo: '',
  applicantId: '',
  status: undefined as number | undefined
})

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  remark: '',
  details: [] as any[]
})

const rules = {
  title: [{ required: true, message: () => t('common.pleaseInput'), trigger: 'blur' }]
}

const computedTotal = computed(() => {
  return form.details.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
})

function getStatusLabel(status: number) {
  const map: Record<number, string> = {
    0: t('finance.reimburse.statusDraft'),
    1: t('finance.reimburse.statusPending'),
    2: t('finance.reimburse.statusApproved'),
    3: t('finance.reimburse.statusRejected'),
    4: t('finance.reimburse.statusPaid')
  }
  return map[status] || ''
}

function getStatusType(status: number) {
  const map: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: '' }
  return map[status] || 'info'
}

function formatAmount(val: number) {
  return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
}

function addDetail() {
  form.details.push({ expenseType: '', amount: 0, description: '' })
}

function removeDetail(index: number) {
  form.details.splice(index, 1)
}

async function getList() {
  loading.value = true
  try {
    const res = await reimburseApi.list(queryParams)
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
  queryParams.reimburseNo = ''
  queryParams.applicantId = ''
  queryParams.status = undefined
  handleSearch()
}

function handleAdd() {
  dialogTitle.value = t('common.add')
  Object.assign(form, { id: undefined, title: '', remark: '', details: [] })
  addDetail()
  dialogVisible.value = true
}

function handleEdit(row: any) {
  dialogTitle.value = t('common.edit')
  Object.assign(form, { ...row, details: row.details || [] })
  dialogVisible.value = true
}

function handleView(row: any) {
  dialogTitle.value = t('common.view')
  Object.assign(form, { ...row, details: row.details || [] })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    const data = { ...form, totalAmount: computedTotal.value }
    if (form.id) {
      await reimburseApi.update(data)
    } else {
      await reimburseApi.submit(data)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

async function handleApprove(row: any, approved: boolean) {
  const msg = approved ? t('finance.reimburse.confirmApprove') : t('finance.reimburse.confirmReject')
  await ElMessageBox.confirm(msg, t('common.confirm'))
  await reimburseApi.approve({ id: row.id, approved })
  ElMessage.success(t('common.success'))
  getList()
}

async function handlePay(row: any) {
  await ElMessageBox.confirm(t('finance.reimburse.confirmPay'), t('common.confirm'))
  await reimburseApi.pay(row.id)
  ElMessage.success(t('common.success'))
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.finance-reimburse {
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
.detail-section {
  margin-top: 16px;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
}
.detail-total {
  margin-top: 8px;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  font-weight: bold;
}
.detail-total .amount {
  color: #F26522;
  font-size: 18px;
}
</style>
