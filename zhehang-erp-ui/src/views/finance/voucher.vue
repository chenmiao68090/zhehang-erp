<template>
  <div class="finance-voucher">
    <!-- Search Bar -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item :label="$t('finance.voucher.voucherNo')">
          <el-input v-model="queryParams.voucherNo" :placeholder="$t('common.pleaseInput')" clearable />
        </el-form-item>
        <el-form-item :label="$t('finance.voucher.period')">
          <el-date-picker v-model="queryParams.period" type="month" value-format="YYYY-MM" :placeholder="$t('common.pleaseSelect')" />
        </el-form-item>
        <el-form-item :label="$t('finance.voucher.voucherType')">
          <el-select v-model="queryParams.voucherType" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option :label="$t('finance.voucher.typeJi')" value="JI" />
            <el-option :label="$t('finance.voucher.typeShou')" value="SHOU" />
            <el-option :label="$t('finance.voucher.typeFu')" value="FU" />
            <el-option :label="$t('finance.voucher.typeZhuan')" value="ZHUAN" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('finance.voucher.status')">
          <el-select v-model="queryParams.status" :placeholder="$t('common.pleaseSelect')" clearable>
            <el-option :label="$t('finance.voucher.statusDraft')" :value="0" />
            <el-option :label="$t('finance.voucher.statusAudited')" :value="1" />
            <el-option :label="$t('finance.voucher.statusPosted')" :value="2" />
            <el-option :label="$t('finance.voucher.statusVoid')" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Toolbar -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('finance.voucher.title') }}</span>
          <el-button type="primary" @click="handleAdd">{{ $t('common.add') }}</el-button>
        </div>
      </template>

      <!-- Table -->
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="voucherNo" :label="$t('finance.voucher.voucherNo')" width="150" />
        <el-table-column prop="voucherDate" :label="$t('finance.voucher.voucherDate')" width="120" />
        <el-table-column prop="voucherType" :label="$t('finance.voucher.voucherType')" width="80">
          <template #default="{ row }">
            <el-tag>{{ getTypeLabel(row.voucherType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="summary" :label="$t('finance.voucher.summary')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="totalDebit" :label="$t('finance.voucher.totalDebit')" width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.totalDebit) }}</template>
        </el-table-column>
        <el-table-column prop="totalCredit" :label="$t('finance.voucher.totalCredit')" width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.totalCredit) }}</template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('finance.voucher.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operation')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">{{ $t('common.view') }}</el-button>
            <el-button link type="primary" @click="handleEdit(row)" v-if="row.status === 0">{{ $t('common.edit') }}</el-button>
            <el-button link type="success" @click="handleAudit(row)" v-if="row.status === 0">{{ $t('finance.voucher.audit') }}</el-button>
            <el-button link type="warning" @click="handlePost(row)" v-if="row.status === 1">{{ $t('finance.voucher.post') }}</el-button>
            <el-button link type="danger" @click="handleVoid(row)" v-if="row.status < 3">{{ $t('finance.voucher.void') }}</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('finance.voucher.voucherNo')" prop="voucherNo">
              <el-input v-model="form.voucherNo" disabled :placeholder="$t('finance.voucher.autoGenerate')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('finance.voucher.voucherDate')" prop="voucherDate">
              <el-date-picker v-model="form.voucherDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('finance.voucher.voucherType')" prop="voucherType">
              <el-select v-model="form.voucherType" style="width:100%">
                <el-option :label="$t('finance.voucher.typeJi')" value="JI" />
                <el-option :label="$t('finance.voucher.typeShou')" value="SHOU" />
                <el-option :label="$t('finance.voucher.typeFu')" value="FU" />
                <el-option :label="$t('finance.voucher.typeZhuan')" value="ZHUAN" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('finance.voucher.summary')" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="2" />
        </el-form-item>

        <!-- Entry Table -->
        <div class="entry-section">
          <div class="entry-header">
            <span>{{ $t('finance.voucher.entries') }}</span>
            <el-button type="primary" size="small" @click="addEntry">{{ $t('common.add') }}</el-button>
          </div>
          <el-table :data="form.entries" border size="small">
            <el-table-column :label="$t('finance.voucher.subjectCode')" width="150">
              <template #default="{ row }">
                <el-input v-model="row.subjectCode" size="small" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('finance.voucher.subjectName')" width="150">
              <template #default="{ row }">
                <el-input v-model="row.subjectName" size="small" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('finance.voucher.summary')" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.summary" size="small" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('finance.voucher.debitAmount')" width="130">
              <template #default="{ row }">
                <el-input-number v-model="row.debitAmount" :precision="2" :min="0" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('finance.voucher.creditAmount')" width="130">
              <template #default="{ row }">
                <el-input-number v-model="row.creditAmount" :precision="2" :min="0" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.operation')" width="60">
              <template #default="{ $index }">
                <el-button link type="danger" @click="removeEntry($index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- Totals -->
          <div class="entry-totals" :class="{ unbalanced: !isBalanced }">
            <span>{{ $t('finance.voucher.totalDebit') }}: {{ formatAmount(debitTotal) }}</span>
            <span>{{ $t('finance.voucher.totalCredit') }}: {{ formatAmount(creditTotal) }}</span>
            <span v-if="!isBalanced" class="warning-text">{{ $t('finance.voucher.unbalanced') }}</span>
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
import { voucherApi } from '@/api/finance'

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
  voucherNo: '',
  period: '',
  voucherType: '',
  status: undefined as number | undefined
})

const form = reactive({
  id: undefined as number | undefined,
  voucherNo: '',
  voucherDate: '',
  voucherType: 'JI',
  summary: '',
  entries: [] as any[]
})

const rules = {
  voucherDate: [{ required: true, message: () => t('common.pleaseSelect'), trigger: 'change' }],
  voucherType: [{ required: true, message: () => t('common.pleaseSelect'), trigger: 'change' }]
}

const debitTotal = computed(() => {
  return form.entries.reduce((sum: number, e: any) => sum + (e.debitAmount || 0), 0)
})

const creditTotal = computed(() => {
  return form.entries.reduce((sum: number, e: any) => sum + (e.creditAmount || 0), 0)
})

const isBalanced = computed(() => {
  return Math.abs(debitTotal.value - creditTotal.value) < 0.01
})

function getTypeLabel(type: string) {
  const map: Record<string, string> = { JI: t('finance.voucher.typeJi'), SHOU: t('finance.voucher.typeShou'), FU: t('finance.voucher.typeFu'), ZHUAN: t('finance.voucher.typeZhuan') }
  return map[type] || type
}

function getStatusLabel(status: number) {
  const map: Record<number, string> = { 0: t('finance.voucher.statusDraft'), 1: t('finance.voucher.statusAudited'), 2: t('finance.voucher.statusPosted'), 3: t('finance.voucher.statusVoid') }
  return map[status] || ''
}

function getStatusType(status: number) {
  const map: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

function formatAmount(val: number) {
  return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
}

function addEntry() {
  form.entries.push({ subjectCode: '', subjectName: '', summary: '', debitAmount: 0, creditAmount: 0 })
}

function removeEntry(index: number) {
  form.entries.splice(index, 1)
}

async function getList() {
  loading.value = true
  try {
    const res = await voucherApi.list(queryParams)
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
  queryParams.voucherNo = ''
  queryParams.period = ''
  queryParams.voucherType = ''
  queryParams.status = undefined
  handleSearch()
}

function handleAdd() {
  dialogTitle.value = t('common.add')
  Object.assign(form, { id: undefined, voucherNo: '', voucherDate: '', voucherType: 'JI', summary: '', entries: [] })
  addEntry()
  dialogVisible.value = true
}

function handleEdit(row: any) {
  dialogTitle.value = t('common.edit')
  Object.assign(form, { ...row, entries: row.entries || [] })
  dialogVisible.value = true
}

function handleView(row: any) {
  dialogTitle.value = t('common.view')
  Object.assign(form, { ...row, entries: row.entries || [] })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!isBalanced.value) {
    ElMessage.warning(t('finance.voucher.unbalanced'))
    return
  }
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    const data = { ...form, totalDebit: debitTotal.value, totalCredit: creditTotal.value }
    if (form.id) {
      await voucherApi.update(data)
    } else {
      await voucherApi.add(data)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

async function handleAudit(row: any) {
  await ElMessageBox.confirm(t('finance.voucher.confirmAudit'), t('common.confirm'))
  await voucherApi.audit(row.id)
  ElMessage.success(t('common.success'))
  getList()
}

async function handlePost(row: any) {
  await ElMessageBox.confirm(t('finance.voucher.confirmPost'), t('common.confirm'))
  await voucherApi.post(row.id)
  ElMessage.success(t('common.success'))
  getList()
}

async function handleVoid(row: any) {
  await ElMessageBox.confirm(t('finance.voucher.confirmVoid'), t('common.confirm'))
  await voucherApi.voidVoucher(row.id)
  ElMessage.success(t('common.success'))
  getList()
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(t('common.confirmDelete'), t('common.confirm'))
  await voucherApi.remove(row.id)
  ElMessage.success(t('common.success'))
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.finance-voucher {
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
.entry-section {
  margin-top: 16px;
}
.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
}
.entry-totals {
  display: flex;
  gap: 24px;
  margin-top: 8px;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 4px;
  font-weight: bold;
}
.entry-totals.unbalanced {
  background: #fef0f0;
  color: #f56c6c;
}
.warning-text {
  color: #f56c6c;
}
</style>
