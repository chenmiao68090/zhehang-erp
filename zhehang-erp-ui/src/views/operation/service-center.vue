<template>
  <div class="ops-center-page">
    <section class="ops-hero">
      <div>
        <div class="eyebrow">OPERATION · REALTIME FEEDBACK</div>
        <h1>运营看板</h1>
        <p>实时记录线上投流消耗、客资质量、有效率、转化和成交金额，让运营每天能用数据复盘。</p>
      </div>
      <div class="hero-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="date-range"
          @change="loadData"
        />
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">录入今日反馈</el-button>
      </div>
    </section>

    <!-- ============ 数据中心模块：统一卡片模板（以核心数据为基准） ============ -->

    <!-- 全域核心数据（筛选范围汇总）——统一模板的基准 -->
    <section class="ops-block">
      <div class="block-head">
        <div>
          <h2>全域核心数据</h2>
          <p>当前筛选范围内的全部投流客资、消耗与成交汇总。</p>
        </div>
        <el-tag type="info" effect="plain">{{ rangeText }}</el-tag>
      </div>
      <div class="card-grid cols-5">
        <div v-for="c in coreCards" :key="c.key" class="stat-card" :class="c.tone">
          <span class="stat-label">{{ c.label }}</span>
          <strong class="stat-value">{{ c.value }}</strong>
          <small class="stat-sub">{{ c.sub }}</small>
        </div>
      </div>
    </section>

    <!-- 各平台维度：今日 / 本月（统一小卡模板） -->
    <section class="ops-block">
      <div class="block-head">
        <div>
          <h2>各平台今日数据</h2>
          <p>{{ today }} · 按平台拆分客资质量与消耗，暂无投放的平台显示占位。</p>
        </div>
        <el-tag type="success" effect="plain">今日</el-tag>
      </div>
      <div class="card-grid cols-6">
        <div v-for="p in platformCardsToday" :key="'today-' + p.key" class="platform-card">
          <div class="pc-head">
            <span class="pc-logo" :style="{ background: p.color }">{{ p.short }}</span>
            <span class="pc-name">{{ p.label }}</span>
          </div>
          <template v-if="p.hasData">
            <div class="pc-rows">
              <div class="pc-row"><span>客资</span><b>{{ formatNumber(p.totalLeads) }}</b></div>
              <div class="pc-row"><span>有效</span><b class="ok">{{ formatNumber(p.validLeads) }}</b></div>
              <div class="pc-row"><span>无效</span><b class="danger">{{ formatNumber(p.invalidLeads) }}</b></div>
              <div class="pc-row"><span>消耗</span><b>{{ formatMoney(p.spendAmount) }}</b></div>
            </div>
          </template>
          <div v-else class="pc-empty">今日暂无数据</div>
        </div>
      </div>
    </section>

    <section class="ops-block">
      <div class="block-head">
        <div>
          <h2>各平台本月数据</h2>
          <p>{{ monthLabel }} · 按平台拆分本月累计客资与消耗。</p>
        </div>
        <el-tag type="warning" effect="plain">本月</el-tag>
      </div>
      <div class="card-grid cols-6">
        <div v-for="p in platformCardsMonth" :key="'month-' + p.key" class="platform-card">
          <div class="pc-head">
            <span class="pc-logo" :style="{ background: p.color }">{{ p.short }}</span>
            <span class="pc-name">{{ p.label }}</span>
          </div>
          <template v-if="p.hasData">
            <div class="pc-rows">
              <div class="pc-row"><span>客资</span><b>{{ formatNumber(p.totalLeads) }}</b></div>
              <div class="pc-row"><span>有效</span><b class="ok">{{ formatNumber(p.validLeads) }}</b></div>
              <div class="pc-row"><span>无效</span><b class="danger">{{ formatNumber(p.invalidLeads) }}</b></div>
              <div class="pc-row"><span>消耗</span><b>{{ formatMoney(p.spendAmount) }}</b></div>
            </div>
          </template>
          <div v-else class="pc-empty">本月暂无数据</div>
        </div>
      </div>
    </section>

    <!-- 美团 & 大众点评 数据看板 -->
    <section class="ops-block">
      <div class="block-head">
        <div>
          <h2>美团 &amp; 大众点评</h2>
          <p>关键数据来自「平台运营数据」录入，线索数据来自投流反馈台账；未录入项显示占位。</p>
        </div>
        <el-tag type="info" effect="plain">本月</el-tag>
      </div>
      <div class="card-grid cols-2">
        <div v-for="biz in localLifeBoards" :key="biz.key" class="board-card">
          <div class="board-head">
            <span class="pc-logo" :style="{ background: biz.color }">{{ biz.short }}</span>
            <span class="pc-name">{{ biz.label }}</span>
          </div>
          <div class="board-section-title">关键数据</div>
          <div class="card-grid cols-4 board-inner">
            <div class="stat-card">
              <span class="stat-label">浏览量</span>
              <strong class="stat-value">{{ biz.key0.views == null ? '本月暂无数据' : formatNumber(biz.key0.views) }}</strong>
            </div>
            <div class="stat-card">
              <span class="stat-label">访问量</span>
              <strong class="stat-value">{{ biz.key0.visits == null ? '本月暂无数据' : formatNumber(biz.key0.visits) }}</strong>
            </div>
            <div class="stat-card">
              <span class="stat-label">咨询量</span>
              <strong class="stat-value">{{ biz.key0.inquiries == null ? '本月暂无数据' : formatNumber(biz.key0.inquiries) }}</strong>
            </div>
            <div class="stat-card is-orange">
              <span class="stat-label">推广消耗</span>
              <strong class="stat-value">{{ biz.key0.adCost == null ? '本月暂无数据' : formatMoney(biz.key0.adCost) }}</strong>
            </div>
          </div>
          <div class="board-section-title">线索数据</div>
          <div class="card-grid cols-3 board-inner">
            <div class="stat-card">
              <span class="stat-label">客资</span>
              <strong class="stat-value">{{ biz.leads.hasData ? formatNumber(biz.leads.totalLeads) : '本月暂无数据' }}</strong>
            </div>
            <div class="stat-card is-green">
              <span class="stat-label">有效客资</span>
              <strong class="stat-value">{{ biz.leads.hasData ? formatNumber(biz.leads.validLeads) : '本月暂无数据' }}</strong>
            </div>
            <div class="stat-card is-blue">
              <span class="stat-label">成交（转化）</span>
              <strong class="stat-value">{{ biz.leads.hasData ? formatNumber(biz.leads.conversionCount) : '本月暂无数据' }}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="content-grid">
      <div class="ops-block">
        <div class="block-head">
          <div>
            <h2>今日投流反馈</h2>
            <p>{{ today }} · 页面每 60 秒自动刷新一次</p>
          </div>
          <el-tag type="success" effect="plain">实时</el-tag>
        </div>
        <div class="today-list">
          <div>
            <span>新增客资</span>
            <strong>{{ formatNumber(todayRow.totalLeads) }}</strong>
            <small :class="trendClass(todayRow.totalLeads, yesterdayRow.totalLeads)">{{ deltaText(todayRow.totalLeads, yesterdayRow.totalLeads) }}</small>
          </div>
          <div>
            <span>有效</span>
            <strong>{{ formatNumber(todayRow.validLeads) }}</strong>
            <small :class="trendClass(todayRow.validLeads, yesterdayRow.validLeads)">{{ deltaText(todayRow.validLeads, yesterdayRow.validLeads) }}</small>
          </div>
          <div>
            <span>无效</span>
            <strong class="danger">{{ formatNumber(todayRow.invalidLeads) }}</strong>
            <small :class="trendClass(yesterdayRow.invalidLeads, todayRow.invalidLeads)">{{ deltaText(todayRow.invalidLeads, yesterdayRow.invalidLeads) }}</small>
          </div>
          <div>
            <span>今日消耗</span>
            <strong>{{ formatMoney(todayRow.spendAmount) }}</strong>
            <small :class="trendClass(yesterdayRow.spendAmount, todayRow.spendAmount)">{{ moneyDeltaText(todayRow.spendAmount, yesterdayRow.spendAmount) }}</small>
          </div>
        </div>
      </div>

      <div class="ops-block">
        <div class="block-head">
          <div>
            <h2>近三天客资对比</h2>
            <p>快速判断今天是否异常波动</p>
          </div>
        </div>
        <el-table :data="recentDays" size="small" class="mini-table" empty-text="暂无数据">
          <el-table-column prop="date" label="日期" min-width="120" />
          <el-table-column prop="totalLeads" label="总客资" width="90" align="right" />
          <el-table-column prop="validLeads" label="有效" width="90" align="right" />
          <el-table-column prop="invalidLeads" label="无效" width="90" align="right" />
          <el-table-column label="消耗" width="120" align="right">
            <template #default="{ row }">{{ formatMoney(row.spendAmount) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <section class="ops-block">
      <div class="block-head">
        <div>
          <h2>平台投流反馈</h2>
          <p>按平台汇总客资质量、单客资成本与 ROI。</p>
        </div>
        <div class="block-tools">
          <el-select v-model="filters.platform" clearable filterable placeholder="全部平台" style="width: 180px" @change="loadData">
            <el-option v-for="item in platformOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-input v-model="filters.keyword" clearable placeholder="搜索账户/计划/负责人" style="width: 240px" @keyup.enter="loadData" @clear="loadData" />
          <el-button @click="loadData">查询</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="summary.byPlatform" stripe class="ops-table" empty-text="暂无数据">
        <el-table-column prop="platform" label="平台" min-width="160" />
        <el-table-column prop="totalLeads" label="总客资" width="100" align="right" />
        <el-table-column prop="validLeads" label="有效客资" width="110" align="right" />
        <el-table-column prop="invalidLeads" label="无效客资" width="110" align="right" />
        <el-table-column label="有效率" width="110" align="right">
          <template #default="{ row }">{{ formatPercent(row.validRate) }}</template>
        </el-table-column>
        <el-table-column label="投放消耗" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.spendAmount) }}</template>
        </el-table-column>
        <el-table-column label="单客资成本" width="130" align="right">
          <template #default="{ row }">{{ formatMoney(row.costPerLead) }}</template>
        </el-table-column>
        <el-table-column prop="conversionCount" label="成交数" width="100" align="right" />
        <el-table-column label="ROI" width="110" align="right">
          <template #default="{ row }">
            <el-tag :type="Number(row.roi) >= 1 ? 'success' : 'warning'" effect="plain">{{ formatRoi(row.roi) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="bottom-grid">
      <div class="ops-block">
        <div class="block-head">
          <div>
            <h2>异常预警</h2>
            <p>无效率、单客资成本、数据缺口会自动提示。</p>
          </div>
          <el-icon class="warn-icon"><WarningFilled /></el-icon>
        </div>
        <div class="alert-list">
          <div v-for="alert in summary.alerts" :key="alert" class="alert-item">{{ alert }}</div>
        </div>
      </div>

      <div class="ops-block">
        <div class="block-head">
          <div>
            <h2>投流反馈台账</h2>
            <p>每天每个平台至少录入一次，保持数据连续。</p>
          </div>
          <el-button type="primary" :icon="Plus" @click="openCreate">新增反馈</el-button>
        </div>
        <el-table v-loading="loading" :data="records" stripe class="ops-table" empty-text="暂无数据">
          <el-table-column prop="feedbackDate" label="日期" width="120" />
          <el-table-column prop="platform" label="平台" min-width="110" />
          <el-table-column label="账户/计划" min-width="180">
            <template #default="{ row }">
              <div class="stack-cell">
                <strong>{{ row.accountName || '-' }}</strong>
                <span>{{ row.campaignName || '未填写计划' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="totalLeads" label="客资" width="80" align="right" />
          <el-table-column prop="validLeads" label="有效" width="80" align="right" />
          <el-table-column prop="invalidLeads" label="无效" width="80" align="right" />
          <el-table-column label="消耗" width="120" align="right">
            <template #default="{ row }">{{ formatMoney(row.spendAmount) }}</template>
          </el-table-column>
          <el-table-column label="负责人" prop="ownerName" width="110" />
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openEdit(row)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="removeRecord(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pager">
          <el-pagination
            v-model:current-page="page.pageNum"
            v-model:page-size="page.pageSize"
            layout="total, sizes, prev, pager, next"
            :total="page.total"
            :page-sizes="[10, 20, 50]"
            @size-change="loadData"
            @current-change="loadData"
          />
        </div>
      </div>
    </section>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑投流反馈' : '新增投流反馈'" width="760px" class="ops-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <div class="form-grid">
          <el-form-item label="反馈日期" prop="feedbackDate">
            <el-date-picker v-model="form.feedbackDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="投放平台" prop="platform">
            <el-select v-model="form.platform" filterable allow-create default-first-option placeholder="选择或输入平台">
              <el-option v-for="item in platformOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="投放账户">
            <el-input v-model="form.accountName" placeholder="例如 抖音-账多多" />
          </el-form-item>
          <el-form-item label="计划/素材">
            <el-input v-model="form.campaignName" placeholder="例如 杭州代理记账-表单" />
          </el-form-item>
          <el-form-item label="投放消耗">
            <el-input-number v-model="form.spendAmount" :min="0" :precision="2" :step="100" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="总客资">
            <el-input-number v-model="form.totalLeads" :min="0" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="有效客资">
            <el-input-number v-model="form.validLeads" :min="0" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="无效客资">
            <el-input-number v-model="form.invalidLeads" :min="0" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="成交数">
            <el-input-number v-model="form.conversionCount" :min="0" :step="1" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="成交金额">
            <el-input-number v-model="form.revenueAmount" :min="0" :precision="2" :step="500" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="form.ownerName" placeholder="例如 运营负责人" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status">
              <el-option label="正常投放" value="normal" />
              <el-option label="重点观察" value="watch" />
              <el-option label="暂停投放" value="paused" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="复盘备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="记录无效原因、素材调整、客服反馈等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, WarningFilled } from '@element-plus/icons-vue'
import { operationServiceApi, type OpsAdFeedback, type OpsAdSummary, type OpsAdSummaryItem } from '@/api/operation-service'
import { opMetricApi, type OpChannelMetric } from '@/api/operation'

const platformOptions = ['抖音-账多多', '抖音-云航', '抖音-展优', '抖音-利势企业', '小红书', '高德', '视频号', '淘宝', '柯沃旗舰店', '税小象旗舰店', '朋友圈', '百度']

// 各平台维度展示配置（匹配平台名用关键字包含，兼容"抖音-账多多"等细分账户）
const platformDims = [
  { key: 'xiaohongshu', label: '小红书', short: '红', color: '#FF2442', match: ['小红书'] },
  { key: 'douyin', label: '抖音', short: '抖', color: '#161823', match: ['抖音'] },
  { key: 'shipinhao', label: '视频号', short: '视', color: '#FA5150', match: ['视频号'] },
  { key: 'meituan', label: '美团', short: '美', color: '#FFC300', match: ['美团'] },
  { key: 'gaode', label: '高德', short: '德', color: '#00A0EA', match: ['高德'] },
  { key: 'dianping', label: '大众点评', short: '评', color: '#FF6633', match: ['大众点评', '点评'] }
]

const today = formatDate(new Date())
const dateRange = ref<string[]>([firstDayOfMonth(), today])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const records = ref<OpsAdFeedback[]>([])
const formRef = ref<FormInstance>()
const refreshTimer = ref<number>()

const filters = reactive({
  platform: '',
  keyword: ''
})

const page = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const emptySummary = (): OpsAdSummary => ({
  totalLeads: 0,
  validLeads: 0,
  invalidLeads: 0,
  conversionCount: 0,
  spendAmount: 0,
  revenueAmount: 0,
  validRate: 0,
  costPerLead: 0,
  roi: 0,
  byPlatform: [],
  byDay: [],
  alerts: ['当前筛选范围还没有投流反馈，请先录入今天的平台数据。']
})

const summary = ref<OpsAdSummary>(emptySummary())
// 平台维度专用：今日 / 本月 的 byPlatform（独立时间窗，不受顶部筛选影响）
const todayPlatformItems = ref<OpsAdSummaryItem[]>([])
const monthPlatformItems = ref<OpsAdSummaryItem[]>([])
// 平台运营数据（浏览/访问/咨询/推广消耗）——美团&大众点评关键数据来源
const channelMetrics = ref<OpChannelMetric[]>([])

const defaultForm = (): OpsAdFeedback => ({
  feedbackDate: today,
  platform: '',
  accountName: '',
  campaignName: '',
  spendAmount: 0,
  totalLeads: 0,
  validLeads: 0,
  invalidLeads: 0,
  conversionCount: 0,
  revenueAmount: 0,
  ownerName: '',
  status: 'normal',
  remark: ''
})

const form = reactive<OpsAdFeedback>(defaultForm())

const rules: FormRules = {
  feedbackDate: [{ required: true, message: '请选择反馈日期', trigger: 'change' }],
  platform: [{ required: true, message: '请选择或填写投放平台', trigger: 'change' }]
}

const recentDays = computed(() => summary.value.byDay.slice(0, 3))
const todayRow = computed(() => findDay(today))
const yesterdayRow = computed(() => findDay(offsetDate(-1)))
const invalidRateText = computed(() => formatPercent(rate(summary.value.invalidLeads, summary.value.totalLeads)))
const rangeText = computed(() => {
  const start = dateRange.value?.[0]
  const end = dateRange.value?.[1]
  return start && end ? `${start} ~ ${end}` : '全部时间'
})
const monthLabel = computed(() => {
  const now = new Date()
  return `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`
})

// 核心数据卡（统一模板基准）
const coreCards = computed(() => [
  { key: 'total', label: '总客资', tone: '', value: formatNumber(summary.value.totalLeads), sub: '筛选范围内全部投流客资' },
  { key: 'valid', label: '有效客资', tone: 'is-green', value: formatNumber(summary.value.validLeads), sub: `有效率 ${formatPercent(summary.value.validRate)}` },
  { key: 'invalid', label: '无效客资', tone: 'is-red', value: formatNumber(summary.value.invalidLeads), sub: `无效率 ${invalidRateText.value}` },
  { key: 'spend', label: '投放消耗', tone: 'is-orange', value: formatMoney(summary.value.spendAmount), sub: `单客资 ${formatMoney(summary.value.costPerLead)}` },
  { key: 'revenue', label: '成交金额', tone: 'is-blue', value: formatMoney(summary.value.revenueAmount), sub: `ROI ${formatRoi(summary.value.roi)}` }
])

// 把 byPlatform 列表映射成 6 个平台维度卡（关键字包含匹配 + 同平台多账户合并）
function toPlatformCards(items: OpsAdSummaryItem[]) {
  return platformDims.map(dim => {
    const matched = items.filter(it => {
      const name = String(it.platform || '')
      return dim.match.some(m => name.includes(m))
    })
    if (!matched.length) {
      return { ...dim, hasData: false, totalLeads: 0, validLeads: 0, invalidLeads: 0, spendAmount: 0 }
    }
    return {
      ...dim,
      hasData: true,
      totalLeads: sumBy(matched, it => it.totalLeads),
      validLeads: sumBy(matched, it => it.validLeads),
      invalidLeads: sumBy(matched, it => it.invalidLeads),
      spendAmount: sumBy(matched, it => Number(it.spendAmount || 0))
    }
  })
}

const platformCardsToday = computed(() => toPlatformCards(todayPlatformItems.value))
const platformCardsMonth = computed(() => toPlatformCards(monthPlatformItems.value))

// 美团 & 大众点评 双板块：关键数据（本月浏览/访问/咨询/推广消耗）+ 线索数据（本月客资/有效/转化）
const localLifeBoards = computed(() => {
  const start = firstDayOfMonth()
  return [
    { key: 'meituan', label: '美团', short: '美', color: '#FFC300', metricKeys: ['meituan'], leadMatch: ['美团'] },
    { key: 'dianping', label: '大众点评', short: '评', color: '#FF6633', metricKeys: ['dianping', 'dazhongdianping'], leadMatch: ['大众点评', '点评'] }
  ].map(biz => {
    // 关键数据：本月渠道指标累计（channel-data 录入的 views/visits/inquiries/adCost）
    const monthMetrics = channelMetrics.value.filter(m =>
      biz.metricKeys.includes(String(m.platform)) && String(m.statDate) >= start
    )
    const key0 = monthMetrics.length
      ? {
          views: sumBy(monthMetrics, m => Number(m.views || 0)),
          visits: sumBy(monthMetrics, m => Number(m.visits || 0)),
          inquiries: sumBy(monthMetrics, m => Number(m.inquiries || 0)),
          adCost: sumBy(monthMetrics, m => Number(m.adCost || 0))
        }
      : { views: null, visits: null, inquiries: null, adCost: null }
    // 线索数据：本月投流反馈中匹配到该平台的客资
    const matched = monthPlatformItems.value.filter(it => {
      const name = String(it.platform || '')
      return biz.leadMatch.some(m => name.includes(m))
    })
    const leads = matched.length
      ? {
          hasData: true,
          totalLeads: sumBy(matched, it => it.totalLeads),
          validLeads: sumBy(matched, it => it.validLeads),
          conversionCount: sumBy(matched, it => Number(it.conversionCount || 0))
        }
      : { hasData: false, totalLeads: 0, validLeads: 0, conversionCount: 0 }
    return { ...biz, key0, leads }
  })
})

function queryParams() {
  return {
    startDate: dateRange.value?.[0],
    endDate: dateRange.value?.[1],
    platform: filters.platform || undefined,
    keyword: filters.keyword || undefined
  }
}

async function loadData() {
  loading.value = true
  try {
    const params = queryParams()
    const monthStart = firstDayOfMonth()
    const [summaryData, pageData] = await Promise.all([
      operationServiceApi.getSummary(params),
      operationServiceApi.listFeedback({ ...params, pageNum: page.pageNum, pageSize: page.pageSize })
    ])
    summary.value = { ...emptySummary(), ...summaryData }
    records.value = pageData.list || []
    page.total = pageData.total || 0

    // 平台维度：今日 / 本月 各拉一次汇总（只取 byPlatform）。失败不影响主看板。
    try {
      const [todaySummary, monthSummary] = await Promise.all([
        operationServiceApi.getSummary({ startDate: today, endDate: today }),
        operationServiceApi.getSummary({ startDate: monthStart, endDate: today })
      ])
      todayPlatformItems.value = todaySummary?.byPlatform || []
      monthPlatformItems.value = monthSummary?.byPlatform || []
    } catch {
      todayPlatformItems.value = []
      monthPlatformItems.value = []
    }
    // 平台运营数据（美团&大众点评关键数据）。失败不影响主看板。
    try {
      // 只取「概览」四指标(views/visits/inquiries/adCost);各平台专页的直播/短视频等分区不参与看板汇总
      const res: any = await opMetricApi.recent({ days: 31, category: 'overview' })
      const data = res?.data ?? res
      channelMetrics.value = Array.isArray(data) ? data : []
    } catch {
      channelMetrics.value = []
    }
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: OpsAdFeedback) {
  Object.assign(form, defaultForm(), row)
  dialogVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await operationServiceApi.saveFeedback({ ...form })
    ElMessage.success('投流反馈已保存')
    dialogVisible.value = false
    await loadData()
  } finally {
    saving.value = false
  }
}

async function removeRecord(row: OpsAdFeedback) {
  if (!row.id) return
  await ElMessageBox.confirm(`确认删除 ${row.feedbackDate} ${row.platform} 的投流反馈吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await operationServiceApi.deleteFeedback(row.id)
  ElMessage.success('已删除')
  await loadData()
}

function findDay(date: string): OpsAdSummaryItem {
  return summary.value.byDay.find(item => item.date === date) || {
    date,
    totalLeads: 0,
    validLeads: 0,
    invalidLeads: 0,
    spendAmount: 0,
    conversionCount: 0,
    revenueAmount: 0
  }
}

function sumBy<T>(list: T[], getter: (item: T) => number) {
  return list.reduce((acc, item) => acc + Number(getter(item) || 0), 0)
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function firstDayOfMonth() {
  const now = new Date()
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

function offsetDate(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return formatDate(date)
}

function formatNumber(value?: number) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function formatMoney(value?: number) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

function formatPercent(value?: number) {
  return `${Number(value || 0).toFixed(1)}%`
}

function formatRoi(value?: number) {
  return `${Number(value || 0).toFixed(2)}`
}

function rate(part?: number, total?: number) {
  return Number(total || 0) > 0 ? Number(part || 0) * 100 / Number(total || 0) : 0
}

function deltaText(current?: number, previous?: number) {
  const delta = Number(current || 0) - Number(previous || 0)
  if (delta === 0) return '持平'
  return `${delta > 0 ? '+' : ''}${delta}`
}

function moneyDeltaText(current?: number, previous?: number) {
  const delta = Number(current || 0) - Number(previous || 0)
  if (delta === 0) return '持平'
  return `${delta > 0 ? '+' : ''}${formatMoney(delta)}`
}

function trendClass(current?: number, previous?: number) {
  const delta = Number(current || 0) - Number(previous || 0)
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return ''
}

onMounted(() => {
  loadData()
  refreshTimer.value = window.setInterval(loadData, 60_000)
})

onUnmounted(() => {
  if (refreshTimer.value) window.clearInterval(refreshTimer.value)
})
</script>

<style scoped>
.ops-center-page {
  min-height: 100%;
  padding: 24px;
  background: #f6f8fb;
  color: #1f2937;
}

.ops-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  border: 1px solid #dbe5f5;
  border-radius: 8px;
  background: linear-gradient(135deg, #1d4ed8, #6ea8fe);
  color: #fff;
}

.eyebrow {
  margin-bottom: 8px;
  font-size: 12px;
  letter-spacing: .08em;
  opacity: .78;
}

.ops-hero h1 {
  margin: 0 0 10px;
  font-size: 30px;
  line-height: 1.2;
}

.ops-hero p {
  margin: 0;
  max-width: 660px;
  color: rgba(255, 255, 255, .86);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.date-range {
  width: 270px;
}

/* ===== 统一数据中心模块外壳 ===== */
.ops-block {
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  margin-bottom: 16px;
}

.block-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.block-head h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.block-head p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.block-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* ===== 统一卡片网格 ===== */
.card-grid {
  display: grid;
  gap: 14px;
}

.card-grid.cols-5 { grid-template-columns: repeat(5, minmax(150px, 1fr)); }
.card-grid.cols-6 { grid-template-columns: repeat(6, minmax(140px, 1fr)); }
.card-grid.cols-4 { grid-template-columns: repeat(4, minmax(120px, 1fr)); }
.card-grid.cols-3 { grid-template-columns: repeat(3, minmax(120px, 1fr)); }
.card-grid.cols-2 { grid-template-columns: repeat(2, minmax(320px, 1fr)); }

/* ===== 统一指标卡（核心数据模板） ===== */
.stat-card {
  padding: 18px 20px;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #fff;
}

.stat-label {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.stat-value {
  display: block;
  margin: 8px 0 4px;
  color: #0f172a;
  font-size: 26px;
  line-height: 1.1;
  word-break: break-all;
}

.stat-sub {
  color: #64748b;
  font-size: 12px;
}

.stat-card.is-green .stat-value { color: #16a34a; }
.stat-card.is-red .stat-value { color: #dc2626; }
.stat-card.is-orange .stat-value { color: #c2410c; }
.stat-card.is-blue .stat-value { color: #2563eb; }

/* ===== 平台维度小卡（统一模板变体） ===== */
.platform-card {
  padding: 14px 16px;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #fff;
}

.pc-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pc-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.pc-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.pc-rows {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}

.pc-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.pc-row span {
  color: #64748b;
  font-size: 12px;
}

.pc-row b {
  font-size: 16px;
  color: #0f172a;
}

.pc-row b.ok { color: #16a34a; }
.pc-row b.danger { color: #dc2626; }

.pc-empty {
  padding: 14px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

/* ===== 美团 & 大众点评 板块 ===== */
.board-card {
  padding: 16px;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #f8fafc;
}

.board-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.board-section-title {
  margin: 14px 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.board-section-title:first-of-type {
  margin-top: 4px;
}

.board-inner .stat-value {
  font-size: 20px;
}

/* ===== 今日投流反馈（4 小卡） ===== */
.content-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.85fr) minmax(520px, 1.15fr);
  gap: 16px;
  margin-bottom: 16px;
}

.bottom-grid {
  grid-template-columns: minmax(320px, 0.45fr) minmax(680px, 1.55fr);
}

.content-grid .ops-block,
.bottom-grid .ops-block {
  margin-bottom: 0;
}

.today-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.today-list div {
  padding: 14px;
  border: 1px solid #edf1f7;
  border-radius: 8px;
  background: #f8fafc;
}

.today-list span {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.today-list strong {
  display: block;
  margin: 8px 0 4px;
  font-size: 24px;
}

.today-list strong.danger {
  color: #dc2626;
}

.today-list small {
  color: #64748b;
}

.up { color: #16a34a !important; }
.down { color: #dc2626 !important; }

.mini-table,
.ops-table {
  width: 100%;
}

.warn-icon {
  color: #f59e0b;
  font-size: 22px;
}

.alert-list {
  display: grid;
  gap: 10px;
}

.alert-item {
  padding: 12px 14px;
  border-radius: 8px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  line-height: 1.55;
}

.stack-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stack-cell span {
  color: #64748b;
  font-size: 12px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 18px;
}

@media (max-width: 1280px) {
  .card-grid.cols-5 { grid-template-columns: repeat(3, minmax(150px, 1fr)); }
  .card-grid.cols-6 { grid-template-columns: repeat(3, minmax(140px, 1fr)); }
  .card-grid.cols-2 { grid-template-columns: 1fr; }
  .content-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .ops-center-page {
    padding: 14px;
  }
  .ops-hero {
    flex-direction: column;
  }
  .card-grid.cols-5,
  .card-grid.cols-6,
  .card-grid.cols-4,
  .card-grid.cols-3,
  .today-list,
  .form-grid {
    grid-template-columns: 1fr;
  }
  .date-range {
    width: 100%;
  }
}
</style>
