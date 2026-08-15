<template>
  <div class="ct-page">
    <div class="ct-header">
      <div class="ct-header__title">
        <el-icon><Document /></el-icon>
        <span>合同模板管理</span>
      </div>
      <div class="ct-header__actions">
        <el-input
          v-model="keyword"
          placeholder="搜索模板名称/编码"
          clearable
          style="width: 220px"
          :prefix-icon="Search"
        />
        <el-button type="primary" :icon="Plus" @click="openCreate">新建模板</el-button>
      </div>
    </div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="提单中心设置 · 合同模板"
      description="此处维护各服务类型的标准合同模板;新建/续签合同时按服务类型自动带出对应模板。修改会即时影响后续新合同。"
      style="margin-bottom: 16px"
    />

    <el-table :data="filteredList" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="templateName" label="模板名称" min-width="180" show-overflow-tooltip />
      <el-table-column label="服务类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" effect="light">{{ serviceTypeLabel(row.serviceType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="templateCode" label="模板编码" width="140" show-overflow-tooltip />
      <el-table-column prop="version" label="版本" width="90" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
            {{ row.enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="170" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无合同模板,点击右上角『新建模板』添加" />
      </template>
    </el-table>

    <!-- 新建/编辑 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑合同模板' : '新建合同模板'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="如:代理记账服务合同" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item label="服务类型" prop="serviceType">
          <el-select v-model="form.serviceType" placeholder="请选择服务类型" style="width: 100%">
            <el-option v-for="opt in SERVICE_TYPES" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板编码">
          <el-input v-model="form.templateCode" placeholder="选填,如 TPL_BOOKKEEPING(留空自动生成)" maxlength="40" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="form.version" placeholder="如 v1.0" style="width: 160px" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
          <span class="ct-hint">禁用后新建合同时不再可选此模板</span>
        </el-form-item>
        <el-form-item label="模板内容" prop="templateContent">
          <el-input
            v-model="form.templateContent"
            type="textarea"
            :rows="10"
            placeholder="合同正文,可用 {甲方}、{乙方}、{金额}、{起始日}、{到期日} 等变量占位"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Search, Plus, Edit } from '@element-plus/icons-vue'
import { contractMgmtApi, type BizContractTemplate } from '@/api/contract-mgmt'

// 服务类型枚举(与 contract-mgmt.ts BizContractTemplate.serviceType 对齐)
const SERVICE_TYPES = [
  { value: 'bookkeeping', label: '代理记账' },
  { value: 'registration', label: '公司注册' },
  { value: 'tax_planning', label: '税务筹划' },
  { value: 'qualification', label: '资质办理' },
  { value: 'audit', label: '审计验资' },
  { value: 'cancellation', label: '公司注销' },
  { value: 'other', label: '其他' }
]
function serviceTypeLabel(v: string): string {
  return SERVICE_TYPES.find(o => o.value === v)?.label || v || '其他'
}

const loading = ref(false)
const saving = ref(false)
const list = ref<BizContractTemplate[]>([])
const keyword = ref('')

const filteredList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return list.value
  return list.value.filter(t =>
    (t.templateName || '').toLowerCase().includes(kw) ||
    (t.templateCode || '').toLowerCase().includes(kw)
  )
})

async function loadTemplates() {
  loading.value = true
  try {
    list.value = await contractMgmtApi.getTemplates()
  } catch (e: any) {
    ElMessage.error(e?.message || '模板加载失败')
  } finally {
    loading.value = false
  }
}

// 表单
const dialogVisible = ref(false)
const formRef = ref()
const emptyForm = (): Partial<BizContractTemplate> => ({
  templateName: '',
  serviceType: 'bookkeeping',
  templateCode: '',
  templateContent: '',
  version: 'v1.0',
  enabled: true
})
const form = ref<Partial<BizContractTemplate>>(emptyForm())

const rules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  serviceType: [{ required: true, message: '请选择服务类型', trigger: 'change' }],
  templateContent: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
}

function openCreate() {
  form.value = emptyForm()
  dialogVisible.value = true
}

function openEdit(row: BizContractTemplate) {
  // 拷贝一份,避免直接改表格行数据
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    saving.value = true
    try {
      await contractMgmtApi.saveTemplate(form.value)
      ElMessage.success('保存成功')
      dialogVisible.value = false
      await loadTemplates()
    } catch (e: any) {
      ElMessage.error(e?.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

onMounted(loadTemplates)
</script>

<style scoped>
.ct-page {
  padding: 16px;
}
.ct-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}
.ct-header__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}
.ct-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ct-hint {
  margin-left: 10px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
