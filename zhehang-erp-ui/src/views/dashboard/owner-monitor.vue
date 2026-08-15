<template>
  <div v-if="!canManage" class="owner-monitor forbidden">
    <el-result icon="warning" title="无访问权限" sub-title="经营监控中心仅对老板和平台最高账号开放">
      <template #extra><el-button type="primary" @click="go('/')">返回首页</el-button></template>
    </el-result>
  </div>

  <div v-else class="owner-monitor">
    <header class="monitor-header">
      <div>
        <div class="title-row">
          <h1>经营监控中心</h1>
          <el-tag effect="plain" round>{{ scopeLabel }}</el-tag>
        </div>
        <p>先处理风险，再看到账登记、销售执行、服务交付和团队状态</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" :loading="loading" @click="loadAll">刷新全部</el-button>
      </div>
    </header>

    <div class="truth-banner">
      <el-icon><InfoFilled /></el-icon>
      <div>
        <b>本页只展示可追溯的真实业务事实</b>
        <span>到账登记来自收款日记账，销售执行来自云客话单和 CRM，风险来自客户问题与服务记录；没有演示数据。</span>
      </div>
      <span class="updated">最近请求 {{ lastUpdated || '尚未完成' }}</span>
    </div>

    <el-tabs v-model="activeView" class="monitor-tabs">
      <el-tab-pane label="总览与行动" name="overview">
        <section class="section-block priority-section">
          <SectionTitle title="今天必须处理" subtitle="先看红灯；有正式入口的直接下钻，暂缺入口的先看责任明细" />
          <div class="priority-grid">
            <button
              v-for="card in priorityCards"
              :key="card.key"
              class="priority-card"
              :class="[card.tone, { disabled: !card.path && !card.anchor }]"
              type="button"
              :disabled="!card.path && !card.anchor"
              @click="openPriority(card)"
            >
              <span>{{ card.label }}</span>
              <strong>{{ metric(card.value, card.statusKey) }}</strong>
              <small>{{ card.note }}</small>
            </button>
          </div>
          <SectionError v-if="sectionStatus.boss === 'error'" :message="sectionErrors.boss" @retry="loadBossData" />

          <div v-if="sectionStatus.boss === 'ready'" id="owner-risk-details" class="risk-detail-grid">
            <RiskList anchor-id="risk-overdue" title="逾期客户工单" :rows="boss.exceptions.overdueIssues" empty-text="当前无逾期客户工单" link-label="打开逾期清单" @open="go('/customer-issue/list', { view: 'overdue' })" />
            <RiskList anchor-id="risk-p0" title="P0 客户工单" :rows="boss.exceptions.p0Issues" empty-text="当前无 P0 客户工单" link-label="打开 P0 清单" @open="go('/customer-issue/list', { view: 'p0' })" />
            <RiskList anchor-id="risk-bookkeeping" title="代账逾期明细" :rows="boss.exceptions.bookkeepingAbnormal" empty-text="当前无代账逾期" />
            <RiskList anchor-id="risk-arrears" title="应收欠费订单明细" :rows="boss.exceptions.arrears" empty-text="当前无应收欠费订单" />
          </div>
        </section>

        <section class="section-block">
          <SectionTitle title="到账登记" subtitle="金额来自全部未作废收款日记账（含草稿、待审、驳回待修和反审核）；登记、核销和审核状态分开呈现" source="收款日记账 · 当日/本月" />
          <div class="metric-grid cash-grid">
            <MetricCard label="今日已登记到账" :value="money(cash.todayAmount)" :pending="sectionStatus.cash !== 'ready'" note="按收款日期，含全部未作废登记" tone="blue" />
            <MetricCard label="本月已登记到账" :value="money(cash.monthAmount)" :pending="sectionStatus.cash !== 'ready'" note="含草稿/待审等，不等同银行终审余额" tone="blue" />
            <MetricCard label="本月已核销" :value="money(cash.monthMatched)" :pending="sectionStatus.cash !== 'ready'" note="已匹配业务单据" tone="green" />
            <MetricCard label="本月未核销" :value="money(cash.monthUnmatched)" :pending="sectionStatus.cash !== 'ready'" note="需要财务继续处理" :tone="cash.monthUnmatched > 0 ? 'red' : 'green'" />
            <MetricCard label="待审核记录" :value="count(cash.pendingReviewCount)" :pending="sectionStatus.cash !== 'ready'" note="收款审核队列" :tone="cash.pendingReviewCount > 0 ? 'amber' : 'green'" />
            <MetricCard label="超过24小时未核销" :value="count(cash.over24hCount)" :pending="sectionStatus.cash !== 'ready'" note="到账登记闭环预警" :tone="cash.over24hCount > 0 ? 'red' : 'green'" />
          </div>
          <SectionError v-if="sectionStatus.cash === 'error'" :message="sectionErrors.cash" @retry="loadCashData" />
        </section>

        <div class="two-column">
          <section class="section-block">
            <div class="sales-section-head">
              <SectionTitle title="销售执行" :subtitle="`${rangeLabel}云客话单；CRM 为全量快照，不随话单周期变化`" :source="callSourceLabel" />
              <div class="call-range-control"><span>话单周期</span><el-segmented v-model="callRange" :options="rangeOptions" @change="loadCallData" /></div>
            </div>
            <div class="metric-grid compact-grid">
              <MetricCard label="外呼量" :value="count(callSummary.totalCalls)" :pending="sectionStatus.call !== 'ready'" :note="callDelta(callSummary.totalCalls, previousCallSummary.totalCalls, '通')" tone="blue" />
              <MetricCard label="接通率" :value="percent(callSummary.connectRate)" :pending="sectionStatus.call !== 'ready'" :note="callDelta(callSummary.connectRate, previousCallSummary.connectRate, '个百分点')" tone="blue" />
              <MetricCard label="有效沟通" :value="count(callSummary.validCount)" :pending="sectionStatus.call !== 'ready'" :note="`接通≥60秒；${callDelta(callSummary.validCount, previousCallSummary.validCount, '通')}`" tone="green" />
              <MetricCard label="高意向通话记录" :value="count(callSummary.highIntentCount)" :pending="sectionStatus.call !== 'ready'" note="按话单意向标记，同一客户可能多次" tone="blue" />
              <MetricCard label="有效线索总量" :value="count(salesFunnel.leadTotal)" :pending="sectionStatus.sales !== 'ready'" note="CRM全量快照：状态1-3，排除无效" tone="blue" />
              <MetricCard label="已转化线索" :value="count(salesFunnel.converted)" :pending="sectionStatus.sales !== 'ready'" note="CRM全量快照：状态=已转化" tone="green" />
              <MetricCard label="今日新增线索" :value="count(boss.sales.todayLeads)" :pending="sectionStatus.boss !== 'ready'" note="老板风险源今日统计" tone="blue" />
              <MetricCard label="今日跟进次数" :value="count(boss.sales.todayFollows)" :pending="sectionStatus.boss !== 'ready'" note="CRM今日跟进记录" tone="green" />
            </div>
            <SectionError v-if="sectionStatus.call === 'error'" :message="sectionErrors.call" @retry="loadCallData" />
            <SectionError v-if="sectionStatus.sales === 'error'" :message="sectionErrors.sales" @retry="loadSalesData" />
          </section>

          <section class="section-block">
            <SectionTitle title="销售团队执行" subtitle="排行只反映通话执行，不等同于成交业绩" source="云客话单" />
            <div v-if="sectionStatus.call === 'ready' && topAgents.length" class="rank-list">
              <div v-for="(agent, index) in topAgents" :key="agent.agentName" class="rank-row">
                <span class="rank-no">{{ index + 1 }}</span>
                <div class="rank-person"><b>{{ agent.agentName || '未命名' }}</b><small>接通率 {{ percent(agent.connectRate) }}</small></div>
                <div class="rank-bar"><i :style="{ width: rankWidth(agent.callCount) }"></i></div>
                <strong>{{ agent.callCount || 0 }} 通</strong>
              </div>
            </div>
            <el-empty v-else-if="sectionStatus.call === 'ready'" description="当前范围暂无云客话单" :image-size="76" />
            <SectionError v-else-if="sectionStatus.call === 'error'" :message="sectionErrors.call" @retry="loadCallData" />
            <div v-else class="skeleton-lines"><i v-for="n in 5" :key="n"></i></div>
          </section>
        </div>

        <div class="two-column">
          <section class="section-block">
            <SectionTitle title="服务交付" subtitle="老板视图来自客户问题和旧任务台；旧任务台不代表全公司所有新任务" />
            <div class="metric-grid compact-grid">
              <MetricCard label="未处理客户问题" :value="count(boss.issue.unhandled)" :pending="sectionStatus.boss !== 'ready'" note="客户问题表" :tone="boss.issue.unhandled > 0 ? 'amber' : 'green'" />
              <MetricCard label="代账在办" :value="count(boss.book.active)" :pending="sectionStatus.boss !== 'ready'" note="旧代账服务记录" tone="blue" />
              <MetricCard label="代账已完成" :value="count(boss.book.completed)" :pending="sectionStatus.boss !== 'ready'" note="旧代账服务记录" tone="green" />
              <MetricCard label="代账处理中" :value="count(boss.book.processing)" :pending="sectionStatus.boss !== 'ready'" note="旧代账服务记录" tone="blue" />
              <MetricCard label="代账逾期" :value="count(boss.book.overdue)" :pending="sectionStatus.boss !== 'ready'" note="按服务到期日" :tone="boss.book.overdue > 0 ? 'red' : 'green'" />
              <MetricCard label="今日新增问题" :value="count(boss.issue.todayNew)" :pending="sectionStatus.boss !== 'ready'" note="今日创建" tone="blue" />
            </div>
          </section>

          <section class="section-block">
            <SectionTitle title="团队任务信号" subtitle="仅覆盖旧任务台，作为异常信号，不作为完整绩效结论" source="旧 biz_task（部分任务源）" />
            <template v-if="sectionStatus.boss === 'ready' && boss.employees.length">
              <el-table :data="boss.employees.slice(0, 8)" size="small" class="team-table">
                <el-table-column prop="executorName" label="员工" min-width="110" />
                <el-table-column prop="todayCount" label="今日任务" width="86" align="right" />
                <el-table-column prop="overdueCount" label="逾期" width="70" align="right">
                  <template #default="{ row }"><b :class="{ danger: Number(row.overdueCount) > 0 }">{{ row.overdueCount || 0 }}</b></template>
                </el-table-column>
                <el-table-column label="完成率" width="90" align="right">
                  <template #default="{ row }">{{ percent(row.doneRate) }}</template>
                </el-table-column>
              </el-table>
            </template>
            <el-empty v-else-if="sectionStatus.boss === 'ready'" description="旧任务台暂无执行记录" :image-size="72" />
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="深度分析" name="analysis">
        <div class="analysis-layout">
          <section class="section-block">
            <SectionTitle title="线索来源转化" subtitle="只计算线索与转化数量；未接投放成本，所以不称 ROI" source="CRM 线索" />
            <el-table v-if="leadRows.length" :data="leadRows" size="small" stripe>
              <el-table-column prop="sourceLabel" label="来源" min-width="130" />
              <el-table-column prop="lead_cnt" label="线索数" width="90" align="right" />
              <el-table-column prop="converted" label="已转化" width="90" align="right" />
              <el-table-column label="转化率" width="100" align="right">
                <template #default="{ row }">{{ conversionRate(row) }}</template>
              </el-table-column>
            </el-table>
            <el-empty v-else-if="sectionStatus.source === 'ready'" description="当前暂无来源转化记录" :image-size="76" />
            <SectionError v-if="sectionStatus.source === 'error'" :message="sectionErrors.source" @retry="loadSourceData" />
          </section>

          <section class="section-block readiness-panel">
            <SectionTitle title="指标接入状态" subtitle="不能核对到权威明细的数字，暂不进入老板决策区" />
            <div class="readiness-list">
              <div class="ready"><span>客户风险 / 收款日记账 / 云客话单 / CRM线索</span><el-tag type="success" effect="light">已接真实事实源</el-tag></div>
              <div class="pending"><span>订单营收 / 合同续费 / 客户价值</span><el-tag type="warning" effect="light">口径治理中</el-tag></div>
              <div class="pending"><span>跨任务域团队完成率</span><el-tag type="warning" effect="light">待统一任务事实源</el-tag></div>
              <div class="stopped"><span>AI经营摘要</span><el-tag type="info" effect="light">暂不作为决策依据</el-tag></div>
            </div>
            <p class="readiness-note">“暂无记录”和“尚未接入”分开显示，系统不会把接口失败或未迁移数据伪装成 0。</p>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref, watch, type PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { InfoFilled, Refresh } from '@element-plus/icons-vue'
import { getBossOverview } from '@/api/dashboard'
import { analysisApi } from '@/api/analysis'
import { callRecordApi, type CallDashboardAgent, type CallDashboardData, type CallDashboardRange } from '@/api/call-record'
import { getOwnerCashStats, type OwnerCashStats } from '@/api/owner-monitor'
import { useUserStore } from '@/stores/user'
import { isOwnerRole } from '@/utils/role-access'

type SectionKey = 'boss' | 'cash' | 'call' | 'sales' | 'source'
type SectionState = 'idle' | 'loading' | 'ready' | 'error'

const SectionTitle = defineComponent({
  props: { title: String, subtitle: String, source: String },
  setup(props) {
    return () => h('div', { class: 'section-title' }, [
      h('div', [h('h2', props.title), props.subtitle ? h('p', props.subtitle) : null]),
      props.source ? h('span', { class: 'source-pill' }, props.source) : null
    ])
  }
})

const MetricCard = defineComponent({
  props: { label: String, value: String, note: String, pending: Boolean, tone: String },
  setup(props) {
    return () => h('article', { class: ['metric-card', props.tone || ''] }, [
      h('span', props.label),
      h('strong', props.pending ? '—' : props.value),
      h('small', props.note)
    ])
  }
})

const SectionError = defineComponent({
  props: { message: String },
  emits: ['retry'],
  setup(props, { emit }) {
    return () => h('div', { class: 'section-error' }, [
      h('span', `数据加载失败：${props.message || '请稍后重试'}。未使用旧数据。`),
      h('button', { type: 'button', onClick: () => emit('retry') }, '重试')
    ])
  }
})

const RiskList = defineComponent({
  props: {
    anchorId: String,
    title: String,
    rows: { type: Array as PropType<Array<Record<string, any>>>, default: () => [] },
    emptyText: String,
    linkLabel: String
  },
  emits: ['open'],
  setup(props, { emit }) {
    const rowName = (row: Record<string, any>) => row.customerName || row.companyName || (row.orderId ? `订单 #${row.orderId}` : '未命名对象')
    const rowMeta = (row: Record<string, any>) => {
      const pieces = []
      if (row.ownerName) pieces.push(`负责人 ${row.ownerName}`)
      const date = row.deadline || row.serviceEnd || row.earliestDue
      if (date) pieces.push(`期限 ${String(date).slice(0, 10)}`)
      if (Number(row.arrears || 0) > 0) pieces.push(`欠费 ¥${Number(row.arrears).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`)
      return pieces.join(' · ') || '责任人与期限待补齐'
    }
    return () => h('article', { id: props.anchorId, class: 'risk-list-card' }, [
      h('div', { class: 'risk-list-head' }, [
        h('div', [
          h('h3', props.title),
          props.rows.length ? h('small', props.linkLabel ? `当前返回 ${props.rows.length} 条` : `当前返回 ${props.rows.length} 条（最多10条）· 处理入口待接入`) : null
        ]),
        props.linkLabel ? h('button', { type: 'button', onClick: () => emit('open') }, props.linkLabel) : null
      ]),
      props.rows.length
        ? h('div', { class: 'risk-list-rows' }, props.rows.slice(0, 10).map((row) => h('div', { class: 'risk-list-row', key: row.id || row.orderId || rowName(row) }, [
            h('b', rowName(row)),
            h('span', rowMeta(row))
          ])))
        : h('p', { class: 'risk-list-empty' }, props.emptyText || '当前无异常')
    ])
  }
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const canManage = computed(() => isOwnerRole(userStore.roles, userStore.userInfo?.id))
const scopeLabel = computed(() => '老板 · 当前租户全公司视图')

const activeView = ref(route.query.view === 'analysis' ? 'analysis' : 'overview')
const callRange = ref<CallDashboardRange>('today')
const rangeOptions = [
  { label: '今日', value: 'today' },
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' }
]
const rangeLabel = computed(() => rangeOptions.find((item) => item.value === callRange.value)?.label || '今日')
const loading = computed(() => Object.values(sectionStatus).some((state) => state === 'loading'))
const lastUpdated = ref('')

const sectionStatus = reactive<Record<SectionKey, SectionState>>({ boss: 'idle', cash: 'idle', call: 'idle', sales: 'idle', source: 'idle' })
const sectionErrors = reactive<Record<SectionKey, string>>({ boss: '', cash: '', call: '', sales: '', source: '' })

const emptyCash: OwnerCashStats = {
  todayAmount: 0, todayCount: 0, todayMatched: 0, todayUnmatched: 0,
  monthAmount: 0, monthMatched: 0, monthUnmatched: 0,
  waitingCount: 0, partialCount: 0, pendingReviewCount: 0, exceptionCount: 0, over24hCount: 0
}
const cash = reactive<OwnerCashStats>({ ...emptyCash })
const callData = ref<CallDashboardData | null>(null)
const salesFunnel = reactive({ leadTotal: 0, following: 0, converted: 0, yearCalls: 0 })
const leadRows = ref<Array<Record<string, any>>>([])
const boss = reactive({
  issue: { todayNew: 0, unhandled: 0, overdue: 0, p0: 0 },
  book: { active: 0, completed: 0, processing: 0, overdue: 0 },
  sales: { todayLeads: 0, todayFollows: 0 },
  receipt: { todayDue: 0, todayReceived: 0, overdueArrears: 0, arrearsCount: 0 },
  employees: [] as Array<Record<string, any>>,
  exceptions: {
    overdueIssues: [] as Array<Record<string, any>>,
    p0Issues: [] as Array<Record<string, any>>,
    bookkeepingAbnormal: [] as Array<Record<string, any>>,
    arrears: [] as Array<Record<string, any>>
  }
})

const callSummary = computed(() => callData.value?.summary || {
  totalCalls: 0, connectedCount: 0, missedCount: 0, failedCount: 0, validCount: 0,
  recordCount: 0, highIntentCount: 0, connectRate: 0, validRate: 0,
  totalDuration: 0, totalDurationText: '0m 0s', avgDuration: 0, avgDurationText: '0m 0s'
})
const previousCallSummary = computed(() => callData.value?.previousSummary || callSummary.value)
const callSourceLabel = computed(() => {
  const latest = callData.value?.summary?.latestCallTime
  return latest ? `最新通话时间 ${String(latest).replace('T', ' ').slice(0, 16)}` : '云客话单 / CRM'
})
const topAgents = computed<CallDashboardAgent[]>(() => (callData.value?.agents || []).slice(0, 6))
const maxCalls = computed(() => Math.max(...topAgents.value.map((item) => Number(item.callCount || 0)), 1))

const priorityCards = computed(() => [
  { key: 'overdue-issue', label: '逾期客户工单', value: boss.issue.overdue, statusKey: 'boss' as SectionKey, note: '进入逾期清单', tone: alertTone(boss.issue.overdue, 'boss', 'danger'), path: '/customer-issue/list', query: { view: 'overdue' }, anchor: '' },
  { key: 'p0', label: 'P0 客户工单', value: boss.issue.p0, statusKey: 'boss' as SectionKey, note: '立即处理', tone: alertTone(boss.issue.p0, 'boss', 'danger'), path: '/customer-issue/list', query: { view: 'p0' }, anchor: '' },
  { key: 'unhandled', label: '未处理客户问题', value: boss.issue.unhandled, statusKey: 'boss' as SectionKey, note: '进入未处理清单', tone: alertTone(boss.issue.unhandled, 'boss', 'warning'), path: '/customer-issue/list', query: { view: 'unhandled' }, anchor: '' },
  { key: 'arrears', label: '应收欠费订单', value: boss.receipt.arrearsCount, statusKey: 'boss' as SectionKey, note: '查看欠费订单明细', tone: alertTone(boss.receipt.arrearsCount, 'boss', 'warning'), path: '', query: {}, anchor: 'risk-arrears' }
])

const SOURCE_LABELS: Record<number, string> = {
  1: '工商公开名单', 2: '客户转介绍', 3: '美团投流', 4: '抖音投流', 5: '线下来客',
  6: '其他投流', 7: '名单采购/电销', 8: '渠道合作', 9: '私域二开', 10: '其他'
}

function unwrap<T = any>(response: any): T {
  return (response?.data ?? response) as T
}

function errorMessage(error: any): string {
  return error?.message || '服务暂时不可用'
}

function requireObject(value: unknown, label: string): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}返回结构不完整`)
  return value as Record<string, any>
}

function requireArray(value: unknown, label: string): any[] {
  if (!Array.isArray(value)) throw new Error(`${label}返回结构不完整`)
  return value
}

function requireNumberFields(value: unknown, keys: string[], label: string): Record<string, number> {
  const source = requireObject(value, label)
  const result: Record<string, number> = {}
  keys.forEach((key) => {
    const raw = source[key]
    if (raw === null || raw === undefined || raw === '' || !Number.isFinite(Number(raw))) {
      throw new Error(`${label}缺少字段 ${key}`)
    }
    result[key] = Number(raw)
  })
  return result
}

function validateCallData(value: unknown): CallDashboardData {
  const data = requireObject(value, '云客话单')
  const summaryKeys = ['totalCalls', 'connectedCount', 'missedCount', 'failedCount', 'validCount', 'recordCount', 'highIntentCount', 'connectRate', 'validRate', 'totalDuration', 'avgDuration']
  requireNumberFields(data.summary, summaryKeys, '云客话单本期汇总')
  requireNumberFields(data.previousSummary, summaryKeys, '云客话单上期汇总')
  const agents = requireArray(data.agents, '云客坐席排行')
  agents.forEach((row, index) => requireNumberFields(row, ['callCount', 'connectedCount', 'missedCount', 'validCount', 'recordCount', 'connectRate', 'totalDuration'], `云客坐席排行第${index + 1}行`))
  const trend = requireArray(data.trend, '云客话单趋势')
  trend.forEach((row, index) => requireNumberFields(row, ['callCount', 'connectedCount', 'validCount', 'totalDuration'], `云客话单趋势第${index + 1}行`))
  requireNumberFields(data.todo, ['callbackCount', 'highIntentCount', 'recordReviewCount', 'lowConnectAgentCount'], '云客行动项')
  return data as CallDashboardData
}

function validateCashData(value: unknown): OwnerCashStats {
  const keys = Object.keys(emptyCash)
  return requireNumberFields(value, keys, '收款日记账') as unknown as OwnerCashStats
}

function validateBossData(value: unknown): Record<string, any> {
  const data = requireObject(value, '老板风险')
  const exceptions = requireObject(data.exceptions, '老板异常清单')
  const employees = requireArray(data.employees, '员工执行')
  employees.forEach((row, index) => requireNumberFields(row, ['todayCount', 'overdueCount', 'doneCount', 'totalCount', 'doneRate'], `员工执行第${index + 1}行`))
  return {
    issue: requireNumberFields(data.customerIssue, ['todayNew', 'unhandled', 'overdue', 'p0'], '客户问题'),
    book: requireNumberFields(data.bookkeeping, ['active', 'completed', 'processing', 'overdue'], '代账服务'),
    sales: requireNumberFields(data.sales, ['todayLeads', 'todayFollows'], '今日销售行动'),
    receipt: requireNumberFields(data.receipt, ['todayDue', 'todayReceived', 'overdueArrears', 'arrearsCount'], '应收欠费'),
    employees,
    exceptions: {
      overdueIssues: requireArray(exceptions.overdueIssues, '逾期客户工单'),
      p0Issues: requireArray(exceptions.p0Issues, 'P0客户工单'),
      bookkeepingAbnormal: requireArray(exceptions.bookkeepingAbnormal, '代账逾期'),
      arrears: requireArray(exceptions.arrears, '欠费订单')
    }
  }
}

function clearSection(key: SectionKey) {
  if (key === 'boss') {
    Object.assign(boss.issue, { todayNew: 0, unhandled: 0, overdue: 0, p0: 0 })
    Object.assign(boss.book, { active: 0, completed: 0, processing: 0, overdue: 0 })
    Object.assign(boss.sales, { todayLeads: 0, todayFollows: 0 })
    Object.assign(boss.receipt, { todayDue: 0, todayReceived: 0, overdueArrears: 0, arrearsCount: 0 })
    boss.employees = []
    boss.exceptions.overdueIssues = []
    boss.exceptions.p0Issues = []
    boss.exceptions.bookkeepingAbnormal = []
    boss.exceptions.arrears = []
  } else if (key === 'cash') {
    Object.assign(cash, emptyCash)
  } else if (key === 'call') {
    callData.value = null
  } else if (key === 'sales') {
    Object.assign(salesFunnel, { leadTotal: 0, following: 0, converted: 0, yearCalls: 0 })
  } else if (key === 'source') {
    leadRows.value = []
  }
}

const requestGeneration = reactive<Record<SectionKey, number>>({ boss: 0, cash: 0, call: 0, sales: 0, source: 0 })

async function runSection<T>(key: SectionKey, loader: () => Promise<T>, commit: (data: T) => void) {
  const generation = ++requestGeneration[key]
  sectionStatus[key] = 'loading'
  sectionErrors[key] = ''
  try {
    const data = await loader()
    if (generation !== requestGeneration[key]) return
    commit(data)
    sectionStatus[key] = 'ready'
  } catch (error: any) {
    if (generation !== requestGeneration[key]) return
    clearSection(key)
    sectionStatus[key] = 'error'
    sectionErrors[key] = errorMessage(error)
  }
}

async function loadBossData() {
  await runSection('boss', async () => validateBossData(unwrap(await getBossOverview())), (data) => {
    Object.assign(boss.issue, data.issue)
    Object.assign(boss.book, data.book)
    Object.assign(boss.sales, data.sales)
    Object.assign(boss.receipt, data.receipt)
    boss.employees = data.employees
    Object.assign(boss.exceptions, data.exceptions)
  })
}

async function loadCashData() {
  await runSection('cash', async () => validateCashData(unwrap(await getOwnerCashStats())), (data) => Object.assign(cash, emptyCash, data))
}

async function loadCallData() {
  const range = callRange.value
  await runSection('call', async () => validateCallData(unwrap(await callRecordApi.dashboard({ range }))), (data) => { callData.value = data })
}

async function loadSalesData() {
  await runSection('sales', async () => {
    const data = requireObject(unwrap(await analysisApi.sales(new Date().getFullYear())), 'CRM销售漏斗')
    const funnel = requireArray(data.funnel, 'CRM销售漏斗')
    const calls = requireArray(data.calls, 'CRM年度通话')
    funnel.forEach((row, index) => requireNumberFields(row, ['status', 'cnt'], `CRM销售漏斗第${index + 1}行`))
    const byStatus = (status: number) => Number(funnel.find((row: any) => Number(row.status) === status)?.cnt || 0)
    return {
      leadTotal: byStatus(1) + byStatus(2) + byStatus(3),
      following: byStatus(2),
      converted: byStatus(3),
      yearCalls: calls.reduce((sum: number, row: any) => sum + Number(row.cnt || 0), 0)
    }
  }, (data) => Object.assign(salesFunnel, data))
}

async function loadSourceData() {
  await runSection('source', async () => {
    const data = requireObject(unwrap(await analysisApi.leadRoi()), '线索来源转化')
    return requireArray(data.leads, '线索来源转化').map((row: any, index: number) => {
      requireNumberFields(row, ['lead_cnt', 'converted'], `线索来源转化第${index + 1}行`)
      return {
        ...row,
        sourceLabel: SOURCE_LABELS[Number(row.source)] || `来源 ${row.source || '未标记'}`
      }
    })
  }, (data) => { leadRows.value = data })
}

async function loadAll() {
  if (!canManage.value) return
  const jobs = [loadCashData(), loadCallData(), loadSalesData(), loadSourceData(), loadBossData()]
  await Promise.allSettled(jobs)
  lastUpdated.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function metric(value: unknown, key: SectionKey): string {
  return sectionStatus[key] === 'ready' ? count(value) : '—'
}

function count(value: unknown): string {
  return Number(value || 0).toLocaleString('zh-CN')
}

function money(value: unknown): string {
  const amount = Number(value || 0)
  if (Math.abs(amount) >= 10000) return `¥${(amount / 10000).toFixed(1)}万`
  return `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

function percent(value: unknown): string {
  return `${Number(value || 0).toFixed(1).replace(/\.0$/, '')}%`
}

function callDelta(current: unknown, previous: unknown, unit: string): string {
  if (sectionStatus.call !== 'ready') return '等待话单数据'
  const delta = Number(current || 0) - Number(previous || 0)
  if (Math.abs(delta) < 0.05) return '与上一周期持平'
  const value = unit === '个百分点' ? Math.abs(delta).toFixed(1).replace(/\.0$/, '') : count(Math.abs(delta))
  return `较上一周期${delta > 0 ? '增加' : '减少'} ${value}${unit}`
}

function alertTone(value: unknown, key: SectionKey, warningTone: string): string {
  if (sectionStatus[key] !== 'ready') return 'neutral'
  return Number(value || 0) > 0 ? warningTone : 'healthy'
}

function conversionRate(row: Record<string, any>): string {
  const total = Number(row.lead_cnt || 0)
  return total ? percent((Number(row.converted || 0) / total) * 100) : '—'
}

function rankWidth(value: number): string {
  return `${Math.max((Number(value || 0) / maxCalls.value) * 100, 3)}%`
}

function go(path: string, query?: Record<string, any>) {
  router.push({ path, query })
}

function openPriority(card: { path?: string; query?: Record<string, any>; anchor?: string }) {
  if (card.path) {
    go(card.path, card.query)
    return
  }
  if (card.anchor) document.getElementById(card.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(() => route.query.view, (view) => {
  activeView.value = view === 'analysis' ? 'analysis' : 'overview'
})

watch(activeView, (view) => {
  const current = route.query.view === 'analysis' ? 'analysis' : 'overview'
  if (current === view) return
  const query = { ...route.query }
  if (view === 'analysis') query.view = 'analysis'
  else delete query.view
  router.replace({ query })
})

onMounted(loadAll)
</script>

<style scoped lang="scss">
.owner-monitor {
  min-height: 100%;
  padding: 20px;
  background: #f4f7fb;
  color: #172033;
}

.owner-monitor.forbidden { display: grid; place-items: center; background: #fff; }

.monitor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  color: #fff;
  background: linear-gradient(125deg, #123b76 0%, #1d5fb8 60%, #167f82 100%);
  border-radius: 18px;
  box-shadow: 0 16px 38px rgba(24, 77, 145, 0.2);
}

.title-row { display: flex; align-items: center; gap: 12px; }
.title-row h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; }
.title-row :deep(.el-tag) { color: #fff; border-color: rgba(255,255,255,.45); background: rgba(255,255,255,.12); }
.monitor-header p { margin: 8px 0 0; color: rgba(255,255,255,.8); font-size: 14px; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.header-actions :deep(.el-button) { border-color: rgba(255,255,255,.4); }

.truth-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 2px 0;
  padding: 11px 14px;
  background: #eaf4ff;
  border: 1px solid #cfe4fb;
  border-radius: 12px;
  color: #24517d;
}
.truth-banner > div { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
.truth-banner b { font-size: 13px; }
.truth-banner span { font-size: 12px; color: #557796; }
.truth-banner .updated { white-space: nowrap; }

.monitor-tabs { margin-top: 14px; }
.monitor-tabs :deep(.el-tabs__header) { margin: 0 0 14px; padding: 0 6px; }
.monitor-tabs :deep(.el-tabs__item) { font-weight: 700; }

.section-block {
  min-width: 0;
  padding: 18px;
  margin-bottom: 14px;
  background: #fff;
  border: 1px solid #e5ebf3;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(31, 53, 84, 0.05);
}
.priority-section { border-top: 3px solid #d9485f; }
.section-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.section-title h2 { margin: 0; font-size: 17px; color: #172033; }
.section-title p { margin: 5px 0 0; font-size: 12px; color: #7b8798; }
.source-pill { flex: none; padding: 4px 9px; color: #5b6f86; background: #f2f5f9; border-radius: 999px; font-size: 11px; }

.priority-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.priority-card { text-align: left; padding: 15px; border: 1px solid #e4e9f0; border-radius: 13px; background: #fff; cursor: pointer; transition: .2s ease; }
.priority-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(33, 53, 82, .1); }
.priority-card.disabled { cursor: default; }
.priority-card.disabled:hover { transform: none; box-shadow: none; }
.priority-card span, .priority-card small { display: block; color: #78869a; }
.priority-card strong { display: block; margin: 7px 0 5px; font-size: 30px; line-height: 1; color: #26364c; }
.priority-card.danger { background: #fff6f7; border-color: #ffd5da; }
.priority-card.danger strong { color: #c7354c; }
.priority-card.warning { background: #fffbf1; border-color: #f8e2ad; }
.priority-card.warning strong { color: #b56a12; }
.priority-card.healthy { background: #f3fbf8; border-color: #cceadf; }
.priority-card.healthy strong { color: #148162; }
.priority-card.neutral { background: #f7f9fc; border-color: #e1e7ef; }

.risk-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.risk-list-card { min-width: 0; padding: 13px; border: 1px solid #e6ebf2; border-radius: 12px; background: #fbfcfe; }
.risk-list-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.risk-list-head h3 { margin: 0; font-size: 14px; color: #27384e; }
.risk-list-head small { display: block; margin-top: 3px; color: #8a96a6; font-size: 10px; }
.risk-list-head button { border: 0; color: #2367aa; background: transparent; cursor: pointer; font-size: 12px; }
.risk-list-rows { display: flex; flex-direction: column; gap: 7px; }
.risk-list-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 9px; background: #fff; border-radius: 8px; }
.risk-list-row b { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.risk-list-row span { flex: none; max-width: 58%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #7b8798; font-size: 11px; }
.risk-list-empty { margin: 13px 0; text-align: center; color: #8290a2; font-size: 12px; }

.metric-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.compact-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.sales-section-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.sales-section-head > .section-title { flex: 1; }
.call-range-control { display: flex; align-items: center; gap: 8px; flex: none; }
.call-range-control > span { color: #7b8798; font-size: 12px; white-space: nowrap; }
.metric-card { min-width: 0; padding: 13px; background: #f8fafc; border: 1px solid #edf1f6; border-radius: 12px; }
.metric-card span, .metric-card small { display: block; color: #7b8798; font-size: 12px; }
.metric-card strong { display: block; margin: 8px 0 6px; font-size: 22px; color: #28384d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.metric-card.blue { border-left: 3px solid #3f78d6; }
.metric-card.green { border-left: 3px solid #17a67a; }
.metric-card.amber { border-left: 3px solid #d68a1d; }
.metric-card.red { border-left: 3px solid #d9485f; }
.metric-card.red strong { color: #c7354c; }

.two-column, .analysis-layout { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, .9fr); gap: 14px; }
.two-column > .section-block, .analysis-layout > .section-block { margin-bottom: 14px; }

.rank-list { display: flex; flex-direction: column; gap: 11px; }
.rank-row { display: grid; grid-template-columns: 28px minmax(100px, 1fr) minmax(90px, 1.2fr) 64px; align-items: center; gap: 9px; }
.rank-no { display: grid; place-items: center; width: 24px; height: 24px; color: #315981; background: #eaf2fb; border-radius: 7px; font-weight: 800; }
.rank-person { display: flex; flex-direction: column; min-width: 0; }
.rank-person b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rank-person small { color: #8792a2; }
.rank-bar { height: 8px; background: #edf2f7; border-radius: 99px; overflow: hidden; }
.rank-bar i { display: block; height: 100%; background: linear-gradient(90deg, #2e67ba, #23a196); border-radius: inherit; }
.rank-row > strong { text-align: right; font-size: 13px; }

.team-table :deep(.el-table__inner-wrapper::before) { display: none; }
.danger { color: #c7354c; }
.skeleton-lines { display: flex; flex-direction: column; gap: 12px; }
.skeleton-lines i { height: 18px; border-radius: 5px; background: linear-gradient(90deg, #f2f4f7, #e8edf3, #f2f4f7); }

.section-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; padding: 9px 11px; color: #a33b4b; background: #fff2f3; border-radius: 9px; font-size: 12px; }
.section-error button { color: #215f9c; border: 0; background: transparent; cursor: pointer; font-weight: 700; }

.readiness-list { display: flex; flex-direction: column; gap: 10px; }
.readiness-list > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 12px; background: #f8fafc; border-radius: 8px; }
.readiness-list span { font-size: 13px; }
.readiness-note { margin: 13px 0 0; color: #7b8798; font-size: 12px; line-height: 1.7; }

@media (max-width: 1280px) {
  .metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .priority-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .owner-monitor { padding: 12px; }
  .monitor-header { flex-direction: column; }
  .header-actions { width: 100%; flex-wrap: wrap; }
  .sales-section-head { flex-direction: column; }
  .call-range-control { width: 100%; flex-wrap: wrap; }
  .two-column, .analysis-layout { grid-template-columns: 1fr; }
  .truth-banner { align-items: flex-start; flex-wrap: wrap; }
  .truth-banner .updated { width: 100%; padding-left: 26px; }
}

@media (max-width: 600px) {
  .monitor-header { padding: 18px; }
  .title-row { align-items: flex-start; flex-direction: column; }
  .title-row h1 { font-size: 22px; }
  .call-range-control :deep(.el-segmented) { width: 100%; }
  .priority-grid, .metric-grid, .compact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .risk-detail-grid { grid-template-columns: 1fr; }
  .section-block { padding: 14px; }
  .section-title { flex-direction: column; }
  .rank-row { grid-template-columns: 28px minmax(90px, 1fr) 58px; }
  .rank-bar { display: none; }
}

@media (max-width: 390px) {
  .metric-grid, .compact-grid { grid-template-columns: 1fr; }
}
</style>
