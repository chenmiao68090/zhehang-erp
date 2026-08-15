<template>
  <div class="governance-page">
    <header class="page-heading">
      <div>
        <div class="eyebrow">系统设置 · 字段治理目录</div>
        <h1>字段匹配设置中心</h1>
        <p>统一查看字段来自哪里、在哪些页面使用、修改会影响什么；只对已接入的纯选项目录开放维护。</p>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="loadFields">刷新目录</el-button>
    </header>

    <el-alert
      class="boundary-alert"
      type="warning"
      :closable="false"
      show-icon
      title="员工、部门、角色、客户、账户和业务状态不是普通下拉选项"
      description="实体选择器、状态机、审批版本和第三方协议均保持只读或进入原业务页面；本中心不会新建人员、伪造角色、改客户状态或改资金账户。"
    />

    <el-tabs v-model="activeTab" class="governance-tabs">
      <el-tab-pane label="字段目录与影响" name="catalog">
        <div class="toolbar">
          <el-input v-model="keyword" clearable placeholder="搜索字段、页面、表字段或来源" :prefix-icon="Search" />
          <el-select v-model="module" clearable placeholder="全部模块">
            <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="sourceKind" clearable placeholder="全部来源">
            <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="integration" clearable placeholder="全部状态">
            <el-option v-for="item in integrationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>

        <el-table v-loading="loading" :data="filteredFields" border stripe row-key="key">
          <el-table-column label="字段" min-width="230" fixed="left">
            <template #default="{ row }">
              <div class="primary-title">{{ row.name }} <el-tag v-if="row.required" size="small" type="danger" effect="plain">必填</el-tag></div>
              <div class="secondary-text">{{ row.description }}</div>
              <code>{{ row.key }}</code>
            </template>
          </el-table-column>
          <el-table-column label="模块 / 使用页面" min-width="205">
            <template #default="{ row }">
              <div>{{ row.moduleName }}</div>
              <div class="chip-row">
                <el-tag v-for="page in row.pageNames" :key="page" size="small" effect="plain">{{ page }}</el-tag>
              </div>
              <div class="secondary-text">{{ (row.pageRoutes || []).join('、') || '未登记页面路由' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="存储与控件" min-width="205">
            <template #default="{ row }">
              <code>{{ row.storageField }}</code>
              <div class="secondary-text">{{ controlTypeLabel(row.controlType) }} · {{ row.valueType }}</div>
            </template>
          </el-table-column>
          <el-table-column label="真实来源" min-width="190">
            <template #default="{ row }">
              <div class="primary-title">{{ row.sourceName }}</div>
              <div class="secondary-text">{{ sourceKindLabel(row.sourceKind) }}</div>
              <code v-if="row.dictType">{{ row.dictType }}</code>
            </template>
          </el-table-column>
          <el-table-column label="风险 / 接入" width="140" align="center">
            <template #default="{ row }">
              <div><el-tag :type="riskTag(row.riskLevel)" effect="plain">{{ riskLabel(row.riskLevel) }}</el-tag></div>
              <div class="tag-gap"><el-tag :type="integrationTag(row.integrationState)" size="small">{{ integrationLabel(row.integrationState) }}</el-tag></div>
            </template>
          </el-table-column>
          <el-table-column label="允许动作与历史" min-width="210">
            <template #default="{ row }">
              <div>{{ editPolicyLabel(row.editPolicy) }}</div>
              <div class="secondary-text">历史：{{ historyPolicyLabel(row.historyPolicy) }}</div>
              <div class="secondary-text">约 {{ row.usageCount ?? 0 }} 处引用 · {{ row.optionCount ?? '待盘点' }} 个选项</div>
              <div v-if="row.warning" class="warning-text">{{ row.warning }}</div>
            </template>
          </el-table-column>
          <el-table-column label="处理" width="118" align="center" fixed="right">
            <template #default="{ row }">
              <el-button v-if="isMaintainableCatalog(row)" link type="primary" @click="openOptions(row)">维护选项</el-button>
              <el-button v-else-if="row.manageRoute" link type="primary" @click="openManageRoute(row.manageRoute)">进入来源</el-button>
              <span v-else class="secondary-text">只读查看</span>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :description="loadError || '没有符合条件的字段'">
              <el-button v-if="loadError" type="primary" @click="loadFields">重新加载</el-button>
            </el-empty>
          </template>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="选项与映射规则" name="options">
        <div class="options-layout">
          <aside class="field-list">
            <el-input v-model="optionKeyword" clearable placeholder="搜索可查看字段" :prefix-icon="Search" />
            <div class="field-list-scroll">
              <button
                v-for="field in optionFields"
                :key="field.key"
                type="button"
                class="field-list-item"
                :class="{ active: selectedField?.key === field.key }"
                @click="selectField(field)"
              >
                <span>
                  <strong>{{ field.name }}</strong>
                  <small>{{ field.sourceName }} · {{ sourceKindLabel(field.sourceKind) }}</small>
                </span>
                <el-tag v-if="isMaintainableCatalog(field)" size="small" type="success">可维护</el-tag>
                <el-tag v-else size="small" type="info">只读</el-tag>
              </button>
              <el-empty v-if="!optionFields.length" description="暂无匹配字段" :image-size="64" />
            </div>
          </aside>

          <section class="option-panel">
            <el-empty v-if="!selectedField" description="请从左侧选择字段" />
            <template v-else>
              <div class="option-head">
                <div>
                  <div class="option-title">
                    {{ selectedField.name }}
                    <el-tag :type="isMaintainableCatalog(selectedField) ? 'success' : 'info'" size="small">
                      {{ isMaintainableCatalog(selectedField) ? '纯目录可维护' : '只读来源' }}
                    </el-tag>
                  </div>
                  <p>{{ selectedField.description }}</p>
                </div>
                <el-button
                  v-if="isMaintainableCatalog(selectedField)"
                  type="primary"
                  :icon="Plus"
                  :disabled="!optionsConfigured"
                  @click="openCreateOption"
                >新增选项</el-button>
                <el-button v-else-if="selectedField.manageRoute" @click="openManageRoute(selectedField.manageRoute)">进入真实来源</el-button>
              </div>

              <div class="field-facts">
                <div><span>存储字段</span><code>{{ selectedField.storageField }}</code></div>
                <div><span>目录编码</span><code>{{ selectedField.dictType || '无（不可作为字典维护）' }}</code></div>
                <div><span>修改策略</span><b>{{ editPolicyLabel(selectedField.editPolicy) }}</b></div>
                <div><span>历史策略</span><b>{{ historyPolicyLabel(selectedField.historyPolicy) }}</b></div>
              </div>

              <el-alert
                v-if="selectedField.warning"
                class="option-alert"
                type="warning"
                :closable="false"
                :title="selectedField.warning"
              />
              <el-alert
                v-if="selectedField.dictType && !optionsLoading && !optionsConfigured"
                class="option-alert"
                type="info"
                :closable="false"
                title="该字段尚未配置受控目录"
                description="业务页面仍使用随版本发布的兼容选项。本中心不会临时创建未经登记的字段类型。"
              />
              <el-alert
                v-if="!isMaintainableCatalog(selectedField)"
                class="option-alert"
                type="info"
                :closable="false"
                title="此来源仅供核对，不能在本页增删改"
                :description="readonlyReason(selectedField)"
              />

              <el-table v-loading="optionsLoading" :data="optionItems" border stripe row-key="value">
                <el-table-column prop="label" label="展示名称" min-width="160" />
                <el-table-column label="存储值" min-width="170">
                  <template #default="{ row }"><code>{{ row.value }}</code></template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="80" align="center" />
                <el-table-column label="默认" width="78" align="center">
                  <template #default="{ row }"><el-tag v-if="row.defaultValue" type="success" size="small">默认</el-tag><span v-else>—</span></template>
                </el-table-column>
                <el-table-column label="状态" width="88" align="center">
                  <template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{ row.enabled ? '启用' : '停用' }}</el-tag></template>
                </el-table-column>
                <el-table-column prop="remark" label="说明" min-width="180" show-overflow-tooltip />
                <el-table-column v-if="isMaintainableCatalog(selectedField)" label="操作" width="140" align="center" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="openEditOption(row)">编辑展示</el-button>
                    <el-button link :type="row.enabled ? 'warning' : 'success'" @click="toggleOption(row)">{{ row.enabled ? '停用' : '启用' }}</el-button>
                  </template>
                </el-table-column>
                <template #empty>
                  <el-empty :description="optionError || (optionsConfigured ? '当前没有启用或历史选项' : '尚未接入选项目录')" :image-size="76" />
                </template>
              </el-table>

              <p v-if="isMaintainableCatalog(selectedField)" class="safe-note">
                已引用的存储值锁定；允许新增、修改展示名称/排序/默认值和停用。停用只阻止新选择，历史记录继续回显。
              </p>
            </template>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="optionDialogVisible" :title="optionForm.id ? '编辑选项展示' : '新增选项'" width="520px" :close-on-click-modal="false">
      <el-form ref="optionFormRef" :model="optionForm" :rules="optionRules" label-width="92px">
        <el-form-item label="展示名称" prop="dictLabel"><el-input v-model="optionForm.dictLabel" maxlength="100" /></el-form-item>
        <el-form-item label="存储值" prop="dictValue">
          <el-input v-model="optionForm.dictValue" :disabled="Boolean(optionForm.id)" maxlength="100" />
          <div class="form-tip">创建后锁定，避免历史记录和接口匹配失效。</div>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="optionForm.dictSort" :min="0" :max="9999" /></el-form-item>
        <el-form-item label="默认选项"><el-switch v-model="optionForm.isDefault" :active-value="1" :inactive-value="0" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="optionForm.status"><el-radio :value="0">启用</el-radio><el-radio :value="1">停用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="说明"><el-input v-model="optionForm.remark" type="textarea" :rows="3" maxlength="255" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="optionDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveOption">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { dictDataApi, type SysDictData } from '@/api/dict'
import {
  settingsGovernanceApi,
  unwrapGovernanceData,
  type FieldDefinition,
  type FieldOptionItem,
  type FieldOptions
} from '@/api/settings-governance'

type ManagedOptionRow = FieldOptionItem & { id?: number | null; remark?: string | null }

const router = useRouter()
const activeTab = ref('catalog')
const loading = ref(false)
const loadError = ref('')
const fields = ref<FieldDefinition[]>([])
const keyword = ref('')
const module = ref('')
const sourceKind = ref('')
const integration = ref('')
const optionKeyword = ref('')
const selectedField = ref<FieldDefinition | null>(null)
const optionsLoading = ref(false)
const optionsConfigured = ref(false)
const optionItems = ref<ManagedOptionRow[]>([])
const optionError = ref('')
let optionsRequestVersion = 0

const sourceOptions = [
  { value: 'DICTIONARY', label: '受控选项目录' }, { value: 'CODE_CATALOG', label: '代码目录' },
  { value: 'STATE_MACHINE', label: '业务状态机' }, { value: 'ENTITY', label: '业务实体' },
  { value: 'MIXED', label: '多来源待映射' }, { value: 'PROCESS_VERSION', label: '流程版本' },
  { value: 'EXTERNAL_PROTOCOL', label: '第三方协议' }
]
const integrationOptions = [
  { value: 'CONNECTED', label: '已接入' }, { value: 'PENDING', label: '待接入' },
  { value: 'READ_ONLY', label: '只读' }, { value: 'DOMAIN_MANAGED', label: '领域维护' }
]

const moduleOptions = computed(() => {
  const map = new Map<string, string>()
  fields.value.forEach((item) => map.set(item.moduleCode, item.moduleName))
  return [...map.entries()].map(([value, label]) => ({ value, label }))
})

const filteredFields = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return fields.value.filter((item) => {
    if (module.value && item.moduleCode !== module.value) return false
    if (sourceKind.value && item.sourceKind !== sourceKind.value) return false
    if (integration.value && item.integrationState !== integration.value) return false
    if (!query) return true
    return [item.name, item.key, item.moduleName, item.storageField, item.sourceName, item.dictType, ...(item.pageNames || []), ...(item.pageRoutes || [])]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
  })
})

const optionFields = computed(() => {
  const query = optionKeyword.value.trim().toLowerCase()
  return fields.value.filter((item) => {
    const optionLike = ['SELECT', 'SELECT_MULTI', 'DYNAMIC_SELECT', 'ENTITY_SELECT', 'TREE_SELECT', 'MIXED'].includes(item.controlType)
    if (!optionLike) return false
    return !query || [item.name, item.sourceName, item.dictType, item.moduleName].filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

async function loadFields() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await settingsGovernanceApi.fields()
    fields.value = [...(unwrapGovernanceData<FieldDefinition[]>(response) || [])]
      .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
    if (selectedField.value) {
      selectedField.value = fields.value.find((item) => item.key === selectedField.value?.key) || null
    }
  } catch (error: any) {
    fields.value = []
    loadError.value = error?.message || '字段目录加载失败'
  } finally {
    loading.value = false
  }
}

function isMaintainableCatalog(field?: FieldDefinition | null) {
  return field?.sourceKind === 'DICTIONARY'
    && field.integrationState === 'CONNECTED'
    && field.editPolicy === 'ADD_DISABLE_LOCK_VALUE'
    && Boolean(field.dictType)
}

async function selectField(field: FieldDefinition) {
  selectedField.value = field
  await loadSelectedOptions()
}

async function openOptions(field: FieldDefinition) {
  activeTab.value = 'options'
  await selectField(field)
}

async function loadSelectedOptions() {
  const version = ++optionsRequestVersion
  const field = selectedField.value
  optionItems.value = []
  optionError.value = ''
  optionsConfigured.value = false
  if (!field?.dictType) {
    optionsLoading.value = false
    return
  }
  const isCurrentRequest = () => version === optionsRequestVersion
    && selectedField.value?.key === field.key
  optionsLoading.value = true
  try {
    const response = await settingsGovernanceApi.options(field.dictType)
    const payload = unwrapGovernanceData<FieldOptions>(response)
    if (!isCurrentRequest()) return
    const nextConfigured = payload.configured === true
    let nextItems: ManagedOptionRow[] = []
    if (!payload.configured) {
      optionsConfigured.value = false
      optionItems.value = []
      return
    }
    if (isMaintainableCatalog(field)) {
      const adminResponse: any = await dictDataApi.list(field.dictType)
      if (!isCurrentRequest()) return
      const rows: SysDictData[] = adminResponse?.data || adminResponse || []
      nextItems = rows.map((item) => ({
        id: item.id, label: item.dictLabel, value: item.dictValue, sort: item.dictSort,
        defaultValue: item.isDefault === 1, enabled: item.status !== 1, remark: item.remark
      }))
    } else {
      nextItems = payload.items || []
    }
    if (!isCurrentRequest()) return
    optionsConfigured.value = nextConfigured
    optionItems.value = nextItems
  } catch (error: any) {
    if (isCurrentRequest()) optionError.value = error?.message || '选项加载失败'
  } finally {
    if (isCurrentRequest()) optionsLoading.value = false
  }
}

function openManageRoute(route?: string | null) {
  if (route === '/sys-flow/field-mapping') {
    activeTab.value = 'options'
    return
  }
  if (route?.startsWith('/')) router.push(route)
}

function readonlyReason(field: FieldDefinition) {
  if (field.sourceKind === 'ENTITY') return '人员、部门、角色、客户和账户必须通过对应业务实体维护，并继续执行租户与数据范围校验。'
  if (field.sourceKind === 'STATE_MACHINE') return '状态只能由真实业务动作推进，不能把状态码当普通选项增删。'
  if (field.sourceKind === 'PROCESS_VERSION') return '流程选项随已发布版本留档，不能修改在途实例。'
  if (field.sourceKind === 'EXTERNAL_PROTOCOL') return '第三方协议码由供应商契约决定，只能提供中文展示。'
  if (field.integrationState === 'PENDING') return '该字段仍在代码常量或多来源阶段，本批只登记影响，不冒充已接入。'
  return '当前来源不满足“受控字典 + 已接入 + 锁定存储值”三项条件，因此失败收紧为只读。'
}

const optionDialogVisible = ref(false)
const optionFormRef = ref<FormInstance>()
const saving = ref(false)
const optionForm = reactive<SysDictData>({ dictType: '', dictLabel: '', dictValue: '', dictSort: 0, isDefault: 0, status: 0, remark: '' })
const optionRules: FormRules = {
  dictLabel: [{ required: true, message: '请输入展示名称', trigger: 'blur' }],
  dictValue: [
    { required: true, message: '请输入稳定存储值', trigger: 'blur' },
    { pattern: /^[^\s,，]+$/, message: '存储值不能包含空格或逗号', trigger: 'blur' }
  ]
}

function resetOptionForm(row?: ManagedOptionRow) {
  Object.assign(optionForm, {
    id: row?.id ?? undefined,
    dictType: selectedField.value?.dictType || '',
    dictLabel: row?.label || '',
    dictValue: row?.value || '',
    dictSort: row?.sort ?? (optionItems.value.length + 1),
    isDefault: row?.defaultValue ? 1 : 0,
    status: row ? (row.enabled ? 0 : 1) : 0,
    remark: row?.remark || ''
  })
}

function openCreateOption() {
  if (!isMaintainableCatalog(selectedField.value) || !optionsConfigured.value) return
  resetOptionForm()
  optionDialogVisible.value = true
}

function openEditOption(row: ManagedOptionRow) {
  if (!isMaintainableCatalog(selectedField.value)) return
  resetOptionForm(row)
  optionDialogVisible.value = true
}

async function saveOption() {
  if (!isMaintainableCatalog(selectedField.value) || !optionsConfigured.value) return
  const valid = await optionFormRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (optionForm.id) await dictDataApi.update({ ...optionForm })
    else await dictDataApi.create({ ...optionForm })
    ElMessage.success('选项已保存；已保存的存储值保持不变')
    optionDialogVisible.value = false
    await loadSelectedOptions()
  } catch (error: any) {
    ElMessage.error(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleOption(row: ManagedOptionRow) {
  if (!row.id || !isMaintainableCatalog(selectedField.value)) return
  const nextEnabled = !row.enabled
  try {
    await ElMessageBox.confirm(
      nextEnabled ? `重新启用“${row.label}”供新记录选择？` : `停用“${row.label}”后，新记录不可选择，历史值仍保留。确认停用？`,
      nextEnabled ? '启用选项' : '停用选项',
      { type: nextEnabled ? 'info' : 'warning' }
    )
  } catch {
    return
  }
  try {
    await dictDataApi.update({
      id: row.id,
      dictType: selectedField.value!.dictType!,
      dictLabel: row.label,
      dictValue: row.value,
      dictSort: row.sort ?? 0,
      isDefault: row.defaultValue ? 1 : 0,
      status: nextEnabled ? 0 : 1,
      remark: row.remark || ''
    })
    ElMessage.success(nextEnabled ? '已启用' : '已停用，历史记录不受影响')
    await loadSelectedOptions()
  } catch (error: any) {
    ElMessage.error(error?.message || '状态更新失败')
  }
}

function riskLabel(value: string) { return ({ LOW: '低风险', MEDIUM: '中风险', HIGH: '高风险', CRITICAL: '极高风险' } as Record<string, string>)[value] || value }
function riskTag(value: string) { return ({ LOW: 'success', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger' } as Record<string, string>)[value] || 'info' }
function integrationLabel(value: string) { return ({ CONNECTED: '已接入', PENDING: '待接入', READ_ONLY: '只读', DOMAIN_MANAGED: '领域维护' } as Record<string, string>)[value] || value }
function integrationTag(value: string) { return ({ CONNECTED: 'success', PENDING: 'warning', READ_ONLY: 'info', DOMAIN_MANAGED: 'primary' } as Record<string, string>)[value] || 'info' }
function sourceKindLabel(value: string) { return ({ DICTIONARY: '受控选项目录', CODE_CATALOG: '代码目录', STATE_MACHINE: '业务状态机', ENTITY: '业务实体', MIXED: '多来源待映射', PROCESS_VERSION: '流程版本', EXTERNAL_PROTOCOL: '第三方协议' } as Record<string, string>)[value] || value }
function controlTypeLabel(value: string) { return ({ SELECT: '单选下拉', SELECT_MULTI: '多选下拉', ENTITY_SELECT: '实体选择器', TREE_SELECT: '树形实体选择器', DYNAMIC_SELECT: '流程动态选项', MIXED: '混合控件' } as Record<string, string>)[value] || value }
function editPolicyLabel(value: string) { return ({ ADD_DISABLE_LOCK_VALUE: '可新增/停用，存储值锁定', DISPLAY_ONLY: '仅展示', ALIAS_ADD_DISABLE: '待建设别名与停用', DOMAIN_MANAGED: '到业务实体维护', MAPPING_ONLY: '仅做映射治理', VERSIONED_REFERENCE: '随版本维护', AUDIT_FIRST: '先完成引用审计' } as Record<string, string>)[value] || value }
function historyPolicyLabel(value: string) { return ({ KEEP_VALUE: '保留原存储值', SNAPSHOT: '按业务快照回放', ENTITY_REFERENCE: '保留实体引用', PROTOCOL_LOCKED: '协议码锁定' } as Record<string, string>)[value] || value }

onMounted(loadFields)
</script>

<style scoped>
.governance-page { min-height: 100%; padding: 20px; background: var(--el-bg-color-page); }
.page-heading { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 16px; }
.page-heading h1 { margin: 3px 0 6px; font-size: 25px; color: var(--el-text-color-primary); }
.page-heading p { margin: 0; color: var(--el-text-color-secondary); line-height: 1.65; }
.eyebrow { color: var(--el-color-primary); font-size: 13px; font-weight: 600; }
.boundary-alert { margin-bottom: 16px; }
.governance-tabs { padding: 0 16px 16px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: var(--el-bg-color); }
.toolbar { display: grid; grid-template-columns: minmax(260px, 1fr) 180px 185px 160px; gap: 10px; margin-bottom: 14px; }
.primary-title { font-weight: 600; color: var(--el-text-color-primary); }
.secondary-text { color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.5; }
code { color: var(--el-text-color-regular); font-size: 11px; white-space: normal; overflow-wrap: anywhere; }
.chip-row { display: flex; flex-wrap: wrap; gap: 4px; margin: 5px 0; }
.tag-gap { margin-top: 6px; }
.warning-text { margin-top: 6px; color: var(--el-color-danger); font-size: 12px; line-height: 1.45; }
.options-layout { display: grid; grid-template-columns: 290px minmax(0, 1fr); gap: 16px; min-height: 570px; }
.field-list { padding: 12px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.field-list-scroll { display: grid; gap: 6px; margin-top: 10px; max-height: 610px; overflow: auto; }
.field-list-item { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 10px; padding: 11px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.field-list-item:hover { background: var(--el-fill-color-light); }
.field-list-item.active { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }
.field-list-item span { display: grid; min-width: 0; gap: 3px; }
.field-list-item strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.field-list-item small { color: var(--el-text-color-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.option-panel { min-width: 0; padding: 14px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.option-head { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 14px; }
.option-title { display: flex; align-items: center; gap: 8px; font-size: 19px; font-weight: 600; }
.option-head p { margin: 6px 0 0; color: var(--el-text-color-secondary); }
.field-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 12px; }
.field-facts div { display: grid; gap: 5px; padding: 10px; border-radius: 7px; background: var(--el-fill-color-lighter); }
.field-facts span { color: var(--el-text-color-secondary); font-size: 12px; }
.field-facts b { font-size: 12px; font-weight: 500; }
.option-alert { margin-bottom: 12px; }
.safe-note { margin: 12px 0 0; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.6; }
.form-tip { margin-top: 4px; color: var(--el-text-color-secondary); font-size: 12px; }
@media (max-width: 1200px) {
  .toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .options-layout { grid-template-columns: 250px minmax(0, 1fr); }
  .field-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .governance-page { padding: 12px; }
  .page-heading { flex-direction: column; gap: 10px; }
  .page-heading h1 { font-size: 22px; }
  .governance-tabs { padding: 0 8px 10px; }
  .toolbar, .options-layout, .field-facts { grid-template-columns: 1fr; }
  .field-list-scroll { max-height: 240px; }
  .option-panel { padding: 10px; }
  .option-head { flex-direction: column; gap: 10px; }
}
</style>
