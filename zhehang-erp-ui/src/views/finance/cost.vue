<template>
  <div class="task-page finance-cost">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 06 / COST</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">公司管理成本支出</span>
          <span class="title-en">Management Cost</span>
        </h1>
        <p class="page-desc">公司运营与管理成本的统计与控制</p>
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
        <h2 class="section-title">成本工作台</h2>
        <span class="section-sub">COST / BREAKDOWN</span>
      </div>
      <ModuleWorkbench
        title="管理成本归集"
        eyebrow="BUDGET / ALLOCATION / CONTROL"
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
import { costApi } from '@/api/finance'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// 真实接口:FinCostController /finance/cost/list
const loading = ref(false)
const metrics = ref<{ label: string; value: string }[]>([
  { label: '本月成本', value: '¥0' },
  { label: '环比增长', value: '--' },
  { label: '预算使用', value: '--' },
  { label: '超支项', value: '0' }
])

const columns = [
  { prop: 'category', label: '成本科目', width: 140 },
  { prop: 'ownerDept', label: '归属部门', width: 120 },
  { prop: 'amount', label: '本月金额', type: 'amount' as const, width: 120 },
  { prop: 'budgetRate', label: '预算使用', width: 110 },
  { prop: 'trend', label: '趋势', width: 90 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '责任人', width: 100 }
]

const records = ref<Record<string, string | number>[]>([])

const steps = [
  { title: '科目建模', desc: '定义成本科目、归属部门和预算规则', status: 'done' as const },
  { title: '费用归集', desc: '从支出、报销和采购流水自动汇总', status: 'active' as const },
  { title: '预算预警', desc: '按月度预算阈值触发提醒和审批', status: 'pending' as const },
  { title: '经营分析', desc: '输出部门成本趋势和降本建议', status: 'pending' as const }
]

const alerts = [
  '云服务成本建议接入用量明细，定位增长来源。',
  '招聘渠道已接近预算上限，需要 HRD 确认后续投放。',
  '成本科目应和业务支出、报销模块共用枚举。'
]

const actions = [
  { label: '新增科目', icon: 'add' as const },
  { label: '刷新归集', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出分析', type: 'info' as const, icon: 'export' as const }
]

function money(val: any): string {
  const n = Number(val ?? 0)
  return '¥' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const STATUS_MAP: Record<string, string> = {
  normal: '正常',
  warning: '预警',
  over_risk: '超支风险'
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await costApi.list({ pageNum: 1, pageSize: 100 })
    const list: any[] = res?.data?.records || res?.records || []
    records.value = list.map((it) => {
      const amount = Number(it.amount ?? 0)
      const budgetAmount = Number(it.budgetAmount ?? 0)
      const lastAmount = Number(it.lastAmount ?? 0)
      return {
        category: it.category ?? '-',
        ownerDept: it.ownerDept ?? '-',
        amount: money(it.amount),
        budgetRate: budgetAmount ? Math.round((amount / budgetAmount) * 100) + '%' : '--',
        trend: lastAmount
          ? (amount - lastAmount >= 0 ? '+' : '') +
            (((amount - lastAmount) / lastAmount) * 100).toFixed(0) +
            '%'
          : '--',
        status: STATUS_MAP[it.status] ?? '未知',
        owner: it.ownerRole ?? '-'
      }
    })

    const total = list.reduce((s, it) => s + Number(it.amount ?? 0), 0)
    const lastTotal = list.reduce((s, it) => s + Number(it.lastAmount ?? 0), 0)
    const budgetTotal = list.reduce((s, it) => s + Number(it.budgetAmount ?? 0), 0)
    const ring = lastTotal
      ? (total - lastTotal >= 0 ? '+' : '') +
        (((total - lastTotal) / lastTotal) * 100).toFixed(1) +
        '%'
      : '--'
    const budgetRate = budgetTotal > 0 ? Math.round((total / budgetTotal) * 100) + '%' : '--'
    const overCount = list.filter((it) => it.status === 'over_risk').length
    metrics.value = [
      { label: '本月成本', value: money(total) },
      { label: '环比增长', value: ring },
      { label: '预算使用', value: budgetRate },
      { label: '超支项', value: String(overCount) }
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
