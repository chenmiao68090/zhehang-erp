<template>
  <div class="task-page finance-petty-cash">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 02 / PETTY-CASH</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">备用金管理</span>
          <span class="title-en">Petty Cash</span>
        </h1>
        <p class="page-desc">备用金申领、使用与归还的全流程管理</p>
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
        <h2 class="section-title">备用金工作台</h2>
        <span class="section-sub">PETTY-CASH / RECORDS</span>
      </div>
      <ModuleWorkbench
        title="备用金流转台账"
        eyebrow="APPLICATION / AUDIT / RETURN"
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
import { pettyCashApi } from '@/api/finance'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// 真实接口:FinPettyCashController /finance/petty-cash/list
const loading = ref(false)
const metrics = ref<{ label: string; value: string }[]>([
  { label: '备用金总额', value: '¥0' },
  { label: '已借出', value: '¥0' },
  { label: '已归还', value: '¥0' },
  { label: '待审批', value: '0' }
])

const columns = [
  { prop: 'code', label: '单号', width: 120 },
  { prop: 'applicant', label: '申请人', width: 100 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'amount', label: '金额', type: 'amount' as const, width: 120 },
  { prop: 'purpose', label: '用途' },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '当前处理', width: 110 }
]

const records = ref<Record<string, string | number>[]>([])

const steps = [
  { title: '申领登记', desc: '申请人提交用途、预算和归还日期', status: 'done' as const },
  { title: '部门确认', desc: '负责人确认业务必要性和额度', status: 'done' as const },
  { title: '财务复核', desc: '核对预算科目并完成付款', status: 'active' as const },
  { title: '归还核销', desc: '凭票核销剩余额度并归档', status: 'pending' as const }
]

const alerts = [
  '超过归还日期的备用金需要自动生成催办。',
  '同一申请人连续借款时应校验未核销余额。',
  '备用金付款应和日记账流水形成关联凭证。'
]

const actions = [
  { label: '新建申请', icon: 'add' as const },
  { label: '批量复核', type: 'success' as const, icon: 'approve' as const },
  { label: '导出', type: 'info' as const, icon: 'export' as const }
]

function money(val: any): string {
  const n = Number(val ?? 0)
  return '¥' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const STATUS_MAP: Record<string, string> = {
  applied: '申领登记',
  confirmed: '部门确认',
  reviewing: '财务复核',
  returning: '待归还',
  settled: '已结清',
  overdue: '逾期预警'
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await pettyCashApi.list({ pageNum: 1, pageSize: 100 })
    const list: any[] = res?.data?.records || res?.records || []
    records.value = list.map((it) => ({
      code: it.cashNo ?? '-',
      applicant: it.applicant ?? '-',
      dept: it.dept ?? '-',
      amount: money(it.amount),
      purpose: it.purpose ?? '-',
      status: STATUS_MAP[it.status] ?? '未知',
      owner: it.ownerRole ?? '-'
    }))

    const total = list.reduce((s, it) => s + Number(it.amount ?? 0), 0)
    const lent = list
      .filter((it) => it.status !== 'settled')
      .reduce((s, it) => s + Number(it.amount ?? 0), 0)
    const returned = list.reduce((s, it) => s + Number(it.returnedAmount ?? 0), 0)
    const pending = list.filter((it) =>
      ['applied', 'confirmed', 'reviewing'].includes(it.status)
    ).length
    metrics.value = [
      { label: '备用金总额', value: money(total) },
      { label: '已借出', value: money(lent) },
      { label: '已归还', value: money(returned) },
      { label: '待审批', value: String(pending) }
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
