<template>
  <div class="governance-page">
    <header class="page-heading">
      <div>
        <div class="eyebrow">系统设置 · 规则治理目录</div>
        <h1>规则设定中心</h1>
        <p>集中查找规则的真实来源、影响和风险；具体修改仍进入对应业务页面，不在这里复制第二套规则。</p>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="loadRules">刷新目录</el-button>
    </header>

    <el-alert
      class="boundary-alert"
      type="info"
      :closable="false"
      show-icon
      title="这里是规则目录，不是万能规则编辑器"
      description="已接入项可进入唯一业务设置入口；规划中、部分接入或只读项只展示现状。权限、财务状态机和认证安全不会在此放开修改。"
    />

    <section class="summary-grid">
      <div class="summary-card"><strong>{{ rules.length }}</strong><span>已登记规则</span></div>
      <div class="summary-card"><strong>{{ connectedCount }}</strong><span>已接入真实入口</span></div>
      <div class="summary-card warning"><strong>{{ highRiskCount }}</strong><span>高/极高风险</span></div>
      <div class="summary-card muted"><strong>{{ pendingCount }}</strong><span>待治理或部分接入</span></div>
    </section>

    <section class="catalog-panel">
      <div class="toolbar">
        <el-input v-model="keyword" clearable placeholder="搜索规则、来源、影响范围" :prefix-icon="Search" />
        <el-select v-model="domain" clearable placeholder="全部领域">
          <el-option v-for="item in domainOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="risk" clearable placeholder="全部风险">
          <el-option v-for="item in riskOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="integration" clearable placeholder="全部接入状态">
          <el-option v-for="item in integrationOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>

      <el-table v-loading="loading" :data="filteredRules" border stripe row-key="code">
        <el-table-column label="规则" min-width="250" fixed="left">
          <template #default="{ row }">
            <div class="primary-cell">
              <div class="primary-title">{{ row.name }}</div>
              <div class="secondary-text">{{ row.summary }}</div>
              <code>{{ row.code }}</code>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="领域" width="130">
          <template #default="{ row }">
            <div>{{ row.domainName }}</div>
            <span class="secondary-text">{{ row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险" width="92" align="center">
          <template #default="{ row }">
            <el-tag :type="riskTag(row.riskLevel)" effect="plain">{{ riskLabel(row.riskLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="接入状态" width="118" align="center">
          <template #default="{ row }">
            <el-tag :type="integrationTag(row.integrationState)">{{ integrationLabel(row.integrationState) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="真实来源" min-width="220">
          <template #default="{ row }">
            <div class="source-name">{{ row.sourceName }}</div>
            <div class="secondary-text">{{ sourceKindLabel(row.sourceKind) }}</div>
            <code v-if="row.sourceTable">{{ row.sourceTable }}</code>
          </template>
        </el-table-column>
        <el-table-column label="影响范围" min-width="240">
          <template #default="{ row }">
            <div>{{ row.impactScope }}</div>
            <div v-if="row.legacyWarning" class="warning-text">
              <el-icon><WarningFilled /></el-icon>{{ row.legacyWarning }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="变更方式" min-width="180">
          <template #default="{ row }">
            <div>{{ changeModeLabel(row.changeMode) }}</div>
            <div class="capability-line">
              <span :class="{ available: row.supportsSimulation }">模拟{{ row.supportsSimulation ? '支持' : '不支持' }}</span>
              <span :class="{ available: row.supportsRollback }">回滚{{ row.supportsRollback ? '支持' : '不支持' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="设置入口" width="118" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.manageRoute" link type="primary" @click="openManageRoute(row.manageRoute)">进入设置</el-button>
            <span v-else class="secondary-text">暂无安全入口</span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="loadError || '没有符合条件的规则'">
            <el-button v-if="loadError" type="primary" @click="loadRules">重新加载</el-button>
          </el-empty>
        </template>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Search, WarningFilled } from '@element-plus/icons-vue'
import {
  settingsGovernanceApi,
  unwrapGovernanceData,
  type RuleDefinition
} from '@/api/settings-governance'

const router = useRouter()
const loading = ref(false)
const loadError = ref('')
const rules = ref<RuleDefinition[]>([])
const keyword = ref('')
const domain = ref('')
const risk = ref('')
const integration = ref('')

const riskOptions = [
  { value: 'LOW', label: '低' },
  { value: 'MEDIUM', label: '中' },
  { value: 'HIGH', label: '高' },
  { value: 'CRITICAL', label: '极高' }
]
const integrationOptions = [
  { value: 'CONNECTED', label: '已接入' },
  { value: 'PARTIAL', label: '部分接入' },
  { value: 'PLANNED', label: '规划中' },
  { value: 'READ_ONLY', label: '只读守卫' }
]

const domainOptions = computed(() => {
  const map = new Map<string, string>()
  rules.value.forEach((item) => map.set(item.domainCode, item.domainName))
  return [...map.entries()].map(([value, label]) => ({ value, label }))
})

const filteredRules = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return rules.value.filter((item) => {
    if (domain.value && item.domainCode !== domain.value) return false
    if (risk.value && item.riskLevel !== risk.value) return false
    if (integration.value && item.integrationState !== integration.value) return false
    if (!query) return true
    return [item.name, item.code, item.summary, item.sourceName, item.sourceTable, item.impactScope]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })
})

const connectedCount = computed(() => rules.value.filter((item) => item.integrationState === 'CONNECTED').length)
const highRiskCount = computed(() => rules.value.filter((item) => ['HIGH', 'CRITICAL'].includes(item.riskLevel)).length)
const pendingCount = computed(() => rules.value.filter((item) => ['PARTIAL', 'PLANNED'].includes(item.integrationState)).length)

async function loadRules() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await settingsGovernanceApi.rules()
    rules.value = [...(unwrapGovernanceData<RuleDefinition[]>(response) || [])]
      .sort((a, b) => (a.sort ?? 9999) - (b.sort ?? 9999))
  } catch (error: any) {
    rules.value = []
    loadError.value = error?.message || '规则目录加载失败'
  } finally {
    loading.value = false
  }
}

function openManageRoute(route?: string | null) {
  if (route?.startsWith('/')) router.push(route)
}

function riskLabel(value: string) {
  return ({ LOW: '低', MEDIUM: '中', HIGH: '高', CRITICAL: '极高' } as Record<string, string>)[value] || value
}

function riskTag(value: string) {
  return ({ LOW: 'success', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'danger' } as Record<string, string>)[value] || 'info'
}

function integrationLabel(value: string) {
  return ({ CONNECTED: '已接入', PARTIAL: '部分接入', PLANNED: '规划中', READ_ONLY: '只读守卫' } as Record<string, string>)[value] || value
}

function integrationTag(value: string) {
  return ({ CONNECTED: 'success', PARTIAL: 'warning', PLANNED: 'info', READ_ONLY: 'info' } as Record<string, string>)[value] || 'info'
}

function sourceKindLabel(value: string) {
  return ({
    VERSIONED_DOMAIN: '领域版本', DOMAIN_CONFIG: '领域配置', STATE_MACHINE: '状态机',
    CODE_POLICY: '代码策略', DOMAIN_AND_WORKFLOW: '领域 + 审批流程', MULTI_DOMAIN: '多领域事件',
    MIXED: '多来源', SECURITY_CORE: '安全核心'
  } as Record<string, string>)[value] || value
}

function changeModeLabel(value: string) {
  return ({
    DRAFT_SIMULATE_PUBLISH: '草稿 → 模拟 → 发布', DOMAIN_SAVE: '领域页面保存',
    DRAFT_VALIDATE_PUBLISH: '草稿 → 校验 → 发布', VALIDATE_SIMULATE_SAVE: '校验 → 模拟 → 保存',
    READ_ONLY_GUARD: '领域守卫（只读）', VERSIONED_REQUIRED: '需先建设版本治理',
    GOVERNANCE_REQUIRED: '需先收口治理', COURSE_VERSION: '随课程版本',
    VALIDATE_PUBLISH: '校验 → 发布', SEPARATE_SECURITY_CENTER: '独立安全中心'
  } as Record<string, string>)[value] || value
}

onMounted(loadRules)
</script>

<style scoped>
.governance-page { min-height: 100%; padding: 20px; background: var(--el-bg-color-page); }
.page-heading { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; margin-bottom: 16px; }
.page-heading h1 { margin: 3px 0 6px; font-size: 25px; color: var(--el-text-color-primary); }
.page-heading p { margin: 0; color: var(--el-text-color-secondary); line-height: 1.65; }
.eyebrow { color: var(--el-color-primary); font-size: 13px; font-weight: 600; }
.boundary-alert { margin-bottom: 16px; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.summary-card { display: flex; flex-direction: column; gap: 5px; padding: 16px 18px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: var(--el-bg-color); }
.summary-card strong { font-size: 26px; color: var(--el-color-primary); }
.summary-card span { color: var(--el-text-color-secondary); font-size: 13px; }
.summary-card.warning strong { color: var(--el-color-danger); }
.summary-card.muted strong { color: var(--el-color-info); }
.catalog-panel { padding: 16px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: var(--el-bg-color); }
.toolbar { display: grid; grid-template-columns: minmax(260px, 1fr) 180px 150px 170px; gap: 10px; margin-bottom: 14px; }
.primary-cell { display: grid; gap: 5px; }
.primary-title, .source-name { font-weight: 600; color: var(--el-text-color-primary); }
.secondary-text { color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.5; }
code { color: var(--el-text-color-regular); font-size: 11px; white-space: normal; overflow-wrap: anywhere; }
.warning-text { display: flex; gap: 4px; align-items: flex-start; margin-top: 6px; color: var(--el-color-danger); font-size: 12px; line-height: 1.45; }
.warning-text .el-icon { margin-top: 2px; flex: 0 0 auto; }
.capability-line { display: flex; gap: 8px; margin-top: 6px; color: var(--el-text-color-placeholder); font-size: 11px; }
.capability-line .available { color: var(--el-color-success); }
@media (max-width: 1200px) {
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .governance-page { padding: 12px; }
  .page-heading { flex-direction: column; gap: 10px; }
  .page-heading h1 { font-size: 22px; }
  .summary-grid, .toolbar { grid-template-columns: 1fr; }
  .catalog-panel { padding: 10px; }
}
</style>
