<template>
  <div class="journal-workspace">
    <header class="journal-header">
      <div>
        <div class="eyebrow">
          <el-icon><Notebook /></el-icon>
          <span>FIN / JOURNAL</span>
        </div>
        <h1>日记账</h1>
      </div>
      <div class="header-actions">
        <el-button :icon="Upload" @click="pasteVisible = true">粘贴导入</el-button>
        <el-button :icon="Download" @click="exportCsv">导出 CSV</el-button>
        <el-button type="primary" :icon="Plus" @click="addEntry">新增记录</el-button>
      </div>
    </header>

    <section class="metric-grid">
      <div class="metric-card income">
        <span>收入合计</span>
        <strong>{{ formatCurrency(metrics.income) }}</strong>
        <small>{{ metrics.incomeCount }} 笔收入</small>
      </div>
      <div class="metric-card expense">
        <span>支出合计</span>
        <strong>{{ formatCurrency(metrics.expense) }}</strong>
        <small>{{ metrics.expenseCount }} 笔支出</small>
      </div>
      <div class="metric-card balance">
        <span>净现金流</span>
        <strong>{{ formatCurrency(metrics.net) }}</strong>
        <small>{{ currentMonthLabel }}</small>
      </div>
      <div class="metric-card pending">
        <span>待处理</span>
        <strong>{{ metrics.pending }}</strong>
        <small>草稿 / 待审核</small>
      </div>
    </section>

    <section class="journal-shell">
      <div class="view-tabs">
        <button
          v-for="view in views"
          :key="view.id"
          class="view-tab"
          :class="{ active: activeView === view.id }"
          @click="switchView(view.id)"
        >
          <el-icon><component :is="view.icon" /></el-icon>
          <span>{{ view.name }}</span>
        </button>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="query.keyword"
            class="search-input"
            clearable
            placeholder="搜索摘要、往来方、项目、标签"
            @keyup.enter="persist"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-date-picker
            v-model="query.dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
          <el-select v-model="query.account" clearable placeholder="账户" class="mini-select">
            <el-option v-for="item in accountOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="query.status" clearable placeholder="状态" class="mini-select">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>

        <div class="toolbar-right">
          <el-popover trigger="click" width="220">
            <template #reference>
              <el-button :icon="Setting">字段</el-button>
            </template>
            <div class="field-menu">
              <el-checkbox
                v-for="field in fields"
                :key="field.key"
                v-model="field.visible"
                :disabled="field.required"
                @change="persistPrefs"
              >
                {{ field.label }}
              </el-checkbox>
            </div>
          </el-popover>

          <el-popover trigger="click" width="300">
            <template #reference>
              <el-button :icon="Sort">排序</el-button>
            </template>
            <div class="sort-menu">
              <el-select v-model="sortState.key" placeholder="排序字段">
                <el-option v-for="field in sortableFields" :key="field.key" :label="field.label" :value="field.key" />
              </el-select>
              <el-segmented v-model="sortState.order" :options="sortOrders" />
            </div>
          </el-popover>

          <el-select v-model="groupBy" clearable placeholder="分组" class="mini-select" :prefix-icon="Filter">
            <el-option label="按账户" value="account" />
            <el-option label="按一级归集" value="primaryCategory" />
            <el-option label="按二级科目" value="category" />
            <el-option label="按状态" value="status" />
            <el-option label="按经办人" value="operator" />
          </el-select>
        </div>
      </div>

      <div v-if="selectedRows.length" class="batch-bar">
        <span>已选择 {{ selectedRows.length }} 条</span>
        <el-button link type="success" :icon="Check" @click="approveSelected">批量通过</el-button>
        <el-button link :icon="CopyDocument" @click="duplicateSelected">复制</el-button>
        <el-button link type="danger" :icon="Delete" @click="deleteSelected">删除</el-button>
      </div>

      <div v-if="activeView === 'summary'" class="summary-board">
        <div class="summary-panel">
          <h3>账户余额</h3>
          <div v-for="item in accountSummary" :key="item.account" class="summary-row">
            <span>{{ item.account }}</span>
            <strong :class="{ negative: item.amount < 0 }">{{ formatCurrency(item.amount) }}</strong>
          </div>
        </div>
        <div class="summary-panel">
          <h3>一级归集</h3>
          <div v-for="item in primarySummary" :key="item.primaryCategory" class="summary-row">
            <span>{{ item.primaryCategory }}</span>
            <strong :class="{ negative: item.amount < 0 }">{{ formatCurrency(item.amount) }}</strong>
          </div>
        </div>
        <div class="summary-panel">
          <h3>二级科目排行</h3>
          <div v-for="item in categorySummary" :key="item.category" class="summary-row">
            <span>{{ item.category }}</span>
            <strong :class="{ negative: item.amount < 0 }">{{ formatCurrency(item.amount) }}</strong>
          </div>
        </div>
      </div>

      <div v-else-if="groupBy" class="grouped-view">
        <section v-for="group in groupedRows" :key="group.name" class="group-section">
          <div class="group-head">
            <div>
              <h3>{{ group.name }}</h3>
              <span>{{ group.rows.length }} 条 · {{ formatCurrency(group.total) }}</span>
            </div>
            <el-tag :type="group.total >= 0 ? 'success' : 'danger'" effect="plain">
              {{ group.total >= 0 ? '净流入' : '净流出' }}
            </el-tag>
          </div>
          <JournalTable
            :rows="group.rows"
            :fields="visibleFields"
            :selected-ids="selectedIds"
            @change="persist"
            @select="toggleRow"
            @detail="openDetail"
            @copy="duplicateRow"
            @remove="deleteRow"
          />
        </section>
      </div>

      <JournalTable
        v-else
        :rows="filteredRows"
        :fields="visibleFields"
        :selected-ids="selectedIds"
        :loading="loading"
        @change="persist"
        @select="toggleRow"
        @select-all="toggleAllRows"
        @detail="openDetail"
        @copy="duplicateRow"
        @remove="deleteRow"
      />
    </section>

    <el-drawer v-model="detailVisible" title="记录详情" size="480px">
      <el-form v-if="detailRow" label-width="88px" class="detail-form">
        <el-form-item label="日期">
          <el-date-picker v-model="detailRow.entryDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" @change="persist" />
        </el-form-item>
        <el-form-item label="账户">
          <el-select v-model="detailRow.account" style="width: 100%" allow-create filterable @change="persist">
            <el-option v-for="item in accountOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="收支类型">
          <el-segmented v-model="detailRow.direction" :options="directionSegmentOptions" @change="persist" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="detailRow.amount" :min="0" :precision="2" style="width: 100%" @change="persist" />
        </el-form-item>
        <el-form-item label="一级归集">
          <el-select v-model="detailRow.primaryCategory" style="width: 100%" filterable @change="onDetailPrimaryChange">
            <el-option v-for="item in primaryCategoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级科目">
          <el-select v-model="detailRow.category" style="width: 100%" allow-create filterable @change="persist">
            <el-option v-for="item in categoryOptionsFor(detailRow.primaryCategory)" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="detailRow.summary" type="textarea" :rows="3" @change="persist" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="detailRow.tags" multiple allow-create filterable style="width: 100%" @change="persist">
            <el-option v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="detailRow.remark" type="textarea" :rows="3" @change="persist" />
        </el-form-item>
      </el-form>
    </el-drawer>

    <el-dialog v-model="pasteVisible" title="粘贴导入" width="720px">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>日期,账户,类型,金额,一级归集,二级科目,摘要,往来方,项目</template>
      </el-alert>
      <el-input
        v-model="pasteText"
        class="paste-box"
        type="textarea"
        :rows="10"
        placeholder="2026-06-01,工商银行,收入,12800,收入类,代理记账收入,客户服务费到账,杭州某某公司,财税服务"
      />
      <template #footer>
        <el-button @click="pasteVisible = false">取消</el-button>
        <el-button type="primary" @click="importPastedRows">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { ElButton, ElCheckbox, ElDatePicker, ElInput, ElInputNumber, ElMessage, ElMessageBox, ElOption, ElSelect, ElTag } from 'element-plus'
import {
  Check,
  CopyDocument,
  DataAnalysis,
  Delete,
  Download,
  Filter,
  Grid,
  Notebook,
  Plus,
  Search,
  Setting,
  Sort,
  Tickets,
  Upload,
  Wallet
} from '@element-plus/icons-vue'

type Direction = 'income' | 'expense' | 'transfer'
type EntryStatus = 'draft' | 'pending' | 'approved' | 'rejected'
type PayMethod = 'bank' | 'wechat' | 'alipay' | 'cash' | 'pos' | 'other'
type ViewId = 'all' | 'income' | 'expense' | 'pending' | 'summary'

interface JournalEntry {
  id: number
  entryDate: string
  account: string
  direction: Direction
  amount: number
  primaryCategory: string
  category: string
  summary: string
  counterpart: string
  payMethod: PayMethod
  status: EntryStatus
  operator: string
  project: string
  tags: string[]
  attachment: string
  remark: string
  createTime: string
  [key: string]: unknown
}

interface FieldConfig {
  key: string
  label: string
  type: 'date' | 'text' | 'number' | 'select' | 'tags' | 'computed'
  width?: number
  minWidth?: number
  visible: boolean
  required?: boolean
  align?: 'left' | 'center' | 'right'
  options?: Array<{ label: string; value: string }>
}

const STORAGE_KEY = 'finance_journal_multidim_entries'
const PREF_KEY = 'finance_journal_multidim_fields'

const accountOptions = ['工商银行', '招商银行', '建设银行', '支付宝', '微信支付', '现金备用金']
const categoryTree = [
  { primary: '收入类', children: ['代理记账收入', '工商服务收入', '税务服务收入', '咨询服务收入', '地址挂靠收入', '其他收入'] },
  { primary: '业务成本', children: ['地址资源成本', '外包服务成本', '证照材料成本', '渠道采购成本', '交付工具成本'] },
  { primary: '销售费用', children: ['广告投放', '电话资源', '短信费用', '销售差旅', '销售招待', '推广服务费'] },
  { primary: '管理费用', children: ['房租水电', '办公采购', '软件订阅', '行政费用', '培训费用'] },
  { primary: '人员费用', children: ['工资', '社保公积金', '提成奖金', '招聘费用', '员工福利'] },
  { primary: '税费类', children: ['增值税', '附加税', '企业所得税', '个税', '印花税'] },
  { primary: '往来款', children: ['应收款', '应付款', '预收款', '预付款', '押金保证金', '备用金'] },
  { primary: '资金调拨', children: ['银行互转', '微信转银行', '支付宝转银行', '备用金领用', '备用金归还'] },
  { primary: '冲减类', children: ['客户退款', '供应商退款', '坏账冲减', '成本冲回'] }
]
const primaryCategoryOptions = categoryTree.map((item) => item.primary)
const categoryOptions = categoryTree.flatMap((item) => item.children)
const tagOptions = ['客户款', '供应商', '固定成本', '可抵扣', '待补票', '自动导入', '重点关注', '营销获客', '服务交付']
const directionOptions = [
  { label: '收入', value: 'income' },
  { label: '支出', value: 'expense' },
  { label: '转账', value: 'transfer' }
]
const directionSegmentOptions = directionOptions.map((item) => ({ label: item.label, value: item.value }))
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]
const payMethodOptions = [
  { label: '银行转账', value: 'bank' },
  { label: '微信', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '现金', value: 'cash' },
  { label: 'POS', value: 'pos' },
  { label: '其他', value: 'other' }
]

const views = [
  { id: 'all' as ViewId, name: '总表', icon: Grid },
  { id: 'income' as ViewId, name: '收入', icon: Wallet },
  { id: 'expense' as ViewId, name: '支出', icon: Tickets },
  { id: 'pending' as ViewId, name: '待处理', icon: Filter },
  { id: 'summary' as ViewId, name: '统计', icon: DataAnalysis }
]

const loading = ref(false)
const activeView = ref<ViewId>('all')
const entries = ref<JournalEntry[]>([])
const selectedIds = ref<number[]>([])
const detailVisible = ref(false)
const detailRow = ref<JournalEntry | null>(null)
const pasteVisible = ref(false)
const pasteText = ref('')
const groupBy = ref('')

const query = reactive({
  keyword: '',
  dateRange: [] as string[],
  account: '',
  status: ''
})

const sortState = reactive({
  key: 'entryDate',
  order: 'desc' as 'asc' | 'desc'
})

const sortOrders = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
]

const fields = ref<FieldConfig[]>([
  { key: 'entryDate', label: '日期', type: 'date', width: 150, visible: true, required: true },
  { key: 'account', label: '账户', type: 'select', width: 150, visible: true, options: accountOptions.map(toOption) },
  { key: 'direction', label: '类型', type: 'select', width: 104, visible: true, align: 'center', options: directionOptions },
  { key: 'amount', label: '金额', type: 'number', width: 150, visible: true, align: 'right', required: true },
  { key: 'primaryCategory', label: '一级归集', type: 'select', width: 140, visible: true, options: primaryCategoryOptions.map(toOption) },
  { key: 'category', label: '二级科目', type: 'select', width: 160, visible: true, options: categoryOptions.map(toOption) },
  { key: 'summary', label: '摘要', type: 'text', minWidth: 220, visible: true },
  { key: 'counterpart', label: '往来方', type: 'text', width: 180, visible: true },
  { key: 'payMethod', label: '支付方式', type: 'select', width: 128, visible: true, options: payMethodOptions },
  { key: 'status', label: '状态', type: 'select', width: 116, visible: true, align: 'center', options: statusOptions },
  { key: 'operator', label: '经办人', type: 'text', width: 128, visible: true },
  { key: 'project', label: '项目', type: 'text', width: 160, visible: true },
  { key: 'tags', label: '标签', type: 'tags', width: 220, visible: true },
  { key: 'attachment', label: '附件', type: 'text', width: 160, visible: false },
  { key: 'remark', label: '备注', type: 'text', width: 180, visible: false },
  { key: 'netAmount', label: '净额', type: 'computed', width: 140, visible: true, align: 'right' }
])

const visibleFields = computed(() => fields.value.filter((field) => field.visible))
const sortableFields = computed(() => fields.value.filter((field) => field.type !== 'tags'))
const selectedRows = computed(() => entries.value.filter((row) => selectedIds.value.includes(row.id)))
const currentMonthLabel = computed(() => new Date().toISOString().slice(0, 7))

const filteredRows = computed(() => {
  const rows = entries.value.filter((row) => {
    if (activeView.value === 'income' && row.direction !== 'income') return false
    if (activeView.value === 'expense' && row.direction !== 'expense') return false
    if (activeView.value === 'pending' && !['draft', 'pending'].includes(row.status)) return false
    if (query.account && row.account !== query.account) return false
    if (query.status && row.status !== query.status) return false
    if (query.dateRange?.length === 2) {
      if (row.entryDate < query.dateRange[0] || row.entryDate > query.dateRange[1]) return false
    }
    const keyword = query.keyword.trim().toLowerCase()
    if (keyword) {
      const haystack = [
        row.summary,
        row.counterpart,
        row.project,
        row.operator,
        row.primaryCategory,
        row.category,
        row.account,
        row.tags.join(' ')
      ].join(' ').toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    return true
  })
  return sortRows(rows)
})

const metrics = computed(() => {
  const incomeRows = filteredRows.value.filter((row) => row.direction === 'income')
  const expenseRows = filteredRows.value.filter((row) => row.direction === 'expense')
  const income = incomeRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const expense = expenseRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  return {
    income,
    expense,
    net: income - expense,
    incomeCount: incomeRows.length,
    expenseCount: expenseRows.length,
    pending: filteredRows.value.filter((row) => ['draft', 'pending'].includes(row.status)).length
  }
})

const groupedRows = computed(() => {
  const groups = new Map<string, JournalEntry[]>()
  filteredRows.value.forEach((row) => {
    const name = groupLabel(row, groupBy.value)
    const list = groups.get(name) || []
    list.push(row)
    groups.set(name, list)
  })
  return Array.from(groups.entries()).map(([name, rows]) => ({
    name,
    rows,
    total: rows.reduce((sum, row) => sum + signedAmount(row), 0)
  }))
})

const accountSummary = computed(() => summarizeBy('account').slice(0, 8))
const categorySummary = computed(() => summarizeBy('category').slice(0, 8))
const primarySummary = computed(() => summarizeBy('primaryCategory').slice(0, 8))

onMounted(() => {
  loadPrefs()
  loadEntries()
})

function toOption(value: string) {
  return { label: value, value }
}

function categoryOptionsFor(primaryCategory: string) {
  return categoryTree.find((item) => item.primary === primaryCategory)?.children || categoryOptions
}

const legacyCategoryMap: Record<string, { primaryCategory: string; category: string }> = {
  服务费: { primaryCategory: '收入类', category: '代理记账收入' },
  咨询费: { primaryCategory: '收入类', category: '咨询服务收入' },
  软件订阅: { primaryCategory: '管理费用', category: '软件订阅' },
  工资薪酬: { primaryCategory: '人员费用', category: '工资' },
  办公采购: { primaryCategory: '管理费用', category: '办公采购' },
  差旅交通: { primaryCategory: '销售费用', category: '销售差旅' },
  房租水电: { primaryCategory: '管理费用', category: '房租水电' },
  税费: { primaryCategory: '税费类', category: '增值税' },
  退款: { primaryCategory: '冲减类', category: '客户退款' },
  内部转账: { primaryCategory: '资金调拨', category: '银行互转' }
}

function normalizeCategory(category: string, direction: Direction) {
  const legacy = legacyCategoryMap[category]
  if (legacy) return legacy.category
  if (categoryOptions.includes(category)) return category
  if (direction === 'income') return '代理记账收入'
  if (direction === 'transfer') return '银行互转'
  return category || '办公采购'
}

function inferPrimaryCategory(category: string, direction: Direction) {
  const legacy = legacyCategoryMap[category]
  if (legacy) return legacy.primaryCategory
  const hit = categoryTree.find((item) => item.children.includes(category))
  if (hit) return hit.primary
  if (direction === 'income') return '收入类'
  if (direction === 'transfer') return '资金调拨'
  return '管理费用'
}

function loadEntries() {
  loading.value = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    entries.value = raw ? JSON.parse(raw).map(normalizeEntry) : seedEntries()
    persist()
  } catch (_e) {
    entries.value = seedEntries()
    persist()
  } finally {
    loading.value = false
  }
}

function loadPrefs() {
  const raw = localStorage.getItem(PREF_KEY)
  if (!raw) return
  try {
    const prefs = JSON.parse(raw) as Record<string, boolean>
    fields.value.forEach((field) => {
      if (!field.required && typeof prefs[field.key] === 'boolean') {
        field.visible = prefs[field.key]
      }
    })
  } catch (_e) {
    localStorage.removeItem(PREF_KEY)
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
}

function persistPrefs() {
  localStorage.setItem(PREF_KEY, JSON.stringify(Object.fromEntries(fields.value.map((field) => [field.key, field.visible]))))
}

function normalizeEntry(row: Partial<JournalEntry>): JournalEntry {
  const direction = (row.direction as Direction) || 'expense'
  const rawCategory = String(row.category || '')
  const normalizedCategory = normalizeCategory(rawCategory, direction)
  const primaryCategory = String(row.primaryCategory || inferPrimaryCategory(normalizedCategory || rawCategory, direction))
  return {
    id: Number(row.id || Date.now()),
    entryDate: row.entryDate || today(),
    account: row.account || accountOptions[0],
    direction,
    amount: Number(row.amount || 0),
    primaryCategory,
    category: normalizedCategory,
    summary: row.summary || '',
    counterpart: row.counterpart || '',
    payMethod: (row.payMethod as PayMethod) || 'bank',
    status: (row.status as EntryStatus) || 'draft',
    operator: row.operator || '管理员',
    project: row.project || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    attachment: row.attachment || '',
    remark: row.remark || '',
    createTime: row.createTime || now()
  }
}

function seedEntries(): JournalEntry[] {
  return [
    makeEntry({ id: 1, entryDate: today(-8), direction: 'income', amount: 12800, account: '工商银行', primaryCategory: '收入类', category: '代理记账收入', summary: '代理记账服务费到账', counterpart: '杭州星桥科技有限公司', status: 'approved', project: '财税服务', tags: ['客户款'] }),
    makeEntry({ id: 2, entryDate: today(-7), direction: 'expense', amount: 3200, account: '招商银行', primaryCategory: '销售费用', category: '电话资源', summary: 'CRM 号码服务订阅', counterpart: '云通信服务商', status: 'approved', project: '运营工具', tags: ['固定成本', '可抵扣', '营销获客'] }),
    makeEntry({ id: 3, entryDate: today(-5), direction: 'expense', amount: 860, account: '支付宝', primaryCategory: '销售费用', category: '销售差旅', summary: '客户拜访交通费', counterpart: '高德打车', status: 'pending', project: '客户拜访', tags: ['待补票', '营销获客'] }),
    makeEntry({ id: 4, entryDate: today(-3), direction: 'income', amount: 5600, account: '微信支付', primaryCategory: '收入类', category: '工商服务收入', summary: '工商变更咨询服务费', counterpart: '宁波精密制造有限公司', status: 'approved', project: '工商服务', tags: ['客户款'] }),
    makeEntry({ id: 5, entryDate: today(-2), direction: 'expense', amount: 4200, account: '建设银行', primaryCategory: '管理费用', category: '办公采购', summary: '办公设备采购', counterpart: '杭州办公集采', status: 'draft', project: '行政采购', tags: ['供应商'] }),
    makeEntry({ id: 6, entryDate: today(-1), direction: 'transfer', amount: 10000, account: '工商银行', primaryCategory: '资金调拨', category: '银行互转', summary: '备用金划转至招商银行', counterpart: '招商银行', status: 'approved', project: '资金调拨', tags: ['自动导入'] })
  ]
}

function makeEntry(data: Partial<JournalEntry>): JournalEntry {
  return normalizeEntry({
    operator: '财务',
    payMethod: 'bank',
    ...data,
    createTime: now()
  })
}

function today(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function now() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function switchView(view: ViewId) {
  activeView.value = view
  selectedIds.value = []
}

function addEntry() {
  const next = makeEntry({
    id: nextId(),
    entryDate: today(),
    account: accountOptions[0],
    direction: 'expense',
    amount: 0,
    primaryCategory: '管理费用',
    category: '办公采购',
    summary: '',
    status: 'draft',
    tags: []
  })
  entries.value.unshift(next)
  detailRow.value = next
  detailVisible.value = true
  persist()
}

function nextId() {
  return (entries.value.reduce((max, row) => Math.max(max, row.id), 0) || 0) + 1
}

function sortRows(rows: JournalEntry[]) {
  const key = sortState.key
  return [...rows].sort((a, b) => {
    const av = key === 'netAmount' ? signedAmount(a) : a[key]
    const bv = key === 'netAmount' ? signedAmount(b) : b[key]
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortState.order === 'asc' ? av - bv : bv - av
    }
    return sortState.order === 'asc'
      ? String(av || '').localeCompare(String(bv || ''))
      : String(bv || '').localeCompare(String(av || ''))
  })
}

function signedAmount(row: JournalEntry) {
  if (row.direction === 'income') return Number(row.amount || 0)
  if (row.direction === 'expense') return -Number(row.amount || 0)
  return 0
}

function groupLabel(row: JournalEntry, key: string) {
  if (!key) return '未分组'
  if (key === 'status') return statusLabel(row.status)
  return String(row[key] || '未填写')
}

function summarizeBy(key: 'account' | 'primaryCategory' | 'category') {
  const map = new Map<string, number>()
  filteredRows.value.forEach((row) => {
    const name = String(row[key] || '未填写')
    map.set(name, (map.get(name) || 0) + signedAmount(row))
  })
  return Array.from(map.entries())
    .map(([name, amount]) => ({ [key]: name, amount }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)) as Array<{ account: string; primaryCategory: string; category: string; amount: number }>
}

function toggleRow(row: JournalEntry, checked: boolean) {
  if (checked && !selectedIds.value.includes(row.id)) {
    selectedIds.value.push(row.id)
  }
  if (!checked) {
    selectedIds.value = selectedIds.value.filter((id) => id !== row.id)
  }
}

function toggleAllRows(checked: boolean) {
  selectedIds.value = checked ? filteredRows.value.map((row) => row.id) : []
}

function openDetail(row: JournalEntry) {
  detailRow.value = row
  detailVisible.value = true
}

function onDetailPrimaryChange() {
  if (!detailRow.value) return
  const options = categoryOptionsFor(detailRow.value.primaryCategory)
  if (!options.includes(detailRow.value.category)) {
    detailRow.value.category = options[0] || detailRow.value.category
  }
  persist()
}

function duplicateRow(row: JournalEntry) {
  const copy = normalizeEntry({
    ...row,
    id: nextId(),
    status: 'draft',
    summary: `${row.summary} - 副本`,
    createTime: now()
  })
  entries.value.unshift(copy)
  persist()
}

function duplicateSelected() {
  selectedRows.value.forEach(duplicateRow)
  selectedIds.value = []
}

async function deleteRow(row: JournalEntry) {
  await ElMessageBox.confirm(`确认删除「${row.summary || row.category}」?`, '提示', { type: 'warning' })
  entries.value = entries.value.filter((item) => item.id !== row.id)
  selectedIds.value = selectedIds.value.filter((id) => id !== row.id)
  persist()
}

async function deleteSelected() {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条记录?`, '提示', { type: 'warning' })
  const ids = new Set(selectedIds.value)
  entries.value = entries.value.filter((row) => !ids.has(row.id))
  selectedIds.value = []
  persist()
}

function approveSelected() {
  selectedRows.value.forEach((row) => {
    row.status = 'approved'
  })
  selectedIds.value = []
  persist()
  ElMessage.success('已批量通过')
}

function formatCurrency(value: number) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function directionLabel(value: Direction) {
  return directionOptions.find((item) => item.value === value)?.label || value
}

function directionTagType(value: Direction) {
  return value === 'income' ? 'success' : value === 'expense' ? 'danger' : 'warning'
}

function statusLabel(value: EntryStatus) {
  return statusOptions.find((item) => item.value === value)?.label || value
}

function statusTagType(value: EntryStatus) {
  return ({ draft: 'info', pending: 'warning', approved: 'success', rejected: 'danger' } as const)[value]
}

function payMethodLabel(value: PayMethod) {
  return payMethodOptions.find((item) => item.value === value)?.label || value
}

function getDisplayValue(row: JournalEntry, field: FieldConfig) {
  if (field.key === 'netAmount') return formatCurrency(signedAmount(row))
  if (field.key === 'direction') return directionLabel(row.direction)
  if (field.key === 'status') return statusLabel(row.status)
  if (field.key === 'payMethod') return payMethodLabel(row.payMethod)
  if (field.key === 'tags') return row.tags.join(' / ')
  return String(row[field.key] ?? '')
}

function exportCsv() {
  const headers = visibleFields.value.map((field) => field.label)
  const lines = filteredRows.value.map((row) =>
    visibleFields.value.map((field) => csvCell(getDisplayValue(row, field))).join(',')
  )
  const blob = new Blob([`\uFEFF${[headers.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `日记账-${today()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function importPastedRows() {
  const rows = pasteText.value.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  if (!rows.length) {
    ElMessage.warning('请粘贴数据')
    return
  }
  const created = rows.map((line, index) => {
    const cols = line.split(/,|\t/)
    const [entryDate, account, directionRaw, amountRaw] = cols
    const direction = parseDirection(directionRaw)
    const hasPrimary = primaryCategoryOptions.includes(cols[4])
    const primaryCategory = hasPrimary ? cols[4] : inferPrimaryCategory(cols[4] || '', direction)
    const category = hasPrimary ? (cols[5] || categoryOptionsFor(primaryCategory)[0]) : (cols[4] || categoryOptionsFor(primaryCategory)[0])
    const summary = hasPrimary ? cols[6] : cols[5]
    const counterpart = hasPrimary ? cols[7] : cols[6]
    const project = hasPrimary ? cols[8] : cols[7]
    return makeEntry({
      id: nextId() + index,
      entryDate: entryDate || today(),
      account: account || accountOptions[0],
      direction,
      amount: Number(amountRaw || 0),
      primaryCategory,
      category,
      summary: summary || '',
      counterpart: counterpart || '',
      project: project || '',
      status: 'draft',
      tags: ['粘贴导入']
    })
  })
  entries.value.unshift(...created)
  pasteText.value = ''
  pasteVisible.value = false
  persist()
  ElMessage.success(`已导入 ${created.length} 条`)
}

function parseDirection(value?: string): Direction {
  if (value === '收入' || value === 'income') return 'income'
  if (value === '转账' || value === 'transfer') return 'transfer'
  return 'expense'
}

const JournalTable = defineComponent({
  name: 'JournalTable',
  props: {
    rows: { type: Array as () => JournalEntry[], required: true },
    fields: { type: Array as () => FieldConfig[], required: true },
    selectedIds: { type: Array as () => number[], required: true },
    loading: { type: Boolean, default: false }
  },
  emits: ['change', 'select', 'select-all', 'detail', 'copy', 'remove'],
  setup(props, { emit }) {
    const renderCell = (row: JournalEntry, field: FieldConfig) => {
      if (field.key === 'netAmount') {
        const value = signedAmount(row)
        return h('span', { class: ['money-cell', value < 0 ? 'negative' : 'positive'] }, formatCurrency(value))
      }
      if (field.key === 'direction') {
        return h(ElSelect, {
          modelValue: row.direction,
          size: 'small',
          class: 'cell-select',
          'onUpdate:modelValue': (value: Direction) => {
            row.direction = value
            emit('change')
          }
        }, () => directionOptions.map((item) => h(ElOption, { label: item.label, value: item.value }, () => item.label)))
      }
      if (field.key === 'status') {
        return h(ElSelect, {
          modelValue: row.status,
          size: 'small',
          class: 'cell-select',
          'onUpdate:modelValue': (value: EntryStatus) => {
            row.status = value
            emit('change')
          }
        }, () => statusOptions.map((item) => h(ElOption, { label: item.label, value: item.value }, () => item.label)))
      }
      if (field.key === 'payMethod') {
        return h(ElSelect, {
          modelValue: row.payMethod,
          size: 'small',
          class: 'cell-select',
          'onUpdate:modelValue': (value: PayMethod) => {
            row.payMethod = value
            emit('change')
          }
        }, () => payMethodOptions.map((item) => h(ElOption, { label: item.label, value: item.value }, () => item.label)))
      }
      if (field.type === 'date') {
        return h(ElDatePicker, {
          modelValue: row[field.key] as string,
          type: 'date',
          size: 'small',
          valueFormat: 'YYYY-MM-DD',
          class: 'cell-date',
          'onUpdate:modelValue': (value: string) => {
            row[field.key] = value
            emit('change')
          }
        })
      }
      if (field.type === 'number') {
        return h(ElInputNumber, {
          modelValue: row[field.key] as number,
          min: 0,
          precision: 2,
          controls: false,
          size: 'small',
          class: 'cell-number',
          'onUpdate:modelValue': (value: number) => {
            row[field.key] = Number(value || 0)
            emit('change')
          }
        })
      }
      if (field.type === 'select') {
        const options = field.key === 'category'
          ? categoryOptionsFor(row.primaryCategory).map(toOption)
          : (field.options || [])
        return h(ElSelect, {
          modelValue: row[field.key] as string,
          size: 'small',
          filterable: true,
          allowCreate: true,
          class: 'cell-select',
          'onUpdate:modelValue': (value: string) => {
            row[field.key] = value
            if (field.key === 'primaryCategory') {
              const nextOptions = categoryOptionsFor(value)
              if (!nextOptions.includes(row.category)) {
                row.category = nextOptions[0] || row.category
              }
            }
            emit('change')
          }
        }, () => options.map((item) => h(ElOption, { label: item.label, value: item.value }, () => item.label)))
      }
      if (field.type === 'tags') {
        return h(ElSelect, {
          modelValue: row.tags,
          multiple: true,
          filterable: true,
          allowCreate: true,
          collapseTags: true,
          maxCollapseTags: 2,
          size: 'small',
          class: 'cell-tags',
          'onUpdate:modelValue': (value: string[]) => {
            row.tags = value
            emit('change')
          }
        }, () => tagOptions.map((tag) => h(ElOption, { label: tag, value: tag }, () => tag)))
      }
      return h(ElInput, {
        modelValue: row[field.key] as string,
        size: 'small',
        class: 'cell-input',
        'onUpdate:modelValue': (value: string) => {
          row[field.key] = value
          emit('change')
        }
      })
    }

    return () => h('div', { class: 'journal-table-wrap' }, [
      h('table', { class: 'journal-table' }, [
        h('thead', [
          h('tr', [
            h('th', { class: 'select-col' }, [
              h(ElCheckbox, {
                modelValue: props.rows.length > 0 && props.rows.every((row) => props.selectedIds.includes(row.id)),
                indeterminate: props.rows.some((row) => props.selectedIds.includes(row.id)) && !props.rows.every((row) => props.selectedIds.includes(row.id)),
                onChange: (checked: boolean) => emit('select-all', checked)
              })
            ]),
            ...props.fields.map((field) => h('th', {
              style: {
                width: field.width ? `${field.width}px` : undefined,
                minWidth: field.minWidth ? `${field.minWidth}px` : undefined,
                textAlign: field.align || 'left'
              }
            }, field.label)),
            h('th', { class: 'action-col' }, '操作')
          ])
        ]),
        h('tbody', props.rows.length ? props.rows.map((row) => h('tr', { key: row.id, class: [`row-${row.direction}`, `row-${row.status}`] }, [
          h('td', { class: 'select-col' }, [
            h(ElCheckbox, {
              modelValue: props.selectedIds.includes(row.id),
              onChange: (checked: boolean) => emit('select', row, checked)
            })
          ]),
          ...props.fields.map((field) => h('td', {
            class: [`field-${field.key}`, field.align ? `align-${field.align}` : ''],
            style: {
              width: field.width ? `${field.width}px` : undefined,
              minWidth: field.minWidth ? `${field.minWidth}px` : undefined
            }
          }, [renderCell(row, field)])),
          h('td', { class: 'action-col' }, [
            h(ElButton, { link: true, type: 'primary', onClick: () => emit('detail', row) }, () => '展开'),
            h(ElButton, { link: true, onClick: () => emit('copy', row) }, () => '复制'),
            h(ElButton, { link: true, type: 'danger', onClick: () => emit('remove', row) }, () => '删除')
          ])
        ])) : [
          h('tr', [
            h('td', { colspan: props.fields.length + 2, class: 'empty-cell' }, '暂无数据')
          ])
        ])
      ])
    ])
  }
})
</script>

<style lang="scss" scoped>
.journal-workspace {
  min-height: 100%;
  padding: 16px;
  background: #f6f8fb;
  color: #172033;
}

.journal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h1 {
    margin: 4px 0 0;
    font-size: 24px;
    line-height: 32px;
    font-weight: 700;
  }
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #607089;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.header-actions,
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.metric-card {
  min-height: 116px;
  padding: 16px;
  border: 1px solid #dde5ee;
  border-radius: 8px;
  background: #fff;

  span,
  small {
    display: block;
    color: #6a788d;
    font-size: 13px;
  }

  strong {
    display: block;
    margin: 10px 0 6px;
    font-size: 24px;
    line-height: 30px;
    font-family: "JetBrains Mono", Consolas, monospace;
  }

  &.income strong {
    color: #047857;
  }

  &.expense strong {
    color: #b42318;
  }

  &.balance strong {
    color: #1d4ed8;
  }

  &.pending strong {
    color: #b45309;
  }
}

.journal-shell {
  border: 1px solid #dce4ee;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.view-tabs {
  display: flex;
  gap: 2px;
  padding: 10px 12px 0;
  border-bottom: 1px solid #edf1f6;
}

.view-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #59687c;
  font-size: 14px;
  cursor: pointer;

  &.active {
    color: #0f766e;
    border-bottom-color: #0f766e;
    font-weight: 600;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #edf1f6;
}

.search-input {
  width: 260px;
}

.mini-select {
  width: 132px;
}

.field-menu {
  display: grid;
  gap: 8px;
}

.sort-menu {
  display: grid;
  gap: 10px;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid #c7dbff;
  background: #eef5ff;
  color: #334155;
}

.summary-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 14px;
}

.summary-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;

  h3 {
    margin: 0;
    padding: 12px 14px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 15px;
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  border-bottom: 1px solid #f1f5f9;

  strong {
    font-family: "JetBrains Mono", Consolas, monospace;
    color: #047857;
  }

  .negative,
  strong.negative {
    color: #b42318;
  }
}

.grouped-view {
  display: grid;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
}

.group-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0 0 4px;
    font-size: 15px;
  }

  span {
    font-size: 12px;
    color: #64748b;
  }
}

.paste-box {
  margin-top: 12px;
}

.detail-form {
  padding-right: 8px;
}

:deep(.journal-table-wrap) {
  width: 100%;
  overflow: auto;
}

:deep(.journal-table) {
  width: 100%;
  min-width: 1480px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 9px 10px;
    border-bottom: 1px solid #dce4ee;
    background: #f8fafc;
    color: #536176;
    font-size: 12px;
    font-weight: 700;
    text-align: left;
  }

  td {
    padding: 6px 8px;
    border-bottom: 1px solid #edf2f7;
    background: #fff;
    vertical-align: middle;
  }

  tr:hover td {
    background: #f8fbff;
  }

  .select-col {
    width: 44px;
    min-width: 44px;
    text-align: center;
  }

  .action-col {
    width: 154px;
    min-width: 154px;
  }

  .align-right {
    text-align: right;
  }

  .align-center {
    text-align: center;
  }

  .empty-cell {
    height: 180px;
    color: #94a3b8;
    text-align: center;
  }

  .money-cell {
    display: inline-block;
    width: 100%;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-weight: 700;
    text-align: right;
  }

  .positive {
    color: #047857;
  }

  .negative {
    color: #b42318;
  }

  .cell-input,
  .cell-select,
  .cell-date,
  .cell-number,
  .cell-tags {
    width: 100%;
  }

  .cell-number .el-input__inner {
    text-align: right;
  }
}

@media (max-width: 1100px) {
  .metric-grid,
  .summary-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar,
  .journal-header {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 700px) {
  .metric-grid,
  .summary-board {
    grid-template-columns: 1fr;
  }

  .search-input,
  .mini-select {
    width: 100%;
  }
}
</style>
