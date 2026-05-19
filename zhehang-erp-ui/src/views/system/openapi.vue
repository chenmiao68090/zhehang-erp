<template>
  <div class="page-container openapi-page">
    <div class="page-header">
      <div class="header-title">
        <h2>{{ $t('openapi.title') }}</h2>
        <span class="subtitle">{{ $t('openapi.subtitle') }}</span>
      </div>
      <div class="header-actions">
        <el-button @click="openDocs" :icon="Document">{{ $t('openapi.viewDocs') }}</el-button>
        <el-button type="primary" @click="handleCreate" :icon="Plus">{{ $t('openapi.createApp') }}</el-button>
      </div>
    </div>

    <!-- 顶部统计 -->
    <div class="stats-row">
      <div class="stat-card brand">
        <div class="stat-icon"><el-icon :size="24"><Box /></el-icon></div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.appCount }}</div>
          <div class="stat-label">{{ $t('openapi.stats.appCount') }}</div>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon"><el-icon :size="24"><DataLine /></el-icon></div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.todayCalls }}</div>
          <div class="stat-label">{{ $t('openapi.stats.todayCalls') }}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon"><el-icon :size="24"><Lock /></el-icon></div>
        <div class="stat-body">
          <div class="stat-num">SHA-256</div>
          <div class="stat-label">{{ $t('openapi.stats.signAlgo') }}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon"><el-icon :size="24"><Stopwatch /></el-icon></div>
        <div class="stat-body">
          <div class="stat-num">{{ $t('openapi.stats.tokenBucket') }}</div>
          <div class="stat-label">{{ $t('openapi.stats.rateLimit') }}</div>
        </div>
      </div>
    </div>

    <!-- 应用表格 -->
    <el-card shadow="never" class="table-card">
      <div class="card-toolbar">
        <el-input v-model="queryParams.appName" :placeholder="$t('openapi.searchPlaceholder')" clearable style="width: 240px" @keyup.enter="loadData">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button @click="loadData" :icon="Refresh">{{ $t('common.refresh') }}</el-button>
      </div>

      <el-table v-loading="loading" :data="dataList" border stripe>
        <el-table-column :label="$t('openapi.fields.appName')" prop="appName" min-width="180" />
        <el-table-column :label="$t('openapi.fields.appKey')" min-width="280">
          <template #default="{ row }">
            <div class="key-cell">
              <code>{{ maskKey(row.appKey) }}</code>
              <el-button text size="small" @click="copyText(row.appKey)" :icon="CopyDocument" />
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('openapi.fields.rateLimit')" prop="rateLimit" width="140" align="center">
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">{{ row.rateLimit }}/s</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('openapi.fields.status')" width="120" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('openapi.fields.createTime')" prop="createTime" width="170" />
        <el-table-column :label="$t('common.operation')" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleResetSecret(row)">{{ $t('openapi.resetSecret') }}</el-button>
            <el-button text type="primary" size="small" @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="loadData" @size-change="loadData" />
      </div>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? $t('openapi.editApp') : $t('openapi.createApp')" width="540px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('openapi.fields.appName')" prop="appName">
          <el-input v-model="form.appName" :placeholder="$t('common.pleaseInput')" />
        </el-form-item>
        <el-form-item :label="$t('openapi.fields.description')">
          <el-input v-model="form.description" type="textarea" :rows="2" :placeholder="$t('common.pleaseInput')" />
        </el-form-item>
        <el-form-item :label="$t('openapi.fields.scopes')">
          <el-input v-model="form.scopes" :placeholder="$t('openapi.scopesPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('openapi.fields.rateLimit')">
          <el-input-number v-model="form.rateLimit" :min="1" :max="10000" />
          <span class="form-hint">{{ $t('openapi.rateLimitHint') }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- AppKey + Secret 展示对话框（仅创建/重置时显示一次） -->
    <el-dialog v-model="secretVisible" :title="$t('openapi.secretDialog.title')" width="560px" :close-on-click-modal="false">
      <div class="secret-banner">
        <el-icon :size="20"><Warning /></el-icon>
        <span>{{ $t('openapi.secretDialog.warning') }}</span>
      </div>
      <el-form label-width="100px" class="secret-form">
        <el-form-item :label="$t('openapi.fields.appKey')" v-if="newAppKey">
          <div class="key-display">
            <code>{{ newAppKey }}</code>
            <el-button text size="small" @click="copyText(newAppKey)" :icon="CopyDocument" />
          </div>
        </el-form-item>
        <el-form-item :label="$t('openapi.fields.appSecret')">
          <div class="key-display secret">
            <code>{{ newSecret }}</code>
            <el-button text size="small" @click="copyText(newSecret)" :icon="CopyDocument" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="secretVisible = false">{{ $t('openapi.secretDialog.gotIt') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Document, Box, DataLine, Lock, Stopwatch, CopyDocument, Warning } from '@element-plus/icons-vue'
import { openapiApi, type OpenapiApp } from '@/api/openapi'

const { t } = useI18n()
const loading = ref(false)
const saving = ref(false)
const dataList = ref<OpenapiApp[]>([])
const total = ref(0)
const stats = ref({ appCount: 0, todayCalls: 0 })

const queryParams = reactive({ pageNum: 1, pageSize: 10, appName: '' })

const dialogVisible = ref(false)
const formRef = ref()
const form = reactive<OpenapiApp>({ appName: '', description: '', scopes: '', rateLimit: 100 })
const rules = { appName: [{ required: true, message: t('common.pleaseInput'), trigger: 'blur' }] }

const secretVisible = ref(false)
const newAppKey = ref('')
const newSecret = ref('')

async function loadData() {
  loading.value = true
  try {
    const res: any = await openapiApi.list(queryParams)
    dataList.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res: any = await openapiApi.stats()
    stats.value = res.data || { appCount: 0, todayCalls: 0 }
  } catch (e) { /* ignore */ }
}

function maskKey(key: string) {
  if (!key) return ''
  if (key.length <= 12) return key
  return key.substring(0, 8) + '****' + key.substring(key.length - 4)
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(t('openapi.copied'))
  } catch (e) {
    ElMessage.warning(t('common.failed'))
  }
}

function handleCreate() {
  Object.assign(form, { id: undefined, appName: '', description: '', scopes: '', rateLimit: 100 })
  dialogVisible.value = true
}

function handleEdit(row: OpenapiApp) {
  Object.assign(form, row)
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate()
  saving.value = true
  try {
    if (form.id) {
      await openapiApi.update(form.id, form)
      ElMessage.success(t('common.success'))
    } else {
      const res: any = await openapiApi.create(form)
      newAppKey.value = res.data?.appKey || ''
      newSecret.value = res.data?.appSecret || ''
      secretVisible.value = true
    }
    dialogVisible.value = false
    loadData()
    loadStats()
  } finally {
    saving.value = false
  }
}

async function handleResetSecret(row: OpenapiApp) {
  await ElMessageBox.confirm(t('openapi.confirmReset'), '', { type: 'warning' })
  const res: any = await openapiApi.resetSecret(row.id!)
  newAppKey.value = ''
  newSecret.value = res.data || ''
  secretVisible.value = true
}

async function handleStatusChange(row: OpenapiApp) {
  try {
    await openapiApi.changeStatus(row.id!, row.status!)
    ElMessage.success(t('common.success'))
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1
  }
}

async function handleDelete(row: OpenapiApp) {
  await ElMessageBox.confirm(t('common.confirmDelete'), '', { type: 'warning' })
  await openapiApi.remove(row.id!)
  ElMessage.success(t('common.success'))
  loadData()
  loadStats()
}

function openDocs() {
  // 后端 Knife4j 文档地址（与 baseURL 同源）
  const base = (import.meta as any).env.VITE_API_BASE_URL || ''
  window.open(base.replace(/\/$/, '') + '/doc.html', '_blank')
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style lang="scss" scoped>
.openapi-page {
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .page-header h2 { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0; }
  .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; display: block; }
}

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-card {
  display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; background: #fff;
  border: 1px solid #f1f5f9; transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
}
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.stat-card.brand .stat-icon { background: linear-gradient(135deg, #F26522 0%, #FF8C42 100%); }
.stat-card.info .stat-icon { background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); }
.stat-card.success .stat-icon { background: linear-gradient(135deg, #10B981 0%, #34D399 100%); }
.stat-card.warning .stat-icon { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }
.stat-num { font-size: 22px; font-weight: 700; color: #1e293b; line-height: 1.2; }
.stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }

.table-card { border: none; border-radius: 12px; }
.card-toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.key-cell { display: inline-flex; align-items: center; gap: 6px; }
.key-cell code { font-family: 'Monaco', 'Consolas', monospace; font-size: 13px; padding: 3px 8px; background: #f1f5f9; border-radius: 4px; color: #475569; }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 0 0; }

.secret-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fef3c7; border-radius: 8px; color: #92400e; font-size: 13px; margin-bottom: 20px; }
.secret-form { padding: 0 8px; }
.key-display { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
.key-display code { font-family: 'Monaco', 'Consolas', monospace; font-size: 14px; color: #1e293b; flex: 1; word-break: break-all; }
.key-display.secret code { color: #F26522; font-weight: 600; }
.form-hint { font-size: 12px; color: #94a3b8; margin-left: 12px; }

html.dark {
  .page-header h2 { color: var(--el-text-color-primary); }
  .stat-card { background: var(--el-bg-color); border-color: var(--el-border-color); }
  .stat-num { color: var(--el-text-color-primary); }
  .key-cell code { background: var(--el-fill-color); color: var(--el-text-color-regular); }
  .key-display { background: var(--el-fill-color); border-color: var(--el-border-color); }
  .key-display code { color: var(--el-text-color-primary); }
}
</style>
