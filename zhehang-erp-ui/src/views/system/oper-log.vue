<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" :inline="true">
        <el-form-item :label="$t('system.operLog.module')" prop="module">
          <el-input v-model="queryParams.module" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.operLog.operType')" prop="operType">
          <el-select v-model="queryParams.operType" :placeholder="$t('common.selectPlaceholder')" clearable>
            <el-option :label="$t('system.operLog.typeInsert')" value="INSERT" />
            <el-option :label="$t('system.operLog.typeUpdate')" value="UPDATE" />
            <el-option :label="$t('system.operLog.typeDelete')" value="DELETE" />
            <el-option :label="$t('system.operLog.typeExport')" value="EXPORT" />
            <el-option :label="$t('system.operLog.typeOther')" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('system.operLog.operator')" prop="operator">
          <el-input v-model="queryParams.operator" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.operLog.operTime')" prop="dateRange">
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
          <span>{{ $t('system.operLog.title') }}</span>
          <div class="toolbar-btns">
            <el-button type="warning" v-hasPermi="['log:oper:export', 'system:log:export']" @click="handleExport"><el-icon><Download /></el-icon>{{ $t('common.export') }}</el-button>
            <el-button type="danger" v-hasPermi="['log:oper:remove', 'system:log:remove']" @click="handleClean"><el-icon><Delete /></el-icon>{{ $t('common.clean') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="logList" border stripe @row-click="handleRowClick">
        <el-table-column :label="$t('system.operLog.module')" prop="module" min-width="120" />
        <el-table-column :label="$t('system.operLog.operType')" prop="operType" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getOperTypeTag(row.operType)">{{ getOperTypeLabel(row.operType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.operLog.operator')" prop="operator" min-width="120" />
        <el-table-column label="身份视角" min-width="190">
          <template #default="{ row }">
            <span v-if="!row.impersonationSessionId" class="normal-identity">本人操作</span>
            <el-tag v-else type="warning" effect="plain">
              {{ row.actorUsername || row.operator || '超级管理员' }} → {{ row.effectiveUsername || row.effectiveUserId || '员工' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.operLog.ipAddr')" prop="ipAddr" min-width="140" />
        <el-table-column :label="$t('system.operLog.operTime')" prop="operTime" width="180" align="center" />
        <el-table-column :label="$t('system.operLog.status')" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? $t('common.success') : $t('common.failed') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.operLog.costTime')" prop="costTime" width="100" align="center">
          <template #default="{ row }">
            {{ row.costTime }}ms
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pagination" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" :title="$t('system.operLog.detail')" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('system.operLog.module')">{{ detailData.module }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.operType')">{{ getOperTypeLabel(detailData.operType) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.operator')">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.ipAddr')">{{ detailData.ipAddr }}</el-descriptions-item>
        <template v-if="detailData.impersonationSessionId">
          <el-descriptions-item label="实际操作人">
            {{ detailData.actorUsername || detailData.operator }}（ID：{{ detailData.actorUserId || detailData.operatorId }}）
          </el-descriptions-item>
          <el-descriptions-item label="被模拟员工">
            {{ detailData.effectiveUsername || '-' }}（ID：{{ detailData.effectiveUserId || '-' }}）
          </el-descriptions-item>
          <el-descriptions-item label="代登录会话" :span="2">
            <code>{{ detailData.impersonationSessionId }}</code>
          </el-descriptions-item>
        </template>
        <el-descriptions-item :label="$t('system.operLog.requestUri')" :span="2">{{ detailData.requestUri }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.requestMethod')" :span="2">{{ detailData.requestMethod }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.requestParams')" :span="2">
          <el-input type="textarea" :model-value="detailData.requestParams" :rows="4" readonly />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.responseResult')" :span="2">
          <el-input type="textarea" :model-value="detailData.responseResult" :rows="4" readonly />
        </el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.status')">
          <el-tag :type="detailData.status === 0 ? 'success' : 'danger'">{{ detailData.status === 0 ? $t('common.success') : $t('common.failed') }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.costTime')">{{ detailData.costTime }}ms</el-descriptions-item>
        <el-descriptions-item v-if="detailData.errorMsg" :label="$t('system.operLog.errorMsg')" :span="2">
          <span style="color: #f56c6c;">{{ detailData.errorMsg }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('system.operLog.operTime')" :span="2">{{ detailData.operTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">{{ $t('common.close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { operLogApi } from '@/api/system'
import { downloadBlob } from '@/utils/download'

const { t } = useI18n()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  module: '',
  operType: '',
  operator: ''
})
const dateRange = ref<string[]>([])
const loading = ref(false)
const total = ref(0)
const logList = ref<any[]>([])

const detailVisible = ref(false)
const detailData = ref<any>({})

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
    const res: any = await operLogApi.list(params)
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
  queryParams.module = ''
  queryParams.operType = ''
  queryParams.operator = ''
  dateRange.value = []
  handleQuery()
}

async function handleExport() {
  const data = await operLogApi.export(buildQueryParams())
  downloadBlob(data as Blob, `operation-logs-${Date.now()}.csv`)
  ElMessage.success(t('common.success'))
}

async function handleRowClick(row: any) {
  try {
    const res: any = await operLogApi.detail(row.id)
    detailData.value = res.data || row
  } catch (_e) {
    detailData.value = row
  }
  detailVisible.value = true
}

function handleClean() {
  ElMessageBox.confirm(t('system.operLog.cleanConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await operLogApi.clean()
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

function getOperTypeTag(type: string): string {
  const map: Record<string, string> = {
    INSERT: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
    EXPORT: 'info',
    QUERY: '',
    OTHER: 'info'
  }
  return map[type] || 'info'
}

function getOperTypeLabel(type: string): string {
  const map: Record<string, string> = {
    INSERT: t('system.operLog.typeInsert'),
    UPDATE: t('system.operLog.typeUpdate'),
    DELETE: t('system.operLog.typeDelete'),
    EXPORT: t('system.operLog.typeExport'),
    QUERY: t('system.operLog.typeQuery'),
    OTHER: t('system.operLog.typeOther')
  }
  return map[type] || type || '-'
}
</script>

<style scoped>
.normal-identity {
  color: var(--text-secondary);
  font-size: 12px;
}
</style>

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
