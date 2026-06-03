<template>
  <div class="task-page commission-page">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">TASK · 06 / COMMISSION</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">提成结算管理</span>
          <span class="title-en">Sales Commission Settlement</span>
        </h1>
        <p class="page-desc">销售确认 → 主管审核 → 财务确认 → 老板审批 → 发放，全链路闭环</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <!-- 数据指标条 -->
    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <!-- Tab 区 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">结算单</h2>
        <span class="section-sub">SETTLEMENT / LIST</span>
        <div class="section-actions">
          <el-button type="primary" :icon="Plus" @click="generateVisible = true">生成结算单</el-button>
        </div>
      </div>

      <el-alert v-if="autoGenMessage" :title="autoGenMessage" type="success" :closable="false" show-icon class="auto-gen-alert" />

      <div class="filter-toolbar">
        <el-input
          v-model="queryKeyword"
          class="keyword-input"
          clearable
          :prefix-icon="Search"
          placeholder="搜索结算单 / 订单 / 客户 / 销售"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-date-picker
          v-model="queryPeriod"
          type="month"
          value-format="YYYY-MM"
          placeholder="结算月份"
          clearable
          @change="handleSearch"
        />
        <el-button :icon="Search" type="primary" plain @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
      </div>

      <div class="tab-strip">
        <button
          v-for="t in tabs"
          :key="t.value"
          class="tab-btn"
          :class="{ active: activeTab === t.value }"
          @click="changeTab(t.value)"
        >
          {{ t.label }}
          <span class="tab-count">{{ t.count }}</span>
        </button>
      </div>

      <div class="table-card">
        <el-table :data="tableData" stripe class="dark-table" empty-text="暂无结算单" v-loading="loading">
          <el-table-column prop="commissionNo" label="结算单号" width="160" />
          <el-table-column prop="period" label="月份" width="100" />
          <el-table-column prop="salespersonName" label="销售姓名" width="130" />
          <el-table-column prop="customerName" label="客户" min-width="190" show-overflow-tooltip />
          <el-table-column prop="orderNo" label="订单编号" width="150" />
          <el-table-column label="业绩金额" width="130" align="right">
            <template #default="{ row }">¥{{ formatAmount(row.baseAmount) }}</template>
          </el-table-column>
          <el-table-column label="比例" width="90" align="right">
            <template #default="{ row }">{{ row.commissionRate }}%</template>
          </el-table-column>
          <el-table-column label="应发金额" width="130" align="right">
            <template #default="{ row }">
              <span class="amount-cell">¥{{ formatAmount(row.commissionAmount + row.bonusAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="扣回金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-deduct" v-if="row.deductionAmount">-¥{{ formatAmount(row.deductionAmount) }}</span>
              <span v-else class="amount-zero">—</span>
            </template>
          </el-table-column>
          <el-table-column label="实发金额" width="130" align="right">
            <template #default="{ row }">
              <span class="amount-final">¥{{ formatAmount(row.finalAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="130">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" effect="dark" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" :icon="View" @click="openDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-summary">
          <span>当前筛选 {{ total }} 条</span>
          <span>业绩 ¥{{ formatAmount(summaryStats.base) }}</span>
          <span>应发 ¥{{ formatAmount(summaryStats.payable) }}</span>
          <span>已发 ¥{{ formatAmount(summaryStats.paid) }}</span>
          <span>待发 ¥{{ formatAmount(summaryStats.waitPay) }}</span>
        </div>
        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="loadList"
            @size-change="loadList"
          />
        </div>
      </div>

      <!-- 提成报表区 -->
      <el-collapse class="report-collapse">
        <el-collapse-item name="trend">
          <template #title>
            <span class="collapse-title">提成报表 · TREND & TEAM</span>
          </template>
          <div class="report-grid">
            <div class="report-card">
              <div class="report-head">个人提成趋势 · 近 6 个月</div>
              <el-table :data="trendData" size="small" class="dark-table">
                <el-table-column prop="period" label="月份" width="110" />
                <el-table-column prop="orders" label="订单数" align="right" />
                <el-table-column prop="base" label="业绩" align="right">
                  <template #default="{ row }">¥{{ formatAmount(row.base) }}</template>
                </el-table-column>
                <el-table-column prop="commission" label="提成" align="right">
                  <template #default="{ row }">¥{{ formatAmount(row.commission) }}</template>
                </el-table-column>
              </el-table>
            </div>
            <div class="report-card">
              <div class="report-head">销售排行 · 按实发金额</div>
              <div class="bar-list">
                <div class="bar-row" v-for="b in teamCompare" :key="b.team">
                  <span class="bar-label">{{ b.team }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: b.percent + '%', background: b.color }"></div>
                  </div>
                  <span class="bar-value">¥{{ formatAmount(b.value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </section>

    <!-- 结算单详情 Drawer -->
    <el-drawer v-model="detailVisible" size="68%" :with-header="false" class="commission-drawer">
      <div v-if="detail" class="drawer-body">
        <div class="drawer-head">
          <div>
            <div class="drawer-tag">SETTLEMENT · {{ detail.commissionNo }}</div>
            <h2 class="drawer-title">{{ detail.salespersonName }} · {{ detail.period }}</h2>
          </div>
          <el-tag :type="statusTagType(detail.status)" effect="dark" size="large">{{ statusLabel(detail.status) }}</el-tag>
        </div>

        <div class="info-grid">
          <div class="info-cell"><label>结算月份</label><span>{{ detail.period }}</span></div>
          <div class="info-cell"><label>销售</label><span>{{ detail.salespersonName }}</span></div>
          <div class="info-cell"><label>状态</label><span>{{ statusLabel(detail.status) }}</span></div>
          <div class="info-cell"><label>创建时间</label><span>{{ detail.createTime }}</span></div>
        </div>

        <div class="drawer-section-title">提成明细</div>
        <el-table :data="detailItems" stripe class="dark-table">
          <el-table-column prop="orderNo" label="订单编号" width="160" />
          <el-table-column prop="customerName" label="客户名称" min-width="200" />
          <el-table-column label="订单金额" align="right" width="130">
            <template #default="{ row }">¥{{ formatAmount(row.baseAmount) }}</template>
          </el-table-column>
          <el-table-column label="提成比例" align="right" width="100">
            <template #default="{ row }">{{ row.commissionRate }}%</template>
          </el-table-column>
          <el-table-column label="提成金额" align="right" width="130">
            <template #default="{ row }">
              <span class="amount-cell">¥{{ formatAmount(row.commissionAmount) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="drawer-section-title">退款扣回明细</div>
        <el-table :data="deductItems" stripe class="dark-table" empty-text="无退款扣回">
          <el-table-column prop="orderNo" label="原订单" width="160" />
          <el-table-column label="退款金额" align="right" width="140">
            <template #default="{ row }">¥{{ formatAmount(row.refundAmount) }}</template>
          </el-table-column>
          <el-table-column label="扣回提成" align="right" width="140">
            <template #default="{ row }">
              <span class="amount-deduct">-¥{{ formatAmount(row.deductCommission) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="扣回原因" min-width="200" />
        </el-table>

        <div class="amount-summary">
          <div class="sum-cell">
            <label>应发总额</label>
            <span>¥{{ formatAmount(detail.commissionAmount + detail.bonusAmount) }}</span>
          </div>
          <div class="sum-op">−</div>
          <div class="sum-cell">
            <label>扣回金额</label>
            <span class="deduct">¥{{ formatAmount(detail.deductionAmount) }}</span>
          </div>
          <div class="sum-op">＝</div>
          <div class="sum-cell final">
            <label>实发金额</label>
            <span>¥{{ formatAmount(detail.finalAmount) }}</span>
          </div>
        </div>

        <div class="drawer-section-title">审核流程</div>
        <el-steps :active="stepIndex(detail)" finish-status="success" align-center class="dark-steps">
          <el-step v-for="(s, i) in flowSteps" :key="i" :title="s.label" :description="stepDesc(detail, i)" />
        </el-steps>

        <div class="drawer-actions">
          <template v-if="canSalesAct(detail)">
            <el-button type="primary" @click="actSales(detail, true)">确认无误</el-button>
            <el-button type="danger" @click="actSales(detail, false)">有异议</el-button>
          </template>
          <template v-if="canManagerAct(detail)">
            <el-button type="primary" @click="actManager(detail, true)">审核通过</el-button>
            <el-button type="danger" @click="actManager(detail, false)">驳回</el-button>
          </template>
          <template v-if="canFinanceAct(detail)">
            <el-button type="primary" @click="actFinance(detail, true)">确认通过</el-button>
            <el-button type="danger" @click="actFinance(detail, false)">驳回</el-button>
          </template>
          <template v-if="canBossAct(detail)">
            <el-button type="primary" @click="actBoss(detail, true)">审批通过</el-button>
            <el-button type="danger" @click="actBoss(detail, false)">驳回</el-button>
          </template>
          <el-button v-if="detail.status === 'paid'" type="success" @click="uploadProof">上传发放凭证</el-button>
          <el-button v-if="canMarkPaid(detail)" type="success" @click="markPaid(detail)">标记已发放</el-button>
          <el-button @click="detailVisible = false">关闭</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 生成结算单 -->
    <el-dialog v-model="generateVisible" title="生成结算单" width="520px" class="commission-dialog">
      <el-form label-width="100px">
        <el-form-item label="结算月份">
          <el-date-picker v-model="genPeriod" type="month" value-format="YYYY-MM" placeholder="选择月份" />
        </el-form-item>
        <div class="form-tip">系统将自动汇总该月各销售已完成订单，批量生成结算单</div>
      </el-form>
      <template #footer>
        <el-button @click="generateVisible = false">取消</el-button>
        <el-button type="primary" @click="batchGenerate">批量生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, View } from '@element-plus/icons-vue'
import { commissionApi, commissionAggregator, type BizCommission } from '@/api/task-center'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const flowSteps = [
  { label: '销售确认', key: 'sales' },
  { label: '主管审核', key: 'manager' },
  { label: '财务确认', key: 'finance' },
  { label: '老板审批', key: 'boss' },
  { label: '已发放', key: 'paid' }
]

const tabs = ref([
  { label: '全部', value: '', count: 0 },
  { label: '待销售确认', value: 'pending', count: 0 },
  { label: '待主管审核', value: 'sales_confirmed', count: 0 },
  { label: '待财务确认', value: 'manager_reviewed', count: 0 },
  { label: '待老板审批', value: 'finance_confirmed', count: 0 },
  { label: '待发放', value: 'boss_approved', count: 0 },
  { label: '已发放', value: 'paid', count: 0 },
  { label: '已驳回', value: 'rejected', count: 0 }
])

const activeTab = ref('')
const loading = ref(false)
const tableData = ref<BizCommission[]>([])
const allRecords = ref<BizCommission[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const queryKeyword = ref('')
const queryPeriod = ref('')

const detailVisible = ref(false)
const detail = ref<BizCommission | null>(null)
const detailItems = ref<any[]>([])
const deductItems = ref<any[]>([])

const generateVisible = ref(false)
const genPeriod = ref('')
const autoGenMessage = ref('')

const currentPeriod = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})

const activeRecords = computed(() => allRecords.value.filter(c => c.status !== 'rejected'))

const metrics = computed(() => {
  const list = allRecords.value
  const monthList = list.filter(c => c.period === (queryPeriod.value || currentPeriod.value) && c.status !== 'rejected')
  const inFlow = list.filter(c => ['pending', 'sales_confirmed', 'manager_reviewed', 'finance_confirmed', 'boss_approved'].includes(c.status))
  return [
    { label: '待我处理', value: list.filter(c => canAnyAction(c)).length },
    { label: '流程中', value: inFlow.length },
    { label: '本月应发', value: '¥' + formatAmount(monthList.reduce((s, c) => s + c.finalAmount, 0)) },
    { label: '历史已发', value: '¥' + formatAmount(list.filter(c => c.status === 'paid').reduce((s, c) => s + c.finalAmount, 0)) }
  ]
})

const summaryStats = computed(() => {
  const list = activeRecords.value
  return {
    base: list.reduce((s, c) => s + c.baseAmount, 0),
    payable: list.reduce((s, c) => s + c.finalAmount, 0),
    paid: list.filter(c => c.status === 'paid').reduce((s, c) => s + c.finalAmount, 0),
    waitPay: list.filter(c => c.status === 'boss_approved').reduce((s, c) => s + c.finalAmount, 0)
  }
})

const trendData = computed(() => {
  const map = new Map<string, { period: string; orders: number; base: number; commission: number }>()
  activeRecords.value.forEach((c) => {
    const item = map.get(c.period) || { period: c.period, orders: 0, base: 0, commission: 0 }
    item.orders += 1
    item.base += c.baseAmount
    item.commission += c.finalAmount
    map.set(c.period, item)
  })
  return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period)).slice(-6)
})

const teamCompare = computed(() => {
  const palette = ['#2563eb', '#0f766e', '#7c3aed', '#ea580c', '#16a34a']
  const map = new Map<string, number>()
  activeRecords.value.forEach((c) => {
    const key = c.salespersonName || '未分配'
    map.set(key, (map.get(key) || 0) + c.finalAmount)
  })
  const rows = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const max = rows[0]?.[1] || 1
  return rows.map(([team, value], index) => ({
    team,
    value,
    percent: Math.max(8, Math.round(value / max * 100)),
    color: palette[index % palette.length]
  }))
})

async function loadList() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      status: activeTab.value || undefined,
      period: queryPeriod.value || undefined,
      keyword: queryKeyword.value.trim() || undefined
    }
    const [res, allRes]: any[] = await Promise.all([
      commissionApi.list(params),
      commissionApi.list({
        page: 1,
        pageSize: 999,
        period: queryPeriod.value || undefined,
        keyword: queryKeyword.value.trim() || undefined
      })
    ])
    tableData.value = res.list || []
    total.value = res.total || 0
    refreshTabCounts(allRes.list || [])
  } finally {
    loading.value = false
  }
}

function refreshTabCounts(all: BizCommission[]) {
  allRecords.value = all
  tabs.value.forEach(t => {
    t.count = t.value ? all.filter(c => c.status === t.value).length : all.length
  })
}

function changeTab(v: string) {
  activeTab.value = v
  page.value = 1
  loadList()
}

function handleSearch() {
  page.value = 1
  loadList()
}

function resetSearch() {
  queryKeyword.value = ''
  queryPeriod.value = ''
  activeTab.value = ''
  page.value = 1
  loadList()
}

function statusLabel(s: string) {
  return ({
    pending: '待销售确认',
    sales_confirmed: '待主管审核',
    manager_reviewed: '待财务确认',
    finance_confirmed: '待老板审批',
    boss_approved: '待发放',
    paid: '已发放',
    rejected: '已驳回'
  } as any)[s] || s
}
function statusTagType(s: string): any {
  return ({
    pending: 'info', sales_confirmed: 'warning', manager_reviewed: 'warning',
    finance_confirmed: 'warning', boss_approved: 'primary', paid: 'success', rejected: 'danger'
  } as any)[s] || ''
}

function stepIndex(c: BizCommission) {
  return ({
    pending: 0, sales_confirmed: 1, manager_reviewed: 2,
    finance_confirmed: 3, boss_approved: 4, paid: 5, rejected: 0
  } as any)[c.status] ?? 0
}
function stepDesc(c: BizCommission, i: number) {
  const map: any = {
    0: c.salesConfirmTime ? `销售 · ${c.salesConfirmTime.slice(5, 16)}` : '',
    1: c.managerReviewTime ? `主管 · ${c.managerReviewTime.slice(5, 16)}` : '',
    2: c.financeConfirmTime ? `财务 · ${c.financeConfirmTime.slice(5, 16)}` : '',
    3: c.bossApproveTime ? `老板 · ${c.bossApproveTime.slice(5, 16)}` : '',
    4: c.payTime ? `发放 · ${c.payTime.slice(5, 16)}` : ''
  }
  return map[i] || ''
}

function openDetail(row: BizCommission) {
  detail.value = row
  detailItems.value = [
    { orderNo: row.orderNo, customerName: row.customerName, baseAmount: row.baseAmount, commissionRate: row.commissionRate, commissionAmount: row.commissionAmount }
  ]
  deductItems.value = row.deductionAmount > 0
    ? [{ orderNo: '', refundAmount: row.deductionAmount * 5, deductCommission: row.deductionAmount, reason: '' }]
    : []
  detailVisible.value = true
}

function hasAnyRole(roles: string[]) {
  const current = userStore.roles || []
  return current.includes('admin') || current.includes('super_admin') || roles.some(role => current.includes(role))
}

function canSalesAct(c: BizCommission) { return hasAnyRole(['sales']) && c.status === 'pending' }
function canManagerAct(c: BizCommission) { return hasAnyRole(['manager', 'dept_manager']) && c.status === 'sales_confirmed' }
function canFinanceAct(c: BizCommission) { return hasAnyRole(['finance', 'accountant']) && c.status === 'manager_reviewed' }
function canBossAct(c: BizCommission) { return hasAnyRole(['boss']) && c.status === 'finance_confirmed' }
function canMarkPaid(c: BizCommission) { return hasAnyRole(['finance', 'accountant']) && c.status === 'boss_approved' }
function canAnyAction(c: BizCommission) {
  return canSalesAct(c) || canManagerAct(c) || canFinanceAct(c) || canBossAct(c) || canMarkPaid(c)
}

async function promptOpinion(title: string, required = false) {
  const result = await ElMessageBox.prompt(title, '说明', {
    inputType: 'textarea',
    inputValidator: v => !required || !!v
  }).catch(() => null)
  return result?.value ?? null
}

async function actSales(c: BizCommission, pass: boolean) {
  if (!pass) {
    const opinion = await promptOpinion('请填写异议说明', true)
    if (opinion === null) return
    await commissionApi.reject({ id: c.id, opinion })
    ElMessage.warning('已提交异议，等待主管协调')
    await loadList()
    detailVisible.value = false
    return
  }
  await commissionApi.salesConfirm({ id: c.id })
  ElMessage.success('已确认无误')
  await loadList()
  detailVisible.value = false
}
async function actManager(c: BizCommission, pass: boolean) {
  const opinion = await promptOpinion(pass ? '审核意见（可选）' : '请填写驳回原因', !pass)
  if (opinion === null) return
  await commissionApi.managerReview({ id: c.id, pass, opinion: opinion || '' })
  ElMessage.success(pass ? '主管已审核通过' : '已驳回')
  await loadList()
  detailVisible.value = false
}
async function actFinance(c: BizCommission, pass: boolean) {
  const opinion = await promptOpinion(pass ? '财务意见（可选）' : '请填写驳回原因', !pass)
  if (opinion === null) return
  await commissionApi.financeConfirm({ id: c.id, pass, opinion: opinion || '' })
  ElMessage.success(pass ? '财务已确认通过' : '已驳回')
  await loadList()
  detailVisible.value = false
}
async function actBoss(c: BizCommission, pass: boolean) {
  const opinion = await promptOpinion(pass ? '审批意见（可选）' : '请填写驳回原因', !pass)
  if (opinion === null) return
  await commissionApi.bossApprove({ id: c.id, pass, opinion: opinion || '' })
  ElMessage.success(pass ? '老板已审批通过' : '已驳回')
  await loadList()
  detailVisible.value = false
}
async function markPaid(c: BizCommission) {
  await commissionApi.markPaid({ id: c.id })
  ElMessage.success('已标记发放')
  await loadList()
  detailVisible.value = false
}
function uploadProof() {
  ElMessage.success('发放凭证已上传（Mock）')
}

async function batchGenerate() {
  if (!genPeriod.value) {
    ElMessage.warning('请选择结算月份')
    return
  }
  const confirmed = await ElMessageBox.confirm(`将自动汇总 ${genPeriod.value} 的全部销售提成，是否继续？`, '批量生成', { type: 'info' })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) return
  // 调用月度汇总器生成结算单
  const r: any = await commissionAggregator.monthlyAggregate(genPeriod.value)
  ElMessage.success(r?.message || `${genPeriod.value} 结算单批量生成完成${r?.created ? ` (${r.created} 条)` : ''}`)
  generateVisible.value = false
  await loadList()
}

function lastMonthPeriod() {
  const d = new Date(); d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function autoMonthlyAggregate() {
  // 每月5日自动汇总上月；Mock 中只要当前超过5号就检查一次
  if (new Date().getDate() < 5) return
  const period = lastMonthPeriod()
  // 检查是否已生成该月
  const all: any = await commissionApi.list({ page: 1, pageSize: 999 })
  const exists = (all.list || []).some((c: BizCommission) => c.period === period)
  if (exists) return
  const r: any = await commissionAggregator.monthlyAggregate(period)
  if (r?.created) autoGenMessage.value = `系统于每月5日自动汇总上月已完成订单·${period} 已生成 ${r.created} 条结算单`
}

function formatAmount(n: number) {
  return (n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

onMounted(async () => {
  const sample: any = await commissionApi.ensureSamples()
  if (sample?.created) {
    autoGenMessage.value = `已补齐 ${sample.created} 条提成结算样例，可直接演示确认、审核、发放全流程`
  }
  await autoMonthlyAggregate()
  await loadList()
})
</script>

<style lang="scss" scoped>
.task-page { display: flex; flex-direction: column; gap: 24px; padding: 8px 4px 32px; }

/* —— Header —— */
.page-header {
  position: relative; padding: 32px 36px 28px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1A12 100%);
  border: 1px solid rgba(212, 175, 55, 0.22); border-radius: 14px; overflow: hidden;
  &::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
      radial-gradient(circle at 8% 90%, rgba(242, 101, 34, 0.12), transparent 50%);
    pointer-events: none;
  }
}
.header-meta {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', 'Menlo', monospace; font-size: 11px; letter-spacing: 0.18em;
  color: var(--gold-primary, #D4AF37); margin-bottom: 14px; position: relative; z-index: 1;
}
.meta-tag { padding: 3px 10px; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 2px; background: rgba(212, 175, 55, 0.06); }
.meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
.meta-time { color: rgba(212, 175, 55, 0.6); }
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex; align-items: baseline; gap: 16px; margin: 0 0 10px;
  .title-cn {
    font-size: 34px; font-weight: 700; letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic; font-weight: 400; font-size: 18px;
    color: rgba(212, 175, 55, 0.55);
  }
}
.page-desc { font-size: 14px; color: var(--text-body, #B8B8C0); letter-spacing: 0.04em; margin: 0; }
.header-decor {
  position: absolute; right: 36px; bottom: 24px;
  display: flex; align-items: center; gap: 8px; z-index: 1;
  .decor-line { width: 64px; height: 1px; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5)); &.short { width: 18px; } }
  .decor-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-primary, #D4AF37); box-shadow: 0 0 12px rgba(212, 175, 55, 0.6); }
}

/* —— Metric Strip —— */
.metric-strip {
  display: grid; grid-template-columns: repeat(4, 1fr);
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px; overflow: hidden;
}
.metric-item {
  position: relative; padding: 18px 22px;
  border-right: 1px solid rgba(212, 175, 55, 0.08);
  &:last-child { border-right: none; }
  .metric-index { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.45); margin-bottom: 6px; }
  .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; color: var(--gold-primary, #D4AF37); line-height: 1.1; }
  .metric-label { margin-top: 6px; font-size: 12px; color: var(--text-muted, #888); letter-spacing: 0.04em; }
}

/* —— Section Header —— */
.section-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; padding-left: 4px; }
.section-title {
  font-size: 18px; font-weight: 600; color: var(--text-primary, #F5F5F5);
  margin: 0; position: relative; padding-left: 14px;
  &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background: var(--gold-primary, #D4AF37); border-radius: 1px; }
}
.section-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.4); }
.section-actions { margin-left: auto; }

/* —— Tab Strip —— */
.tab-strip {
  display: flex; gap: 4px; padding: 6px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px; margin-bottom: 14px;
  overflow-x: auto;
}
.tab-btn {
  padding: 8px 18px; background: transparent; border: none;
  color: #B8B8C0; cursor: pointer; font-size: 13px; letter-spacing: 0.04em;
  border-radius: 5px; white-space: nowrap;
  transition: all 0.2s ease;
  display: inline-flex; align-items: center; gap: 8px;
  &:hover { color: #FFF7DD; background: rgba(212, 175, 55, 0.08); }
  &.active {
    color: #12121A; font-weight: 600;
    background: linear-gradient(135deg, #FFF7DD, #D4AF37);
    .tab-count { background: rgba(18, 18, 26, 0.2); color: #12121A; }
  }
  .tab-count {
    display: inline-block; min-width: 20px; padding: 1px 6px;
    border-radius: 10px; background: rgba(212, 175, 55, 0.2);
    color: var(--gold-primary, #D4AF37); font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
  }
}

/* —— Table Card —— */
.table-card { background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px; padding: 8px 8px 4px; }
.dark-table { background: transparent; }
.amount-cell { color: #FFF7DD; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
.amount-deduct { color: #F56C6C; font-family: 'JetBrains Mono', monospace; }
.amount-final { color: #67C23A; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
.amount-zero { color: #555; }
.pagination-bar { padding: 10px 12px; display: flex; justify-content: flex-end; }
.auto-gen-alert { margin-bottom: 12px;
  :deep(.el-alert) { background: rgba(103, 194, 58, 0.08); border: 1px solid rgba(103, 194, 58, 0.25); }
  :deep(.el-alert__title) { color: #67C23A; }
}

/* —— Report —— */
.report-collapse { margin-top: 8px; background: transparent; border: none;
  :deep(.el-collapse-item__header) { background: transparent; border-bottom: 1px solid rgba(212, 175, 55, 0.12); color: #B8B8C0; }
  :deep(.el-collapse-item__wrap) { background: transparent; border-bottom: none; }
}
.collapse-title { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.2em; color: var(--gold-primary, #D4AF37); }
.report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px 0; }
.report-card { background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 10px; padding: 16px; }
.report-head { font-size: 13px; font-weight: 600; color: var(--gold-primary, #D4AF37); margin-bottom: 12px; padding-left: 10px; border-left: 3px solid var(--gold-primary, #D4AF37); }
.bar-list { display: flex; flex-direction: column; gap: 14px; padding-top: 10px; }
.bar-row { display: grid; grid-template-columns: 90px 1fr 100px; align-items: center; gap: 12px; }
.bar-label { font-size: 13px; color: #E8E8EE; }
.bar-track { height: 12px; background: rgba(255, 255, 255, 0.06); border-radius: 6px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 6px; transition: width 0.6s ease; }
.bar-value { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--gold-primary, #D4AF37); text-align: right; }

/* —— Drawer —— */
:deep(.commission-drawer .el-drawer) { background: #0F0F16; }
.drawer-body { padding: 28px 32px; color: #E8E8EE; }
.drawer-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.drawer-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: rgba(212, 175, 55, 0.7); margin-bottom: 6px; }
.drawer-title { margin: 0; font-size: 26px; font-weight: 700; color: #FFF7DD; }
.info-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 24px;
  padding: 14px 18px; margin-bottom: 22px;
  background: rgba(212, 175, 55, 0.04); border: 1px dashed rgba(212, 175, 55, 0.18); border-radius: 8px;
}
.info-cell { display: flex; flex-direction: column; gap: 4px; }
.info-cell label { font-size: 11px; letter-spacing: 0.1em; color: rgba(212, 175, 55, 0.6); }
.info-cell span { font-size: 14px; color: #F5F5F5; }
.drawer-section-title {
  font-size: 15px; font-weight: 600; color: var(--gold-primary, #D4AF37);
  margin: 18px 0 12px; padding-left: 12px; border-left: 3px solid var(--gold-primary, #D4AF37);
}

/* —— Amount summary —— */
.amount-summary {
  display: flex; align-items: stretch; gap: 8px; margin: 22px 0;
  padding: 18px 24px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(242, 184, 36, 0.04));
  border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 10px;
}
.sum-cell { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 6px;
  label { font-size: 12px; color: rgba(212, 175, 55, 0.7); letter-spacing: 0.08em; margin-bottom: 6px; }
  span { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; color: #FFF7DD; }
  &.final span { color: #67C23A; font-size: 28px; }
  span.deduct { color: #F56C6C; }
}
.sum-op { display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 300; color: var(--gold-primary, #D4AF37); padding: 0 4px; }

/* —— Steps —— */
:deep(.dark-steps) {
  margin: 16px 0 24px;
  .el-step__title { color: #B8B8C0; }
  .el-step__description { color: #888; font-size: 12px; }
  .el-step__head.is-success { color: var(--gold-primary, #D4AF37); border-color: var(--gold-primary, #D4AF37); }
  .el-step__head.is-process { color: var(--gold-primary, #D4AF37); border-color: var(--gold-primary, #D4AF37); }
  .el-step__title.is-success { color: var(--gold-primary, #D4AF37); }
}

.drawer-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; padding-top: 18px; border-top: 1px dashed rgba(212, 175, 55, 0.15); }
.role-switch {
  margin-top: 18px; padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03); border-radius: 6px;
  display: flex; align-items: center; gap: 12px;
  label { font-size: 12px; color: rgba(212, 175, 55, 0.7); }
}

/* —— Dialog —— */
.form-tip {
  font-size: 12px; color: var(--gold-primary, #D4AF37);
  padding: 8px 12px; background: rgba(212, 175, 55, 0.08); border-radius: 4px;
  margin-left: 100px;
}

/* 统一为浅色运营后台风格 */
.task-page {
  gap: 16px;
  padding: 0 0 24px;
  color: #1f2937;
}
.page-header {
  padding: 22px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 62%, #f1faf6 100%);
  border: 1px solid #dbe7f3;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  &::before { display: none; }
}
.header-meta {
  color: #2563eb;
  margin-bottom: 10px;
  letter-spacing: 0.08em;
}
.meta-tag {
  background: #eff6ff;
  border-color: #bfdbfe;
  border-radius: 4px;
}
.meta-divider { background: #cbd5e1; }
.meta-time { color: #64748b; }
.page-title {
  gap: 12px;
  .title-cn {
    color: #0f172a;
    background: none;
    -webkit-text-fill-color: currentColor;
    font-size: 28px;
    letter-spacing: 0;
  }
  .title-en {
    font-family: inherit;
    font-style: normal;
    font-size: 14px;
    color: #64748b;
  }
}
.page-desc {
  color: #475569;
  letter-spacing: 0;
}
.header-decor {
  right: 24px;
  bottom: 22px;
  .decor-line { background: #93c5fd; }
  .decor-dot {
    background: #0f766e;
    box-shadow: none;
  }
}
.metric-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: visible;
}
.metric-item {
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
  .metric-index {
    color: #94a3b8;
    letter-spacing: 0.08em;
  }
  .metric-value {
    color: #0f766e;
    font-size: 22px;
  }
  .metric-label {
    color: #64748b;
    letter-spacing: 0;
  }
}
.section-head {
  margin-bottom: 12px;
  padding-left: 0;
}
.section-title {
  color: #0f172a;
  padding-left: 12px;
  &::before {
    background: #2563eb;
    border-radius: 2px;
  }
}
.section-sub {
  color: #94a3b8;
  letter-spacing: 0.08em;
}
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  .keyword-input {
    flex: 1 1 260px;
    min-width: 240px;
    width: auto;
  }
  :deep(.el-date-editor.el-input) {
    width: 190px;
  }
}
.tab-strip {
  background: #f8fafc;
  border-color: #e2e8f0;
  border-radius: 8px;
}
.tab-btn {
  color: #475569;
  letter-spacing: 0;
  &:hover {
    color: #1d4ed8;
    background: #eff6ff;
  }
  &.active {
    color: #ffffff;
    background: #2563eb;
    .tab-count {
      background: rgba(255, 255, 255, 0.22);
      color: #ffffff;
    }
  }
  .tab-count {
    background: #e2e8f0;
    color: #334155;
  }
}
.table-card,
.report-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}
.dark-table {
  color: #1f2937;
  :deep(.el-table__header th) {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
  }
}
.amount-cell {
  color: #1d4ed8;
}
.amount-final {
  color: #0f766e;
}
.amount-zero {
  color: #94a3b8;
}
.table-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  padding: 12px 10px 4px;
  color: #475569;
  font-size: 13px;
  border-top: 1px solid #f1f5f9;
}
.report-collapse {
  :deep(.el-collapse-item__header) {
    color: #475569;
    border-bottom-color: #e2e8f0;
  }
}
.collapse-title,
.report-head {
  color: #2563eb;
}
.report-head {
  border-left-color: #2563eb;
}
.bar-label {
  color: #334155;
}
.bar-track {
  background: #e2e8f0;
}
.bar-value {
  color: #0f766e;
}
:deep(.commission-drawer .el-drawer) {
  background: #ffffff;
}
.drawer-body {
  color: #1f2937;
}
.drawer-tag {
  color: #2563eb;
}
.drawer-title {
  color: #0f172a;
}
.info-grid {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.info-cell label {
  color: #64748b;
}
.info-cell span {
  color: #0f172a;
}
.drawer-section-title {
  color: #2563eb;
  border-left-color: #2563eb;
}
.amount-summary {
  background: #f8fafc;
  border-color: #dbeafe;
  border-radius: 8px;
}
.sum-cell {
  label {
    color: #64748b;
  }
  span {
    color: #1d4ed8;
  }
  &.final span {
    color: #0f766e;
  }
}
.sum-op {
  color: #94a3b8;
}
:deep(.dark-steps) {
  .el-step__title { color: #475569; }
  .el-step__description { color: #64748b; }
  .el-step__head.is-success,
  .el-step__head.is-process {
    color: #2563eb;
    border-color: #2563eb;
  }
  .el-step__title.is-success {
    color: #2563eb;
  }
}
.drawer-actions {
  border-top-color: #e2e8f0;
}
.form-tip {
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

@media (max-width: 1100px) {
  .metric-strip { grid-template-columns: repeat(2, 1fr); }
  .metric-item:nth-child(2) { border-right: none; }
  .info-grid { grid-template-columns: repeat(2, 1fr); }
  .report-grid { grid-template-columns: 1fr; }
  .filter-toolbar { flex-wrap: wrap; }
}
</style>
