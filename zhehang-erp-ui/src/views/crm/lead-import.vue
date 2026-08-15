<template>
  <div class="lead-import-page">
    <header class="page-header">
      <div class="header-main">
        <el-button class="back-button" text @click="goLeadList">
          <el-icon><ArrowLeft /></el-icon>
          返回找客户
        </el-button>
        <div>
          <h1>批量导入公司资源</h1>
          <p>先确认来源和去向，再完成字段映射与查重；重复数据固定跳过，不覆盖原客户。</p>
        </div>
      </div>
      <el-button plain @click="downloadTemplate">
        <el-icon><Download /></el-icon>
        下载标准模板
      </el-button>
    </header>

    <nav class="step-nav" aria-label="导入步骤">
      <button
        v-for="(item, index) in STEP_LABELS"
        :key="item"
        type="button"
        class="step-item"
        :class="{ 'is-current': step === index, 'is-done': step > index }"
        :disabled="index > step || step === 4"
        @click="navigateToStep(index)"
      >
        <span class="step-number">{{ step > index ? '✓' : index + 1 }}</span>
        <span class="step-label">{{ item }}</span>
      </button>
    </nav>

    <main class="step-body">
      <section v-if="step === 0" class="content-card source-step">
        <div class="section-heading">
          <div>
            <span class="eyebrow">第 1 步</span>
            <h2>这批公司资源从哪里来、要进入哪里？</h2>
            <p>一级来源用于统一经营统计，具体平台或供应渠道单独记录。</p>
          </div>
          <el-tag effect="plain" type="info">仅主管、老板或管理员可导入</el-tag>
        </div>

        <div class="source-grid">
          <button
            v-for="(item, sourceIndex) in LEAD_IMPORT_SOURCE_SCENES"
            :key="item.key"
            type="button"
            class="source-card"
            :class="{ 'is-active': selectedSceneKey === item.key }"
            @click="selectSource(item)"
          >
            <span class="source-index">{{ String(sourceIndex + 1).padStart(2, '0') }}</span>
            <span class="source-copy">
              <strong>{{ item.label }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <el-icon class="source-check"><CircleCheckFilled /></el-icon>
          </button>
        </div>

        <el-alert
          v-if="selectedSceneKey === 'private-domain'"
          class="business-warning"
          type="warning"
          :closable="false"
          show-icon
          title="已签约老客户应在“我的客户”中开展二次业务，不能作为新线索重复导入公海。同一正式客户会按重复记录跳过；只有跨标识或不同主体匹配矛盾等异常才列为冲突。"
        />

        <div class="config-grid">
          <label class="form-field">
            <span>
              具体平台/渠道
              <b v-if="sourceRequirement === 'platform'">必填</b>
              <b v-else-if="sourceRequirement === 'either'">二选一</b>
              <em v-else>选填</em>
            </span>
            <el-select
              v-model="config.sourcePlatform"
              clearable
              filterable
              allow-create
              default-first-option
              :disabled="!selectedSourceScene"
              :placeholder="platformPlaceholder"
              @change="handlePlatformChange"
            >
              <el-option v-for="platform in sourcePlatforms" :key="platform" :label="platform" :value="platform" />
            </el-select>
          </label>
          <label class="form-field">
            <span>批次名称 <b>必填</b></span>
            <el-input v-model="config.batchName" maxlength="32" show-word-limit placeholder="如：2026年7月滨江新注册企业" />
          </label>
          <label class="form-field">
            <span>导入去向 <b>必填</b></span>
            <el-select v-model="destinationKey" :loading="poolLoading" placeholder="请选择真实启用的公海">
              <el-option
                v-for="pool in destinationOptions"
                :key="pool.key"
                :value="pool.key"
                :label="pool.label"
              >
                <div class="pool-option">
                  <span>{{ pool.label }}</span>
                  <small>{{ pool.description }}</small>
                </div>
              </el-option>
            </el-select>
          </label>
          <label class="form-field">
            <span>
              来源说明/活动名称
              <b v-if="sourceRequirement === 'detail'">必填</b>
              <b v-else-if="sourceRequirement === 'either'">二选一</b>
              <em v-else>选填</em>
            </span>
            <el-input v-model="config.sourceDetail" maxlength="50" show-word-limit placeholder="如：7月代理记账推广、供应商批次编号" />
          </label>
        </div>

        <div v-if="sourceRequirementHint" class="source-requirement" :class="{ 'is-complete': sourceMetadataValid }">
          <el-icon><CircleCheckFilled v-if="sourceMetadataValid" /><InfoFilled v-else /></el-icon>
          <span>{{ sourceRequirementHint }}</span>
        </div>

        <div class="destination-note">
          <el-icon><InfoFilled /></el-icon>
          <span>“公司公海”不指定池 ID；其他选项只读取当前租户真实启用的公海配置，不使用历史种子或固定编号。</span>
        </div>
      </section>

      <section v-else-if="step === 1" class="content-card upload-step">
        <div class="section-heading">
          <div>
            <span class="eyebrow">第 2 步</span>
            <h2>上传客户名单</h2>
            <p>
              优先使用 XLSX，也支持 UTF-8/GBK CSV；首行为表头，单次最多
              {{ singleImportLimit.toLocaleString() }} 条，今日剩余 {{ remainingImportLimit.toLocaleString() }} 条。
            </p>
          </div>
          <div class="batch-context">
            <span>{{ selectedSourceScene?.label }}</span>
            <el-icon><ArrowRight /></el-icon>
            <strong>{{ destinationLabel }}</strong>
          </div>
        </div>

        <el-upload
          ref="uploadRef"
          class="file-uploader"
          drag
          :auto-upload="false"
          :disabled="importLimitLoading"
          :limit="1"
          :file-list="fileList"
          accept=".xlsx,.csv"
          :on-change="handleFileChange"
          :on-remove="clearFile"
          :on-exceed="handleFileExceed"
        >
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-title">拖入 XLSX / CSV，或点击选择文件</div>
          <p>不会在选择文件后直接导入，后续还需映射、预检和确认。</p>
        </el-upload>

        <div v-if="fileParsing" class="file-state is-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          正在读取并识别表头…
        </div>

        <div v-else-if="matrix.length" class="file-summary">
          <div class="file-facts">
            <div><span>文件</span><strong>{{ selectedFileName }}</strong></div>
            <div><span>数据行</span><strong>{{ dataRowCount }} 条</strong></div>
            <div><span>识别表头</span><strong>{{ headers.length }} 列</strong></div>
            <div><span>编码/格式</span><strong>{{ detectedFormat }}</strong></div>
          </div>
          <div class="mini-preview">
            <h3>原始数据预览（前 3 行）</h3>
            <div class="raw-table-scroll">
              <table>
                <thead><tr><th v-for="header in headers" :key="header">{{ header }}</th></tr></thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in matrix.slice(1, 4)" :key="rowIndex">
                    <td v-for="(_, columnIndex) in headers" :key="columnIndex">{{ row[columnIndex] || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <el-alert
          class="upload-rule"
          type="info"
          :closable="false"
          show-icon
          title="企业名称为每行必备信息；手机号、企业电话、微信号或统一社会信用代码至少有一项。仅微信号也可导入，但查重强度较弱。"
        />
      </section>

      <section v-else-if="step === 2" class="content-card mapping-step">
        <div class="section-heading">
          <div>
            <span class="eyebrow">第 3 步</span>
            <h2>确认字段映射</h2>
            <p>系统已按常见工商表头自动匹配；来源和去向统一使用第一步配置，不读取文件中的自由文本。</p>
          </div>
          <div class="mapping-score">
            <strong>{{ mappedFieldCount }}</strong>
            <span>/ {{ LEAD_IMPORT_FIELDS.length }} 个字段已匹配</span>
          </div>
        </div>

        <div class="mapping-toolbar">
          <div class="field-legend">
            <el-tag type="danger" effect="plain">必填</el-tag>
            <el-tag type="warning" effect="plain">建议</el-tag>
            <el-tag type="info" effect="plain">补充</el-tag>
          </div>
          <el-button plain @click="resetAutoMapping">
            <el-icon><MagicStick /></el-icon>
            重新自动匹配
          </el-button>
        </div>

        <el-table class="mapping-table" :data="LEAD_IMPORT_FIELDS" row-key="key" max-height="430">
          <el-table-column label="系统字段" min-width="180">
            <template #default="{ row }">
              <div class="system-field">
                <strong>{{ row.label }}</strong>
                <small v-if="row.help">{{ row.help }}</small>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="级别" width="88">
            <template #default="{ row }">
              <el-tag :type="fieldLevelType(row.level)" effect="plain" size="small">{{ fieldLevelLabel(row.level) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="文件中的列" min-width="240">
            <template #default="{ row }">
              <el-select v-model="mappings[row.key]" clearable filterable placeholder="不导入此字段" style="width: 100%">
                <el-option v-for="header in headers" :key="header" :label="header" :value="header" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <span v-if="mappings[row.key]" class="mapping-ok"><el-icon><CircleCheck /></el-icon> 已匹配</span>
              <span v-else-if="row.level === 'required'" class="mapping-missing">必须匹配</span>
              <span v-else class="mapping-skip">跳过</span>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="mappedRows.length" class="mapped-preview">
          <h3>映射后预览</h3>
          <div class="preview-cards">
            <article v-for="row in mappedRows.slice(0, 3)" :key="row.rowNumber">
              <span>第 {{ row.rowNumber }} 行</span>
              <strong>{{ row.company || '企业名称未映射' }}</strong>
              <small>{{ row.phone || row.companyPhone || row.creditCode || '无联系电话或信用代码' }}</small>
            </article>
          </div>
        </div>
      </section>

      <section v-else-if="step === 3" class="content-card preflight-step">
        <div class="section-heading">
          <div>
            <span class="eyebrow">第 4 步</span>
            <h2>查重与数据校验</h2>
            <p>默认只导入“可导入”数据；重复固定跳过，冲突和错误不会写入。</p>
          </div>
          <el-button plain :loading="preflightLoading" @click="runPreflight">
            <el-icon><Refresh /></el-icon>
            重新预检
          </el-button>
        </div>

        <div class="summary-grid">
          <button type="button" :class="{ active: preflightFilter === 'ALL' }" @click="preflightFilter = 'ALL'">
            <span>文件总数</span><strong>{{ preflightSummary.total }}</strong>
          </button>
          <button type="button" class="is-success" :class="{ active: preflightFilter === 'READY' }" @click="preflightFilter = 'READY'">
            <span>可导入</span><strong>{{ preflightSummary.importable }}</strong>
          </button>
          <button type="button" class="is-muted" :class="{ active: preflightFilter === 'DUPLICATE' }" @click="preflightFilter = 'DUPLICATE'">
            <span>重复跳过</span><strong>{{ preflightSummary.duplicate }}</strong>
          </button>
          <button type="button" class="is-warning" :class="{ active: preflightFilter === 'CONFLICT' }" @click="preflightFilter = 'CONFLICT'">
            <span>需人工处理</span><strong>{{ preflightSummary.conflict }}</strong>
          </button>
          <button type="button" class="is-danger" :class="{ active: preflightFilter === 'ERROR' }" @click="preflightFilter = 'ERROR'">
            <span>数据错误</span><strong>{{ preflightSummary.error }}</strong>
          </button>
        </div>

        <div v-if="preflightSummary.warning" class="warning-line">
          <el-icon><WarningFilled /></el-icon>
          {{ preflightSummary.warning }} 条可导入数据含提示信息，请在下方原因列确认。
        </div>

        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="查重顺序：统一社会信用代码、标准化公司名称、手机号。重复记录不会覆盖原负责人、跟进状态、来源或下一步任务。"
        />

        <el-table class="result-table desktop-table" :data="filteredPreflightRows" max-height="390" empty-text="当前分类没有数据">
          <el-table-column prop="rowNumber" label="行号" width="72" />
          <el-table-column label="企业名称" min-width="230" show-overflow-tooltip>
            <template #default="{ row }">{{ preflightRowData(row).company || '—' }}</template>
          </el-table-column>
          <el-table-column label="联系电话" width="150">
            <template #default="{ row }">{{ preflightRowData(row).phone || preflightRowData(row).companyPhone || '—' }}</template>
          </el-table-column>
          <el-table-column label="信用代码" min-width="190" show-overflow-tooltip>
            <template #default="{ row }">{{ preflightRowData(row).creditCode || '—' }}</template>
          </el-table-column>
          <el-table-column label="校验结果" width="120">
            <template #default="{ row }"><el-tag :type="preflightStatusType(row)" effect="plain">{{ preflightStatusLabel(row) }}</el-tag></template>
          </el-table-column>
          <el-table-column label="原因" min-width="260" show-overflow-tooltip>
            <template #default="{ row }">{{ preflightReasonText(row) }}</template>
          </el-table-column>
          <el-table-column label="现有记录" min-width="190">
            <template #default="{ row }">
              <div v-if="row.existingLocation" class="existing-record-cell">
                <span>{{ row.existingLocation }}<small v-if="row.existingOwnerName"> · {{ row.existingOwnerName }}</small></span>
                <el-button
                  v-if="row.existingTarget && row.existingTarget !== 'NONE'"
                  link
                  type="primary"
                  @click="locateExisting(row)"
                >去查看</el-button>
              </div>
              <span v-else>—</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="mobile-result-list">
          <article v-for="row in filteredPreflightRows" :key="row.rowNumber" class="result-card">
            <div><span>第 {{ row.rowNumber }} 行</span><el-tag :type="preflightStatusType(row)" effect="plain" size="small">{{ preflightStatusLabel(row) }}</el-tag></div>
            <strong>{{ preflightRowData(row).company || '企业名称缺失' }}</strong>
            <small>{{ preflightRowData(row).phone || preflightRowData(row).companyPhone || preflightRowData(row).creditCode || '无联系方式/信用代码' }}</small>
            <p>{{ preflightReasonText(row) }}</p>
            <div v-if="row.existingLocation" class="mobile-existing-record">
              <span>现有记录：{{ row.existingLocation }}<template v-if="row.existingOwnerName"> · {{ row.existingOwnerName }}</template></span>
              <el-button
                v-if="row.existingTarget && row.existingTarget !== 'NONE'"
                link
                type="primary"
                @click="locateExisting(row)"
              >去查看</el-button>
            </div>
          </article>
        </div>
      </section>

      <section v-else class="content-card result-step">
        <div class="result-hero" :class="{ 'has-error': confirmSummary.error > 0 }">
          <el-icon><SuccessFilled /></el-icon>
          <div>
            <span class="eyebrow">第 5 步 · 导入完成</span>
            <h2>已导入 {{ confirmSummary.imported }} 条至“{{ destinationLabel }}”</h2>
            <p>批次：{{ config.batchName }} · 来源：{{ selectedSourceScene?.label }}{{ config.sourcePlatform ? ` / ${config.sourcePlatform}` : '' }}</p>
          </div>
        </div>

        <div class="summary-grid result-summary">
          <div><span>处理总数</span><strong>{{ confirmSummary.total }}</strong></div>
          <div class="is-success"><span>导入成功</span><strong>{{ confirmSummary.imported }}</strong></div>
          <div class="is-muted"><span>重复跳过</span><strong>{{ confirmSummary.duplicate }}</strong></div>
          <div class="is-warning"><span>冲突跳过</span><strong>{{ confirmSummary.conflict }}</strong></div>
          <div class="is-danger"><span>导入失败</span><strong>{{ confirmSummary.error }}</strong></div>
        </div>

        <div v-if="problemRows.length" class="problem-panel">
          <div>
            <h3>问题清单</h3>
            <p>{{ problemRows.length }} 条未导入，可下载清单并对照原文件修正，再作为新批次重新预检。</p>
          </div>
          <el-button plain @click="downloadProblemCsv">
            <el-icon><Download /></el-icon>
            下载问题清单 CSV
          </el-button>
        </div>
        <el-empty v-else description="本批次全部成功导入，没有问题数据" :image-size="92" />

        <div class="result-actions">
          <el-button size="large" @click="startAnotherImport">继续导入新批次</el-button>
          <el-button type="primary" size="large" @click="goLeadList">返回找客户</el-button>
        </div>
      </section>
    </main>

    <footer v-if="step < 4" class="action-bar">
      <div class="action-context">
        <span>第 {{ step + 1 }} / 5 步</span>
        <strong>{{ currentActionContext }}</strong>
      </div>
      <div class="action-buttons">
        <el-button v-if="step === 0" @click="goLeadList">取消</el-button>
        <el-button v-else @click="previousStep">上一步</el-button>
        <el-button v-if="step < 2" type="primary" :disabled="!canContinue" @click="nextStep">下一步</el-button>
        <el-button v-else-if="step === 2" type="primary" :loading="preflightLoading" :disabled="!canContinue" @click="runPreflight">
          开始查重校验
        </el-button>
        <el-button
          v-else
          type="primary"
          :loading="confirmLoading"
          :disabled="preflightSummary.importable < 1 || !previewToken"
          @click="confirmImport"
        >
          导入 {{ preflightSummary.importable }} 条至 {{ destinationLabel }}
        </el-button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type UploadFile, type UploadFiles, type UploadInstance, type UploadUserFile } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  CircleCheckFilled,
  Download,
  InfoFilled,
  Loading,
  MagicStick,
  Refresh,
  SuccessFilled,
  UploadFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import { readSheet as readXlsxSheet } from 'read-excel-file/browser'
import {
  leadApi,
  poolConfigApi,
  poolRuleApi,
  type LeadImportConfirmResponse,
  type LeadImportConfirmRow,
  type LeadImportConfirmSummary,
  type LeadImportPreflightResponse,
  type LeadImportPreflightRow,
  type LeadImportPreflightStatus,
  type LeadImportPreflightSummary,
  type LeadImportRequest,
  type PoolConfig
} from '@/api/crm'
import {
  getLeadImportSourceRequirement,
  LEAD_IMPORT_SOURCE_SCENES,
  resolveLeadImportSourceType,
  type LeadImportSourceScene
} from '@/constants/lead-source'
import { useUserStore } from '@/stores/user'
import {
  LEAD_IMPORT_FIELDS,
  autoMapLeadImportHeaders,
  buildLeadImportRows,
  escapeCsvCell,
  normalizeLeadImportMatrix,
  parseLeadImportCsv,
  type LeadImportFieldLevel,
  type LeadImportMapping,
  type MappedLeadImportRow
} from '@/utils/lead-import'

const STEP_LABELS = ['来源与去向', '上传文件', '字段映射', '查重校验', '导入结果']
const MAX_IMPORT_ROWS = 100000
const EMPTY_PREFLIGHT: LeadImportPreflightSummary = { total: 0, importable: 0, duplicate: 0, conflict: 0, error: 0, warning: 0 }
const EMPTY_CONFIRM: LeadImportConfirmSummary = { total: 0, imported: 0, duplicate: 0, conflict: 0, error: 0, warning: 0 }

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const MANAGER_ROLES = new Set(['admin', 'boss', 'manager', 'dept_manager'])
const canManageSales = computed(() => (userStore.roles || []).some((role) => {
  const baseRole = String(role).split('__', 1)[0]
  return MANAGER_ROLES.has(String(role)) || MANAGER_ROLES.has(baseRole)
}))

const step = ref(0)
const importLimitLoading = ref(true)
const singleImportLimit = ref(1000)
const dailyImportLimit = ref(10000)
const todayImported = ref(0)
const remainingImportLimit = computed(() => Math.max(0, dailyImportLimit.value - todayImported.value))
const config = reactive({ sourceType: 0, sourcePlatform: '', sourceDetail: '', batchName: '' })
const lastAutoBatchName = ref('')
const selectedSceneKey = ref('')
const selectedSourceScene = computed(() => LEAD_IMPORT_SOURCE_SCENES.find((item) => item.key === selectedSceneKey.value))
const sourcePlatforms = computed(() => selectedSourceScene.value?.platforms || [])
const platformPlaceholder = computed(() => selectedSourceScene.value ? `请选择或输入${selectedSourceScene.value.label}的具体平台` : '请先选择一级来源')
const sourceRequirement = computed(() => getLeadImportSourceRequirement(config.sourceType))
const sourceMetadataValid = computed(() => {
  const hasPlatform = Boolean(config.sourcePlatform.trim())
  const hasDetail = Boolean(config.sourceDetail.trim())
  if (sourceRequirement.value === 'platform') return hasPlatform
  if (sourceRequirement.value === 'detail') return hasDetail
  if (sourceRequirement.value === 'either') return hasPlatform || hasDetail
  return false
})
const sourceRequirementHint = computed(() => {
  if (!selectedSourceScene.value) return ''
  if (sourceRequirement.value === 'platform') return sourceMetadataValid.value ? '具体平台/渠道已填写，可追溯本批资源来源。' : '此来源必须填写具体平台/渠道后才能继续。'
  if (sourceRequirement.value === 'detail') return sourceMetadataValid.value ? '来源说明已填写，可追溯本批资源来源。' : '此来源必须填写来源说明或活动名称后才能继续。'
  return sourceMetadataValid.value ? '平台或来源说明已填写，可追溯本批资源来源。' : '具体平台/渠道与来源说明至少填写一项。'
})

interface DestinationOption { key: string; label: string; description: string; poolId: number | null }
const poolLoading = ref(false)
const poolConfigs = ref<PoolConfig[]>([])
const destinationKey = ref('company')
const destinationOptions = computed<DestinationOption[]>(() => [
  { key: 'company', label: '公司公海', description: '不指定公海池，进入公司默认公海', poolId: null },
  ...poolConfigs.value.map((pool) => ({
    key: `pool-${pool.id}`,
    label: pool.poolName,
    description: pool.description || '当前租户已启用公海',
    poolId: pool.id
  }))
])
const selectedDestination = computed(() => destinationOptions.value.find((item) => item.key === destinationKey.value) || destinationOptions.value[0])
const destinationLabel = computed(() => selectedDestination.value?.label || '公司公海')
const selectedPoolId = computed(() => selectedDestination.value?.poolId ?? null)

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const selectedFileName = ref('')
const detectedFormat = ref('')
const fileParsing = ref(false)
const matrix = ref<string[][]>([])
const headers = computed(() => matrix.value[0] || [])
const dataRowCount = computed(() => matrix.value.slice(1).filter((row) => row.some(Boolean)).length)
const mappings = reactive<LeadImportMapping>({})
const mappedRows = computed<MappedLeadImportRow[]>(() => buildLeadImportRows(matrix.value, mappings))
const mappedFieldCount = computed(() => Object.values(mappings).filter(Boolean).length)

const preflightLoading = ref(false)
const previewToken = ref('')
const preflightSummary = reactive<LeadImportPreflightSummary>({ ...EMPTY_PREFLIGHT })
const preflightRows = ref<LeadImportPreflightRow[]>([])
const preflightFilter = ref<'ALL' | LeadImportPreflightStatus>('ALL')
const mappedRowMap = computed(() => new Map(mappedRows.value.map((row) => [row.rowNumber, row])))
const filteredPreflightRows = computed(() => preflightFilter.value === 'ALL'
  ? preflightRows.value
  : preflightRows.value.filter((row) => row.status === preflightFilter.value))

const confirmLoading = ref(false)
const confirmSummary = reactive<LeadImportConfirmSummary>({ ...EMPTY_CONFIRM })
const confirmRows = ref<LeadImportConfirmRow[]>([])
const problemRows = computed(() => confirmRows.value.filter((row) => row.status !== 'IMPORTED'))

const canContinue = computed(() => {
  if (step.value === 0) return Boolean(selectedSceneKey.value) && config.sourceType > 0 && sourceMetadataValid.value && Boolean(config.batchName.trim()) && Boolean(destinationKey.value)
  if (step.value === 1) return matrix.value.length > 1 && dataRowCount.value <= 1000
  if (step.value === 2) return Boolean(mappings.company) && mappedRows.value.length > 0
  return true
})

const currentActionContext = computed(() => {
  if (step.value === 0) return config.sourceType ? `${selectedSourceScene.value?.label || ''} → ${destinationLabel.value}` : '先选择本批次的真实来源'
  if (step.value === 1) return matrix.value.length ? `${dataRowCount.value} 条待映射` : '请选择 XLSX 或 CSV 文件'
  if (step.value === 2) return `${mappedFieldCount.value} 个字段已匹配`
  return `${preflightSummary.importable} 条可导入，${preflightSummary.duplicate + preflightSummary.conflict + preflightSummary.error} 条不写入`
})

function unwrapResponse<T>(response: unknown): T {
  const value = response as any
  return value && typeof value === 'object' && 'code' in value && 'data' in value ? value.data as T : value as T
}

function selectSource(scene: LeadImportSourceScene) {
  const shouldRefreshAutoBatch = !config.batchName.trim() || config.batchName === lastAutoBatchName.value
  selectedSceneKey.value = scene.key
  config.sourceType = scene.defaultSourceType
  config.sourcePlatform = ''
  config.sourceDetail = ''
  if (shouldRefreshAutoBatch) {
    const today = new Date()
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    config.batchName = `${date} ${scene.label}`.slice(0, 32)
    lastAutoBatchName.value = config.batchName
  }
}

function handlePlatformChange(value: string) {
  if (value && value.length > 32) {
    config.sourcePlatform = value.slice(0, 32)
    ElMessage.warning('具体平台/渠道最多32个字，已自动截短')
  }
  const scene = selectedSourceScene.value
  if (scene) config.sourceType = resolveLeadImportSourceType(scene, config.sourcePlatform)
}

async function loadPools() {
  poolLoading.value = true
  try {
    const pools = await poolConfigApi.list()
    const importablePoolTypes = new Set(['telemarketing', 'online', 'collaboration', 'new_leads'])
    poolConfigs.value = (Array.isArray(pools) ? pools : [])
      .filter((pool) => Number(pool.status) === 0 && Number(pool.id) > 0 && importablePoolTypes.has(pool.poolType))
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    const requestedPoolId = Number(route.query.poolId)
    if (Number.isFinite(requestedPoolId) && poolConfigs.value.some((pool) => pool.id === requestedPoolId)) {
      destinationKey.value = `pool-${requestedPoolId}`
    }
  } catch {
    poolConfigs.value = []
    ElMessage.warning('未能读取公海配置，本次仍可选择公司公海')
  } finally {
    poolLoading.value = false
  }
}

async function loadImportLimits() {
  importLimitLoading.value = true
  try {
    const overview = await poolRuleApi.overview()
    const configuredSingle = Number(overview?.active?.singleImportLimit)
    const configuredDaily = Number(overview?.active?.dailyImportLimit)
    const usedToday = Number(overview?.todayImported)
    singleImportLimit.value = Number.isFinite(configuredSingle) && configuredSingle > 0
      ? Math.min(MAX_IMPORT_ROWS, configuredSingle)
      : 1000
    dailyImportLimit.value = Number.isFinite(configuredDaily) && configuredDaily > 0
      ? Math.min(MAX_IMPORT_ROWS, configuredDaily)
      : 10000
    todayImported.value = Number.isFinite(usedToday) && usedToday > 0 ? usedToday : 0
  } catch {
    singleImportLimit.value = MAX_IMPORT_ROWS
    dailyImportLimit.value = MAX_IMPORT_ROWS
    todayImported.value = 0
    ElMessage.warning('未能读取当前导入额度，文件仍可上传，预检时将由服务器按生效规则校验')
  } finally {
    importLimitLoading.value = false
  }
}

function nextStep() {
  if (!canContinue.value) {
    if (step.value === 0) ElMessage.warning(sourceMetadataValid.value ? '请选择来源、填写批次名称并确认导入去向' : sourceRequirementHint.value)
    if (step.value === 1) ElMessage.warning('请先上传并成功读取文件')
    return
  }
  step.value += 1
}

function previousStep() {
  if (step.value === 3) clearPreflight()
  step.value = Math.max(0, step.value - 1)
}

function navigateToStep(target: number) {
  if (target >= step.value || step.value === 4) return
  if (step.value >= 3 && target < 3) clearPreflight()
  step.value = target
}

function goLeadList() {
  router.push('/customer/lead')
}

function clearFile() {
  fileList.value = []
  selectedFileName.value = ''
  detectedFormat.value = ''
  matrix.value = []
  Object.keys(mappings).forEach((key) => delete mappings[key])
  clearPreflight()
}

function handleFileExceed() {
  ElMessage.warning('每次只处理一个文件，请先移除当前文件后再选择')
}

function decodeCsv(buffer: ArrayBuffer): { text: string; encoding: string } {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(buffer), encoding: 'CSV · UTF-8' }
  } catch {
    return { text: new TextDecoder('gb18030').decode(buffer), encoding: 'CSV · GBK/GB18030' }
  }
}

async function handleFileChange(file: UploadFile, files: UploadFiles) {
  if (!file.raw) return
  fileList.value = files
  selectedFileName.value = file.name
  fileParsing.value = true
  matrix.value = []
  try {
    if (file.raw.size > 10 * 1024 * 1024) throw new Error('文件超过10MB，请拆分后重新上传')
    const lowerName = file.name.toLowerCase()
    let parsed: unknown[][]
    if (lowerName.endsWith('.xlsx')) {
      parsed = await readXlsxSheet(file.raw)
      detectedFormat.value = 'XLSX'
    } else if (lowerName.endsWith('.csv')) {
      const decoded = decodeCsv(await file.raw.arrayBuffer())
      parsed = parseLeadImportCsv(decoded.text)
      detectedFormat.value = decoded.encoding
    } else if (lowerName.endsWith('.xls')) {
      throw new Error('旧版 .xls 暂不支持，请在 Excel 中另存为 .xlsx 后上传')
    } else {
      throw new Error('仅支持 .xlsx 和 .csv 文件')
    }
    const normalized = normalizeLeadImportMatrix(parsed)
    const nonEmptyRows = normalized.slice(1).filter((row) => row.some(Boolean)).length
    if (!normalized[0]?.some(Boolean) || nonEmptyRows < 1) throw new Error('文件为空，或只有表头没有数据')
    if (nonEmptyRows > singleImportLimit.value) {
      throw new Error(`文件有 ${nonEmptyRows.toLocaleString()} 条数据，当前单次最多导入 ${singleImportLimit.value.toLocaleString()} 条，请拆分文件后重试`)
    }
    const duplicateHeaders = normalized[0].filter((header, index, all) => header && all.indexOf(header) !== index)
    if (duplicateHeaders.length) throw new Error(`表头存在重名列：${Array.from(new Set(duplicateHeaders)).join('、')}`)
    matrix.value = normalized
    resetAutoMapping()
    clearPreflight()
  } catch (error) {
    clearFile()
    ElMessage.error(error instanceof Error ? error.message : '文件读取失败，请确认文件格式')
  } finally {
    fileParsing.value = false
  }
}

function resetAutoMapping() {
  Object.keys(mappings).forEach((key) => delete mappings[key])
  Object.assign(mappings, autoMapLeadImportHeaders(headers.value))
}

function fieldLevelLabel(level: LeadImportFieldLevel) {
  return level === 'required' ? '必填' : level === 'recommended' ? '建议' : '补充'
}

function fieldLevelType(level: LeadImportFieldLevel): 'danger' | 'warning' | 'info' {
  return level === 'required' ? 'danger' : level === 'recommended' ? 'warning' : 'info'
}

function buildRequest(): LeadImportRequest {
  return {
    sourceType: config.sourceType,
    sourcePlatform: config.sourcePlatform.trim() || undefined,
    sourceDetail: config.sourceDetail.trim() || undefined,
    batchName: config.batchName.trim(),
    poolId: selectedPoolId.value,
    rows: mappedRows.value
  }
}

function clearPreflight() {
  previewToken.value = ''
  Object.assign(preflightSummary, EMPTY_PREFLIGHT)
  preflightRows.value = []
  preflightFilter.value = 'ALL'
}

async function runPreflight() {
  if (!mappings.company) return ElMessage.warning('请先把文件中的企业名称映射到系统字段')
  if (!mappedRows.value.length) return ElMessage.warning('没有可预检的数据')
  preflightLoading.value = true
  clearPreflight()
  try {
    const response = unwrapResponse<LeadImportPreflightResponse>(await leadApi.importPreflight(buildRequest()))
    previewToken.value = response.previewToken || ''
    Object.assign(preflightSummary, EMPTY_PREFLIGHT, response.summary || {})
    preflightRows.value = Array.isArray(response.rows) ? response.rows : []
    step.value = 3
  } catch {
    ElMessage.error('预检失败，数据尚未导入，请检查后重试')
  } finally {
    preflightLoading.value = false
  }
}

function preflightRowData(row: LeadImportPreflightRow): MappedLeadImportRow {
  return (row.row || mappedRowMap.value.get(row.rowNumber) || { rowNumber: row.rowNumber }) as MappedLeadImportRow
}

function preflightStatusLabel(row: LeadImportPreflightRow) {
  if (row.status === 'READY' && hasPreflightWarnings(row)) return '可导入·有提醒'
  return ({ READY: '可导入', DUPLICATE: '重复跳过', CONFLICT: '需人工处理', ERROR: '数据错误' } as Record<string, string>)[row.status] || row.status
}

function preflightStatusType(row: LeadImportPreflightRow): 'success' | 'info' | 'warning' | 'danger' {
  if (row.status === 'READY' && hasPreflightWarnings(row)) return 'warning'
  return ({ READY: 'success', DUPLICATE: 'info', CONFLICT: 'warning', ERROR: 'danger' } as const)[row.status] || 'info'
}

function preflightReasonText(row: LeadImportPreflightRow): string {
  const warningTexts = row.warnings?.length
    ? row.warnings
    : (row.warningCodes || []).map((code) => code === 'WECHAT_ONLY_WEAK_DEDUPE' ? '只有微信号，查重强度较弱' : code)
  return [...(row.reasons || []), ...warningTexts].join('；') || '校验通过'
}

function hasPreflightWarnings(row: LeadImportPreflightRow): boolean {
  return Boolean(row.warnings?.length || row.warningCodes?.length)
}

function locateExisting(row: LeadImportPreflightRow) {
  const company = preflightRowData(row).company || ''
  const query: Record<string, string> = company ? { keyword: company } : {}
  if (row.existingTarget === 'PUBLIC_POOL') {
    router.push({ path: '/customer/lead', query })
  } else if (row.existingTarget === 'HISTORY') {
    router.push({ path: '/customer/lead', query: { ...query, tab: 'history' } })
  } else if (row.existingTarget === 'ACTIVE') {
    router.push({ path: '/customer/customers', query: { ...query, view: 'active' } })
  } else if (row.existingTarget === 'CUSTOMER') {
    router.push({ path: '/customer/customers', query: { ...query, view: 'formal' } })
  }
}

async function confirmImport() {
  if (!previewToken.value || preflightSummary.importable < 1) return
  confirmLoading.value = true
  try {
    const response = unwrapResponse<LeadImportConfirmResponse>(await leadApi.importConfirm({
      ...buildRequest(),
      previewToken: previewToken.value
    }))
    Object.assign(confirmSummary, EMPTY_CONFIRM, response.summary || {})
    confirmRows.value = Array.isArray(response.rows) ? response.rows : []
    step.value = 4
  } catch {
    ElMessage.error('导入未完成，预检凭证可能已失效，请重新预检后再确认')
  } finally {
    confirmLoading.value = false
  }
}

function downloadCsv(fileName: string, rows: unknown[][]) {
  const content = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadTemplate() {
  const templateHeaders = LEAD_IMPORT_FIELDS.map((field) => field.label)
  const sample: Record<string, string> = {
    企业名称: '杭州示例企业管理有限公司',
    有效手机号: '13800000000',
    企业联系电话: '0571-88888888',
    统一社会信用代码: '91330100MA0000000X',
    '法定代表人/联系人': '张三',
    登记状态: '存续',
    所属省份: '浙江省',
    所属城市: '杭州市',
    所属区县: '西湖区',
    行业门类: '租赁和商务服务业',
    成立日期: '2024-01-15',
    注册地址: '浙江省杭州市西湖区示例路1号',
    经营范围: '企业管理咨询；代理记账'
  }
  downloadCsv('公司资源批量导入模板.csv', [templateHeaders, templateHeaders.map((header) => sample[header] || '')])
}

function downloadProblemCsv() {
  const rows = problemRows.value.map((result) => {
    const source = mappedRowMap.value.get(result.rowNumber)
    return [
      result.rowNumber,
      result.status,
      source?.company || '',
      source?.phone || source?.companyPhone || '',
      source?.creditCode || '',
      result.reasons?.join('；') || ''
    ]
  })
  downloadCsv(`${config.batchName || '公司资源'}_问题清单.csv`, [
    ['原文件行号', '处理状态', '企业名称', '联系电话', '统一社会信用代码', '原因'],
    ...rows
  ])
}

function startAnotherImport() {
  step.value = 0
  config.sourceType = 0
  selectedSceneKey.value = ''
  config.sourcePlatform = ''
  config.sourceDetail = ''
  config.batchName = ''
  lastAutoBatchName.value = ''
  destinationKey.value = 'company'
  clearFile()
  Object.assign(confirmSummary, EMPTY_CONFIRM)
  confirmRows.value = []
  uploadRef.value?.clearFiles()
}

onMounted(async () => {
  if (!canManageSales.value) {
    ElMessage.warning('仅主管、老板或管理员可批量导入公司资源')
    await router.replace('/customer/lead')
    return
  }
  await Promise.all([loadPools(), loadImportLimits()])
})
</script>

<style scoped>
.lead-import-page {
  min-height: calc(100vh - 60px);
  padding: 20px 24px 28px;
  color: var(--text-primary, #1f2937);
  background: var(--bg-card, #f4f6f9);
}

.page-header,
.section-heading,
.mapping-toolbar,
.action-bar,
.problem-panel,
.result-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-header {
  max-width: 1440px;
  margin: 0 auto 16px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.back-button { flex-shrink: 0; }
.page-header h1,
.section-heading h2 { margin: 0; color: var(--text-primary, #172033); }
.page-header h1 { font-size: 24px; line-height: 1.35; }
.page-header p,
.section-heading p,
.problem-panel p { margin: 5px 0 0; color: var(--text-body, #667085); line-height: 1.55; }

.step-nav {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  max-width: 1440px;
  margin: 0 auto 16px;
  padding: 8px;
  border: 1px solid var(--border-gold, #dfe4ec);
  border-radius: 12px;
  background: var(--bg-elevated, #fff);
}

.step-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-width: 0;
  padding: 10px 8px;
  border: 0;
  border-radius: 8px;
  color: var(--text-body, #667085);
  background: transparent;
  cursor: default;
}

.step-item:not(:disabled) { cursor: pointer; }
.step-item.is-current { color: #2457d6; background: rgba(51, 112, 255, .09); font-weight: 700; }
.step-item.is-done { color: #167a5c; }
.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}
.step-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.step-body { max-width: 1440px; margin: 0 auto; }
.content-card {
  min-height: 510px;
  padding: 24px;
  border: 1px solid var(--border-gold, #dfe4ec);
  border-radius: 14px;
  background: var(--bg-elevated, #fff);
  box-shadow: 0 10px 28px rgba(31, 42, 61, .05);
}

.section-heading { align-items: flex-start; margin-bottom: 20px; }
.section-heading h2 { font-size: 20px; line-height: 1.4; }
.eyebrow { display: block; margin-bottom: 4px; color: #3370ff; font-size: 12px; font-weight: 700; letter-spacing: .08em; }

.source-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.source-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  min-height: 92px;
  padding: 15px;
  border: 1px solid var(--border-gold, #dfe4ec);
  border-radius: 8px;
  color: inherit;
  text-align: left;
  background: var(--bg-elevated, #fff);
  cursor: pointer;
  transition: border-color .18s, box-shadow .18s, transform .18s;
}
.source-card:hover { border-color: #8aacff; transform: translateY(-1px); }
.source-card.is-active { border-color: #3370ff; box-shadow: 0 0 0 3px rgba(51, 112, 255, .12); background: rgba(51, 112, 255, .035); }
.source-index { flex: 0 0 auto; padding-top: 2px; color: #3370ff; font-size: 12px; font-weight: 800; }
.source-copy { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 6px; }
.source-copy strong { font-size: 15px; }
.source-copy small { color: var(--text-body, #667085); line-height: 1.45; }
.source-check { flex: 0 0 auto; color: #3370ff; opacity: 0; }
.source-card.is-active .source-check { opacity: 1; }
.business-warning { margin-top: 16px; }

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--border-gold, #e5e7eb);
}
.form-field { display: flex; min-width: 0; flex-direction: column; gap: 8px; }
.form-field > span { font-size: 14px; font-weight: 600; }
.form-field b { color: #d14343; font-size: 12px; }
.form-field em { color: var(--text-body, #667085); font-size: 12px; font-style: normal; font-weight: 400; }
.pool-option { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.pool-option small { color: var(--text-body, #667085); }
.destination-note,
.source-requirement,
.warning-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: var(--text-body, #667085);
  font-size: 13px;
  line-height: 1.5;
}
.source-requirement {
  color: #b54708;
}
.source-requirement .el-icon { color: #f79009; }
.source-requirement.is-complete { color: #067647; }
.source-requirement.is-complete .el-icon { color: #12b76a; }
.destination-note .el-icon { color: #3370ff; }

.batch-context { display: flex; align-items: center; gap: 8px; color: var(--text-body, #667085); font-size: 13px; }
.batch-context strong { color: #3370ff; }
.file-uploader :deep(.el-upload) { width: 100%; }
.file-uploader :deep(.el-upload-dragger) {
  width: 100%;
  min-height: 220px;
  padding: 44px 20px;
  border-color: #a9b7ce;
  background: rgba(51, 112, 255, .025);
}
.file-uploader :deep(.el-upload-dragger:hover) { border-color: #3370ff; }
.upload-icon { color: #3370ff; font-size: 54px; }
.upload-title { margin-top: 12px; font-size: 17px; font-weight: 700; }
.file-uploader p { margin: 8px 0 0; color: var(--text-body, #667085); }
.file-state { display: flex; justify-content: center; gap: 8px; padding: 30px; color: #3370ff; }
.file-summary { margin-top: 18px; }
.file-facts { display: grid; grid-template-columns: 2fr repeat(3, 1fr); gap: 10px; }
.file-facts > div { min-width: 0; padding: 12px 14px; border: 1px solid var(--border-gold, #e1e5eb); border-radius: 8px; }
.file-facts span { display: block; color: var(--text-body, #667085); font-size: 12px; }
.file-facts strong { display: block; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mini-preview { margin-top: 16px; }
.mini-preview h3,
.mapped-preview h3,
.problem-panel h3 { margin: 0 0 10px; font-size: 15px; }
.raw-table-scroll { width: 100%; overflow-x: auto; border: 1px solid var(--border-gold, #e1e5eb); border-radius: 8px; }
.raw-table-scroll table { min-width: 100%; border-collapse: collapse; white-space: nowrap; font-size: 12px; }
.raw-table-scroll th,
.raw-table-scroll td { max-width: 220px; padding: 8px 10px; overflow: hidden; border-bottom: 1px solid var(--border-gold, #edf0f4); text-overflow: ellipsis; text-align: left; }
.raw-table-scroll th { color: #344054; background: #f7f9fc; }
.upload-rule { margin-top: 16px; }

.mapping-score { display: flex; align-items: baseline; gap: 5px; flex-shrink: 0; }
.mapping-score strong { color: #3370ff; font-size: 26px; }
.mapping-score span { color: var(--text-body, #667085); font-size: 13px; }
.mapping-toolbar { margin-bottom: 12px; }
.field-legend { display: flex; gap: 8px; }
.mapping-table { width: 100%; }
.system-field { display: flex; flex-direction: column; gap: 3px; }
.system-field small { color: var(--text-body, #667085); }
.mapping-ok { display: inline-flex; align-items: center; gap: 4px; color: #16845b; font-size: 13px; }
.mapping-missing { color: #d14343; font-size: 13px; font-weight: 600; }
.mapping-skip { color: #98a2b3; font-size: 13px; }
.mapped-preview { margin-top: 16px; }
.preview-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.preview-cards article { display: flex; min-width: 0; flex-direction: column; gap: 4px; padding: 12px; border: 1px solid var(--border-gold, #e1e5eb); border-radius: 8px; }
.preview-cards span,
.preview-cards small { color: var(--text-body, #667085); font-size: 12px; }
.preview-cards strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.summary-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
.summary-grid button,
.summary-grid > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  padding: 14px 16px;
  border: 1px solid var(--border-gold, #dfe4ec);
  border-radius: 9px;
  color: inherit;
  text-align: left;
  background: var(--bg-elevated, #fff);
}
.summary-grid button { cursor: pointer; }
.summary-grid button.active { border-color: #3370ff; box-shadow: 0 0 0 2px rgba(51, 112, 255, .12); }
.summary-grid span { color: var(--text-body, #667085); font-size: 12px; }
.summary-grid strong { font-size: 24px; }
.summary-grid .is-success strong { color: #16845b; }
.summary-grid .is-muted strong { color: #667085; }
.summary-grid .is-warning strong { color: #b7791f; }
.summary-grid .is-danger strong { color: #d14343; }
.warning-line { margin: -4px 0 14px; color: #9a6700; }
.preflight-step > .el-alert { margin-bottom: 14px; }
.result-table { width: 100%; }
.mobile-result-list { display: none; }
.existing-record-cell,
.mobile-existing-record {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.existing-record-cell span,
.mobile-existing-record span { min-width: 0; }
.existing-record-cell small { color: var(--el-text-color-secondary); }

.result-hero { display: flex; align-items: center; gap: 18px; padding: 22px; border-radius: 12px; background: linear-gradient(135deg, rgba(22, 132, 91, .12), rgba(22, 132, 91, .03)); }
.result-hero > .el-icon { flex: 0 0 auto; color: #16845b; font-size: 52px; }
.result-hero h2 { margin: 0; font-size: 22px; }
.result-hero p { margin: 7px 0 0; color: var(--text-body, #667085); }
.result-summary { margin-top: 18px; }
.problem-panel { margin-top: 18px; padding: 16px; border: 1px solid #edcf8b; border-radius: 8px; background: #fffbeb; }
.problem-panel h3 { margin-bottom: 2px; }
.result-actions { justify-content: flex-end; margin-top: 24px; }

.action-bar {
  position: sticky;
  z-index: 8;
  bottom: 0;
  max-width: 1440px;
  margin: 16px auto 0;
  padding: 13px 16px;
  border: 1px solid var(--border-gold, #dfe4ec);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-elevated, #fff) 94%, transparent);
  box-shadow: 0 -8px 22px rgba(31, 42, 61, .08);
  backdrop-filter: blur(12px);
}
.action-context { display: flex; min-width: 0; flex-direction: column; gap: 2px; }
.action-context span { color: var(--text-body, #667085); font-size: 12px; }
.action-context strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.action-buttons { display: flex; flex-shrink: 0; gap: 10px; }

@media (max-width: 1050px) {
  .source-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .file-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .lead-import-page {
    position: fixed;
    z-index: 1500;
    inset: 0;
    width: 100vw;
    height: 100dvh;
    min-height: 0;
    padding: 12px 12px 20px;
    overflow-y: auto;
  }
  .page-header { align-items: flex-start; }
  .page-header > .el-button { flex-shrink: 0; }
  .header-main { align-items: flex-start; }
  .back-button { padding-left: 0; }
  .page-header h1 { font-size: 20px; }
  .page-header p { display: none; }
  .step-nav { gap: 3px; padding: 5px; }
  .step-item { gap: 0; padding: 8px 3px; }
  .step-label { display: none; }
  .step-item.is-current .step-label { display: none; }
  .content-card { min-height: 0; padding: 16px; border-radius: 11px; }
  .section-heading { flex-direction: column; gap: 10px; }
  .section-heading h2 { font-size: 18px; }
  .source-grid,
  .config-grid,
  .preview-cards,
  .file-facts { grid-template-columns: 1fr; }
  .source-card { min-height: 82px; }
  .batch-context { flex-wrap: wrap; }
  .file-uploader :deep(.el-upload-dragger) { min-height: 180px; padding: 30px 14px; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mapping-table :deep(.el-table__body-wrapper),
  .mapping-table :deep(.el-table__header-wrapper) { overflow-x: auto; }
  .desktop-table { display: none; }
  .mobile-result-list { display: grid; gap: 9px; }
  .result-card { display: flex; min-width: 0; flex-direction: column; gap: 5px; padding: 12px; border: 1px solid var(--border-gold, #e1e5eb); border-radius: 8px; }
  .result-card > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .result-card span,
  .result-card small { color: var(--text-body, #667085); font-size: 12px; }
  .result-card strong { overflow-wrap: anywhere; }
  .result-card p { margin: 3px 0 0; color: var(--text-body, #667085); line-height: 1.5; }
  .result-hero { align-items: flex-start; padding: 16px; }
  .result-hero > .el-icon { font-size: 38px; }
  .result-hero h2 { font-size: 19px; }
  .problem-panel,
  .result-actions { align-items: stretch; flex-direction: column; }
  .result-actions .el-button { width: 100%; margin-left: 0; }
  .action-bar { align-items: stretch; flex-direction: column; gap: 10px; padding: 11px; }
  .action-buttons { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); }
  .action-buttons .el-button { width: 100%; margin-left: 0; white-space: normal; }
  .action-context strong { white-space: normal; }
}

@media (max-width: 430px) {
  .page-header { flex-wrap: wrap; }
  .page-header > .el-button { margin-left: auto; }
  .summary-grid { grid-template-columns: 1fr 1fr; }
  .summary-grid button,
  .summary-grid > div { padding: 11px 12px; }
  .summary-grid strong { font-size: 21px; }
}
</style>
