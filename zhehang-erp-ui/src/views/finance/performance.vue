<template>
  <div class="task-page finance-performance">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 07 / PERFORMANCE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">绩效管理</span>
          <span class="title-en">Performance</span>
        </h1>
        <p class="page-desc">员工绩效考核指标设定与结果评估</p>
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
        <h2 class="section-title">绩效工作台</h2>
        <span class="section-sub">PERFORMANCE / EVALUATION</span>
      </div>
      <ModuleWorkbench
        title="提成核算明细"
        eyebrow="TARGET / REVIEW / BONUS"
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
import { commissionApi } from '@/api/sales'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// 真实接口:绩效提成数据 = SalesCommissionController /sales/commission/list + /statistics
// （数据范围:提成只看本人,管理员/财务看全部）
const loading = ref(false)
const metrics = ref<{ label: string; value: string }[]>([
  { label: '提成总额', value: '¥0' },
  { label: '关联订单额', value: '¥0' },
  { label: '待结算', value: '0' },
  { label: '已结算', value: '0' }
])

const columns = [
  { prop: 'employeeName', label: '员工', width: 120 },
  { prop: 'orderNo', label: '关联订单号', width: 160 },
  { prop: 'amount', label: '订单金额', type: 'amount' as const, width: 130 },
  { prop: 'rate', label: '提成比例', width: 100 },
  { prop: 'commission', label: '提成金额', type: 'amount' as const, width: 130 },
  { prop: 'period', label: '所属期间', width: 110 },
  { prop: 'statusText', label: '状态', type: 'tag' as const, width: 100 }
]

const records = ref<Record<string, string | number>[]>([])

const steps = [
  { title: '目标设定', desc: '按岗位、部门和业务目标设置指标权重', status: 'done' as const },
  { title: '过程采集', desc: '从业务、任务和财务模块汇总数据', status: 'done' as const },
  { title: '主管评分', desc: '结合定量结果和管理评价形成得分', status: 'active' as const },
  { title: '奖金联动', desc: '确认绩效系数并同步薪酬批次', status: 'pending' as const }
]

const alerts = [
  '提成只看本人,管理员/财务可查看全部（按数据范围）。',
  '提成金额需要和薪酬模块统一口径。',
  '提成比例与订单金额变更后需重新核算。'
]

const actions = [
  { label: '新建周期', icon: 'add' as const },
  { label: '批量评分', type: 'success' as const, icon: 'approve' as const },
  { label: '导出结果', type: 'info' as const, icon: 'export' as const }
]

function money(val: any): string {
  const n = Number(val ?? 0)
  return '¥' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const STATUS_MAP: Record<number, string> = { 0: '待结算', 1: '已结算' }

async function loadData() {
  loading.value = true
  try {
    const [listRes, statRes] = await Promise.all([
      commissionApi.list({ pageNum: 1, pageSize: 100 }),
      commissionApi.statistics().catch(() => null)
    ])
    const list: any[] = (listRes as any)?.records || []
    records.value = list.map((it) => ({
      employeeName: it.employeeName ?? ('员工' + (it.employeeId ?? '')),
      orderNo: it.orderNo ?? '-',
      amount: money(it.amount),
      rate: (it.commissionRate != null ? Number(it.commissionRate) : 0) + '%',
      commission: money(it.commissionAmount),
      period: it.period ?? '-',
      statusText: STATUS_MAP[it.status] ?? '未知'
    }))

    const stat: any = statRes || {}
    const totalCommission = stat.totalCommission != null
      ? Number(stat.totalCommission)
      : list.reduce((s, it) => s + Number(it.commissionAmount ?? 0), 0)
    const totalAmount = stat.totalAmount != null
      ? Number(stat.totalAmount)
      : list.reduce((s, it) => s + Number(it.amount ?? 0), 0)
    const pending = list.filter((it) => it.status === 0).length
    const settled = list.filter((it) => it.status === 1).length
    metrics.value = [
      { label: '提成总额', value: money(totalCommission) },
      { label: '关联订单额', value: money(totalAmount) },
      { label: '待结算', value: String(pending) },
      { label: '已结算', value: String(settled) }
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
