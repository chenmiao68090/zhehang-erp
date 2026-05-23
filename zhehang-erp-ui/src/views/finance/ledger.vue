<template>
  <div class="finance-ledger">
    <el-card shadow="never">
      <!-- Tabs -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane :label="$t('finance.ledger.general')" name="general" />
        <el-tab-pane :label="$t('finance.ledger.detail')" name="detail" />
        <el-tab-pane :label="$t('finance.ledger.balance')" name="balance" />
        <el-tab-pane :label="$t('finance.ledger.journal')" name="journal" />
      </el-tabs>

      <!-- Search -->
      <el-form :model="queryParams" inline class="search-form">
        <el-form-item :label="$t('finance.ledger.subjectCode')">
          <el-input v-model="queryParams.subjectCode" :placeholder="$t('common.pleaseInput')" clearable />
        </el-form-item>
        <el-form-item :label="$t('finance.ledger.period')">
          <el-date-picker v-model="queryParams.periodRange" type="monthrange" value-format="YYYY-MM"
            :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>

      <!-- General Ledger Table -->
      <el-table v-if="activeTab === 'general'" :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="subjectCode" :label="$t('finance.ledger.subjectCode')" width="120" />
        <el-table-column prop="subjectName" :label="$t('finance.ledger.subjectName')" width="180" />
        <el-table-column prop="period" :label="$t('finance.ledger.period')" width="100" />
        <el-table-column prop="openingBalance" :label="$t('finance.ledger.openingBalance')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.openingBalance) }}</template>
        </el-table-column>
        <el-table-column prop="debitTotal" :label="$t('finance.ledger.debitTotal')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.debitTotal) }}</template>
        </el-table-column>
        <el-table-column prop="creditTotal" :label="$t('finance.ledger.creditTotal')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.creditTotal) }}</template>
        </el-table-column>
        <el-table-column prop="closingBalance" :label="$t('finance.ledger.closingBalance')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.closingBalance) }}</template>
        </el-table-column>
        <el-table-column prop="direction" :label="$t('finance.ledger.direction')" width="80">
          <template #default="{ row }">
            <el-tag :type="row.direction === 'DEBIT' ? 'warning' : 'success'" size="small">
              {{ row.direction === 'DEBIT' ? $t('finance.ledger.debit') : $t('finance.ledger.credit') }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Detail Ledger Table -->
      <el-table v-if="activeTab === 'detail'" :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="voucherDate" :label="$t('finance.ledger.date')" width="120" />
        <el-table-column prop="voucherNo" :label="$t('finance.voucher.voucherNo')" width="150" />
        <el-table-column prop="summary" :label="$t('finance.voucher.summary')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="debitAmount" :label="$t('finance.ledger.debitTotal')" width="130" align="right">
          <template #default="{ row }">{{ row.debitAmount ? formatAmount(row.debitAmount) : '' }}</template>
        </el-table-column>
        <el-table-column prop="creditAmount" :label="$t('finance.ledger.creditTotal')" width="130" align="right">
          <template #default="{ row }">{{ row.creditAmount ? formatAmount(row.creditAmount) : '' }}</template>
        </el-table-column>
        <el-table-column prop="direction" :label="$t('finance.ledger.direction')" width="80">
          <template #default="{ row }">
            {{ row.direction === 'DEBIT' ? $t('finance.ledger.debit') : $t('finance.ledger.credit') }}
          </template>
        </el-table-column>
        <el-table-column prop="balance" :label="$t('finance.ledger.closingBalance')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.balance) }}</template>
        </el-table-column>
      </el-table>

      <!-- Balance Sheet Table -->
      <el-table v-if="activeTab === 'balance'" :data="tableData" v-loading="loading" border stripe show-summary>
        <el-table-column prop="subjectCode" :label="$t('finance.ledger.subjectCode')" width="120" />
        <el-table-column prop="subjectName" :label="$t('finance.ledger.subjectName')" min-width="180" />
        <el-table-column prop="openingBalance" :label="$t('finance.ledger.openingBalance')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.openingBalance) }}</template>
        </el-table-column>
        <el-table-column prop="debitTotal" :label="$t('finance.ledger.debitTotal')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.debitTotal) }}</template>
        </el-table-column>
        <el-table-column prop="creditTotal" :label="$t('finance.ledger.creditTotal')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.creditTotal) }}</template>
        </el-table-column>
        <el-table-column prop="closingBalance" :label="$t('finance.ledger.closingBalance')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.closingBalance) }}</template>
        </el-table-column>
      </el-table>

      <!-- Journal Table -->
      <el-table v-if="activeTab === 'journal'" :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="voucherDate" :label="$t('finance.ledger.date')" width="120" />
        <el-table-column prop="voucherNo" :label="$t('finance.voucher.voucherNo')" width="150" />
        <el-table-column prop="subjectName" :label="$t('finance.ledger.subjectName')" width="150" />
        <el-table-column prop="summary" :label="$t('finance.voucher.summary')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="debitAmount" :label="$t('finance.ledger.debitTotal')" width="130" align="right">
          <template #default="{ row }">{{ row.debitAmount ? formatAmount(row.debitAmount) : '' }}</template>
        </el-table-column>
        <el-table-column prop="creditAmount" :label="$t('finance.ledger.creditTotal')" width="130" align="right">
          <template #default="{ row }">{{ row.creditAmount ? formatAmount(row.creditAmount) : '' }}</template>
        </el-table-column>
        <el-table-column prop="balance" :label="$t('finance.ledger.closingBalance')" width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.balance) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ledgerApi } from '@/api/finance'

const { t } = useI18n()

const loading = ref(false)
const activeTab = ref('general')
const tableData = ref<any[]>([])

const queryParams = reactive({
  subjectCode: '',
  periodRange: [] as string[]
})

function formatAmount(val: number) {
  return val != null ? Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'
}

async function getList() {
  loading.value = true
  try {
    const params = {
      subjectCode: queryParams.subjectCode,
      startPeriod: queryParams.periodRange?.[0] || '',
      endPeriod: queryParams.periodRange?.[1] || ''
    }
    let res: any
    switch (activeTab.value) {
      case 'general':
        res = await ledgerApi.general(params)
        break
      case 'detail':
        res = await ledgerApi.detail(params)
        break
      case 'balance':
        res = await ledgerApi.balance(params)
        break
      case 'journal':
        res = await ledgerApi.journal(params)
        break
    }
    tableData.value = res?.data || []
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  getList()
}

function handleSearch() {
  getList()
}

function handleReset() {
  queryParams.subjectCode = ''
  queryParams.periodRange = []
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.finance-ledger {
  padding: 16px;
}
.search-form {
  margin-bottom: 16px;
}
</style>
