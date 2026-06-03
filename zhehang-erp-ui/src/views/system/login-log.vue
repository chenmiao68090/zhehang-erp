<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" :inline="true">
        <el-form-item :label="$t('system.loginLog.username')" prop="username">
          <el-input v-model="queryParams.username" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.loginLog.ipAddr')" prop="ipAddr">
          <el-input v-model="queryParams.ipAddr" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.loginLog.status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('common.selectPlaceholder')" clearable>
            <el-option :label="$t('common.success')" :value="0" />
            <el-option :label="$t('common.failed')" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('system.loginLog.loginTime')" prop="dateRange">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="-" :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>{{ $t('common.search') }}</el-button>
          <el-button @click="resetQuery"><el-icon><Refresh /></el-icon>{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('system.loginLog.title') }}</span>
          <div class="toolbar-btns">
            <el-button type="warning" v-hasPermi="['log:login:export', 'system:log:export']" @click="handleExport"><el-icon><Download /></el-icon>{{ $t('common.export') }}</el-button>
            <el-button type="danger" v-hasPermi="['log:login:remove', 'system:log:remove']" @click="handleClean"><el-icon><Delete /></el-icon>{{ $t('common.clean') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="logList" border stripe>
        <el-table-column :label="$t('system.loginLog.username')" prop="username" min-width="120" />
        <el-table-column :label="$t('system.loginLog.ipAddr')" prop="ipAddr" min-width="140" />
        <el-table-column :label="$t('system.loginLog.loginLocation')" prop="loginLocation" min-width="150" />
        <el-table-column :label="$t('system.loginLog.browser')" prop="browser" min-width="120" />
        <el-table-column :label="$t('system.loginLog.os')" prop="os" min-width="120" />
        <el-table-column :label="$t('system.loginLog.status')" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? $t('common.success') : $t('common.failed') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.loginLog.msg')" prop="msg" min-width="150" show-overflow-tooltip />
        <el-table-column :label="$t('system.loginLog.loginTime')" prop="loginTime" width="180" align="center" />
      </el-table>

      <el-pagination class="pagination" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { loginLogApi } from '@/api/system'
import { downloadBlob } from '@/utils/download'

const { t } = useI18n()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  username: '',
  ipAddr: '',
  status: undefined as number | undefined
})
const dateRange = ref<string[]>([])
const loading = ref(false)
const total = ref(0)
const logList = ref<any[]>([])

onMounted(() => {
  getList()
})

async function getList() {
  loading.value = true
  try {
    const params: any = { ...queryParams }
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const res: any = await loginLogApi.list(params)
    logList.value = res.data?.records || res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.username = ''
  queryParams.ipAddr = ''
  queryParams.status = undefined
  dateRange.value = []
  handleQuery()
}

async function handleExport() {
  const data = await loginLogApi.export(buildQueryParams())
  downloadBlob(data as Blob, `login-logs-${Date.now()}.csv`)
  ElMessage.success(t('common.success'))
}

function handleClean() {
  ElMessageBox.confirm(t('system.loginLog.cleanConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await loginLogApi.clean()
    ElMessage.success(t('common.success'))
    getList()
  }).catch(() => {})
}

function buildQueryParams() {
  const params: any = { ...queryParams }
  if (dateRange.value && dateRange.value.length === 2) {
    params.beginTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }
  return params
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}
.search-card {
  margin-bottom: 16px;
}
.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .toolbar-btns {
    display: flex;
    gap: 8px;
  }
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
