<template>
  <div class="task-page finance-expense">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 03 / EXPENSE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">业务支出管理</span>
          <span class="title-en">Business Expense</span>
        </h1>
        <p class="page-desc">业务相关支出的申请、审批与追踪</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">支出工作台</h2>
        <span class="section-sub">EXPENSE / RECORDS</span>
      </div>
      <ModuleWorkbench
        title="业务支出审批"
        eyebrow="BUDGET / PAYMENT / TRACKING"
        :columns="columns"
        :records="records"
        :steps="steps"
        :alerts="alerts"
        :actions="actions"
      />
      <el-empty v-if="!loading && records.length === 0" description="暂无数据" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModuleWorkbench from '@/components/common/ModuleWorkbench.vue'
import { expenseApi } from '@/api/finance'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// 真实接口:FinExpenseController /finance/expense/list
const loading = ref(false)
const metrics = ref<{ label: string; value: string }[]>([
  { label: '本月支出', value: '¥0' },
  { label: '待审批', value: '0' },
  { label: '已通过', value: '0' },
  { label: '预算占用', value: '--' }
])

const columns = [
  { prop: 'code', label: '单据号', width: 124 },
  { prop: 'category', label: '支出类别', width: 120 },
  { prop: 'project', label: '关联项目' },
  { prop: 'amount', label: '金额', type: 'amount' as const, width: 120 },
  { prop: 'payDate', label: '计划付款', width: 120 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '负责人', width: 100 }
]

const records = ref<Record<string, string | number>[]>([])

const steps = [
  { title: '支出立项', desc: '记录预算科目、项目归属和付款对象', status: 'done' as const },
  { title: '预算校验', desc: '校验预算余额并提示超支风险', status: 'active' as const },
  { title: '审批流转', desc: '按金额和科目自动匹配审批链路', status: 'pending' as const },
  { title: '付款归档', desc: '付款后同步日记账和凭证附件', status: 'pending' as const }
]

const alerts = [
  '市场投放类支出需要和线索转化效果关联。',
  '超过预算 80% 的科目应提前提醒经营负责人。',
  '付款完成后需自动生成费用归集记录。'
]

const actions = [
  { label: '新增支出', icon: 'add' as const },
  { label: '刷新预算', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出明细', type: 'info' as const, icon: 'export' as const }
]

function money(val: any): string {
  const n = Number(val ?? 0)
  return '¥' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const STATUS_MAP: Record<string, string> = {
  approving: '审批中',
  budget_review: '预算复核',
  pending_pay: '待付款',
  approved: '已通过',
  paid: '已付款',
  rejected: '已驳回'
}

const CATEGORY_MAP: Record<string, string> = {
  marketing: '市场投放',
  delivery: '项目实施',
  rebate: '渠道返点',
  admin: '行政采购',
  other: '其他'
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await expenseApi.list({ pageNum: 1, pageSize: 100 })
    const list: any[] = res?.data?.records || res?.records || []
    records.value = list.map((it) => ({
      code: it.expenseNo ?? '-',
      category: CATEGORY_MAP[it.category] ?? '其他',
      project: it.project ?? '-',
      amount: money(it.amount),
      payDate: it.payDate ?? '-',
      status: STATUS_MAP[it.status] ?? '未知',
      owner: it.ownerRole ?? '-'
    }))

    const total = list.reduce((s, it) => s + Number(it.amount ?? 0), 0)
    const pending = list.filter((it) =>
      ['approving', 'budget_review'].includes(it.status)
    ).length
    const approved = list.filter((it) =>
      ['approved', 'paid'].includes(it.status)
    ).length
    const budgetTotal = list.reduce((s, it) => s + Number(it.budgetAmount ?? 0), 0)
    const budgetRate = budgetTotal > 0 ? Math.round((total / budgetTotal) * 100) + '%' : '--'
    metrics.value = [
      { label: '本月支出', value: money(total) },
      { label: '待审批', value: String(pending) },
      { label: '已通过', value: String(approved) },
      { label: '预算占用', value: budgetRate }
    ]
  } catch (e) {
    records.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>
